/*
 * 床の AprilTag を検出して、この端末から効果音を鳴らす.
 *
 * 検出は js-aruco2 (純JS) の APRILTAG_16h5 辞書。
 * 検出コア (detector.js) と下のパラメータは smartphone_apriltag の
 * 実写ベンチで詰めた値をそのまま使っている。理由は detector.js 冒頭を参照。
 *
 * このページは PC と通信しない。音は端末内で完結するので、
 * サーバはこの静的ファイルを HTTPS で配るだけでよい
 * (カメラを使うには secure context が必須なので HTTPS は外せない)。
 */
'use strict';

/* ---------------- パラメータ ---------------- */

const CFG = {
  family: 'APRILTAG_16h5',

  // tag16h5 は情報ビットが16bitしかなく誤検出が多い。完全一致のみ許す。
  max_hamming_distance: 0,

  // 何フレーム連続で同じIDが見えたら「確定」とみなすか（誤検出フィルタ）。
  confirm_frames: 3,

  // 検出が途切れてから、何ミリ秒までは「見えている」と扱うか。
  // 効果音はこの時間ぶん見失ってから、はじめて次の発音が可能になる。
  hold_ms: 400,

  // 解析する画像の幅[px]。高さはアスペクト比から決まる。
  process_width: 640,

  // カメラに要求する解像度
  capture_width: 1280,
  capture_height: 720,

  // 二値化。ここが検出率にいちばん効く（detector.js 冒頭の説明を参照）。
  threshold_kernels: [3, 7, 14],
  threshold_offset: 7,

  // 追従中でもこの間隔で全カーネル掃引を挟み、別の距離のタグを拾う。
  rescan_ms: 200,

  // 効果音まわりの誤爆対策。
  //
  // 誤検出で鳴った効果音は観客に確実に気づかれるので、確定フィルタに加えて
  // 「小さすぎる四角形は相手にしない」という下限を設けている。
  // tag16h5 の偽陽性は遠景のノイズに出やすく、たいてい非常に小さい。
  //
  // 解析画像の面積に対する比。床にカメラを向けた固定設置ならタグの
  // 見かけの大きさはほぼ一定なので、実際の値を見て詰めてよい。
  // 0 にするとこの判定を無効化できる。
  min_tag_area_ratio: 0.002,

  // 発音した表示を光らせておく時間[ms]
  flash_ms: 400,
};

const el = {
  gate: document.getElementById('gate'),
  gateError: document.getElementById('gate-error'),
  startBtn: document.getElementById('start-btn'),
  stage: document.getElementById('stage'),
  view: document.getElementById('view'),
  video: document.getElementById('video'),
  audio: document.getElementById('audio-badge'),
  fps: document.getElementById('fps-badge'),
  scan: document.getElementById('scan-badge'),
  ids: document.getElementById('ids'),
  seBox: document.getElementById('se-box'),
  seName: document.getElementById('se-name'),
  audioWarn: document.getElementById('audio-warn'),
  testBtn: document.getElementById('test-btn'),
  stopBtn: document.getElementById('stop-btn'),
};

const state = {
  detector: null,
  stream: null,
  running: false,
  rafId: 0,
  wakeLock: null,

  // 検出結果の安定化用: id -> { frames, lastSeen, corners, hamming }
  tracks: new Map(),

  // すでに発音済みの ID。tracks から消えた（hold_ms 見失った）時点で
  // ここからも消し、次に見えたときにまた鳴るようにする。
  fired: new Set(),

  // 二値化カーネルの絞り込み。追従中は当たったカーネルだけ使う。
  lockedKernels: null,
  lastHitAt: 0,
  lastSweepAt: 0,
  passes: 0,

  // 統計
  fpsEma: 0,
  lastFrameAt: 0,

  flashTimer: 0,
};

// 解析用のオフスクリーンキャンバス
const proc = document.createElement('canvas');
const procCtx = proc.getContext('2d', { willReadFrequently: true });
const viewCtx = el.view.getContext('2d');

// 表示キャンバス上での映像の配置（レターボックス）
let fit = { ox: 0, oy: 0, dw: 0, dh: 0 };

/* ---------------- 効果音 ---------------- */

function refreshAudioBadge() {
  const st = SoundBank.state();
  if (st === 'running') {
    el.audio.textContent = '音 OK';
    el.audio.className = 'badge badge-on';
    el.audioWarn.hidden = true;
    return;
  }
  el.audio.textContent = st === 'unsupported' ? '音 非対応' : '音 停止中';
  el.audio.className = 'badge badge-off';
  el.audioWarn.hidden = false;
}

/** 発音したことを画面にも出す。音が出ない端末でも動作確認できるように。 */
function showFired(id, played) {
  el.seName.textContent = SoundBank.labelFor(id) + (played ? '' : '（無音）');
  el.seBox.classList.add('fired');
  clearTimeout(state.flashTimer);
  state.flashTimer = setTimeout(() => {
    el.seBox.classList.remove('fired');
  }, CFG.flash_ms);
}

/**
 * 立ち上がりエッジで 1 回だけ鳴らす。
 *
 * 「確定した ID の集合」に新しく入った瞬間が発音のタイミング。
 * hold_ms を過ぎて tracks から落ちるまでは再武装しないので、
 * 検出が 1 フレームだけ途切れても鳴り直さない。
 */
function updateSounds(confirmed) {
  for (const { id } of confirmed) {
    if (state.fired.has(id)) continue;
    state.fired.add(id);
    showFired(id, SoundBank.play(id));
  }

  // 見失った ID を再武装する。Set は反復中の delete が安全。
  for (const id of state.fired) {
    if (!state.tracks.has(id)) state.fired.delete(id);
  }
}

/* ---------------- カメラ ---------------- */

async function startCamera() {
  const constraints = {
    audio: false,
    video: {
      // 床を写す固定設置なので背面カメラ固定。前面には切り替えない。
      facingMode: { ideal: 'environment' },
      width: { ideal: CFG.capture_width },
      height: { ideal: CFG.capture_height },
      frameRate: { ideal: 30 },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  state.stream = stream;
  el.video.srcObject = stream;

  await el.video.play();
  await waitForVideoSize();
}

function waitForVideoSize() {
  return new Promise((resolve, reject) => {
    if (el.video.videoWidth > 0) return resolve();
    const timer = setTimeout(() => {
      el.video.removeEventListener('loadedmetadata', onMeta);
      reject(new Error('カメラ映像のサイズが取得できませんでした'));
    }, 8000);
    function onMeta() {
      if (el.video.videoWidth > 0) {
        clearTimeout(timer);
        el.video.removeEventListener('loadedmetadata', onMeta);
        resolve();
      }
    }
    el.video.addEventListener('loadedmetadata', onMeta);
  });
}

function stopCamera() {
  if (state.stream) {
    for (const track of state.stream.getTracks()) track.stop();
    state.stream = null;
  }
  el.video.srcObject = null;
}

async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    state.wakeLock = await navigator.wakeLock.request('screen');
    state.wakeLock.addEventListener('release', () => {
      state.wakeLock = null;
    });
  } catch (err) {
    /* 非対応や不許可は無視 */
  }
}

/* ---------------- キャンバスのサイズ ---------------- */

function resizeCanvases() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = el.view.getBoundingClientRect();
  const cw = Math.max(1, Math.round(rect.width * dpr));
  const ch = Math.max(1, Math.round(rect.height * dpr));
  if (el.view.width !== cw || el.view.height !== ch) {
    el.view.width = cw;
    el.view.height = ch;
  }

  const vw = el.video.videoWidth;
  const vh = el.video.videoHeight;
  if (!vw || !vh) return;

  // 解析解像度（元映像より大きくはしない）
  const pw = Math.max(160, Math.min(CFG.process_width, vw));
  const ph = Math.max(120, Math.round((pw * vh) / vw));
  if (proc.width !== pw || proc.height !== ph) {
    proc.width = pw;
    proc.height = ph;
  }

  const scale = Math.min(cw / vw, ch / vh);
  fit = {
    ox: (cw - vw * scale) / 2,
    oy: (ch - vh * scale) / 2,
    dw: vw * scale,
    dh: vh * scale,
  };
}

// 解析キャンバス座標 -> 表示キャンバス座標
function mapX(x) {
  return fit.ox + (x / proc.width) * fit.dw;
}
function mapY(y) {
  return fit.oy + (y / proc.height) * fit.dh;
}

/* ---------------- 検出とトラッキング ---------------- */

/*
 * 二値化カーネルの選び方。
 *
 * 検出できるかどうかは「カーネル半径がタグの黒枠の太さに見合っているか」で
 * ほぼ決まる（詳しくは detector.js の冒頭コメント）。太さは距離で変わるので、
 *   ・探索中     : 全カーネルを試す（重いが確実）
 *   ・追従中     : 直前に当たったカーネルだけ（軽い）
 *   ・定期的に   : 追従中でも全掃引を挟んで、別の距離にある他のタグを拾う
 * という切り替えをする。
 */
function kernelsForFrame(now, allKernels) {
  const tracking = state.lockedKernels && now - state.lastHitAt < CFG.hold_ms;
  // 再掃引はフレーム数ではなく経過時間で判定する。fps が落ちても、別の距離に
  // あるタグが hold_ms 以内に必ず一度は拾われることを保証するため。
  const rescanDue = now - state.lastSweepAt >= CFG.rescan_ms;
  if (tracking && !rescanDue) return state.lockedKernels;
  return allKernels;
}

/** 四角形の面積（靴ひも公式）。頂点は時計回りに整列済み。 */
function quadArea(corners) {
  let sum = 0;
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/** 小さすぎる検出を捨てる。偽陽性のほとんどはここで落ちる。 */
function bigEnough(marker) {
  if (!(CFG.min_tag_area_ratio > 0)) return true;
  const limit = proc.width * proc.height * CFG.min_tag_area_ratio;
  return quadArea(marker.corners) >= limit;
}

function detectFrame(now) {
  procCtx.drawImage(el.video, 0, 0, proc.width, proc.height);
  const image = procCtx.getImageData(0, 0, proc.width, proc.height);

  const allKernels = state.detector.kernelsFor(proc.width);
  const kernels = kernelsForFrame(now, allKernels);
  if (kernels.length === allKernels.length) state.lastSweepAt = now;

  let result;
  try {
    result = state.detector.detect(image, kernels);
    // 絞り込んだカーネルで取れなかったら、その場で全掃引に切り替える
    if (!result.markers.length && kernels.length < allKernels.length) {
      const retry = state.detector.detect(image, allKernels);
      state.lastSweepAt = now;
      result = { ...retry, passes: result.passes + retry.passes };
    }
  } catch (err) {
    state.passes = 0;
    return [];
  }

  state.passes = result.passes;
  if (result.markers.length) {
    // 当たったうち 1 つだけに絞ると 3 パス -> 約 1.4 パスまで下がる。
    // 別の距離にあるタグは上の定期再掃引で拾う。
    state.lockedKernels = [result.kernelsHit[0]];
    state.lastHitAt = now;
  } else {
    state.lockedKernels = null;
  }

  // 面積の下限は「カーネルを絞ってよいか」の判断より後に掛ける。
  // 小さい偽陽性でも、当たったカーネルの情報自体は追従に使えるため。
  return result.markers.filter(bigEnough);
}

function updateTracks(markers, now) {
  for (const marker of markers) {
    let track = state.tracks.get(marker.id);
    if (!track) {
      track = { frames: 0, lastSeen: 0, corners: null, hamming: 0 };
      state.tracks.set(marker.id, track);
    }
    track.frames = Math.min(track.frames + 1, 1e6);
    track.lastSeen = now;
    track.corners = marker.corners;
    track.hamming = marker.hammingDistance || 0;
  }

  // 一定時間見えなくなったトラックは捨てる（次に見えたら連続カウントもリセット）
  for (const [id, track] of state.tracks) {
    if (now - track.lastSeen > CFG.hold_ms) state.tracks.delete(id);
  }
}

function confirmedTracks() {
  const out = [];
  for (const [id, track] of state.tracks) {
    if (track.frames >= CFG.confirm_frames && track.corners) {
      out.push({ id, track });
    }
  }
  out.sort((a, b) => a.id - b.id);
  return out;
}

/* ---------------- 描画 ---------------- */

function drawScene(markers, confirmed, now) {
  const ctx = viewCtx;
  ctx.clearRect(0, 0, el.view.width, el.view.height);
  ctx.drawImage(el.video, fit.ox, fit.oy, fit.dw, fit.dh);

  const unit = Math.max(1, fit.dw / 320); // 画面サイズに追従する線幅の基準

  // まだ確定していない候補（誤検出かもしれないもの）は破線で薄く
  const confirmedIds = new Set(confirmed.map((c) => c.id));
  ctx.setLineDash([unit * 3, unit * 3]);
  ctx.lineWidth = unit;
  ctx.strokeStyle = 'rgba(232, 163, 61, 0.85)';
  for (const marker of markers) {
    if (confirmedIds.has(marker.id)) continue;
    strokeQuad(ctx, marker.corners);
  }
  ctx.setLineDash([]);

  for (const { id, track } of confirmed) {
    drawTag(ctx, id, track, unit, now);
  }
}

function strokeQuad(ctx, corners) {
  ctx.beginPath();
  ctx.moveTo(mapX(corners[0].x), mapY(corners[0].y));
  for (let i = 1; i < corners.length; i++) {
    ctx.lineTo(mapX(corners[i].x), mapY(corners[i].y));
  }
  ctx.closePath();
  ctx.stroke();
}

function drawTag(ctx, id, track, unit, now) {
  const corners = track.corners;

  // 見えなくなってから hold_ms までは薄くして残す
  const stale = now - track.lastSeen;
  const alpha = stale > 0 ? Math.max(0.25, 1 - stale / CFG.hold_ms) : 1;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.lineWidth = unit * 1.8;
  ctx.strokeStyle = '#35c56a';
  ctx.lineJoin = 'round';
  strokeQuad(ctx, corners);

  // 四隅。0番だけ色を変えて向きが分かるようにする。
  for (let i = 0; i < corners.length; i++) {
    ctx.beginPath();
    ctx.arc(mapX(corners[i].x), mapY(corners[i].y), unit * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? '#e4573d' : '#ffffff';
    ctx.fill();
    ctx.lineWidth = unit * 0.6;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.stroke();
  }

  // 中心に ID
  let cx = 0;
  let cy = 0;
  for (const corner of corners) {
    cx += mapX(corner.x);
    cy += mapY(corner.y);
  }
  cx /= corners.length;
  cy /= corners.length;

  const label = track.hamming > 0 ? id + ' (h' + track.hamming + ')' : String(id);
  const fontSize = Math.max(14, unit * 11);
  ctx.font = '700 ' + fontSize + 'px -apple-system, "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(label);
  const padX = fontSize * 0.36;
  const padY = fontSize * 0.22;
  const boxW = metrics.width + padX * 2;
  const boxH = fontSize + padY * 2;

  ctx.fillStyle = 'rgba(12, 16, 20, 0.78)';
  roundRect(ctx, cx - boxW / 2, cy - boxH / 2, boxW, boxH, fontSize * 0.28);
  ctx.fill();
  ctx.strokeStyle = '#35c56a';
  ctx.lineWidth = unit * 0.7;
  roundRect(ctx, cx - boxW / 2, cy - boxH / 2, boxW, boxH, fontSize * 0.28);
  ctx.stroke();

  ctx.fillStyle = '#e8edf2';
  ctx.fillText(label, cx, cy + fontSize * 0.04);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/* ---------------- メインループ ---------------- */

function tick() {
  if (!state.running) return;
  state.rafId = requestAnimationFrame(tick);

  if (el.video.readyState < 2) return;

  const now = performance.now();
  if (state.lastFrameAt > 0) {
    const dt = now - state.lastFrameAt;
    if (dt > 0) {
      const inst = 1000 / dt;
      state.fpsEma = state.fpsEma ? state.fpsEma * 0.85 + inst * 0.15 : inst;
    }
  }
  state.lastFrameAt = now;

  resizeCanvases();
  if (!fit.dw) return;

  const markers = detectFrame(now);
  updateTracks(markers, now);
  const confirmed = confirmedTracks();

  drawScene(markers, confirmed, now);
  updateSounds(confirmed);

  el.fps.textContent = state.fpsEma.toFixed(0) + ' fps';
  el.scan.textContent = state.lockedKernels
    ? '追従 k=' + state.lockedKernels.join('/')
    : '探索 ' + state.passes + '段';
  el.ids.textContent = confirmed.length ? confirmed.map((c) => c.id).join(', ') : 'なし';
}

/* ---------------- 起動/停止 ---------------- */

async function start() {
  el.startBtn.disabled = true;
  el.gateError.hidden = true;

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'このブラウザではカメラを使えません。HTTPS でアクセスできているか確認してください。'
      );
    }

    // 音の解錠はカメラより先に済ませる。getUserMedia の await をまたぐと
    // iOS では「ユーザー操作の中」と見なされなくなり、解錠に失敗する。
    await SoundBank.unlock();

    state.detector = new TagDetector({
      family: CFG.family,
      maxHammingDistance: CFG.max_hamming_distance,
      kernels: CFG.threshold_kernels,
      thresholdOffset: CFG.threshold_offset,
    });

    // カメラを開ける前に stage を表示しておく。video が display:none のままだと
    // iOS ではフレームが流れてこないことがある。
    el.gate.hidden = true;
    el.stage.hidden = false;
    try {
      await startCamera();
    } catch (err) {
      el.stage.hidden = true;
      el.gate.hidden = false;
      throw err;
    }

    state.running = true;
    state.tracks.clear();
    state.fired.clear();
    state.lastFrameAt = 0;
    state.lockedKernels = null;
    state.lastHitAt = 0;
    state.lastSweepAt = 0;

    el.seName.textContent = 'まだ鳴っていません';
    refreshAudioBadge();
    resizeCanvases();
    acquireWakeLock();
    state.rafId = requestAnimationFrame(tick);
  } catch (err) {
    el.gateError.textContent = describeError(err);
    el.gateError.hidden = false;
  } finally {
    el.startBtn.disabled = false;
  }
}

function describeError(err) {
  const name = err && err.name ? err.name : '';
  const message = err && err.message ? err.message : String(err);
  if (name === 'NotAllowedError') {
    return 'カメラの使用が許可されませんでした。\n設定 → Safari → カメラ を確認し、ページを再読み込みしてください。';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return '要求した条件に合うカメラが見つかりませんでした。\n' + message;
  }
  if (name === 'NotReadableError') {
    return 'カメラを他のアプリが使用中の可能性があります。\n' + message;
  }
  return (name ? name + ': ' : '') + message;
}

function stop() {
  state.running = false;
  cancelAnimationFrame(state.rafId);
  stopCamera();
  if (state.wakeLock) {
    state.wakeLock.release().catch(() => {});
    state.wakeLock = null;
  }
  el.stage.hidden = true;
  el.gate.hidden = false;
}

/** 設置時に音量とスピーカーを確認するための試聴。 */
async function testSound() {
  await SoundBank.unlock();
  refreshAudioBadge();

  let delay = 0;
  for (const id of [0, 1, 2]) {
    const target = id;
    setTimeout(function () {
      showFired(target, SoundBank.play(target));
    }, delay);
    delay += 700;
  }
}

el.startBtn.addEventListener('click', start);
el.stopBtn.addEventListener('click', stop);
el.testBtn.addEventListener('click', testSound);
window.addEventListener('resize', resizeCanvases);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvases, 300));

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.running) {
    acquireWakeLock();
    el.video.play().catch(() => {});
    // バックグラウンドに回ると AudioContext が suspend されることがある。
    SoundBank.unlock().then(refreshAudioBadge);
  }
});

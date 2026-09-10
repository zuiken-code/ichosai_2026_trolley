/*
 * 床の AprilTag に対応する効果音.
 *
 * 音源ファイルは持たず、Web Audio で合成している。
 * 現場で本番の音に差し替えるときは VOICES を書き換えるか、
 * playTone() の代わりに AudioBufferSourceNode を鳴らすように
 * play() を差し替えれば済むようにしてある（下の「差し替え方」参照）。
 *
 * iOS の制約:
 *   - AudioContext はユーザー操作の中でしか running にできない。
 *     unlock() を「開始」ボタンのハンドラから呼ぶこと。
 *   - 端末側面の消音スイッチが入っていると Web Audio も鳴らない。
 *     これはページ側からは検出できないので、UI 側で注意書きを出している。
 */
'use strict';

(function (global) {
  // ---- 音色の定義 ------------------------------------------------
  //
  // notes[] は { f: 周波数[Hz], t: 開始[s], d: 長さ[s], w: 波形, g: 音量 }。
  // 会場は騒がしいので、基音だけの sine ではなく倍音を含む波形を使い、
  // ID ごとに「向き」（上昇 / 下降 / 連打）を変えて聞き分けられるようにする。
  const VOICES = {
    0: {
      label: 'ID 0 — 上昇',
      notes: [
        { f: 523.25, t: 0.0, d: 0.12, w: 'triangle', g: 0.5 }, // C5
        { f: 659.25, t: 0.09, d: 0.12, w: 'triangle', g: 0.5 }, // E5
        { f: 783.99, t: 0.18, d: 0.26, w: 'triangle', g: 0.55 }, // G5
      ],
    },
    1: {
      label: 'ID 1 — 下降',
      notes: [
        { f: 783.99, t: 0.0, d: 0.14, w: 'square', g: 0.28 }, // G5
        { f: 523.25, t: 0.12, d: 0.3, w: 'square', g: 0.3 }, // C5
      ],
    },
    2: {
      label: 'ID 2 — 連打',
      notes: [
        { f: 440.0, t: 0.0, d: 0.1, w: 'sawtooth', g: 0.26 }, // A4
        { f: 440.0, t: 0.14, d: 0.1, w: 'sawtooth', g: 0.26 },
        { f: 880.0, t: 0.28, d: 0.28, w: 'sawtooth', g: 0.24 }, // A5
      ],
    },
  };

  // 全体音量。端末の音量つまみとは別に、ここで頭を押さえておく。
  const MASTER_GAIN = 0.9;

  // エンベロープ。矩形に切ると「プツッ」と鳴るので必ず前後を丸める。
  const ATTACK_S = 0.008;
  const RELEASE_S = 0.06;

  // exponentialRampToValueAtTime は 0 を渡せないので、実質無音の下限を使う。
  const SILENCE = 0.0001;

  const AudioCtx = global.AudioContext || global.webkitAudioContext;

  let ctx = null;
  let master = null;

  /** この ID に鳴らす音が定義されているか. */
  function hasSound(id) {
    return Object.prototype.hasOwnProperty.call(VOICES, id);
  }

  /** 画面表示用のラベル. 未定義の ID もそれと分かる文字列を返す. */
  function labelFor(id) {
    return hasSound(id) ? VOICES[id].label : `ID ${id} — 音の割当なし`;
  }

  /**
   * AudioContext を起こす。必ずユーザー操作（click/touch）の中から呼ぶこと。
   * @returns {Promise<boolean>} 鳴らせる状態になったか
   */
  async function unlock() {
    if (!AudioCtx) return false;

    if (!ctx) {
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = MASTER_GAIN;
      master.connect(ctx.destination);
    }

    // Safari 16.4+ / Chrome。既定の 'auto' だと他アプリの再生状況に
    // 引きずられて鳴らないことがあるので、再生専用だと明示する。
    // 非対応ブラウザでは単に無視される。
    try {
      if (global.navigator && global.navigator.audioSession) {
        global.navigator.audioSession.type = 'playback';
      }
    } catch (err) {
      /* 非対応。無視してよい */
    }

    try {
      await ctx.resume();
    } catch (err) {
      return false;
    }

    return ctx.state === 'running';
  }

  /** 'running' | 'suspended' | 'unsupported' */
  function state() {
    if (!AudioCtx) return 'unsupported';
    if (!ctx) return 'suspended';
    return ctx.state;
  }

  /** 1 音を鳴らす。at は ctx.currentTime を基準にした絶対時刻[s]。 */
  function playTone(note, at) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = note.w || 'triangle';
    osc.frequency.setValueAtTime(note.f, at);

    const peak = note.g != null ? note.g : 0.4;
    const end = at + note.d;

    // 立ち上がりは直線、減衰は指数。指数のほうが自然に消える。
    gain.gain.setValueAtTime(SILENCE, at);
    gain.gain.linearRampToValueAtTime(peak, at + ATTACK_S);
    gain.gain.setValueAtTime(peak, Math.max(at + ATTACK_S, end - RELEASE_S));
    gain.gain.exponentialRampToValueAtTime(SILENCE, end);

    osc.connect(gain);
    gain.connect(master);

    osc.start(at);
    osc.stop(end + 0.02);

    // ノードは鳴り終わったらGCに任せる。明示的に切っておくと確実。
    osc.onended = () => {
      try {
        gain.disconnect();
      } catch (err) {
        /* ignore */
      }
    };
  }

  /**
   * ID に対応する効果音を鳴らす。
   *
   * 差し替え方: 音源ファイルを使う場合は、事前に fetch + decodeAudioData して
   * AudioBuffer を持っておき、ここで createBufferSource() を master に
   * つないで start() するだけでよい。呼び出し側 (app.js) は変えなくて済む。
   *
   * @returns {boolean} 実際に発音を開始したか
   */
  function play(id) {
    if (!hasSound(id)) return false;
    if (!ctx || ctx.state !== 'running') return false;

    const at = ctx.currentTime + 0.01; // 直近すぎるとスケジュールを取りこぼす
    for (const note of VOICES[id].notes) {
      playTone(note, at + note.t);
    }
    return true;
  }

  global.SoundBank = { hasSound, labelFor, unlock, state, play };
})(typeof window !== 'undefined' ? window : this);

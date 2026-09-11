/* ============================================================
   Trolley スマートフォンコントローラ
   ------------------------------------------------------------
   Switchコントローラのバックアップとして、スマートフォンから
   /cmd_vel を送るための画面。

   入力源は2つあり、同時には片方だけが走行できる。

     * 画面のスティック（タッチ）
     * スマートフォンに直接つないだJoy-Con（Gamepad API）
       軸の変換は gamepad.js、ここでは読み取りと調停だけを行う

   ブラウザ差異への方針:
     * Pointer Events を使い、未対応端末では Touch Events に退避する
     * Vibration API / Screen Wake Lock API / Gamepad API は機能検出し、
       未対応（iOS Safari / Firefox など）では黙って無効化する
     * 特定ブラウザ専用のAPIには依存しない
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // 設定
  // ============================================================

  // 送信周期 [ms]（20Hz）
  var SEND_INTERVAL_MS = 50;

  // 遅延計測の間隔 [ms]
  var PING_INTERVAL_MS = 1000;

  // スティックの不感帯
  var DEADZONE = 0.12;

  // この遅延を超えたらチップに表示する [ms]
  var RTT_WARN_MS = 200;

  // 通知の表示時間 [ms]
  var NOTICE_DURATION_MS = 3000;

  // 再接続間隔 [ms]
  var RECONNECT_MIN_MS = 500;
  var RECONNECT_MAX_MS = 5000;

  // ============================================================
  // 設定: Joy-Con（Gamepad API）
  // ============================================================

  // スティックの不感帯。
  //
  // タッチ（DEADZONE）とは別にしている。使い込んだJoy-Conは
  // 中立に戻してもわずかにずれるので、画面より広めに取る。
  // 「手を離しても微速で動き続ける」なら、ここを上げる。
  var GAMEPAD_DEADZONE = 0.18;

  // ポーリングがこの時間途切れたら、走行指令を送るのをやめる [ms]
  //
  // ★ここが安全設計の要★
  // requestAnimationFrame は画面が消える・アプリを切り替えると
  // 完全に止まるが、setInterval は止まらず1Hzに間引かれて生き残る。
  // 「読み取りは凍結・送信だけ生存」になると、ボタンを押したままの
  // 古い値が送られ続けて止まらなくなる。
  // そのため送信側は「最近ポーリングできたか」を必ず確認する。
  var GAMEPAD_POLL_TIMEOUT_MS = 150;

  // 入力がまったく変化しないまま続いたら停止する [ms]
  //
  // Bluetoothが黙って切れると、ブラウザは最後の状態
  // （ボタン押下・前進のまま）を返し続け、切断イベントも
  // すぐには来ないことがある（OSが切断に気づくまでの数秒〜十数秒）。
  // まさに今回避けたい「離しても進む」状態なので、
  // 値が完全に固まったら生きていないと見なす。
  //
  // 副作用として、スティックをいっぱいに倒したまま
  // まっすぐ走り続けると、値が1ビットも変わらないために
  // ここで一度停止することがある（iOSはtimestampも
  // 値が変わるまで更新しない）。
  // スティックを少し動かせばすぐ復帰する。
  //
  // 誤停止（安全側）と、切れたまま走る距離（危険側）の
  // 釣り合いで決めた値。1m/sで8秒なら8m進んでしまうので、
  // これ以上長くはしたくない。直線で長く走る運用で
  // 誤停止が邪魔なら、ここだけを大きくする。
  var GAMEPAD_STALE_MS = 8000;

  // timestamp が生存の合図として使える端末での、短い判定 [ms]
  //
  // 「値は同じまま timestamp だけ進む」のを一度でも見たら、
  // その端末は受信が続いている間 timestamp を進めてくれると分かる。
  // 受信が止まれば timestamp も止まるので、値の変化を待たずに
  // 「切れた」と判断できる。上の8秒を待つ必要がない。
  //
  // Chrome for Android の Joy-Con はこちらに該当する。
  // iOS Safari の timestamp は値が変わったときだけ進むので該当しない
  // （その端末では上の GAMEPAD_STALE_MS を使う）。
  var GAMEPAD_STALE_LIVE_MS = 2000;

  // ボタンを押し続けて操作権を要求するまでの時間 [ms]
  var GAMEPAD_CLAIM_HOLD_MS = 1000;

  // 操作権の要求を繰り返さない間隔 [ms]
  var GAMEPAD_CLAIM_INTERVAL_MS = 3000;

  // 軸の学習で「倒した」と見なす変化量
  var GAMEPAD_LEARN_THRESHOLD = 0.5;

  // 学習で同じ判定が続いたら確定するまでの時間 [ms]
  var GAMEPAD_LEARN_HOLD_MS = 400;

  // 学習の1歩目で「中立に戻っている」と見なす値の上限
  //
  // ここを 0.4 にしておくと、学習のしきい値 0.5 との差が
  // 0.1 以上残るので、指示どおり倒せば必ずその軸が選ばれる。
  // （中立が大きくずれたまま採ると、指示と逆の向きが
  //   保存されることがある）
  var GAMEPAD_LEARN_CENTER_MAX = 0.4;

  // 学習の1歩目で「値が落ち着いている」と見なす1フレームの変化量
  var GAMEPAD_LEARN_SETTLE = 0.05;

  // 学習で候補が見つからないまま案内を出すまでの時間 [ms]
  var GAMEPAD_LEARN_NUDGE_MS = 1200;

  // これだけ探しても見つからなければ、予備のURLも案内する [ms]
  var GAMEPAD_FALLBACK_HINT_MS = 15000;

  // 学習結果の保存先（端末ごとに残る）
  var MAPPING_STORAGE_KEY = 'trolley.gamepad.mapping.v1';

  // ============================================================
  // DOM
  // ============================================================

  var chip = document.getElementById('sourceChip');
  var chipLabel = document.getElementById('chipLabel');
  var pad = document.getElementById('pad');
  var knob = document.getElementById('knob');
  var hint = document.getElementById('hint');
  var snackbar = document.getElementById('snackbar');
  var snackbarText = document.getElementById('snackbarText');
  var snackbarAction = document.getElementById('snackbarAction');

  var padBar = document.getElementById('padBar');
  var padText = document.getElementById('padText');
  var padSetup = document.getElementById('padSetup');

  var sheet = document.getElementById('sheet');
  var sheetTitle = document.getElementById('sheetTitle');
  var sheetBody = document.getElementById('sheetBody');
  var sheetRetry = document.getElementById('sheetRetry');
  var sheetReset = document.getElementById('sheetReset');
  var sheetClose = document.getElementById('sheetClose');

  // ============================================================
  // 状態
  // ============================================================

  var socket = null;
  var connected = false;
  var reconnectDelay = RECONNECT_MIN_MS;
  var reconnectTimer = null;

  var state = {
    driver: false,
    source: null,
    joyAlive: false,
    returnPending: false,
    muxAvailable: false
  };

  var input = {
    lx: 0.0,
    az: 0.0,
    axis: null
  };

  var activePointerId = null;
  var rtt = null;

  var noticeText = '';
  var noticeTimer = null;

  var wakeLock = null;

  // いま走行指令を出している入力源。'touch' / 'gamepad' / null
  //
  // 片方が握っている間、もう片方は input に書き込まない。
  // これが無いと、Joy-Conのポーリングが毎フレーム0を書き込んで
  // タッチ操作を打ち消す（逆に指を離しても止まらなくなる）。
  var inputSource = null;

  // 予備の操作画面（HTTPS）のポート。
  //
  // Joy-Con は http のままでも使えるので、通常は使わない。
  // 非secure context でコントローラを見せない端末を引いたときに
  // 案内するためのもの。サーバが hello で教えてきた場合だけ使う。
  var securePort = null;

  // Joy-Con の状態
  var gamepad = {
    // 機能そのものが使えるか（未対応・権限拒否で false）
    supported: false,

    // navigator.getGamepads() の番号と識別子。
    // 再接続で別の端末を掴まないよう、id も覚えて突き合わせる。
    index: null,
    id: '',

    // 直前のポーリングで見えていたか
    present: false,

    // 最後にポーリングできた時刻
    pollStamp: 0,

    // 軸・ボタンの指紋と、最後に動きがあった時刻
    signature: '',
    changeStamp: 0,

    // 直前の timestamp と、それが生存の合図として使えるか
    stamp: null,
    stampIsLive: false,

    // 反応が無くなったと判断したか
    stale: false,

    // 検出時に押されっぱなしだったボタン（一度離すまで無視する）
    blocked: [],

    // いま押しているボタン番号と軸の値（画面表示用）
    held: [],
    axes: null,

    // ブラウザから見えているコントローラの台数（?debug用）
    count: 0,

    // デッドマンを押しているか、押し始めた時刻
    deadman: false,
    deadmanStamp: 0,

    // 割り当てに使っていない軸が動いている（＝割り当てが違う）
    axisMismatch: false,

    // 一度もコントローラを見つけられていない場合の、
    // 案内を出し始める時刻
    searchStamp: 0,

    // 操作権の要求を送った時刻。null なら一度も送っていない。
    //
    // 0 で初期化してはいけない。now() は performance.now() で
    // ページを開いてからの経過時間なので、開いた直後は
    // 「さっき送ったばかり」と判定されてしまう。
    claimStamp: null
  };

  // ノブが動ける距離 [px]。画面の大きさが変わるまで使い回す。
  var padTravelCache = null;

  // ?debug を付けて開くと、軸とボタンの生の値を画面に出す。
  // 現場で軸の番号と向きを確かめるため。
  var debugEnabled =
    String(window.location.search || '').indexOf('debug') >= 0;

  // 軸の割り当て。null なら gamepad.js の既定値を使う。
  var mapping = null;

  // 軸の学習（スティック設定）
  var learn = {
    active: false,
    step: 0,
    rest: null,
    linear: null,
    angular: null,
    candidate: null,
    holdStamp: 0,
    prev: null,
    stamp: 0,
    hint: ''
  };

  // ============================================================
  // WebSocket
  // ============================================================

  function socketUrl() {
    var protocol = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';

    return protocol + '//' + window.location.host + '/ws/teleop';
  }

  function connect() {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    try {
      socket = new WebSocket(socketUrl());
    } catch (error) {
      scheduleReconnect();
      return;
    }

    socket.onopen = function () {
      connected = true;
      reconnectDelay = RECONNECT_MIN_MS;
      render();
    };

    socket.onmessage = function (event) {
      handleMessage(event.data);
    };

    socket.onclose = function () {
      connected = false;
      socket = null;
      rtt = null;
      stopAll();
      scheduleReconnect();
      render();
    };

    socket.onerror = function () {
      // onclose でまとめて扱う
    };
  }

  function scheduleReconnect() {
    if (reconnectTimer !== null) {
      return;
    }

    reconnectTimer = window.setTimeout(function () {
      reconnectTimer = null;
      connect();
    }, reconnectDelay);

    reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS);
  }

  function send(payload) {
    if (!socket || socket.readyState !== 1) {
      return;
    }

    try {
      socket.send(JSON.stringify(payload));
    } catch (error) {
      // 切断直後の送信失敗は無視する
    }
  }

  function handleMessage(raw) {
    var message;

    try {
      message = JSON.parse(raw);
    } catch (error) {
      return;
    }

    if (!message || typeof message !== 'object') {
      return;
    }

    if (message.t === 'state' || message.t === 'hello') {
      applyState(message);
      return;
    }

    if (message.t === 'pong') {
      if (typeof message.ts === 'number') {
        rtt = Math.round(now() - message.ts);
        render();
      }
      return;
    }

    if (message.t === 'notice') {
      showNotice(message.message);
    }
  }

  function applyState(message) {
    var previousSource = state.source;

    if (typeof message.driver === 'boolean') {
      state.driver = message.driver;
    }

    // 予備の操作画面のポート。サーバが立てていれば教えてくる。
    if (typeof message.https_port === 'number') {
      securePort = message.https_port;
    }

    if (message.t === 'state') {
      state.source = message.source;
      state.joyAlive = !!message.joy_alive;
      state.returnPending = !!message.return_pending;
      state.muxAvailable = !!message.mux_available;
    }

    // 操作権が変わったら、走行中の入力を必ず切る
    if (state.source !== previousSource) {
      if (previousSource !== null) {
        vibrate(30);
      }

      if (!canDrive()) {
        stopAll();
      }
    }

    render();
  }

  // ============================================================
  // 入力
  // ============================================================

  function canDrive() {
    return connected &&
      state.driver &&
      state.muxAvailable &&
      state.source === 'phone';
  }

  function setInput(lx, az, axis, knobX, knobY) {
    input.lx = lx;
    input.az = az;
    input.axis = axis;

    knob.style.setProperty('--knob-x', knobX.toFixed(1) + 'px');
    knob.style.setProperty('--knob-y', knobY.toFixed(1) + 'px');

    pad.classList.toggle('is-axis-linear', axis === 'linear');
    pad.classList.toggle('is-axis-angular', axis === 'angular');
  }

  function updateFromPoint(clientX, clientY) {
    var rect = pad.getBoundingClientRect();
    var radius = rect.width / 2;

    if (radius <= 0) {
      return;
    }

    var nx = (clientX - (rect.left + radius)) / radius;
    var ny = (clientY - (rect.top + radius)) / radius;

    // 円の外にはみ出した分は円周上に丸める
    var magnitude = Math.sqrt((nx * nx) + (ny * ny));

    if (magnitude > 1) {
      nx = nx / magnitude;
      ny = ny / magnitude;
      magnitude = 1;
    }

    if (magnitude < DEADZONE) {
      setInput(0.0, 0.0, null, 0, 0);
      return;
    }

    // ノブが円からはみ出さない範囲
    var travel = radius - (knob.offsetWidth / 2);

    // 既存の joy_teleop と同じく、大きく倒した軸だけを採用する
    if (Math.abs(ny) >= Math.abs(nx)) {
      // 前後（画面上方向を前進とする）
      setInput(-ny, 0.0, 'linear', 0, ny * travel);
    } else {
      // 旋回（画面右方向を右旋回とする）
      setInput(0.0, -nx, 'angular', nx * travel, 0);
    }
  }

  function grabStick(pointerId, clientX, clientY) {
    if (!canDrive()) {
      showNotice('操作権がありません。上のチップをタップして取得してください');
      return;
    }

    if (activePointerId !== null) {
      return;
    }

    if (inputSource === 'gamepad') {
      // Joy-Conが固まったとき（Bluetoothが黙って切れると、ブラウザは
      // ボタンを押したままの状態を返し続ける）の、人の側の非常手段。
      // 画面のスティックは必ず割り込めるようにしておく。
      //
      // 割り込んだ時点で押しているボタンは無視するので、
      // 指を離した瞬間にJoy-Conが走り出すことはない。
      disarmGamepad();
      showNotice('画面のスティックに切り替えました');
    }

    if (learn.active) {
      // スティック設定中に走り出さないようにする
      showNotice('スティック設定を終わらせてください');
      return;
    }

    activePointerId = pointerId;
    inputSource = 'touch';
    pad.classList.add('is-active');

    updateFromPoint(clientX, clientY);
    requestWakeLock();
  }

  /**
   * 走行をやめる。
   *
   * 入力源が何であっても、ゼロにして停止を送る。
   * 停止経路をここ1本に集約しておくこと。
   */
  function stopDriving() {
    var wasDriving = inputSource !== null;

    inputSource = null;
    pad.classList.remove('is-active');
    setInput(0.0, 0.0, null, 0, 0);

    if (wasDriving) {
      // 停止を待たせないよう、即時に送る。
      //
      // これは「速く止める」ための策で、停止の保証ではない。
      // 保証は「送信をやめること」＋サーバ側のウォッチドッグ
      // （command_timeout、既定0.3秒）が担う。
      // アプリ切替の瞬間などは、この送信自体が届かないことがある。
      send({ t: 'stop' });
    }

    releaseWakeLock();
  }

  /** 指を離した（タッチ入力の終了）。 */
  function releaseStick() {
    if (activePointerId === null) {
      return;
    }

    activePointerId = null;
    pad.classList.remove('is-active');

    if (inputSource === 'touch') {
      stopDriving();
    }
  }

  /** Joy-Conの走行を終える（ボタンを離したときの通常の停止）。 */
  function releaseGamepad() {
    gamepad.deadman = false;

    if (inputSource === 'gamepad') {
      stopDriving();
    }
  }

  /**
   * Joy-Conを「押し直すまで走らない」状態にする。
   *
   * 止めるだけでは足りない。ボタンを押したまま画面が隠れた場合、
   * 次のポーリングで同じ押下を見て、すぐに走り出してしまう。
   * （ブラウザはページが隠れている・フォーカスを失っている間、
   *   ボタンの押下状態を最後の値のまま凍結して返す）
   *
   * いま押しているボタンを「無視するボタン」に入れて、
   * 一度離させる。
   */
  function disarmGamepad() {
    var index;
    var number;

    for (index = 0; index < gamepad.held.length; index += 1) {
      number = gamepad.held[index];

      if (!isBlockedButton(number)) {
        gamepad.blocked.push(number);
      }
    }

    releaseGamepad();
  }

  /**
   * どの入力源であっても止める。
   *
   * 切断・画面遷移・操作権の喪失など、操作者の意思とは関係なく
   * 止めるときに使う。Joy-Conは押し直すまで走らないようにする。
   */
  function stopAll() {
    releaseStick();
    disarmGamepad();

    // どちらも握っていなかった場合にも、表示だけは中立に戻す
    if (inputSource === null) {
      setInput(0.0, 0.0, null, 0, 0);
    }
  }

  // ============================================================
  // Pointer Events（未対応端末は Touch Events）
  // ============================================================

  function bindPointerEvents() {
    pad.addEventListener('pointerdown', function (event) {
      if (event.isPrimary === false) {
        return;
      }

      event.preventDefault();

      if (pad.setPointerCapture) {
        try {
          pad.setPointerCapture(event.pointerId);
        } catch (error) {
          // キャプチャできなくても操作は続行できる
        }
      }

      grabStick(event.pointerId, event.clientX, event.clientY);
    });

    pad.addEventListener('pointermove', function (event) {
      if (event.pointerId !== activePointerId) {
        return;
      }

      event.preventDefault();
      updateFromPoint(event.clientX, event.clientY);
    });

    var endHandler = function (event) {
      if (event.pointerId !== activePointerId) {
        return;
      }

      releaseStick();
    };

    pad.addEventListener('pointerup', endHandler);
    pad.addEventListener('pointercancel', endHandler);
    pad.addEventListener('lostpointercapture', endHandler);
  }

  function bindTouchEvents() {
    pad.addEventListener('touchstart', function (event) {
      var touch = event.changedTouches[0];

      event.preventDefault();
      grabStick(touch.identifier, touch.clientX, touch.clientY);
    }, false);

    pad.addEventListener('touchmove', function (event) {
      var touches = event.changedTouches;
      var index;

      event.preventDefault();

      for (index = 0; index < touches.length; index += 1) {
        if (touches[index].identifier === activePointerId) {
          updateFromPoint(touches[index].clientX, touches[index].clientY);
          return;
        }
      }
    }, false);

    var endHandler = function (event) {
      var touches = event.changedTouches;
      var index;

      for (index = 0; index < touches.length; index += 1) {
        if (touches[index].identifier === activePointerId) {
          releaseStick();
          return;
        }
      }
    };

    pad.addEventListener('touchend', endHandler, false);
    pad.addEventListener('touchcancel', endHandler, false);
  }

  // ============================================================
  // 表示
  // ============================================================

  function setChip(modifier, label) {
    chip.className = 'chip ' + modifier;
    chipLabel.textContent = label;
  }

  function latencySuffix() {
    if (rtt === null || rtt <= RTT_WARN_MS) {
      return '';
    }

    return ' ・ 遅延 ' + rtt + 'ms';
  }

  function render() {
    if (!connected) {
      setChip('is-offline', '未接続 — 再接続しています');
      hint.textContent = 'サーバに接続できるまで操作できません';
    } else if (!state.muxAvailable) {
      setChip('is-offline', '調停ノード未起動');
      hint.textContent = 'cmd_vel_mux が起動しているか確認してください';
    } else if (state.source === 'phone' && state.driver) {
      setChip('is-phone', 'このスマホで操作中' + latencySuffix());
      hint.textContent = '指を離すと停止します';
    } else if (state.source === 'phone') {
      setChip('is-observer', '他の端末が操作中 — タップで取得');
      hint.textContent = '他の端末が操作権を持っています';
    } else if (state.joyAlive) {
      setChip('is-joy', 'Switchで操作中 — タップで取得');
      hint.textContent = 'チップをタップすると操作を引き取れます';
    } else {
      setChip('is-joy', '待機中 — タップで操作を取得');
      hint.textContent = 'チップをタップすると操作を引き取れます';
    }

    pad.classList.toggle('is-disabled', !canDrive());

    renderPadBar();
    renderSnackbar();
  }

  /**
   * Joy-Con の状態を1行で出す。
   *
   * 現場で「繋いだのに動かない」となったとき、ここを見れば
   * 次に何をすればいいか分かるようにしておく。
   */
  function renderPadBar() {
    var modifier = '';
    var text;

    if (!padBar) {
      return;
    }

    if (!gamepad.supported) {
      text = unsupportedText();
      padSetup.hidden = true;

    } else if (!gamepad.present) {
      // ペアリング済みでも、ボタンを1回押すまでブラウザからは
      // 見えない（指紋採取対策の仕様）。iOSでは画面を一度
      // タップしていないと入力そのものが届かない。
      text = 'Joy-Con: 画面を1回タップし、ボタンを1回押してください'
        + fallbackHintText();
      padSetup.hidden = true;

    } else if (gamepad.stale) {
      text = 'Joy-Con: 反応がありません。スティックを動かしてください';
      modifier = 'is-warn';
      padSetup.hidden = false;

    } else if (gamepad.axisMismatch) {
      // 使っている軸は中立なのに、別の軸が動いている。
      // 走らない原因がほぼこれなので、走行中の表示より優先する。
      text = 'Joy-Con: 別の軸が動いています。スティック設定をしてください';
      modifier = 'is-warn';
      padSetup.hidden = false;

    } else if (inputSource === 'gamepad') {
      text = 'Joy-Conで走行中';
      modifier = 'is-active';
      padSetup.hidden = false;

    } else if (gamepad.deadman) {
      text = canDrive()
        ? 'Joy-Con: 押しています'
        : 'Joy-Con: 押したままで操作権を取得します';
      modifier = 'is-active';
      padSetup.hidden = false;

    } else if (holdingBlockedButton()) {
      // ブラウザはボタンを押した瞬間に初めてコントローラを
      // 見つける。その1回目の押下はデッドマンに使えないので
      // （押しっぱなしのボタンと区別できない）、離して
      // 押し直してもらう。
      text = 'Joy-Con: ボタンを離してから押し直してください';
      padSetup.hidden = false;

    } else {
      text = 'Joy-Con: 接続済み（ボタンを押している間だけ走ります）';
      padSetup.hidden = false;
    }

    padBar.className = 'padbar ' + modifier;
    padText.textContent = text + debugText();
    padBar.hidden = false;
  }

  /** Gamepad API が使えない場合の文言。 */
  function unsupportedText() {
    if (typeof navigator.getGamepads !== 'function') {
      return 'Joy-Con: このブラウザでは使えません（Chromeをお試しください）';
    }

    // getGamepads() が例外を投げた（権限で止められている）
    return 'Joy-Con: このページでは使えません' + fallbackHintText();
  }

  /**
   * しばらく見つからないときだけ出す、予備のURLの案内。
   *
   * Joy-Con は http のままでも使える。最初からHTTPSを案内すると
   * 「証明書の警告を承認する」という余計な手間を踏ませてしまうので、
   * 本当に見つからないときだけ出す。
   */
  function fallbackHintText() {
    if (!securePort || window.location.protocol === 'https:') {
      return '';
    }

    if (
      gamepad.searchStamp === 0 ||
      (now() - gamepad.searchStamp) < GAMEPAD_FALLBACK_HINT_MS
    ) {
      return '';
    }

    return '（出ないときは https://' + window.location.hostname +
      ':' + securePort + '/controller/ も試せます）';
  }

  /**
   * ?debug を付けて開いたときだけ、生の値を出す。
   *
   * どの軸がどちら向きに動くか、どのボタンが何番かは端末と
   * Joy-Conの持ち方で変わる。現場で見られないと切り分けられない。
   */
  function debugText() {
    var values = [];
    var index;
    var head;

    if (!debugEnabled) {
      return '';
    }

    // 「secure context だから見えないのでは」という疑いを
    // その場で終わらせるために、真偽をそのまま出す。
    head = ' / secure=' + (window.isSecureContext ? 1 : 0) +
      ' pads=' + gamepad.count +
      ' map=' + mappingLabel();

    if (!gamepad.axes) {
      return head;
    }

    for (index = 0; index < gamepad.axes.length; index += 1) {
      values.push(Number(gamepad.axes[index]).toFixed(2));
    }

    return head +
      ' axes[' + values.join(', ') + ']' +
      ' buttons[' + gamepad.held.join(', ') + ']' +
      ' ' + gamepad.id;
  }

  /** いま使っている軸の割り当てを短く表す（?debug表示用）。 */
  function mappingLabel() {
    var settings = mapping;

    if (!settings) {
      if (!window.TrolleyGamepad) {
        // gamepad.js を読めていない（配信し忘れ・キャッシュ）
        return 'gamepad.js無し';
      }

      settings = window.TrolleyGamepad.DEFAULT_MAPPING;
    }

    return (mapping ? '学習' : '既定') +
      '(lin:' + settings.linearAxis +
      (settings.linearSign < 0 ? '-' : '+') +
      ' ang:' + settings.angularAxis +
      (settings.angularSign < 0 ? '-' : '+') + ')';
  }

  /** その番号を無視しているか。 */
  function isBlockedButton(number) {
    var index;

    for (index = 0; index < gamepad.blocked.length; index += 1) {
      if (gamepad.blocked[index] === number) {
        return true;
      }
    }

    return false;
  }

  /** 押しているボタンのうち、無視しているものがあるか。 */
  function holdingBlockedButton() {
    var index;

    for (index = 0; index < gamepad.held.length; index += 1) {
      if (isBlockedButton(gamepad.held[index])) {
        return true;
      }
    }

    return false;
  }

  /** スティック設定の表示。 */
  function renderSheet() {
    var step;

    if (!sheet) {
      return;
    }

    if (!learn.active) {
      sheet.hidden = true;
      return;
    }

    step = LEARN_STEPS[learn.step] || LEARN_STEPS[0];

    sheetTitle.textContent = step.title;
    sheetBody.textContent = learn.hint
      ? step.body + ' — ' + learn.hint
      : step.body;

    sheet.hidden = false;
  }

  function renderSnackbar() {
    if (noticeText) {
      snackbarText.textContent = noticeText;
      snackbarAction.hidden = true;
      snackbar.hidden = false;
      return;
    }

    if (state.returnPending && state.driver) {
      snackbarText.textContent = 'Switchコントローラが復帰しました';
      snackbarAction.hidden = false;
      snackbar.hidden = false;
      return;
    }

    snackbar.hidden = true;
  }

  function showNotice(message) {
    if (!message) {
      return;
    }

    noticeText = String(message);

    if (noticeTimer !== null) {
      window.clearTimeout(noticeTimer);
    }

    noticeTimer = window.setTimeout(function () {
      noticeTimer = null;
      noticeText = '';
      renderSnackbar();
    }, NOTICE_DURATION_MS);

    renderSnackbar();
  }

  // ============================================================
  // 端末機能（未対応なら黙って無効）
  // ============================================================

  function vibrate(duration) {
    if (!navigator.vibrate) {
      return;
    }

    try {
      navigator.vibrate(duration);
    } catch (error) {
      // 未対応・拒否は無視する
    }
  }

  function requestWakeLock() {
    if (!('wakeLock' in navigator) || wakeLock !== null) {
      return;
    }

    try {
      navigator.wakeLock.request('screen').then(function (lock) {
        wakeLock = lock;

        lock.addEventListener('release', function () {
          wakeLock = null;
        });
      }).catch(function () {
        // 未対応・拒否は無視する
      });
    } catch (error) {
      // 未対応・拒否は無視する
    }
  }

  function releaseWakeLock() {
    if (wakeLock === null) {
      return;
    }

    try {
      wakeLock.release();
    } catch (error) {
      // 解放できなくても支障はない
    }

    wakeLock = null;
  }

  function now() {
    if (window.performance && window.performance.now) {
      return window.performance.now();
    }

    return Date.now();
  }

  // ============================================================
  // Joy-Con（Gamepad API）
  // ============================================================

  /**
   * 使えるなら有効にする。
   *
   * Gamepad API は secure context 限定なので、http で開いた画面では
   * コントローラが1台も見えない。その場合は開くべきURLを案内する。
   */
  function setupGamepad() {
    if (typeof navigator.getGamepads !== 'function') {
      renderPadBar();
      return;
    }

    if (typeof window.requestAnimationFrame !== 'function') {
      renderPadBar();
      return;
    }

    if (!window.TrolleyGamepad) {
      // gamepad.js が読めていない
      renderPadBar();
      return;
    }

    gamepad.supported = true;
    gamepad.searchStamp = now();
    mapping = loadMapping();

    // イベントは表示を更新するきっかけとしてだけ使う。
    // 「本当に繋がっているか」は毎フレームの走査で判断する。
    // （接続済みの端末はボタンを押すまで見えない、画面が消えている
    //   間の接続・切断ではイベントが来ない、といった穴があるため）
    window.addEventListener('gamepadconnected', function () {
      forgetGamepad();
      renderPadBar();
    });

    window.addEventListener('gamepaddisconnected', function () {
      releaseGamepad();
      forgetGamepad();
      renderPadBar();
    });

    startGamepadLoop();
    renderPadBar();
  }

  /** 掴んでいた端末を忘れて探し直す。 */
  function forgetGamepad() {
    gamepad.index = null;
    gamepad.id = '';
    gamepad.present = false;
    gamepad.signature = '';
    gamepad.stamp = null;
    gamepad.stampIsLive = false;
    gamepad.stale = false;
    gamepad.axisMismatch = false;
    gamepad.blocked = [];
    gamepad.held = [];
    gamepad.axes = null;
    gamepad.searchStamp = now();
  }

  /** 使えないと分かったので、以後さわらない。 */
  function disableGamepad() {
    gamepad.supported = false;
    releaseGamepad();
    forgetGamepad();
    renderPadBar();
  }

  function startGamepadLoop() {
    var tick = function () {
      try {
        pollGamepad();
      } catch (error) {
        // ここで例外を上げるとタッチ操作まで止まる。
        // Joy-Conだけを切り離して、画面のスティックは残す。
        releaseGamepad();
      }

      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  }

  /**
   * コントローラを1台選ぶ。
   *
   * 配列には null が混ざる（切断した分は番号を保つために空く）。
   * 覚えている番号の端末があればそれを優先し、
   * 無ければ最初に見つかったものを使う。
   */
  function pickGamepad(list) {
    var fallback = null;
    var index;
    var device;

    if (!list) {
      return null;
    }

    for (index = 0; index < list.length; index += 1) {
      device = list[index];

      if (!device || device.connected === false) {
        continue;
      }

      if (
        gamepad.index === device.index &&
        gamepad.id === device.id
      ) {
        return device;
      }

      if (fallback === null) {
        fallback = device;
      }
    }

    return fallback;
  }

  /** 見えているコントローラの台数を数える（?debug表示用）。 */
  function countGamepads(list) {
    var total = 0;
    var index;

    if (!list) {
      return 0;
    }

    for (index = 0; index < list.length; index += 1) {
      if (list[index] && list[index].connected !== false) {
        total += 1;
      }
    }

    return total;
  }

  /** 新しく掴んだ端末の状態を初期化する。 */
  function trackGamepad(device) {
    gamepad.index = device.index;
    gamepad.id = device.id;

    // 別のコントローラで覚えた割り当ては使わない
    if (mapping !== null && !mappingMatches(mapping, device.id)) {
      mapping = null;

      showNotice(
        '別のコントローラです。スティック設定をやり直してください'
      );
    }
    gamepad.present = true;
    gamepad.stale = false;
    gamepad.signature = window.TrolleyGamepad.valueSignature(device);
    gamepad.stamp = device.timestamp;
    gamepad.stampIsLive = false;
    gamepad.changeStamp = now();

    // 最初から押されているボタンはデッドマンに使わない。
    // 標準マッピングでない端末では、軸がボタンとして 1.0 のまま
    // 見えることがあり、それを掴むと止まらなくなる。
    gamepad.blocked = window.TrolleyGamepad.pressedButtons(device);

    renderPadBar();
  }

  function pollGamepad() {
    var api = window.TrolleyGamepad;
    var list;
    var device;

    if (!gamepad.supported) {
      return;
    }

    if (document.hidden) {
      // 画面が隠れている間、ブラウザはボタンの押下状態を
      // 最後の値のまま凍結して返す。読まずに手放す。
      //
      // 隠れると requestAnimationFrame も止まるので普段ここには
      // 来ないが、分割画面・コントロールセンターのように
      // 「隠れた直後の1フレーム」が残ることがある。
      disarmGamepad();
      return;
    }

    try {
      list = navigator.getGamepads();
    } catch (error) {
      // Permissions Policy で禁止されていると SecurityError になる
      disableGamepad();
      return;
    }

    device = pickGamepad(list);
    gamepad.count = countGamepads(list);

    if (device === null) {
      if (gamepad.present) {
        releaseGamepad();
        forgetGamepad();
        renderPadBar();
      }

      return;
    }

    if (
      !gamepad.present ||
      gamepad.index !== device.index ||
      gamepad.id !== device.id
    ) {
      trackGamepad(device);
    }

    // ★ここを更新できている間だけ走行指令を送る（sendCommand）
    gamepad.pollStamp = now();

    updateFreshness(device);

    gamepad.blocked = api.updateBlocked(device, gamepad.blocked);
    gamepad.held = api.pressedButtons(device);
    gamepad.axes = device.axes;

    if (debugEnabled) {
      // 生の値を見るために毎フレーム描き替える
      renderPadBar();
    }

    if (learn.active) {
      // 設定中は走らせない。
      // 押しているボタンは無視するボタンへ入れておく
      // （設定が終わった瞬間に走り出さないようにするため）。
      disarmGamepad();
      handleLearn(device);
      return;
    }

    applyGamepadInput(device);
  }

  /**
   * 入力が動いているかを見る。
   *
   * Bluetoothが黙って切れると、ブラウザは最後の値を返し続ける。
   * まったく変化しないまま時間が経ったら、生きていないと見なす。
   */
  function updateFreshness(device) {
    var signature = window.TrolleyGamepad.valueSignature(device);
    var stamp = device.timestamp;
    var moment = now();

    var valuesMoved = signature !== gamepad.signature;
    var stampMoved = stamp !== gamepad.stamp;
    var limit;

    // 値が同じまま timestamp だけ進んだ。
    // この端末は「受信が続いている」ことを timestamp で教えてくれる。
    if (stampMoved && !valuesMoved) {
      gamepad.stampIsLive = true;
    }

    if (valuesMoved || stampMoved) {
      gamepad.signature = signature;
      gamepad.stamp = stamp;
      gamepad.changeStamp = moment;

      if (gamepad.stale) {
        gamepad.stale = false;
        renderPadBar();
      }

      return;
    }

    if (gamepad.stale) {
      return;
    }

    // 生存の合図が使える端末なら、値の変化を待たずに短く切れる
    limit = gamepad.stampIsLive
      ? GAMEPAD_STALE_LIVE_MS
      : GAMEPAD_STALE_MS;

    if ((moment - gamepad.changeStamp) > limit) {
      gamepad.stale = true;

      // 凍結した押下のまま再武装させない
      disarmGamepad();

      showNotice('Joy-Conの入力が変わりません。接続を確認してください');
      renderPadBar();
    }
  }

  function applyGamepadInput(device) {
    var result = window.TrolleyGamepad.readInput(device, mapping, {
      deadzone: GAMEPAD_DEADZONE,
      blockedButtons: gamepad.blocked
    });

    var held = result.deadman && !gamepad.stale;

    // 倒しているのに動かない = 割り当てが違う可能性。
    // 右のJoy-Conはスティックが axes[2]/[3] に出るなど、
    // 端末と持ち方で軸が変わるため。
    var mismatch = !result.tilted && window.TrolleyGamepad.unusedActiveAxis(
      device,
      mapping,
      GAMEPAD_DEADZONE
    ) !== null;

    if (mismatch !== gamepad.axisMismatch) {
      gamepad.axisMismatch = mismatch;
      renderPadBar();
    }

    if (held !== gamepad.deadman) {
      gamepad.deadman = held;

      if (held) {
        gamepad.deadmanStamp = now();
      }

      renderPadBar();
    }

    if (!held) {
      releaseGamepad();
      return;
    }

    // 操作権が無いなら、まずそれを取る
    if (!canDrive()) {
      requestControlFromGamepad();
      return;
    }

    // タッチが握っている間は書き込まない
    if (inputSource === 'touch') {
      return;
    }

    if (inputSource === null) {
      inputSource = 'gamepad';

      // ノブの追従を遅らせない。付けないと 0.16 秒遅れて動き、
      // 「遅延している」ように見えてしまう。
      pad.classList.add('is-active');

      requestWakeLock();
      renderPadBar();
    }

    setCommand(result.lx, result.az, result.axis);
  }

  /**
   * ボタンを押し続けたら操作権を要求する。
   *
   * 走行には操作権が必要だが、そのためだけに画面をタップさせると
   * Joy-Conを持ち替えることになる。押し続けるだけで取れるようにする。
   */
  function requestControlFromGamepad() {
    var moment = now();

    if (!connected) {
      return;
    }

    if ((moment - gamepad.deadmanStamp) < GAMEPAD_CLAIM_HOLD_MS) {
      return;
    }

    if (
      gamepad.claimStamp !== null &&
      (moment - gamepad.claimStamp) < GAMEPAD_CLAIM_INTERVAL_MS
    ) {
      return;
    }

    gamepad.claimStamp = moment;

    send({ t: 'claim' });
  }

  /**
   * 速度指令からノブの位置を決めて反映する。
   *
   * updateFromPoint と逆の変換。画面座標では下・右が正なので、
   * 指令（前進・左旋回が正）とは符号が逆になる。
   */
  function setCommand(lx, az, axis) {
    var travel = padTravel();

    if (axis === 'linear') {
      setInput(lx, 0.0, 'linear', 0, -lx * travel);
      return;
    }

    if (axis === 'angular') {
      setInput(0.0, az, 'angular', -az * travel, 0);
      return;
    }

    setInput(0.0, 0.0, null, 0, 0);
  }

  /**
   * ノブが動ける距離 [px]。
   *
   * 毎フレーム getBoundingClientRect() を呼ぶとレイアウトが走るので
   * 覚えておき、画面の大きさが変わったときだけ捨てる。
   */
  function padTravel() {
    var rect;

    if (padTravelCache === null) {
      rect = pad.getBoundingClientRect();
      padTravelCache = (rect.width / 2) - (knob.offsetWidth / 2);
    }

    return padTravelCache;
  }

  // ============================================================
  // 軸の割り当ての保存
  // ============================================================

  function loadMapping() {
    var raw;
    var value;

    try {
      raw = window.localStorage.getItem(MAPPING_STORAGE_KEY);
    } catch (error) {
      // プライベートブラウズでは読めないことがある
      return null;
    }

    if (!raw) {
      return null;
    }

    try {
      value = JSON.parse(raw);
    } catch (error) {
      return null;
    }

    // 別の端末・古い版の値が残っていることがあるので必ず検査する
    if (!window.TrolleyGamepad.isValidMapping(value)) {
      return null;
    }

    return value;
  }

  /**
   * 保存された割り当てを、いま繋がっているコントローラに使えるか。
   *
   * 左右のJoy-Conでは軸の番号も向きも変わる。左で覚えた値を
   * 右にそのまま使うと「前に倒したら後退する」ことがあり、
   * これが現場でいちばん危ない。識別子が違えば捨てる。
   *
   * 古い保存値（識別子が無い）は、そのまま使う。
   * 判断できないからといって、覚えた設定を消すほうが害が大きい。
   */
  function mappingMatches(value, id) {
    if (!value || !value.id) {
      return true;
    }

    return value.id === id;
  }

  function saveMapping(value) {
    try {
      window.localStorage.setItem(
        MAPPING_STORAGE_KEY,
        JSON.stringify(value)
      );
    } catch (error) {
      // 保存できなくてもこの場の操作には影響しない
    }
  }

  function clearMapping() {
    mapping = null;

    try {
      window.localStorage.removeItem(MAPPING_STORAGE_KEY);
    } catch (error) {
      // 消せなくても既定値で動く
    }
  }

  // ============================================================
  // スティック設定（軸の学習）
  // ============================================================

  var LEARN_STEPS = [
    {
      title: 'スティック設定 (1/3)',
      body: 'スティックから手を離してください。'
    },
    {
      title: 'スティック設定 (2/3)',
      body: '前に進みたい向きへ、スティックを倒したままにしてください。'
    },
    {
      title: 'スティック設定 (3/3)',
      body: '右に曲がりたい向きへ、スティックを倒したままにしてください。'
    }
  ];

  function startLearn() {
    // 設定中に走り出さないよう、必ず先に止める
    stopAll();

    learn.active = true;
    learn.step = 0;
    learn.rest = null;
    learn.linear = null;
    learn.angular = null;
    learn.candidate = null;
    learn.holdStamp = 0;
    learn.prev = null;
    learn.stamp = now();
    learn.hint = '';

    renderSheet();
  }

  function closeLearn() {
    // 出口で必ず武装解除する。
    //
    // 最後の手順が「右に倒したままにしてください」なので、
    // 設定が終わった瞬間のスティックは必ず倒れている。
    // ボタンに触れていれば、シートが閉じた次のフレームで
    // 全速で旋回を始めてしまう（操作者は画面の文字を読んでいる）。
    disarmGamepad();

    learn.active = false;
    learn.hint = '';

    sheet.hidden = true;

    render();
  }

  function advanceLearn() {
    learn.step += 1;
    learn.candidate = null;
    learn.holdStamp = 0;
    learn.prev = null;
    learn.stamp = now();
    learn.hint = '';

    vibrate(20);
    renderSheet();
  }

  function setLearnHint(text) {
    if (learn.hint === text) {
      return;
    }

    learn.hint = text;
    renderSheet();
  }

  /**
   * 学習の1フレーム分。
   *
   * 同じ軸を同じ向きに倒し続けている間だけ数え、
   * 一定時間そろったら確定する。画面を触らずに進められるよう、
   * ボタンではなく「倒し続けたか」で判断している。
   */
  function handleLearn(device) {
    var api = window.TrolleyGamepad;
    var moment = now();
    var axes = device.axes;
    var candidate;

    if (!axes || !axes.length) {
      setLearnHint('このコントローラからはスティックが読めません。');
      return;
    }

    if (learn.step === 0) {
      // 中立の値を採る。ここを間違えると、あとの全部が狂う。
      //
      // 倒したまま採ってしまうと、そこからの差分で向きを決めるため
      // 「指示どおり倒しても差が出ず、逆に倒したときだけ差が出る」
      // 状態になり、前後が反転した設定が保存される。
      // 「前に倒したら後退する」は現場でいちばん危ない挙動なので、
      // 中立に戻っていることと、値が落ち着いていることの
      // 両方を確かめてから採る。
      if (!isAxesCentered(axes)) {
        learn.holdStamp = 0;
        learn.prev = copyAxes(axes);

        setLearnHint('まだ倒れています。中立に戻してください');

        return;
      }

      if (!isAxesSettled(axes, learn.prev)) {
        learn.holdStamp = 0;
        learn.prev = copyAxes(axes);

        // 揺れ続けて進まないときも、黙って止まらない
        if ((moment - learn.stamp) > GAMEPAD_LEARN_NUDGE_MS) {
          setLearnHint('スティックが揺れています。手を離してください');
        }

        return;
      }

      learn.prev = copyAxes(axes);

      if (learn.holdStamp === 0) {
        learn.holdStamp = moment;
        setLearnHint('');

        return;
      }

      if ((moment - learn.holdStamp) < GAMEPAD_LEARN_HOLD_MS) {
        return;
      }

      learn.rest = copyAxes(axes);
      advanceLearn();

      return;
    }

    candidate = api.learnAxis(
      learn.rest,
      axes,
      GAMEPAD_LEARN_THRESHOLD,
      learn.step === 1 ? 1 : -1
    );

    if (candidate === null) {
      learn.candidate = null;
      learn.holdStamp = 0;

      // 黙って止まると「壊れた」と思われる。
      // 倒し足りない場合がほとんどなので、そう言う。
      if ((moment - learn.stamp) > GAMEPAD_LEARN_NUDGE_MS) {
        setLearnHint('もっと大きく、いっぱいまで倒してください');
      }

      return;
    }

    if (
      learn.candidate === null ||
      learn.candidate.index !== candidate.index ||
      learn.candidate.sign !== candidate.sign
    ) {
      learn.candidate = candidate;
      learn.holdStamp = moment;

      return;
    }

    if ((moment - learn.holdStamp) < GAMEPAD_LEARN_HOLD_MS) {
      return;
    }

    if (learn.step === 1) {
      learn.linear = candidate;
      advanceLearn();

      return;
    }

    if (candidate.index === learn.linear.index) {
      // 前後と同じ軸では旋回できない。倒し直してもらう。
      setLearnHint('前後と同じ向きです。別の向きに倒してください。');

      return;
    }

    learn.angular = candidate;
    finishLearn();
  }

  function finishLearn() {
    var value = {
      linearAxis: learn.linear.index,
      linearSign: learn.linear.sign,
      angularAxis: learn.angular.index,
      angularSign: learn.angular.sign
    };

    if (!window.TrolleyGamepad.isValidMapping(value)) {
      learn.step = 0;
      learn.rest = null;
      learn.linear = null;
      learn.angular = null;
      learn.candidate = null;
      learn.holdStamp = 0;

      setLearnHint('うまく読めませんでした。もう一度お願いします。');

      return;
    }

    // どのコントローラで覚えたかを添えておく
    value.id = gamepad.id;

    mapping = value;
    saveMapping(value);

    closeLearn();
    showNotice('スティックの向きを覚えました');
    vibrate(30);
  }

  /** すべての軸が中立付近にあるか。 */
  function isAxesCentered(axes) {
    var index;
    var value;

    for (index = 0; index < axes.length; index += 1) {
      value = axes[index];

      if (typeof value !== 'number' || !isFinite(value)) {
        continue;
      }

      if (Math.abs(value) > GAMEPAD_LEARN_CENTER_MAX) {
        return false;
      }
    }

    return true;
  }

  /** 前のフレームから値が動いていないか。 */
  function isAxesSettled(axes, previous) {
    var index;

    if (!previous || previous.length !== axes.length) {
      return false;
    }

    for (index = 0; index < axes.length; index += 1) {
      if (
        Math.abs(axes[index] - previous[index]) > GAMEPAD_LEARN_SETTLE
      ) {
        return false;
      }
    }

    return true;
  }

  function copyAxes(axes) {
    var result = [];
    var index;

    for (index = 0; index < axes.length; index += 1) {
      result.push(axes[index]);
    }

    return result;
  }

  // ============================================================
  // 定期処理
  // ============================================================

  /**
   * 走行指令を送る。
   *
   * Joy-Conが入力源のときは、直前にポーリングできていることを
   * 必ず確かめる。requestAnimationFrame は画面が消えると止まるが、
   * この setInterval は 1Hz に間引かれて生き残るため、
   * 確認しないと「凍結した古い値」を送り続けることになる。
   */
  function sendCommand() {
    if (document.hidden || !canDrive()) {
      // setInterval は画面が消えても止まらず、1Hzに間引かれて
      // 生き残る。ポーリングの生存確認と二重に守る。
      return;
    }

    if (
      inputSource === 'gamepad' &&
      (now() - gamepad.pollStamp) > GAMEPAD_POLL_TIMEOUT_MS
    ) {
      stopDriving();
      return;
    }

    send({ t: 'cmd', lx: input.lx, az: input.az });
  }

  function startLoops() {
    window.setInterval(sendCommand, SEND_INTERVAL_MS);

    window.setInterval(function () {
      send({ t: 'ping', ts: now() });

      // 時間が経ってから出る案内（予備のURL）のために、
      // 状態が変わらなくても定期的に描き替える。
      renderPadBar();
    }, PING_INTERVAL_MS);
  }

  // ============================================================
  // 初期化
  // ============================================================

  function bindSafetyHandlers() {
    // 画面が隠れた・フォーカスを失ったら必ず停止させる。
    //
    // Joy-Conの場合はこれだけでは足りない。画面が消えると
    // ブラウザはボタンの押下状態を「最後の値のまま」凍結するので、
    // ポーリングの生存も送信の条件にしている（sendCommand）。
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAll();
        return;
      }

      // 復帰時はJoy-Conを探し直す。
      // 画面が消えている間の接続・切断はイベントが来ない。
      forgetGamepad();
    });

    window.addEventListener('blur', stopAll);
    window.addEventListener('pagehide', stopAll);

    // 長押しメニューで操作が中断されるのを防ぐ
    window.addEventListener('contextmenu', function (event) {
      event.preventDefault();
    });

    // Safariのピンチズーム抑止（他ブラウザでは発火しない）
    window.addEventListener('gesturestart', function (event) {
      event.preventDefault();
    });
  }

  function init() {
    chip.addEventListener('click', function () {
      if (!connected) {
        showNotice('サーバに接続していません');
        return;
      }

      send({ t: 'claim' });
    });

    snackbarAction.addEventListener('click', function () {
      send({ t: 'release' });
    });

    // タッチ操作を先に必ず成立させる。
    // Joy-Con の初期化はこの後（失敗してもタッチは残る）。
    if (window.PointerEvent) {
      bindPointerEvents();
    } else {
      bindTouchEvents();
    }

    bindSafetyHandlers();
    bindGamepadUi();

    render();
    connect();
    setupGamepad();
    startLoops();
  }

  function bindGamepadUi() {
    // 画面の大きさが変わったらノブの可動域を測り直す
    window.addEventListener('resize', function () {
      padTravelCache = null;
    });

    window.addEventListener('orientationchange', function () {
      padTravelCache = null;
    });

    if (padSetup) {
      padSetup.addEventListener('click', startLearn);
    }

    if (sheetRetry) {
      sheetRetry.addEventListener('click', startLearn);
    }

    if (sheetReset) {
      sheetReset.addEventListener('click', function () {
        clearMapping();
        closeLearn();
        showNotice('スティックの向きを既定に戻しました');
      });
    }

    if (sheetClose) {
      sheetClose.addEventListener('click', closeLearn);
    }
  }

  init();
}());

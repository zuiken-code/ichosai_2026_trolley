/* ============================================================
   Trolley スマートフォンコントローラ
   ------------------------------------------------------------
   Switchコントローラのバックアップとして、スマートフォンから
   /cmd_vel を送るための画面。

   ブラウザ差異への方針:
     * Pointer Events を使い、未対応端末では Touch Events に退避する
     * Vibration API / Screen Wake Lock API は機能検出し、
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
      releaseStick();
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
        releaseStick();
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

    activePointerId = pointerId;
    pad.classList.add('is-active');

    updateFromPoint(clientX, clientY);
    requestWakeLock();
  }

  function releaseStick() {
    var wasActive = activePointerId !== null;

    activePointerId = null;
    pad.classList.remove('is-active');
    setInput(0.0, 0.0, null, 0, 0);

    if (wasActive) {
      // 停止を待たせないよう、即時に送る
      send({ t: 'stop' });
    }

    releaseWakeLock();
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

    renderSnackbar();
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
  // 定期処理
  // ============================================================

  function startLoops() {
    window.setInterval(function () {
      if (!canDrive()) {
        return;
      }

      send({ t: 'cmd', lx: input.lx, az: input.az });
    }, SEND_INTERVAL_MS);

    window.setInterval(function () {
      send({ t: 'ping', ts: now() });
    }, PING_INTERVAL_MS);
  }

  // ============================================================
  // 初期化
  // ============================================================

  function bindSafetyHandlers() {
    // 画面が隠れた・フォーカスを失ったら必ず停止させる
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        releaseStick();
      }
    });

    window.addEventListener('blur', releaseStick);
    window.addEventListener('pagehide', releaseStick);

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

    if (window.PointerEvent) {
      bindPointerEvents();
    } else {
      bindTouchEvents();
    }

    bindSafetyHandlers();

    render();
    connect();
    startLoops();
  }

  init();
}());

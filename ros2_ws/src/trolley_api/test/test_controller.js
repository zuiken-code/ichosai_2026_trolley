/* ============================================================
   web/app.js の結合テスト（ブラウザ無し）
   ------------------------------------------------------------
   最小限のDOM・Gamepad API・WebSocketを偽物で用意し、
   app.js をそのまま読み込んで動かす。

       node ros2_ws/src/trolley_api/test/test_controller.js

   何を守っているか:
     * デッドマンを離したら必ず停止が送られる
     * requestAnimationFrame が止まったら走行指令を送らない
       （画面消灯・アプリ切替。setInterval だけが生き残る状況）
     * タッチとJoy-Conが入力を奪い合わない
     * 操作権が無い間は走行指令を送らない

   実機のブラウザでしか分からないこと（ペアリング、軸の番号、
   証明書の承認）はここでは扱わない。docs/joycon_controller.md の
   確認手順を使うこと。
   ============================================================ */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const WEB_DIR = path.join(__dirname, '..', 'web');

// app.js の定数と合わせる
const SEND_INTERVAL_MS = 50;
const POLL_TIMEOUT_MS = 150;
const CLAIM_HOLD_MS = 1000;
const STALE_MS = 8000;
const STALE_LIVE_MS = 2000;
const LEARN_HOLD_MS = 400;
const PING_INTERVAL_MS = 1000;
const FALLBACK_HINT_MS = 15000;

// ============================================================
// 偽のDOM
// ============================================================

const ELEMENT_IDS = [
  'sourceChip', 'chipLabel', 'pad', 'knob', 'hint',
  'snackbar', 'snackbarText', 'snackbarAction',
  'padBar', 'padText', 'padSetup',
  'sheet', 'sheetTitle', 'sheetBody',
  'sheetRetry', 'sheetReset', 'sheetClose'
];

function createElement(id) {
  const classes = {};
  const handlers = {};

  return {
    id: id,
    textContent: '',
    hidden: false,
    className: '',
    offsetWidth: 100,
    style: { setProperty: function () {} },

    classList: {
      add: function (name) { classes[name] = true; },
      remove: function (name) { delete classes[name]; },
      toggle: function (name, on) {
        if (on) { classes[name] = true; } else { delete classes[name]; }
      },
      contains: function (name) { return classes[name] === true; }
    },

    getBoundingClientRect: function () {
      return { left: 0, top: 0, width: 300, height: 300 };
    },

    setPointerCapture: function () {},

    addEventListener: function (type, handler) {
      handlers[type] = handlers[type] || [];
      handlers[type].push(handler);
    },

    // テストからイベントを起こす
    fire: function (type, event) {
      (handlers[type] || []).forEach(function (handler) {
        handler(event || {});
      });
    },

    hasHandler: function (type) {
      return (handlers[type] || []).length > 0;
    }
  };
}

// ============================================================
// ハーネス
// ============================================================

function createHarness(options) {
  const settings = options || {};
  const elements = {};
  const intervals = [];
  const frames = [];
  const windowHandlers = {};
  const documentHandlers = {};
  const store = Object.assign({}, (options || {}).storage || {});

  let clock = 1000;
  let socket = null;

  ELEMENT_IDS.forEach(function (id) {
    elements[id] = createElement(id);
  });

  const sent = [];

  function FakeWebSocket() {
    this.readyState = 1;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;

    this.send = function (raw) {
      sent.push(JSON.parse(raw));
    };

    socket = this;
  }

  const context = {
    console: console,

    navigator: {
      getGamepads: function () { return [null]; }
    },

    performance: { now: function () { return clock; } },

    WebSocket: FakeWebSocket,

    document: {
      hidden: false,
      getElementById: function (id) { return elements[id] || null; },
      addEventListener: function (type, handler) {
        documentHandlers[type] = documentHandlers[type] || [];
        documentHandlers[type].push(handler);
      }
    },

    localStorage: {
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(store, key)
          ? store[key]
          : null;
      },
      setItem: function (key, value) { store[key] = String(value); },
      removeItem: function (key) { delete store[key]; }
    },

    // Pointer Events を使う分岐に入れる
    PointerEvent: function () {},

    isSecureContext: true,

    location: {
      protocol: settings.protocol || 'https:',
      host: settings.host || '192.168.0.5:8443',
      hostname: '192.168.0.5',
      search: settings.search || ''
    },

    setInterval: function (handler, ms) {
      intervals.push({ handler: handler, ms: ms });
      return intervals.length;
    },

    clearInterval: function () {},

    setTimeout: function (handler) {
      // 通知の自動消去に使われるだけなので、走らせない
      return 0;
    },

    clearTimeout: function () {},

    requestAnimationFrame: function (handler) {
      frames.push(handler);
      return frames.length;
    },

    addEventListener: function (type, handler) {
      windowHandlers[type] = windowHandlers[type] || [];
      windowHandlers[type].push(handler);
    }
  };

  context.window = context;
  context.globalThis = context;

  vm.createContext(context);

  [ 'gamepad.js', 'app.js' ].forEach(function (name) {
    const code = fs.readFileSync(path.join(WEB_DIR, name), 'utf8');

    vm.runInContext(code, context, { filename: name });
  });

  const harness = {
    context: context,
    sent: sent,
    element: function (id) { return elements[id]; },

    advance: function (ms) { clock += ms; },
    time: function () { return clock; },

    /** rAF を1回分進める（Joy-Conのポーリング1周）。 */
    frame: function () {
      const pending = frames.splice(0, frames.length);

      pending.forEach(function (handler) { handler(clock); });
    },

    /** 送信タイマーを1回分動かす。 */
    tickSend: function () {
      intervals
        .filter(function (item) { return item.ms === SEND_INTERVAL_MS; })
        .forEach(function (item) { item.handler(); });
    },

    /** 1秒周期のタイマー（ping と表示の更新）を1回分動かす。 */
    tickSlow: function () {
      intervals
        .filter(function (item) { return item.ms === PING_INTERVAL_MS; })
        .forEach(function (item) { item.handler(); });
    },

    fireWindow: function (type, event) {
      (windowHandlers[type] || []).forEach(function (handler) {
        handler(event || {});
      });
    },

    fireDocument: function (type, event) {
      (documentHandlers[type] || []).forEach(function (handler) {
        handler(event || {});
      });
    },

    setHidden: function (hidden) { context.document.hidden = hidden; },

    setGamepads: function (list) {
      context.navigator.getGamepads = function () { return list; };
    },

    /**
     * コントローラを繋ぐ。
     *
     * ブラウザはボタンを押した瞬間に初めてコントローラを見つけ、
     * app.js はその1回目の押下をデッドマンに使わない
     * （押しっぱなしのボタンと区別できないため）。
     * 実機では「押す→離す→押す」になるので、そこまでを済ませる。
     */
    attach: function () {
      harness.setGamepads([gamepadOf([0.0, 0.0], [1])]);
      harness.frame();

      harness.setGamepads([gamepadOf([0.0, 0.0], [0])]);
      harness.frame();

      harness.clear();
    },

    failGamepads: function (error) {
      context.navigator.getGamepads = function () { throw error; };
    },

    receive: function (message) {
      socket.onmessage({ data: JSON.stringify(message) });
    },

    open: function () { socket.onopen(); },
    close: function () { socket.onclose(); },

    clear: function () { sent.length = 0; },

    /** 送られたメッセージのうち、種類が合うものだけ。 */
    ofType: function (type) {
      return sent.filter(function (item) { return item.t === type; });
    },

    last: function () { return sent[sent.length - 1] || null; }
  };

  // 接続して、このスマホが操作権を持っている状態にする
  harness.open();
  harness.receive({ t: 'hello', driver: true, https_port: 8443 });
  harness.receive({
    t: 'state',
    driver: true,
    source: 'phone',
    joy_alive: false,
    phone_alive: true,
    return_pending: false,
    mux_available: true
  });

  // 起動直後の rAF を1回流して、ポーリングを始めさせる
  harness.frame();
  harness.clear();

  return harness;
}

// ============================================================
// 偽のGamepad
// ============================================================

function gamepadOf(axes, buttonValues, extra) {
  const overrides = extra || {};

  return {
    index: overrides.index === undefined ? 0 : overrides.index,
    id: overrides.id === undefined ? 'Joy-Con (L)' : overrides.id,
    mapping: 'standard',
    connected: true,
    timestamp: overrides.timestamp === undefined ? 1 : overrides.timestamp,
    axes: axes,
    buttons: (buttonValues || []).map(function (value) {
      return { pressed: value >= 0.5, touched: value > 0, value: value };
    })
  };
}

/** 標準マッピングで前進いっぱい + ボタン押下。 */
function forwardHeld(timestamp) {
  return gamepadOf([0.0, -1.0], [1], { timestamp: timestamp });
}

/** 前進いっぱいだがボタンは離している。 */
function forwardReleased(timestamp) {
  return gamepadOf([0.0, -1.0], [0], { timestamp: timestamp });
}

// ============================================================
// 基本の走行
// ============================================================

test('Joy-Conのボタンを押している間だけ走行指令を送る', function () {
  const h = createHarness();

  h.attach();

  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();

  const commands = h.ofType('cmd');

  assert.equal(commands.length, 1);
  assert.ok(commands[0].lx > 0.99, `lx=${commands[0].lx}`);
  assert.equal(commands[0].az, 0);
});

test('ボタンを離すと停止が送られ、以後はゼロになる', function () {
  const h = createHarness();

  h.attach();

  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();
  h.clear();

  // 倒したままボタンだけ離す
  h.setGamepads([forwardReleased(2)]);
  h.frame();

  assert.equal(h.ofType('stop').length, 1, '停止が送られること');

  h.tickSend();

  const commands = h.ofType('cmd');

  assert.equal(commands.length, 1);
  assert.equal(commands[0].lx, 0);
  assert.equal(commands[0].az, 0);
});

test('右に倒すと右旋回（angular.zが負）になる', function () {
  const h = createHarness();

  h.attach();

  h.setGamepads([gamepadOf([1.0, 0.0], [1])]);
  h.frame();
  h.tickSend();

  const command = h.ofType('cmd')[0];

  assert.ok(command.az < -0.99, `az=${command.az}`);
  assert.equal(command.lx, 0);
});

test('不感帯の中では走らない', function () {
  const h = createHarness();

  h.attach();

  h.setGamepads([gamepadOf([0.05, -0.1], [1])]);
  h.frame();
  h.tickSend();

  const command = h.ofType('cmd')[0];

  assert.equal(command.lx, 0);
  assert.equal(command.az, 0);
});

// ============================================================
// ★ポーリングが止まったとき（画面消灯・アプリ切替）
// ============================================================

test('ポーリングが止まったら走行指令を送らない', function () {
  const h = createHarness();

  h.attach();

  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();

  assert.ok(h.ofType('cmd')[0].lx > 0.99, 'まず走っていること');

  h.clear();

  // ここから rAF が呼ばれなくなる（画面が消えた）。
  // setInterval は 1Hz に間引かれて生き残るので、送信だけが走る。
  h.advance(POLL_TIMEOUT_MS + 50);
  h.tickSend();

  assert.equal(h.ofType('stop').length, 1, '停止が送られること');

  const commands = h.ofType('cmd');

  commands.forEach(function (command) {
    assert.equal(command.lx, 0, '古い値を送っていないこと');
    assert.equal(command.az, 0);
  });

  // さらに時間が経っても、ゼロ以外は出ない
  h.clear();
  h.advance(1000);
  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0);
    assert.equal(command.az, 0);
  });
});

test('ポーリングが戻れば再び走れる', function () {
  const h = createHarness();

  h.attach();

  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();

  h.advance(POLL_TIMEOUT_MS + 50);
  h.tickSend();
  h.clear();

  // 画面が戻った
  h.setGamepads([forwardHeld(2)]);
  h.frame();
  h.frame();
  h.tickSend();

  const commands = h.ofType('cmd');

  assert.ok(commands.length > 0);
  assert.ok(
    commands[commands.length - 1].lx > 0.99,
    '復帰後に走れること'
  );
});

// ============================================================
// 画面が隠れた / 切断した
// ============================================================

test('画面が隠れたら停止する', function () {
  const h = createHarness();

  h.attach();

  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();
  h.clear();

  h.setHidden(true);
  h.fireDocument('visibilitychange');

  assert.equal(h.ofType('stop').length, 1);

  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0);
  });
});

test('WebSocketが切れたら走行状態を落とす', function () {
  const h = createHarness();

  h.attach();

  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();
  h.clear();

  h.close();

  // 切断後は送信しない（送れない）
  h.tickSend();

  assert.equal(h.ofType('cmd').length, 0);
});

// ============================================================
// コントローラが消えた / 反応しない
// ============================================================

test('コントローラが外れたら停止する', function () {
  const h = createHarness();

  h.attach();

  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();
  h.clear();

  // 切断（配列には null が残る）
  h.setGamepads([null]);
  h.frame();

  assert.equal(h.ofType('stop').length, 1);
});

test('connected が false の端末は使わない', function () {
  const h = createHarness();
  const device = forwardHeld(1);

  device.connected = false;

  h.setGamepads([device]);
  h.frame();
  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0);
  });
});

test('入力がまったく変化しないまま続いたら停止する', function () {
  const h = createHarness();

  h.attach();

  // timestamp も値も一切変わらない（Bluetoothが黙って切れた状態）
  const frozen = forwardHeld(1);

  h.setGamepads([frozen]);
  h.frame();
  h.tickSend();

  assert.ok(h.ofType('cmd')[0].lx > 0.99, 'はじめは走ること');

  h.clear();
  h.advance(STALE_MS + 100);
  h.frame();

  assert.equal(h.ofType('stop').length, 1, '停止が送られること');

  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0);
  });
});

test('値が動いている間は停止しない', function () {
  const h = createHarness();

  h.attach();
  let stamp = 1;

  h.setGamepads([forwardHeld(stamp)]);
  h.frame();

  // 10秒ぶん、少しずつ動かし続ける
  for (let step = 0; step < 30; step += 1) {
    stamp += 1;
    h.advance(400);
    h.setGamepads([forwardHeld(stamp)]);
    h.frame();
  }

  h.clear();
  h.tickSend();

  const commands = h.ofType('cmd');

  assert.equal(h.ofType('stop').length, 0);
  assert.ok(commands[0].lx > 0.99, '走り続けられること');
});

// ============================================================
// 最初から押されているボタン
// ============================================================

test('検出時に押されていたボタンでは走らない', function () {
  const h = createHarness();

  // 軸がボタンとして 1.0 で見えてしまう端末の再現
  h.setGamepads([gamepadOf([0.0, -1.0], [1])]);

  // 検出の瞬間に押されている -> そのボタンは無視される
  h.frame();
  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0, '押しっぱなしのボタンで走らないこと');
  });

  // 一度離せば、次からは使える
  h.setGamepads([gamepadOf([0.0, -1.0], [0])]);
  h.frame();

  h.clear();
  h.setGamepads([gamepadOf([0.0, -1.0], [1], { timestamp: 3 })]);
  h.frame();
  h.tickSend();

  assert.ok(h.ofType('cmd')[0].lx > 0.99, '押し直せば走れること');
});

// ============================================================
// 操作権
// ============================================================

test('操作権が無い間は走行指令を送らない', function () {
  const h = createHarness();

  h.receive({
    t: 'state',
    driver: true,
    source: 'joy',
    joy_alive: true,
    return_pending: false,
    mux_available: true
  });

  h.clear();
  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();

  assert.equal(h.ofType('cmd').length, 0);
});

test('ボタンを押し続けると操作権を要求する', function () {
  const h = createHarness();

  h.attach();

  h.receive({
    t: 'state',
    driver: true,
    source: 'joy',
    joy_alive: true,
    return_pending: false,
    mux_available: true
  });

  h.clear();
  h.setGamepads([forwardHeld(1)]);
  h.frame();

  // 押し始めてすぐには要求しない
  assert.equal(h.ofType('claim').length, 0);

  h.advance(CLAIM_HOLD_MS + 50);
  h.setGamepads([forwardHeld(2)]);
  h.frame();

  assert.equal(h.ofType('claim').length, 1);

  // 連打しない
  h.advance(100);
  h.setGamepads([forwardHeld(3)]);
  h.frame();

  assert.equal(h.ofType('claim').length, 1);
});

// ============================================================
// タッチとの共存
// ============================================================

test('Joy-Conのポーリングはタッチ操作を打ち消さない', function () {
  const h = createHarness();
  const pad = h.element('pad');

  // ボタンは離した状態のJoy-Conが繋がっている
  h.setGamepads([forwardReleased(1)]);
  h.frame();

  // 画面のスティックを下半分（後退）へ倒す
  pad.fire('pointerdown', {
    isPrimary: true,
    pointerId: 1,
    clientX: 150,
    clientY: 290,
    preventDefault: function () {}
  });

  h.clear();

  // Joy-Con のポーリングが走ってもタッチの値が消えないこと
  h.frame();
  h.tickSend();

  const command = h.ofType('cmd')[0];

  assert.ok(command.lx < -0.5, `タッチの値が消えている lx=${command.lx}`);
});

test('指を離せばタッチの走行は止まる', function () {
  const h = createHarness();
  const pad = h.element('pad');

  pad.fire('pointerdown', {
    isPrimary: true,
    pointerId: 1,
    clientX: 150,
    clientY: 290,
    preventDefault: function () {}
  });

  h.clear();

  pad.fire('pointerup', { pointerId: 1 });

  assert.equal(h.ofType('stop').length, 1);

  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0);
  });
});

test('Joy-Conが固まってもタッチで割り込める', function () {
  // Bluetoothが黙って切れると、ブラウザはボタンを押したままの
  // 状態を返し続ける。人が画面のスティックで止められること。
  const h = createHarness();
  const pad = h.element('pad');

  h.attach();

  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();

  assert.ok(h.ofType('cmd')[0].lx > 0.99, 'まずJoy-Conで走っていること');

  h.clear();

  // 画面のスティックを下半分（後退）へ倒す
  pad.fire('pointerdown', {
    isPrimary: true,
    pointerId: 1,
    clientX: 150,
    clientY: 290,
    preventDefault: function () {}
  });

  h.tickSend();

  const command = h.ofType('cmd')[0];

  assert.ok(command.lx < -0.5, `タッチに切り替わっていない lx=${command.lx}`);
});

test('タッチで割り込んだあと指を離しても、Joy-Conは走り出さない', function () {
  const h = createHarness();
  const pad = h.element('pad');

  h.attach();

  // ボタンを押したまま固まっている
  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();

  pad.fire('pointerdown', {
    isPrimary: true,
    pointerId: 1,
    clientX: 150,
    clientY: 290,
    preventDefault: function () {}
  });

  pad.fire('pointerup', { pointerId: 1 });

  h.clear();

  // ボタンは押されたまま。押し直すまで走ってはいけない。
  h.frame();
  h.frame();
  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0, '押し直さずに走り出した');
    assert.equal(command.az, 0);
  });
});

test('ボタンを押したままフォーカスを失うと、押し直すまで走らない', function () {
  // 通知シェード・分割画面。画面は消えていないので
  // requestAnimationFrame は動き続ける。
  const h = createHarness();

  h.attach();

  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();

  assert.ok(h.ofType('cmd')[0].lx > 0.99, 'まず走っていること');

  h.clear();
  h.fireWindow('blur');

  assert.equal(h.ofType('stop').length, 1, '停止が送られること');

  // ボタンは押されたまま、描画も続いている
  h.setGamepads([forwardHeld(2)]);
  h.frame();
  h.setGamepads([forwardHeld(3)]);
  h.frame();
  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0, 'フォーカスを失った直後に再武装した');
  });

  // 離して押し直せば、また走れる
  h.setGamepads([forwardReleased(4)]);
  h.frame();

  h.clear();
  h.setGamepads([forwardHeld(5)]);
  h.frame();
  h.tickSend();

  assert.ok(h.ofType('cmd')[0].lx > 0.99, '押し直しても走れない');
});

test('画面が隠れている間はポーリングの値を使わない', function () {
  const h = createHarness();

  h.attach();

  h.setGamepads([forwardHeld(1)]);
  h.frame();
  h.tickSend();
  h.clear();

  h.setHidden(true);

  // 隠れていても rAF が1フレーム残ることがある
  h.frame();
  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0);
  });
});

test('反応が無くなったあとは、押し直すまで走らない', function () {
  const h = createHarness();

  h.attach();

  const frozen = forwardHeld(1);

  h.setGamepads([frozen]);
  h.frame();
  h.tickSend();
  h.clear();

  // 完全に固まったまま時間が経つ
  h.advance(STALE_MS + 100);
  h.frame();

  assert.equal(h.ofType('stop').length, 1);

  // 値が動き出しても（Bluetoothが復帰しても）、
  // ボタンを押したままでは走らない
  h.clear();
  h.setGamepads([forwardHeld(2)]);
  h.frame();
  h.setGamepads([forwardHeld(3)]);
  h.frame();
  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0, '押し直さずに走り出した');
  });
});

// ============================================================
// スティック設定（軸の学習）
// ============================================================

/**
 * その姿勢を保ったまま時間を進める。
 *
 * 学習の各段は「同じ判定が LEARN_HOLD_MS 続いたら確定」なので、
 * 1フレームでは進まない（時間を進めてからもう1フレーム必要）。
 */
function hold(h, axes, buttonValues, stamp) {
  let step;

  for (step = 0; step < 5; step += 1) {
    h.setGamepads([
      gamepadOf(axes, buttonValues, { timestamp: stamp * 10 + step })
    ]);
    h.frame();
    h.advance(Math.ceil(LEARN_HOLD_MS / 2));
  }
}

/** スティック設定を1周させる。倒す向きは呼び出し側が決める。 */
function runLearn(h, forward, right, buttonValues) {
  const buttons = buttonValues || [0];

  h.element('padSetup').fire('click');

  hold(h, [0.0, 0.0], buttons, 1);   // (1/3) 中立
  hold(h, forward, buttons, 2);      // (2/3) 前に倒したまま
  hold(h, right, buttons, 3);        // (3/3) 右に倒したまま
}

test('覚えた向きで前進・右旋回になる', function () {
  const h = createHarness({ search: '?debug=1' });

  h.attach();

  // 横持ちの想定。前に倒すと axes[0] が +、右に倒すと axes[1] が +
  runLearn(h, [0.9, 0.0], [0.0, 0.9]);

  assert.ok(
    h.element('padText').textContent.indexOf('map=学習') >= 0,
    '学習されていない: ' + h.element('padText').textContent
  );

  // 覚えたとおりに倒す。押し直してから走らせる
  h.setGamepads([gamepadOf([0.9, 0.0], [0], { timestamp: 4 })]);
  h.frame();

  h.clear();
  h.setGamepads([gamepadOf([0.9, 0.0], [1], { timestamp: 5 })]);
  h.frame();
  h.tickSend();

  const command = h.ofType('cmd')[0];

  assert.ok(command.lx > 0.5, `前進しない lx=${command.lx}`);

  h.clear();
  h.setGamepads([gamepadOf([0.0, 0.9], [1], { timestamp: 6 })]);
  h.frame();
  h.tickSend();

  assert.ok(
    h.ofType('cmd')[0].az < -0.5,
    '右旋回にならない az=' + h.ofType('cmd')[0].az
  );
});

test('設定が終わった瞬間に走り出さない', function () {
  // 最後の手順が「右に倒したまま」なので、終わった瞬間の
  // スティックは必ず倒れている。ボタンに触れていても
  // 押し直すまで走ってはいけない。
  const h = createHarness();

  h.attach();

  runLearn(h, [0.0, -0.9], [0.9, 0.0], [1]);

  h.clear();

  // 倒したまま・押したままでフレームを進める
  h.setGamepads([gamepadOf([0.9, 0.0], [1], { timestamp: 9 })]);
  h.frame();
  h.frame();
  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0, '設定直後に走り出した');
    assert.equal(command.az, 0, '設定直後に走り出した');
  });

  // 離して押し直せば走れる
  h.setGamepads([gamepadOf([0.9, 0.0], [0], { timestamp: 10 })]);
  h.frame();

  h.clear();
  h.setGamepads([gamepadOf([0.9, 0.0], [1], { timestamp: 11 })]);
  h.frame();
  h.tickSend();

  assert.ok(
    Math.abs(h.ofType('cmd')[0].az) > 0.5 ||
      Math.abs(h.ofType('cmd')[0].lx) > 0.5,
    '押し直しても走れない'
  );
});

test('倒したまま設定を始めても、中立を採らない', function () {
  // ここを間違えると前後が反転した設定が保存され、
  // 「前に倒したら後退する」ことになる。
  const h = createHarness();

  h.attach();

  // 前に倒したままシートを開く
  h.setGamepads([gamepadOf([0.0, -1.0], [0])]);
  h.frame();

  h.element('padSetup').fire('click');

  hold(h, [0.0, -1.0], [0], 1);

  // まだ (1/3) のまま。倒れていることを伝える
  assert.ok(
    h.element('sheetTitle').textContent.indexOf('1/3') >= 0,
    '倒れたまま次へ進んだ: ' + h.element('sheetTitle').textContent
  );

  assert.ok(
    h.element('sheetBody').textContent.indexOf('まだ倒れています') >= 0,
    h.element('sheetBody').textContent
  );

  // 中立に戻せば進む
  hold(h, [0.0, 0.0], [0], 2);

  assert.ok(
    h.element('sheetTitle').textContent.indexOf('2/3') >= 0,
    '中立に戻しても進まない: ' + h.element('sheetTitle').textContent
  );
});

test('倒したまま始めて最後まで進めても、向きは反転しない', function () {
  const h = createHarness({ search: '?debug=1' });

  h.attach();

  // 前に倒したまま開始 → 中立へ戻す → 指示どおり進める
  h.setGamepads([gamepadOf([0.0, -1.0], [0])]);
  h.frame();

  h.element('padSetup').fire('click');

  hold(h, [0.0, -1.0], [0], 1);   // 倒れたまま（進まない）
  hold(h, [0.0, 0.0], [0], 2);    // (1/3) 中立に戻す
  hold(h, [0.0, -0.9], [0], 3);   // (2/3) 前 = axes[1] が負
  hold(h, [0.9, 0.0], [0], 4);    // (3/3) 右 = axes[0] が正

  // 覚えた結果は標準マッピングと同じになるはず
  assert.ok(
    h.element('padText').textContent.indexOf('lin:1-') >= 0,
    '前後の向きが反転している: ' + h.element('padText').textContent
  );

  // 実際に前へ倒して前進すること
  h.setGamepads([gamepadOf([0.0, -1.0], [1], { timestamp: 5 })]);
  h.frame();

  h.clear();
  h.tickSend();

  assert.ok(
    h.ofType('cmd')[0].lx > 0.99,
    '前に倒して前進しない lx=' + h.ofType('cmd')[0].lx
  );
});

// ============================================================
// 生存の合図（timestamp）
// ============================================================

test('timestampが進む端末では早く切れる', function () {
  const h = createHarness();

  h.attach();

  // 値は同じまま timestamp だけ進む（受信が続いている合図）
  for (let step = 0; step < 5; step += 1) {
    h.advance(100);
    h.setGamepads([forwardHeld(10 + step)]);
    h.frame();
  }

  h.tickSend();
  assert.ok(h.ofType('cmd')[0].lx > 0.99, 'まず走っていること');

  // timestamp も止まった = 受信が途切れた
  h.clear();
  h.advance(STALE_LIVE_MS + 200);
  h.frame();

  assert.equal(h.ofType('stop').length, 1, '早く切れていない');
});

test('timestampが進まない端末では値の変化で待つ', function () {
  const h = createHarness();

  h.attach();

  // 値が変わるときだけ timestamp も動く端末（iOS Safari）
  h.setGamepads([gamepadOf([0.0, -1.0], [1], { timestamp: 1 })]);
  h.frame();
  h.setGamepads([gamepadOf([0.0, -0.99], [1], { timestamp: 2 })]);
  h.frame();

  h.tickSend();
  assert.ok(h.ofType('cmd')[0].lx > 0.9, 'まず走っていること');

  // 短い方の時間では切らない（誤停止させない）
  h.clear();
  h.advance(STALE_LIVE_MS + 200);
  h.frame();

  assert.equal(h.ofType('stop').length, 0, '早すぎる停止');

  // 長い方で切る
  h.advance(STALE_MS);
  h.frame();

  assert.equal(h.ofType('stop').length, 1);
});

// ============================================================
// 壊れた環境でも落ちない
// ============================================================

test('getGamepads が例外を投げてもタッチは生きている', function () {
  const h = createHarness();
  const pad = h.element('pad');

  h.failGamepads(new Error('SecurityError'));
  h.frame();
  h.frame();

  pad.fire('pointerdown', {
    isPrimary: true,
    pointerId: 1,
    clientX: 150,
    clientY: 290,
    preventDefault: function () {}
  });

  h.clear();
  h.tickSend();

  assert.ok(h.ofType('cmd')[0].lx < -0.5, 'タッチで走れること');
});

test('Gamepad API が使えないときは、その旨を画面に出す', function () {
  const h = createHarness();

  h.failGamepads(new Error('SecurityError'));
  h.frame();

  const text = h.element('padText').textContent;

  assert.ok(
    text.indexOf('使えません') >= 0,
    `案内が出ていない: ${text}`
  );

  // https で開いているのだから、別のURLを案内する意味はない
  assert.equal(text.indexOf('https://'), -1, text);
});

test('http で開いて見つからないときだけ、予備のURLを案内する', function () {
  const h = createHarness({
    protocol: 'http:',
    host: '192.168.0.5:8000'
  });

  // すぐには出さない（証明書の警告を踏ませる手間があるため）
  h.tickSlow();

  assert.equal(
    h.element('padText').textContent.indexOf('https://'),
    -1,
    '早すぎる案内'
  );

  h.advance(FALLBACK_HINT_MS + 1000);
  h.tickSlow();

  const text = h.element('padText').textContent;

  assert.ok(
    text.indexOf('https://192.168.0.5:8443/controller/') >= 0,
    `予備のURLが出ていない: ${text}`
  );
});

test('?debug を付けると軸とボタンの生の値を出す', function () {
  const h = createHarness({ search: '?debug=1' });

  h.attach();
  h.setGamepads([gamepadOf([0.25, -0.50], [1, 0])]);
  h.frame();

  const text = h.element('padText').textContent;

  assert.ok(text.indexOf('0.25') >= 0, text);
  assert.ok(text.indexOf('-0.50') >= 0, text);
  assert.ok(text.indexOf('buttons[0]') >= 0, text);
});

test('別のコントローラで覚えた割り当ては使わない', function () {
  // 左のJoy-Conで覚えた設定が残っている状態で、
  // 右のJoy-Conを繋いだ場合。左右では軸の番号も向きも違うので、
  // そのまま使うと「前に倒したら後退する」ことがある。
  const saved = {
    linearAxis: 0,
    linearSign: 1,
    angularAxis: 1,
    angularSign: -1,
    id: 'Joy-Con (L)'
  };

  const h = createHarness({
    search: '?debug=1',
    storage: {
      'trolley.gamepad.mapping.v1': JSON.stringify(saved)
    }
  });

  // まず左のJoy-Conなら、覚えた設定が使われる
  h.setGamepads([gamepadOf([0.0, 0.0], [0], { id: 'Joy-Con (L)' })]);
  h.frame();

  assert.ok(
    h.element('padText').textContent.indexOf('map=学習') >= 0,
    h.element('padText').textContent
  );

  // 右のJoy-Conに差し替えると捨てられる
  h.setGamepads([
    gamepadOf([0.0, 0.0], [0], { id: 'Joy-Con (R)', index: 1 })
  ]);
  h.frame();

  assert.ok(
    h.element('padText').textContent.indexOf('map=既定') >= 0,
    h.element('padText').textContent
  );
});

test('識別子の無い古い保存値はそのまま使う', function () {
  const saved = {
    linearAxis: 0,
    linearSign: 1,
    angularAxis: 1,
    angularSign: -1
  };

  const h = createHarness({
    search: '?debug=1',
    storage: {
      'trolley.gamepad.mapping.v1': JSON.stringify(saved)
    }
  });

  h.setGamepads([gamepadOf([0.0, 0.0], [0])]);
  h.frame();

  assert.ok(
    h.element('padText').textContent.indexOf('map=学習') >= 0,
    h.element('padText').textContent
  );
});

test('使っていない軸が動いていたら、設定をやり直すよう促す', function () {
  const h = createHarness();

  h.attach();

  // 右のJoy-Conの再現。スティックは axes[2]/[3] に出るので、
  // 既定の割り当て（axes[0]/[1]）では無反応になる。
  h.setGamepads([gamepadOf([0.0, 0.0, 0.0, -0.9], [1])]);
  h.frame();
  h.tickSend();

  const text = h.element('padText').textContent;

  assert.ok(text.indexOf('スティック設定') >= 0, text);

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0);
    assert.equal(command.az, 0);
  });
});

// ============================================================
// スティックがボタンとして見える端末
// ------------------------------------------------------------
// Joy-Con を Switch 以外につなぐと簡易HIDモードで動き、
// スティックは8方向のハットスイッチとして報告される。
// ブラウザからはボタンにしか見えず、axes は 0 のまま動かない。
// ============================================================

// app.js の定数と合わせる
const BUTTON_FLOOR = 0.35;
const BUTTON_RAMP_MS = 800;
const DIGITAL_MS = 3000;

// 軸が死んでいる端末。値は動かない。
const DEAD_AXES = [0.0, 0.0, 0.0, 0.0];

// ハットスイッチが割り当てられたボタン番号（Chrome for Android の例）
const UP = 12;
const DOWN = 13;
const LEFT = 14;
const RIGHT = 15;

// デッドマンに使うボタン（SR など）
const DEADMAN = 5;

/** 番号の配列から、16個ぶんのボタン配列を作る。 */
function pressed(numbers) {
  const values = new Array(16).fill(0);

  numbers.forEach(function (number) { values[number] = 1; });

  return values;
}

/** 軸が死んでいるコントローラを1台見せる。 */
function showDigital(h, numbers, stamp) {
  h.setGamepads([
    gamepadOf(DEAD_AXES, pressed(numbers), { timestamp: stamp })
  ]);
}

/**
 * ボタンとして見えるスティックの設定を1周させる。
 *
 * 軸で読めないと分かった時点で手順が5歩に増える
 * （符号を反転できないので、4方向ぶん番号が要る）。
 */
function runButtonLearn(h) {
  h.element('padSetup').fire('click');

  hold(h, DEAD_AXES, pressed([]), 1);       // (1/3) 中立
  hold(h, DEAD_AXES, pressed([UP]), 2);     // (2/5) 前
  hold(h, DEAD_AXES, pressed([DOWN]), 3);   // (3/5) 後
  hold(h, DEAD_AXES, pressed([RIGHT]), 4);  // (4/5) 右
  hold(h, DEAD_AXES, pressed([LEFT]), 5);   // (5/5) 左

  // 設定を抜けた時点で押していたボタンは無視されるので、離す
  showDigital(h, [], 90);
  h.frame();
  h.clear();
}

test('ボタンとして見えるスティックを覚えて走れる', function () {
  const h = createHarness({ search: '?debug=1' });

  h.attach();
  runButtonLearn(h);

  assert.ok(
    h.element('padText').textContent.indexOf('map=学習(btn') >= 0,
    'ボタン割り当てになっていない: ' + h.element('padText').textContent
  );

  // デッドマンを握って前へ倒す
  showDigital(h, [DEADMAN, UP], 91);
  h.frame();
  h.tickSend();

  const forward = h.ofType('cmd')[0];

  assert.ok(forward.lx > 0, `前進しない lx=${forward.lx}`);
  assert.equal(forward.az, 0);

  // 右へ倒すと右旋回（angular.z が負）
  h.clear();
  showDigital(h, [DEADMAN, RIGHT], 92);
  h.frame();
  h.tickSend();

  const turn = h.ofType('cmd')[0];

  assert.ok(turn.az < 0, `右旋回にならない az=${turn.az}`);
  assert.equal(turn.lx, 0);
});

test('方向のボタンだけでは走らない', function () {
  // ここが崩れると、スティックを倒しただけで走り出す。
  // 「押している間だけ走る」がいちばん大事な性質なので、
  // 方向のボタンはデッドマンから外してある。
  const h = createHarness();

  h.attach();
  runButtonLearn(h);

  showDigital(h, [UP], 91);
  h.frame();
  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0, '倒しただけで走った');
    assert.equal(command.az, 0, '倒しただけで走った');
  });
});

test('ボタンを離せば止まる', function () {
  const h = createHarness();

  h.attach();
  runButtonLearn(h);

  showDigital(h, [DEADMAN, UP], 91);
  h.frame();
  h.tickSend();
  h.clear();

  // 倒したままデッドマンだけ離す
  showDigital(h, [UP], 92);
  h.frame();

  assert.equal(h.ofType('stop').length, 1, '停止が送られること');

  h.tickSend();
  assert.equal(h.ofType('cmd')[0].lx, 0);
});

test('押し始めは遅く、押し続けると全速になる', function () {
  // ボタンには倒し量が無いので、押した瞬間に全速で走ってしまう。
  // 荷物を載せた台車が飛び出さないよう、出だしを抑える。
  const h = createHarness();

  h.attach();
  runButtonLearn(h);

  showDigital(h, [DEADMAN, UP], 91);
  h.frame();
  h.tickSend();

  const first = h.ofType('cmd')[0];

  assert.ok(
    Math.abs(first.lx - BUTTON_FLOOR) < 1e-6,
    `出だしが速すぎる lx=${first.lx}`
  );

  // 押し続ける
  h.advance(BUTTON_RAMP_MS);
  h.clear();
  showDigital(h, [DEADMAN, UP], 92);
  h.frame();
  h.tickSend();

  assert.equal(h.ofType('cmd')[0].lx, 1.0, '全速まで伸びない');
});

test('向きを変えたら出だしの速さからやり直す', function () {
  // 前進で全速まで伸びたあと、そのまま全速で首を振らせない
  const h = createHarness();

  h.attach();
  runButtonLearn(h);

  showDigital(h, [DEADMAN, UP], 91);
  h.frame();
  h.advance(BUTTON_RAMP_MS);
  showDigital(h, [DEADMAN, UP], 92);
  h.frame();
  h.tickSend();

  assert.equal(h.ofType('cmd')[0].lx, 1.0);

  h.clear();
  showDigital(h, [DEADMAN, RIGHT], 93);
  h.frame();
  h.tickSend();

  assert.ok(
    Math.abs(h.ofType('cmd')[0].az + BUTTON_FLOOR) < 1e-6,
    '旋回が出だしから始まらない az=' + h.ofType('cmd')[0].az
  );
});

test('離して押し直せば、また出だしの速さに戻る', function () {
  const h = createHarness();

  h.attach();
  runButtonLearn(h);

  showDigital(h, [DEADMAN, UP], 91);
  h.frame();
  h.advance(BUTTON_RAMP_MS);
  showDigital(h, [DEADMAN, UP], 92);
  h.frame();
  h.tickSend();

  assert.equal(h.ofType('cmd')[0].lx, 1.0);

  // 離す
  showDigital(h, [], 93);
  h.frame();

  h.clear();
  showDigital(h, [DEADMAN, UP], 94);
  h.frame();
  h.tickSend();

  assert.ok(
    Math.abs(h.ofType('cmd')[0].lx - BUTTON_FLOOR) < 1e-6,
    '押し直しても全速のまま lx=' + h.ofType('cmd')[0].lx
  );
});

test('スティックがボタンとして見えていたら、設定するよう促す', function () {
  // 「ボタンには反応するのに、倒しても何も起きない」を
  // そのまま出す。原因が分からないと現場で詰む。
  const h = createHarness();

  h.attach();

  let stamp = 20;
  let round;

  for (round = 0; round < 3; round += 1) {
    showDigital(h, [DEADMAN], stamp);
    h.frame();
    h.advance(Math.ceil(DIGITAL_MS / 4));

    showDigital(h, [], stamp + 1);
    h.frame();
    h.advance(Math.ceil(DIGITAL_MS / 4));

    stamp += 2;
  }

  h.tickSlow();

  assert.ok(
    h.element('padText').textContent.indexOf('ボタンとして見えています') >= 0,
    '案内が出ない: ' + h.element('padText').textContent
  );
});

test('軸が動く端末では、その案内を出さない', function () {
  const h = createHarness();

  h.attach();

  let stamp = 20;
  let round;

  for (round = 0; round < 3; round += 1) {
    // 軸がちゃんと動いている
    h.setGamepads([
      gamepadOf([0.0, -0.9], pressed([DEADMAN]), { timestamp: stamp })
    ]);
    h.frame();
    h.advance(Math.ceil(DIGITAL_MS / 4));

    h.setGamepads([
      gamepadOf([0.0, 0.0], pressed([]), { timestamp: stamp + 1 })
    ]);
    h.frame();
    h.advance(Math.ceil(DIGITAL_MS / 4));

    stamp += 2;
  }

  h.tickSlow();

  assert.equal(
    h.element('padText').textContent.indexOf('ボタンとして見えています'),
    -1,
    '軸が動いているのに案内が出た: ' + h.element('padText').textContent
  );
});

test('ボタン割り当ての設定が終わった瞬間に走り出さない', function () {
  // 最後の手順が「左に倒したまま」なので、終わった瞬間は倒れている
  const h = createHarness();

  h.attach();

  h.element('padSetup').fire('click');

  hold(h, DEAD_AXES, pressed([DEADMAN]), 1);
  hold(h, DEAD_AXES, pressed([DEADMAN, UP]), 2);
  hold(h, DEAD_AXES, pressed([DEADMAN, DOWN]), 3);
  hold(h, DEAD_AXES, pressed([DEADMAN, RIGHT]), 4);
  hold(h, DEAD_AXES, pressed([DEADMAN, LEFT]), 5);

  h.clear();

  // 倒したまま・握ったままフレームを進める
  showDigital(h, [DEADMAN, LEFT], 91);
  h.frame();
  h.frame();
  h.tickSend();

  h.ofType('cmd').forEach(function (command) {
    assert.equal(command.lx, 0, '設定直後に走り出した');
    assert.equal(command.az, 0, '設定直後に走り出した');
  });

  // 離して握り直せば走れる
  showDigital(h, [], 92);
  h.frame();

  h.clear();
  showDigital(h, [DEADMAN, LEFT], 93);
  h.frame();
  h.tickSend();

  assert.ok(
    h.ofType('cmd')[0].az > 0,
    '押し直しても左旋回にならない az=' + h.ofType('cmd')[0].az
  );
});

test('?debug に、固まり判定がどちらで効くかを出す', function () {
  // live=0 の端末では、倒し続けると8秒で一度止まる。
  // 現場でそれが起きるかを、走らせる前に見分けられるようにする。
  const h = createHarness({ search: '?debug=1' });

  h.attach();

  showDigital(h, [DEADMAN], 30);
  h.frame();

  assert.ok(
    /live=[01] quiet=[0-9.]+s/.test(h.element('padText').textContent),
    '固まり判定の表示が無い: ' + h.element('padText').textContent
  );

  // 値は同じまま timestamp だけ進む端末なら live=1 になる
  h.advance(100);
  showDigital(h, [DEADMAN], 31);
  h.frame();

  assert.ok(
    h.element('padText').textContent.indexOf('live=1') >= 0,
    'timestamp が進んでも live=1 にならない: ' +
      h.element('padText').textContent
  );
});

test('軸で読める端末では、これまでどおり3歩で終わる', function () {
  // ボタンの手順を足したことで、軸の手順が壊れていないこと。
  // 設定中にデッドマンを押し直しても、ボタン割り当てにしない。
  const h = createHarness({ search: '?debug=1' });

  h.attach();

  h.element('padSetup').fire('click');

  hold(h, [0.0, 0.0], [0], 1);
  hold(h, [0.9, 0.0], [1], 2);
  hold(h, [0.0, 0.9], [0], 3);

  const label = h.element('padText').textContent;

  assert.ok(label.indexOf('map=学習(lin:0+') >= 0, '軸で覚えていない: ' + label);
  assert.equal(label.indexOf('btn'), -1, 'ボタン割り当てになった: ' + label);
});

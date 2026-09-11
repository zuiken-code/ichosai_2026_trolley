/* ============================================================
   web/gamepad.js の単体テスト
   ------------------------------------------------------------
   ブラウザを立ち上げずに、軸・ボタンの変換だけを確かめる。
   走行に直結する部分（デッドマン・不感帯・前後旋回の排他）は
   実機で試す前にここで潰しておく。

       node ros2_ws/src/trolley_api/test/test_gamepad.js

   他のテストは pytest（ament）で動くが、これはブラウザ側の
   コードなので Node.js で動かす。colcon test には含まれない。
   ============================================================ */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const gamepad = require('../web/gamepad.js');

// ============================================================
// Helpers
// ============================================================

/** ボタンを GamepadButton 相当のオブジェクトにする。 */
function buttons(values) {
  return values.map(function (value) {
    return { pressed: value >= 0.5, touched: value > 0, value: value };
  });
}

/** テスト用の Gamepad を作る。 */
function makePad(axes, buttonValues) {
  return {
    axes: axes,
    buttons: buttons(buttonValues || []),
    mapping: 'standard',
    connected: true,
    timestamp: 0
  };
}

/** 標準マッピングで、ボタンを1つ押しながらスティックを倒した状態。 */
function tilted(x, y) {
  return makePad([x, y], [1]);
}

// ============================================================
// 軸の読み出し
// ============================================================

test('軸は符号を掛けて読む', function () {
  assert.equal(gamepad.readAxis([0.5, -0.5], 0, 1), 0.5);
  assert.equal(gamepad.readAxis([0.5, -0.5], 0, -1), -0.5);
  assert.equal(gamepad.readAxis([0.5, -0.5], 1, -1), 0.5);
});

test('軸が足りない端末でも0を返す', function () {
  assert.equal(gamepad.readAxis([0.5], 3, 1), 0.0);
  assert.equal(gamepad.readAxis(null, 0, 1), 0.0);
  assert.equal(gamepad.readAxis([], 0, 1), 0.0);
});

test('壊れた値は0にする', function () {
  assert.equal(gamepad.readAxis([NaN], 0, 1), 0.0);
  assert.equal(gamepad.readAxis(['abc'], 0, 1), 0.0);
  assert.equal(gamepad.readAxis([Infinity], 0, 1), 0.0);
});

test('範囲外の軸値は -1.0〜1.0 に丸める', function () {
  assert.equal(gamepad.readAxis([3.0], 0, 1), 1.0);
  assert.equal(gamepad.readAxis([-3.0], 0, 1), -1.0);
});

// ============================================================
// ボタンの読み出し
// ============================================================

test('GamepadButton でも素の数値でも読める', function () {
  assert.equal(gamepad.readButton(buttons([1]), 0), 1.0);
  assert.equal(gamepad.readButton([0.75], 0), 0.75);
  assert.equal(gamepad.readButton([{ pressed: true }], 0), 1.0);
  assert.equal(gamepad.readButton([{ pressed: false }], 0), 0.0);
});

test('無いボタンは押されていない扱い', function () {
  assert.equal(gamepad.readButton(buttons([1]), 5), 0.0);
  assert.equal(gamepad.readButton(null, 0), 0.0);
});

test('押しているボタンの番号を列挙する', function () {
  const pad = makePad([0, 0], [0, 1, 0, 0.8]);

  assert.deepEqual(gamepad.pressedButtons(pad), [1, 3]);
});

// ============================================================
// デッドマン
// ============================================================

test('既定ではどのボタンでもデッドマンになる', function () {
  assert.equal(gamepad.isDeadmanHeld(makePad([0, 0], [0, 0, 1]), null), true);
  assert.equal(gamepad.isDeadmanHeld(makePad([0, 0], [0, 0, 0]), null), false);
});

test('ボタンを指定するとそれだけを見る', function () {
  const pad = makePad([0, 0], [0, 1, 0]);

  assert.equal(gamepad.isDeadmanHeld(pad, [1]), true);
  assert.equal(gamepad.isDeadmanHeld(pad, [0, 2]), false);
});

test('アナログトリガーは半分以上でデッドマンとみなす', function () {
  assert.equal(gamepad.isDeadmanHeld(makePad([0, 0], [0.4]), null), false);
  assert.equal(gamepad.isDeadmanHeld(makePad([0, 0], [0.6]), null), true);
});

test('ボタンが無い入力でも落ちない', function () {
  assert.equal(gamepad.isDeadmanHeld(makePad([0, 0], []), null), false);
  assert.equal(gamepad.isDeadmanHeld(null, null), false);
});

test('pressed が立っていれば value が0でも押下とみなす', function () {
  const pad = makePad([0, 0], []);

  pad.buttons = [{ pressed: true, value: 0 }];

  assert.equal(gamepad.readButton(pad.buttons, 0), 1.0);
  assert.equal(gamepad.isDeadmanHeld(pad, null, null), true);
});

// ============================================================
// 押しっぱなしで始まったボタンを外す
// ============================================================

test('最初から押されているボタンはデッドマンにしない', function () {
  // 標準マッピングでない端末では、軸がボタンとして 1.0 のまま
  // 見えることがある。これをデッドマンに使うと止まらなくなる。
  const pad = makePad([0.0, -1.0], [1, 0]);
  const blocked = gamepad.pressedButtons(pad);

  assert.deepEqual(blocked, [0]);

  const result = gamepad.readInput(pad, null, { blockedButtons: blocked });

  assert.equal(result.deadman, false);
  assert.equal(result.lx, 0.0);
});

test('別のボタンを押せば走れる', function () {
  const pad = makePad([0.0, -1.0], [1, 1]);

  const result = gamepad.readInput(pad, null, { blockedButtons: [0] });

  assert.equal(result.deadman, true);
  assert.ok(result.lx > 0.99);
});

test('一度離したボタンは以後ふつうに使える', function () {
  let blocked = [0];

  // 離した
  blocked = gamepad.updateBlocked(makePad([0, 0], [0]), blocked);
  assert.deepEqual(blocked, []);

  // 押し直した
  const pad = makePad([0.0, -1.0], [1]);
  const result = gamepad.readInput(pad, null, { blockedButtons: blocked });

  assert.equal(result.deadman, true);
});

test('押されたままのボタンは外さない', function () {
  const blocked = gamepad.updateBlocked(makePad([0, 0], [1, 1]), [0, 1]);

  assert.deepEqual(blocked, [0, 1]);
});

// ============================================================
// 軸とボタンの指紋（無反応の検出）
// ============================================================

test('同じ状態なら指紋も同じ', function () {
  const a = gamepad.valueSignature(makePad([0.1, 0.2], [0, 1]));
  const b = gamepad.valueSignature(makePad([0.1, 0.2], [0, 1]));

  assert.equal(a, b);
});

test('軸かボタンが変われば指紋も変わる', function () {
  const signature = gamepad.valueSignature(makePad([0.1, 0.2], [0, 1]));

  assert.notEqual(
    signature,
    gamepad.valueSignature(makePad([0.1, 0.3], [0, 1]))
  );

  assert.notEqual(
    signature,
    gamepad.valueSignature(makePad([0.1, 0.2], [1, 1]))
  );
});

test('timestampは指紋に混ぜない', function () {
  // 端末によって単位も更新条件も違い、「受信が続いている間だけ
  // 進む」端末ではそれ自体が生存の合図になるので、
  // 値の変化とは分けて扱う（app.js 側で見る）。
  const base = makePad([0.1, 0.2], [0, 1]);
  const moved = makePad([0.1, 0.2], [0, 1]);

  moved.timestamp = 999;

  assert.equal(
    gamepad.valueSignature(base),
    gamepad.valueSignature(moved)
  );
});

test('コントローラが無ければ指紋は空', function () {
  assert.equal(gamepad.valueSignature(null), '');
});

// ============================================================
// 不感帯
// ============================================================

test('不感帯の中はゼロにする', function () {
  const result = gamepad.applyDeadzone(0.1, 0.1, 0.18);

  assert.equal(result.x, 0.0);
  assert.equal(result.y, 0.0);
});

test('不感帯を抜けた直後は0から始まる', function () {
  const result = gamepad.applyDeadzone(0.0, 0.19, 0.18);

  assert.ok(result.y > 0.0);
  assert.ok(result.y < 0.05, '抜けた直後に速度が飛ばないこと');
});

test('いっぱいに倒すと1.0になる', function () {
  const result = gamepad.applyDeadzone(0.0, 1.0, 0.18);

  assert.ok(Math.abs(result.y - 1.0) < 1e-9);
});

test('斜めに倒しても合成値は1.0を超えない', function () {
  const result = gamepad.applyDeadzone(1.0, 1.0, 0.18);
  const magnitude = Math.sqrt(
    (result.x * result.x) + (result.y * result.y)
  );

  assert.ok(magnitude <= 1.0 + 1e-9, `magnitude=${magnitude}`);
});

// ============================================================
// 前後と旋回の排他
// ============================================================

test('大きく倒した軸だけを採用する', function () {
  assert.deepEqual(
    gamepad.toCommand(0.2, 0.9),
    { lx: 0.9, az: 0.0, axis: 'linear' }
  );

  assert.deepEqual(
    gamepad.toCommand(0.9, 0.2),
    { lx: 0.0, az: 0.9, axis: 'angular' }
  );
});

test('同じ量なら前後を優先する（タッチ操作と同じ）', function () {
  assert.equal(gamepad.toCommand(0.5, 0.5).axis, 'linear');
});

test('中立では軸を選ばない', function () {
  assert.deepEqual(
    gamepad.toCommand(0.0, 0.0),
    { lx: 0.0, az: 0.0, axis: null }
  );
});

// ============================================================
// 全体（Gamepad -> 送信する値）
// ============================================================

test('標準マッピングで前に倒すと前進する', function () {
  // axes[1] は下が +1 なので、前進は -1
  const result = gamepad.readInput(tilted(0.0, -1.0), null, null);

  assert.ok(result.lx > 0.99, `lx=${result.lx}`);
  assert.equal(result.az, 0.0);
  assert.equal(result.axis, 'linear');
  assert.equal(result.deadman, true);
});

test('標準マッピングで右に倒すと右旋回する', function () {
  // 右旋回は angular.z が負
  const result = gamepad.readInput(tilted(1.0, 0.0), null, null);

  assert.ok(result.az < -0.99, `az=${result.az}`);
  assert.equal(result.lx, 0.0);
  assert.equal(result.axis, 'angular');
});

test('ボタンを離していれば倒していても停止する', function () {
  const pad = makePad([0.0, -1.0], [0]);
  const result = gamepad.readInput(pad, null, null);

  assert.equal(result.lx, 0.0);
  assert.equal(result.az, 0.0);
  assert.equal(result.axis, null);
  assert.equal(result.deadman, false);

  // 倒していること自体は画面に出したいので残す
  assert.equal(result.tilted, true);
});

test('スティックのドリフトでは走らない', function () {
  const result = gamepad.readInput(tilted(0.05, -0.08), null, null);

  assert.equal(result.lx, 0.0);
  assert.equal(result.az, 0.0);
});

test('コントローラが無ければ停止扱い', function () {
  const result = gamepad.readInput(null, null, null);

  assert.equal(result.lx, 0.0);
  assert.equal(result.az, 0.0);
  assert.equal(result.deadman, false);
});

test('横持ちJoy-Conの割り当てでも正しく走る', function () {
  // 横持ちすると軸が90度回る想定。
  // 「前に倒すと axes[0] が +1」「右に倒すと axes[1] が +1」の端末を
  // 学習させると、この割り当てになる。
  const mapping = {
    linearAxis: 0,
    linearSign: 1,
    angularAxis: 1,
    angularSign: -1
  };

  const forward = gamepad.readInput(tilted(1.0, 0.0), mapping, null);

  assert.ok(forward.lx > 0.99, `前進しない lx=${forward.lx}`);
  assert.equal(forward.axis, 'linear');

  const turn = gamepad.readInput(tilted(0.0, 1.0), mapping, null);

  assert.equal(turn.axis, 'angular');
  assert.ok(turn.az < -0.99, `右旋回にならない az=${turn.az}`);
});

test('学習した割り当てを readInput にそのまま渡せる', function () {
  // 横持ちJoy-Conの学習手順をそのまま再現する。
  //   1. 中立で axes を読む
  //   2. 「前に倒してください」で読む
  //   3. 「右に倒してください」で読む
  const rest = [0.0, 0.0];

  const linear = gamepad.learnAxis(rest, [0.9, 0.0], 0.5, 1);
  const angular = gamepad.learnAxis(rest, [0.0, 0.9], 0.5, -1);

  const mapping = {
    linearAxis: linear.index,
    linearSign: linear.sign,
    angularAxis: angular.index,
    angularSign: angular.sign
  };

  assert.equal(gamepad.isValidMapping(mapping), true);

  // 学習どおりに倒すと、前進と右旋回になる
  assert.ok(gamepad.readInput(tilted(1.0, 0.0), mapping, null).lx > 0.99);
  assert.ok(gamepad.readInput(tilted(0.0, 1.0), mapping, null).az < -0.99);

  // 逆に倒せば後退・左旋回になる
  assert.ok(gamepad.readInput(tilted(-1.0, 0.0), mapping, null).lx < -0.99);
  assert.ok(gamepad.readInput(tilted(0.0, -1.0), mapping, null).az > 0.99);
});

test('標準マッピングは学習結果と一致する', function () {
  // 標準マッピングのスティックを前(axes[1]=-1)・右(axes[0]=+1)へ
  // 倒したときの学習結果が、DEFAULT_MAPPING と同じになること。
  const rest = [0.0, 0.0];

  const linear = gamepad.learnAxis(rest, [0.0, -1.0], 0.5, 1);
  const angular = gamepad.learnAxis(rest, [1.0, 0.0], 0.5, -1);

  assert.equal(linear.index, gamepad.DEFAULT_MAPPING.linearAxis);
  assert.equal(linear.sign, gamepad.DEFAULT_MAPPING.linearSign);
  assert.equal(angular.index, gamepad.DEFAULT_MAPPING.angularAxis);
  assert.equal(angular.sign, gamepad.DEFAULT_MAPPING.angularSign);
});

test('デッドマンのボタンを限定できる', function () {
  const pad = makePad([0.0, -1.0], [0, 1]);

  const allowed = gamepad.readInput(pad, null, { deadmanButtons: [1] });
  const denied = gamepad.readInput(pad, null, { deadmanButtons: [0] });

  assert.ok(allowed.lx > 0.99);
  assert.equal(denied.lx, 0.0);
});

// ============================================================
// 軸の学習
// ============================================================

test('いちばん大きく動いた軸を選ぶ', function () {
  const result = gamepad.learnAxis([0, 0, 0, 0], [0.1, -0.9, 0.6, 0], 0.5, 1);

  assert.equal(result.index, 1);

  // 前へ倒して値が減った軸なので、符号を反転して前進(+)にする
  assert.equal(result.sign, -1);
});

test('前へ倒して値が増えた軸はそのまま使う', function () {
  const result = gamepad.learnAxis([0, 0], [0, 0.9], 0.5, 1);

  assert.equal(result.index, 1);
  assert.equal(result.sign, 1);
});

test('右へ倒したときは旋回の符号（右が負）に合わせる', function () {
  const result = gamepad.learnAxis([0, 0], [0.9, 0], 0.5, -1);

  assert.equal(result.index, 0);
  assert.equal(result.sign, -1);
});

test('中心がずれていても差分で見る', function () {
  const result = gamepad.learnAxis([0.3, 0.0], [-0.7, 0.0], 0.5, 1);

  assert.equal(result.index, 0);
  assert.equal(result.sign, -1);
});

test('動かなければ学習しない', function () {
  assert.equal(gamepad.learnAxis([0, 0], [0.1, -0.2], 0.5, 1), null);
  assert.equal(gamepad.learnAxis(null, [1, 1], 0.5, 1), null);
});

// ============================================================
// 使っていない軸が動いていないか
// ============================================================

test('割り当てに使っていない軸が動いていたら見つける', function () {
  // 右のJoy-Conはスティックが axes[2]/[3] に出る
  const pad = makePad([0.0, 0.0, 0.0, -0.9], [1]);

  assert.equal(gamepad.unusedActiveAxis(pad, null, 0.18), 3);
});

test('使っている軸が動いていても報告しない', function () {
  const pad = makePad([0.0, -0.9], [1]);

  assert.equal(gamepad.unusedActiveAxis(pad, null, 0.18), null);
});

test('どの軸も動いていなければ報告しない', function () {
  const pad = makePad([0.0, 0.0, 0.05, 0.05], [1]);

  assert.equal(gamepad.unusedActiveAxis(pad, null, 0.18), null);
});

test('割り当てを直したあとは報告しなくなる', function () {
  const pad = makePad([0.0, 0.0, 0.0, -0.9], [1]);

  const mapping = {
    linearAxis: 3,
    linearSign: -1,
    angularAxis: 2,
    angularSign: -1
  };

  assert.equal(gamepad.unusedActiveAxis(pad, mapping, 0.18), null);
});

// ============================================================
// 保存した割り当ての検査
// ============================================================

test('壊れた割り当ては使わない', function () {
  assert.equal(gamepad.isValidMapping(null), false);
  assert.equal(gamepad.isValidMapping({}), false);
  assert.equal(
    gamepad.isValidMapping({
      linearAxis: 0,
      linearSign: 1,
      angularAxis: 0,
      angularSign: 1
    }),
    false,
    '前後と旋回に同じ軸は割り当てられない'
  );
  assert.equal(
    gamepad.isValidMapping({
      linearAxis: 1,
      linearSign: 0,
      angularAxis: 0,
      angularSign: 1
    }),
    false,
    '符号は +1 か -1 だけ'
  );
  assert.equal(
    gamepad.isValidMapping({
      linearAxis: -1,
      linearSign: 1,
      angularAxis: 0,
      angularSign: 1
    }),
    false
  );
});

test('正しい割り当ては受け入れる', function () {
  assert.equal(gamepad.isValidMapping(gamepad.DEFAULT_MAPPING), true);
  assert.equal(
    gamepad.isValidMapping({
      linearAxis: 0,
      linearSign: -1,
      angularAxis: 1,
      angularSign: 1
    }),
    true
  );
});

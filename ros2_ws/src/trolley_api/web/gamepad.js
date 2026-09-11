/* ============================================================
   Joy-Con（ゲームパッド）入力の変換
   ------------------------------------------------------------
   Gamepad API から読んだ生の値を、タッチ操作と同じ (lx, az) へ
   変換する部分だけを切り出したもの。

   DOM にも WebSocket にも触れないので、Node.js でそのまま
   単体テストできる。

       node ros2_ws/src/trolley_api/test/test_gamepad.js

   軸の向きについて:
     このファイルの中では、軸の値を **指令の向き** で扱う。

         y（linear）:  前進が正
         x（angular）: 左旋回が正（ROSの angular.z と同じ）

     Gamepad API の標準マッピングでは、左スティックは
     axes[0] が右で +1、axes[1] が下で +1 になる。
     つまり指令の向きにするには両方とも符号を反転させればよい。

         lx = -axes[1]   （上に倒す = 前進）
         az = -axes[0]   （右に倒す = 右旋回 = angular.z が負）

     これが DEFAULT_MAPPING の符号が両方 -1 になっている理由。

     ただしJoy-Conを横持ちすると、この関係は90度回る。
     左右どちらのJoy-Conかでも符号が反転する。端末・OSによっても
     割り当てが変わるため、向きは mapping で差し替えられるように
     してある（画面から学習させられる。app.js の「スティック設定」）。

   スティックがボタンとして見える端末について:
     Joy-Con を Switch 以外につなぐと「簡易HIDモード」で動く。
     このモードのスティックは 8方向のハットスイッチとして報告され、
     ブラウザからはボタンにしか見えない。axes は 0 のまま動かない。

     アナログの値がそもそも送られてこないので、軸の割り当てを
     いくら変えても直らない。そこで mapping には2種類ある。

         kind 省略 / 'axis'  … 軸で読む（既定）
         kind: 'button'      … 前後左右のボタン番号で読む

     ボタンで読むときは倒し量が無いので、押している時間で
     速さを伸ばす（rampScale）。倒し量の代わりになるものが
     他に無いため。
   ============================================================ */

(function (root) {
  'use strict';

  // ============================================================
  // 既定の割り当て
  // ============================================================

  // 標準マッピング（gamepad.mapping === 'standard'）の左スティック。
  // 符号が両方 -1 なのは、axes を指令の向き（前進が正・左旋回が正）へ
  // 直すため。Joy-Conを横持ちした場合はこの通りにならないので、
  // 画面から学習させて上書きする。
  var DEFAULT_MAPPING = {
    linearAxis: 1,
    linearSign: -1,
    angularAxis: 0,
    angularSign: -1
  };

  // スティックの不感帯。
  //
  // 実機のスティックは中心に戻してもわずかにずれる（ドリフト）。
  // タッチ操作より広めに取らないと、手を離しても微速で動き続ける。
  var DEFAULT_DEADZONE = 0.18;

  // ボタンを「押している」と見なすしきい値。
  // アナログトリガー（ZL / ZR）は 0.0〜1.0 の連続値で返ってくる。
  var BUTTON_THRESHOLD = 0.5;

  // スティックがボタンとして見える端末での、出だしの速さ。
  //
  // ボタンには倒し量が無いので、押した瞬間から全速で走ってしまう。
  // 荷物を載せた台車がいきなり最高速で動き出すのは危ないので、
  // 出だしをここまで抑えて、DEFAULT_RAMP_MS かけて全速まで伸ばす。
  var DEFAULT_BUTTON_FLOOR = 0.35;

  // 出だしから全速までにかける時間 [ms]
  var DEFAULT_RAMP_MS = 800;

  // ============================================================
  // 小物
  // ============================================================

  function clamp(value, limit) {
    if (!isFinite(value)) {
      return 0.0;
    }

    return Math.max(-limit, Math.min(limit, value));
  }

  /**
   * axes[index] を符号込みで読む。
   * 範囲外・数値でない場合は0を返す（端末差で軸の本数が違う）。
   */
  function readAxis(axes, index, sign) {
    if (!axes || index === null || index === undefined) {
      return 0.0;
    }

    var value = axes[index];

    if (typeof value !== 'number' || !isFinite(value)) {
      return 0.0;
    }

    return clamp(value, 1.0) * (sign < 0 ? -1 : 1);
  }

  /**
   * buttons[index] の押し込み量を 0.0〜1.0 で読む。
   *
   * GamepadButton オブジェクトと、素の数値を返す古い実装の
   * どちらでも読めるようにしている。
   *
   * `touched` は見ない。iOS Safari が未対応で undefined になり、
   * 条件の書き方しだいで「常に押していない」にも
   * 「常に押している」にも転ぶため。
   */
  function readButton(buttons, index) {
    if (!buttons) {
      return 0.0;
    }

    var button = buttons[index];

    if (button === null || button === undefined) {
      return 0.0;
    }

    if (typeof button === 'number') {
      return clamp(button, 1.0);
    }

    // pressed を先に見る。デジタルボタンで value が
    // 0 のまま pressed だけ立つ実装があるため。
    if (button.pressed === true) {
      return 1.0;
    }

    if (typeof button.value === 'number' && isFinite(button.value)) {
      return clamp(button.value, 1.0);
    }

    return 0.0;
  }

  /**
   * 押されているボタンの番号を列挙する。
   *
   * どのボタンがデッドマンとして効いているかを画面に出すのに使う。
   * 端末ごとに番号が違うので、現場ではこれを見て確認する。
   */
  function pressedButtons(pad) {
    var result = [];
    var buttons = pad ? pad.buttons : null;
    var index;

    if (!buttons) {
      return result;
    }

    for (index = 0; index < buttons.length; index += 1) {
      if (readButton(buttons, index) >= BUTTON_THRESHOLD) {
        result.push(index);
      }
    }

    return result;
  }

  /**
   * デッドマン（押している間だけ走る）が成立しているか。
   *
   * Args:
   *   pad: Gamepad
   *   allowed: 見るボタン番号の配列。null なら「どれでもよい」
   *   blocked: 無視するボタン番号の配列
   *
   * 既定を「どれでも」にしているのは、Joy-Conの持ち方や端末で
   * ボタン番号が変わるため。番号が違って走れない事故より、
   * 押しやすいボタンで確実に止められることを優先している。
   * （走行にはスティックを倒すことも必要なので、
   *   ボタンに触れただけでは動かない）
   *
   * blocked は「最初から押されっぱなしのボタン」を外すために使う。
   * 標準マッピングでない端末では、軸がボタンとして 1.0 のまま
   * 見えることがある。それをデッドマンに使ってしまうと
   * 「手を離しても走る」状態になり、いちばん避けたい事故になる。
   * 呼び出し側（app.js）が検出時の押下状態を blocked として渡し、
   * 一度離されたら外す。
   */
  function isDeadmanHeld(pad, allowed, blocked) {
    var buttons = pad ? pad.buttons : null;
    var index;
    var number;

    if (!buttons) {
      return false;
    }

    if (!allowed) {
      for (index = 0; index < buttons.length; index += 1) {
        if (isBlocked(blocked, index)) {
          continue;
        }

        if (readButton(buttons, index) >= BUTTON_THRESHOLD) {
          return true;
        }
      }

      return false;
    }

    for (index = 0; index < allowed.length; index += 1) {
      number = allowed[index];

      if (isBlocked(blocked, number)) {
        continue;
      }

      if (readButton(buttons, number) >= BUTTON_THRESHOLD) {
        return true;
      }
    }

    return false;
  }

  /** blocked（配列）に番号が含まれるか。 */
  function isBlocked(blocked, index) {
    var position;

    if (!blocked || !blocked.length) {
      return false;
    }

    for (position = 0; position < blocked.length; position += 1) {
      if (blocked[position] === index) {
        return true;
      }
    }

    return false;
  }

  /** 二つの「無視するボタン」の配列をつなぐ。 */
  function mergeIgnored(first, second) {
    var result = [];
    var index;

    for (index = 0; first && index < first.length; index += 1) {
      result.push(first[index]);
    }

    for (index = 0; second && index < second.length; index += 1) {
      result.push(second[index]);
    }

    return result;
  }

  /**
   * 押しっぱなしで始まったボタンのうち、まだ離されていないものを返す。
   *
   * 検出時に押されていたボタン（previous）を、いま押されていない
   * ものだけ取り除いていく。一度離せば以後は普通に使える。
   */
  function updateBlocked(pad, previous) {
    var remaining = [];
    var buttons = pad ? pad.buttons : null;
    var index;

    if (!previous || !previous.length) {
      return remaining;
    }

    if (!buttons) {
      return previous.slice();
    }

    for (index = 0; index < previous.length; index += 1) {
      if (readButton(buttons, previous[index]) >= BUTTON_THRESHOLD) {
        remaining.push(previous[index]);
      }
    }

    return remaining;
  }

  /**
   * 軸とボタンの「指紋」を作る。前回と同じなら何も動いていない。
   *
   * Bluetoothが黙って切れた場合、ブラウザは最後の状態を
   * 返し続ける（切断イベントも来ないことがある）。
   * 値がまったく変化しない状態が続いたら、生きていないと見なす。
   *
   * timestamp は **混ぜない**。端末によって単位も更新条件も違い、
   * 「受信が続いている間だけ進む」端末ではそれ自体が生存の合図に
   * なるので、値の変化とは分けて扱いたいため（app.js 側で見ている）。
   */
  function valueSignature(pad) {
    var parts;
    var index;

    if (!pad) {
      return '';
    }

    parts = [];

    if (pad.axes) {
      for (index = 0; index < pad.axes.length; index += 1) {
        parts.push(String(pad.axes[index]));
      }
    }

    if (pad.buttons) {
      for (index = 0; index < pad.buttons.length; index += 1) {
        parts.push(String(readButton(pad.buttons, index)));
      }
    }

    return parts.join(',');
  }

  // ============================================================
  // ボタンとして見えるスティック
  // ============================================================

  /**
   * 方向をボタン番号で読む割り当てか。
   *
   * 簡易HIDモードのJoy-Conは、スティックをハットスイッチとして
   * 報告する。ブラウザからはボタンにしか見えないので、
   * 前後左右それぞれのボタン番号を覚えて使う。
   */
  function isButtonMapping(mapping) {
    return !!mapping && mapping.kind === 'button';
  }

  /**
   * 方向に使っているボタン番号を並べる。
   *
   * この番号はデッドマンに使ってはいけない。
   * 「どのボタンでもデッドマン」のままだと、スティックを倒しただけで
   * デッドマンが成立し、握っていないのに走ってしまう。
   */
  function directionButtons(mapping) {
    if (!isButtonMapping(mapping)) {
      return [];
    }

    return [
      mapping.forwardButton,
      mapping.backButton,
      mapping.rightButton,
      mapping.leftButton
    ];
  }

  /** そのボタンを押しているか（無視するボタンなら押していない扱い）。 */
  function pressedFor(buttons, index, blocked) {
    if (isBlocked(blocked, index)) {
      return 0;
    }

    return readButton(buttons, index) >= BUTTON_THRESHOLD ? 1 : 0;
  }

  /**
   * いまどちらへ倒しているかを、ボタンから読む。
   *
   * 返り値は指令の向き（前進が正・左旋回が正）で -1 / 0 / +1。
   * 前と後ろを同時に押していたら 0 にする（打ち消し）。
   * ハットスイッチでは起こらないが、起きたときに走るよりは止める。
   */
  function readDirection(pad, mapping, blocked) {
    var buttons = pad ? pad.buttons : null;

    return {
      x: pressedFor(buttons, mapping.leftButton, blocked) -
        pressedFor(buttons, mapping.rightButton, blocked),
      y: pressedFor(buttons, mapping.forwardButton, blocked) -
        pressedFor(buttons, mapping.backButton, blocked)
    };
  }

  /**
   * 前後と旋回の排他。斜めに倒したときにどちらを採るか。
   *
   * 軸のときは「大きく倒したほう」で決まるが、ボタンには
   * 大きさが無い。斜めのあいだ前後と旋回がちらちら入れ替わると
   * 台車が首を振るので、いま使っている軸をそのまま続ける。
   */
  function pickAxis(x, y, previous) {
    if (x === 0 && y === 0) {
      return null;
    }

    if (x === 0) {
      return 'linear';
    }

    if (y === 0) {
      return 'angular';
    }

    if (previous === 'angular') {
      return 'angular';
    }

    // 同時に倒し始めたときは前後を優先する（軸・タッチと同じ）
    return 'linear';
  }

  /**
   * 押している時間から速さを決める（0.0〜1.0）。
   *
   * 押した瞬間は floor、duration かけて 1.0 まで伸ばす。
   * 向きを変えたら、呼び出し側が時間を測り直すこと。
   */
  function rampScale(elapsed, floor, duration) {
    var start = (typeof floor === 'number' && isFinite(floor))
      ? Math.max(0.0, Math.min(1.0, floor))
      : DEFAULT_BUTTON_FLOOR;

    var span = (typeof duration === 'number' && duration > 0)
      ? duration
      : DEFAULT_RAMP_MS;

    var ratio;

    if (typeof elapsed !== 'number' || !isFinite(elapsed) || elapsed <= 0) {
      return start;
    }

    ratio = elapsed / span;

    if (ratio >= 1.0) {
      return 1.0;
    }

    return start + ((1.0 - start) * ratio);
  }

  /**
   * ボタンで読む割り当てのときの readInput。
   *
   * 速さは伸ばさずに ±1 で返す。押している時間を測っているのは
   * 呼び出し側（app.js）なので、rampScale を掛けるのもそちら。
   */
  function readButtonInput(pad, settings, opts) {
    var blocked = opts.blockedButtons || null;
    var direction = readDirection(pad, settings, blocked);
    var axis = pickAxis(direction.x, direction.y, opts.previousAxis || null);
    var deadman;
    var value;

    // 方向のボタンはデッドマンに使わない。
    // 使ってしまうと、倒しただけで走り出す。
    deadman = isDeadmanHeld(
      pad,
      opts.deadmanButtons || null,
      mergeIgnored(blocked, directionButtons(settings))
    );

    if (!deadman || axis === null) {
      return {
        lx: 0.0,
        az: 0.0,
        axis: null,
        deadman: deadman,
        tilted: axis !== null,
        direction: null
      };
    }

    value = (axis === 'linear') ? direction.y : direction.x;

    return {
      lx: (axis === 'linear') ? value : 0.0,
      az: (axis === 'angular') ? value : 0.0,
      axis: axis,
      deadman: true,
      tilted: true,

      // 加速をやり直す判断に使う。向きが変われば文字列も変わる。
      direction: axis + (value > 0 ? '+' : '-')
    };
  }

  // ============================================================
  // スティック -> (lx, az)
  // ============================================================

  /**
   * 不感帯を抜いたうえで、倒し量を 0.0〜1.0 に伸ばし直す。
   *
   * 単に閾値以下を0にするだけだと、不感帯を抜けた瞬間に
   * 速度が飛ぶ。抜けた分を0から測り直すことで滑らかにする。
   *
   * Returns:
   *   {x, y} 補正後の値
   */
  function applyDeadzone(x, y, deadzone) {
    var magnitude = Math.sqrt((x * x) + (y * y));
    var scale;

    if (magnitude <= deadzone) {
      return { x: 0.0, y: 0.0 };
    }

    if (magnitude > 1.0) {
      // 斜めに倒すと合成値が1を超えるので円周上へ丸める
      x = x / magnitude;
      y = y / magnitude;
      magnitude = 1.0;
    }

    if (deadzone >= 1.0) {
      return { x: 0.0, y: 0.0 };
    }

    scale = ((magnitude - deadzone) / (1.0 - deadzone)) / magnitude;

    return { x: x * scale, y: y * scale };
  }

  /**
   * スティックの倒し量から速度指令を作る。
   *
   * x, y はすでに指令の向き（前進が正・左旋回が正）に
   * 直してあるものを受け取る。
   *
   * 前後と旋回は排他にする（大きく倒した軸だけを採用）。
   * タッチ操作・joy_teleop と同じ挙動。
   *
   * Returns:
   *   {lx, az, axis} axis は 'linear' / 'angular' / null
   */
  function toCommand(x, y) {
    if (x === 0.0 && y === 0.0) {
      return { lx: 0.0, az: 0.0, axis: null };
    }

    if (Math.abs(y) >= Math.abs(x)) {
      return { lx: y, az: 0.0, axis: 'linear' };
    }

    return { lx: 0.0, az: x, axis: 'angular' };
  }

  /**
   * ゲームパッド1台ぶんの状態を、そのまま送れる形に変換する。
   *
   * Args:
   *   pad: Gamepad オブジェクト（null 可）
   *   mapping: 軸の割り当て。省略時は DEFAULT_MAPPING。
   *     kind:'button' ならボタンで方向を読む。
   *   options: {
   *     deadzone, deadmanButtons, blockedButtons,
   *     previousAxis  ボタンで読むときの、いま使っている軸
   *   }
   *
   * Returns:
   *   {
   *     lx, az,          送信する速度指令（-1.0〜1.0）
   *     axis,            採用した軸（画面表示用）
   *     deadman,         デッドマンを押しているか
   *     tilted,          スティックが不感帯の外にあるか
   *     direction        ボタンで読んだ向き（'linear+' など）。
   *                      軸で読んだときは null
   *   }
   */
  function readInput(pad, mapping, options) {
    var settings = mapping || DEFAULT_MAPPING;
    var opts = options || {};

    var deadzone = (typeof opts.deadzone === 'number')
      ? opts.deadzone
      : DEFAULT_DEADZONE;

    var idle = {
      lx: 0.0,
      az: 0.0,
      axis: null,
      deadman: false,
      tilted: false,
      direction: null
    };

    var axes;
    var raw;
    var stick;
    var command;
    var deadman;

    if (!pad) {
      return idle;
    }

    if (isButtonMapping(settings)) {
      return readButtonInput(pad, settings, opts);
    }

    axes = pad.axes;

    // 前後を y、旋回を x として扱う。
    // mapping の符号で、指令の向き（前進が正・左旋回が正）へ直す。
    raw = {
      x: readAxis(axes, settings.angularAxis, settings.angularSign),
      y: readAxis(axes, settings.linearAxis, settings.linearSign)
    };

    stick = applyDeadzone(raw.x, raw.y, deadzone);

    deadman = isDeadmanHeld(
      pad,
      opts.deadmanButtons || null,
      opts.blockedButtons || null
    );

    command = toCommand(stick.x, stick.y);

    return {
      // デッドマンを離していたら、倒していても停止させる
      lx: deadman ? command.lx : 0.0,
      az: deadman ? command.az : 0.0,
      axis: deadman ? command.axis : null,
      deadman: deadman,
      tilted: command.axis !== null,
      direction: null
    };
  }

  // ============================================================
  // 軸の学習
  // ============================================================

  /**
   * 「前に倒してください」に対して、どの軸がどちら向きに
   * 動いたかを見つける。
   *
   * Args:
   *   rest: 中立のときの axes（配列）
   *   moved: 倒したときの axes（配列）
   *   threshold: この量以上動いた軸だけを候補にする
   *   wanted: 指示どおりに倒したときに出したい指令の符号。
   *     前へ倒す  -> +1（前進は lx が正）
   *     右へ倒す  -> -1（右旋回は az が負）
   *
   * Returns:
   *   {index, sign} 見つからなければ null
   *
   * sign は readInput の linearSign / angularSign に
   * そのまま入れられる。
   */
  function learnAxis(rest, moved, threshold, wanted) {
    var limit = (typeof threshold === 'number') ? threshold : 0.5;
    var want = (wanted === -1) ? -1 : 1;
    var best = null;
    var index;
    var delta;
    var size;

    if (!rest || !moved) {
      return null;
    }

    size = Math.min(rest.length, moved.length);

    for (index = 0; index < size; index += 1) {
      if (
        typeof rest[index] !== 'number' ||
        typeof moved[index] !== 'number'
      ) {
        continue;
      }

      delta = moved[index] - rest[index];

      if (Math.abs(delta) < limit) {
        continue;
      }

      if (best === null || Math.abs(delta) > Math.abs(best.delta)) {
        best = { index: index, delta: delta };
      }
    }

    if (best === null) {
      return null;
    }

    // 倒したときに wanted の符号が出るようにする。
    // 例: 前へ倒して軸の値が増えた (delta > 0) なら、
    //     そのまま掛ければ前進（+1）になる。
    return {
      index: best.index,
      sign: best.delta > 0 ? want : -want
    };
  }

  /**
   * 「この向きへ倒してください」に対して、新しく押されたボタンを探す。
   *
   * Args:
   *   rest: 中立のときに押されていたボタン番号の配列。
   *     デッドマンを握ったままでも設定できるよう、そのぶんは差し引く。
   *   pad: Gamepad
   *
   * Returns:
   *   ボタン番号。決められなければ null
   *
   * ちょうど1つだけ増えたときにしか返さない。
   * 斜めに倒すと2つ増えるが、それを覚えると前後と旋回が混ざる。
   */
  function learnButton(rest, pad) {
    var pressed = pressedButtons(pad);
    var added = [];
    var index;

    for (index = 0; index < pressed.length; index += 1) {
      if (!isBlocked(rest, pressed[index])) {
        added.push(pressed[index]);
      }
    }

    return (added.length === 1) ? added[0] : null;
  }

  /**
   * 割り当てに使っていない軸が動いていないかを見る。
   *
   * これは現場でいちばん起きやすい「スティックを倒しても
   * 何も起きない」を切り分けるためのもの。
   *
   * 例: 右のJoy-Conを横持ちすると、スティックは axes[0]/[1] ではなく
   * axes[2]/[3] に出る（左右で公開される軸が違う）。既定の割り当ては
   * axes[0]/[1] なので、右のJoy-Conでは無反応になる。
   * そのとき「別の軸が動いている」と分かれば、
   * スティック設定をやり直せばいいと画面から案内できる。
   *
   * Returns:
   *   動いている未使用の軸の番号。無ければ null
   */
  function unusedActiveAxis(pad, mapping, deadzone) {
    var settings = mapping || DEFAULT_MAPPING;
    var limit = (typeof deadzone === 'number')
      ? deadzone
      : DEFAULT_DEADZONE;

    var axes = pad ? pad.axes : null;
    var index;
    var value;

    if (isButtonMapping(settings)) {
      // ボタンで方向を読む割り当てでは、軸は最初から使っていない
      return null;
    }

    if (!axes) {
      return null;
    }

    for (index = 0; index < axes.length; index += 1) {
      if (
        index === settings.linearAxis ||
        index === settings.angularAxis
      ) {
        continue;
      }

      value = axes[index];

      if (typeof value !== 'number' || !isFinite(value)) {
        continue;
      }

      if (Math.abs(value) > limit) {
        return index;
      }
    }

    return null;
  }

  /**
   * 学習結果として保存された値が使えるかを見る。
   *
   * localStorage は他の端末・他のバージョンの値が
   * 残っていることがあるので、読むたびに検査する。
   */
  function isValidMapping(mapping) {
    var keys = ['linearAxis', 'angularAxis'];
    var signs = ['linearSign', 'angularSign'];
    var index;
    var value;

    if (!mapping || typeof mapping !== 'object') {
      return false;
    }

    if (mapping.kind === 'button') {
      return isValidButtonMapping(mapping);
    }

    for (index = 0; index < keys.length; index += 1) {
      value = mapping[keys[index]];

      if (
        typeof value !== 'number' ||
        !isFinite(value) ||
        value < 0 ||
        value !== Math.floor(value)
      ) {
        return false;
      }
    }

    for (index = 0; index < signs.length; index += 1) {
      value = mapping[signs[index]];

      if (value !== 1 && value !== -1) {
        return false;
      }
    }

    // 同じ軸を前後と旋回の両方に割り当てると操作できない
    return mapping.linearAxis !== mapping.angularAxis;
  }

  /**
   * ボタンで方向を読む割り当てが使えるかを見る。
   *
   * 4方向すべてが、別々の番号で揃っていること。
   * 1つでも欠けたり重なったりしていると、倒しても動かない向きや、
   * 前進と旋回が同時に出る向きができてしまう。
   */
  function isValidButtonMapping(mapping) {
    var keys = [
      'forwardButton', 'backButton', 'rightButton', 'leftButton'
    ];

    var seen = [];
    var index;
    var value;

    for (index = 0; index < keys.length; index += 1) {
      value = mapping[keys[index]];

      if (
        typeof value !== 'number' ||
        !isFinite(value) ||
        value < 0 ||
        value !== Math.floor(value)
      ) {
        return false;
      }

      if (isBlocked(seen, value)) {
        return false;
      }

      seen.push(value);
    }

    return true;
  }

  // ============================================================
  // 公開
  // ============================================================

  var api = {
    DEFAULT_MAPPING: DEFAULT_MAPPING,
    DEFAULT_DEADZONE: DEFAULT_DEADZONE,
    BUTTON_THRESHOLD: BUTTON_THRESHOLD,
    DEFAULT_BUTTON_FLOOR: DEFAULT_BUTTON_FLOOR,
    DEFAULT_RAMP_MS: DEFAULT_RAMP_MS,

    readAxis: readAxis,
    readButton: readButton,
    pressedButtons: pressedButtons,
    isDeadmanHeld: isDeadmanHeld,
    updateBlocked: updateBlocked,
    valueSignature: valueSignature,

    applyDeadzone: applyDeadzone,
    toCommand: toCommand,
    readInput: readInput,

    isButtonMapping: isButtonMapping,
    directionButtons: directionButtons,
    readDirection: readDirection,
    pickAxis: pickAxis,
    rampScale: rampScale,

    unusedActiveAxis: unusedActiveAxis,

    learnAxis: learnAxis,
    learnButton: learnButton,
    isValidMapping: isValidMapping
  };

  // ブラウザでは window に、Node.js（単体テスト）では
  // module.exports に載せる。
  root.TrolleyGamepad = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

}(typeof window !== 'undefined' ? window : globalThis));

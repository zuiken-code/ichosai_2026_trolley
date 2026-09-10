# スマートフォンコントローラ

Switchコントローラの接続不良時に備えた、バックアップ用のコントローラです。
スマートフォンのブラウザから走行操作ができます。

## 構成

```
[Switchコントローラ] joy_node --> /joy --> joy_teleop --> /cmd_vel/joy ---+
                                                     (50Hz)              |
                                                                         +--> cmd_vel_mux --> /cmd_vel --> trolley_drive
[スマートフォン] ブラウザ <--WebSocket--> trolley_api --> /cmd_vel/phone -+       (50Hz)            (50Hz)
                              (20Hz)                     (20Hz)
```

- `cmd_vel_mux` が操作権を調停し、`/cmd_vel` へ **50Hzで常時** 出力します。
  `trolley_drive` は最後に受け取った速度を保持し続けるため、
  操作権を持つ入力が途絶した場合はゼロ速度を送り続ける必要があります。
- スマートフォン用の画面は `trolley_api` が同一オリジンで配信します。
  GitHub Pages などの https から `ws://192.168.x.x` へは
  mixed content として接続できないためです。
- **各段は必ずレートで制限してください。** `/joy` の受信ごとに
  publish するような実装にすると、joyドライバが出すレート（Joy-Conでは
  数百Hzになることがあります）がそのまま下流へ流れ、操作遅延の原因に
  なります。速度指令のQoSも `depth=1` に揃えてあります。深さを増やすと
  下流が一瞬詰まった際に古い指令がキューに溜まり、復帰後にそれを
  順番に実行してしまいます。

## 必要なPythonパッケージ

`trolley_api` の実行には以下が必要です（WebSocketには `websockets` が必要）。

```bash
pip install "fastapi" "uvicorn[standard]"
```

`uvicorn[standard]` を入れない場合は、`websockets` か `wsproto` を
個別に入れてください。入っていないとWebSocketの接続が失敗します。

## ビルド

必ず `ros2_ws/` で実行してください。`ros2_ws/src/` で `colcon build`
すると `ros2_ws/src/{build,install,log}` という2つ目のワークスペースが
でき、どちらを `source` したかで別のコードが動いてしまいます。

```bash
cd ros2_ws
colcon build
source install/setup.bash
```

`libs/SalonPath` はROSパッケージではなくpipパッケージなので、
`colcon build` では更新されません。編集が反映されるよう
editable install にしておいてください。

```bash
pip install -e libs/SalonPath
```

## 起動

```bash
ros2 launch trolley_bringup trolley_phone.launch.py
```

`trolley.launch.py` はこのファイルへの薄いエイリアスなので、
どちらで起動しても同じ構成になります。

Switchコントローラのみの構成にしたい場合は `with_api:=false` を
付けてください。`cmd_vel_mux` は残るため、Joy途絶時に
ゼロ速度を送るウォッチドッグは有効なままです。

```bash
ros2 launch trolley_bringup trolley.launch.py with_api:=false
```

### launch引数

| 引数 | 既定値 | 説明 |
| --- | --- | --- |
| `with_api` | `true` | APIサーバ（スマホ画面）を起動するか |
| `api_host` | `0.0.0.0` | APIサーバの待ち受けアドレス |
| `api_port` | `8000` | APIサーバの待ち受けポート |
| `phone_max_linear` | `1.0` | スマホ操作時の最大並進速度 [m/s] |
| `phone_max_angular` | `1.0` | スマホ操作時の最大角速度 [rad/s] |
| `joy_timeout` | `0.5` | `cmd_vel_mux` がJoyを途絶と見なすまでの時間 [s] |
| `joy_stale_timeout` | `0.5` | `joy_teleop` が `/joy` を途絶と見なすまでの時間 [s] |
| `joy_publish_rate` | `50.0` | `joy_teleop` が `/cmd_vel/joy` を出力するレート [Hz] |

Joy途絶からスマートフォンへ操作権が移るまでの時間は
`joy_stale_timeout + joy_timeout` の合計になります（既定で1.0秒）。

例:

```bash
ros2 launch trolley_bringup trolley_phone.launch.py phone_max_linear:=0.6
```

### APIサーバだけを手動で起動する場合

従来の起動方法も使えます。

```bash
uvicorn trolley_api.api_server:app --host 0.0.0.0 --port 8000
```

この場合、速度上限は環境変数で指定します。

```bash
export TROLLEY_PHONE_MAX_LINEAR=0.6
export TROLLEY_PHONE_MAX_ANGULAR=0.6
```

## スマートフォンからの接続

1. スマートフォンをロボットと同じWi-Fiに接続します。
2. ロボット側PCのIPアドレスを調べます（`hostname -I` など）。
3. ブラウザで次のURLを開きます。

```
http://<ロボットPCのIP>:8000/controller/
```

ホーム画面に追加しておくと、ブラウザのUIが隠れて誤タップが減ります。

## 操作方法

画面には状態チップとスティックだけがあります。

- **スティック**: 触れている間だけ走行します（Switchの Aボタン相当）。
  指を離す・画面を切り替える・通信が切れる、のいずれでも即停止します。
- **前後と旋回は排他**です。倒した量が大きい方の軸だけが採用されます
  （既存の `joy_teleop` と同じ挙動）。採用中の軸は青い線で示されます。
- **状態チップ**: 現在の操作権を表示します。タップすると操作権を要求します。
- 遅延が200msを超えるとチップに遅延が表示されます。

### 状態チップの表示

| 表示 | 意味 |
| --- | --- |
| Switchで操作中 — タップで取得 | Joyが操作権を持っている。スマホ入力は無視される |
| このスマホで操作中 | このスマホが操作権を持っている |
| 他の端末が操作中 — タップで取得 | 別のスマホが操作権を持っている |
| 待機中 — タップで操作を取得 | Joyもスマホも操作していない |
| 調停ノード未起動 | `cmd_vel_mux` が動いていない |
| 未接続 — 再接続しています | WebSocketが切れている |

## 操作権の仕様

- 通常はJoy（Switchコントローラ）が操作権を持ちます。
- Joyが `joy_timeout` 秒途絶すると、**自動でスマートフォンへ移ります**。
- Joyが生きている間にスマートフォンで操作したい場合は、
  状態チップをタップして**明示的に奪取**します。
- Joyが復帰しても**自動では戻しません**。
  スマートフォンの画面下部に「Joyに戻す」ボタンが出るので、
  それを押したときに移行します。
- 例外として、スマートフォンが `phone_lost_timeout` 秒以上途絶し、
  かつJoyが生きている場合のみ自動でJoyへ戻します。
  バックアップ端末を紛失・電池切れした際に操縦不能になるのを防ぐためです。
  この挙動は `auto_return_on_phone_loss` で無効化できます。

操作権はROSのServiceからも切り替えられます。

```bash
ros2 service call /teleop/request_phone std_srvs/srv/Trigger
ros2 service call /teleop/release_to_joy std_srvs/srv/Trigger
```

現在の状態は次のいずれかで確認できます。

```bash
ros2 topic echo /teleop/status
curl http://localhost:8000/api/teleop/status
```

## パラメータ

### cmd_vel_mux

| パラメータ | 既定値 | 説明 |
| --- | --- | --- |
| `joy_timeout` | `0.5` | `cmd_vel_mux` がJoyを途絶と見なすまでの時間 [s] |
| `joy_stale_timeout` | `0.5` | `joy_teleop` が `/joy` を途絶と見なすまでの時間 [s] |
| `joy_publish_rate` | `50.0` | `joy_teleop` が `/cmd_vel/joy` を出力するレート [Hz] |

Joy途絶からスマートフォンへ操作権が移るまでの時間は
`joy_stale_timeout + joy_timeout` の合計になります（既定で1.0秒）。
| `phone_timeout` | `0.5` | スマホを途絶と見なすまでの時間 [s] |
| `phone_lost_timeout` | `2.0` | スマホを喪失と見なすまでの時間 [s] |
| `auto_return_on_phone_loss` | `true` | スマホ喪失時に自動でJoyへ戻すか |
| `publish_rate` | `50.0` | `/cmd_vel` の出力周期 [Hz] |
| `status_rate` | `5.0` | 状態の配信周期 [Hz] |

### trolley_phone_teleop（trolley_api 内のノード）

| パラメータ | 環境変数 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `max_linear` | `TROLLEY_PHONE_MAX_LINEAR` | `1.0` | 最大並進速度 [m/s] |
| `max_angular` | `TROLLEY_PHONE_MAX_ANGULAR` | `1.0` | 最大角速度 [rad/s] |
| `invert_angular` | `TROLLEY_PHONE_INVERT_ANGULAR` | `false` | 旋回方向を反転する |
| `publish_rate` | `TROLLEY_PHONE_PUBLISH_RATE` | `20.0` | `/cmd_vel/phone` の出力周期 [Hz] |
| `command_timeout` | `TROLLEY_PHONE_COMMAND_TIMEOUT` | `0.3` | この時間入力が来なければゼロ速度にする [s] |

実行中の変更も反映されます。

```bash
ros2 param set /trolley_phone_teleop max_linear 0.6
```

## 対応ブラウザ

Web標準のみを使っているため、iOS Safari / Android Firefox / Chrome で動きます。

- 入力は Pointer Events。未対応の古い端末では Touch Events に退避します。
- Vibration API と Screen Wake Lock API は機能検出しています。
  未対応の端末（iOS SafariのVibration、FirefoxのWake Lock）では
  その機能だけが無効になり、操作には影響しません。
- 配色は端末のテーマ設定（ライト / ダーク）に追従します。
- フォントはシステムフォントのみ、外部CDNへのアクセスもありません。
  現場でインターネットが無くても動作します。

## トラブルシューティング

| 症状 | 確認すること |
| --- | --- |
| チップが「未接続」のまま | `uvicorn[standard]` か `websockets` が入っているか。ポート8000が通っているか |
| チップが「調停ノード未起動」 | `cmd_vel_mux` が起動しているか（`ros2 node list`） |
| スティックを倒しても動かない | 走行許可が入っているか（`/api/enable`）。`ros2 topic echo /cmd_vel` で値が出ているか |
| 旋回方向が逆 | `invert_angular` を `true` にする |
| Switchを操作していないのにスマホへ移らない | `joy_node` の `autorepeat_rate` が0になっていないか |
| スマホに操作権が渡ったまま戻せない | 状態チップ下の「Joyに戻す」を押す。または `/teleop/release_to_joy` を呼ぶ |
| 操作が遅延する | 下の「操作遅延を切り分ける」を参照 |

### 操作遅延を切り分ける

過去に、モーター送信のたびに `print(..., flush=True)` していたことが
原因で操作が大きく遅延した事例があります。

`output='screen'` で起動していると各ノードのstdoutはlaunchへの
パイプになります。読み手（launch、端末、SSH越しならその先）が
追いつかないとパイプバッファが埋まって `write()` がブロックし、
シングルスレッドExecutorのノードは購読コールバックごと停止します。
復帰後に古い指令をまとめて処理するため、操作が遅れて見えます。

**ホットパス（制御ループ・購読コールバック）に `print` を足さないこと。**
デバッグ出力は `get_logger().debug()` を使い、必要なときだけ
有効化してください。`ros2 launch` は `--ros-args` を受け取らないので、
対象ノードだけを単体で起動するのが手軽です。

```bash
ros2 run trolley_drive drive_node --ros-args     --log-level trolley_drive:=debug
```

launchのまま有効化したい場合は、該当 `Node()` に
`arguments=['--ros-args', '--log-level', 'trolley_drive:=debug']`
を追加してください。

遅延が出たときの確認手順:

```bash
# 1. 各段のレートが想定どおりか
ros2 topic hz /joy            # joyドライバ依存。数百Hz出ていたら要注意
ros2 topic hz /cmd_vel/joy    # joy_publish_rate (既定50Hz) で頭打ちになる
ros2 topic hz /cmd_vel        # cmd_vel_mux の publish_rate (既定50Hz)

# 2. end-to-endの遅延
ros2 topic delay /cmd_vel

# 3. ノードがCPUを食い潰していないか
top -H -p $(pgrep -f drive_node)

# 4. 端末出力が律速していないか（改善すればstdoutが原因）
#    launchの output を 'log' にする、またはSSHではなく実機の
#    ローカル端末で起動して比較する
```

## 既存構成への影響

- `trolley_api` の `/api/status`・`/api/enable`・`/api/mode` の挙動は
  変わっていません。
- `trolley_interfaces` は変更していません。
- `joy_teleop` は `/joy` 受信ごとのpublishからタイマー駆動に変わりました。
  軸・ボタン・速度はパラメータ化されていますが、既定値は従来と同一です。
- `trolley.launch.py` は `trolley_phone.launch.py` へのエイリアスに
  なりました。従来のコマンドはそのまま使えますが、`cmd_vel_mux` が
  必ず起動する構成になります。

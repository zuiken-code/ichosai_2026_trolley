# スマートフォンコントローラ

Switchコントローラの接続不良時に備えた、バックアップ用のコントローラです。
スマートフォンのブラウザから走行操作ができます。

## 構成

```
[Switchコントローラ] joy_node --> /joy --> joy_teleop --> /cmd_vel/joy ---+
                                          (コード無変更 / launchでremap)  |
                                                                          +--> cmd_vel_mux --> /cmd_vel --> trolley_drive
[スマートフォン] ブラウザ <--WebSocket--> trolley_api --> /cmd_vel/phone --+
```

- `cmd_vel_mux` が操作権を調停し、`/cmd_vel` へ **50Hzで常時** 出力します。
  `trolley_drive` は最後に受け取った速度を保持し続けるため、
  操作権を持つ入力が途絶した場合はゼロ速度を送り続ける必要があります。
- スマートフォン用の画面は `trolley_api` が同一オリジンで配信します。
  GitHub Pages などの https から `ws://192.168.x.x` へは
  mixed content として接続できないためです。

## 必要なPythonパッケージ

`trolley_api` の実行には以下が必要です（WebSocketには `websockets` が必要）。

```bash
pip install "fastapi" "uvicorn[standard]"
```

`uvicorn[standard]` を入れない場合は、`websockets` か `wsproto` を
個別に入れてください。入っていないとWebSocketの接続が失敗します。

## ビルド

```bash
cd ros2_ws
colcon build --packages-select trolley_cmd_mux trolley_api trolley_bringup
source install/setup.bash
```

## 起動

```bash
ros2 launch trolley_bringup trolley_phone.launch.py
```

既存の `trolley.launch.py` は変更していないので、
従来のSwitchコントローラのみの構成もそのまま起動できます。

### launch引数

| 引数 | 既定値 | 説明 |
| --- | --- | --- |
| `with_api` | `true` | APIサーバ（スマホ画面）を起動するか |
| `api_host` | `0.0.0.0` | APIサーバの待ち受けアドレス |
| `api_port` | `8000` | APIサーバの待ち受けポート |
| `phone_max_linear` | `1.0` | スマホ操作時の最大並進速度 [m/s] |
| `phone_max_angular` | `1.0` | スマホ操作時の最大角速度 [rad/s] |
| `joy_timeout` | `1.0` | Joyを途絶と見なすまでの時間 [s] |

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
| `joy_timeout` | `1.0` | Joyを途絶と見なすまでの時間 [s] |
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

## 既存構成への影響

- `joy_teleop` / `trolley_drive` / `trolley_interfaces` のコードは変更していません。
- `trolley.launch.py` も変更していないため、従来の起動方法は影響を受けません。
- `trolley_api` への変更は追加のみで、既存の `/api/status`・`/api/enable`・
  `/api/mode` の挙動は変わりません。

# ichosai_2026_trolley

文化祭で運行する電動トロッコの制御システムです。  
ROS 2 を中核として、Switchコントローラ・スマートフォンからの遠隔操作と、ESP32 経由のモーター制御を統合しています。

## 目次

- [概要](#概要)
- [システム構成](#システム構成)
- [必要条件](#必要条件)
- [ディレクトリ構成](#ディレクトリ構成)
- [SalonPath — モーター通信ライブラリ](#salonpath--モーター通信ライブラリ)
- [ROS 2 トピック・サービス仕様](#ros-2-トピックサービス仕様)
- [APIサーバー・Webコントローラー](#apiサーバーwebコントローラー)
- [回路構成](#回路構成)
- [関連リポジトリ](#関連リポジトリ)
- [ビルドと起動](#ビルドと起動)
- [コントリビュート](#コントリビュート)
- [ライセンス](#ライセンス)
- [連絡先](#連絡先)

## 概要

トロッコは差動二輪駆動で、左右各1基の RS-775 モーターで走行します。  
操作者は **Switchコントローラ（Joy-Con）** または **スマートフォンのブラウザ** からトロッコを操縦でき、`cmd_vel_mux` による操作権の自動調停が入ります。

> **文化祭での実際の運用について**:  
> ROS 2 側（Raspberry Pi）に直接 Joy-Con を Bluetooth 接続するノードや launch も用意していますが、トロッコから距離が離れると Bluetooth 通信が不安定になる問題がありました。そのため実際の文化祭では、**Webコントローラーを開いているスマートフォンに Joy-Con を直接 Bluetooth 接続し、ブラウザ（Gamepad API）を経由して操縦する** という方法を採用しました。

走行許可（enable / disable）やモード切替（teleop / auto）は、**DriverStation**（React + Vite 製の Web アプリ）から行います。

### 前作からの主な変更点

| 項目 | 2025年（前作） | 2026年（本作） |
| --- | --- | --- |
| ミドルウェア | なし（Python直結） | **ROS 2 Jazzy** |
| コントローラ入力 | pygame + Joy-Con ドライバ | `joy_node` + `joy_teleop`、スマートフォン Gamepad API |
| Web フレームワーク | Flask | **FastAPI** + WebSocket |
| モータードライバ通信 | I2C（Arduino） | **UDP（ESP32）** |
| 操作権調停 | なし | `cmd_vel_mux`（Joy / Phone 自動切替） |

## システム構成

```
                        ┌─────────────────────────────────────────────────────────┐
                        │                  Raspberry Pi (ROS 2)                   │
                        │                                                         │
[Switchコントローラ]    │  joy_node ──▶ /joy ──▶ joy_teleop ──▶ /cmd_vel/joy ─┐   │
     Bluetooth          │                          (50Hz)                      │   │
                        │                                                      ▼   │
[スマートフォン]        │  ブラウザ ◀─WebSocket─▶ trolley_api ──▶ /cmd_vel/phone   │
     Wi-Fi              │                (20Hz)                  │  (20Hz)      │   │
                        │                                        │              ▼   │
                        │                                        │      cmd_vel_mux │
                        │                                        │        (50Hz)    │
                        │                                        │          │       │
                        │                                        │          ▼       │
                        │                                        │      /cmd_vel    │
                        │                                        │          │       │
                        │                                        │          ▼       │
[DriverStation]─────────┤─ HTTP API ────────────────────▶ trolley_drive ─────┤──────┤
  (React/Vite)          │  /api/enable, /api/mode        (50Hz制御ループ)    │      │
  enable/disable/       │                                    │               │      │
  teleop操作切替        │                                    │ SalonPath     │      │
                        │                                    │  (UDP)        │      │
                        └────────────────────────────────────┼───────────────┘      │
                                                             │                      │
                                                             ▼                      │
                                                     ┌──────────────┐               │
                                                     │    ESP32     │               │
                                                     │  UDP受信     │               │
                                                     │  PWM生成     │               │
                                                     └──────┬───────┘               │
                                                             │ PWM信号               │
                                                     ┌───────┴───────┐              │
                                                     │  Power基板    │              │
                                                     │  (VNH5019A-E) │              │
                                                     └───────┬───────┘              │
                                                             │                      │
                                                      ┌──────┴──────┐               │
                                                      │  RS-775 x2  │               │
                                                      │  左 / 右    │               │
                                                      └─────────────┘
```

## 必要条件

### ハードウェア

| 部品 | 説明 |
| --- | --- |
| Raspberry Pi 4/5 | ROS 2 ホスト（Ubuntu 24.04 推奨） |
| ESP32 | UDP → PWM 変換。ロジック基板の代替 |
| RS-775 モーター × 2 | 左右車輪駆動 |
| Power基板（VNH5019A-E） | モータードライバ。[rs775-smart-motor-driver](https://github.com/Keisuke063/rs775-smart-motor-driver) の power 基板 |
| Nintendo Switch Joy-Con | 操作コントローラ（任意） |
| スマートフォン | バックアップコントローラ（任意） |
| Wi-Fi ルーター | Raspberry Pi・ESP32・スマートフォンを同一ネットワークに接続 |

### ソフトウェア

| 要件 | バージョン |
| --- | --- |
| Ubuntu | 24.04 LTS |
| ROS 2 | Jazzy Jalisco |
| Python | 3.12+ |
| Node.js | 20+ （テスト実行時のみ） |

### Python パッケージ

```bash
pip install "fastapi" "uvicorn[standard]"
pip install -e libs/SalonPath
```

`uvicorn[standard]` を入れない場合は `websockets` か `wsproto` を個別にインストールしてください。

## ディレクトリ構成

```
ichosai_2026_trolley/
├── docs/                       # ドキュメント
│   ├── phone_controller.md     # スマートフォンコントローラの詳細仕様
│   └── joycon_controller.md    # Joy-Conをスマートフォンにつないで操作する方法
├── libs/
│   └── SalonPath/              # モーター通信ライブラリ（pip パッケージ）
│       ├── pyproject.toml
│       └── SalonPath/
│           ├── SalonPath.py    # モーター抽象（SalonPathクラス）
│           ├── bus.py          # MotorBus（複数モーター管理）
│           ├── transport.py    # UDPTransport（ノンブロッキング送信）
│           ├── protocol.py     # パケットフォーマット（ヘッダ + CRC16）
│           ├── enums.py        # ControlType（DUTY_CYCLE / VELOCITY / POSITION / DISABLE）
│           └── closed_loop.py  # ClosedLoopController（将来用）
└── ros2_ws/
    └── src/
        ├── trolley_interfaces/ # カスタムサービス定義
        │   └── srv/
        │       ├── SetDriveEnabled.srv
        │       └── SetDriveMode.srv
        ├── trolley_drive/      # モーター制御ノード
        │   └── trolley_drive/
        │       ├── drive_node.py
        │       └── kinematics.py
        ├── joy_teleop/         # Joy-Con → cmd_vel 変換ノード
        ├── trolley_cmd_mux/    # 操作権調停ノード
        │   └── trolley_cmd_mux/
        │       ├── cmd_vel_mux_node.py
        │       └── arbiter.py
        ├── trolley_api/        # FastAPI サーバー + WebSocket + 操作画面
        │   ├── trolley_api/
        │   │   ├── api_server.py
        │   │   ├── teleop_ws.py
        │   │   └── run_server.py
        │   └── web/            # スマートフォン操作画面（静的ファイル）
        └── trolley_bringup/    # launch ファイル
            └── launch/
                ├── trolley.launch.py
                └── trolley_phone.launch.py
```

## SalonPath — モーター通信ライブラリ

`SalonPath` は、ROS 2 パッケージとは独立した pip パッケージとして `libs/SalonPath/` に配置されています。  
ESP32 へ UDP でモーター指令を送るための軽量ライブラリです。

### アーキテクチャ

```
SalonPath (モーター抽象)
    │
    ├── setReference(reference, control_type)
    │       │
    │       ▼
    └── MotorBus (複数モーター管理)
            │
            ├── send_motor_command(motor)
            │       │
            │       ▼
            └── UDPTransport (UDP送信)
                    │
                    ├── build_motor_packet()  ← protocol.py
                    │
                    └── socket.sendto() ──▶ ESP32
```

### パケットフォーマット

```
┌────────────┬────────────┬──────────┬──────────────┬───────────┬──────────┬──────────┐
│ Header1    │ Header2    │ MotorID  │ ControlType  │ Reference │ Sequence │ CRC16    │
│ 0xAA (1B)  │ 0x55 (1B)  │ (1B)     │ (1B)         │ (4B float)│ (2B)     │ (2B)     │
└────────────┴────────────┴──────────┴──────────────┴───────────┴──────────┴──────────┘
                           ◀──────── payload (8B) ────────────▶
```

| フィールド | サイズ | 説明 |
| --- | --- | --- |
| Header | 2 bytes | 固定値 `0xAA 0x55` |
| MotorID | 1 byte | モーター識別子（左=1, 右=2） |
| ControlType | 1 byte | `0`=DUTY_CYCLE, `1`=VELOCITY, `2`=POSITION, `3`=DISABLE |
| Reference | 4 bytes | IEEE 754 float（リトルエンディアン）。Duty 時は -1.0〜+1.0 |
| Sequence | 2 bytes | シーケンス番号（0〜255 でラップ） |
| CRC16 | 2 bytes | payload 部分の CRC-16/MODBUS |

### ControlType

| 値 | 名前 | 説明 |
| --- | --- | --- |
| 0 | `DUTY_CYCLE` | PWM デューティ比による直接制御（-1.0〜+1.0） |
| 1 | `VELOCITY` | 速度制御（将来用） |
| 2 | `POSITION` | 位置制御（将来用） |
| 3 | `DISABLE` | モーター無効化。ESP32 側で PWM 出力を停止 |

### UDPTransport の設計方針

- **ノンブロッキング送信**: ソケットを `setblocking(False)` にし、送信バッファが埋まっても制御ループをブロックしない
- **エラー報告の間引き**: ESP32 が応答しない間は同一エラーを 1 秒ごとに間引いて報告し、ログが溢れるのを防ぐ
- **正常系ではログを出さない**: `print(flush=True)` による制御ループの停止を防ぐ

### 使い方

```python
from SalonPath import MotorBus, UDPTransport, SalonPath, ControlType

transport = UDPTransport(host="192.168.0.116", port=5000)
bus = MotorBus(transport)

left_motor = SalonPath(bus, motor_id=1)
right_motor = SalonPath(bus, motor_id=2)

# Duty 50% で前進
left_motor.setReference(0.5, ControlType.DUTY_CYCLE)
right_motor.setReference(-0.5, ControlType.DUTY_CYCLE)  # 右は符号反転

# 停止
left_motor.setReference(0.0, ControlType.DISABLE)
right_motor.setReference(0.0, ControlType.DISABLE)
```

## ROS 2 トピック・サービス仕様

### ノード一覧

| ノード名 | パッケージ | 役割 |
| --- | --- | --- |
| `joy_node` | `joy` (外部) | Joy-Con の入力を `/joy` トピックに publish |
| `joy_teleop` | `joy_teleop` | `/joy` → `/cmd_vel/joy` 変換（50Hz タイマー駆動） |
| `trolley_phone_teleop` | `trolley_api` | WebSocket → `/cmd_vel/phone` 変換（20Hz） |
| `cmd_vel_mux` | `trolley_cmd_mux` | `/cmd_vel/joy` と `/cmd_vel/phone` を調停し `/cmd_vel` を出力（50Hz） |
| `trolley_drive` | `trolley_drive` | `/cmd_vel` → SalonPath (UDP) でモーター制御（50Hz） |
| `trolley_api` | `trolley_api` | FastAPI サーバー。HTTP API + WebSocket + 静的ファイル配信 |

### トピック

| トピック名 | 型 | QoS | 発行元 | 購読先 | 説明 |
| --- | --- | --- | --- | --- | --- |
| `/joy` | `sensor_msgs/Joy` | — | `joy_node` | `joy_teleop` | Joy-Con のスティック・ボタン生データ |
| `/cmd_vel/joy` | `geometry_msgs/Twist` | depth=1, RELIABLE | `joy_teleop` | `cmd_vel_mux` | Joy-Con 由来の速度指令（50Hz） |
| `/cmd_vel/phone` | `geometry_msgs/Twist` | depth=1, RELIABLE | `trolley_phone_teleop` | `cmd_vel_mux` | スマートフォン由来の速度指令（20Hz） |
| `/cmd_vel` | `geometry_msgs/Twist` | depth=1, RELIABLE | `cmd_vel_mux` | `trolley_drive` | 調停済みの最終速度指令（50Hz 常時出力） |
| `/teleop/status` | `std_msgs/String` | — | `cmd_vel_mux` | (任意) | 操作権の状態（JSON） |

> **QoS depth=1 の理由**: 速度指令は「最新値だけが意味を持つ」ため。depth を増やすと、一瞬の遅延時に古い指令がキューに溜まり、復帰後にまとめて実行される。

### サービス

| サービス名 | 型 | 提供元 | 説明 |
| --- | --- | --- | --- |
| `/drive/set_enabled` | `trolley_interfaces/SetDriveEnabled` | `trolley_drive` | 走行の有効 / 無効を切り替え |
| `/drive/set_mode` | `trolley_interfaces/SetDriveMode` | `trolley_drive` | モード切替（TELEOP=1, AUTO=2） |
| `/teleop/request_phone` | `std_srvs/Trigger` | `cmd_vel_mux` | 操作権をスマートフォンへ移す |
| `/teleop/release_to_joy` | `std_srvs/Trigger` | `cmd_vel_mux` | 操作権を Joy-Con へ戻す |

### カスタムサービス定義

#### SetDriveEnabled.srv

```
bool enabled
---
bool success
string message
```

#### SetDriveMode.srv

```
int32 mode
---
bool success
string message
```

### 操作権調停（cmd_vel_mux）

`cmd_vel_mux` は Joy-Con とスマートフォンの操作権を自動調停します。

- **通常は Joy-Con が操作権を持つ**
- Joy-Con が `joy_timeout` 秒途絶すると、自動でスマートフォンへ移る
- Joy-Con が生きていても、スマートフォンの状態チップをタップ（または `/teleop/request_phone` サービスコール）で明示的に奪取できる
- Joy-Con が復帰しても自動では戻さない（明示的に戻す操作が必要）
- スマートフォンが `phone_lost_timeout` 秒途絶し、かつ Joy-Con が生きている場合のみ自動で Joy-Con へ戻す

### ロボット定数

| 定数 | 値 | 説明 |
| --- | --- | --- |
| `WHEEL_RADIUS` | 0.075 m | 車輪半径 |
| `TRACK_WIDTH` | 0.431 m | 左右車輪間距離（トレッド幅） |
| `MAX_RPM` | 127 | Duty 100% 相当の最大 RPM |
| `LEFT_MOTOR_ID` | 1 | 左モーターの SalonPath ID |
| `RIGHT_MOTOR_ID` | 2 | 右モーターの SalonPath ID |
| `ESP32_IP` | 192.168.0.116 | ESP32 の固定 IP アドレス |
| `ESP32_PORT` | 5000 | ESP32 の UDP 受信ポート |

### 運動学

`cmd_vel_to_wheel_rpm()` は差動二輪の逆運動学を実装しています。

```
v_left  = linear_x − angular_z × (track_width / 2)
v_right = linear_x + angular_z × (track_width / 2)

rpm = v / (2π × wheel_radius) × 60
```

RPM は `rpm_to_duty()` でデューティ比 (-1.0〜+1.0) に変換され、SalonPath 経由で ESP32 へ送信されます。

## APIサーバー・Webコントローラー

### APIサーバー（trolley_api）

FastAPI ベースの HTTP/WebSocket サーバーです。ROS 2 ノードとして動作し、ROS サービスのクライアントを兼ねます。

#### HTTP エンドポイント

| メソッド | パス | 説明 |
| --- | --- | --- |
| `GET` | `/api/status` | 現在の enable / mode 状態を取得 |
| `POST` | `/api/enable?enabled=true` | 走行許可の切り替え（ROS サービス経由） |
| `POST` | `/api/mode?mode=teleop` | モード切替: `teleop` / `auto`（ROS サービス経由） |
| `GET` | `/api/teleop/status` | 操作権の現在状態を取得（JSON） |
| — | `/controller/` | スマートフォン操作画面（静的ファイル配信） |

#### WebSocket エンドポイント

| パス | 説明 |
| --- | --- |
| `/ws/teleop` | スマートフォンからのスティック入力を受信し `/cmd_vel/phone` に変換 |

**プロトコル**: JSON メッセージ

```json
{"t": "cmd", "lx": 0.5, "az": 0.0}    // スティック入力（linear_x, angular_z）
{"t": "stop"}                           // 即時停止
```

#### ROS 2 との関係

```
DriverStation (React/Vite)
    │
    ├── POST /api/enable ──▶ trolley_api ──▶ /drive/set_enabled (Service) ──▶ trolley_drive
    ├── POST /api/mode   ──▶ trolley_api ──▶ /drive/set_mode   (Service) ──▶ trolley_drive
    │
スマートフォン
    │
    └── WebSocket /ws/teleop ──▶ trolley_phone_teleop ──▶ /cmd_vel/phone (Topic) ──▶ cmd_vel_mux
```

### Webコントローラー（スマートフォン操作画面）

`trolley_api` が `/controller/` で同一オリジン配信する静的 Web アプリです。

- **バーチャルスティック**: タッチで前後・旋回を操作（前後と旋回は排他）
- **Joy-Con 対応**: Gamepad API でスマートフォンに Bluetooth 接続した Joy-Con も使用可能
- **操作権チップ**: 現在の操作権表示 + タップで操作権要求
- **オフライン対応**: 外部 CDN なし、システムフォントのみ。インターネット不要
- **テーマ対応**: ライト / ダークモード自動追従

### DriverStation

走行の enable / disable や teleop / auto の切り替えを行う Web アプリです。

- **リポジトリ**: [ichosai_2026_trolley_DriverStation](https://github.com/zuiken-code/ichosai_2026_trolley_DriverStation)
- **技術スタック**: React + TypeScript + Vite
- **デプロイ**: GitHub Pages（GitHub Actions で自動デプロイ）
- **オフライン**: PWA 対応。一度アクセスすればオフラインで起動可能（ロボットとの通信は別途ネットワーク接続が必要）

## 回路構成

### モータードライバ基板

本プロジェクトでは [rs775-smart-motor-driver](https://github.com/Keisuke063/rs775-smart-motor-driver) の **Power 基板のみ** を採用しています。

> **Logic 基板を使わない理由**: 直前に Logic 基板（ATmega4809 搭載）が故障したため、ESP32 で Logic 基板の役割を代替しています。

#### Power 基板の仕様

| 項目 | 内容 |
| --- | --- |
| モータードライバ IC | VNH5019A-E |
| 電源入力 | XT30 コネクタ |
| モーター接続 | RS-775 用はんだ付けフットプリント |
| 基板間接続 | Logic-Power 間インターコネクトヘッダ |

#### ESP32 の役割

ESP32 は故障した Logic 基板の代替として、以下を担います:

1. **UDP 受信**: ROS 2（Raspberry Pi）から SalonPath プロトコルのパケットを受信
2. **PWM 信号生成**: 受信したデューティ比に基づいて VNH5019A-E へ PWM 信号を出力
3. **モータードライバ制御**: INA / INB / PWM ピンの制御

ESP32 のファームウェアは別リポジトリで管理されています:  
[ichosai_2026_trolley_esp32](https://github.com/zuiken-code/ichosai_2026_trolley_esp32)

### 信号の流れ

```
Raspberry Pi                ESP32                    Power基板
┌──────────┐    UDP/Wi-Fi   ┌──────────┐    PWM     ┌────────────┐
│ ROS 2    │ ────────────▶ │ パケット  │ ────────▶ │ VNH5019A-E │ ──▶ RS-775
│ trolley  │  SalonPath    │ パース    │  INA/INB  │            │     モーター
│ _drive   │  プロトコル   │ PWM生成   │           │            │
└──────────┘               └──────────┘            └────────────┘
```

## 関連リポジトリ

| リポジトリ | 説明 |
| --- | --- |
| [ichosai_2026_trolley](https://github.com/zuiken-code/ichosai_2026_trolley) | 本リポジトリ。ROS 2 ワークスペース + SalonPath ライブラリ |
| [ichosai_2026_trolley_esp32](https://github.com/zuiken-code/ichosai_2026_trolley_esp32) | ESP32 ファームウェア。UDP 受信 → PWM 変換 |
| [ichosai_2026_trolley_DriverStation](https://github.com/zuiken-code/ichosai_2026_trolley_DriverStation) | DriverStation（React/Vite）。enable/disable、teleop/auto 切替 |
| [rs775-smart-motor-driver](https://github.com/Keisuke063/rs775-smart-motor-driver) | モータードライバ基板設計（KiCad）。本プロジェクトでは Power 基板のみ使用 |
| [ichosai_2025_robot_Raspberry-Pi](https://github.com/zuiken-code/ichosai_2025_robot_Raspberry-Pi) | 前作（2025年）。Flask + Joy-Con + I2C 構成 |

## ビルドと起動

### 1. リポジトリのクローン

```bash
git clone https://github.com/zuiken-code/ichosai_2026_trolley.git
cd ichosai_2026_trolley
```

### 2. SalonPath のインストール

```bash
pip install -e libs/SalonPath
```

### 3. Python パッケージのインストール

```bash
pip install "fastapi" "uvicorn[standard]"
```

### 4. ROS 2 ワークスペースのビルド

必ず `ros2_ws/` で実行してください。

```bash
cd ros2_ws
colcon build
source install/setup.bash
```

### 5. 起動

```bash
# 全構成（Joy-Con + スマートフォン）
ros2 launch trolley_bringup trolley_phone.launch.py

# Joy-Con のみ（APIサーバーなし）
ros2 launch trolley_bringup trolley.launch.py with_api:=false
```

### launch 引数

| 引数 | 既定値 | 説明 |
| --- | --- | --- |
| `with_api` | `true` | API サーバ（スマホ画面）を起動するか |
| `api_host` | `0.0.0.0` | API サーバの待ち受けアドレス |
| `api_port` | `8000` | API サーバの待ち受けポート |
| `phone_max_linear` | `1.0` | スマホ操作時の最大並進速度 [m/s] |
| `phone_max_angular` | `1.0` | スマホ操作時の最大角速度 [rad/s] |
| `joy_timeout` | `0.5` | Joy-Con 途絶と見なすまでの時間 [s] |
| `joy_stale_timeout` | `0.5` | `/joy` トピック途絶と見なすまでの時間 [s] |
| `joy_publish_rate` | `50.0` | `joy_teleop` の出力レート [Hz] |

## コントリビュート

バグ報告や改善提案は GitHub Issues からお願いします。  
Pull Request も歓迎します。

## ライセンス

本プロジェクトは MIT License のもとで公開されています。

## 連絡先

- GitHub Issues: [https://github.com/zuiken-code/ichosai_2026_trolley/issues](https://github.com/zuiken-code/ichosai_2026_trolley/issues)
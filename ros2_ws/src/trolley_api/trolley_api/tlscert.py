"""検出ページ配信用の自己署名サーバ証明書を用意する。

スマートフォンのブラウザで `getUserMedia()`（カメラ）を使うには
secure context が必須なので、検出ページだけは HTTPS で配る必要がある。
会場にはインターネットも DNS も無い前提なので、
ロボットPCのIPアドレスを SAN に持つ証明書をその場で作る。

初回アクセス時はブラウザに「安全ではない」警告が出る。
iOS Safari なら「詳細を表示」→「この Web サイトを閲覧」で通せる。
表示された指紋がログに出る SHA-256 と一致するかで、
中間者ではないことを確認できる。

なお、操作画面 (`/controller/`) を HTTP のまま残しているのは意図的で、
理由は api_server.py の該当箇所のコメントを参照。
"""

from __future__ import annotations

import datetime as dt
import ipaddress
import socket
from dataclasses import dataclass
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.x509.oid import ExtendedKeyUsageOID, NameOID


# ============================================================
# Configuration
# ============================================================

# 397日はブラウザが受け入れるサーバ証明書の上限。
VALID_DAYS = 397

# 期限がこれより近い証明書は作り直す。
RENEW_MARGIN_DAYS = 7

COMMON_NAME = 'trolley-detector'


# ============================================================
# Types
# ============================================================

@dataclass
class CertInfo:
    """発行または再利用した証明書の情報。"""

    cert_path: Path
    key_path: Path
    fingerprint: str
    ips: list[str]
    created: bool


# ============================================================
# Helpers
# ============================================================

def local_ipv4s() -> list[str]:
    """この機体が持っているIPv4アドレスを、確度の高い順に返す。

    証明書の SAN に入れる。ここに載っていないアドレスで
    アクセスされると、ブラウザは警告を出したうえに
    「このサイトを信頼する」を選んでも接続できないことがある。
    """
    found: list[str] = []

    # デフォルトルートに使われるアドレス。実際には送信しない。
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(('8.8.8.8', 53))
        found.append(sock.getsockname()[0])
    except OSError:
        pass
    finally:
        sock.close()

    try:
        infos = socket.getaddrinfo(
            socket.gethostname(),
            None,
            socket.AF_INET,
        )
    except socket.gaierror:
        infos = []

    for info in infos:
        ip = info[4][0]
        if ip not in found:
            found.append(ip)

    return [ip for ip in found if not ip.startswith('127.')]


def _san_entries(ips: list[str]) -> list[x509.GeneralName]:
    names: list[x509.GeneralName] = [x509.DNSName('localhost')]

    hostname = socket.gethostname()
    if hostname and hostname != 'localhost':
        names.append(x509.DNSName(hostname))
        names.append(x509.DNSName(f'{hostname}.local'))

    for ip in ips:
        try:
            names.append(x509.IPAddress(ipaddress.ip_address(ip)))
        except ValueError:
            continue

    return names


def _covers(cert_path: Path, required: list[str]) -> bool:
    """既存の証明書が、必要なIPを全部含んでいて期限内かを見る。"""
    try:
        cert = x509.load_pem_x509_certificate(cert_path.read_bytes())
    except (OSError, ValueError):
        return False

    now = dt.datetime.now(dt.timezone.utc)

    if cert.not_valid_after_utc < now + dt.timedelta(days=RENEW_MARGIN_DAYS):
        return False

    if cert.not_valid_before_utc > now:
        return False

    try:
        san = cert.extensions.get_extension_for_class(
            x509.SubjectAlternativeName,
        ).value
    except x509.ExtensionNotFound:
        return False

    have = {str(ip) for ip in san.get_values_for_type(x509.IPAddress)}

    return all(ip in have for ip in required)


def fingerprint(cert_path: Path) -> str:
    """スマホ側の警告画面と照合するための SHA-256 指紋。"""
    cert = x509.load_pem_x509_certificate(cert_path.read_bytes())
    digest = cert.fingerprint(hashes.SHA256())

    return ':'.join(f'{b:02X}' for b in digest)


# ============================================================
# Entry point
# ============================================================

def ensure_cert(cert_dir: Path, ips: list[str]) -> CertInfo:
    """必要なIPを SAN に含む証明書を用意する。足りていれば作り直さない。

    IPが変わると証明書も作り直しになり、スマホ側では警告の承認も
    やり直しになる。会場では固定IPかDHCP予約にしておくとよい。
    """
    cert_dir.mkdir(parents=True, exist_ok=True)

    cert_path = cert_dir / 'server.crt'
    key_path = cert_dir / 'server.key'

    # dict.fromkeys で順序を保ったまま重複を落とす
    wanted = list(dict.fromkeys([*ips, '127.0.0.1']))

    if (
        cert_path.exists()
        and key_path.exists()
        and _covers(cert_path, wanted)
    ):
        return CertInfo(
            cert_path=cert_path,
            key_path=key_path,
            fingerprint=fingerprint(cert_path),
            ips=wanted,
            created=False,
        )

    # RSAより鍵生成が速く、非力なSBCでも起動を待たせない。
    key = ec.generate_private_key(ec.SECP256R1())

    subject = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, COMMON_NAME),
        x509.NameAttribute(
            NameOID.ORGANIZATION_NAME,
            'ichosai trolley (self-signed)',
        ),
    ])

    now = dt.datetime.now(dt.timezone.utc)

    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(subject)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        # 機体の時計がずれていても即座に無効にならないよう少し前倒しする
        .not_valid_before(now - dt.timedelta(minutes=5))
        .not_valid_after(now + dt.timedelta(days=VALID_DAYS))
        .add_extension(
            x509.SubjectAlternativeName(_san_entries(wanted)),
            critical=False,
        )
        .add_extension(
            x509.BasicConstraints(ca=False, path_length=None),
            critical=True,
        )
        .add_extension(
            x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]),
            critical=False,
        )
        .sign(key, hashes.SHA256())
    )

    key_path.write_bytes(
        key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
    )
    key_path.chmod(0o600)

    cert_path.write_bytes(cert.public_bytes(serialization.Encoding.PEM))

    return CertInfo(
        cert_path=cert_path,
        key_path=key_path,
        fingerprint=fingerprint(cert_path),
        ips=wanted,
        created=True,
    )

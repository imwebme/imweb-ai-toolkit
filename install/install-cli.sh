#!/usr/bin/env bash
set -euo pipefail

DEFAULT_MANIFEST_URL="https://raw.githubusercontent.com/imwebme/imweb-cli-release/main/channels/stable.json"

MANIFEST_URL=""
MANIFEST_FILE=""
INSTALL_ROOT="${HOME}/.local/share/imweb-cli"
BIN_DIR="${HOME}/.local/bin"
FORCE=0

usage() {
  cat <<'USAGE'
imweb CLI installer

Usage:
  ./install/install-cli.sh [--manifest-url URL | --manifest-file PATH] [--install-root PATH] [--bin-dir PATH] [--force]
  ./install/install-cli.sh --help

Options:
  --manifest-url   public stable channel pointer 또는 release manifest URL. 기본값: imweb-cli-release stable pointer
  --manifest-file  로컬 manifest 파일 경로. fixture/local 검증용
  --install-root   CLI 설치 루트. 기본값: $HOME/.local/share/imweb-cli
  --bin-dir        실행 파일 링크를 둘 디렉터리. 기본값: $HOME/.local/bin
  --force          이미 같은 버전이 있어도 다시 설치
  --help           도움말 출력

동작 원칙:
  - 기본 source는 public stable channel pointer이며, 필요하면 release manifest override도 받을 수 있습니다.
  - channel pointer는 release_manifest_url을 통해 실제 release manifest를 가리킵니다.
  - 현재 플랫폼에 맞는 release archive 하나만 선택합니다.
  - 이미 같은 버전이 설치되어 있으면 기본 동작은 skip입니다.
  - 새 버전을 설치하면 current 링크와 bin 디렉터리의 imweb 링크를 갱신합니다.
  - 기본 public stable fetch에는 gh auth가 필요하지 않습니다.
  - authenticated GitHub Release override를 쓰면 gh fallback과 GitHub repo read 권한이 필요할 수 있습니다.
USAGE
}

fail() {
  printf '오류: %s\n' "$1" >&2
  exit 1
}

parse_github_release_url() {
  python3 - "$1" <<'PY'
import sys
from urllib.parse import unquote, urlparse

source = sys.argv[1]
parsed = urlparse(source)
if parsed.scheme not in {"http", "https"} or parsed.netloc != "github.com":
    raise SystemExit(1)

parts = [unquote(part) for part in parsed.path.split("/") if part]
if len(parts) < 5 or parts[2] != "releases" or parts[3] not in {"download", "latest"}:
    raise SystemExit(1)

repo = "/".join(parts[:2])
if parts[3] == "latest":
    tag = "latest"
    asset = "/".join(parts[5:])
else:
    tag = parts[4]
    asset = "/".join(parts[5:])
if not repo or not tag or not asset:
    raise SystemExit(1)

print(f"{repo}|{tag}|{asset}")
PY
}

github_release_download() {
  local source="$1"
  local destination="$2"
  local repo tag asset resolved_tag tmpdir downloaded

  if ! command -v gh >/dev/null 2>&1; then
    return 1
  fi

  if ! IFS='|' read -r repo tag asset <<< "$(parse_github_release_url "$source")"; then
    return 1
  fi
  [[ -n "$repo" && -n "$tag" && -n "$asset" ]] || return 1

  resolved_tag="$tag"
  if [[ "$tag" == "latest" ]]; then
    resolved_tag=$(gh api "repos/$repo/releases/latest" --jq '.tag_name' 2>/dev/null) || return 1
    [[ -n "$resolved_tag" ]] || return 1
  fi

  tmpdir=$(mktemp -d)
  if ! gh release download "$resolved_tag" -R "$repo" -p "$asset" -D "$tmpdir" >/dev/null; then
    rm -rf "$tmpdir"
    return 1
  fi

  downloaded=$(find "$tmpdir" -maxdepth 1 -type f -name "$asset" | head -n 1)
  if [[ -z "$downloaded" ]]; then
    rm -rf "$tmpdir"
    return 1
  fi

  cp "$downloaded" "$destination"
  rm -rf "$tmpdir"
}

download_source_to_file() {
  local source="$1"
  local destination="$2"

  if [[ "$source" =~ ^https?://github.com/ ]]; then
    if curl -fsSL "$source" -o "$destination"; then
      return 0
    fi
    github_release_download "$source" "$destination"
    return $?
  fi

  if [[ "$source" =~ ^https?:// ]]; then
    curl -fsSL "$source" -o "$destination"
    return
  fi

  cp "$source" "$destination"
}

manifest_fetch_hint() {
  cat >&2 <<EOF
다음 중 하나로 다시 시도하세요.
- 기본 public stable pointer fetch에는 gh auth가 필요하지 않습니다.
- authenticated GitHub Release override를 쓰는 경우에만 GitHub 계정, gh auth login, repo read 권한이 필요할 수 있습니다.
- install-cli를 직접 실행 중이면 remote manifest override에 --manifest-url, 로컬 fixture에는 --manifest-file을 사용합니다.
- bootstrap-imweb.sh를 다시 실행할 때는 remote manifest override에 --cli-manifest-url, 로컬 fixture에는 --cli-manifest-file을 사용합니다.
- 이미 imweb CLI가 설치되어 있으면 install-skills.sh로 skill만 연결할 수 있습니다.
EOF
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "필수 명령을 찾지 못했습니다: $1"
}

detect_platform() {
  local os arch
  os=$(uname -s)
  arch=$(uname -m)

  case "$os" in
    Darwin) os="macos" ;;
    Linux) os="linux" ;;
    *)
      fail "지원하지 않는 운영체제입니다: $os"
      ;;
  esac

  case "$arch" in
    x86_64|amd64) arch="x86_64" ;;
    i386|i486|i586|i686) arch="i686" ;;
    arm64|aarch64) arch="arm64" ;;
    armv7l|armv7*) arch="armv7" ;;
    *)
      fail "지원하지 않는 아키텍처입니다: $arch"
      ;;
  esac

  printf '%s-%s' "$os" "$arch"
}

fetch_to_stdout() {
  local source="$1"

  if [[ "$source" == file://* ]]; then
    python3 - "$source" <<'PY'
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

url = sys.argv[1]
parsed = urlparse(url)
path = Path(unquote(parsed.path))
sys.stdout.write(path.read_text())
PY
    return
  fi

  if [[ "$source" =~ ^https?:// ]]; then
    local tmpfile
    tmpfile=$(mktemp)
    if ! download_source_to_file "$source" "$tmpfile"; then
      rm -f "$tmpfile"
      return 1
    fi
    cat "$tmpfile"
    rm -f "$tmpfile"
    return
  fi

  if ! cat "$source"; then
    return 1
  fi
}

resolve_asset_source() {
  local raw="$1"
  local manifest_base="${2:-}"

  if [[ "$raw" =~ ^https?:// ]] || [[ "$raw" == file://* ]]; then
    printf '%s' "$raw"
    return
  fi

  if [[ -n "$manifest_base" ]]; then
    printf '%s/%s' "$manifest_base" "$raw"
    return
  fi

  printf '%s' "$raw"
}

manifest_base_from_source() {
  local source="$1"

  if [[ "$source" == file://* ]]; then
    python3 - "$source" <<'PY'
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

parsed = urlparse(sys.argv[1])
print(Path(unquote(parsed.path)).parent)
PY
    return
  fi

  if [[ "$source" =~ ^https?:// ]]; then
    printf ''
    return
  fi

  python3 - "$source" <<'PY'
import sys
from pathlib import Path

print(Path(sys.argv[1]).resolve().parent)
PY
}

download_asset() {
  local source="$1"
  local destination="$2"

  if [[ "$source" =~ ^https?://github.com/ ]]; then
    if curl -fsSL "$source" -o "$destination"; then
      return
    fi
    if github_release_download "$source" "$destination"; then
      return
    fi
    fail "asset을 내려받지 못했습니다: $source"
  fi

  if [[ "$source" == file://* ]]; then
    python3 - "$source" "$destination" <<'PY'
import shutil
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

parsed = urlparse(sys.argv[1])
src = Path(unquote(parsed.path))
dst = Path(sys.argv[2])
shutil.copyfile(src, dst)
PY
    return
  fi

  if [[ "$source" =~ ^https?:// ]]; then
    if ! download_source_to_file "$source" "$destination"; then
      fail "asset을 내려받지 못했습니다: $source"
    fi
    return
  fi

  if ! cp "$source" "$destination"; then
    fail "asset을 복사하지 못했습니다: $source"
  fi
}

sha256_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    openssl dgst -sha256 "$1" | awk '{print $2}'
  fi
}

extract_archive() {
  local archive="$1"
  local destination="$2"

  mkdir -p "$destination"

  case "$archive" in
    *.tar.gz)
      tar -xzf "$archive" -C "$destination"
      ;;
    *.zip)
      need_cmd unzip
      unzip -q "$archive" -d "$destination"
      ;;
    *)
      fail "지원하지 않는 archive 형식입니다: $archive"
      ;;
  esac
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --manifest-url)
      [[ $# -ge 2 ]] || fail '--manifest-url 값이 필요합니다.'
      MANIFEST_URL="$2"
      shift 2
      ;;
    --manifest-file)
      [[ $# -ge 2 ]] || fail '--manifest-file 값이 필요합니다.'
      MANIFEST_FILE="$2"
      shift 2
      ;;
    --install-root)
      [[ $# -ge 2 ]] || fail '--install-root 값이 필요합니다.'
      INSTALL_ROOT="$2"
      shift 2
      ;;
    --bin-dir)
      [[ $# -ge 2 ]] || fail '--bin-dir 값이 필요합니다.'
      BIN_DIR="$2"
      shift 2
      ;;
    --force)
      FORCE=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "알 수 없는 옵션입니다: $1"
      ;;
  esac
done

need_cmd python3
need_cmd curl
need_cmd tar

if [[ -n "$MANIFEST_URL" && -n "$MANIFEST_FILE" ]]; then
  fail '--manifest-url과 --manifest-file은 동시에 사용할 수 없습니다.'
fi

if [[ -n "$MANIFEST_FILE" ]]; then
  [[ -f "$MANIFEST_FILE" ]] || fail "manifest 파일을 찾을 수 없습니다: $MANIFEST_FILE"
  MANIFEST_SOURCE="$MANIFEST_FILE"
else
  MANIFEST_SOURCE="${MANIFEST_URL:-$DEFAULT_MANIFEST_URL}"
fi

PLATFORM=$(detect_platform)

if ! MANIFEST_JSON=$(fetch_to_stdout "$MANIFEST_SOURCE"); then
  if [[ "$MANIFEST_SOURCE" == "$DEFAULT_MANIFEST_URL" ]]; then
    manifest_fetch_hint
  fi
  fail "manifest를 읽지 못했습니다: $MANIFEST_SOURCE"
fi

manifest_source_values=()
while IFS= read -r line; do
  manifest_source_values+=("$line")
done < <(
  MANIFEST_JSON="$MANIFEST_JSON" python3 - <<'PY'
import json
import os

data = json.loads(os.environ["MANIFEST_JSON"])
has_assets = isinstance(data.get("assets"), list)
release_manifest_url = data.get("release_manifest_url") or ""

if has_assets:
    print("release-manifest")
    print("")
else:
    print("channel-pointer")
    print(release_manifest_url)
PY
)

MANIFEST_KIND="${manifest_source_values[0]:-release-manifest}"
RELEASE_MANIFEST_URL="${manifest_source_values[1]:-}"
if [[ "$MANIFEST_KIND" == "channel-pointer" ]]; then
  [[ -n "$RELEASE_MANIFEST_URL" ]] || fail 'stable channel pointer에 release_manifest_url이 없습니다.'
  MANIFEST_SOURCE="$RELEASE_MANIFEST_URL"
  if ! MANIFEST_JSON=$(fetch_to_stdout "$MANIFEST_SOURCE"); then
    fail "release-manifest를 읽지 못했습니다: $MANIFEST_SOURCE"
  fi
fi

MANIFEST_BASE="$(manifest_base_from_source "$MANIFEST_SOURCE")"

manifest_values=()
if ! manifest_output=$(
  MANIFEST_JSON="$MANIFEST_JSON" python3 - "$PLATFORM" 2>&1 <<'PY'
import json
import os
import sys

platform = sys.argv[1]
data = json.loads(os.environ["MANIFEST_JSON"])
assets = data.get("assets") or []
available = [asset.get("platform") for asset in assets if asset.get("platform")]
match = None
for asset in assets:
    if asset.get("platform") == platform:
        match = asset
        break

if not match:
    supported = ", ".join(available) or "none"
    raise SystemExit(f"manifest에 현재 플랫폼 자산이 없습니다: {platform} (available: {supported})")

values = [
    data.get("version", ""),
    data.get("tag", ""),
    match.get("url", ""),
    match.get("sha256", ""),
    match.get("archive", ""),
]
for item in values:
    print(item)
PY
); then
  fail "$manifest_output"
fi
while IFS= read -r line; do
  manifest_values+=("$line")
done <<< "$manifest_output"

VERSION="${manifest_values[0]:-}"
TAG="${manifest_values[1]:-}"
ASSET_URL_RAW="${manifest_values[2]:-}"
ASSET_SHA="${manifest_values[3]:-}"
ASSET_NAME="${manifest_values[4]:-}"

[[ -n "$VERSION" ]] || fail 'manifest에서 version을 읽지 못했습니다.'
[[ -n "$ASSET_URL_RAW" ]] || fail 'manifest에서 현재 플랫폼 asset URL을 읽지 못했습니다.'
[[ -n "$ASSET_SHA" ]] || fail 'manifest에서 현재 플랫폼 checksum을 읽지 못했습니다.'

ASSET_SOURCE=$(resolve_asset_source "$ASSET_URL_RAW" "$MANIFEST_BASE")
RELEASE_DIR="$INSTALL_ROOT/releases/$VERSION/$PLATFORM"
CURRENT_LINK="$INSTALL_ROOT/current"
VERSION_FILE="$INSTALL_ROOT/current-version.txt"
TARGET_BINARY="$RELEASE_DIR/imweb"
BIN_LINK="$BIN_DIR/imweb"

if [[ -f "$VERSION_FILE" ]]; then
  CURRENT_VERSION=$(cat "$VERSION_FILE")
else
  CURRENT_VERSION=""
fi

if [[ "$CURRENT_VERSION" == "$VERSION" && "$FORCE" -eq 0 && -x "$BIN_LINK" ]]; then
  printf '이미 최신 버전이 설치되어 있어 건너뜁니다.\n'
  printf '  version: %s\n' "$VERSION"
  printf '  bin: %s\n' "$BIN_LINK"
  exit 0
fi

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

ASSET_PATH="$WORK_DIR/${ASSET_NAME:-archive}"
download_asset "$ASSET_SOURCE" "$ASSET_PATH"

DOWNLOADED_SHA=$(sha256_file "$ASSET_PATH")
if [[ "$DOWNLOADED_SHA" != "$ASSET_SHA" ]]; then
  fail "checksum 검증에 실패했습니다. expected=$ASSET_SHA actual=$DOWNLOADED_SHA"
fi

TMP_RELEASE_DIR="$WORK_DIR/release"
extract_archive "$ASSET_PATH" "$TMP_RELEASE_DIR"

[[ -f "$TMP_RELEASE_DIR/imweb" ]] || fail "archive 안에 실행 파일이 없습니다: $ASSET_NAME"

mkdir -p "$INSTALL_ROOT/releases/$VERSION" "$BIN_DIR"
rm -rf "$RELEASE_DIR"
mv "$TMP_RELEASE_DIR" "$RELEASE_DIR"

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
ln -sfn "$CURRENT_LINK/imweb" "$BIN_LINK"
printf '%s' "$VERSION" > "$VERSION_FILE"

INSTALLED_VERSION=$("$BIN_LINK" --version 2>/dev/null || true)
INSTALLED_VERSION="${INSTALLED_VERSION%%$'\n'*}"

printf 'CLI 설치 완료\n'
printf '  version: %s\n' "$VERSION"
printf '  tag: %s\n' "${TAG:-unknown}"
printf '  platform: %s\n' "$PLATFORM"
printf '  install_root: %s\n' "$INSTALL_ROOT"
printf '  bin: %s\n' "$BIN_LINK"
if [[ -n "$INSTALLED_VERSION" ]]; then
  printf '  version_check: %s\n' "$INSTALLED_VERSION"
fi
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  printf '  note: PATH에 %s를 추가해야 바로 실행할 수 있습니다.\n' "$BIN_DIR"
fi

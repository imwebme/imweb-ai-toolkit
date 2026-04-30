#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH='' cd -- "$SCRIPT_DIR/.." && pwd)

TOOL=""
SCOPE="user"
SOURCE="$REPO_ROOT"
MARKETPLACE_NAME="imweb-ai-toolkit"
PLUGIN_NAME="imweb-ai-toolkit"
PACKAGE_PATH=""
SKILL_PACKAGE_PATH=""
DRY_RUN=0

usage() {
  cat <<'USAGE'
imweb plugin install helper

Usage:
  ./install/install-plugins.sh --tool codex|claude [--scope user|project|local] [--source PATH] [--dry-run]
  ./install/install-plugins.sh --package PATH [--dry-run]
  ./install/install-plugins.sh --skill-package PATH [--dry-run]
  ./install/install-plugins.sh --help

Options:
  --tool     Plugin 설치 대상 도구. codex 또는 claude
  --scope    Claude 설치 범위. user, project, local. 기본값: user
             Codex는 현재 marketplace 등록까지만 자동화합니다.
  --source   marketplace source. 기본값: 이 toolkit repo root
  --package  Claude Desktop Cowork installable plugin package 생성 경로
             Cowork 파일 카드 설치를 위해 .plugin 확장자를 권장합니다.
  --skill-package
             Claude Cowork bare /imweb custom skill package 생성 경로
  --dry-run  실행할 명령만 출력
  --help     도움말 출력

동작:
  - codex: repo/personal marketplace를 Codex에 등록합니다.
           이후 Codex App 또는 CLI의 Plugins 화면에서 imweb-ai-toolkit을 설치합니다.
  - claude: marketplace를 Claude Code에 등록하고 imweb-ai-toolkit plugin을 설치합니다.
  - package: Claude Desktop Cowork에서 설치할 수 있는 plugin package를 생성합니다.
  - skill-package: Claude Cowork에서 bare /imweb로 시작할 imweb skill package를 생성합니다.
USAGE
}

fail() {
  printf '오류: %s\n' "$1" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "필수 명령을 찾지 못했습니다: $1"
}

run_cmd() {
  printf '+'
  printf ' %q' "$@"
  printf '\n'
  if [[ "$DRY_RUN" -eq 0 ]]; then
    "$@"
  fi
}

create_package() {
  local output_path="$1"
  [[ -n "$output_path" ]] || fail '--package 경로가 필요합니다.'
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf '+ python3 <package imweb-ai-toolkit> %q\n' "$output_path"
    return
  fi

  need_cmd python3
  mkdir -p "$(dirname -- "$output_path")"
  REPO_ROOT="$REPO_ROOT" OUTPUT_PATH="$output_path" python3 - <<'PY'
import os
import stat
import time
import zipfile
from pathlib import Path

repo_root = Path(os.environ["REPO_ROOT"]).resolve()
output_path = Path(os.environ["OUTPUT_PATH"]).expanduser().resolve()
include = [
    "README.ko.md",
    "README.ja.md",
    "README.zh-CN.md",
    "LICENSE",
    "TRADEMARKS.md",
    "package.json",
    "plugin.json",
    ".mcp.json",
    ".agents/plugins/marketplace.json",
    ".codex-plugin",
    ".claude-plugin",
    ".cursor-plugin",
    "assets",
    "bin",
    "docs/ai-agent-installation.md",
    "docs/cli-toolkit-integration.md",
    "docs/cowork-ask-claude-install.md",
    "docs/imweb-ai-toolkit.md",
    "docs/skill-installation-and-usage.md",
    "docs/surface-support-matrix.md",
    "examples",
    "install",
    "skills/imweb",
]

skip_names = {"__pycache__", ".DS_Store"}
files = []
readme_source = repo_root / "docs/public-root-readme.md"
if not readme_source.exists():
    readme_source = repo_root / "README.md"
if not readme_source.exists():
    raise SystemExit("package source missing: README.md")
files.append((readme_source, "README.md"))
for raw in include:
    src = (repo_root / raw).resolve()
    if not src.exists():
        raise SystemExit(f"package source missing: {raw}")
    if src.is_file():
        files.append((src, src.relative_to(repo_root).as_posix()))
    else:
        files.extend((path, path.relative_to(repo_root).as_posix()) for path in sorted(src.rglob("*")) if path.is_file())

with zipfile.ZipFile(output_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    seen = set()
    for path, rel in files:
        try:
            path.relative_to(repo_root)
        except ValueError:
            raise SystemExit(f"package source escapes repo: {path}")
        if any(part in skip_names for part in path.parts):
            continue
        if rel in seen:
            continue
        seen.add(rel)
        info = zipfile.ZipInfo(rel, date_time=time.localtime(path.stat().st_mtime)[:6])
        executable = rel.startswith("install/") and os.access(path, os.X_OK)
        mode = 0o755 if executable else 0o644
        info.external_attr = (stat.S_IFREG | mode) << 16
        with path.open("rb") as handle:
            archive.writestr(info, handle.read(), compress_type=zipfile.ZIP_DEFLATED)

suffix = output_path.suffix.lower()
if suffix and suffix != ".plugin":
    print(f"warning: Cowork install cards expect a .plugin extension; got {suffix}")
print("plugin package created")
print(f"  path: {output_path}")
print(f"  files: {len(seen)}")
PY
}

create_skill_package() {
  local output_path="$1"
  [[ -n "$output_path" ]] || fail '--skill-package 경로가 필요합니다.'
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf '+ python3 <package imweb skill> %q\n' "$output_path"
    return
  fi

  need_cmd python3
  mkdir -p "$(dirname -- "$output_path")"
  REPO_ROOT="$REPO_ROOT" OUTPUT_PATH="$output_path" python3 - <<'PY'
import os
import stat
import time
import zipfile
from pathlib import Path

repo_root = Path(os.environ["REPO_ROOT"]).resolve()
output_path = Path(os.environ["OUTPUT_PATH"]).expanduser().resolve()
skill_root = repo_root / "skills" / "imweb"
if not (skill_root / "SKILL.md").is_file():
    raise SystemExit("skill source missing: skills/imweb/SKILL.md")

files = []
for path in sorted(skill_root.rglob("*")):
    if not path.is_file() or path.name in {"__pycache__", ".DS_Store"}:
        continue
    rel = path.relative_to(skill_root).as_posix()
    files.append((path, f"imweb/{rel}"))

with zipfile.ZipFile(output_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    seen = set()
    for path, rel in files:
        if rel in seen:
            continue
        seen.add(rel)
        info = zipfile.ZipInfo(rel, date_time=time.localtime(path.stat().st_mtime)[:6])
        info.external_attr = (stat.S_IFREG | 0o644) << 16
        with path.open("rb") as handle:
            archive.writestr(info, handle.read(), compress_type=zipfile.ZIP_DEFLATED)

suffix = output_path.suffix.lower()
if suffix and suffix != ".skill":
    print(f"warning: Claude skill install cards expect a .skill extension; got {suffix}")
print("skill package created")
print(f"  path: {output_path}")
print(f"  files: {len(seen)}")
PY
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tool)
      [[ $# -ge 2 ]] || fail '--tool 값이 필요합니다.'
      TOOL="$2"
      shift 2
      ;;
    --scope)
      [[ $# -ge 2 ]] || fail '--scope 값이 필요합니다.'
      SCOPE="$2"
      shift 2
      ;;
    --source)
      [[ $# -ge 2 ]] || fail '--source 값이 필요합니다.'
      SOURCE="$2"
      shift 2
      ;;
    --package)
      [[ $# -ge 2 ]] || fail '--package 값이 필요합니다.'
      PACKAGE_PATH="$2"
      shift 2
      ;;
    --skill-package)
      [[ $# -ge 2 ]] || fail '--skill-package 값이 필요합니다.'
      SKILL_PACKAGE_PATH="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
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

[[ "$SCOPE" = "user" || "$SCOPE" = "project" || "$SCOPE" = "local" ]] || fail '--scope는 user, project, local 중 하나여야 합니다.'

if [[ -n "$PACKAGE_PATH" ]]; then
  create_package "$PACKAGE_PATH"
fi

if [[ -n "${SKILL_PACKAGE_PATH:-}" ]]; then
  create_skill_package "$SKILL_PACKAGE_PATH"
fi

if [[ -z "$TOOL" ]]; then
  [[ -n "$PACKAGE_PATH" || -n "${SKILL_PACKAGE_PATH:-}" ]] || fail '--tool, --package, --skill-package 중 하나는 필요합니다.'
  exit 0
fi

case "$TOOL" in
  codex)
    [[ "$DRY_RUN" -eq 1 ]] || need_cmd codex
    run_cmd codex plugin marketplace add "$SOURCE"
    if [[ "$DRY_RUN" -eq 1 ]]; then
      printf 'Codex marketplace 등록 dry-run 완료\n'
    else
      printf 'Codex marketplace 등록 완료\n'
    fi
    printf '  marketplace: %s\n' "$MARKETPLACE_NAME"
    printf '  plugin: %s\n' "$PLUGIN_NAME"
    printf '  next: Codex App 또는 Codex CLI /plugins 화면에서 plugin을 설치하세요.\n'
    ;;
  claude)
    [[ "$DRY_RUN" -eq 1 ]] || need_cmd claude
    run_cmd claude plugin marketplace add "$SOURCE"
    run_cmd claude plugin install "$PLUGIN_NAME@$MARKETPLACE_NAME" --scope "$SCOPE"
    if [[ "$DRY_RUN" -eq 1 ]]; then
      printf 'Claude plugin 설치 dry-run 완료\n'
    else
      printf 'Claude plugin 설치 완료\n'
    fi
    printf '  marketplace: %s\n' "$MARKETPLACE_NAME"
    printf '  plugin: %s\n' "$PLUGIN_NAME"
    printf '  scope: %s\n' "$SCOPE"
    ;;
  *)
    fail '--tool은 codex 또는 claude여야 합니다.'
    ;;
esac

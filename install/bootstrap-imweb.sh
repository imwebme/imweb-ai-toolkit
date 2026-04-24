#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)

TOOL=""
SCOPE=""
SKILL_MODE="copy"
SKILL_TARGET=""
CLI_MANIFEST_URL=""
CLI_MANIFEST_FILE=""
CLI_INSTALL_ROOT=""
CLI_BIN_DIR=""
FORCE_CLI=0

usage() {
  cat <<'USAGE'
imweb bootstrap helper

Usage:
  ./install/bootstrap-imweb.sh --tool codex|claude --scope user|project [options]
  ./install/bootstrap-imweb.sh --help

Options:
  --tool               skill 설치 대상 도구. codex 또는 claude
  --scope              skill 설치 범위. user 또는 project
  --skill-mode         skill 설치 방식. copy 또는 symlink. 기본값: copy
  --skill-target       skill discovery 대상 경로 override
  --cli-manifest-url   CLI channel pointer 또는 release manifest URL override
  --cli-manifest-file  로컬 CLI manifest 파일 경로
  --cli-install-root   CLI 설치 루트 override
  --cli-bin-dir        CLI 실행 파일 디렉터리 override
  --force-cli          같은 버전이어도 CLI 재설치
  --help               도움말 출력

동작 순서:
  1. imweb CLI를 설치하거나 업데이트
  2. skill `imweb`를 discovery 경로에 설치
USAGE
}

fail() {
  printf '오류: %s\n' "$1" >&2
  exit 1
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
    --skill-mode)
      [[ $# -ge 2 ]] || fail '--skill-mode 값이 필요합니다.'
      SKILL_MODE="$2"
      shift 2
      ;;
    --skill-target)
      [[ $# -ge 2 ]] || fail '--skill-target 값이 필요합니다.'
      SKILL_TARGET="$2"
      shift 2
      ;;
    --cli-manifest-url)
      [[ $# -ge 2 ]] || fail '--cli-manifest-url 값이 필요합니다.'
      CLI_MANIFEST_URL="$2"
      shift 2
      ;;
    --cli-manifest-file)
      [[ $# -ge 2 ]] || fail '--cli-manifest-file 값이 필요합니다.'
      CLI_MANIFEST_FILE="$2"
      shift 2
      ;;
    --cli-install-root)
      [[ $# -ge 2 ]] || fail '--cli-install-root 값이 필요합니다.'
      CLI_INSTALL_ROOT="$2"
      shift 2
      ;;
    --cli-bin-dir)
      [[ $# -ge 2 ]] || fail '--cli-bin-dir 값이 필요합니다.'
      CLI_BIN_DIR="$2"
      shift 2
      ;;
    --force-cli)
      FORCE_CLI=1
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

[[ -n "$TOOL" ]] || fail '--tool은 필수입니다.'
[[ -n "$SCOPE" ]] || fail '--scope는 필수입니다.'

cli_args=()
[[ -n "$CLI_MANIFEST_URL" ]] && cli_args+=(--manifest-url "$CLI_MANIFEST_URL")
[[ -n "$CLI_MANIFEST_FILE" ]] && cli_args+=(--manifest-file "$CLI_MANIFEST_FILE")
[[ -n "$CLI_INSTALL_ROOT" ]] && cli_args+=(--install-root "$CLI_INSTALL_ROOT")
[[ -n "$CLI_BIN_DIR" ]] && cli_args+=(--bin-dir "$CLI_BIN_DIR")
[[ "$FORCE_CLI" -eq 1 ]] && cli_args+=(--force)

skill_args=(--tool "$TOOL" --scope "$SCOPE" --mode "$SKILL_MODE")
[[ -n "$SKILL_TARGET" ]] && skill_args+=(--target "$SKILL_TARGET")

if [[ ${#cli_args[@]} -gt 0 ]]; then
  "$SCRIPT_DIR/install-cli.sh" "${cli_args[@]}"
else
  "$SCRIPT_DIR/install-cli.sh"
fi

"$SCRIPT_DIR/install-skills.sh" "${skill_args[@]}"

printf 'bootstrap 완료\n'
printf '  tool: %s\n' "$TOOL"
printf '  scope: %s\n' "$SCOPE"
printf '  skill_mode: %s\n' "$SKILL_MODE"

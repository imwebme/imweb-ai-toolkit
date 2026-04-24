#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH='' cd -- "$SCRIPT_DIR/.." && pwd)
SOURCE_DIR="$REPO_ROOT/skills"
PUBLIC_SKILL_NAME="imweb"

TOOL=""
SCOPE=""
MODE="copy"
TARGET=""

usage() {
  cat <<'USAGE'
imweb skills self-install helper

Usage:
  ./install/install-skills.sh --tool codex|claude --scope user|project [--mode copy|symlink] [--target PATH]
  ./install/install-skills.sh --help

Options:
  --tool    설치 대상 도구. codex 또는 claude
  --scope   설치 범위. user 또는 project
  --mode    설치 방식. copy 또는 symlink. 기본값: copy
  --target  기본 discovery 경로 대신 사용할 대상 경로
  --help    도움말 출력

기본 대상 경로:
  codex user    -> \$CODEX_HOME/skills 또는 \$HOME/.codex/skills
  codex project -> <repo>/.codex/skills
  claude user   -> \$HOME/.claude/skills
  claude project-> <repo>/.claude/skills

동작 원칙:
  - source-of-truth는 항상 레포의 skills/
  - 대상 디렉터리가 없으면 생성
  - copy는 기존 공개 skill 경로가 있으면 덮어쓰지 않고 실패
  - symlink는 같은 source를 가리키는 기존 symlink만 성공으로 건너뛰고, 그 외 기존 경로는 충돌로 실패
  - 공개 설치 대상은 imweb skill 하나
  - copy는 공개 skill 디렉터리를 복사
  - symlink는 공개 skill 디렉터리를 원본 skills/ 아래 디렉터리로 심볼릭 링크

생성 구조 예시:
  <target>/imweb/SKILL.md
USAGE
}

fail() {
  printf '오류: %s\n' "$1" >&2
  exit 1
}

canonical_path() {
  python3 - "$1" <<'PY'
import os
import sys

print(os.path.realpath(sys.argv[1]))
PY
}

resolve_default_target() {
  case "$TOOL:$SCOPE" in
    codex:user) printf '%s/skills' "${CODEX_HOME:-$HOME/.codex}" ;;
    codex:project) printf '%s/.codex/skills' "$REPO_ROOT" ;;
    claude:user) printf '%s/.claude/skills' "$HOME" ;;
    claude:project) printf '%s/.claude/skills' "$REPO_ROOT" ;;
    *) return 1 ;;
  esac
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --tool)
      [ "$#" -ge 2 ] || fail '--tool 값이 필요합니다.'
      TOOL="$2"
      shift 2
      ;;
    --scope)
      [ "$#" -ge 2 ] || fail '--scope 값이 필요합니다.'
      SCOPE="$2"
      shift 2
      ;;
    --mode)
      [ "$#" -ge 2 ] || fail '--mode 값이 필요합니다.'
      MODE="$2"
      shift 2
      ;;
    --target)
      [ "$#" -ge 2 ] || fail '--target 값이 필요합니다.'
      TARGET="$2"
      shift 2
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

[ -n "$TOOL" ] || fail '--tool은 필수입니다.'
[ -n "$SCOPE" ] || fail '--scope는 필수입니다.'
[ "$TOOL" = 'codex' ] || [ "$TOOL" = 'claude' ] || fail '--tool은 codex 또는 claude여야 합니다.'
[ "$SCOPE" = 'user' ] || [ "$SCOPE" = 'project' ] || fail '--scope는 user 또는 project여야 합니다.'
[ "$MODE" = 'copy' ] || [ "$MODE" = 'symlink' ] || fail '--mode는 copy 또는 symlink여야 합니다.'
[ -d "$SOURCE_DIR" ] || fail "source skills 디렉터리가 없습니다: $SOURCE_DIR"

if [ -z "$TARGET" ]; then
  TARGET=$(resolve_default_target) || fail '기본 대상 경로를 계산하지 못했습니다.'
fi

mkdir -p "$TARGET"

SKILL_DIRS=("$SOURCE_DIR/$PUBLIC_SKILL_NAME")
[ -d "${SKILL_DIRS[0]}" ] || fail "공개 skill 디렉터리가 없습니다: ${SKILL_DIRS[0]}"
[ -f "${SKILL_DIRS[0]}/SKILL.md" ] || fail "공개 skill 엔트리 파일이 없습니다: ${SKILL_DIRS[0]}/SKILL.md"

CONFLICTS=()
SKIP_EXISTING=()
for source_skill in "${SKILL_DIRS[@]}"; do
  skill_name=$(basename "$source_skill")
  if [ ! -f "$source_skill/SKILL.md" ]; then
    continue
  fi
  target_skill="$TARGET/$skill_name"
  if [ -e "$target_skill" ] || [ -L "$target_skill" ]; then
    if [ "$MODE" = 'symlink' ] && [ -L "$target_skill" ]; then
      target_real=$(canonical_path "$target_skill")
      source_real=$(canonical_path "$source_skill")
      if [ "$target_real" = "$source_real" ]; then
        SKIP_EXISTING+=("$target_skill")
        continue
      fi
    fi
    CONFLICTS+=("$target_skill")
  fi
done

if [ "${#CONFLICTS[@]}" -gt 0 ]; then
  printf '오류: 기존 skill 경로와 충돌해서 설치를 중단합니다.\n' >&2
  for conflict in "${CONFLICTS[@]}"; do
    printf -- '- %s\n' "$conflict" >&2
  done
  exit 1
fi

installed_count=0
skipped_count=0
for source_skill in "${SKILL_DIRS[@]}"; do
  skill_name=$(basename "$source_skill")
  if [ ! -f "$source_skill/SKILL.md" ]; then
    continue
  fi
  target_skill="$TARGET/$skill_name"
  if [ -e "$target_skill" ] || [ -L "$target_skill" ]; then
    skipped_count=$((skipped_count + 1))
    continue
  fi
  if [ "$MODE" = 'copy' ]; then
    cp -R "$source_skill" "$target_skill"
  else
    ln -s "$source_skill" "$target_skill" || fail "심볼릭 링크를 만들지 못했습니다: $target_skill"
  fi
  installed_count=$((installed_count + 1))
done

if [ "$installed_count" -eq 0 ] && [ "$skipped_count" -eq 0 ]; then
  fail "설치 가능한 skill 디렉터리가 없습니다: $SOURCE_DIR"
fi

printf '설치 완료\n'
printf '  tool: %s\n' "$TOOL"
printf '  scope: %s\n' "$SCOPE"
printf '  mode: %s\n' "$MODE"
printf '  target: %s\n' "$TARGET"
printf '  installed_skills: %s\n' "$installed_count"
printf '  skipped_existing: %s\n' "$skipped_count"

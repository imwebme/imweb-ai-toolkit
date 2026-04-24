# install

이 디렉터리는 CLI 설치, skill 설치, bootstrap 진입점을 담습니다.

Codex 기준 skill 기본 설치 경로는 `$CODEX_HOME/skills`이며, `CODEX_HOME`이 없으면 `~/.codex/skills`를 사용합니다.

`install-cli.*`와 `bootstrap-imweb.*` 기본값은 public `imweb-cli-release` stable pointer (`channels/stable.json`)를 읽고, 필요하면 여기서 `release_manifest_url`을 따라 실제 release manifest를 해석합니다. 기본 CLI binary fetch는 public surface 기준이라 `gh auth`를 전제로 하지 않습니다.

우회 경로와 보조 경로는 아래 셋입니다.

- `install-cli.*`에 `--manifest-file` 또는 `-ManifestFile`로 local `release-manifest.json` 전달
- `bootstrap-imweb.*`에 `--cli-manifest-file` 또는 `-CliManifestFile`로 local `release-manifest.json` 전달
- 이미 설치된 `imweb` CLI를 유지한 채 `install-skills.*`만 실행

authenticated GitHub Release URL override를 직접 주는 경우에는 `gh` fallback과 GitHub 권한이 필요할 수 있습니다. 이것은 기본 경로가 아니라 override 경로입니다.

`install-skills.*` 재실행 계약은 shell/PowerShell 공통입니다. `copy`는 기존 skill 경로가 있으면 실패하고, `symlink`는 같은 source를 가리키는 기존 symlink만 성공으로 건너뜁니다.

현재 포함된 파일:

- `install-cli.sh`
- `install-cli.ps1`
- `install-skills.sh`
- `install-skills.ps1`
- `bootstrap-imweb.sh`
- `bootstrap-imweb.ps1`

# install

이 디렉터리는 CLI 설치, skill 설치, plugin 설치/패키징, bootstrap 진입점을 담습니다.

AI coding agent가 public repo에서 직접 설치해야 할 때는 `imweb-ai-toolkit-install.mjs`를 `npx`로 실행합니다.

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool both
```

Codex/Claude Code 같은 로컬 plugin 설치 경로는 공식 `imweb` CLI도 기본으로 설치 또는 업데이트합니다. 사용자가 CLI 설치 명령을 따로 알 필요가 없게 유지합니다.

CLI만 설치하거나 업데이트할 때는 아래처럼 실행합니다.

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool cli
```

tool-native plugin 경로를 직접 사용할 수도 있습니다.

```bash
claude plugin marketplace add imwebme/imweb-ai-toolkit --scope user
claude plugin install imweb-ai-toolkit@imweb-ai-toolkit --scope user
codex plugin marketplace add imwebme/imweb-ai-toolkit --ref main
```

표준 Agent Skills fallback만 필요하면 아래 경로를 사용합니다.

```bash
npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex
```

Claude Desktop Cowork용 plugin package만 만들 때는 아래처럼 실행합니다.

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool claude-desktop
```

Claude Cowork에서 bare `/imweb` 경로를 안정적으로 열려면 plugin package와 custom Skill package를 함께 생성합니다.

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool claude-cowork
```

이 경로는 `npx` 임시 package 디렉터리가 아니라 public Git repository를 marketplace source로 등록합니다. Cowork plugin package는 agent가 명령을 실행한 디렉터리에 `imweb-ai-toolkit.plugin`으로 생성하고, Skill package는 `imweb.skill`로 생성합니다. Package에는 짧은 `/imweb` slash entrypoint와 host `imweb` CLI/auth를 쓰는 local MCP bridge가 포함됩니다. MCP bridge는 host CLI가 없거나 오래되면 공식 CLI installer/update 경로를 직접 실행한 뒤 원래 요청을 계속합니다. Cowork task 안에서는 computer-use나 Claude Desktop UI 조작으로 설치를 시도하지 않습니다. Claude에게 package 생성, 검증, `.plugin`/`.skill` artifact 제시를 맡기는 요청문은 [../docs/cowork-ask-claude-install.md](../docs/cowork-ask-claude-install.md), 자세한 agent용 절차는 [../docs/ai-agent-installation.md](../docs/ai-agent-installation.md)를 봅니다.

Codex 기준 skill 기본 설치 경로는 `$CODEX_HOME/skills`이며, `CODEX_HOME`이 없으면 `~/.codex/skills`를 사용합니다.

`install-cli.*`와 `bootstrap-imweb.*` 기본값은 public `imweb-cli-release` stable pointer (`channels/stable.json`)를 읽고, 필요하면 여기서 `release_manifest_url`을 따라 실제 release manifest를 해석합니다. 기본 CLI binary fetch는 public surface 기준이라 `gh auth`를 전제로 하지 않습니다.

우회 경로와 보조 경로는 아래 셋입니다.

- `install-cli.*`에 `--manifest-file` 또는 `-ManifestFile`로 local `release-manifest.json` 전달
- `bootstrap-imweb.*`에 `--cli-manifest-file` 또는 `-CliManifestFile`로 local `release-manifest.json` 전달
- 이미 설치된 `imweb` CLI를 유지한 채 `install-skills.*`만 실행

authenticated GitHub Release URL override를 직접 주는 경우에는 `gh` fallback과 GitHub 권한이 필요할 수 있습니다. 이것은 기본 경로가 아니라 override 경로입니다.

`install-skills.*` 재실행 계약은 shell/PowerShell 공통입니다. `copy`는 기존 skill 경로가 있으면 실패하고, `symlink`는 같은 source를 가리키는 기존 symlink만 성공으로 건너뜁니다.

`install-plugins.*`는 plugin-first 설치 표면을 연결합니다. `--tool codex|claude` 경로는 plugin 연결 전에 `install-cli.*`를 실행해 CLI를 설치 또는 업데이트합니다.

- Codex: `codex plugin marketplace add`로 이 repo의 `.agents/plugins/marketplace.json`를 등록합니다. Codex App 또는 Codex CLI의 Plugins 화면에서 `imweb-ai-toolkit`을 설치합니다.
- Claude Code: `claude plugin marketplace add` 후 `claude plugin install imweb-ai-toolkit@imweb-ai-toolkit`을 실행합니다.
- Claude Desktop Cowork plugin: `--package` 또는 `-Package`로 설치 가능한 `.plugin` package를 생성합니다. 이 package에는 local MCP bridge와 skill bundle이 들어갑니다.
- Claude Cowork Skill: `--skill-package` 또는 `-SkillPackage`로 custom `.skill` package를 생성합니다. 기본 경로는 `.plugin`과 `.skill` artifact를 Cowork에 함께 제시해 host가 설치/활성화하도록 하는 것입니다. Claude Code CLI registry와 `~/.claude/skills`는 Desktop Cowork 설치를 대체하지 않습니다.

예시:

```bash
./install/install-plugins.sh --tool codex
./install/install-plugins.sh --tool claude --scope user
./install/install-plugins.sh --package imweb-ai-toolkit.plugin
./install/install-plugins.sh --skill-package imweb.skill
```

PowerShell:

```powershell
./install/install-plugins.ps1 -Tool codex
./install/install-plugins.ps1 -Tool claude -Scope user
./install/install-plugins.ps1 -Package imweb-ai-toolkit.plugin
./install/install-plugins.ps1 -SkillPackage imweb.skill
```

현재 포함된 파일:

- `install-cli.sh`
- `install-cli.ps1`
- `install-skills.sh`
- `install-skills.ps1`
- `install-plugins.sh`
- `install-plugins.ps1`
- `bootstrap-imweb.sh`
- `bootstrap-imweb.ps1`

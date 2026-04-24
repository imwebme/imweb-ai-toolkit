[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet('codex', 'claude')]
    [string]$Tool,

    [Parameter()]
    [ValidateSet('user', 'project')]
    [string]$Scope,

    [Parameter()]
    [ValidateSet('copy', 'symlink')]
    [string]$SkillMode = 'copy',

    [Parameter()]
    [string]$SkillTarget,

    [Parameter()]
    [string]$CliManifestUrl,

    [Parameter()]
    [string]$CliManifestFile,

    [Parameter()]
    [string]$CliInstallRoot,

    [Parameter()]
    [string]$CliBinDir,

    [Parameter()]
    [switch]$ForceCli,

    [Parameter()]
    [switch]$Help
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Show-Usage {
    @"
imweb bootstrap helper

Usage:
  ./install/bootstrap-imweb.ps1 -Tool codex|claude -Scope user|project [-SkillMode copy|symlink] [options]
  ./install/bootstrap-imweb.ps1 -Help

Options:
  -Tool             skill 설치 대상 도구. codex 또는 claude
  -Scope            skill 설치 범위. user 또는 project
  -SkillMode        skill 설치 방식. copy 또는 symlink. 기본값: copy
  -SkillTarget      skill discovery 대상 경로 override
  -CliManifestUrl   CLI channel pointer 또는 release manifest URL override
  -CliManifestFile  로컬 CLI manifest 파일 경로
  -CliInstallRoot   CLI 설치 루트 override
  -CliBinDir        CLI 실행 파일 디렉터리 override
  -ForceCli         같은 버전이어도 CLI 재설치
  -Help             도움말 출력

동작 순서:
  1. imweb CLI를 설치하거나 업데이트
  2. skill `imweb`를 discovery 경로에 설치
"@
}

function Fail([string]$Message) {
    Write-Error $Message
    exit 1
}

if ($Help) {
    Show-Usage
    exit 0
}

if (-not $Tool) {
    Fail '-Tool은 필수입니다.'
}
if (-not $Scope) {
    Fail '-Scope는 필수입니다.'
}

if ($CliManifestUrl -and $CliManifestFile) {
    Fail '-CliManifestUrl과 -CliManifestFile은 동시에 사용할 수 없습니다.'
}

$CliArgs = @{}
if ($CliManifestUrl) { $CliArgs['ManifestUrl'] = $CliManifestUrl }
if ($CliManifestFile) { $CliArgs['ManifestFile'] = $CliManifestFile }
if ($CliInstallRoot) { $CliArgs['InstallRoot'] = $CliInstallRoot }
if ($CliBinDir) { $CliArgs['BinDir'] = $CliBinDir }
if ($ForceCli) { $CliArgs['Force'] = $true }

$SkillArgs = @{
    Tool = $Tool
    Scope = $Scope
    Mode = $SkillMode
}
if ($SkillTarget) { $SkillArgs['Target'] = $SkillTarget }

& (Join-Path $ScriptDir 'install-cli.ps1') @CliArgs
& (Join-Path $ScriptDir 'install-skills.ps1') @SkillArgs

Write-Host 'bootstrap 완료'
Write-Host "  tool: $Tool"
Write-Host "  scope: $Scope"
Write-Host "  skill_mode: $SkillMode"

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
    [string]$Mode = 'copy',

    [Parameter()]
    [string]$Target,

    [Parameter()]
    [switch]$Help
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$SourceDir = Join-Path $RepoRoot 'skills'
$PublicSkillName = 'imweb'
function Show-Usage {
    @"
imweb skills self-install helper

Usage:
  ./install/install-skills.ps1 -Tool codex|claude -Scope user|project [-Mode copy|symlink] [-Target PATH]
  ./install/install-skills.ps1 -Help

Options:
  -Tool    설치 대상 도구. codex 또는 claude
  -Scope   설치 범위. user 또는 project
  -Mode    설치 방식. copy 또는 symlink. 기본값: copy
  -Target  기본 discovery 경로 대신 사용할 대상 경로
  -Help    도움말 출력

기본 대상 경로:
  codex user    -> `$env:CODEX_HOME/skills 또는 `$HOME/.codex/skills
  codex project -> <repo>/.codex/skills
  claude user   -> `$HOME/.claude/skills
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
"@
}

function Fail([string]$Message) {
    Write-Error $Message
    exit 1
}

function Get-CanonicalPath([string]$Path) {
    return (Resolve-Path -LiteralPath $Path).ProviderPath
}

function Test-IsSymbolicLink([System.IO.FileSystemInfo]$Item) {
    # shell 계약과 동일하게 실제 symbolic link만 skip 대상으로 인정합니다.
    return $Item.LinkType -eq 'SymbolicLink'
}

function Get-SymbolicLinkTargetCanonicalPath([System.IO.FileSystemInfo]$Item) {
    $TargetPath = $null
    if ($Item.PSObject.Properties.Name -contains 'ResolvedTarget' -and $Item.ResolvedTarget) {
        $TargetPath = [string]$Item.ResolvedTarget
    }
    elseif ($Item.PSObject.Properties.Name -contains 'Target' -and $Item.Target) {
        if ($Item.Target -is [array]) {
            $TargetPath = [string]$Item.Target[0]
        }
        else {
            $TargetPath = [string]$Item.Target
        }
    }

    if (-not $TargetPath) {
        return Get-CanonicalPath -Path $Item.FullName
    }

    if (-not [System.IO.Path]::IsPathRooted($TargetPath)) {
        $TargetPath = Join-Path $Item.DirectoryName $TargetPath
    }

    return Get-CanonicalPath -Path $TargetPath
}

function Get-DefaultTarget([string]$SelectedTool, [string]$SelectedScope) {
    $CodexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME '.codex' }

    switch ("$SelectedTool`:$SelectedScope") {
        'codex:user' { return (Join-Path $CodexHome 'skills') }
        'codex:project' { return (Join-Path (Join-Path $RepoRoot '.codex') 'skills') }
        'claude:user' { return (Join-Path $HOME '.claude/skills') }
        'claude:project' { return (Join-Path $RepoRoot '.claude/skills') }
        default { throw '기본 대상 경로를 계산하지 못했습니다.' }
    }
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
if (-not (Test-Path -LiteralPath $SourceDir -PathType Container)) {
    Fail "source skills 디렉터리가 없습니다: $SourceDir"
}

if (-not $Target) {
    $Target = Get-DefaultTarget -SelectedTool $Tool -SelectedScope $Scope
}

if (-not (Test-Path -LiteralPath $Target -PathType Container)) {
    New-Item -ItemType Directory -Path $Target -Force | Out-Null
}

$PublicSkillDir = Join-Path $SourceDir $PublicSkillName
if (-not (Test-Path -LiteralPath $PublicSkillDir -PathType Container)) {
    Fail "공개 skill 디렉터리가 없습니다: $PublicSkillDir"
}
if (-not (Test-Path -LiteralPath (Join-Path $PublicSkillDir 'SKILL.md') -PathType Leaf)) {
    Fail "공개 skill 엔트리 파일이 없습니다: $(Join-Path $PublicSkillDir 'SKILL.md')"
}
$SkillDirs = @(Get-Item -LiteralPath $PublicSkillDir)

$Conflicts = @()
foreach ($SkillDir in $SkillDirs) {
    $TargetSkill = Join-Path $Target $SkillDir.Name
    if (Test-Path -LiteralPath $TargetSkill) {
        $TargetItem = Get-Item -LiteralPath $TargetSkill -Force
        if ($Mode -eq 'symlink' -and (Test-IsSymbolicLink -Item $TargetItem)) {
            $TargetReal = Get-SymbolicLinkTargetCanonicalPath -Item $TargetItem
            $SourceReal = Get-CanonicalPath -Path $SkillDir.FullName
            if ($TargetReal -eq $SourceReal) {
                continue
            }
        }
        $Conflicts += $TargetSkill
    }
}

if ($Conflicts.Count -gt 0) {
    $ConflictText = ($Conflicts | ForEach-Object { "- $_" }) -join [Environment]::NewLine
    Fail "기존 skill 경로와 충돌해서 설치를 중단합니다.`n$ConflictText"
}

$InstalledCount = 0
$SkippedCount = 0
foreach ($SkillDir in $SkillDirs) {
    $TargetSkill = Join-Path $Target $SkillDir.Name
    if (Test-Path -LiteralPath $TargetSkill) {
        $SkippedCount += 1
        continue
    }

    if ($Mode -eq 'copy') {
        Copy-Item -LiteralPath $SkillDir.FullName -Destination $TargetSkill -Recurse
        $InstalledCount += 1
        continue
    }

    try {
        New-Item -ItemType SymbolicLink -Path $TargetSkill -Target $SkillDir.FullName -ErrorAction Stop | Out-Null
        $InstalledCount += 1
    }
    catch {
        Fail "심볼릭 링크를 만들지 못했습니다: $TargetSkill`nWindows에서는 관리자 권한이나 Developer Mode가 필요할 수 있습니다."
    }
}

Write-Host '설치 완료'
Write-Host "  tool: $Tool"
Write-Host "  scope: $Scope"
Write-Host "  mode: $Mode"
Write-Host "  target: $Target"
Write-Host "  installed_skills: $InstalledCount"
Write-Host "  skipped_existing: $SkippedCount"

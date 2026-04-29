[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet('codex', 'claude')]
    [string]$Tool,

    [Parameter()]
    [ValidateSet('user', 'project', 'local')]
    [string]$Scope = 'user',

    [Parameter()]
    [string]$Source,

    [Parameter()]
    [string]$Package,

    [Parameter()]
    [switch]$DryRun,

    [Parameter()]
    [switch]$Help
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$MarketplaceName = 'imweb-ai-toolkit'
$PluginName = 'imweb-ai-toolkit'
if (-not $Source) {
    $Source = $RepoRoot
}

function Show-Usage {
    @"
imweb plugin install helper

Usage:
  ./install/install-plugins.ps1 -Tool codex|claude [-Scope user|project|local] [-Source PATH] [-DryRun]
  ./install/install-plugins.ps1 -Package PATH [-DryRun]
  ./install/install-plugins.ps1 -Help

Options:
  -Tool     Plugin 설치 대상 도구. codex 또는 claude
  -Scope    Claude 설치 범위. user, project, local. 기본값: user
            Codex는 현재 marketplace 등록까지만 자동화합니다.
  -Source   marketplace source. 기본값: 이 toolkit repo root
  -Package  Claude Desktop Cowork custom upload용 plugin zip 생성 경로
  -DryRun   실행할 명령만 출력
  -Help     도움말 출력
"@
}

function Fail([string]$Message) {
    Write-Error $Message
    exit 1
}

function Invoke-CommandChecked([string[]]$Command) {
    Write-Host ('+ ' + ($Command -join ' '))
    if ($DryRun) {
        return
    }
    $CommandArgs = @($Command | Select-Object -Skip 1)
    & $Command[0] @CommandArgs
    if ($LASTEXITCODE -ne 0) {
        Fail "명령 실행에 실패했습니다: $($Command -join ' ')"
    }
}

function Assert-Command([string]$Name) {
    if ($DryRun) {
        return
    }
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Fail "필수 명령을 찾지 못했습니다: $Name"
    }
}

function New-PluginPackage([string]$OutputPath) {
    if (-not $OutputPath) {
        Fail '-Package 경로가 필요합니다.'
    }
    if ($DryRun) {
        Write-Host "+ package imweb-ai-toolkit $OutputPath"
        return
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    if ($OutputPath.StartsWith('~')) {
        $ResolvedOutput = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputPath)
    }
    else {
        $ResolvedOutput = [System.IO.Path]::GetFullPath($OutputPath, (Get-Location).ProviderPath)
    }
    $OutputDir = Split-Path -Parent $ResolvedOutput
    if (-not (Test-Path -LiteralPath $OutputDir -PathType Container)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }
    if (Test-Path -LiteralPath $ResolvedOutput) {
        Remove-Item -LiteralPath $ResolvedOutput -Force
    }

    $Include = @(
        'README.ko.md',
        'README.ja.md',
        'README.zh-CN.md',
        'LICENSE',
        'TRADEMARKS.md',
        'package.json',
        'plugin.json',
        '.mcp.json',
        '.agents/plugins/marketplace.json',
        '.codex-plugin',
        '.claude-plugin',
        '.cursor-plugin',
        'assets',
        'docs/ai-agent-installation.md',
        'docs/cli-toolkit-integration.md',
        'docs/imweb-ai-toolkit.md',
        'docs/skill-installation-and-usage.md',
        'docs/surface-support-matrix.md',
        'examples',
        'install',
        'skills/imweb'
    )

    $Archive = [System.IO.Compression.ZipFile]::Open($ResolvedOutput, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        $Seen = New-Object 'System.Collections.Generic.HashSet[string]'
        $ReadmeSource = Join-Path $RepoRoot 'docs/public-root-readme.md'
        if (-not (Test-Path -LiteralPath $ReadmeSource -PathType Leaf)) {
            $ReadmeSource = Join-Path $RepoRoot 'README.md'
        }
        if (-not (Test-Path -LiteralPath $ReadmeSource -PathType Leaf)) {
            Fail 'package source missing: README.md'
        }
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($Archive, $ReadmeSource, 'README.md') | Out-Null
        $Seen.Add('README.md') | Out-Null

        foreach ($Relative in $Include) {
            $SourcePath = Join-Path $RepoRoot $Relative
            if (-not (Test-Path -LiteralPath $SourcePath)) {
                Fail "package source missing: $Relative"
            }
            $Items = if (Test-Path -LiteralPath $SourcePath -PathType Leaf) {
                @(Get-Item -LiteralPath $SourcePath -Force)
            }
            else {
                @(Get-ChildItem -LiteralPath $SourcePath -Force -Recurse -File)
            }
            foreach ($Item in $Items) {
                if ($Item.FullName -match '(__pycache__|\.DS_Store)$') {
                    continue
                }
                $EntryName = [System.IO.Path]::GetRelativePath($RepoRoot, $Item.FullName).Replace('\', '/')
                if (-not $Seen.Add($EntryName)) {
                    continue
                }
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($Archive, $Item.FullName, $EntryName) | Out-Null
            }
        }
        Write-Host 'plugin package created'
        Write-Host "  path: $ResolvedOutput"
        Write-Host "  files: $($Seen.Count)"
    }
    finally {
        $Archive.Dispose()
    }
}

if ($Help) {
    Show-Usage
    exit 0
}

if ($Package) {
    New-PluginPackage -OutputPath $Package
}

if (-not $Tool) {
    if ($Package) {
        exit 0
    }
    Fail '-Tool 또는 -Package 중 하나는 필요합니다.'
}

switch ($Tool) {
    'codex' {
        Assert-Command 'codex'
        Invoke-CommandChecked @('codex', 'plugin', 'marketplace', 'add', $Source)
        if ($DryRun) {
            Write-Host 'Codex marketplace 등록 dry-run 완료'
        }
        else {
            Write-Host 'Codex marketplace 등록 완료'
        }
        Write-Host "  marketplace: $MarketplaceName"
        Write-Host "  plugin: $PluginName"
        Write-Host '  next: Codex App 또는 Codex CLI /plugins 화면에서 plugin을 설치하세요.'
    }
    'claude' {
        Assert-Command 'claude'
        Invoke-CommandChecked @('claude', 'plugin', 'marketplace', 'add', $Source)
        Invoke-CommandChecked @('claude', 'plugin', 'install', "$PluginName@$MarketplaceName", '--scope', $Scope)
        if ($DryRun) {
            Write-Host 'Claude plugin 설치 dry-run 완료'
        }
        else {
            Write-Host 'Claude plugin 설치 완료'
        }
        Write-Host "  marketplace: $MarketplaceName"
        Write-Host "  plugin: $PluginName"
        Write-Host "  scope: $Scope"
    }
}

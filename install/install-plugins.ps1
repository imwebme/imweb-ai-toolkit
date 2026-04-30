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
    [string]$SkillPackage,

    [Parameter()]
    [string]$Mcpb,

    [Parameter()]
    [switch]$NoInstallCli,

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
  ./install/install-plugins.ps1 -SkillPackage PATH [-DryRun]
  ./install/install-plugins.ps1 -Mcpb PATH [-DryRun]
  ./install/install-plugins.ps1 -Help

Options:
  -Tool     Plugin 설치 대상 도구. codex 또는 claude
  -Scope    Claude 설치 범위. user, project, local. 기본값: user
            Codex는 현재 marketplace 등록까지만 자동화합니다.
  -Source   marketplace source. 기본값: 이 toolkit repo root
  -Package  Claude Desktop Cowork installable plugin package 생성 경로
            Cowork 파일 카드 설치를 위해 .plugin 확장자를 권장합니다.
  -SkillPackage Claude Cowork imweb custom Skill fallback package 생성 경로
  -Mcpb     Claude Desktop MCPB bundle 생성 경로. .mcpb 확장자를 권장합니다.
  -NoInstallCli --tool codex|claude 경로에서 기본 CLI 설치/업데이트를 건너뜁니다.
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

function Install-CliIfNeeded {
    if ($NoInstallCli) {
        return
    }
    $Installer = Join-Path $ScriptDir 'install-cli.ps1'
    Write-Host "+ $Installer"
    if ($DryRun) {
        return
    }
    & $Installer
    if ($LASTEXITCODE -ne 0) {
        Fail "명령 실행에 실패했습니다: $Installer"
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
        'bin',
        'commands',
        'docs/ai-agent-installation.md',
        'docs/cli-toolkit-integration.md',
        'docs/cowork-ask-claude-install.md',
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
        $Suffix = [System.IO.Path]::GetExtension($ResolvedOutput).ToLowerInvariant()
        if ($Suffix -and $Suffix -ne '.plugin') {
            Write-Warning "Cowork install cards expect a .plugin extension; got $Suffix"
        }
        Write-Host 'plugin package created'
        Write-Host "  path: $ResolvedOutput"
        Write-Host "  files: $($Seen.Count)"
    }
    finally {
        $Archive.Dispose()
    }
}

function New-SkillPackage([string]$OutputPath) {
    if (-not $OutputPath) {
        Fail '-SkillPackage 경로가 필요합니다.'
    }
    if ($DryRun) {
        Write-Host "+ package imweb skill $OutputPath"
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

    $SkillRoot = Join-Path $RepoRoot 'skills/imweb'
    $SkillEntry = Join-Path $SkillRoot 'SKILL.md'
    if (-not (Test-Path -LiteralPath $SkillEntry -PathType Leaf)) {
        Fail 'skill source missing: skills/imweb/SKILL.md'
    }

    $Archive = [System.IO.Compression.ZipFile]::Open($ResolvedOutput, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        $Seen = New-Object 'System.Collections.Generic.HashSet[string]'
        $Items = @(Get-ChildItem -LiteralPath $SkillRoot -Force -Recurse -File)
        foreach ($Item in $Items) {
            if ($Item.FullName -match '(__pycache__|\.DS_Store)$') {
                continue
            }
            $Rel = [System.IO.Path]::GetRelativePath($SkillRoot, $Item.FullName).Replace('\', '/')
            $EntryName = "imweb/$Rel"
            if (-not $Seen.Add($EntryName)) {
                continue
            }
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($Archive, $Item.FullName, $EntryName) | Out-Null
        }
        $Suffix = [System.IO.Path]::GetExtension($ResolvedOutput).ToLowerInvariant()
        if ($Suffix -and $Suffix -ne '.skill') {
            Write-Warning "Claude skill install cards expect a .skill extension; got $Suffix"
        }
        Write-Host 'skill package created'
        Write-Host "  path: $ResolvedOutput"
        Write-Host "  files: $($Seen.Count)"
    }
    finally {
        $Archive.Dispose()
    }
}

function New-McpbPackage([string]$OutputPath) {
    if (-not $OutputPath) {
        Fail '-Mcpb 경로가 필요합니다.'
    }
    if ($DryRun) {
        Write-Host "+ package imweb MCPB $OutputPath"
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

    $PackageJson = Get-Content -LiteralPath (Join-Path $RepoRoot 'package.json') -Raw | ConvertFrom-Json
    $Manifest = [ordered]@{
        manifest_version = '0.3'
        name = 'imweb-ai-toolkit'
        display_name = 'imweb AI Toolkit'
        version = $PackageJson.version
        description = 'Connects Claude Desktop to the local imweb CLI through a local MCP bridge. The bridge installs or updates the CLI when needed and reuses local auth.'
        long_description = 'Use imweb orders, products, members, site, promotion, community, and script tools from Claude Desktop through the official imweb CLI. The extension runs locally through stdio and keeps CLI installation, updates, and browser login onboarding inside the guided tool flow.'
        author = [ordered]@{
            name = 'imweb'
            url = 'https://github.com/imwebme'
        }
        repository = [ordered]@{
            type = 'git'
            url = 'https://github.com/imwebme/imweb-ai-toolkit.git'
        }
        homepage = 'https://github.com/imwebme/imweb-ai-toolkit'
        documentation = 'https://github.com/imwebme/imweb-ai-toolkit#readme'
        support = 'https://github.com/imwebme/imweb-ai-toolkit/issues'
        server = [ordered]@{
            type = 'node'
            entry_point = 'bin/imweb-mcp.mjs'
            mcp_config = [ordered]@{
                command = 'node'
                args = @('${__dirname}/bin/imweb-mcp.mjs')
                env = [ordered]@{
                    NO_COLOR = '1'
                }
            }
        }
        tools = @(
            [ordered]@{ name = 'imweb_cli_check'; description = 'Check the local imweb CLI installation.' },
            [ordered]@{ name = 'imweb_cli_install'; description = 'Install or update the local imweb CLI.' },
            [ordered]@{ name = 'imweb_auth_status'; description = 'Check local imweb CLI login status.' },
            [ordered]@{ name = 'imweb_auth_login'; description = 'Start browser login for the local imweb CLI.' },
            [ordered]@{ name = 'imweb_context'; description = 'Read the active imweb site context.' },
            [ordered]@{ name = 'imweb_command_capabilities'; description = 'List supported imweb CLI capabilities.' },
            [ordered]@{ name = 'imweb_order_list'; description = 'List imweb orders.' },
            [ordered]@{ name = 'imweb_order_get'; description = 'Read a specific imweb order.' },
            [ordered]@{ name = 'imweb_product_list'; description = 'List imweb products.' },
            [ordered]@{ name = 'imweb_product_get'; description = 'Read a specific imweb product.' },
            [ordered]@{ name = 'imweb_member_list'; description = 'List imweb members.' }
        )
        tools_generated = $true
        keywords = @('imweb', 'commerce', 'orders', 'products', 'mcp')
        license = 'Apache-2.0'
        privacy_policies = @('https://imweb.me/privacy')
        compatibility = [ordered]@{
            claude_desktop = '>=1.0.0'
            platforms = @('darwin', 'win32')
            runtimes = [ordered]@{
                node = '>=18.0.0'
            }
        }
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
        'bin',
        'commands',
        'docs/ai-agent-installation.md',
        'docs/cli-toolkit-integration.md',
        'docs/cowork-ask-claude-install.md',
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
        $ManifestJson = $Manifest | ConvertTo-Json -Depth 12
        $Entry = $Archive.CreateEntry('manifest.json')
        $ManifestStream = $Entry.Open()
        $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
        $Writer = New-Object System.IO.StreamWriter -ArgumentList $ManifestStream, $Utf8NoBom
        try {
            $Writer.Write($ManifestJson)
        }
        finally {
            $Writer.Dispose()
        }
        $Seen.Add('manifest.json') | Out-Null

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
                if ($EntryName -eq 'manifest.json' -or -not $Seen.Add($EntryName)) {
                    continue
                }
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($Archive, $Item.FullName, $EntryName) | Out-Null
            }
        }
        $Suffix = [System.IO.Path]::GetExtension($ResolvedOutput).ToLowerInvariant()
        if ($Suffix -and $Suffix -ne '.mcpb') {
            Write-Warning "Claude Desktop bundles expect a .mcpb extension; got $Suffix"
        }
        Write-Host 'mcpb package created'
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

if ($SkillPackage) {
    New-SkillPackage -OutputPath $SkillPackage
}

if ($Mcpb) {
    New-McpbPackage -OutputPath $Mcpb
}

if (-not $Tool) {
    if ($Package -or $SkillPackage -or $Mcpb) {
        exit 0
    }
    Fail '-Tool, -Package, -SkillPackage, -Mcpb 중 하나는 필요합니다.'
}

switch ($Tool) {
    'codex' {
        Assert-Command 'codex'
        Install-CliIfNeeded
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
        Install-CliIfNeeded
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

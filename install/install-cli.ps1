[CmdletBinding()]
param(
    [Parameter()]
    [string]$ManifestUrl,

    [Parameter()]
    [string]$ManifestFile,

    [Parameter()]
    [string]$InstallRoot,

    [Parameter()]
    [string]$BinDir,

    [Parameter()]
    [switch]$Force,

    [Parameter()]
    [switch]$Help
)

function Show-Usage {
    @"
imweb CLI installer

Usage:
  ./install/install-cli.ps1 [-ManifestUrl URL | -ManifestFile PATH] [-InstallRoot PATH] [-BinDir PATH] [-Force]
  ./install/install-cli.ps1 -Help

Options:
  -ManifestUrl   public stable channel pointer 또는 release manifest URL. 기본값: imweb-cli-release stable pointer
  -ManifestFile  로컬 manifest 파일 경로. fixture/local 검증용
  -InstallRoot   CLI 설치 루트
  -BinDir        실행 파일을 둘 디렉터리
  -Force         이미 같은 버전이 있어도 다시 설치
  -Help          도움말 출력
"@
}

function Fail([string]$Message) {
    Write-Error $Message
    exit 1
}

function Get-GitHubReleaseInfo([string]$Source) {
    try {
        $uri = [System.Uri]$Source
    }
    catch {
        return $null
    }

    if ($uri.Host -ne 'github.com') {
        return $null
    }

    $parts = $uri.AbsolutePath.Trim('/').Split('/')
    if ($parts.Length -lt 5 -or $parts[2] -ne 'releases' -or ($parts[3] -ne 'download' -and $parts[3] -ne 'latest')) {
        return $null
    }

    $assetParts = @()
    if ($parts[3] -eq 'latest') {
        if ($parts.Length -gt 5) {
            $assetParts = $parts[5..($parts.Length - 1)]
        }
    }
    elseif ($parts.Length -gt 5) {
        $assetParts = $parts[5..($parts.Length - 1)]
    }

    $tag = if ($parts[3] -eq 'latest') { 'latest' } else { $parts[4] }

    if (-not $parts[0] -or -not $parts[1] -or -not $tag -or -not $assetParts) {
        return $null
    }

    return [pscustomobject]@{
        Repo = "$($parts[0])/$($parts[1])"
        Tag = $tag
        Asset = ($assetParts -join '/')
    }
}

function Download-GitHubReleaseAsset([string]$Source, [string]$Destination) {
    $gh = Get-Command gh -ErrorAction SilentlyContinue
    if (-not $gh) {
        return $false
    }

    $info = Get-GitHubReleaseInfo -Source $Source
    if (-not $info) {
        return $false
    }

    $ResolvedTag = $info.Tag
    if ($ResolvedTag -eq 'latest') {
        $ResolvedTag = & gh api "repos/$($info.Repo)/releases/latest" --jq '.tag_name'
        if (-not $ResolvedTag) {
            return $false
        }
    }

    $TmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("imweb-cli-gh-" + [System.Guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

    try {
        & gh release download $ResolvedTag -R $info.Repo -p $info.Asset -D $TmpDir | Out-Null
        if ($LASTEXITCODE -ne 0) {
            return $false
        }

        $Downloaded = Get-ChildItem -LiteralPath $TmpDir -File -Filter $info.Asset | Select-Object -First 1
        if (-not $Downloaded) {
            return $false
        }

        Copy-Item -LiteralPath $Downloaded.FullName -Destination $Destination -Force
        return $true
    }
    catch {
        return $false
    }
    finally {
        if (Test-Path -LiteralPath $TmpDir) {
            Remove-Item -LiteralPath $TmpDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Write-ManifestFetchHint {
    Write-Host '다음 중 하나로 다시 시도하세요.'
    Write-Host '- 기본 public stable pointer fetch에는 gh auth가 필요하지 않습니다.'
    Write-Host '- authenticated GitHub Release override를 쓰는 경우에만 GitHub 계정, gh auth login, repo read 권한이 필요할 수 있습니다.'
    Write-Host '- install-cli를 직접 실행 중이면 remote manifest override에 -ManifestUrl, 로컬 fixture에는 -ManifestFile을 사용합니다.'
    Write-Host '- bootstrap-imweb.ps1를 다시 실행할 때는 remote manifest override에 -CliManifestUrl, 로컬 fixture에는 -CliManifestFile을 사용합니다.'
    Write-Host '- 이미 imweb CLI가 설치되어 있으면 install-skills.ps1로 skill만 연결할 수 있습니다.'
}

function Write-PathNote([string]$SelectedBinDir) {
    if (-not $IsWindows) {
        return
    }

    $CurrentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if (-not $CurrentPath) {
        $CurrentPath = ''
    }

    if (-not ($CurrentPath -split ';' | Where-Object { $_ -eq $SelectedBinDir })) {
        Write-Host "  note: PowerShell을 새로 열고 '$SelectedBinDir' 디렉터리를 사용자 PATH에 추가해야 바로 imweb를 실행할 수 있습니다."
    }
}

function Get-PlatformKey {
    if ([System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::OSX)) {
        $os = 'macos'
    }
    elseif ([System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::Linux)) {
        $os = 'linux'
    }
    elseif ([System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::Windows)) {
        $os = 'windows'
    }
    else {
        Fail '지원하지 않는 운영체제입니다.'
    }

    switch ([System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString().ToLowerInvariant()) {
        'x64' {
            $arch = 'x86_64'
        }
        'arm64' { $arch = 'arm64' }
        default { Fail '지원하지 않는 아키텍처입니다.' }
    }

    return "$os-$arch"
}

function Get-DefaultInstallRoot {
    if ($IsWindows) {
        return (Join-Path $env:LOCALAPPDATA 'imweb-cli')
    }

    return (Join-Path $HOME '.local/share/imweb-cli')
}

function Get-DefaultBinDir {
    if ($IsWindows) {
        return (Join-Path (Get-DefaultInstallRoot) 'bin')
    }

    return (Join-Path $HOME '.local/bin')
}

function Read-ManifestText([string]$Source) {
    if ($Source.StartsWith('http://') -or $Source.StartsWith('https://')) {
        $tmpFile = Join-Path ([System.IO.Path]::GetTempPath()) ("imweb-cli-manifest-" + [System.Guid]::NewGuid().ToString('N'))
        try {
            if ($Source.StartsWith('https://github.com/')) {
                try {
                    Invoke-WebRequest -Uri $Source -OutFile $tmpFile -UseBasicParsing | Out-Null
                    return [System.IO.File]::ReadAllText($tmpFile)
                }
                catch {
                    if (Download-GitHubReleaseAsset -Source $Source -Destination $tmpFile) {
                        return [System.IO.File]::ReadAllText($tmpFile)
                    }
                    throw
                }
            }

            return (Invoke-WebRequest -Uri $Source -UseBasicParsing).Content
        }
        finally {
            if (Test-Path -LiteralPath $tmpFile) {
                Remove-Item -LiteralPath $tmpFile -Force -ErrorAction SilentlyContinue
            }
        }
    }

    if ($Source.StartsWith('file://')) {
        $uri = [System.Uri]$Source
        return [System.IO.File]::ReadAllText($uri.LocalPath)
    }

    return [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $Source))
}

function Resolve-AssetSource([string]$Value, [string]$ManifestBase) {
    if ($Value.StartsWith('http://') -or $Value.StartsWith('https://') -or $Value.StartsWith('file://')) {
        return $Value
    }

    if ($ManifestBase) {
        return (Join-Path $ManifestBase $Value)
    }

    return $Value
}

function Get-ManifestBaseFromSource([string]$Source) {
    if ($Source.StartsWith('file://')) {
        $uri = [System.Uri]$Source
        return (Split-Path -Parent $uri.LocalPath)
    }

    if ($Source.StartsWith('http://') -or $Source.StartsWith('https://')) {
        return ''
    }

    return (Split-Path -Parent ((Resolve-Path -LiteralPath $Source).Path))
}

function Copy-Asset([string]$Source, [string]$Destination) {
    if ($Source.StartsWith('http://') -or $Source.StartsWith('https://')) {
        if ($Source.StartsWith('https://github.com/')) {
            try {
                Invoke-WebRequest -Uri $Source -OutFile $Destination -UseBasicParsing | Out-Null
                return
            }
            catch {
                if (Download-GitHubReleaseAsset -Source $Source -Destination $Destination) {
                    return
                }
                throw
            }
        }

        Invoke-WebRequest -Uri $Source -OutFile $Destination -UseBasicParsing | Out-Null
        return
    }

    if ($Source.StartsWith('file://')) {
        $uri = [System.Uri]$Source
        Copy-Item -LiteralPath $uri.LocalPath -Destination $Destination -Force
        return
    }

    Copy-Item -LiteralPath $Source -Destination $Destination -Force
}

function Get-FileSha256([string]$Path) {
    return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

function Expand-ReleaseArchive([string]$Archive, [string]$Destination) {
    New-Item -ItemType Directory -Force -Path $Destination | Out-Null

    if ($Archive.EndsWith('.zip')) {
        Expand-Archive -LiteralPath $Archive -DestinationPath $Destination -Force
        return
    }

    if ($Archive.EndsWith('.tar.gz')) {
        tar -xzf $Archive -C $Destination
        return
    }

    Fail "지원하지 않는 archive 형식입니다: $Archive"
}

if ($Help) {
    Show-Usage
    exit 0
}

if ($ManifestUrl -and $ManifestFile) {
    Fail '-ManifestUrl과 -ManifestFile은 동시에 사용할 수 없습니다.'
}

if (-not $ManifestUrl -and -not $ManifestFile) {
    $ManifestUrl = 'https://raw.githubusercontent.com/imwebme/imweb-cli-release/main/channels/stable.json'
}

if (-not $InstallRoot) {
    $InstallRoot = Get-DefaultInstallRoot
}
if (-not $BinDir) {
    $BinDir = Get-DefaultBinDir
}

$ManifestSource = if ($ManifestFile) { $ManifestFile } else { $ManifestUrl }
$IsDefaultManifestSource = -not $ManifestFile -and -not $PSBoundParameters.ContainsKey('ManifestUrl')
if ($ManifestFile -and -not (Test-Path -LiteralPath $ManifestFile -PathType Leaf)) {
    Fail "manifest 파일을 찾을 수 없습니다: $ManifestFile"
}

$Platform = Get-PlatformKey
$ManifestText = $null
try {
    $ManifestText = Read-ManifestText -Source $ManifestSource
}
catch {
    if ($IsDefaultManifestSource) {
        Write-ManifestFetchHint
    }
    Fail "manifest를 읽지 못했습니다: $ManifestSource"
}
$Manifest = $ManifestText | ConvertFrom-Json
if (-not $Manifest.assets -and $Manifest.PSObject.Properties.Name -contains 'release_manifest_url') {
    if (-not $Manifest.release_manifest_url) {
        Fail 'stable channel pointer에 release_manifest_url이 없습니다.'
    }

    $ManifestSource = [string]$Manifest.release_manifest_url
    try {
        $ManifestText = Read-ManifestText -Source $ManifestSource
    }
    catch {
        Fail "release-manifest를 읽지 못했습니다: $ManifestSource"
    }
    $Manifest = $ManifestText | ConvertFrom-Json
}

$Asset = $Manifest.assets | Where-Object { $_.platform -eq $Platform } | Select-Object -First 1

if (-not $Asset) {
    Fail "manifest에 현재 플랫폼 자산이 없습니다: $Platform"
}

$ManifestBase = Get-ManifestBaseFromSource -Source $ManifestSource
$AssetSource = Resolve-AssetSource -Value $Asset.url -ManifestBase $ManifestBase
$VersionFile = Join-Path $InstallRoot 'current-version.txt'
$ReleaseDir = Join-Path $InstallRoot "releases/$($Manifest.version)/$Platform"
$CurrentVersion = if (Test-Path -LiteralPath $VersionFile -PathType Leaf) { Get-Content -LiteralPath $VersionFile -Raw } else { '' }
$BinaryName = if ($IsWindows) { 'imweb.exe' } else { 'imweb' }
$BinPath = Join-Path $BinDir $BinaryName

if (-not $Force -and $CurrentVersion.Trim() -eq $Manifest.version -and (Test-Path -LiteralPath $BinPath -PathType Leaf)) {
    Write-Host '이미 최신 버전이 설치되어 있어 건너뜁니다.'
    Write-Host "  version: $($Manifest.version)"
    Write-Host "  bin_dir: $BinDir"
    Write-Host "  bin: $BinPath"
    Write-PathNote -SelectedBinDir $BinDir
    exit 0
}

$WorkDir = Join-Path ([System.IO.Path]::GetTempPath()) ("imweb-cli-install-" + [System.Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null

try {
    $ArchivePath = Join-Path $WorkDir ([System.IO.Path]::GetFileName($Asset.archive))
    Copy-Asset -Source $AssetSource -Destination $ArchivePath
}
catch {
    if ($AssetSource.StartsWith('http://') -or $AssetSource.StartsWith('https://')) {
        Fail "asset을 내려받지 못했습니다: $AssetSource"
    }
    throw
}

try {

    $ActualSha = Get-FileSha256 -Path $ArchivePath
    if ($ActualSha -ne $Asset.sha256.ToLowerInvariant()) {
        Fail "checksum 검증에 실패했습니다. expected=$($Asset.sha256) actual=$ActualSha"
    }

    $TempRelease = Join-Path $WorkDir 'release'
    Expand-ReleaseArchive -Archive $ArchivePath -Destination $TempRelease

    $ExtractedBinary = Join-Path $TempRelease $BinaryName
    if (-not (Test-Path -LiteralPath $ExtractedBinary -PathType Leaf)) {
        if (-not $IsWindows) {
            $ExtractedBinary = Join-Path $TempRelease 'imweb'
        }
    }
    if (-not (Test-Path -LiteralPath $ExtractedBinary -PathType Leaf)) {
        Fail "archive 안에 실행 파일이 없습니다: $($Asset.archive)"
    }

    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $ReleaseDir) | Out-Null
    New-Item -ItemType Directory -Force -Path $BinDir | Out-Null
    if (Test-Path -LiteralPath $ReleaseDir) {
        Remove-Item -LiteralPath $ReleaseDir -Recurse -Force
    }
    Move-Item -LiteralPath $TempRelease -Destination $ReleaseDir

    $InstalledBinary = Join-Path $ReleaseDir $BinaryName
    if (-not (Test-Path -LiteralPath $InstalledBinary -PathType Leaf) -and -not $IsWindows) {
        $InstalledBinary = Join-Path $ReleaseDir 'imweb'
    }

    Copy-Item -LiteralPath $InstalledBinary -Destination $BinPath -Force
    Set-Content -LiteralPath $VersionFile -Value $Manifest.version -NoNewline

    $VersionCheck = & $BinPath --version 2>$null

    Write-Host 'CLI 설치 완료'
    Write-Host "  version: $($Manifest.version)"
    Write-Host "  tag: $($Manifest.tag)"
    Write-Host "  platform: $Platform"
    Write-Host "  install_root: $InstallRoot"
    Write-Host "  bin_dir: $BinDir"
    Write-Host "  bin: $BinPath"
    if ($VersionCheck) {
        Write-Host "  version_check: $VersionCheck"
    }
    Write-PathNote -SelectedBinDir $BinDir
}
finally {
    if (Test-Path -LiteralPath $WorkDir) {
        Remove-Item -LiteralPath $WorkDir -Recurse -Force
    }
}

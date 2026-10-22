# MargenListo V6.0 - Compilacion DEBUG independiente en Windows.
# No desactiva Defender ni realiza publicaciones.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$Project = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $Project

function Fail([string]$Message) { throw "No se puede compilar: $Message" }
if (-not (Get-Command 'java' -ErrorAction SilentlyContinue)) { Fail 'Instala Java JDK 17 y configurá JAVA_HOME.' }
$JavaInfo = (& java --version | Select-Object -First 1) -join ''
if ($JavaInfo -notmatch '(^|\s)17(\.|\s)') { Fail ('Se necesita JDK 17. Detecté: ' + $JavaInfo) }
$SDK = $env:ANDROID_SDK_ROOT
if (-not $SDK) { $SDK = $env:ANDROID_HOME }
if (-not $SDK) { $SDK = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
if (-not (Test-Path $SDK)) { Fail 'Falta Android SDK. Instalalo desde Android Studio (SDK Manager).' }
$env:ANDROID_HOME = $SDK
$env:ANDROID_SDK_ROOT = $SDK
if (-not (Test-Path (Join-Path $SDK 'platforms\android-36'))) { Fail 'Instalá Android API 36 desde SDK Manager.' }
if (-not (Test-Path (Join-Path $SDK 'build-tools\35.0.0\apksigner.bat'))) { Fail 'Instalá Android Build Tools 35.0.0.' }

$ToolsDir = Join-Path $Project '.build-tools'
$GradleDir = Join-Path $ToolsDir 'gradle-8.13'
$GradleBat = Join-Path $GradleDir 'bin\gradle.bat'
if (-not (Test-Path $GradleBat)) {
    New-Item -ItemType Directory -Path $ToolsDir -Force | Out-Null
    $Zip = Join-Path $ToolsDir 'gradle-8.13-bin.zip'
    $Url = 'https://services.gradle.org/distributions/gradle-8.13-bin.zip'
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Write-Host 'Descargando Gradle 8.13 desde el sitio oficial...'
    Invoke-WebRequest -Uri $Url -OutFile $Zip -UseBasicParsing
    $Expected = ((Invoke-WebRequest -Uri ($Url + '.sha256') -UseBasicParsing).Content | Out-String).Trim().Split(' ')[0].Trim().ToLowerInvariant()
    if ($Expected -notmatch '^[a-f0-9]{64}$') { Fail 'No pude obtener el hash SHA256 oficial de Gradle.' }
    $Actual = (Get-FileHash -Algorithm SHA256 $Zip).Hash.ToLowerInvariant()
    if ($Actual -ne $Expected) { Remove-Item $Zip -Force; Fail 'Checksum SHA256 de Gradle incorrecto.' }
    Expand-Archive -Path $Zip -DestinationPath $ToolsDir -Force
    Remove-Item $Zip -Force
}

Write-Host 'Compilando APK de depuracion (necesita acceso a Google Maven en el primer intento)...'
& $GradleBat ':app:assembleDebug' '--no-daemon'
if ($LASTEXITCODE -ne 0) { Fail 'Gradle devolvio un error. Revisá el texto que aparece arriba.' }
$APK = Join-Path $Project 'app\build\outputs\apk\debug\app-debug.apk'
if (-not (Test-Path $APK)) { Fail 'Gradle no genero app-debug.apk.' }
$Signer = Join-Path $SDK 'build-tools\35.0.0\apksigner.bat'
& $Signer verify --verbose $APK
if ($LASTEXITCODE -ne 0) { Fail 'El APK no tiene una firma valida.' }
$Hash = (Get-FileHash -Algorithm SHA256 $APK).Hash
Write-Host "APK creado: $APK"
Write-Host "SHA256: $Hash"
Write-Host 'Es una compilacion DEBUG para pruebas, NO es la version de Google Play.'

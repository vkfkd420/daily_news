# Daily News — OpenAI API (방법 A) 자동화 설정
# 사용:
#   .\scripts\setup-automation.ps1
#   .\scripts\setup-automation.ps1 -ApiKey "sk-..." -NonInteractive
#   npm run setup:automation

param(
  [string]$ApiKey = "",
  [string]$Model = "gpt-4o-mini",
  [switch]$NonInteractive,
  [switch]$SkipSyncTest,
  [switch]$SkipScheduledTask,
  [switch]$RegisterOnly
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=== Daily News — OpenAI API 자동 연동 (A) ===" -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $ProjectRoot ".env"
$examplePath = Join-Path $ProjectRoot ".env.example"

if (-not (Test-Path $envPath)) {
  if (Test-Path $examplePath) { Copy-Item $examplePath $envPath }
  else { New-Item -ItemType File -Path $envPath | Out-Null }
}

function Get-EnvValue([string]$name) {
  if (-not (Test-Path $envPath)) { return "" }
  foreach ($line in Get-Content $envPath) {
    if ($line -match "^$name=(.+)$") { return $matches[1].Trim() }
  }
  return ""
}

$currentKey = Get-EnvValue "OPENAI_API_KEY"
$currentModel = Get-EnvValue "OPENAI_MODEL"

if (-not $ApiKey -and $env:OPENAI_API_KEY) {
  $ApiKey = $env:OPENAI_API_KEY.Trim()
}

if (-not $ApiKey) {
  if ($currentKey -and $currentKey -notmatch "REPLACE|sk-\.\.\.|sk-your") {
    if ($NonInteractive) {
      $ApiKey = $currentKey
    } else {
      $useExisting = Read-Host "기존 OPENAI_API_KEY가 있습니다. 그대로 사용할까요? (Y/n)"
      if ($useExisting -eq "" -or $useExisting -match "^[Yy]") {
        $ApiKey = $currentKey
      }
    }
  }
}

if (-not $ApiKey -and -not $NonInteractive) {
  Write-Host "OpenAI API Key: https://platform.openai.com/api-keys" -ForegroundColor Yellow
  $ApiKey = Read-Host "API Key 입력 (sk-...)"
}

if ($RegisterOnly) {
  $SkipSyncTest = $true
  if (-not $ApiKey -or $ApiKey -match "REPLACE|sk-\.\.\.") {
    Write-Host "API Key 없음 — .env 템플릿만 유지, 스케줄러만 등록합니다." -ForegroundColor Yellow
    $SkipSyncTest = $true
    if (-not $ApiKey) { $ApiKey = $currentKey }
    if (-not $ApiKey) { $ApiKey = "sk-REPLACE_ME" }
  }
}

if ((-not $RegisterOnly) -and (-not $ApiKey -or $ApiKey -match "REPLACE|sk-\.\.\.")) {
  throw @"
OPENAI_API_KEY가 필요합니다.

1) .env 파일에서 OPENAI_API_KEY=sk-REPLACE_ME 를 본인 키로 수정
2) 다시 실행: npm run setup:automation

또는: .\scripts\setup-automation.ps1 -ApiKey "sk-..." -NonInteractive
"@
}

if (-not $NonInteractive) {
  $inputModel = Read-Host "모델 [기본: gpt-4o-mini / gpt-4o]"
  if ($inputModel) { $Model = $inputModel }
} elseif ($currentModel) {
  $Model = $currentModel
}

$envLines = @{
  "VITE_APP_NAME" = "Daily News"
  "VITE_AUTO_SYNC_ON_LOAD" = "true"
  "OPENAI_API_KEY" = $ApiKey
  "OPENAI_MODEL" = $Model
  "BRIEFING_SYNC_MODE" = "openai"
  "BRIEFING_AUTO_SYNC" = "true"
  "BRIEFING_SYNC_HOUR" = "8"
  "BRIEFING_SYNC_MINUTE" = "0"
}

$existing = @{}
if (Test-Path $envPath) {
  Get-Content $envPath | ForEach-Object {
    if ($_ -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
      $existing[$matches[1]] = $matches[2]
    }
  }
}

foreach ($key in $envLines.Keys) {
  $existing[$key] = $envLines[$key]
}

$order = @(
  "VITE_APP_NAME", "VITE_AUTO_SYNC_ON_LOAD",
  "OPENAI_API_KEY", "OPENAI_MODEL", "BRIEFING_SYNC_MODE",
  "BRIEFING_AUTO_SYNC", "BRIEFING_SYNC_HOUR", "BRIEFING_SYNC_MINUTE",
  "BRIEFING_SYNC_URL"
)

$written = [System.Collections.Generic.HashSet[string]]::new()
$out = [System.Collections.Generic.List[string]]::new()

foreach ($key in $order) {
  if ($existing.ContainsKey($key)) {
    $out.Add("$key=$($existing[$key])")
    [void]$written.Add($key)
  }
}

foreach ($key in ($existing.Keys | Sort-Object)) {
  if (-not $written.Contains($key)) {
    $out.Add("$key=$($existing[$key])")
  }
}

$out | Set-Content -Path $envPath -Encoding utf8
Write-Host ".env 저장 완료 (OpenAI API + 9시 자동)" -ForegroundColor Green

if (-not $SkipSyncTest) {
  Write-Host ""
  Write-Host "테스트 생성 실행 중 (1~2분)..." -ForegroundColor Cyan
  npm run briefing:sync:force
  if ($LASTEXITCODE -ne 0) {
    throw "sync 실패. API Key·잔액·네트워크를 확인하세요."
  }
  Write-Host "테스트 성공: data/briefings/ 에 JSON 저장됨" -ForegroundColor Green
}

if (-not $SkipScheduledTask) {
  $taskName = "DailyNewsBriefing9AM"
  $scriptPath = Join-Path $ProjectRoot "scripts\run-daily-sync.ps1"
  $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  if ($existingTask) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
  }

  $action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" `
    -WorkingDirectory $ProjectRoot

  $trigger = New-ScheduledTaskTrigger -Daily -At "08:00"
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings `
    -Description "Daily News — OpenAI API 매일 9시 브리핑 생성" | Out-Null

  Write-Host ""
  Write-Host "Windows 작업 스케줄러 등록: $taskName (매일 09:00)" -ForegroundColor Green
}

Write-Host ""
Write-Host "완료!" -ForegroundColor Green
Write-Host "  - 매일 9:00: npm run briefing:sync (PC 켜져 있을 때)"
Write-Host "  - npm run dev: 오늘 없으면 시작 시 1회 + inbox 감시"
Write-Host "  - 지시문: data/prompts/project-news-instructions.md"
Write-Host "  - 로그: logs/sync-*.log, logs/auto-sync-*.log"
Write-Host ""

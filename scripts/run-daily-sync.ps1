# 매일 9시 작업 스케줄러가 실행하는 스크립트
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$logDir = Join-Path $ProjectRoot "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

$logFile = Join-Path $logDir ("sync-" + (Get-Date -Format "yyyy-MM-dd") + ".log")
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"[$timestamp] briefing sync start" | Out-File -FilePath $logFile -Encoding utf8

try {
  npm run briefing:sync 2>&1 | Out-File -FilePath $logFile -Append -Encoding utf8
  "[$timestamp] done" | Out-File -FilePath $logFile -Append -Encoding utf8
} catch {
  "[$timestamp] ERROR: $_" | Out-File -FilePath $logFile -Append -Encoding utf8
  exit 1
}

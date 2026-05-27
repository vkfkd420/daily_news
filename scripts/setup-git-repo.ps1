# daily_news — 이 프로젝트를 GitHub repo로 연결 (한 번)
# 사용: .\scripts\setup-git-repo.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=== daily_news Git / GitHub 설정 ===" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
  git init
  Write-Host "git init 완료" -ForegroundColor Green
} else {
  Write-Host "이미 git 저장소입니다." -ForegroundColor Gray
}

$remote = git remote get-url origin 2>$null
if (-not $remote) {
  $owner = Read-Host "GitHub 아이디"
  $repo = Read-Host "repo 이름 [기본: daily_news]"
  if (-not $repo) { $repo = "daily_news" }
  $url = "https://github.com/$owner/$repo.git"
  git remote add origin $url
  Write-Host "remote origin 추가: $url" -ForegroundColor Green
  Write-Host ""
  Write-Host "GitHub에서 빈 repo '$repo' 를 먼저 만든 뒤:" -ForegroundColor Yellow
  Write-Host "  git add ."
  Write-Host "  git commit -m `"init: daily news`""
  Write-Host "  git push -u origin main"
} else {
  Write-Host "origin: $remote" -ForegroundColor Green
}

Write-Host ""
Write-Host ".env 에 추가 (토큰은 GitHub에서 발급):" -ForegroundColor Cyan
Write-Host "GITHUB_TOKEN=github_pat_..."
Write-Host "GITHUB_OWNER=아이디"
Write-Host "GITHUB_REPO=daily_news"
Write-Host ""
Write-Host "브리핑 push: npm run briefing:push-github" -ForegroundColor Green
Write-Host "가이드: docs/GITHUB_SYNC.md"
Write-Host ""

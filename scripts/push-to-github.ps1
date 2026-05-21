# Run after: gh auth login
# Creates https://github.com/AlexHB1971/world-cup-predictions and pushes code

$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\Git\bin;C:\Program Files\GitHub CLI;" + $env:Path

Set-Location $PSScriptRoot\..

gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host "First run: gh auth login" -ForegroundColor Yellow
  gh auth login
}

gh repo create AlexHB1971/world-cup-predictions --public --source=. --remote=origin --push

Write-Host ""
Write-Host "Done: https://github.com/AlexHB1971/world-cup-predictions" -ForegroundColor Green

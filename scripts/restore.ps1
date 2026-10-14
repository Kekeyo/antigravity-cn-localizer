# Antigravity-CN-Localizer 一键还原脚本 (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Write-Host "====================================================" -ForegroundColor Yellow
Write-Host " 🔄 正在恢复 Antigravity & IDE 至官方原版英文..." -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 系统未检测到 Node.js，请先安装 Node.js" -ForegroundColor Red
    Pause
    exit 1
}

node "$ProjectDir\src\index.js" --restore=all

Write-Host "`n按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

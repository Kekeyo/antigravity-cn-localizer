# Antigravity-CN-Localizer 一键安装脚本 (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " 🚀 正在启动 Antigravity & IDE 汉化安装程序..." -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 检查 Node.js 环境
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 系统未检测到 Node.js，请先安装 Node.js (https://nodejs.org/)" -ForegroundColor Red
    Pause
    exit 1
}

# 执行汉化
node "$ProjectDir\src\index.js" --target=all

Write-Host "`n按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

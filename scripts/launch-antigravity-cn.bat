@echo off
chcp 65001 >nul
cd /d "%~dp0.."
node src\index.js --target=all
start "" "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
exit

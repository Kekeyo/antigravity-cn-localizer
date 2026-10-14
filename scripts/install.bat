@echo off
chcp 65001 >nul
title Antigravity-CN-Localizer
echo ====================================================
echo   Antigravity 中文汉化套件 - 一键安装与补丁更新
echo ====================================================
echo.
cd /d "%~dp0.."
node src\index.js --target=all
echo.
pause

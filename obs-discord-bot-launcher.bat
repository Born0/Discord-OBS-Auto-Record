@echo off
setlocal

:: Set paths
set OBS_FOLDER="C:\Program Files\obs-studio\bin\64bit"
set OBS_EXE=obs64.exe
set DISCORD_PATH="C:\Users\%USERNAME%\AppData\Local\Discord\Update.exe"
set BOT_PATH="E:\Work\Discord-OBS-Auto-Record\bot.js"
set NODE_CMD=node

echo ==================================
echo Starting Discord
echo ==================================
if exist %DISCORD_PATH% (
    start "" %DISCORD_PATH% --processStart Discord.exe
    echo Discord launched.
) else (
    echo ERROR: Discord not found at %DISCORD_PATH%
)

echo.
echo Starting OBS Studio
if exist %OBS_FOLDER%\%OBS_EXE% (
    pushd %OBS_FOLDER%
    start "" %OBS_EXE%
    popd
    echo OBS launched.
) else (
    echo ERROR: OBS not found at %OBS_FOLDER%\%OBS_EXE%
)

echo.
echo Starting the bot
cd /d "E:\Work\Discord-OBS-Auto-Record"
if exist "%BOT_PATH%" (
    start "" cmd /k %NODE_CMD% bot.js
    echo Bot script launched in a new window.
) else (
    echo ERROR: Bot script not found at %BOT_PATH%
)

echo.
echo All done.
pause

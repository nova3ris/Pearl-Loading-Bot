@echo off

set FILEPATH=%CD%\config.json

if exist "%FILEPATH%" (
    node bot.js
) else (
    npm install && node init.js && node bot.js
)
FILEPATH="$(pwd)/config.json"

if [ -f "$FILEPATH" ]; then
    node bot.js
else
    npm install && node init.js && node bot.js
fi

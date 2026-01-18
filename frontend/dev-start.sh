#!/bin/sh
cp -rfu /cache/node_modules/. /app/node_modules/;

# Tweak delay here as needed
npx nodemon --watch /backend -e java --delay 5 --exec 'npm run generate-api' &

npm run dev;

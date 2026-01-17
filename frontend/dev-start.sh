#!/bin/sh
cp -rfu /cache/node_modules/. /app/node_modules/;

# TODO: Watch BE and re-run this when BE reloads
npm run generate-api;
npm run dev;

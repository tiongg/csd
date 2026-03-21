FROM node:20-alpine

WORKDIR /app

# Install y-websocket
# https://github.com/yjs/y-websocket-server
RUN npm i @y/websocket-server@0.1.1

CMD ["npx", "y-websocket"]

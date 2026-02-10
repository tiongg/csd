FROM node:20-alpine

WORKDIR /app

# Install y-websocket globally
# https://github.com/yjs/y-websocket-server
RUN npm i @y/websocket-server

CMD ["npx", "y-websocket"]

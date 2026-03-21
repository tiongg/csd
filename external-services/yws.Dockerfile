FROM node:20-alpine

WORKDIR /app

# Install y-websocket globally
# https://github.com/yjs/y-websocket-server
RUN npm i @y/websocket-server

CMD ["sh", "-c", "HOST=$HOST PORT=$PORT YPERSISTENCE=$YPERSISTENCE npx y-websocket"]
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine
RUN apk add --no-cache netcat-openbsd wget
WORKDIR /app
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/dist ./dist
RUN mkdir -p /app/backend/src/uploads/selfies /app/backend/src/uploads/photos && chown -R node:node /app/backend/src/uploads
USER node
EXPOSE 5000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
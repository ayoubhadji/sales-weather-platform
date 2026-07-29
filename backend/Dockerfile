# ==========================
# Build Stage
# ==========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY api/package*.json ./

RUN npm ci

COPY api/ .

RUN npm run build

# ==========================
# Production Stage
# ==========================
FROM node:22-alpine

WORKDIR /app

COPY api/package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
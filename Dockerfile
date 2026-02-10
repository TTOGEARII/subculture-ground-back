# NestJS 백엔드 Dockerfile
FROM node:20-alpine AS base

# 의존성 설치 단계
FROM base AS deps
WORKDIR /app
# 네이티브 모듈 빌드를 위한 빌드 도구 설치
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm install --no-audit --no-fund

# 빌드 단계
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 프로덕션 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# 빌드된 파일과 프로덕션 의존성만 복사
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs package*.json ./

USER nestjs

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/main"]

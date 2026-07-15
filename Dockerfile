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

# 악보 검색(ultimate-guitar)이 Cloudflare 챌린지를 통과하려면 실제 브라우저가 필요하다.
# alpine musl에선 playwright 번들 chromium이 안 돌아가므로 apk chromium을 쓰고
# playwright-core에 그 경로를 넘긴다(PLAYWRIGHT_CHROMIUM_PATH). chromium이 없으면
# 악보 도구는 UG를 건너뛰고 나머지 소스 + 링크아웃으로 폴백한다.
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
ENV PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium-browser

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# 빌드된 파일과 프로덕션 의존성만 복사
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs entrypoint.sh ./
RUN chmod +x entrypoint.sh

# 업로드 디렉토리: 비루트(nestjs) 사용자가 쓸 수 있도록 미리 생성 + 소유권 부여
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

USER nestjs

EXPOSE 3001

ENV PORT=3001

CMD ["./entrypoint.sh"]

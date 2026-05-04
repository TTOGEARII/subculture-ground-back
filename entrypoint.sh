#!/bin/sh
set -e

echo "DB 마이그레이션 실행 중..."
./node_modules/.bin/typeorm migration:run -d dist/data-source.js
echo "마이그레이션 완료. 서버를 시작합니다..."

exec node dist/main

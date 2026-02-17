# Docker 환경에서 마이그레이션 실행 가이드

## 🐳 Docker 환경에서 마이그레이션 실행 방법

### 방법 1: 백엔드 컨테이너 내부에서 실행 (권장 ⭐)

가장 간단하고 안정적인 방법입니다. 환경 변수가 이미 컨테이너에 설정되어 있습니다.

```bash
# 1. Docker Compose로 서비스 시작 (MariaDB만 시작해도 됨)
docker-compose -f docker-compose.dev.yml up -d mariadb

# 2. MariaDB가 준비될 때까지 대기 (약 10-20초)
# 3. 백엔드 컨테이너 내부에서 마이그레이션 실행
docker-compose -f docker-compose.dev.yml exec backend npm run migration:run
```

또는 컨테이너 이름으로 직접 실행:

```bash
docker exec subculture-ground-backend-dev npm run migration:run
```

**장점**:
- 환경 변수가 자동으로 설정됨 (`docker-compose.dev.yml`에서 전달)
- `.env` 파일을 읽을 필요 없음
- Docker 네트워크를 통해 `DB_HOST=mariadb`로 접근 가능

### 방법 2: 호스트에서 실행

호스트(로컬 머신)에서 실행하려면 포트 포워딩을 통해 접근해야 합니다.

```bash
# Windows PowerShell
cd subculture-ground-back

# 환경 변수 설정 (호스트에서 접근하므로 localhost 사용)
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="rootpassword"
$env:DB_DATABASE="subculture_ground"

# 마이그레이션 실행
npm run migration:run
```

**주의**: 
- `DB_HOST=mariadb`가 아닌 `localhost`를 사용해야 합니다
- MariaDB 컨테이너의 포트(3306)가 호스트에 포트 포워딩되어 있어야 합니다

## 📋 실행 순서

### 전체 프로세스

```bash
# 1. 프로젝트 루트로 이동
cd subculture-ground

# 2. Docker Compose로 MariaDB 시작
docker-compose -f docker-compose.dev.yml up -d mariadb

# 3. MariaDB 준비 대기 (로그 확인)
docker-compose -f docker-compose.dev.yml logs -f mariadb
# "ready for connections" 메시지가 나오면 Ctrl+C로 종료

# 4. 백엔드 컨테이너 내부에서 마이그레이션 실행
docker-compose -f docker-compose.dev.yml exec backend npm run migration:run
```

## 🔍 마이그레이션 상태 확인

```bash
# 마이그레이션 실행 상태 확인
docker-compose -f docker-compose.dev.yml exec backend npm run migration:show

# MariaDB에 직접 접속하여 테이블 확인
docker-compose -f docker-compose.dev.yml exec mariadb mysql -uroot -prootpassword subculture_ground -e "SHOW TABLES;"
```

## 🛠️ 문제 해결

### 1. "Access denied" 오류

**원인**: 비밀번호가 전달되지 않음

**해결**:
```bash
# 컨테이너 내부에서 환경 변수 확인
docker-compose -f docker-compose.dev.yml exec backend env | grep DB_

# 출력 예시:
# DB_HOST=mariadb
# DB_PASSWORD=rootpassword
# ...

# 환경 변수가 없으면 docker-compose.dev.yml 확인
```

### 2. "Cannot connect to database" 오류

**원인**: MariaDB가 아직 준비되지 않음

**해결**:
```bash
# MariaDB 로그 확인
docker-compose -f docker-compose.dev.yml logs mariadb

# MariaDB 상태 확인
docker-compose -f docker-compose.dev.yml ps mariadb

# MariaDB가 실행 중인지 확인 후 재시도
```

### 3. 컨테이너가 실행되지 않음

**해결**:
```bash
# 컨테이너 재시작
docker-compose -f docker-compose.dev.yml restart backend

# 또는 전체 재시작
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

### 4. dotenv 패키지 오류

**해결**:
```bash
# 백엔드 컨테이너 내부에서 dotenv 설치
docker-compose -f docker-compose.dev.yml exec backend npm install dotenv

# 또는 호스트에서 설치 후 컨테이너 재시작
cd subculture-ground-back
npm install dotenv
```

## 📝 환경 변수 확인

### 컨테이너 내부 환경 변수 확인

```bash
# 모든 DB 관련 환경 변수 확인
docker-compose -f docker-compose.dev.yml exec backend env | grep DB_

# 특정 환경 변수 확인
docker-compose -f docker-compose.dev.yml exec backend sh -c 'echo $DB_PASSWORD'
```

### .env 파일 확인

`.env` 파일은 프로젝트 루트(`subculture-ground/`)에 있어야 합니다:

```
subculture-ground/
├── .env                    ← 여기에 있어야 함
├── docker-compose.dev.yml
├── subculture-ground-back/
│   ├── data-source.ts
│   └── ...
└── subculture-ground-front/
```

## 🎯 빠른 참조

```bash
# 마이그레이션 실행 (컨테이너 내부)
docker-compose -f docker-compose.dev.yml exec backend npm run migration:run

# 마이그레이션 되돌리기
docker-compose -f docker-compose.dev.yml exec backend npm run migration:revert

# 마이그레이션 상태 확인
docker-compose -f docker-compose.dev.yml exec backend npm run migration:show

# 새 마이그레이션 생성
docker-compose -f docker-compose.dev.yml exec backend npm run migration:generate -- src/migrations/MigrationName
```

## 💡 팁

1. **개발 환경**: 컨테이너 내부에서 실행하는 것이 가장 편리합니다
2. **프로덕션 환경**: CI/CD 파이프라인에서 마이그레이션을 실행할 때는 환경 변수를 명시적으로 설정하세요
3. **로컬 개발**: 호스트에서 직접 실행하려면 `DB_HOST=localhost`로 설정하세요

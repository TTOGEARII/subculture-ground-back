# Subculture Ground Backend

Subculture Ground 프로젝트의 NestJS 기반 백엔드 API 서버입니다.

## 기술 스택

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: MariaDB 11.3
- **ORM**: TypeORM
- **Authentication**: JWT (Passport)
- **Password Hashing**: bcrypt
- **Validation**: class-validator, class-transformer


## 환경 변수 설정

프로젝트 루트의 `.env` 파일에 환경 변수를 설정하세요

## 설치 및 실행

### 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (watch 모드)
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod
```

### Docker를 사용한 실행

```bash
# 개발 환경 실행
docker-compose -f ../docker-compose.dev.yml up -d

# 프로덕션 빌드 및 실행
docker-compose up -d --build
```


## 개발 스크립트

```bash
# 개발 서버 실행 (watch 모드)
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod

# 코드 포맷팅
npm run format

# 린트 검사 및 자동 수정
npm run lint

# 테스트 실행
npm run test

# 테스트 커버리지
npm run test:cov

# E2E 테스트
npm run test:e2e
```

## 주의사항

1. **프로덕션 환경**에서는 `synchronize: false`로 설정하고 마이그레이션을 사용하세요.
2. **JWT_SECRET**은 반드시 강력한 랜덤 문자열로 변경하세요.
3. **데이터베이스 비밀번호**는 안전하게 관리하세요.
4. 환경 변수는 `.env` 파일로 관리하며, Git에 커밋하지 마세요.

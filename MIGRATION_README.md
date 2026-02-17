# TypeORM 마이그레이션 가이드

이 프로젝트는 TypeORM 마이그레이션을 사용하여 데이터베이스 스키마를 관리합니다.

## 설정 파일

- `data-source.ts`: TypeORM CLI용 데이터 소스 설정 파일
- `src/migrations/`: 마이그레이션 파일이 저장되는 디렉토리

## 사용 방법

### 1. 마이그레이션 생성

엔티티 변경사항을 기반으로 마이그레이션 파일을 자동 생성합니다:

```bash
npm run migration:generate -- src/migrations/MigrationName
```

예시:
```bash
npm run migration:generate -- src/migrations/AddBookingTable
```

### 2. 빈 마이그레이션 파일 생성

수동으로 마이그레이션을 작성할 때:

```bash
npm run migration:create -- src/migrations/MigrationName
```

### 3. 마이그레이션 실행

생성된 마이그레이션을 데이터베이스에 적용:

```bash
npm run migration:run
```

### 4. 마이그레이션 되돌리기

가장 최근 마이그레이션을 되돌립니다:

```bash
npm run migration:revert
```

### 5. 마이그레이션 상태 확인

현재 마이그레이션 상태를 확인:

```bash
npm run migration:show
```

## 초기 마이그레이션

프로젝트에는 초기 마이그레이션 파일이 포함되어 있습니다:
- `src/migrations/1700000000000-InitialMigration.ts`

이 마이그레이션은 다음 테이블을 생성합니다:
- `sb_member` (사용자 테이블)
- `sb_performances` (공연 테이블)

## 로컬 환경에서 테이블 동기화

### 방법 1: 마이그레이션 사용 (권장)

1. 마이그레이션 실행:
   ```bash
   npm run migration:run
   ```

2. `app.module.ts`에서 `synchronize: false`로 설정되어 있는지 확인

### 방법 2: synchronize 사용 (개발 환경만)

`app.module.ts`에서 `synchronize: true`로 설정하면 자동으로 테이블이 생성/수정됩니다.
**주의**: 프로덕션 환경에서는 사용하지 마세요!

## 환경 변수

마이그레이션 실행 시 다음 환경 변수가 필요합니다 (`.env` 파일에서 로드됨):

- `DB_HOST`: 데이터베이스 호스트 (기본값: localhost)
- `DB_PORT`: 데이터베이스 포트 (기본값: 3306)
- `DB_USERNAME`: 데이터베이스 사용자명 (기본값: root)
- `DB_PASSWORD`: 데이터베이스 비밀번호
- `DB_DATABASE`: 데이터베이스 이름 (기본값: subculture_ground)

## 문제 해결

### 마이그레이션 실행 시 오류 발생

1. 데이터베이스 연결 확인:
   ```bash
   # MariaDB/MySQL 접속 테스트
   mysql -h localhost -u root -p
   ```

2. 데이터베이스가 존재하는지 확인:
   ```sql
   CREATE DATABASE IF NOT EXISTS subculture_ground;
   ```

3. 마이그레이션 상태 확인:
   ```bash
   npm run migration:show
   ```

### TypeORM CLI 명령어를 찾을 수 없음

TypeORM CLI가 설치되어 있는지 확인:
```bash
npm install --save-dev typeorm
```

## 참고

- 마이그레이션 파일은 타임스탬프 기반으로 정렬됩니다
- 마이그레이션 파일명 형식: `{timestamp}-{MigrationName}.ts`
- `up()` 메서드: 마이그레이션 실행 시 수행할 작업
- `down()` 메서드: 마이그레이션 되돌리기 시 수행할 작업

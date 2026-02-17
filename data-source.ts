import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';
import { Member } from './src/member/member.entity';
import { Performance } from './src/performance/performance.entity';
import { TicketInfo } from './src/ticket-info/ticket-info.entity';
import { TicketUser } from './src/ticket-user/ticket-user.entity';
import { MemberBankAccount } from './src/member-bank-account/member-bank-account.entity';

// .env 파일 로드 (Docker 환경에서는 환경 변수가 이미 설정되어 있을 수 있음)
// 프로젝트 루트의 .env 파일 경로 (subculture-ground/.env)
const envPath = join(__dirname, '..', '..', '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  // Docker 컨테이너 내부에서는 환경 변수가 이미 설정되어 있을 수 있음
  // .env 파일이 없어도 환경 변수를 사용할 수 있도록 함
  console.log('⚠️  .env 파일을 찾을 수 없습니다. 환경 변수가 이미 설정되어 있는지 확인하세요.');
}

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'subculture_ground',
  entities: [Member, Performance, TicketInfo, TicketUser, MemberBankAccount],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // 마이그레이션 사용 시 false로 설정
  logging: true,
  charset: 'utf8mb4',
});

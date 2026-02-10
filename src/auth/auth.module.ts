import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';

// JWT 만료 시간(초 단위) 계산
const DEFAULT_JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7; // 7일
const jwtExpiresIn: number =
  process.env.JWT_EXPIRES_IN !== undefined
    ? Number(process.env.JWT_EXPIRES_IN) || DEFAULT_JWT_EXPIRES_IN_SECONDS
    : DEFAULT_JWT_EXPIRES_IN_SECONDS;

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-this-in-production',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EncryptedDto } from './dto/encrypted.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserPayload } from './types/user-payload.interface';
import { decryptObject, encryptObject } from '../common/utils/crypto.util';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() encryptedDto: EncryptedDto) {
    // 암호화된 데이터 복호화
    const registerDto = decryptObject<RegisterDto>(encryptedDto.encrypted);

    // 서비스에서 처리
    const result = await this.authService.register(registerDto);

    // 응답 암호화
    const encryptedResponse = encryptObject(result);
    return { encrypted: encryptedResponse };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() encryptedDto: EncryptedDto) {
    // 암호화된 데이터 복호화
    const loginDto = decryptObject<LoginDto>(encryptedDto.encrypted);

    // 서비스에서 처리
    const result = await this.authService.login(loginDto);

    // 응답 암호화
    const encryptedResponse = encryptObject(result);
    return { encrypted: encryptedResponse };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: UserPayload) {
    // 응답 암호화
    const encryptedResponse = encryptObject(user);
    return { encrypted: encryptedResponse };
  }
}

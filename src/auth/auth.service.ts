import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, phone, birthDate } = registerDto;

    // 이메일 중복 확인
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 사용자 생성 (비밀번호는 해시되어 저장되므로 로그에 노출되지 않음)
    const user = await this.userService.create(
      email,
      password,
      name,
      phone,
      birthDate ? new Date(birthDate) : undefined,
    );

    // 상태 확인 (차단된 사용자 체크)
    if (user.sbStatus === 0) {
      throw new UnauthorizedException('차단된 계정입니다.');
    }

    // JWT 토큰 생성
    const payload = { sub: user.idx, email: user.sbEmail };
    const accessToken = this.jwtService.sign(payload);

    // 보안: 민감한 정보는 응답에서 제외 (비밀번호는 이미 제외됨)
    return {
      accessToken,
      user: {
        idx: user.idx,
        email: user.sbEmail,
        name: user.sbName,
        phone: user.sbPhone,
        birthDate: user.sbBirthDate,
        status: user.sbStatus,
        emailVerifiedAt: user.sbEmailVerifiedAt,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 사용자 찾기
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // 보안: 구체적인 에러 메시지로 정보 노출 방지
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 상태 확인 (차단된 사용자 체크)
    if (user.sbStatus === 0) {
      throw new UnauthorizedException('차단된 계정입니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.sbPassword,
    );
    if (!isPasswordValid) {
      // 보안: 구체적인 에러 메시지로 정보 노출 방지
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // JWT 토큰 생성
    const payload = { sub: user.idx, email: user.sbEmail };
    const accessToken = this.jwtService.sign(payload);

    // 보안: 민감한 정보는 응답에서 제외
    return {
      accessToken,
      user: {
        idx: user.idx,
        email: user.sbEmail,
        name: user.sbName,
        phone: user.sbPhone,
        birthDate: user.sbBirthDate,
        status: user.sbStatus,
        emailVerifiedAt: user.sbEmailVerifiedAt,
      },
    };
  }

  async validateUser(userIdx: number) {
    const user = await this.userService.findById(userIdx);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // 상태 확인 (차단된 사용자 체크)
    if (user.sbStatus === 0) {
      throw new UnauthorizedException('차단된 계정입니다.');
    }

    return {
      idx: user.idx,
      email: user.sbEmail,
      name: user.sbName,
      phone: user.sbPhone,
      birthDate: user.sbBirthDate,
      status: user.sbStatus,
      emailVerifiedAt: user.sbEmailVerifiedAt,
    };
  }
}

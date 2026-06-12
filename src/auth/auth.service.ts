import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MemberService } from '../member/member.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private memberService: MemberService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, phone, birthDate } = registerDto;

    // 이메일 중복 확인
    const existingUser = await this.memberService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 사용자 생성 (비밀번호는 해시되어 저장되므로 로그에 노출되지 않음)
    // birthDate는 date 타입이므로 날짜만 저장 (시간 제거)
    let birthDateObj: Date | undefined;
    if (birthDate) {
      const date = new Date(birthDate);
      // 날짜만 사용 (시간 제거)
      birthDateObj = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    const user = await this.memberService.create(
      email,
      password,
      name,
      phone,
      birthDateObj,
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
    const user = await this.memberService.findByEmail(email);
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

    // 소셜 전용 계정(비밀번호 없음)은 비밀번호 로그인 불가
    if (!user.sbPassword) {
      throw new UnauthorizedException(
        '소셜 로그인으로 가입된 계정입니다. 카카오 로그인을 이용해주세요.',
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await this.memberService.validatePassword(
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

  /**
   * 카카오 OAuth 로그인.
   * 프론트에서 받은 인가코드(code)로 토큰을 교환하고 프로필을 조회해
   * 회원을 find-or-create 한 뒤 JWT를 발급한다.
   */
  async kakaoLogin(code: string, redirectUri: string) {
    const restKey = process.env.KAKAO_REST_API_KEY;
    if (!restKey) {
      throw new UnauthorizedException(
        '카카오 로그인이 설정되지 않았습니다. (KAKAO_REST_API_KEY)',
      );
    }

    // 1) 인가코드 → 카카오 액세스 토큰
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: restKey,
        redirect_uri: redirectUri,
        code,
      }),
    });
    if (!tokenRes.ok) {
      throw new UnauthorizedException('카카오 토큰 발급에 실패했습니다.');
    }
    const tokenJson: any = await tokenRes.json();

    // 2) 액세스 토큰 → 사용자 프로필
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    if (!userRes.ok) {
      throw new UnauthorizedException('카카오 사용자 조회에 실패했습니다.');
    }
    const kakaoUser: any = await userRes.json();

    const account = kakaoUser.kakao_account ?? {};
    const profile = {
      provider: 'kakao',
      providerUserId: String(kakaoUser.id),
      email: (account.email as string) ?? null,
      nickname:
        (account.profile?.nickname as string) ??
        (kakaoUser.properties?.nickname as string) ??
        null,
    };

    // 3) 회원 find-or-create + 소셜 연결
    const member = await this.memberService.findOrCreateBySocial(profile);
    if (member.sbStatus === 0) {
      throw new UnauthorizedException('차단된 계정입니다.');
    }

    // 4) JWT 발급
    const payload = { sub: member.idx, email: member.sbEmail };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        idx: member.idx,
        email: member.sbEmail,
        name: member.sbName,
        phone: member.sbPhone,
        birthDate: member.sbBirthDate,
        status: member.sbStatus,
        emailVerifiedAt: member.sbEmailVerifiedAt,
      },
    };
  }

  async validateUser(userIdx: number) {
    const user = await this.memberService.findById(userIdx);
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

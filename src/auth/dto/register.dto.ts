import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @MinLength(6, { message: '비밀번호는 6자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9-]+$/, { message: '올바른 전화번호 형식이 아닙니다.' })
  phone?: string;

  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다.' })
  @IsOptional()
  birthDate?: string;
}

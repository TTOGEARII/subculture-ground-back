import { IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

// 전역 ValidationPipe가 whitelist + forbidNonWhitelisted라, 데코레이터 없는 속성은 모두 거부된다.
// 모든 필드는 부분 수정을 위해 선택값(@IsOptional).
export class UpdateTicketInfoDto {
  @IsInt()
  @IsOptional()
  pmIdx?: number;

  @IsString()
  @IsOptional()
  @MaxLength(12, { message: '티켓 이름은 최대 12글자입니다.' })
  ticketName?: string | null;

  @IsInt()
  @IsOptional()
  @Min(0)
  ticketCount?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  ticketMax?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  ticketMin?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ticketPrice?: number;

  @IsInt()
  @IsOptional()
  ticketType?: number;

  @IsIn([0, 1])
  @IsOptional()
  delFlag?: number;
}

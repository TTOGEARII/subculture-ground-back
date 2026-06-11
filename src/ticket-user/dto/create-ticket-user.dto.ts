import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

// 프론트(프로필 idx 문자열, bigint 문자열 등)에서 숫자 문자열이 올 수 있어 @Type으로 강제 변환한다.
export class CreateTicketUserDto {
  @Type(() => Number)
  @IsInt()
  ticketIdx: number;

  @Type(() => Number)
  @IsInt()
  userIdx: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  ticketCnt?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  ticketTotalPrice?: number;

  @Type(() => Number)
  @IsOptional()
  @IsIn([0, 1, 2, 3])
  ticketStatus?: 0 | 1 | 2 | 3;
}

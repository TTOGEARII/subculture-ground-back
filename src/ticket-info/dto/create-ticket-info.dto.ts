import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTicketInfoDto {
  @IsInt()
  pmIdx: number;

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
}

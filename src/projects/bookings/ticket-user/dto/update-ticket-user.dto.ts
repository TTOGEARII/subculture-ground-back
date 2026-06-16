import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateTicketUserDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  ticketIdx?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  userIdx?: number;

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

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  ticketChkDt?: Date | null;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  ticketPayCompleteDt?: Date | null;
}

import { IsString, IsOptional, IsDateString, IsNumber, MaxLength } from 'class-validator';
import { CreatePerformanceDto } from './create-performance.dto';

export class UpdatePerformanceDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: '공연 이름은 255자 이하여야 합니다.' })
  performanceName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: '아티스트 이름은 255자 이하여야 합니다.' })
  performanceArtist?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: '공연 장소는 255자 이하여야 합니다.' })
  performanceVenue?: string;

  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다.' })
  @IsOptional()
  performanceDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10, { message: '공연 시간은 10자 이하여야 합니다.' })
  performanceTime?: string;

  @IsString()
  @IsOptional()
  performanceImage?: string | null;

  @IsString()
  @IsOptional()
  performanceDescription?: string | null;

  @IsNumber()
  @IsOptional()
  ticketIdx?: number;

  @IsString()
  @IsOptional()
  performanceCategory?: string;
}

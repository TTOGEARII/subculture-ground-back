import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreatePerformanceDto {
  @IsString()
  @IsNotEmpty({ message: '공연 이름을 입력해주세요.' })
  @MaxLength(255, { message: '공연 이름은 255자 이하여야 합니다.' })
  performanceName: string;

  @IsString()
  @IsNotEmpty({ message: '아티스트를 입력해주세요.' })
  @MaxLength(255, { message: '아티스트 이름은 255자 이하여야 합니다.' })
  performanceArtist: string;

  @IsString()
  @IsNotEmpty({ message: '공연 장소를 입력해주세요.' })
  @MaxLength(255, { message: '공연 장소는 255자 이하여야 합니다.' })
  performanceVenue: string;

  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다.' })
  @IsNotEmpty({ message: '공연 날짜를 입력해주세요.' })
  performanceDate: string;

  @IsString()
  @IsNotEmpty({ message: '공연 시간을 입력해주세요.' })
  @MaxLength(10, { message: '공연 시간은 10자 이하여야 합니다.' })
  performanceTime: string;

  @IsString()
  @IsOptional()
  performanceImage?: string | null;

  @IsString()
  @IsOptional()
  performanceDescription?: string | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ticketIdx?: number;

  @IsString()
  @IsOptional()
  performanceCategory?: string; // JSON 배열 문자열
}

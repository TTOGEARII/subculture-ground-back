import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAccessLogDto {
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  url?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  referrer?: string;
}

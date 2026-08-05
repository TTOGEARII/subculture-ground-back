import { IsInt, IsOptional, Matches, Min, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStatementDto {
  @Matches(/^\d{4}-\d{2}$/, { message: '년월은 "YYYY-MM" 형식이어야 합니다.' })
  yearMonth: string;

  @IsInt() @Min(0) @IsOptional() totalWaterFee?: number;
  @IsInt() @Min(0) @IsOptional() commonElectricity?: number;
  @IsInt() @Min(0) @IsOptional() bureauTotalTons?: number;
  @IsInt() @Min(0) @IsOptional() stairCleaningFee?: number;
}

export class UpdateGlobalsDto {
  @IsInt() @Min(0) @IsOptional() totalWaterFee?: number;
  @IsInt() @Min(0) @IsOptional() commonElectricity?: number;
  @IsInt() @Min(0) @IsOptional() bureauTotalTons?: number;
  @IsInt() @Min(0) @IsOptional() stairCleaningFee?: number;
}

export class UpdateUnitDto {
  @IsInt() @Min(0) @IsOptional() prevReading?: number;
  @IsInt() @Min(0) @IsOptional() currReading?: number;
  @IsInt() @Min(0) @IsOptional() households?: number;
  @IsInt() @Min(0) @IsOptional() other?: number;
  @IsInt() @Min(0) @IsOptional() discount?: number;
}

export class UnitPatch extends UpdateUnitDto {
  @IsString() unitNo: string;
}

export class UpdateUnitsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnitPatch)
  units: UnitPatch[];
}

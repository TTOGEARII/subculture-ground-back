import {
  IsBoolean,
  IsInt,
  IsOptional,
  Matches,
  Min,
  IsString,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** 세대 신원 (호수 + 아이디) — 비밀번호 없는 소프트 잠금 */
export class IdentityDto {
  @IsString() @IsNotEmpty() unitNo: string;
  @IsString() @IsNotEmpty() residentId: string;
}

/** 세대 등록·확인 (처음이면 등록, 이후엔 일치 검사) */
export class VerifyHouseholdDto {
  @IsString() @IsNotEmpty() unitNo: string;
  @IsString() @IsNotEmpty() residentId: string;
}

/** 일반 세대: '이번 달 검침(N월)'만 저장 (본인 호수) */
export class MyReadingDto {
  @IsString() @IsNotEmpty() unitNo: string;
  @IsString() @IsNotEmpty() residentId: string;
  @IsInt() @Min(0) thisReading: number;
}

// ── 관리자(반장) 전용 — 신원 포함 ──────────────────────────
export class CreateStatementDto {
  @Matches(/^\d{4}-\d{2}$/, { message: '년월은 "YYYY-MM" 형식이어야 합니다.' })
  yearMonth: string;

  @IsInt() @Min(0) @IsOptional() totalWaterFee?: number;
  @IsInt() @Min(0) @IsOptional() commonElectricity?: number;
  @IsInt() @Min(0) @IsOptional() bureauTotalTons?: number;
  @IsInt() @Min(0) @IsOptional() stairCleaningFee?: number;

  @ValidateNested() @Type(() => IdentityDto) identity: IdentityDto;
}

export class UpdateGlobalsDto {
  @IsInt() @Min(0) @IsOptional() totalWaterFee?: number;
  @IsInt() @Min(0) @IsOptional() commonElectricity?: number;
  @IsInt() @Min(0) @IsOptional() bureauTotalTons?: number;
  @IsInt() @Min(0) @IsOptional() stairCleaningFee?: number;

  @ValidateNested() @Type(() => IdentityDto) identity: IdentityDto;
}

/** 세대 수치 필드 (배열 항목·단일 수정의 공통 베이스) */
export class UpdateUnitDto {
  @IsInt() @Min(0) @IsOptional() prevReading?: number;
  @IsInt() @Min(0) @IsOptional() currReading?: number;
  @IsInt() @Min(0) @IsOptional() households?: number;
  @IsInt() @Min(0) @IsOptional() other?: number;
  @IsInt() @Min(0) @IsOptional() discount?: number;
  @IsInt() @Min(0) @IsOptional() thisReading?: number;

  /**
   * 이번 달 검침을 '아직 안 받음'으로 되돌린다(false).
   *
   * 검침값이 오면 thisEntered가 자동으로 true가 되는데, 세대가 0을 잘못 저장하면
   * 그 뒤로는 되돌릴 방법이 없었다. 0은 유효한 숫자라 다시 덮어쓸 수도 없고,
   * 접수 세대 수만 부풀고 다음 달 현재검침으로 0이 이월된다.
   * 반장이 그 칸을 비울 수 있게 명시적으로 받는다.
   */
  @IsBoolean() @IsOptional() thisEntered?: boolean;
}

export class UnitPatch extends UpdateUnitDto {
  @IsString() unitNo: string;
}

export class UpdateUnitsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnitPatch)
  units: UnitPatch[];

  @ValidateNested() @Type(() => IdentityDto) identity: IdentityDto;
}

/** 관리자 단일 세대 수정 (수치 + 신원) */
export class ManagerUpdateUnitDto extends UpdateUnitDto {
  @ValidateNested() @Type(() => IdentityDto) identity: IdentityDto;
}

/** 반장 호수 변경 */
export class SetManagerDto {
  @IsString() @IsNotEmpty() managerUnit: string;
  @ValidateNested() @Type(() => IdentityDto) identity: IdentityDto;
}

/** 추가비용 한 건 */
export class ExtraCostDto {
  @IsString() @IsNotEmpty() name: string;
  @IsInt() @Min(0) amount: number;
  @IsArray() @IsString({ each: true }) @IsOptional() excludedUnits?: string[];
}

/** 추가비용 목록 통째 교체 (관리자) */
export class UpdateExtraCostsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtraCostDto)
  extraCosts: ExtraCostDto[];

  @ValidateNested() @Type(() => IdentityDto) identity: IdentityDto;
}

/** 신원만 필요한 관리자 작업(삭제·아이디 초기화) */
export class ManagerActionDto {
  @ValidateNested() @Type(() => IdentityDto) identity: IdentityDto;
}

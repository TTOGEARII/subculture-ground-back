import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { WaterFeeService } from './water-fee.service';
import {
  CreateStatementDto,
  UpdateGlobalsDto,
  UpdateUnitsDto,
  ManagerUpdateUnitDto,
  ManagerActionDto,
  SetManagerDto,
  UpdateExtraCostsDto,
  VerifyHouseholdDto,
  MyReadingDto,
} from './dto/water-fee.dto';

/**
 * 수도요금 정산 API — API 우선(웹 + 향후 네이티브 앱 공용).
 * 계산은 서버가 수행해 세대별 결과를 그대로 내려준다.
 *
 * ⚠️ 공개(비로그인) API. 세대 식별은 호수+아이디 소프트 잠금(비밀번호 없음),
 * 관리(총수도요금·새 달·전체 편집·반장 변경)는 현재 반장 세대만 가능.
 */
@Controller('water-fee')
export class WaterFeeController {
  constructor(private readonly service: WaterFeeService) {}

  // ── 조회 (공개) ──
  @Get('statements')
  list() {
    return this.service.list();
  }

  @Get('statements/:yearMonth')
  get(@Param('yearMonth') yearMonth: string) {
    return this.service.getStatement(yearMonth);
  }

  @Get('units/:unitNo/history')
  history(@Param('unitNo') unitNo: string) {
    return this.service.unitHistory(unitNo);
  }

  // ── 세대 식별 ──
  @Post('households/verify')
  @HttpCode(HttpStatus.OK)
  verify(@Body() dto: VerifyHouseholdDto) {
    return this.service.verifyHousehold(dto.unitNo, dto.residentId);
  }

  // ── 일반 세대: 내 검침 저장 ──
  @Put('statements/:yearMonth/my-reading')
  myReading(@Param('yearMonth') yearMonth: string, @Body() dto: MyReadingDto) {
    return this.service.updateMyReading(yearMonth, dto.unitNo, dto.residentId, dto.currReading);
  }

  // ── 관리자(반장) 전용 ──
  @Post('statements')
  create(@Body() dto: CreateStatementDto) {
    return this.service.createStatement(dto);
  }

  @Put('statements/:yearMonth')
  updateGlobals(@Param('yearMonth') yearMonth: string, @Body() dto: UpdateGlobalsDto) {
    return this.service.updateGlobals(yearMonth, dto);
  }

  @Put('statements/:yearMonth/manager')
  setManager(@Param('yearMonth') yearMonth: string, @Body() dto: SetManagerDto) {
    return this.service.setManager(yearMonth, dto.managerUnit, dto.identity);
  }

  @Put('statements/:yearMonth/extra-costs')
  updateExtraCosts(@Param('yearMonth') yearMonth: string, @Body() dto: UpdateExtraCostsDto) {
    return this.service.updateExtraCosts(yearMonth, dto.extraCosts, dto.identity);
  }

  @Put('statements/:yearMonth/units')
  updateUnits(@Param('yearMonth') yearMonth: string, @Body() dto: UpdateUnitsDto) {
    return this.service.updateUnits(yearMonth, dto.units, dto.identity);
  }

  @Put('statements/:yearMonth/units/:unitNo')
  updateUnit(
    @Param('yearMonth') yearMonth: string,
    @Param('unitNo') unitNo: string,
    @Body() dto: ManagerUpdateUnitDto,
  ) {
    return this.service.updateUnit(yearMonth, unitNo, dto, dto.identity);
  }

  @Delete('statements/:yearMonth')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('yearMonth') yearMonth: string, @Body() dto: ManagerActionDto) {
    await this.service.deleteStatement(yearMonth, dto.identity);
    return { deleted: true };
  }

  @Post('households/:unitNo/reset')
  @HttpCode(HttpStatus.OK)
  reset(@Param('unitNo') unitNo: string, @Body() dto: ManagerActionDto) {
    return this.service.resetHousehold(unitNo, dto.identity);
  }
}

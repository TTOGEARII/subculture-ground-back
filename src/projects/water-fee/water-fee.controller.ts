import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { WaterFeeService } from './water-fee.service';
import { CreateStatementDto, UpdateGlobalsDto, UpdateUnitDto, UpdateUnitsDto } from './dto/water-fee.dto';

/**
 * 수도요금 정산 API — API 우선(웹 + 향후 네이티브 앱 공용).
 * 계산은 서버가 수행해 세대별 결과를 그대로 내려준다.
 *
 * ⚠️ 공개(비로그인) API. 중앙그린빌라 관리인이 링크로 바로 작성하는 단일 정산표라
 * 계정에 묶지 않는다. 인증 가드 없음 — 링크를 아는 사람은 조회·수정 가능.
 */
@Controller('water-fee')
export class WaterFeeController {
  constructor(private readonly service: WaterFeeService) {}

  @Get('statements')
  list() {
    return this.service.list();
  }

  @Get('statements/:yearMonth')
  get(@Param('yearMonth') yearMonth: string) {
    return this.service.getStatement(yearMonth);
  }

  @Post('statements')
  create(@Body() dto: CreateStatementDto) {
    return this.service.createStatement(dto);
  }

  @Put('statements/:yearMonth')
  updateGlobals(@Param('yearMonth') yearMonth: string, @Body() dto: UpdateGlobalsDto) {
    return this.service.updateGlobals(yearMonth, dto);
  }

  @Put('statements/:yearMonth/units')
  updateUnits(@Param('yearMonth') yearMonth: string, @Body() dto: UpdateUnitsDto) {
    return this.service.updateUnits(yearMonth, dto.units);
  }

  @Put('statements/:yearMonth/units/:unitNo')
  updateUnit(
    @Param('yearMonth') yearMonth: string,
    @Param('unitNo') unitNo: string,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.service.updateUnit(yearMonth, unitNo, dto);
  }

  @Delete('statements/:yearMonth')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('yearMonth') yearMonth: string) {
    await this.service.deleteStatement(yearMonth);
  }
}

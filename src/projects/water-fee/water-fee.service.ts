import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaterFeeStatement } from './water-fee-statement.entity';
import { WaterFeeUnit } from './water-fee-unit.entity';
import { computeStatement, UnitInput } from './water-fee.calc';
import { UNIT_NUMBERS, DEFAULT_STAIR_CLEANING_FEE } from './water-fee.constants';
import { CreateStatementDto, UpdateGlobalsDto, UpdateUnitDto, UnitPatch } from './dto/water-fee.dto';

/**
 * 수도요금 명세서 CRUD + 자동 이월 + 계산.
 * 세대별 계산값(사용량·수도료·수고비·전기계단·납입액)은 저장하지 않고 조회 시 계산해 내려준다.
 */
@Injectable()
export class WaterFeeService {
  constructor(
    @InjectRepository(WaterFeeStatement) private readonly stmtRepo: Repository<WaterFeeStatement>,
    @InjectRepository(WaterFeeUnit) private readonly unitRepo: Repository<WaterFeeUnit>,
  ) {}

  /** 명세서 목록 (최근 월 먼저) */
  async list() {
    const stmts = await this.stmtRepo.find({ order: { yearMonth: 'DESC' } });
    return stmts.map((s) => ({
      yearMonth: s.yearMonth,
      totalWaterFee: s.totalWaterFee,
      updatedAt: s.updatedAt,
    }));
  }

  /** 한 달 명세서 + 계산 결과 */
  async getStatement(yearMonth: string) {
    const s = await this.findStmt(yearMonth);
    return this.toResult(s);
  }

  /** 새 달 명세서 생성 — 직전(최근) 달 검침·가구수를 자동 이월 */
  async createStatement(dto: CreateStatementDto) {
    if (await this.stmtRepo.findOne({ where: { yearMonth: dto.yearMonth } })) {
      throw new ConflictException(`${dto.yearMonth} 명세서가 이미 있습니다.`);
    }
    const latest = await this.stmtRepo.findOne({
      where: {},
      order: { yearMonth: 'DESC' },
      relations: ['units'],
    });
    const prevByNo = new Map((latest?.units ?? []).map((u) => [u.unitNo, u]));

    const s = this.stmtRepo.create({
      yearMonth: dto.yearMonth,
      totalWaterFee: dto.totalWaterFee ?? 0,
      commonElectricity: dto.commonElectricity ?? latest?.commonElectricity ?? 0,
      bureauTotalTons: dto.bureauTotalTons ?? 0,
      stairCleaningFee: dto.stairCleaningFee ?? latest?.stairCleaningFee ?? DEFAULT_STAIR_CLEANING_FEE,
      units: UNIT_NUMBERS.map((unitNo) => {
        const prev = prevByNo.get(unitNo);
        const carried = prev?.currReading ?? 0; // 지난달 현재검침 → 이번달 이전검침
        return this.unitRepo.create({
          unitNo,
          prevReading: carried,
          currReading: carried, // 시작은 이전과 동일(사용량 0) → 사용자가 현재 검침 입력
          households: prev?.households ?? 1,
          other: 0,
          discount: 0,
        });
      }),
    });
    await this.stmtRepo.save(s);
    return this.getStatement(dto.yearMonth);
  }

  /** 전체 입력값(총수도요금 등) 수정 */
  async updateGlobals(yearMonth: string, dto: UpdateGlobalsDto) {
    const s = await this.findStmt(yearMonth);
    if (dto.totalWaterFee !== undefined) s.totalWaterFee = dto.totalWaterFee;
    if (dto.commonElectricity !== undefined) s.commonElectricity = dto.commonElectricity;
    if (dto.bureauTotalTons !== undefined) s.bureauTotalTons = dto.bureauTotalTons;
    if (dto.stairCleaningFee !== undefined) s.stairCleaningFee = dto.stairCleaningFee;
    await this.stmtRepo.save(s);
    return this.getStatement(yearMonth);
  }

  /** 세대 1곳 수정 */
  async updateUnit(yearMonth: string, unitNo: string, dto: UpdateUnitDto) {
    const s = await this.findStmt(yearMonth);
    const u = s.units.find((x) => x.unitNo === unitNo);
    if (!u) throw new NotFoundException(`${yearMonth}에 ${unitNo} 세대가 없습니다.`);
    Object.assign(u, this.pickUnit(dto));
    await this.unitRepo.save(u);
    return this.getStatement(yearMonth);
  }

  /** 세대 여러 곳 일괄 수정(표 저장) */
  async updateUnits(yearMonth: string, patches: UnitPatch[]) {
    const s = await this.findStmt(yearMonth);
    const byNo = new Map(s.units.map((u) => [u.unitNo, u]));
    const dirty: WaterFeeUnit[] = [];
    for (const p of patches) {
      const u = byNo.get(p.unitNo);
      if (!u) continue;
      Object.assign(u, this.pickUnit(p));
      dirty.push(u);
    }
    if (dirty.length) await this.unitRepo.save(dirty);
    return this.getStatement(yearMonth);
  }

  async deleteStatement(yearMonth: string) {
    const s = await this.findStmt(yearMonth);
    await this.stmtRepo.remove(s); // units는 onDelete CASCADE
  }

  // ── 내부 ──────────────────────────────────────────────
  private pickUnit(dto: UpdateUnitDto): Partial<WaterFeeUnit> {
    const out: Partial<WaterFeeUnit> = {};
    for (const k of ['prevReading', 'currReading', 'households', 'other', 'discount'] as const) {
      if (dto[k] !== undefined) out[k] = dto[k];
    }
    return out;
  }

  private async findStmt(yearMonth: string): Promise<WaterFeeStatement> {
    const s = await this.stmtRepo.findOne({ where: { yearMonth }, relations: ['units'] });
    if (!s) throw new NotFoundException(`${yearMonth} 명세서가 없습니다.`);
    return s;
  }

  /** 엔티티 → 계산 결과(입력값 + 세대별 계산 + 합계) */
  private toResult(s: WaterFeeStatement) {
    const byNo = new Map(s.units.map((u) => [u.unitNo, u]));
    const units: UnitInput[] = UNIT_NUMBERS.map((unitNo) => {
      const u = byNo.get(unitNo);
      return {
        unitNo,
        prevReading: u?.prevReading ?? 0,
        currReading: u?.currReading ?? 0,
        households: u?.households ?? 1,
        other: u?.other ?? 0,
        discount: u?.discount ?? 0,
      };
    });
    const calc = computeStatement({
      totalWaterFee: s.totalWaterFee,
      commonElectricity: s.commonElectricity,
      bureauTotalTons: s.bureauTotalTons,
      stairCleaningFee: s.stairCleaningFee,
      units,
    });
    return {
      yearMonth: s.yearMonth,
      totalWaterFee: s.totalWaterFee,
      commonElectricity: s.commonElectricity,
      bureauTotalTons: s.bureauTotalTons,
      stairCleaningFee: s.stairCleaningFee,
      ...calc,
    };
  }
}

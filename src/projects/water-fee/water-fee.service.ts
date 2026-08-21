import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { WaterFeeStatement } from './water-fee-statement.entity';
import { WaterFeeUnit } from './water-fee-unit.entity';
import { WaterFeeHousehold } from './water-fee-household.entity';
import { computeStatement, UnitInput } from './water-fee.calc';
import { buildStatementWorkbook } from './water-fee.excel';
import { UNIT_NUMBERS, DEFAULT_STAIR_CLEANING_FEE, DEFAULT_MANAGER_UNIT } from './water-fee.constants';
import {
  CreateStatementDto,
  UpdateGlobalsDto,
  UpdateUnitDto,
  UnitPatch,
  IdentityDto,
  ExtraCostDto,
} from './dto/water-fee.dto';

/**
 * 수도요금 명세서 CRUD + 자동 이월 + 계산 + 세대 식별(호수/아이디 소프트 잠금).
 * 세대별 계산값은 저장하지 않고 조회 시 계산해 내려준다.
 * 관리(총수도요금·새 달·전체 편집·반장 변경)는 현재 반장 호수 세대만 가능.
 */
@Injectable()
export class WaterFeeService {
  constructor(
    @InjectRepository(WaterFeeStatement) private readonly stmtRepo: Repository<WaterFeeStatement>,
    @InjectRepository(WaterFeeUnit) private readonly unitRepo: Repository<WaterFeeUnit>,
    @InjectRepository(WaterFeeHousehold) private readonly householdRepo: Repository<WaterFeeHousehold>,
  ) {}

  // ── 조회 (공개) ──────────────────────────────────────────
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

  /** 신원이 현재 반장 세대와 일치하는지(예외 없이 boolean) — 엑셀 가구수 열 노출 판단용 */
  async isManagerIdentity(unitNo?: string, residentId?: string): Promise<boolean> {
    if (!unitNo || !residentId) return false;
    const hh = await this.householdRepo.findOne({ where: { unitNo } });
    if (!hh || hh.residentId.trim() !== residentId.trim()) return false;
    return unitNo === (await this.currentManagerUnit());
  }

  /** 명세서를 원본 엑셀 형태(xlsx)로 생성. 가구수 열은 반장만(includeHouseholds). */
  async generateExcel(yearMonth: string, includeHouseholds: boolean): Promise<Buffer> {
    const result = await this.getStatement(yearMonth); // 없으면 404
    return buildStatementWorkbook(result, { includeHouseholds });
  }

  /** 한 세대의 월별 사용량·납입액 이력 (최근 먼저) */
  async unitHistory(unitNo: string) {
    this.assertValidUnit(unitNo);
    const stmts = await this.stmtRepo.find({ order: { yearMonth: 'DESC' }, relations: ['units'] });
    const rows = await Promise.all(
      stmts.map(async (s) => {
        const row = (await this.toResult(s)).rows.find((r) => r.unitNo === unitNo);
        return row
          ? {
              yearMonth: s.yearMonth,
              prevReading: row.prevReading,
              currReading: row.currReading,
              usage: row.usage,
              water: row.water,
              labor: row.labor,
              elecStair: row.elecStair,
              discount: row.discount,
              payment: row.payment,
              isManager: row.isManager,
              estimated: row.estimated,
            }
          : null;
      }),
    );
    return rows.filter((x): x is NonNullable<typeof x> => x !== null);
  }

  // ── 세대 식별 ───────────────────────────────────────────
  /** 호수+아이디 등록/확인. 처음이면 등록, 이후엔 일치해야 통과. */
  async verifyHousehold(unitNo: string, residentIdRaw: string) {
    this.assertValidUnit(unitNo);
    const residentId = residentIdRaw.trim();
    if (!residentId) throw new BadRequestException('아이디를 입력해 주세요.');

    let hh = await this.householdRepo.findOne({ where: { unitNo } });
    if (!hh) {
      hh = await this.householdRepo.save(this.householdRepo.create({ unitNo, residentId }));
    } else if (hh.residentId.trim() !== residentId) {
      // 409: 인증(401)이 아니라 "다른 아이디로 이미 등록됨" 충돌.
      // (401을 쓰면 프론트 전역 인터셉터가 로그아웃·로그인 리다이렉트를 유발한다)
      throw new ConflictException('이 호수는 다른 아이디로 등록되어 있어요. 반장에게 초기화를 요청하세요.');
    }
    return { unitNo, residentId: hh.residentId, isManager: unitNo === (await this.currentManagerUnit()) };
  }

  // ── 일반 세대: 내 검침 저장 ──────────────────────────────
  /** 본인 호수의 이번 달 현재 검침값만 저장 */
  async updateMyReading(yearMonth: string, unitNo: string, residentId: string, currReading: number) {
    await this.assertHousehold(unitNo, residentId);
    const s = await this.findStmt(yearMonth);
    const u = s.units.find((x) => x.unitNo === unitNo);
    if (!u) throw new NotFoundException(`${yearMonth}에 ${unitNo} 세대가 없습니다.`);
    u.currReading = currReading;
    u.entered = true; // 검침 입력 완료 표시(더 이상 추정 대상 아님)
    await this.unitRepo.save(u);
    return this.getStatement(yearMonth);
  }

  // ── 관리자(반장) 전용 ───────────────────────────────────
  /** 새 달 명세서 생성 — 직전 달 검침·가구수·반장 자동 이월 */
  async createStatement(dto: CreateStatementDto) {
    await this.assertManager(dto.identity);
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
      managerUnit: latest?.managerUnit ?? DEFAULT_MANAGER_UNIT,
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
          entered: false, // 새 달은 전부 미입력 → 입력 전까진 지난달로 추정
        });
      }),
    });
    await this.stmtRepo.save(s);
    return this.getStatement(dto.yearMonth);
  }

  /** 전체 입력값(총수도요금 등) 수정 */
  async updateGlobals(yearMonth: string, dto: UpdateGlobalsDto) {
    await this.assertManager(dto.identity);
    const s = await this.findStmt(yearMonth);
    if (dto.totalWaterFee !== undefined) s.totalWaterFee = dto.totalWaterFee;
    if (dto.commonElectricity !== undefined) s.commonElectricity = dto.commonElectricity;
    if (dto.bureauTotalTons !== undefined) s.bureauTotalTons = dto.bureauTotalTons;
    if (dto.stairCleaningFee !== undefined) s.stairCleaningFee = dto.stairCleaningFee;
    await this.stmtRepo.save(s);
    return this.getStatement(yearMonth);
  }

  /** 추가비용 목록 교체 (계단청소 외 임의 공동비용) */
  async updateExtraCosts(yearMonth: string, extraCosts: ExtraCostDto[], identity: IdentityDto) {
    await this.assertManager(identity);
    const s = await this.findStmt(yearMonth);
    const valid = new Set(UNIT_NUMBERS as readonly string[]);
    s.extraCosts = extraCosts.map((c) => {
      // 제외 호수: 유효 호수만·중복 제거. 전부 제외되면(분담 세대 0) 제외를 무시한다.
      const excluded = [...new Set((c.excludedUnits ?? []).filter((u) => valid.has(u)))];
      const excludedUnits = excluded.length < UNIT_NUMBERS.length ? excluded : [];
      return { name: c.name.trim(), amount: c.amount, excludedUnits };
    });
    await this.stmtRepo.save(s);
    return this.getStatement(yearMonth);
  }

  /** 반장 호수 변경 */
  async setManager(yearMonth: string, managerUnit: string, identity: IdentityDto) {
    await this.assertManager(identity);
    this.assertValidUnit(managerUnit);
    const s = await this.findStmt(yearMonth);
    s.managerUnit = managerUnit;
    await this.stmtRepo.save(s);
    return this.getStatement(yearMonth);
  }

  /** 세대 1곳 수정 (관리자) */
  async updateUnit(yearMonth: string, unitNo: string, dto: UpdateUnitDto, identity: IdentityDto) {
    await this.assertManager(identity);
    const s = await this.findStmt(yearMonth);
    const u = s.units.find((x) => x.unitNo === unitNo);
    if (!u) throw new NotFoundException(`${yearMonth}에 ${unitNo} 세대가 없습니다.`);
    Object.assign(u, this.pickUnit(dto));
    if (dto.currReading !== undefined) u.entered = true; // 현재검침 수정 = 입력 완료
    await this.unitRepo.save(u);
    return this.getStatement(yearMonth);
  }

  /** 세대 여러 곳 일괄 수정(표 저장, 관리자) */
  async updateUnits(yearMonth: string, patches: UnitPatch[], identity: IdentityDto) {
    await this.assertManager(identity);
    const s = await this.findStmt(yearMonth);
    const byNo = new Map(s.units.map((u) => [u.unitNo, u]));
    const dirty: WaterFeeUnit[] = [];
    for (const p of patches) {
      const u = byNo.get(p.unitNo);
      if (!u) continue;
      Object.assign(u, this.pickUnit(p));
      if (p.currReading !== undefined) u.entered = true;
      dirty.push(u);
    }
    if (dirty.length) await this.unitRepo.save(dirty);
    return this.getStatement(yearMonth);
  }

  async deleteStatement(yearMonth: string, identity: IdentityDto) {
    await this.assertManager(identity);
    const s = await this.findStmt(yearMonth);
    await this.stmtRepo.remove(s); // units는 onDelete CASCADE
  }

  /** 한 세대의 아이디 등록 초기화 (관리자) → 그 세대가 새 아이디로 다시 등록 가능 */
  async resetHousehold(unitNo: string, identity: IdentityDto) {
    await this.assertManager(identity);
    this.assertValidUnit(unitNo);
    const hh = await this.householdRepo.findOne({ where: { unitNo } });
    if (hh) await this.householdRepo.remove(hh);
    return { unitNo, reset: true };
  }

  // ── 내부 ─────────────────────────────────────────────────
  /** 현재 반장 호수 = 최근 명세서의 반장(없으면 기본값) */
  private async currentManagerUnit(): Promise<string> {
    const latest = await this.stmtRepo.findOne({ where: {}, order: { yearMonth: 'DESC' } });
    return latest?.managerUnit ?? DEFAULT_MANAGER_UNIT;
  }

  /** 신원(호수/아이디)이 등록된 세대와 일치하는지 확인 (없거나 불일치면 401) */
  private async assertHousehold(unitNo: string, residentIdRaw: string) {
    this.assertValidUnit(unitNo);
    const residentId = (residentIdRaw ?? '').trim();
    const hh = await this.householdRepo.findOne({ where: { unitNo } });
    if (!hh || hh.residentId.trim() !== residentId) {
      // 403(401 아님): 401은 프론트 전역 인터셉터의 로그아웃 리다이렉트를 유발한다.
      throw new ForbiddenException('호수 또는 아이디가 일치하지 않습니다. 다시 확인해 주세요.');
    }
  }

  /** 관리 권한 = 신원 일치 + 현재 반장 호수 (아니면 403) */
  private async assertManager(identity: IdentityDto) {
    await this.assertHousehold(identity.unitNo, identity.residentId);
    if (identity.unitNo !== (await this.currentManagerUnit())) {
      throw new ForbiddenException('관리 권한은 반장 세대만 가능합니다.');
    }
  }

  private assertValidUnit(unitNo: string) {
    if (!(UNIT_NUMBERS as readonly string[]).includes(unitNo)) {
      throw new BadRequestException(`알 수 없는 호수입니다: ${unitNo}`);
    }
  }

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

  /** 직전 달의 세대별 사용량(미입력 추정용). 없으면 빈 맵. */
  private async prevMonthUsage(yearMonth: string): Promise<Map<string, number>> {
    const prev = await this.stmtRepo.findOne({
      where: { yearMonth: LessThan(yearMonth) },
      order: { yearMonth: 'DESC' },
      relations: ['units'],
    });
    const m = new Map<string, number>();
    for (const u of prev?.units ?? []) m.set(u.unitNo, Math.max(0, u.currReading - u.prevReading));
    return m;
  }

  /** 엔티티 → 계산 결과(입력값 + 세대별 계산 + 합계). 미입력 세대는 지난달로 추정. */
  private async toResult(s: WaterFeeStatement) {
    const est = await this.prevMonthUsage(s.yearMonth);
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
        entered: u?.entered ?? false,
        estUsage: est.get(unitNo) ?? 0,
      };
    });
    const extraCosts = s.extraCosts ?? [];
    const calc = computeStatement({
      totalWaterFee: s.totalWaterFee,
      commonElectricity: s.commonElectricity,
      bureauTotalTons: s.bureauTotalTons,
      stairCleaningFee: s.stairCleaningFee,
      managerUnit: s.managerUnit,
      extraCosts,
      units,
    });
    return {
      yearMonth: s.yearMonth,
      totalWaterFee: s.totalWaterFee,
      commonElectricity: s.commonElectricity,
      bureauTotalTons: s.bureauTotalTons,
      stairCleaningFee: s.stairCleaningFee,
      managerUnit: s.managerUnit ?? DEFAULT_MANAGER_UNIT,
      extraCosts,
      ...calc,
    };
  }
}

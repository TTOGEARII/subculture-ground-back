import {
  TOTAL_UNITS,
  LINE12_DIVISOR,
  LINE34_DIVISOR,
  isLine12,
  DEFAULT_MANAGER_UNIT,
  LABOR_FEE_DIVISOR,
} from './water-fee.constants';

/** 세대 입력값 (검침·가구수·기타·감면) */
export interface UnitInput {
  unitNo: string;
  prevReading: number; // 이전 검침
  currReading: number; // 현재 검침
  households: number; // 가구수
  other: number; // 기타(원)
  discount: number; // 감면(원)
}

/** 명세서 전체 입력값 (월별 금액) */
export interface StatementInput {
  totalWaterFee: number; // 총 수도요금(수도국 청구, 원)
  commonElectricity: number; // 공동전기(원)
  bureauTotalTons: number; // 수도국 총사용량(톤)
  stairCleaningFee: number; // 계단청소 총액(라인당, 원)
  managerUnit?: string; // 반장 호수(수고비 면제) — 없으면 기본값
  units: UnitInput[];
}

/** 세대별 계산 결과 (한 줄) */
export interface UnitResult extends UnitInput {
  usage: number; // 사용량(t) = 현재 - 이전
  water: number; // 수도료 = 사용량 × 1톤당
  labor: number; // 납입/수고비
  elecStair: number; // 전기/계단
  payment: number; // 납입액 = 수도+수고비+전기계단+기타-감면 (반장은 총수고비 추가 차감)
  isManager: boolean;
}

export interface StatementResult {
  perTon: number; // 1톤당(원) = (총수도요금 + 총감면) / 검침총사용량
  meteredTons: number; // 검침총사용량(t)
  bureauDiff: number; // 수도국과의 차이(t) = 수도국총사용량 - 검침총사용량
  totalLaborFee: number; // 총 수고비(반장 차감분)
  rows: UnitResult[];
  totals: {
    usage: number;
    water: number;
    labor: number;
    elecStair: number;
    other: number;
    discount: number;
    payment: number;
    households: number;
  };
  grandTotal: number; // 총 금액(총수도요금 + 전기계단합 + 수고비합) — 검산용
}

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

/**
 * 수도요금 정산 계산 (엑셀 2026.07 공식 그대로).
 * - 1톤당 = (총수도요금 + 총감면) / 검침총사용량
 * - 수도료 = 사용량 × 1톤당
 * - 수고비 = (1톤당/14) × 반장 사용량  [반장 본인은 0]
 * - 전기계단 = 공동전기/15 + 계단청소/(라인 세대수)
 * - 납입액 = 수도 + 수고비 + 전기계단 + 기타 - 감면  [반장은 여기서 총수고비 추가 차감]
 */
export function computeStatement(input: StatementInput): StatementResult {
  const units = input.units;
  const managerUnit = input.managerUnit || DEFAULT_MANAGER_UNIT;
  const usageOf = (u: UnitInput) => u.currReading - u.prevReading;

  const meteredTons = sum(units.map(usageOf));
  const totalDiscount = sum(units.map((u) => u.discount || 0));
  const perTon = meteredTons > 0 ? (input.totalWaterFee + totalDiscount) / meteredTons : 0;

  const manager = units.find((u) => u.unitNo === managerUnit);
  const managerUsage = manager ? usageOf(manager) : 0;
  const laborFeeEach = (perTon / LABOR_FEE_DIVISOR) * managerUsage;

  // 총 수고비 = 반장 제외 전 세대 수고비 합 (반장 납입액에서 차감)
  const totalLaborFee = laborFeeEach * units.filter((u) => u.unitNo !== managerUnit).length;

  const rows: UnitResult[] = units.map((u) => {
    const isManager = u.unitNo === managerUnit;
    const usage = usageOf(u);
    const water = usage * perTon;
    const labor = isManager ? 0 : laborFeeEach;
    const divisor = isLine12(u.unitNo) ? LINE12_DIVISOR : LINE34_DIVISOR;
    const elecStair = input.commonElectricity / TOTAL_UNITS + input.stairCleaningFee / divisor;
    const base = water + labor + elecStair + (u.other || 0) - (u.discount || 0);
    const payment = isManager ? base - totalLaborFee : base;
    return { ...u, usage, water, labor, elecStair, payment, isManager };
  });

  const totals = {
    usage: meteredTons,
    water: sum(rows.map((r) => r.water)),
    labor: sum(rows.map((r) => r.labor)),
    elecStair: sum(rows.map((r) => r.elecStair)),
    other: sum(rows.map((r) => r.other || 0)),
    discount: totalDiscount,
    payment: sum(rows.map((r) => r.payment)),
    households: sum(units.map((u) => u.households || 0)),
  };

  return {
    perTon,
    meteredTons,
    bureauDiff: input.bureauTotalTons - meteredTons,
    totalLaborFee,
    rows,
    totals,
    grandTotal: input.totalWaterFee + totals.elecStair + totals.labor,
  };
}

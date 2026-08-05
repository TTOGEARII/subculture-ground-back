/**
 * 중앙그린빌라 수도요금 정산 상수 (엑셀 공식 그대로 고정).
 * 세대·라인 구성은 고정, 금액 입력(총수도요금·공동전기·계단청소 등)은 월별로 받는다.
 */

/** 15세대 순서 (표시 순서와 동일) */
export const UNIT_NUMBERS = [
  '101', '102', '103',
  '201', '202', '203', '204',
  '301', '302', '303', '304',
  '401', '402', '403', '404',
] as const;

export const TOTAL_UNITS = UNIT_NUMBERS.length; // 15 — 공동전기 분모

/** 계단청소는 라인별로 나눈다: 끝자리 1·2 = 1·2라인(8세대), 3·4 = 3·4라인(7세대) */
export const LINE12_DIVISOR = 8;
export const LINE34_DIVISOR = 7;
export const isLine12 = (unitNo: string): boolean => {
  const last = Number(unitNo.slice(-1));
  return last === 1 || last === 2;
};

/** 반장(수고비 면제 + 총수고비를 납입액에서 차감) */
export const MANAGER_UNIT = '301';
/** 납입수고비 계수: (1톤당 ÷ 14) × 반장(301호) 사용량 = 세대별 정액 수고비 */
export const LABOR_FEE_DIVISOR = 14;

/** 기본 계단청소 총액(라인당) */
export const DEFAULT_STAIR_CLEANING_FEE = 40000;

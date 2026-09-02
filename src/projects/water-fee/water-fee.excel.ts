import * as ExcelJS from 'exceljs';
import { UnitResult } from './water-fee.calc';
import { METER_READING_DAY, PAYMENT_DUE_DAY } from './water-fee.constants';

/** 엑셀 생성에 필요한 명세서 데이터(서비스 toResult 결과와 동형) */
export interface StatementExcelData {
  yearMonth: string;
  totalWaterFee: number;
  commonElectricity: number;
  bureauTotalTons: number;
  stairCleaningFee: number;
  managerUnit: string;
  extraCosts: { name: string; amount: number }[];
  perTon: number;
  meteredTons: number;
  bureauDiff: number;
  totalExtra: number;
  rows: UnitResult[];
  totals: {
    usage: number;
    water: number;
    labor: number;
    elecStair: number;
    extra: number;
    other: number;
    discount: number;
    payment: number;
    households: number;
  };
}

const MONEY = '#,##0';
const TON = '#,##0';
const PER_TON = '#,##0.0';
const ACCOUNT_NOTE =
  '※ 입금계좌  카카오뱅크  3333-38-0106723        입금 일자는 매월 25일 까지 부탁드립니다.';
const FAX_NOTE = 'FAX : 032-524-6800';

const r0 = (n: number) => Math.round(n);
const thin: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

/**
 * 원본 "07월 요금내역서" 엑셀 형태를 그대로 재현한 워크북을 만든다.
 * - 현재 명세서의 계산값(반장·추가비용 반영)을 채운다.
 * - 추가비용(계단청소 외)은 세대별 몫을 '기타(I)'에 합산(납입액 = 수도+수고비+전기계단+기타-감면 유지),
 *   항목 내역은 하단에 별도 표기.
 */
export async function buildStatementWorkbook(
  s: StatementExcelData,
  opts: { includeHouseholds?: boolean } = {},
): Promise<Buffer> {
  const showHH = opts.includeHouseholds !== false; // 가구수 열(반장만). 기본 노출.
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(s.yearMonth, {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1, // 가로는 항상 A4 세로 1페이지 폭에 맞춤
      fitToHeight: 0, // 세로는 필요한 만큼(넘치면 다음 페이지)
      horizontalCentered: true,
      margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.4, header: 0.2, footer: 0.2 },
    },
  });

  // 열 너비 (B~M) — A4 세로 1페이지 폭에 맞춘 컴팩트 설정(합 ≈ 92)
  ws.columns = [
    { width: 2 }, // A 여백
    { width: 8 }, // B 호수
    { width: 9 }, // C 시작 계량기(6월 20일)
    { width: 9 }, // D 끝 계량기(7월 20일)
    { width: 6 }, // E 사용량
    { width: 9 }, // F 수도
    { width: 9 }, // G 수고비
    { width: 9 }, // H 전기/계단
    { width: 8 }, // I 기타
    { width: 8 }, // J 감면
    { width: 11 }, // K 납입액
    { width: 6 }, // L 비고
    { width: 6 }, // M 가구수
  ];
  // 인쇄영역을 실제 표 범위로 고정(오른쪽 빈 열이 페이지에 끼지 않게)
  ws.pageSetup.printArea = 'B1:M30';
  // 명시 안 된 열(금액 F·G·H 등)의 기본 폭 — A4 세로 폭에 맞게 컴팩트하게
  ws.properties.defaultColWidth = 9;

  const cell = (
    coord: string,
    value: ExcelJS.CellValue,
    opts: { bold?: boolean; size?: number; numFmt?: string; align?: 'left' | 'center' | 'right'; border?: boolean; fill?: string; wrap?: boolean } = {},
  ) => {
    const c = ws.getCell(coord);
    c.value = value;
    c.font = { name: '맑은 고딕', size: opts.size ?? 10, bold: opts.bold ?? false };
    c.alignment = { horizontal: opts.align ?? 'center', vertical: 'middle', wrapText: opts.wrap ?? false };
    if (opts.numFmt) c.numFmt = opts.numFmt;
    if (opts.border !== false) c.border = thin;
    if (opts.fill) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
    return c;
  };
  const HEAD = 'FFF2F2F2';

  const month = Number(s.yearMonth.split('-')[1] ?? 0);
  // 검침 월(월검침 표기): 정산서 N월 = (N-2)월~(N-1)월 검침 → 현재검침 (N-1)월, 이전검침 (N-2)월
  const readMonth = (before: number) => {
    const d = new Date(`${s.yearMonth}-01T00:00:00`);
    d.setMonth(d.getMonth() - before);
    return d.getMonth() + 1;
  };
  const prevM = readMonth(2);
  const currM = readMonth(1);
  // 정산서가 청구하는 기간 — 앱 화면과 같은 표기("6월 20일 ~ 7월 20일")
  const periodText = `${prevM}월 ${METER_READING_DAY}일 ~ ${currM}월 ${METER_READING_DAY}일`;

  // ── 제목 ──
  ws.mergeCells('B1:K2');
  cell('B1', `${month}월 요금내역서`, { bold: true, size: 18, border: false });
  // 사용기간을 제목 바로 아래에 박아 둔다 — 앱과 같은 표기로, "몇 월에 쓴 물인가"를 종이에서도 한 번에 보이게.
  ws.mergeCells('B3:K3');
  cell('B3', `사용기간 : ${periodText}    ·    납기일 : 매월 ${PAYMENT_DUE_DAY}일까지`, { bold: true, size: 11, border: false });
  ws.getRow(1).height = 24;
  ws.getRow(2).height = 24;

  // ── 헤더 블록 (4~6행) ──
  ws.mergeCells('B4:D4'); cell('B4', '총 수도요금 (원)', { bold: true, fill: HEAD });
  ws.mergeCells('E4:F4'); cell('E4', r0(s.totalWaterFee), { numFmt: MONEY, align: 'right' });
  ws.mergeCells('G4:H4'); cell('G4', '공동전기 (원)', { bold: true, fill: HEAD });
  cell('I4', r0(s.commonElectricity), { numFmt: MONEY, align: 'right' });
  cell('J4', '호수', { bold: true, fill: HEAD });
  cell('K4', '계단청소', { bold: true, fill: HEAD });

  ws.mergeCells('B5:D5'); cell('B5', '총사용량 (15가구) 톤', { bold: true, fill: HEAD });
  ws.mergeCells('E5:F5'); cell('E5', r0(s.bureauTotalTons), { numFmt: TON, align: 'right' });
  ws.mergeCells('G5:H5'); cell('G5', '1톤당 (원)', { bold: true, fill: HEAD });
  cell('I5', Math.round(s.perTon * 10) / 10, { numFmt: PER_TON, align: 'right' });
  cell('J5', '1-2호', { fill: HEAD });
  cell('K5', r0(s.stairCleaningFee / 8), { numFmt: MONEY, align: 'right' });

  ws.mergeCells('B6:D6'); cell('B6', '검침가구 (15가구) 사용량 (톤)', { bold: true, fill: HEAD });
  ws.mergeCells('E6:F6'); cell('E6', r0(s.meteredTons), { numFmt: TON, align: 'right' });
  ws.mergeCells('G6:H6'); cell('G6', '수도국과의 차이 (톤)', { bold: true, fill: HEAD });
  cell('I6', r0(s.bureauDiff), { numFmt: TON, align: 'right' });
  cell('J6', '3-4호', { fill: HEAD });
  cell('K6', r0(s.stairCleaningFee / 7), { numFmt: MONEY, align: 'right' });

  // ── 표 헤더 (8~9행) ──
  ws.mergeCells('B8:B9'); cell('B8', '호수', { bold: true, fill: HEAD });
  ws.mergeCells('C8:D8'); cell('C8', '계량기 숫자', { bold: true, fill: HEAD });
  cell('C9', `${prevM}월 ${METER_READING_DAY}일`, { bold: true, fill: HEAD });
  cell('D9', `${currM}월 ${METER_READING_DAY}일`, { bold: true, fill: HEAD });
  ws.mergeCells('E8:E9'); cell('E8', '사용량\n(t)', { bold: true, fill: HEAD, wrap: true });
  ws.mergeCells('F8:J8'); cell('F8', '금액 ( 원 )', { bold: true, fill: HEAD });
  cell('F9', '수도', { bold: true, fill: HEAD });
  cell('G9', '납입\n수고비', { bold: true, fill: HEAD, wrap: true });
  cell('H9', '전기/계단', { bold: true, fill: HEAD });
  cell('I9', '기타', { bold: true, fill: HEAD });
  cell('J9', '감면', { bold: true, fill: HEAD });
  ws.mergeCells('K8:K9'); cell('K8', '납입액\n(원)', { bold: true, fill: HEAD, wrap: true });
  ws.mergeCells('L8:L9'); cell('L8', '비고\n(원)', { bold: true, fill: HEAD, wrap: true });
  if (showHH) { ws.mergeCells('M8:M9'); cell('M8', '가구수', { bold: true, fill: HEAD }); }
  else { ws.getColumn(13).hidden = true; } // 가구수 열 숨김(반장 아님)

  // ── 본표 (10~24행) ──
  s.rows.forEach((row, i) => {
    const r = 10 + i;
    const etc = r0((row.other || 0) + (row.extra || 0)); // 기타 = 기타 + 추가비용 몫
    cell(`B${r}`, `${row.unitNo}호`, { bold: true, fill: row.isManager ? 'FFFDEEF1' : undefined });
    cell(`C${r}`, row.prevReading, { align: 'right' });
    cell(`D${r}`, row.currReading, { align: 'right' });
    cell(`E${r}`, row.usage, { numFmt: TON, align: 'right' });
    cell(`F${r}`, r0(row.water), { numFmt: MONEY, align: 'right' });
    cell(`G${r}`, r0(row.labor), { numFmt: MONEY, align: 'right' });
    cell(`H${r}`, r0(row.elecStair), { numFmt: MONEY, align: 'right' });
    cell(`I${r}`, etc || null, { numFmt: MONEY, align: 'right' });
    cell(`J${r}`, r0(row.discount) || null, { numFmt: MONEY, align: 'right' });
    cell(`K${r}`, r0(row.payment), { numFmt: MONEY, align: 'right', bold: true });
    cell(`L${r}`, null);
    if (showHH) cell(`M${r}`, row.households, { align: 'right' });
  });

  // ── 합계 (25행) ──
  const R = 25;
  ws.mergeCells(`B${R}:D${R}`); cell(`B${R}`, '합계', { bold: true, fill: HEAD });
  cell(`E${R}`, s.totals.usage, { numFmt: TON, align: 'right', bold: true, fill: HEAD });
  cell(`F${R}`, r0(s.totals.water), { numFmt: MONEY, align: 'right', bold: true, fill: HEAD });
  cell(`G${R}`, r0(s.totals.labor), { numFmt: MONEY, align: 'right', bold: true, fill: HEAD });
  cell(`H${R}`, r0(s.totals.elecStair), { numFmt: MONEY, align: 'right', bold: true, fill: HEAD });
  cell(`I${R}`, r0(s.totals.other + s.totals.extra) || null, { numFmt: MONEY, align: 'right', bold: true, fill: HEAD });
  cell(`J${R}`, r0(s.totals.discount) || null, { numFmt: MONEY, align: 'right', bold: true, fill: HEAD });
  cell(`K${R}`, r0(s.totals.payment), { numFmt: MONEY, align: 'right', bold: true, fill: HEAD });
  cell(`L${R}`, null, { fill: HEAD });
  if (showHH) cell(`M${R}`, s.totals.households, { align: 'right', bold: true, fill: HEAD });

  // ── 푸터 ──
  // 표 합계(납입액)와 총 금액이 왜 다른지 시트에서 바로 보이게: 납입합계 ＋ 수고비 ＝ 총 금액.
  // (수고비는 세대가 부담해 반장에게 지급 → 각자 내는 납입액 합계에선 상쇄돼 빠지고, 총 비용엔 포함된다)
  const paymentSum = r0(s.totals.payment); // = 표 합계(K25) = 실제 걷는 금액
  const laborSum = r0(s.totals.labor); // 총 수고비(반장 몫)

  cell('B26', ACCOUNT_NOTE, { align: 'left', border: false, size: 10 });
  cell('B27', FAX_NOTE, { align: 'left', border: false, size: 10 });
  cell('J28', '납입합계', { bold: true, fill: HEAD });
  cell('K28', paymentSum, { numFmt: MONEY, align: 'right' });
  cell('J29', '＋수고비', { bold: true, fill: HEAD });
  cell('K29', laborSum, { numFmt: MONEY, align: 'right' });
  cell('J30', '＝총금액', { bold: true, fill: HEAD });
  cell('K30', paymentSum + laborSum, { numFmt: MONEY, align: 'right', bold: true });

  // ── 추가비용 내역(있을 때만) ──
  if (s.extraCosts.length) {
    const per = r0(s.totalExtra / 15);
    const items = s.extraCosts.map((c) => `${c.name} ${c.amount.toLocaleString('ko-KR')}원`).join(', ');
    ws.mergeCells('B28:I30');
    cell('B28', `추가비용(계단청소 외): ${items}\n합계 ${s.totalExtra.toLocaleString('ko-KR')}원 · 세대당 ${per.toLocaleString('ko-KR')}원 (기타 열에 포함)`, {
      align: 'left', border: false, wrap: true, size: 10,
    });
  }

  // 열 너비를 마지막에 강제 지정(병합셀이 있는 열도 확실히 적용) — A4 세로 1페이지 폭 기준
  const colWidths = [2, 8, 9, 9, 6, 9, 9, 9, 8, 8, 11, 6, 6]; // A~M
  colWidths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

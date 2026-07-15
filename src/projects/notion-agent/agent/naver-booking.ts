/**
 * 네이버 예약(booking.naver.com) 직접 조회 클라이언트.
 *
 * band-room.com을 거치지 않고 네이버 예약 GraphQL을 직접 호출한다.
 *   - bizItems: 합주실(businessId)의 룸 목록
 *   - schedule.bizItemSchedule.hourly: 룸(bizItemId)의 날짜별 시간대 예약 현황
 *
 * band-room.com이 사라져도 businessId만 있으면 이 모듈로 실시간 조회가 가능하다.
 * businessId 카탈로그는 우리 DB(sb_band_studio)가 보유한다 (band-studio.service.ts).
 */

const NAVER_GRAPHQL = 'https://m.booking.naver.com/graphql';
// 네이버 예약 "공간대여" 카테고리. 합주실은 모두 이 타입이다.
const NAVER_BUSINESS_TYPE_ID = 10;

export interface StudioRoom {
  id: string;
  name: string;
  price: string;
}

export interface HourSlot {
  time: string; // "HH:mm"
  available: boolean;
  price: number | null;
}

export interface RoomAvailability {
  bizItemId: string;
  roomName: string;
  price: number | null;
  slots: HourSlot[];
  availableHours: string[]; // 예약 가능한 "HH:mm" 목록
}

/** 네이버 예약 URL에서 businessId / bizItemId 추출 */
export function parseNaverUrl(
  url: string | undefined | null,
): { businessId: string; bizItemId: string | null } | null {
  if (!url) return null;
  const m = url.match(/booking\.naver\.com\/booking\/\d+\/bizes\/(\d+)(?:\/items\/(\d+))?/);
  if (!m) return null;
  return { businessId: m[1], bizItemId: m[2] ?? null };
}

async function naverGraphql<T>(
  operationName: string,
  query: string,
  variables: unknown,
): Promise<T> {
  const res = await fetch(`${NAVER_GRAPHQL}?opName=${operationName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://m.booking.naver.com',
      Referer: 'https://m.booking.naver.com/',
    },
    body: JSON.stringify({ operationName, query, variables }),
  });
  if (!res.ok) throw new Error(`네이버 GraphQL 실패(${operationName}): HTTP ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(`네이버 GraphQL 오류: ${json.errors[0].message}`);
  if (!json.data) throw new Error(`네이버 GraphQL 응답 없음(${operationName})`);
  return json.data;
}

const BIZ_ITEMS_QUERY = `query bizItems($input: BizItemsParams) {
  bizItems(input: $input) { bizItemId name price __typename }
}`;

interface BizItemsData {
  bizItems: Array<{ bizItemId: string; name: string; price: number }>;
}

/** 합주실(businessId)의 룸 목록 */
export async function fetchRooms(businessId: string): Promise<StudioRoom[]> {
  const data = await naverGraphql<BizItemsData>('bizItems', BIZ_ITEMS_QUERY, {
    input: { businessId, lang: 'ko', projections: 'RESOURCE,MIN_MAX_PRICE' },
  });
  return data.bizItems.map((b) => ({
    id: String(b.bizItemId),
    name: b.name,
    price: `${Number(b.price).toLocaleString()}원`,
  }));
}

const HOURLY_QUERY = `query hourlySchedule($scheduleParams: ScheduleParams) {
  schedule(input: $scheduleParams) {
    bizItemSchedule {
      hourly {
        unitStartDateTime
        unitStartTime
        unitBookingCount
        unitStock
        occupiedBookingCount
        isSaleDay
        isUnitSaleDay
        isUnitBusinessDay
        prices { price __typename }
        __typename
      }
      __typename
    }
    __typename
  }
}`;

interface HourlyData {
  schedule: {
    bizItemSchedule: {
      hourly: Array<{
        unitStartDateTime: string; // UTC "YYYY-MM-DDTHH:mm:ss"
        unitStartTime: string; // KST "YYYY-MM-DD HH:mm:ss" (표시·필터는 이걸 쓴다)
        unitBookingCount: number;
        unitStock: number;
        occupiedBookingCount?: number; // 점유(선점/보류)된 수 — 예약수와 별개로 재고를 깎는다
        isSaleDay: boolean;
        isUnitSaleDay: boolean; // 그 시각이 판매중인지. false면 재고가 있어도 마감(핵심)
        isUnitBusinessDay: boolean;
        prices?: Array<{ price: number }>;
      }>;
    };
  };
}

/**
 * 한 룸(bizItemId)의 특정 날짜 시간대별 예약 현황.
 *
 * 가능 판정: 판매일 && **그 시각 판매중(isUnitSaleDay)** && 영업시각 &&
 *            (재고 - 예약수 - 점유수 > 0).
 * ⚠️ isUnitSaleDay를 반드시 본다 — 재고가 남아도(unitStock>unitBookingCount) 그 시각이
 *    판매중지면 네이버는 "마감"으로 뜬다. 이걸 빼면 마감 슬롯을 "가능"으로 오판한다.
 *    (네이버 예약 페이지가 실제 쓰는 판정 필드를 Playwright로 캡처해 확정.)
 */
export async function fetchRoomAvailability(
  businessId: string,
  bizItemId: string,
  date: string, // "YYYY-MM-DD"
  roomName = '',
): Promise<RoomAvailability> {
  const data = await naverGraphql<HourlyData>('hourlySchedule', HOURLY_QUERY, {
    scheduleParams: {
      businessTypeId: NAVER_BUSINESS_TYPE_ID,
      businessId,
      bizItemId,
      startDateTime: `${date}T00:00:00`,
      endDateTime: `${date}T23:59:59`,
      fixedTime: true,
      includesHolidaySchedules: true,
    },
  });

  // unitStartDateTime은 UTC라 KST 날짜/시각과 9시간 어긋난다.
  // unitStartTime(KST, "YYYY-MM-DD HH:mm:ss")으로 필터·표시한다.
  const kstOf = (h: { unitStartTime?: string; unitStartDateTime: string }) =>
    h.unitStartTime || h.unitStartDateTime;
  const hourly = data.schedule.bizItemSchedule.hourly.filter((h) => kstOf(h).startsWith(date));
  const slots: HourSlot[] = hourly.map((h) => {
    const available =
      h.isSaleDay &&
      h.isUnitSaleDay &&
      h.isUnitBusinessDay &&
      h.unitStock - h.unitBookingCount - (h.occupiedBookingCount ?? 0) > 0;
    return {
      time: kstOf(h).slice(11, 16),
      available,
      price: h.prices?.[0]?.price ?? null,
    };
  });
  const price = slots.find((s) => s.price != null)?.price ?? null;
  return {
    bizItemId,
    roomName,
    price,
    slots,
    availableHours: slots.filter((s) => s.available).map((s) => s.time),
  };
}

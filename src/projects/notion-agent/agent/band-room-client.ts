/**
 * band-room 데이터 클라이언트 (백엔드 내장본)
 *
 * 두 개의 공개 JSON API만으로 서울 합주실의 실시간 빈 시간을 조회한다.
 *   1) band-room 카탈로그 — 합주실 목록 + 네이버 예약 URL
 *   2) 네이버 예약 GraphQL — 룸 목록(bizItems) + 시간대별 예약 현황(hourlySchedule)
 *
 * ⚠️ 원본은 루트 band-room-mcp/src/band-room.ts (독립 MCP 서버). 이 파일은 그 사본이다.
 * 프로덕션 배포(젠킨스가 back 레포만 빌드)에서 서브프로세스 spawn 없이 도구를 쓰기 위해
 * 백엔드에 내장했다. 로직 수정 시 양쪽을 함께 고쳐야 한다.
 * (런타임은 fetch만 사용 — 추가 의존성 없음.)
 */

const CATALOG_URL = 'https://api.band-room.com/studio-catalog';
const NAVER_GRAPHQL = 'https://m.booking.naver.com/graphql';
// 네이버 예약 "공간대여" 카테고리. band-room 합주실은 모두 이 타입이다.
const NAVER_BUSINESS_TYPE_ID = 10;

export interface StudioRoom {
  id: string;
  name: string;
  price: string;
}

export interface Studio {
  id: string;
  name: string;
  region: string;
  address: string;
  priceRange: string;
  openHours: string;
  amenities: string[];
  rooms: StudioRoom[];
  naverUrl: string | null;
  /** naverUrl에서 파싱한 예약 식별자 (네이버 예약 합주실만 존재) */
  naver: { businessId: string; bizItemId: string | null } | null;
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

// ── 카탈로그 ────────────────────────────────────────────
interface CatalogResponse {
  studios: Array<{
    id: string;
    name: string;
    region: string;
    address: string;
    priceRange: string;
    openHours: string;
    amenities?: string[];
    roomDetails?: Array<{ id: string; name: string; price: string }>;
    naverUrl?: string;
  }>;
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

let catalogCache: { at: number; studios: Studio[] } | null = null;
const CATALOG_TTL_MS = 10 * 60 * 1000; // 10분

export async function fetchCatalog(): Promise<Studio[]> {
  if (catalogCache && Date.now() - catalogCache.at < CATALOG_TTL_MS) {
    return catalogCache.studios;
  }
  const res = await fetch(CATALOG_URL, {
    headers: { Accept: 'application/json', Origin: 'https://www.band-room.com' },
  });
  if (!res.ok) throw new Error(`카탈로그 조회 실패: HTTP ${res.status}`);
  const json = (await res.json()) as CatalogResponse;
  const studios: Studio[] = json.studios.map((s) => ({
    id: s.id,
    name: s.name,
    region: s.region,
    address: s.address,
    priceRange: s.priceRange,
    openHours: s.openHours,
    amenities: s.amenities ?? [],
    rooms: (s.roomDetails ?? []).map((r) => ({ id: r.id, name: r.name, price: r.price })),
    naverUrl: s.naverUrl ?? null,
    naver: parseNaverUrl(s.naverUrl),
  }));
  catalogCache = { at: Date.now(), studios };
  return studios;
}

/** 지역/키워드로 합주실 검색. 인자가 없으면 전체 반환. */
export async function searchStudios(opts: {
  region?: string;
  query?: string;
  naverOnly?: boolean;
}): Promise<Studio[]> {
  const { region, query, naverOnly } = opts;
  let studios = await fetchCatalog();
  if (naverOnly) studios = studios.filter((s) => s.naver !== null);
  if (region) {
    const r = region.trim();
    studios = studios.filter((s) => s.region.includes(r));
  }
  if (query) {
    const q = query.trim().toLowerCase();
    studios = studios.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q),
    );
  }
  return studios;
}

/** 이름 또는 businessId로 합주실 1곳 찾기 */
export async function findStudio(nameOrBusinessId: string): Promise<Studio | null> {
  const studios = await fetchCatalog();
  const key = nameOrBusinessId.trim();
  return (
    studios.find((s) => s.naver?.businessId === key) ??
    studios.find((s) => s.name === key) ??
    studios.find((s) => s.name.toLowerCase().includes(key.toLowerCase())) ??
    null
  );
}

// ── 네이버 GraphQL ──────────────────────────────────────
async function naverGraphql<T>(operationName: string, query: string, variables: unknown): Promise<T> {
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
        unitBookingCount
        unitStock
        isSaleDay
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
        unitStartDateTime: string; // "YYYY-MM-DDTHH:mm:ss"
        unitBookingCount: number;
        unitStock: number;
        isSaleDay: boolean;
        isUnitBusinessDay: boolean;
        prices?: Array<{ price: number }>;
      }>;
    };
  };
}

/**
 * 한 룸(bizItemId)의 특정 날짜 시간대별 예약 현황.
 * 가능 판정: 판매일 && 영업일 && (재고 - 예약수 > 0). Playwright로 검증한 로직.
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

  const hourly = data.schedule.bizItemSchedule.hourly.filter((h) =>
    h.unitStartDateTime.startsWith(date),
  );
  const slots: HourSlot[] = hourly.map((h) => {
    const available =
      h.isSaleDay && h.isUnitBusinessDay && h.unitStock - h.unitBookingCount > 0;
    return {
      time: h.unitStartDateTime.slice(11, 16),
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

/**
 * 합주실 1곳의 특정 날짜 빈 시간을 룸별로 조회.
 * 반환: 합주실 정보 + 룸별 가능 시간 + 예약 링크.
 */
export async function getStudioAvailability(
  nameOrBusinessId: string,
  date: string,
): Promise<{
  studio: Studio;
  date: string;
  rooms: RoomAvailability[];
  reservationUrl: string | null;
}> {
  const studio = await findStudio(nameOrBusinessId);
  if (!studio) throw new Error(`합주실을 찾을 수 없습니다: ${nameOrBusinessId}`);
  if (!studio.naver) {
    throw new Error(`${studio.name}은(는) 네이버 예약 연동이 없어 실시간 조회가 불가합니다.`);
  }
  const { businessId } = studio.naver;
  const rooms = await fetchRooms(businessId);
  const avail = await Promise.all(
    rooms.map((r) => fetchRoomAvailability(businessId, r.id, date, r.name)),
  );
  return {
    studio,
    date,
    rooms: avail,
    reservationUrl: studio.naverUrl,
  };
}

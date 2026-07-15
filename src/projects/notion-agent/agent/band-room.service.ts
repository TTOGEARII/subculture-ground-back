import { Injectable } from '@nestjs/common';
import { BandStudioService } from './band-studio.service';
import type { AgentTool } from './agent-tool';

/**
 * 합주실 도구 — 백엔드 내장 실행.
 * 합주실 목록은 우리 DB(sb_band_studio)에서, 실시간 빈 시간은 네이버 예약을 직접 조회한다.
 * 조회 경로 어디에도 band-room.com 의존이 없다 — band-room이 사라져도 동작한다.
 * (BandStudioService가 카탈로그+네이버 조회를 담당. 이 클래스는 도구 스키마/응답 형식만 정의.)
 */
@Injectable()
export class BandRoomService {
  constructor(private readonly studios: BandStudioService) {}

  private readonly toolDefs: AgentTool[] = [
    {
      name: 'search_studios',
      description:
        '서울 합주실을 검색한다. region(예: "합정/홍대", "강남", "사당/이수")이나 query(이름/주소 키워드)로 필터링. ' +
        '결과에는 이름, 지역, 주소, 가격대, 룸 구성, 네이버 예약 연동 여부(businessId)가 포함된다. ' +
        '사용자가 합주실을 찾거나 특정 지역의 합주실 목록을 원할 때 호출.',
      inputSchema: {
        type: 'object',
        properties: {
          region: { type: 'string', description: '지역명 부분 일치 (예: 홍대, 강남)' },
          query: { type: 'string', description: '합주실 이름/주소 키워드' },
          naver_only: {
            type: 'boolean',
            description: 'true면 네이버 예약 연동(실시간 빈 시간 조회 가능) 합주실만',
          },
        },
      },
    },
    {
      name: 'get_available_slots',
      description:
        '특정 합주실의 특정 날짜 빈 시간을 룸별로 실시간 조회한다(네이버 예약 데이터). ' +
        'studio는 합주실 이름 또는 businessId, date는 YYYY-MM-DD(하루만). ' +
        '⚠️ 여러 날(예: "이번 주", "7월 마지막주")을 물으면 날짜마다 각각 호출한다. ' +
        '사용자가 "8시부터 10시까지 되는 방" 처럼 **시간대(구간)**를 지정하면 start_time·end_time을 반드시 넣어라. ' +
        '그러면 응답의 각 룸에 bookableForRequestedTime(그 구간 전체가 연속으로 비어 예약 가능한지)이 담긴다. ' +
        '합주실은 보통 최소 연속 시간(예: 2시간) 제약이 있어, 시작 시각 하나만 비어도 구간 예약은 불가할 수 있으니 ' +
        '구간 질문엔 반드시 bookableForRequestedTime로 판단한다. availableHours는 그 날 예약 가능한 개별 시작 시각 목록이다. ' +
        '각 룸에는 reservationUrl이 담긴다 — 그 룸 + 조회 날짜가 미리 선택된 링크이며, start_time·end_time을 준 경우 **시간 구간까지 미리 선택**된다(사용자는 링크만 열어 결제). 예약 안내 시 이 룸별 링크를 그대로 준다.',
      inputSchema: {
        type: 'object',
        properties: {
          studio: { type: 'string', description: '합주실 이름(부분 일치 가능) 또는 businessId' },
          date: { type: 'string', description: '조회 날짜 (YYYY-MM-DD, 하루)' },
          start_time: {
            type: 'string',
            description: '구간 시작 시각 "HH:mm" (예: "20:00"). 시간대 예약 질문일 때만',
          },
          end_time: {
            type: 'string',
            description: '구간 종료 시각 "HH:mm" (예: "22:00", 종료는 미포함). start_time과 함께',
          },
        },
        required: ['studio', 'date'],
      },
    },
    {
      name: 'get_reservation_url',
      description:
        '합주실의 네이버 예약 페이지 URL을 반환한다. 사용자가 실제 예약하려 할 때 이 링크를 안내. ' +
        'date(YYYY-MM-DD)를 주면 날짜가, start_time·end_time("HH:mm")까지 주면 **날짜와 시간 구간까지 미리 선택된** ' +
        '상태로 열려 사용자가 결제만 하면 된다. 예약 확정은 네이버 로그인이 필요하므로 링크를 통해 사용자가 직접 진행한다.',
      inputSchema: {
        type: 'object',
        properties: {
          studio: { type: 'string', description: '합주실 이름(부분 일치 가능) 또는 businessId' },
          date: { type: 'string', description: '(선택) 미리 선택할 날짜 (YYYY-MM-DD)' },
          start_time: { type: 'string', description: '(선택) 미리 선택할 시작 시각 "HH:mm" (date와 함께)' },
          end_time: { type: 'string', description: '(선택) 미리 선택할 종료 시각 "HH:mm" (date와 함께)' },
        },
        required: ['studio'],
      },
    },
  ];

  getToolDefinitions(): AgentTool[] {
    return this.toolDefs;
  }

  canHandle(toolName: string): boolean {
    return this.toolDefs.some((t) => t.name === toolName);
  }

  async execute(toolName: string, input: Record<string, unknown>): Promise<string> {
    switch (toolName) {
      case 'search_studios': {
        const studios = await this.studios.searchStudios({
          region: input.region as string | undefined,
          query: input.query as string | undefined,
          naverOnly: input.naver_only as boolean | undefined,
        });
        const summary = studios.map((s) => ({
          name: s.name,
          region: s.region,
          address: s.address,
          priceRange: s.priceRange,
          openHours: s.openHours,
          rooms: (s.rooms ?? []).map((r) => `${r.name} ${r.price}`),
          realtimeAvailable: !!s.businessId,
          businessId: s.businessId,
        }));
        return JSON.stringify({ count: summary.length, studios: summary });
      }
      case 'get_available_slots': {
        const result = await this.studios.getStudioAvailability(
          input.studio as string,
          input.date as string,
        );
        // 구간(연속 시간) 예약 가능 여부: start~end 사이 매 시각이 모두 비어야 예약 가능.
        // 합주실은 최소 연속 시간 제약이 있어 개별 시각만으로 판단하면 과다 집계된다.
        const startTime = typeof input.start_time === 'string' ? input.start_time : null;
        const endTime = typeof input.end_time === 'string' ? input.end_time : null;
        const requiredHours = startTime && endTime ? hoursInRange(startTime, endTime) : null;

        const businessId = result.studio.businessId;
        return JSON.stringify({
          studio: {
            name: result.studio.name,
            region: result.studio.region,
            address: result.studio.address,
          },
          date: result.date,
          requestedTime: requiredHours ? `${startTime}~${endTime}` : null,
          rooms: result.rooms.map((r) => ({
            room: r.roomName,
            price: r.price != null ? `${r.price.toLocaleString()}원/시간` : null,
            availableHours: r.availableHours,
            bookableForRequestedTime: requiredHours
              ? requiredHours.every((h) => r.availableHours.includes(h))
              : null,
            // 그 룸 + 날짜(+요청 시간대)가 미리 선택된 예약 링크
            reservationUrl: businessId
              ? roomReservationUrl(businessId, r.bizItemId, result.date, startTime, endTime)
              : appendDateTime(result.reservationUrl, result.date, startTime, endTime),
          })),
          reservationUrl: appendDateTime(result.reservationUrl, result.date, startTime, endTime),
          note: requiredHours
            ? '각 룸의 reservationUrl은 날짜와 요청 시간대까지 미리 선택된 링크다. 사용자는 링크만 열어 결제하면 된다.'
            : '각 룸의 reservationUrl은 날짜가 미리 선택된 링크다. 시간은 네이버에서 선택하면 된다.',
        });
      }
      case 'get_reservation_url': {
        const found = await this.studios.findStudio(input.studio as string);
        if (!found) throw new Error(`합주실을 찾을 수 없습니다: ${input.studio}`);
        const date = typeof input.date === 'string' ? input.date : undefined;
        const st = typeof input.start_time === 'string' ? input.start_time : undefined;
        const et = typeof input.end_time === 'string' ? input.end_time : undefined;
        const hasTime = !!(date && st && et);
        return JSON.stringify({
          name: found.name,
          address: found.address,
          reservationUrl: appendDateTime(found.naverUrl, date, st, et),
          note: found.naverUrl
            ? hasTime
              ? '날짜와 시간이 미리 선택된 링크입니다. 네이버 로그인 후 결제만 하면 됩니다.'
              : date
                ? '날짜가 미리 선택된 링크입니다. 네이버 로그인 후 시간을 선택해 예약을 완료하세요.'
                : '이 링크에서 네이버 로그인 후 예약을 완료하세요.'
            : '이 합주실은 온라인 예약 링크가 등록되어 있지 않습니다. 전화 문의가 필요할 수 있습니다.',
        });
      }
      default:
        throw new Error(`알 수 없는 합주실 도구: ${toolName}`);
    }
  }
}

/**
 * 룸(bizItemId) + 날짜(+시간)가 미리 선택된 네이버 예약 링크.
 * startDate로 날짜, startDateTime·endDateTime(ISO+09:00)으로 시간 구간까지 미리 선택된다.
 */
function roomReservationUrl(
  businessId: string,
  bizItemId: string,
  date: string,
  startTime?: string | null,
  endTime?: string | null,
): string {
  const base = `https://m.booking.naver.com/booking/10/bizes/${businessId}/items/${bizItemId}?area=bmp&lang=ko&startDate=${date}`;
  return base + dateTimeQuery(date, startTime, endTime);
}

/** startDateTime·endDateTime 쿼리 조각 (시각이 둘 다 있을 때만). 예: "20:00" → 2026-08-05T20:00:00+09:00 */
function dateTimeQuery(date: string, startTime?: string | null, endTime?: string | null): string {
  if (!startTime || !endTime) return '';
  const sdt = encodeURIComponent(`${date}T${startTime}:00+09:00`);
  const edt = encodeURIComponent(`${date}T${endTime}:00+09:00`);
  return `&startDateTime=${sdt}&endDateTime=${edt}`;
}

/** 기존 예약 URL에 날짜(+시간) 쿼리를 붙인다. date 없으면 원본 그대로, 이미 있으면 그대로. */
function appendDateTime(
  url: string | null,
  date?: string,
  startTime?: string | null,
  endTime?: string | null,
): string | null {
  if (!url || !date) return url;
  if (/[?&]startDate=/.test(url)) return url;
  const sep = url.includes('?') ? '&' : '?';
  return url + sep + `startDate=${date}` + dateTimeQuery(date, startTime, endTime);
}

/** "20:00"~"22:00" → ["20:00","21:00"] (종료 시각 미포함). 시작이 예약을 점유하는 매 시각. */
function hoursInRange(start: string, end: string): string[] {
  const toH = (t: string) => parseInt(t.slice(0, 2), 10);
  const s = toH(start);
  const e = toH(end);
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return [];
  const out: string[] = [];
  for (let h = s; h < e; h++) out.push(`${String(h).padStart(2, '0')}:00`);
  return out;
}

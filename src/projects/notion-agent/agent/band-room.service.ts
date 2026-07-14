import { Injectable } from '@nestjs/common';
import { searchStudios, findStudio, getStudioAvailability } from './band-room-client';
import type { AgentTool } from './agent-tool';

/**
 * 합주실(band-room) 도구 — 백엔드 내장 실행.
 * 이전엔 band-room-mcp를 stdio 서브프로세스로 spawn했으나, 프로덕션 배포에서
 * 서브프로세스가 없어 실패했다. band-room-client(fetch)를 직접 호출하도록 바꿔
 * 배포 환경과 무관하게 항상 동작한다. 도구 스키마/응답 형식은 MCP 서버와 동일.
 */
@Injectable()
export class BandRoomService {
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
        'studio는 합주실 이름 또는 businessId, date는 YYYY-MM-DD. ' +
        '사용자가 "언제 비어있어?", "예약 가능한 시간" 등을 물으면 호출. ' +
        '응답의 availableHours가 예약 가능한 시작 시각 목록이며, reservationUrl로 실제 예약할 수 있다.',
      inputSchema: {
        type: 'object',
        properties: {
          studio: { type: 'string', description: '합주실 이름(부분 일치 가능) 또는 businessId' },
          date: { type: 'string', description: '조회 날짜 (YYYY-MM-DD)' },
        },
        required: ['studio', 'date'],
      },
    },
    {
      name: 'get_reservation_url',
      description:
        '합주실의 네이버 예약 페이지 URL을 반환한다. 사용자가 실제 예약하려 할 때 이 링크를 안내. ' +
        '예약 확정은 네이버 로그인이 필요하므로 링크를 통해 사용자가 직접 진행한다.',
      inputSchema: {
        type: 'object',
        properties: {
          studio: { type: 'string', description: '합주실 이름(부분 일치 가능) 또는 businessId' },
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
        const studios = await searchStudios({
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
          rooms: s.rooms.map((r) => `${r.name} ${r.price}`),
          realtimeAvailable: s.naver !== null,
          businessId: s.naver?.businessId ?? null,
        }));
        return JSON.stringify({ count: summary.length, studios: summary });
      }
      case 'get_available_slots': {
        const result = await getStudioAvailability(
          input.studio as string,
          input.date as string,
        );
        return JSON.stringify({
          studio: {
            name: result.studio.name,
            region: result.studio.region,
            address: result.studio.address,
          },
          date: result.date,
          rooms: result.rooms.map((r) => ({
            room: r.roomName,
            price: r.price != null ? `${r.price.toLocaleString()}원/시간` : null,
            availableHours: r.availableHours,
          })),
          reservationUrl: result.reservationUrl,
        });
      }
      case 'get_reservation_url': {
        const found = await findStudio(input.studio as string);
        if (!found) throw new Error(`합주실을 찾을 수 없습니다: ${input.studio}`);
        return JSON.stringify({
          name: found.name,
          address: found.address,
          reservationUrl: found.naverUrl,
          note: found.naverUrl
            ? '이 링크에서 네이버 로그인 후 예약을 완료하세요.'
            : '이 합주실은 온라인 예약 링크가 등록되어 있지 않습니다. 전화 문의가 필요할 수 있습니다.',
        });
      }
      default:
        throw new Error(`알 수 없는 합주실 도구: ${toolName}`);
    }
  }
}

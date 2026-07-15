import type { AgentTool } from './agent-tool';

/**
 * YouTube 도구 — YouTube Data API v3 검색.
 *
 * 곡/커버 영상을 검색해 watch URL을 반환한다. 프론트 채팅이 응답의 youtube URL을
 * 감지해 플레이어로 임베드하므로, 응답에는 반드시 watch URL(https://www.youtube.com/watch?v=...)을 담는다.
 *
 * 키는 회원별 저장(youtube_api_key). NotionToolExecutor처럼 요청마다 키를 쥔 executor를 만든다.
 */
export const YOUTUBE_TOOL_DEFINITIONS: AgentTool[] = [
  {
    name: 'search_youtube',
    description:
      '유튜브에서 영상을 검색한다. 곡 제목/아티스트로 원곡을, instrument를 주면 "곡 + 악기 + cover"로 ' +
      '특정 악기 커버 영상을 찾는다. 결과의 각 항목에 watch URL이 있으며, 답변에 이 URL을 그대로 포함하면 ' +
      '사용자 화면에서 영상이 바로 재생된다. 사용자가 "~곡 찾아줘", "~기타 커버 보여줘" 등을 요청하면 호출.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '곡 제목/아티스트 등 검색어' },
        instrument: {
          type: 'string',
          description: '특정 악기 커버를 찾을 때 (예: 기타, 드럼, 베이스, 피아노). 생략 시 원곡 검색',
        },
        max: { type: 'number', description: '결과 개수(기본 5, 최대 10)' },
      },
      required: ['query'],
    },
  },
];

interface YoutubeSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: { medium?: { url?: string } };
  };
}

const YOUTUBE_TOOL_NAMES = new Set(YOUTUBE_TOOL_DEFINITIONS.map((t) => t.name));

export class YoutubeToolExecutor {
  constructor(private readonly apiKey: string | null) {}

  canHandle(toolName: string): boolean {
    return YOUTUBE_TOOL_NAMES.has(toolName);
  }

  async execute(toolName: string, input: Record<string, unknown>): Promise<string> {
    if (toolName !== 'search_youtube') throw new Error(`알 수 없는 유튜브 도구: ${toolName}`);
    if (!this.apiKey) {
      throw new Error('YouTube API 키가 설정되지 않았습니다. 설정 화면에서 먼저 등록해주세요.');
    }

    const query = String(input.query ?? '').trim();
    if (!query) throw new Error('검색어(query)가 필요합니다.');
    const instrument = input.instrument ? String(input.instrument).trim() : '';
    const max = Math.min(Math.max(Number(input.max) || 5, 1), 10);
    const q = instrument ? `${query} ${instrument} cover` : query;

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', String(max));
    url.searchParams.set('q', q);
    url.searchParams.set('key', this.apiKey);

    const res = await fetch(url);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      const reason = body?.error?.message ?? `HTTP ${res.status}`;
      throw new Error(`유튜브 검색 실패: ${reason}`);
    }
    const json = (await res.json()) as { items?: YoutubeSearchItem[] };
    const videos = (json.items ?? [])
      .filter((it) => it.id?.videoId)
      .map((it) => ({
        title: it.snippet?.title ?? '',
        channel: it.snippet?.channelTitle ?? '',
        url: `https://www.youtube.com/watch?v=${it.id!.videoId}`,
        thumbnail: it.snippet?.thumbnails?.medium?.url ?? null,
      }));

    return JSON.stringify({ query: q, count: videos.length, videos });
  }
}

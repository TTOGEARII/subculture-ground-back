import type { AgentTool } from './agent-tool';

/**
 * 노션 REST API 도구 — LLM 함수호출 정의 + 실행기.
 * 공식 SDK 대신 fetch 직접 호출 (엔드포인트 6개뿐이라 의존성을 아낀다).
 */

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

export const NOTION_TOOL_DEFINITIONS: AgentTool[] = [
  {
    name: 'notion_search',
    description:
      '노션 워크스페이스에서 페이지/데이터베이스를 제목으로 검색한다. ' +
      '캘린더 DB를 찾을 때 먼저 이 도구로 검색하라. filter를 "database"로 주면 DB만 검색된다.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '검색어 (제목 부분 일치)' },
        filter: {
          type: 'string',
          enum: ['page', 'database'],
          description: '결과 타입 필터 (생략 시 전체)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'notion_get_database',
    description:
      '데이터베이스의 스키마(속성 이름·타입)를 조회한다. ' +
      '페이지를 생성하기 전에 반드시 이 도구로 속성 구조(title/date 속성의 정확한 이름)를 확인하라.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: '데이터베이스 ID' },
      },
      required: ['database_id'],
    },
  },
  {
    name: 'notion_query_database',
    description:
      '데이터베이스의 항목(페이지)들을 조회한다. filter/sorts는 Notion API 형식의 **JSON 문자열**로 준다.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string' },
        filter: {
          type: 'string',
          description:
            'Notion filter 객체의 JSON 문자열 (예: {"property":"날짜","date":{"on_or_after":"2026-07-14"}})',
        },
        sorts: { type: 'string', description: 'Notion sorts 배열의 JSON 문자열' },
        page_size: { type: 'number', description: '최대 결과 수 (기본 20)' },
      },
      required: ['database_id'],
    },
  },
  {
    name: 'notion_create_page',
    description:
      '데이터베이스에 새 페이지(항목)를 생성한다. properties는 Notion API 형식을 **JSON 문자열**로 준다(객체 아님). ' +
      '속성 이름은 notion_get_database로 확인한 실제 이름을 그대로 쓴다. ' +
      '예(캘린더 등록): properties = ' +
      '"{\\"이름\\":{\\"title\\":[{\\"text\\":{\\"content\\":\\"합주 - 그라운드 합정 S룸\\"}}]},' +
      '\\"날짜\\":{\\"date\\":{\\"start\\":\\"2026-07-25T20:00:00+09:00\\",\\"end\\":\\"2026-07-25T22:00:00+09:00\\"}}}"',
    inputSchema: {
      type: 'object',
      properties: {
        parent_database_id: { type: 'string', description: '부모 데이터베이스 ID' },
        properties: {
          type: 'string',
          description:
            'Notion properties를 담은 **JSON 문자열**. title 속성은 {"title":[{"text":{"content":"..."}}]}, ' +
            'date 속성은 {"date":{"start":"...","end":"..."}}, rich_text는 {"rich_text":[{"text":{"content":"..."}}]}, ' +
            'select는 {"select":{"name":"..."}}, status는 {"status":{"name":"..."}}, multi_select는 {"multi_select":[{"name":"..."}]}, ' +
            'number는 {"number":123}, checkbox는 {"checkbox":true} 형식.',
        },
        children: { type: 'string', description: '(선택) 페이지 본문 블록 배열의 JSON 문자열' },
      },
      required: ['parent_database_id', 'properties'],
    },
  },
  {
    name: 'notion_update_page',
    description: '기존 페이지의 속성을 수정한다. properties는 JSON 문자열. 일정 변경/취소(archived) 등에 사용.',
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string' },
        properties: {
          type: 'string',
          description: 'Notion properties를 담은 JSON 문자열 (notion_create_page와 동일 형식)',
        },
        archived: { type: 'boolean', description: 'true면 페이지 삭제(보관)' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'notion_get_page',
    description: '페이지 1개의 속성을 조회한다.',
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string' },
      },
      required: ['page_id'],
    },
  },
];

interface NotionSearchResult {
  results: Array<{
    object: string;
    id: string;
    title?: Array<{ plain_text: string }>;
    properties?: Record<string, { title?: Array<{ plain_text: string }> }>;
    url?: string;
  }>;
}

/** 노션 API 호출기 — 사용자 토큰으로 도구 실행 (토큰 미설정이면 안내 에러) */
export class NotionToolExecutor {
  constructor(private readonly token: string | null) {}

  canHandle(toolName: string): boolean {
    return toolName.startsWith('notion_');
  }

  /** JSON 문자열 인자를 파싱한다(이미 객체면 그대로 — 하위호환). 실패 시 명확한 에러. */
  private parseJson(name: string, v: unknown): unknown {
    if (v === undefined || v === null) return undefined;
    if (typeof v === 'object') return v;
    if (typeof v !== 'string') throw new Error(`${name}은(는) JSON 문자열이어야 합니다.`);
    const s = v.trim();
    if (!s) return undefined;
    try {
      return JSON.parse(s);
    } catch {
      throw new Error(`${name} JSON 파싱 실패 — 올바른 JSON 문자열로 주세요. 받은 값: ${s.slice(0, 120)}`);
    }
  }

  private async call(method: string, path: string, body?: unknown): Promise<string> {
    const res = await fetch(`${NOTION_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) {
      // 에러 본문을 그대로 모델에 넘겨 스스로 수정하게 한다
      throw new Error(`Notion API ${res.status}: ${text.slice(0, 500)}`);
    }
    return text;
  }

  async execute(toolName: string, input: Record<string, unknown>): Promise<string> {
    if (!this.token) {
      throw new Error(
        '노션 토큰이 설정되지 않았습니다. 노션 기능을 쓰려면 설정 화면에서 노션 Integration 토큰을 먼저 입력해주세요.',
      );
    }
    switch (toolName) {
      case 'notion_search': {
        const body: Record<string, unknown> = { query: input.query, page_size: 10 };
        if (input.filter) {
          body.filter = { property: 'object', value: input.filter };
        }
        const raw = await this.call('POST', '/search', body);
        // 응답이 커서 요약: id/타입/제목/url만
        const json = JSON.parse(raw) as NotionSearchResult;
        const items = json.results.map((r) => {
          let title = '';
          if (r.title?.length) {
            title = r.title.map((t) => t.plain_text).join('');
          } else if (r.properties) {
            const titleProp = Object.values(r.properties).find((p) => p.title);
            title = titleProp?.title?.map((t) => t.plain_text).join('') ?? '';
          }
          return { object: r.object, id: r.id, title, url: r.url };
        });
        return JSON.stringify({ count: items.length, results: items });
      }
      case 'notion_get_database':
        return this.call('GET', `/databases/${input.database_id}`);
      case 'notion_query_database': {
        const body: Record<string, unknown> = {
          page_size: input.page_size ?? 20,
        };
        const filter = this.parseJson('filter', input.filter);
        const sorts = this.parseJson('sorts', input.sorts);
        if (filter) body.filter = filter;
        if (sorts) body.sorts = sorts;
        return this.call('POST', `/databases/${input.database_id}/query`, body);
      }
      case 'notion_create_page': {
        const properties = this.parseJson('properties', input.properties);
        if (!properties) throw new Error('properties(JSON 문자열)가 필요합니다.');
        const body: Record<string, unknown> = {
          parent: { database_id: input.parent_database_id },
          properties,
        };
        const children = this.parseJson('children', input.children);
        if (children) body.children = children;
        return this.call('POST', '/pages', body);
      }
      case 'notion_update_page': {
        const body: Record<string, unknown> = {};
        const properties = this.parseJson('properties', input.properties);
        if (properties) body.properties = properties;
        if (input.archived !== undefined) body.archived = input.archived;
        return this.call('PATCH', `/pages/${input.page_id}`, body);
      }
      case 'notion_get_page':
        return this.call('GET', `/pages/${input.page_id}`);
      default:
        throw new Error(`알 수 없는 노션 도구: ${toolName}`);
    }
  }
}

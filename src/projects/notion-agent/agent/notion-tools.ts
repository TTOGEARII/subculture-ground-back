import type Anthropic from '@anthropic-ai/sdk';

/**
 * 노션 REST API 도구 — Claude tool-use 정의 + 실행기.
 * 공식 SDK 대신 fetch 직접 호출 (엔드포인트 6개뿐이라 의존성을 아낀다).
 */

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

export const NOTION_TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'notion_search',
    description:
      '노션 워크스페이스에서 페이지/데이터베이스를 제목으로 검색한다. ' +
      '캘린더 DB를 찾을 때 먼저 이 도구로 검색하라. filter를 "database"로 주면 DB만 검색된다.',
    input_schema: {
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
    input_schema: {
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
      '데이터베이스의 항목(페이지)들을 조회한다. filter/sorts는 Notion API 형식 JSON.',
    input_schema: {
      type: 'object',
      properties: {
        database_id: { type: 'string' },
        filter: {
          type: 'object',
          description: 'Notion API filter 객체 (예: {"property":"날짜","date":{"on_or_after":"2026-07-14"}})',
        },
        sorts: { type: 'array', items: { type: 'object' } },
        page_size: { type: 'number', description: '최대 결과 수 (기본 20)' },
      },
      required: ['database_id'],
    },
  },
  {
    name: 'notion_create_page',
    description:
      '데이터베이스에 새 페이지(항목)를 생성한다. properties는 Notion API 형식. ' +
      '예 (캘린더 등록): {"이름":{"title":[{"text":{"content":"합주 - 그라운드 합정"}}]},' +
      '"날짜":{"date":{"start":"2026-07-20T19:00:00+09:00","end":"2026-07-20T21:00:00+09:00"}}} ' +
      '— 속성 이름은 notion_get_database로 확인한 실제 이름을 써야 한다.',
    input_schema: {
      type: 'object',
      properties: {
        parent_database_id: { type: 'string', description: '부모 데이터베이스 ID' },
        properties: { type: 'object', description: 'Notion API 형식 properties 객체' },
        children: {
          type: 'array',
          items: { type: 'object' },
          description: '(선택) 페이지 본문 블록들 (Notion block 형식)',
        },
      },
      required: ['parent_database_id', 'properties'],
    },
  },
  {
    name: 'notion_update_page',
    description: '기존 페이지의 속성을 수정한다. 일정 변경/취소(archived) 등에 사용.',
    input_schema: {
      type: 'object',
      properties: {
        page_id: { type: 'string' },
        properties: { type: 'object', description: 'Notion API 형식 properties 객체' },
        archived: { type: 'boolean', description: 'true면 페이지 삭제(보관)' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'notion_get_page',
    description: '페이지 1개의 속성을 조회한다.',
    input_schema: {
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

/** 노션 API 호출기 — 사용자 토큰으로 도구 실행 */
export class NotionToolExecutor {
  constructor(private readonly token: string) {}

  canHandle(toolName: string): boolean {
    return toolName.startsWith('notion_');
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
        if (input.filter) body.filter = input.filter;
        if (input.sorts) body.sorts = input.sorts;
        return this.call('POST', `/databases/${input.database_id}/query`, body);
      }
      case 'notion_create_page': {
        const body: Record<string, unknown> = {
          parent: { database_id: input.parent_database_id },
          properties: input.properties,
        };
        if (input.children) body.children = input.children;
        return this.call('POST', '/pages', body);
      }
      case 'notion_update_page': {
        const body: Record<string, unknown> = {};
        if (input.properties) body.properties = input.properties;
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

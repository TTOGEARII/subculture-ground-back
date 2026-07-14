import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { NotionAgentService } from '../notion-agent.service';
import { BandRoomMcpService } from './band-room-mcp.service';
import { NOTION_TOOL_DEFINITIONS, NotionToolExecutor } from './notion-tools';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToolCallTrace {
  tool: string;
  input: Record<string, unknown>;
  ok: boolean;
}

export interface ChatResult {
  reply: string;
  toolCalls: ToolCallTrace[];
}

const AGENT_MODEL = 'claude-opus-4-8';
const MAX_TOOL_ITERATIONS = 12;

function buildSystemPrompt(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = kst.toISOString().slice(0, 10);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][kst.getUTCDay()];

  return `너는 사용자의 노션(Notion) 워크스페이스를 관리하는 AI 비서다. 오늘은 ${dateStr} (${weekday}요일), 시간대는 Asia/Seoul(+09:00)이다.

## 역할
- 노션 도구(notion_*)로 페이지/데이터베이스를 검색·조회·생성·수정한다.
- 밴드룸 도구(search_studios, get_available_slots, get_reservation_url)로 서울 합주실의 실시간 빈 시간을 조회하고 네이버 예약 링크를 안내한다.
- 실제 예약 확정은 네이버 로그인이 필요해 대신할 수 없다 — 빈 시간 확인 후 예약 링크를 안내하고, 사용자가 예약을 마치면(또는 예약 내용을 알려주면) 노션 캘린더에 기록한다.

## 합주 일정을 노션 캘린더 DB에 등록하는 절차
1. notion_search(filter: "database")로 캘린더/일정 DB를 찾는다. 사용자가 DB 이름을 말했으면 그 이름으로, 아니면 "캘린더", "일정" 등으로 검색하고 후보가 여럿이면 사용자에게 확인한다.
2. notion_get_database로 스키마를 확인해 title 속성과 date 속성의 **정확한 이름**을 파악한다.
3. notion_create_page로 등록한다. 날짜는 date 속성에 start/end를 ISO 8601 (+09:00 오프셋 포함)로 넣고, 제목에는 합주실 이름과 룸을 담는다 (예: "합주 - 그라운드 합정 A룸").
4. 등록 후 생성된 페이지 URL을 사용자에게 알려준다.

## 규칙
- 답변은 한국어로, 간결하게. 도구 실행 과정을 장황하게 나열하지 말고 결과 중심으로 전달한다.
- 날짜가 상대적이면("내일", "이번 주 토요일") 오늘 날짜 기준으로 계산한다.
- 노션 API 에러가 나면 에러 메시지를 읽고 properties 형식을 고쳐 재시도한다.
- 되돌리기 어려운 작업(페이지 archived 처리 등)은 실행 전에 사용자에게 확인한다.`;
}

/**
 * Claude tool-use 에이전트 루프.
 * 사용자별 Anthropic API 키로 클라이언트를 만들고,
 * 노션 도구 + band-room MCP 도구를 합쳐 stop_reason이 tool_use인 동안 반복 실행한다.
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly credentials: NotionAgentService,
    private readonly bandRoomMcp: BandRoomMcpService,
  ) {}

  async chat(userIdx: number, history: ChatTurn[], message: string): Promise<ChatResult> {
    const { notionToken, anthropicKey } = await this.credentials.getDecryptedCredentials(userIdx);
    if (!anthropicKey) {
      throw new BadRequestException('Anthropic API 키가 설정되지 않았습니다. 설정에서 먼저 등록해주세요.');
    }
    if (!notionToken) {
      throw new BadRequestException('노션 토큰이 설정되지 않았습니다. 설정에서 먼저 등록해주세요.');
    }

    const client = new Anthropic({ apiKey: anthropicKey });
    const notionExecutor = new NotionToolExecutor(notionToken);
    const tools: Anthropic.Tool[] = [
      ...NOTION_TOOL_DEFINITIONS,
      ...this.bandRoomMcp.getToolDefinitions(),
    ];

    const messages: Anthropic.MessageParam[] = [
      ...history.map((t) => ({ role: t.role, content: t.content })),
      { role: 'user' as const, content: message },
    ];

    const trace: ToolCallTrace[] = [];

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await client.messages.create({
        model: AGENT_MODEL,
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        system: buildSystemPrompt(),
        tools,
        messages,
      });

      if (response.stop_reason === 'tool_use') {
        // thinking 블록 포함 전체 content를 그대로 되돌려준다 (수정 금지)
        messages.push({ role: 'assistant', content: response.content });

        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const block of response.content) {
          if (block.type !== 'tool_use') continue;
          const input = block.input as Record<string, unknown>;
          let resultText: string;
          let isError = false;
          try {
            resultText = await this.executeTool(block.name, input, notionExecutor);
          } catch (error) {
            resultText = error instanceof Error ? error.message : String(error);
            isError = true;
          }
          trace.push({ tool: block.name, input, ok: !isError });
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: resultText,
            is_error: isError || undefined,
          });
        }
        messages.push({ role: 'user', content: toolResults });
        continue;
      }

      if (response.stop_reason === 'refusal') {
        return { reply: '죄송해요, 이 요청은 처리할 수 없습니다.', toolCalls: trace };
      }

      const reply = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');
      this.logger.log(
        `에이전트 응답 (userIdx: ${userIdx}, 도구 ${trace.length}회, 반복 ${i + 1})`,
      );
      return { reply, toolCalls: trace };
    }

    return {
      reply: '도구 호출이 너무 길어져 중단했어요. 요청을 더 작게 나눠서 다시 시도해주세요.',
      toolCalls: trace,
    };
  }

  private async executeTool(
    name: string,
    input: Record<string, unknown>,
    notionExecutor: NotionToolExecutor,
  ): Promise<string> {
    if (notionExecutor.canHandle(name)) {
      return notionExecutor.execute(name, input);
    }
    if (this.bandRoomMcp.canHandle(name)) {
      return this.bandRoomMcp.execute(name, input);
    }
    throw new Error(`알 수 없는 도구: ${name}`);
  }
}

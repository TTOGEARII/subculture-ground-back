import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GoogleGenAI, type Content, type Part } from '@google/genai';
import { NotionAgentService } from '../notion-agent.service';
import { BandRoomService } from './band-room.service';
import { SheetMusicService } from './sheet-music.service';
import { NOTION_TOOL_DEFINITIONS, NotionToolExecutor } from './notion-tools';
import { YOUTUBE_TOOL_DEFINITIONS, YoutubeToolExecutor } from './youtube-tools';
import type { AgentTool } from './agent-tool';

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

/** 선택 가능한 대표 Gemini 모델 (키에서 동작 확인된 것만). 첫 항목이 기본값. */
export const ALLOWED_MODELS = ['gemini-3-flash-preview', 'gemini-2.5-flash'] as const;
const DEFAULT_MODEL = ALLOWED_MODELS[0];
const MAX_TOOL_ITERATIONS = 12;

function resolveModel(model?: string): string {
  return model && (ALLOWED_MODELS as readonly string[]).includes(model)
    ? model
    : DEFAULT_MODEL;
}

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
- search_youtube로 곡/커버 영상을 찾는다. **응답에 결과의 watch URL(https://www.youtube.com/watch?v=...)을 그대로 포함**해야 사용자 화면에서 영상이 바로 재생된다. 특정 악기 커버는 instrument 인자를 준다.
- search_sheet_music으로 songsterr·ultimate-guitar·mymusic5의 악보/타브 **링크**를 찾아 안내한다. 악보 원본은 저작권상 제공하지 않고 링크만 전달한다.

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
 * Gemini 함수호출 에이전트 루프.
 * 사용자별 Gemini API 키로 클라이언트를 만들고,
 * 노션 도구 + 합주실 도구를 함수 선언으로 합쳐 functionCalls가 있는 동안 반복 실행한다.
 * thinking은 끈다(config) — 복잡한 도구 스키마에서 빈 응답을 유발하기 때문.
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly credentials: NotionAgentService,
    private readonly bandRoom: BandRoomService,
    private readonly sheetMusic: SheetMusicService,
  ) {}

  async chat(
    userIdx: number,
    history: ChatTurn[],
    message: string,
    model?: string,
  ): Promise<ChatResult> {
    const agentModel = resolveModel(model);
    const { notionToken, geminiKey, youtubeKey } =
      await this.credentials.getDecryptedCredentials(userIdx);
    if (!geminiKey) {
      throw new BadRequestException('Gemini API 키가 설정되지 않았습니다. 설정에서 먼저 등록해주세요.');
    }
    if (!notionToken) {
      throw new BadRequestException('노션 토큰이 설정되지 않았습니다. 설정에서 먼저 등록해주세요.');
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const notionExecutor = new NotionToolExecutor(notionToken);
    const youtubeExecutor = new YoutubeToolExecutor(youtubeKey);
    const agentTools: AgentTool[] = [
      ...NOTION_TOOL_DEFINITIONS,
      ...this.bandRoom.getToolDefinitions(),
      ...YOUTUBE_TOOL_DEFINITIONS,
      ...this.sheetMusic.getToolDefinitions(),
    ];
    const geminiTools = [
      {
        functionDeclarations: agentTools.map((t) => ({
          name: t.name,
          description: t.description,
          parametersJsonSchema: t.inputSchema,
        })),
      },
    ];

    const contents: Content[] = [
      ...history.map((t) => ({
        role: t.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: t.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const config = {
      tools: geminiTools,
      systemInstruction: buildSystemPrompt(),
      // thinking을 끄면 함수호출이 훨씬 안정적이다. 켜두면 복잡한 도구 스키마에서
      // gemini-2.5-flash가 thought만 내고 도구/텍스트 없는 빈 응답을 자주 낸다.
      thinkingConfig: { thinkingBudget: 0 },
    };
    const trace: ToolCallTrace[] = [];

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      // gemini-2.5-flash가 간헐적으로(주로 일시적 레이트리밋) 도구도 텍스트도 없는
      // 빈 응답을 내는 경우가 있어 백오프를 두고 최대 3회까지 재시도한다.
      let response = await ai.models.generateContent({ model: agentModel, contents, config });
      for (
        let attempt = 1;
        attempt < 3 &&
        (response.functionCalls?.length ?? 0) === 0 &&
        !response.text?.trim();
        attempt++
      ) {
        this.logger.warn(`빈 응답 재시도 (userIdx: ${userIdx}, ${attempt}/2)`);
        await new Promise((r) => setTimeout(r, 800 * attempt));
        response = await ai.models.generateContent({ model: agentModel, contents, config });
      }

      const calls = response.functionCalls ?? [];
      if (calls.length > 0) {
        // 모델 턴(functionCall 파트 포함)을 그대로 히스토리에 추가
        const modelContent = response.candidates?.[0]?.content;
        if (modelContent) contents.push(modelContent);

        // 각 함수 호출을 실행하고 functionResponse 파트로 응답
        const responseParts: Part[] = [];
        for (const fc of calls) {
          const input = (fc.args ?? {}) as Record<string, unknown>;
          const name = fc.name ?? '';
          let resultText: string;
          let isError = false;
          try {
            resultText = await this.executeTool(name, input, notionExecutor, youtubeExecutor);
          } catch (error) {
            resultText = error instanceof Error ? error.message : String(error);
            isError = true;
          }
          trace.push({ tool: name, input, ok: !isError });
          responseParts.push({
            functionResponse: {
              name,
              response: isError ? { error: resultText } : { result: resultText },
            },
          });
        }
        contents.push({ role: 'user', parts: responseParts });
        continue;
      }

      const reply =
        response.text?.trim() ||
        '응답을 생성하지 못했어요. 질문을 조금 바꿔서 다시 시도해주세요.';
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
    youtubeExecutor: YoutubeToolExecutor,
  ): Promise<string> {
    if (notionExecutor.canHandle(name)) {
      return notionExecutor.execute(name, input);
    }
    if (this.bandRoom.canHandle(name)) {
      return this.bandRoom.execute(name, input);
    }
    if (youtubeExecutor.canHandle(name)) {
      return youtubeExecutor.execute(name, input);
    }
    if (this.sheetMusic.canHandle(name)) {
      return this.sheetMusic.execute(name, input);
    }
    throw new Error(`알 수 없는 도구: ${name}`);
  }
}

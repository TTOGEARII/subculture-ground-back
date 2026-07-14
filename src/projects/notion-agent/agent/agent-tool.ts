/**
 * 프로바이더 중립 도구 정의.
 * 노션 도구·band-room MCP 도구를 이 형태로 모아 LLM(현재 Gemini)에 맞게 변환한다.
 * inputSchema 는 표준 JSON Schema (Gemini parametersJsonSchema 로 그대로 전달).
 */
export interface AgentTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

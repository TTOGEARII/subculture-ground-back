import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as path from 'path';
import type Anthropic from '@anthropic-ai/sdk';

/**
 * band-room MCP 서버(stdio) 클라이언트.
 * 부팅 시 서버 프로세스를 spawn해 연결하고, 도구 목록을 Claude tool 정의로 변환해 제공한다.
 * MCP 서버가 없어도 앱은 뜨되(노션 기능만 동작) 경고를 남긴다.
 */
@Injectable()
export class BandRoomMcpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BandRoomMcpService.name);
  private client: Client | null = null;
  private toolDefs: Anthropic.Tool[] = [];

  async onModuleInit(): Promise<void> {
    const serverPath =
      process.env.BAND_ROOM_MCP_PATH ||
      path.resolve(process.cwd(), '../band-room-mcp/dist/index.js');

    try {
      const transport = new StdioClientTransport({
        command: process.execPath, // 현재 node 바이너리
        args: [serverPath],
      });
      const client = new Client({ name: 'notion-agent-backend', version: '1.0.0' });
      await client.connect(transport);

      const { tools } = await client.listTools();
      this.toolDefs = tools.map((t) => ({
        name: t.name,
        description: t.description ?? '',
        input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
      }));
      this.client = client;
      this.logger.log(
        `band-room MCP 연결됨 (${serverPath}) — 도구: ${tools.map((t) => t.name).join(', ')}`,
      );
    } catch (error) {
      this.logger.warn(
        `band-room MCP 연결 실패 — 합주실 도구 없이 동작합니다. (${serverPath}): ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.close().catch(() => undefined);
  }

  /** Claude tools 배열에 합칠 도구 정의 (연결 실패 시 빈 배열) */
  getToolDefinitions(): Anthropic.Tool[] {
    return this.toolDefs;
  }

  canHandle(toolName: string): boolean {
    return this.toolDefs.some((t) => t.name === toolName);
  }

  async execute(toolName: string, input: Record<string, unknown>): Promise<string> {
    if (!this.client) throw new Error('band-room MCP가 연결되어 있지 않습니다.');
    const result = await this.client.callTool({ name: toolName, arguments: input });
    const content = result.content as Array<{ type: string; text?: string }>;
    const text = content
      .filter((c) => c.type === 'text' && c.text)
      .map((c) => c.text)
      .join('\n');
    if (result.isError) throw new Error(text || 'MCP 도구 실행 실패');
    return text;
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../shared/auth/types/user-payload.interface';
import { EncryptedDto } from '../../shared/auth/dto/encrypted.dto';
import { decryptObject } from '../../common/utils/crypto.util';
import { NotionAgentService } from './notion-agent.service';
import { AgentService, ChatTurn } from './agent/agent.service';
import { ChatRequestDto } from './dto/chat-request.dto';

interface CredentialsDto {
  notionToken?: string;
  anthropicKey?: string;
}

/**
 * 노션 AI 에이전트.
 * - 자격증명 저장(PUT)은 토큰이 오가므로 암호화 본문 필수
 * - 상태 조회(GET)와 채팅(POST)은 평문 + JWT (채팅은 페이로드가 커서 XOR 오버헤드만 생김)
 */
@Controller('notion-agent')
@UseGuards(JwtAuthGuard)
export class NotionAgentController {
  constructor(
    private readonly notionAgentService: NotionAgentService,
    private readonly agentService: AgentService,
  ) {}

  @Put('credentials')
  @HttpCode(HttpStatus.NO_CONTENT)
  async saveCredentials(
    @Body() encryptedDto: EncryptedDto,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    const dto = decryptObject<CredentialsDto>(encryptedDto.encrypted);
    await this.notionAgentService.saveCredentials(user.idx, dto);
  }

  @Get('credentials/status')
  async getStatus(@CurrentUser() user: UserPayload) {
    return this.notionAgentService.getStatus(user.idx);
  }

  @Delete('credentials')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCredentials(@CurrentUser() user: UserPayload): Promise<void> {
    await this.notionAgentService.deleteCredentials(user.idx);
  }

  @Post('chat')
  async chat(@Body() dto: ChatRequestDto, @CurrentUser() user: UserPayload) {
    const history: ChatTurn[] = (dto.history ?? []).map((t) => ({
      role: t.role,
      content: t.content,
    }));
    return this.agentService.chat(user.idx, history, dto.message);
  }
}

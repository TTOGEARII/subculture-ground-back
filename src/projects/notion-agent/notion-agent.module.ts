import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotionCredential } from './notion-credential.entity';
import { NotionAgentService } from './notion-agent.service';
import { NotionAgentController } from './notion-agent.controller';
import { AgentService } from './agent/agent.service';
import { BandRoomMcpService } from './agent/band-room-mcp.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotionCredential])],
  controllers: [NotionAgentController],
  providers: [NotionAgentService, AgentService, BandRoomMcpService],
})
export class NotionAgentModule {}

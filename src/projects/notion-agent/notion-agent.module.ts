import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotionCredential } from './notion-credential.entity';
import { NotionAgentService } from './notion-agent.service';
import { NotionAgentController } from './notion-agent.controller';
import { AgentService } from './agent/agent.service';
import { BandRoomService } from './agent/band-room.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotionCredential])],
  controllers: [NotionAgentController],
  providers: [NotionAgentService, AgentService, BandRoomService],
})
export class NotionAgentModule {}

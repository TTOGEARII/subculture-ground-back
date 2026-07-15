import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotionCredential } from './notion-credential.entity';
import { BandStudio } from './agent/band-studio.entity';
import { NotionAgentService } from './notion-agent.service';
import { NotionAgentController } from './notion-agent.controller';
import { AgentService } from './agent/agent.service';
import { BandRoomService } from './agent/band-room.service';
import { BandStudioService } from './agent/band-studio.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotionCredential, BandStudio])],
  controllers: [NotionAgentController],
  providers: [NotionAgentService, AgentService, BandRoomService, BandStudioService],
})
export class NotionAgentModule {}

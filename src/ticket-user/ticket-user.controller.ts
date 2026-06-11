import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { TicketUserService } from './ticket-user.service';
import { CreateTicketUserDto } from './dto/create-ticket-user.dto';
import { UpdateTicketUserDto } from './dto/update-ticket-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/types/user-payload.interface';

@Controller('ticket-user')
@UseGuards(JwtAuthGuard) // 예매/조회 전부 인증 필요
export class TicketUserController {
  private readonly logger = new Logger(TicketUserController.name);

  constructor(private readonly ticketUserService: TicketUserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTicketUserDto, @CurrentUser() user: UserPayload) {
    // 타인 명의 예매 방지: userIdx는 토큰에서 강제한다.
    dto.userIdx = Number(user.idx);
    return this.ticketUserService.create(dto);
  }

  @Get()
  async findAll(
    @Query('ticketIdx') ticketIdx?: string,
    @Query('userIdx') userIdx?: string,
  ) {
    if (ticketIdx !== undefined && ticketIdx !== '') {
      const id = Number(ticketIdx);
      if (!Number.isNaN(id)) {
        return this.ticketUserService.findByTicketIdx(id);
      }
    }
    if (userIdx !== undefined && userIdx !== '') {
      const id = Number(userIdx);
      if (!Number.isNaN(id)) {
        return this.ticketUserService.findByUserIdx(id);
      }
    }
    return this.ticketUserService.findAll();
  }

  @Get(':idx')
  async findOne(@Param('idx') idx: string) {
    return this.ticketUserService.findOne(Number(idx));
  }

  @Put(':idx')
  async update(@Param('idx') idx: string, @Body() dto: UpdateTicketUserDto) {
    return this.ticketUserService.update(Number(idx), dto);
  }

  @Delete(':idx')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('idx') idx: string) {
    await this.ticketUserService.remove(Number(idx));
  }
}

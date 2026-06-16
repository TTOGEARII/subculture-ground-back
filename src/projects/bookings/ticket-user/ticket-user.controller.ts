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
import { JwtAuthGuard } from '../../../shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/auth/types/user-payload.interface';

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

  // 공연별 예매자 목록 (호스트). ':idx'보다 먼저 선언해야 라우트 충돌이 없다.
  @Get('reservations')
  async reservations(
    @Query('pmIdx') pmIdx: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ticketUserService.findReservationsByPerformance(
      Number(pmIdx),
      user.idx,
    );
  }

  // 마이페이지 — 내 예매 내역
  @Get('my')
  async myReservations(@CurrentUser() user: UserPayload) {
    return this.ticketUserService.findMyReservations(user.idx);
  }

  // 예매 상태 변경 (승인/취소/체크인). status: 0 대기 / 1 결제완료 / 2 체크완료 / 3 취소
  @Put(':idx/status')
  async changeStatus(
    @Param('idx') idx: string,
    @Body('status') status: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ticketUserService.changeStatus(
      Number(idx),
      Number(status) as 0 | 1 | 2 | 3,
      user.idx,
    );
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

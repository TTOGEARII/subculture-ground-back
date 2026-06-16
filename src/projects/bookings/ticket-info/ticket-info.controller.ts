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
import { TicketInfoService } from './ticket-info.service';
import { CreateTicketInfoDto } from './dto/create-ticket-info.dto';
import { UpdateTicketInfoDto } from './dto/update-ticket-info.dto';
import { JwtAuthGuard } from '../../../shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../../shared/auth/types/user-payload.interface';

@Controller('ticket-info')
export class TicketInfoController {
  private readonly logger = new Logger(TicketInfoController.name);

  constructor(private readonly ticketInfoService: TicketInfoService) {}

  // 조회(GET)는 공개 — 구매자가 공연 상세에서 티켓을 봐야 한다.
  // 생성/수정/삭제는 인증 + 본인 공연 소유 검증.

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTicketInfoDto, @CurrentUser() user: UserPayload) {
    return this.ticketInfoService.create(dto, user.idx);
  }

  @Get()
  async findAll(@Query('pmIdx') pmIdx?: string) {
    if (pmIdx !== undefined && pmIdx !== '') {
      const id = Number(pmIdx);
      if (!Number.isNaN(id)) {
        return this.ticketInfoService.findByPmIdx(id);
      }
    }
    return this.ticketInfoService.findAll();
  }

  @Get(':idx')
  async findOne(@Param('idx') idx: string) {
    return this.ticketInfoService.findOne(Number(idx));
  }

  @Put(':idx')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('idx') idx: string,
    @Body() dto: UpdateTicketInfoDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ticketInfoService.update(Number(idx), dto, user.idx);
  }

  @Delete(':idx')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('idx') idx: string, @CurrentUser() user: UserPayload) {
    await this.ticketInfoService.remove(Number(idx), user.idx);
  }
}

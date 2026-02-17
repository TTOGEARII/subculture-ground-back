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
} from '@nestjs/common';
import { TicketInfoService } from './ticket-info.service';
import { CreateTicketInfoDto } from './dto/create-ticket-info.dto';
import { UpdateTicketInfoDto } from './dto/update-ticket-info.dto';

@Controller('ticket-info')
export class TicketInfoController {
  private readonly logger = new Logger(TicketInfoController.name);

  constructor(private readonly ticketInfoService: TicketInfoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTicketInfoDto) {
    return this.ticketInfoService.create(dto);
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
  async update(@Param('idx') idx: string, @Body() dto: UpdateTicketInfoDto) {
    return this.ticketInfoService.update(Number(idx), dto);
  }

  @Delete(':idx')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('idx') idx: string) {
    await this.ticketInfoService.remove(Number(idx));
  }
}

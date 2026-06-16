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
import { MemberBankAccountService } from './member-bank-account.service';
import { CreateMemberBankAccountDto } from './dto/create-member-bank-account.dto';
import { UpdateMemberBankAccountDto } from './dto/update-member-bank-account.dto';

@Controller('member-bank-account')
export class MemberBankAccountController {
  private readonly logger = new Logger(MemberBankAccountController.name);

  constructor(private readonly memberBankAccountService: MemberBankAccountService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMemberBankAccountDto) {
    return this.memberBankAccountService.create(dto);
  }

  @Get()
  async findAll(@Query('userIdx') userIdx?: string) {
    if (userIdx !== undefined && userIdx !== '') {
      const id = Number(userIdx);
      if (!Number.isNaN(id)) {
        return this.memberBankAccountService.findByUserIdx(id);
      }
    }
    return this.memberBankAccountService.findAll();
  }

  @Get(':idx')
  async findOne(@Param('idx') idx: string) {
    return this.memberBankAccountService.findOne(Number(idx));
  }

  @Put(':idx')
  async update(@Param('idx') idx: string, @Body() dto: UpdateMemberBankAccountDto) {
    return this.memberBankAccountService.update(Number(idx), dto);
  }

  @Delete(':idx')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('idx') idx: string) {
    await this.memberBankAccountService.remove(Number(idx));
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketInfo } from './ticket-info.entity';
import { CreateTicketInfoDto } from './dto/create-ticket-info.dto';
import { UpdateTicketInfoDto } from './dto/update-ticket-info.dto';

@Injectable()
export class TicketInfoService {
  private readonly logger = new Logger(TicketInfoService.name);

  constructor(
    @InjectRepository(TicketInfo)
    private ticketInfoRepository: Repository<TicketInfo>,
  ) {}

  async create(dto: CreateTicketInfoDto): Promise<TicketInfo> {
    const entity = this.ticketInfoRepository.create({
      pmIdx: dto.pmIdx,
      ticketName: dto.ticketName ?? null,
      ticketCount: dto.ticketCount ?? 0,
      ticketMax: dto.ticketMax ?? 0,
      ticketMin: dto.ticketMin ?? 0,
      ticketPrice: dto.ticketPrice ?? 0,
      ticketType: dto.ticketType ?? 0,
    });
    const saved = await this.ticketInfoRepository.save(entity);
    this.logger.log(`티켓 정보 생성: idx=${saved.idx}`);
    return saved;
  }

  async findAll(): Promise<TicketInfo[]> {
    return this.ticketInfoRepository.find({
      order: { idx: 'ASC' },
    });
  }

  async findByPmIdx(pmIdx: number): Promise<TicketInfo[]> {
    return this.ticketInfoRepository.find({
      where: { pmIdx, delFlag: 0 },
      order: { idx: 'ASC' },
    });
  }

  async findOne(idx: number): Promise<TicketInfo> {
    const ticket = await this.ticketInfoRepository.findOne({ where: { idx } });
    if (!ticket) {
      throw new NotFoundException(`티켓 정보를 찾을 수 없습니다. (idx: ${idx})`);
    }
    return ticket;
  }

  async update(idx: number, dto: UpdateTicketInfoDto): Promise<TicketInfo> {
    const ticket = await this.findOne(idx);
    if (dto.pmIdx !== undefined) ticket.pmIdx = dto.pmIdx;
    if (dto.ticketName !== undefined) ticket.ticketName = dto.ticketName;
    if (dto.ticketCount !== undefined) ticket.ticketCount = dto.ticketCount;
    if (dto.ticketMax !== undefined) ticket.ticketMax = dto.ticketMax;
    if (dto.ticketMin !== undefined) ticket.ticketMin = dto.ticketMin;
    if (dto.ticketPrice !== undefined) ticket.ticketPrice = dto.ticketPrice;
    if (dto.ticketType !== undefined) ticket.ticketType = dto.ticketType;
    if (dto.delFlag !== undefined) ticket.delFlag = dto.delFlag;

    ticket.updateDt = new Date();
    await this.ticketInfoRepository.save(ticket);
    this.logger.log(`티켓 정보 수정: idx=${idx}`);
    return ticket;
  }

  async remove(idx: number): Promise<void> {
    const ticket = await this.findOne(idx);
    ticket.delFlag = 1;
    ticket.deleteDt = new Date();
    ticket.updateDt = new Date();
    await this.ticketInfoRepository.save(ticket);
    this.logger.log(`티켓 정보 삭제(소프트): idx=${idx}`);
  }

  async hardDelete(idx: number): Promise<void> {
    const ticket = await this.findOne(idx);
    await this.ticketInfoRepository.remove(ticket);
    this.logger.log(`티켓 정보 삭제(물리): idx=${idx}`);
  }
}

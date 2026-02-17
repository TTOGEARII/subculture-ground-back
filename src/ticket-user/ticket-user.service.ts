import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketUser } from './ticket-user.entity';
import { CreateTicketUserDto } from './dto/create-ticket-user.dto';
import { UpdateTicketUserDto } from './dto/update-ticket-user.dto';

@Injectable()
export class TicketUserService {
  private readonly logger = new Logger(TicketUserService.name);

  constructor(
    @InjectRepository(TicketUser)
    private ticketUserRepository: Repository<TicketUser>,
  ) {}

  async create(dto: CreateTicketUserDto): Promise<TicketUser> {
    const entity = this.ticketUserRepository.create({
      ticketIdx: dto.ticketIdx,
      userIdx: dto.userIdx,
      ticketCnt: dto.ticketCnt ?? 0,
      ticketTotalPrice: dto.ticketTotalPrice ?? 0,
      ticketStatus: dto.ticketStatus ?? 0,
    });
    const saved = await this.ticketUserRepository.save(entity);
    this.logger.log(`티켓 유저 생성: idx=${saved.idx}`);
    return saved;
  }

  async findAll(): Promise<TicketUser[]> {
    return this.ticketUserRepository.find({
      order: { idx: 'DESC' },
    });
  }

  async findByTicketIdx(ticketIdx: number): Promise<TicketUser[]> {
    return this.ticketUserRepository.find({
      where: { ticketIdx },
      order: { idx: 'DESC' },
    });
  }

  async findByUserIdx(userIdx: number): Promise<TicketUser[]> {
    return this.ticketUserRepository.find({
      where: { userIdx, deleteDt: null },
      order: { idx: 'DESC' },
    });
  }

  async findOne(idx: number): Promise<TicketUser> {
    const row = await this.ticketUserRepository.findOne({ where: { idx } });
    if (!row) {
      throw new NotFoundException(`티켓 유저 정보를 찾을 수 없습니다. (idx: ${idx})`);
    }
    return row;
  }

  async update(idx: number, dto: UpdateTicketUserDto): Promise<TicketUser> {
    const row = await this.findOne(idx);
    if (dto.ticketIdx !== undefined) row.ticketIdx = dto.ticketIdx;
    if (dto.userIdx !== undefined) row.userIdx = dto.userIdx;
    if (dto.ticketCnt !== undefined) row.ticketCnt = dto.ticketCnt;
    if (dto.ticketTotalPrice !== undefined) row.ticketTotalPrice = dto.ticketTotalPrice;
    if (dto.ticketStatus !== undefined) row.ticketStatus = dto.ticketStatus;
    if (dto.ticketChkDt !== undefined) row.ticketChkDt = dto.ticketChkDt;
    if (dto.ticketPayCompleteDt !== undefined) row.ticketPayCompleteDt = dto.ticketPayCompleteDt;

    row.updateDt = new Date();
    await this.ticketUserRepository.save(row);
    this.logger.log(`티켓 유저 수정: idx=${idx}`);
    return row;
  }

  async remove(idx: number): Promise<void> {
    const row = await this.findOne(idx);
    row.deleteDt = new Date();
    row.updateDt = new Date();
    await this.ticketUserRepository.save(row);
    this.logger.log(`티켓 유저 삭제(소프트): idx=${idx}`);
  }

  async hardDelete(idx: number): Promise<void> {
    const row = await this.findOne(idx);
    await this.ticketUserRepository.remove(row);
    this.logger.log(`티켓 유저 삭제(물리): idx=${idx}`);
  }
}

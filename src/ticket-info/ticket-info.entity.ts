import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity('sb_ticket_info')
@Index('idx_pm_idx', ['pmIdx'])
@Index('idx_ticket_name', ['ticketName'])
@Index('idx_del_flag', ['delFlag'])
@Index('idx_create_dt', ['createDt'])
export class TicketInfo {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  idx: number;

  @Column({ name: 'pm_idx', type: 'bigint', default: 0, comment: 'sb_performances.idx' })
  pmIdx: number;

  @Column({ name: 'ticket_name', type: 'varchar', length: 255, nullable: true, comment: '티켓이름' })
  ticketName: string | null;

  @Column({ name: 'ticket_count', type: 'int', default: 0, comment: '티켓 구매 카운트' })
  ticketCount: number;

  @Column({ name: 'ticket_max', type: 'int', default: 0, comment: '티켓구매 최대수량' })
  ticketMax: number;

  @Column({ name: 'ticket_min', type: 'int', default: 0, comment: '티켓구매 최소수량' })
  ticketMin: number;

  @Column({ name: 'ticket_price', type: 'int', default: 0, comment: '티켓 가격' })
  ticketPrice: number;

  @Column({ name: 'ticket_type', type: 'int', default: 0, comment: '티켓 타입' })
  ticketType: number;

  @Column({ name: 'del_flag', type: 'tinyint', default: 0, comment: '0:정상, 1:삭제' })
  delFlag: number;

  @Column({ name: 'create_dt', type: 'datetime', nullable: true, default: () => 'CURRENT_TIMESTAMP', comment: 'create date' })
  createDt: Date | null;

  @Column({ name: 'update_dt', type: 'datetime', nullable: true, comment: 'update date' })
  updateDt: Date | null;

  @Column({ name: 'delete_dt', type: 'datetime', nullable: true, comment: 'delete date' })
  deleteDt: Date | null;
}

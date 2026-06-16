import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

/** 0:대기, 1:결제완료, 2:체크완료, 3:취소 */
export type TicketUserStatus = 0 | 1 | 2 | 3;

@Entity('sb_ticket_user')
@Index('idx_ticket_idx', ['ticketIdx'])
@Index('idx_user_idx', ['userIdx'])
@Index('idx_create_dt', ['createDt'])
export class TicketUser {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  idx: number;

  @Column({ name: 'ticket_idx', type: 'bigint', default: 0, comment: 'sb_ticket_info.idx' })
  ticketIdx: number;

  @Column({ name: 'user_idx', type: 'bigint', default: 0, comment: 'sb_member.idx' })
  userIdx: number;

  @Column({ name: 'ticket_cnt', type: 'int', default: 0, comment: '티켓수량' })
  ticketCnt: number;

  @Column({ name: 'ticket_total_price', type: 'int', default: 0, comment: '티켓 총 구매 금액' })
  ticketTotalPrice: number;

  @Column({
    name: 'ticket_status',
    type: 'tinyint',
    default: 0,
    comment: '0:대기 / 1:결제완료 / 2:체크완료 / 3:취소',
  })
  ticketStatus: TicketUserStatus;

  @Column({ name: 'ticket_chk_dt', type: 'datetime', nullable: true, comment: '티켓 체크인 시간' })
  ticketChkDt: Date | null;

  @Column({ name: 'ticket_pay_complete_dt', type: 'datetime', nullable: true, comment: '티켓 결제완료 시간' })
  ticketPayCompleteDt: Date | null;

  @Column({ name: 'create_dt', type: 'datetime', nullable: true, default: () => 'CURRENT_TIMESTAMP', comment: 'create date' })
  createDt: Date | null;

  @Column({ name: 'update_dt', type: 'datetime', nullable: true, comment: 'update date' })
  updateDt: Date | null;

  @Column({ name: 'delete_dt', type: 'datetime', nullable: true, comment: 'delete date' })
  deleteDt: Date | null;
}

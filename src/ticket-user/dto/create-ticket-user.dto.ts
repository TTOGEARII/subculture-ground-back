export class CreateTicketUserDto {
  ticketIdx: number;
  userIdx: number;
  ticketCnt?: number;
  ticketTotalPrice?: number;
  ticketStatus?: 0 | 1 | 2 | 3;
}

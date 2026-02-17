export class UpdateTicketUserDto {
  ticketIdx?: number;
  userIdx?: number;
  ticketCnt?: number;
  ticketTotalPrice?: number;
  ticketStatus?: 0 | 1 | 2 | 3;
  ticketChkDt?: Date | null;
  ticketPayCompleteDt?: Date | null;
}

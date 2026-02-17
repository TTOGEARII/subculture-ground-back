export class CreateTicketInfoDto {
  pmIdx: number;
  ticketName?: string | null;
  ticketCount?: number;
  ticketMax?: number;
  ticketMin?: number;
  ticketPrice?: number;
  ticketType?: number;
}

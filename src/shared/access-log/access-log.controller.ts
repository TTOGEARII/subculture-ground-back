import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AccessLogService } from './access-log.service';
import { CreateAccessLogDto } from './dto/create-access-log.dto';

/**
 * 외부 유저 접속 로그 수집 — 인증 없는 공개 엔드포인트.
 * 프론트 비콘이 { url, referrer }를 보내고, IP·UA는 요청에서 읽는다.
 */
@Controller('access-log')
export class AccessLogController {
  constructor(private readonly service: AccessLogService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async record(@Body() dto: CreateAccessLogDto, @Req() req: Request): Promise<void> {
    await this.service.record(dto, extractIp(req), (req.headers['user-agent'] as string) || null);
  }
}

/** 리버스 프록시 뒤라 실제 클라이언트 IP는 X-Forwarded-For의 첫 항목. */
function extractIp(req: Request): string | null {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim();
  if (Array.isArray(xff) && xff.length > 0) return xff[0];
  return req.ip || req.socket?.remoteAddress || null;
}

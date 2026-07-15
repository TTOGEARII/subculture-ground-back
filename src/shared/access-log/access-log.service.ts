import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessLog } from './access-log.entity';
import { CreateAccessLogDto } from './dto/create-access-log.dto';

export type DeviceType = 'mobile' | 'tablet' | 'pc';

/** User-Agent로 기기 타입 판별. Android는 "Mobile" 없으면 태블릿으로 본다. */
export function parseDevice(ua: string): DeviceType {
  const u = ua || '';
  if (
    /iPad/i.test(u) ||
    (/Android/i.test(u) && !/Mobile/i.test(u)) ||
    /Tablet|PlayBook|Silk|Kindle/i.test(u)
  ) {
    return 'tablet';
  }
  if (/Mobi|iPhone|iPod|Android|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(u)) {
    return 'mobile';
  }
  return 'pc';
}

@Injectable()
export class AccessLogService {
  private readonly logger = new Logger(AccessLogService.name);

  constructor(
    @InjectRepository(AccessLog)
    private readonly repo: Repository<AccessLog>,
  ) {}

  async record(
    dto: CreateAccessLogDto,
    ip: string | null,
    userAgent: string | null,
  ): Promise<void> {
    try {
      const log = this.repo.create({
        ip: ip ? ip.slice(0, 45) : null,
        userAgent: userAgent ? userAgent.slice(0, 1000) : null,
        deviceType: parseDevice(userAgent ?? ''),
        referrer: dto.referrer ? dto.referrer.slice(0, 2048) : null,
        landingUrl: dto.url ? dto.url.slice(0, 2048) : null,
      });
      await this.repo.save(log);
    } catch (error) {
      // 로깅 실패가 사용자 경험에 영향을 주면 안 되므로 삼킨다.
      this.logger.warn(
        `접속 로그 저장 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

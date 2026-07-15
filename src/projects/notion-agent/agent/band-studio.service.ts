import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BandStudio } from './band-studio.entity';
import { BAND_STUDIO_SEED } from './band-studio-catalog.seed';
import {
  fetchRooms,
  fetchRoomAvailability,
  parseNaverUrl,
  type RoomAvailability,
} from './naver-booking';

const BAND_ROOM_CATALOG_URL = 'https://api.band-room.com/studio-catalog';

interface CatalogResponse {
  studios: Array<{
    id: string;
    name: string;
    region?: string;
    address?: string;
    priceRange?: string;
    openHours?: string;
    amenities?: string[];
    roomDetails?: Array<{ name: string; price: string }>;
    naverUrl?: string;
  }>;
}

export interface StudioAvailability {
  studio: BandStudio;
  date: string;
  rooms: RoomAvailability[];
  reservationUrl: string | null;
}

/**
 * 합주실 카탈로그 서비스 — sb_band_studio(우리 DB)를 소유·조회한다.
 *
 * 부팅 시 테이블이 비어 있으면 시드 스냅샷을 주입한다. 검색은 DB에서, 실시간 빈 시간은
 * 네이버 예약(naver-booking.ts)에서 직접 얻는다. 조회 경로 어디에도 band-room.com이 없다.
 * refreshFromBandRoom()은 band-room이 살아있을 때만 스냅샷을 갱신하는 선택적 기능이다.
 */
@Injectable()
export class BandStudioService implements OnModuleInit {
  private readonly logger = new Logger(BandStudioService.name);

  constructor(
    @InjectRepository(BandStudio)
    private readonly repo: Repository<BandStudio>,
  ) {}

  async onModuleInit(): Promise<void> {
    if ((await this.repo.count()) > 0) return;
    const rows = BAND_STUDIO_SEED.map((s) =>
      this.repo.create({
        externalId: s.externalId,
        name: s.name,
        region: s.region,
        address: s.address,
        priceRange: s.priceRange,
        openHours: s.openHours,
        amenities: s.amenities,
        rooms: s.rooms,
        naverUrl: s.naverUrl,
        businessId: s.businessId,
        bizItemId: s.bizItemId,
        source: 'band-room-snapshot',
      }),
    );
    await this.repo.save(rows, { chunk: 50 });
    this.logger.log(`합주실 카탈로그 시드 완료: ${rows.length}곳`);
  }

  /** businessId가 있으면 네이버 예약 실시간 조회가 가능한 합주실 */
  static isRealtime(studio: BandStudio): boolean {
    return !!studio.businessId;
  }

  /** 지역/키워드로 검색. 실시간 조회 가능한 곳을 앞에 정렬. */
  async searchStudios(opts: {
    region?: string;
    query?: string;
    naverOnly?: boolean;
  }): Promise<BandStudio[]> {
    const qb = this.repo.createQueryBuilder('s');
    if (opts.naverOnly) qb.andWhere('s.business_id IS NOT NULL');
    if (opts.region?.trim()) {
      qb.andWhere('s.region LIKE :region', { region: `%${opts.region.trim()}%` });
    }
    if (opts.query?.trim()) {
      const q = `%${opts.query.trim()}%`;
      qb.andWhere('(s.name LIKE :q OR s.region LIKE :q OR s.address LIKE :q)', { q });
    }
    const rows = await qb.getMany();
    // 네이버 예약 연동(실시간 가능) 우선, 그다음 이름순
    rows.sort(
      (a, b) =>
        Number(!a.businessId) - Number(!b.businessId) || a.name.localeCompare(b.name, 'ko'),
    );
    return rows;
  }

  /** 이름(부분 일치) 또는 businessId로 1곳 찾기 */
  async findStudio(nameOrBusinessId: string): Promise<BandStudio | null> {
    const key = nameOrBusinessId.trim();
    return (
      (await this.repo.findOne({ where: { businessId: key } })) ??
      (await this.repo.findOne({ where: { name: key } })) ??
      (await this.repo
        .createQueryBuilder('s')
        .where('s.name LIKE :k', { k: `%${key}%` })
        .getOne())
    );
  }

  /** 합주실 1곳의 특정 날짜 빈 시간을 룸별로 조회 (네이버 직접). */
  async getStudioAvailability(
    nameOrBusinessId: string,
    date: string,
  ): Promise<StudioAvailability> {
    const studio = await this.findStudio(nameOrBusinessId);
    if (!studio) throw new Error(`합주실을 찾을 수 없습니다: ${nameOrBusinessId}`);
    if (!studio.businessId) {
      throw new Error(`${studio.name}은(는) 네이버 예약 연동이 없어 실시간 조회가 불가합니다.`);
    }
    const businessId = studio.businessId;
    const rooms = await fetchRooms(businessId);
    const availability = await Promise.all(
      rooms.map((r) => fetchRoomAvailability(businessId, r.id, date, r.name)),
    );
    return { studio, date, rooms: availability, reservationUrl: studio.naverUrl };
  }

  /**
   * band-room.com 카탈로그로 스냅샷 갱신(upsert). band-room이 살아있을 때만 동작하며,
   * 실패해도 기존 DB 데이터로 계속 서비스한다. (조회 경로에서는 호출하지 않는다.)
   */
  async refreshFromBandRoom(): Promise<{ updated: number; source: string }> {
    const res = await fetch(BAND_ROOM_CATALOG_URL, {
      headers: { Accept: 'application/json', Origin: 'https://www.band-room.com' },
    });
    if (!res.ok) throw new Error(`band-room 카탈로그 조회 실패: HTTP ${res.status}`);
    const json = (await res.json()) as CatalogResponse;
    const rows = json.studios.map((s) => {
      const nv = parseNaverUrl(s.naverUrl);
      return {
        externalId: s.id,
        name: s.name,
        region: s.region ?? '',
        address: s.address ?? '',
        priceRange: s.priceRange ?? '',
        openHours: s.openHours ?? '',
        amenities: s.amenities ?? [],
        rooms: (s.roomDetails ?? []).map((r) => ({ name: r.name, price: r.price })),
        naverUrl: s.naverUrl ?? null,
        businessId: nv?.businessId ?? null,
        bizItemId: nv?.bizItemId ?? null,
        source: 'band-room-refresh',
      };
    });
    await this.repo.upsert(rows, ['externalId']);
    this.logger.log(`합주실 카탈로그 갱신 완료: ${rows.length}곳`);
    return { updated: rows.length, source: 'band-room-refresh' };
  }
}

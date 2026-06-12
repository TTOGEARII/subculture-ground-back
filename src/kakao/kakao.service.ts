import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialAccount } from '../social-account/social-account.entity';
import { KakaoMessageLog } from './kakao-message-log.entity';

export interface BookingNotification {
  eventName: string;
  ticketName: string;
  count: number;
  totalPrice: number;
  linkUrl: string;
  refType?: string; // 연관 엔티티 종류 (예: 'ticket_user')
  refIdx?: number; // 연관 엔티티 idx
}

/**
 * 카카오톡 메시지("나에게 보내기") 발송 + 액세스 토큰 갱신.
 * talk_message 동의를 받은 카카오 회원에게만 동작한다.
 */
@Injectable()
export class KakaoService {
  private readonly logger = new Logger(KakaoService.name);

  constructor(
    @InjectRepository(SocialAccount)
    private socialRepo: Repository<SocialAccount>,
    @InjectRepository(KakaoMessageLog)
    private logRepo: Repository<KakaoMessageLog>,
  ) {}

  /** 발송 로그 1행 기록 (성공/실패/스킵). 로그 실패가 본 흐름을 막지 않도록 try/catch. */
  private async writeLog(entry: {
    userIdx: number;
    messageType: string;
    content: string | null;
    status: 'success' | 'fail' | 'skipped';
    error: string | null;
    refType?: string | null;
    refIdx?: number | null;
  }): Promise<void> {
    try {
      await this.logRepo.save(
        this.logRepo.create({
          userIdx: entry.userIdx,
          messageType: entry.messageType,
          content: entry.content,
          status: entry.status,
          error: entry.error,
          refType: entry.refType ?? null,
          refIdx: entry.refIdx ?? null,
        }),
      );
    } catch (e) {
      this.logger.warn(`카카오 알림 로그 기록 실패: ${e}`);
    }
  }

  /** 만료 임박 시 refresh_token으로 액세스 토큰을 갱신해 유효한 토큰을 반환한다. */
  private async getValidAccessToken(
    social: SocialAccount,
  ): Promise<string | null> {
    if (!social.accessToken) return null;

    const exp = social.tokenExpiresAt
      ? new Date(social.tokenExpiresAt).getTime()
      : 0;
    // 1분 이상 여유가 있으면 그대로 사용
    if (exp - Date.now() > 60_000) return social.accessToken;
    if (!social.refreshToken) return social.accessToken;

    const restKey = process.env.KAKAO_REST_API_KEY;
    if (!restKey) return social.accessToken;

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: restKey,
      refresh_token: social.refreshToken,
    });
    const secret = process.env.KAKAO_CLIENT_SECRET;
    if (secret) body.set('client_secret', secret);

    const res = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      this.logger.warn(`카카오 토큰 갱신 실패: ${await res.text()}`);
      return social.accessToken;
    }
    const json: any = await res.json();
    social.accessToken = json.access_token;
    if (json.refresh_token) social.refreshToken = json.refresh_token;
    social.tokenExpiresAt = json.expires_in
      ? new Date(Date.now() + Number(json.expires_in) * 1000)
      : null;
    await this.socialRepo.save(social);
    return social.accessToken;
  }

  /**
   * 예매 완료 알림을 카카오톡으로 보낸다. (best-effort)
   * 카카오 회원이 아니거나 토큰/동의가 없으면 조용히 넘어간다.
   */
  async sendBookingNotification(
    userIdx: number,
    info: BookingNotification,
  ): Promise<void> {
    const messageType = 'booking_confirm';

    const social = await this.socialRepo.findOne({
      where: { userIdx, provider: 'kakao' },
    });
    if (!social || !social.accessToken) {
      await this.writeLog({
        userIdx,
        messageType,
        content: null,
        status: 'skipped',
        error: '카카오 토큰이 없는 사용자 (카카오 회원 아님/미동의)',
        refType: info.refType,
        refIdx: info.refIdx,
      });
      return;
    }

    const token = await this.getValidAccessToken(social);

    const priceText =
      info.totalPrice === 0
        ? '무료'
        : `${info.totalPrice.toLocaleString('ko-KR')}원`;
    const content =
      `🎫 [Subculture Ground] 예매가 접수되었습니다!\n\n` +
      `공연: ${info.eventName}\n` +
      `티켓: ${info.ticketName} ${info.count}매\n` +
      `금액: ${priceText}\n\n` +
      `입금 확인 후 예매가 승인됩니다.`;

    if (!token) {
      await this.writeLog({
        userIdx,
        messageType,
        content,
        status: 'skipped',
        error: '유효한 액세스 토큰을 확보하지 못함',
        refType: info.refType,
        refIdx: info.refIdx,
      });
      return;
    }

    const template = {
      object_type: 'text',
      text: content,
      link: { web_url: info.linkUrl, mobile_web_url: info.linkUrl },
    };

    const res = await fetch(
      'https://kapi.kakao.com/v2/api/talk/memo/default/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ template_object: JSON.stringify(template) }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      this.logger.warn(`카카오 알림 발송 실패 (userIdx=${userIdx}): ${body}`);
      await this.writeLog({
        userIdx,
        messageType,
        content,
        status: 'fail',
        error: body,
        refType: info.refType,
        refIdx: info.refIdx,
      });
      return;
    }

    this.logger.log(`카카오 예매 알림 발송 완료 (userIdx=${userIdx})`);
    await this.writeLog({
      userIdx,
      messageType,
      content,
      status: 'success',
      error: null,
      refType: info.refType,
      refIdx: info.refIdx,
    });
  }
}

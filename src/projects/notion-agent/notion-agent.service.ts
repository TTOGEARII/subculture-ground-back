import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotionCredential } from './notion-credential.entity';
import { encrypt, decrypt } from '../../common/utils/crypto.util';

export interface CredentialStatus {
  hasNotionToken: boolean;
  hasAnthropicKey: boolean;
  notionWorkspace: string | null;
}

/**
 * 회원별 노션 토큰 / Anthropic API 키 저장·조회.
 * 토큰은 ENCRYPTION_KEY 로 암호화해 저장한다.
 * (토이 프로젝트 수준의 at-rest 암호화 — 프로덕션이라면 KMS 급이 필요)
 */
@Injectable()
export class NotionAgentService {
  private readonly logger = new Logger(NotionAgentService.name);

  constructor(
    @InjectRepository(NotionCredential)
    private credentialRepository: Repository<NotionCredential>,
  ) {}

  async saveCredentials(
    userIdx: number,
    dto: { notionToken?: string; anthropicKey?: string },
  ): Promise<void> {
    let cred = await this.credentialRepository.findOne({ where: { userIdx } });
    if (!cred) {
      cred = this.credentialRepository.create({ userIdx });
    }
    if (dto.notionToken !== undefined) {
      cred.notionToken = dto.notionToken ? encrypt(dto.notionToken) : null;
    }
    if (dto.anthropicKey !== undefined) {
      cred.anthropicApiKey = dto.anthropicKey ? encrypt(dto.anthropicKey) : null;
    }
    await this.credentialRepository.save(cred);
    this.logger.log(`자격증명 저장 (userIdx: ${userIdx})`);
  }

  /** 복호화된 토큰 반환. 없으면 null. */
  async getDecryptedCredentials(
    userIdx: number,
  ): Promise<{ notionToken: string | null; anthropicKey: string | null }> {
    const cred = await this.credentialRepository.findOne({ where: { userIdx } });
    return {
      notionToken: cred?.notionToken ? decrypt(cred.notionToken) : null,
      anthropicKey: cred?.anthropicApiKey ? decrypt(cred.anthropicApiKey) : null,
    };
  }

  /** 설정 여부 + 노션 토큰 유효성(워크스페이스명) 확인 */
  async getStatus(userIdx: number): Promise<CredentialStatus> {
    const { notionToken, anthropicKey } = await this.getDecryptedCredentials(userIdx);
    let notionWorkspace: string | null = null;

    if (notionToken) {
      try {
        const res = await fetch('https://api.notion.com/v1/users/me', {
          headers: {
            Authorization: `Bearer ${notionToken}`,
            'Notion-Version': '2022-06-28',
          },
        });
        if (res.ok) {
          const me = (await res.json()) as {
            name?: string;
            bot?: { workspace_name?: string };
          };
          notionWorkspace = me.bot?.workspace_name ?? me.name ?? '(연결됨)';
        }
      } catch {
        // 네트워크 오류 등 — 상태 조회 실패는 워크스페이스명만 비운다
      }
    }

    return {
      hasNotionToken: !!notionToken,
      hasAnthropicKey: !!anthropicKey,
      notionWorkspace,
    };
  }

  async deleteCredentials(userIdx: number): Promise<void> {
    await this.credentialRepository.delete({ userIdx });
    this.logger.log(`자격증명 삭제 (userIdx: ${userIdx})`);
  }
}

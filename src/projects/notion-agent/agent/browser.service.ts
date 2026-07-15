import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { chromium, type Browser, type Page } from 'playwright-core';

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Playwright(chromium) 라이프사이클 관리.
 *
 * 봇 차단(Cloudflare 등)을 실제 브라우저로 통과해야 하는 소스(ultimate-guitar)를 위해 존재한다.
 * 브라우저는 한 번 띄워 재사용하고, 요청마다 새 context/page만 열고 닫는다.
 * chromium 실행 파일은 `PLAYWRIGHT_CHROMIUM_PATH`(prod: apk chromium 경로)로 지정한다.
 * chromium이 없으면 launch가 실패하며, 호출 측(sheet-music)이 이를 잡아 링크아웃으로 폴백한다.
 */
@Injectable()
export class BrowserService implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserService.name);
  private browser: Browser | null = null;
  private launching: Promise<Browser> | null = null;

  private async getBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) return this.browser;
    if (!this.launching) {
      this.launching = this.launch().finally(() => {
        this.launching = null;
      });
    }
    this.browser = await this.launching;
    return this.browser;
  }

  private async launch(): Promise<Browser> {
    const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
    this.logger.log(`chromium 실행 (executablePath: ${executablePath ?? '(default)'})`);
    return chromium.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }

  /** 새 context/page를 열어 작업하고, 끝나면 context를 정리한다(브라우저는 유지). */
  async withPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
    const browser = await this.getBrowser();
    const context = await browser.newContext({
      userAgent: BROWSER_UA,
      locale: 'ko-KR',
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    try {
      return await fn(page);
    } finally {
      await context.close().catch(() => undefined);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.browser?.close().catch(() => undefined);
  }
}

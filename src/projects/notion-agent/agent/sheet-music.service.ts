import { Injectable, Logger } from '@nestjs/common';
import { BrowserService } from './browser.service';
import type { AgentTool } from './agent-tool';

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface SheetLink {
  title: string;
  url: string;
  meta?: string; // 악기/타입 등 부가정보
}
interface SheetSource {
  results: SheetLink[];
  searchUrl: string;
  note?: string;
}

/**
 * 악보 검색 도구 — 저작권 콘텐츠(악보 자체)는 절대 가져오지 않고 "링크만" 반환한다.
 *
 * - songsterr: 준공개 JSON API (구조화, 악기별 트랙) — fetch
 * - mymusic5:  검색결과 HTML에서 악보 상세 링크 추출 — fetch
 * - ultimate-guitar: Cloudflare 챌린지라 실제 브라우저(Playwright)로 통과 후 탭 링크 추출.
 *   브라우저를 못 띄우면(로컬/chromium 부재) 검색 URL 링크아웃으로 폴백한다.
 */
@Injectable()
export class SheetMusicService {
  private readonly logger = new Logger(SheetMusicService.name);

  constructor(private readonly browser: BrowserService) {}

  private readonly toolDefs: AgentTool[] = [
    {
      name: 'search_sheet_music',
      description:
        '악보/타브를 songsterr·ultimate-guitar·mymusic5에서 검색해 **링크**를 반환한다(악보 원본은 저작권상 제공 안 함, 링크만). ' +
        'song은 곡 제목/아티스트, instrument는 특정 악기(예: 기타, 드럼, 베이스, 피아노). ' +
        '사용자가 "~악보 찾아줘", "~기타 타브 어디서 봐" 등을 물으면 호출하고, 결과 링크를 안내한다.',
      inputSchema: {
        type: 'object',
        properties: {
          song: { type: 'string', description: '곡 제목/아티스트' },
          instrument: {
            type: 'string',
            description: '특정 악기 (기타/드럼/베이스/피아노 등). 생략 가능',
          },
        },
        required: ['song'],
      },
    },
  ];

  getToolDefinitions(): AgentTool[] {
    return this.toolDefs;
  }
  canHandle(toolName: string): boolean {
    return this.toolDefs.some((t) => t.name === toolName);
  }

  async execute(toolName: string, input: Record<string, unknown>): Promise<string> {
    if (toolName !== 'search_sheet_music') throw new Error(`알 수 없는 악보 도구: ${toolName}`);
    const song = String(input.song ?? '').trim();
    if (!song) throw new Error('곡명(song)이 필요합니다.');
    const instrument = input.instrument ? String(input.instrument).trim() : '';

    const [songsterr, ultimateGuitar, mymusic5] = await Promise.all([
      this.searchSongsterr(song, instrument).catch((e) => this.failSource(e, this.songsterrUrl(song))),
      this.searchUltimateGuitar(song).catch((e) => this.failSource(e, this.ugUrl(song))),
      this.searchMymusic5(song, instrument).catch((e) => this.failSource(e, this.mymusic5Url(song, instrument))),
    ]);

    return JSON.stringify({
      song,
      instrument: instrument || null,
      note: '악보 원본은 저작권상 제공하지 않으며, 아래는 각 사이트의 링크입니다.',
      sources: { songsterr, ultimate_guitar: ultimateGuitar, mymusic5 },
    });
  }

  private failSource(err: unknown, searchUrl: string): SheetSource {
    return {
      results: [],
      searchUrl,
      note: `자동 조회 실패, 검색 링크로 확인: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // ── songsterr (JSON API) ──────────────────────────────
  private songsterrUrl(song: string): string {
    return `https://www.songsterr.com/?pattern=${encodeURIComponent(song)}`;
  }
  private async searchSongsterr(song: string, instrument: string): Promise<SheetSource> {
    const api = `https://www.songsterr.com/api/songs?pattern=${encodeURIComponent(song)}&size=8`;
    const res = await fetch(api, { headers: { 'User-Agent': BROWSER_UA, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = (await res.json()) as Array<{
      songId: number;
      artist: string;
      title: string;
      tracks?: Array<{ instrument: string }>;
    }>;
    const results: SheetLink[] = rows.slice(0, 8).map((s) => {
      const instruments = [...new Set((s.tracks ?? []).map((t) => t.instrument))];
      return {
        title: `${s.artist} - ${s.title}`,
        url: `https://www.songsterr.com/a/wa/song?id=${s.songId}`,
        meta: instruments.slice(0, 6).join(', '),
      };
    });
    // 악기 지정 시 해당 악기 트랙이 있는 곡을 앞으로
    if (instrument) {
      const key = instrument.toLowerCase();
      results.sort(
        (a, b) => Number((b.meta ?? '').toLowerCase().includes(key)) - Number((a.meta ?? '').toLowerCase().includes(key)),
      );
    }
    return { results, searchUrl: this.songsterrUrl(song) };
  }

  // ── ultimate-guitar (Playwright, Cloudflare 통과) ──────
  private ugUrl(song: string): string {
    return `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(song)}`;
  }
  private async searchUltimateGuitar(song: string): Promise<SheetSource> {
    const searchUrl = this.ugUrl(song);
    const results = await this.browser.withPage(async (page) => {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
      // Cloudflare 수동 챌린지 통과 + 결과 렌더 대기
      await page
        .waitForSelector('a[href*="tabs.ultimate-guitar.com/tab/"]', { timeout: 15000 })
        .catch(() => undefined);
      return page.evaluate(() => {
        const seen = new Set<string>();
        const out: Array<{ title: string; url: string; meta?: string }> = [];
        document.querySelectorAll<HTMLAnchorElement>('a[href*="tabs.ultimate-guitar.com/tab/"]').forEach((a) => {
          const url = a.href;
          if (seen.has(url)) return;
          seen.add(url);
          const slug = url.split('/').pop() ?? '';
          const type = /-(chords|tabs|bass|drums|ukulele|power|guitar-pro|official)-/.exec(slug)?.[1] ?? '';
          const title = (a.textContent || '').trim() || slug.replace(/-\d+$/, '').replace(/-/g, ' ');
          out.push({ title, url, meta: type });
        });
        return out.slice(0, 8);
      });
    });
    return { results, searchUrl };
  }

  // ── mymusic5 (검색결과 HTML 링크 추출) ────────────────
  private mymusic5Url(song: string, instrument: string): string {
    const base = `https://www.mymusic5.com/ko/search?keyword=${encodeURIComponent(song)}&type=sheet`;
    return instrument ? `${base}&i=${encodeURIComponent(instrument)}` : base;
  }
  private async searchMymusic5(song: string, instrument: string): Promise<SheetSource> {
    const searchUrl = this.mymusic5Url(song, instrument);
    const res = await fetch(
      `https://www.mymusic5.com/ko/search?keyword=${encodeURIComponent(song)}&type=sheet`,
      { headers: { 'User-Agent': BROWSER_UA } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    // 악보 상세 링크: <a href="/ko/{판매자}/{숫자id}">...<img alt="{제목}">
    const seen = new Set<string>();
    const results: SheetLink[] = [];
    const re = /href="(\/ko\/[A-Za-z0-9_-]+\/\d+)"[\s\S]{0,300}?alt="([^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) && results.length < 8) {
      const path = m[1];
      if (seen.has(path)) continue;
      seen.add(path);
      const title = m[2].replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
      results.push({ title: title || path.split('/').pop()!, url: `https://www.mymusic5.com${path}` });
    }
    return { results, searchUrl };
  }
}

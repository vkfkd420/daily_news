import fs from 'node:fs';
import path from 'node:path';
import { getBriefingByDate } from '../briefingStore';
import type { DailyBriefing } from '../../src/types/briefing';
import { getKoreaDateString } from './getKoreaDate';
import { syncFromInbox } from './sources/inboxSource';
import { syncFromOpenAI } from './sources/openaiSource';
import { syncFromUrl } from './sources/urlSource';

export type SyncEnv = {
  BRIEFING_SYNC_URL?: string;
  BRIEFING_SYNC_MODE?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  BRIEFING_AUTO_SYNC?: string;
  BRIEFING_SYNC_HOUR?: string;
  BRIEFING_SYNC_MINUTE?: string;
  BRIEFING_SYNC_FORCE_AT_SCHEDULE?: string;
};

export type SyncResult = {
  briefing: DailyBriefing;
  source: 'url' | 'inbox' | 'openai' | 'skip';
  message: string;
};

export function getTodayBriefingPath(date?: string) {
  const d = date ?? getKoreaDateString();
  return path.resolve(process.cwd(), `data/briefings/${d}.json`);
}

export function todayBriefingExists(date?: string) {
  return fs.existsSync(getTodayBriefingPath(date));
}

export async function syncBriefing(env: SyncEnv, options?: { force?: boolean; date?: string }): Promise<SyncResult> {
  const force = options?.force ?? false;
  const date = options?.date ?? getKoreaDateString();

  if (!force && todayBriefingExists(date)) {
    const existing = getBriefingByDate(date);
    if (existing) {
      return { briefing: existing, source: 'skip', message: `${date} 브리핑이 이미 있습니다.` };
    }
  }

  const mode = (env.BRIEFING_SYNC_MODE ?? 'auto').toLowerCase();

  if (mode === 'none' || mode === 'off' || mode === 'manual') {
    throw new Error(
      'ChatGPT Plus 모드입니다. chatgpt.com 프로젝트-뉴스에서 JSON을 만든 뒤 앱 「ChatGPT에서 붙여넣기」를 사용하세요. (docs/CHATGPT_PLUS.md)',
    );
  }

  if (mode === 'url' || (mode === 'auto' && env.BRIEFING_SYNC_URL)) {
    if (!env.BRIEFING_SYNC_URL) {
      throw new Error('BRIEFING_SYNC_URL이 설정되지 않았습니다.');
    }
    const briefing = await syncFromUrl(env.BRIEFING_SYNC_URL, force);
    return { briefing, source: 'url', message: 'URL에서 가져왔습니다.' };
  }

  if (mode === 'inbox' || (mode === 'auto' && fs.existsSync(path.resolve(process.cwd(), 'data/inbox/briefing.json')))) {
    const briefing = syncFromInbox(force);
    return { briefing, source: 'inbox', message: 'inbox 파일에서 가져왔습니다.' };
  }

  if (mode === 'openai' || (mode === 'auto' && env.OPENAI_API_KEY)) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
    }
    const briefing = await syncFromOpenAI(
      env.OPENAI_API_KEY,
      env.OPENAI_MODEL ?? 'gpt-4o',
      force,
      date,
    );
    return { briefing, source: 'openai', message: 'OpenAI로 생성했습니다.' };
  }

  throw new Error(
    '자동 동기화 설정이 없습니다. .env에 BRIEFING_SYNC_URL 또는 OPENAI_API_KEY를 설정하세요. (docs/AUTO_SYNC.md 참고)',
  );
}

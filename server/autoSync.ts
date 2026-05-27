import fs from 'node:fs';
import path from 'node:path';
import { syncFromInbox, hasInboxFile } from './sync/sources/inboxSource';
import { syncBriefing, type SyncEnv } from './sync/syncBriefing';
import { getKoreaDateString } from './sync/getKoreaDate';
import { todayBriefingExists } from './sync/syncBriefing';

const INBOX_PATH = path.resolve(process.cwd(), 'data/inbox/briefing.json');
const LOG_DIR = path.resolve(process.cwd(), 'logs');

let lastScheduledDate = '';
let inboxWatcher: fs.FSWatcher | null = null;

function log(message: string) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(`[daily-news] ${message}`);
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  const file = path.join(LOG_DIR, `auto-sync-${getKoreaDateString()}.log`);
  fs.appendFileSync(file, line + '\n', 'utf-8');
}

async function runSync(env: SyncEnv, force = false) {
  try {
    const result = await syncBriefing(env, { force });
    if (result.source !== 'skip') {
      log(`동기화 완료 (${result.source}): ${result.briefing.date}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`동기화 실패: ${msg}`);
  }
}

function tryInboxImport(force = false) {
  if (!hasInboxFile()) return;
  try {
    const briefing = syncFromInbox(force);
    log(`inbox 파일 자동 반영: ${briefing.date}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`inbox 반영 실패: ${msg}`);
  }
}

function watchInbox() {
  const dir = path.dirname(INBOX_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  tryInboxImport();

  if (inboxWatcher) return;

  inboxWatcher = fs.watch(dir, (_, filename) => {
    if (filename !== 'briefing.json') return;
    setTimeout(() => tryInboxImport(true), 300);
  });

  log('inbox 폴더 감시 중 (data/inbox/briefing.json)');
}

function scheduleDailySync(env: SyncEnv) {
  const hour = Number(env.BRIEFING_SYNC_HOUR ?? '9');
  const minute = Number(env.BRIEFING_SYNC_MINUTE ?? '0');

  setInterval(() => {
    const now = new Date();
    const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const today = getKoreaDateString(kst);

    if (kst.getHours() !== hour || kst.getMinutes() !== minute) return;
    if (lastScheduledDate === today) return;
    lastScheduledDate = today;

    if (todayBriefingExists(today) && env.BRIEFING_SYNC_FORCE_AT_SCHEDULE !== 'true') {
      log(`${today} 브리핑 이미 있음 — 스케줄 스킵`);
      return;
    }

    log(`예약 동기화 실행 (${hour}:${String(minute).padStart(2, '0')} KST)`);
    void runSync(env, env.BRIEFING_SYNC_FORCE_AT_SCHEDULE === 'true');
  }, 30_000);

  log(`매일 ${hour}:${String(minute).padStart(2, '0')} (KST) 자동 동기화 대기`);
}

export function startAutoSync(env: SyncEnv) {
  const enabled = env.BRIEFING_AUTO_SYNC !== 'false';
  if (!enabled) return;

  watchInbox();

  const hasOpenAI = Boolean(env.OPENAI_API_KEY);
  const hasUrl = Boolean(env.BRIEFING_SYNC_URL);
  if (hasOpenAI || hasUrl) {
    scheduleDailySync(env);
    if (!todayBriefingExists()) {
      log('오늘 브리핑 없음 — 시작 시 1회 동기화 시도');
      void runSync(env);
    }
  } else {
    log('자동 동기화: OPENAI_API_KEY 또는 BRIEFING_SYNC_URL 을 .env 에 설정하세요');
  }
}

export function stopAutoSync() {
  inboxWatcher?.close();
  inboxWatcher = null;
}

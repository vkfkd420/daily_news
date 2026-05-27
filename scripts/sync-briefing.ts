import 'dotenv/config';
import { syncBriefing } from '../server/sync/syncBriefing';

const force = process.argv.includes('--force');
const dateIdx = process.argv.indexOf('--date');
const date = dateIdx >= 0 ? process.argv[dateIdx + 1] : undefined;

async function main() {
  console.log(`[sync] 브리핑 자동 동기화 시작...${date ? ` (${date})` : ''}`);
  const result = await syncBriefing(process.env as Record<string, string>, { force, date });
  console.log(`[sync] ${result.message} (${result.source})`);
  console.log(`[sync] ${result.briefing.date} · 한국 ${result.briefing.news.korea.length}건 · 미국 ${result.briefing.news.usa.length}건`);
}

main().catch((err: Error) => {
  console.error('[sync] 실패:', err.message);
  process.exit(1);
});

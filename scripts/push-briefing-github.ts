import 'dotenv/config';
import { getBriefingByDate, getLatestBriefing } from '../server/briefingStore';
import { readPackageName, resolveGithubEnv } from '../server/github/resolveGithubEnv';
import { githubRawJsonUrl, pushBriefingToGithub } from '../server/github/pushToGithub';

async function main() {
  const dateIdx = process.argv.indexOf('--date');
  const date = dateIdx >= 0 ? process.argv[dateIdx + 1] : undefined;

  const briefing = date ? getBriefingByDate(date) : getLatestBriefing();
  if (!briefing) {
    throw new Error(
      date
        ? `${date} 브리핑이 없습니다. 먼저 ChatGPT에서 붙여넣기 하세요.`
        : '저장된 브리핑이 없습니다. 앱에서 ChatGPT JSON을 import 하세요.',
    );
  }

  const gh = resolveGithubEnv(process.env as Record<string, string>);
  const result = await pushBriefingToGithub(briefing, gh, { prefix: gh.briefingsPrefix });

  const rawUrl = githubRawJsonUrl(gh, result.latestPath);
  const sameRepo = gh.GITHUB_REPO === readPackageName();

  console.log('[github] push 완료 →', result.repo);
  console.log(`  - ${result.datePath}`);
  console.log(`  - ${result.latestPath}`);
  console.log('');
  if (sameRepo) {
    console.log('이 프로젝트(daily_news) repo와 동일 경로입니다.');
  }
  console.log('앱 .env:');
  console.log(`BRIEFING_SYNC_URL=${rawUrl}`);
  console.log('BRIEFING_SYNC_MODE=url');
  console.log('VITE_AUTO_SYNC_ON_LOAD=true');
}

main().catch((err: Error) => {
  console.error('[github]', err.message);
  process.exit(1);
});

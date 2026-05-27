import type { DailyBriefing } from '../../src/types/briefing';
import { briefingGithubPaths } from './briefingPaths';

export type GithubEnv = {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH?: string;
};

function requireEnv(env: GithubEnv) {
  if (!env.GITHUB_TOKEN?.trim()) throw new Error('GITHUB_TOKEN이 필요합니다.');
  if (!env.GITHUB_OWNER?.trim()) throw new Error('GITHUB_OWNER가 필요합니다.');
  if (!env.GITHUB_REPO?.trim()) throw new Error('GITHUB_REPO가 필요합니다.');
}

export async function upsertGithubJsonFile(
  env: GithubEnv,
  filePath: string,
  data: unknown,
): Promise<void> {
  requireEnv(env);

  const owner = env.GITHUB_OWNER.trim();
  const repo = env.GITHUB_REPO.trim();
  const branch = env.GITHUB_BRANCH?.trim() || 'main';
  const token = env.GITHUB_TOKEN.trim();

  const content = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');
  const apiPath = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  let sha: string | undefined;

  const getRes = await fetch(`${apiPath}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (getRes.ok) {
    const file = (await getRes.json()) as { sha?: string };
    sha = file.sha;
  } else if (getRes.status !== 404) {
    const body = await getRes.text();
    throw new Error(`GitHub 조회 실패 (${getRes.status}): ${body}`);
  }

  const putRes = await fetch(apiPath, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      message: `briefing: update ${filePath}`,
      content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const body = await putRes.text();
    throw new Error(`GitHub 저장 실패 (${putRes.status}): ${body}`);
  }
}

export async function pushBriefingToGithub(
  briefing: DailyBriefing,
  env: GithubEnv,
  options?: { prefix?: string },
): Promise<{ latestPath: string; datePath: string; repo: string }> {
  const { latestPath, datePath } = briefingGithubPaths(briefing.date, options?.prefix);

  await upsertGithubJsonFile(env, datePath, briefing);
  await upsertGithubJsonFile(env, latestPath, briefing);

  return {
    latestPath,
    datePath,
    repo: `${env.GITHUB_OWNER}/${env.GITHUB_REPO}`,
  };
}

export function githubRawJsonUrl(env: GithubEnv, filePath: string): string {
  const owner = env.GITHUB_OWNER.trim();
  const repo = env.GITHUB_REPO.trim();
  const branch = env.GITHUB_BRANCH?.trim() || 'main';
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { GithubEnv } from './pushToGithub';
import { DEFAULT_BRIEFINGS_PREFIX, briefingGithubPaths } from './briefingPaths';
import { githubRawJsonUrl } from './pushToGithub';

function parseGithubRemote(url: string): { owner: string; repo: string } | null {
  const trimmed = url.trim();
  const ssh = trimmed.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
  if (ssh) return { owner: ssh[1], repo: ssh[2] };

  const https = trimmed.match(/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
  if (https) return { owner: https[1], repo: https[2].replace(/\.git$/, '') };

  return null;
}

export function readGitRemote(): { owner: string; repo: string } | null {
  try {
    const url = execSync('git remote get-url origin', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return parseGithubRemote(url);
  } catch {
    return null;
  }
}

export function readPackageName(): string {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'),
    ) as { name?: string };
    return pkg.name ?? 'daily_news';
  } catch {
    return 'daily_news';
  }
}

export function resolveGithubEnv(
  processEnv: NodeJS.ProcessEnv = process.env,
): GithubEnv & {
  briefingsPrefix: string;
} {
  const remote = readGitRemote();
  const defaultRepo = remote?.repo ?? readPackageName();
  const defaultOwner = remote?.owner ?? '';

  return {
    GITHUB_TOKEN: processEnv.GITHUB_TOKEN ?? '',
    GITHUB_OWNER: processEnv.GITHUB_OWNER?.trim() || defaultOwner,
    GITHUB_REPO: processEnv.GITHUB_REPO?.trim() || defaultRepo,
    GITHUB_BRANCH: processEnv.GITHUB_BRANCH?.trim() || 'main',
    briefingsPrefix: processEnv.GITHUB_BRIEFINGS_PREFIX?.trim() || DEFAULT_BRIEFINGS_PREFIX,
  };
}

export function defaultSyncUrl(env: GithubEnv, prefix = DEFAULT_BRIEFINGS_PREFIX): string | null {
  if (!env.GITHUB_OWNER || !env.GITHUB_REPO) return null;
  const { latestPath } = briefingGithubPaths('0000-00-00', prefix);
  return githubRawJsonUrl(env, latestPath);
}

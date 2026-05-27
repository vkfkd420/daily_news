/** 이 프로젝트와 동일한 경로 (로컬 data/briefings ↔ GitHub) */
export const DEFAULT_BRIEFINGS_PREFIX = 'data/briefings';

export function briefingGithubPaths(date: string, prefix = DEFAULT_BRIEFINGS_PREFIX) {
  const base = prefix.replace(/\/+$/, '');
  return {
    latestPath: `${base}/latest.json`,
    datePath: `${base}/${date}.json`,
  };
}

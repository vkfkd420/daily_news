import type { BriefingListItem, DailyBriefing } from '../types/briefing';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `API 오류 (${response.status})`);
  }
  return (await response.json()) as T;
}

export async function fetchBriefingList(): Promise<BriefingListItem[]> {
  const response = await fetch('/api/briefings');
  return parseJson(response);
}

export async function fetchLatestBriefing(): Promise<DailyBriefing> {
  const response = await fetch('/api/briefings/latest');
  return parseJson(response);
}

export async function fetchBriefingByDate(date: string): Promise<DailyBriefing> {
  const response = await fetch(`/api/briefings/${date}`);
  return parseJson(response);
}

/** 설정된 소스(URL / inbox / OpenAI)에서 자동 가져오기 */
export async function syncBriefing(options?: { force?: boolean }) {
  const response = await fetch('/api/briefings/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options ?? {}),
  });
  return parseJson<{
    ok: boolean;
    briefing: DailyBriefing;
    source: string;
    message: string;
  }>(response);
}

/** ChatGPT JSON 수동 붙여넣기 (백업용) */
export async function importBriefing(raw: string, force = false) {
  const response = await fetch('/api/briefings/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw, force }),
  });
  return parseJson<{ ok: boolean; briefing: DailyBriefing }>(response);
}

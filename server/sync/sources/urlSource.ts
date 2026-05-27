import { saveBriefingFromText } from '../../saveBriefing';
import type { DailyBriefing } from '../../../src/types/briefing';

export async function syncFromUrl(url: string, force: boolean): Promise<DailyBriefing> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`URL 동기화 실패 (${response.status}): ${url}`);
  }

  const text = await response.text();
  return saveBriefingFromText(text, force);
}

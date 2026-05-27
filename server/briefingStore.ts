import fs from 'node:fs';
import path from 'node:path';
import { countBriefingItems, type BriefingListItem, type DailyBriefing } from '../src/types/briefing';

const BRIEFINGS_DIR = path.resolve(process.cwd(), 'data/briefings');

function isBriefingFile(name: string) {
  return /^\d{4}-\d{2}-\d{2}\.json$/.test(name);
}

function readBriefingFile(filePath: string): DailyBriefing | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as DailyBriefing;
  } catch {
    return null;
  }
}

export function listBriefingDates(): string[] {
  if (!fs.existsSync(BRIEFINGS_DIR)) return [];

  return fs
    .readdirSync(BRIEFINGS_DIR)
    .filter(isBriefingFile)
    .map((file) => file.replace('.json', ''))
    .sort((a, b) => b.localeCompare(a));
}

export function listBriefings(): BriefingListItem[] {
  return listBriefingDates()
    .map((date) => getBriefingByDate(date))
    .filter((briefing): briefing is DailyBriefing => briefing !== null)
    .map((briefing) => ({
      date: briefing.date,
      title: briefing.title,
      itemCount: countBriefingItems(briefing),
      generatedAt: briefing.generatedAt,
    }));
}

export function getBriefingByDate(date: string): DailyBriefing | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const filePath = path.join(BRIEFINGS_DIR, `${date}.json`);
  if (!fs.existsSync(filePath)) return null;

  return readBriefingFile(filePath);
}

export function getLatestBriefing(): DailyBriefing | null {
  const dates = listBriefingDates();
  if (dates.length === 0) return null;
  return getBriefingByDate(dates[0]);
}

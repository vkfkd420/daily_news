import fs from 'node:fs';
import path from 'node:path';
import type { DailyBriefing } from '../src/types/briefing';
import { validateBriefing } from './gpt/validateBriefing';

const BRIEFINGS_DIR = path.resolve(process.cwd(), 'data/briefings');

export function extractJsonText(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

export function saveBriefing(data: unknown, force = false): DailyBriefing {
  const briefing = validateBriefing(data);

  if (!fs.existsSync(BRIEFINGS_DIR)) {
    fs.mkdirSync(BRIEFINGS_DIR, { recursive: true });
  }

  const filePath = path.join(BRIEFINGS_DIR, `${briefing.date}.json`);

  if (!force && fs.existsSync(filePath)) {
    throw new Error(`${briefing.date} 브리핑이 이미 있습니다. 덮어쓰려면 force: true 로 요청하세요.`);
  }

  const saved: DailyBriefing = {
    ...briefing,
    generatedAt:
      briefing.generatedAt ??
      new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(' ', 'T') + '+09:00',
  };

  const json = JSON.stringify(saved, null, 2) + '\n';
  fs.writeFileSync(filePath, json, 'utf-8');
  fs.writeFileSync(path.join(BRIEFINGS_DIR, 'latest.json'), json, 'utf-8');
  return saved;
}

export function saveBriefingFromText(raw: string, force = false): DailyBriefing {
  const parsed = JSON.parse(extractJsonText(raw)) as unknown;
  return saveBriefing(parsed, force);
}

import fs from 'node:fs';
import path from 'node:path';
import { saveBriefingFromText } from '../../saveBriefing';
import type { DailyBriefing } from '../../../src/types/briefing';

const INBOX_PATH = path.resolve(process.cwd(), 'data/inbox/briefing.json');

export function hasInboxFile() {
  return fs.existsSync(INBOX_PATH);
}

export function syncFromInbox(force: boolean): DailyBriefing {
  if (!hasInboxFile()) {
    throw new Error('data/inbox/briefing.json 파일이 없습니다.');
  }

  const raw = fs.readFileSync(INBOX_PATH, 'utf-8');
  const saved = saveBriefingFromText(raw, force);

  const archivePath = path.resolve(process.cwd(), `data/inbox/archive/${saved.date}.json`);
  fs.mkdirSync(path.dirname(archivePath), { recursive: true });
  fs.renameSync(INBOX_PATH, archivePath);

  return saved;
}

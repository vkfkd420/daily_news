import fs from 'node:fs';
import path from 'node:path';
import { saveBriefingFromText } from '../../saveBriefing';
import type { DailyBriefing } from '../../../src/types/briefing';
import { getKoreaDateString } from '../getKoreaDate';

const DEFAULT_INSTRUCTIONS = `당신은 한국 주식 전문가를 위한 아침 브리핑 어시스턴트입니다.
한국 경제·증시 최신 뉴스를 중요도 순으로 정리하고, 가장 중요한 기사 5개만 JSON으로 출력합니다.
news.korea 정확히 5건, news.usa는 빈 배열, importance와 stars(★) 일치.`;

function loadProjectInstructions(): string {
  const filePath = path.resolve(process.cwd(), 'data/prompts/project-news-instructions.md');
  if (!fs.existsSync(filePath)) return DEFAULT_INSTRUCTIONS;
  return fs.readFileSync(filePath, 'utf-8');
}

function buildUserPrompt(date: string) {
  return `오늘 날짜(한국, KST): ${date}

한국 경제·증시 관점에서 **가장 중요한 뉴스 5개만** 선정해 JSON 브리핑을 작성하세요.
- 한국어, 중요도 순(rank 1~5), 제목·왜 중요한지 간결하게
- importance 1~5와 stars(★★★★★ 형식) 반드시 일치
- news.korea: 정확히 5건 / news.usa: []

필드: date, title, summary, riskLevel, marketDrivers, news.korea, news.usa, portfolioInsight
각 뉴스: rank, importance, stars, title, summary, marketImpact, affectedSectors, watchPoints, source
JSON만 출력 (코드블록 없이). date는 "${date}"`;
}

export async function syncFromOpenAI(
  apiKey: string,
  model: string,
  force: boolean,
  date?: string,
): Promise<DailyBriefing> {
  const targetDate = date ?? getKoreaDateString();
  const instructions = loadProjectInstructions();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: buildUserPrompt(targetDate) },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API 오류 (${response.status}): ${errBody}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI 응답이 비어 있습니다.');

  return saveBriefingFromText(content, force);
}

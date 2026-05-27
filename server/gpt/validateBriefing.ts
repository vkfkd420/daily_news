import type { DailyBriefing, MarketNewsItem } from '../../src/types/briefing';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function validateNewsItem(item: unknown, label: string): MarketNewsItem {
  if (!isObject(item)) throw new Error(`${label}: 항목 형식 오류`);

  const { rank, importance, stars, title, summary, marketImpact, affectedSectors, watchPoints, source } =
    item;

  if (typeof rank !== 'number' || typeof title !== 'string' || typeof summary !== 'string') {
    throw new Error(`${label}: 필수 필드 누락`);
  }

  if (!isObject(affectedSectors) || !isObject(source)) {
    throw new Error(`${label}: affectedSectors/source 오류`);
  }

  if (!isStringArray(affectedSectors.positive) || !isStringArray(affectedSectors.negative)) {
    throw new Error(`${label}: 섹터 배열 오류`);
  }

  if (!isStringArray(watchPoints)) {
    throw new Error(`${label}: watchPoints 오류`);
  }

  return {
    rank,
    importance: typeof importance === 'number' ? importance : 3,
    stars: typeof stars === 'string' ? stars : '★★★☆☆',
    title,
    summary,
    marketImpact: typeof marketImpact === 'string' ? marketImpact : '',
    affectedSectors: {
      positive: affectedSectors.positive,
      negative: affectedSectors.negative,
    },
    watchPoints,
    source: {
      name: typeof source.name === 'string' ? source.name : 'Unknown',
      url: typeof source.url === 'string' ? source.url : '',
    },
  };
}

export function validateBriefing(data: unknown): DailyBriefing {
  if (!isObject(data)) throw new Error('브리핑 JSON이 객체가 아닙니다.');

  const { date, title, summary, riskLevel, marketDrivers, news, portfolioInsight } = data;

  if (typeof date !== 'string' || typeof title !== 'string' || typeof summary !== 'string') {
    throw new Error('date, title, summary 필드가 필요합니다.');
  }

  if (typeof riskLevel !== 'number' || riskLevel < 0 || riskLevel > 100) {
    throw new Error('riskLevel은 0~100 숫자여야 합니다.');
  }

  if (!isStringArray(marketDrivers)) {
    throw new Error('marketDrivers는 문자열 배열이어야 합니다.');
  }

  if (!isObject(news) || !Array.isArray(news.korea) || !Array.isArray(news.usa)) {
    throw new Error('news.korea / news.usa 배열이 필요합니다.');
  }

  if (!isObject(portfolioInsight)) {
    throw new Error('portfolioInsight가 필요합니다.');
  }

  const { keyMessage, preferredSectors, cautionSectors, strategy } = portfolioInsight;

  if (
    typeof keyMessage !== 'string' ||
    !isStringArray(preferredSectors) ||
    !isStringArray(cautionSectors) ||
    typeof strategy !== 'string'
  ) {
    throw new Error('portfolioInsight 필드 형식 오류');
  }

  return {
    date,
    title,
    summary,
    generatedAt: typeof data.generatedAt === 'string' ? data.generatedAt : undefined,
    riskLevel,
    marketDrivers,
    news: {
      korea: news.korea.map((item, i) => validateNewsItem(item, `korea[${i}]`)),
      usa: news.usa.map((item, i) => validateNewsItem(item, `usa[${i}]`)),
    },
    portfolioInsight: {
      keyMessage,
      preferredSectors,
      cautionSectors,
      strategy,
    },
  };
}

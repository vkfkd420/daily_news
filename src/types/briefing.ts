export type NewsSource = {
  name: string;
  url: string;
};

export type AffectedSectors = {
  positive: string[];
  negative: string[];
};

export type MarketNewsItem = {
  rank: number;
  importance: number;
  stars: string;
  title: string;
  summary: string;
  marketImpact: string;
  affectedSectors: AffectedSectors;
  watchPoints: string[];
  source: NewsSource;
};

export type MarketNews = {
  korea: MarketNewsItem[];
  usa: MarketNewsItem[];
};

export type PortfolioInsight = {
  keyMessage: string;
  preferredSectors: string[];
  cautionSectors: string[];
  strategy: string;
};

export type DailyBriefing = {
  date: string;
  title: string;
  summary: string;
  generatedAt?: string;
  riskLevel: number;
  marketDrivers: string[];
  news: MarketNews;
  portfolioInsight: PortfolioInsight;
};

export type BriefingListItem = {
  date: string;
  title: string;
  itemCount: number;
  generatedAt?: string;
};

export function countBriefingItems(briefing: DailyBriefing): number {
  return briefing.news.korea.length + briefing.news.usa.length;
}

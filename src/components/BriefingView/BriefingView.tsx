import { useEffect, useState } from 'react';
import type { DailyBriefing } from '../../types/briefing';
import { countBriefingItems } from '../../types/briefing';
import { formatBriefingDate, formatGeneratedTime } from '../../utils/formatDate';
import MarketDrivers from '../MarketDrivers/MarketDrivers';
import NewsItemCard from '../NewsItemCard/NewsItemCard';
import PortfolioInsight from '../PortfolioInsight/PortfolioInsight';
import RegionTabs, { type Region } from '../RegionTabs/RegionTabs';
import RiskGauge from '../RiskGauge/RiskGauge';
import './BriefingView.css';

type BriefingViewProps = {
  briefing: DailyBriefing;
};

export default function BriefingView({ briefing }: BriefingViewProps) {
  const [region, setRegion] = useState<Region>('korea');
  const totalItems = countBriefingItems(briefing);
  const items = briefing.news[region];

  useEffect(() => {
    setRegion('korea');
  }, [briefing.date]);

  useEffect(() => {
    if (region === 'korea' && briefing.news.korea.length === 0 && briefing.news.usa.length > 0) {
      setRegion('usa');
    }
  }, [briefing, region]);

  return (
    <article className="briefing-view">
      <header className="briefing-view__header">
        <p className="briefing-view__label">오늘의 브리핑</p>
        <h2 className="briefing-view__title">{briefing.title}</h2>
        <div className="briefing-view__meta">
          <time dateTime={briefing.date}>{formatBriefingDate(briefing.date)}</time>
          {briefing.generatedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatGeneratedTime(briefing.generatedAt)} 생성</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>뉴스 {totalItems}건</span>
        </div>
      </header>

      <section className="briefing-view__summary" aria-label="한눈에 보기">
        <p className="briefing-view__summary-text">{briefing.summary}</p>
        <RiskGauge level={briefing.riskLevel} />
        <MarketDrivers drivers={briefing.marketDrivers} />
      </section>

      <RegionTabs
        active={region}
        koreaCount={briefing.news.korea.length}
        usaCount={briefing.news.usa.length}
        onChange={setRegion}
      />

      <section
        className="briefing-view__news"
        role="tabpanel"
        aria-label={region === 'korea' ? '한국 증시' : '미국 증시'}
      >
        {items.length > 0 ? (
          <ul className="briefing-view__list">
            {items.map((item) => (
              <li key={`${region}-${item.rank}`}>
                <NewsItemCard item={item} region={region} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="briefing-view__empty">해당 시장 뉴스가 없습니다.</p>
        )}
      </section>

      <PortfolioInsight insight={briefing.portfolioInsight} />
    </article>
  );
}

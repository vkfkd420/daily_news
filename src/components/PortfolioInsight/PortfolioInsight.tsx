import type { PortfolioInsight as PortfolioInsightType } from '../../types/briefing';
import './PortfolioInsight.css';

type PortfolioInsightProps = {
  insight: PortfolioInsightType;
};

function SectorList({ label, sectors, variant }: { label: string; sectors: string[]; variant: 'up' | 'down' }) {
  if (sectors.length === 0) return null;

  return (
    <div className={`portfolio-insight__sectors portfolio-insight__sectors--${variant}`}>
      <span className="portfolio-insight__sectors-label">{label}</span>
      <ul>
        {sectors.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

export default function PortfolioInsight({ insight }: PortfolioInsightProps) {
  return (
    <section className="portfolio-insight" aria-label="포트폴리오 인사이트">
      <h3 className="portfolio-insight__title">포트폴리오 인사이트</h3>
      <p className="portfolio-insight__message">{insight.keyMessage}</p>

      <div className="portfolio-insight__grid">
        <SectorList label="선호 섹터" sectors={insight.preferredSectors} variant="up" />
        <SectorList label="주의 섹터" sectors={insight.cautionSectors} variant="down" />
      </div>

      <div className="portfolio-insight__strategy">
        <span className="portfolio-insight__strategy-label">전략</span>
        <p>{insight.strategy}</p>
      </div>
    </section>
  );
}

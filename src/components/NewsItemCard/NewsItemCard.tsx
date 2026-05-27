import { useState } from 'react';
import type { MarketNewsItem } from '../../types/briefing';
import './NewsItemCard.css';

type NewsItemCardProps = {
  item: MarketNewsItem;
  region: string;
};

function SectorTags({ label, sectors, variant }: { label: string; sectors: string[]; variant: 'up' | 'down' }) {
  if (sectors.length === 0) return null;

  return (
    <div className={`news-item-card__sectors news-item-card__sectors--${variant}`}>
      <span className="news-item-card__sectors-label">{label}</span>
      <ul className="news-item-card__sector-list">
        {sectors.map((sector) => (
          <li key={sector}>{sector}</li>
        ))}
      </ul>
    </div>
  );
}

export default function NewsItemCard({ item, region }: NewsItemCardProps) {
  const [open, setOpen] = useState(false);
  const hasUrl = item.source.url.trim().length > 0;
  const panelId = `news-panel-${region}-${item.rank}`;

  return (
    <article className={`news-item-card${open ? ' news-item-card--open' : ''}`}>
      <button
        type="button"
        className="news-item-card__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="news-item-card__rank">{item.rank}</span>
        <span className="news-item-card__stars" aria-label={`중요도 ${item.importance}`}>
          {item.stars}
        </span>
        <h4 className="news-item-card__title">{item.title}</h4>
        <span className="news-item-card__chevron" aria-hidden="true" />
      </button>

      <div id={panelId} className="news-item-card__panel" hidden={!open}>
        <p className="news-item-card__summary">{item.summary}</p>

        <div className="news-item-card__impact-box">
          <span className="news-item-card__impact-label">시장 영향</span>
          <p>{item.marketImpact}</p>
        </div>

        <div className="news-item-card__sectors-wrap">
          <SectorTags label="긍정" sectors={item.affectedSectors.positive} variant="up" />
          <SectorTags label="부정" sectors={item.affectedSectors.negative} variant="down" />
        </div>

        {item.watchPoints.length > 0 && (
          <div className="news-item-card__watch">
            <span className="news-item-card__watch-label">체크 포인트</span>
            <ul className="news-item-card__watch-list">
              {item.watchPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        <footer className="news-item-card__footer">
          <span>{item.source.name}</span>
          {hasUrl && (
            <>
              <span aria-hidden="true"> · </span>
              <a href={item.source.url} target="_blank" rel="noopener noreferrer">
                원문 보기
              </a>
            </>
          )}
        </footer>
      </div>
    </article>
  );
}

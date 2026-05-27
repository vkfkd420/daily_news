import './RegionTabs.css';

export type Region = 'korea' | 'usa';

type RegionTabsProps = {
  active: Region;
  koreaCount: number;
  usaCount: number;
  onChange: (region: Region) => void;
};

const TABS: { id: Region; label: string }[] = [
  { id: 'korea', label: '한국' },
  { id: 'usa', label: '미국' },
];

export default function RegionTabs({ active, koreaCount, usaCount, onChange }: RegionTabsProps) {
  const counts = { korea: koreaCount, usa: usaCount };

  return (
    <div className="region-tabs" role="tablist" aria-label="시장 구분">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`region-tabs__btn${active === tab.id ? ' region-tabs__btn--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          <span className="region-tabs__count">{counts[tab.id]}</span>
        </button>
      ))}
    </div>
  );
}

import type { BriefingListItem } from '../../types/briefing';
import { formatShortDate } from '../../utils/formatDate';
import './DateSidebar.css';

type DateSidebarProps = {
  history: BriefingListItem[];
  activeDate: string;
  onSelect: (date: string) => void;
};

export default function DateSidebar({ history, activeDate, onSelect }: DateSidebarProps) {
  if (history.length === 0) return null;

  return (
    <aside className="date-sidebar" aria-label="이전 브리핑">
      <h2 className="date-sidebar__title">지난 브리핑</h2>
      <ul className="date-sidebar__list">
        {history.map((item) => (
          <li key={item.date}>
            <button
              type="button"
              className={`date-sidebar__btn${item.date === activeDate ? ' date-sidebar__btn--active' : ''}`}
              onClick={() => onSelect(item.date)}
              aria-current={item.date === activeDate ? 'date' : undefined}
            >
              <span className="date-sidebar__date">{formatShortDate(item.date)}</span>
              <span className="date-sidebar__count">{item.itemCount}건</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

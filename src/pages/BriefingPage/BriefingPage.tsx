import { useState } from 'react';
import BriefingView from '../../components/BriefingView/BriefingView';
import DateSidebar from '../../components/DateSidebar/DateSidebar';
import SyncBriefing from '../../components/SyncBriefing/SyncBriefing';
import { useAutoSync } from '../../hooks/useAutoSync';
import { useBriefing } from '../../hooks/useBriefing';
import { formatShortDate } from '../../utils/formatDate';
import './BriefingPage.css';

const AUTO_SYNC = import.meta.env.VITE_AUTO_SYNC_ON_LOAD !== 'false';

export default function BriefingPage() {
  const [selectedDate, setSelectedDate] = useState<string | 'latest'>('latest');
  const { briefing, history, loading, error, refetch } = useBriefing(selectedDate);

  useAutoSync(AUTO_SYNC, refetch);

  if (loading) {
    return (
      <div className="briefing-page briefing-page--status">
        <p>브리핑을 불러오는 중…</p>
      </div>
    );
  }

  if (error || !briefing) {
    return (
      <div className="briefing-page briefing-page--empty">
        <div className="briefing-page__empty-card">
          <p className="briefing-page__empty-title">오늘 브리핑이 아직 없습니다</p>
          <p className="briefing-page__empty-desc">
            아직 자동화 설정이 없거나 오늘 데이터가 없습니다.
            <br />
            PowerShell: <code>npm run setup:automation</code>
            <br />
            → 매일 9시 자동 생성 (<code>docs/AUTOMATION_SETUP.md</code>)
          </p>
          {error && <p className="briefing-page__empty-error">{error}</p>}
          <div className="briefing-page__empty-action">
            <SyncBriefing />
          </div>
        </div>
      </div>
    );
  }

  const activeDate = briefing.date;

  return (
    <div className="briefing-page">
      <div className="briefing-page__mobile-bar">
        <SyncBriefing />
      </div>

      {history.length > 1 && (
        <div className="briefing-page__mobile-picker">
          <label className="briefing-page__mobile-label" htmlFor="briefing-date">
            날짜 선택
          </label>
          <select
            id="briefing-date"
            className="briefing-page__mobile-select"
            value={selectedDate === 'latest' ? activeDate : selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {history.map((item) => (
              <option key={item.date} value={item.date}>
                {formatShortDate(item.date)} · {item.itemCount}건
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="briefing-page__body">
        <DateSidebar
          history={history}
          activeDate={activeDate}
          onSelect={(date) => setSelectedDate(date)}
        />
        <BriefingView briefing={briefing} />
      </div>
    </div>
  );
}

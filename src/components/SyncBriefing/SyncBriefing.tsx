import ImportBriefing from '../ImportBriefing/ImportBriefing';
import './SyncBriefing.css';

/** ChatGPT Plus: API 동기화 대신 붙여넣기만 사용 */
export default function SyncBriefing() {
  return (
    <div className="sync-briefing">
      <ImportBriefing />
      <span className="sync-briefing__guide" title="가이드: docs/CHATGPT_PLUS.md">
        Plus
      </span>
    </div>
  );
}

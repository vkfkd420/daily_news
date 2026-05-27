import { useEffect, useRef } from 'react';
import { syncBriefing } from '../api/briefingClient';

/** 앱 열 때 오늘 브리핑이 없으면 1회 자동 동기화 시도 */
export function useAutoSync(enabled: boolean, onDone?: () => void) {
  const tried = useRef(false);

  useEffect(() => {
    if (!enabled || tried.current) return;
    tried.current = true;

    syncBriefing()
      .then((result) => {
        if (result.source !== 'skip') {
          window.dispatchEvent(new CustomEvent('briefing:refresh'));
        }
      })
      .catch(() => {
        /* 설정 없으면 조용히 무시 */
      })
      .finally(() => onDone?.());
  }, [enabled, onDone]);
}

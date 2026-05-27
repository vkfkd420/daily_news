import { useCallback, useEffect, useState } from 'react';
import { fetchBriefingByDate, fetchBriefingList, fetchLatestBriefing } from '../api/briefingClient';
import type { BriefingListItem, DailyBriefing } from '../types/briefing';

export function useBriefing(date: string | 'latest') {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [history, setHistory] = useState<BriefingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      date === 'latest' ? fetchLatestBriefing() : fetchBriefingByDate(date),
      fetchBriefingList(),
    ])
      .then(([briefingData, listData]) => {
        if (!cancelled) {
          setBriefing(briefingData);
          setHistory(listData);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, refreshKey]);

  useEffect(() => {
    const onRefresh = () => refetch();
    window.addEventListener('briefing:refresh', onRefresh);
    return () => window.removeEventListener('briefing:refresh', onRefresh);
  }, [refetch]);

  return { briefing, history, loading, error, refetch };
}

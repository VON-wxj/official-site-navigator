import { useState, useCallback } from 'react';
import type { SiteCheckResult } from '../../shared/types';

export function useSiteCheck() {
  const [result, setResult] = useState<SiteCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkUrl = useCallback(async (url: string) => {
    setChecking(true);
    setError(null);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'LOOKUP_URL',
        url,
      });
      if (response.type === 'LOOKUP_RESULT') {
        setResult(response.result);
      } else if (response.type === 'ERROR') {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setChecking(false);
    }
  }, []);

  return { result, checking, error, checkUrl };
}

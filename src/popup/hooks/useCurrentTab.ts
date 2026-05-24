import { useState, useEffect } from 'react';
import type { SiteCheckResult } from '../../shared/types';

interface CurrentTabInfo {
  url: string;
  title: string;
  result: SiteCheckResult | null;
  loading: boolean;
  error: string | null;
}

export function useCurrentTab(): CurrentTabInfo {
  const [info, setInfo] = useState<CurrentTabInfo>({
    url: '',
    title: '',
    result: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
          if (!cancelled) setInfo((s) => ({ ...s, loading: false, error: 'No active tab' }));
          return;
        }

        if (!cancelled) {
          setInfo((s) => ({
            ...s,
            url: tab.url || '',
            title: tab.title || '',
          }));
        }

        const response = await chrome.runtime.sendMessage({
          type: 'CHECK_CURRENT_TAB',
          tabId: tab.id,
        });

        if (!cancelled) {
          if (response && response.type === 'CHECK_RESULT') {
            setInfo((s) => ({ ...s, result: response.result, loading: false }));
          } else if (response && response.type === 'ERROR') {
            setInfo((s) => ({ ...s, error: response.message, loading: false }));
          } else {
            setInfo((s) => ({ ...s, loading: false }));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setInfo((s) => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err.message : 'Could not connect to extension',
          }));
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return info;
}

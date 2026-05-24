import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Lang } from './i18n';
import { MESSAGES, STORAGE_KEY } from './i18n';

interface I18nContextValue {
  lang: Lang;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'zh',
  t: (k) => k,
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh');

  useEffect(() => {
    try {
      chrome.storage.local.get(STORAGE_KEY).then((data) => {
        if (data[STORAGE_KEY] === 'en' || data[STORAGE_KEY] === 'zh') {
          setLangState(data[STORAGE_KEY]);
        }
      }).catch(() => {
        // chrome.storage unavailable, keep default
      });
    } catch {
      // chrome API not available
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: newLang }).catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback((key: string): string => {
    return MESSAGES[lang][key] || key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

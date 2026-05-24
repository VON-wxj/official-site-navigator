import { useState } from 'react';
import { useI18n } from '../../shared/I18nProvider';
import { useSiteCheck } from '../hooks/useSiteCheck';
import SiteStatus from './SiteStatus';

export default function SiteLookup() {
  const { t } = useI18n();
  const [url, setUrl] = useState('');
  const { result, checking, error, checkUrl } = useSiteCheck();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      checkUrl(url.trim());
    }
  };

  return (
    <div className="border-t border-gray-200 pt-3 mt-3">
      <h3 className="text-sm font-semibold mb-2">{t('manualLookup')}</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t('enterUrl')}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-400"
        />
        <button
          type="submit"
          disabled={checking || !url.trim()}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? '...' : t('check')}
        </button>
      </form>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      {result && <SiteStatus result={result} url={url} />}
    </div>
  );
}

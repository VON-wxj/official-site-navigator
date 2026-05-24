import { useState } from 'react';
import { useI18n } from '../../shared/I18nProvider';
import type { ReportedSite } from '../../shared/types';

interface Props {
  currentUrl?: string;
}

export default function ReportForm({ currentUrl }: Props) {
  const { t } = useI18n();
  const [impersonatingSite, setImpersonatingSite] = useState('');
  const [impersonatingId, setImpersonatingId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonatingSite.trim()) return;

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'REPORT_SITE',
        report: {
          url: currentUrl || '',
          impersonatingSiteId: impersonatingId || impersonatingSite.toLowerCase().replace(/\s+/g, '-'),
          impersonatingName: impersonatingSite,
          notes,
        },
      });

      if (response.type === 'REPORT_SUCCESS') {
        setSubmitted(true);
      } else {
        setError(response.message || t('reportFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (submitted) {
    return (
      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{t('reportThanks')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-3 mt-3">
      <h3 className="text-sm font-semibold mb-2">{t('reportFake')}</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={impersonatingSite}
          onChange={(e) => setImpersonatingSite(e.target.value)}
          placeholder={t('impersonating')}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-400"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('additionalDetails')}
          rows={2}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-400 resize-none"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={!impersonatingSite.trim()}
          className="w-full px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('submitReport')}
        </button>
      </form>
    </div>
  );
}

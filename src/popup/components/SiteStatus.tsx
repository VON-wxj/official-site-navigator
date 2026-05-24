import type { SiteCheckResult } from '../../shared/types';
import { useI18n } from '../../shared/I18nProvider';
import { CATEGORY_LABELS } from '../../shared/constants';

interface Props {
  result: SiteCheckResult | null;
  url: string;
}

export default function SiteStatus({ result, url }: Props) {
  const { t, lang } = useI18n();

  if (!result) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-500">{t('noData')}</p>
      </div>
    );
  }

  const displayUrl = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  const catLabel = result.matchedSite
    ? (lang === 'zh' ? CATEGORY_LABELS[result.matchedSite.category] : result.matchedSite.category)
    : 'N/A';

  switch (result.status) {
    case 'official':
      return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-600 text-lg">&#10003;</span>
            <span className="font-semibold text-green-800">{t('verifiedOfficial')}</span>
          </div>
          <p className="text-sm text-green-700">
            {result.matchedSite?.name} — {displayUrl}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {t('category')}: {catLabel} | {t('confidence')}: {Math.round(result.confidence * 100)}%
          </p>
        </div>
      );

    case 'suspicious_subdomain':
      return (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-orange-600 text-lg">&#9888;</span>
            <span className="font-semibold text-orange-800">{t('suspicious')}</span>
          </div>
          <p className="text-sm text-orange-700">{result.reason}</p>
          <p className="text-xs text-orange-600 mt-1">{t('url')}: {displayUrl}</p>
          {result.matchedSite && (
            <button
              className="mt-2 px-3 py-1 bg-white border border-orange-300 rounded text-sm text-orange-700 hover:bg-orange-100"
              onClick={() => {
                const pattern = result.matchedSite!.urls[0]?.pattern;
                if (pattern) window.open(`https://${pattern}`, '_blank');
              }}
            >
              {t('goToOfficial')}: {result.matchedSite.name}
            </button>
          )}
        </div>
      );

    case 'homograph_attack':
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-600 text-lg">&#9888;</span>
            <span className="font-semibold text-red-800">{t('homograph')}</span>
          </div>
          <p className="text-sm text-red-700">{result.reason}</p>
          <p className="text-xs text-red-600 mt-1">{t('url')}: {displayUrl}</p>
          {result.homographTarget && (
            <button
              className="mt-2 px-3 py-1 bg-white border border-red-300 rounded text-sm text-red-700 hover:bg-red-100"
              onClick={() => window.open(`https://${result.homographTarget}`, '_blank')}
            >
              {t('goToReal')}: {result.homographTarget}
            </button>
          )}
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-500 text-lg">&#63;</span>
            <span className="font-semibold text-gray-700">{t('notVerified')}</span>
          </div>
          <p className="text-sm text-gray-600">
            {displayUrl} {t('notInDb')}
          </p>
          <p className="text-xs text-gray-500 mt-1">{t('notUnsafe')}</p>
        </div>
      );
  }
}

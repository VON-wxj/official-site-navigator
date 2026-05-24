import { useState, useEffect } from 'react';
import type { OfficialSite, SiteCategory } from '../../shared/types';
import { CATEGORY_LABELS } from '../../shared/constants';
import { useI18n } from '../../shared/I18nProvider';

export default function SiteList() {
  const { t, lang } = useI18n();
  const [sites, setSites] = useState<OfficialSite[]>([]);
  const [filter, setFilter] = useState<SiteCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const [stats, setStats] = useState<{ totalSites: number; categories: Record<string, number> } | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_DATABASE_STATS' }).then((res) => {
      if (res.type === 'STATS') {
        setStats({ totalSites: res.totalSites, categories: res.categories });
      }
    });
  }, []);

  const categories = stats?.categories
    ? (Object.keys(stats.categories) as SiteCategory[])
    : [];

  return (
    <div className="border-t border-gray-200 pt-3 mt-3">
      <h3 className="text-sm font-semibold mb-2">
        {t('dbTitle')}
        {stats && <span className="text-xs text-gray-400 ml-1">({stats.totalSites} {t('sites')})</span>}
      </h3>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1 mb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-0.5 text-xs rounded-full ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {t('all')}
        </button>
        {categories.slice(0, 12).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2 py-0.5 text-xs rounded-full ${
              filter === cat
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {lang === 'zh' ? CATEGORY_LABELS[cat] : cat}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-2">{t('dbFooter')}</p>
    </div>
  );
}

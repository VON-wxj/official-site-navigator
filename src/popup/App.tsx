import { I18nProvider, useI18n } from '../shared/I18nProvider';
import { useCurrentTab } from './hooks/useCurrentTab';
import SiteStatus from './components/SiteStatus';
import SiteLookup from './components/SiteLookup';
import ReportForm from './components/ReportForm';
import SiteList from './components/SiteList';

function AppContent() {
  const tabInfo = useCurrentTab();
  const { t, lang, setLang } = useI18n();

  return (
    <div className="flex flex-col min-h-[400px]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-base font-bold text-gray-800">{t('appName')}</h1>
          <p className="text-xs text-gray-400">{t('appDesc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 text-gray-600 transition-colors"
            title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <span className="text-base leading-none">{lang === 'zh' ? '🌐' : '🌐'}</span>
            <span className="font-medium">{lang === 'zh' ? 'EN' : '中文'}</span>
          </button>
          <span className="text-xs text-gray-400">v1.0</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {tabInfo.loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {tabInfo.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{t('error')}: {tabInfo.error}</p>
          </div>
        )}

        {!tabInfo.loading && !tabInfo.error && (
          <>
            <div className="mb-1">
              <h2 className="text-sm font-semibold text-gray-600">{t('currentSite')}</h2>
            </div>
            <SiteStatus result={tabInfo.result} url={tabInfo.url} />
          </>
        )}

        <SiteLookup />
        <ReportForm currentUrl={tabInfo.url} />
        <SiteList />
      </main>

      {/* Footer */}
      <footer className="px-4 py-2 bg-white border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">{t('privacyFooter')}</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

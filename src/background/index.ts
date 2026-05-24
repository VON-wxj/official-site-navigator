import type { BgMessage, BgResponse } from '../shared/types';
import { checkUrl, batchCheckUrls } from './url-matcher';
import { getDatabase } from './database-loader';
import { tabState } from './tab-state';
import { updateBadge, clearBadge } from './badge-manager';
import { DB_UPDATE_ALARM, DB_UPDATE_INTERVAL_MINUTES } from '../shared/constants';

// ---- Initialize ----
getDatabase(); // Pre-load the database

// Register SERP content scripts
chrome.runtime.onInstalled.addListener(() => {
  chrome.scripting.registerContentScripts([{
    id: 'serp-highlighter',
    js: ['content.js'],
    matches: [
      'https://*.google.com/search*',
      'https://*.google.co.jp/search*',
      'https://*.google.co.uk/search*',
      'https://*.google.de/search*',
      'https://*.google.fr/search*',
      'https://*.baidu.com/s?*',
      'https://*.bing.com/search*',
    ],
    runAt: 'document_end',
    allFrames: false,
  }]).catch(() => {});
});

// Set up database update alarm
chrome.alarms.create(DB_UPDATE_ALARM, {
  periodInMinutes: DB_UPDATE_INTERVAL_MINUTES,
});

// ---- Navigation Listener ----
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return; // Main frame only

  const result = checkUrl(details.url);
  tabState.set(details.tabId, details.url, details.url, result);
  updateBadge(details.tabId, result);

  // Inject warning banner for suspicious sites
  if (
    result.status === 'suspicious_subdomain' ||
    result.status === 'homograph_attack' ||
    result.status === 'reported_fake'
  ) {
    const officialUrl = result.matchedSite?.urls[0]?.pattern
      ? `https://${result.matchedSite.urls[0].pattern}`
      : undefined;

    try {
      await chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['content.js'],
      });

      chrome.tabs.sendMessage(details.tabId, {
        type: 'SHOW_BANNER',
        result,
        officialUrl,
      }).catch(() => {});
    } catch {
      // Cannot inject into chrome://, edge://, etc.
    }
  }
});

// ---- Tab Cleanup ----
chrome.tabs.onRemoved.addListener((tabId) => {
  tabState.remove(tabId);
});

// ---- Message Handler ----
chrome.runtime.onMessage.addListener((
  msg: BgMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (res: BgResponse) => void
) => {
  const db = getDatabase();

  const handle = async () => {
    switch (msg.type) {
      case 'CHECK_CURRENT_TAB': {
        const state = tabState.get(msg.tabId);
        if (state) {
          return { type: 'CHECK_RESULT' as const, result: state.checkResult };
        }
        // Fallback: query the tab URL
        try {
          const tab = await chrome.tabs.get(msg.tabId);
          const result = checkUrl(tab.url || '');
          return { type: 'CHECK_RESULT' as const, result };
        } catch {
          return { type: 'ERROR' as const, message: 'Could not access tab' };
        }
      }

      case 'LOOKUP_URL': {
        const result = checkUrl(msg.url);
        return { type: 'LOOKUP_RESULT' as const, result };
      }

      case 'LOOKUP_URLS': {
        const results = batchCheckUrls(msg.urls);
        return { type: 'LOOKUP_RESULTS' as const, results };
      }

      case 'REPORT_SITE': {
        const id = `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const report = {
          ...msg.report,
          id,
          reportedAt: Date.now(),
        };

        const { reportedSites = [] } = await chrome.storage.local.get('reportedSites');
        reportedSites.push(report);
        await chrome.storage.local.set({ reportedSites });
        return { type: 'REPORT_SUCCESS' as const, reportId: id };
      }

      case 'GET_DATABASE_STATS': {
        const stats = db.getStats();
        return { type: 'STATS' as const, ...stats };
      }

      case 'DISMISS_BANNER': {
        tabState.dismissBanner(msg.tabId);
        return { type: 'CHECK_RESULT' as const, result: { status: 'unknown', reason: 'Dismissed by user', confidence: 0 } };
      }

      default:
        return { type: 'ERROR' as const, message: 'Unknown message type' };
    }
  };

  handle().then(sendResponse).catch((err) => {
    sendResponse({ type: 'ERROR', message: err instanceof Error ? err.message : String(err) });
  });
  return true;
});

// ---- Alarm handler ----
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === DB_UPDATE_ALARM) {
    // Placeholder for future remote DB update
    console.log('[OfficialSiteNavigator] Database update check triggered');
  }
});

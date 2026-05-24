import type { ContentMessage, BgMessage, BgResponse } from '../shared/types';
import { showBanner, hideBanner } from './banner';
import { SerpHighlighter } from './serp-highlighter';

// Detect if this is a search engine results page
function isSerp(): boolean {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  if (hostname.includes('google') && pathname.startsWith('/search')) return true;
  if (hostname.includes('baidu') && pathname.startsWith('/s')) return true;
  if (hostname.includes('bing') && pathname.startsWith('/search')) return true;

  return false;
}

// ---- Entry Point ----
if (isSerp()) {
  // SERP mode: highlight official results
  const highlighter = new SerpHighlighter();
  highlighter.process();
  highlighter.startObserver();

  // Also listen for messages
  chrome.runtime.onMessage.addListener((
    msg: ContentMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (res: Record<string, never>) => void
  ) => {
    if (msg.type === 'HIDE_BANNER') {
      hideBanner();
    }
    sendResponse({});
    return true;
  });
} else {
  // Banner mode: listen for SHOW_BANNER message
  chrome.runtime.onMessage.addListener((
    msg: ContentMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (res: Record<string, never>) => void
  ) => {
    if (msg.type === 'SHOW_BANNER') {
      showBanner(msg.result, msg.officialUrl);
    } else if (msg.type === 'HIDE_BANNER') {
      hideBanner();
    }
    sendResponse({});
    return true;
  });
}

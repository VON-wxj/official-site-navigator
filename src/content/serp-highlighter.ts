import type { SerpParser } from './search-engines/base';
import { GoogleParser } from './search-engines/google';
import { BaiduParser } from './search-engines/baidu';
import { BingParser } from './search-engines/bing';
import type { SiteCheckResult } from '../shared/types';

export class SerpHighlighter {
  private engine: SerpParser | null = null;
  private observer: MutationObserver | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private processed = new Set<string>();

  constructor() {
    const hostname = window.location.hostname;
    if (hostname.includes('google')) {
      this.engine = new GoogleParser();
    } else if (hostname.includes('baidu')) {
      this.engine = new BaiduParser();
    } else if (hostname.includes('bing')) {
      this.engine = new BingParser();
    }
  }

  async process(): Promise<void> {
    if (!this.engine) return;

    const links = this.engine.extractResultLinks();
    const newLinks = links.filter((l) => !this.processed.has(l.href));

    if (newLinks.length === 0) return;

    // Mark as processed
    for (const link of newLinks) {
      this.processed.add(link.href);
    }

    const urls = newLinks.map((l) => l.href);

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'LOOKUP_URLS',
        urls,
      });

      const results: Record<string, SiteCheckResult> = response.results || {};

      for (const link of newLinks) {
        const checkResult = results[link.href];
        if (!checkResult || checkResult.status === 'unknown') continue;

        const badge = document.createElement('span');
        badge.className = 'osn-s-badge';

        if (checkResult.status === 'official') {
          badge.classList.add('osn-s-official');
          badge.textContent = 'Verified Official';
          badge.title = `${checkResult.matchedSite?.name || ''} - Official Site`;
        } else {
          badge.classList.add('osn-s-suspicious');
          badge.textContent = 'Unverified';
          badge.title = checkResult.reason;
          badge.addEventListener('click', () => {
            alert(`Warning: ${checkResult.reason}`);
          });
        }

        this.engine?.insertBadge(link, badge);
      }
    } catch {
      // Background might not be ready
    }
  }

  startObserver(): void {
    this.observer = new MutationObserver(() => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.process(), 500);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  disconnect(): void {
    this.observer?.disconnect();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }
}

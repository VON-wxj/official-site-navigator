import type { TabState, SiteCheckResult } from '../shared/types';

class TabStateManager {
  private states = new Map<number, TabState>();

  get(tabId: number): TabState | undefined {
    return this.states.get(tabId);
  }

  set(tabId: number, url: string, normalizedUrl: string, result: SiteCheckResult): void {
    this.states.set(tabId, {
      tabId,
      url,
      normalizedUrl,
      checkResult: result,
      lastChecked: Date.now(),
      bannerDismissed: false,
    });
  }

  dismissBanner(tabId: number): void {
    const state = this.states.get(tabId);
    if (state) {
      state.bannerDismissed = true;
    }
  }

  remove(tabId: number): void {
    this.states.delete(tabId);
  }

  clear(): void {
    this.states.clear();
  }
}

export const tabState = new TabStateManager();

import { BADGE_COLORS, BADGE_TEXTS } from '../shared/constants';
import type { SiteCheckResult } from '../shared/types';

export function updateBadge(tabId: number, result: SiteCheckResult): void {
  const color = BADGE_COLORS[result.status] || BADGE_COLORS.unknown;
  const text = BADGE_TEXTS[result.status] || BADGE_TEXTS.unknown;

  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color: { r: color[0], g: color[1], b: color[2], a: color[3] } });
}

export function clearBadge(tabId: number): void {
  chrome.action.setBadgeText({ tabId, text: '' });
}

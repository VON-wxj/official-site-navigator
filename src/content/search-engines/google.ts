import type { SerpLink, SerpParser } from './base';

export class GoogleParser implements SerpParser {
  extractResultLinks(): SerpLink[] {
    const links: SerpLink[] = [];
    const seen = new Set<string>();

    // Organic result containers
    const selectors = [
      'div.g',
      'div[data-sokoban-container]',
      'div.Gx5Zad',
      'div[data-hveid]',
    ];

    for (const selector of selectors) {
      const containers = document.querySelectorAll(selector);
      for (const container of containers) {
        const anchors = container.querySelectorAll('a[href]');
        for (const a of anchors) {
          const href = (a as HTMLAnchorElement).href;
          if (!href || !href.startsWith('http') || seen.has(href)) continue;
          // Skip google.com internal links
          const url = new URL(href);
          if (url.hostname.includes('google.com')) continue;
          seen.add(href);
          links.push({
            href,
            displayText: a.textContent?.trim() || '',
            parentElement: a.closest('div') || container as HTMLElement,
          });
        }
      }
    }

    return links.slice(0, 20); // Limit to first 20 organic results
  }

  insertBadge(link: SerpLink, badge: HTMLElement): void {
    // Try to find the cite element or result snippet
    const container = link.parentElement;
    const cite = container?.querySelector('cite');
    if (cite) {
      cite.insertAdjacentElement('afterend', badge);
    } else {
      const anchor = container?.querySelector('a[href]');
      if (anchor) {
        anchor.insertAdjacentElement('afterend', badge);
      }
    }
  }
}

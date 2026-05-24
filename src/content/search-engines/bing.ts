import type { SerpLink, SerpParser } from './base';

export class BingParser implements SerpParser {
  extractResultLinks(): SerpLink[] {
    const links: SerpLink[] = [];
    const seen = new Set<string>();

    // Bing result containers
    const containers = document.querySelectorAll('li.b_algo, ol#b_results > li');
    for (const container of containers) {
      const anchors = container.querySelectorAll('a[href]');
      for (const a of anchors) {
        const href = (a as HTMLAnchorElement).href;
        if (!href || !href.startsWith('http') || seen.has(href)) continue;
        const url = new URL(href);
        if (url.hostname.includes('bing.com') || url.hostname.includes('microsoft.com/bing')) continue;
        seen.add(href);
        links.push({
          href,
          displayText: a.textContent?.trim() || '',
          parentElement: container as HTMLElement,
        });
      }
    }

    return links.slice(0, 20);
  }

  insertBadge(link: SerpLink, badge: HTMLElement): void {
    const container = link.parentElement;
    const cite = container?.querySelector('cite, .b_caption p, .b_attribution');
    if (cite) {
      cite.insertAdjacentElement('afterend', badge);
    } else {
      const title = container?.querySelector('h2 a');
      if (title) {
        title.insertAdjacentElement('afterend', badge);
      }
    }
  }
}

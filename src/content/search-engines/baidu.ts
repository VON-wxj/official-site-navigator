import type { SerpLink, SerpParser } from './base';

export class BaiduParser implements SerpParser {
  extractResultLinks(): SerpLink[] {
    const links: SerpLink[] = [];
    const seen = new Set<string>();

    // Baidu result containers
    const containers = document.querySelectorAll('div.result, div.c-container');
    for (const container of containers) {
      const anchors = container.querySelectorAll('a[href]');
      for (const a of anchors) {
        const href = (a as HTMLAnchorElement).href;
        if (!href || !href.startsWith('http') || seen.has(href)) continue;
        // Skip baidu internal links
        const url = new URL(href);
        if (url.hostname.includes('baidu.com')) continue;
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
    const title = container?.querySelector('h3 a, .t a');
    if (title) {
      title.insertAdjacentElement('afterend', badge);
    } else {
      const firstAnchor = container?.querySelector('a[href]');
      if (firstAnchor) {
        firstAnchor.insertAdjacentElement('afterend', badge);
      }
    }
  }
}

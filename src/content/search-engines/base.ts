export interface SerpLink {
  href: string;
  displayText: string;
  parentElement: HTMLElement;
}

export interface SerpParser {
  extractResultLinks(): SerpLink[];
  insertBadge(link: SerpLink, badge: HTMLElement): void;
}

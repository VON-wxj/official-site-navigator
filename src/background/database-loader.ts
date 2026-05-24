import type { OfficialSite } from '../shared/types';
import officialSitesData from '../data/official-sites.json';

export class DatabaseIndex {
  private domainIndex = new Map<string, OfficialSite>();
  private exactIndex = new Map<string, OfficialSite>();
  private pathPrefixIndex: Array<{ pattern: string; site: OfficialSite }> = [];
  private brandDomains = new Set<string>();
  private brandKeywords = new Set<string>();
  private allSites: OfficialSite[] = [];
  private categoryCounts: Record<string, number> = {};

  constructor() {
    this.load(officialSitesData.sites as OfficialSite[]);
  }

  private load(sites: OfficialSite[]): void {
    this.allSites = [...sites];
    this.domainIndex.clear();
    this.exactIndex.clear();
    this.pathPrefixIndex = [];
    this.brandDomains.clear();
    this.brandKeywords.clear();
    this.categoryCounts = {};

    for (const site of sites) {
      this.categoryCounts[site.category] = (this.categoryCounts[site.category] || 0) + 1;

      for (const alias of site.searchAliases) {
        this.brandKeywords.add(alias.toLowerCase());
      }
      this.brandKeywords.add(site.name.toLowerCase());

      for (const urlPattern of site.urls) {
        switch (urlPattern.matchType) {
          case 'exact':
            this.exactIndex.set(urlPattern.pattern, site);
            break;
          case 'domain':
            this.domainIndex.set(urlPattern.pattern, site);
            this.brandDomains.add(urlPattern.pattern);
            break;
          case 'path_prefix':
            this.pathPrefixIndex.push({ pattern: urlPattern.pattern, site });
            break;
          case 'subdomain':
            this.domainIndex.set(urlPattern.pattern, site);
            this.brandDomains.add(urlPattern.pattern);
            break;
        }
      }
    }

    // Sort path prefixes longest-first
    this.pathPrefixIndex.sort((a, b) => b.pattern.length - a.pattern.length);
  }

  lookupDomain(eTldPlusOne: string): OfficialSite | undefined {
    return this.domainIndex.get(eTldPlusOne);
  }

  lookupExact(normalizedUrl: string): OfficialSite | undefined {
    return this.exactIndex.get(normalizedUrl);
  }

  lookupPathPrefix(pathname: string, eTldPlusOne: string): OfficialSite | undefined {
    for (const { pattern, site } of this.pathPrefixIndex) {
      if (pathname.startsWith(pattern)) {
        // Verify the domain also matches
        for (const u of site.urls) {
          if (u.pattern === eTldPlusOne && u.matchType === 'domain') {
            return site;
          }
        }
      }
    }
    return undefined;
  }

  getBrandDomains(): Set<string> {
    return this.brandDomains;
  }

  getBrandKeywords(): Set<string> {
    return this.brandKeywords;
  }

  getStats(): { totalSites: number; categories: Record<string, number> } {
    return {
      totalSites: this.allSites.length,
      categories: { ...this.categoryCounts },
    };
  }

  getAllSites(): OfficialSite[] {
    return this.allSites;
  }

  getSiteById(id: string): OfficialSite | undefined {
    return this.allSites.find((s) => s.id === id);
  }
}

let dbInstance: DatabaseIndex | null = null;

export function getDatabase(): DatabaseIndex {
  if (!dbInstance) {
    dbInstance = new DatabaseIndex();
  }
  return dbInstance;
}

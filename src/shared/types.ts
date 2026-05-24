// ---- Category Enum ----
export type SiteCategory =
  | 'banking'
  | 'social_media'
  | 'ecommerce'
  | 'government'
  | 'payment'
  | 'crypto'
  | 'email'
  | 'cloud_storage'
  | 'travel'
  | 'education'
  | 'healthcare'
  | 'telecom'
  | 'delivery'
  | 'gaming'
  | 'utility'
  | 'streaming'
  | 'shopping'
  | 'other';

export type MatchType = 'exact' | 'domain' | 'subdomain' | 'path_prefix';

export type VerifyStatus =
  | 'official'
  | 'suspicious_subdomain'
  | 'unknown'
  | 'reported_fake'
  | 'homograph_attack';

// ---- Official Site Definition ----
export interface OfficialUrlPattern {
  pattern: string;
  matchType: MatchType;
  protocols: Array<'https' | 'http'>;
  allowedSubdomains?: string[];
  priority: number;
}

export interface OfficialSite {
  id: string;
  name: string;
  localizedNames?: Record<string, string>;
  category: SiteCategory;
  region: string;
  urls: OfficialUrlPattern[];
  searchAliases: string[];
  description: string;
  lastUpdated: number;
}

// ---- Site Check Result ----
export interface SiteCheckResult {
  status: VerifyStatus;
  matchedSite?: OfficialSite;
  reason: string;
  confidence: number;
  homographTarget?: string;
}

// ---- Reported Site ----
export interface ReportedSite {
  id: string;
  url: string;
  impersonatingSiteId: string;
  impersonatingName: string;
  reportedAt: number;
  notes: string;
}

// ---- Tab State ----
export interface TabState {
  tabId: number;
  url: string;
  normalizedUrl: string;
  checkResult: SiteCheckResult;
  lastChecked: number;
  bannerDismissed: boolean;
}

// ---- Message Types ----
export type BgMessage =
  | { type: 'CHECK_CURRENT_TAB'; tabId: number }
  | { type: 'LOOKUP_URL'; url: string }
  | { type: 'LOOKUP_URLS'; urls: string[] }
  | { type: 'REPORT_SITE'; report: Omit<ReportedSite, 'id' | 'reportedAt'> }
  | { type: 'GET_DATABASE_STATS' }
  | { type: 'DISMISS_BANNER'; tabId: number };

export type BgResponse =
  | { type: 'CHECK_RESULT'; result: SiteCheckResult }
  | { type: 'LOOKUP_RESULT'; result: SiteCheckResult }
  | { type: 'LOOKUP_RESULTS'; results: Record<string, SiteCheckResult> }
  | { type: 'REPORT_SUCCESS'; reportId: string }
  | { type: 'ERROR'; message: string }
  | { type: 'STATS'; totalSites: number; categories: Record<string, number> };

export type ContentMessage =
  | { type: 'SHOW_BANNER'; result: SiteCheckResult; officialUrl?: string }
  | { type: 'HIDE_BANNER' };

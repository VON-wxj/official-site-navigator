import type { OfficialSite, SiteCheckResult } from '../shared/types';
import { normalizeUrl, stripWww, type NormalizedUrl } from './url-normalizer';
import { detectHomograph } from './homograph-detector';
import { getDatabase } from './database-loader';

export function checkUrl(rawUrl: string): SiteCheckResult {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) {
    return {
      status: 'unknown',
      reason: 'Unable to parse URL',
      confidence: 0,
    };
  }

  const db = getDatabase();

  // 1. Exact match
  const exactKey = normalized.hostnamePunycode + normalized.pathname;
  const exactSite = db.lookupExact(exactKey);
  if (exactSite) {
    const pattern = exactSite.urls.find((u) => u.matchType === 'exact');
    if (pattern && pattern.protocols.includes(normalized.protocol as 'https' | 'http')) {
      return {
        status: 'official',
        matchedSite: exactSite,
        reason: `Verified official site: ${exactSite.name}`,
        confidence: 1.0,
      };
    }
  }

  // Also try with stripped www
  const strippedHostname = stripWww(normalized.hostnamePunycode);
  const strippedKey = strippedHostname + normalized.pathname;
  if (strippedKey !== exactKey) {
    const strippedExact = db.lookupExact(strippedKey);
    if (strippedExact) {
      return {
        status: 'official',
        matchedSite: strippedExact,
        reason: `Verified official site: ${strippedExact.name}`,
        confidence: 1.0,
      };
    }
  }

  // 2. Domain match
  const domainSite = db.lookupDomain(normalized.eTldPlusOne);
  if (domainSite) {
    const domainPattern = domainSite.urls.find(
      (u) => u.matchType === 'domain' && u.pattern === normalized.eTldPlusOne
    );
    if (domainPattern) {
      // Check protocol
      if (!domainPattern.protocols.includes(normalized.protocol as 'https' | 'http')) {
        return {
          status: 'suspicious_subdomain',
          matchedSite: domainSite,
          reason: `Wrong protocol (${normalized.protocol}) for ${domainSite.name}`,
          confidence: 0.6,
        };
      }

      // Check subdomain
      if (normalized.subdomain) {
        const subdomainParts = normalized.subdomain.toLowerCase();
        const allowed = domainPattern.allowedSubdomains || ['www'];

        // Strip www. from subdomain if present
        const subdomainWithoutWww = stripWww(subdomainParts);

        if (
          subdomainWithoutWww &&
          !allowed.includes(subdomainParts) &&
          !allowed.includes(subdomainWithoutWww)
        ) {
          return {
            status: 'suspicious_subdomain',
            matchedSite: domainSite,
            reason: `Suspicious subdomain "${normalized.subdomain}" on ${normalized.eTldPlusOne}`,
            confidence: 0.7,
          };
        }
      }

      return {
        status: 'official',
        matchedSite: domainSite,
        reason: `Verified official site: ${domainSite.name}`,
        confidence: 1.0,
      };
    }
  }

  // 3. Path prefix match
  const pathSite = db.lookupPathPrefix(normalized.pathname, normalized.eTldPlusOne);
  if (pathSite) {
    return {
      status: 'official',
      matchedSite: pathSite,
      reason: `Verified official site: ${pathSite.name}`,
      confidence: 0.95,
    };
  }

  // 4. Brand keyword injection check
  const brandKeywords = db.getBrandKeywords();
  const hostnameParts = normalized.hostnamePunycode.split('.');
  for (const part of hostnameParts) {
    if (brandKeywords.has(part.toLowerCase())) {
      return {
        status: 'suspicious_subdomain',
        reason: `Domain contains brand keyword "${part}" but is not a verified official site`,
        confidence: 0.6,
      };
    }
  }

  // Also check the stripped www hostname
  const strippedParts = strippedHostname.split('.');
  for (const part of strippedParts) {
    if (brandKeywords.has(part.toLowerCase())) {
      return {
        status: 'suspicious_subdomain',
        reason: `Domain contains brand keyword "${part}" but is not a verified official site`,
        confidence: 0.6,
      };
    }
  }

  // 5. Homograph detection
  const homographCheck = detectHomograph(normalized.hostname, db.getBrandDomains());
  if (homographCheck.isHomograph) {
    return {
      status: 'homograph_attack',
      reason: `Potential homograph attack: domain visually resembles ${homographCheck.targetDomain}`,
      confidence: 0.9,
      homographTarget: homographCheck.targetDomain,
    };
  }

  // 6. Unknown
  return {
    status: 'unknown',
    reason: 'Site not in verified official database',
    confidence: 0.3,
  };
}

export function batchCheckUrls(urls: string[]): Record<string, SiteCheckResult> {
  const results: Record<string, SiteCheckResult> = {};
  for (const url of urls) {
    results[url] = checkUrl(url);
  }
  return results;
}

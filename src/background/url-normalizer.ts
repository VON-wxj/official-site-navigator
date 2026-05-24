export interface NormalizedUrl {
  raw: string;
  protocol: string;
  hostname: string;
  hostnamePunycode: string;
  eTldPlusOne: string;
  subdomain: string;
  pathname: string;
  searchParams: URLSearchParams;
}

const PSL_SUFFIXES = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'co.uk', 'ac.uk', 'gov.uk', 'org.uk', 'net.uk',
  'com.cn', 'org.cn', 'net.cn', 'edu.cn', 'gov.cn',
  'co.jp', 'or.jp', 'ne.jp', 'ac.jp', 'go.jp',
  'com.au', 'org.au', 'net.au', 'edu.au', 'gov.au',
  'de', 'fr', 'es', 'it', 'nl', 'be', 'ch', 'at',
  'ru', 'br', 'in', 'kr', 'sg', 'hk', 'tw',
  'io', 'ai', 'co', 'so', 'me', 'tv', 'gg',
  'com.br', 'org.br', 'net.br',
  'co.kr', 'or.kr', 'ne.kr', 'go.kr',
  'com.sg', 'org.sg', 'net.sg', 'edu.sg', 'gov.sg',
  'com.hk', 'org.hk', 'net.hk', 'edu.hk', 'gov.hk',
  'com.tw', 'org.tw', 'net.tw', 'edu.tw', 'gov.tw',
]);

function isLikelyPublicSuffix(domain: string): boolean {
  return PSL_SUFFIXES.has(domain);
}

export function normalizeUrl(rawUrl: string): NormalizedUrl | null {
  try {
    const url = new URL(rawUrl);

    // Only handle http/https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    let hostname = url.hostname.toLowerCase();

    // Convert IDN to Punycode
    let hostnamePunycode: string;
    try {
      hostnamePunycode = new URL('https://' + hostname).hostname;
    } catch {
      hostnamePunycode = hostname;
    }

    // Strip default ports
    const cleanHostname = hostnamePunycode.replace(/:443$|:80$/, '');

    // Extract eTLD+1 by walking backwards through domain parts
    const parts = cleanHostname.split('.');
    let eTldPlusOne = cleanHostname;

    if (parts.length >= 2) {
      for (let i = 1; i < parts.length; i++) {
        const candidate = parts.slice(i).join('.');
        if (isLikelyPublicSuffix(candidate) && i + 1 < parts.length) {
          eTldPlusOne = parts.slice(i - 1).join('.');
          break;
        }
      }
      // Fallback: last two parts
      if (eTldPlusOne === cleanHostname && parts.length >= 2) {
        // Try last 2 parts
        const last2 = parts.slice(-2).join('.');
        if (isLikelyPublicSuffix(last2) && parts.length >= 3) {
          eTldPlusOne = parts.slice(-3).join('.');
        } else {
          eTldPlusOne = parts.slice(-2).join('.');
        }
      }
    }

    // Extract subdomain
    const domainPart = eTldPlusOne;
    const subdomain = cleanHostname === domainPart
      ? ''
      : cleanHostname.slice(0, cleanHostname.length - domainPart.length - 1);

    // Strip trailing slash
    const pathname = url.pathname.replace(/\/$/, '') || '/';

    return {
      raw: rawUrl,
      protocol: url.protocol.replace(':', ''),
      hostname: hostname,
      hostnamePunycode: cleanHostname,
      eTldPlusOne: eTldPlusOne,
      subdomain,
      pathname,
      searchParams: url.searchParams,
    };
  } catch {
    return null;
  }
}

export function stripWww(hostname: string): string {
  return hostname.replace(/^www\./, '');
}

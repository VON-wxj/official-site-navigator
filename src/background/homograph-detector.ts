const MIXED_SCRIPT_BLOCKS: Array<[number, number, string]> = [
  [0x0400, 0x04FF, 'Cyrillic'],
  [0x0370, 0x03FF, 'Greek'],
  [0x0530, 0x058F, 'Armenian'],
  [0x0600, 0x06FF, 'Arabic'],
  [0x0900, 0x097F, 'Devanagari'],
  [0x3040, 0x309F, 'Hiragana'],
  [0x30A0, 0x30FF, 'Katakana'],
  [0x4E00, 0x9FFF, 'CJK Unified'],
  [0xAC00, 0xD7AF, 'Hangul'],
  [0x0E00, 0x0E7F, 'Thai'],
];

const LATIN_RANGE: [number, number] = [0x0041, 0x007A]; // A-Z, a-z
const DIGIT_RANGE: [number, number] = [0x0030, 0x0039]; // 0-9

function getScript(charCode: number): string | null {
  if (charCode >= LATIN_RANGE[0] && charCode <= LATIN_RANGE[1]) return 'Latin';
  for (const [start, end, name] of MIXED_SCRIPT_BLOCKS) {
    if (charCode >= start && charCode <= end) return name;
  }
  if (charCode >= DIGIT_RANGE[0] && charCode <= DIGIT_RANGE[1]) return 'Digit';
  return null;
}

export interface HomographCheck {
  isHomograph: boolean;
  targetDomain?: string;
  scripts: string[];
}

const HOMOGRAPH_LOOKALIKES: Record<string, string> = {
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
  'і': 'i', 'ѡ': 'o', 'ԁ': 'd', 'һ': 'h', 'ӏ': 'l', 'Ա': 'u',
  'ɑ': 'a', 'ɛ': 'e', 'ο': 'o', 'ν': 'v',
};

export function detectHomograph(hostname: string, brandDomains: Set<string>): HomographCheck {
  const scripts = new Set<string>();
  for (let i = 0; i < hostname.length; i++) {
    const script = getScript(hostname.charCodeAt(i));
    if (script && script !== 'Digit') {
      scripts.add(script);
    }
  }

  const scriptList = Array.from(scripts);
  const hasLatin = scriptList.includes('Latin');
  const nonLatin = scriptList.filter((s) => s !== 'Latin');

  if (!hasLatin || nonLatin.length === 0) {
    return { isHomograph: false, scripts: scriptList };
  }

  // Mixed script detected — check if it visually impersonates a known brand
  let asciiVersion = '';
  for (let i = 0; i < hostname.length; i++) {
    const char = hostname[i];
    asciiVersion += HOMOGRAPH_LOOKALIKES[char] || char;
  }

  if (asciiVersion !== hostname) {
    for (const brandDomain of brandDomains) {
      const domainParts = asciiVersion.split('.');
      const brandParts = brandDomain.split('.');
      for (const dp of domainParts) {
        for (const bp of brandParts) {
          if (dp.length === bp.length && editDistance(dp, bp) <= 1) {
            return {
              isHomograph: true,
              targetDomain: brandDomain,
              scripts: scriptList,
            };
          }
        }
      }
    }
  }

  return { isHomograph: false, scripts: scriptList };
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

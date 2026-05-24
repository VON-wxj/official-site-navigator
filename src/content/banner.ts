import type { SiteCheckResult } from '../shared/types';
import { BANNER_CSS, getBannerClass } from './styles';

const HOST_ID = 'osn-shadow-host';

export function showBanner(result: SiteCheckResult, officialUrl?: string): void {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;';
  document.body.prepend(host);

  const shadow = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = BANNER_CSS;

  const banner = document.createElement('div');
  banner.className = `osn-banner ${getBannerClass(result.status)}`;

  const text = document.createElement('div');
  text.className = 'osn-banner-text';

  if (result.status === 'homograph_attack') {
    text.textContent = `Warning: Potential deceptive site detected. This site may be impersonating ${result.homographTarget || 'a legitimate website'} through visual lookalike techniques.`;
  } else if (result.matchedSite) {
    text.textContent = `Warning: This site is not verified as official. The official site for ${result.matchedSite.name} is verified separately.`;
  } else {
    text.textContent = `Warning: This site is not in our verified official database. ${result.reason}`;
  }

  const actions = document.createElement('div');
  actions.className = 'osn-banner-actions';

  if (officialUrl) {
    const goBtn = document.createElement('button');
    goBtn.className = 'osn-btn osn-btn-primary';
    goBtn.textContent = 'Go to Official Site';
    goBtn.addEventListener('click', () => {
      window.location.href = officialUrl;
    });
    actions.appendChild(goBtn);
  }

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'osn-btn osn-btn-dismiss';
  dismissBtn.textContent = 'Dismiss';
  dismissBtn.addEventListener('click', () => {
    host.remove();
    chrome.runtime.sendMessage({ type: 'DISMISS_BANNER', tabId: chrome.tabs?.TAB_ID_NONE });
  });
  actions.appendChild(dismissBtn);

  banner.appendChild(text);
  banner.appendChild(actions);
  shadow.appendChild(style);
  shadow.appendChild(banner);
}

export function hideBanner(): void {
  const host = document.getElementById(HOST_ID);
  if (host) {
    host.remove();
  }
}

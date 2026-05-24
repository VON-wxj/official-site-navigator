export const BANNER_CSS = `
  .osn-banner-wrapper {
    all: initial;
  }
  .osn-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  .osn-banner.osn-warning {
    background: linear-gradient(135deg, #ff9800, #f57c00);
  }
  .osn-banner.osn-danger {
    background: linear-gradient(135deg, #f44336, #d32f2f);
  }
  .osn-banner-text {
    flex: 1;
    min-width: 200px;
  }
  .osn-banner-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .osn-btn {
    padding: 6px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    transition: opacity 0.2s;
  }
  .osn-btn:hover {
    opacity: 0.9;
  }
  .osn-btn-primary {
    background: #fff;
    color: #333;
  }
  .osn-btn-dismiss {
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.5);
  }

  /* SERP badges */
  .osn-s-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.4;
    vertical-align: middle;
    white-space: nowrap;
  }
  .osn-s-official {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
  }
  .osn-s-suspicious {
    background: #fff3e0;
    color: #e65100;
    border: 1px solid #ffcc80;
    cursor: pointer;
  }
  .osn-s-unknown {
    background: #f5f5f5;
    color: #757575;
    border: 1px solid #e0e0e0;
  }
`;

export const getBannerClass = (status: string): string => {
  switch (status) {
    case 'homograph_attack':
    case 'reported_fake':
      return 'osn-danger';
    default:
      return 'osn-warning';
  }
};

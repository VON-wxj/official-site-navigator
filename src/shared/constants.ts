export const SITE_CATEGORIES = [
  'banking', 'social_media', 'ecommerce', 'government', 'payment',
  'crypto', 'email', 'cloud_storage', 'travel', 'education',
  'healthcare', 'telecom', 'delivery', 'gaming', 'utility',
  'streaming', 'shopping', 'other',
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  banking: '银行 / Banking',
  social_media: '社交媒体 / Social Media',
  ecommerce: '电商 / E-Commerce',
  government: '政府 / Government',
  payment: '支付 / Payment',
  crypto: '加密货币 / Crypto',
  email: '邮箱 / Email',
  cloud_storage: '云存储 / Cloud Storage',
  travel: '旅游 / Travel',
  education: '教育 / Education',
  healthcare: '医疗 / Healthcare',
  telecom: '电信 / Telecom',
  delivery: '快递 / Delivery',
  gaming: '游戏 / Gaming',
  utility: '生活工具 / Utility',
  streaming: '流媒体 / Streaming',
  shopping: '购物 / Shopping',
  other: '其他 / Other',
};

export const BADGE_COLORS: Record<string, [number, number, number, number]> = {
  official: [0, 128, 0, 255],       // Green
  suspicious: [255, 152, 0, 255],   // Orange
  unknown: [128, 128, 128, 255],    // Gray
  reported_fake: [244, 67, 54, 255], // Red
  homograph_attack: [244, 67, 54, 255], // Red
};

export const BADGE_TEXTS: Record<string, string> = {
  official: '✓',
  suspicious: '!',
  unknown: '?',
  reported_fake: '!!',
  homograph_attack: '!!',
};

export const DB_UPDATE_ALARM = 'db-update';
export const DB_UPDATE_INTERVAL_MINUTES = 10080; // 7 days

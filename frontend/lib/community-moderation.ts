const SARA_KEYWORDS = [
  'kafir',
  'cina',
  'pribumi',
  'yahudi',
  'nasrani',
  'hitler',
  'ras inferior',
  'genosida',
  'bunuh semua',
];

const NSFW_KEYWORDS = [
  'porn',
  'bokep',
  'nude',
  'telanjang',
  'seks',
  'sex',
  'ngentot',
  'memek',
  'kontol',
  'fuck me',
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const findBlockedKeyword = (text: string, keywords: string[]) => {
  const normalized = normalize(text);
  return keywords.find((keyword) => normalized.includes(keyword));
};

export const validateCommunityText = (text: string) => {
  const saraMatch = findBlockedKeyword(text, SARA_KEYWORDS);
  if (saraMatch) {
    return {
      ok: false as const,
      reason: 'Your post contains language that is blocked for hate, discrimination, or identity-based harassment.',
    };
  }

  const nsfwMatch = findBlockedKeyword(text, NSFW_KEYWORDS);
  if (nsfwMatch) {
    return {
      ok: false as const,
      reason: 'Your post contains language that is blocked for explicit sexual or NSFW content.',
    };
  }

  return { ok: true as const };
};

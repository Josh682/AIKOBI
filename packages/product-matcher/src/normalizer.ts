export interface NormalizedTitleResult {
  raw: string;
  normalizedText: string;
  cleanCoreTitle: string;
  coreTokens: string[];
}

const MULTI_WORD_PROMO_PHRASES = [
  'bayar di tempat',
  'flash sale',
  'gratis ongkir',
  'free ongkir',
  'best seller',
  'ready stock',
  'siap kirim',
  'garansi resmi',
  'harga grosir',
  'harga promo',
];

const PROMO_STOPWORDS = new Set([
  'promo',
  'termurah',
  'murah',
  'cod',
  'bestseller',
  'terlaris',
  'original',
  'ori',
  '100%',
  'berkualitas',
  'premium',
  'terbaru',
  'import',
  'impor',
  'eceran',
  'grosir',
  'jual',
  'harga',
  'diskon',
  'sale',
  'super',
  'mantap',
  'bagus',
  'awet',
  'kuat',
  'tebal',
  'halus',
  'lembut',
]);

const SPELLING_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b(?:kauskaki|kaoskaki|kaus\s+kaki)\b/g, 'kaos kaki'],
  [/\barabica\b/g, 'arabika'],
  [/\bsneaker\b/g, 'sneakers'],
  [/\bt-?shirt\b/g, 'kaos'],
  [/\bt\s+shirt\b/g, 'kaos'],
  [/\b(?:handphone|smartphone)\b/g, 'hp'],
  [/\btabir\s+surya\b/g, 'sunscreen'],
  [/\bpower\s+bank\b/g, 'powerbank'],
  [/\bkripik\b/g, 'keripik'],
  [/\bbackpack\b/g, 'tas ransel'],
  [/\b(?:facial|face)\s+wash\b/g, 'sabun wajah'],
];

const NUMBER_WORD_MAP: Record<string, number> = {
  satu: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  delapan: 8,
  sembilan: 9,
  sepuluh: 10,
  sebelas: 11,
  duabelas: 12,
  'dua belas': 12,
};

const PACK_NOUNS_PATTERN =
  '(?:pasang|psg|pasg|pcs|pieces|buah|biji|lembar|lbr|pak|pack|set|box|kotak|botol|sachet|kaos|baju|celana|potong|roll|unit|kaleng)';

/**
 * Normalizes an Indonesian e-commerce product title by cleaning decorative characters,
 * unifying compound typos and number words, and producing a promo-free core title.
 */
export function normalizeProductTitle(rawTitle: string): NormalizedTitleResult {
  let text = (rawTitle || '').normalize('NFKC').toLowerCase();

  // Remove emojis and decorative symbols while keeping letters, numbers, whitespace, ., /, -, +, %
  text = text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, ' ')
    .replace(/[【】\[\]()（）{}★☆✓✔•●◆◇■□▲△▼▽|｜~`'"""'':;!?@#&]/g, ' ');

  // Preserve decimal separators inside numeric tokens (e.g. 1,5 -> 1.5), replace slashes with space
  text = text.replace(/(\d),(\d)/g, '$1.$2').replace(/\//g, ' ');

  // Normalize standalone hyphens not inside model codes or x-in-1 patterns
  text = text
    .replace(/\s+-\s+/g, ' ')
    .replace(/(^|\s)-+|-+(\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Spelling & synonym normalization
  for (const [pattern, replacement] of SPELLING_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  // Indonesian dozen/pair idioms
  text = text
    .replace(/\bsetengah\s+lusin\b/g, '6 pcs')
    .replace(/\b(?:dua|2)\s+lusin\b/g, '24 pcs')
    .replace(/\b(?:selusin|satu\s+lusin|1\s+lusin|lusinan)\b/g, '12 pcs')
    .replace(/\b(?:sepasang|satu\s+pasang)\b/g, '1 pasang');

  // Number words adjacent to pack nouns or following "isi"/"paket"
  const numberWordAlternation = Object.keys(NUMBER_WORD_MAP)
    .sort((a, b) => b.length - a.length)
    .join('|');

  const packWordRegex = new RegExp(
    `\\b(paket\\s+)?(${numberWordAlternation})\\s+(${PACK_NOUNS_PATTERN})\\b`,
    'g',
  );
  text = text.replace(packWordRegex, (_m, paketPrefix: string | undefined, word: string, noun: string) => {
    const num = NUMBER_WORD_MAP[word] ?? word;
    return `${paketPrefix ?? ''}${num} ${noun}`;
  });

  const isiWordRegex = new RegExp(`\\b(isi|paket|set|pack|box)\\s+(${numberWordAlternation})\\b`, 'g');
  text = text.replace(isiWordRegex, (_m, prefix: string, word: string) => {
    const num = NUMBER_WORD_MAP[word] ?? word;
    return `${prefix} ${num}`;
  });

  const normalizedText = text.replace(/\s+/g, ' ').trim();

  // Strip multi-word promo phrases and single-word promo noise to build cleanCoreTitle
  let coreText = normalizedText;
  for (const phrase of MULTI_WORD_PROMO_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    coreText = coreText.replace(new RegExp(`\\b${escaped}\\b`, 'g'), ' ');
  }

  const coreTokens = coreText
    .split(/\s+/)
    .map((tok) => tok.trim())
    .filter((tok) => tok.length > 0 && !PROMO_STOPWORDS.has(tok) && tok !== '+');

  const cleanCoreTitle = coreTokens.join(' ').trim();

  return {
    raw: rawTitle,
    normalizedText,
    cleanCoreTitle,
    coreTokens,
  };
}

import { normalizeProductTitle } from './normalizer.js';

export const EMBEDDING_DIM = 384;
const MAX_CACHE_SIZE = 2000;

interface ConceptCluster {
  id: string;
  dim: number;
  weight: number;
  patterns: RegExp[];
}

const CONCEPT_CLUSTERS: ConceptCluster[] = [
  // Footwear & Socks
  {
    id: 'kaos_kaki',
    dim: 0,
    weight: 4.5,
    patterns: [/\bkaos\s+kaki\b/, /\bsocks?\b/, /\bankle\s+socks?\b/, /\bcrew\s+socks?\b/],
  },
  {
    id: 'sepatu',
    dim: 1,
    weight: 4.5,
    patterns: [/\bsepatu\b/, /\bsneakers?\b/, /\bkets\b/, /\bloafers?\b/, /\bpantofel\b/, /\bboots?\b/, /\bsandal\b/, /\bslop\b/],
  },

  // Apparel & Fashion
  {
    id: 'kaos_baju',
    dim: 2,
    weight: 4.0,
    patterns: [/\bkaos(?!\s+kaki)\b/, /\bbaju\b/, /\bkemeja\b/, /\bpolo\b/, /\bblouse\b/, /\btunik\b/],
  },
  {
    id: 'jaket_hoodie',
    dim: 3,
    weight: 4.0,
    patterns: [/\bjaket\b/, /\bhoodie\b/, /\bsweater\b/, /\bcardigan\b/, /\bblazer\b/, /\brompi\b/],
  },
  {
    id: 'celana',
    dim: 4,
    weight: 4.0,
    patterns: [/\bcelana\b/, /\bjeans\b/, /\bchinos?\b/, /\bjogger\b/, /\blegging\b/, /\brok\b/],
  },
  {
    id: 'batik_tenun',
    dim: 5,
    weight: 3.2,
    patterns: [/\bbatik\b/, /\btenun\b/, /\bkebaya\b/],
  },
  {
    id: 'hijab_muslim',
    dim: 6,
    weight: 4.0,
    patterns: [/\bhijab\b/, /\bjilbab\b/, /\bkerudung\b/, /\bkhimar\b/, /\bpashmina\b/, /\bgamis\b/, /\bmukena\b/],
  },
  {
    id: 'katun_fabric',
    dim: 7,
    weight: 2.4,
    patterns: [/\bkatun\b/, /\bcotton\b/, /\bcombed\b/, /\b24s\b/, /\b30s\b/, /\b20s\b/],
  },
  {
    id: 'tas_ransel',
    dim: 8,
    weight: 4.0,
    patterns: [/\btas\b/, /\bransel\b/, /\bbackpack\b/, /\bsling\s+bag\b/, /\btote\s+bag\b/, /\bkoper\b/],
  },
  {
    id: 'dompet',
    dim: 12,
    weight: 4.0,
    patterns: [/\bdompet\b/, /\bwallet\b/],
  },
  {
    id: 'jam_tangan',
    dim: 9,
    weight: 4.0,
    patterns: [/\bjam\s+tangan\b/, /\bsmartwatch\b/, /\bwatch\b/],
  },
  {
    id: 'olahraga_sport',
    dim: 10,
    weight: 2.5,
    patterns: [/\bolahraga\b/, /\bsports?\b/, /\bfitness\b/, /\bgym\b/, /\blari\b/, /\brunning\b/, /\bfutsal\b/, /\bbadminton\b/, /\bcycling\b/],
  },
  {
    id: 'polos_motif',
    dim: 11,
    weight: 1.5,
    patterns: [/\bpolos\b/, /\bplain\b/],
  },

  // Coffee & Brewing Equipment
  {
    id: 'kopi_domain',
    dim: 16,
    weight: 2.4,
    patterns: [/\bkopi\b/, /\bcoffee\b/],
  },
  {
    id: 'coffee_brewer',
    dim: 17,
    weight: 4.5,
    patterns: [/\bdripper\b/, /\bv60\b/, /\bhario\b/, /\bpour\s+over\b/, /\baeropress\b/, /\bfrench\s+press\b/, /\bmoka\s+pot\b/, /\bgrinder\b/],
  },
  {
    id: 'coffee_beans',
    dim: 18,
    weight: 4.2,
    patterns: [/\bbiji\b/, /\bbeans?\b/, /\barabika\b/, /\brobusta\b/, /\bbubuk\b/, /\bground\b/, /\broast\b/, /\bgayo\b/, /\btoraja\b/, /\bkintamani\b/, /\blintong\b/, /\bmandheling\b/],
  },
  {
    id: 'material_ceramic',
    dim: 19,
    weight: 2.8,
    patterns: [/\bkeramik\b/, /\bceramic\b/, /\bporselen\b/, /\bporcelain\b/],
  },
  {
    id: 'material_glass',
    dim: 20,
    weight: 2.8,
    patterns: [/\bkaca\b/, /\bglass\b/, /\bborosilikat\b/, /\bborosilicate\b/],
  },
  {
    id: 'material_stainless',
    dim: 21,
    weight: 2.2,
    patterns: [/\bstainless\b/, /\bsteel\b/, /\baluminium\b/, /\bbesi\b/],
  },

  // Kitchen & Home Appliances
  {
    id: 'mixer_frother',
    dim: 24,
    weight: 4.2,
    patterns: [/\bmixer\b/, /\bfrother\b/, /\bpembuih\b/, /\bpengocok\b/, /\bwhisk\b/, /\bbeater\b/],
  },
  {
    id: 'blender_chopper',
    dim: 25,
    weight: 4.2,
    patterns: [/\bblender\b/, /\bjuicer\b/, /\bchopper\b/, /\bfood\s+processor\b/],
  },
  {
    id: 'kettle_teko',
    dim: 26,
    weight: 4.0,
    patterns: [/\bteko\b/, /\bkettle\b/, /\bgooseneck\b/, /\bleher\s+angsa\b/],
  },
  {
    id: 'cookware',
    dim: 27,
    weight: 4.0,
    patterns: [/\bpanci\b/, /\bwajan\b/, /\bteflon\b/, /\bfrypan\b/, /\brice\s+cooker\b/, /\bair\s+fryer\b/, /\boven\b/, /\bkompor\b/, /\bpisau\b/],
  },
  {
    id: 'tumbler_botol',
    dim: 28,
    weight: 4.0,
    patterns: [/\btumbler\b/, /\bthermos\b/, /\btermos\b/, /\bbotol\s+minum\b/],
  },
  {
    id: 'dapur_domain',
    dim: 29,
    weight: 1.5,
    patterns: [/\bdapur\b/, /\bkitchen\b/, /\bmasak\b/, /\bcooking\b/, /\bseduh\b/, /\bbrewing\b/],
  },

  // Electronics & Gadgets
  {
    id: 'smartphone_device',
    dim: 32,
    weight: 4.0,
    patterns: [/\bhp\b/, /\biphone\b/, /\bgalaxy\b/, /\bredmi\b/, /\bpoco\b/, /\brealme\b/, /\boppo\b/, /\bvivo\b/, /\bxiaomi\b/, /\bsamsung\b/],
  },
  {
    id: 'laptop_tablet',
    dim: 33,
    weight: 4.2,
    patterns: [/\blaptop\b/, /\bnotebook\b/, /\bmacbook\b/, /\btablet\b/, /\bipad\b/],
  },
  {
    id: 'audio_device',
    dim: 34,
    weight: 4.0,
    patterns: [/\btws\b/, /\bearphone\b/, /\bheadset\b/, /\bheadphone\b/, /\bearbuds\b/, /\bairpods\b/, /\bspeaker\b/],
  },
  {
    id: 'charger_power',
    dim: 35,
    weight: 4.0,
    patterns: [/\bcharger\b/, /\badaptor\b/, /\badapter\b/, /\bcasan\b/],
  },
  {
    id: 'powerbank_device',
    dim: 39,
    weight: 4.2,
    patterns: [/\bpowerbank\b/, /\bpower\s+bank\b/],
  },
  {
    id: 'tongsis_holder',
    dim: 36,
    weight: 4.0,
    patterns: [/\btongsis\b/, /\btripod\b/, /\bselfie\s+stick\b/, /\betoll\b/, /\btongkat\b/, /\bholder\b/],
  },
  {
    id: 'computer_periph',
    dim: 37,
    weight: 4.0,
    patterns: [/\bkeyboard\b/, /\bmouse\b/, /\bmonitor\b/, /\bssd\b/, /\bflashdisk\b/, /\bwebcam\b/, /\bprinter\b/, /\brouter\b/],
  },
  {
    id: 'elektronik_domain',
    dim: 38,
    weight: 1.6,
    patterns: [/\belektronik\b/, /\bgadget\b/, /\bwireless\b/, /\bbluetooth\b/, /\bportable\b/, /\busb\b/, /\btype\s+c\b/, /\bfast\s+charging\b/],
  },

  // Beauty & Personal Care
  {
    id: 'serum_skincare',
    dim: 42,
    weight: 4.0,
    patterns: [/\bserum\b/, /\bampoule\b/, /\bessence\b/, /\bniacinamide\b/, /\bretinol\b/, /\bhyaluronic\b/],
  },
  {
    id: 'sunscreen',
    dim: 43,
    weight: 4.2,
    patterns: [/\bsunscreen\b/, /\bsunblock\b/, /\btabir\s+surya\b/, /\bspf\b/],
  },
  {
    id: 'cleanser_toner',
    dim: 44,
    weight: 4.0,
    patterns: [/\bfacial\s+wash\b/, /\bface\s+wash\b/, /\bsabun\s+wajah\b/, /\bcleanser\b/, /\bmicellar\b/, /\btoner\b/],
  },
  {
    id: 'moisturizer',
    dim: 45,
    weight: 3.8,
    patterns: [/\bmoisturizer\b/, /\bpelembab\b/, /\bcream\b/, /\bkrim\b/, /\bskincare\b/],
  },
  {
    id: 'makeup',
    dim: 46,
    weight: 4.0,
    patterns: [/\blipstik\b/, /\blipstick\b/, /\blip\s+tint\b/, /\bcushion\b/, /\bfoundation\b/, /\bbedak\b/, /\bmascara\b/, /\beyeliner\b/, /\bblush\b/],
  },
  {
    id: 'parfum',
    dim: 47,
    weight: 4.0,
    patterns: [/\bparfum\b/, /\bperfume\b/, /\bedp\b/, /\bcologne\b/, /\bbody\s+mist\b/],
  },
  {
    id: 'body_hair_care',
    dim: 48,
    weight: 3.8,
    patterns: [/\bshampoo\b/, /\bsampo\b/, /\bconditioner\b/, /\bsabun\b/, /\bbody\s+lotion\b/, /\bdeodorant\b/, /\bpasta\s+gigi\b/],
  },
  {
    id: 'kecantikan_domain',
    dim: 49,
    weight: 1.6,
    patterns: [/\bkecantikan\b/, /\bkosmetik\b/, /\bbeauty\b/, /\bwajah\b/, /\bkulit\b/, /\bglowing\b/],
  },

  // Food & Beverages
  {
    id: 'snack_food',
    dim: 54,
    weight: 4.0,
    patterns: [/\bsnack\b/, /\bcemilan\b/, /\bkeripik\b/, /\bkripik\b/, /\bbiskuit\b/, /\bkue\b/, /\bcoklat\b/, /\bchocolate\b/, /\bkacang\b/, /\bkurma\b/, /\babon\b/, /\bsambal\b/, /\bmakanan\b/],
  },
  {
    id: 'beverage_tea',
    dim: 55,
    weight: 3.8,
    patterns: [/\bteh\b/, /\btea\b/, /\bmatcha\b/, /\bsusu\b/, /\bmilk\b/, /\bmadu\b/, /\bhoney\b/, /\bsirup\b/, /\bminuman\b/],
  },
  {
    id: 'seasoning_pantry',
    dim: 56,
    weight: 3.6,
    patterns: [/\bbumbu\b/, /\bmie\b/, /\bberas\b/, /\bminyak\s+goreng\b/, /\bgula\b/, /\btepung\b/, /\bkeju\b/],
  },

  // Handicrafts & Home Decor
  {
    id: 'handicraft',
    dim: 60,
    weight: 4.2,
    patterns: [/\bkerajinan\b/, /\bhandmade\b/, /\banyaman\b/, /\brotan\b/, /\bbambu\b/, /\bukir\b/, /\bkayu\s+jati\b/, /\bmacrame\b/, /\bgerabah\b/, /\btembikar\b/, /\bsouvenir\b/, /\bkriya\b/],
  },
  {
    id: 'home_decor',
    dim: 61,
    weight: 3.6,
    patterns: [/\bvas\b/, /\bpatung\b/, /\bhiasan\b/, /\bdekorasi\b/, /\blukisan\b/, /\bbunga\s+kering\b/, /\bkeranjang\b/],
  },

  // Accessories / Refill cues (so accessories cluster cleanly when both are accessories)
  {
    id: 'accessory_filter',
    dim: 66,
    weight: 3.5,
    patterns: [/\bkertas\s+filter\b/, /\bpaper\s+filter\b/, /\bfilter\s+kertas\b/, /\bkertas\s+saring\b/],
  },
  {
    id: 'accessory_case',
    dim: 67,
    weight: 3.5,
    patterns: [/\bcasing\b/, /\bsoftcase\b/, /\bhardcase\b/, /\btempered\s+glass\b/, /\banti\s+gores\b/],
  },
  {
    id: 'accessory_refill',
    dim: 68,
    weight: 3.5,
    patterns: [/\brefill\b/, /\bisi\s+ulang\b/],
  },
  {
    id: 'accessory_cable',
    dim: 69,
    weight: 3.5,
    patterns: [/\bkabel\b/, /\bcable\b/],
  },

  // Soft demographics
  {
    id: 'demo_men',
    dim: 74,
    weight: 0.7,
    patterns: [/\bpria\b/, /\bcowok\b/, /\bmen\b/],
  },
  {
    id: 'demo_women',
    dim: 75,
    weight: 0.7,
    patterns: [/\bwanita\b/, /\bcewek\b/, /\bwomen\b/],
  },
];

const EMBEDDING_STOPWORDS = new Set([
  'dan',
  'atau',
  'untuk',
  'dengan',
  'yang',
  'di',
  'ke',
  'dari',
  'buat',
  'isi',
  'paket',
  'set',
  'pack',
  'pak',
  'pasang',
  'psg',
  'pasg',
  'pcs',
  'pieces',
  'lembar',
  'lbr',
  'size',
  'ukuran',
  'model',
  'tipe',
  'type',
  'free',
  'bonus',
  'gratis',
]);

// Canonical token mapping for cross-lingual overlap calculation
const CANONICAL_TOKEN_MAP: Record<string, string> = {
  sport: 'olahraga',
  sports: 'olahraga',
  sock: 'kaos_kaki',
  socks: 'kaos_kaki',
  coffee: 'kopi',
  ceramic: 'keramik',
  porcelain: 'keramik',
  glass: 'kaca',
  cotton: 'katun',
  sneaker: 'sneakers',
  handphone: 'hp',
  smartphone: 'hp',
  beans: 'biji',
  bean: 'biji',
  ground: 'bubuk',
  milk: 'susu',
  tea: 'teh',
  honey: 'madu',
  perfume: 'parfum',
  adapter: 'adaptor',
  cable: 'kabel',
  gram: 'gr',
  pengocok: 'mixer',
  whisk: 'mixer',
  watt: 'w',
};

const embeddingCache = new Map<string, number[]>();

function fnv1aHash(str: string, seed = 2166136261): number {
  let hash = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

function l2Normalize(vec: number[]): number[] {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm <= 1e-12) return vec;
  return vec.map((v) => v / norm);
}

const BONUS_FREEBIE_REGEX =
  /\b(?:bonus|free|gratis|plus|\+)\s+(?:kertas\s+filter|paper\s+filter|filter\s+kertas|kertas\s+saring|case|casing|softcase|hardcase|tempered\s+glass|anti\s+gores|kabel|sendok|tutup|strap|refill)\b[^,;.]*/g;

function extractCanonicalTokens(title: string): string[] {
  const norm = normalizeProductTitle(title);
  const cleanedText = norm.normalizedText.replace(BONUS_FREEBIE_REGEX, ' ').replace(/\s+/g, ' ').trim();
  const coreTokens = cleanedText.split(/\s+/).filter((t) => norm.coreTokens.includes(t));
  const tokens = new Set<string>();

  // Add matched concept cluster IDs as canonical concepts
  for (const cluster of CONCEPT_CLUSTERS) {
    if (cluster.id.startsWith('demo_')) continue;
    if (cluster.patterns.some((p) => p.test(cleanedText))) {
      tokens.add(`concept:${cluster.id}`);
    }
  }

  for (const rawTok of coreTokens) {
    if (EMBEDDING_STOPWORDS.has(rawTok)) continue;
    // Skip standalone pack counts and pure measurement tokens so 250gr vs 250 gram, 350w vs 350 watt normalize cleanly
    if (/^\d+(?:\.\d+)?$/.test(rawTok)) continue;
    if (/^\d+(?:\.\d+)?(?:gr|gram|g|kg|ml|l|liter|ltr|w|watt|mah|pcs|psg|pasg|lbr)$/.test(rawTok)) continue;
    if (
      rawTok === 'gr' ||
      rawTok === 'gram' ||
      rawTok === 'kg' ||
      rawTok === 'ml' ||
      rawTok === 'liter' ||
      rawTok === 'watt' ||
      rawTok === 'w'
    ) {
      continue;
    }

    const mapped = CANONICAL_TOKEN_MAP[rawTok] ?? rawTok;
    // Avoid adding both "kaos" and "kaki" separately when kaos_kaki is already present
    if ((mapped === 'kaos' || mapped === 'kaki') && tokens.has('concept:kaos_kaki')) {
      continue;
    }
    tokens.add(mapped);
  }

  return Array.from(tokens);
}

/**
 * Computes a deterministic 384-dimensional L2-normalized semantic vector for a product title,
 * combining Indonesian/English e-commerce concept clusters (0..127), IDF-weighted token hashing
 * (128..255), and character n-gram hashing (256..383). Results are LRU-cached in memory.
 */
export function embedProductTitle(title: string): number[] {
  const cacheKey = title.trim().toLowerCase();
  const cached = embeddingCache.get(cacheKey);
  if (cached) {
    // Refresh LRU order
    embeddingCache.delete(cacheKey);
    embeddingCache.set(cacheKey, cached);
    return cached;
  }

  const vec = new Array<number>(EMBEDDING_DIM).fill(0);
  const norm = normalizeProductTitle(title);
  const normalizedText = norm.normalizedText.replace(BONUS_FREEBIE_REGEX, ' ').replace(/\s+/g, ' ').trim();
  const coreTokens = normalizedText.split(/\s+/).filter((t) => norm.coreTokens.includes(t));

  // 1. Dimensions 0..127: Curated multilingual e-commerce semantic concept clusters
  for (const cluster of CONCEPT_CLUSTERS) {
    if (cluster.patterns.some((re) => re.test(normalizedText))) {
      vec[cluster.dim] += cluster.weight;
      // Add secondary harmonic projection in 80..127 to enrich cluster geometry
      const secondaryDim = 80 + (cluster.dim % 48);
      vec[secondaryDim] += cluster.weight * 0.45;
    }
  }

  // 2. Dimensions 128..255: Word & canonical token projection
  const semanticTokens = coreTokens.filter(
    (t) =>
      !EMBEDDING_STOPWORDS.has(t) &&
      !/^\d+$/.test(t) &&
      !/^\d+(?:gr|gram|g|kg|ml|l|liter|w|watt|mah|pcs|psg|lbr)$/.test(t) &&
      t !== 'gr' &&
      t !== 'gram' &&
      t !== 'kg' &&
      t !== 'ml' &&
      t !== 'liter' &&
      t !== 'watt' &&
      t !== 'w',
  );

  for (const tok of semanticTokens) {
    const canon = CANONICAL_TOKEN_MAP[tok] ?? tok;
    const tokenWeight = canon.length >= 5 ? 1.35 : 1.0;

    for (let k = 0; k < 4; k++) {
      const h = fnv1aHash(canon, 0x811c9dc5 + k * 0x9e3779b9);
      const dim = 128 + (h % 128);
      const sign = (h & 1) === 0 ? 1 : -1;
      vec[dim] += sign * tokenWeight * (k === 0 ? 1.0 : 0.65);
    }
  }

  // 3. Dimensions 256..383: Character 3-gram & 4-gram projection for typo resilience
  const charBase = semanticTokens.map((t) => CANONICAL_TOKEN_MAP[t] ?? t).join(' ');
  const padded = ` ${charBase} `;
  for (let n = 3; n <= 4; n++) {
    for (let i = 0; i <= padded.length - n; i++) {
      const gram = padded.slice(i, i + n);
      if (gram.trim().length < 2) continue;
      const h = fnv1aHash(gram, 0x243f6a88 + n * 131);
      const dim = 256 + (h % 128);
      const sign = (h & 1) === 0 ? 1 : -1;
      vec[dim] += sign * 0.35;
    }
  }

  const normalizedVec = l2Normalize(vec);

  if (embeddingCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = embeddingCache.keys().next().value;
    if (oldestKey !== undefined) {
      embeddingCache.delete(oldestKey);
    }
  }
  embeddingCache.set(cacheKey, normalizedVec);

  return normalizedVec;
}

/**
 * Computes cosine similarity between two L2-normalized vectors in [-1, 1] (clamped to [0, 1] for non-negative overlap).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const len = Math.min(vecA.length, vecB.length);
  if (len === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA <= 1e-12 || normB <= 1e-12) return 0;
  return Math.max(0, Math.min(1, dot / (Math.sqrt(normA) * Math.sqrt(normB))));
}

/**
 * Computes hybrid semantic similarity between a target title and a candidate title in [0, 1].
 * Combines 384-dim embedding cosine similarity with canonical Indonesian/English concept overlap.
 */
export function computeSemanticSimilarity(targetTitle: string, candidateTitle: string): number {
  const vecA = embedProductTitle(targetTitle);
  const vecB = embedProductTitle(candidateTitle);
  const cos = cosineSimilarity(vecA, vecB);

  const tokensA = extractCanonicalTokens(targetTitle);
  const tokensB = extractCanonicalTokens(candidateTitle);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return cos;
  }

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const tok of setA) {
    if (setB.has(tok)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  const jaccard = union > 0 ? intersection / union : 0;
  const targetRecall = intersection / setA.size;

  // Blend embedding similarity with canonical concept recall/jaccard
  const score = 0.65 * cos + 0.2 * targetRecall + 0.15 * jaccard;
  return Math.max(0, Math.min(1, Math.round(score * 10000) / 10000));
}

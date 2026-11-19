import { cosineSimilarity, embedProductTitle } from './embedder.js';
import { normalizeProductTitle } from './normalizer.js';

export const ML_OHE_CATEGORIES = [
  'Elektronik',
  'Fashion',
  'Kecantikan',
  'Kerajinan',
  'Makanan',
] as const;

export type MlOheCategory = (typeof ML_OHE_CATEGORIES)[number];

export interface CategoryClassification {
  modelCategory: MlOheCategory;
  displayCategory: string;
  confidence: number;
}

interface SubCategoryProfile {
  displayCategory: string;
  modelCategory: MlOheCategory;
  prototypes: string[];
  boostPatterns: RegExp[];
}

const SUBCATEGORY_PROFILES: SubCategoryProfile[] = [
  {
    displayCategory: 'Fashion & Kaos Kaki Sport',
    modelCategory: 'Fashion',
    prototypes: [
      'Kaos Kaki Olahraga Sport Panjang Tebal',
      'Kaos Kaki Ankle Running Gym Katun',
      'Kaus Kaki Basket Bola Futsal',
    ],
    boostPatterns: [/\bkaos\s+kaki\b/, /\bsocks?\b/],
  },
  {
    displayCategory: 'Fashion & Sepatu Pria',
    modelCategory: 'Fashion',
    prototypes: [
      'Sepatu Sneakers Olahraga Lari Running Pria',
      'Sepatu Kets Kasual Kulit Boots',
      'Sandal Slop Gunung Sport Ringan',
    ],
    boostPatterns: [/\bsepatu\b/, /\bsneakers?\b/, /\bkets\b/, /\bsandal\b/, /\bboots?\b/],
  },
  {
    displayCategory: 'Fashion & Pakaian Pria',
    modelCategory: 'Fashion',
    prototypes: [
      'Kaos Polos Katun Combed 30s Lengan Pendek',
      'Kemeja Batik Lengan Panjang Pria Slimfit',
      'Jaket Hoodie Sweater Celana Jeans Chino',
      'Hijab Gamis Kerudung Pashmina Wanita',
    ],
    boostPatterns: [
      /\bkaos(?!\s+kaki)\b/,
      /\bbaju\b/,
      /\bkemeja\b/,
      /\bbatik\b/,
      /\bjaket\b/,
      /\bhoodie\b/,
      /\bcelana\b/,
      /\bjeans\b/,
      /\bgamis\b/,
      /\bhijab\b/,
    ],
  },
  {
    displayCategory: 'Fashion & Aksesoris',
    modelCategory: 'Fashion',
    prototypes: [
      'Tas Ransel Backpack Kulit Dompet Pria',
      'Jam Tangan Analog Digital Strap Kulit',
      'Topi Baseball Ikat Pinggang Kacamata Fashion',
    ],
    boostPatterns: [/\btas\b/, /\bransel\b/, /\bdompet\b/, /\bjam\s+tangan\b/],
  },
  {
    displayCategory: 'Peralatan Dapur & Mixer',
    modelCategory: 'Elektronik',
    prototypes: [
      'Electric Milk Frother Hand Mixer Pengocok Kopi',
      'Blender Juicer Chopper Elektrik Dapur',
      'Air Fryer Oven Listrik Rice Cooker Digital',
    ],
    boostPatterns: [
      /\bmixer\b/,
      /\bfrother\b/,
      /\bfoam\b/,
      /\bbeater\b/,
      /\bblender\b/,
      /\bchopper\b/,
      /\bair\s+fryer\b/,
      /\brice\s+cooker\b/,
    ],
  },
  {
    displayCategory: 'Aksesori Mobil & Gadget',
    modelCategory: 'Elektronik',
    prototypes: [
      'Tongsis Tripod Bluetooth Selfie Stick Holder HP',
      'Tongkat E-Toll Kartu Tol Mobil',
      'Car Charger Adaptor Kabel USB Type C Fast Charging',
    ],
    boostPatterns: [/\btongsis\b/, /\betoll\b/, /\btongkat\b/, /\btripod\b/, /\bholder\b/],
  },
  {
    displayCategory: 'Elektronik & Gadget',
    modelCategory: 'Elektronik',
    prototypes: [
      'Smartphone HP Samsung Galaxy 5G 256GB',
      'Earphone TWS Bluetooth Wireless Headset Bass',
      'Laptop Notebook SSD Keyboard Mechanical Mouse Wireless',
      'Powerbank Fast Charging Charger USB C',
    ],
    boostPatterns: [
      /\bsamsung\b/,
      /\biphone\b/,
      /\bxiaomi\b/,
      /\boppo\b/,
      /\bvivo\b/,
      /\bhp\b/,
      /\blaptop\b/,
      /\btws\b/,
      /\bearphone\b/,
      /\bheadset\b/,
      /\bcharger\b/,
      /\bpowerbank\b/,
      /\bkeyboard\b/,
      /\bmouse\b/,
      /\bssd\b/,
      /\bsmartwatch\b/,
      /\b\d+\s*(?:gb|tb)\b/,
    ],
  },
  {
    displayCategory: 'Peralatan Kopi & Dapur',
    modelCategory: 'Kerajinan',
    prototypes: [
      'Hario V60 Ceramic Coffee Dripper Keramik Size 02',
      'Kertas Filter Kopi V60 Paper Filter Seduh Manual',
      'Server Teko Kaca Borosilikat Gooseneck Kettle Manual',
    ],
    boostPatterns: [/\bdripper\b/, /\bv60\b/, /\bhario\b/, /\bkertas\s+filter\b/, /\bfrench\s+press\b/, /\bgooseneck\b/],
  },
  {
    displayCategory: 'Kerajinan & Rumah Tangga',
    modelCategory: 'Kerajinan',
    prototypes: [
      'Kerajinan Anyaman Rotan Bambu Keranjang Handmade',
      'Vas Bunga Gerabah Tembikar Tanah Liat Dekorasi',
      'Ukiran Kayu Jati Souvenir Hiasan Dinding Macrame',
    ],
    boostPatterns: [
      /\bkerajinan\b/,
      /\bhandmade\b/,
      /\banyaman\b/,
      /\brotan\b/,
      /\bbambu\b/,
      /\bukir\b/,
      /\bmacrame\b/,
      /\bgerabah\b/,
      /\btembikar\b/,
      /\bsouvenir\b/,
      /\bvas\b/,
    ],
  },
  {
    displayCategory: 'Kecantikan & Perawatan Diri',
    modelCategory: 'Kecantikan',
    prototypes: [
      'Serum Wajah Niacinamide Brightening Skincare Glowing',
      'Sunscreen Tabir Surya SPF 50 Pelembab Moisturizer',
      'Facial Wash Toner Micellar Water Pembersih Wajah',
      'Lipstik Matte Cushion Bedak Parfum EDP Shampoo',
    ],
    boostPatterns: [
      /\bserum\b/,
      /\bsunscreen\b/,
      /\btabir\s+surya\b/,
      /\bspf\b/,
      /\bmoisturizer\b/,
      /\bpelembab\b/,
      /\bfacial\s+wash\b/,
      /\btoner\b/,
      /\bskincare\b/,
      /\blipstik\b/,
      /\bcushion\b/,
      /\bparfum\b/,
      /\bshampoo\b/,
      /\bsabun\b/,
      /\bkecantikan\b/,
    ],
  },
  {
    displayCategory: 'Makanan & Minuman',
    modelCategory: 'Makanan',
    prototypes: [
      'Biji Kopi Arabika Aceh Gayo Roasted Coffee Beans',
      'Keripik Pisang Coklat Snack Cemilan Renyah Gurih',
      'Teh Hijau Matcha Bubuk Madu Hutan Murni Susu',
      'Sambal Roa Abon Sapi Bumbu Dapur Kue Kering Kurma',
    ],
    boostPatterns: [
      /\barabika\b/,
      /\brobusta\b/,
      /\bgayo\b/,
      /\bbiji\s+kopi\b/,
      /\bkeripik\b/,
      /\bkripik\b/,
      /\bsnack\b/,
      /\bcemilan\b/,
      /\bmadu\b/,
      /\bteh\b/,
      /\bmatcha\b/,
      /\bsambal\b/,
      /\bkurma\b/,
      /\bkue\b/,
      /\bcoklat\b/,
      /\bmakanan\b/,
    ],
  },
];

interface CompiledProfile {
  displayCategory: string;
  modelCategory: MlOheCategory;
  centroid: number[];
  boostPatterns: RegExp[];
}

let compiledProfiles: CompiledProfile[] | null = null;

function computeCentroid(prototypes: string[]): number[] {
  const vecs = prototypes.map((p) => embedProductTitle(p));
  const dim = vecs[0].length;
  const sum = new Array<number>(dim).fill(0);
  for (const v of vecs) {
    for (let i = 0; i < dim; i++) {
      sum[i] += v[i];
    }
  }
  let normSq = 0;
  for (let i = 0; i < dim; i++) {
    normSq += sum[i] * sum[i];
  }
  const norm = Math.sqrt(normSq);
  return norm > 1e-12 ? sum.map((x) => x / norm) : sum;
}

function getProfiles(): CompiledProfile[] {
  if (!compiledProfiles) {
    compiledProfiles = SUBCATEGORY_PROFILES.map((profile) => ({
      displayCategory: profile.displayCategory,
      modelCategory: profile.modelCategory,
      centroid: computeCentroid(profile.prototypes),
      boostPatterns: profile.boostPatterns,
    }));
  }
  return compiledProfiles;
}

const DISPLAY_TO_MODEL_MAP: Record<string, MlOheCategory> = {
  'fashion & kaos kaki sport': 'Fashion',
  'fashion & sepatu pria': 'Fashion',
  'fashion & pakaian pria': 'Fashion',
  'fashion & aksesoris': 'Fashion',
  'fashion & consumer goods': 'Fashion',
  'peralatan dapur & mixer': 'Elektronik',
  'aksesori mobil & gadget': 'Elektronik',
  'elektronik & gadget': 'Elektronik',
  'peralatan kopi & dapur': 'Kerajinan',
  'kerajinan & rumah tangga': 'Kerajinan',
  'kecantikan & perawatan diri': 'Kecantikan',
  'makanan & minuman': 'Makanan',
};

/**
 * Classifies a product title into both a rich UI `displayCategory` and a standardized
 * `modelCategory` guaranteed to belong to `ML_OHE_CATEGORIES` in `ml_model_params.json`,
 * using nearest-centroid cosine similarity in 384-dim semantic space plus domain cue boosts.
 */
export function classifyProductCategory(title: string): CategoryClassification {
  const trimmed = (title || '').trim();
  const lower = trimmed.toLowerCase();

  // Direct canonical category match
  for (const cat of ML_OHE_CATEGORIES) {
    if (cat.toLowerCase() === lower) {
      return {
        modelCategory: cat,
        displayCategory: cat,
        confidence: 1,
      };
    }
  }

  // Direct displayCategory match
  if (DISPLAY_TO_MODEL_MAP[lower]) {
    return {
      modelCategory: DISPLAY_TO_MODEL_MAP[lower],
      displayCategory: trimmed,
      confidence: 0.98,
    };
  }

  const queryVec = embedProductTitle(title);
  const { normalizedText } = normalizeProductTitle(title);
  const profiles = getProfiles();

  let bestScore = -1;
  let secondBest = -1;
  let bestProfile: CompiledProfile = profiles[2]; // Fashion default fallback

  for (const profile of profiles) {
    const sim = cosineSimilarity(queryVec, profile.centroid);
    let boost = 0;
    for (const pattern of profile.boostPatterns) {
      if (pattern.test(normalizedText)) {
        boost += 0.25;
      }
    }
    // Cap total boost so multi-match doesn't dwarf genuine vector similarity
    const score = sim + Math.min(0.45, boost);

    if (score > bestScore) {
      secondBest = bestScore;
      bestScore = score;
      bestProfile = profile;
    } else if (score > secondBest) {
      secondBest = score;
    }
  }

  // Coffee beans vs brewer disambiguation: ensure roasted/ground coffee maps to Makanan
  if (
    /\b(?:kopi|coffee)\b/.test(normalizedText) &&
    /\b(?:arabika|robusta|gayo|toraja|biji|beans?|bubuk|ground|roast)\b/.test(normalizedText) &&
    !/\b(?:dripper|v60|hario|kettle|grinder|filter|mesin)\b/.test(normalizedText)
  ) {
    return {
      modelCategory: 'Makanan',
      displayCategory: 'Makanan & Minuman',
      confidence: 0.92,
    };
  }

  // Fallback when no strong signal is found
  if (bestScore < 0.12) {
    return {
      modelCategory: 'Fashion',
      displayCategory: 'Fashion & Consumer Goods',
      confidence: 0.5,
    };
  }

  const margin = Math.max(0, bestScore - Math.max(0, secondBest));
  const confidence = Math.round(Math.min(0.99, Math.max(0.55, 0.58 + bestScore * 0.35 + margin * 0.4)) * 100) / 100;

  return {
    modelCategory: bestProfile.modelCategory,
    displayCategory: bestProfile.displayCategory,
    confidence,
  };
}

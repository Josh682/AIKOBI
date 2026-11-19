import { normalizeProductTitle } from './normalizer.js';

export interface ExtractedProductAttributes {
  packQuantity: number;
  netWeightGrams: number | null;
  unitWeightGrams: number | null;
  netVolumeMl: number | null;
  unitVolumeMl: number | null;
  storageGb: number | null;
  powerWatt: number | null;
  dimensionSpec: string | null;
  modelCodes: string[];
  isAccessoryOrRefill: boolean;
  accessoryType: string | null;
  cleanCoreTitle: string;
  searchQuery: string;
}

export interface AttributeCompatibilityResult {
  compatible: boolean;
  reason: string | null;
  penaltyScore: number;
}

const SEARCH_FILLER_WORDS = new Set([
  'dengan',
  'untuk',
  'yang',
  'dan',
  'atau',
  'dari',
  'buat',
  'model',
  'tipe',
  'type',
  'pria',
  'wanita',
  'unisex',
  'cewek',
  'cowok',
  'dewasa',
  'bisa',
  'free',
  'bonus',
  'gratis',
  'isi',
  'paket',
]);

const ACCESSORY_PATTERNS: Array<{ type: string; regex: RegExp }> = [
  { type: 'paper_filter', regex: /\b(?:kertas\s+filter|paper\s+filter|filter\s+kertas|kertas\s+saring|filter\s+paper)\b/ },
  { type: 'screen_protector', regex: /\b(?:tempered\s+glass|anti\s+gores|hydrogel|screen\s+protector)\b/ },
  { type: 'case', regex: /\b(?:casing|softcase|hardcase|flip\s+cover|case\s+hp|silikon\s+case|sarung\s+hp)\b/ },
  { type: 'refill', regex: /\b(?:refill|isi\s+ulang)\b/ },
  { type: 'cable', regex: /\b(?:kabel\s+(?:data|charger|usb|type|lightning)|usb\s+cable|charging\s+cable)\b/ },
  { type: 'strap', regex: /\b(?:strap\s+jam|tali\s+jam|watch\s+band)\b/ },
  { type: 'empty_box', regex: /\b(?:box\s+kosong|dus\s+kosong|kotak\s+kosong)\b/ },
  { type: 'sparepart', regex: /\b(?:sparepart|spare\s+part|suku\s+cadang|tutup\s+pengganti|replacement\s+(?:lid|cap|part))\b/ },
];

// Standalone accessory keywords checked only outside bonus/free clauses
const CONTEXTUAL_CASE_REGEX = /\b(?:case|silikon|tutup|kabel|strap)\b/;
const MAIN_UNIT_OVERRIDE_FOR_CASE = /\b(?:hp|smartphone|iphone|samsung|xiaomi|laptop|ipad|tablet|dripper|blender|mixer|botol|tumbler|jam\s+tangan|smartwatch)\b/;

const BONUS_CLAUSE_REGEX = /\b(?:bonus|free|gratis|plus|\+)\s+(?:kertas\s+filter|paper\s+filter|filter\s+kertas|kertas\s+saring|case|casing|softcase|hardcase|tempered\s+glass|anti\s+gores|kabel|sendok|tutup|strap|refill)\b[^,;.]*/g;

const DEVICE_CONTEXT_REGEX = /\b(?:hp|iphone|samsung|galaxy|xiaomi|redmi|poco|oppo|vivo|realme|ipad|macbook|laptop|asus|lenovo|acer|pixel|huawei|tablet|watch|airpods|buds|tws)\b/;

const V60_SIZE_CODES = new Set(['01', '02', '03']);
const FABRIC_GSM_CODES = new Set(['20s', '24s', '30s', '40s']);
const DEVICE_TIER_CODES = new Set(['pro', 'max', 'ultra', 'mini', 'plus', 'lite', 'fe', 'se']);

function toNumber(raw: string): number {
  return parseFloat(raw.replace(',', '.'));
}

function convertWeightToGrams(value: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u === 'kg' || u === 'kilogram') return Math.round(value * 1000 * 100) / 100;
  if (u === 'mg') return Math.round((value / 1000) * 1000) / 1000;
  return value;
}

function convertVolumeToMl(value: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u === 'l' || u === 'liter' || u === 'ltr') return Math.round(value * 1000 * 100) / 100;
  return value;
}

function detectAccessory(normalizedText: string): { isAccessory: boolean; accessoryType: string | null } {
  // Remove "bonus/free/gratis <accessory>" clauses so main units with freebies aren't misclassified
  const textWithoutBonus = normalizedText.replace(BONUS_CLAUSE_REGEX, ' ').replace(/\s+/g, ' ').trim();

  for (const { type, regex } of ACCESSORY_PATTERNS) {
    if (regex.test(textWithoutBonus)) {
      return { isAccessory: true, accessoryType: type };
    }
  }

  // Handle single-word accessory cues like "case" or "silikon" when title starts with them or lacks main unit anchor
  const firstTokens = textWithoutBonus.split(' ').slice(0, 3).join(' ');
  if (CONTEXTUAL_CASE_REGEX.test(firstTokens)) {
    const match = firstTokens.match(CONTEXTUAL_CASE_REGEX)?.[0] ?? 'sparepart';
    const typeMap: Record<string, string> = {
      case: 'case',
      silikon: 'case',
      kabel: 'cable',
      tutup: 'sparepart',
      strap: 'strap',
    };
    return { isAccessory: true, accessoryType: typeMap[match] ?? 'sparepart' };
  }

  // Also check if "tutup" or "kabel" appears prominently without a primary appliance
  if (/\b(?:kabel|tutup)\b/.test(textWithoutBonus) && !MAIN_UNIT_OVERRIDE_FOR_CASE.test(textWithoutBonus)) {
    const isCable = /\bkabel\b/.test(textWithoutBonus);
    return { isAccessory: true, accessoryType: isCable ? 'cable' : 'sparepart' };
  }

  return { isAccessory: false, accessoryType: null };
}

function extractModelCodes(normalizedText: string): string[] {
  const codes = new Set<string>();

  // Extract hyphenated v60-01, v60-02, etc.
  const v60Match = normalizedText.match(/\bv60(?:-|\s+)?(01|02|03)\b/);
  if (v60Match) {
    codes.add('v60');
    codes.add(v60Match[1]);
  } else if (/\bv60\b/.test(normalizedText)) {
    codes.add('v60');
  }

  // Size/edition codes 01 / 02 / 03 when near size, ukuran, dripper, filter, v60, hario
  if (/\b(?:v60|dripper|hario|size|ukuran|filter)\b/.test(normalizedText)) {
    const sizeMatches = normalizedText.matchAll(/\b(01|02|03)\b/g);
    for (const m of sizeMatches) {
      codes.add(m[1]);
    }
  }

  // Cotton combed gsm codes (20s, 24s, 30s, 40s)
  for (const m of normalizedText.matchAll(/\b(20s|24s|30s|40s)\b/g)) {
    codes.add(m[1]);
  }

  // Device tier codes
  for (const m of normalizedText.matchAll(/\b(pro|max|ultra|mini|plus|lite|fe|se)\b/g)) {
    codes.add(m[1]);
  }

  // Alphanumeric model identifiers like a54, s23, s24, m2, xm5, k1, etc.
  // Exclude known measurement/pack tokens like 250g, 500ml, 128gb, 3in1, 12pcs, 3psg, 24s, 1kg, 350w
  for (const m of normalizedText.matchAll(/\b([a-z]{1,4}\d{1,4}[a-z]?|\d{1,2}[a-z]{1,2}\d{1,2})\b/g)) {
    const token = m[1];
    if (
      /^\d+(?:kg|gr|g|mg|ml|l|ltr|gb|tb|w|watt|pcs|psg|pasg|lbr|cm|mm|s|in1)$/.test(token) ||
      /^\d+x\d+$/.test(token) ||
      /^\d+s$/.test(token)
    ) {
      continue;
    }
    codes.add(token);
  }

  return Array.from(codes).sort();
}

/**
 * Extracts structured attributes (pack quantity, normalized weight/volume/storage/power,
 * model codes, accessory classification, and search query) from an e-commerce product title.
 */
export function extractProductAttributes(title: string): ExtractedProductAttributes {
  const norm = normalizeProductTitle(title);
  const text = norm.normalizedText;
  const { isAccessory, accessoryType } = detectAccessory(text);

  // Strip bonus accessory phrases before extracting packQuantity so "Dripper Free 40 Lembar Filter" stays packQuantity=1
  const textForPack = isAccessory
    ? text
    : text.replace(BONUS_CLAUSE_REGEX, ' ').replace(/\s+/g, ' ').trim();

  let packQuantity = 1;
  let netWeightGrams: number | null = null;
  let unitWeightGrams: number | null = null;
  let netVolumeMl: number | null = null;
  let unitVolumeMl: number | null = null;

  // 1. Check multiplied weight/volume packs first: "250gr x 2" or "2 x 250gr"
  const weightSuffixMult = textForPack.match(
    /\b(\d+(?:[.,]\d+)?)\s*(kg|kilogram|gr|gram|g|mg)\s*[xX*]\s*(\d+)\b/,
  );
  const weightPrefixMult = textForPack.match(
    /\b(\d+)\s*[xX*]\s*(\d+(?:[.,]\d+)?)\s*(kg|kilogram|gr|gram|g|mg)\b/,
  );

  if (weightSuffixMult) {
    const unitVal = convertWeightToGrams(toNumber(weightSuffixMult[1]), weightSuffixMult[2]);
    const mult = parseInt(weightSuffixMult[3], 10);
    if (mult >= 1 && mult <= 500) {
      packQuantity = mult;
      unitWeightGrams = unitVal;
      netWeightGrams = Math.round(unitVal * mult * 100) / 100;
    }
  } else if (weightPrefixMult) {
    const mult = parseInt(weightPrefixMult[1], 10);
    const unitVal = convertWeightToGrams(toNumber(weightPrefixMult[2]), weightPrefixMult[3]);
    if (mult >= 1 && mult <= 500) {
      packQuantity = mult;
      unitWeightGrams = unitVal;
      netWeightGrams = Math.round(unitVal * mult * 100) / 100;
    }
  }

  const volSuffixMult = textForPack.match(
    /\b(\d+(?:[.,]\d+)?)\s*(ml|mililiter|l|liter|ltr)\s*[xX*]\s*(\d+)\b/,
  );
  const volPrefixMult = textForPack.match(
    /\b(\d+)\s*[xX*]\s*(\d+(?:[.,]\d+)?)\s*(ml|mililiter|l|liter|ltr)\b/,
  );

  if (volSuffixMult) {
    const unitVal = convertVolumeToMl(toNumber(volSuffixMult[1]), volSuffixMult[2]);
    const mult = parseInt(volSuffixMult[3], 10);
    if (mult >= 1 && mult <= 500) {
      packQuantity = mult;
      unitVolumeMl = unitVal;
      netVolumeMl = Math.round(unitVal * mult * 100) / 100;
    }
  } else if (volPrefixMult) {
    const mult = parseInt(volPrefixMult[1], 10);
    const unitVal = convertVolumeToMl(toNumber(volPrefixMult[2]), volPrefixMult[3]);
    if (mult >= 1 && mult <= 500) {
      packQuantity = mult;
      unitVolumeMl = unitVal;
      netVolumeMl = Math.round(unitVal * mult * 100) / 100;
    }
  }

  // 2. Standard single weight & volume extraction if not already set by multiplied pattern
  if (netWeightGrams === null) {
    const weightMatch = text.match(/\b(\d+(?:[.,]\d+)?)\s*(kg|kilogram|gr|gram|g|mg)\b/);
    if (weightMatch) {
      const grams = convertWeightToGrams(toNumber(weightMatch[1]), weightMatch[2]);
      if (grams > 0) {
        netWeightGrams = grams;
        unitWeightGrams = grams;
      }
    }
  }

  if (netVolumeMl === null) {
    const volMatch = text.match(/\b(\d+(?:[.,]\d+)?)\s*(ml|mililiter|l|liter|ltr)\b/);
    if (volMatch) {
      const ml = convertVolumeToMl(toNumber(volMatch[1]), volMatch[2]);
      if (ml > 0) {
        netVolumeMl = ml;
        unitVolumeMl = ml;
      }
    }
  }

  // 3. Explicit pack quantity patterns (if not already > 1 from multiplied weight/volume)
  if (packQuantity === 1) {
    const packSuffixMatch = textForPack.match(
      /\b(\d+)\s*(?:pasang|psg|pasg|pcs|pieces|lembar|lbr|sachet|botol|kaleng|roll|pak|pack|box)\b/,
    );
    const inOneMatch = textForPack.match(/\b(\d+)\s*(?:-|\s)?in(?:-|\s)?1\b/);
    const packPrefixMatch = textForPack.match(
      /\b(?:isi|paket|bundle|bundling|pack|pak|box|kotak|set)\s*(\d+)\b(?!\s*(?:gr|gram|g|kg|mg|ml|mililiter|l|liter|ltr|gb|tb|w|watt|cm|mm|v60|size|ukuran)\b)/,
    );

    if (packSuffixMatch && !packSuffixMatch[1].startsWith('0')) {
      const qty = parseInt(packSuffixMatch[1], 10);
      if (qty >= 1 && qty <= 1000) packQuantity = qty;
    } else if (inOneMatch && !inOneMatch[1].startsWith('0')) {
      const qty = parseInt(inOneMatch[1], 10);
      if (qty >= 2 && qty <= 50) packQuantity = qty;
    } else if (packPrefixMatch && !packPrefixMatch[1].startsWith('0')) {
      const qty = parseInt(packPrefixMatch[1], 10);
      if (qty >= 1 && qty <= 1000) packQuantity = qty;
    }
  }

  // If packQuantity > 1 and unitWeightGrams was extracted from single unit e.g. "Paket 2 Kopi 250gr"
  // check if weight was already multiplied; if not, keep total vs unit consistent
  if (packQuantity > 1 && netWeightGrams !== null && unitWeightGrams === netWeightGrams && !weightSuffixMult && !weightPrefixMult) {
    // Do not auto-multiply unless explicit xN syntax; keep unitWeightGrams clear
    unitWeightGrams = Math.round((netWeightGrams / packQuantity) * 100) / 100;
  }

  // 4. Storage capacity (GB/TB) - pick max so "8GB / 256GB" yields 256
  let storageGb: number | null = null;
  for (const m of text.matchAll(/\b(\d+)\s*(gb|tb)\b/g)) {
    const rawVal = parseInt(m[1], 10);
    const gb = m[2] === 'tb' ? rawVal * 1024 : rawVal;
    if (storageGb === null || gb > storageGb) {
      storageGb = gb;
    }
  }

  // 5. Power wattage
  let powerWatt: number | null = null;
  const wattMatch = text.match(/\b(\d+(?:[.,]\d+)?)\s*(?:watt|w)\b/);
  if (wattMatch) {
    powerWatt = toNumber(wattMatch[1]);
  }

  // 6. Dimension / size specification
  let dimensionSpec: string | null = null;
  const dimMatch =
    text.match(/\b(?:size|ukuran)\s*(01|02|03|xs|s|m|l|xl|xxl|2xl|3xl|\d+x\d+|\d{2})\b/) ||
    text.match(/\b(\d+\s*x\s*\d+(?:\s*(?:cm|mm))?)\b/);
  if (dimMatch) {
    dimensionSpec = dimMatch[1].replace(/\s+/g, '');
  }

  // 7. Model codes
  const modelCodes = extractModelCodes(text);

  // 8. High-precision search query (up to 6 meaningful tokens)
  const queryTokens = norm.coreTokens.filter((tok) => !SEARCH_FILLER_WORDS.has(tok) && tok.length > 0);
  const selectedTokens = (queryTokens.length >= 2 ? queryTokens : norm.coreTokens).slice(0, 6);
  const searchQuery = selectedTokens.join(' ').trim() || norm.cleanCoreTitle || title.trim();

  return {
    packQuantity,
    netWeightGrams,
    unitWeightGrams,
    netVolumeMl,
    unitVolumeMl,
    storageGb,
    powerWatt,
    dimensionSpec,
    modelCodes,
    isAccessoryOrRefill: isAccessory,
    accessoryType,
    cleanCoreTitle: norm.cleanCoreTitle,
    searchQuery,
  };
}

/**
 * Hard compatibility gate comparing structured product attributes between a target
 * product and a marketplace candidate. Rejects pack-quantity, weight/volume/storage,
 * accessory-vs-main-unit, and conflicting model-code mismatches.
 */
export function checkAttributeCompatibility(
  target: ExtractedProductAttributes,
  candidate: ExtractedProductAttributes,
): AttributeCompatibilityResult {
  // 1. Accessory/refill vs main unit gate
  if (target.isAccessoryOrRefill !== candidate.isAccessoryOrRefill) {
    return {
      compatible: false,
      reason: 'accessory_vs_main_unit_mismatch',
      penaltyScore: 1,
    };
  }
  if (target.isAccessoryOrRefill && candidate.isAccessoryOrRefill) {
    if (target.accessoryType && candidate.accessoryType && target.accessoryType !== candidate.accessoryType) {
      return {
        compatible: false,
        reason: 'accessory_type_mismatch',
        penaltyScore: 1,
      };
    }
  }

  // 2. Pack quantity gate
  if (target.packQuantity !== candidate.packQuantity) {
    return {
      compatible: false,
      reason: 'pack_quantity_mismatch',
      penaltyScore: 1,
    };
  }

  // 3. Weight gate (> 20% relative difference)
  if (target.netWeightGrams !== null && candidate.netWeightGrams !== null) {
    const maxW = Math.max(target.netWeightGrams, candidate.netWeightGrams);
    const diffRatio = Math.abs(target.netWeightGrams - candidate.netWeightGrams) / maxW;
    if (diffRatio > 0.2) {
      return {
        compatible: false,
        reason: 'weight_mismatch',
        penaltyScore: 1,
      };
    }
  }

  // 4. Volume gate (> 20% relative difference)
  if (target.netVolumeMl !== null && candidate.netVolumeMl !== null) {
    const maxV = Math.max(target.netVolumeMl, candidate.netVolumeMl);
    const diffRatio = Math.abs(target.netVolumeMl - candidate.netVolumeMl) / maxV;
    if (diffRatio > 0.2) {
      return {
        compatible: false,
        reason: 'volume_mismatch',
        penaltyScore: 1,
      };
    }
  }

  // 5. Storage gate (e.g. 128GB vs 256GB)
  if (target.storageGb !== null && candidate.storageGb !== null && target.storageGb !== candidate.storageGb) {
    return {
      compatible: false,
      reason: 'storage_mismatch',
      penaltyScore: 1,
    };
  }

  // 6. Mutually exclusive model / size / fabric / device tier codes
  const targetV60Sizes = target.modelCodes.filter((c) => V60_SIZE_CODES.has(c));
  const candV60Sizes = candidate.modelCodes.filter((c) => V60_SIZE_CODES.has(c));
  if (targetV60Sizes.length > 0 && candV60Sizes.length > 0) {
    const overlap = targetV60Sizes.some((c) => candV60Sizes.includes(c));
    if (!overlap) {
      return {
        compatible: false,
        reason: 'model_code_conflict',
        penaltyScore: 1,
      };
    }
  }

  const targetGsm = target.modelCodes.filter((c) => FABRIC_GSM_CODES.has(c));
  const candGsm = candidate.modelCodes.filter((c) => FABRIC_GSM_CODES.has(c));
  if (targetGsm.length > 0 && candGsm.length > 0) {
    const overlap = targetGsm.some((c) => candGsm.includes(c));
    if (!overlap) {
      return {
        compatible: false,
        reason: 'model_code_conflict',
        penaltyScore: 1,
      };
    }
  }

  // Device alphanumeric model codes (e.g. a54 vs a34, s23 vs s24)
  const isAlnumModel = (c: string) =>
    !V60_SIZE_CODES.has(c) &&
    !FABRIC_GSM_CODES.has(c) &&
    !DEVICE_TIER_CODES.has(c) &&
    /[a-z]/.test(c) &&
    /\d/.test(c);

  const targetAlnum = target.modelCodes.filter(isAlnumModel);
  const candAlnum = candidate.modelCodes.filter(isAlnumModel);
  if (targetAlnum.length > 0 && candAlnum.length > 0) {
    const hasCommonModel = targetAlnum.some((c) => candAlnum.includes(c));
    if (!hasCommonModel) {
      return {
        compatible: false,
        reason: 'model_code_conflict',
        penaltyScore: 1,
      };
    }
  }

  // Device tier conflict (e.g., Pro Max vs Pro vs regular) in electronics/device contexts
  const hasDeviceContext =
    DEVICE_CONTEXT_REGEX.test(target.cleanCoreTitle) ||
    DEVICE_CONTEXT_REGEX.test(candidate.cleanCoreTitle) ||
    target.storageGb !== null ||
    candidate.storageGb !== null;

  const targetTiers = target.modelCodes.filter((c) => DEVICE_TIER_CODES.has(c));
  const candTiers = candidate.modelCodes.filter((c) => DEVICE_TIER_CODES.has(c));
  if (hasDeviceContext && (targetTiers.length > 0 || candTiers.length > 0)) {
    const targetSig = targetTiers.join('+');
    const candSig = candTiers.join('+');
    if (targetSig !== candSig) {
      return {
        compatible: false,
        reason: 'model_code_conflict',
        penaltyScore: 1,
      };
    }
  }

  // Power wattage conflict (> 30% diff)
  let penaltyScore = 0;
  if (target.powerWatt !== null && candidate.powerWatt !== null) {
    const maxWatt = Math.max(target.powerWatt, candidate.powerWatt);
    const wattDiff = Math.abs(target.powerWatt - candidate.powerWatt) / maxWatt;
    if (wattDiff > 0.35) {
      return {
        compatible: false,
        reason: 'power_watt_mismatch',
        penaltyScore: 1,
      };
    }
    if (wattDiff > 0.1) {
      penaltyScore += 0.05;
    }
  }

  return {
    compatible: true,
    reason: null,
    penaltyScore,
  };
}

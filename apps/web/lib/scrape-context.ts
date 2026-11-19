export interface ScrapedCompetitor {
  nama: string;
  toko: string;
  city: string;
  harga: number;
  rating?: number;
  url: string;
  selisih_nominal: number;
  selisih_pct: number;
  is_cheaper: boolean;
  badge_selisih: string;
}

export interface ScrapedAnalysisData {
  produk: string;
  kategori: string;
  harga_toko: number;
  harga_pasar: number;
  status: string;
  confidence: number;
  rekomendasi: string;
  rentang_harga_wajar?: {
    min?: number;
    max?: number;
    min_pasar?: number;
    max_pasar?: number;
    wajar_min?: number;
    wajar_max?: number;
    harga_toko?: number;
    harga_pasar?: number;
    is_inside_zone?: boolean;
    status_zone?: string;
    ml_source?: string;
  };
  info_varian?: {
    ada_varian: boolean;
    harga_default?: number;
    min_varian: number;
    max_varian: number;
    total_varian: number;
    catatan: string;
  } | null;
  faktor?: Array<{ nama: string; pengaruh: number }>;
  produk_serupa?: ScrapedCompetitor[];
  kompetitor_lokal?: {
    kota_asal: string;
    is_exact_city: boolean;
    label_wilayah: string;
    badge_stat_label: string;
    total_ditemukan: number;
    insight: string;
    produk: ScrapedCompetitor[];
  };
  analisis_mendalam?: {
    analisis_harga?: {
      posisi_pasar: string;
      label_selisih: string;
      is_cheaper: boolean;
      selisih_persen: number;
      diff_from_mean: number;
      diff_from_min: number;
      diff_from_max: number;
      min_price: number;
      max_price: number;
      mean_price: number;
      penjelasan_posisi: string;
    };
    analisis_rentang?: {
      terendah: number;
      tertinggi: number;
      rata_rata: number;
      rentang_total: number;
      selisih_dari_terendah: number;
      selisih_dari_tertinggi: number;
      gap_pct_terendah: number;
      penyebab_perbedaan: string[];
      signifikansi_pembeli: {
        tingkat: string;
        analisis: string;
      };
      korelasi_penjualan: {
        kesimpulan: string;
        analisis: string;
      };
    };
    evaluasi_ulasan?: {
      rating_rata: number;
      total_ulasan: number;
      sentimen_positif: number;
      ringkasan_ulasan: string;
      hal_dipuji: string[];
      hal_diperbaiki: string[];
    };
    rekomendasi_penjual?: {
      strategi_harga: Array<{
        nama_opsi: string;
        target_harga: number;
        detail: string;
      }>;
      tindakan_operasional?: string[];
    };
  };
}

export interface StoredScrapeContext {
  sourceUrl: string;
  scrapedAt: string;
  data: ScrapedAnalysisData;
}

export interface PersistedChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  category?: string;
  followUps?: string[];
  isStreaming?: boolean;
}

const SCRAPE_STORAGE_KEY = 'aikobi-latest-scrape';
const CHAT_STORAGE_KEY = 'aikobi-chat-history';
const MAX_PERSISTED_MESSAGES = 50;

const scrapeListeners = new Set<() => void>();
let cachedScrapeRaw: string | null = null;
let cachedScrapeParsed: StoredScrapeContext | null = null;

const chatListeners = new Set<() => void>();
const EMPTY_CHAT_MESSAGES: PersistedChatMessage[] = [];
let cachedChatRaw: string | null = null;
let cachedChatParsed: PersistedChatMessage[] = EMPTY_CHAT_MESSAGES;

function notifyScrapeListeners(): void {
  scrapeListeners.forEach((listener) => listener());
}

function notifyChatListeners(): void {
  chatListeners.forEach((listener) => listener());
}

export function subscribeScrapeContext(listener: () => void): () => void {
  scrapeListeners.add(listener);
  if (typeof window === 'undefined') {
    return () => {
      scrapeListeners.delete(listener);
    };
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === SCRAPE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    scrapeListeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function saveLatestScrapeContext(sourceUrl: string, data: ScrapedAnalysisData): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredScrapeContext = {
      sourceUrl,
      scrapedAt: new Date().toISOString(),
      data,
    };
    const serialized = JSON.stringify(payload);
    window.localStorage.setItem(SCRAPE_STORAGE_KEY, serialized);
    cachedScrapeRaw = serialized;
    cachedScrapeParsed = payload;
    notifyScrapeListeners();
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function getLatestScrapeContext(): StoredScrapeContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SCRAPE_STORAGE_KEY);
    if (!raw) {
      cachedScrapeRaw = null;
      cachedScrapeParsed = null;
      return null;
    }
    if (raw === cachedScrapeRaw) {
      return cachedScrapeParsed;
    }
    const parsed = JSON.parse(raw) as StoredScrapeContext;
    if (!parsed?.data?.produk || typeof parsed.data.harga_toko !== 'number') {
      return null;
    }
    cachedScrapeRaw = raw;
    cachedScrapeParsed = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLatestScrapeContext(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SCRAPE_STORAGE_KEY);
    cachedScrapeRaw = null;
    cachedScrapeParsed = null;
    notifyScrapeListeners();
  } catch {
    // Ignore storage errors
  }
}

export function subscribeChatHistory(listener: () => void): () => void {
  chatListeners.add(listener);
  if (typeof window === 'undefined') {
    return () => {
      chatListeners.delete(listener);
    };
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === CHAT_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    chatListeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function getChatHistory(): PersistedChatMessage[] {
  if (typeof window === 'undefined') return EMPTY_CHAT_MESSAGES;
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      cachedChatRaw = null;
      cachedChatParsed = EMPTY_CHAT_MESSAGES;
      return EMPTY_CHAT_MESSAGES;
    }
    if (raw === cachedChatRaw) {
      return cachedChatParsed;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return EMPTY_CHAT_MESSAGES;
    }
    const sanitized: PersistedChatMessage[] = parsed
      .filter(
        (item): item is PersistedChatMessage =>
          Boolean(item) &&
          typeof item.id === 'string' &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.content === 'string' &&
          typeof item.timestamp === 'string',
      )
      .slice(-MAX_PERSISTED_MESSAGES)
      .map((item) => (item.isStreaming ? { ...item, isStreaming: false } : item));

    cachedChatRaw = raw;
    cachedChatParsed = sanitized.length > 0 ? sanitized : EMPTY_CHAT_MESSAGES;
    return cachedChatParsed;
  } catch {
    return EMPTY_CHAT_MESSAGES;
  }
}

export function saveChatHistory(
  updater:
    | PersistedChatMessage[]
    | ((prev: PersistedChatMessage[]) => PersistedChatMessage[]),
): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getChatHistory();
    const nextRaw = typeof updater === 'function' ? updater(current) : updater;
    const next = nextRaw.slice(-MAX_PERSISTED_MESSAGES);
    const serialized = JSON.stringify(next);
    window.localStorage.setItem(CHAT_STORAGE_KEY, serialized);
    cachedChatRaw = serialized;
    cachedChatParsed = next.length > 0 ? next : EMPTY_CHAT_MESSAGES;
    notifyChatListeners();
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function clearChatHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CHAT_STORAGE_KEY);
    cachedChatRaw = null;
    cachedChatParsed = EMPTY_CHAT_MESSAGES;
    notifyChatListeners();
  } catch {
    // Ignore storage errors
  }
}

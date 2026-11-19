import { GoogleGenAI } from '@google/genai';

if (typeof window !== 'undefined') {
  throw new Error('lib/gemini.ts hanya boleh dijalankan di sisi server.');
}

const DEFAULT_FLASH_MODEL = 'gemini-3.8-flash';
const FLASH_FALLBACK_CHAIN = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
] as const;

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi pada environment server.');
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

/**
 * Enforce Flash-tier model only as requested.
 * Accepts GEMINI_MODEL env override only when it resolves to a Gemini Flash model.
 */
export function getFlashModelCandidates(): string[] {
  const rawEnvModel = process.env.GEMINI_MODEL?.trim();
  const normalizedEnv = rawEnvModel?.replace(/^models\//i, '');
  const primary =
    normalizedEnv && normalizedEnv.toLowerCase().includes('flash')
      ? normalizedEnv
      : DEFAULT_FLASH_MODEL;

  const unique = new Set<string>([primary, ...FLASH_FALLBACK_CHAIN]);
  return Array.from(unique);
}

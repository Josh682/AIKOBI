import { NextRequest } from 'next/server';
import { getFlashModelCandidates, getGeminiClient } from '@/lib/gemini';
import { buildKobiSystemInstruction, formatScrapedContext } from '@/lib/kobi-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface IncomingChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 25;

const ipRequestLog = new Map<string, number[]>();

function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequestLog.get(clientKey) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
  );
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRequestLog.set(clientKey, timestamps);
    return true;
  }
  timestamps.push(now);
  ipRequestLog.set(clientKey, timestamps);

  // Periodic cleanup to prevent unbounded map growth
  if (ipRequestLog.size > 1000) {
    for (const [key, vals] of ipRequestLog.entries()) {
      if (vals.every((ts) => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        ipRequestLog.delete(key);
      }
    }
  }
  return false;
}

function getFriendlyErrorMessage(err: unknown): string {
  const status = typeof err === 'object' && err !== null && 'status' in err
    ? Number((err as { status?: unknown }).status)
    : undefined;
  const rawMessage = err instanceof Error ? err.message : '';

  if (status === 429 || rawMessage.includes('429') || rawMessage.toLowerCase().includes('quota')) {
    return 'Batas kuota permintaan AI sementara tercapai. Silakan tunggu beberapa saat lalu coba lagi.';
  }
  if (status === 401 || status === 403 || rawMessage.toLowerCase().includes('api key')) {
    return 'Konfigurasi kunci layanan AI tidak valid atau belum memiliki akses. Hubungi administrator.';
  }
  if (status === 503 || rawMessage.includes('503') || rawMessage.toLowerCase().includes('unavailable')) {
    return 'Server model Gemini Flash sedang sibuk. Silakan coba kirim ulang pesan Anda beberapa saat lagi.';
  }
  return 'Terjadi kendala saat menghubungi layanan KOBI AI. Silakan coba kembali.';
}

function isRetryableModelError(err: unknown): boolean {
  const status = typeof err === 'object' && err !== null && 'status' in err
    ? Number((err as { status?: unknown }).status)
    : undefined;
  return status === 503 || status === 404 || status === 429;
}

function encodeSseEvent(payload: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(req: NextRequest) {
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'local';

  if (isRateLimited(clientIp)) {
    return Response.json(
      { error: 'Terlalu banyak permintaan dalam 1 menit. Mohon tunggu sebentar sebelum mengirim pesan lagi.' },
      { status: 429 },
    );
  }

  let body: { messages?: unknown; scrapeContext?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Format payload JSON tidak valid.' }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: 'Riwayat pesan tidak boleh kosong.' }, { status: 400 });
  }

  const sanitizedMessages: IncomingChatMessage[] = body.messages
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((item): item is IncomingChatMessage => {
      if (!item || typeof item !== 'object') return false;
      const role = (item as { role?: unknown }).role;
      const content = (item as { content?: unknown }).content;
      return (
        (role === 'user' || role === 'assistant') &&
        typeof content === 'string' &&
        content.trim().length > 0
      );
    })
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }));

  if (sanitizedMessages.length === 0 || sanitizedMessages[sanitizedMessages.length - 1].role !== 'user') {
    return Response.json(
      { error: 'Pesan terakhir harus berasal dari pengguna dan tidak boleh kosong.' },
      { status: 400 },
    );
  }

  let ai;
  try {
    ai = getGeminiClient();
  } catch (err) {
    return Response.json({ error: getFriendlyErrorMessage(err) }, { status: 500 });
  }

  const formattedScrape = formatScrapedContext(body.scrapeContext);
  const baseSystemInstruction = buildKobiSystemInstruction(Boolean(formattedScrape));
  const systemInstruction = formattedScrape
    ? `${baseSystemInstruction}\n\nDATA HASIL SCRAPING AKTIF:\n${formattedScrape}`
    : baseSystemInstruction;

  const contents = sanitizedMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const modelCandidates = getFlashModelCandidates();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let emittedAnyChunk = false;
      let lastError: unknown = null;

      try {
        for (const model of modelCandidates) {
          if (req.signal.aborted) break;

          try {
            const responseStream = await ai.models.generateContentStream({
              model,
              contents,
              config: {
                systemInstruction,
                temperature: 0.4,
                maxOutputTokens: 2048,
                abortSignal: req.signal,
              },
            });

            for await (const chunk of responseStream) {
              if (req.signal.aborted) break;
              const text = chunk.text;
              if (text) {
                emittedAnyChunk = true;
                controller.enqueue(encodeSseEvent({ type: 'chunk', text }));
              }
            }

            if (!req.signal.aborted) {
              controller.enqueue(encodeSseEvent({ type: 'done', model }));
            }
            lastError = null;
            break;
          } catch (err) {
            if (req.signal.aborted) {
              lastError = null;
              break;
            }
            lastError = err;
            // Only retry another Flash model if no partial text was sent yet
            if (!emittedAnyChunk && isRetryableModelError(err)) {
              continue;
            }
            break;
          }
        }

        if (lastError && !req.signal.aborted) {
          controller.enqueue(
            encodeSseEvent({
              type: 'error',
              message: getFriendlyErrorMessage(lastError),
            }),
          );
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

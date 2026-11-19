'use client';

import React, { useState, useRef, useEffect, useId, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Tag,
  Truck,
  ShoppingBag,
  ShieldCheck,
  Search,
  ArrowRight,
  User,
  HelpCircle,
  X,
  ChevronRight,
  Square,
  AlertCircle,
  Database,
  Trash2,
} from 'lucide-react';
import {
  clearChatHistory,
  clearLatestScrapeContext,
  getChatHistory,
  getLatestScrapeContext,
  saveChatHistory,
  saveLatestScrapeContext,
  subscribeChatHistory,
  subscribeScrapeContext,
  type PersistedChatMessage,
  type StoredScrapeContext,
} from '@/lib/scrape-context';

export type ChatMessage = PersistedChatMessage;

export interface PromptStarter {
  id: string;
  title: string;
  category: string;
  prompt: string;
  iconName: 'tag' | 'truck' | 'shopping-bag' | 'shield-check' | 'search';
  badge: string;
  summary: string;
}

const STARTER_PROMPTS: PromptStarter[] = [
  {
    id: 'starter-1',
    title: 'Cara Menentukan Harga Produk Baru Biar Laku',
    category: 'Strategi Harga',
    badge: 'Atur Harga',
    iconName: 'tag',
    summary: 'Cara pasang harga bersaing untuk produk baru tanpa bikin rugi atau terkesan murahan.',
    prompt: 'Bagaimana cara menentukan harga produk baru agar tetap laku dan bisa bersaing dengan toko besar di Tokopedia?',
  },
  {
    id: 'starter-2',
    title: 'Tips Menang Saing Ongkir untuk Toko Luar Jakarta',
    category: 'Logistik & Ongkir',
    badge: 'Hemat Ongkir',
    iconName: 'truck',
    summary: 'Manfaatkan ongkir lebih murah dan pengiriman cepat untuk pembeli di kota sekitar.',
    prompt: 'Toko saya di luar Jakarta (misal Solo atau Bandung), bagaimana cara agar ongkir tetap menarik bagi pembeli?',
  },
  {
    id: 'starter-3',
    title: 'Cara Buat Paket Bundling Biar Pembeli Belanja Lebih Banyak',
    category: 'Margin & Bundling',
    badge: 'Paket Hemat',
    iconName: 'shopping-bag',
    summary: 'Gabungkan produk pelengkap jadi paket hemat supaya nilai belanja pembeli naik.',
    prompt: 'Bagaimana cara bikin paket bundling produk yang menarik agar pembeli belanja lebih banyak tanpa merasa kemahalan?',
  },
  {
    id: 'starter-4',
    title: 'Cara Membalas Komplain & Ulasan Bintang 1 dengan Baik',
    category: 'Ulasan & Reputasi',
    badge: 'Jaga Rating',
    iconName: 'shield-check',
    summary: 'Cara membalas komplain pembeli dengan sopan supaya calon pembeli lain tetap percaya.',
    prompt: 'Bagaimana cara membalas ulasan bintang 1 dengan sopan agar pembeli lain tetap percaya dan mau belanja?',
  },
  {
    id: 'starter-5',
    title: 'Cara Bikin Judul & Foto Produk Biar Mudah Dicari Pembeli',
    category: 'Etalase & SEO',
    badge: 'Rapikan Etalase',
    iconName: 'search',
    summary: 'Susun judul dan foto produk yang jelas supaya gampang ditemukan saat pembeli mencari.',
    prompt: 'Seperti apa judul produk dan susunan foto yang bagus supaya produk saya mudah ditemukan pembeli di Tokopedia?',
  },
];

const TOKOPEDIA_URL_REGEX = /https?:\/\/(?:www\.)?tokopedia\.com\/[^\s]+/i;

function formatCurrentTime(): string {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function getServerScrapeSnapshot(): StoredScrapeContext | null {
  return null;
}

function renderInlineFormatting(text: string) {
  const tokens = text.split(/(\*\*.*?\*\*|\*[^*]+\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-bold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={idx} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] sm:text-xs"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}

const EMPTY_SERVER_CHAT: ChatMessage[] = [];

function getServerChatSnapshot(): ChatMessage[] {
  return EMPTY_SERVER_CHAT;
}

function createMessageId(prefix: 'user' | 'assistant', seq: number): string {
  return `${prefix}-${Date.now()}-${seq}`;
}

export function AikobiChat() {
  const messages = useSyncExternalStore(
    subscribeChatHistory,
    getChatHistory,
    getServerChatSnapshot,
  );
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string>('KOBI sedang menyusun jawaban...');
  const [errorBanner, setErrorBanner] = useState<{ message: string; retryPrompt?: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const activeScrape = useSyncExternalStore(
    subscribeScrapeContext,
    getLatestScrapeContext,
    getServerScrapeSnapshot,
  );

  const chatInputId = useId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageSeqRef = useRef(0);

  const categories = ['Semua', 'Strategi Harga', 'Logistik & Ongkir', 'Margin & Bundling', 'Ulasan & Reputasi', 'Etalase & SEO'];

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearScrapeContext = () => {
    clearLatestScrapeContext();
  };

  const handleStopGeneration = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsTyping(false);
    saveChatHistory((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
    );
  };

  const handleSendPrompt = async (promptText: string, starter?: PromptStarter, isRetry = false) => {
    const trimmed = promptText.trim();
    if (!trimmed || isTyping) return;

    setErrorBanner(null);

    messageSeqRef.current += 1;
    const now = formatCurrentTime();
    const userMsg: ChatMessage = {
      id: createMessageId('user', messageSeqRef.current),
      role: 'user',
      content: trimmed,
      timestamp: now,
    };

    const baseHistory = isRetry ? messages : [...messages, userMsg];
    if (!isRetry) {
      saveChatHistory(baseHistory);
      setInputValue('');
    }

    setIsTyping(true);
    setStatusLabel('KOBI sedang menyusun jawaban...');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let currentScrape = activeScrape;

    // Auto-scrape if user pasted a Tokopedia product URL directly in chat
    const matchedUrl = trimmed.match(TOKOPEDIA_URL_REGEX)?.[0];
    if (matchedUrl && (!currentScrape || currentScrape.sourceUrl !== matchedUrl)) {
      try {
        setStatusLabel('Mengambil data produk & kompetitor dari Tokopedia...');
        const scrapeRes = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: matchedUrl }),
          signal: controller.signal,
        });
        const scrapeJson = await scrapeRes.json().catch(() => null);
        if (scrapeRes.ok && scrapeJson?.success && scrapeJson?.data) {
          saveLatestScrapeContext(matchedUrl, scrapeJson.data);
          currentScrape = {
            sourceUrl: matchedUrl,
            scrapedAt: new Date().toISOString(),
            data: scrapeJson.data,
          };
        }
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') {
          setIsTyping(false);
          return;
        }
        // If scraping fails, continue answering within UMKM/business scope
      }
      setStatusLabel('KOBI sedang menganalisis data dengan Gemini Flash...');
    }

    messageSeqRef.current += 1;
    const assistantMsgId = createMessageId('assistant', messageSeqRef.current);
    const assistantCategory = starter?.category || (currentScrape ? 'Berbasis Data Scraping' : 'Konsultasi UMKM');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: baseHistory.map((m) => ({ role: m.role, content: m.content })),
          scrapeContext: currentScrape?.data ?? null,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || 'Gagal terhubung ke layanan KOBI AI.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let assistantInserted = false;

      const upsertAssistantChunk = (text: string, streaming: boolean) => {
        if (!assistantInserted) {
          assistantInserted = true;
          saveChatHistory((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              role: 'assistant',
              content: text,
              timestamp: formatCurrentTime(),
              category: assistantCategory,
              isStreaming: streaming,
            },
          ]);
        } else {
          saveChatHistory((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: text, isStreaming: streaming } : m,
            ),
          );
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const rawEvent of events) {
          const dataLine = rawEvent
            .split('\n')
            .find((line) => line.startsWith('data: '));
          if (!dataLine) continue;

          const payloadStr = dataLine.slice(6).trim();
          if (!payloadStr) continue;

          let parsed: { type?: string; text?: string; message?: string };
          try {
            parsed = JSON.parse(payloadStr);
          } catch {
            continue;
          }

          if (parsed.type === 'chunk' && parsed.text) {
            accumulatedText += parsed.text;
            upsertAssistantChunk(accumulatedText, true);
          } else if (parsed.type === 'error') {
            throw new Error(parsed.message || 'Terjadi kendala saat menghasilkan jawaban.');
          } else if (parsed.type === 'done') {
            if (assistantInserted) {
              upsertAssistantChunk(accumulatedText, false);
            }
          }
        }
      }

      if (assistantInserted) {
        upsertAssistantChunk(accumulatedText, false);
      } else {
        throw new Error('KOBI tidak menerima respons dari model. Silakan coba lagi.');
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.';
      setErrorBanner({ message, retryPrompt: trimmed });
    } finally {
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(inputValue);
    }
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    clearChatHistory();
    setInputValue('');
    setIsTyping(false);
    setErrorBanner(null);
  };

  const filteredStarters =
    activeCategory === 'Semua'
      ? STARTER_PROMPTS
      : STARTER_PROMPTS.filter((s) => s.category === activeCategory);

  const getStarterIcon = (iconName: string) => {
    switch (iconName) {
      case 'tag':
        return <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'truck':
        return <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'shopping-bag':
        return <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'shield-check':
        return <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'search':
        return <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('## ')) {
        return (
          <h3
            key={idx}
            className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2"
          >
            <span className="w-1.5 h-4 rounded-full bg-blue-600 dark:bg-blue-500 inline-block" aria-hidden="true" />
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4
            key={idx}
            className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2"
          >
            <span className="w-1.5 h-4 rounded-full bg-blue-600 dark:bg-blue-500 inline-block" aria-hidden="true" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="my-3 pl-3.5 py-1.5 border-l-2 border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic rounded-r-lg"
          >
            {renderInlineFormatting(line.replace('> ', ''))}
          </blockquote>
        );
      }
      const trimmedLine = line.trim();
      if (trimmedLine === '---' || trimmedLine === '***') {
        return <hr key={idx} className="my-3 border-slate-200/80 dark:border-slate-800" />;
      }
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const cleanLine = trimmedLine.replace(/^[\*\-]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1 leading-relaxed">
            {renderInlineFormatting(cleanLine)}
          </li>
        );
      }
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        return (
          <p key={idx} className="ml-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white mr-1.5">{numberedMatch[1]}.</span>
            {renderInlineFormatting(numberedMatch[2])}
          </p>
        );
      }
      if (!trimmedLine) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 py-2 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Tanya KOBI
        </h1>
      </div>

      {/* Main Chat Frame */}
      <div className="flat-surface overflow-hidden flex flex-col min-h-[600px] max-h-[820px] shadow-sm relative">
        {/* Active Scraped Context Status Bar */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          {activeScrape ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold whitespace-nowrap">
                  <Database className="w-3 h-3" aria-hidden="true" />
                  Data Scraping Aktif
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px] sm:max-w-md">
                  {activeScrape.data.produk}
                </span>
                <span className="hidden sm:inline text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  (Toko: Rp {activeScrape.data.harga_toko.toLocaleString('id-ID')} • Pasar: Rp {activeScrape.data.harga_pasar.toLocaleString('id-ID')})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    <span>Mulai Sesi Baru</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearScrapeContext}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition"
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                  <span>Hapus Konteks</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Database className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                <span>
                  Mode UMKM &amp; Bisnis Online Indonesia (belum ada data scraping aktif — tempel link Tokopedia di chat atau analisis dulu).
                </span>
              </div>
              <div className="flex items-center gap-3">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    <span>Mulai Sesi Baru</span>
                  </button>
                )}
                <Link
                  href="/konsultasi"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline whitespace-nowrap"
                >
                  Scrape Produk →
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STATE 1: EMPTY STATE */}
          {messages.length === 0 && (
            <div className="space-y-8 py-4 sm:py-6 animate-in fade-in duration-300">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 p-1.5 mx-auto flex items-center justify-center shadow-md shadow-blue-500/10">
                  <Image
                    src="/brand/mascot/mascot-pointing.png"
                    alt="KOBI AI Avatar"
                    width={84}
                    height={84}
                    className="w-full h-full object-contain"
                    priority
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Halo! Ada yang bisa KOBI bantu untuk bisnis Anda?
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {filteredStarters.map((starter) => (
                    <button
                      key={starter.id}
                      type="button"
                      onClick={() => handleSendPrompt(starter.prompt, starter)}
                      className="group cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 hover:border-blue-500/60 dark:hover:border-blue-500/50 text-left transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-500/10 transition-all">
                          {getStarterIcon(starter.iconName)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {starter.badge}
                          </span>
                          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {starter.title}
                      </h4>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: ACTIVE CONVERSATION STREAM */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {!isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex-shrink-0 flex items-center justify-center shadow-xs">
                    <Image
                      src="/brand/logo-mark.png"
                      alt="KOBI"
                      width={28}
                      height={28}
                      className="w-full h-full object-contain dark:hidden"
                    />
                    <Image
                      src="/brand/logo-mark-dark.png"
                      alt="KOBI"
                      width={28}
                      height={28}
                      className="w-full h-full object-contain hidden dark:block"
                    />
                  </div>
                )}

                <div className={`space-y-1.5 max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{isUser ? 'Anda' : 'KOBI AI'}</span>
                    {!isUser && msg.category && (
                      <span className="px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                        {msg.category}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 sm:p-5 rounded-2xl ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/15'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {renderFormattedContent(msg.content)}
                        {msg.isStreaming && (
                          <span
                            className="inline-block w-1.5 h-4 align-middle bg-blue-600 dark:bg-blue-400 animate-pulse ml-1"
                            aria-hidden="true"
                          />
                        )}

                        {!msg.isStreaming && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    Tersalin ke Clipboard!
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Salin Jawaban</span>
                                </>
                              )}
                            </button>

                            <Link
                              href="/konsultasi"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <span>Coba di Audit Produk Tokopedia</span>
                              <ArrowRight className="w-3 h-3" aria-hidden="true" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!isUser && !msg.isStreaming && msg.followUps && msg.followUps.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-500" aria-hidden="true" />
                        Tanya Lebih Lanjut:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.followUps.map((chip, chipIdx) => (
                          <button
                            key={chipIdx}
                            type="button"
                            onClick={() => handleSendPrompt(chip)}
                            className="text-left text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 transition"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs">
                    <User className="w-4 h-4" aria-hidden="true" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator (only before first streamed chunk arrives) */}
          {isTyping && !messages[messages.length - 1]?.isStreaming && (
            <div className="flex gap-3 sm:gap-4 items-start animate-in fade-in duration-150">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shadow-xs">
                <Image
                  src="/brand/logo-mark.png"
                  alt="KOBI"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain dark:hidden"
                />
                <Image
                  src="/brand/logo-mark-dark.png"
                  alt="KOBI"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain hidden dark:block"
                />
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-3.5 shadow-sm space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-2">
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorBanner && (
            <div
              role="alert"
              className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" aria-hidden="true" />
                <span>{errorBanner.message}</span>
              </div>
              {errorBanner.retryPrompt && (
                <button
                  type="button"
                  onClick={() => handleSendPrompt(errorBanner.retryPrompt!, undefined, true)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition"
                >
                  Coba Lagi
                </button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* DOCKED CHAT INPUT COLUMN */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap pl-1">
              Topik Cepat:
            </span>
            <button
              type="button"
              onClick={() => handleSendPrompt('Bagaimana cara menentukan harga coret diskon yang efektif di Tokopedia?')}
              disabled={isTyping}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 whitespace-nowrap transition disabled:opacity-50"
            >
              Strategi Harga Coret
            </button>
            <button
              type="button"
              onClick={() => handleSendPrompt('Bagaimana rumus menghitung margin bersih setelah potongan komisi Tokopedia?')}
              disabled={isTyping}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 whitespace-nowrap transition disabled:opacity-50"
            >
              Potongan Fee Tokopedia
            </button>
            <button
              type="button"
              onClick={() => handleSendPrompt('Strategi apa yang efektif untuk mengembangkan UMKM kuliner atau fashion di pasar online Indonesia?')}
              disabled={isTyping}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 whitespace-nowrap transition disabled:opacity-50"
            >
              Strategi Kembangkan UMKM
            </button>
            <button
              type="button"
              onClick={() => handleSendPrompt('Bagaimana cara optimasi deskripsi etalase agar lolos pencarian Tokopedia?')}
              disabled={isTyping}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 whitespace-nowrap transition disabled:opacity-50"
            >
              Optimasi SEO Etalase
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputValue);
            }}
            className="relative flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-xs p-1.5 transition-all"
          >
            <label htmlFor={chatInputId} className="sr-only">
              Tulis pertanyaan konsultasi bisnis ke KOBI
            </label>
            <textarea
              id={chatInputId}
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan strategi bisnis online, UMKM Indonesia, atau tempel tautan Tokopedia... (Enter)"
              className="flex-1 max-h-32 min-h-[38px] py-1.5 px-3 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />

            {inputValue.trim() && !isTyping && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                aria-label="Hapus teks input"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            {isTyping ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                aria-label="Hentikan respons KOBI"
                className="px-2.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
              >
                <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span className="hidden sm:inline">Hentikan</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                aria-label="Kirim pesan ke KOBI"
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                  inputValue.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-95'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </form>

          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
            KOBI AI ditenagai oleh Google Gemini Flash dengan cakupan khusus bisnis online &amp; UMKM Indonesia. Gunakan hasil analisis sebagai pendamping keputusan bisnis Anda.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight, RotateCcw } from 'lucide-react';
import { AikobiHeroInput } from '@/components/aikobi-hero-input';
import { AikobiPipelineHud } from '@/components/aikobi-pipeline-hud';
import { AikobiErrorAlert } from '@/components/aikobi-error-alert';
import { AikobiEmptyState } from '@/components/aikobi-empty-state';
import { AikobiSweetSpotVisualizer } from '@/components/aikobi-sweet-spot-visualizer';
import { AikobiAdvisoryCards } from '@/components/aikobi-advisory-cards';
import { AikobiCompetitorMatrix } from '@/components/aikobi-competitor-matrix';
import {
  clearLatestScrapeContext,
  getLatestScrapeContext,
  saveLatestScrapeContext,
  subscribeScrapeContext,
  type ScrapedAnalysisData,
  type StoredScrapeContext,
} from '@/lib/scrape-context';

function getServerScrapeSnapshot(): StoredScrapeContext | null {
  return null;
}

export default function AiPage() {
  const storedScrape = useSyncExternalStore(
    subscribeScrapeContext,
    getLatestScrapeContext,
    getServerScrapeSnapshot,
  );
  const [customUrlInput, setCustomUrlInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('Memulai pembacaan link produk Tokopedia...');
  const [progressPct, setProgressPct] = useState<number>(15);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<ScrapedAnalysisData | null>(null);

  const urlInput = customUrlInput ?? storedScrape?.sourceUrl ?? '';
  const activeData = data ?? storedScrape?.data ?? null;

  const handleResetAnalysis = () => {
    clearLatestScrapeContext();
    setData(null);
    setCustomUrlInput('');
    setErrorMsg(null);
  };

  const runAnalysis = async (inputUrl: string) => {
    setErrorMsg(null);
    const cleanUrl = inputUrl.trim();
    setCustomUrlInput(cleanUrl);

    if (!cleanUrl) {
      setErrorMsg('Masukkan tautan produk Tokopedia terlebih dahulu.');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setErrorMsg(
        'Tautan tidak valid. Harap masukkan tautan Tokopedia yang valid (contoh: https://www.tokopedia.com/store/produk)',
      );
      return;
    }

    setLoading(true);
    setData(null);
    setStatusStep('Menghubungkan ke Tokopedia & membaca detail produk...');
    setProgressPct(25);

    const timer1 = setTimeout(() => {
      setStatusStep('Mengumpulkan harga variasi produk & membandingkan toko pesaing...');
      setProgressPct(50);
    }, 700);

    const timer2 = setTimeout(() => {
      setStatusStep('Membaca ulasan pembeli & mengelompokkan jarak ongkir pesaing...');
      setProgressPct(75);
    }, 1600);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
        data?: ScrapedAnalysisData;
      } | null;

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok || !json?.success || !json.data) {
        const errorText =
          json?.error ||
          'Tautan Tokopedia tidak valid atau produk sudah tidak aktif (404 Not Found). Silakan periksa kembali tautan yang Anda masukkan.';
        setErrorMsg(errorText);
        setLoading(false);
        return;
      }

      setStatusStep('Perhitungan Selesai: Menyiapkan Rangkuman Saran Harga AIKOBI...');
      setProgressPct(100);
      setData(json.data);
      saveLatestScrapeContext(cleanUrl, json.data);
    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      const message = err instanceof Error ? err.message : undefined;
      setErrorMsg(message || 'Tautan Tokopedia tidak valid atau produk sudah tidak aktif.');
    } finally {
      setProgressPct(100);
      setLoading(false);
    }
  };

  return (
    <div className="py-2 space-y-10">
      {/* Asymmetric Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto pt-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Cek Harga Paling Pas untuk Etalase Toko Anda
        </h1>

        {/* Hero Search Capsule + Contextual Sample Chips */}
        <div className="pt-2">
          <AikobiHeroInput
            urlInput={urlInput}
            setUrlInput={(val) => setCustomUrlInput(val)}
            onSubmit={(url) => runAnalysis(url)}
            loading={loading}
          />
        </div>
      </section>

      {/* State Switcher */}
      {loading && (
        <AikobiPipelineHud
          currentStepMessage={statusStep}
          progressPercent={progressPct}
        />
      )}

      {errorMsg && !loading && (
        <AikobiErrorAlert
          errorMessage={errorMsg}
          onRetrySample={(sampleUrl) => {
            setCustomUrlInput(sampleUrl);
            runAnalysis(sampleUrl);
          }}
          onReset={handleResetAnalysis}
        />
      )}

      {!loading && !activeData && !errorMsg && (
        <AikobiEmptyState />
      )}

      {/* Results View: Sweet-Spot Visualizer, Advisory Cards, Competitor Matrix */}
      {activeData && !loading && !errorMsg && (
        <div className="space-y-12 pt-2 animate-fade-in">
          {/* Quick Handoff Banner to Tanya KOBI Chatbot + Reset Button */}
          <div className="flat-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-500/25 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Data produk siap didiskusikan dengan KOBI AI
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Tanyakan strategi harga, bundling, atau cara bersaing dengan kompetitor berdasarkan hasil scraping produk ini.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResetAnalysis}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Analisis</span>
              </button>
              <Link
                href="/tanya"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition whitespace-nowrap"
              >
                <span>Konsultasi di Tanya KOBI</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* 1. Fair Price Sweet-Spot Range Spectrum */}
          <AikobiSweetSpotVisualizer data={activeData} />

          {/* 2. Executive Consultant Advisory Cards (Asymmetric 60/40 Layout) */}
          <AikobiAdvisoryCards data={activeData} />

          {/* 3. Competitor Geolocation & Courier Advantage Matrix */}
          <AikobiCompetitorMatrix data={activeData} />
        </div>
      )}
    </div>
  );
}

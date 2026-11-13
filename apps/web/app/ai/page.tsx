'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { AikobiHeroInput } from '@/components/aikobi-hero-input';
import { AikobiPipelineHud } from '@/components/aikobi-pipeline-hud';
import { AikobiErrorAlert } from '@/components/aikobi-error-alert';
import { AikobiEmptyState } from '@/components/aikobi-empty-state';
import { AikobiSweetSpotVisualizer } from '@/components/aikobi-sweet-spot-visualizer';
import { AikobiAdvisoryCards } from '@/components/aikobi-advisory-cards';
import { AikobiCompetitorMatrix } from '@/components/aikobi-competitor-matrix';
import { AikobiAuditPersonas } from '@/components/aikobi-audit-personas';

export default function AiPage() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('Memulai live scraping link Tokopedia...');
  const [progressPct, setProgressPct] = useState<number>(15);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Force clean empty state on every mount / page load
  useEffect(() => {
    setUrlInput('');
    setData(null);
    setErrorMsg(null);
  }, []);

  const runAnalysis = async (inputUrl: string) => {
    setErrorMsg(null);
    const cleanUrl = inputUrl.trim();

    if (!cleanUrl) {
      setErrorMsg('Masukkan tautan produk Tokopedia terlebih dahulu.');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setErrorMsg(
        'Tautan tidak valid. Harap masukkan tautan Tokopedia yang valid (contoh: https://www.tokopedia.com/store/produk)'
      );
      return;
    }

    setLoading(true);
    setData(null);
    setStatusStep('Menghubungkan ke Tokopedia Live Engine & Parsing Metadata Etalase...');
    setProgressPct(25);

    const timer1 = setTimeout(() => {
      setStatusStep('Menambang Varian Produk & Distribusi Harga Kompetitor...');
      setProgressPct(50);
    }, 700);

    const timer2 = setTimeout(() => {
      setStatusStep('Mengekstrak Topik Ulasan Pembeli & Klaster Wilayah Pengiriman...');
      setProgressPct(75);
    }, 1600);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const json = await res.json().catch(() => null);

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok || !json?.success) {
        const errorText =
          json?.error ||
          'Tautan Tokopedia tidak valid atau produk sudah tidak aktif (404 Not Found). Silakan periksa kembali tautan yang Anda masukkan.';
        setErrorMsg(errorText);
        setLoading(false);
        return;
      }

      setStatusStep('Model Kuantil Selesai: Menyusun Sintesis Strategi Konsultan AIKOBI...');
      setProgressPct(100);
      setData(json.data);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setErrorMsg(err.message || 'Tautan Tokopedia tidak valid atau produk sudah tidak aktif.');
    } finally {
      setProgressPct(100);
      setLoading(false);
    }
  };

  return (
    <div className="py-2 space-y-10">
      {/* Asymmetric Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Sensor Pasar & Konsultan Bisnis Tokopedia Real-Time
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Audit Strategi Harga & Etalase Marketplace
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Tempel tautan produk Tokopedia Anda untuk mengungkap posisi harga pasar, potensi kenaikan margin laba, sentimen ulasan pembeli, dan keunggulan kompetitor logistik lokal.
        </p>

        {/* Hero Search Capsule + Contextual Sample Chips */}
        <div className="pt-2">
          <AikobiHeroInput
            urlInput={urlInput}
            setUrlInput={setUrlInput}
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
            setUrlInput(sampleUrl);
            runAnalysis(sampleUrl);
          }}
          onReset={() => {
            setErrorMsg(null);
            setUrlInput('');
          }}
        />
      )}

      {!loading && !data && !errorMsg && (
        <AikobiEmptyState />
      )}

      {/* Results View: Persona Overview, Sweet-Spot Visualizer, Advisory Cards, Competitor Matrix */}
      {data && !loading && (
        <div className="space-y-12 pt-2 animate-fade-in">
          {/* 0. Mascot Persona 4-Step Synthesis Overview */}
          <AikobiAuditPersonas data={data} />

          {/* 1. Fair Price Sweet-Spot Range Spectrum */}
          <AikobiSweetSpotVisualizer data={data} />

          {/* 2. Executive Consultant Advisory Cards (Asymmetric 60/40 Layout) */}
          <AikobiAdvisoryCards data={data} />

          {/* 3. Competitor Geolocation & Courier Advantage Matrix */}
          <AikobiCompetitorMatrix data={data} />
        </div>
      )}
    </div>
  );
}

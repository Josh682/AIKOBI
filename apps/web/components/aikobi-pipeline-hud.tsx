'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, Database, Search, Layers, Cpu } from 'lucide-react';

interface StageInfo {
  step: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  percentage: number;
}

const STAGES: StageInfo[] = [
  {
    step: 1,
    label: 'Menghubungkan ke Tokopedia & membaca detail produk',
    icon: Search,
    percentage: 25,
  },
  {
    step: 2,
    label: 'Mengumpulkan variasi harga & toko pesaing sejenis',
    icon: Database,
    percentage: 50,
  },
  {
    step: 3,
    label: 'Membaca isi ulasan pembeli & mengelompokkan kota pengirim',
    icon: Layers,
    percentage: 75,
  },
  {
    step: 4,
    label: 'Perhitungan Selesai: Menyiapkan Saran Harga & Langkah Jualan',
    icon: Cpu,
    percentage: 100,
  },
];

interface AikobiPipelineHudProps {
  currentStepMessage: string;
  progressPercent: number;
  className?: string;
}

export function AikobiPipelineHud({
  currentStepMessage,
  progressPercent,
  className = '',
}: AikobiPipelineHudProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine which stage is active based on progressPercent
  const activeStageIndex =
    progressPercent >= 100
      ? 3
      : progressPercent >= 75
      ? 2
      : progressPercent >= 50
      ? 1
      : 0;

  return (
    <div className={`w-full max-w-3xl mx-auto liquid-glass-modal p-6 sm:p-8 space-y-6 shadow-xl ${className}`}>
      {/* Header: Title + Elapsed Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              AIKOBI Sedang Mengecek Etalase Anda
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Membaca halaman produk Tokopedia &amp; menyiapkan hitungan harga pasar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="tabular-num text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {elapsedSeconds}s berlalu
          </div>
          <div className="tabular-num text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {Math.min(100, Math.max(15, progressPercent))}%
          </div>
        </div>
      </div>

      {/* Dynamic Shimmering Liquid Progress Track */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${Math.min(100, Math.max(15, progressPercent))}%` }}
          >
            {/* Shimmer Light Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
          <span>Baca Etalase</span>
          <span>Cek Variasi</span>
          <span>Ringkas Ulasan</span>
          <span>Hitung Harga Pas</span>
        </div>
      </div>

      {/* 4-Stage Stepper Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {STAGES.map((stage, idx) => {
          const isDone = activeStageIndex > idx || progressPercent >= 100;
          const isCurrent = activeStageIndex === idx && progressPercent < 100;
          const StageIcon = stage.icon;

          return (
            <div
              key={stage.step}
              className={`p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                isDone
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                  : isCurrent
                  ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-500/50 shadow-sm shadow-blue-500/10'
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-60'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 items-center justify-center text-[9px] font-bold text-white">
                      {stage.step}
                    </span>
                  </span>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] font-semibold text-slate-400">
                    {stage.step}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-xs font-semibold leading-snug ${
                    isDone
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : isCurrent
                      ? 'text-blue-900 dark:text-blue-200 font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {stage.label}
                </div>
                {isCurrent && (
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    <span>Sedang diproses...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Status Step Detail Message */}
      <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping flex-shrink-0" />
        <span className="font-semibold text-slate-900 dark:text-white">Status Live:</span>
        <span className="truncate">{currentStepMessage}</span>
      </div>
    </div>
  );
}

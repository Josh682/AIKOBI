'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';
import { SAMPLE_PRODUCTS } from './aikobi-hero-input';

interface AikobiErrorAlertProps {
  errorMessage: string;
  onRetrySample: (url: string) => void;
  onReset: () => void;
  className?: string;
}

export function AikobiErrorAlert({
  errorMessage,
  onRetrySample,
  onReset,
  className = '',
}: AikobiErrorAlertProps) {
  const defaultSample = SAMPLE_PRODUCTS[0];

  return (
    <div
      className={`w-full max-w-3xl mx-auto p-6 sm:p-7 rounded-2xl border border-rose-500/25 bg-rose-500/5 dark:bg-rose-950/20 backdrop-blur-md space-y-5 shadow-lg ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-rose-900 dark:text-rose-200">
            Pemeriksaan Tautan Produk Diperlukan
          </h3>
          <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300/90 leading-relaxed">
            {errorMessage}
          </p>
        </div>
      </div>

      {/* Helpful Hint Section */}
      <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-rose-200/50 dark:border-rose-900/40 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Kemungkinan Penyebab:
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
          <li>Etalase produk sudah tidak aktif, habis, atau diarsipkan oleh penjual Tokopedia.</li>
          <li>Tautan belum mengarah ke halaman spesifik produk (contoh format: <code className="font-mono text-blue-600 dark:text-blue-400">https://www.tokopedia.com/nama-toko/nama-produk</code>).</li>
          <li>Layanan Tokopedia sedang melakukan pembatasan bot sementara.</li>
        </ul>
      </div>

      {/* Action Recovery Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => onRetrySample(defaultSample.url)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Gunakan Sampel Demo ({defaultSample.name})</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Coba Tautan Lain</span>
        </button>
      </div>
    </div>
  );
}

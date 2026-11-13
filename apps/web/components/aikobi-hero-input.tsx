'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Loader2, X, ClipboardPaste, ArrowRight } from 'lucide-react';

export interface SampleProduct {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'batik',
    name: 'Kemeja Batik Solo Premium',
    category: 'Fashion',
    url: 'https://www.tokopedia.com/batikdanar/kemeja-batik-pria-premium-katun-lengan-panjang',
  },
  {
    id: 'tws',
    name: 'TWS Bluetooth 5.3 Bass',
    category: 'Elektronik',
    url: 'https://www.tokopedia.com/gadgetcenter/tws-earphone-bluetooth-5-3-bass-boost-waterproof',
  },
  {
    id: 'kopi',
    name: 'Kopi Arabika Gayo 250g',
    category: 'Kuliner',
    url: 'https://www.tokopedia.com/kopinusantara/biji-kopi-arabika-gayo-aceh-single-origin-250g',
  },
];

interface AikobiHeroInputProps {
  urlInput: string;
  setUrlInput: (val: string) => void;
  onSubmit: (url: string) => void;
  loading: boolean;
  className?: string;
}

export function AikobiHeroInput({
  urlInput,
  setUrlInput,
  onSubmit,
  loading,
  className = '',
}: AikobiHeroInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || loading) return;
    onSubmit(urlInput.trim());
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    onSubmit(sampleUrl);
  };

  const handleClear = () => {
    setUrlInput('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
      }
    } catch {
      // clipboard access denied or not supported
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto space-y-3.5 ${className}`}>
      {/* Liquid Glass Hero Search Capsule */}
      <form
        onSubmit={handleSubmit}
        className={`liquid-glass-hero p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 transition-all duration-200 ${
          isFocused ? 'ring-2 ring-blue-500/30 border-blue-500/60 shadow-lg shadow-blue-500/10' : ''
        }`}
      >
        {/* Left Search Icon */}
        <div className="pl-3 sm:pl-4 text-slate-400 dark:text-slate-500 flex items-center justify-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-blue-600 dark:text-blue-400' : ''}`} />
        </div>

        {/* URL Input */}
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={loading}
          placeholder="Tempel tautan produk Tokopedia (contoh: https://www.tokopedia.com/...)"
          className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-none min-w-0"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {urlInput && !loading && (
          <button
            type="button"
            onClick={handleClear}
            title="Kosongkan input"
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Paste from Clipboard Button (shown if input empty) */}
        {!urlInput && !loading && (
          <button
            type="button"
            onClick={handlePaste}
            title="Tempel dari Clipboard"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Tempel</span>
          </button>
        )}

        {/* Action Submit Button */}
        <button
          type="submit"
          disabled={!urlInput.trim() || loading}
          className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-md ${
            !urlInput.trim() || loading
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Mulai Konsultasi</span>
            </>
          )}
        </button>
      </form>

      {/* Contextual Sample Chips (One-Click Instant Demo) */}
      <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          Sampel Cepat:
        </span>
        {SAMPLE_PRODUCTS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => handleSelectSample(sample.url)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500/60 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-medium transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                sample.category === 'Fashion'
                  ? 'bg-emerald-500'
                  : sample.category === 'Elektronik'
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
            />
            <span>{sample.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

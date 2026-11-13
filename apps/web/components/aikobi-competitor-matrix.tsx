'use client';

import React from 'react';
import {
  MapPin,
  Store,
  ExternalLink,
  Star,
  Truck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export interface CompetitorMatrixProps {
  data: {
    harga_toko: number;
    produk_serupa?: Array<{
      nama: string;
      harga?: number;
      price?: number;
      rating?: number;
      toko?: string;
      city?: string;
      url?: string;
    }>;
    kompetitor_lokal?: {
      kota_asal: string;
      is_exact_city: boolean;
      label_wilayah: string;
      badge_stat_label: string;
      total_ditemukan: number;
      insight: string;
      produk: Array<{
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
      }>;
    };
  };
  className?: string;
}

export function AikobiCompetitorMatrix({ data, className = '' }: CompetitorMatrixProps) {
  const kl = data.kompetitor_lokal;
  const ps = data.produk_serupa || [];

  return (
    <div className={`space-y-10 ${className}`}>
      {/* ========================================================= */}
      {/* 1. Radar Geolocation & Keunggulan Ongkir Lokal           */}
      {/* ========================================================= */}
      {kl && kl.produk && kl.produk.length > 0 && (
        <section className="space-y-6">
          {/* Banner Wilayah Pengiriman */}
          <div className="p-6 sm:p-8 rounded-2xl flat-surface border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>Pembanding Wilayah Pengiriman</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {kl.label_wilayah || `Kompetitor Lokal (${kl.kota_asal})`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                {kl.insight}
              </p>
            </div>

            <div className="flex-shrink-0 self-start md:self-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-center min-w-[140px]">
              <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-300 tabular-nums">
                {kl.produk.length}
              </div>
              <div className="text-[11px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wide mt-0.5">
                {kl.badge_stat_label || `SELLER ${kl.kota_asal}`}
              </div>
            </div>
          </div>

          {/* Grid Kartu Kompetitor Lokal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kl.produk.map((p, idx) => {
              const truncatedTitle = p.nama.length > 48 ? `${p.nama.slice(0, 45)}...` : p.nama;
              return (
                <a
                  key={idx}
                  href={p.url || `https://www.tokopedia.com/search?q=${encodeURIComponent(p.nama)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flat-surface p-4 sm:p-5 flex flex-col justify-between gap-4 group hover:border-blue-500/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" />
                        {p.city}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                          p.is_cheaper
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {p.badge_selisih}
                      </span>
                    </div>

                    <h4
                      title={p.nama}
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    >
                      {truncatedTitle}
                    </h4>

                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Toko: {p.toko}
                    </div>

                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tabular-nums pt-1">
                      Rp {p.harga.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {(p.rating || 4.8).toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                      <span>Tokopedia</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 2. Matriks Pesaing Serupa Nasional (Tokopedia Search)      */}
      {/* ========================================================= */}
      {ps.length > 0 && (
        <section className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl flat-surface border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Store className="w-3.5 h-3.5" />
                <span>Riset Listing Kompetitor Serupa</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Produk Serupa (Kompetitor Sejenis)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                Pencarian real-time toko kompetitor sejenis di Tokopedia dengan spesifikasi dan satuan transaksi setara.
              </p>
            </div>

            <div className="flex-shrink-0 self-start md:self-center p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-center min-w-[140px]">
              <div className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300 tabular-nums">
                {ps.length}
              </div>
              <div className="text-[11px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wide mt-0.5">
                KOMPETITOR AKTIF
              </div>
            </div>
          </div>

          {/* Grid Pesaing Serupa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {ps.map((p, idx) => {
              const truncatedTitle = p.nama.length > 55 ? `${p.nama.slice(0, 52)}...` : p.nama;
              const itemPrice = p.harga ?? p.price ?? 0;
              const isCheaperThanShop = itemPrice < data.harga_toko;
              const diffPct = Math.round(
                Math.abs((itemPrice - data.harga_toko) / (data.harga_toko || 1)) * 100
              );

              return (
                <a
                  key={idx}
                  href={p.url || `https://www.tokopedia.com/search?q=${encodeURIComponent(p.nama)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flat-surface p-5 flex flex-col justify-between gap-4 group hover:border-blue-500/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {p.toko || 'Toko'} ({p.city || 'Indonesia'})
                      </span>

                      {itemPrice !== data.harga_toko && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                            isCheaperThanShop
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {isCheaperThanShop ? `Lebih Hemat ${diffPct}%` : `+${diffPct}%`}
                        </span>
                      )}
                    </div>

                    <h4
                      title={p.nama}
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[38px]"
                    >
                      {truncatedTitle}
                    </h4>

                    <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums pt-1">
                      Rp {itemPrice.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {(p.rating || 4.8).toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                      <span>Buka di Tokopedia</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

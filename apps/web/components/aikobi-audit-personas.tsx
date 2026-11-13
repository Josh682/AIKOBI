'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, CheckCircle2, TrendingUp, Target, ArrowRight } from 'lucide-react';

export interface AuditPersonasProps {
  data: {
    produk: string;
    kategori?: string;
    harga_toko: number;
    harga_pasar: number;
    status: string;
    rentang_harga_wajar?: {
      min?: number;
      max?: number;
      min_pasar?: number;
      max_pasar?: number;
      wajar_min?: number;
      wajar_max?: number;
    };
    analisis_mendalam?: {
      analisis_harga?: {
        posisi_pasar: string;
        label_selisih: string;
        is_cheaper: boolean;
      };
      evaluasi_ulasan?: {
        rating_rata: number;
        sentimen_positif: number;
      };
      rekomendasi_penjual?: {
        strategi_harga?: Array<{
          nama_opsi: string;
          target_harga: number;
        }>;
      };
    };
  };
  className?: string;
}

export function AikobiAuditPersonas({ data, className = '' }: AuditPersonasProps) {
  const rhw = data.rentang_harga_wajar || {};
  const minP = rhw.min_pasar ?? rhw.min ?? Math.round(data.harga_pasar * 0.7);
  const maxP = rhw.max_pasar ?? rhw.max ?? Math.round(data.harga_pasar * 1.4);
  const wMin = rhw.wajar_min ?? Math.round(data.harga_pasar * 0.85);
  const wMax = rhw.wajar_max ?? Math.round(data.harga_pasar * 1.15);

  const statusLabel =
    data.status === 'murah'
      ? 'Kompetitif (Hemat)'
      : data.status === 'mahal'
      ? 'Harga Premium'
      : 'Sweet-Spot Ideal';

  const personas = [
    {
      id: '01',
      badge: '01 / Validasi Etalase',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/40',
      title: 'KOBI Menyapa',
      image: '/brand/mascot/mascot-greeting.png',
      description: `Menyambut etalase toko Anda! Data produk "${data.produk.slice(0, 48)}${data.produk.length > 48 ? '...' : ''}" berhasil diekstraksi bersama 20 etalase kompetitor aktif.`,
      statusPill: '20 Kompetitor Tervalidasi',
      statusColor: 'text-blue-700 dark:text-blue-300 bg-blue-500/10',
    },
    {
      id: '02',
      badge: '02 / Bedah Pasar',
      badgeColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-900/40',
      title: 'KOBI Menganalisis',
      image: '/brand/mascot/mascot-thinking.png',
      description: `Membedah disparitas harga pasar dari Rp ${minP.toLocaleString('id-ID')} hingga Rp ${maxP.toLocaleString('id-ID')} serta sentimen ulasan pembeli Tokopedia.`,
      statusPill: `${data.analisis_mendalam?.evaluasi_ulasan?.sentimen_positif || 95}% Sentimen Positif`,
      statusColor: 'text-purple-700 dark:text-purple-300 bg-purple-500/10',
    },
    {
      id: '03',
      badge: '03 / Rekomendasi Target',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40',
      title: 'KOBI Menunjukkan Arah',
      image: '/brand/mascot/mascot-pointing.png',
      description: `Mengarahkan target harga wajar di rentang Rp ${wMin.toLocaleString('id-ID')} – Rp ${wMax.toLocaleString('id-ID')}. Posisi etalase Anda: ${statusLabel}.`,
      statusPill: `Zona: ${statusLabel}`,
      statusColor: 'text-amber-700 dark:text-amber-300 bg-amber-500/10',
    },
    {
      id: '04',
      badge: '04 / Validasi Margin',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40',
      title: 'KOBI Menyetujui',
      image: '/brand/mascot/mascot-approve.png',
      description: `Memvalidasi kalkulasi margin keuntungan optimal dan menetapkan rekomendasi taktis 30 hari yang siap Anda terapkan.`,
      statusPill: 'Action Plan Siap Eksekusi',
      statusColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10',
    },
  ];

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Persona Konsultan AIKOBI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Sintesis 4 Langkah Hasil Audit Etalase
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md text-left sm:text-right">
          Panduan langkah terpadu dari penyambutan data hingga validasi margin laba bersih.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {personas.map((p) => (
          <div
            key={p.id}
            className="flat-surface p-5 space-y-4 rounded-2xl hover:shadow-lg transition-all text-center flex flex-col justify-between group border border-slate-200/80 dark:border-slate-800"
          >
            <div className="space-y-3">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border ${p.badgeColor}`}
              >
                {p.badge}
              </span>

              <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto relative group-hover:scale-105 transition-transform duration-200">
                <Image
                  src={p.image}
                  alt={p.title}
                  width={160}
                  height={160}
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {p.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                {p.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold ${p.statusColor}`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{p.statusPill}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

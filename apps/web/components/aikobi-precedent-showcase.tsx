"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Eye,
  Lock,
  MapPin,
  MessageSquare,
  Radar,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface EngineNode {
  id: string;
  title: string;
  tag: string;
  metric: string;
  summary: string;
  mascotSrc: string;
  mascotAlt: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

interface FoundationCardItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  highlight?: boolean;
  tiltClass: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

const HANGING_PILLS = [
  {
    label: "Diskon Pesaing",
    tilt: "-6deg",
    duration: "3.9s",
    delay: "0s",
    height: "h-12",
    featured: false,
    position: "col-start-1 justify-self-start sm:translate-x-4",
  },
  {
    label: "Jual Terlalu Murah",
    tilt: "5deg",
    duration: "4.1s",
    delay: "0.15s",
    height: "h-16",
    featured: false,
    position: "col-start-2 justify-self-end sm:-translate-x-3",
  },
  {
    label: "Harga Paling Pas",
    tilt: "-2deg",
    duration: "4.2s",
    delay: "0.08s",
    height: "h-10",
    featured: true,
    position: "col-span-2 justify-self-center",
  },
  {
    label: "Ulasan Pembeli",
    tilt: "4deg",
    duration: "3.8s",
    delay: "0.22s",
    height: "h-14",
    featured: false,
    position: "col-start-1 justify-self-center sm:-translate-x-2",
  },
  {
    label: "Ongkir Luar Pulau",
    tilt: "-5deg",
    duration: "4.0s",
    delay: "0.12s",
    height: "h-11",
    featured: false,
    position: "col-start-2 justify-self-center sm:translate-x-2",
  },
] as const;

const ENGINE_NODES: readonly EngineNode[] = [
  {
    id: "extractor",
    title: "Pembaca Data Toko",
    tag: "Baca 3 Detik",
    metric: "100+ produk pesaing terbaca per etalase",
    summary: "Mengambil harga, stok terjual, kota toko, dan ulasan tanpa password akun.",
    mascotSrc: "/brand/mascot/mascot-main.png",
    mascotAlt: "Maskot KOBI memegang tablet membaca data etalase toko",
    icon: Radar,
  },
  {
    id: "quantile",
    title: "Penghitung Harga Pas",
    tag: "Batas Harga Aman",
    metric: "Harga pancingan aneh disaring otomatis",
    summary: "Mencari titik pas antara untung per barang dan harga yang mau dibayar pembeli.",
    mascotSrc: "/brand/mascot/mascot-pointing.png",
    mascotAlt: "Maskot KOBI menunjuk titik harga paling pas di grafik",
    icon: TrendingUp,
  },
  {
    id: "nlp",
    title: "Pembaca Ulasan Pembeli",
    tag: "Paham Ulasan",
    metric: "Tangkap keluhan mutu & pengemasan",
    summary: "Merangkum keluhan dari ulasan bintang kecil menjadi daftar perbaikan yang mudah diikuti.",
    mascotSrc: "/brand/mascot/mascot-thinking.png",
    mascotAlt: "Maskot KOBI berpikir menelaah isi ulasan pembeli",
    icon: MessageSquare,
  },
  {
    id: "geo",
    title: "Cek Jarak & Ongkir",
    tag: "Ongkir & Wilayah",
    metric: "Bandingkan ongkir lokal vs luar kota",
    summary: "Menilai total harga barang ditambah ongkir dibanding toko pesaing terdekat.",
    mascotSrc: "/brand/mascot/mascot-approve.png",
    mascotAlt: "Maskot KOBI mengacungkan jempol atas keunggulan ongkir lokal",
    icon: MapPin,
  },
];

const BENTO_ALERTS = [
  {
    tag: "UNTUNG",
    tone: "bg-amber-500/15 text-amber-800 border-amber-500/30 dark:text-amber-300 dark:border-amber-400/30",
    title: "3 pesaing utama menurunkan harga −8%",
    detail: "Jaga harga di Rp 124rb agar untung tetap sehat.",
    time: "Aktif",
  },
  {
    tag: "PAS",
    tone: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-400/30",
    title: "Harga paling pas sudah ditemukan",
    detail: "Rentang Rp 118rb – Rp 132rb paling banyak diminati pembeli (+34%).",
    time: "Cocok 96%",
  },
  {
    tag: "ULASAN",
    tone: "bg-blue-500/15 text-blue-800 border-blue-500/30 dark:text-blue-300 dark:border-blue-400/30",
    title: "Pembeli memuji pengiriman cepat",
    detail: "Pasang keterangan 'kirim hari yang sama' di foto utama.",
    time: "Saran",
  },
] as const;

const FOUNDATION_TOP_ROW: readonly FoundationCardItem[] = [
  {
    id: "privacy",
    eyebrow: "Privasi UMKM",
    title: "Tanpa Password Toko",
    description:
      "Cukup tempel link produk atau nama barang. AIKOBI tidak meminta kata sandi akun, kode akses khusus, atau laporan penjualan rahasia Anda.",
    tiltClass: "lg:-rotate-1 hover:rotate-0",
    icon: Lock,
  },
  {
    id: "outlier",
    eyebrow: "Harga Asli Pasar",
    title: "Buang Harga Pancingan Aneh",
    description:
      "Harga jebakan Rp 100 atau barang tiruan tidak merusak acuan karena AIKOBI hanya menghitung harga dari toko yang benar-benar laku.",
    tiltClass: "lg:rotate-1 hover:rotate-0",
    icon: BarChart3,
  },
];

const FOUNDATION_BOTTOM_ROW: readonly FoundationCardItem[] = [
  {
    id: "action",
    eyebrow: "Siap Pakai",
    title: "Langkah Praktis 30 Hari",
    description:
      "Tidak perlu pusing baca tabel rumit: dapatkan langkah atur harga, ide paket hemat, dan teks promosi yang tinggal tempel.",
    highlight: true,
    tiltClass: "lg:-rotate-1 hover:rotate-0",
    icon: Sparkles,
  },
  {
    id: "nlp-local",
    eyebrow: "Bahasa Sehari-hari",
    title: "Paham Ulasan Pembeli Lokal",
    description:
      "Mengerti singkatan dan bahasa pembeli Indonesia sehari-hari sehingga kekurangan pesaing langsung terbaca jelas.",
    tiltClass: "lg:translate-y-1 hover:translate-y-0",
    icon: Cpu,
  },
  {
    id: "transparent",
    eyebrow: "Terbuka",
    title: "Contoh Barang Asli Jelas",
    description:
      "Setiap saran harga disertai contoh barang milik pesaing yang nyata sehingga Anda bisa mengecek sendiri alasannya.",
    tiltClass: "lg:rotate-1 hover:rotate-0",
    icon: Eye,
  },
];

function DualSquareGlassIcon({
  icon: Icon,
  highlight = false,
  delay = "0s",
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  highlight?: boolean;
  delay?: string;
}) {
  return (
    <div
      className="relative w-12 h-12 shrink-0 select-none"
      style={{ "--badge-delay": delay } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* Rear rotated translucent square */}
      <div
        className={`aikobi-badge-back-float absolute inset-0 translate-x-1.5 -translate-y-1 rotate-12 rounded-xl border backdrop-blur-sm ${
          highlight
            ? "bg-white/15 border-white/30"
            : "bg-blue-500/10 border-blue-500/25 dark:bg-blue-400/15 dark:border-blue-300/25"
        }`}
      />
      {/* Front frosted square holding the icon */}
      <div
        className={`aikobi-badge-front-float relative z-10 w-11 h-11 rounded-xl border flex items-center justify-center shadow-sm backdrop-blur-md ${
          highlight
            ? "bg-white/25 border-white/45 text-white"
            : "bg-white/85 border-slate-200/90 text-blue-600 dark:bg-slate-900/90 dark:border-slate-700 dark:text-blue-400"
        }`}
      >
        <Icon className="w-5 h-5" aria-hidden={true} />
      </div>
    </div>
  );
}

export function AikobiPrecedentShowcase() {
  const [activeEngineId, setActiveEngineId] = React.useState<string>("quantile");

  const activeEngine = ENGINE_NODES.find((node) => node.id === activeEngineId) ?? ENGINE_NODES[1]!;

  return (
    <div className="mt-8 sm:mt-12 space-y-20 sm:space-y-28 pb-12">
      {/* ============================================================
          BAND 1: FLOATING GLASS BANNER + HANGING SIGNALS
          ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 aikobi-scroll-reveal">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/85 bg-white/85 dark:border-slate-800 dark:bg-slate-900/80 shadow-xl backdrop-blur-md p-7 sm:p-10 lg:p-12">
          {/* Subtle atmospheric radial glow behind hanging cluster */}
          <div
            aria-hidden="true"
            className="aikobi-aura-pulse pointer-events-none absolute -top-24 right-4 w-80 h-80 rounded-full bg-blue-500/20 dark:bg-blue-500/25 blur-3xl"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/70 dark:bg-blue-950/60 dark:text-blue-300">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Pantau Harga Harian
              </div>

              <h2 className="font-editorial text-2xl sm:text-3xl lg:text-[2.15rem] font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
                Perang harga terjadi setiap hari di etalase
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Asal banting harga tanpa patokan pasar hanya membuat keuntungan habis untuk perang diskon. AIKOBI
                memantau harga pesaing, ulasan pembeli, dan ongkos kirim secara bersamaan agar toko Anda memasang harga
                yang tetap laris dan tetap untung.
              </p>

              <div className="pt-2">
                <Link
                  href="/konsultasi"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold shadow-sm transition-colors"
                >
                  <span className="inline-flex items-center gap-2 text-white">
                    Cek Peta Harga Toko
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Suspended Cluster on Vertical Threads */}
            <div className="lg:col-span-6 relative">
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 pt-2 pb-4">
                {HANGING_PILLS.map((pill, idx) => (
                  <div key={pill.label} className={`${pill.position} flex flex-col items-center`}>
                    <div
                      aria-hidden="true"
                      className={`relative overflow-hidden w-px ${pill.height} bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-600/85 dark:via-blue-400/45 dark:to-blue-400/85`}
                    >
                      <span
                        className="aikobi-thread-drop absolute -left-px -top-2 w-[3px] h-3 rounded-full bg-blue-500 dark:bg-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.9)]"
                        style={
                          {
                            "--thread-dur": `${2.4 + (idx % 3) * 0.4}s`,
                            "--thread-delay": `${-idx * 0.55}s`,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                    <div
                      style={
                        {
                          "--pill-tilt": pill.tilt,
                          "--pill-dur": pill.duration,
                          "--pill-delay": `${-idx * 0.65}s`,
                        } as React.CSSProperties
                      }
                      className={`aikobi-hanging-pill px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-semibold whitespace-nowrap border shadow-md flex items-center gap-1.5 ${
                        pill.featured
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-blue-600/30"
                          : "bg-white/95 text-slate-700 border-slate-200 dark:bg-slate-800/95 dark:text-slate-100 dark:border-slate-700"
                      }`}
                    >
                      {pill.featured ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      ) : null}
                      <span>{pill.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          UNIFIED CIRCUIT ARCHITECTURE -> AIKOBI CORE CHIP
          ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 aikobi-scroll-reveal">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-12">
          <h2 className="font-editorial text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Platform konsultasi bisnis terpadu
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Empat pengecekan AIKOBI bekerja bersama menjadi satu saran harga &amp; strategi toko yang siap dijalankan.
            Klik setiap kotak untuk melihat tugasnya di <span className="font-semibold">Pusat AIKOBI</span>.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white/75 dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
            {/* Left 2x2 Interactive Engine Nodes */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ENGINE_NODES.map((node) => {
                const Icon = node.icon;
                const active = node.id === activeEngine.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setActiveEngineId(node.id)}
                    aria-current={active ? "true" : undefined}
                    className={`text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                      active
                        ? "border-blue-500 bg-blue-50/90 shadow-md dark:bg-blue-950/50 dark:border-blue-400"
                        : "border-slate-200/90 bg-white/90 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" aria-hidden={true} />
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-300">
                        {node.tag}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{node.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{node.summary}</p>
                  </button>
                );
              })}
            </div>

            {/* Center PCB Conduit SVG Bus */}
            <div className="hidden lg:flex lg:col-span-2 items-center justify-center" aria-hidden="true">
              <svg viewBox="0 0 120 220" className="w-full h-48 overflow-visible">
                <defs>
                  <linearGradient id="pcb-cobalt" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                {/* Static faint base PCB traces */}
                <path
                  d="M0 36 H34 L62 88 H120 M0 86 H44 L62 104 H120 M0 134 H44 L62 116 H120 M0 184 H34 L62 132 H120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-slate-300 dark:text-slate-700"
                />
                {/* Active illuminated pulse traces */}
                <g key={activeEngine.id}>
                  <path
                    d="M0 36 H34 L62 88 H120"
                    fill="none"
                    stroke="url(#pcb-cobalt)"
                    strokeWidth={activeEngine.id === "extractor" ? "2.6" : "1.8"}
                    strokeLinecap="round"
                    className="aikobi-circuit-pulse"
                    style={{ "--trace-delay": "0s" } as React.CSSProperties}
                  />
                  <path
                    d="M0 86 H44 L62 104 H120"
                    fill="none"
                    stroke="url(#pcb-cobalt)"
                    strokeWidth={activeEngine.id === "quantile" ? "2.6" : "1.8"}
                    strokeLinecap="round"
                    className="aikobi-circuit-pulse"
                    style={{ "--trace-delay": "0.15s" } as React.CSSProperties}
                  />
                  <path
                    d="M0 134 H44 L62 116 H120"
                    fill="none"
                    stroke="url(#pcb-cobalt)"
                    strokeWidth={activeEngine.id === "nlp" ? "2.6" : "1.8"}
                    strokeLinecap="round"
                    className="aikobi-circuit-pulse"
                    style={{ "--trace-delay": "0.3s" } as React.CSSProperties}
                  />
                  <path
                    d="M0 184 H34 L62 132 H120"
                    fill="none"
                    stroke="url(#pcb-cobalt)"
                    strokeWidth={activeEngine.id === "geo" ? "2.6" : "1.8"}
                    strokeLinecap="round"
                    className="aikobi-circuit-pulse"
                    style={{ "--trace-delay": "0.45s" } as React.CSSProperties}
                  />
                </g>
                <circle cx="118" cy="88" r="2.5" fill="#2563eb" />
                <circle cx="118" cy="104" r="2.5" fill="#2563eb" />
                <circle cx="118" cy="116" r="2.5" fill="#2563eb" />
                <circle cx="118" cy="132" r="2.5" fill="#2563eb" />
              </svg>
            </div>

            {/* Right Beveled AIKOBI Core Chip */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="relative p-6 rounded-3xl border border-blue-200/80 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-950 dark:border-blue-500/35 shadow-lg w-full max-w-xs flex flex-col items-center">
                {/* Ambient chip backlight */}
                <div
                  aria-hidden="true"
                  className="aikobi-aura-pulse pointer-events-none absolute inset-4 rounded-2xl bg-blue-500/20 dark:bg-blue-500/30 blur-2xl"
                />

                {/* Metallic Pin Array & Beveled Silicon Die */}
                <div className="aikobi-chip-float relative z-10 w-36 h-36 rounded-2xl border border-slate-300 bg-white dark:border-blue-400/40 dark:bg-slate-900 shadow-inner flex flex-col items-center justify-center">
                  {/* Side pins decorative */}
                  <div
                    aria-hidden="true"
                    className="absolute -left-2.5 inset-y-4 flex flex-col justify-between"
                  >
                    <span className="aikobi-pin-pulse w-2.5 h-1.5 rounded-l bg-blue-500/80" style={{ "--pin-delay": "0s" } as React.CSSProperties} />
                    <span className="aikobi-pin-pulse w-2.5 h-1.5 rounded-l bg-blue-500/80" style={{ "--pin-delay": "-0.5s" } as React.CSSProperties} />
                    <span className="aikobi-pin-pulse w-2.5 h-1.5 rounded-l bg-blue-500/80" style={{ "--pin-delay": "-1.0s" } as React.CSSProperties} />
                    <span className="aikobi-pin-pulse w-2.5 h-1.5 rounded-l bg-blue-500/80" style={{ "--pin-delay": "-1.5s" } as React.CSSProperties} />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute -right-2.5 inset-y-4 flex flex-col justify-between"
                  >
                    <span className="aikobi-pin-pulse w-2.5 h-1.5 rounded-r bg-blue-500/80" style={{ "--pin-delay": "-0.25s" } as React.CSSProperties} />
                    <span className="aikobi-pin-pulse w-2.5 h-1.5 rounded-r bg-blue-500/80" style={{ "--pin-delay": "-0.75s" } as React.CSSProperties} />
                    <span className="aikobi-pin-pulse w-2.5 h-1.5 rounded-r bg-blue-500/80" style={{ "--pin-delay": "-1.25s" } as React.CSSProperties} />
                    <span className="aikobi-pin-pulse w-2.5 h-1.5 rounded-r bg-blue-500/80" style={{ "--pin-delay": "-1.75s" } as React.CSSProperties} />
                  </div>

                  <div className="w-28 h-28 rounded-2xl p-1.5 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-800 dark:via-slate-800/95 dark:to-blue-950/90 border-2 border-blue-500/40 dark:border-blue-400/50 shadow-[0_8px_24px_-6px_rgba(37,99,235,0.35)] flex items-center justify-center overflow-hidden">
                    <div
                      key={activeEngine.id}
                      className="aikobi-mascot-pop w-full h-full flex items-center justify-center"
                    >
                      <Image
                        src={activeEngine.mascotSrc}
                        alt={activeEngine.mascotAlt}
                        width={112}
                        height={112}
                        className="w-full h-full object-contain drop-shadow-sm select-none pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Active Node Diagnostic Bar */}
                <div className="relative z-10 mt-5 w-full rounded-xl border border-slate-200 bg-slate-50/90 dark:border-slate-700 dark:bg-slate-900/90 px-3.5 py-2.5 text-center">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-blue-700 dark:text-blue-300 font-semibold">
                    Aktif: {activeEngine.title}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    {activeEngine.metric}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          BAND 4: ALL-IN-ONE ASYMMETRIC BENTO GRID
          ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 aikobi-scroll-reveal">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-12">
          <h2 className="font-editorial text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Semua kemampuan konsultan dalam satu alur
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Mulai dari ekstrak data pasar hingga pendampingan keputusan lewat Tanya KOBI, dirancang ringkas agar pemilik
            UMKM bisa mengambil keputusan dalam hitungan detik.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1 (Top-Left): Royal Cobalt Gradient */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl aikobi-cobalt-card p-7 sm:p-8 text-white flex flex-col justify-between min-h-[270px]">
            {/* Ambient specular sheen drift */}
            <div
              aria-hidden="true"
              className="aikobi-sheen-drift pointer-events-none -right-12 -top-12 absolute w-56 h-56 rounded-full bg-white/15 blur-2xl"
            />
            {/* Ambient Motes (transform/opacity only) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-36 overflow-hidden">
              <span
                className="aikobi-mote absolute left-8 bottom-3 w-1.5 h-1.5 rounded-full bg-white/75"
                style={{ "--mote-dur": "3.6s", "--mote-delay": "-0.3s" } as React.CSSProperties}
              />
              <span
                className="aikobi-mote absolute left-24 bottom-6 w-2 h-2 rounded-full bg-blue-100/80"
                style={{ "--mote-dur": "4.2s", "--mote-delay": "-1.5s" } as React.CSSProperties}
              />
              <span
                className="aikobi-mote absolute left-1/2 bottom-2 w-1.5 h-1.5 rounded-full bg-sky-200/75"
                style={{ "--mote-dur": "3.9s", "--mote-delay": "-2.4s" } as React.CSSProperties}
              />
              <span
                className="aikobi-mote absolute right-24 bottom-8 w-2 h-2 rounded-full bg-white/70"
                style={{ "--mote-dur": "4.4s", "--mote-delay": "-0.9s" } as React.CSSProperties}
              />
              <span
                className="aikobi-mote absolute right-12 bottom-4 w-1.5 h-1.5 rounded-full bg-blue-200/80"
                style={{ "--mote-dur": "3.7s", "--mote-delay": "-1.9s" } as React.CSSProperties}
              />
            </div>

            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-semibold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                Mesin Harga Pas
              </span>
              <h3 className="font-editorial text-2xl font-semibold tracking-tight">Cek cepat &amp; langsung bertindak.</h3>
              <p className="text-sm text-blue-50/95 leading-relaxed">
                Langsung ketahuan apakah harga barang Anda terlalu murah atau justru kemahalan dibanding barang sejenis
                yang laku terjual.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <Link
                href="/konsultasi"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-blue-50 text-xs sm:text-sm font-bold shadow-sm transition-colors"
              >
                <span className="inline-flex items-center gap-1.5 text-blue-700">
                  Cek Harga Toko Sekarang
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </Link>
            </div>
          </div>

          {/* Card 2 (Top-Right): Angled Live Market Curve Dashboard Preview */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white/90 dark:border-slate-800 dark:bg-slate-900/85 shadow-xl p-6 sm:p-7 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contoh Hasil Cek Harga
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Peta Harga Pas &amp; Peluang Laku
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                Harga Pas Rp 124rb
              </span>
            </div>

            <div className="aikobi-tilted-preview rounded-2xl border border-slate-200 bg-slate-50/90 dark:border-slate-700/80 dark:bg-slate-950/90 p-4 shadow-md">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-2">
                <span>Kategori: Sepatu Lari · 120 produk</span>
                <span className="text-blue-700 dark:text-blue-300 font-semibold">+21% Untung Lebih Baik</span>
              </div>

              <svg
                viewBox="0 0 460 140"
                role="img"
                aria-label="Grafik peta harga AIKOBI menunjukkan titik harga paling pas pada Rp 124 ribu dengan peluang laku meningkat 34%"
                className="w-full h-32 sm:h-36 overflow-visible"
              >
                <defs>
                  <linearGradient id="bento-curve-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {/* Horizontal hairline grid */}
                <line x1="16" y1="30" x2="444" y2="30" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
                <line x1="16" y1="70" x2="444" y2="70" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
                <line x1="16" y1="110" x2="444" y2="110" stroke="currentColor" className="text-slate-300 dark:text-slate-700" />

                {/* Highlighted Sweet-Spot window band */}
                <rect
                  x="190"
                  y="14"
                  width="110"
                  height="96"
                  rx="8"
                  fill="#059669"
                  fillOpacity="0.12"
                  stroke="#059669"
                  strokeOpacity="0.45"
                  strokeDasharray="4 3"
                />

                {/* Area & Quantile curve */}
                <path
                  d="M16 105 C75 96, 128 74, 190 44 C236 22, 268 20, 300 38 C345 64, 392 86, 444 98 L444 110 L16 110 Z"
                  fill="url(#bento-curve-fill)"
                />
                <path
                  d="M16 105 C75 96, 128 74, 190 44 C236 22, 268 20, 300 38 C345 64, 392 86, 444 98"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <path
                  d="M16 105 C75 96, 128 74, 190 44 C236 22, 268 20, 300 38 C345 64, 392 86, 444 98"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  className="aikobi-curve-trace"
                />

                {/* Key quantile markers */}
                <circle cx="190" cy="44" r="4" fill="#64748b" />
                <circle cx="246" cy="24" r="6" fill="none" stroke="#10b981" strokeWidth="1.6" className="aikobi-beacon-ring" />
                <circle cx="246" cy="24" r="6" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                <circle cx="300" cy="38" r="4" fill="#64748b" />

                <text x="20" y="128" fontSize="10" fill="currentColor" className="text-slate-500 dark:text-slate-400 font-mono">
                  Rp 85rb (Terlalu Murah)
                </text>
                <text x="200" y="128" fontSize="10" fill="#059669" className="font-mono font-bold">
                  Harga Paling Pas
                </text>
                <text x="352" y="128" fontSize="10" fill="currentColor" className="text-slate-500 dark:text-slate-400 font-mono">
                  Rp 155rb+ (Kemahalan)
                </text>
              </svg>
            </div>
          </div>

          {/* Card 3 (Bottom-Left): Cascading Real-time Market Signals */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white/90 dark:border-slate-800 dark:bg-slate-900/85 shadow-xl p-6 sm:p-7">
            <div className="mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Saran berbasis bukti pasar
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Setiap perubahan harga pesaing dan keluhan pembeli dirangkum menjadi daftar tugas harian.
              </p>
            </div>

            <div className="space-y-3">
              {BENTO_ALERTS.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/85 dark:border-slate-800 dark:bg-slate-950/80"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-wider shrink-0 ${item.tone}`}
                    >
                      {item.tag}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">{item.detail}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4 (Bottom-Right): High-Contrast Tanya KOBI Action Card */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-900 text-white dark:border-slate-700/80 dark:bg-slate-950 p-7 sm:p-8 shadow-xl flex flex-col justify-between">
            <div
              aria-hidden="true"
              className="aikobi-aura-pulse pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-44 rounded-full bg-blue-500/40 blur-3xl"
            />
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/90 border border-blue-400/50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="font-editorial text-2xl font-semibold tracking-tight">Konsultasi taktis 24 jam.</h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                Tanyakan strategi bundel, copywriting deskripsi, hingga simulasi diskon langsung ke Tanya KOBI yang
                memahami data etalase Anda.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <Link
                href="/tanya"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold shadow-md transition-colors"
              >
                <span className="inline-flex items-center gap-2 text-white">
                  Buka Tanya KOBI
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FANNED 5-CARD FOUNDATION GRID WITH 3D GLASS BADGES
          ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 aikobi-scroll-reveal">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-12">
          <h2 className="font-editorial text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Dibuat sederhana untuk membantu jualan UMKM sehari-hari
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Dirancang khusus untuk pemilik toko UMKM Indonesia agar mudah dipahami, jelas buktinya, dan aman tanpa login akun toko.
          </p>
        </div>

        <div className="space-y-5">
          {/* Top Row: 2 angled wide cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FOUNDATION_TOP_ROW.map((card, idx) => (
              <article
                key={card.id}
                className={`rounded-3xl border border-slate-200/90 bg-white/85 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md p-7 shadow-lg transition-transform duration-300 ${card.tiltClass}`}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <DualSquareGlassIcon icon={card.icon} delay={`${-idx * 1.1}s`} />
                  <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {card.eyebrow}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{card.description}</p>
              </article>
            ))}
          </div>

          {/* Bottom Row: 3 angled cards, bottom-left highlighted in Cobalt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FOUNDATION_BOTTOM_ROW.map((card, idx) => (
              <article
                key={card.id}
                className={`rounded-3xl p-7 transition-transform duration-300 ${
                  card.highlight
                    ? "aikobi-cobalt-card text-white"
                    : "border border-slate-200/90 bg-white/85 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md shadow-lg"
                } ${card.tiltClass}`}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <DualSquareGlassIcon icon={card.icon} highlight={card.highlight} delay={`${-(idx + 2) * 0.9}s`} />
                  <span
                    className={`text-xs font-mono font-semibold uppercase tracking-wider ${
                      card.highlight ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {card.eyebrow}
                  </span>
                </div>
                <h3
                  className={`text-lg font-bold ${
                    card.highlight ? "text-white" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {card.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    card.highlight ? "text-blue-50/95" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          BAND 7: FINAL VOLUMETRIC SPOTLIGHT CTA
          ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 aikobi-scroll-reveal">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/90 bg-gradient-to-b from-slate-50 via-white to-blue-50/70 dark:border-slate-800 dark:from-[#070b14] dark:via-[#0b1222] dark:to-[#0d1933] px-6 py-16 sm:px-12 sm:py-24 text-center shadow-2xl">
          {/* Upward volumetric spotlight cone */}
          <div
            aria-hidden="true"
            className="pointer-events-none aikobi-spotlight-cone absolute inset-x-0 -top-6 h-full w-full"
          />

          {/* Floating bokeh motes in light beam */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <span
              className="aikobi-mote absolute left-[18%] bottom-10 w-2 h-2 rounded-full bg-blue-500/55 dark:bg-blue-300/75"
              style={{ "--mote-dur": "3.8s", "--mote-delay": "-0.4s" } as React.CSSProperties}
            />
            <span
              className="aikobi-mote absolute left-[29%] bottom-20 w-2.5 h-2.5 rounded-full bg-blue-400/50 dark:bg-white/65"
              style={{ "--mote-dur": "4.4s", "--mote-delay": "-1.6s" } as React.CSSProperties}
            />
            <span
              className="aikobi-mote absolute left-[42%] bottom-12 w-1.5 h-1.5 rounded-full bg-sky-500/60 dark:bg-sky-200/75"
              style={{ "--mote-dur": "3.5s", "--mote-delay": "-2.5s" } as React.CSSProperties}
            />
            <span
              className="aikobi-mote absolute right-[40%] bottom-16 w-2 h-2 rounded-full bg-indigo-500/55 dark:bg-blue-200/75"
              style={{ "--mote-dur": "4.0s", "--mote-delay": "-0.9s" } as React.CSSProperties}
            />
            <span
              className="aikobi-mote absolute right-[28%] bottom-22 w-2.5 h-2.5 rounded-full bg-blue-500/45 dark:bg-white/60"
              style={{ "--mote-dur": "4.6s", "--mote-delay": "-2.1s" } as React.CSSProperties}
            />
            <span
              className="aikobi-mote absolute right-[16%] bottom-12 w-1.5 h-1.5 rounded-full bg-blue-400/55 dark:bg-blue-300/70"
              style={{ "--mote-dur": "3.7s", "--mote-delay": "-1.2s" } as React.CSSProperties}
            />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="font-editorial text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Mulai Cek Harga &amp; Untung Toko Anda Hari Ini
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
              Pengecekan etalase selesai dalam hitungan detik, lengkap dengan batas harga paling pas, rangkuman ulasan
              pembeli, dan rencana jualan 30 hari.
            </p>

            {/* Centerpiece Liquid-Glass Spotlight Capsule CTA */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <div className="relative inline-flex items-center justify-center">
                <span
                  aria-hidden="true"
                  className="aikobi-cta-ring pointer-events-none absolute -inset-1 rounded-2xl border-2 border-blue-400/55 dark:border-blue-300/60"
                />
                <Link
                  href="/konsultasi"
                  className="aikobi-spotlight-cta relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm sm:text-base font-bold"
                >
                  Mulai Konsultasi Gratis
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

              <Link
                href="/tanya"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold border border-slate-300 bg-white/85 hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:hover:bg-slate-800 backdrop-blur-md transition-colors"
              >
                <span className="inline-flex items-center justify-center gap-2 text-slate-800 dark:text-slate-100">
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  Buka Tanya KOBI
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

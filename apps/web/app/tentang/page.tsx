import type { Metadata } from 'next';
import Image from 'next/image';
import {
  BarChart3,
  CheckCircle2,
  Compass,
  Layers,
  ShieldCheck,
  Target,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang AIKOBI | Akal Imitasi Konsultan Bisnis',
  description:
    'Misi, dedikasi, dan teknologi di balik pengembangan AIKOBI (Akal Imitasi Konsultan Bisnis) untuk UMKM dan merchant online Indonesia.',
};

const PILLARS = [
  {
    step: '01',
    title: 'Ambil Data Etalase Langsung',
    badge: 'Live Extraction',
    accentBorder: 'border-t-emerald-500',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    heightClass: 'md:min-h-[290px]',
    icon: BarChart3,
    description:
      'Rekomendasi diambil langsung dari daftar harga pesaing, pilihan varian produk, bintang rating, dan ulasan pembeli Tokopedia saat itu juga tanpa perlu login akun toko.',
    points: ['Filter harga pancingan otomatis', 'Deteksi varian & paket satuan'],
  },
  {
    step: '02',
    title: 'Cek Ongkir & Pesaing Sekota',
    badge: 'Geolocation Edge',
    accentBorder: 'border-t-blue-600',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    heightClass: 'md:min-h-[345px]',
    icon: Truck,
    description:
      'AIKOBI membandingkan produk Anda dengan toko pesaing yang berada di wilayah pengiriman yang sama agar ongkos kirim dan kecepatan sampai Anda lebih bersaing.',
    points: ['Peta pesaing satu hub kota', 'Keunggulan ongkir regional'],
  },
  {
    step: '03',
    title: 'Saran Jualan Siap Pakai',
    badge: 'Actionable AI',
    accentBorder: 'border-t-amber-500',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    heightClass: 'md:min-h-[400px]',
    icon: Target,
    description:
      'Menyajikan rentang harga paling pas, rangkuman isi ulasan pembeli, alasan perbedaan harga pesaing, serta konsultasi interaktif lewat Tanya KOBI.',
    points: ['Zona harga wajar (sweet-spot)', 'Rencana aksi praktis 30 hari'],
  },
] as const;

const PRINCIPLES = [
  {
    title: 'Objektif Berbasis Angka',
    detail: 'Setiap saran mengacu pada distribusi harga pasar nyata dan ulasan pembeli.',
    icon: Layers,
  },
  {
    title: 'Ramah Pelaku UMKM',
    detail: 'Bahasa sederhana tanpa istilah teknis rumit—langsung fokus ke langkah eksekusi.',
    icon: ShieldCheck,
  },
  {
    title: 'Kontekstual Pasar Indonesia',
    detail: 'Memahami dinamika marketplace lokal, sensitivitas ongkir, hingga psikologi harga.',
    icon: Compass,
  },
] as const;

export default function TentangPage() {
  return (
    <div className="relative py-4 sm:py-8 space-y-16 sm:space-y-24 max-w-6xl mx-auto">
      {/* ============================================================
          SECTION 1: ASYMMETRIC HERO WITH MASCOT GREETING STAGE
          ============================================================ */}
      <section className="relative z-10 pt-2 sm:pt-4">
        {/* Ambient Grid & Glow (Matches Landing Page) */}
        <div
          aria-hidden="true"
          className="aikobi-hero-grid pointer-events-none absolute inset-x-0 -top-6 h-[520px] -z-20"
        />
        <div
          aria-hidden="true"
          className="aikobi-aura-pulse pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 -z-10 w-[340px] sm:w-[660px] h-[280px] sm:h-[380px] rounded-full blur-3xl opacity-65 dark:opacity-35"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(37, 99, 235, 0.16) 0%, rgba(16, 185, 129, 0.10) 42%, transparent 68%)',
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Editorial Story (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-[3.1rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Tentang AIKOBI,
              </h1>
              <p className="font-editorial text-2xl sm:text-3xl lg:text-[2.65rem] text-blue-600 dark:text-blue-400 leading-[1.18]">
                Akal Imitasi Konsultan Bisnis
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Kami menciptakan AIKOBI untuk membebaskan pelaku UMKM dan penjual e-commerce Indonesia dari tebak-menebak harga jual. Cukup satu tempat untuk memetakan persaingan etalase, keunggulan ongkir lokal, ulasan pembeli, hingga berkonsultasi langsung bersama KOBI.
            </p>

            {/* Compact Trust Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
              <div className="flat-surface p-3 text-center lg:text-left">
                <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                  100%
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Tanpa Login Toko
                </div>
              </div>
              <div className="flat-surface p-3 text-center lg:text-left">
                <div className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                  20+
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Pesaing Dianalisis
                </div>
              </div>
              <div className="flat-surface p-3 text-center lg:text-left">
                <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  24/7
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Konsultan UMKM
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Mascot Greeting Stage (5 cols) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center py-4">
            {/* Rotating Dashed Orbital Rings */}
            <svg
              aria-hidden="true"
              viewBox="0 0 320 320"
              className="aikobi-hero-spin pointer-events-none absolute w-72 h-72 sm:w-88 sm:h-88 text-blue-500/20 dark:text-blue-400/20 -z-10"
            >
              <circle
                cx="160"
                cy="160"
                r="142"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="7 9"
              />
              <circle cx="160" cy="18" r="4" fill="#2563EB" fillOpacity="0.7" />
            </svg>
            <svg
              aria-hidden="true"
              viewBox="0 0 260 260"
              className="aikobi-hero-spin-rev pointer-events-none absolute w-56 h-56 sm:w-72 sm:h-72 text-emerald-500/20 dark:text-emerald-400/20 -z-10"
            >
              <circle
                cx="130"
                cy="130"
                r="112"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="4 10"
              />
              <circle cx="18" cy="130" r="3.5" fill="#10B981" fillOpacity="0.75" />
            </svg>

            {/* Ambient Bokeh Motes */}
            <span
              aria-hidden="true"
              className="aikobi-mote pointer-events-none absolute left-8 top-10 w-2 h-2 rounded-full bg-blue-500/50 dark:bg-blue-300/60"
              style={{ '--mote-dur': '4.0s', '--mote-delay': '-0.5s' } as React.CSSProperties}
            />
            <span
              aria-hidden="true"
              className="aikobi-mote pointer-events-none absolute right-10 top-16 w-1.5 h-1.5 rounded-full bg-emerald-500/55 dark:bg-emerald-300/60"
              style={{ '--mote-dur': '3.7s', '--mote-delay': '-1.6s' } as React.CSSProperties}
            />

            {/* Top-Left Floating Callout Card */}
            <div className="aikobi-hero-float-left absolute left-0 sm:left-2 top-6 z-20 px-3.5 py-2.5 rounded-2xl border border-slate-200/80 bg-white/85 dark:border-slate-700/70 dark:bg-slate-900/80 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                <span>Halo, Sahabat UMKM!</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Siap bantu ukur harga paling pas
              </p>
            </div>

            {/* Mascot Greeting Image */}
            <div className="relative z-10 w-64 sm:w-76 md:w-80 translate-y-2">
              <Image
                src="/brand/mascot/mascot-greeting.png"
                alt="KOBI Maskot AIKOBI menyapa ramah dengan sayap terangkat"
                width={520}
                height={495}
                priority
                className="aikobi-mascot-greet w-full h-auto object-contain select-none drop-shadow-[0_18px_28px_rgba(37,99,235,0.16)]"
              />
            </div>

            {/* 3D Fluted Pedestal Disc Cap */}
            <div
              aria-hidden="true"
              className="relative -mt-4 z-0 w-60 sm:w-72 h-10 rounded-[100%] pedestal-cap flex items-center justify-center shadow-xl border border-slate-200/60 dark:border-slate-700/50"
            >
              <div className="w-[82%] h-[58%] rounded-[100%] bg-gradient-to-b from-white/90 to-slate-100/40 dark:from-slate-700/30 dark:to-slate-800/20 blur-[1px]" />
            </div>

            {/* Bottom-Right Floating Callout Card */}
            <div className="aikobi-hero-float-right absolute right-0 sm:right-2 bottom-4 z-20 px-3.5 py-2.5 rounded-2xl border border-slate-200/80 bg-white/85 dark:border-slate-700/70 dark:bg-slate-900/80 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Data Nyata, Bukan Tebakan</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Pasar + Ongkir + Ulasan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: ASYMMETRIC BENTO — MISI & PRINSIP KERJA
          ============================================================ */}
      <section className="aikobi-scroll-reveal grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Bento Card: Mission & Contrast Comparison (7 cols) */}
        <div className="lg:col-span-7 flat-surface p-6 sm:p-8 flex flex-col justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Misi Kami</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
              Mengubah tebak-menebak harga menjadi strategi yang terukur.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Banyak pelaku usaha e-commerce menentukan harga hanya berdasarkan insting atau ikut-ikutan membanting harga kompetitor tanpa melihat struktur pasar. Akibatnya, margin tergerus atau produk kalah bersaing. AIKOBI menutup celah tersebut dengan menggabungkan data harga, rating, ulasan pembeli, dan lokasi pengiriman menjadi rekomendasi yang siap diterapkan hari ini.
            </p>
          </div>

          {/* Mini Before vs After Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Cara Lama (Insting)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Ikut harga termurah tanpa filter barang pancingan, margin menipis, dan komplain pembeli tidak terpetakan.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Pendekatan AIKOBI
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Menemukan zona harga wajar, menonjolkan keunggulan ongkir sekota, dan menyusun aksi perbaikan ulasan.
              </p>
            </div>
          </div>
        </div>

        {/* Right Bento Card: Liquid Glass Principles List (5 cols) */}
        <div className="lg:col-span-5 precedent-pill p-6 sm:p-8 rounded-3xl flex flex-col justify-between gap-5">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nilai Dasar KOBI
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Dirancang khusus untuk ritme jualan UMKM Indonesia
            </h2>
          </div>

          <div className="space-y-3">
            {PRINCIPLES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group p-3.5 rounded-2xl bg-white/75 dark:bg-slate-900/65 border border-slate-200/80 dark:border-slate-700/70 flex items-start gap-3 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: STEPPED 3 CORE PILLARS (ASCENDING LEFT TO RIGHT)
          ============================================================ */}
      <section className="aikobi-scroll-reveal space-y-8 pb-4 md:pb-8">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Cara Kerja Platform
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tiga Pilar Utama AIKOBI
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch md:items-end md:pt-12">
          {/* Desktop Curly Flow Arrows Connecting Pillars 01 → 02 → 03 */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1088 170"
            preserveAspectRatio="none"
            className="hidden md:block pointer-events-none absolute inset-x-0 top-0 w-full h-[170px] z-10 overflow-visible"
          >
            {/* Base Hand-Drawn Loop Paths */}
            <g
              fill="none"
              className="stroke-blue-600/80 dark:stroke-blue-400/80"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Arrow 1: Card 01 → Card 02 */}
              <path
                d="M 195 146 C 245 78, 345 68, 360 104 C 370 128, 326 128, 334 96 C 344 62, 430 56, 490 90"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 476 86 L 491 91 L 486 74"
                vectorEffect="non-scaling-stroke"
              />

              {/* Arrow 2: Card 02 → Card 03 */}
              <path
                d="M 548 91 C 598 22, 705 14, 720 48 C 730 72, 686 72, 694 40 C 704 10, 810 8, 878 38"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 864 34 L 879 39 L 874 22"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            {/* Animated Signal Highlight Along Curves */}
            <g
              fill="none"
              className="stroke-cyan-400 dark:stroke-cyan-300"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeOpacity="0.7"
            >
              <path
                d="M 195 146 C 245 78, 345 68, 360 104 C 370 128, 326 128, 334 96 C 344 62, 430 56, 490 90"
                className="aikobi-curve-trace"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 548 91 C 598 22, 705 14, 720 48 C 730 72, 686 72, 694 40 C 704 10, 810 8, 878 38"
                className="aikobi-curve-trace"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </svg>

          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.step}
                className={`group flat-surface p-6 flex flex-col justify-between gap-5 border-t-4 ${pillar.accentBorder} ${pillar.heightClass} transition-transform duration-300 hover:-translate-y-1.5`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl ${pillar.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${pillar.badgeClass}`}>
                        {pillar.badge}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-300 dark:text-slate-600">
                        {pillar.step}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <ul className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  {pillar.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

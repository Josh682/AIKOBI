'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Bot,
  User,
  Lightbulb,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  X,
  ChevronRight,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  category?: string;
  followUps?: string[];
}

export interface PromptStarter {
  id: string;
  title: string;
  category: string;
  prompt: string;
  iconName: 'tag' | 'truck' | 'shopping-bag' | 'shield-check' | 'search';
  badge: string;
  summary: string;
  dummyAnswer: string;
  followUps: string[];
}

const STARTER_PROMPTS: PromptStarter[] = [
  {
    id: 'starter-1',
    title: 'Strategi Harga Produk Baru vs Official Store',
    category: 'Strategi Harga',
    badge: 'Penetration Pricing',
    iconName: 'tag',
    summary: 'Taktik penetrasi harga bersaing tanpa merusak persepsi mutu produk di Tokopedia.',
    prompt: 'Bagaimana cara menentukan harga produk baru agar bersaing dengan Official Store di Tokopedia?',
    dummyAnswer: `Menembus pasar Tokopedia melawan Official Store yang sudah mengantongi ribuan ulasan membutuhkan strategi **Penetration-to-Sweetspot Scaling**, bukan sekadar perang harga banting murah.

Berikut 3 langkah operasional taktis rekomendasi KOBI:

### 1. Fase Penetrasi Awal (1 - 20 Transaksi Pertama)
* **Pasang Harga P10 (-10% s/d -15% di bawah Official Store)**: Jangan memberi diskon terlalu ekstrem (>25%) karena konsumen Indonesia justru mencurigai barang cacat, rekondisi, atau tiruan (*fake product*).
* **Manfaatkan Fitur 'Harga Coret' Tokopedia**: Tampilkan harga normal misal **Rp 135.000** dicoret menjadi **Rp 109.000**. Algoritma pencarian Tokopedia memprioritaskan etalase yang memiliki diskon aktif.

### 2. Diferensiasi Layanan yang Tidak Bisa Diberikan Official Store
Official Store biasanya memiliki respon chat yang lambat (rata-rata 15-30 menit) dan antrean pengemasan yang panjang.
* **Kecepatan Balas Chat**: Jaga waktu respons di bawah 3 menit. Pembeli e-commerce yang bertanya ketersediaan stok akan langsung beralih jika chat tidak segera dibalas.
* **Proteksi Ekstra Gratis**: Tonjolkan di foto kedua: *"Free Box Kardus + 3 Lapis Bubble Wrap Tebal"*. Ini meniadakan kekhawatiran terbesar pembeli barang rusak di perjalanan.

### 3. Evaluasi Kenaikan Bertahap Menuju Zona Sweet-Spot
Setelah produk Anda mengumpulkan **15-20 ulasan bintang 5 dengan foto asli**:
* Naikkan harga secara bertahap **+4% hingga +6% per minggu** menuju rata-rata konsensus pasar (*Sweet-Spot*).
* Konsumen yang datang setelah ada ulasan sosial tidak lagi terlalu sensitif terhadap selisih harga Rp 5.000 - Rp 10.000.`,
    followUps: [
      'Bagaimana draf deskripsi produk untuk menonjolkan garansi?',
      'Cara menaikkan rating toko ke 4.8 dalam 30 hari',
    ],
  },
  {
    id: 'starter-2',
    title: 'Keunggulan Ongkir Seller Daerah vs Jakarta',
    category: 'Logistik & Ongkir',
    badge: 'Regional Advantage',
    iconName: 'truck',
    summary: 'Maksimalkan ongkir hemat & pengiriman cepat untuk menguasai pasar Jawa Tengah & Timur.',
    prompt: 'Toko saya berlokasi di Solo/Bandung, bagaimana cara bersaing ongkir dengan seller Jakarta?',
    dummyAnswer: `Berlokasi di luar Jabodetabek bukanlah kelemahan, melainkan **keunggulan logistik komparatif** yang sangat bernilai jika Anda membidik segmen pasar regional yang tepat!

Berikut formula KOBI untuk memenangkan pesanan dari seller Jakarta:

### 1. Kuasai Segmen Pembeli Jawa Tengah, DIY, & Jawa Timur
* Pembeli di Solo, Semarang, Jogja, Surabaya, dan Malang dikenakan ongkir hanya **Rp 8.000 - Rp 11.000** dari toko Anda dengan waktu sampai 1 hari (*Next Day Delivery*).
* Sebagai perbandingan, pengiriman seller Jakarta ke area tersebut memakan biaya **Rp 16.000 - Rp 22.000** dan waktu transit 2-3 hari kerja.
* **Aksi Taktis**: Pasang banner etalase bertuliskan: *"Kirim dari Solo: Ongkir Lebih Hemat & Tiba Lebih Cepat untuk Seluruh Jateng & Jatim"*.

### 2. Manfaatkan Efisiensi Biaya Daerah untuk Subsidi Ongkir
Biaya sewa gudang dan operasional harian di daerah umumnya lebih terukur dibanding Jakarta.
* Alokasikan sebagian marjin penghematan tersebut untuk mengaktifkan **Bebas Ongkir Tokopedia** dan buat **Voucher Subsidi Ongkir Toko (Rp 5.000)** dengan syarat belanja tertentu.
* Pembeli Tokopedia sangat memperhitungkan *Total Checkout Amount* (harga barang + ongkir).

### 3. Maksimalkan Cut-Off Waktu Pick-Up Kurir Sore
* Jalin kerja sama dengan hub kurir lokal (J&T, SiCepat, JNE) agar drop-off / pick-up dapat dilakukan hingga pukul **17.00 - 18.00 WIB**.
* Cantumkan dengan jelas di deskripsi: *"Pesanan sebelum pukul 16.00 dikirim pada hari yang sama!"*. Ini menjadi penentu konversi saat pembeli membutuhkan barang segera.`,
    followUps: [
      'Hitung estimasi penghematan ongkir vs seller Jakarta',
      'Format teks banner etalase untuk toko daerah',
    ],
  },
  {
    id: 'starter-3',
    title: 'Formula Bundling untuk Menaikkan AOV',
    category: 'Margin & Bundling',
    badge: 'AOV Multiplier',
    iconName: 'shopping-bag',
    summary: 'Paket komplementer dan anchor pricing untuk mendongkrak margin tanpa terkesan mahal.',
    prompt: 'Apa strategi bundling yang efektif untuk menaikkan Average Order Value (AOV) tanpa terkesan mahal?',
    dummyAnswer: `Menaikkan harga produk satuan secara sepihak berisiko menurunkan angka konversi (*conversion drop*). Cara paling teruji untuk melipatgandakan omzet toko adalah **Strategi Bundling Komplementer**.

KOBI merekomendasikan formula **Anchor + Hero Bundle + Complementary Add-on**:

### 1. Produk Satuan sebagai Anchor Price (Jangkar)
* Tampilkan produk satuan di harga pasar normal (misal: *Kopi Arabika 250g seharga Rp 65.000*). Ini berfungsi sebagai patokan psikologis (*price anchor*) bagi calon pembeli.

### 2. Bentuk Paket Bundling Pahlawan (Hero Bundle)
* Gabungkan 2 unit produk sejenis atau pasangkan dengan barang komplementer:
  - *Isi Paket*: 2x Kopi Arabika 250g + 1x Drip Bag Tester.
  - *Harga Beli Terpisah*: Rp 130.000 + Rp 15.000 = Rp 145.000.
  - *Harga Bundling Promo*: **Rp 125.000** (Pembeli merasa hemat Rp 20.000).
* **Keuntungan Nyata Toko**: Nilai transaksi (AOV) melonjak dari Rp 65.000 menjadi Rp 125.000 (**+92% AOV**), sementara biaya kardus packing dan waktu pengerjaan admin hanya keluar 1 kali!

### 3. Trik Tampilan Etalase Tokopedia
* Jadikan opsi bundling sebagai **Varian Produk** di halaman etalase yang sama.
* Beri label varian yang menarik: *"Paket Hemat 2 Pcs (+Bonus Tester)"*.
* Pembeli yang awalnya hanya berniat membeli 1 unit akan terdorong beralih ke paket bundling karena melihat perbandingan nilai yang jauh lebih menguntungkan.`,
    followUps: [
      'Contoh ide bundling untuk kategori fashion & aksesoris',
      'Bagaimana menghitung batas diskon bundling agar tidak rugi?',
    ],
  },
  {
    id: 'starter-4',
    title: 'SOP & Mitigasi Penanganan Ulasan Bintang 1',
    category: 'Ulasan & Reputasi',
    badge: 'Crisis Recovery',
    iconName: 'shield-check',
    summary: 'Cara merespons komplain publik agar calon pembeli lain tetap percaya dan konversi aman.',
    prompt: 'Bagaimana cara merespons ulasan bintang 1 agar calon pembeli lain tetap percaya dan konversi tidak anjlok?',
    dummyAnswer: `Prinsip fundamental konsultan bisnis: **Balasan ulasan negatif Anda bukan untuk berdebat dengan pengomplain, melainkan untuk meyakinkan ratusan calon pembeli masa depan yang membaca etalase tersebut!**

Berikut SOP 3 langkah mitigasi ulasan bintang 1 dari KOBI:

### 1. Jangan Defensif atau Menyalahkan Pembeli & Kurir
Hindari balasan seperti *"Salah sendiri tidak membaca deskripsi"* atau *"Kurir yang lelet kenapa rating toko yang dirusak"*. Balasan bernada emosional langsung menurunkan kepercayaan pembeli baru hingga 35%.

### 2. Gunakan Template Balasan Solutif & Terbuka
Berikut draf balasan standar emas KOBI:
> *"Halo Kak [Nama Pembeli], terima kasih banyak atas masukannya. Kami memohon maaf yang sebesar-besarnya atas ketidaknyamanan terkait [sebut kendala spesifik, misal: kemasan yang penyok / jahitan yang terlepas]. Kepuasan pembeli adalah prioritas nomor 1 kami.*
>
> *Tim kami telah mengirimkan pesan personal melalui chat Tokopedia untuk memberikan solusi penggantian unit baru 100% gratis tanpa biaya tambahan. Mohon berkenan mengecek inbox ya Kak. Terima kasih telah membantu toko kami menjadi lebih baik."*

### 3. Taktik 'Tenggelamkan' Rating Negatif Secara Sehat
Ulasan bintang 1 paling merusak ketika berada di 3 baris teratas tab ulasan.
* Hubungi 15-20 pembeli terakhir yang sudah menerima pesanan dengan baik: *"Halo Kak, paketnya sudah tiba ya? Jika Kakak berkenan meluangkan 1 menit memberi ulasan bintang 5 dengan foto, ada voucher diskon Rp 10.000 untuk order berikutnya!"*
* Masuknya 5-10 ulasan bintang 5 baru dengan foto akan secara otomatis menggeser ulasan negatif ke halaman bawah.`,
    followUps: [
      'Draf balasan untuk kendala barang rusak akibat ekspedisi',
      'Cara klaim asuransi barang rusak ke Tokopedia Care',
    ],
  },
  {
    id: 'starter-5',
    title: 'Formula Judul & Foto Etalase Standar SEO',
    category: 'Etalase & SEO',
    badge: 'Discovery Algorithm',
    iconName: 'search',
    summary: 'Struktur judul 70 karakter & hierarki 4 foto produk berdaya konversi tinggi.',
    prompt: 'Format judul etalase dan susunan foto produk apa yang paling disukai algoritma pencarian Tokopedia?',
    dummyAnswer: `Algoritma pencarian Tokopedia (*Search Discovery Engine*) memprioritaskan relevansi kata kunci judul dan rasio klik (*Click-Through Rate* / CTR) foto utama etalase Anda.

Berikut susunan etalase standar emas rekomendasi KOBI:

### 1. Formula Judul Produk (Maksimal 70 Karakter)
Gunakan rumus baku: **[Jenis Produk] + [Merek / Nama Toko] + [Spesifikasi Utama] + [Keunggulan / Bahan / Varian]**
* *Contoh Dihindari (Keyword Stuffing)*: \`KEMEJA BATIK PRIA MURAH BANGET PROMO DISKON TERLARIS 2026\` (Beresiko terkena penalti algoritma karena spam kata sifat).
* *Contoh Standar Emas*: \`Kemeja Batik Pria Lengan Panjang Motif Parang Solo Katun Halus Slim Fit\`

### 2. Hierarki 4 Foto Utama Etalase (Rasio 1:1)
* **Foto 1 (Cover Utama / Thumbnail)**: Wajib latar belakang putih bersih atau pencahayaan studio jelas, resolusi minimal 1000x1000 px. Tampilkan produk utuh tanpa watermark yang menutupi lebih dari 15% area.
* **Foto 2 (Detail Material / Macro Zoom-in)**: Tampilkan tekstur serat kain, bahan komponen, atau jahitan untuk memberikan rasa percaya mutu fisik.
* **Foto 3 (Infografis Panduan Ukuran / Size Chart)**: Tabel ukuran nyata (panjang, lingkar dada, berat) untuk memangkas angka retur komplain ukuran hingga 40%.
* **Foto 4 (Kemasan Asli & Proteksi Packing)**: Tunjukkan kotak kardus atau kemasan tebal yang akan diterima pembeli di rumah.

### 3. Kunci Deskripsi Produk
Gunakan 3 paragraf ringkas dengan poin-poin tegas (*bullet points*). Masukkan kata kunci pencarian sekunder di 100 kata pertama deskripsi.`,
    followUps: [
      'Audit judul produk saya apakah sudah memenuhi kaidah SEO',
      'Berapa rasio CTR foto etalase yang tergolong sehat di Tokopedia?',
    ],
  },
];

const PREVIEW_CONVERSATION: ChatMessage[] = [
  {
    id: 'sample-1',
    role: 'user',
    content: 'Bagaimana cara menentukan harga produk baru agar bersaing dengan Official Store di Tokopedia?',
    timestamp: '12:35',
  },
  {
    id: 'sample-2',
    role: 'assistant',
    content: STARTER_PROMPTS[0].dummyAnswer,
    timestamp: '12:35',
    category: 'Strategi Harga',
    followUps: STARTER_PROMPTS[0].followUps,
  },
];

export function AikobiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const categories = ['Semua', 'Strategi Harga', 'Logistik & Ongkir', 'Margin & Bundling', 'Ulasan & Reputasi', 'Etalase & SEO'];

  // Auto-scroll to latest message
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendPrompt = (promptText: string, starter?: PromptStarter) => {
    if (!promptText.trim() || isTyping) return;

    const userMsgId = `user-${Date.now()}`;
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: promptText.trim(),
      timestamp: now,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Realistic consultative response delay simulation
    setTimeout(() => {
      let assistantResponse = '';
      let followUps: string[] = [];
      let category = 'Konsultasi Bisnis';

      if (starter) {
        assistantResponse = starter.dummyAnswer;
        followUps = starter.followUps;
        category = starter.category;
      } else {
        // Find if matches starter prompt keyword
        const matched = STARTER_PROMPTS.find(
          (s) =>
            promptText.toLowerCase().includes(s.title.toLowerCase()) ||
            promptText.toLowerCase().includes(s.category.toLowerCase()) ||
            promptText.toLowerCase().includes(s.badge.toLowerCase())
        );

        if (matched) {
          assistantResponse = matched.dummyAnswer;
          followUps = matched.followUps;
          category = matched.category;
        } else {
          // Dynamic consultative fallback dummy response
          assistantResponse = `Terima kasih atas pertanyaan Anda mengenai **"${promptText.trim()}"**.

Berikut tinjauan strategis dan rekomendasi operasional dari KOBI untuk toko Anda di Tokopedia:

### 1. Evaluasi & Diagnosa Masalah Toko
Pertanyaan Anda menyentuh aspek krusial dalam pertumbuhan etalase marketplace. Berdasarkan data persaingan pedagang Tokopedia, performa produk ditentukan oleh tiga faktor utama: **Daya Tarik Harga (Price Sweet-Spot)**, **Kecepatan Layanan & Ongkos Kirim**, serta **Rasio Ulasan Positif Pembeli**.

### 2. Rekomendasi Rencana Aksi (Action Plan)
* **Analisis Posisi Pasar**: Bandingkan harga toko Anda dengan rata-rata 20 kompetitor aktif terdekat. Jangan mematok harga di batas paling atas tanpa dukungan ulasan bintang 4.8+.
* **Tingkatkan Daya Konversi Visual**: Pastikan foto produk memperlihatkan detail kemasan kardus protektif dan kelengkapan varian untuk membedakan toko Anda dari kompetitor dropshipper.
* **Gunakan Fitur Promosi Tokopedia**: Aktifkan fitur *Bebas Ongkir* dan buat voucher toko minimal belanja untuk memicu pembeli menambah jumlah produk di keranjang (*upselling*).

### 3. Validasi dengan Data Nyata
Untuk mendapatkan simulasi harga wajar kuantil yang akurat dan audit ulasan pembeli otomatis, Anda dapat mengaudit produk Tokopedia Anda secara langsung di menu **Konsultasi Bisnis**.`;
          followUps = [
            'Bagaimana cara menghitung margin laba bersih setelah potongan fee Tokopedia?',
            'Cara membuat foto produk menarik dengan modal smartphone',
            'Rekomendasi kata kunci pencarian untuk kategori produk saya',
          ];
        }
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        category,
        followUps,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(inputValue);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
  };

  const handleLoadSample = () => {
    setMessages(PREVIEW_CONVERSATION);
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

  // Helper to format assistant markdown text cleanly
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h4
            key={idx}
            className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2"
          >
            <span className="w-1.5 h-4 rounded-full bg-blue-600 dark:bg-blue-500 inline-block" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="my-3 pl-3.5 py-1.5 border-l-2 border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic rounded-r-lg"
          >
            {line.replace('> ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
          </blockquote>
        );
      }
      // Bullet list item
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const cleanLine = line.trim().replace(/^[\*\-]\s+/, '');
        // Replace bold **text**
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1 leading-relaxed">
            {parts.map((p, pIdx) => {
              if (p.startsWith('**') && p.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">
                    {p.slice(2, -2)}
                  </strong>
                );
              }
              return p;
            })}
          </li>
        );
      }
      // Empty line spacer
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Normal paragraph
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">
                  {p.slice(2, -2)}
                </strong>
              );
            }
            return p;
          })}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 py-2 max-w-5xl mx-auto">
      {/* Top Header & Session Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-1">
            <Bot className="w-3.5 h-3.5" />
            Asisten Chatbot AIKOBI
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tanya KOBI
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Konsultasikan strategi harga, audit etalase Tokopedia, mitigasi ulasan, dan rencana aksi toko Anda secara interaktif.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              title="Kembali ke tampilan awal prompt starter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Mulai Sesi Baru
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              title="Lihat contoh percakapan konsultasi lengkap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Lihat Contoh Percakapan
            </button>
          )}

          <Link
            href="/konsultasi"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Audit Produk Tokopedia
          </Link>
        </div>
      </div>

      {/* Main Chat Frame */}
      <div className="flat-surface overflow-hidden flex flex-col min-h-[600px] max-h-[820px] shadow-sm relative">
        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* STATE 1: EMPTY STATE (BELUM ADA CHAT)                    */}
          {/* ======================================================== */}
          {messages.length === 0 && (
            <div className="space-y-8 py-4 sm:py-6 animate-in fade-in duration-300">
              {/* Welcoming Greeting Emblem */}
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 p-2.5 mx-auto flex items-center justify-center shadow-md shadow-blue-500/10">
                  <Image
                    src="/brand/logo-mark.png"
                    alt="KOBI AI Avatar"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain dark:hidden"
                    priority
                  />
                  <Image
                    src="/brand/logo-mark-dark.png"
                    alt="KOBI AI Avatar"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain hidden dark:block"
                    priority
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Halo! Ada yang bisa KOBI bantu untuk toko Anda?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
                    KOBI adalah mitra konsultasi bisnis cerdas Anda. Pilih salah satu saran topik di bawah atau ketik langsung kendala etalase Tokopedia Anda di kolom chat.
                  </p>
                </div>

                {/* 3 Value Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                    Fokus Marketplace Tokopedia
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                    Rencana Aksi Operasional 30 Hari
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                    Bebas Biaya Tanpa Login Toko
                  </span>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Pilih Saran Topik Konsultasi Cepat:
                  </h3>
                  <span className="text-[11px] text-slate-400">Klik kartu untuk melihat jawaban</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                        activeCategory === cat
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Starter Prompt Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {filteredStarters.map((starter) => (
                    <button
                      key={starter.id}
                      type="button"
                      onClick={() => handleSendPrompt(starter.prompt, starter)}
                      className="group p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-500/50 text-left transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                            {getStarterIcon(starter.iconName)}
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {starter.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {starter.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {starter.summary}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        <span>Tanyakan Topik Ini</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE 2: ACTIVE CONVERSATION STREAM                      */}
          {/* ======================================================== */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {/* Assistant Avatar */}
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

                {/* Message Bubble Container */}
                <div className={`space-y-1.5 max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender Meta Info */}
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

                  {/* Bubble Content */}
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

                        {/* Assistant Action Bar */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  Tersalin ke Clipboard!
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin Jawaban</span>
                              </>
                            )}
                          </button>

                          <Link
                            href="/konsultasi"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <span>Coba di Audit Produk Tokopedia</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Follow-up Suggestion Chips for Assistant Messages */}
                  {!isUser && msg.followUps && msg.followUps.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-500" />
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

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
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
                    KOBI sedang menganalisis strategi...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ======================================================== */}
        {/* DOCKED CHAT INPUT COLUMN (KOLOM CHAT KOBI)               */}
        {/* ======================================================== */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 backdrop-blur-md space-y-2">
          {/* Quick Context Chips Above Input */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap pl-1">
              Topik Cepat:
            </span>
            <button
              type="button"
              onClick={() => handleSendPrompt('Bagaimana cara menentukan harga coret diskon yang efektif di Tokopedia?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 whitespace-nowrap transition"
            >
              Strategi Harga Coret
            </button>
            <button
              type="button"
              onClick={() => handleSendPrompt('Bagaimana rumus menghitung margin bersih setelah potongan komisi Tokopedia?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 whitespace-nowrap transition"
            >
              Potongan Fee Tokopedia
            </button>
            <button
              type="button"
              onClick={() => handleSendPrompt('Apa tanda-tanda produk saya terkena status Overpriced di pasar?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 whitespace-nowrap transition"
            >
              Deteksi Overpriced
            </button>
            <button
              type="button"
              onClick={() => handleSendPrompt('Bagaimana cara optimasi deskripsi etalase agar lolos pencarian Tokopedia?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 whitespace-nowrap transition"
            >
              Optimasi SEO Etalase
            </button>
          </div>

          {/* Input Box Wrapper */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputValue);
            }}
            className="relative flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-xs p-1.5 transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan strategi harga, etalase Tokopedia, atau kendala tokomu ke KOBI... (Tekan Enter)"
              className="flex-1 max-h-32 min-h-[38px] py-1.5 px-3 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />

            {inputValue.trim() && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                title="Hapus teks input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              aria-label="Kirim pesan ke KOBI"
              className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                inputValue.trim() && !isTyping
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-95'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Micro Disclaimer */}
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
            KOBI AI dirancang untuk pendampingan strategi e-commerce Tokopedia. Rekomendasi bersifat panduan analitis dan siap diintegrasikan dengan model LLM.
          </p>
        </div>
      </div>
    </div>
  );
}

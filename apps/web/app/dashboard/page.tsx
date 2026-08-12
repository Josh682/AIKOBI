'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DashboardPage() {
  const products = [
    { nama: 'Kemeja Batik Katun Pria', toko: 'UMKM Batik Solo', harga: 145000, pasar: 142000, status: 'wajar', rating: 4.9, terjual: 320 },
    { nama: 'TWS Bluetooth Earphone 5.3', toko: 'Gadget Central', harga: 285000, pasar: 270000, status: 'mahal', rating: 4.7, terjual: 140 },
    { nama: 'Sepatu Sneakers Running', toko: 'Bandung Leather', harga: 180000, pasar: 195000, status: 'murah', rating: 4.8, terjual: 510 },
    { nama: 'Tas Ransel Laptop Anti Air', toko: 'Craft Bag Jogja', harga: 165000, pasar: 162000, status: 'wajar', rating: 4.9, terjual: 230 },
  ];

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">Rp</div>
          Price Optimizer
        </div>
        <nav>
          <Link href="/">Beranda</Link>
          <Link href="/dashboard" className="active">Dashboard</Link>
          <Link href="/ai">Analisis AI</Link>
          <Link href="/insight">Insight</Link>
          <Link href="/tentang">Tentang</Link>
        </nav>
      </header>

      <main className="page">
        <div className="page-head">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Halo, Tio 👋</h1>
          </div>
          <div className="controls">
            <div className="search-box">
              <input type="text" placeholder="Cari produk atau toko…" />
            </div>
            <select className="filter-select">
              <option>Semua Kategori</option>
              <option>Makanan</option>
              <option>Fashion</option>
              <option>Elektronik</option>
            </select>
            <select className="filter-select">
              <option>Semua Lokasi</option>
              <option>Jawa Tengah</option>
              <option>Jawa Barat</option>
            </select>
          </div>
        </div>

        <section className="stat-row">
          <div className="ticket">
            <div className="ticket-label">Total Produk</div>
            <div className="ticket-value tabular">1,240</div>
            <div className="ticket-delta up">+12.4% bln ini</div>
          </div>
          <div className="ticket">
            <div className="ticket-label">Total UMKM</div>
            <div className="ticket-value tabular">380</div>
            <div className="ticket-delta up">+8 UMKM baru</div>
          </div>
          <div className="ticket">
            <div className="ticket-label">Harga Rata-rata</div>
            <div className="ticket-value tabular">Rp 185.000</div>
            <div className="ticket-delta flat">Stabil</div>
          </div>
        </section>

        <section className="main-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Harga Rata-rata per Kategori</h2>
              <span>7 hari terakhir</span>
            </div>
            <div className="bars">
              <div className="bar-col">
                <div className="bar" style={{ height: '70%' }}></div>
                <span className="bar-label">Makanan</span>
              </div>
              <div className="bar-col highlight">
                <div className="bar" style={{ height: '90%' }}></div>
                <span className="bar-label">Fashion</span>
              </div>
              <div className="bar-col">
                <div className="bar" style={{ height: '100%' }}></div>
                <span className="bar-label">Elektronik</span>
              </div>
              <div className="bar-col">
                <div className="bar" style={{ height: '60%' }}></div>
                <span className="bar-label">Kecantikan</span>
              </div>
              <div className="bar-col">
                <div className="bar" style={{ height: '65%' }}></div>
                <span className="bar-label">Kerajinan</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Distribusi UMKM</h2>
              <span>per kategori</span>
            </div>
            <div className="dist-list">
              <div className="dist-row">
                <span className="dist-name">Fashion</span>
                <div className="dist-track">
                  <div className="dist-fill" style={{ width: '38%' }}></div>
                </div>
                <span className="dist-pct">38%</span>
              </div>
              <div className="dist-row">
                <span className="dist-name">Makanan</span>
                <div className="dist-track">
                  <div className="dist-fill" style={{ width: '28%' }}></div>
                </div>
                <span className="dist-pct">28%</span>
              </div>
              <div className="dist-row">
                <span className="dist-name">Elektronik</span>
                <div className="dist-track">
                  <div className="dist-fill" style={{ width: '18%' }}></div>
                </div>
                <span className="dist-pct">18%</span>
              </div>
              <div className="dist-row">
                <span className="dist-name">Kerajinan</span>
                <div className="dist-track">
                  <div className="dist-fill" style={{ width: '16%' }}></div>
                </div>
                <span className="dist-pct">16%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="panel" style={{ marginTop: '20px' }}>
          <div className="panel-head">
            <h2>Daftar Produk</h2>
            <span>menampilkan hasil scraping terbaru</span>
          </div>
          <table className="products">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Harga</th>
                <th>Harga Pasar</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Terjual</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i}>
                  <td>
                    <div className="prod-name">{p.nama}</div>
                    <div className="prod-shop">{p.toko}</div>
                  </td>
                  <td className="price-cell">Rp {p.harga.toLocaleString('id-ID')}</td>
                  <td className="price-cell" style={{ color: 'var(--ink-faint)' }}>Rp {p.pasar.toLocaleString('id-ID')}</td>
                  <td>
                    <span className={`badge ${p.status}`}>
                      {p.status === 'murah' ? 'Murah' : p.status === 'mahal' ? 'Mahal' : 'Wajar'}
                    </span>
                  </td>
                  <td><span className="rating">★ {p.rating}</span></td>
                  <td>{p.terjual} pcs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

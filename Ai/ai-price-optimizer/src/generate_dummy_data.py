"""
generate_dummy_data.py
-----------------------
Menghasilkan dataset dummy yang meniru struktur output scraper
(model `Product` pada packages/db/prisma/schema.prisma & `SearchResultItem`
pada packages/shared-types/src/product.types.ts), dipakai untuk menguji
pipeline preprocessing + training selama data hasil scraping asli belum
cukup banyak.

Setiap baris = satu listing produk kompetitor hasil scraping (bukan produk
UMKM). Harga listing inilah yang jadi target training ("harga yang diterima
market" untuk kombinasi atribut tersebut).
"""
from __future__ import annotations

import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)

# Kategori sesuai dashboard (screenshot "Distribusi UMKM per kategori")
CATEGORIES = {
    # kategori: (harga_dasar_lognormal_mean_log, sigma_log, list keyword cluster)
    "Makanan": (10.5, 0.55, ["kopi bubuk", "keripik singkong", "sambal botol", "abon sapi", "teh herbal"]),
    "Fashion": (11.5, 0.6, ["kaos oversize", "tas rajut handmade", "jilbab instan", "sandal kulit", "dress batik"]),
    "Elektronik": (15.5, 0.7, ["laptop asus vivobook", "charger usb-c", "speaker bluetooth", "powerbank 10000mah", "earphone tws"]),
    "Kecantikan": (10.8, 0.5, ["sabun herbal batang", "serum wajah", "lulur tradisional", "lipstik matte", "masker clay"]),
    "Kerajinan": (11.0, 0.6, ["anyaman bambu", "vas keramik", "gantungan kunci kayu", "tas rotan", "hiasan dinding"]),
}

CITIES_TIER = {
    "Jakarta": 1, "Surabaya": 1, "Bandung": 1,
    "Semarang": 2, "Yogyakarta": 2, "Medan": 2, "Makassar": 2,
    "Solo": 3, "Malang": 3, "Denpasar": 3,
}

SEASON_EVENTS = [  # (bulan, nama, uplift_harga_multiplier, uplift_terjual_multiplier)
    (3, "Ramadan_awal", 1.03, 1.4),
    (4, "Lebaran", 1.08, 2.2),
    (11, "Harbolnas_1111", 0.90, 2.6),  # promo besar -> harga turun, terjual naik
    (12, "Harbolnas_1212_Akhir_Tahun", 0.88, 2.8),
]


def _season_multiplier(month: int):
    for m, _name, price_mult, sold_mult in SEASON_EVENTS:
        if m == month:
            return price_mult, sold_mult
    return 1.0, 1.0


def _is_seasonal_month(month: int) -> int:
    return int(any(m == month for m, *_ in SEASON_EVENTS))


def generate_dummy_dataset(n_rows: int = 6000, start_date: str = "2025-09-01",
                            end_date: str = "2026-08-01") -> pd.DataFrame:
    """Bangun dataset dummy ~n_rows listing produk kompetitor.

    Setiap `keyword_cluster` (mis. "Elektronik:laptop asus vivobook") punya SATU
    harga dasar (`cluster_base_price`) yang mewakili "harga pasaran" produk sejenis
    itu -- meniru kenyataan bahwa listing "laptop ASUS Vivobook 14" dari berbagai
    toko harganya berdekatan, bukan acak lebar. Variasi antar listing datang dari
    modifier yang bermakna (rating, official store, kota, musim) + sedikit noise
    seller-to-seller, bukan re-roll harga dasar per baris.
    """
    dates = pd.date_range(start_date, end_date, freq="D")

    # satu harga dasar per cluster (dipakai bersama oleh semua listing di cluster itu)
    cluster_base_price = {}
    for category, (mu, sigma, keywords) in CATEGORIES.items():
        for keyword in keywords:
            cluster_base_price[f"{category}:{keyword}"] = RNG.lognormal(mean=mu, sigma=sigma * 0.5)

    rows = []

    for i in range(n_rows):
        category = RNG.choice(list(CATEGORIES.keys()))
        _mu, _sigma, keywords = CATEGORIES[category]
        keyword = RNG.choice(keywords)
        cluster_id = f"{category}:{keyword}"

        scraped_at = RNG.choice(dates)
        month = pd.Timestamp(scraped_at).month
        price_mult, sold_mult = _season_multiplier(month)

        # harga dasar cluster + noise kecil antar-seller (varian warna/bundling/dst.)
        seller_noise = RNG.lognormal(mean=0.0, sigma=0.12)
        base_price = cluster_base_price[cluster_id] * seller_noise

        city = RNG.choice(list(CITIES_TIER.keys()))
        tier = CITIES_TIER[city]
        # kota tier 1 sedikit lebih mahal (biaya operasional/ongkir lebih rendah -> margin lebih tinggi)
        tier_mult = {1: 1.05, 2: 1.0, 3: 0.95}[tier]

        is_official = RNG.random() < 0.22
        official_mult = 1.08 if is_official else 1.0

        rating = float(np.clip(RNG.normal(4.6, 0.35), 1.0, 5.0))
        rating_mult = 0.85 + 0.08 * rating  # rating tinggi -> harga bisa sedikit lebih tinggi

        total_sold = max(0, int(RNG.gamma(shape=2.0, scale=120) * sold_mult * (rating / 4.6)))
        total_reviews = max(0, int(total_sold * RNG.uniform(0.05, 0.25)))

        discount_percent = int(RNG.choice([0, 0, 0, 5, 10, 15, 20, 25, 30], p=[0.35, 0.1, 0.1, 0.1, 0.1, 0.08, 0.07, 0.06, 0.04]))

        price = base_price * price_mult * tier_mult * official_mult * rating_mult
        price = round(price / 500) * 500  # bulatkan ke kelipatan 500 (gaya harga marketplace)
        price = max(price, 3000)

        original_price = price if discount_percent == 0 else round(price / (1 - discount_percent / 100) / 500) * 500

        rows.append({
            "external_id": f"{category[:3].lower()}-{i:05d}",
            "marketplace": RNG.choice(["TOKOPEDIA", "SHOPEE"]),
            "category": category,
            "keyword_cluster": cluster_id,
            "name": f"{keyword.title()} varian {RNG.integers(1, 20)}",
            "price": price,
            "original_price": original_price,
            "discount_percent": discount_percent,
            "rating": round(rating, 2),
            "total_reviews": total_reviews,
            "total_sold": total_sold,
            "is_official_store": is_official,
            "location": city,
            "scraped_at": pd.Timestamp(scraped_at),
        })

    df = pd.DataFrame(rows)

    # --- inject sedikit data kotor secara sengaja, supaya langkah cleaning ada gunanya ---
    dirty_idx = RNG.choice(df.index, size=int(0.03 * len(df)), replace=False)
    df.loc[dirty_idx[: len(dirty_idx) // 3], "rating"] = np.nan
    df.loc[dirty_idx[len(dirty_idx) // 3: 2 * len(dirty_idx) // 3], "price"] = -1  # harga tidak valid
    df.loc[dirty_idx[2 * len(dirty_idx) // 3:], "total_sold"] = None

    # beberapa duplikat exact (kejadian umum saat scraping ulang / cache overlap)
    dup_sample = df.sample(n=int(0.015 * len(df)), random_state=1)
    df = pd.concat([df, dup_sample], ignore_index=True)

    return df.sample(frac=1.0, random_state=7).reset_index(drop=True)


if __name__ == "__main__":
    out_path = "data/dummy_products.csv"
    dataset = generate_dummy_dataset()
    dataset.to_csv(out_path, index=False)
    print(f"Dataset dummy tersimpan di {out_path} — {len(dataset)} baris, {dataset['category'].nunique()} kategori")
    print(dataset.head())

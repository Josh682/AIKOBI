"""
generate_dummy_catalog.py
--------------------------
Dataset dummy KEDUA, khusus untuk fitur "Smart Downsize / Local Alternative
Engine". Berbeda dari `generate_dummy_data.py` (yang fokus ke harga untuk Price
Optimizer), dataset ini butuh teks (nama, spesifikasi, ulasan) supaya text
similarity & aspect-based sentiment bisa diuji.

Setiap "archetype" produk (mis. "Charger USB-C 20W Fast Charging") punya:
- beberapa listing "Brand Internasional" -> official store, harga tinggi, spek lengkap
- beberapa listing "UMKM Lokal"          -> bukan official store, harga jauh lebih
  murah, spek sebagian besar sama (sebagian kata kunci di-drop untuk mensimulasikan
  produk yang "80-90% setara" bukan 100% identik)

Setiap listing juga dilengkapi beberapa ulasan sintetis (Bahasa Indonesia) yang
disusun dari template per-aspek (Kualitas/Keawetan/Pengiriman/Pelayanan/Harga),
polaritasnya mengikuti `quality_score` listing tsb -- dipakai untuk menguji ABSA.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

RNG = np.random.default_rng(7)

# ---------------------------------------------------------------------------
# Archetype produk: (kategori, spec_keywords lengkap, harga brand (mean,std),
# rasio harga UMKM relatif ke brand (min,max), fraksi spec yang tetap ada di
# versi UMKM (min,max))
# ---------------------------------------------------------------------------
ARCHETYPES = {
    "Charger USB-C 20W Fast Charging": dict(
        category="Aksesoris Gadget",
        specs=["USB-C", "20W", "fast charging", "power delivery", "PD",
               "kompatibel iPhone", "kompatibel Samsung", "kabel data termasuk",
               "garansi resmi 1 tahun", "original"],
        brand_price=(320_000, 30_000),
        local_price_ratio=(0.45, 0.62),
        local_spec_keep=(0.65, 0.9),
    ),
    "TWS Earphone Bluetooth 5.3 ANC": dict(
        category="Aksesoris Gadget",
        specs=["true wireless", "bluetooth 5.3", "active noise cancelling", "ANC",
               "case charging", "touch control", "waterproof IPX5",
               "garansi resmi 1 tahun", "original"],
        brand_price=(1_450_000, 150_000),
        local_price_ratio=(0.42, 0.58),
        local_spec_keep=(0.65, 0.88),
    ),
    "Sepatu Sneakers Running": dict(
        category="Sepatu",
        specs=["sol empuk", "breathable mesh", "ringan", "anti slip",
               "cocok lari", "cocok olahraga", "desain sporty",
               "garansi resmi", "original"],
        brand_price=(1_800_000, 200_000),
        local_price_ratio=(0.40, 0.58),
        local_spec_keep=(0.65, 0.9),
    ),
    "Tas Ransel Laptop Anti Air": dict(
        category="Tas",
        specs=["anti air", "muat laptop 15 inch", "banyak kompartemen",
               "USB charging port", "bahan tebal", "tali empuk", "desain minimalis",
               "garansi resmi", "original"],
        brand_price=(950_000, 100_000),
        local_price_ratio=(0.42, 0.6),
        local_spec_keep=(0.65, 0.9),
    ),
    "Jam Tangan Smartwatch Fitness": dict(
        category="Jam Tangan",
        specs=["layar AMOLED", "heart rate monitor", "waterproof", "notifikasi HP",
               "tracking olahraga", "baterai tahan lama", "bluetooth call",
               "garansi resmi 1 tahun", "original"],
        brand_price=(2_500_000, 300_000),
        local_price_ratio=(0.40, 0.58),
        local_spec_keep=(0.65, 0.88),
    ),
}

BRAND_NAMES = ["TechGlobal", "ProGear Intl", "UrbanFit World", "MaxTech Official"]
UMKM_SELLER_PREFIXES = ["Toko", "UMKM", "Griya", "Kriya", "Sentra"]
UMKM_SELLER_SUFFIXES = ["Mandiri", "Jaya", "Sejahtera", "Nusantara", "Bersaudara", "Karya"]

CITIES = ["Jakarta", "Surabaya", "Bandung", "Semarang", "Yogyakarta", "Medan", "Solo", "Malang"]

# ---------------------------------------------------------------------------
# Template ulasan per-aspek (dipakai juga sebagai referensi leksikon ABSA di
# `local_alternative_engine.py` -- kata kunci di sini SENGAJA konsisten dengan
# leksikon supaya reviewer bisa memverifikasi ABSA bekerja benar).
# ---------------------------------------------------------------------------
REVIEW_TEMPLATES = {
    "Kualitas": {
        "positif": [
            "Kualitas bahannya bagus banget, sesuai deskripsi.",
            "Kualitas produk premium, gak nyangka harganya segini.",
            "Barangnya berkualitas, gak murahan sama sekali.",
        ],
        "negatif": [
            "Kualitasnya kurang bagus, agak mengecewakan.",
            "Kualitas produk murahan, gak sesuai ekspektasi.",
            "Bahan terasa kurang bagus dibanding foto.",
        ],
    },
    "Keawetan": {
        "positif": [
            "Sudah dipakai 3 bulan masih awet dan kuat.",
            "Awet banget, jahitannya rapi dan kokoh.",
            "Dipakai tiap hari tapi tetap awet, gak gampang rusak.",
        ],
        "negatif": [
            "Baru sebulan udah rusak, gak awet.",
            "Cepat rusak, jahitan lepas dalam 2 minggu.",
            "Kurang awet, komponennya gampang lepas.",
        ],
    },
    "Pengiriman": {
        "positif": [
            "Pengiriman cepat, packing rapi dan aman.",
            "Dikirim cepat banget, sampai lebih awal dari estimasi.",
            "Packing aman, pengiriman juga cepat.",
        ],
        "negatif": [
            "Pengiriman lambat banget, lebih dari seminggu.",
            "Packing kurang aman, barang agak penyok pas sampai.",
            "Lama banget dikirim, sempat khawatir hilang.",
        ],
    },
    "Pelayanan": {
        "positif": [
            "Pelayanan sellernya ramah dan responsif.",
            "Adminnya fast response, pelayanan memuaskan.",
            "Seller ramah banget, komplain langsung ditanggapi.",
        ],
        "negatif": [
            "Pelayanan kurang ramah, chat lama dibales.",
            "Adminnya susah dihubungi, pelayanan mengecewakan.",
            "Kurang responsif kalau ditanya soal produk.",
        ],
    },
    "Harga": {
        "positif": [
            "Harga murah tapi kualitas oke, worth it banget.",
            "Worth it, harganya terjangkau untuk kualitas segini.",
            "Harga bersahabat dibanding produk sejenis di toko lain.",
        ],
        "negatif": [
            "Harga kemahalan untuk kualitas segini.",
            "Kurang worth it, mahal tapi biasa aja.",
            "Untuk harga segitu ekspektasinya lebih tinggi.",
        ],
    },
}


def _make_reviews(quality_score: float, n_reviews: int) -> list[str]:
    """quality_score in [0,1] -> makin tinggi, makin banyak review positif."""
    reviews = []
    aspects = list(REVIEW_TEMPLATES.keys())
    for _ in range(n_reviews):
        aspect = RNG.choice(aspects)
        is_positive = RNG.random() < quality_score
        pool = REVIEW_TEMPLATES[aspect]["positif" if is_positive else "negatif"]
        sentence = RNG.choice(pool)
        # kadang gabung 2 aspek dalam satu ulasan (lebih realistis)
        if RNG.random() < 0.4:
            aspect2 = RNG.choice([a for a in aspects if a != aspect])
            is_positive2 = RNG.random() < quality_score
            pool2 = REVIEW_TEMPLATES[aspect2]["positif" if is_positive2 else "negatif"]
            sentence += " " + RNG.choice(pool2)
        reviews.append(sentence)
    return reviews


def generate_dummy_catalog(n_per_archetype_local: int = 5) -> pd.DataFrame:
    rows = []
    pid = 0
    for archetype, cfg in ARCHETYPES.items():
        category = cfg["category"]
        specs = cfg["specs"]
        brand_mean, brand_std = cfg["brand_price"]

        # --- listing brand internasional (1-2 per archetype) ---
        for _ in range(RNG.integers(1, 3)):
            price = max(50_000, RNG.normal(brand_mean, brand_std))
            price = round(price / 1000) * 1000
            brand = RNG.choice(BRAND_NAMES)
            quality = float(np.clip(RNG.normal(0.82, 0.08), 0.4, 0.98))
            rating = round(3 + quality * 2, 1)
            n_reviews_gen = int(RNG.integers(4, 8))
            total_reviews = int(RNG.integers(150, 900))
            total_sold = int(RNG.integers(200, 2000))
            spec_text = ", ".join(specs)  # brand pakai spesifikasi lengkap
            rows.append({
                "product_id": f"p{pid:04d}", "archetype": archetype, "category": category,
                "name": f"{archetype} - {brand} Original",
                "brand_tier": "International",
                "seller": f"{brand} Official Store",
                "is_official_store": True,
                "price": price,
                "specifications_text": spec_text,
                "rating": rating,
                "total_reviews": total_reviews,
                "total_sold": total_sold,
                "location": RNG.choice(CITIES),
                "reviews": _make_reviews(quality, n_reviews_gen),
            })
            pid += 1

        # --- listing UMKM lokal (beberapa per archetype, variasi kualitas & harga) ---
        for _ in range(n_per_archetype_local):
            price_ratio = RNG.uniform(*cfg["local_price_ratio"])
            price = max(20_000, brand_mean * price_ratio)
            price = round(price / 1000) * 1000

            keep_frac = RNG.uniform(*cfg["local_spec_keep"])
            n_keep = max(2, int(len(specs) * keep_frac))
            kept_specs = list(RNG.choice(specs, size=n_keep, replace=False))
            # buang klaim "original"/"garansi resmi" utk versi lokal (lebih jujur/realistis)
            kept_specs = [s for s in kept_specs if s not in ("original", "garansi resmi", "garansi resmi 1 tahun")]
            extra_local_terms = RNG.choice(
                ["kualitas premium lokal", "produk UMKM Indonesia", "harga bersahabat",
                 "kualitas setara brand ternama", "buatan lokal berkualitas"],
                size=2, replace=False,
            )
            spec_text = ", ".join(kept_specs + list(extra_local_terms))

            quality = float(np.clip(RNG.normal(0.68, 0.15), 0.25, 0.97))
            rating = round(3 + quality * 2, 1)
            n_reviews_gen = int(RNG.integers(3, 7))
            total_reviews = int(RNG.integers(10, 400))
            total_sold = int(RNG.integers(15, 800))

            seller = f"{RNG.choice(UMKM_SELLER_PREFIXES)} {archetype.split()[0]} {RNG.choice(UMKM_SELLER_SUFFIXES)}"
            rows.append({
                "product_id": f"p{pid:04d}", "archetype": archetype, "category": category,
                "name": f"{archetype} - Versi Lokal {RNG.choice(['Premium','Hemat','Best Seller'])}",
                "brand_tier": "Lokal_UMKM",
                "seller": seller,
                "is_official_store": False,
                "price": price,
                "specifications_text": spec_text,
                "rating": rating,
                "total_reviews": total_reviews,
                "total_sold": total_sold,
                "location": RNG.choice(CITIES),
                "reviews": _make_reviews(quality, n_reviews_gen),
            })
            pid += 1

    return pd.DataFrame(rows)


if __name__ == "__main__":
    df = generate_dummy_catalog()
    df.to_json("data/dummy_catalog.json", orient="records", force_ascii=False, indent=2)
    print(f"Katalog dummy tersimpan di data/dummy_catalog.json — {len(df)} listing, "
          f"{df['archetype'].nunique()} archetype produk")
    print(df[["name", "brand_tier", "price", "rating"]].head(10))

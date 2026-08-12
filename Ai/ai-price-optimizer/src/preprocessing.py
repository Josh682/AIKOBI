"""
preprocessing.py
-----------------
Pipeline preprocessing untuk AI Price Optimizer.

Terdiri dari 2 tahap yang bisa dipanggil terpisah (untuk training) atau
digabung lewat `build_feature_pipeline()` (dipakai saat inference):

1. `clean_raw_products(df)`      -> data cleaning
2. `engineer_features(df)`       -> feature engineering (butuh data yang sudah bersih)
3. `build_feature_pipeline()`    -> sklearn ColumnTransformer siap dipakai di
                                     Pipeline bersama model (encoding kategorikal, dst.)

Catatan desain: fitur harga milik produk itu sendiri (`price`) TIDAK pernah
dijadikan input model (hanya jadi target/label). Fitur konteks kompetitor
dihitung per `keyword_cluster` dan EXCLUDING baris itu sendiri, supaya model
belajar "harga wajar untuk profil seperti ini", bukan menghafal harganya sendiri.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

NUMERIC_FEATURES = [
    "rating",
    "total_reviews",
    "total_sold",
    "discount_percent",
    "competitor_price_mean",
    "competitor_price_median",
    "competitor_price_std",
    "competitor_price_min",
    "competitor_price_max",
    "competitor_cluster_size",
    "city_tier",
    "month",
]
BOOLEAN_FEATURES = ["is_official_store", "is_seasonal_month"]
CATEGORICAL_FEATURES = ["category"]

ALL_FEATURES = NUMERIC_FEATURES + BOOLEAN_FEATURES + CATEGORICAL_FEATURES
TARGET = "price"

CITY_TIER_MAP = {
    "Jakarta": 1, "Surabaya": 1, "Bandung": 1,
    "Semarang": 2, "Yogyakarta": 2, "Medan": 2, "Makassar": 2,
    "Solo": 3, "Malang": 3, "Denpasar": 3,
}
SEASONAL_MONTHS = {3, 4, 11, 12}  # Ramadan/Lebaran & Harbolnas 11.11 / 12.12


# ---------------------------------------------------------------------------
# 1. CLEANING
# ---------------------------------------------------------------------------
def clean_raw_products(df: pd.DataFrame) -> pd.DataFrame:
    """Bersihkan data mentah hasil scraping sebelum feature engineering.

    Langkah:
    - Drop duplikat exact (hasil overlap cache scraping).
    - Buang baris dengan harga tidak valid (<= 0 atau kosong) -- harga adalah target.
    - Impute rating & total_sold yang hilang dengan median per kategori (lebih akurat
      daripada median global karena rentang harga/rating antar kategori beda jauh).
    - Clip outlier harga ekstrem per kategori pakai IQR (bukan buang -- listing mahal
      itu valid, tapi kita cegah 1-2 outlier menarik distribusi kuantil).
    - Pastikan tipe data & rentang rating (1-5), discount (0-100) valid.
    """
    df = df.copy()

    before = len(df)
    df = df.drop_duplicates(subset=["external_id", "marketplace", "price", "scraped_at"])

    df = df[df["price"].notna() & (df["price"] > 0)]

    df["rating"] = df["rating"].clip(1.0, 5.0)
    df["rating"] = df.groupby("category")["rating"].transform(lambda s: s.fillna(s.median()))

    df["total_sold"] = df["total_sold"].fillna(0)
    df["total_sold"] = df.groupby("category")["total_sold"].transform(
        lambda s: s.mask(s.isna(), s.median())
    )
    df["total_sold"] = df["total_sold"].clip(lower=0)

    df["total_reviews"] = df["total_reviews"].fillna(0).clip(lower=0)
    df["discount_percent"] = df["discount_percent"].fillna(0).clip(0, 90)

    # Clip outlier harga ekstrem per kategori (IQR 1.5x), bukan drop total.
    def _clip_iqr(group: pd.Series) -> pd.Series:
        q1, q3 = group.quantile([0.25, 0.75])
        iqr = q3 - q1
        lower, upper = q1 - 3 * iqr, q3 + 3 * iqr
        return group.clip(lower=max(lower, 0), upper=upper)

    df["price"] = df.groupby("category")["price"].transform(_clip_iqr)

    df["scraped_at"] = pd.to_datetime(df["scraped_at"])
    df = df.dropna(subset=["category", "keyword_cluster", "location"])

    removed = before - len(df)
    print(f"[cleaning] {before} -> {len(df)} baris ({removed} dibuang/duplikat)")
    return df.reset_index(drop=True)


# ---------------------------------------------------------------------------
# 2. FEATURE ENGINEERING
# ---------------------------------------------------------------------------
# Di aplikasi nyata, "konteks kompetitor" yang dilihat sistem saat inference
# HANYA berupa segelintir listing serupa (mis. hasil "Produk Serupa" di
# dashboard: 3-10 item), bukan ratusan listing sekaligus. Kalau saat training
# statistik kompetitor dihitung dari ratusan listing per cluster (varians kecil,
# nyaris konstan) sementara saat inference dihitung dari sampel kecil (varians
# besar), model akan melihat kombinasi nilai fitur yang TIDAK PERNAH ada saat
# training -> ekstrapolasi liar. Karena itu training pun mensimulasikan ukuran
# sampel kompetitor kecil (`COMPETITOR_SAMPLE_RANGE`) agar distribusi fitur saat
# training konsisten dengan kondisi saat inference.
COMPETITOR_SAMPLE_RANGE = (4, 12)  # jumlah "produk serupa" yang biasanya tersedia
_FEATURE_RNG = np.random.default_rng(123)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Tambahkan fitur turunan: statistik kompetitor (dari sampel kecil, meniru
    kondisi nyata saat inference), musim, tier kota."""
    df = df.copy().reset_index(drop=True)

    cluster_groups = df.groupby("keyword_cluster").indices  # {cluster_id: array of row positions}

    n = len(df)
    comp_mean = np.empty(n)
    comp_median = np.empty(n)
    comp_std = np.empty(n)
    comp_min = np.empty(n)
    comp_max = np.empty(n)
    comp_size = np.empty(n, dtype=int)

    prices = df["price"].to_numpy()
    for _cluster_id, idx_array in cluster_groups.items():
        idx_array = np.asarray(idx_array)
        cluster_prices = prices[idx_array]
        m = len(idx_array)
        for pos_in_cluster, row_idx in enumerate(idx_array):
            others = np.delete(cluster_prices, pos_in_cluster)  # exclude diri sendiri
            if len(others) == 0:
                # cluster cuma 1 anggota -> fallback ke statistik kategori (diisi di bawah)
                comp_mean[row_idx] = np.nan
                comp_median[row_idx] = np.nan
                comp_std[row_idx] = np.nan
                comp_min[row_idx] = np.nan
                comp_max[row_idx] = np.nan
                comp_size[row_idx] = 0
                continue
            k = min(len(others), _FEATURE_RNG.integers(*COMPETITOR_SAMPLE_RANGE))
            sample = _FEATURE_RNG.choice(others, size=k, replace=False)
            comp_mean[row_idx] = sample.mean()
            comp_median[row_idx] = np.median(sample)
            comp_std[row_idx] = sample.std() if k > 1 else 0.0
            comp_min[row_idx] = sample.min()
            comp_max[row_idx] = sample.max()
            comp_size[row_idx] = k

    df["competitor_price_mean"] = comp_mean
    df["competitor_price_median"] = comp_median
    df["competitor_price_std"] = comp_std
    df["competitor_price_min"] = comp_min
    df["competitor_price_max"] = comp_max
    df["competitor_cluster_size"] = comp_size

    # fallback untuk cluster yang cuma punya 1 anggota -> pakai statistik kategori
    fallback_mask = df["competitor_price_mean"].isna()
    cat_mean = df.groupby("category")["price"].transform("mean")
    cat_median = df.groupby("category")["price"].transform("median")
    cat_std = df.groupby("category")["price"].transform("std").fillna(0)
    cat_min = df.groupby("category")["price"].transform("min")
    cat_max = df.groupby("category")["price"].transform("max")
    df.loc[fallback_mask, "competitor_price_mean"] = cat_mean[fallback_mask]
    df.loc[fallback_mask, "competitor_price_median"] = cat_median[fallback_mask]
    df.loc[fallback_mask, "competitor_price_std"] = cat_std[fallback_mask]
    df.loc[fallback_mask, "competitor_price_min"] = cat_min[fallback_mask]
    df.loc[fallback_mask, "competitor_price_max"] = cat_max[fallback_mask]
    df.loc[fallback_mask, "competitor_cluster_size"] = 0

    # --- waktu / musim ---
    df["month"] = df["scraped_at"].dt.month
    df["is_seasonal_month"] = df["month"].isin(SEASONAL_MONTHS).astype(int)

    # --- lokasi ---
    df["city_tier"] = df["location"].map(CITY_TIER_MAP).fillna(3).astype(int)

    df["is_official_store"] = df["is_official_store"].astype(int)

    return df


def build_feature_pipeline() -> ColumnTransformer:
    """ColumnTransformer: scaling numerik + one-hot kategori. Dipakai di dalam
    sklearn Pipeline bersama estimator (lihat notebook training)."""
    numeric_transform = Pipeline(steps=[
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
    ])
    categorical_transform = Pipeline(steps=[
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])
    boolean_transform = Pipeline(steps=[
        ("impute", SimpleImputer(strategy="most_frequent")),
    ])

    return ColumnTransformer(transformers=[
        ("num", numeric_transform, NUMERIC_FEATURES),
        ("bool", boolean_transform, BOOLEAN_FEATURES),
        ("cat", categorical_transform, CATEGORICAL_FEATURES),
    ])


def get_output_feature_names(column_transformer: ColumnTransformer) -> list[str]:
    """Ambil nama fitur setelah transform (untuk mapping feature_importances_)."""
    cat_encoder: OneHotEncoder = column_transformer.named_transformers_["cat"].named_steps["onehot"]
    cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
    return NUMERIC_FEATURES + BOOLEAN_FEATURES + cat_names

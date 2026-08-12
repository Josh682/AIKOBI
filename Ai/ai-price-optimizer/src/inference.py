"""
inference.py
------------
Modul INFERENCE murni untuk AI Price Optimizer.

Sesuai ketentuan lomba tahap penyisihan:
- Hanya fungsionalitas core inference (load model statis -> prediksi -> output).
- TIDAK ada retraining, auto-tuning, bulk testing script, atau feedback-loop otomatis
  di modul ini. Training ada terpisah di notebook (`notebooks/price_optimizer_training.ipynb`)
  dan `src/train.py`.

Fungsi utama: `analyze_price(...)` menerima atribut produk UMKM + snapshot harga
kompetitor (hasil scraping saat ini), lalu mengembalikan struktur yang sudah sesuai
kontrak UI dashboard (harga pasar, rentang wajar, confidence, status, faktor, rekomendasi).
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import joblib

from preprocessing import ALL_FEATURES, CITY_TIER_MAP, SEASONAL_MONTHS, get_output_feature_names

DEFAULT_MODEL_PATH = "models/price_optimizer_models.joblib"

_FACTOR_GROUPS = {
    "Harga kompetitor": ["competitor_price_mean", "competitor_price_median", "competitor_price_std",
                          "competitor_price_min", "competitor_price_max"],
    "Rating & ulasan": ["rating", "total_reviews"],
    "Tren penjualan": ["total_sold", "competitor_cluster_size", "discount_percent"],
    "Musim / momen": ["month", "is_seasonal_month"],
}

# Toleransi status: berapa persen di dalam/luar rentang wajar sebelum dianggap
# "Murah"/"Mahal" (bukan "Wajar"). Nilai statis, ditentukan saat desain -- bukan
# hasil tuning otomatis.
STATUS_MARGIN_PCT = 0.0  # 0% = persis di luar [lower, upper] baru dianggap murah/mahal


class PriceOptimizerModel:
    """Wrapper artefak model statis. Load sekali, dipakai berulang untuk inferensi."""

    def __init__(self, model_path: str = DEFAULT_MODEL_PATH):
        artifact = joblib.load(model_path)
        self.models = artifact["models"]          # {"lower":..., "median":..., "upper":...}
        self.quantiles = artifact["quantiles"]
        self._median_ct = self.models["median"].named_steps["preprocess"]
        self._median_gbr = self.models["median"].named_steps["model"]
        self._feature_names = get_output_feature_names(self._median_ct)
        self._global_importance = self._compute_grouped_importance()

    def _compute_grouped_importance(self) -> dict:
        importances = pd.Series(self._median_gbr.feature_importances_, index=self._feature_names)
        grouped = {}
        used = set()
        for group, cols in _FACTOR_GROUPS.items():
            grouped[group] = float(importances[cols].sum())
            used.update(cols)
        other_cols = [c for c in importances.index if c not in used]
        grouped["Lainnya"] = float(importances[other_cols].sum())
        total = sum(grouped.values()) or 1.0
        return {k: round(v / total * 100, 1) for k, v in grouped.items()}

    def predict_quantiles(self, feature_row: pd.DataFrame) -> dict:
        preds = {}
        for name, pipe in self.models.items():
            pred_log = pipe.predict(feature_row[ALL_FEATURES])[0]
            preds[name] = float(np.expm1(pred_log))
        lower = min(preds["lower"], preds["median"])
        upper = max(preds["upper"], preds["median"])
        return {"lower": lower, "median": preds["median"], "upper": upper}


def _build_feature_row(category: str, rating: float, total_reviews: int, total_sold: int,
                        discount_percent: float, is_official_store: bool, location: str,
                        competitor_prices: list[float], scraped_month: int) -> pd.DataFrame:
    """Susun satu baris fitur untuk produk UMKM, format identik dengan training
    (lihat `preprocessing.engineer_features`), tapi dihitung langsung dari snapshot
    kompetitor saat ini (bukan leave-one-out dari data historis)."""
    prices = np.asarray(competitor_prices, dtype=float)
    if len(prices) == 0:
        raise ValueError("Butuh minimal 1 harga kompetitor hasil scraping untuk analisis.")

    row = {
        "rating": rating,
        "total_reviews": total_reviews,
        "total_sold": total_sold,
        "discount_percent": discount_percent,
        "competitor_price_mean": float(prices.mean()),
        "competitor_price_median": float(np.median(prices)),
        "competitor_price_std": float(prices.std()) if len(prices) > 1 else 0.0,
        "competitor_price_min": float(prices.min()),
        "competitor_price_max": float(prices.max()),
        "competitor_cluster_size": len(prices),
        "city_tier": CITY_TIER_MAP.get(location, 3),
        "month": scraped_month,
        "is_official_store": int(is_official_store),
        "is_seasonal_month": int(scraped_month in SEASONAL_MONTHS),
        "category": category,
    }
    return pd.DataFrame([row])


def _confidence_score(lower: float, median: float, upper: float,
                       n_competitors: int) -> float:
    """Confidence deterministik dari (a) lebar rentang relatif terhadap median --
    makin sempit rentang, makin yakin model -- dan (b) jumlah data kompetitor yang
    dipakai (makin sedikit listing pembanding, makin rendah confidence).
    Tidak ada pembelajaran/tuning di sini, murni fungsi tertutup (deterministic)."""
    if median <= 0:
        return 50.0
    width_ratio = (upper - lower) / median  # makin kecil makin bagus
    width_score = float(np.clip(100 * (1 - width_ratio), 40, 99))

    # sedikit penalti kalau jumlah kompetitor yang dibandingkan sangat sedikit
    sample_score = float(np.clip(60 + n_competitors * 6, 60, 100))

    confidence = 0.7 * width_score + 0.3 * sample_score
    return round(float(np.clip(confidence, 40, 99)), 0)


def _status_and_recommendation(user_price: float, lower: float, median: float, upper: float) -> tuple[str, str]:
    if user_price < lower * (1 - STATUS_MARGIN_PCT):
        status = "Murah"
        gap_pct = (median - user_price) / median * 100
        text = (f"Harga kamu sudah lebih murah dari rata-rata pasar dan berpotensi menarik "
                 f"lebih banyak pembeli. Layak dipertahankan atau bisa dinaikkan tipis "
                 f"(hingga ~{gap_pct:.0f}% menuju harga rata-rata pasar) tanpa kehilangan daya saing.")
    elif user_price > upper * (1 + STATUS_MARGIN_PCT):
        status = "Mahal"
        gap_pct = (user_price - median) / median * 100
        text = (f"Harga kamu {gap_pct:.0f}% di atas rata-rata pasar. Pertimbangkan turun ke "
                 f"kisaran Rp{lower:,.0f} - Rp{upper:,.0f} agar tetap kompetitif, kecuali produkmu "
                 f"punya nilai tambah jelas (kualitas/garansi/brand) yang bisa menjustifikasi harga premium.")
    else:
        status = "Wajar"
        text = (f"Harga kamu berada di rentang wajar pasar (Rp{lower:,.0f} - Rp{upper:,.0f}). "
                 f"Posisi ini kompetitif — pertahankan, dan pantau terus pergerakan kompetitor.")
    return status, text


def analyze_price(
    product_name: str,
    category: str,
    user_price: float,
    rating: float,
    total_reviews: int,
    total_sold: int,
    discount_percent: float,
    is_official_store: bool,
    location: str,
    competitor_prices: list[float],
    scraped_month: int,
    model_path: str = DEFAULT_MODEL_PATH,
) -> dict:
    """Fungsi inference utama -- dipanggil oleh API/backend saat pengguna klik
    tombol "Analisis" di dashboard. Hanya forward pass model statis, tidak ada
    training/tuning apa pun di sini."""
    model = PriceOptimizerModel(model_path)
    feature_row = _build_feature_row(category, rating, total_reviews, total_sold,
                                      discount_percent, is_official_store, location,
                                      competitor_prices, scraped_month)
    q = model.predict_quantiles(feature_row)
    lower, median, upper = q["lower"], q["median"], q["upper"]

    confidence = _confidence_score(lower, median, upper, len(competitor_prices))
    status, recommendation = _status_and_recommendation(user_price, lower, median, upper)

    return {
        "product_name": product_name,
        "category": category,
        "harga_toko_kamu": round(user_price),
        "harga_rata_rata_pasar": round(median),
        "rentang_harga_wajar": {"min": round(lower), "max": round(upper)},
        "confidence_percent": confidence,
        "status": status,
        "rekomendasi": recommendation,
        "faktor_yang_mempengaruhi": model._global_importance,
    }

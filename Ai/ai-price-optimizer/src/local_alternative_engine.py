"""
local_alternative_engine.py
----------------------------
Fitur: "Smart Downsize / Local Brand Alternative Engine".

Problem AI (lihat 01_PROBLEM_DEFINITION.md bagian 2 untuk detail & justifikasi):
Diberikan sebuah produk sumber (biasanya brand internasional/mahal), cari produk
UMKM lokal di kategori yang sama yang (a) spesifikasinya mirip, (b) harganya jauh
lebih murah, dan (c) kualitasnya (dari rating + ulasan) terjamin.

Ini BUKAN classification/regression -- ini content-based matching/ranking, jadi
pipelinenya beda dari price optimizer:

1. **Spec Matching**: TF-IDF (nama + kategori + teks spesifikasi) + cosine
   similarity. `TfidfVectorizer` di-fit SEKALI dari katalog (statis) -- bukan
   auto-tuning, bukan retrain per request.
2. **Aspect-Based Sentiment Analysis (ABSA)**: pendekatan leksikon (rule-based),
   BUKAN model ML yang perlu dilatih -- deterministik, cocok untuk "core
   inference" statis sesuai ketentuan lomba.
3. **Ranking**: gabungkan spec similarity + rating + skor sentimen jadi satu
   skor akhir, filter berdasarkan ambang batas hemat harga.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------------------------------------------
# ABSA: leksikon aspek & sentimen Bahasa Indonesia (statis, dikurasi manual).
# ---------------------------------------------------------------------------
ASPECT_KEYWORDS: dict[str, list[str]] = {
    "Kualitas": ["kualitas", "berkualitas", "bahan", "premium", "murahan"],
    "Keawetan": ["awet", "tahan", "rusak", "jahitan", "kuat", "kokoh", "lepas"],
    "Pengiriman": ["kirim", "pengiriman", "packing", "paket", "sampai"],
    "Pelayanan": ["pelayanan", "seller", "admin", "respon", "ramah", "chat"],
    "Harga": ["harga", "worth it", "worthit", "murah", "mahal", "terjangkau", "bersahabat"],
}

POSITIVE_WORDS = {
    "bagus", "premium", "awet", "kuat", "kokoh", "cepat", "rapi", "aman", "ramah",
    "responsif", "memuaskan", "terjangkau", "bersahabat", "worth", "oke", "sesuai",
    "recommended", "mantap", "puas", "berkualitas",
}
NEGATIVE_WORDS = {
    "kurang", "murahan", "mengecewakan", "rusak", "lambat", "lama", "penyok",
    "hilang", "susah", "mahal", "kemahalan", "lepas", "jelek", "biasa",
}

_WORD_RE = re.compile(r"[a-zA-Z0-9.]+")


def _tokenize(text: str) -> list[str]:
    return [t.strip(".") for t in _WORD_RE.findall(text.lower()) if t.strip(".")]


def aspect_based_sentiment(reviews: list[str]) -> dict[str, dict]:
    """ABSA berbasis leksikon: untuk tiap ulasan, tandai aspek yang disebut lalu
    hitung polaritas kata di sekitarnya. Hasil: {aspek: {"score": -1..1, "mentions": n}}.

    Pendekatan ini sengaja sederhana & deterministik (bukan model terlatih)
    supaya tetap dalam scope "core inference" statis -- tidak butuh dataset
    berlabel sentimen untuk training.
    """
    scores = {a: {"pos": 0, "neg": 0, "mentions": 0} for a in ASPECT_KEYWORDS}

    for review in reviews:
        tokens = set(_tokenize(review))
        review_lower = review.lower()
        pos_hits = len(tokens & POSITIVE_WORDS)
        neg_hits = len(tokens & NEGATIVE_WORDS)

        for aspect, keywords in ASPECT_KEYWORDS.items():
            if any(kw in review_lower for kw in keywords):
                scores[aspect]["mentions"] += 1
                scores[aspect]["pos"] += pos_hits
                scores[aspect]["neg"] += neg_hits

    result = {}
    for aspect, s in scores.items():
        total = s["pos"] + s["neg"]
        polarity = (s["pos"] - s["neg"]) / total if total > 0 else 0.0
        result[aspect] = {"score": round(polarity, 2), "mentions": s["mentions"]}
    return result


def overall_sentiment_score(reviews: list[str]) -> float:
    """Ringkasan sentimen keseluruhan (-1..1) dari semua aspek yang disebut."""
    absa = aspect_based_sentiment(reviews)
    mentioned = [v["score"] for v in absa.values() if v["mentions"] > 0]
    return round(float(np.mean(mentioned)), 2) if mentioned else 0.0


# ---------------------------------------------------------------------------
# Spec matching (TF-IDF + cosine similarity)
# ---------------------------------------------------------------------------
_STOPWORDS = {"dengan", "dan", "atau", "yang", "untuk", "the", "and", "or", "with"}


def spec_overlap_pct(source_text: str, candidate_text: str) -> float:
    """Metrik kecocokan spesifikasi yang literal & intuitif untuk ditampilkan ke
    user: berapa persen kata kunci spesifikasi produk SUMBER yang juga muncul di
    kandidat. Beda dari TF-IDF cosine (dipakai untuk ranking/retrieval, lebih
    toleran terhadap variasi kata) -- metrik ini menjawab langsung narasi
    "produk lokal ini X% setara spesifikasi dengan versi originalnya".
    """
    source_tokens = {t for t in _tokenize(source_text) if t not in _STOPWORDS and len(t) >= 2}
    candidate_tokens = {t for t in _tokenize(candidate_text) if t not in _STOPWORDS and len(t) >= 2}
    if not source_tokens:
        return 0.0
    overlap = len(source_tokens & candidate_tokens)
    return round(overlap / len(source_tokens) * 100, 1)


def build_catalog_text(df: pd.DataFrame) -> pd.Series:
    """Gabungkan nama + kategori + spesifikasi jadi satu field teks untuk TF-IDF."""
    return (df["name"].fillna("") + " " + df["category"].fillna("") + " "
            + df["specifications_text"].fillna(""))


@dataclass
class LocalAlternativeEngine:
    """Wrapper statis: TF-IDF vectorizer di-fit sekali dari katalog produk yang
    sudah discraping. Dipakai berulang untuk mencari alternatif tanpa retrain."""

    vectorizer: TfidfVectorizer = field(default_factory=lambda: TfidfVectorizer(
        token_pattern=r"(?u)\b[a-zA-Z]{2,}\b", ngram_range=(1, 2), min_df=1,
    ))
    catalog: pd.DataFrame | None = None
    tfidf_matrix=None

    def fit(self, catalog: pd.DataFrame) -> "LocalAlternativeEngine":
        self.catalog = catalog.reset_index(drop=True)
        corpus = build_catalog_text(self.catalog)
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        return self

    def find_alternatives(
        self,
        source_name: str,
        source_category: str,
        source_specifications_text: str,
        source_price: float,
        min_price_savings_pct: float = 25.0,
        min_spec_similarity: float = 0.15,
        top_k: int = 3,
        local_only: bool = True,
    ) -> list[dict]:
        """Cari kandidat alternatif UMKM lokal untuk sebuah produk sumber.

        `min_price_savings_pct`/`min_spec_similarity` adalah ambang batas STATIS
        (ditentukan manual saat desain, lihat notebook bagian evaluasi) -- bukan
        hasil tuning otomatis.
        """
        if self.catalog is None:
            raise RuntimeError("Engine belum di-fit ke katalog. Panggil .fit(catalog) dulu.")

        source_text = f"{source_name} {source_category} {source_specifications_text}"
        source_vec = self.vectorizer.transform([source_text])
        sims = cosine_similarity(source_vec, self.tfidf_matrix)[0]

        candidates = self.catalog.copy()
        candidates["spec_similarity"] = sims

        mask = (
            (candidates["category"] == source_category)
            & (candidates["name"] != source_name)
            & (candidates["price"] <= source_price * (1 - min_price_savings_pct / 100))
            & (candidates["spec_similarity"] >= min_spec_similarity)
        )
        if local_only and "brand_tier" in candidates.columns:
            mask &= candidates["brand_tier"] == "Lokal_UMKM"
        elif local_only and "is_official_store" in candidates.columns:
            mask &= ~candidates["is_official_store"]

        candidates = candidates[mask].copy()
        if candidates.empty:
            return []

        # skor sentimen per kandidat (dari ulasan, kalau ada)
        if "reviews" in candidates.columns:
            candidates["sentiment_score"] = candidates["reviews"].apply(overall_sentiment_score)
        else:
            candidates["sentiment_score"] = 0.0

        # normalisasi rating ke 0..1 supaya sebanding dgn similarity/sentiment
        rating_norm = (candidates["rating"] - 1) / 4.0

        # skor gabungan: bobot statis (ditentukan manual, bukan auto-tuning)
        candidates["final_score"] = (
            0.55 * candidates["spec_similarity"]
            + 0.25 * rating_norm
            + 0.20 * (candidates["sentiment_score"] + 1) / 2  # sentimen -1..1 -> 0..1
        )
        candidates["price_savings_pct"] = round((1 - candidates["price"] / source_price) * 100, 1)
        # TF-IDF cosine dipakai untuk ranking (robust thd variasi kata); untuk
        # ditampilkan ke user dipakai overlap kata kunci literal (lebih intuitif,
        # selaras dgn narasi "X% setara spesifikasi").
        candidates["spec_match_pct"] = candidates["specifications_text"].apply(
            lambda text: spec_overlap_pct(source_specifications_text, text)
        )

        candidates = candidates.sort_values("final_score", ascending=False).head(top_k)

        results = []
        for _, row in candidates.iterrows():
            absa = aspect_based_sentiment(row.get("reviews", []))
            top_aspect = max(absa.items(), key=lambda kv: kv[1]["mentions"]) if absa else None
            results.append({
                "name": row["name"],
                "seller": row.get("seller"),
                "price": int(row["price"]),
                "price_savings_pct": float(row["price_savings_pct"]),
                "spec_match_pct": float(row["spec_match_pct"]),
                "rating": float(row["rating"]),
                "sentiment_score": float(row["sentiment_score"]),
                "aspect_sentiment": absa,
                "highlight_aspect": top_aspect[0] if top_aspect else None,
            })
        return results

"""
train.py
--------
Fungsi training model AI Price Optimizer.

Melatih 3 GradientBoostingRegressor dengan `loss="quantile"` (alpha 0.1 / 0.5 / 0.9)
memakai hyperparameter STATIS (bukan hasil GridSearchCV/RandomizedSearchCV / auto-tuning
apa pun -- sesuai ketentuan lomba tahap penyisihan).
"""
from __future__ import annotations

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.pipeline import Pipeline

from preprocessing import ALL_FEATURES, TARGET, build_feature_pipeline

# Hyperparameter statis -- ditentukan lewat eksplorasi manual singkat (lihat notebook,
# bagian "Evaluasi"), BUKAN hasil auto-tuning otomatis.
STATIC_PARAMS = dict(
    n_estimators=250,
    max_depth=3,
    learning_rate=0.05,
    subsample=0.8,
    min_samples_leaf=15,
    random_state=42,
)

QUANTILES = {"lower": 0.1, "median": 0.5, "upper": 0.9}


def build_model_pipeline(alpha: float) -> Pipeline:
    preprocessor = build_feature_pipeline()
    model = GradientBoostingRegressor(loss="quantile", alpha=alpha, **STATIC_PARAMS)
    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def train_quantile_models(X_train, y_train) -> dict[str, Pipeline]:
    """Latih 3 pipeline (lower/median/upper). Log-transform target supaya
    distribusi harga yang right-skewed lebih mudah dipelajari pohon regresi."""
    models = {}
    y_train_log = np.log1p(y_train)
    for name, alpha in QUANTILES.items():
        pipe = build_model_pipeline(alpha)
        pipe.fit(X_train[ALL_FEATURES], y_train_log)
        models[name] = pipe
        print(f"[train] model '{name}' (alpha={alpha}) selesai dilatih.")
    return models


def predict_quantiles(models: dict[str, Pipeline], X) -> dict[str, np.ndarray]:
    preds = {}
    for name, pipe in models.items():
        pred_log = pipe.predict(X[ALL_FEATURES])
        preds[name] = np.expm1(pred_log)
    # jaga urutan lower <= median <= upper (quantile crossing bisa terjadi jarang)
    lower = np.minimum(preds["lower"], preds["median"])
    upper = np.maximum(preds["upper"], preds["median"])
    preds["lower"], preds["upper"] = lower, upper
    return preds


def save_models(models: dict[str, Pipeline], path: str = "models/price_optimizer_models.joblib"):
    joblib.dump({"models": models, "params": STATIC_PARAMS, "quantiles": QUANTILES}, path)
    print(f"[save] model tersimpan di {path}")


def load_models(path: str = "models/price_optimizer_models.joblib") -> dict:
    return joblib.load(path)

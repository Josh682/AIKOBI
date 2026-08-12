"""
retrain_and_export.py
---------------------
Script satu langkah:
1. Generate dummy training data
2. Train ulang model GBR (3 quantile models) dengan sklearn versi saat ini
3. Export semua parameter model ke JSON agar bisa dipakai di TypeScript/Next.js

Jalankan dari folder: Ai/ai-price-optimizer/
    python3 retrain_and_export.py
"""
from __future__ import annotations

import sys, json, os
import numpy as np
import pandas as pd
import joblib

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from generate_dummy_data import generate_dummy_dataset
from preprocessing import clean_raw_products, engineer_features, ALL_FEATURES, TARGET
from train import train_quantile_models, save_models

# ── 1. Generate data & train ───────────────────────────────────────────────
print("[1/3] Generating dummy training data...")
df_raw = generate_dummy_dataset(n_rows=6000)
df_clean = clean_raw_products(df_raw)
df_feat = engineer_features(df_clean)

X = df_feat[ALL_FEATURES]
y = df_feat[TARGET]

from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

print("[2/3] Training 3 quantile GBR models (lower/median/upper)...")
models = train_quantile_models(X_train, y_train)
save_models(models)
print("      Saved updated models/price_optimizer_models.joblib")

# ── 2. Verify model loads ─────────────────────────────────────────────────
artifact = joblib.load("models/price_optimizer_models.joblib")
models = artifact["models"]

# ── 3. Export tree parameters to JSON ─────────────────────────────────────
print("[3/3] Exporting model parameters to JSON...")

def export_trees(gbr) -> list:
    """Extract all decision tree nodes from a GradientBoostingRegressor."""
    trees = []
    for stage in gbr.estimators_:
        tree = stage[0].tree_
        trees.append({
            "children_left":  tree.children_left.tolist(),
            "children_right": tree.children_right.tolist(),
            "feature":        tree.feature.tolist(),
            "threshold":      tree.threshold.tolist(),
            # quantile GBR: value shape is (n_nodes, 1, 1)
            "value":          tree.value[:, 0, 0].tolist(),
        })
    return trees

export: dict = {}

for name, pipe in models.items():
    gbr = pipe.named_steps["model"]
    ct  = pipe.named_steps["preprocess"]

    # ── Scaler (StandardScaler on numeric features) ──
    num_pipe = ct.transformers_[0][1]
    scaler   = num_pipe.named_steps["scale"]

    # ── OneHotEncoder (on category feature) ──
    cat_pipe = ct.transformers_[2][1]
    ohe      = cat_pipe.named_steps["onehot"]
    ohe_categories = [list(c) for c in ohe.categories_]

    # ── GBR init prediction (constant log-space quantile of training target) ──
    # In sklearn 1.9.0, init_ is a DummyRegressor — use predict() to get the
    # actual fitted constant (in log-space, since y_train was log-transformed).
    # .quantile attribute only stores the alpha parameter, NOT the fitted value.
    _dummy_X = np.zeros((1, 1))
    init_pred = float(gbr.init_.predict(_dummy_X).ravel()[0])

    export[name] = {
        "alpha":          gbr.alpha,
        "learning_rate":  gbr.learning_rate,
        "n_estimators":   gbr.n_estimators,
        "init_log":       init_pred,          # log-space initial prediction
        "scaler_mean":    scaler.mean_.tolist(),
        "scaler_scale":   scaler.scale_.tolist(),
        "ohe_categories": ohe_categories,     # e.g. [["Elektronik","Fashion",...]]
        "trees":          export_trees(gbr),
    }
    n_nodes = sum(len(t["feature"]) for t in export[name]["trees"])
    print(f"      {name}: {gbr.n_estimators} trees, {n_nodes} total nodes, alpha={gbr.alpha}")

# ── Save JSON next to the scrape route ────────────────────────────────────
OUT_PATH = os.path.join(
    os.path.dirname(__file__),
    "../../apps/web/app/api/scrape/ml_model_params.json"
)
OUT_PATH = os.path.normpath(OUT_PATH)

with open(OUT_PATH, "w") as f:
    json.dump(export, f, separators=(",", ":"))

size_kb = os.path.getsize(OUT_PATH) / 1024
print(f"\n✅ Exported to: {OUT_PATH}  ({size_kb:.1f} KB)")
print("   Next step: run the Next.js app — ML inference is now embedded!")

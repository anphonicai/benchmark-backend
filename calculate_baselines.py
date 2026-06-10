#!/usr/bin/env python3
"""
Cohort Baseline Calculator — Phase 1
Reads all brand CSV folders, calculates repeat_rate, repeat_revenue,
and returning_aov_premium per brand, then outputs medians + quartiles
by category ready to paste into cohort-baselines.json.

Run:
  pip install pandas numpy
  python3 calculate_baselines.py
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path

# ─────────────────────────────────────────────────────────────
# CONFIG — change PHASE1_PATH if you move the folder
# ─────────────────────────────────────────────────────────────
PHASE1_PATH = "/Users/akshita/Downloads/PHASE 1 "

BRAND_CATEGORIES = {
    "Arusha Food":        "food_beverage",
    "Boombay":            "food_beverage",
    "Bubz":               "food_beverage",
    "Butterfly Ayurveda": "wellness_supplements",
    "Caramelly":          "food_beverage",
    "Dhampur Green":      "food_beverage",
    "Jhama Sweets":       "food_beverage",
    "Jolochip":           "food_beverage",
    "Kilobeaters":        "health_nutrition",
    "Korebi":             "health_nutrition",
    "Overnight Oats":     "food_beverage",
    "Pure Nutrition":     "health_nutrition",
    "SuperYou":           "wellness_supplements",
}

# Brands to flag as potentially contaminated (verify manually)
FLAGGED_BRANDS = ["Overnight Oats"]

METRICS = ["repeat_rate_90d_pct", "repeat_revenue_pct", "returning_aov_premium_pct"]
# ─────────────────────────────────────────────────────────────


def find_brand_folder(base, brand):
    for p in Path(base).iterdir():
        if p.is_dir() and p.name.strip() == brand.strip():
            return p
    return None


def find_csv(folder, keywords):
    for f in sorted(Path(folder).glob("*.csv")):
        name = f.name.lower()
        if all(kw.lower() in name for kw in keywords):
            return f
    return None


def read_new_vs_returning_90d(folder):
    csv = (
        find_csv(folder, ["new_vs_returning", "90"])
        or find_csv(folder, ["new_vs_returning_sales", "90"])
        or find_csv(folder, ["new_vs_returning_customer", "90"])
    )
    if not csv:
        return {}, None

    try:
        df = pd.read_csv(csv)
    except Exception as e:
        return {}, str(e)

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    cust_col = next(
        (c for c in df.columns if "returning" in c or "new_or" in c or "customer" in c),
        None,
    )
    if not cust_col:
        return {}, "no customer column"

    new_row = df[df[cust_col].str.lower().str.contains("new", na=False)]
    ret_row = df[df[cust_col].str.lower().str.contains("returning", na=False)]
    if new_row.empty or ret_row.empty:
        return {}, "missing new/returning rows"

    result = {}

    # repeat_revenue_pct
    sales_col = next(
        (c for c in df.columns if "total_sales" in c or (c == "sales" and "net" not in c)),
        None,
    )
    if not sales_col:
        sales_col = next((c for c in df.columns if "sales" in c and "net" not in c), None)

    if sales_col:
        new_s = float(new_row[sales_col].values[0])
        ret_s = float(ret_row[sales_col].values[0])
        total = new_s + ret_s
        if total > 0:
            result["repeat_revenue_pct"] = round(ret_s / total * 100, 1)

    # repeat_rate_90d_pct (from Orders column)
    order_col = next(
        (
            c for c in df.columns
            if "order" in c
            and "value" not in c
            and "average" not in c
            and "aov" not in c
            and "rate" not in c
        ),
        None,
    )
    if order_col:
        try:
            new_o = float(new_row[order_col].values[0])
            ret_o = float(ret_row[order_col].values[0])
            total_o = new_o + ret_o
            if total_o > 0:
                result["repeat_rate_90d_pct"] = round(ret_o / total_o * 100, 1)
        except Exception:
            pass

    # returning_aov_premium_pct
    aov_col = next(
        (c for c in df.columns if "average_order" in c or "aov" in c), None
    )
    if aov_col:
        try:
            new_aov = float(new_row[aov_col].values[0])
            ret_aov = float(ret_row[aov_col].values[0])
            if new_aov > 0:
                result["returning_aov_premium_pct"] = round(
                    (ret_aov / new_aov - 1) * 100, 1
                )
        except Exception:
            pass

    return result, csv.name


def calc_repeat_rate_from_customers(folder):
    csv = find_csv(folder, ["sales_by_customer", "90"]) or find_csv(
        folder, ["customer", "90"]
    )
    if not csv:
        return None, None
    try:
        df = pd.read_csv(csv)
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        order_col = next(
            (
                c for c in df.columns
                if "order" in c and "value" not in c and "sales" not in c
            ),
            None,
        )
        if not order_col:
            return None, None
        total = len(df)
        repeat = len(df[pd.to_numeric(df[order_col], errors="coerce") > 1])
        rate = round(repeat / total * 100, 1) if total > 0 else None
        return rate, csv.name
    except Exception:
        return None, None


def compute_stats(values):
    s = pd.Series(values).dropna()
    if s.empty:
        return None
    mode_vals = s.mode()
    return {
        "mean":             round(float(s.mean()), 1),
        "median":           round(float(s.median()), 1),
        "mode":             round(float(mode_vals.iloc[0]), 1) if not mode_vals.empty else None,
        "top_quartile":     round(float(s.quantile(0.75)), 1),
        "bottom_quartile":  round(float(s.quantile(0.25)), 1),
        "min":              round(float(s.min()), 1),
        "max":              round(float(s.max()), 1),
        "count":            int(s.count()),
        "all_values_sorted": sorted([round(v, 1) for v in s.tolist()]),
    }


# ─────────────────────────────────────────────────────────────
# STEP 1 — Extract metrics per brand
# ─────────────────────────────────────────────────────────────
print("=" * 65)
print("COHORT BASELINE CALCULATOR — Phase 1 (13 brands)")
print("=" * 65)

rows = []
warnings = []

for brand, category in BRAND_CATEGORIES.items():
    folder = find_brand_folder(PHASE1_PATH, brand)
    if not folder:
        print(f"\n[MISSING FOLDER] {brand}")
        warnings.append(f"Folder not found: {brand}")
        continue

    row = {"brand": brand, "category": category}

    metrics, source_file = read_new_vs_returning_90d(folder)
    row.update(metrics)
    row["_source_file"] = source_file or "not found"

    # Fallback repeat_rate from customer CSV
    if "repeat_rate_90d_pct" not in row:
        rate, cfile = calc_repeat_rate_from_customers(folder)
        if rate is not None:
            row["repeat_rate_90d_pct"] = rate
            row["_repeat_rate_source"] = f"customer_fallback: {cfile}"

    # Flag suspicious data
    if brand in FLAGGED_BRANDS:
        rr = row.get("repeat_revenue_pct")
        if rr and rr > 90:
            row["_flag"] = f"repeat_revenue_pct={rr}% — possible B2B/wholesale contamination. Verify before including."
            warnings.append(f"[FLAG] {brand}: repeat_revenue_pct={rr}% looks anomalous")

    rows.append(row)

    flag = f"  *** {row.get('_flag', '')}" if "_flag" in row else ""
    print(f"\n[{brand}] ({category})")
    print(f"  repeat_rate_90d_pct:       {row.get('repeat_rate_90d_pct', 'N/A')}%")
    print(f"  repeat_revenue_pct:        {row.get('repeat_revenue_pct', 'N/A')}%")
    print(f"  returning_aov_premium_pct: {row.get('returning_aov_premium_pct', 'N/A')}%")
    print(f"  source: {row['_source_file']}")
    if flag:
        print(flag)

# ─────────────────────────────────────────────────────────────
# STEP 2 — Statistics by category
# ─────────────────────────────────────────────────────────────
df = pd.DataFrame(rows)

print("\n\n" + "=" * 65)
print("RESULTS — MEAN / MEDIAN / MODE / QUARTILES BY CATEGORY")
print("=" * 65)

categories_to_show = ["overall"] + sorted(df["category"].dropna().unique().tolist())
output = {}

for cat in categories_to_show:
    cat_df = df if cat == "overall" else df[df["category"] == cat]
    brand_list = cat_df["brand"].tolist()

    print(f"\n{'─'*65}")
    print(f"  {cat.upper()}  ({len(cat_df)} brands: {', '.join(brand_list)})")
    print(f"{'─'*65}")

    output[cat] = {"_brand_count": len(cat_df), "_brands": brand_list}

    for metric in METRICS:
        if metric not in cat_df.columns:
            continue
        vals = pd.to_numeric(cat_df[metric], errors="coerce").dropna().tolist()
        if not vals:
            print(f"  {metric}: no data")
            continue
        s = compute_stats(vals)
        output[cat][metric] = s

        print(f"\n  {metric}")
        print(f"    All values (sorted): {s['all_values_sorted']}")
        print(f"    Mean:                {s['mean']}")
        print(f"    Median:              {s['median']}   ← use this in JSON")
        print(f"    Mode:                {s['mode']}")
        print(f"    Top Quartile (Q3):   {s['top_quartile']}   ← use this in JSON")
        print(f"    Bottom Quartile (Q1):{s['bottom_quartile']}")
        print(f"    Min / Max:           {s['min']} / {s['max']}")

# ─────────────────────────────────────────────────────────────
# STEP 3 — Warnings summary
# ─────────────────────────────────────────────────────────────
if warnings:
    print("\n\n" + "=" * 65)
    print("WARNINGS — review before updating cohort-baselines.json")
    print("=" * 65)
    for w in warnings:
        print(f"  {w}")

print("\n\nNOTE: The following metrics need Rebuy dashboard exports")
print("(not available in Shopify CSVs — keep existing JSON values):")
print("  - time_to_2nd_order_days")
print("  - rebuy_revenue_share_pct")
print("  - personalisation_aov_lift_pct")

# ─────────────────────────────────────────────────────────────
# STEP 4 — Save full output to JSON
# ─────────────────────────────────────────────────────────────
out_path = Path(__file__).parent / "cohort-verification-output.json"
with open(out_path, "w") as f:
    json.dump(output, f, indent=2)

print(f"\nFull results saved to: {out_path}")
print("Done.")

# Cohort Baseline Calculator — How to Use

## What This Script Does

The script `calculate_baselines.py` reads raw Shopify CSV data for all 13 brands in Phase 1 and calculates:

- **repeat_rate_90d_pct** — what % of orders in 90 days came from returning customers
- **repeat_revenue_pct** — what % of revenue in 90 days came from returning customers
- **returning_aov_premium_pct** — how much more returning customers spend per order vs new customers

It then calculates **mean, median, mode, top quartile, bottom quartile, min, max** for each metric — grouped by category (Food & Beverage, Health & Nutrition, Wellness & Supplements, and Overall).

The final numbers are what go into `api/cohort-baselines.json` as the benchmark medians.

---

## Files Involved

| File | What it is |
|---|---|
| `calculate_baselines.py` | The script — run this |
| `cohort-verification-output.json` | Output file — generated after running the script |
| `api/cohort-baselines.json` | The benchmark file used by the scoring engine |
| `/Users/akshita/Downloads/PHASE 1 /` | The brand data folder (downloaded from Google Drive) |

---

## First-Time Setup

Open Terminal and run these commands once:

```bash
# Check Python is installed
python3 --version

# Install required libraries
pip3 install pandas numpy
```

---

## How to Run the Script

Open Terminal and run:

```bash
python3 /Users/akshita/Documents/benchmark-backend/calculate_baselines.py
```

The script will print all results in the terminal and save full output to:
```
/Users/akshita/Documents/benchmark-backend/cohort-verification-output.json
```

---

## How to Get Fresh Data from Google Drive

When new brand data is available in Google Drive:

1. Go to Google Drive → **North Report → PHASE 1**
2. Right-click the PHASE 1 folder → **Download**
3. Move the downloaded folder to: `/Users/akshita/Downloads/PHASE 1 `
4. Run the script again (same command above)

The script will automatically re-process all brands.

---

## What the Output Means

Example output for Food & Beverage:

```
repeat_revenue_pct
  All values (sorted): [11.6, 22.1, 25.0, 31.6, 39.8, 53.4, 61.2, 99.8]
  Mean:                43.1
  Median:              35.7   ← use this in JSON
  Top Quartile (Q3):   55.4   ← use this in JSON
```

- **All values** = one number per brand, sorted low to high
- **Median** = the middle value — this is what goes in `cohort-baselines.json` as `"median"`
- **Top Quartile** = the value at the 75th percentile — this goes in `cohort-baselines.json` as `"top_quartile"`
- **Mean** = average of all values (for reference only)
- **Mode** = most common value (for reference only)

---

## How the Script Finds Data Per Brand

For each brand folder, the script looks for these CSV files:

### 1. new_vs_returning `*90*days*` CSV
Used to calculate **repeat_revenue_pct**, **repeat_rate_90d_pct**, **returning_aov_premium_pct**

The script searches for filenames containing both `new_vs_returning` and `90` — for example:
- `Arusha Foods new_vs_returning_customers_90days (3).csv`
- `Boombay new_vs_returning_customers_last_90_days.csv`
- `Caramelly new_vs_returning_sales_90days_jan23_apr23_2026.csv`

It reads the **New** row and **Returning** row and calculates:
```
repeat_revenue_pct     = Returning Sales / Total Sales × 100
repeat_rate_90d_pct    = Returning Orders / Total Orders × 100
returning_aov_premium  = (Returning AOV / New AOV - 1) × 100
```

### 2. sales_by_customer `*90*days*` CSV (fallback)
Used only when the new_vs_returning CSV has no Orders column.
The script counts customers with more than 1 order and divides by total customers.

---

## Warnings to Watch For

### "99.8% repeat_revenue_pct — possible B2B/wholesale contamination"
Overnight Oats shows 99.8% repeat revenue which is not normal for a D2C brand.
This matches the note in `cohort-baselines.json`:
> "1 brand excluded from revenue-share calculations due to B2B/wholesale contamination"

**Action**: Confirm with Simran Ramsay whether Overnight Oats should be excluded from revenue calculations.

### "N/A" for repeat_rate_90d_pct
Some brand CSVs only have a sales column, no orders column (e.g., Caramelly, Bubz).
The script cannot calculate repeat_rate from sales alone.
**Action**: Check if the brand's `sales_by_customer_90days.csv` file exists — the script will use that as fallback.

---

## Metrics NOT Available from Shopify CSVs

These 3 metrics require **Rebuy dashboard exports** — they cannot be calculated from the Shopify CSV files:

| Metric | Why it needs Rebuy |
|---|---|
| `time_to_2nd_order_days` | Needs order date history per customer |
| `rebuy_revenue_share_pct` | Needs Rebuy widget revenue breakdown |
| `personalisation_aov_lift_pct` | Needs Rebuy personalised vs non-personalised order comparison |

Keep the existing values in `cohort-baselines.json` for these until Rebuy exports are available.

---

## Category Assignments

The script assigns each brand to a category. Current mapping:

| Brand | Category |
|---|---|
| Arusha Food | food_beverage |
| Boombay | food_beverage |
| Bubz | food_beverage |
| Caramelly | food_beverage |
| Dhampur Green | food_beverage |
| Jhama Sweets | food_beverage |
| Jolochip | food_beverage |
| Overnight Oats | food_beverage |
| Kilobeaters | health_nutrition |
| Korebi | health_nutrition |
| Pure Nutrition | health_nutrition |
| Butterfly Ayurveda | wellness_supplements |
| SuperYou | wellness_supplements |

To change a category, open `calculate_baselines.py` in any text editor and edit the `BRAND_CATEGORIES` section at the top of the file.

---

## After Running — How to Update cohort-baselines.json

1. Run the script and note the **Median** and **Top Quartile** values per metric per category
2. Open `api/cohort-baselines.json`
3. Update the corresponding `"median"` and `"top_quartile"` values
4. Update `"cohort_size"` and `"extraction_date"` in `_metadata`

Example — updating Food & Beverage repeat_revenue_pct:
```json
"food_beverage": {
  "repeat_revenue_pct": {
    "median": 35.7,
    "top_quartile": 55.4
  }
}
```

---

## Quick Reference — Terminal Commands

```bash
# Run the script
python3 /Users/akshita/Documents/benchmark-backend/calculate_baselines.py

# View the output JSON
cat /Users/akshita/Documents/benchmark-backend/cohort-verification-output.json

# Open the output in VS Code
code /Users/akshita/Documents/benchmark-backend/cohort-verification-output.json

# Install dependencies (first time only)
pip3 install pandas numpy
```

# Anphonic Benchmark Tool — Project Report

**Prepared by:** Akshita  
**Date:** June 2026  
**GitHub:** https://github.com/anphonicai/benchmark-backend  
**Live URL (pending):** https://benchmark.anphonic.ai

---

## Project Demo Video

▶ [Watch Demo Video](#) ← *link to be added*

---

## 1. What Is This Project?

The **Anphonic Benchmark Tool** is a web application that allows D2C (direct-to-consumer) brands to benchmark their retention and revenue performance against industry cohorts.

A brand fills in a short multi-step form with their key metrics. The system scores them, compares them against category benchmarks, identifies performance gaps, and generates a personalised **Shelf Score** report — all in under 3 minutes.

**Who it's for:** D2C brand founders, growth leads, and e-commerce heads who want to understand how their retention metrics (repeat rate, AOV, revenue from repeat customers) compare to similar brands.

---

## 2. What Was Built

### Multi-Step Form Flow

The application guides users through a clean, step-by-step form:

| Step | Page | What happens |
|------|------|-------------|
| 01 | **Brand Info** | Collects name, role, email, phone, brand name, Shopify URL, category, orders/month |
| 02 | **Connect or Manual** | User chooses manual data entry (Shopify integration also available) |
| 03 | **Manual Data Entry** | Collects 5 key retention metrics + tool stack (loyalty, upsell, WhatsApp) |
| 04 | **Benchmark Report** | Displays Shelf Score, percentile rank, gap analysis, and recommendations |

### Database Saving
Every form submission is saved to a PostgreSQL database in real time:
- **BrandInfoPage** → saves company details (name, email, category, contact info)
- **ManualDataEntryPage** → saves metrics and generates the Shelf Score
- No duplicate records — the system links both steps using a unique company ID

### Benchmark Report Generation
The scoring engine (`api/scoring.js`) calculates:
- **Shelf Score** — a composite retention score out of 100
- **Cohort Percentile** — where the brand sits vs. the benchmark cohort
- **Gap Analysis** — top 3 areas where the brand is underperforming
- **Performance Verdict** — directional label (e.g. "Strong Performer", "Needs Work")

---

## 3. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite + Tailwind CSS | Fast, modern UI with clean component structure |
| Backend | Node.js + Express | Lightweight API server, easy to deploy |
| Database | PostgreSQL | Reliable relational DB, supports complex queries |
| Containerisation | Docker | Consistent builds across local and cloud environments |
| Hosting | Google Cloud Run | Auto-scales, pay-per-use, no server management |
| Database Hosting | Google Cloud SQL | Managed PostgreSQL, automatic backups |
| Source Control | GitHub | Version control and collaboration |

---

## 4. Architecture

```
User (Browser)
      │
      ▼
┌─────────────────────────────┐
│       Google Cloud Run      │
│                             │
│  Express Server (Node.js)   │
│  ├── Serves React frontend  │
│  └── API routes (/api/...)  │
└────────────┬────────────────┘
             │ Cloud SQL socket
             ▼
┌─────────────────────────────┐
│     Google Cloud SQL        │
│     (PostgreSQL 15)         │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │companies │ │ metrics  │  │
│  └──────────┘ └──────────┘  │
└─────────────────────────────┘
```

**Key design decisions:**
- Frontend and backend are served from a single container — simpler deployment, no CORS issues
- Cloud Run scales to zero when no traffic — no idle cost
- Cloud SQL handles automated backups and security patches

---

## 5. Deployment & Hosting Setup

### What Was Done

| Task | Status |
|------|--------|
| Multi-page React form built and tested locally | ✅ Done |
| Backend API routes for brand info and manual benchmark | ✅ Done |
| PostgreSQL schema (companies + metrics tables) | ✅ Done |
| Docker multi-stage build (Vite → Node.js production image) | ✅ Done |
| GitHub repository set up and code pushed | ✅ Done |
| Google Cloud CLI installed and configured | ✅ Done |
| GCP project selected (`clean-galaxy-498211-e3`) | ✅ Done |
| Custom domain plan (`benchmark.anphonic.ai`) | ✅ Ready to configure |

### What Remains (pending billing activation)

| Task | Estimated Time |
|------|---------------|
| Link billing account to GCP project | 5 minutes |
| Enable Cloud APIs (Run, SQL, Build, Registry) | 2 minutes |
| Create Cloud SQL PostgreSQL instance | 5 minutes |
| Run database schema on Cloud SQL | 2 minutes |
| Build and push Docker image via Cloud Build | 5 minutes |
| Deploy to Cloud Run | 3 minutes |
| Map `benchmark.anphonic.ai` custom domain | 10 minutes + DNS propagation |
| **Total** | **~30 minutes once billing is active** |

---

## 6. How to View Submissions (Once Live)

Once deployed, there are two ways to see brand data that has been submitted:

**1. API endpoint** — open in browser:
```
https://benchmark.anphonic.ai/metrics
```
Returns all submissions with company name, email, category, shelf score, and timestamp.

**2. Cloud SQL Studio** — Google Cloud Console → Cloud SQL → Cloud SQL Studio
Run SQL queries directly on the database to filter, sort, and export data.

---

## 7. Cost Estimate

| Service | Monthly Cost |
|---------|-------------|
| Cloud Run | Free (up to 2M requests/month) |
| Cloud SQL (db-f1-micro) | ~$7–10/month |
| Artifact Registry (Docker images) | < $0.50/month |
| Cloud Build | Free (120 build-minutes/day) |
| **Total** | **~$8–10/month** |

Cloud SQL can be paused during non-business hours to reduce cost further.

---

## 8. Next Steps

1. **Activate billing** on GCP project `clean-galaxy-498211-e3`
2. **Deploy** — 30-minute process outlined above
3. **Map custom domain** `benchmark.anphonic.ai` via DNS CNAME record
4. **Share the live URL** with brands to start collecting benchmark data
5. *(Optional)* Add a password-protected admin dashboard to view all submissions without needing Cloud SQL access

---

*Document prepared by Akshita · Anphonic Benchmark Tool · June 2026*

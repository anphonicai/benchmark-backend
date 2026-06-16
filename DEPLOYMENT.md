# Deployment Guide

This doc covers how to deploy changes from your local machine to GitHub and then live to Cloud Run.

---

## Prerequisites

- gcloud SDK installed at `google-cloud-sdk/bin/gcloud`
- Authenticated as `akshita.k@alchemyx.io`
- Project: `daring-charmer-498305-e7`
- Cloud Run service: `benchmark-app` (region: `asia-south1`)
- GitHub repo: `https://github.com/anphonicai/benchmark-backend`

---

## Step 1 — Make your changes locally

Edit files as needed in `/Users/akshita/Documents/benchmark-backend`.

---

## Step 2 — Push to GitHub

```bash
# See what files changed
git status

# Stage only the files you changed (never use git add . blindly)
git add api/companyRoutes.js server.js

# Commit with a clear message
git commit -m "Your description of what changed"

# Push to main
git push origin main
```

---

## Step 3 — Deploy to Cloud Run

```bash
/Users/akshita/Documents/benchmark-backend/google-cloud-sdk/bin/gcloud run deploy benchmark-app \
  --source /Users/akshita/Documents/benchmark-backend \
  --region asia-south1 \
  --project daring-charmer-498305-e7 \
  --memory 2Gi \
  --no-cpu-throttling \
  --quiet
```

This command:
1. Builds a Docker image from the `Dockerfile` (builds the Vite frontend + Node backend)
2. Pushes the image to Google Container Registry
3. Deploys a new revision to Cloud Run
4. Shifts 100% of traffic to the new revision automatically

**Flags explained:**
- `--memory 2Gi` — required for Puppeteer/Chromium PDF generation (default 512MB is not enough)
- `--no-cpu-throttling` — keeps CPU allocated after each request so background PDF generation (which runs after the API response is sent) isn't starved and killed

Takes about **3–5 minutes** to complete.

---

## Step 4 — Verify the deployment

```bash
# Confirm the server is running
curl https://benchmark.anphonic.ai/health

# Confirm the live site loads
open https://benchmark.anphonic.ai
```

---

## Adding or updating environment variables

If your change requires a new env variable (like `ADMIN_API_KEY`):

1. Add it to your local `.env` file
2. Go to [Google Cloud Console](https://console.cloud.google.com) → Cloud Run → `benchmark-app`
3. Click **Edit & deploy new revision**
4. Scroll to **Variables & Secrets** → **+ Add Variable**
5. Enter the name and value
6. Click **Deploy**

> Never commit `.env` to GitHub. It contains secrets.

---

## Current environment variables in Cloud Run

| Variable | Purpose |
|---|---|
| `DB_USER` | Cloud SQL database user |
| `DB_PASSWORD` | Cloud SQL database password |
| `DB_NAME` | Database name |
| `CLOUD_SQL_CONNECTION_NAME` | Cloud SQL socket connection |
| `RESEND_API_KEY` | Email delivery (OTP emails) |
| `GROQ_API_KEY` | AI chatbot (Groq/Llama) |
| `ADMIN_API_KEY` | Protects `/metrics` and `/report` endpoints |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side verification |

---

## Rollback a bad deployment

If something breaks after deploying, roll back to the previous revision instantly from the Cloud Console:

1. Cloud Run → `benchmark-app` → **Revisions** tab
2. Find the previous revision (e.g. `benchmark-app-00039-xxx`)
3. Click the three-dot menu → **Manage Traffic**
4. Set it to 100% → **Save**

Or via CLI:

```bash
/Users/akshita/Documents/benchmark-backend/google-cloud-sdk/bin/gcloud run services update-traffic benchmark-app \
  --to-revisions REVISION-NAME=100 \
  --region asia-south1
```

---

## Quick reference — full deploy in one go

```bash
git add api/companyRoutes.js server.js
git commit -m "Your message"
git push origin main
/Users/akshita/Documents/benchmark-backend/google-cloud-sdk/bin/gcloud run deploy benchmark-app \
  --source /Users/akshita/Documents/benchmark-backend \
  --region asia-south1 \
  --project daring-charmer-498305-e7 \
  --memory 2Gi \
  --no-cpu-throttling \
  --quiet
curl https://benchmark.anphonic.ai/health
```

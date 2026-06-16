# ── Stage 1: Build the Vite frontend ─────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend

# Install deps first for layer caching
COPY ["Multi-page client data form/package.json", "Multi-page client data form/package-lock.json", "./"]
RUN npm ci --legacy-peer-deps

# Public site key — safe to embed here (it's client-side JS, not a secret)
ENV VITE_TURNSTILE_SITE_KEY=0x4AAAAAADjZ83tDZARNv-ZB

# Copy source and build (outDir is ../client per vite.config.ts)
COPY ["Multi-page client data form/src/", "./src/"]
COPY ["Multi-page client data form/public/", "./public/"]
COPY ["Multi-page client data form/index.html", \
      "Multi-page client data form/vite.config.ts", \
      "Multi-page client data form/postcss.config.mjs", \
      "Multi-page client data form/default_shadcn_theme.css", \
      "./"]

RUN npm run build
# Output is now at /build/client/ (one level up from the frontend workdir)


# ── Stage 2: Production backend ───────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Chromium + required system libs for Puppeteer PDF generation
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install backend production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY server.js ./
COPY api/   ./api/
COPY db/    ./db/

# Copy compiled frontend from stage 1
COPY --from=frontend-builder /build/client/ ./client/

# Copy Anphonic logo SVG used by PDF generator (client/ is gitignored so
# we copy the source asset directly — it resolves to client/anphonic-logo-white-bg.svg at runtime)
COPY ["Multi-page client data form/src/imports/Anphonic-logo_with_bg_-_white.svg", "./client/anphonic-logo-white-bg.svg"]

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server.js"]

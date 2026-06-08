# ── Stage 1: dependencias ─────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: desarrollo (Next.js dev server con HMR) ──────
FROM base AS dev
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]

# ── Stage 3: build ────────────────────────────────────────
FROM base AS builder
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_REFERRAL_BASE_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_REFERRAL_BASE_URL=${NEXT_PUBLIC_REFERRAL_BASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN NODE_OPTIONS="--max-old-space-size=1536" npm run build

# ── Stage 4: producción (Next.js standalone) ──────────────
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 4000
CMD ["node", "server.js"]

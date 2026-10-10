# Build context is the monorepo root:
#   docker build -f apps/web/Dockerfile .

# ---- Stage 1: Install all workspace dependencies ----
FROM node:26-alpine AS deps
WORKDIR /app
# Copy workspace manifests first (layer cache: only reinstall when lockfile changes)
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/oxlint-config/package.json ./packages/oxlint-config/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN npm ci

# ---- Stage 2: Build shared + web ----
FROM node:26-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Workspace-local node_modules (deps hoisting cannot satisfy, e.g. pinned vite)
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY packages/shared ./packages/shared
COPY packages/tsconfig ./packages/tsconfig
COPY package.json ./package.json
COPY apps/web ./apps/web
# Build shared first so @futmeet/shared resolves to JS at web build time
RUN cd packages/shared && npm run build
# vite build emits the self-contained Nitro server to apps/web/.output
RUN cd apps/web && npx vite build

# ---- Stage 3: Lean production runtime ----
FROM node:26-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
# .output bundles its own node_modules, so no workspace install is needed
COPY --from=build /app/apps/web/.output ./.output
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
# Nitro honors PORT at runtime; Railway injects it
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

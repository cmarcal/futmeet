# ---- Stage 1: Install all workspace dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
# Copy workspace manifests first (layer cache: only reinstall when lockfile changes)
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/oxlint-config/package.json ./packages/oxlint-config/
COPY apps/api/package.json ./apps/api/
RUN npm ci

# ---- Stage 2: Build shared + API ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy shared package (source + tsconfig)
COPY packages/shared ./packages/shared
COPY packages/tsconfig ./packages/tsconfig
# Copy API source
COPY apps/api ./apps/api
# Build shared first so @futmeet/shared resolves to JS at API build time
RUN cd packages/shared && npm run build
# Build API
RUN cd apps/api && npm run build

# ---- Stage 3: Migration runner (keeps tsx + full source) ----
FROM node:22-alpine AS migrate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared
COPY packages/tsconfig ./packages/tsconfig
COPY apps/api ./apps/api
WORKDIR /app/apps/api
CMD ["node", "--import", "tsx/esm", "node_modules/knex/bin/cli.js", "migrate:latest", "--knexfile", "knexfile.ts"]

# ---- Stage 4: Lean production runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
# node_modules contains @futmeet/shared symlink → /app/packages/shared
COPY --from=deps /app/node_modules ./node_modules
# Make symlink target available: package.json (exports map) + compiled dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
# Compiled API
COPY --from=build /app/apps/api/dist ./apps/api/dist
WORKDIR /app/apps/api
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3001
CMD ["node", "dist/index.js"]

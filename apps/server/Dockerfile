# Base image
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Prune stage (isolates server package and its local workspace dependencies)
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune dokugen-server --docker

# 2. Installer stage (installs dependencies and compiles typescript)
FROM base AS installer
WORKDIR /app

# Copy pruned dependency definitions
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY --from=builder /app/out/full/ .

# Build the server (compiles TS to JS)
RUN pnpm turbo run build --filter=dokugen-server...

# 3. Runner stage (clean, lightweight runtime)
FROM base AS runner
WORKDIR /app

# Don't run production containers as root for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copy only compiled JS and production node_modules
COPY --from=installer /app/apps/server/dist ./apps/server/dist
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=installer /app/apps/server/package.json ./apps/server/package.json

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Run the compiled server
CMD ["node", "apps/server/dist/server.js"]

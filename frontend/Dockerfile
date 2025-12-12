# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js app with standalone output
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Backup original server.js and modify it to ensure keepAliveTimeout is set
RUN if [ -f server.js ]; then mv server.js server.js.original; fi

# Modify server.js.original to ensure keepAliveTimeout is always 65000
RUN sed -i 's/let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10)/let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10) || 65000/' server.js.original && \
    sed -i 's/if (.*keepAliveTimeout.*)/if (Number.isNaN(keepAliveTimeout) || !Number.isFinite(keepAliveTimeout) || keepAliveTimeout < 0) { keepAliveTimeout = 65000; }/' server.js.original

# Copy custom wrapper
COPY --chown=nextjs:nodejs server.js ./server.js

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
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

# Install http-proxy in runner stage (needed for proxy server)
# Use npm install from the standalone build's node_modules if available, otherwise install fresh
RUN if [ -d "node_modules" ]; then \
      npm install http-proxy || true; \
    else \
      npm init -y && npm install http-proxy; \
    fi

# Backup original server.js if it exists (standalone mode creates it)
# This must be done after copying the standalone build
RUN if [ -f server.js ]; then cp server.js server.js.original; echo "Backed up server.js to server.js.original"; else echo "WARNING: server.js not found in standalone build"; fi

# Copy proxy server and start script
COPY --chown=nextjs:nodejs proxy-server.js ./proxy-server.js
COPY --chown=nextjs:nodejs start-with-proxy.sh ./start-with-proxy.sh
RUN chmod +x start-with-proxy.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["./start-with-proxy.sh"]
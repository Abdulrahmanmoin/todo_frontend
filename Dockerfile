# Production-ready multi-stage Dockerfile for Next.js Todo Frontend
# Base image: Node.js 20 Alpine for minimal footprint and security
# Target image size: < 500MB

# ============================================================================
# Stage 1: Dependencies - Install all dependencies
# ============================================================================
FROM node:20-alpine AS deps

# Install libc6-compat for compatibility with some native Node modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev dependencies needed for build)
# npm ci is faster and more reliable than npm install in CI/CD
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# ============================================================================
# Stage 2: Builder - Build the Next.js application
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build argument for API URL (can be overridden at build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000

# Set build-time environment variables
# NEXT_TELEMETRY_DISABLED=1 disables Next.js telemetry for privacy
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the Next.js application
# This generates optimized production build in .next directory
RUN npm run build

# ============================================================================
# Stage 3: Production - Minimal runtime image
# ============================================================================
FROM node:20-alpine AS production

# Install curl for healthcheck and dumb-init for proper signal handling
RUN apk add --no-cache curl dumb-init

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Copy necessary files from builder stage
# Copy public assets
COPY --from=builder /app/public ./public

# Copy Next.js build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy package.json for reference (optional)
COPY --from=builder /app/package.json ./package.json

# Switch to non-root user
USER nextjs

# Expose port 3000 (Next.js default)
EXPOSE 3000

# Health check configuration
# Checks /api/health endpoint every 30s with 3s timeout
# Starts checking after 15s (Next.js may take longer to start)
# Allows 3 retries before marking unhealthy
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly (PID 1 problem)
# Starts Next.js standalone server
# Runtime environment variables (BACKEND_URL) can be injected at container start
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

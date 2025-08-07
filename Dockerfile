FROM node:22-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 2. Build stage - rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY ./src ./src
COPY ./tsconfig.json ./package*.json ./

# Build the application
RUN npm run build

# 3. Production dependencies stage
FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
ENV NODE_ENV=production
RUN \
  if [ -f package-lock.json ]; then npm ci --only=production --legacy-peer-deps && npm cache clean --force; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 4. Production image, copy all the files and run the app
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nodeuser:nodejs /app/package*.json ./

# Copy built application
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist

# Copy data directory if it contains necessary files (change path as needed)
COPY --chown=nodeuser:nodejs ./data ./data

USER nodeuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
# Multi-stage Dockerfile for Express.js backend
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init

RUN addgroup -g 1000 -S nodejs && adduser -S nodejs -u 1000

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R nodejs:nodejs /app

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

USER nodejs

EXPOSE 5000

ENTRYPOINT ["/usr/sbin/dumb-init", "--"]
CMD ["npm", "start"]

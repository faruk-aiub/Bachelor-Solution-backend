# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies (for sharp)
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm vips-dev

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Generate Prisma client and build the app
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies for sharp and prisma
RUN apk add --no-cache vips-dev openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose the application port
EXPOSE 3000

# Run database migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]

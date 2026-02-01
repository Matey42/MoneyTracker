# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time args (can be overridden in docker-compose)
ARG VITE_API_MODE=api
ARG VITE_API_BASE_URL=/api
ARG VITE_AUTH_SOURCE=api
ARG VITE_WALLETS_SOURCE=api
ARG VITE_TRANSACTIONS_SOURCE=api
ARG VITE_DEV_MODE=false

# Pass args to env for Vite build
ENV VITE_API_MODE=$VITE_API_MODE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AUTH_SOURCE=$VITE_AUTH_SOURCE
ENV VITE_WALLETS_SOURCE=$VITE_WALLETS_SOURCE
ENV VITE_TRANSACTIONS_SOURCE=$VITE_TRANSACTIONS_SOURCE
ENV VITE_DEV_MODE=$VITE_DEV_MODE

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

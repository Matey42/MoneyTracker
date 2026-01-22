# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

ENV VITE_API_MODE=api
ENV VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_AUTH_SOURCE=api
ENV VITE_WALLETS_SOURCE=api
ENV VITE_TRANSACTIONS_SOURCE=api

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

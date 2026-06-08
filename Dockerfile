
# Stage 1: Frontend Builder (Node.js)
# Build React/Vite assets — nothing from this stage ends up in production image

FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy only dependency manifests first (layer cache optimization)
COPY package.json package-lock.json ./

# Install ALL deps (including devDeps needed for build)
RUN npm ci --frozen-lockfile

# Copy source needed for the build
COPY resources/ resources/
COPY vite.config.js .
COPY jsconfig.json .
COPY components.json .
COPY public/ public/

# Build production assets
RUN npm run build


# Stage 2: PHP Dependencies (Composer)
# Install only production Composer packages

FROM composer:2.8 AS composer-builder

WORKDIR /app

COPY composer.json composer.lock ./

# Install production dependencies only, no scripts, no dev
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader


# Stage 3: Production Runtime (PHP-FPM)

FROM php:8.4-fpm-alpine AS production

LABEL maintainer="SDC Team"
LABEL org.opencontainers.image.description="Laravel + React (Inertia) — SDC App"

# ── System dependencies ───────────────────────────────────────────────────────
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    bash \
    netcat-openbsd \
    # PHP extension build deps
    $PHPIZE_DEPS \
    oniguruma-dev \
    libzip-dev \
    icu-dev \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        mbstring \
        zip \
        exif \
        bcmath \
        intl \
        opcache \
        pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    # Cleanup build deps to reduce image size
    && apk del $PHPIZE_DEPS \
    && rm -rf /tmp/* /var/cache/apk/*

# ── PHP configuration ─────────────────────────────────────────────────────────
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# ── Nginx configuration ───────────────────────────────────────────────────────
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# ── Supervisor configuration ──────────────────────────────────────────────────
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# ── Application setup ─────────────────────────────────────────────────────────
WORKDIR /var/www/html

# Copy Composer vendor from builder
COPY --from=composer-builder /app/vendor ./vendor

# Copy built frontend assets from frontend builder
COPY --from=frontend-builder /app/public/build ./public/build

# Copy application source (excludes everything in .dockerignore)
COPY . .

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Copy and make entrypoint executable
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]

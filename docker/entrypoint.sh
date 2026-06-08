#!/bin/bash
set -e

echo "==> [entrypoint] Starting SDC App container..."

LARAVEL_ROOT="/var/www/html"


mkdir -p \
    "$LARAVEL_ROOT/storage/app/public" \
    "$LARAVEL_ROOT/storage/framework/cache/data" \
    "$LARAVEL_ROOT/storage/framework/sessions" \
    "$LARAVEL_ROOT/storage/framework/views" \
    "$LARAVEL_ROOT/storage/logs" \
    "$LARAVEL_ROOT/bootstrap/cache" \
    "/var/log/supervisor" \
    "/var/run"

chown -R www-data:www-data \
    "$LARAVEL_ROOT/storage" \
    "$LARAVEL_ROOT/bootstrap/cache"


echo "==> [entrypoint] Waiting for MySQL at ${DB_HOST}:${DB_PORT:-3306}..."
MAX_TRIES=30
COUNT=0
until nc -z "${DB_HOST}" "${DB_PORT:-3306}" 2>/dev/null; do
    COUNT=$((COUNT + 1))
    if [ "$COUNT" -ge "$MAX_TRIES" ]; then
        echo "==> [entrypoint] ERROR: MySQL not ready after $MAX_TRIES attempts. Aborting."
        exit 1
    fi
    echo "==> [entrypoint] MySQL not ready yet (attempt $COUNT/$MAX_TRIES). Waiting 3s..."
    sleep 3
done
# Give MySQL 3 more seconds after port is open to finish user creation
sleep 3
echo "==> [entrypoint] MySQL is ready."

# ── Laravel bootstrap ─────────────────────────────────────────────────────────
cd "$LARAVEL_ROOT"

echo "==> [entrypoint] Optimizing Laravel for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "==> [entrypoint] Running database migrations..."
php artisan migrate --force

echo "==> [entrypoint] Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

echo "==> [entrypoint] All ready! Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

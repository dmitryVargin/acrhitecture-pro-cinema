#!/usr/bin/env sh
set -euo pipefail

# Configuration
TEMPLATE_SRC=${TEMPLATE_SRC:-/etc/nginx/templates/nginx.ctmpl}
TEMPLATE_DST=${TEMPLATE_DST:-/etc/nginx/nginx.conf}

# Show some diagnostics
echo "[entrypoint] Using consul at: ${CONSUL_ADDR}"
echo "[entrypoint] Template: ${TEMPLATE_SRC} -> ${TEMPLATE_DST}"

# Ensure destination directory exists
mkdir -p "$(dirname "${TEMPLATE_DST}")"


consul-template \
  -consul-addr="${CONSUL_ADDR}" \
  -once \
  -template "/etc/nginx/templates/nginx.ctmpl:/etc/nginx/nginx.conf"

# Start nginx in the background (non-daemon mode is not required here because
# consul-template will stay in foreground as PID 1)
echo "[entrypoint] Starting nginx..."
#nginx -g "daemon off;"
nginx
# Run consul-template in watch mode to update config and reload nginx on changes
# When the template changes or KV updates, nginx will be gracefully reloaded.
echo "[entrypoint] Starting consul-template in watch mode..."
exec consul-template \
  -consul-addr="${CONSUL_ADDR}" \
  -retry 10s \
  -template "${TEMPLATE_SRC}:${TEMPLATE_DST}:nginx -s reload"

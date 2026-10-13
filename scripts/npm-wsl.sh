#!/bin/sh
# Keep npm and node in the same Linux installation; never change global shell settings.
set -eu
if command -v node >/dev/null 2>&1 && node -p 'process.platform' 2>/dev/null | grep -qx linux; then
  exec npm "$@"
fi
node_bin=$(find "${NVM_DIR:-$HOME/.nvm}/versions/node" -mindepth 2 -maxdepth 2 -type d -name bin 2>/dev/null | sort -V | tail -1)
if [ -z "$node_bin" ] || [ ! -x "$node_bin/node" ] || [ ! -x "$node_bin/npm" ]; then
  echo "Linux Node.js is required. Install Node.js 20+ in WSL." >&2
  exit 1
fi
PATH="$node_bin:$PATH"
export PATH
exec "$node_bin/npm" "$@"

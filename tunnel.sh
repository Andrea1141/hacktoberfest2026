#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

if [ ! -f "$DIR/cloudflared" ]; then
    echo "⬇️  Download di Cloudflare Tunnel (cloudflared)..."
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$DIR/cloudflared"
    chmod +x "$DIR/cloudflared"
fi

echo "==================================================="
echo "    GLUCO - Tunnel HTTPS Cloudflare (trycloudflare)"
echo "==================================================="
echo "Avvio tunnel ultra-veloce su porta 5173..."
echo "Cerca nelle righe sottostanti l'indirizzo HTTPS generato."
echo "==================================================="
echo ""

"$DIR/cloudflared" tunnel --url http://localhost:5173

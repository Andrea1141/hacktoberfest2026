#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "==================================================="
echo "          GLUCO - Digital Twin Metabolico"
echo "==================================================="
echo ""

# Verifica ambiente virtuale Python
if [ ! -d "$DIR/backend/.venv" ]; then
    echo "⚠️  Ambiente virtuale Python non trovato in backend/.venv."
    echo "Creazione ambiente virtuale e installazione dipendenze..."
    python3 -m venv "$DIR/backend/.venv"
    "$DIR/backend/.venv/bin/pip" install --upgrade pip
    "$DIR/backend/.venv/bin/pip" install -r "$DIR/backend/requirements.txt"
fi

# Verifica dipendenze Node.js
if [ ! -d "$DIR/frontend/node_modules" ]; then
    echo "⚠️  Dipendenze frontend non trovate."
    echo "Installazione pacchetti npm in frontend/..."
    (cd "$DIR/frontend" && npm install)
fi

echo "🚀 Avvio del backend FastAPI (porta 8000)..."
(cd "$DIR/backend" && "$DIR/backend/.venv/bin/python" -m uvicorn main:app --reload --port 8000) &
BACKEND_PID=$!

echo "🚀 Avvio del frontend React Vite (porta 5173)..."
(cd "$DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

cleanup() {
    echo ""
    echo "🛑 Arresto dei servizi Gluco..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
    echo "✅ Servizi arrestati con successo."
}

trap cleanup INT TERM EXIT

echo ""
echo "==================================================="
echo " ✅ Tutti i servizi sono avviati!"
echo " - Frontend Web: http://localhost:5173"
echo " - Backend API:  http://localhost:8000/docs"
echo "==================================================="
echo "Premi Ctrl+C per fermare sia backend che frontend."

wait

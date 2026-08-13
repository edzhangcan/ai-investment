#!/usr/bin/env bash

echo "=============================================================================="
echo "                AI Investment Workstation - Launching (macOS/Linux)..."
echo "=============================================================================="
echo ""

# Check prerequisites
if [ ! -f "backend/venv/bin/python" ]; then
    echo "[X] Python virtual environment not found."
    echo "    Please run ./install.sh first to complete initial setup."
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "[X] Frontend dependencies not found."
    echo "    Please run ./install.sh first to complete initial setup."
    exit 1
fi

echo "[*] Starting Backend API Server on http://localhost:8000 ..."
export PYTHONPATH=.
backend/venv/bin/python backend/main.py &
BACKEND_PID=$!

echo "[*] Starting Frontend Web Dashboard on http://localhost:3000 ..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 3

# Open browser depending on OS
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000 &> /dev/null &
elif command -v open &> /dev/null; then
    open http://localhost:3000 &
fi

echo ""
echo "=============================================================================="
echo "  Application is now running!"
echo "  - Web Dashboard: http://localhost:3000"
echo "  - Backend API:   http://localhost:8000"
echo "=============================================================================="
echo ""
echo "Press Ctrl+C to stop all servers and exit."

cleanup() {
    echo ""
    echo "[*] Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "[OK] Servers stopped."
    exit 0
}

trap cleanup INT TERM
wait

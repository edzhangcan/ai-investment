#!/usr/bin/env bash

set -e

echo "=============================================================================="
echo "              AI Investment Workstation - 1-Click Installer (macOS/Linux)"
echo "=============================================================================="
echo ""

# 1. Check Python installation
echo "[*] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "[X] Error: python3 is not installed or not in your PATH."
    echo "    Please install Python 3.11+ from https://www.python.org/downloads/ or via brew/apt."
    exit 1
fi
python3 --version

# 2. Check Node.js installation
echo ""
echo "[*] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "[X] Error: node is not installed or not in your PATH."
    echo "    Please install Node.js 18+ from https://nodejs.org/ or via brew/apt."
    exit 1
fi
node --version

# 3. Setup Python virtual environment
echo ""
echo "[*] Setting up Python virtual environment in backend/venv..."
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
fi

echo "[*] Installing backend Python packages..."
backend/venv/bin/pip install --upgrade pip > /dev/null 2>&1
backend/venv/bin/pip install -r backend/requirements.txt

# 4. Setup Frontend npm packages
echo ""
echo "[*] Installing frontend Node.js packages..."
cd frontend
npm install
cd ..

# 5. Grant execute permissions
chmod +x start.sh 2>/dev/null || true

echo ""
echo "=============================================================================="
echo "                    Installation Completed Successfully!"
echo "=============================================================================="
echo ""
echo "To launch the application, simply run: ./start.sh"
echo ""

# AI Investment Workstation

[English](README.md) | [中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v4.7.0-emerald.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-49%2F49%20passing-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An investment copilot built for everyday investors in US and Canadian stock markets. It combines interest rate trends, official company financial reports, and multi-agent AI debates into one clear dashboard. Instead of spending hours reading earnings filings or guessing fair stock prices, you get clear buy target brackets, verified growth drivers, and objective risk warnings.

## Core Features

- **Macro Trend Scanner**: Tracks inflation rates, central bank interest decisions, and economic news across the US and Canada so you know when the market favors growth stocks versus stable dividend payers.
- **128 Stock Recommendation Cards**: Ranks US tech leaders, Canadian energy and bank blue-chips, and mid-cap growth stocks into three clear categories: Sector Champions, Core Leaders, and Gold Nuggets.
- **Fair Value and Buy Zones**: Gives you a clear price range for each stock based on free cash flow and moving averages. You know exactly what price offers a safe entry before buying.
- **Authentic Company Profiles**: Shows real business descriptions, top revenue channels, and 3 to 4 specific growth catalysts for every company. No generic placeholder text or missing numbers.
- **Multi-Agent AI Debate Arena**: Hear two distinct AI perspectives (a Bull advocate and a Bear prosecutor) debate each stock, followed by a final verdict and position sizing advice from a Chief Investment Officer agent.
- **Instant Alerts**: Connect Discord or custom webhooks to receive real-time notifications when a recommended stock drops into your target buy range.
- **Plain-Talk Mode**: Switch between English, Chinese, or a hybrid mode with popover explanations that translate complex financial jargon into everyday language.

## Quick Start

### What You Need
- Python 3.11 or newer
- Node.js 18 or newer

### Step 1: Start the Backend Server
```powershell
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py
```

### Step 2: Start the Web Dashboard
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

## Testing

```powershell
# Run backend test suite (49 tests passing)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# Test frontend build
cd frontend
npm run build
```

## License

Distributed under the MIT License. See `LICENSE` for details.

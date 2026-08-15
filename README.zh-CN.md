# Prism Loop — 多维光谱智能投研工作站

[English](README.md) | [简体中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v7.0.0-sky.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-60%2F60%20通过-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Theme](https://img.shields.io/badge/主题-明亮%2F暗黑双模式-slate.svg)](#)

**Prism Loop** 是一款专为北美与全球散户投资者打造的机构级智能投研工作站。深度整合宏观经济周期跟踪、SEC 10-K / SEDAR+ 年报文本挖掘、多智能体（Multi-Agent）对抗辩论以及 DCF 现金流折现内在价值评估，呈现在极简高对比度的统一交互界面中。

告别翻阅数百页晦涩财报与盲目追高，Prism Loop 为您提供严密的安全边际买入区间、经验证的增长催化剂与客观的风控止损预警。

---

## 💎 核心技术架构与核心能力

- **🏛️ 北美宏观周期扫描仪 (Macro Scanner)**: 实时跟踪美联储 FRED 通胀数据、加拿大央行 (BoC) 利率立场、10Y-2Y 美债收益率倒挂利差及核心政策头条，智能研判顺周期强势板块（如 AI 云端基础设施、商业银行、高股息能源等）。
- **📄 SEC 10-K & SEDAR+ 文本挖掘管线**: 跨越 5 年历史 MD&A 年报的纵向 Levenshtein 语义差异分析。自动侦测管理层新增的风险免责声明、悄然删除的盈利指引与关键词频率跃迁。
- **⚖️ 多智能体投资辩论竞技场 (Debate Arena)**: 针对每只股票展开对抗性审计——**看多先锋 (Bull Advocate)** 剖析自由现金流与护城河优势，**看空检察官 (Bear Prosecutor)** 揭示利润率挤压与宏观逆风，最终由 **首席投资官 (CIO)** 给出客观投资胜率裁决与仓位配置建议。
- **🎯 DCF 内在价值与安全边际买入区间**: 基于自由现金流折现、50日均线与200日均线动态锚定理想买入上下限，助您在建仓前清晰掌握价格安全边际。
- **🔔 Zero-KYC Discord 实时 Webhook 推送引擎**: 免认证无缝绑定 Discord 频道，在自选股跌入目标买入区间或触发风险预警时接收毫秒级即时提醒，并支持每日 8:00 AM EST 晨间宏观政策简报。
- **💡 通俗白话模式 (Plain-Talk) 与双语词典**: 自由切换英文、简体中文与中英混合模式，集成金融术语生活化类比卡片，零门槛理解华尔街专业指标。
- **💼 仓位管理与动态再平衡计算器**: 根据保守型、平衡型或进取型风险模型，计算精确到单股的可执行买入股数，支持 CAD/USD 资产配置，最低起始本金扩展至 $5,000。
- **📑 机构级投资备忘录一键导出**: 一键生成带机构水印标识的 Markdown (.md) 与打印级 PDF 报告，支持一键复制辩论裁决分享至 Reddit / X。

---

## 🚀 快速启动

### 环境要求
- Python 3.11 或更高版本
- Node.js 18 或更高版本

### 方式一：一键自动安装与启动（推荐）

1. 双击运行 `install.bat`（Mac/Linux 用户运行 `./install.sh`）进行自动化依赖安装。
2. 双击运行 `start.bat`（Mac/Linux 用户运行 `./start.sh`）启动服务，系统将自动在默认浏览器中打开 `http://localhost:3000`。

### 方式二：手动终端分步启动

```powershell
# 1. 配置并启动后端服务 (FastAPI 服务运行于 http://127.0.0.1:8000)
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py

# 2. 在新终端窗口中启动前端服务 (Vite 服务运行于 http://localhost:3000)
cd frontend
npm install
npm run dev
```

---

## 🧪 自动化测试验证

```powershell
# 运行全部后端 pytest 测试用例 (60/60 全部通过)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# 验证前端构建与 TypeScript 类型检查
npm --prefix frontend run build
```

---

## 📄 开源许可证

本项目基于 MIT License 开源协议发布。详情请查阅 [LICENSE](LICENSE) 文件。

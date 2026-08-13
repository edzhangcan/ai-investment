# 投资工作站 (Investment Workstation)

[English](README.md) | [中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v4.3.0-emerald.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-32%2F32%20passing-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一款面向美股与加拿大股票市场的 AI 辅助量化投资工作站。系统自动解析央行货币政策声明、跟踪 FRED 宏观经济指标、对 3 大类共 21 只精选标的进行评分，并提供安全边际买入区间与多智能体 AI 投资辩论。

## 核心功能

- **宏观周期扫描仪**：实时跟踪美加通胀、利率及收益率曲线，结合美联储与加拿大央行政策新闻判断周期阶段。
- **分类股票推荐阵列**：将 21 只标的精准划分为超配板块精选、蓝筹核心龙头与隐形金矿股。
- **安全边际买入区间**：基于 200 日均线与 DCF 固有价值计算动态安全买入价格。
- **多智能体 AI 辩论**：提供多头分析师、空头公诉人与 CIO 首席投资官的对垒辩论与最终交易裁决。
- **仓位管理计算器**：针对保守型、稳健型与激进型风控模型，自动计算拟执行买入股数与现金缓冲。
- **Discord 警报推送**：支持免注册 Webhook 自动推送每日宏观简报、买入信号、卖出预警与金矿股提醒。
- **投资备忘录导出**：一键导出 Markdown (.md) 或 PDF 格式的机构级投资备忘录。
- **多语言与白话模式**：支持英文、中文与中英混合模式，提供术语白话比喻解释。

## 快速开始

### 环境要求
- Python 3.11+
- Node.js 18+

### 1. 启动后端服务
```powershell
# 创建虚拟环境并安装依赖
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt

# 启动后端 API（运行于 http://127.0.0.1:8000）
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py
```

### 2. 启动前端应用
```powershell
# 新开终端窗口，安装依赖并启动前端
cd frontend
npm install
npm run dev
```
在浏览器中打开 `http://localhost:3000` 即可使用。

## 项目目录结构

```
ai-investment/
├── backend/
│   ├── data_sources/    # 市场行情、FRED、SEC 及新闻抓取器
│   ├── database/        # SQLite WAL 数据库与 CRUD 操作
│   ├── engines/         # 宏观、定价、基本面、回测与警报引擎
│   ├── routers/         # REST API 接口
│   ├── tests/           # 32 项 Pytest 自动化测试
│   ├── main.py          # FastAPI 服务入口
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # React UI 组件与弹窗
│   │   ├── context/     # 多语言上下文 (EN / ZH / Hybrid)
│   │   ├── i18n/        # 翻译字典
│   │   └── App.tsx      # 主界面入口
│   └── package.json
└── README.md
```

## 测试与验证

```powershell
# 后端单元测试
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# 前端构建检查
cd frontend
npm run build
```

## 开源协议

本项目基于 MIT 协议开源，详见 `LICENSE` 文件。

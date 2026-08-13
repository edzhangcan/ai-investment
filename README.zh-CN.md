# AI 智能投资工作站

[English](README.md) | [中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v4.7.0-emerald.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-49%2F49%20passing-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

专为美股与加股普通投资者打造的 AI 投资助手。它将宏观利率趋势、公司真实财报数据与多智能体 AI 投资辩论整合在一个简洁直观的界面中。你不再需要花费数小时翻阅繁杂的官方财报，就能快速看懂每只股票的主营业务、增长催化剂、合理买入区间与下行风险。

## 核心功能

- **宏观周期扫描**：实时跟踪美加通胀数据、央行加降息决策与宏观新闻，帮助你判断当前环境更适合配置成长股还是避险高股息标的。
- **128 只精选标的分类推荐**：覆盖美股科技龙头、加拿大能源与银行蓝筹股以及高成长中小盘股票，分为超配板块精选、核心龙头与隐形金矿股三大类。
- **合理买入区间与安全边际**：基于公司自由现金流与均线支撑，直接算出每只股票的合理买入价格区间，避免高位追高。
- **真实公司背景与增长催化剂**：展示真实的主营业务构成、收入分布占比以及 3 到 4 个具体的未来增长催化剂，拒绝套话与空白数据。
- **多智能体 AI 投资辩论**：由多头分析师、空头公诉人与 CIO 首席投资官三大 AI 角色针对每只股票展开客观辩论，给出明确的仓位建议与风险提示。
- **即时价格提醒**：支持绑定 Discord 或自定义 Webhook，当推荐股票跌入理想买入区间时自动发送提醒。
- **通俗白话与多语言切换**：支持英文、中文与中英混合模式，提供鼠标悬停白话比喻解释，把专业金融术语翻译成听得懂的日常语言。

## 快速开始

### 准备工作
- Python 3.11 或更高版本
- Node.js 18 或更高版本

### 第一步：启动后端服务
```powershell
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py
```

### 第二步：启动前端界面
```powershell
cd frontend
npm install
npm run dev
```
在浏览器中访问 `http://localhost:3000` 即可开始使用。

## 测试与验证

```powershell
# 运行后端单元测试 (49 项测试全过)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# 验证前端构建
cd frontend
npm run build
```

## 开源协议

本项目基于 MIT 协议开源，详见 `LICENSE` 文件。

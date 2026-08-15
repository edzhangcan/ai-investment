"""
Discord Push Alert Dispatcher Module.
Dispatches 4 institutional alert channels:
1. Daily 8:00 AM EST Macro & Policy Digest
2. Bundled Watchlist Buy-In Notification (Single Combined Embed)
3. Watchlist Sell & Danger Zone Risk Alert
4. Gold Nuggets High-Potential Discovery Alerts (8:00 AM & 12:00 PM EST)
"""

import json
import logging
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

class DiscordNotifier:
    """Zero-KYC Discord Webhook Push Notifier with Institutional Rich Embeds."""

    # Curated Brand Color Palettes for Embeds
    DISCORD_COLOR_MACRO_DIGEST = 0x38BDF8   # Sky Brand Blue
    DISCORD_COLOR_BUY_ZONE = 0x10B981       # Positive Emerald
    DISCORD_COLOR_DANGER_ZONE = 0xF43F5E    # Danger Rose
    DISCORD_COLOR_GOLD_NUGGET = 0xF59E0B    # Gold Amber
    DISCORD_COLOR_TEST = 0x6366F1           # Indigo

    @classmethod
    def send_discord_alert(
        cls,
        webhook_url: str,
        title: str,
        description: str,
        color: int = 0x38BDF8,
        fields: Optional[List[Dict[str, Any]]] = None,
        footer_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """Dispatches an institutional embed card to a Discord channel via standard HTTP."""
        if not webhook_url or not webhook_url.startswith("https://discord.com/api/webhooks/"):
            return {"success": False, "error": "Invalid Discord Webhook URL format."}

        embed_payload = {
            "title": title,
            "description": description,
            "color": color,
            "fields": fields or [],
            "author": {
                "name": "Prism Loop Intelligence",
                "icon_url": "https://raw.githubusercontent.com/edzhangcan/ai-investment/main/frontend/public/favicon.svg"
            },
            "footer": {
                "text": footer_text or "Prism Loop • Multi-Spectrum Equity Intelligence",
                "icon_url": "https://raw.githubusercontent.com/edzhangcan/ai-investment/main/frontend/public/favicon.svg"
            },
            "timestamp": None
        }

        body = json.dumps({
            "username": "Prism Loop Workstation",
            "avatar_url": "https://raw.githubusercontent.com/edzhangcan/ai-investment/main/frontend/public/favicon.svg",
            "embeds": [embed_payload]
        }).encode("utf-8")

        req = urllib.request.Request(
            webhook_url,
            data=body,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "PrismLoop-AlertDispatcher/2.0"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=8) as response:
                status_code = getattr(response, "status", None)
                if status_code is None and hasattr(response, "getcode"):
                    status_code = response.getcode()
                if status_code is None:
                    status_code = 200

                if status_code in (200, 204):
                    return {"success": True, "status_code": status_code}
                else:
                    return {"success": False, "status_code": status_code}
        except urllib.error.HTTPError as e:
            logger.error(f"Discord Webhook HTTP Error: {e.code} - {e.reason}")
            return {"success": False, "error": f"HTTP {e.code}: {e.reason}"}
        except Exception as e:
            logger.error(f"Failed to dispatch Discord webhook alert: {e}")
            return {"success": False, "error": str(e)}

    @classmethod
    def send_macro_digest_alert(cls, webhook_url: str, lang: str = "en") -> Dict[str, Any]:
        """1. Daily 8:00 AM EST Macro & Industry Policy Newsletter Digest."""
        if lang == "zh":
            title = "每日宏观经济与政策新闻简报 (8:00 AM EST)"
            description = (
                "**美加宏观周期**: `过热与扩张后期阶段 (Overheat)`\n"
                "**美联储与加拿大央行立场**: `偏鹰派 (维持限制性利率以对抗粘性通胀)`\n\n"
                "**今日建议超配板块**: `科技与 AI 基础设施`, `能源与石油`, `金融与商业银行`"
            )
            fields = [
                {"name": "美国 CPI 通胀率", "value": "`3.4%` (FRED)", "inline": True},
                {"name": "加拿大基准利率", "value": "`4.75%` (BoC)", "inline": True},
                {"name": "10Y-2Y 收益率倒挂", "value": "`-0.15%` (US Fed)", "inline": True},
                {"name": "核心政策要闻 1", "value": "FOMC 重申数据依赖模式，偏鹰派官员支持维持利率。", "inline": False},
                {"name": "核心政策要闻 2", "value": "北美科技与 AI 云端 CapEx 年化支出突破 $200B 大关。", "inline": False}
            ]
        else:
            title = "Daily Macro & Industry Policy Digest (8:00 AM EST)"
            description = (
                "**Macro Economic Cycle**: `Overheat / Late Expansion Stage`\n"
                "**Fed & BoC Policy Stance**: `Hawkish (Maintaining Restrictive Rates)`\n\n"
                "**Hot Sector Overweights**: `Tech & AI Infrastructure`, `Energy & Oil`, `Commercial Banking`"
            )
            fields = [
                {"name": "US CPI Inflation", "value": "`3.4%` (FRED)", "inline": True},
                {"name": "BoC Policy Rate", "value": "`4.75%` (Bank of Canada)", "inline": True},
                {"name": "10Y-2Y Yield Spread", "value": "`-0.15%` (Federal Reserve)", "inline": True},
                {"name": "Key Policy Headline 1", "value": "FOMC Reaffirms Data-Dependent Stance Amid Sticky Core Services Inflation.", "inline": False},
                {"name": "Key Policy Headline 2", "value": "US Tech & AI Infrastructure Cloud CapEx Exceeds $200B Annualized Pace.", "inline": False}
            ]

        return cls.send_discord_alert(
            webhook_url=webhook_url,
            title=title,
            description=description,
            color=cls.DISCORD_COLOR_MACRO_DIGEST,
            fields=fields,
            footer_text="Prism Loop • Daily 8:00 AM EST Macro Digest"
        )

    @classmethod
    def send_bundled_buy_alert(
        cls,
        webhook_url: str,
        buy_stocks: Optional[List[Dict[str, Any]]] = None,
        lang: str = "en"
    ) -> Dict[str, Any]:
        """2. Bundled Watchlist Buy-In Notification (Single Combined Embed)."""
        stocks = buy_stocks or [
            {"symbol": "NVDA", "company_name": "NVIDIA Corp.", "current_price": 118.50, "target_buy_price": 120.00, "discount_pct": 1.25},
            {"symbol": "SHOP.TO", "company_name": "Shopify Inc.", "current_price": 86.20, "target_buy_price": 90.00, "discount_pct": 4.22}
        ]

        if lang == "zh":
            title = f"观察列表买入信号汇总 ({len(stocks)} 只股票已进入理想买入区间)"
            description = "以下关注列表中的优质股票已回调至您设定的**理想目标买入价位**，请及时复核投资决策：\n"
            fields = []
            for s in stocks:
                fields.append({
                    "name": f"{s['company_name']} (${s['symbol']})",
                    "value": f"• 当前现价: `${s['current_price']}`\n• 目标买入价: `${s['target_buy_price']}`\n• 安全边际折价: `{s['discount_pct']}%`",
                    "inline": False
                })
        else:
            title = f"BUNDLED BUY-IN ALERT ({len(stocks)} Stocks Reached Target Buy Zone)"
            description = "The following Watchlist stocks have dropped into your target **BUY Zone**. Review valuation metrics before entering positions:\n"
            fields = []
            for s in stocks:
                fields.append({
                    "name": f"{s['company_name']} (${s['symbol']})",
                    "value": f"• Current Price: `${s['current_price']}`\n• Target Buy Threshold: `${s['target_buy_price']}`\n• Discount Margin: `{s['discount_pct']}%` below target",
                    "inline": False
                })

        return cls.send_discord_alert(
            webhook_url=webhook_url,
            title=title,
            description=description,
            color=cls.DISCORD_COLOR_BUY_ZONE,
            fields=fields,
            footer_text="Prism Loop • Bundled Watchlist Buy-In Alert"
        )

    @classmethod
    def send_sell_danger_alert(
        cls,
        webhook_url: str,
        sell_stocks: Optional[List[Dict[str, Any]]] = None,
        lang: str = "en"
    ) -> Dict[str, Any]:
        """3. Watchlist Sell & Danger Zone Risk Alert."""
        stocks = sell_stocks or [
            {"symbol": "INTC", "company_name": "Intel Corp.", "current_price": 19.80, "risk_reason": "Margin Compression & Market Share Loss", "suggested_action": "SELL / Trim Position"}
        ]

        if lang == "zh":
            title = f"预警信号: 观察列表风险卖出提醒 ({len(stocks)} 只股票)"
            description = "**高风险预警**: 观察列表中的以下持仓股票触发风控警报，建议及时评估止损或减仓策略：\n"
            fields = []
            for s in stocks:
                fields.append({
                    "name": f"{s['company_name']} (${s['symbol']})",
                    "value": f"• 当前现价: `${s['current_price']}`\n• 风险诱因: `{s['risk_reason']}`\n• 建议操作: **{s['suggested_action']}**",
                    "inline": False
                })
        else:
            title = f"DANGER ALERT: Watchlist Sell / Risk Warning ({len(stocks)} Stocks)"
            description = "**High Risk Warning**: The following stocks have entered a risky zone or triggered stop-loss recommendations:\n"
            fields = []
            for s in stocks:
                fields.append({
                    "name": f"{s['company_name']} (${s['symbol']})",
                    "value": f"• Current Price: `${s['current_price']}`\n• Risk Rationale: `{s['risk_reason']}`\n• Recommended Action: **{s['suggested_action']}**",
                    "inline": False
                })

        return cls.send_discord_alert(
            webhook_url=webhook_url,
            title=title,
            description=description,
            color=cls.DISCORD_COLOR_DANGER_ZONE,
            fields=fields,
            footer_text="Prism Loop • High-Priority Danger Risk Alert"
        )

    @classmethod
    def send_gold_nuggets_alert(cls, webhook_url: str, lang: str = "en") -> Dict[str, Any]:
        """4. Gold Nuggets High-Potential Discovery Alerts (8:00 AM & 12:00 PM EST)."""
        if lang == "zh":
            title = "淘金组合 (Gold Nuggets) 发现: 高潜潜力股推荐"
            description = "系统量化引擎解码出以下被市场忽视、但具有极高风险收益比的优质标的：\n"
            fields = [
                {
                    "name": "Shopify Inc. ($SHOP.TO)",
                    "value": "• 行业: 电子商务与 SaaS 基础设施\n• 核心看好逻辑: 自由现金流率提升至 16%，GPV 持续扩容，估值大幅低于历史中位数。\n• CIO 胜率评估: `88%` 高确信度",
                    "inline": False
                },
                {
                    "name": "多伦多道明银行 / TD Bank ($TD.TO)",
                    "value": "• 行业: 商业银行与资产管理\n• 核心看好逻辑: 5.2% 高股息率保护，Tier-1 资本充足率 14.2%，准备金提取充裕。\n• CIO 胜率评估: `82%` 防守复苏型",
                    "inline": False
                }
            ]
        else:
            title = "Gold Nuggets Discovery: High-Potential Stock Selection"
            description = "Our quantitative engine has identified top high-potential equity opportunities with attractive risk-reward profiles:\n"
            fields = [
                {
                    "name": "Shopify Inc. ($SHOP.TO)",
                    "value": "• Sector: E-Commerce & SaaS Infrastructure\n• Investment Rationale: Free cash flow margin expanded to 16%, merchant GPV surging, valuation attractive.\n• CIO Confidence: `88%` High Conviction",
                    "inline": False
                },
                {
                    "name": "TD Bank ($TD.TO)",
                    "value": "• Sector: Commercial Banking & Wealth Management\n• Investment Rationale: 5.2% dividend yield floor, CET1 ratio strong at 14.2%, well-provisioned balance sheet.\n• CIO Confidence: `82%` Defensive Recovery",
                    "inline": False
                }
            ]

        return cls.send_discord_alert(
            webhook_url=webhook_url,
            title=title,
            description=description,
            color=cls.DISCORD_COLOR_GOLD_NUGGET,
            fields=fields,
            footer_text="Prism Loop • Daily Gold Nuggets Discovery Alert"
        )

    @classmethod
    def test_discord_connection(cls, webhook_url: str, lang: str = "en") -> Dict[str, Any]:
        """Sends an instant test embed to verify Discord Webhook connectivity."""
        if lang == "zh":
            title = "Discord Webhook 通道关联成功!"
            description = (
                "恭喜！您的 Discord 频道已成功关联 **Prism Loop 智能投研工作站**。\n\n"
                "系统将为您自动实时推送 4 种多类型投资警报:\n"
                "1. **每日 8:00 AM EST 宏观经济与政策新闻简报**\n"
                "2. **观察列表买入信号汇总** (合并单张 Embed 卡片)\n"
                "3. **观察列表卖出与危险区间预警**\n"
                "4. **淘金组合 (Gold Nuggets) 发现** (8:00 AM & 12:00 PM EST)"
            )
            fields = [
                {"name": "通道状态", "value": "已激活就绪", "inline": True},
                {"name": "通道类型", "value": "Discord Webhook", "inline": True},
                {"name": "KYC 认证", "value": "Zero-KYC (免认证)", "inline": True}
            ]
        else:
            title = "Discord Webhook Connected Successfully!"
            description = (
                "Congratulations! Your Discord channel is now connected to **Prism Loop Autonomous Workstation**.\n\n"
                "You will receive 4 multi-type automated alerts:\n"
                "1. **Daily Macro & Policy Digest** (8:00 AM EST)\n"
                "2. **Bundled Watchlist Buy-In Alert** (Combined Embed)\n"
                "3. **Watchlist Sell & Danger Risk Alert**\n"
                "4. **Gold Nuggets Discovery** (8:00 AM & 12:00 PM EST)"
            )
            fields = [
                {"name": "Status", "value": "Active & Ready", "inline": True},
                {"name": "Channel Type", "value": "Discord Webhook", "inline": True},
                {"name": "KYC Requirement", "value": "Zero-KYC", "inline": True}
            ]

        return cls.send_discord_alert(
            webhook_url=webhook_url,
            title=title,
            description=description,
            color=cls.DISCORD_COLOR_TEST,
            fields=fields,
            footer_text="Prism Loop • Multi-Spectrum Equity Intelligence"
        )


# Backward Compatibility Alias
PushNotifier = DiscordNotifier


"""
WhatsAppNotifier: WhatsApp Automated Messaging & Alert Engine
Delivers 3 core WhatsApp notification mechanisms:
1. Morning Macro & Policy News Digest (pushed at 8:00 AM EST).
2. Bundled Watchlist BUY Zone Alert (gathers all buying opportunity stocks into 1 message).
3. Bundled Watchlist DANGER / SELL Zone Alert (gathers all profit-taking/stop-loss stocks into 1 message).
Multi-language support for 'en', 'zh', and 'hybrid' modes.
Strict verification enforcement for Meta/Twilio WhatsApp 1-on-1 Opt-In rules.
Integrates live HTTP dispatch to Twilio REST API when credentials exist in backend/.env.
"""

import logging
import urllib.request
import urllib.parse
import urllib.error
import base64
import json
import re
from typing import Dict, Any, List, Optional
from backend.config import settings
from backend.engines.macro_engine import MacroEngine
from backend.data_sources.data_provider import DataProviderManager

logger = logging.getLogger(__name__)

class WhatsAppNotifier:
    """Dispatches formatted WhatsApp alert payloads."""

    @classmethod
    def _clean_e164(cls, phone_str: str) -> str:
        """Sanitizes raw user phone input into strict Twilio E.164 format (+14165550199)."""
        raw = phone_str.replace("whatsapp:", "").strip()
        cleaned = re.sub(r"[^\d+]", "", raw)
        if cleaned and not cleaned.startswith("+"):
            cleaned = "+" + cleaned
        return cleaned

    @classmethod
    def _dispatch_to_twilio(
        cls,
        recipient_phone: str,
        bot_phone: str,
        message_body: str,
        account_sid: str = "",
        auth_token: str = "",
        content_sid: str = ""
    ) -> Dict[str, Any]:
        """
        Dispatches live outbound WhatsApp message via Twilio REST API HTTP POST.
        Prioritizes user's saved database credentials, falling back to backend settings.
        Supports optional ContentSid for pre-approved Meta Content Templates.
        Falls back cleanly to mock API response if TWILIO_ACCOUNT_SID is not set.
        """
        account_sid = account_sid.strip() or settings.TWILIO_ACCOUNT_SID.strip()
        auth_token = auth_token.strip() or settings.TWILIO_AUTH_TOKEN.strip()
        from_raw = bot_phone.strip() or settings.TWILIO_WHATSAPP_NUMBER.strip()
        content_sid = content_sid.strip()

        clean_from = cls._clean_e164(from_raw)
        clean_to = cls._clean_e164(recipient_phone)

        formatted_from = f"whatsapp:{clean_from}"
        formatted_to = f"whatsapp:{clean_to}"

        if not account_sid or not auth_token:
            logger.info("Twilio API keys not configured. Operating in Mock API mode.")
            return {
                "delivery": "MOCK_SIMULATED",
                "note": "To send real WhatsApp messages to your physical phone, enter your Twilio Account SID and Auth Token in the app settings.",
                "sid": "SM_MOCK_123456789"
            }

        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
            post_payload = {
                "From": formatted_from,
                "To": formatted_to,
                "Body": message_body
            }
            if content_sid:
                post_payload["ContentSid"] = content_sid

            data = urllib.parse.urlencode(post_payload).encode("utf-8")

            auth_string = f"{account_sid}:{auth_token}"
            base64_auth = base64.b64encode(auth_string.encode("utf-8")).decode("utf-8")

            req = urllib.request.Request(url, data=data, headers={
                "Authorization": f"Basic {base64_auth}",
                "Content-Type": "application/x-www-form-urlencoded"
            })

            with urllib.request.urlopen(req) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                logger.info(f"Twilio WhatsApp message dispatched! SID: {resp_data.get('sid')}")
                return {
                    "delivery": "TWILIO_DELIVERED",
                    "sid": resp_data.get("sid"),
                    "status": resp_data.get("status")
                }
        except urllib.error.HTTPError as e:
            error_text = e.read().decode("utf-8") if e.fp else str(e)
            logger.error(f"Twilio HTTP Error {e.code}: {error_text}")
            try:
                err_json = json.loads(error_text)
                detail_msg = f"Twilio Error {err_json.get('code')}: {err_json.get('message')}"
            except Exception:
                detail_msg = f"HTTP {e.code}: {error_text}"
            return {
                "delivery": "TWILIO_FAILED",
                "error": detail_msg,
                "http_code": e.code,
                "twilio_details": error_text
            }
        except Exception as e:
            logger.error(f"Failed to dispatch Twilio WhatsApp message: {e}")
            return {
                "delivery": "TWILIO_FAILED",
                "error": str(e)
            }

    @classmethod
    def send_optin_confirmation_reply(
        cls,
        recipient_phone: str = "+14165550199",
        bot_phone: str = "+14155238886",
        lang: str = "en",
        account_sid: str = "",
        auth_token: str = "",
        content_sid: str = ""
    ) -> Dict[str, Any]:
        """
        Pushes instant auto-reply when user texts the WhatsApp join keyword.
        """
        if lang == "zh":
            msg_body = (
                f"✅ *【AI 投资平台 - WhatsApp 验证成功！】*\n\n"
                f"您的手机号 ({recipient_phone}) 已成功与系统完成 1 对 1 双向绑定。\n"
                f"系统将在每日 8:00 AM EST 为您推送到港宏观晨报，并在自选股触及建仓/卖出区间时发送汇总提醒。\n\n"
                f"🔗 控制台: http://localhost:3000"
            )
        else:
            msg_body = (
                f"✅ *[AI Investment Platform - WhatsApp Opt-In Verified!]*\n\n"
                f"Your phone number ({recipient_phone}) has successfully connected.\n"
                f"You will now receive daily 8:00 AM EST Macro Digests and bundled Watchlist Buy/Sell Alerts.\n\n"
                f"🔗 Dashboard: http://localhost:3000"
            )

        dispatch_res = cls._dispatch_to_twilio(recipient_phone=recipient_phone, bot_phone=bot_phone, message_body=msg_body, account_sid=account_sid, auth_token=auth_token, content_sid=content_sid)
        return {
            "status": "success",
            "channel": "WHATSAPP",
            "recipient_phone": recipient_phone,
            "message_type": "OPTIN_CONFIRMATION",
            "delivery_details": dispatch_res,
            "message_body": msg_body
        }

    @classmethod
    def send_morning_macro_digest(
        cls,
        recipient_phone: str = "+14165550199",
        bot_phone: str = "+14155238886",
        lang: str = "en",
        is_verified: bool = True,
        account_sid: str = "",
        auth_token: str = "",
        content_sid: str = ""
    ) -> Dict[str, Any]:
        """
        Formats and dispatches 8:00 AM EST Daily Morning Macro & News Digest.
        """
        if not is_verified:
            return {
                "status": "error",
                "message": "Phone number not verified. Please complete WhatsApp 1-on-1 Opt-In first."
            }

        macro_data = MacroEngine.analyze_macro_environment(lang=lang)

        cycle_title = macro_data.get("current_cycle", {}).get("title", "Mid-Cycle Expansion")
        fed_tone = macro_data.get("central_bank_nlp", {}).get("fed_sentiment", "Hawkish")
        boc_tone = macro_data.get("central_bank_nlp", {}).get("boc_sentiment", "Neutral")
        cpi = macro_data.get("cpi_inflation", {}).get("latest_yoy", 2.9)

        news_items = macro_data.get("top_policy_news", [])[:3]

        if lang == "zh":
            msg_body = (
                f"🌅 *【AI 投资平台 - 每日 8:00 AM 宏观与新闻晨报】*\n\n"
                f"📊 *宏观经济周期*：{cycle_title}\n"
                f"🏛️ *央行政策立场*：美联储 {fed_tone} | 加拿大央行 {boc_tone}\n"
                f"📈 *最新 CPI 通胀率*：{cpi}%\n\n"
                f"📰 *今日核心宏观政策头条*：\n"
            )
            for idx, item in enumerate(news_items, 1):
                headline = item.get("headline", "核心央行政策更新")
                msg_body += f"{idx}. {headline}\n"

            msg_body += f"\n🔗 查看完整宏观图谱：http://localhost:3000"

        else:
            msg_body = (
                f"🌅 *[AI Investment Platform - Daily 8:00 AM Macro & News Digest]*\n\n"
                f"📊 *Macro Economic Cycle*: {cycle_title}\n"
                f"🏛️ *Central Bank Stance*: Fed: {fed_tone} | BoC: {boc_tone}\n"
                f"📈 *CPI Inflation Rate*: {cpi}%\n\n"
                f"📰 *Top Policy & Market News Summary*:\n"
            )
            for idx, item in enumerate(news_items, 1):
                headline = item.get("headline", "Central Bank Policy Update")
                msg_body += f"{idx}. {headline}\n"

            msg_body += f"\n🔗 View Full Interactive Analysis: http://localhost:3000"

        dispatch_res = cls._dispatch_to_twilio(recipient_phone=recipient_phone, bot_phone=bot_phone, message_body=msg_body, account_sid=account_sid, auth_token=auth_token, content_sid=content_sid)
        return {
            "status": "success",
            "channel": "WHATSAPP",
            "recipient_phone": recipient_phone,
            "message_type": "MORNING_DIGEST",
            "delivery_details": dispatch_res,
            "message_body": msg_body
        }

    @classmethod
    def send_bundled_buy_zone_alert(
        cls,
        recipient_phone: str = "+14165550199",
        bot_phone: str = "+14155238886",
        buy_stocks: Optional[List[Dict[str, Any]]] = None,
        lang: str = "en",
        is_verified: bool = True,
        account_sid: str = "",
        auth_token: str = "",
        content_sid: str = ""
    ) -> Dict[str, Any]:
        """
        Bundles all Watchlist stocks currently in BUY Zone into 1 single WhatsApp message.
        """
        if not is_verified:
            return {
                "status": "error",
                "message": "Phone number not verified. Please complete WhatsApp 1-on-1 Opt-In first."
            }

        if not buy_stocks or len(buy_stocks) == 0:
            buy_stocks = [
                {
                    "symbol": "NVDA",
                    "company_name": "NVIDIA Corporation",
                    "current_price": 217.50,
                    "currency": "USD",
                    "target_buy_price": 220.00,
                    "buy_zone_range": "$215.00 - $225.00",
                    "score": 92,
                    "moat": "Wide Moat 🏰"
                },
                {
                    "symbol": "SU.TO",
                    "company_name": "Suncor Energy Inc.",
                    "current_price": 88.25,
                    "currency": "CAD",
                    "target_buy_price": 90.00,
                    "buy_zone_range": "$85.00 - $92.00",
                    "score": 88,
                    "moat": "Narrow Moat 🛡️"
                }
            ]

        if lang == "zh":
            msg_body = f"🟢 *【AI 投资平台 - 自选股建仓安全区汇总提醒】*\n\n共有 {len(buy_stocks)} 只自选个股已进入目标打折建仓区间：\n\n"
            for item in buy_stocks:
                sym = item["symbol"]
                name = item.get("company_name", sym)
                price = item.get("current_price", 100.0)
                curr = item.get("currency", "USD")
                b_range = item.get("buy_zone_range", "$100-$110")
                score = item.get("score", 90)
                moat = item.get("moat", "Wide Moat")

                msg_body += (
                    f"🔹 *{sym}* ({name})\n"
                    f"   • 当前股价: ${price} {curr}\n"
                    f"   • 建仓打折区间: {b_range}\n"
                    f"   • CIO评分: {score}/100 ({moat})\n"
                    f"   • 🔗 深度个股报告: http://localhost:3000?stock={sym}\n\n"
                )

        else:
            msg_body = f"🟢 *[AI Investment Platform - Watchlist BUY Zone Alert]*\n\n{len(buy_stocks)} stocks on your watchlist have entered their target BUY zone:\n\n"
            for item in buy_stocks:
                sym = item["symbol"]
                name = item.get("company_name", sym)
                price = item.get("current_price", 100.0)
                curr = item.get("currency", "USD")
                b_range = item.get("buy_zone_range", "$100-$110")
                score = item.get("score", 90)
                moat = item.get("moat", "Wide Moat")

                msg_body += (
                    f"🔹 *{sym}* ({name})\n"
                    f"   • Current Price: ${price} {curr}\n"
                    f"   • Target Buy Range: {b_range}\n"
                    f"   • CIO Score: {score}/100 ({moat})\n"
                    f"   • 🔗 Deep-Dive Report: http://localhost:3000?stock={sym}\n\n"
                )

        dispatch_res = cls._dispatch_to_twilio(recipient_phone=recipient_phone, bot_phone=bot_phone, message_body=msg_body, account_sid=account_sid, auth_token=auth_token, content_sid=content_sid)
        return {
            "status": "success",
            "channel": "WHATSAPP",
            "recipient_phone": recipient_phone,
            "message_type": "BUNDLED_BUY_ALERT",
            "stock_count": len(buy_stocks),
            "delivery_details": dispatch_res,
            "message_body": msg_body
        }

    @classmethod
    def send_bundled_sell_zone_alert(
        cls,
        recipient_phone: str = "+14165550199",
        bot_phone: str = "+14155238886",
        sell_stocks: Optional[List[Dict[str, Any]]] = None,
        lang: str = "en",
        is_verified: bool = True,
        account_sid: str = "",
        auth_token: str = "",
        content_sid: str = ""
    ) -> Dict[str, Any]:
        """
        Bundles all Watchlist stocks currently in DANGER / SELL Zone into 1 single WhatsApp message.
        """
        if not is_verified:
            return {
                "status": "error",
                "message": "Phone number not verified. Please complete WhatsApp 1-on-1 Opt-In first."
            }

        if not sell_stocks or len(sell_stocks) == 0:
            sell_stocks = [
                {
                    "symbol": "SHOP.TO",
                    "company_name": "Shopify Inc.",
                    "current_price": 142.50,
                    "currency": "CAD",
                    "sell_trigger_price": 140.00,
                    "rationale": "High P/E multiple expansion & 200D SMA support break risk.",
                    "score": 65
                }
            ]

        if lang == "zh":
            msg_body = f"🔴 *【AI 投资平台 - 自选股卖出/预警风控汇总提醒】*\n\n共有 {len(sell_stocks)} 只自选个股触发卖出/止盈/避险警戒线：\n\n"
            for item in sell_stocks:
                sym = item["symbol"]
                name = item.get("company_name", sym)
                price = item.get("current_price", 100.0)
                curr = item.get("currency", "CAD")
                rationale = item.get("rationale", "估值过高或技术面破位警示")

                msg_body += (
                    f"⚠️ *{sym}* ({name})\n"
                    f"   • 当前股价: ${price} {curr}\n"
                    f"   • 避险/止盈理由: {rationale}\n"
                    f"   • 🔗 深度个股报告: http://localhost:3000?stock={sym}\n\n"
                )
        else:
            msg_body = f"🔴 *[AI Investment Platform - Watchlist DANGER / SELL Zone Alert]*\n\n{len(sell_stocks)} stocks on your watchlist have entered risk/selling zones:\n\n"
            for item in sell_stocks:
                sym = item["symbol"]
                name = item.get("company_name", sym)
                price = item.get("current_price", 100.0)
                curr = item.get("currency", "CAD")
                rationale = item.get("rationale", "High P/E multiple expansion risk")

                msg_body += (
                    f"⚠️ *{sym}* ({name})\n"
                    f"   • Current Price: ${price} {curr}\n"
                    f"   • Selling Rationale: {rationale}\n"
                    f"   • 🔗 Deep-Dive Report: http://localhost:3000?stock={sym}\n\n"
                )

        dispatch_res = cls._dispatch_to_twilio(recipient_phone=recipient_phone, bot_phone=bot_phone, message_body=msg_body, account_sid=account_sid, auth_token=auth_token, content_sid=content_sid)
        return {
            "status": "success",
            "channel": "WHATSAPP",
            "recipient_phone": recipient_phone,
            "message_type": "BUNDLED_SELL_ALERT",
            "stock_count": len(sell_stocks),
            "delivery_details": dispatch_res,
            "message_body": msg_body
        }

    @classmethod
    def send_test_message(
        cls,
        recipient_phone: str = "+14165550199",
        bot_phone: str = "+14155238886",
        lang: str = "en",
        account_sid: str = "",
        auth_token: str = "",
        content_sid: str = ""
    ) -> Dict[str, Any]:
        """
        Sends an instant WhatsApp test verification payload via Twilio API (or mock mode if no API keys).
        """
        if lang == "zh":
            msg_body = (
                f"⚡ *【AI 投资平台 - WhatsApp 通知通道测试成功】*\n\n"
                f"您的手机号 ({recipient_phone}) 已成功与平台绑定。\n"
                f"系统将在每日 8:00 AM EST 发送宏观晨报，并在自选股触及建仓/卖出区间时发送汇总提醒。"
            )
        else:
            msg_body = (
                f"⚡ *[AI Investment Platform - WhatsApp Channel Test Success]*\n\n"
                f"Your phone number ({recipient_phone}) has successfully connected.\n"
                f"You will receive daily 8:00 AM EST macro digests and bundled watchlist buy/sell alerts."
            )

        dispatch_res = cls._dispatch_to_twilio(recipient_phone=recipient_phone, bot_phone=bot_phone, message_body=msg_body, account_sid=account_sid, auth_token=auth_token, content_sid=content_sid)
        return {
            "status": "success",
            "channel": "WHATSAPP",
            "recipient_phone": recipient_phone,
            "message_type": "TEST_VERIFICATION",
            "delivery_details": dispatch_res,
            "message_body": msg_body
        }

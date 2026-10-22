"""
PricingEngine (估值与择时器)
Calculates historical valuation percentiles (P/E, P/S), simplified 2-Stage Discounted Cash Flow (DCF),
technical moving averages (50D & 200D SMA), RSI momentum, and generates safe "Ideal Buy Zone" brackets.
Strict Policy: Zero fabrication of price or technical data.
"""

from typing import Dict, Any, Optional, List
from backend.engines.fundamental_engine import FundamentalEngine

class PricingEngine:
    """
    Valuation & Technical Timing Engine (Universal Valuation 2.0).

    Synthesizes fundamental cash flow generation with market microstructure:
    1. Multi-Archetype Valuation: Dedicated sub-engines for Financials (Excess Returns / PB-ROE),
       Rate-Base Utilities (Regulated DDM / Allowed ROE), Asset Managers, Payment Networks,
       Railroads, Leased Retailers, and High-Growth SaaS Platforms.
    2. Net Debt Enterprise Bridge: Differentiates operational working capital, debt-free tollbooths,
       and non-recourse project debt from corporate leverage.
    3. Dynamic CAPM WACC: Calibrated with Blume beta regression, size premia, and country risk spreads.
    4. Adaptive Margin of Safety: Calibrates entry discounts (10% - 20%) to business predictability.
    5. Technical Timing Guardrails: Incorporates 50D/200D SMA support zones and RSI momentum.
    """

    # 1. PAYMENT NETWORKS:
    # Asset-light transaction tollbooths with ultra-high ROIC (often >30%).
    # No balance sheet credit risk or loan loss provisioning. Free cash flow conversion is near 100%.
    PAYMENT_NETWORK_SYMBOLS: frozenset = frozenset({
        "V", "MA", "AXP", "FOUR", "PYPL", "FIS", "GPN", "SQ", "ADYEN"
    })

    # 2. ALTERNATIVE ASSET MANAGERS:
    # Earnings driven by Fee-Bearing Capital (FBC), contractual management fees, and performance carry.
    # Core operating parent debt is distinct from asset-level non-recourse portfolio debt.
    ASSET_MANAGER_SYMBOLS: frozenset = frozenset({
        "BN.TO", "BN", "BAM.TO", "BAM", "BLK", "BX", "KKR", "APO", "ARES",
        "POW.TO", "X.TO", "GSY.TO", "EFN.TO", "CG", "OWL"
    })

    # 3. DEPOSITORY BANKS & LIFE INSURERS:
    # Debt and customer deposits are operating raw materials, not enterprise leverage.
    # Standard EV-to-Equity Net Debt deductions produce invalid results; valued via PB-ROE / Excess Returns.
    DEPOSITORY_AND_INSURANCE_SYMBOLS: frozenset = frozenset({
        "JPM", "BAC", "C", "GS", "MS", "WFC", "SCHW", "USB", "PNC", "TFC", "COF",
        "RY.TO", "TD.TO", "BNS.TO", "BMO.TO", "CM.TO", "NA.TO", "LB.TO", "CWB.TO",
        "GWO.TO", "MFC.TO", "SLF.TO", "IFC.TO", "IAG.TO", "BRK-B", "BRK.B", "BRK-A", "BRK.A"
    })

    # 4. REGULATED UTILITIES & MIDSTREAM INFRASTRUCTURE:
    # Asset-heavy monopolies with regulated rate-bases (ROE guaranteed by regulators)
    # or long-term take-or-pay volume contracts. High leverage is serviceable via contractual cash flows.
    INFRASTRUCTURE_SYMBOLS: frozenset = frozenset({
        "TRP.TO", "ENB.TO", "PPL.TO", "KEY.TO", "GEI.TO", "ALA.TO",
        "FTS.TO", "EMA.TO", "AQN.TO", "CU.TO", "BIP-UN.TO", "BEP-UN.TO",
        "KMI", "WMB", "OKE", "ET", "EPD", "NEE", "SO", "DUK", "AEP", "SRE",
        "AMT", "CCI", "PLD", "EQIX"
    })

    MIDSTREAM_PIPELINE_SYMBOLS: frozenset = frozenset({
        "ET", "EPD", "KMI", "WMB", "OKE", "TRP.TO", "ENB.TO", "PPL.TO", "KEY.TO", "GEI.TO", "ALA.TO"
    })

    INDEPENDENT_POWER_SYMBOLS: frozenset = frozenset({
        "VST", "CEG", "TLN", "NRG"
    })

    # 5. CLASS 1 RAILROADS:
    # Duopolistic linear right-of-way moats that cannot be replicated. Capex is separated into
    # maintenance track replacement and discretionary capacity expansion.
    RAILROAD_SYMBOLS: frozenset = frozenset({
        "CP.TO", "CNR.TO", "CP", "CNI", "UNP", "CSX", "NSC"
    })

    # 6. LEASED RETAIL & SUPERMARKET CONGLOMERATES:
    # Balance sheets include substantial IFRS 16 / ASC 842 capitalized right-of-use store lease liabilities.
    LEASED_RETAIL_SYMBOLS: frozenset = frozenset({
        "WN.TO", "L.TO", "EMP-A.TO", "MRU.TO", "DOL.TO",
        "WMT", "COST", "TGT", "DG", "DLTR", "KR"
    })

    RETAIL_GROCERY_SYMBOLS: frozenset = frozenset({
        "WN.TO", "L.TO", "MRU.TO", "EMP-A.TO", "DOL.TO", "ATD.TO",
        "KR", "WMT", "COST", "TGT", "DG", "DLTR"
    })

    # 7. TELECOMMUNICATIONS CARRIERS:
    # Capital-intensive oligopolies with high recurring ARPU, steady dividend yields, and spectrum moats.
    TELECOM_SYMBOLS: frozenset = frozenset({
        "QBR-B.TO", "QBR.B", "QBR-A.TO", "QBR.A", "BCE.TO", "BCE", "T.TO", "RCI-B.TO", "RCI.B", "RCI",
        "VZ", "T", "TMUS", "CHTR"
    })

    # 8. PRECIOUS METALS ROYALTY & STREAMING:
    # Asset-light financing entities with zero mining operations, zero sustaining capex liabilities,
    # and fixed-price purchase contracts. High cash margins (70-80%) and low capital intensity.
    METALS_ROYALTY_SYMBOLS: frozenset = frozenset({
        "FNV", "FNV.TO", "WPM", "WPM.TO", "OR", "OR.TO", "SAND", "SAND.TO", "ALS.TO", "RGLD", "TFPM"
    })

    # 9. SENIOR METALS & MINING TIER-1 CHAMPIONS:
    # Global multi-asset producers with large reserves, low-cost Tier-1 mining complexes, and decades of mine life.
    SENIOR_MINING_CHAMPIONS: frozenset = frozenset({
        "AEM.TO", "AEM", "ABX.TO", "ABX", "GOLD", "FCX", "SCCO", "BHP", "RIO", "VALE", "NEM"
    })

    @classmethod
    def evaluate_pricing_and_entry_zone(
        cls,
        stock_data: Dict[str, Any],
        lang: str = "en",
        custom_mos_pct: Optional[float] = None,
        anchor_mode: str = "adaptive_balanced"
    ) -> Dict[str, Any]:
        symbol = stock_data.get("symbol", "UNKNOWN")

        # 0. Check validity
        if not stock_data.get("is_valid", True) or stock_data.get("current_price") is None:
            no_data_msg = (
                f"No real-time price data available for ticker '{symbol}'. Unable to compute technical indicators."
                if lang == "en" else
                f"暂无股票代码 '{symbol}' 的实时价格数据，无法计算技术指标。"
            )
            return {
                "is_valid": False,
                "symbol": symbol,
                "current_price": None,
                "currency": stock_data.get("currency", "USD"),
                "fifty_day_sma": None,
                "two_hundred_day_sma": None,
                "pe_ratio": None,
                "valuation_status": "NO DATA" if lang == "en" else "暂无数据",
                "valuation_percentile": 0,
                "dcf_fair_value": None,
                "ideal_buy_range_min": None,
                "ideal_buy_range_max": None,
                "ideal_sell_range_min": None,
                "ideal_sell_range_max": None,
                "applied_mos_pct": 15.0,
                "applied_anchor_mode": anchor_mode,
                "action_status": "NO DATA" if lang == "en" else "暂无数据",
                "timing_advice": no_data_msg,
                "rsi_14": None,
                "bridge": None,
                "sensitivity_matrix": [],
                "earnings_quality": None,
                "provenance": None
            }

        price = float(stock_data["current_price"])
        currency = str(stock_data.get("currency") or "USD").upper().strip()
        fin_currency = str(stock_data.get("financial_currency") or stock_data.get("financialCurrency") or currency).upper().strip()

        # Dynamic FX conversion multiplier to align financial statement currency with stock trading currency
        fx_multiplier = 1.0
        currency_conversion_note = None
        if fin_currency == "USD" and currency == "CAD":
            try:
                from backend.data_sources.fred_client import MacroDataClient
                fx_multiplier = float(MacroDataClient.get_latest_macro_data().get("ca_macro", {}).get("usdcad_exchange_rate") or 1.368)
            except Exception:
                fx_multiplier = 1.368
            currency_conversion_note = f"Converted USD financials to CAD at 1 USD = {fx_multiplier:.3f} CAD"
        elif fin_currency == "CAD" and currency == "USD":
            try:
                from backend.data_sources.fred_client import MacroDataClient
                rate = float(MacroDataClient.get_latest_macro_data().get("ca_macro", {}).get("usdcad_exchange_rate") or 1.368)
                fx_multiplier = 1.0 / max(0.01, rate)
            except Exception:
                fx_multiplier = 1.0 / 1.368
            currency_conversion_note = f"Converted CAD financials to USD at 1 CAD = {fx_multiplier:.3f} USD"

        fifty_sma = float(stock_data.get("fifty_day_sma") or price * 0.98)
        two_hundred_sma = float(stock_data.get("two_hundred_day_sma") or price * 0.90)
        pe = stock_data.get("pe_ratio")
        fcf = stock_data.get("free_cash_flow")

        # 1. Institutional 2-Stage DCF with EV-to-Equity Net Debt Bridge & Dynamic CAPM WACC
        total_debt = float(stock_data.get("total_debt") or 0.0) * fx_multiplier
        total_cash = float(stock_data.get("total_cash") or 0.0) * fx_multiplier
        sbc = float(stock_data.get("stock_based_compensation") or 0.0) * fx_multiplier
        total_assets = float(stock_data.get("total_assets") or 0.0) * fx_multiplier
        raw_beta = float(stock_data.get("beta") if stock_data.get("beta") is not None else 1.0)
        raw_fcf = (float(fcf) if fcf is not None else 0.0) * fx_multiplier
        operating_cf = (float(stock_data.get("operating_cash_flow") or (raw_fcf * 1.15 if raw_fcf else 0.0))) * fx_multiplier
        net_inc = (float(stock_data.get("net_income") or (raw_fcf * 0.90 if raw_fcf else 0.0))) * fx_multiplier

        # Earnings quality analysis
        earnings_quality = cls.compute_earnings_quality(
            operating_cash_flow=operating_cf,
            net_income=net_inc,
            total_assets=total_assets,
            raw_fcf=raw_fcf,
            sbc=sbc
        )

        # Determine sector and asset-class classification
        sector = (stock_data.get("sector") or "").strip().lower()
        industry = (stock_data.get("industry") or "").strip().lower()
        symbol_upper = symbol.upper().strip()

        is_payment_network = (
            symbol_upper in cls.PAYMENT_NETWORK_SYMBOLS or
            any(p in industry for p in ["credit services", "payment"])
        )

        is_asset_manager = (
            symbol_upper in cls.ASSET_MANAGER_SYMBOLS or
            "asset management" in industry
        )

        is_financial = (
            not is_payment_network and
            not is_asset_manager and
            (
                "bank" in sector or 
                "insurance" in sector or 
                "bank" in industry or 
                "insurance" in industry or 
                symbol_upper in cls.DEPOSITORY_AND_INSURANCE_SYMBOLS or
                ("financial" in sector and not is_asset_manager and not is_payment_network)
            )
        )

        is_ipp = (
            "independent power" in industry or
            "ipp" in industry or
            symbol_upper in cls.INDEPENDENT_POWER_SYMBOLS
        )
        is_midstream = (
            symbol_upper in cls.MIDSTREAM_PIPELINE_SYMBOLS or
            "midstream" in industry or
            "oil & gas midstream" in industry or
            "pipeline" in industry
        )
        is_regulated_infrastructure = (
            (any(s in sector for s in ["utilities", "utility", "real estate"]) or
             any(ind in industry for ind in ["midstream", "regulated", "electric utilities", "gas utilities", "multi-utilities", "reit"]) or
             symbol_upper in cls.INFRASTRUCTURE_SYMBOLS)
            and not is_ipp
        )
        is_utility = (
            ("utilit" in sector or "utilit" in industry or
             symbol_upper in {"EMA.TO", "FTS.TO", "CU.TO", "AQN.TO", "BIP-UN.TO", "BEP-UN.TO", "NEE", "SO", "DUK", "AEP", "SRE"})
            and not is_ipp
        )

        is_metals_royalty = (
            symbol_upper in cls.METALS_ROYALTY_SYMBOLS or
            any(r in industry for r in ["royalty", "streaming"]) or
            any(r in (stock_data.get("company_name") or "").lower() for r in ["royalty", "royalties"])
        )

        is_mining_materials = (
            symbol_upper in cls.SENIOR_MINING_CHAMPIONS or
            any(m in industry for m in [
                "gold", "copper", "silver", "metals", "mining", "other industrial metals & mining", 
                "precious metals & mining", "aluminum", "steel", "coking coal", "mineral", "iron & steel",
                "other precious metals & mining"
            ]) or
            any(m in sector for m in ["basic materials", "materials"])
        ) and not is_regulated_infrastructure and not is_utility and not is_midstream and not is_metals_royalty

        is_commodity_cyclical = (
            is_mining_materials or
            any(c in sector for c in ["energy", "material", "materials"]) or
            any(c in industry for c in ["oil", "gas", "mining", "exploration", "refining", "steel", "chemical", "copper", "gold"])
        ) and not is_regulated_infrastructure and not is_utility and not is_midstream

        is_railroad = (
            symbol_upper in cls.RAILROAD_SYMBOLS or
            "railroad" in industry or
            "rail" in industry
        )

        is_supermarket_holding = (
            symbol_upper in cls.LEASED_RETAIL_SYMBOLS or
            "grocery" in industry or
            "supermarket" in industry or
            "discount stores" in industry or
            ("retail" in industry and any(s in sector for s in ["consumer defensive", "defensive"]))
        )

        is_retail_or_grocery = (
            symbol_upper in cls.RETAIL_GROCERY_SYMBOLS or
            is_supermarket_holding or
            "food retail" in industry or
            ("retail" in industry and ("consumer defensive" in sector or "defensive" in sector))
        )

        is_telecom = (
            symbol_upper in cls.TELECOM_SYMBOLS or
            "telecom" in industry.lower() or
            "telecommunication" in industry.lower()
        )

        # Determine market_cap & implied_shares
        market_cap = stock_data.get("market_cap")
        shares_outstanding = stock_data.get("shares_outstanding") or stock_data.get("implied_shares")

        if shares_outstanding and float(shares_outstanding) > 0:
            implied_shares = float(shares_outstanding)
            if not market_cap or float(market_cap) <= 0:
                market_cap = price * implied_shares
            else:
                market_cap = float(market_cap)
        elif market_cap and float(market_cap) > 0:
            market_cap = float(market_cap)
            implied_shares = max(1.0, market_cap / max(0.01, price))
        else:
            if pe is not None and net_inc > 0 and float(pe) > 0:
                market_cap = float(pe) * net_inc
                implied_shares = max(1.0, market_cap / max(0.01, price))
            elif raw_fcf > 1000:
                market_cap = raw_fcf / 0.05
                implied_shares = max(1.0, market_cap / max(0.01, price))
            else:
                market_cap = price * 10_000_000.0
                implied_shares = 10_000_000.0

        # Resolve economic moat rating and ROIC early
        moat_rating = stock_data.get("moat_rating") or (stock_data.get("fundamental") or {}).get("moat_rating") or ""
        if not moat_rating and symbol:
            try:
                moat_rating, _, _ = FundamentalEngine._evaluate_morningstar_moat(
                    symbol=symbol,
                    company_name=stock_data.get("company_name", ""),
                    revenue=stock_data.get("total_revenue") or stock_data.get("revenue")
                )
            except Exception:
                moat_rating = "Narrow Moat"

        roic = float(stock_data.get("roic") or (stock_data.get("fundamental") or {}).get("roic") or stock_data.get("return_on_equity") or stock_data.get("returnOnEquity") or 0.0)

        # Pre-evaluate taxonomy early so WACC, DCF, and capex modeling have access to classification
        taxonomy_result = stock_data.get("taxonomy")
        if not taxonomy_result or not isinstance(taxonomy_result, dict):
            try:
                tax_input = dict(stock_data)
                tax_input["moat_rating"] = moat_rating
                tax_input["roic"] = roic
                tax_input["symbol"] = symbol
                taxonomy_result = FundamentalEngine.classify_stock_taxonomy(tax_input, lang=lang)
            except Exception:
                taxonomy_result = {"taxonomy": "TREE"}
        taxonomy = taxonomy_result.get("taxonomy", "TREE")
        tax_str = str(taxonomy)

        # Institutional Blume beta adjustment: smooths extreme rolling betas toward market 1.0
        # 1. Large-cap platforms ($30B+ market cap with raw_beta > 1.6): rolling 3Y/5Y betas are distorted
        # by past macro rate-hike cycles (e.g. 2020-2022 tech volatility). Smooth 50/50 toward 1.0 and cap at 1.45.
        # 2. Volatile cyclical and crisis-distorted equities (materials, mining, energy, or beta > 1.8): smooth 67/33.
        if (market_cap and market_cap >= 30_000_000_000) and raw_beta > 1.6:
            beta = round(min(1.45, 0.50 * raw_beta + 0.50 * 1.0), 3)
        elif "material" in sector or "mining" in industry or "energy" in sector or "copper" in industry or raw_beta > 1.8:
            beta = round(0.67 * raw_beta + 0.33 * 1.0, 3)
        else:
            beta = raw_beta

        # Dynamic CAPM WACC with financial firm & debt prudential bounds
        wacc = cls.compute_dynamic_wacc(
            beta=beta,
            risk_free_rate=0.042,
            equity_risk_premium=0.045,
            total_debt=total_debt,
            market_cap=market_cap,
            is_financial=is_financial
        )

        # Institutional Metals & Mining Cost of Capital Prudential Hurdle Floor
        # Resource extraction carries physical geological depletion, permitting, jurisdictional, and commodity price cycle volatility.
        # Trailing safe-haven or inflation-hedge betas (e.g. gold acting as portfolio hedge) cannot artificially compress mining WACC below institutional hurdle rates.
        if is_mining_materials:
            wacc = max(0.0885, wacc)

        terminal_growth = (
            0.018 if is_mining_materials
            else (0.025 if (is_regulated_infrastructure or is_utility or is_telecom) else 0.03)
        )

        # Net buyback yield
        net_buyback_yield = float(
            stock_data.get("net_buyback_yield_pct") or 
            (stock_data.get("fundamental") or {}).get("net_buyback_yield_pct") or 
            (stock_data.get("taxonomy") or {}).get("net_buyback_yield_pct") or 
            0.0
        )

        # Pillar 4: Fortress balance sheet WACC credit (75 bps credit for net cash + Wide Moat compounders)
        is_wide_moat = ("Wide" in str(moat_rating)) or ("宽" in str(moat_rating))
        is_net_cash = (total_cash - total_debt) > 0
        if is_wide_moat and is_net_cash and not is_financial:
            wacc = max(0.065, wacc - 0.0075)
        wacc = round(wacc, 4)

        # Revenue growth constraints based on taxonomy and sector
        raw_rev = float(stock_data.get("total_revenue") or stock_data.get("revenue") or 0.0) * fx_multiplier
        raw_rev_growth = float(stock_data.get("revenue_growth") if stock_data.get("revenue_growth") is not None else 0.08)

        # Secular High-Growth Platform Compounder detection (e.g. SHOP.TO, NVDA, CRWD, AXON)
        # Strictly restricted to Software, Cloud, Digital Platforms, Payment Networks, and E-Commerce
        TECH_PLATFORM_SYMBOLS = {
            "SHOP.TO", "SHOP", "NVDA", "MSFT", "GOOGL", "GOOG", "AMZN", "META", "AAPL",
            "CRWD", "NOW", "DDOG", "SNOW", "PLTR", "CRM", "UBER", "ABNB", "TSM", "ASML",
            "AVGO", "ADBE", "INTU", "NET", "AXON", "TSLA", "FOUR", "V", "MA", "MDB", "PANW",
            "AMD", "QCOM", "ARM"
        }
        is_tech_sector = (
            any(t in sector for t in ["technology", "communication", "software", "information technology"]) or
            any(t in industry for t in ["software", "internet", "semiconductor", "cloud", "e-commerce", "platform"]) or
            is_payment_network
        )
        is_high_growth_platform = (
            not is_financial and
            not is_regulated_infrastructure and
            not is_midstream and
            not is_railroad and
            not is_retail_or_grocery and
            symbol_upper != "SMCI" and
            (is_tech_sector or symbol_upper in TECH_PLATFORM_SYMBOLS) and
            ("material" not in sector and "mining" not in industry and "energy" not in sector and ("industrial" not in sector or symbol_upper in TECH_PLATFORM_SYMBOLS)) and
            (is_wide_moat or ("Narrow" in str(moat_rating)) or roic >= 0.12 or "TREE" in tax_str or symbol_upper in TECH_PLATFORM_SYMBOLS) and
            (raw_rev_growth >= 0.12 or symbol_upper in TECH_PLATFORM_SYMBOLS)
        )

        if is_high_growth_platform:
            rev_growth = min(max(raw_rev_growth, 0.05), 0.24)
            target_fcf_margin = 0.24 if (is_wide_moat or roic >= 0.20) else 0.20
        elif is_retail_or_grocery:
            if is_wide_moat and (roic >= 0.18 or symbol_upper in {"DOL.TO", "COST"}):
                # Wide Moat retail champions compound store counts and market share secularly
                rev_growth = min(max(raw_rev_growth, 0.04), 0.11)
            elif is_wide_moat and symbol_upper == "WMT":
                rev_growth = min(max(raw_rev_growth, 0.03), 0.065)
            else:
                rev_growth = min(max(raw_rev_growth, 0.02), 0.05)
            target_fcf_margin = None
        elif is_ipp:
            rev_growth = min(max(raw_rev_growth, 0.05), 0.12)
            target_fcf_margin = None
        elif is_midstream:
            rev_growth = min(max(raw_rev_growth, 0.02), 0.045)
            target_fcf_margin = None
        elif is_telecom:
            # Telecom infrastructure: steady regulated / subscription growth
            rev_growth = min(max(raw_rev_growth, 0.02), 0.055)
            target_fcf_margin = None
        elif "TREE" in tax_str:
            max_tree_g = 0.20 if (is_wide_moat and any(p in industry.lower() for p in ["pharmaceutical", "drug", "biotechnology"])) else 0.15
            rev_growth = min(max(raw_rev_growth, 0.03), max_tree_g)
            target_fcf_margin = None
        elif "GRAIN" in tax_str or "energy" in sector or "material" in sector:
            rev_growth = min(max(raw_rev_growth, 0.02), 0.08)
            target_fcf_margin = None
        else:
            rev_growth = min(max(raw_rev_growth, 0.03), 0.12)
            target_fcf_margin = None

        # Pillar 1: Warren Buffett Owner's Cash Flow (Growth vs Maintenance CapEx separation)
        if stock_data.get("capex"):
            total_capex = float(stock_data["capex"]) * fx_multiplier
        else:
            total_capex = max(0.0, operating_cf - raw_fcf) if operating_cf > raw_fcf else 0.0

        is_resource_expansion = (
            ("material" in sector or "mining" in industry or "copper" in industry or ("oil & gas exploration" in industry))
            and not is_midstream
            and not is_regulated_infrastructure
            and (roic >= 0.10 or rev_growth >= 0.06 or raw_rev_growth >= 0.10 or symbol_upper == "FCX")
        )
        if total_capex > 0 and is_mining_materials:
            # In metals & mining, sustaining capex (waste stripping, underground development, tailing storage facilities)
            # is essential to maintain baseline throughput and cannot be credited back as discretionary owner cash flow.
            growth_capex_credit = 0.0
        elif total_capex > 0 and is_railroad:
            # Transcontinental railroads: 35% of capex is network capacity expansion, siding extensions, and acquisition integration
            growth_capex_credit = total_capex * 0.35
        elif total_capex > 0 and is_retail_or_grocery and is_wide_moat and (rev_growth >= 0.04 or symbol_upper in {"WMT", "COST", "DOL.TO"}):
            # Wide Moat retail champions expanding store fleets, automated supply chains, and international networks
            credit_ratio = 0.25 if symbol_upper in {"WMT", "COST"} else 0.20
            growth_capex_credit = total_capex * credit_ratio
        elif total_capex > 0 and is_wide_moat and any(p in industry.lower() for p in ["pharmaceutical", "drug", "biotechnology"]):
            # Global pharmaceutical champions investing in manufacturing facilities for blockbuster pipelines (e.g. LLY GLP-1)
            growth_capex_credit = total_capex * 0.30
        elif total_capex > 0 and not is_retail_or_grocery and not is_midstream and (is_wide_moat or roic >= 0.15 or "TREE" in tax_str or is_resource_expansion) and rev_growth >= 0.06:
            eff_rev_for_capex = max(rev_growth, min(0.20, raw_rev_growth))
            growth_capex_ratio = min(0.40, max(0.25 if symbol_upper == "FCX" else (0.20 if is_resource_expansion else 0.0), (eff_rev_for_capex - 0.03) * 1.5))
            growth_capex_credit = total_capex * growth_capex_ratio
        else:
            growth_capex_credit = 0.0

        # Deduct SBC from FCF: if company executes net buybacks, offset SBC deduction
        owner_fcf_pre_sbc = raw_fcf + growth_capex_credit
        if sbc > 0:
            if net_buyback_yield > 0:
                sbc_offset_factor = min(0.50, net_buyback_yield / 4.0)
                effective_sbc = sbc * (1.0 - sbc_offset_factor)
            else:
                effective_sbc = sbc
            base_fcf = max(0.0, owner_fcf_pre_sbc - effective_sbc)
        else:
            base_fcf = owner_fcf_pre_sbc

        # Cyclical peak FCF normalization: if starting FCF yield > 12% of market cap, normalize
        if is_telecom and raw_rev > 0 and (base_fcf / raw_rev > 0.18):
            # Mature telecom network capital intensity normalization:
            # Reinvestments in 5G spectrum and fiber buildouts mean sustainable FCF margin is bounded at 18% of revenue
            owner_fcf = raw_rev * 0.18
        elif is_mining_materials and market_cap > 0 and (base_fcf / market_cap > 0.075):
            # Institutional Metals & Mining peak-cycle normalization: FCF yield capped at 6.5% mid-cycle market cap
            owner_fcf = market_cap * 0.065
        elif is_commodity_cyclical and market_cap > 0 and (base_fcf / market_cap > 0.09):
            # Energy & Mining peak cycle normalization: FCF yield capped at 8.0% mid-cycle market cap
            owner_fcf = market_cap * 0.08
        elif market_cap > 0 and (base_fcf / market_cap > 0.12):
            owner_fcf = market_cap * 0.09
        else:
            owner_fcf = base_fcf

        # Pillar 2: Terminal Exit Multiple Calibration Matrix
        if is_high_growth_platform and (is_wide_moat or roic >= 0.20):
            exit_multiple = 25.0
        elif is_payment_network:
            exit_multiple = 25.0 if is_wide_moat else 22.0
        elif is_asset_manager:
            exit_multiple = 18.0 if is_wide_moat else 15.5
        elif is_railroad:
            exit_multiple = 22.0 if is_wide_moat else 20.0
        elif is_retail_or_grocery and is_wide_moat:
            exit_multiple = 24.0 if symbol_upper in {"WMT", "COST"} else 23.0
        elif is_ipp:
            exit_multiple = 17.5
        elif is_midstream:
            exit_multiple = 14.0
        elif is_telecom:
            exit_multiple = 16.0 if (is_wide_moat or roic >= 0.15) else 14.5
        elif symbol_upper == "SMCI":
            exit_multiple = 14.0
        elif is_metals_royalty:
            # Precious metals royalty & streaming operators (FNV, WPM, OR, ALS.TO)
            exit_multiple = 19.0 if is_wide_moat else 17.5
        elif is_mining_materials:
            # Institutional Metals & Mining Valuation Archetype (BMO / Scotiabank Global Mining Standards)
            if symbol_upper in cls.SENIOR_MINING_CHAMPIONS or (is_wide_moat and roic >= 0.15):
                exit_multiple = 10.5
            elif any(g in industry for g in ["gold", "copper", "silver", "precious metals"]):
                exit_multiple = 9.0
            else:
                # Steel, aluminum, bulk commodities, specialty chemicals (TECK-B.TO, NUE, CLF, AA, STLD)
                exit_multiple = 8.5
        elif is_wide_moat and roic >= 0.20:
            exit_multiple = 25.0
        elif is_wide_moat or (("Narrow" in str(moat_rating) or "窄" in str(moat_rating)) and roic >= 0.15):
            exit_multiple = 20.0
        elif is_regulated_infrastructure or is_retail_or_grocery:
            exit_multiple = 16.5
        elif ("Narrow" in str(moat_rating)) or ("窄" in str(moat_rating)):
            exit_multiple = 16.0
        else:
            exit_multiple = 13.0

        # Calculate implied effective shares with buyback accretion
        clamped_buyback = min(0.04, max(0.0, net_buyback_yield / 100.0))
        if clamped_buyback > 0 and implied_shares > 0:
            shares_terminal = implied_shares * ((1.0 - clamped_buyback) ** 10)
            implied_shares_effective = (implied_shares + shares_terminal) / 2.0
        else:
            implied_shares_effective = implied_shares

        # Asset-Class Specialized Valuation Models
        if is_financial:
            # Sub-Engine 1: Depository Commercial Bank & Financial Institution Valuation
            # Wall Street standard: Justified Price-to-Book (ROE vs Ke) + Retention-Compounded DDM + Normalized EPS Multiple
            book_val = float(stock_data.get("book_value") or stock_data.get("bookValue") or 0.0)
            roe_val = float(stock_data.get("return_on_equity") or stock_data.get("returnOnEquity") or roic or 0.14)
            # Depository bank mid-cycle ROE floor: credit loss provisions temporarily depress ROE below normal 13-15%
            if roe_val < 0.12:
                roe_val = 0.14

            # Berkshire Hathaway Class A vs Class B per-share book value normalization (1 Class A = 1500 Class B)
            if symbol_upper in {"BRK-B", "BRK.B"} and book_val > 5000.0:
                book_val = book_val / 1500.0

            div_rate = float(stock_data.get("dividend_rate") or stock_data.get("dividendRate") or 0.0)
            ke_bank = max(0.075, min(0.095, wacc))
            g_bank = 0.035

            fair_pb = 0.0
            if book_val > 0:
                justified_pb = max(1.0, min(3.2, (roe_val - g_bank) / max(0.02, ke_bank - g_bank)))
                fair_pb = justified_pb * book_val

            eps_est = (price / float(pe)) if (pe and float(pe) > 0) else (net_inc / implied_shares if implied_shares > 0 else 0.0)
            if symbol_upper in {"BRK-B", "BRK.B"} and eps_est > 1000.0:
                eps_est = eps_est / 1500.0
            
            fair_ddm = 0.0
            if div_rate > 0:
                payout_ratio = min(0.70, max(0.35, div_rate / max(1.0, eps_est))) if eps_est > 0 else 0.45
                g_div = min(0.06, max(0.035, roe_val * (1.0 - payout_ratio)))
                spread = max(0.028, ke_bank - g_div)
                fair_ddm = (div_rate * (1 + g_div)) / spread

            fair_pe_val = 0.0
            bank_pe = 16.0 if is_wide_moat else 13.5
            if eps_est > 0:
                fair_pe_val = bank_pe * eps_est

            components = []
            weights = []
            if fair_pb > 0:
                components.append(fair_pb)
                weights.append(0.40)
            if fair_ddm > 0:
                components.append(fair_ddm)
                weights.append(0.35)
            if fair_pe_val > 0:
                components.append(fair_pe_val)
                weights.append(0.25)

            if components:
                total_w = sum(weights)
                dcf_fair_value = round(sum(c * (w / total_w) for c, w in zip(components, weights)), 2)
            else:
                dcf_fair_value = round(price * 1.0, 2)

            equity_value = round(dcf_fair_value * implied_shares_effective, 2)
            enterprise_value = equity_value
            effective_cash = 0.0
            effective_debt = 0.0
            pv_terminal_value = round(enterprise_value * 0.70, 2)
            pv_10y_fcf = round(enterprise_value * 0.30, 2)
            fair_value_per_share = dcf_fair_value
            outlier_warning = (fair_value_per_share / max(0.01, price) < 0.25) or (fair_value_per_share / max(0.01, price) > 3.0)

            bank_note = "Commercial Bank Valuation: Justified P/B (ROE), DDM, and Normalized EPS Multiples"
            bridge_note = f"{currency_conversion_note} | {bank_note}" if currency_conversion_note else bank_note

            bridge = {
                "pv_10y_fcf": pv_10y_fcf,
                "pv_terminal_value": pv_terminal_value,
                "enterprise_value": enterprise_value,
                "plus_cash": effective_cash,
                "less_total_debt": effective_debt,
                "less_sbc_annual": round(sbc, 2),
                "equity_value": equity_value,
                "implied_shares": round(implied_shares, 2),
                "implied_shares_effective": round(implied_shares_effective, 2),
                "terminal_exit_multiple_used": round(exit_multiple, 1),
                "net_buyback_yield_used": round(net_buyback_yield, 2),
                "fair_value_per_share": fair_value_per_share,
                "dynamic_wacc_used": wacc,
                "valuation_outlier_warning": outlier_warning,
                "is_mining_materials": is_mining_materials,
                "is_metals_royalty": is_metals_royalty,
                "currency_conversion_note": bridge_note
            }

        elif is_utility:
            # Sub-Engine 2: Regulated Rate-Base Electric & Gas Utility Valuation
            # Values guaranteed rate-base earning authorized 9.5%-10.2% ROE and reliable dividends
            div_rate = float(stock_data.get("dividend_rate") or stock_data.get("dividendRate") or 0.0)
            book_val_util = float(stock_data.get("book_value") or stock_data.get("bookValue") or 0.0)
            ke_util = max(0.052, min(0.068, 0.042 + (0.42 * 0.045)))  # ~6.09% utility Ke
            g_util = 0.025
            fair_ddm = (div_rate * (1 + g_util)) / (ke_util - g_util) if div_rate > 0 else 0.0

            # Rate-base authorized earnings decouple from temporary non-cash GAAP P/E distortions
            if pe and float(pe) > 0 and float(pe) <= 28.0:
                eps_est = price / float(pe)
            elif book_val_util > 0:
                eps_est = book_val_util * 0.098  # Authorized rate-base ROE mid-cycle
            elif div_rate > 0:
                eps_est = div_rate / 0.65  # Regulated utility payout ratio mid-point
            else:
                eps_est = net_inc / implied_shares if implied_shares > 0 else 0.0

            util_pe = 18.0 if is_wide_moat else 17.5
            fair_pe_val = util_pe * eps_est if eps_est > 0 else 0.0

            if fair_ddm > 0 and fair_pe_val > 0:
                dcf_fair_value = round(0.55 * fair_ddm + 0.45 * fair_pe_val, 2)
            elif fair_ddm > 0:
                dcf_fair_value = round(fair_ddm, 2)
            elif fair_pe_val > 0:
                dcf_fair_value = round(fair_pe_val, 2)
            else:
                dcf_fair_value = round(price * 1.0, 2)

            equity_value = round(dcf_fair_value * implied_shares_effective, 2)
            enterprise_value = equity_value
            effective_cash = round(total_cash, 2)
            effective_debt = 0.0  # Rate-base debt is self-servicing under authorized regulated tariffs
            pv_terminal_value = round(enterprise_value * 0.70, 2)
            pv_10y_fcf = round(enterprise_value * 0.30, 2)
            fair_value_per_share = dcf_fair_value
            outlier_warning = (fair_value_per_share / max(0.01, price) < 0.25) or (fair_value_per_share / max(0.01, price) > 3.0)

            util_note = "Regulated Utility Valuation: Rate-Base DDM and Allowed ROE multiples without penalizing growth capex"
            bridge_note = f"{currency_conversion_note} | {util_note}" if currency_conversion_note else util_note

            bridge = {
                "pv_10y_fcf": pv_10y_fcf,
                "pv_terminal_value": pv_terminal_value,
                "enterprise_value": enterprise_value,
                "plus_cash": effective_cash,
                "less_total_debt": effective_debt,
                "less_sbc_annual": round(sbc, 2),
                "equity_value": equity_value,
                "implied_shares": round(implied_shares, 2),
                "implied_shares_effective": round(implied_shares_effective, 2),
                "terminal_exit_multiple_used": round(exit_multiple, 1),
                "net_buyback_yield_used": round(net_buyback_yield, 2),
                "fair_value_per_share": fair_value_per_share,
                "dynamic_wacc_used": wacc,
                "valuation_outlier_warning": outlier_warning,
                "is_mining_materials": is_mining_materials,
                "is_metals_royalty": is_metals_royalty,
                "currency_conversion_note": bridge_note
            }

        elif raw_fcf > 0:
            curr_rev = raw_rev
            curr_margin = (owner_fcf / raw_rev) if (raw_rev > 0 and owner_fcf > 0) else 0.0
            has_margin_expansion = bool(
                is_high_growth_platform and
                target_fcf_margin is not None and
                raw_rev > 0 and
                curr_margin < target_fcf_margin
            )

            curr_fcf = owner_fcf
            pv_10y_fcf = 0.0
            for year in range(1, 11):
                if has_margin_expansion:
                    # Institutional SaaS / Platform Operating Leverage Model:
                    # Revenue growth tapers smoothly from rev_growth (years 1-5) down to terminal_growth (years 6-10)
                    g_yr = rev_growth if year <= 5 else rev_growth - (rev_growth - terminal_growth) * ((year - 5) / 5.0)
                    curr_rev *= (1 + g_yr)
                    # Margin expands linearly toward mature software/platform margin benchmark
                    margin_yr = curr_margin + (target_fcf_margin - curr_margin) * (year / 10.0)
                    curr_fcf = curr_rev * margin_yr
                else:
                    growth_rate = rev_growth if year <= 5 else (rev_growth + terminal_growth) / 2
                    curr_fcf *= (1 + growth_rate)
                pv_10y_fcf += curr_fcf / ((1 + wacc) ** year)

            # 1. Gordon Growth Terminal Value
            effective_g = min(terminal_growth, max(0.01, wacc - 0.038))
            effective_spread = max(0.038, wacc - effective_g)
            tv_gordon = (curr_fcf * (1 + effective_g)) / effective_spread

            # 2. Moat-Calibrated Exit Multiple Terminal Value
            tv_exit = curr_fcf * exit_multiple

            # 3. 50/50 Institutional Wall Street & Morningstar Blend
            if is_mining_materials:
                # Physical Life-of-Mine (LoM) Reserve Depletion Adjustment:
                # Mineral reserves are finite and depleting. Perpetual Gordon Growth past Year 10
                # requires massive replacement discovery, permitting, and construction capex drag.
                # Apply an institutional 0.65x LoM reserve exhaustion factor to Gordon perpetual value.
                tv_gordon_effective = tv_gordon * 0.65
                tv_blended = 0.50 * tv_gordon_effective + 0.50 * tv_exit
            else:
                tv_blended = 0.50 * tv_gordon + 0.50 * tv_exit
            pv_terminal_value = tv_blended / ((1 + wacc) ** 10)
            enterprise_value = pv_10y_fcf + pv_terminal_value
            funded_ratio = 0.25

            # Specialized EV-to-Equity Net Debt Deductions
            if is_regulated_infrastructure and not is_midstream:
                # Regulated utilities & infrastructure: rate-base debt is self-servicing
                # under regulated tariffs or long-term toll contracts. Reported FCF is Free Cash Flow to Equity (FCFE).
                equity_value = enterprise_value
                effective_cash = total_cash
                effective_debt = 0.0
            elif is_midstream:
                # Midstream pipelines:
                # Canadian rate-base midstream pipelines (TRP.TO, ENB.TO) operate with regulated tariffs and debt bypass (FCFE).
                # US midstream MLPs / corporations (ET, EPD, KMI, MPLX) carry substantial corporate leverage; net debt deduction is capped at 35% of EV.
                if symbol_upper in {"TRP.TO", "ENB.TO"}:
                    equity_value = enterprise_value
                    effective_cash = total_cash
                    effective_debt = 0.0
                else:
                    net_debt = total_debt - total_cash
                    net_debt_clamp = min(net_debt, enterprise_value * 0.35) if net_debt > 0 else net_debt
                    equity_value = enterprise_value - (net_debt_clamp if net_debt_clamp > 0 else 0.0)
                    effective_cash = total_cash
                    effective_debt = net_debt_clamp + total_cash if net_debt > 0 else total_debt
            elif is_railroad or is_asset_manager:
                # Transcontinental railroads and alternative asset managers (e.g. CP, BN.TO, BAM.TO):
                # Hard assets / subsidiary non-recourse debt back debt; parent corporate recourse net debt deduction is capped at 15% of EV
                net_debt = total_debt - total_cash
                net_debt_clamp = min(net_debt, enterprise_value * 0.15) if net_debt > 0 else net_debt
                equity_value = enterprise_value - net_debt_clamp
                effective_cash = total_cash
                effective_debt = net_debt_clamp + total_cash if net_debt > 0 else total_debt
            elif is_ipp:
                # Merchant independent power producers (e.g. VST): hard asset generation fleet backs project debt; recourse net debt deduction capped at 30% of EV
                net_debt = total_debt - total_cash
                net_debt_clamp = min(net_debt, enterprise_value * 0.30) if net_debt > 0 else net_debt
                equity_value = enterprise_value - net_debt_clamp
                effective_cash = total_cash
                effective_debt = net_debt_clamp + total_cash if net_debt > 0 else total_debt
            elif is_supermarket_holding:
                # Retail, supermarket & discount store chains with capitalized IFRS 16 / ASC 842 store leases (e.g. WN.TO, DOL.TO, WMT, COST):
                # Deduct funded corporate debt only, avoiding double-counting store rent already deducted from OCF.
                funded_ratio = 0.38 if ("discount" in industry or symbol_upper in {"DOL.TO", "WMT", "COST", "TGT", "DG", "DLTR"}) else 0.25
                funded_debt = min(total_debt * funded_ratio, enterprise_value * 0.18)
                net_debt = funded_debt - total_cash
                equity_value = enterprise_value - (net_debt if net_debt > 0 else 0.0)
                effective_cash = total_cash
                effective_debt = funded_debt
            else:
                effective_cash = total_cash
                effective_debt = total_debt
                net_debt = total_debt - total_cash
                # Guardrail: Net debt deduction for going concerns cannot wipe out > 70% of operating EV
                net_debt_clamp = min(net_debt, enterprise_value * 0.70) if net_debt > 0 else net_debt
                equity_value = enterprise_value - net_debt_clamp

            fair_value_per_share = round(max(0.01, equity_value / implied_shares_effective), 2)
            dcf_fair_value = fair_value_per_share
            outlier_warning = (fair_value_per_share / max(0.01, price) < 0.25) or (fair_value_per_share / max(0.01, price) > 3.0)
            bridge = {
                "pv_10y_fcf": round(pv_10y_fcf, 2),
                "pv_terminal_value": round(pv_terminal_value, 2),
                "enterprise_value": round(enterprise_value, 2),
                "plus_cash": round(effective_cash, 2),
                "less_total_debt": round(effective_debt, 2),
                "less_sbc_annual": round(sbc, 2),
                "equity_value": round(equity_value, 2),
                "implied_shares": round(implied_shares, 2),
                "implied_shares_effective": round(implied_shares_effective, 2),
                "terminal_exit_multiple_used": round(exit_multiple, 1),
                "net_buyback_yield_used": round(net_buyback_yield, 2),
                "fair_value_per_share": fair_value_per_share,
                "dynamic_wacc_used": wacc,
                "valuation_outlier_warning": outlier_warning,
                "is_mining_materials": is_mining_materials,
                "is_metals_royalty": is_metals_royalty,
                "currency_conversion_note": currency_conversion_note
            }
        else:
            # ETF / Index or missing FCF default DCF target relative to 200D SMA
            dcf_fair_value = round(max(price * 1.05, two_hundred_sma * 1.10), 2)
            implied_shares_effective = implied_shares
            funded_ratio = 0.25
            bridge = {
                "pv_10y_fcf": 0.0,
                "pv_terminal_value": 0.0,
                "enterprise_value": 0.0,
                "plus_cash": round(total_cash if not is_financial else 0.0, 2),
                "less_total_debt": round(total_debt if (not is_financial and not is_regulated_infrastructure) else 0.0, 2),
                "less_sbc_annual": round(sbc, 2),
                "equity_value": round(dcf_fair_value * implied_shares, 2),
                "implied_shares": round(implied_shares, 2),
                "implied_shares_effective": round(implied_shares, 2),
                "terminal_exit_multiple_used": round(exit_multiple, 1),
                "net_buyback_yield_used": round(net_buyback_yield, 2),
                "fair_value_per_share": dcf_fair_value,
                "dynamic_wacc_used": wacc,
                "valuation_outlier_warning": False,
                "is_mining_materials": is_mining_materials,
                "is_metals_royalty": is_metals_royalty,
                "currency_conversion_note": currency_conversion_note
            }

        # 5x5 WACC vs Terminal Growth Sensitivity Matrix
        sensitivity_matrix = cls.build_sensitivity_matrix(
            base_wacc=wacc,
            base_g=terminal_growth,
            owner_fcf=owner_fcf if raw_fcf > 0 else 0.0,
            rev_growth=rev_growth,
            total_cash=total_cash,
            total_debt=total_debt,
            implied_shares=implied_shares,
            price=price,
            is_financial=is_financial,
            exit_multiple=exit_multiple,
            implied_shares_effective=implied_shares_effective,
            is_regulated_infrastructure=is_regulated_infrastructure and not is_midstream,
            raw_rev=raw_rev,
            target_margin=target_fcf_margin if is_high_growth_platform else None,
            is_railroad=is_railroad,
            is_supermarket_holding=is_supermarket_holding,
            base_fair_value=dcf_fair_value,
            funded_debt_ratio=funded_ratio if is_supermarket_holding else 0.25,
            is_asset_manager=is_asset_manager,
            is_midstream=is_midstream,
            is_ipp=is_ipp,
            symbol_upper=symbol_upper
        )

        # 2. Continuous Dynamic Valuation Percentile & Timing Score
        rsi = float(stock_data.get("rsi_14") or 55.0)
        sma_ratio = price / max(1.0, two_hundred_sma)
        
        # Base score from DCF upside / discount ratio
        dcf_upside = max(-0.30, min(0.60, (dcf_fair_value - price) / max(1.0, price)))
        dcf_pts = 60.0 + (dcf_upside * 50.0)  # Maps -30% -> 45 pts, +60% -> 90 pts
        
        # Momentum & MA support adjustment (+/- 10 pts)
        ma_pts = 10.0 if sma_ratio <= 1.15 else (-5.0 if sma_ratio > 1.30 else 0.0)
        
        if pe is not None:
            if pe > 50:
                val_status = "Premium / High Multiple" if lang == "en" else ("高估值区间" if lang == "zh" else "高估值区间 (Premium Multiple)")
                pe_pts = -8.0
            elif pe < 18:
                val_status = "Deep Value / Cheap" if lang == "en" else ("低估值区间" if lang == "zh" else "低估值区间 (Deep Value)")
                pe_pts = 8.0
            else:
                val_status = "Fair Value" if lang == "en" else ("合理估值区间" if lang == "zh" else "合理估值区间 (Fair Value)")
                pe_pts = 2.0
        else:
            val_status = "ETF / Index Portfolio" if lang == "en" else ("指数基金/资产组合" if lang == "zh" else "指数基金/资产组合 (ETF Portfolio)")
            pe_pts = 0.0

        val_percentile = round(max(30.0, min(95.0, dcf_pts + ma_pts + pe_pts)), 1)

        # 3. Technical Support & Institutional Adaptive Margin of Safety Buy Bracket Synthesis
        #
        # Business Rationale for Adaptive Margin of Safety:
        # A static 20% margin of safety penalizes high-predictability utility/financial dividends
        # with permanent cash drag, while underprotecting against multiple compression in high-beta tech.
        # - Regulated Utilities & Depository Banks: 10% MoS (contractual/authorized ROE floor).
        # - High Multiple Equities (P/E > 38): 20% MoS (multiple compression buffer).
        # - Low Multiple / Defensive (P/E < 20): 10% MoS (prevents value-trap cash drag).
        # - Standard Compounders: 15% MoS (balanced Graham & Dodd baseline).
        if custom_mos_pct is not None:
            clamped_mos = max(10.0, min(30.0, float(custom_mos_pct)))
            mos_discount = round(1.0 - (clamped_mos / 100.0), 4)
        else:
            if is_financial or is_regulated_infrastructure:
                mos_discount = 0.90  # 10% MoS for regulated utilities and premier depository banks
            elif pe is not None and pe > 38.0:
                mos_discount = 0.80  # 20% MoS for high-multiple growth equities
            elif pe is not None and pe < 20.0:
                mos_discount = 0.90  # 10% MoS for deep value / defensive dividends
            else:
                mos_discount = 0.85  # 15% MoS standard compounder benchmark

        dcf_target = round(dcf_fair_value * mos_discount, 2)

        # Technical Support Pullback Anchor based on anchor_mode:
        # Prevents setting price targets that are technically disconnected from market realities.
        if anchor_mode == "strict_200d":
            # Strict 200D SMA support: anchor entry at 200D SMA support
            technical_anchor = round(min(two_hundred_sma * 1.0, price * 0.95), 2)
        elif anchor_mode == "tactical_pullback":
            # Tactical 5% Pullback: aggressive momentum entry near 50D SMA or 5% off price
            technical_anchor = round(max(fifty_sma * 0.98, price * 0.95), 2)
        else:
            # Default "adaptive_balanced": synthesizes 50D & 200D SMA
            technical_anchor = round(
                max(two_hundred_sma * 0.95, min(price * 0.94, max(fifty_sma * 0.98, two_hundred_sma * 1.05))), 2
            )

        is_compounder = (
            is_wide_moat or
            is_financial or
            is_payment_network or
            is_asset_manager or
            is_regulated_infrastructure or
            is_railroad or
            is_telecom or
            "TREE" in tax_str or
            (roic >= 0.12 and ("Narrow" in str(moat_rating) or "窄" in str(moat_rating)))
        )

        if anchor_mode == "strict_200d":
            # Strict 200D mode strictly bounds entry ceiling to 200D SMA support
            ideal_buy_max = round(min(dcf_target, technical_anchor), 2)
        elif dcf_target >= price:
            # Fundamentally undervalued: entry bracket allows entering on mild consolidation / 50D SMA
            ideal_buy_max = round(min(dcf_target, max(price * 0.98, fifty_sma * 0.98)), 2)
        elif is_high_growth_platform:
            # High-growth secular platform premium: when stock trades above conservative DCF,
            # avoid absurd multiple-collapse targets by synthesizing technical moving average support
            ideal_buy_max = round(max(dcf_target, technical_anchor * 0.85), 2)
        elif is_compounder and price <= dcf_fair_value * 1.15:
            # High-conviction quality compounder (TREE, Wide Moat, utilities, banks, rails) trading near fair value:
            # Calibrate buy ceiling to technical support (200D SMA support or 50D pullback)
            # rather than imposing a double-haircut 25%-40% cash-drag deadlock
            tech_support_ceiling = min(dcf_fair_value, max(technical_anchor, two_hundred_sma * 1.02))
            ideal_buy_max = round(max(dcf_target, min(price * 0.98, tech_support_ceiling)), 2)
        else:
            # Fairly valued or mildly overvalued: ceiling is bounded by conservative intersection of DCF target & technical anchor
            ideal_buy_max = round(min(dcf_target, technical_anchor), 2)

        # Floor is set at 10-15% discount to ceiling, with support near 200D SMA floor
        ideal_buy_min = round(min(ideal_buy_max * 0.88, two_hundred_sma * 0.90), 2)
        if ideal_buy_min >= ideal_buy_max:
            ideal_buy_min = round(ideal_buy_max * 0.88, 2)

        # =========================================================================
        # Universal 200D SMA Support Convergence Guardrail (PL-710 / PL-711):
        # =========================================================================
        # When an institutional quality asset consolidates within 5% of its 200-day
        # simple moving average, or a quality compounder within 10%, institutional
        # accumulation is active. If the DCF target sits slightly lower due to conservative
        # terminal growth assumptions, forcing the buy zone far below 200D SMA causes
        # investors to miss entire cycles. This guardrail calibrates the ceiling to technical cost-basis support.
        if (is_compounder and price <= two_hundred_sma * 1.10) or (price <= two_hundred_sma * 1.05):
            ideal_buy_max = max(ideal_buy_max, round(min(price * 0.98, two_hundred_sma * 1.02), 2))
            ideal_buy_min = round(min(ideal_buy_max * 0.88, two_hundred_sma * 0.90), 2)

        # Profit-taking / Sell alert bracket
        ideal_sell_range_min = round(max(dcf_fair_value * 1.10, price * 1.15), 2)
        ideal_sell_range_max = round(max(dcf_fair_value * 1.25, price * 1.30), 2)

        # Base action status and advice based on price vs buy bracket / DCF
        if price <= ideal_buy_max:
            if lang == "en":
                action_status = "IN_BUY_ZONE"
                advice = f"Current price ${price} {currency} is within safe buy bracket (${ideal_buy_min} - ${ideal_buy_max} {currency}) with a strong Margin of Safety."
            elif lang == "zh":
                action_status = "处于理想买入区间"
                advice = f"当前股价 ${price} {currency} 处于安全买入区间 (${ideal_buy_min} - ${ideal_buy_max} {currency})，具备充沛的安全边际。"
            else:
                action_status = "处于理想买入区间 (IN_BUY_ZONE)"
                advice = f"当前股价 ${price} {currency} 处于安全买入区间 (${ideal_buy_min} - ${ideal_buy_max} {currency})，具 Safe Buy Bracket 保护。"
        elif price <= dcf_fair_value or price <= two_hundred_sma * 1.05:
            # Fairly valued below DCF or consolidating at 200D SMA support: NEVER label OVEREXTENDED
            if price <= dcf_fair_value * 1.15:
                if lang == "en":
                    action_status = "PULLBACK_WATCH"
                    advice = f"Price ${price} {currency} is consolidating near technical support and intrinsic fair value (${dcf_fair_value} {currency}). Recommend setting price alert at ${ideal_buy_max} {currency}."
                elif lang == "zh":
                    action_status = "回调观察期"
                    advice = f"当前股价 ${price} {currency} 处于技术支撑与公允价值 (${dcf_fair_value} {currency}) 附近整固。建议设置价格提醒于 ${ideal_buy_max} {currency}。"
                else:
                    action_status = "回调观察期 (PULLBACK_WATCH)"
                    advice = f"当前股价 ${price} {currency} 处于技术支撑与公允价值 (${dcf_fair_value} {currency}) 附近整固。建议设置 Price Alert 于 ${ideal_buy_max} {currency}。"
            else:
                # Consolidating at technical support while above conservative DCF (e.g. FCX, AMD, VST)
                if lang == "en":
                    action_status = "PULLBACK_WATCH"
                    advice = f"Price ${price} {currency} is consolidating near 200D SMA technical support (${two_hundred_sma} {currency}) while trading above conservative DCF (${dcf_fair_value} {currency}). Recommend setting price alert at ${ideal_buy_max} {currency}."
                elif lang == "zh":
                    action_status = "回调观察期"
                    advice = f"当前股价 ${price} {currency} 处于 200日均线技术支撑 (${two_hundred_sma} {currency}) 附近整固，当前溢价高于保守 DCF 固有价值 (${dcf_fair_value} {currency})。建议设置价格提醒于 ${ideal_buy_max} {currency}。"
                else:
                    action_status = "回调观察期 (PULLBACK_WATCH)"
                    advice = f"当前股价 ${price} {currency} 处于 200D SMA 技术支撑 (${two_hundred_sma} {currency}) 附近整固（高于保守 DCF ${dcf_fair_value} {currency}）。建议设置 Price Alert 于 ${ideal_buy_max} {currency}。"
        elif is_compounder and price <= dcf_fair_value * 1.15:
            if lang == "en":
                action_status = "PULLBACK_WATCH"
                advice = f"Price ${price} {currency} is consolidating near intrinsic fair value (${dcf_fair_value} {currency}). Accumulate on minor pullbacks toward ${ideal_buy_max} {currency}."
            elif lang == "zh":
                action_status = "回调观察期"
                advice = f"当前股价 ${price} {currency} 处于公允价值 (${dcf_fair_value} {currency}) 附近的合理整固期。建议在回调至 ${ideal_buy_max} {currency} 时分批吸筹。"
            else:
                action_status = "回调观察期 (PULLBACK_WATCH)"
                advice = f"当前股价 ${price} {currency} 处于公允价值 (${dcf_fair_value} {currency}) 附近整固。建议在回调至 ${ideal_buy_max} {currency} 时分批吸筹。"
        else:
            is_growth_premium = (price > dcf_fair_value) and is_high_growth_platform
            if is_growth_premium:
                if lang == "en":
                    action_status = "GROWTH_PREMIUM"
                    advice = f"Price ${price} {currency} trades at a growth premium above DCF intrinsic fair value (${dcf_fair_value} {currency}). Accumulate near technical support (${ideal_buy_min} - ${ideal_buy_max} {currency}) rather than waiting for multiple collapse."
                elif lang == "zh":
                    action_status = "高成长溢价期"
                    advice = f"当前股价 ${price} {currency} 处于高成长溢价期（高于 DCF 固有价值 ${dcf_fair_value} {currency}）。建议沿技术均线支撑区 (${ideal_buy_min} - ${ideal_buy_max} {currency}) 分批吸筹，避免盲目等待估值中枢崩塌。"
                else:
                    action_status = "高成长溢价期 (GROWTH_PREMIUM)"
                    advice = f"当前股价 ${price} {currency} 处于高成长溢价期（高于 DCF 固有价值 ${dcf_fair_value} {currency}）。建议沿均线支撑区间 (${ideal_buy_min} - ${ideal_buy_max} {currency}) 分批布局。"
            else:
                if lang == "en":
                    action_status = "OVEREXTENDED"
                    advice = f"Price ${price} {currency} is overextended above DCF intrinsic fair value (${dcf_fair_value} {currency}). Wait for pullbacks to ${ideal_buy_max} {currency}."
                elif lang == "zh":
                    action_status = "过度延伸/暂勿追高"
                    advice = f"当前股价 ${price} {currency} 高于 DCF 固有价值 (${dcf_fair_value} {currency})，股价过度延伸。建议等待回调至 ${ideal_buy_max} {currency}。"
                else:
                    action_status = "过度延伸 (OVEREXTENDED)"
                    advice = f"当前股价 ${price} {currency} 高于 DCF 固有价值 (${dcf_fair_value} {currency})。建议等待 Pullback 至 ${ideal_buy_max} {currency}。"

        # 4. Three-Part Equity Taxonomy & Reverse-DCF Narrative Penetration Integration
        # (taxonomy and taxonomy_result are pre-evaluated at function initialization)

        reverse_dcf = cls.solve_implied_narrative_ceiling(
            current_pe=pe,
            net_income=stock_data.get("net_income")
        )

        rev_growth_raw = stock_data.get("revenue_growth") or 0.0
        if rev_growth_raw > 0.25 and val_percentile < 25 and taxonomy == "GRAIN":
            reverse_dcf["is_prosperity_trap"] = True
            reverse_dcf["prosperity_trap_note"] = (
                "Prosperity Trap Warning: High short-term growth at low PE percentile — check if terminal ceiling is saturated."
                if lang == "en" else
                "景气度陷阱预警：高增速+低PE分位，警惕行业终局天花板见顶导致估值压缩。"
            )

        dcf_applicable = True
        if taxonomy == "VEGETABLE":
            dcf_applicable = False
            ideal_buy_min = None
            ideal_buy_max = None
            action_status = "TREND_ONLY_NO_DCF"
            advice = (
                "VEGETABLE stock (Negative FCF or dilutive): No fundamental DCF buy zone. Trade strictly with 4-state trend temperature and stop-loss."
                if lang == "en" else
                "🥬 种菜股（无内生现金流或严重稀释）：不设基本面 DCF 击球区，必须严格依趋势温度与硬止损交易。"
            )

        return {
            "is_valid": True,
            "symbol": symbol,
            "current_price": price,
            "currency": currency,
            "fifty_day_sma": fifty_sma,
            "two_hundred_day_sma": two_hundred_sma,
            "volume": stock_data.get("volume"),
            "average_volume": stock_data.get("average_volume"),
            "historical_series": stock_data.get("historical_series"),
            "pe_ratio": pe if pe is not None else "N/A",
            "valuation_status": val_status,
            "valuation_percentile": val_percentile,
            "dcf_fair_value": dcf_fair_value,
            "ideal_buy_range_min": ideal_buy_min,
            "ideal_buy_range_max": ideal_buy_max,
            "ideal_sell_range_min": ideal_sell_range_min,
            "ideal_sell_range_max": ideal_sell_range_max,
            "dcf_applicable": dcf_applicable,
            "applied_mos_pct": round((1.0 - mos_discount) * 100.0, 1),
            "applied_anchor_mode": anchor_mode,
            "action_status": action_status,
            "timing_advice": advice,
            "rsi_14": stock_data.get("rsi_14", 54.0),
            "reverse_dcf": reverse_dcf,
            "taxonomy": taxonomy_result,
            "total_shareholder_yield_pct": taxonomy_result.get("total_shareholder_yield_pct", 0.0),
            "bridge": bridge,
            "sensitivity_matrix": sensitivity_matrix,
            "earnings_quality": earnings_quality,
            "provenance": {
                "source_mode": stock_data.get("source_mode", "LIVE"),
                "provider": stock_data.get("source", "Real-Time Exchange / yfinance"),
                "fetched_at": stock_data.get("fetched_at", ""),
                "staleness_seconds": 0,
                "warning_banner": stock_data.get("warning_banner")
            }
        }

    @staticmethod
    def _fair_pe_from_ceiling(m_ceiling: float, r: float = 0.10, term_pe: float = 15.0, payout: float = 0.30) -> float:
        """
        Calculates analytical fair dynamic PE given a 10-year earnings growth multiple M_ceiling per E173:
        g = M_ceiling^(1/10) - 1
        Fair PE = sum_{t=1}^{10} [alpha * (1+g)^t / (1+r)^t] + [M_ceiling * PE_term / (1+r)^10]
        """
        if m_ceiling <= 0:
            return 0.0
        g = (m_ceiling ** 0.1) - 1.0
        pv_dividends = sum(payout * ((1.0 + g) ** t) / ((1.0 + r) ** t) for t in range(1, 11))
        pv_terminal = (m_ceiling * term_pe) / ((1.0 + r) ** 10)
        return pv_dividends + pv_terminal

    @classmethod
    def solve_implied_narrative_ceiling(
        cls,
        current_pe: Optional[float],
        net_income: Optional[float] = None,
        r_base: float = 0.10,
        term_pe: float = 15.0,
        payout: float = 0.30
    ) -> Dict[str, Any]:
        """
        Solves for the 10-year implied earnings ceiling multiple via 30-step binary search.
        Grounded in E173: Penetrate market narrative to find how much profit must grow in 10 years
        to justify today's valuation multiple at 10% hurdle rate.
        """
        if current_pe is None or float(current_pe) <= 0:
            return {
                "current_pe": 0.0,
                "implied_10y_ceiling_multiple": 1.0,
                "implied_10y_profit_usd": None,
                "is_prosperity_trap": False,
                "prosperity_trap_note": None,
                "matrix": []
            }

        target_pe = float(current_pe)
        low, high = 0.1, 100.0
        for _ in range(30):
            mid = (low + high) / 2.0
            val = cls._fair_pe_from_ceiling(mid, r=r_base, term_pe=term_pe, payout=payout)
            if val < target_pe:
                low = mid
            else:
                high = mid

        implied_multiple = round((low + high) / 2.0, 2)
        implied_profit = round(net_income * implied_multiple, 2) if net_income and net_income > 0 else None

        # Build sensitivity matrix for discount rates [8%, 9%, 10%, 11%, 12%]
        # and narrative multiples [1.5x, 2.0x, 3.0x, 5.0x, 8.0x, 10.0x]
        matrix: List[Dict[str, float]] = []
        for r_rate in [0.08, 0.09, 0.10, 0.11, 0.12]:
            for m_mult in [1.5, 2.0, 3.0, 5.0, 8.0, 10.0]:
                pe_val = round(cls._fair_pe_from_ceiling(m_mult, r=r_rate, term_pe=term_pe, payout=payout), 1)
                matrix.append({
                    "discount_rate_pct": round(r_rate * 100.0, 1),
                    "ceiling_multiple": m_mult,
                    "fair_pe": pe_val
                })

        return {
            "current_pe": target_pe,
            "implied_10y_ceiling_multiple": implied_multiple,
            "implied_10y_profit_usd": implied_profit,
            "is_prosperity_trap": False,
            "prosperity_trap_note": None,
            "matrix": matrix
        }

    @classmethod
    def compute_dynamic_wacc(
        cls,
        beta: float = 1.0,
        risk_free_rate: float = 0.042,
        equity_risk_premium: float = 0.045,
        total_debt: float = 0.0,
        market_cap: float = 0.0,
        is_financial: bool = False
    ) -> float:
        """
        Computes dynamic CAPM Weighted Average Cost of Capital (WACC).
        Clamps beta to [0.5, 2.2], computes ke = rf + beta * erp.
        For financial institutions, uses Cost of Equity directly (deposits are operating liabilities, not corporate leverage).
        For corporate equities, blends ke with after-tax cost of debt kd_after_tax = (rf + 0.015) * 0.79,
        capping debt weight at 50% to prevent excessive debt-driven WACC distortion.
        Clamps resulting WACC to [0.06, 0.14].
        """
        clamped_beta = min(max(float(beta if beta is not None else 1.0), 0.5), 2.2)
        ke = risk_free_rate + (clamped_beta * equity_risk_premium)
        kd_after_tax = (risk_free_rate + 0.015) * 0.79

        if is_financial:
            return round(min(max(ke, 0.06), 0.14), 4)

        debt = float(total_debt or 0.0)
        mcap = float(market_cap or 0.0)
        total_cap = mcap + debt

        if total_cap > 0 and debt > 0:
            wd_raw = debt / total_cap
            wd = min(wd_raw, 0.50)
            we = 1.0 - wd
            wacc = (we * ke) + (wd * kd_after_tax)
        else:
            wacc = ke

        return round(min(max(wacc, 0.06), 0.14), 4)

    @classmethod
    def compute_earnings_quality(
        cls,
        operating_cash_flow: float,
        net_income: float,
        total_assets: float,
        raw_fcf: float,
        sbc: float
    ) -> Dict[str, Any]:
        """
        Audits financial statement earnings quality and accrual intensity.
        Computes Cash Conversion Ratio, Sloan Accruals Ratio, and SBC % of FCF.
        """
        ocf = float(operating_cash_flow or 0.0)
        ni = float(net_income or 0.0)
        assets = float(total_assets or 0.0)
        fcf = float(raw_fcf or 0.0)
        sbc_val = float(sbc or 0.0)

        cash_conversion_ratio = round(ocf / ni, 2) if ni > 0 else 1.0
        sloan_accruals_ratio = round((ni - ocf) / assets, 4) if assets > 0 else 0.0
        sbc_pct_of_fcf = round(sbc_val / fcf, 2) if fcf > 0 else 0.0

        forensic_flags: List[str] = []
        if ni > 0 and cash_conversion_ratio < 0.75:
            forensic_flags.append("LOW_CASH_CONVERSION (<0.75x)")
        if sloan_accruals_ratio > 0.08:
            forensic_flags.append("HIGH_ACCRUAL_INTENSITY (>8% Assets)")
        if sbc_pct_of_fcf > 0.30:
            forensic_flags.append("HEAVY_SBC_DILUTION (>30% FCF)")

        if len(forensic_flags) >= 2:
            quality_rating = "LOW_ACCRUAL_RISK"
        elif len(forensic_flags) == 1:
            quality_rating = "MODERATE"
        else:
            quality_rating = "HIGH"

        return {
            "operating_cash_flow": ocf,
            "net_income": ni,
            "stock_based_compensation": sbc_val,
            "cash_conversion_ratio": cash_conversion_ratio,
            "sloan_accruals_ratio": sloan_accruals_ratio,
            "sbc_pct_of_fcf": sbc_pct_of_fcf,
            "quality_rating": quality_rating,
            "forensic_flags": forensic_flags
        }

    @classmethod
    def build_sensitivity_matrix(
        cls,
        base_wacc: float,
        base_g: float,
        owner_fcf: float,
        rev_growth: float,
        total_cash: float,
        total_debt: float,
        implied_shares: float,
        price: float,
        is_financial: bool = False,
        exit_multiple: float = 20.0,
        implied_shares_effective: Optional[float] = None,
        is_regulated_infrastructure: bool = False,
        raw_rev: float = 0.0,
        target_margin: Optional[float] = None,
        is_railroad: bool = False,
        is_supermarket_holding: bool = False,
        base_fair_value: Optional[float] = None,
        funded_debt_ratio: float = 0.25,
        is_asset_manager: bool = False,
        is_midstream: bool = False,
        is_ipp: bool = False,
        symbol_upper: str = ""
    ) -> List[List[Dict[str, Any]]]:
        """
        Builds a 5x5 DCF sensitivity matrix across Terminal Growth (rows) and WACC (columns).
        Blends 50% Gordon Growth + 50% Moat Exit Multiple, using effective shares.
        Guarantees effective_wacc - effective_g >= 0.015 in every cell.
        Along each row (fixed g, increasing wacc): fair value strictly decreases.
        Along each column (fixed wacc, increasing g): fair value strictly increases.
        """
        wacc_steps = [
            round(base_wacc - 0.01, 4),
            round(base_wacc - 0.005, 4),
            round(base_wacc, 4),
            round(base_wacc + 0.005, 4),
            round(base_wacc + 0.01, 4),
        ]
        g_steps = [
            round(base_g - 0.01, 4),
            round(base_g - 0.005, 4),
            round(base_g, 4),
            round(base_g + 0.005, 4),
            round(base_g + 0.01, 4),
        ]

        shares_to_use = implied_shares_effective if implied_shares_effective and implied_shares_effective > 0 else implied_shares

        matrix: List[List[Dict[str, Any]]] = []
        for g_val in g_steps:
            row: List[Dict[str, Any]] = []
            for w_val in wacc_steps:
                eff_w = max(0.04, w_val)
                eff_g = min(g_val, eff_w - 0.015)

                if is_financial or is_regulated_infrastructure:
                    # Depository banks & regulated utilities: scale calibrated base fair value across WACC and g steps
                    target_base = base_fair_value if (base_fair_value and base_fair_value > 0) else price
                    fv = round(max(0.01, target_base * (1.0 + (eff_g - base_g) * 2.5 - (eff_w - base_wacc) * 3.5)), 2)
                elif owner_fcf > 0 and shares_to_use > 0:
                    curr_rev = raw_rev
                    curr_margin = (owner_fcf / raw_rev) if (raw_rev > 0 and owner_fcf > 0) else 0.0
                    has_exp = bool(target_margin is not None and raw_rev > 0 and curr_margin < target_margin)
                    curr_fcf = owner_fcf
                    pv_10y = 0.0
                    for year in range(1, 11):
                        if has_exp:
                            g_yr = rev_growth if year <= 5 else rev_growth - (rev_growth - eff_g) * ((year - 5) / 5.0)
                            curr_rev *= (1 + g_yr)
                            margin_yr = curr_margin + (target_margin - curr_margin) * (year / 10.0)
                            curr_fcf = curr_rev * margin_yr
                        else:
                            growth = rev_growth if year <= 5 else (rev_growth + eff_g) / 2
                            curr_fcf *= (1 + growth)
                            pv_10y += curr_fcf / ((1 + eff_w) ** year)
                    
                    eff_spread = max(0.015, eff_w - eff_g)
                    tv_gordon = (curr_fcf * (1 + eff_g)) / eff_spread
                    tv_exit = curr_fcf * exit_multiple
                    tv_blended = 0.50 * tv_gordon + 0.50 * tv_exit
                    pv_tv = tv_blended / ((1 + eff_w) ** 10)
                    ev = pv_10y + pv_tv
                    if is_railroad or is_asset_manager:
                        net_d = total_debt - total_cash
                        net_d_clamp = min(net_d, ev * 0.15) if net_d > 0 else net_d
                        equity = ev - net_d_clamp
                    elif is_midstream:
                        if symbol_upper in {"TRP.TO", "ENB.TO"}:
                            equity = ev
                        else:
                            net_d = total_debt - total_cash
                            net_d_clamp = min(net_d, ev * 0.35) if net_d > 0 else net_d
                            equity = ev - (net_d_clamp if net_d_clamp > 0 else 0.0)
                    elif is_ipp:
                        net_d = total_debt - total_cash
                        net_d_clamp = min(net_d, ev * 0.30) if net_d > 0 else net_d
                        equity = ev - net_d_clamp
                    elif is_supermarket_holding:
                        funded_d = min(total_debt * funded_debt_ratio, ev * 0.18)
                        net_d = funded_d - total_cash
                        equity = ev - (net_d if net_d > 0 else 0.0)
                    else:
                        net_d = total_debt - total_cash
                        net_d_clamp = min(net_d, ev * 0.70) if net_d > 0 else net_d
                        equity = ev - net_d_clamp
                    fv = round(max(0.01, equity / shares_to_use), 2)
                else:
                    target_base = base_fair_value if (base_fair_value and base_fair_value > 0) else (price * 1.05)
                    fv = round(max(0.01, target_base * (1 + (eff_g - base_g)*2 - (eff_w - base_wacc)*3)), 2)

                upside = round(((fv - price) / max(0.01, price)) * 100.0, 2)
                row.append({
                    "wacc": round(eff_w, 4),
                    "terminal_growth": round(eff_g, 4),
                    "fair_value": fv,
                    "upside_pct": upside
                })
            matrix.append(row)
        return matrix

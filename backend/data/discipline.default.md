# 纪律.md (Personal Investment Constitution for Prism Loop)

> "不是『我』在做投资，是这份『纪律.md』在做投资。我本人可以有表达欲、可以情绪化，但交易动作完全交给纪律执行。" — 投资宪法准则

## 1. 定战场 (Battlefield & Universe Constraints)
- allowed_exchanges: ["NYSE", "NASDAQ", "TSX"]
- min_market_cap_usd: 2000000000
- min_avg_daily_dollar_volume_usd: 15000000
- core_saa_target_pct: 80.0
- satellite_taa_target_pct: 20.0
- excluded_conditions:
  - "Taxonomy == VEGETABLE AND Trend_Temperature in [FREEZE, FLAT]"
  - "3Y_Share_Dilution_Pct > 8.0 AND FCF_TTM <= 0"

## 2. 定进出场信号 (Binary Factual Entry & Exit Signals)
### Tree & Grain Stocks (种树与种粮：基本面+估值驱动)
- entry_signal:
  - "Taxonomy in [TREE, GRAIN]"
  - "Current_Price <= PricingEngine.ideal_buy_max"
  - "Implied_10Y_Earnings_Ceiling_Multiple <= 5.0"
  - "Prosperity_Trap_Warning == False"
- exit_signal:
  - "Taxonomy == GRAIN AND Current_Price >= PricingEngine.ideal_sell_range_min"
  - "Bayesian_Falsification_Triggered == True"

### Trend / Momentum Trades (趋势动物模式：量价边际变化驱动)
- entry_signal:
  - "Trend_Temperature_Transition in ['FLAT_TO_WARM', 'WARM_TO_HOT']"
  - "Volume_Confirmation_20D_Ratio >= 1.15"
- exit_signal:
  - "Trend_Temperature_Transition in ['HOT_TO_FLAT', 'WARM_TO_FLAT']"
  - "Hard_Stop_Loss_Pct <= -7.0"
  - "Open_Profit_Drawback_From_Peak_Pct >= 20.0"

## 3. 定仓位管理与反破产铁律 (Position Sizing & Anti-Ruin Guardrails)
- satellite_trial_position_pct: 2.0
- satellite_max_position_pct: 4.0
- kelly_fraction_multiplier: 0.25
- dynamic_exposure_scaling: "Scale total TAA equity exposure by Watchlist_Right_Side_Breadth_Pct"
- four_horsemen_of_ruin_blocks:
  - block_counter_trend_averaging_down: true
  - block_missing_stop_loss_on_satellite: true
  - block_single_stock_above_max_pct: true
  - min_portfolio_effective_uncorrelated_bets: 5

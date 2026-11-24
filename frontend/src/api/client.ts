import {
  StockAnalysisResponse,
  MacroData,
  MacroDashboardResponse,
  RefreshRecommendationsResponse,
  SecFilingsResponse,
  DebateData,
  PortfolioCalculatePayload,
  PortfolioCalculateResponse,
  KellySizePayload,
  KellyResult,
  CentralBankSpeechMetadata,
  StockBucket,
  StockTrackingItem,
  SetBucketPayload,
  SellHoldingPayload,
  AddWatchlistPayload,
  StockBucketStatusResponse,
  PortfolioNewsAnalysisResponse,
  ApiStatusResponse,
  PushAlertConfigResponse,
  DiscordAlertDispatchResponse,
  ValuationAlertSettings,
  ResetValuationSettingsResponse,
  PriceAlertHistoryItem,
  TooBusyRegimeResponse,
  TooBusyCrossBorderDuet,
  TooBusyRebalancePayload,
  TooBusyRebalanceResponse,
  TooBusyDailyAdviceResponse,
  TooBusyBacktestResponse,
  TooBusyStrategyMode,
} from '../types';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

export async function requestJson<T>(
  url: string,
  init?: RequestInit,
  fallbackErrorMsg: string = 'API request failed'
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    let detail = res.statusText || fallbackErrorMsg;
    try {
      const errBody = await res.json();
      if (errBody && typeof errBody.detail === 'string') {
        detail = errBody.detail;
      }
    } catch {
      // Ignore non-JSON error body
    }
    throw new Error(`${fallbackErrorMsg}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

function jsonPostInit(body: unknown, signal?: AbortSignal): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  };
}

export async function fetchMacroAnalysis(
  lang: string = 'en',
  country: string = 'US',
  signal?: AbortSignal
): Promise<MacroData> {
  const url = `${getApiBaseUrl()}/api/macro?lang=${lang}&country=${country.toUpperCase()}`;
  return requestJson<MacroData>(url, { signal }, 'Macro API failed');
}

export async function fetchMacroDashboard(
  lang: string = 'en',
  forceRefresh: boolean = false,
  country: string = 'US',
  signal?: AbortSignal
): Promise<MacroDashboardResponse> {
  const url = `${getApiBaseUrl()}/api/macro/dashboard?lang=${lang}&force_refresh=${forceRefresh}&country=${country.toUpperCase()}`;
  return requestJson<MacroDashboardResponse>(url, { signal }, 'Macro Dashboard API failed');
}

export async function refreshRecommendationsApi(
  category?: string,
  offset: number = 0,
  lang: string = 'en',
  country: string = 'US',
  signal?: AbortSignal
): Promise<RefreshRecommendationsResponse> {
  const url = `${getApiBaseUrl()}/api/macro/recommendations/refresh`;
  return requestJson<RefreshRecommendationsResponse>(
    url,
    jsonPostInit({ category, offset, lang, country: country.toUpperCase() }, signal),
    'Refresh recommendations API failed'
  );
}

export async function fetchStockAnalysis(
  symbol: string,
  lang: string = 'en',
  signal?: AbortSignal,
  forceRefresh: boolean = false
): Promise<StockAnalysisResponse> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const url = `${getApiBaseUrl()}/api/stock/${normalizedSymbol}?lang=${lang}&force_refresh=${forceRefresh}`;
  return requestJson<StockAnalysisResponse>(url, { signal }, 'Stock API failed');
}

export async function fetchSecTextMining(
  symbol: string,
  lang: string = 'en',
  signal?: AbortSignal
): Promise<SecFilingsResponse> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const url = `${getApiBaseUrl()}/api/stock/${normalizedSymbol}/filings/mining?lang=${lang}`;
  return requestJson<SecFilingsResponse>(url, { signal }, 'SEC Text Mining API failed');
}

export async function runDebateApi(
  symbol: string,
  lang: string = 'en',
  signal?: AbortSignal,
  forceRefresh: boolean = false
): Promise<DebateData> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const url = `${getApiBaseUrl()}/api/debate/${normalizedSymbol}?lang=${lang}&force_refresh=${forceRefresh}`;
  return requestJson<DebateData>(url, { method: 'POST', signal }, 'Debate API failed');
}

export async function calculatePortfolioAllocation(
  payload: PortfolioCalculatePayload,
  signal?: AbortSignal
): Promise<PortfolioCalculateResponse> {
  const url = `${getApiBaseUrl()}/api/portfolio/calculate`;
  return requestJson<PortfolioCalculateResponse>(
    url,
    jsonPostInit(payload, signal),
    'Portfolio calculate failed'
  );
}

export async function calculateKellySizeApi(
  payload: KellySizePayload,
  signal?: AbortSignal
): Promise<KellyResult> {
  const url = `${getApiBaseUrl()}/api/portfolio/kelly-size`;
  return requestJson<KellyResult>(
    url,
    jsonPostInit(payload, signal),
    'Kelly sizing failed'
  );
}

export async function fetchWatchlistApi(
  bucket?: StockBucket | 'ALL',
  signal?: AbortSignal
): Promise<StockTrackingItem[]> {
  const query = bucket && bucket !== 'ALL' ? `?bucket=${bucket}` : '';
  const url = `${getApiBaseUrl()}/api/watchlist${query}`;
  return requestJson<StockTrackingItem[]>(url, { signal }, 'Watchlist API failed');
}

export async function fetchStockBucketStatusApi(
  symbol: string,
  signal?: AbortSignal
): Promise<StockBucketStatusResponse> {
  const url = `${getApiBaseUrl()}/api/watchlist/status/${encodeURIComponent(symbol.toUpperCase())}`;
  return requestJson<StockBucketStatusResponse>(url, { signal }, 'Stock bucket status API failed');
}

export async function setStockBucketApi(
  payload: SetBucketPayload,
  signal?: AbortSignal
): Promise<StockTrackingItem> {
  const url = `${getApiBaseUrl()}/api/watchlist/set-bucket`;
  return requestJson<StockTrackingItem>(
    url,
    jsonPostInit(payload, signal),
    'Set stock bucket failed'
  );
}

export async function sellHoldingApi(
  payload: SellHoldingPayload,
  signal?: AbortSignal
): Promise<ApiStatusResponse> {
  const url = `${getApiBaseUrl()}/api/watchlist/sell-holding`;
  return requestJson<ApiStatusResponse>(
    url,
    jsonPostInit(payload, signal),
    'Sell holding failed'
  );
}

export async function addWatchlistApi(
  payload: AddWatchlistPayload,
  signal?: AbortSignal
): Promise<StockTrackingItem> {
  const url = `${getApiBaseUrl()}/api/watchlist`;
  return requestJson<StockTrackingItem>(
    url,
    jsonPostInit(payload, signal),
    'Add watchlist failed'
  );
}

export async function deleteWatchlistApi(
  symbol: string,
  signal?: AbortSignal
): Promise<ApiStatusResponse> {
  const url = `${getApiBaseUrl()}/api/watchlist/${encodeURIComponent(symbol.toUpperCase())}`;
  return requestJson<ApiStatusResponse>(url, { method: 'DELETE', signal }, 'Delete watchlist failed');
}

export async function syncWatchlistTargetsApi(
  signal?: AbortSignal
): Promise<StockTrackingItem[]> {
  const url = `${getApiBaseUrl()}/api/watchlist/sync-targets`;
  return requestJson<StockTrackingItem[]>(url, { method: 'POST', signal }, 'Sync watchlist targets failed');
}

export async function fetchPushAlertConfig(
  signal?: AbortSignal
): Promise<PushAlertConfigResponse> {
  const url = `${getApiBaseUrl()}/api/push-alerts/config`;
  return requestJson<PushAlertConfigResponse>(url, { signal }, 'Fetch push alert config failed');
}

export async function savePushAlertConfig(
  discordWebhookUrl: string,
  isDiscordEnabled: boolean,
  signal?: AbortSignal
): Promise<PushAlertConfigResponse> {
  const url = `${getApiBaseUrl()}/api/push-alerts/config`;
  return requestJson<PushAlertConfigResponse>(
    url,
    jsonPostInit(
      {
        discord_webhook_url: discordWebhookUrl,
        is_discord_enabled: isDiscordEnabled,
      },
      signal
    ),
    'Save push alert config failed'
  );
}

export async function testDiscordWebhook(
  discordWebhookUrl: string,
  lang: string = 'en',
  signal?: AbortSignal
): Promise<DiscordAlertDispatchResponse> {
  const url = `${getApiBaseUrl()}/api/push-alerts/test`;
  return requestJson<DiscordAlertDispatchResponse>(
    url,
    jsonPostInit({ discord_webhook_url: discordWebhookUrl, lang }, signal),
    'Discord test failed'
  );
}

export async function dispatchMultiTypeDiscordAlert(
  discordWebhookUrl: string,
  alertType: string,
  lang: string = 'en',
  signal?: AbortSignal
): Promise<DiscordAlertDispatchResponse> {
  const url = `${getApiBaseUrl()}/api/push-alerts/dispatch`;
  return requestJson<DiscordAlertDispatchResponse>(
    url,
    jsonPostInit({ discord_webhook_url: discordWebhookUrl, alert_type: alertType, lang }, signal),
    'Dispatch alert failed'
  );
}

export async function testMacroDigestAlert(
  discordWebhookUrl: string,
  lang: string = 'en',
  signal?: AbortSignal
): Promise<DiscordAlertDispatchResponse> {
  return dispatchMultiTypeDiscordAlert(discordWebhookUrl, 'macro_digest', lang, signal);
}

export async function testBundledBuyAlert(
  discordWebhookUrl: string,
  lang: string = 'en',
  signal?: AbortSignal
): Promise<DiscordAlertDispatchResponse> {
  return dispatchMultiTypeDiscordAlert(discordWebhookUrl, 'bundled_buy', lang, signal);
}

export async function testSellDangerAlert(
  discordWebhookUrl: string,
  lang: string = 'en',
  signal?: AbortSignal
): Promise<DiscordAlertDispatchResponse> {
  return dispatchMultiTypeDiscordAlert(discordWebhookUrl, 'sell_danger', lang, signal);
}

export async function testGoldNuggetsAlert(
  discordWebhookUrl: string,
  lang: string = 'en',
  signal?: AbortSignal
): Promise<DiscordAlertDispatchResponse> {
  return dispatchMultiTypeDiscordAlert(discordWebhookUrl, 'gold_nuggets', lang, signal);
}

export async function fetchValuationAlertSettings(
  signal?: AbortSignal
): Promise<ValuationAlertSettings> {
  const url = `${getApiBaseUrl()}/api/settings/valuation-alerts`;
  return requestJson<ValuationAlertSettings>(url, { signal }, 'Fetch valuation settings failed');
}

export async function saveValuationAlertSettings(
  payload: ValuationAlertSettings,
  signal?: AbortSignal
): Promise<ValuationAlertSettings> {
  const url = `${getApiBaseUrl()}/api/settings/valuation-alerts`;
  return requestJson<ValuationAlertSettings>(
    url,
    jsonPostInit(payload, signal),
    'Failed to save valuation settings'
  );
}

export async function resetValuationAlertSettings(
  signal?: AbortSignal
): Promise<ResetValuationSettingsResponse> {
  const url = `${getApiBaseUrl()}/api/settings/valuation-alerts/reset`;
  return requestJson<ResetValuationSettingsResponse>(
    url,
    { method: 'POST', signal },
    'Failed to reset settings'
  );
}

export async function fetchAlertHistoryApi(
  signal?: AbortSignal
): Promise<PriceAlertHistoryItem[]> {
  const url = `${getApiBaseUrl()}/api/alerts/history`;
  return requestJson<PriceAlertHistoryItem[]>(url, { signal }, 'Fetch alert history failed');
}

export async function deleteAlertHistoryItemApi(
  alertId: number,
  signal?: AbortSignal
): Promise<ApiStatusResponse> {
  const url = `${getApiBaseUrl()}/api/alerts/history/${alertId}`;
  return requestJson<ApiStatusResponse>(url, { method: 'DELETE', signal }, 'Delete alert item failed');
}

export async function clearAllAlertHistoryApi(
  signal?: AbortSignal
): Promise<ApiStatusResponse> {
  const url = `${getApiBaseUrl()}/api/alerts/history`;
  return requestJson<ApiStatusResponse>(url, { method: 'DELETE', signal }, 'Clear all alert history failed');
}

export async function triggerPriceAlertCheckApi(
  signal?: AbortSignal
): Promise<ApiStatusResponse> {
  const url = `${getApiBaseUrl()}/api/alerts/trigger-check`;
  return requestJson<ApiStatusResponse>(url, { method: 'POST', signal }, 'Trigger price alert check failed');
}

export async function fetchCentralBankSpeeches(
  country?: 'US' | 'CA',
  signal?: AbortSignal
): Promise<CentralBankSpeechMetadata[]> {
  const query = country ? `?country=${country}` : '';
  const url = `${getApiBaseUrl()}/api/macro/speeches${query}`;
  return requestJson<CentralBankSpeechMetadata[]>(url, { signal }, 'Fetch speeches failed');
}

export function getSpeechStreamUrl(speechId: string, speed: number = 1.0, lang: string = 'en'): string {
  return `${getApiBaseUrl()}/api/macro/speech/${speechId}/stream?speed=${speed}&lang=${lang}`;
}

export async function fetchPortfolioNewsAnalysis(
  market: 'ALL' | 'US' | 'CA' = 'ALL',
  forceRefresh: boolean = false,
  signal?: AbortSignal
): Promise<PortfolioNewsAnalysisResponse> {
  const url = `${getApiBaseUrl()}/api/news-portfolio/analysis?market=${market}&force_refresh=${forceRefresh}`;
  return requestJson<PortfolioNewsAnalysisResponse>(
    url,
    { signal },
    'Fetch portfolio news analysis failed'
  );
}

export async function fetchTooBusyRegimeApi(
  strategyMode: TooBusyStrategyMode = 'TOO_BUSY_LONG_ONLY',
  market: 'US' | 'CA' = 'US',
  lang: string = 'en',
  forceRefresh: boolean = false,
  signal?: AbortSignal
): Promise<TooBusyRegimeResponse> {
  const url = `${getApiBaseUrl()}/api/too-busy/regime?strategy_mode=${strategyMode}&market=${market}&lang=${lang}&force_refresh=${forceRefresh}`;
  return requestJson<TooBusyRegimeResponse>(url, { signal, cache: 'no-store' }, 'Fetch Too Busy regime failed');
}

export async function fetchTooBusyCrossBorderDuetApi(
  usdCapital: number = 4000,
  cadCapital: number = 4000,
  lang: string = 'en',
  forceRefresh: boolean = false,
  signal?: AbortSignal
): Promise<TooBusyCrossBorderDuet> {
  const url = `${getApiBaseUrl()}/api/too-busy/cross-border-duet?usd_capital=${usdCapital}&cad_capital=${cadCapital}&lang=${lang}&force_refresh=${forceRefresh}`;
  return requestJson<TooBusyCrossBorderDuet>(url, { signal, cache: 'no-store' }, 'Fetch Cross-Border Duet failed');
}

export async function fetchTooBusyDailyAdviceApi(
  payload: TooBusyRebalancePayload,
  signal?: AbortSignal
): Promise<TooBusyDailyAdviceResponse> {
  const url = `${getApiBaseUrl()}/api/too-busy/daily-advice`;
  return requestJson<TooBusyDailyAdviceResponse>(
    url,
    { ...jsonPostInit(payload, signal), cache: 'no-store' },
    'Fetch Too Busy daily advice failed'
  );
}

export async function calculateTooBusyTicketApi(
  payload: TooBusyRebalancePayload,
  signal?: AbortSignal
): Promise<TooBusyRebalanceResponse> {
  const url = `${getApiBaseUrl()}/api/too-busy/rebalance-ticket`;
  return requestJson<TooBusyRebalanceResponse>(
    url,
    { ...jsonPostInit(payload, signal), cache: 'no-store' },
    'Calculate Too Busy rebalance ticket failed'
  );
}

export async function fetchTooBusyBacktestApi(
  horizon: '16Y_POST_2010' | '40Y_FULL_1986' | '5Y_RECENT' = '16Y_POST_2010',
  strategyMode: TooBusyStrategyMode = 'TOO_BUSY_LONG_ONLY',
  hysteresisPct: number = 10.0,
  lang: string = 'en',
  forceRefresh: boolean = false,
  signal?: AbortSignal
): Promise<TooBusyBacktestResponse> {
  const url = `${getApiBaseUrl()}/api/too-busy/backtest?horizon=${horizon}&strategy_mode=${strategyMode}&hysteresis_pct=${hysteresisPct}&lang=${lang}&force_refresh=${forceRefresh}`;
  return requestJson<TooBusyBacktestResponse>(url, { signal, cache: 'no-store' }, 'Fetch Too Busy backtest failed');
}

import { StockAnalysisResponse, MacroData, CentralBankSpeechMetadata } from '../types';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

export async function fetchMacroAnalysis(lang: string = "en", country: string = "US", signal?: AbortSignal): Promise<MacroData> {
  const url = `${getApiBaseUrl()}/api/macro?lang=${lang}&country=${country.toUpperCase()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Macro API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchMacroDashboard(lang: string = "en", forceRefresh: boolean = false, country: string = "US", signal?: AbortSignal): Promise<any> {
  const url = `${getApiBaseUrl()}/api/macro/dashboard?lang=${lang}&force_refresh=${forceRefresh}&country=${country.toUpperCase()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Macro Dashboard API failed: ${res.statusText}`);
  return res.json();
}

export async function refreshRecommendationsApi(category?: string, offset: number = 0, lang: string = "en", country: string = "US", signal?: AbortSignal): Promise<any> {
  const url = `${getApiBaseUrl()}/api/macro/recommendations/refresh`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, offset, lang, country: country.toUpperCase() }),
    signal
  });
  if (!res.ok) throw new Error(`Refresh recommendations API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchStockAnalysis(symbol: string, lang: string = "en", signal?: AbortSignal): Promise<StockAnalysisResponse> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const url = `${getApiBaseUrl()}/api/stock/${normalizedSymbol}?lang=${lang}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Stock API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSecTextMining(symbol: string, lang: string = "en", signal?: AbortSignal): Promise<any> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const url = `${getApiBaseUrl()}/api/stock/${normalizedSymbol}/filings/mining?lang=${lang}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`SEC Text Mining API failed: ${res.statusText}`);
  return res.json();
}

export async function runDebateApi(symbol: string, lang: string = "en", signal?: AbortSignal): Promise<any> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const url = `${getApiBaseUrl()}/api/debate/${normalizedSymbol}?lang=${lang}`;
  const res = await fetch(url, { method: 'POST', signal });
  if (!res.ok) throw new Error(`Debate API failed: ${res.statusText}`);
  return res.json();
}

export async function calculatePortfolioAllocation(payload: any, signal?: AbortSignal): Promise<any> {
  const url = `${getApiBaseUrl()}/api/portfolio/calculate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal
  });
  if (!res.ok) throw new Error(`Portfolio calculate failed: ${res.statusText}`);
  return res.json();
}

export async function calculateKellySizeApi(payload: any, signal?: AbortSignal): Promise<any> {
  const url = `${getApiBaseUrl()}/api/portfolio/kelly-size`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal
  });
  if (!res.ok) throw new Error(`Kelly sizing failed: ${res.statusText}`);
  return res.json();
}

export async function fetchWatchlistApi(signal?: AbortSignal): Promise<any[]> {
  const url = `${getApiBaseUrl()}/api/watchlist`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Watchlist API failed: ${res.statusText}`);
  return res.json();
}

export async function addWatchlistApi(payload: any, signal?: AbortSignal): Promise<any> {
  const url = `${getApiBaseUrl()}/api/watchlist`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal
  });
  if (!res.ok) throw new Error(`Add watchlist failed: ${res.statusText}`);
  return res.json();
}

export async function deleteWatchlistApi(symbol: string, signal?: AbortSignal): Promise<any> {
  const url = `${getApiBaseUrl()}/api/watchlist/${symbol.toUpperCase()}`;
  const res = await fetch(url, { method: 'DELETE', signal });
  if (!res.ok) throw new Error(`Delete watchlist failed: ${res.statusText}`);
  return res.json();
}

export async function syncWatchlistTargetsApi(signal?: AbortSignal): Promise<any> {
  const url = `${getApiBaseUrl()}/api/watchlist/sync-targets`;
  const res = await fetch(url, { method: 'POST', signal });
  if (!res.ok) throw new Error(`Sync watchlist targets failed: ${res.statusText}`);
  return res.json();
}

export async function fetchPushAlertConfig(): Promise<any> {
  const url = `${getApiBaseUrl()}/api/push-alerts/config`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch push alert config failed: ${res.statusText}`);
  return res.json();
}

export async function savePushAlertConfig(discordWebhookUrl: string, isDiscordEnabled: boolean): Promise<any> {
  const url = `${getApiBaseUrl()}/api/push-alerts/config`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      discord_webhook_url: discordWebhookUrl,
      is_discord_enabled: isDiscordEnabled
    })
  });
  if (!res.ok) throw new Error(`Save push alert config failed: ${res.statusText}`);
  return res.json();
}

export async function testDiscordWebhook(discordWebhookUrl: string, lang: string = 'en'): Promise<any> {
  const url = `${getApiBaseUrl()}/api/push-alerts/test`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discord_webhook_url: discordWebhookUrl, lang })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Discord test failed');
  }
  return res.json();
}

export async function dispatchMultiTypeDiscordAlert(discordWebhookUrl: string, alertType: string, lang: string = 'en'): Promise<any> {
  const url = `${getApiBaseUrl()}/api/push-alerts/dispatch`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discord_webhook_url: discordWebhookUrl, alert_type: alertType, lang })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Dispatch alert failed');
  }
  return res.json();
}

export async function testMacroDigestAlert(discordWebhookUrl: string, lang: string = 'en'): Promise<any> {
  return dispatchMultiTypeDiscordAlert(discordWebhookUrl, 'macro_digest', lang);
}

export async function testBundledBuyAlert(discordWebhookUrl: string, lang: string = 'en'): Promise<any> {
  return dispatchMultiTypeDiscordAlert(discordWebhookUrl, 'bundled_buy', lang);
}

export async function testSellDangerAlert(discordWebhookUrl: string, lang: string = 'en'): Promise<any> {
  return dispatchMultiTypeDiscordAlert(discordWebhookUrl, 'sell_danger', lang);
}

export async function testGoldNuggetsAlert(discordWebhookUrl: string, lang: string = 'en'): Promise<any> {
  return dispatchMultiTypeDiscordAlert(discordWebhookUrl, 'gold_nuggets', lang);
}

export async function fetchValuationAlertSettings(): Promise<any> {
  const url = `${getApiBaseUrl()}/api/settings/valuation-alerts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch valuation settings failed: ${res.statusText}`);
  return res.json();
}

export async function saveValuationAlertSettings(payload: {
  global_mos_pct: number;
  technical_anchor_mode: string;
  ticker_overrides: Record<string, { target_buy?: number | null; target_sell?: number | null }>;
}): Promise<any> {
  const url = `${getApiBaseUrl()}/api/settings/valuation-alerts`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to save valuation settings');
  }
  return res.json();
}

export async function resetValuationAlertSettings(): Promise<any> {
  const url = `${getApiBaseUrl()}/api/settings/valuation-alerts/reset`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to reset settings');
  }
  return res.json();
}

export async function fetchAlertHistoryApi(): Promise<any[]> {
  const url = `${getApiBaseUrl()}/api/alerts/history`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch alert history failed: ${res.statusText}`);
  return res.json();
}

export async function deleteAlertHistoryItemApi(alertId: number): Promise<any> {
  const url = `${getApiBaseUrl()}/api/alerts/history/${alertId}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Delete alert item failed: ${res.statusText}`);
  return res.json();
}

export async function clearAllAlertHistoryApi(): Promise<any> {
  const url = `${getApiBaseUrl()}/api/alerts/history`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Clear all alert history failed: ${res.statusText}`);
  return res.json();
}

export async function triggerPriceAlertCheckApi(): Promise<any> {
  const url = `${getApiBaseUrl()}/api/alerts/trigger-check`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error(`Trigger price alert check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCentralBankSpeeches(country?: 'US' | 'CA', signal?: AbortSignal): Promise<CentralBankSpeechMetadata[]> {
  const query = country ? `?country=${country}` : '';
  const url = `${getApiBaseUrl()}/api/macro/speeches${query}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Fetch speeches failed: ${res.statusText}`);
  return res.json();
}

export function getSpeechStreamUrl(speechId: string, speed: number = 1.0, lang: string = 'en'): string {
  return `${getApiBaseUrl()}/api/macro/speech/${speechId}/stream?speed=${speed}&lang=${lang}`;
}



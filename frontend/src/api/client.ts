import { StockAnalysisResponse, MacroData } from '../types';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

export async function fetchMacroAnalysis(lang: string = "en"): Promise<MacroData> {
  const url = `${getApiBaseUrl()}/api/macro?lang=${lang}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Macro API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchMacroDashboard(lang: string = "en", forceRefresh: boolean = false): Promise<any> {
  const url = `${getApiBaseUrl()}/api/macro/dashboard?lang=${lang}&force_refresh=${forceRefresh}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Macro Dashboard API failed: ${res.statusText}`);
  return res.json();
}

export async function refreshRecommendationsApi(category?: string, offset: number = 0, lang: string = "en"): Promise<any> {
  const url = `${getApiBaseUrl()}/api/macro/recommendations/refresh`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, offset, lang })
  });
  if (!res.ok) throw new Error(`Refresh recommendations API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchStockAnalysis(symbol: string, lang: string = "en"): Promise<StockAnalysisResponse> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const url = `${getApiBaseUrl()}/api/stock/${normalizedSymbol}?lang=${lang}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Stock API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchWatchlistApi(): Promise<any[]> {
  const url = `${getApiBaseUrl()}/api/watchlist`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Watchlist API failed: ${res.statusText}`);
  return res.json();
}

export async function addWatchlistApi(payload: any): Promise<any> {
  const url = `${getApiBaseUrl()}/api/watchlist`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Add watchlist failed: ${res.statusText}`);
  return res.json();
}

export async function deleteWatchlistApi(symbol: string): Promise<any> {
  const url = `${getApiBaseUrl()}/api/watchlist/${symbol.toUpperCase()}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Delete watchlist failed: ${res.statusText}`);
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

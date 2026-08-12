import { StockAnalysisResponse, MacroData } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function fetchMacroAnalysis(lang: string = "en"): Promise<MacroData> {
  const res = await fetch(`${API_BASE_URL}/api/macro?lang=${lang}`);
  if (!res.ok) throw new Error(`Macro API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchMacroDashboard(lang: string = "en", forceRefresh: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/macro/dashboard?lang=${lang}&force_refresh=${forceRefresh}`);
  if (!res.ok) throw new Error(`Macro Dashboard API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchStockAnalysis(symbol: string, lang: string = "en"): Promise<StockAnalysisResponse> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const res = await fetch(`${API_BASE_URL}/api/stock/${normalizedSymbol}?lang=${lang}`);
  if (!res.ok) throw new Error(`Stock API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchPushAlertConfig(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/push-alerts/config`);
  if (!res.ok) throw new Error(`Fetch push alert config failed: ${res.statusText}`);
  return res.json();
}

export async function savePushAlertConfig(discordWebhookUrl: string, isDiscordEnabled: boolean): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/push-alerts/config`, {
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
  const res = await fetch(`${API_BASE_URL}/api/push-alerts/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discord_webhook_url: discordWebhookUrl, lang })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Discord test notification failed');
  }
  return res.json();
}

export async function testMacroDigestAlert(discordWebhookUrl: string, lang: string = 'en'): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/push-alerts/test/macro-digest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discord_webhook_url: discordWebhookUrl, lang })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Macro digest test alert failed');
  }
  return res.json();
}

export async function testBundledBuyAlert(discordWebhookUrl: string, lang: string = 'en'): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/push-alerts/test/bundled-buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discord_webhook_url: discordWebhookUrl, lang })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Bundled buy test alert failed');
  }
  return res.json();
}

export async function testSellDangerAlert(discordWebhookUrl: string, lang: string = 'en'): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/push-alerts/test/sell-danger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discord_webhook_url: discordWebhookUrl, lang })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Sell danger test alert failed');
  }
  return res.json();
}

export async function testGoldNuggetsAlert(discordWebhookUrl: string, lang: string = 'en'): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/push-alerts/test/gold-nuggets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discord_webhook_url: discordWebhookUrl, lang })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Gold nuggets test alert failed');
  }
  return res.json();
}


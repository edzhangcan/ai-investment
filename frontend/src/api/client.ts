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

import { StockAnalysisResponse, MacroData } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function fetchMacroAnalysis(): Promise<MacroData> {
  const res = await fetch(`${API_BASE_URL}/api/macro`);
  if (!res.ok) throw new Error(`Macro API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchMacroDashboard(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/macro/dashboard`);
  if (!res.ok) throw new Error(`Macro Dashboard API failed: ${res.statusText}`);
  return res.json();
}

export async function fetchStockAnalysis(symbol: string): Promise<StockAnalysisResponse> {

  const normalizedSymbol = symbol.trim().toUpperCase();
  const res = await fetch(`${API_BASE_URL}/api/stock/${normalizedSymbol}`);
  if (!res.ok) throw new Error(`Stock API failed: ${res.statusText}`);
  return res.json();
}

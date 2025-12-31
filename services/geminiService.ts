
import { GoogleGenAI } from "@google/genai";
import { Asset } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ExchangeRateResult {
  usd: number;
  jpy: number;
  sources?: { uri: string; title: string }[];
}

export const fetchExchangeRates = async (): Promise<ExchangeRateResult> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "What are the current USD to TWD and JPY to TWD exchange rates? Please provide the numbers as a JSON-like object: {usd: number, jpy: number}.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const text = response.text || "";
    const usdMatch = text.match(/usd["\s:]+([\d.]+)/i);
    const jpyMatch = text.match(/jpy["\s:]+([\d.]+)/i);
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        uri: chunk.web?.uri || "",
        title: chunk.web?.title || "來源"
      })) || [];
    
    return {
      usd: usdMatch ? parseFloat(usdMatch[1]) : 32.5,
      jpy: jpyMatch ? parseFloat(jpyMatch[1]) : 0.21,
      sources
    };
  } catch (error: any) {
    // 處理 429 額度耗盡或其他 API 錯誤
    console.warn("Gemini API Error (Rate Limit/Quota): Using fallback values.");
    return { usd: 32.5, jpy: 0.21, sources: [] };
  }
};

export const fetchStockPrices = async (assets: Asset[]): Promise<Record<string, number>> => {
  const stockAssets = assets.filter(a => a.type !== 'CASH');
  if (stockAssets.length === 0) return {};

  const tickers = stockAssets.map(a => a.symbol).join(', ');
  const ai = getAI();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Find current real-time stock prices for these tickers: ${tickers}. Return only a JSON object: {"TICKER": price}.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        return {};
      }
    }
    return {};
  } catch (error) {
    console.warn("Gemini API Error for stock prices. Values will remain unchanged.");
    return {};
  }
};

export const editImageWithAI = async (base64Data: string, prompt: string, mimeType: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("AI Image error:", error);
    return null;
  }
};

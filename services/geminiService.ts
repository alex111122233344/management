
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Asset } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches the latest USD/TWD and JPY/TWD exchange rates using Google Search.
 */
export const fetchExchangeRates = async (): Promise<{ usd: number; jpy: number }> => {
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
    const usdMatch = text.match(/usd["\s:]+(\d+\.\d+)/i);
    const jpyMatch = text.match(/jpy["\s:]+(\d+\.\d+)/i);
    
    return {
      usd: usdMatch ? parseFloat(usdMatch[1]) : 32.5,
      jpy: jpyMatch ? parseFloat(jpyMatch[1]) : 0.21
    };
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return { usd: 32.5, jpy: 0.21 };
  }
};

/**
 * Fetches the current prices for a list of stock assets using Gemini Search.
 */
export const fetchStockPrices = async (assets: Asset[]): Promise<Record<string, number>> => {
  const stockAssets = assets.filter(a => a.type !== 'CASH');
  if (stockAssets.length === 0) return {};

  const tickers = stockAssets.map(a => a.symbol).join(', ');
  const ai = getAI();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find the current real-time stock prices for these tickers: ${tickers}. Return only a JSON object where keys are tickers and values are current prices in their native currency. Example: {"AAPL": 150.25, "2330": 600.00}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (error) {
    console.error("Error fetching stock prices:", error);
    return {};
  }
};

/**
 * Edits an image based on user prompt using Gemini 2.5 Flash Image.
 */
export const editImageWithAI = async (base64Image: string, prompt: string, mimeType: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing image with AI:", error);
    return null;
  }
};

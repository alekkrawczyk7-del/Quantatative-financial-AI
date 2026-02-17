import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to get client
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Fast Market News (Gemini 2.5 Flash Lite)
export const getMarketUpdates = async (): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: "Generate 3 concise, high-impact financial news headlines for a professional trading terminal. No emojis. Format as bullet points.",
    });
    return response.text || "Market data unavailable.";
  } catch (error) {
    console.error("News fetch error:", error);
    return "SYSTEM ERROR: UNABLE TO FETCH MARKET DATA";
  }
};

// 2. Quantitative Prediction (Gemini 3 Pro + Thinking)
export const generateQuantPrediction = async (query: string): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction: "You are a senior quantitative analyst for a top-tier hedge fund. Provide deep, data-driven analysis. Use professional financial terminology. No emojis. Focus on risk, alpha generation, and macro factors.",
        thinkingConfig: {
          thinkingBudget: 32768, 
        }
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Quant analysis error:", error);
    return "SYSTEM ERROR: QUANT MODEL CONNECTION FAILED";
  }
};

// 3. Deal Sourcing (Gemini 3 Flash + Google Search)
export const findPrivateEquityDeals = async (sector: string): Promise<AnalysisResult> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find emerging private companies in the ${sector} sector suitable for acquisition or venture capital investment. Focus on companies with recent growth news or funding rounds. List them with brief rationales.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[];
    
    return {
      text: response.text || "No deals found.",
      groundingChunks: groundingChunks
    };
  } catch (error) {
    console.error("Deal sourcing error:", error);
    return { text: "SYSTEM ERROR: SEARCH TOOL MALFUNCTION" };
  }
};

// 4. Resource Mapping (Gemini 2.5 Flash + Google Maps)
export const findResources = async (resourceType: string, lat?: number, lng?: number): Promise<AnalysisResult> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Locate major ${resourceType} mines, rigs, or reserves. Provide key details for each location.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: lat && lng ? {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        } : undefined
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[];

    return {
      text: response.text || "No locations found.",
      groundingChunks: groundingChunks
    };
  } catch (error) {
    console.error("Map resource error:", error);
    return { text: "SYSTEM ERROR: GEOSPATIAL MODULE FAILURE" };
  }
};

// 5. Data/Chart Analysis (Gemini 3 Pro + Vision)
export const analyzeChartImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for simplicity in this demo context, or handle dynamic types
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: "Analyze the provided financial chart or data. Look for technical patterns (Head and Shoulders, Double Top, etc.) and trend lines. Provide a professional assessment."
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Vision analysis error:", error);
    return "SYSTEM ERROR: VISION MODEL FAILURE";
  }
};

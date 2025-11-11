import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini APIキー
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!apiKey && import.meta.env.MODE === 'production') {
  console.warn('Gemini API key is not set. OCR functionality will not work.');
}

// Gemini AI インスタンスの初期化
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Gemini Pro Vision モデル（画像解析用）
export const getVisionModel = () => {
  if (!genAI) {
    throw new Error('Gemini API is not initialized. Please set VITE_GEMINI_API_KEY.');
  }
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

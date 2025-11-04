import type { FoodItem } from '../types';

/** ローカルストレージのキー */
const STORAGE_KEY = 'food-expiry-items';

/**
 * ローカルストレージから全食品データを取得
 */
export const loadFoodItems = (): FoodItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as FoodItem[];
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
    return [];
  }
};

/**
 * ローカルストレージに全食品データを保存
 */
export const saveFoodItems = (items: FoodItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('データの保存に失敗しました:', error);
    throw error;
  }
};

/**
 * 一意なIDを生成（タイムスタンプ + ランダム文字列）
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * 現在日時をISO形式で取得
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

import { useState, useEffect, useCallback } from 'react';
import type { FoodItem, FoodItemInput } from '../types';
import {
  loadFoodItems,
  saveFoodItems,
  generateId,
  getCurrentTimestamp,
} from '../utils/storage';
import { calculateDaysRemaining } from '../utils/dateUtils';

/**
 * 食品データを管理するカスタムフック
 */
export const useFoodItems = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 初期データの読み込み
  useEffect(() => {
    const loadedItems = loadFoodItems();
    setItems(loadedItems);
    setLoading(false);
  }, []);

  // データが変更されたらローカルストレージに保存
  useEffect(() => {
    if (!loading) {
      saveFoodItems(items);
    }
  }, [items, loading]);

  /**
   * 新しい食品を追加
   */
  const addItem = useCallback((input: FoodItemInput) => {
    const newItem: FoodItem = {
      id: generateId(),
      ...input,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    setItems((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  /**
   * 食品情報を更新
   */
  const updateItem = useCallback((id: string, input: FoodItemInput) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...input, updatedAt: getCurrentTimestamp() }
          : item
      )
    );
  }, []);

  /**
   * 食品を削除
   */
  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /**
   * 期限が近い順にソート
   */
  const sortedItems = [...items].sort((a, b) => {
    const daysA = calculateDaysRemaining(a.expiryDate);
    const daysB = calculateDaysRemaining(b.expiryDate);
    return daysA - daysB;
  });

  /**
   * 指定日数以内に期限が来る食品を取得
   */
  const getExpiringItems = useCallback(
    (days: number) => {
      return items.filter((item) => {
        const remaining = calculateDaysRemaining(item.expiryDate);
        return remaining >= 0 && remaining <= days;
      });
    },
    [items]
  );

  return {
    items: sortedItems,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getExpiringItems,
  };
};

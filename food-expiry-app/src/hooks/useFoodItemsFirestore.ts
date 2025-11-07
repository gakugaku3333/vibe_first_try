import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { FoodItem, FoodItemInput } from '../types';
import { db } from '../lib/firebase';
import { calculateDaysRemaining } from '../utils/dateUtils';

/**
 * Firestoreを使った食品データ管理カスタムフック
 */
export const useFoodItemsFirestore = (user: User | null, groupId: string = 'default') => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestoreからリアルタイムでデータを取得
  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // ユーザーのグループIDに基づいてクエリを作成
    const q = query(
      collection(db, 'foodItems'),
      where('groupId', '==', groupId),
      where('userId', '==', user.uid)
    );

    // リアルタイム監視
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const foodItems: FoodItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          foodItems.push({
            id: doc.id,
            name: data.name,
            expiryType: data.expiryType,
            expiryDate: data.expiryDate,
            memo: data.memo,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          });
        });
        setItems(foodItems);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore取得エラー:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, groupId]);

  /**
   * 新しい食品を追加
   */
  const addItem = useCallback(
    async (input: FoodItemInput) => {
      if (!user) {
        throw new Error('ログインが必要です');
      }

      try {
        const docRef = await addDoc(collection(db, 'foodItems'), {
          ...input,
          userId: user.uid,
          groupId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return {
          id: docRef.id,
          ...input,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as FoodItem;
      } catch (error) {
        console.error('追加エラー:', error);
        throw error;
      }
    },
    [user, groupId]
  );

  /**
   * 食品情報を更新
   */
  const updateItem = useCallback(
    async (id: string, input: FoodItemInput) => {
      if (!user) {
        throw new Error('ログインが必要です');
      }

      try {
        const docRef = doc(db, 'foodItems', id);
        await updateDoc(docRef, {
          ...input,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('更新エラー:', error);
        throw error;
      }
    },
    [user]
  );

  /**
   * 食品を削除
   */
  const deleteItem = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('ログインが必要です');
      }

      try {
        await deleteDoc(doc(db, 'foodItems', id));
      } catch (error) {
        console.error('削除エラー:', error);
        throw error;
      }
    },
    [user]
  );

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

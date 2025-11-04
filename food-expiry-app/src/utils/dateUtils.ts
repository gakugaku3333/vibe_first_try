import type { ExpiryStatus, ColorType } from '../types';

/**
 * 2つの日付の差を日数で計算
 * @param dateStr 期限日（YYYY-MM-DD形式）
 * @returns 残り日数（負の数は期限切れ）
 */
export const calculateDaysRemaining = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 時刻をリセット

  const expiryDate = new Date(dateStr);
  expiryDate.setHours(0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * 残り日数に基づいて色の種類を決定
 * @param daysRemaining 残り日数
 * @returns 色の種類
 */
export const getColorType = (daysRemaining: number): ColorType => {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 3) return 'danger';
  if (daysRemaining <= 7) return 'warning';
  return 'normal';
};

/**
 * 期限の状態情報を取得
 * @param expiryDate 期限日（YYYY-MM-DD形式）
 * @returns 期限状態情報
 */
export const getExpiryStatus = (expiryDate: string): ExpiryStatus => {
  const daysRemaining = calculateDaysRemaining(expiryDate);
  const colorType = getColorType(daysRemaining);

  let message = '';
  if (daysRemaining < 0) {
    message = `期限切れ（${Math.abs(daysRemaining)}日前）`;
  } else if (daysRemaining === 0) {
    message = '今日まで';
  } else if (daysRemaining === 1) {
    message = '明日まで';
  } else {
    message = `あと${daysRemaining}日`;
  }

  return {
    daysRemaining,
    colorType,
    message,
  };
};

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 */
export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * 日付文字列を日本語形式に変換
 * @param dateStr YYYY-MM-DD形式の日付
 * @returns YYYY年MM月DD日形式の文字列
 */
export const formatDateJa = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

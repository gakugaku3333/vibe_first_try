/**
 * 食品の期限の種類
 */
export type ExpiryType = '賞味期限' | '消費期限';

/**
 * 食品情報の型定義
 */
export interface FoodItem {
  /** 一意なID（自動生成） */
  id: string;
  /** 食品名 */
  name: string;
  /** 期限の種類（賞味期限または消費期限） */
  expiryType: ExpiryType;
  /** 期限日（YYYY-MM-DD形式） */
  expiryDate: string;
  /** メモ（任意） */
  memo?: string;
  /** 登録日時（自動生成） */
  createdAt: string;
  /** 更新日時（自動生成） */
  updatedAt: string;
}

/**
 * 食品登録フォームの入力データ型
 */
export interface FoodItemInput {
  name: string;
  expiryType: ExpiryType;
  expiryDate: string;
  memo?: string;
}

/**
 * 期限までの残り日数に基づく色の種類
 */
export type ColorType = 'danger' | 'warning' | 'normal' | 'expired';

/**
 * 期限の状態情報
 */
export interface ExpiryStatus {
  /** 残り日数 */
  daysRemaining: number;
  /** 表示用の色の種類 */
  colorType: ColorType;
  /** 表示用のメッセージ */
  message: string;
}

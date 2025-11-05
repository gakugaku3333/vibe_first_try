import { useState, useEffect } from 'react';
import type { FoodItemInput, ExpiryType } from '../types';
import { getTodayString } from '../utils/dateUtils';
import { OCRScanner } from './OCRScanner';

interface FoodFormProps {
  /** 編集モードの場合、初期値を設定 */
  initialData?: FoodItemInput;
  /** 送信時のコールバック */
  onSubmit: (data: FoodItemInput) => void;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
  /** 送信ボタンのラベル */
  submitLabel?: string;
}

/**
 * 食品登録・編集フォームコンポーネント
 */
export const FoodForm: React.FC<FoodFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = '登録',
}) => {
  const [name, setName] = useState('');
  const [expiryType, setExpiryType] = useState<ExpiryType>('賞味期限');
  const [expiryDate, setExpiryDate] = useState(getTodayString());
  const [memo, setMemo] = useState('');
  const [showOCRScanner, setShowOCRScanner] = useState(false);

  // 初期データがある場合（編集モード）、フォームに反映
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setExpiryType(initialData.expiryType);
      setExpiryDate(initialData.expiryDate);
      setMemo(initialData.memo || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!name.trim()) {
      alert('食品名を入力してください');
      return;
    }
    if (!expiryDate) {
      alert('期限日を入力してください');
      return;
    }

    onSubmit({
      name: name.trim(),
      expiryType,
      expiryDate,
      memo: memo.trim() || undefined,
    });

    // フォームをリセット（新規登録の場合のみ）
    if (!initialData) {
      setName('');
      setExpiryType('賞味期限');
      setExpiryDate(getTodayString());
      setMemo('');
    }
  };

  const handleOCRResult = (result: {
    date: string | null;
    expiryType: ExpiryType | null;
    rawText: string;
  }) => {
    // 日付が検出された場合
    if (result.date) {
      setExpiryDate(result.date);
      alert(`期限日を自動入力しました: ${result.date}`);
    } else {
      alert('期限日を検出できませんでした。手動で入力してください。');
    }

    // 期限の種類が検出された場合
    if (result.expiryType) {
      setExpiryType(result.expiryType);
    }

    setShowOCRScanner(false);
  };

  return (
    <>
      {showOCRScanner && (
        <div className="ocr-modal">
          <div className="ocr-modal-content">
            <OCRScanner
              onResult={handleOCRResult}
              onClose={() => setShowOCRScanner(false)}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="food-form">
        {/* OCRスキャナー起動ボタン */}
        <div className="ocr-trigger">
          <button
            type="button"
            className="btn btn-ocr"
            onClick={() => setShowOCRScanner(true)}
          >
            📷 ラベルを撮影して自動入力
          </button>
          <p className="ocr-hint">期限日と期限の種類を自動で読み取ります</p>
        </div>

        <div className="form-divider">または手動で入力</div>

        <div className="form-group">
          <label htmlFor="name">
            食品名 <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 牛乳"
            required
          />
        </div>

      <div className="form-group">
        <label htmlFor="expiryType">
          期限の種類 <span className="required">*</span>
        </label>
        <select
          id="expiryType"
          value={expiryType}
          onChange={(e) => setExpiryType(e.target.value as ExpiryType)}
          required
        >
          <option value="賞味期限">賞味期限</option>
          <option value="消費期限">消費期限</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="expiryDate">
          期限日 <span className="required">*</span>
        </label>
        <input
          type="date"
          id="expiryDate"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="memo">メモ（任意）</label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="例: 冷蔵庫の左側"
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            キャンセル
          </button>
        )}
      </div>
    </form>
    </>
  );
};

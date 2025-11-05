import type { ExpiryType } from '../types';

/**
 * OCRで抽出されたテキストから日付を検出する
 */
export const extractDate = (text: string): string | null => {
  // 改行や余分な空白を削除
  const cleanText = text.replace(/\s+/g, '');

  // 日付パターンのリスト（日本語の食品ラベルでよく見られる形式）
  const datePatterns = [
    // YYYY年MM月DD日, YYYY.MM.DD, YYYY/MM/DD, YYYY-MM-DD
    /(\d{4})[年./\-](\d{1,2})[月./\-](\d{1,2})/,
    // YY年MM月DD日, YY.MM.DD, YY/MM/DD
    /(\d{2})[年./\-](\d{1,2})[月./\-](\d{1,2})/,
    // YYYYMMDD（8桁の数字）
    /(\d{4})(\d{2})(\d{2})/,
  ];

  for (const pattern of datePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      let year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);

      // 2桁の年を4桁に変換（20XX年代と仮定）
      if (year < 100) {
        year += 2000;
      }

      // 日付の妥当性チェック
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        // YYYY-MM-DD形式に変換
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Date オブジェクトで日付が有効か確認
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj.getTime())) {
          return dateStr;
        }
      }
    }
  }

  return null;
};

/**
 * OCRで抽出されたテキストから期限の種類を検出する
 */
export const extractExpiryType = (text: string): ExpiryType | null => {
  const lowerText = text.toLowerCase().replace(/\s+/g, '');

  // 「消費期限」のパターン
  if (
    lowerText.includes('消費期限') ||
    lowerText.includes('消費') ||
    lowerText.includes('しょうひ') ||
    lowerText.includes('syohi')
  ) {
    return '消費期限';
  }

  // 「賞味期限」のパターン
  if (
    lowerText.includes('賞味期限') ||
    lowerText.includes('賞味') ||
    lowerText.includes('しょうみ') ||
    lowerText.includes('syoumi') ||
    lowerText.includes('bestbefore')
  ) {
    return '賞味期限';
  }

  // デフォルトは賞味期限
  return '賞味期限';
};

/**
 * OCR結果からすべての候補日付を抽出
 * （複数の日付がある場合、最も近い未来の日付を返す）
 */
export const extractBestDate = (text: string): string | null => {
  const lines = text.split('\n');
  const dates: string[] = [];

  // 各行から日付を抽出
  for (const line of lines) {
    const date = extractDate(line);
    if (date) {
      dates.push(date);
    }
  }

  if (dates.length === 0) {
    return null;
  }

  // 複数の日付がある場合、最も近い未来の日付を選択
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDates = dates.filter((dateStr) => {
    const date = new Date(dateStr);
    return date >= today;
  });

  if (futureDates.length > 0) {
    // 昇順にソートして最も近い日付を返す
    futureDates.sort();
    return futureDates[0];
  }

  // 未来の日付がない場合、最新の日付を返す
  dates.sort();
  return dates[dates.length - 1];
};

/**
 * OCR結果をデバッグ用にフォーマット
 */
export const formatOCRResult = (text: string): string => {
  return text
    .split('\n')
    .map((line, index) => `${index + 1}: ${line}`)
    .join('\n');
};

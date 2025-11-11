import { useState, useRef } from 'react';
import type { ExpiryType } from '../types';
import { getVisionModel } from '../lib/gemini';

interface OCRResult {
  date: string | null;
  expiryType: ExpiryType | null;
  rawText: string;
}

interface OCRScannerProps {
  onResult: (result: OCRResult) => void;
  onClose: () => void;
}

/**
 * ファイルをBase64文字列に変換
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // data:image/jpeg;base64, の部分を除去
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * OCRスキャナーコンポーネント
 * Gemini AIで画像から期限日と期限の種類を自動抽出
 */
export const OCRScanner: React.FC<OCRScannerProps> = ({ onResult, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [debugText, setDebugText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProgress(30);
    setDebugText('');

    // プレビュー画像を表示
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // Gemini Vision モデルを取得
      const model = getVisionModel();

      setProgress(50);

      // 画像をBase64に変換
      const base64Image = await fileToBase64(file);

      setProgress(70);

      // Geminiに画像解析を依頼
      const prompt = `この食品ラベルの画像から以下の情報を抽出してください：

1. 賞味期限または消費期限の日付
2. 期限の種類（「賞味期限」または「消費期限」）

【重要】
- 日付は YYYY-MM-DD 形式で返してください
- 年が2桁の場合は20XXとして解釈してください
- 日付が見つからない場合は null を返してください
- 期限の種類が明記されていない場合は「賞味期限」としてください

必ず以下のJSON形式で回答してください（他の説明は不要）：
{"date": "YYYY-MM-DD", "expiryType": "賞味期限" or "消費期限", "rawText": "画像から読み取ったテキスト全体"}

例：
{"date": "2024-12-31", "expiryType": "賞味期限", "rawText": "賞味期限 2024年12月31日"}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: file.type,
            data: base64Image
          }
        }
      ]);

      setProgress(90);

      const response = await result.response;
      const text = response.text();

      setDebugText(`Gemini Response:\n${text}`);

      // JSONレスポンスをパース
      let parsedData: { date: string | null; expiryType: ExpiryType | null; rawText: string };

      try {
        // JSON部分を抽出（マークダウンのコードブロックを除去）
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON形式のレスポンスが見つかりません');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // パースに失敗した場合はnullを返す
        parsedData = {
          date: null,
          expiryType: null,
          rawText: text,
        };
      }

      setProgress(100);

      // 結果を親コンポーネントに渡す
      onResult({
        date: parsedData.date,
        expiryType: parsedData.expiryType,
        rawText: parsedData.rawText || text,
      });
    } catch (error) {
      console.error('画像解析エラー:', error);
      if (error instanceof Error && error.message.includes('Gemini API is not initialized')) {
        alert('Gemini APIキーが設定されていません。環境変数 VITE_GEMINI_API_KEY を設定してください。');
      } else {
        alert('画像の読み取りに失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="ocr-scanner">
      <div className="ocr-scanner-header">
        <h3>📷 ラベルを撮影</h3>
        <button className="btn-close" onClick={onClose} aria-label="閉じる">
          ✕
        </button>
      </div>

      <div className="ocr-scanner-body">
        {!isProcessing && !previewUrl && (
          <div className="ocr-instructions">
            <p>食品ラベルの期限日が写るように撮影してください</p>
            <ul>
              <li>明るい場所で撮影</li>
              <li>ラベルが平らになるように</li>
              <li>文字がはっきり見えるように</li>
            </ul>
          </div>
        )}

        {previewUrl && (
          <div className="ocr-preview">
            <img src={previewUrl} alt="撮影画像" />
          </div>
        )}

        {isProcessing && (
          <div className="ocr-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p>読み取り中... {progress}%</p>
          </div>
        )}

        {debugText && (
          <details className="ocr-debug">
            <summary>読み取り結果の詳細</summary>
            <pre>{debugText}</pre>
          </details>
        )}
      </div>

      <div className="ocr-scanner-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          className="btn btn-primary btn-large"
          onClick={handleCameraClick}
          disabled={isProcessing}
        >
          {isProcessing ? '処理中...' : previewUrl ? '📷 再撮影' : '📷 撮影する'}
        </button>
        <button className="btn btn-secondary" onClick={onClose}>
          キャンセル
        </button>
      </div>
    </div>
  );
};

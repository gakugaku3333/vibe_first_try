import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import type { ExpiryType } from '../types';
import { extractBestDate, extractExpiryType, formatOCRResult } from '../utils/ocrUtils';

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
 * OCRスキャナーコンポーネント
 * 画像から期限日と期限の種類を自動抽出
 */
export const OCRScanner: React.FC<OCRScannerProps> = ({ onResult, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [debugText, setDebugText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setDebugText('');

    // プレビュー画像を表示
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // Tesseract.jsでOCR実行
      const result = await Tesseract.recognize(file, 'jpn', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      setDebugText(formatOCRResult(text));

      // 日付と期限の種類を抽出
      const date = extractBestDate(text);
      const expiryType = extractExpiryType(text);

      // 結果を親コンポーネントに渡す
      onResult({
        date,
        expiryType,
        rawText: text,
      });
    } catch (error) {
      console.error('OCR処理エラー:', error);
      alert('画像の読み取りに失敗しました。もう一度お試しください。');
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

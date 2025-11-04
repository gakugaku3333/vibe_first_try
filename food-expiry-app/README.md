# 🍱 食品期限管理アプリ

スマホで使える、シンプルな食品の賞味期限・消費期限管理アプリケーション（MVP版）

## 📱 主な機能

### ✅ 実装済み機能

1. **食品情報の登録**
   - 食品名、期限の種類（賞味期限/消費期限）、期限日、メモを登録
   - 手入力で簡単に登録可能

2. **一覧表示画面**
   - 期限が近い順に自動ソート
   - 期限までの残り日数を表示
   - 日数に応じた色分け
     - 🔴 赤：3日以内（危険）
     - 🟠 オレンジ：7日以内（警告）
     - 🟢 緑：それ以上（正常）
     - ⚪ グレー：期限切れ

3. **編集・削除機能**
   - 登録済み食品の情報を編集
   - 不要な食品を削除

4. **通知機能**
   - アプリ起動時に、7日以内に期限が来る食品を通知バナーで表示

5. **PWA対応**
   - スマホのホーム画面に追加してアプリのように使える
   - オフラインでも動作

### 🔮 将来追加予定の機能

- **OCR機能**：食品ラベルを撮影して期限日を自動抽出
- **LINE Notify連携**：1日1回、期限が近い食品をLINEで通知
- **バーコード読み取り**：商品情報の自動入力
- **カテゴリ分け**：食品をカテゴリ別に管理

## 🚀 使い方

### 開発環境での起動

1. **依存関係のインストール**
```bash
cd food-expiry-app
npm install
```

2. **開発サーバーの起動**
```bash
npm run dev
```

3. **ブラウザでアクセス**
   - ローカル: http://localhost:5173
   - スマホから: 同じネットワーク上のPCのIPアドレスでアクセス（例: http://192.168.1.10:5173）

### 本番環境へのデプロイ

1. **ビルド**
```bash
npm run build
```

2. **デプロイ先の例**
   - **Vercel**（推奨）
     ```bash
     npm install -g vercel
     vercel
     ```
   - **Netlify**
     ```bash
     npm install -g netlify-cli
     netlify deploy
     ```
   - **GitHub Pages**
     - リポジトリの Settings > Pages から設定

### スマホにインストール

PWAとしてスマホにインストールできます：

1. スマホのブラウザでアプリのURLを開く
2. ブラウザのメニューから「ホーム画面に追加」を選択
3. ホーム画面にアイコンが追加され、アプリのように使える

## 📁 プロジェクト構成

```
food-expiry-app/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── FoodForm.tsx        # 食品登録・編集フォーム
│   │   ├── FoodList.tsx        # 食品リスト
│   │   ├── FoodListItem.tsx    # 食品リストの1アイテム
│   │   └── NotificationBanner.tsx  # 通知バナー
│   ├── hooks/               # カスタムフック
│   │   └── useFoodItems.ts     # 食品データ管理フック
│   ├── types/               # TypeScript型定義
│   │   └── index.ts            # 共通型定義
│   ├── utils/               # ユーティリティ関数
│   │   ├── dateUtils.ts        # 日付計算関連
│   │   └── storage.ts          # ローカルストレージ管理
│   ├── App.tsx              # メインアプリケーション
│   ├── App.css              # アプリケーションスタイル
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
├── public/                  # 静的ファイル
│   └── icon.svg                # アプリアイコン
├── vite.config.ts           # Vite設定（PWA設定含む）
├── package.json             # 依存関係
└── README.md                # このファイル
```

## 🛠️ 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **PWA**: vite-plugin-pwa
- **データ保存**: LocalStorage（将来的にはIndexedDBも検討）
- **スタイリング**: Pure CSS（カスタムプロパティとFlexbox）

## 📝 コードの理解（初心者向け）

### Step 1: データ構造（`src/types/index.ts`）

食品情報をどのように表現するかを定義しています。

```typescript
export interface FoodItem {
  id: string;              // 一意なID
  name: string;            // 食品名
  expiryType: ExpiryType;  // 賞味期限 or 消費期限
  expiryDate: string;      // 期限日（YYYY-MM-DD）
  memo?: string;           // メモ（任意）
  createdAt: string;       // 登録日時
  updatedAt: string;       // 更新日時
}
```

### Step 2: データ保存（`src/utils/storage.ts`）

ブラウザのLocalStorageを使ってデータを保存・読み込みします。

- `loadFoodItems()`: データを読み込む
- `saveFoodItems(items)`: データを保存する
- `generateId()`: 一意なIDを生成する

### Step 3: 日付計算（`src/utils/dateUtils.ts`）

期限までの残り日数を計算し、色分けのロジックを実装しています。

- `calculateDaysRemaining(date)`: 残り日数を計算
- `getColorType(days)`: 残り日数から色を決定
- `getExpiryStatus(date)`: 期限の状態情報を取得

### Step 4: データ管理（`src/hooks/useFoodItems.ts`）

Reactのカスタムフックで、食品データの追加・更新・削除を管理します。

- `addItem(data)`: 新しい食品を追加
- `updateItem(id, data)`: 食品情報を更新
- `deleteItem(id)`: 食品を削除
- `getExpiringItems(days)`: 期限が近い食品を取得

### Step 5: UIコンポーネント（`src/components/`）

- **FoodForm**: 食品登録・編集フォーム
- **FoodList**: 食品リスト全体
- **FoodListItem**: 食品リストの1行
- **NotificationBanner**: 期限が近い食品の通知

### Step 6: メインアプリ（`src/App.tsx`）

すべてのコンポーネントを組み合わせて、アプリ全体を構築します。

## 🔧 拡張方法

### OCR機能を追加する

1. **Tesseract.jsをインストール**
```bash
npm install tesseract.js
```

2. **OCRコンポーネントを作成**
```typescript
// src/components/OCRScanner.tsx
import Tesseract from 'tesseract.js';

export const OCRScanner = () => {
  const handleImageUpload = async (file: File) => {
    const { data: { text } } = await Tesseract.recognize(file, 'jpn');
    // テキストから日付を抽出する処理
  };
  // ...
};
```

3. **日付抽出のロジックを実装**
   - 正規表現で「2025/01/15」などのパターンを検索
   - 「賞味」「消費」のキーワードを検索

### LINE Notify連携を追加する

1. **LINE Notify APIトークンを取得**
   - https://notify-bot.line.me/ でトークンを発行

2. **通知機能を実装**
```typescript
// src/utils/lineNotify.ts
export const sendLineNotification = async (message: string) => {
  const token = 'YOUR_LINE_NOTIFY_TOKEN';
  await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `message=${encodeURIComponent(message)}`,
  });
};
```

3. **定期実行の仕組みを追加**
   - バックエンド（Vercel Functions、Cloudflare Workers等）で定期実行
   - または、アプリ起動時に前回通知からの経過時間をチェック

## 🤝 貢献

バグ報告や機能要望は、Issuesでお知らせください。

## 📄 ライセンス

MIT License

## 👤 作者

- あなたの名前

---

このアプリは初心者でも理解しやすいように、シンプルな構成で実装されています。
コードを読みながら、少しずつ機能を追加していってください！

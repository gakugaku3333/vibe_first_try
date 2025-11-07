# 🔥 Firebase セットアップガイド

このアプリで複数人でデータを共有するには、Firebaseの設定が必要です。

## 📋 必要な作業

1. Firebaseプロジェクトの作成
2. Authentication（認証）の有効化
3. Firestore Database（データベース）の作成
4. 環境変数の設定
5. デプロイ

所要時間：約10〜15分

---

## Step 1: Firebaseプロジェクトの作成

### 1-1. Firebase Consoleにアクセス

https://console.firebase.google.com/ を開く

### 1-2. プロジェクトを作成

1. 「プロジェクトを追加」をクリック
2. プロジェクト名を入力（例: `food-expiry-app`）
3. 「続行」をクリック
4. Google Analyticsは任意（不要なら無効化してOK）
5. 「プロジェクトを作成」をクリック

---

## Step 2: Authenticationの設定

### 2-1. Authenticationを有効化

1. 左メニューから「Authentication」を選択
2. 「始める」をクリック

### 2-2. Googleログインを有効化

1. 「Sign-in method」タブを開く
2. 「Google」を選択
3. 「有効にする」をONにする
4. サポートメールを選択
5. 「保存」をクリック

---

## Step 3: Firestoreの設定

### 3-1. Firestoreを作成

1. 左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. ロケーションを選択（`asia-northeast1` (東京) 推奨）
4. **「テストモードで開始」**を選択
5. 「有効にする」をクリック

### 3-2. セキュリティルールの設定

「ルール」タブを開き、以下のルールに変更：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // ログインユーザーのみアクセス可能
    match /foodItems/{itemId} {
      allow read, write: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

「公開」をクリックして保存

---

## Step 4: Web アプリの設定

### 4-1. アプリを追加

1. プロジェクト概要画面（⚙️歯車マークの隣）に戻る
2. 「</> Web」アイコンをクリック
3. アプリのニックネームを入力（例: `food-expiry-web`）
4. 「Firebase Hosting も設定」はチェック不要
5. 「アプリを登録」をクリック

### 4-2. 設定情報をコピー

表示される設定情報（`firebaseConfig`）をコピーしておく

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

---

## Step 5: 環境変数の設定

### 5-1. .envファイルを作成

`food-expiry-app/.env` ファイルを作成（`.env.example`をコピー）：

```bash
cd food-expiry-app
cp .env.example .env
```

### 5-2. Firebaseの設定を入力

`.env` ファイルを開き、Step 4-2でコピーした値を入力：

```env
VITE_FIREBASE_API_KEY=AIzaSy...（apiKey の値）
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com（authDomain の値）
VITE_FIREBASE_PROJECT_ID=your-project（projectId の値）
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com（storageBucket の値）
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789（messagingSenderId の値）
VITE_FIREBASE_APP_ID=1:123456789:web:...（appId の値）
```

**⚠️ 重要**: `.env` ファイルは Git にコミットしないでください（`.gitignore` に含まれています）

---

## Step 6: GitHub Pages用の環境変数設定

### 6-1. GitHubリポジトリの設定

1. https://github.com/gakugaku3333/vibe_first_try にアクセス
2. 「Settings」タブを開く
3. 左メニューから「Secrets and variables」→「Actions」を選択

### 6-2. Secretsを追加

「New repository secret」をクリックして、以下を1つずつ追加：

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...`（あなたのAPIキー） |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `VITE_FIREBASE_APP_ID` | `1:123456789:web:...` |

### 6-3. GitHub Actionsワークフローの更新

`.github/workflows/deploy.yml` の Build ステップに環境変数を追加する必要があります（すでに設定済みの場合はスキップ）。

---

## Step 7: ローカルでテスト

```bash
cd food-expiry-app
npm run dev
```

ブラウザで http://localhost:5173 を開き：

1. Googleログインボタンが表示されることを確認
2. ログインできることを確認
3. 食品を追加できることを確認

---

## Step 8: デプロイ

### 8-1. GitHub Actionsで自動デプロイ

変更をコミット＆プッシュすると、自動的にデプロイされます：

```bash
git add -A
git commit -m "feat: Firebase設定を追加"
git push origin claude/food-expiry-management-app-011CUoUPZawtHKhFeGdeg1yG
```

### 8-2. デプロイ確認

1. GitHubの「Actions」タブで進行状況を確認
2. デプロイ完了後、公開URLにアクセス：
   https://gakugaku3333.github.io/vibe_first_try/

---

## 🎯 使い方

### グループの作成と共有

1. ログイン後、「グループ設定」をクリック
2. 🎲ボタンで新しいグループIDを生成
3. 生成されたIDを家族や友人に共有
4. 共有された人も同じIDを入力すれば、同じリストを共有できます

### データの同期

- 誰かが食品を追加すると、全員のデバイスにリアルタイムで反映されます
- インターネット接続があれば、どのデバイスからでも同じデータにアクセスできます

---

## 🔧 トラブルシューティング

### ログインできない

- Firebase Console で Authentication が有効になっているか確認
- Google ログインが有効になっているか確認
- ブラウザのプライベートモード/シークレットモードを解除

### データが表示されない

- Firestore Database が作成されているか確認
- セキュリティルールが正しく設定されているか確認
- ブラウザのコンソールでエラーがないか確認

### デプロイ後にエラーが出る

- GitHub Secrets がすべて正しく設定されているか確認
- `.env` ファイルがローカルに存在し、正しい値が入っているか確認

---

## 📚 参考リンク

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

何か問題があれば、お気軽にお問い合わせください！

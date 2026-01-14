<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Movie2Manual - 動画からマニュアル作成ツール

画面収録動画をアップロードするだけで、AIが自動的に操作手順を抽出し、わかりやすいマニュアルを生成するWebアプリケーションです。

**デモサイト**: [movie2-manual.vercel.app](https://movie2-manual.vercel.app)

## 📋 概要

Movie2Manualは、画面収録動画から操作マニュアルを自動生成するツールです。業務フローの説明やソフトウェアの使い方を動画で録画するだけで、AIが手順を分析し、スクリーンショット付きの詳細なマニュアルを作成します。

### 主な特徴

- 🎥 **動画から自動抽出**: 画面収録動画をアップロードするだけで、操作手順を自動で抽出
- 🤖 **AIによる分析**: Google Gemini 3.0 Flashを使用した高精度な手順分析
- 📝 **詳細なステップ生成**: 各操作を個別のステップとして記録し、初心者でも再現可能なマニュアルを作成
- 📄 **Word形式でエクスポート**: 生成されたマニュアルをWord形式（.docx）でダウンロード可能
- 🌐 **ブラウザで完結**: バックエンド不要。すべての処理がクライアントサイドで実行されます
- ✏️ **編集機能**: 生成されたマニュアルをブラウザ上で直接編集可能

## 🚀 使い方

1. **動画をアップロード**
   - 画面収録動画（MP4, MOV, WebM形式）をドラッグ&ドロップまたはファイル選択でアップロード

2. **AIが分析**
   - 動画からフレームを抽出し、AIが操作手順を分析します（数分かかる場合があります）

3. **マニュアルを確認・編集**
   - 生成されたマニュアルを確認し、必要に応じてタイトルや説明文を編集

4. **Word形式でエクスポート**
   - 「Wordへ出力」ボタンをクリックして、Word形式（.docx）でダウンロード

## 🛠️ 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite 6
- **AI**: Google Gemini 3.0 Flash
- **スタイリング**: Tailwind CSS
- **Word出力**: docx.js
- **デプロイ**: Vercel

## 📦 セットアップ

### 必要な環境

- Node.js (推奨: 18以上)
- npm または yarn

### インストール手順

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/sinoda1114/movie2Manual.git
   cd movie2Manual
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **環境変数を設定**
   
   `.env.local`ファイルを作成し、Gemini APIキーを設定してください：
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   
   APIキーの取得方法:
   - [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
   - APIキーを生成してコピー

4. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

5. **ブラウザでアクセス**
   - http://localhost:3000 を開く

## 🚢 デプロイ

### Vercelへのデプロイ

1. **Vercelアカウントでログイン**
   - [Vercel](https://vercel.com) にアクセス

2. **プロジェクトをインポート**
   - GitHubリポジトリをVercelに接続

3. **環境変数を設定**
   - Vercelダッシュボード → Settings → Environment Variables
   - `GEMINI_API_KEY` を追加（Production, Preview, Developmentすべてに設定）

4. **デプロイ**
   - 自動的にデプロイが開始されます

### ビルドコマンド

```bash
npm run build
```

ビルド成果物は `dist` ディレクトリに出力されます。

## 📝 対応動画形式

- MP4
- MOV
- WebM

### 推奨設定

- **動画の長さ**: 1〜5分程度が最適（長い動画でも処理可能ですが、処理時間がかかります）
- **解像度**: 720p以上推奨
- **フレームレート**: 30fps推奨

## ⚙️ 動作の仕組み

1. **フレーム抽出**: 動画から2.5秒ごとにフレームを抽出（クライアントサイドで実行）
2. **AI分析**: 抽出されたフレームをGemini 3.0 Flashに送信し、操作手順を分析
3. **マニュアル生成**: AIが各操作を個別のステップとして識別し、タイトルと説明文を生成
4. **編集・エクスポート**: 生成されたマニュアルを編集し、Word形式でエクスポート

## 🔧 開発

### プロジェクト構造

```
movie2Manual/
├── components/          # Reactコンポーネント
│   ├── UploadArea.tsx  # 動画アップロードエリア
│   ├── ProcessingStatus.tsx  # 処理状況表示
│   └── ManualEditor.tsx  # マニュアル編集画面
├── services/           # ビジネスロジック
│   ├── videoUtils.ts   # 動画処理
│   ├── geminiService.ts  # Gemini API連携
│   └── exportService.ts  # Wordエクスポート
├── types.ts            # TypeScript型定義
└── App.tsx             # メインアプリケーション
```

### スクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - 本番用ビルド
- `npm run preview` - ビルド成果物のプレビュー

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。大きな変更を加える場合は、まずイシューを開いて変更内容を議論してください。

## 📧 お問い合わせ

問題や質問がある場合は、GitHubのイシューでお知らせください。

---

**注意**: このアプリケーションはクライアントサイドでAPIキーを使用します。本番環境では、APIキーを適切に保護し、使用制限を設定することを推奨します。

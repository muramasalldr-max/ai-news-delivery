# AIニュース自動配信ツール

最新のAI関連ニュースを毎朝自動で収集・要約し、Gmail に届けるツールです。

RSSフィードから記事を取得し、Gemini API が日本語で要約。生成したページを GitHub Pages に公開し、毎朝そのURLをメールで通知します。すべて無料枠で動作します。

---

## 1. プロジェクト概要

### 目的
AI分野の情報は更新が速く、毎日自分でサイトを巡回するのは手間がかかる。  
主要な AI ニュースを自動で拾い、読みやすい形にまとめて毎朝 Gmail に届けることで、情報収集を自動化する。

### 配信イメージ

```
件名: 【AIニュース】2026年4月25日

今日のAIニュースをまとめました。

👉 https://muramasalldr-max.github.io/ai-news-delivery/

5記事 ／ 4メディア
```

メールに記載されたURLをタップすると、当日分のニュースページが開く。

---

## 2. 仕組み（4パーツ）

| # | パーツ | 役割 | このツールでは |
|---|---|---|---|
| 1 | トリガー | いつ動かすか | GitHub Actions（cron） |
| 2 | ソース元 | どこから情報を取るか | RSS フィード（4メディア） |
| 3 | 実行場所 | どこで処理するか | GitHub Actions |
| 4 | 配信先 | どこに届けるか | GitHub Pages（ページ公開）+ Gmail（URL通知） |

---

## 3. システム構成

```
[パーツ1] トリガー
  GitHub Actions cron（毎朝 7:00 JST）
  または workflow_dispatch（手動実行）
    │
    ↓
[パーツ2] ソース元
  RSS フィード（4メディア）から過去24時間の記事を取得
    │
    ↓
[パーツ3] 実行場所（GitHub Actions 上で処理）
  Gemini API で各記事を日本語サマリーに変換
  HTMLページ（index.html）を生成
    │
    ├─→ gh-pages ブランチにプッシュ
    │     └─ GitHub Pages として自動公開
    │         https://muramasalldr-max.github.io/ai-news-delivery/
    │
    └─→ [パーツ4] Gmail（nodemailer + Gmail SMTP）
          ページURLを本文に記載してメール送信
```

---

## 4. RSSフィード（ソース元）

| メディア | 言語 | 内容 |
|---|---|---|
| ITmedia AI+ | 日本語 | 国内 AI ニュース全般 |
| Zenn（AI トピック） | 日本語 | 国内エンジニアの AI 技術記事 |
| Anthropic Blog | 英語 | Claude・AIサービスの公式発表 |
| Google AI Blog | 英語 | Google の AI 研究・製品情報 |

---

## 5. 各パーツの詳細

### パーツ1・3：GitHub Actions

| 項目 | 内容 |
|---|---|
| 実行時間 | 毎朝 7:00 JST（UTC 22:00） |
| 無料枠 | パブリックリポジトリ: 無制限、プライベート: 2,000分/月 |
| 1回の実行時間 | 約1〜2分 → 月31回実行しても約62分、無料枠内 |

```yaml
on:
  schedule:
    - cron: '0 22 * * *'  # 毎日 7:00 JST
  workflow_dispatch:
```

### パーツ2：RSS フィード取得

- `rss-parser` ライブラリで4メディアを並列取得
- `pubDate` で過去24時間以内の記事のみにフィルタリング

### パーツ3：Gemini API で要約 → GitHub Pages に公開

| 項目 | 内容 |
|---|---|
| モデル | `gemini-3-flash-preview`（無料枠あり） |
| 無料枠 | 15 リクエスト/分、100万トークン/日 |
| プロンプト | 記事タイトル＋本文を渡し、2〜3行の日本語サマリーを生成 |
| HTML生成 | Tailwind CSS・Google Fonts をフル活用したページを生成 |
| デプロイ | `gh-pages` ブランチに `index.html` をプッシュ → 自動公開 |
| 公開URL | `https://muramasalldr-max.github.io/ai-news-delivery/` （固定） |

GitHub Pages への push は `peaceiris/actions-gh-pages` アクションを使用。`GITHUB_TOKEN` は Actions に自動付与されるため、追加の Secrets 不要。

### パーツ4：Gmail 通知

| 項目 | 内容 |
|---|---|
| 内容 | 当日ページのURL + 記事数・メディア数のみの短いテキスト |
| 送信方法 | nodemailer + Gmail SMTP（App Password 認証） |
| 送信先 | 自分の Gmail アドレス |

---

## 6. 必要な GitHub Secrets

| キー名 | 内容 | 取得方法 |
|---|---|---|
| `GEMINI_API_KEY` | Gemini API のキー | Google AI Studio で無料取得 |
| `GMAIL_USER` | 送信元の Gmail アドレス | 自分の Gmail |
| `GMAIL_APP_PASSWORD` | Gmail のアプリパスワード | Google アカウント → セキュリティ → アプリパスワード |

※ GitHub Pages へのデプロイに必要な `GITHUB_TOKEN` は Actions に自動付与されるため登録不要。

---

## 7. ファイル構成

```
ai-news-delivery/
├── .github/
│   └── workflows/
│       └── deliver-news.yml      ← GitHub Actions ワークフロー
├── src/
│   ├── main.js                   ← メインスクリプト（全体制御）
│   ├── fetch-rss.js              ← RSS フィードから記事取得
│   ├── summarize.js              ← Gemini API で要約・整形
│   ├── generate-html.js          ← index.html 生成
│   └── send-mail.js              ← Gmail で URL 通知
├── package.json
├── package-lock.json
├── .gitignore
├── mockup.html                   ← デザインモックアップ
└── README.md                     ← このファイル
```

---

## 8. ロードマップ

```
Phase 1（完了）
  プロジェクト設計・README 作成
  └─ 構成・仕様の確定

Phase 2（完了）
  デザインモックアップ作成
  └─ mockup.html 完成（Tailwind CSS・グリーン系カラー）

Phase 3（完了）
  RSS フィード取得スクリプト作成
  ├─ rss-parser で4メディアを並列取得
  └─ 過去24時間フィルタリング

Phase 4（完了）
  Gemini API で要約・HTML生成
  ├─ 各記事を2〜3行の日本語サマリーに変換
  └─ index.html を生成（mockup.html ベース）

Phase 5（完了）
  GitHub Pages デプロイ設定
  ├─ gh-pages ブランチへの自動プッシュ
  └─ GitHub Pages 有効化

Phase 6（完了）
  Gmail 通知スクリプト作成
  ├─ nodemailer でURLを自分宛てに送信
  └─ エラーハンドリング追加

Phase 7（完了）
  GitHub Actions ワークフロー構築・動作確認
  ├─ cron スケジュール設定（毎朝 7:00 JST）
  └─ Secrets 設定・end-to-end テスト
```

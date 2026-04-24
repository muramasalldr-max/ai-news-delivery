# AIニュース自動配信ツール

最新のAI関連ニュースを毎朝自動で収集・要約し、Gmail に届けるツールです。

RSSフィードから記事を取得し、Gemini API が日本語で要約。毎朝決まった時間に「今日のAIニュース」としてメールに自動配信されます。すべて無料枠で動作します。

---

## 1. プロジェクト概要

### 目的
AI分野の情報は更新が速く、毎日自分でサイトを巡回するのは手間がかかる。  
主要な AI ニュースを自動で拾い、読みやすい形にまとめて毎朝 Gmail に届けることで、情報収集を自動化する。

### 配信イメージ

```
件名: 【AIニュース】2026年4月24日

━━━━━━━━━━━━━━━━━━━━
📰 1. OpenAI、新モデル「GPT-5」を正式発表
   → 推論速度が従来比3倍に。APIは来週から順次公開予定。
   🔗 出典: ITmedia AI+

📰 2. Claude 3.7 の新機能まとめ
   → 拡張思考モードが強化。ロングコンテキスト対応も改善。
   🔗 出典: Anthropic Blog

📰 3. Google DeepMind、タンパク質設計AIを医療応用へ
   → AlphaFold 最新版が希少疾患治療薬の開発に活用される見込み。
   🔗 出典: Google AI Blog

━━━━━━━━━━━━━━━━━━━━
```

---

## 2. 仕組み（4パーツ）

| # | パーツ | 役割 | このツールでは |
|---|---|---|---|
| 1 | トリガー | いつ動かすか | GitHub Actions（cron） |
| 2 | ソース元 | どこから情報を取るか | RSS フィード（4メディア） |
| 3 | 実行場所 | どこで処理するか | GitHub Actions |
| 4 | 配信先 | どこに届けるか | Gmail（自分宛て） |

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
  AI 関連記事を上位3〜5件に絞り込み、メール本文を生成
    │
    ↓
[パーツ4] 配信先
  Gmail（nodemailer + Gmail SMTP）で自分宛てにメール送信
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

### パーツ3：Gemini API で要約

| 項目 | 内容 |
|---|---|
| モデル | `gemini-2.0-flash`（無料枠あり） |
| 無料枠 | 15 リクエスト/分、100万トークン/日 |
| プロンプト | 記事タイトル＋本文を渡し、2〜3行の日本語サマリーを生成 |
| コスト | 無料枠内で完結（1日数十件の処理なら超えない） |

### パーツ4：Gmail 送信

| 項目 | 内容 |
|---|---|
| 送信方法 | nodemailer + Gmail SMTP（App Password 認証） |
| 送信先 | 自分の Gmail アドレス |
| 認証情報 | GitHub Secrets に `GMAIL_USER` と `GMAIL_APP_PASSWORD` を登録 |

---

## 6. 必要な GitHub Secrets

| キー名 | 内容 | 取得方法 |
|---|---|---|
| `GEMINI_API_KEY` | Gemini API のキー | Google AI Studio で無料取得 |
| `GMAIL_USER` | 送信元の Gmail アドレス | 自分の Gmail |
| `GMAIL_APP_PASSWORD` | Gmail のアプリパスワード | Google アカウント → セキュリティ → アプリパスワード |

---

## 7. ファイル構成（予定）

```
ai-news-delivery/
├── .github/
│   └── workflows/
│       └── deliver-news.yml      ← GitHub Actions ワークフロー
├── src/
│   ├── main.js                   ← メインスクリプト（全体制御）
│   ├── fetch-rss.js              ← RSS フィードから記事取得
│   ├── summarize.js              ← Gemini API で要約・整形
│   └── send-mail.js              ← Gmail で送信
├── package.json
├── package-lock.json
├── .gitignore
└── README.md                     ← このファイル
```

---

## 8. ロードマップ

```
Phase 1（完了）
  プロジェクト設計・README 作成
  └─ 構成・仕様の確定

Phase 2（予定）
  RSS フィード取得スクリプト作成
  ├─ rss-parser で4メディアを並列取得
  └─ 過去24時間フィルタリング

Phase 3（予定）
  Gemini API で要約・整形
  ├─ 各記事を2〜3行の日本語サマリーに変換
  └─ メール本文テキストを生成

Phase 4（予定）
  Gmail 送信スクリプト作成
  ├─ nodemailer で自分宛てに送信
  └─ エラーハンドリング追加

Phase 5（予定）
  GitHub Actions ワークフロー構築
  ├─ cron スケジュール設定（毎朝 7:00 JST）
  └─ Secrets 設定・動作確認

Phase 6（予定）
  チューニング・拡張
  ├─ 配信メディアの追加・調整
  └─ HTML メール対応（より見やすいレイアウト）
```

# kira ✦

**かわいいをつぶやこう♡** — X（Twitter）クローン × ピンクな世界観

> PINKは色じゃない。存在力・生命力・創造力の SUPERPOWER。

[![Deploy to GitHub Pages](https://github.com/Natsumi723723/kira-x/actions/workflows/deploy.yml/badge.svg)](https://github.com/Natsumi723723/kira-x/actions/workflows/deploy.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)

🌐 **公開URL**: [https://natsumi723723.github.io/kira-x/](https://natsumi723723.github.io/kira-x/)

---

## ✦ 機能

| 機能 | 説明 |
|------|------|
| 📝 投稿 | つぶやき投稿 |
| ♡ いいね | ハートアニメーション付き・楽観的UI |
| 🔁 リポスト | ワンタップで拡散・楽観的UI |
| 👤 フォロー / フォロワー | 相互フォロー管理・楽観的UI |
| 🏠 タイムライン | おすすめ / フォロー中 切り替え（自分のツイートも表示） |
| 🔍 検索 | ユーザー名・表示名で検索 |
| 🖼 プロフィール編集 | 名前・自己紹介・アイコン写真の変更 |
| ⚡ リアルタイム更新 | 新しい投稿が自動でタイムラインに追加 |
| 📱 モバイルファースト | 430px 中央寄せ・ボトムナビ |
| 🌐 GitHub Pages | 静的エクスポートで誰でもアクセス可能 |

---

## 🛠 技術スタック

- **フレームワーク**: [Next.js 15](https://nextjs.org/) App Router + TypeScript
- **バックエンド**: [Supabase](https://supabase.com/) (Auth / PostgreSQL / Storage / Realtime)
- **スタイリング**: Tailwind CSS + CSS Variables
- **フォント**: Mochiy Pop One / M PLUS Rounded 1c (Google Fonts)

---

## 🚀 セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/<your-username>/kira-x.git
cd kira-x
npm install
```

### 2. Supabase プロジェクトを作成

[supabase.com](https://supabase.com) で新規プロジェクトを作成し、`setup_supabase.sql` を **SQL Editor** で実行。

### 3. 環境変数を設定

`.env.local` を作成：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 起動

```bash
npm run dev
```

`http://localhost:3000/kira-x/` を開く ✦

---

## 🌐 GitHub Pages へのデプロイ

`main` にプッシュすると GitHub Actions が自動でビルド＆デプロイします。

初回のみ設定が必要：

1. **Secrets を追加**: `Settings > Secrets > Actions` で `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を登録
2. **Pages を有効化**: `Settings > Pages > Source` を **GitHub Actions** に設定

---

## 🗄 データベース構成

```
profiles   ← ユーザープロフィール（auth.users とトリガーで自動連携）
tweets     ← 投稿（リポスト対応）
likes      ← いいね（複合主キーで二重防止）
follows    ← フォロー関係（複合主キーで二重防止）
```

すべてのテーブルに **Row Level Security (RLS)** を設定済み。

---

## 🔒 セキュリティ

- RLS で全テーブルのアクセス制御
- UUID で連番ID問題を回避
- React の自動エスケープで XSS 対策
- Supabase JS クライアントで SQL インジェクション対策
- `service_role key` はフロント非公開

---

## 🎨 デザイントークン

| トークン | 値 |
|----------|-----|
| `--accent` | `#ff2e93`（ホットピンク） |
| `--card` | `#fffafd` |
| `--text` | `#3a1430` |
| `--grad-btn` | `linear-gradient(135deg, #ff5fb0, #ff2e93, #c77dff)` |

---

## 📁 ディレクトリ構成

```
app/
├── (main)/              # 認証済みルートグループ
│   ├── layout.tsx       # BottomNav + 認証ガード
│   ├── page.tsx         # ホームタイムライン
│   ├── explore/         # ユーザー検索
│   └── [username]/      # プロフィールページ
├── auth/                # ログイン・サインアップ
└── globals.css          # デザイントークン + アニメーション

components/
├── TweetCard.tsx          # いいね・リポスト・削除（楽観的UI）
├── TweetComposer.tsx      # 投稿モーダル
├── Timeline.tsx           # リアルタイムタイムライン
├── BottomNav.tsx          # ボトムナビゲーション
├── FollowButton.tsx       # フォロー（楽観的UI）
├── EditProfileModal.tsx   # プロフィール編集・アイコンアップロード
├── EditProfileButton.tsx  # 編集ボタン（Client Wrapper）
└── ProfileFAB.tsx         # プロフィールページ FAB
```

---

## ✦ PINK CITY プロジェクト

このアプリは **[PINK CITY](https://natsumi723723.github.io/pink-city-collector/)** プロジェクトの一環として開発されました。

> PINKを文化にする都市型プロジェクト。

---

Made with 💗 by nachumin

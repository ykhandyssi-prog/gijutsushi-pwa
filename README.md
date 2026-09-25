# gijutsushi-pwa

技術士一次の出題器の、スマホの答え入力。設計の正本は Obsidian Vault の `20_Projects/技術士試験/技術士試験対策.md`「学習ツールの設計」。
PC 側（出題・紙の生成・判定）は HANDY の `C:\Users\ykhan\gijutsushi\`（Vault 外・非公開）。

## 方針
- 紙で解き、答えの番号だけをここで入れる。**○×・点数・正答はこの画面のどこにも出さない**。送ったあとは「受け取りました」だけ。
- **このリポジトリは公開**。問題文・画像・正答は入れない（画面のコードと Firebase の公開設定だけ）。

## データ（Firestore・プロジェクト `gijutsushi-pwa`）
- `users/{uid}/gj/{YYYY-MM-DD}` … HANDY（`gijutsushi/src/gj_sync.py push`）が `date`・`subject`・`field`・`label`・`n` を置く。この画面が `answers`・`unknown`・`flag`（すべて紙の問1〜の順）と `submittedAt` を足す。
- `users/{uid}/gjkey/{YYYY-MM-DD}` … 正答（紙の順）。HANDY が置き、この画面は読まない。判定はスクリプトが行う（復習セッション `/gj-review` が YUZAN から読む）。
- `users/{uid}/meta/gj` … ログインの印。HANDY が uid を見つけるのに使う。

HANDY の毎晩 21:00（`nightly.py`）が、答えの取り込み（pull）→ 翌日の出題と紙 → スマホへの送信（push）の順に回す。

## 見本モード
`firebaseConfig` が `REPLACE_ME` のまま、または `?demo` を付けて開くと、保存しない見本で動く。

## セットアップ（初回・本人）
1. Firebase Console でプロジェクト `gijutsushi-pwa` を作成（Google アナリティクスは不要）
2. Authentication → Sign-in method → Google を有効化
3. Firestore Database を作成（本番モード・ロケーション `asia-northeast1`）、ルールを下記に
4. プロジェクト設定 → ウェブアプリを追加し、firebaseConfig を `index.html` の `firebaseConfig` に貼り替え
5. Authentication → 設定 → 承認済みドメインに `ykhandyssi-prog.github.io` を追加
6. プロジェクト設定 → サービスアカウント → 新しい秘密鍵を生成し、`C:\Users\ykhan\gijutsushi\serviceAccountKey.json` として保存（git に入れない）
7. スマホで一度ログイン → HANDY で `.venv\Scripts\python.exe src\gj_sync.py push`

### Firestore ルール
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## 配信（GitHub Pages）
- 公開URL `https://ykhandyssi-prog.github.io/gijutsushi-pwa/`
- SW はネットワーク優先で即反映（必要なら `sw.js` の `CACHE` 版数を上げる）。同じオリジンの biolog・hasu のキャッシュには触らない（接頭辞 `gj-` だけ消す）

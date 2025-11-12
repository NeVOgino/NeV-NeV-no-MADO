# NeVの窓ブラウザ化プロジェクト - 作業フロー完全マニュアル

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [実施した試行錯誤の全体像](#実施した試行錯誤の全体像)
3. [フェーズ別作業の詳細](#フェーズ別作業の詳細)
4. [重要な技術的決断とその理由](#重要な技術的決断とその理由)
5. [問題と解決策の一覧](#問題と解決策の一覧)
6. [同様の作業を効率的に行うためのベストプラクティス](#同様の作業を効率的に行うためのベストプラクティス)
7. [チェックリスト](#チェックリスト)

---

## プロジェクト概要

### 目的
Excelベースの社内掲示板「NEVの窓」を、Webブラウザで閲覧・編集可能なシステムに変換する

### 完成したシステムの特徴
- **静的HTML方式**: サーバー不要で共有フォルダから直接アクセス可能
- **2つのインターフェース**: 
  - `index.html` - 閲覧専用画面
  - `admin.html` - 編集画面（非技術者でも使用可能）
- **検索機能**: リアルタイム検索、ひらがな・カタカナ正規化対応
- **Office URIスキーム**: Excel/Word/PowerPointファイルの直接開封
- **包括的な管理機能**: 項目・セクションの追加、編集、削除、並び替え、移動

---

## 実施した試行錯誤の全体像

### 全体のフロー

```
フェーズ1: 基本システム構築（PR #1, #2）
    ↓
フェーズ2: セクション構造の改善（PR #3, #4）
    ↓
フェーズ3: Officeファイル対応（PR #5, #6）
    ↓
フェーズ4: バックアップとUI改善（PR #7, #8）
```

### 各プルリクエストの役割

| PR番号 | タイトル | 主な成果 | 学んだこと |
|--------|---------|---------|-----------|
| #1 | 初期Webインターフェース作成 | Excel→HTML変換の基礎システム | GitHubベースの更新フロー |
| #2 | パターン1での作業 | データ構造の確立、検索機能実装 | 動的読み込みの問題点 |
| #3 | パターン2での作業 | サブディビジョン機能 | データ構造の柔軟性の重要性 |
| #4 | 標準書コーナーのナビゲーション | セクション内サブセクション実装 | ユーザビリティの向上 |
| #5 | Office URIスキーム実装 | ファイル直接開封機能 | セキュリティ警告対応 |
| #6 | Excelセキュリティ警告修正 | `ofe` → `ofv` 変更 | 読み取り専用モードの重要性 |
| #7 | バックアップ管理改善 | json_backupフォルダ、命名規則 | データ保護の重要性 |
| #8 | 統一フォーマット実装 | 完全な互換性実現 | データフォーマットの統一 |

---

## フェーズ別作業の詳細

### フェーズ1: 基本システム構築（2025年11月4日-8日）

#### 目標
ExcelファイルをWebブラウザで閲覧できる基本システムを構築

#### 実施した作業

1. **Excel データ抽出**
   - `NEVの窓_1110.xlsx` からデータを読み取り
   - JSON形式に変換
   - ハイパーリンク（126個）を保持

2. **HTML/CSS/JavaScript 実装**
   - `index.html`: メイン表示ページ
   - `style.css`: レスポンシブデザイン
   - `script.js`: タブ切り替え機能

3. **ドキュメント作成**
   - `更新マニュアル.md`: 編集手順
   - `資料ファイルの管理ガイド.md`: ファイル管理方法
   - `README.md`: プロジェクト概要

#### 遭遇した問題と解決策

**問題1: 動的JSON読み込みがCORSエラーで失敗**
```javascript
// 失敗したアプローチ
fetch('data.json')
  .then(response => response.json())
  .catch(error => {
    // CORSエラー: ローカルファイルシステムからは読み込めない
  });
```

**解決策: 静的HTML方式への変更**
```python
# generate_html.py を作成
def generate_html(data):
    # data.jsonの内容をHTMLに直接埋め込む
    html_content = f"""
    <script>
    const siteData = {json.dumps(data, ensure_ascii=False)};
    </script>
    """
    return html_content
```

**重要な学び:**
- ファイル共有からアクセスする場合、動的読み込みは避ける
- HTMLに直接埋め込む方が確実で高速
- Pythonスクリプトによる自動生成で更新を簡素化

---

### フェーズ2: セクション構造の改善（2025年11月8日）

#### 目標
大量の項目（50+）を持つセクションを整理し、ナビゲーションを改善

#### 実施した作業

1. **サブセクション機能の実装**
   ```json
   {
     "name": "標準書コーナー",
     "subsections": [
       {
         "name": "０．規則",
         "items": [...]
       },
       {
         "name": "１．稟議・契約",
         "items": [...]
       }
     ]
   }
   ```

2. **サブセクションナビゲーション**
   - ボタンによるクイックジャンプ機能
   - スクロール時のハイライト表示

3. **共通コーナーの細分化**
   - 26項目を5つのカテゴリに整理:
     - カレンダー・組織情報
     - 広報・資料
     - 安全・防災
     - 職場ルール・施設
     - IT・在宅勤務・その他

#### 技術的なポイント

**generate_html.py の拡張**
```python
def render_section(section):
    if 'subsections' in section:
        # サブセクションナビゲーションを生成
        html = '<div class="subsection-nav">\n'
        for idx, subsection in enumerate(section['subsections']):
            html += f'<button onclick="scrollToSubsection({idx})">{subsection["name"]}</button>\n'
        html += '</div>\n'
        
        # 各サブセクションをレンダリング
        for idx, subsection in enumerate(section['subsections']):
            html += f'<div class="subsection" id="subsection-{idx}">\n'
            html += f'<h3>{subsection["name"]}</h3>\n'
            # 項目をレンダリング
            html += '</div>\n'
        return html
```

**重要な学び:**
- データ構造の柔軟性を保つ（items と subsections の両方をサポート）
- ユーザビリティを優先（大量の項目は整理する）
- 将来の拡張を考慮した設計

---

### フェーズ3: Officeファイル対応（2025年11月10日）

#### 目標
Excel/Word/PowerPointファイルをクリックで直接開く（ダウンロード不要）

#### 遭遇した問題

**問題: 従来のリンクがダウンロードを促す**
```html
<!-- 問題のあるコード -->
<a href="../nev_window/room/R7_10F_Kaigi.xlsx">10階 会議室</a>
<!-- ブラウザがファイルをダウンロードしようとする -->
```

#### 解決策: Office URIスキームの実装

**ステップ1: 検出と変換関数の作成**
```python
def get_office_uri(link_path):
    """Officeファイルの場合、URIスキームを返す"""
    file_ext = os.path.splitext(link_path)[1].lower()
    
    # Excelファイル
    if file_ext in ['.xlsx', '.xls', '.xlsm', '.xlsb']:
        protocol = 'ms-excel:ofv|u|'  # ofv = Open for Viewing (読み取り専用)
    # Wordファイル
    elif file_ext in ['.docx', '.doc', '.docm']:
        protocol = 'ms-word:ofv|u|'
    # PowerPointファイル
    elif file_ext in ['.pptx', '.ppt', '.pptm']:
        protocol = 'ms-powerpoint:ofv|u|'
    else:
        return link_path  # Officeファイル以外はそのまま
    
    # 相対パスを絶対パスに変換
    abs_path = convert_to_absolute_path(link_path)
    return f'{protocol}{abs_path}'
```

**ステップ2: HTML生成時に適用**
```python
def create_link(text, link_path):
    office_uri = get_office_uri(link_path)
    return f'<a href="{office_uri}">{escape_html(text)}</a>'
```

#### セキュリティ警告の問題と対処

**問題: Windowsセキュリティ警告が表示**
```
「このファイルは制限付きサイトゾーンから入手したものです。
コンピューターを保護するため、このファイルへのアクセスがブロックされる可能性があります。」
```

**原因分析:**
- `ofe` (Open for Editing) = 編集モードで開く
- Windowsがセキュリティリスクと判断

**解決策: 読み取り専用モードに変更**
```python
# Before
protocol = 'ms-excel:ofe|u|'  # 編集モード

# After
protocol = 'ms-excel:ofv|u|'  # 読み取り専用モード（View）
```

**重要な学び:**
- `ofv` (Open for Viewing) を使用すると警告が出ない
- セキュリティと利便性のバランスが重要
- すべての該当リンク（14個）を一括で修正

---

### フェーズ4: バックアップとUI改善（2025年11月12日）

#### 目標
- データ保護の強化
- ユーザビリティの向上
- データフォーマットの統一

#### 実施した作業

##### 4-1: バックアップ管理の改善

**問題: バックアップファイルの管理が不明確**
- ファイル名が「編集前」と表記されているが、実際は「更新後」の内容
- 保存場所が統一されていない

**解決策:**
1. **命名規則の変更**
   ```javascript
   // Before
   const filename = `data_編集前バックアップ_${timestamp}.json`;
   
   // After
   const filename = `data_更新後バックアップ_${timestamp}.json`;
   ```

2. **専用フォルダの作成**
   - `json_backup/` フォルダを作成
   - すべてのバックアップを一元管理

3. **ドキュメント更新**
   - README.md
   - USER_GUIDE.md
   - QUICK_START.md
   に保存手順を明記

##### 4-2: 統一フォーマットの実装

**問題: セクションごとにデータフォーマットが異なる**
```javascript
// INFORMATIONセクション
{
  date: "2025.11.12",
  content: "タイトル",
  detail: "詳細",
  link: "リンク先"
}

// 通常セクション
{
  text: "項目名",
  link: "リンク先"
}

// または単純な文字列
"項目名"
```

**影響:**
- セクション間で項目を移動すると表示されない
- admin.htmlでの編集が複雑
- generate_html.pyとadmin.jsでロジックが重複

**解決策: 統一フォーマットの導入**

```javascript
// すべてのフィールドをオプショナルにした統一フォーマット
{
  date: "2025.11.12",      // オプション
  content: "タイトル",      // オプション（旧 text も受け入れ）
  detail: "詳細",           // オプション
  link: "リンク先"          // オプション
}
```

**実装のポイント:**

1. **admin.js - 統一レンダリング関数**
   ```javascript
   function renderUnifiedItem(item) {
       // 文字列の場合はオブジェクトに変換
       if (typeof item === 'string') {
           item = { content: item };
       }
       
       // 後方互換性: text → content
       if (item.text && !item.content) {
           item.content = item.text;
       }
       
       let html = '<div class="item">';
       
       // 存在するフィールドのみ表示
       if (item.date) {
           html += `<span class="date">${escapeHtml(item.date)}</span>`;
       }
       if (item.content) {
           html += `<span class="content">${escapeHtml(item.content)}</span>`;
       }
       if (item.detail) {
           html += `<span class="detail">${escapeHtml(item.detail)}</span>`;
       }
       if (item.link) {
           html += `<a href="${escapeHtml(item.link)}">リンク</a>`;
       }
       
       html += '</div>';
       return html;
   }
   ```

2. **generate_html.py - 同じロジックを実装**
   ```python
   def render_unified_item(item):
       """統一フォーマットで項目をレンダリング"""
       # 文字列の場合はdictに変換
       if isinstance(item, str):
           item = {'content': item}
       
       # 後方互換性
       if 'text' in item and 'content' not in item:
           item['content'] = item['text']
       
       html = '<div class="item">'
       
       # 存在するフィールドのみ表示
       if 'date' in item:
           html += f'<span class="date">{escape_html(item["date"])}</span>'
       if 'content' in item:
           html += f'<span class="content">{escape_html(item["content"])}</span>'
       # ... 以下同様
       
       return html
   ```

**重要な学び:**
- データフォーマットの統一は初期段階で実施すべき
- 後方互換性を保つことでスムーズな移行が可能
- admin.js と generate_html.py で同じロジックを実装することが重要

##### 4-3: UI/UXの改善

**実施した改善:**

1. **セクション管理機能**
   - セクションの追加
   - セクションの並び替え（↑↓ボタン）
   - セクションの削除

2. **項目管理機能**
   - 項目の追加（各セクションに）
   - 項目の並び替え（↑↓ボタン）
   - 項目の移動（セクション間・タブ間）
   - 項目の削除

3. **レイアウト改善**
   - タブボタンを固定スクロールから解除
   - クイックジャンプボタンのサイズ統一
   - 4列グリッドレイアウト（8ボタンを2行×4列）

4. **INFORMATIONセクションの折りたたみ**
   ```javascript
   function toggleCollapse(sectionIndex) {
       const items = document.querySelectorAll(`#section-${sectionIndex} .item`);
       const button = document.querySelector(`#toggle-${sectionIndex}`);
       
       // 最初の3項目以外を表示/非表示
       for (let i = 3; i < items.length; i++) {
           items[i].classList.toggle('hidden');
       }
       
       // ボタンのテキストを更新
       const isCollapsed = items[3].classList.contains('hidden');
       button.textContent = isCollapsed ? 
           `さらに表示 (${items.length - 3}件)` : 
           '折りたたむ';
   }
   ```

---

## 重要な技術的決断とその理由

### 1. 静的HTML方式の採用

**決断:** data.jsonの内容をHTMLに直接埋め込む

**理由:**
- ✅ ファイル共有から直接アクセス可能（Webサーバー不要）
- ✅ CORSエラーを完全に回避
- ✅ ページ読み込みが高速
- ✅ ネットワーク接続不要

**トレードオフ:**
- ❌ 更新にはPythonスクリプト実行が必要
- ✅ 自動化により影響は最小限

### 2. Office URIスキームの使用

**決断:** `ms-excel:ofv|u|`, `ms-word:ofv|u|` などのURIスキームを使用

**理由:**
- ✅ ファイルをダウンロードせず直接開ける
- ✅ ユーザー体験の向上
- ✅ `ofv`（読み取り専用）でセキュリティ警告を回避

**実装のポイント:**
- すべてのOfficeファイル拡張子に対応
- 相対パスを絶対パスに変換
- 非Officeファイルはそのまま処理

### 3. 管理画面の2つのモード

**決断:** JSON直接編集 + GUI管理機能

**理由:**
- ✅ 柔軟性（パワーユーザー向けJSON編集）
- ✅ 使いやすさ（初心者向けGUI操作）
- ✅ 段階的な学習が可能

**実装:**
- 編集モード: JSON直接編集
- 管理機能: ボタンによる追加・削除・並び替え・移動

### 4. 統一データフォーマット

**決断:** すべての項目を同じフォーマットで管理

**理由:**
- ✅ セクション間の互換性
- ✅ コードの簡潔化
- ✅ メンテナンス性の向上
- ✅ 後方互換性を維持

**実装:**
- すべてのフィールドをオプショナルに
- 古いフォーマットも自動変換
- admin.js と generate_html.py で同じロジック

---

## 問題と解決策の一覧

### データ関連

| 問題 | 原因 | 解決策 | PR |
|------|------|--------|-----|
| CORSエラー | 動的JSON読み込み | 静的HTML埋め込み | #2 |
| フォーマット不一致 | セクションごとに異なる構造 | 統一フォーマット導入 | #8 |
| 後方互換性 | 古いデータとの不整合 | 自動変換ロジック | #8 |

### ファイルアクセス関連

| 問題 | 原因 | 解決策 | PR |
|------|------|--------|-----|
| Officeファイルがダウンロードされる | 通常のリンク | Office URIスキーム | #5 |
| セキュリティ警告 | `ofe` (編集モード) | `ofv` (読み取り専用) | #6 |
| ファイルパス誤り | 相対パス | 絶対パス変換 | #5 |

### UI/UX関連

| 問題 | 原因 | 解決策 | PR |
|------|------|--------|-----|
| 大量項目の見にくさ | フラットなリスト | サブセクション化 | #3, #4 |
| 編集の複雑さ | JSON直接編集のみ | GUI管理機能追加 | #8 |
| タブボタンの視認性 | 固定スクロール | 固定解除 | #2 |
| INFORMATIONの長さ | すべて表示 | 折りたたみ機能 | #2 |

### データ保護関連

| 問題 | 原因 | 解決策 | PR |
|------|------|--------|-----|
| バックアップ管理不明確 | 統一ルールなし | json_backupフォルダ | #7 |
| ファイル名の混乱 | 不適切な命名 | 「更新後」に変更 | #7 |
| 復元方法不明 | ドキュメント不足 | 詳細手順を追加 | #7 |

---

## 同様の作業を効率的に行うためのベストプラクティス

### 1. プロジェクト計画段階

#### データ構造の設計
```markdown
✅ DO:
- 統一フォーマットを最初に決定
- すべてのフィールドをオプショナルに
- 将来の拡張を考慮

❌ DON'T:
- セクションごとに異なるフォーマット
- 必須フィールドを多用
- 後から構造を大きく変更
```

#### アーキテクチャの選択
```markdown
✅ DO:
- デプロイ環境を先に確認（ファイル共有 vs Webサーバー）
- 静的 vs 動的を早期に決定
- セキュリティ制約を調査

❌ DON'T:
- 環境を考慮せず実装
- 後からアーキテクチャを変更
```

### 2. 実装段階

#### コーディング
```python
# ✅ DO: HTMLエスケープを忘れない
def escape_html(text):
    return html.escape(str(text))

html = f'<div>{escape_html(user_input)}</div>'

# ❌ DON'T: 生の入力を直接使用
html = f'<div>{user_input}</div>'  # XSS脆弱性
```

```javascript
// ✅ DO: 統一関数で処理
function renderItem(item) {
    return renderUnifiedItem(item);  // 一貫性のある処理
}

// ❌ DON'T: セクションごとに別のロジック
function renderInfoItem(item) { /* 個別ロジック */ }
function renderCommonItem(item) { /* 別の個別ロジック */ }
```

#### ファイル管理
```markdown
✅ DO:
- バックアップを自動生成
- タイムスタンプ付きファイル名
- 専用フォルダで整理

❌ DON'T:
- 手動バックアップに依存
- 上書き保存
- バックアップを散在させる
```

### 3. テストと検証

#### テスト項目
```markdown
□ 新規データの追加
□ 既存データの編集
□ 項目の移動（セクション間・タブ間）
□ 並び替え
□ 削除
□ バックアップ・復元
□ Officeファイルの開封
□ 検索機能（ひらがな・カタカナ）
□ ブラウザキャッシュクリア後の表示
□ モバイルでの表示
```

#### 検証方法
```bash
# HTML生成
python generate_html.py

# ブラウザで確認
# 1. index.htmlを開く
# 2. Ctrl+Shift+Delete でキャッシュクリア
# 3. Ctrl+F5 で強制リロード
# 4. 機能テスト実施
```

### 4. ドキュメント作成

#### 必須ドキュメント
```markdown
1. README.md - プロジェクト概要
2. USER_GUIDE.md - 詳細利用ガイド
3. QUICK_START.md - クイックスタート
4. DEPLOYMENT_GUIDE.md - デプロイ手順
5. WORKFLOW_MANUAL.md - 作業フロー（本ドキュメント）
```

#### ドキュメント作成のポイント
```markdown
✅ DO:
- スクリーンショットを含める
- 具体例を豊富に
- ステップバイステップの手順
- よくある質問を追加
- トラブルシューティング

❌ DON'T:
- 専門用語のみ
- 抽象的な説明
- 更新を怠る
```

### 5. GitHubでの作業フロー

#### ブランチ戦略
```markdown
main (本番環境)
    ↓
feature/xxx (機能追加)
    ↓
fix/xxx (バグ修正)
```

#### プルリクエストのベストプラクティス
```markdown
✅ タイトル:
- [機能] Office URIスキーム実装
- [修正] セキュリティ警告の解消
- [改善] バックアップ管理の改善

✅ 説明:
- ## 変更内容
- ## 実装の詳細
- ## テスト手順
- ## スクリーンショット
- ## 関連Issue

✅ コミットメッセージ:
- feat: Add Office URI scheme support
- fix: Change ofe to ofv for security
- docs: Update backup management guide
```

---

## チェックリスト

### プロジェクト開始時

```markdown
□ 要件を明確化
  □ デプロイ環境（ファイル共有 / Webサーバー）
  □ 対象ブラウザ
  □ セキュリティ要件
  □ ユーザースキルレベル

□ データ構造を設計
  □ 統一フォーマット定義
  □ 拡張性を考慮
  □ サンプルデータ作成

□ アーキテクチャ決定
  □ 静的 vs 動的
  □ フロントエンド技術
  □ バックエンド処理

□ リポジトリセットアップ
  □ README.md 作成
  □ .gitignore 設定
  □ ブランチ戦略決定
```

### 実装時

```markdown
□ セキュリティ対策
  □ HTMLエスケープ
  □ XSS対策
  □ CSRF対策（必要に応じて）

□ ユーザビリティ
  □ レスポンシブデザイン
  □ 検索機能
  □ エラーメッセージ

□ データ保護
  □ 自動バックアップ
  □ バージョン管理
  □ 復元機能

□ ドキュメント
  □ コード内コメント
  □ ユーザーガイド
  □ 開発者向けドキュメント
```

### テスト時

```markdown
□ 機能テスト
  □ すべての機能が動作
  □ エッジケース確認
  □ エラーハンドリング

□ ブラウザテスト
  □ Chrome
  □ Firefox
  □ Edge
  □ Safari（必要に応じて）

□ デバイステスト
  □ デスクトップ
  □ タブレット
  □ モバイル

□ セキュリティテスト
  □ XSSテスト
  □ CodeQL実行
  □ アクセス権限確認
```

### デプロイ前

```markdown
□ 最終確認
  □ 本番データで動作確認
  □ すべてのリンク確認
  □ ドキュメント最新化

□ バックアップ
  □ 既存システムのバックアップ
  □ データバックアップ
  □ ロールバック手順確認

□ デプロイ準備
  □ デプロイ手順書
  □ ユーザー通知
  □ サポート体制
```

### デプロイ後

```markdown
□ 動作確認
  □ 本番環境での動作確認
  □ ユーザーフィードバック収集
  □ パフォーマンス確認

□ 監視
  □ エラー監視
  □ ユーザー数確認
  □ アクセスログ確認

□ サポート
  □ ユーザー問い合わせ対応
  □ トラブルシューティング
  □ ドキュメント改善
```

---

## まとめ

### このプロジェクトの成功要因

1. **段階的なアプローチ**
   - 基本機能→拡張機能→改善の順で実施
   - 各段階で確実に動作確認

2. **ユーザー視点の重視**
   - 非技術者でも使えるUI
   - 包括的なドキュメント
   - エラーメッセージの改善

3. **データ保護の徹底**
   - 自動バックアップ
   - 明確な命名規則
   - 復元手順の文書化

4. **継続的な改善**
   - ユーザーフィードバックの反映
   - UI/UXの改善
   - ドキュメントの更新

### 今後の同様プロジェクトへの適用

本マニュアルのチェックリストとベストプラクティスを活用することで：

✅ **時間短縮**: 試行錯誤を減らし、効率的に実装  
✅ **品質向上**: セキュリティとユーザビリティを両立  
✅ **保守性**: 将来の拡張や修正が容易  
✅ **引き継ぎ**: 新しい担当者へのスムーズな引き継ぎ

---

**作成日**: 2025年11月12日  
**バージョン**: 1.0  
**対象**: 同様のExcel→Webブラウザ化プロジェクト

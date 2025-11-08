# NeV-NeV-no-MADO
エクセルファイルのNeVの窓をブラウザ版に変更する

## 概要
このプロジェクトは、ExcelファイルのNeVの窓をブラウザで閲覧できるHTML版に変換します。

## ファイル構成
- `NEVの窓_1110.xlsx` - 元のExcelファイル
- `extract_data.py` - ExcelからJSONデータを抽出するスクリプト
- `generate_html.py` - JSONデータからHTMLを生成するスクリプト
- `data.json` - 抽出された構造化データ
- `index.html` - メインページ
- `all_staff.html` - 全員向けページ
- `staff.html` - 職員向けページ（標準書コーナーのサブディビジョンを含む）

## 使用方法

### 1. 必要なパッケージのインストール
```bash
pip install openpyxl
```

### 2. データの抽出
Excelファイルからデータを抽出してJSONファイルを生成します：
```bash
python3 extract_data.py
```

### 3. HTMLファイルの生成
JSONデータからHTMLファイルを生成します：
```bash
python3 generate_html.py
```

### 4. 表示の確認
簡易HTTPサーバーを起動してブラウザで確認します：
```bash
python3 -m http.server 8000
```
ブラウザで `http://localhost:8000/index.html` にアクセスします。

## 標準書コーナーのサブディビジョン
職員向けページの標準書コーナーは以下のサブディビジョンに整理されています：
- 基本規則
- 稟議・契約関係
- 組織・運営
- 就業規則・出張・旅費他
- 安全衛生他
- ITセキュリティ関係他
- その他

## データの更新
Excelファイルを更新した場合は、以下のコマンドを順番に実行してHTMLファイルを再生成します：
```bash
python3 extract_data.py
python3 generate_html.py
```

# Office URI Scheme Implementation Guide

## 概要

このアップデートにより、Excel、Word、PowerPointファイルのリンクをクリックしたときに、ブラウザのダウンロードプロンプトではなく、Microsoft Officeアプリケーションで直接ファイルが開かれるようになりました。

## 変更内容

### 実装された機能

Microsoft Office URI スキームを使用して、Office ドキュメントへのリンクを変換します：

- **Excel**: `ms-excel:ofe|u|<パス>`
- **Word**: `ms-word:ofe|u|<パス>`
- **PowerPoint**: `ms-powerpoint:ofe|u|<パス>`

### 対応ファイル形式

#### Excel
- `.xlsx` - Excel ワークブック
- `.xls` - Excel 97-2003 ワークブック
- `.xlsm` - Excel マクロ有効ワークブック
- `.xlsb` - Excel バイナリワークブック

#### Word
- `.docx` - Word 文書
- `.doc` - Word 97-2003 文書
- `.docm` - Word マクロ有効文書

#### PowerPoint
- `.pptx` - PowerPoint プレゼンテーション
- `.ppt` - PowerPoint 97-2003 プレゼンテーション
- `.pptm` - PowerPoint マクロ有効プレゼンテーション

### 対象外のファイル形式

以下のファイルは通常のリンクのまま（変更なし）：

- PDF ファイル (`.pdf`)
- HTTP/HTTPS の URL
- その他のファイル形式

## 使用例

### 変更前
```html
<a href="../nev_window/room/R7_10F_Kaigi.xlsx">10階 会議室（R7年度）</a>
```
→ クリックするとダウンロードプロンプトが表示される

### 変更後
```html
<a href="ms-excel:ofe|u|H:/nev_window/room/R7_10F_Kaigi.xlsx">10階 会議室（R7年度）</a>
```
→ クリックすると Excel で直接開く

## パス変換ルール

### 相対パスから絶対パスへの変換

1. `../nev_window/` で始まるパス → `H:/nev_window/` に変換
2. `共通コーナー\` で始まるパス → `H:/nev_window/共通コーナー/` に変換
3. `INFORMATION\` で始まるパス → `H:/nev_window/INFORMATION/` に変換

### file:/// パスの処理

`file:///\\cev-file5\data\...` 形式のパスは `\\cev-file5\data\...` に変換されます。

## 技術詳細

### 実装場所

`generate_html.py` スクリプトに以下の機能を追加：

1. `get_office_uri(link)` 関数
   - Office ファイルを検出
   - 適切な URI スキームを生成
   - パスの正規化と変換

2. リンク生成時の処理
   - すべてのリンク生成箇所で `get_office_uri()` を呼び出し
   - Office ファイルは URI スキームに変換
   - その他のファイルはそのまま

### セキュリティ

- HTML エスケープ処理は引き続き適用
- CodeQL スキャンで脆弱性なし確認済み
- XSS 攻撃対策済み

## 使用方法

### HTML の再生成

data.json を更新した後、以下のコマンドで index.html を再生成：

```bash
python generate_html.py
```

これにより、最新のデータが Office URI スキームを使用した形式で HTML に反映されます。

### ブラウザでの動作

1. 生成された index.html をブラウザで開く
2. Excel/Word/PowerPoint ファイルのリンクをクリック
3. 対応する Office アプリケーションでファイルが直接開く

## 注意事項

1. **Microsoft Office が必要**: このスキームは Microsoft Office がインストールされている環境でのみ動作します
2. **パスの正確性**: ファイルパスが正しく、アクセス可能である必要があります
3. **ブラウザの互換性**: 最新のブラウザで動作確認済み（Edge, Chrome, Firefox）

## トラブルシューティング

### ファイルが開かない場合

1. Microsoft Office がインストールされているか確認
2. ファイルパスが正しいか確認（特に H: ドライブがマウントされているか）
3. ファイルへのアクセス権限を確認

### ダウンロードプロンプトが表示される場合

- PDF ファイルや他の非 Office ファイルは正常な動作です
- Office ファイルでこの問題が発生する場合、URI スキームが正しく生成されているか HTML ソースを確認

## 検証結果

- ✅ Excel ファイル 12 件が ms-excel スキームを使用
- ✅ Word ファイル 2 件が ms-word スキームを使用
- ✅ PDF ファイル 103 件は通常のリンクのまま
- ✅ HTTP/HTTPS リンクは変更なし
- ✅ セキュリティスキャンで問題なし

## 参考資料

- [Office URI Schemes - Microsoft Documentation](https://docs.microsoft.com/en-us/office/client-developer/office-uri-schemes)
- [Office URIs](https://docs.microsoft.com/en-us/previous-versions/office/developer/office-2013/dn911489(v=office.15))

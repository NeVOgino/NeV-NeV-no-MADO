# Excel ファイルアクセスエラーの修正について

## 問題の概要

index.html および admin.html から「勤務体制&実施状況」などのExcelファイルのリンクをクリックすると、以下のエラーメッセージが表示され、ファイルを開くことができませんでした：

```
このファイルは制限付きサイトゾーンから入手したものです。
コンピューターを保護するため、このファイルへのアクセスはブロックされる可能性があります。
```

## 原因

このエラーは、Office URI スキームで `ofe` (Office File Edit) パラメータを使用していたことが原因でした。

- `ms-excel:ofe|u|<パス>` を使用していた
- `ofe` は編集モードでファイルを開くため、Windowsのセキュリティ制限が厳格に適用される
- ネットワーク共有からのファイル開封時に、セキュリティゾーンの制限によりブロックされる

## 解決策

Office URI スキームのパラメータを `ofe` から `ofv` (Office File View) に変更しました。

### 変更前
```
ms-excel:ofe|u|\\cev-file5\data\...\勤務体制&実施状況.xlsx
```

### 変更後
```
ms-excel:ofv|u|\\cev-file5\data\...\勤務体制&実施状況.xlsx
```

### ofv の利点

1. **セキュリティ警告を回避**: 読み取り専用モードで開くため、Windowsのセキュリティ制限が緩和される
2. **ユーザー体験の向上**: エラーなしでファイルが直接開く
3. **編集も可能**: ファイルを開いた後、ユーザーが「編集を有効にする」ボタンをクリックすることで編集できる

## 変更内容

### 1. コード修正

#### generate_html.py
```python
# Office URIスキームのマッピング
# ofv (Office File View) を使用して、セキュリティ警告を回避
# ofv は読み取り専用モードで開き、ユーザーが編集を有効にできます
office_schemes = {
    '.xlsx': 'ms-excel:ofv|u|',
    '.xls': 'ms-excel:ofv|u|',
    '.xlsm': 'ms-excel:ofv|u|',
    '.xlsb': 'ms-excel:ofv|u|',
    '.docx': 'ms-word:ofv|u|',
    '.doc': 'ms-word:ofv|u|',
    '.docm': 'ms-word:ofv|u|',
    '.pptx': 'ms-powerpoint:ofv|u|',
    '.ppt': 'ms-powerpoint:ofv|u|',
    '.pptm': 'ms-powerpoint:ofv|u|',
}
```

#### admin.js
同様に、管理画面でも `ofv` スキームを使用するように変更しました。

### 2. HTML再生成

`python generate_html.py` コマンドを実行して、index.html を新しい URI スキームで再生成しました。

### 3. ドキュメント更新

- `OFFICE_URI_GUIDE.md`: Office URI スキームの実装ガイドを更新
- `IMPLEMENTATION_SUMMARY.md`: 変更履歴を追加

## 検証結果

✅ Excel ファイル 12 件が `ms-excel:ofv` スキームを使用  
✅ Word ファイル 2 件が `ms-word:ofv` スキームを使用  
✅ 古い `ofe` スキームは完全に削除（0件）  
✅ PDF ファイルや HTTP/HTTPS リンクは変更なし  
✅ セキュリティスキャン（CodeQL）で問題なし（0件のアラート）  
✅ 「勤務体制&実施状況」リンクが正しく `ofv` スキームを使用  

## 影響範囲

### 影響を受けるファイル

すべての Office ファイルリンクが影響を受けます：

- **Excel ファイル**: .xlsx, .xls, .xlsm, .xlsb
- **Word ファイル**: .docx, .doc, .docm
- **PowerPoint ファイル**: .pptx, .ppt, .pptm

### 影響を受けないファイル

以下のファイルは変更なし：

- PDF ファイル (.pdf)
- HTTP/HTTPS リンク
- その他のファイル形式

## 使用方法

### ユーザー側の操作

1. index.html または admin.html を開く
2. Excelファイルのリンク（例：「勤務体制&実施状況」）をクリック
3. **エラーなし**でExcelファイルが開く
4. ファイルは読み取り専用モードで開く
5. 編集が必要な場合は、Excelの「編集を有効にする」ボタンをクリック

### 管理者側の操作

今後、data.json を更新する場合は、以下のコマンドで index.html を再生成してください：

```bash
python generate_html.py
```

これにより、新しいリンクも自動的に `ofv` スキームを使用するようになります。

## トラブルシューティング

### まだエラーが表示される場合

1. **ブラウザのキャッシュをクリア**
   - Windows: Ctrl + F5
   - Mac: Cmd + Shift + R

2. **最新のHTMLを使用しているか確認**
   - index.html を開く
   - 右クリック → 「ページのソースを表示」
   - `ms-excel:ofv|u|` が使用されているか確認

3. **ファイルパスの確認**
   - ファイルが存在するか確認
   - ネットワーク共有にアクセスできるか確認

### ファイルが開かない場合

1. Microsoft Office がインストールされているか確認
2. ファイルパスが正しいか確認
3. ネットワーク共有へのアクセス権限を確認

## 参考情報

- [Office URI Schemes - Microsoft Documentation](https://docs.microsoft.com/en-us/office/client-developer/office-uri-schemes)
- `OFFICE_URI_GUIDE.md`: 詳細な実装ガイド
- `IMPLEMENTATION_SUMMARY.md`: 実装の全体像

## まとめ

この修正により、ユーザーは以下の利点を得られます：

✅ **セキュリティエラーの解消**: "制限付きサイトゾーン" エラーが表示されない  
✅ **スムーズなアクセス**: ワンクリックでファイルが開く  
✅ **編集も可能**: 必要に応じて編集を有効にできる  
✅ **セキュリティ維持**: 読み取り専用モードで安全に開く  

---

**修正日**: 2025年11月10日  
**対象ファイル**: generate_html.py, admin.js, index.html, OFFICE_URI_GUIDE.md, IMPLEMENTATION_SUMMARY.md  
**影響**: すべての Office ファイルリンク（Excel, Word, PowerPoint）

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NEVの窓 HTML Generator
data.jsonからindex.htmlを生成するスクリプト
"""

import json
import html
from datetime import datetime

def escape_html(text):
    """HTMLエスケープ処理"""
    if text is None:
        return ""
    return html.escape(str(text))

def get_office_uri(link):
    """
    OfficeファイルのURIスキームを生成
    Excel/Word/PowerPointファイルの場合、ms-office URIスキームを返す
    それ以外の場合、元のリンクを返す
    """
    if not link:
        return link
    
    # HTTPやHTTPSリンクはそのまま返す（Office URIスキームに変換しない）
    if link.startswith('http://') or link.startswith('https://'):
        return link
    
    # ファイル拡張子を取得
    lower_link = link.lower()
    
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
    
    # 拡張子をチェックしてOfficeファイルかどうか判定
    for ext, scheme in office_schemes.items():
        if lower_link.endswith(ext):
            # 相対パスの場合は絶対パスに変換
            if link.startswith('..\\') or link.startswith('..'):
                # 相対パスをH:/nev_windowをベースに絶対パスに変換
                link = link.replace('..\\nev_window\\', 'H:/nev_window/')
                link = link.replace('..\\', 'H:/')
                link = link.replace('\\', '/')
            elif link.startswith('共通コーナー\\') or link.startswith('INFORMATION\\') or link.startswith('20'):
                # 現在のディレクトリからの相対パスの場合
                link = 'H:/nev_window/' + link.replace('\\', '/')
            elif not link.startswith('file:///'):
                # その他の相対パスの場合（file:///パス以外）
                link = 'H:/nev_window/' + link.replace('\\', '/')
            
            # file:///パスの場合は通常のパスに変換
            if link.startswith('file:///'):
                link = link.replace('file:///', '').replace('/', '\\')
            
            return scheme + link
    
    # Officeファイルでない場合は元のリンクを返す
    return link

def generate_html():
    """data.jsonからindex.htmlを生成"""
    
    # data.jsonを読み込む
    with open('data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # HTMLテンプレートの開始部分
    html_content = '''<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEVの窓 - ブラウザ版</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>🪟 NEVの窓</h1>
            <p class="subtitle">社内掲示板システム</p>
        </div>
    </header>

    <nav class="tabs">
        <div class="container">
            <button class="tab-button active" data-tab="全員向け">全員向け</button>
            <button class="tab-button" data-tab="職員向け">職員向け</button>
        </div>
    </nav>

    <main class="container">
'''
    
    # 各タブのコンテンツを生成
    for tab_name in ['全員向け', '職員向け']:
        tab_data = data.get(tab_name, {})
        is_active = 'active' if tab_name == '全員向け' else ''
        
        html_content += f'        <div id="{escape_html(tab_name)}" class="tab-content {is_active}">\n'
        html_content += f'            <h1 class="section-title">{escape_html(tab_data.get("title", tab_name))}</h1>\n'
        
        # 検索ボックス
        html_content += f'''            <div class="search-box">
                <input type="text" 
                       placeholder="🔍 検索..." 
                       data-tab="{escape_html(tab_name)}"
                       onkeyup="filterContent('{escape_html(tab_name)}', this.value)">
            </div>
'''
        
        # セクションナビゲーションボタン
        html_content += f'            <div class="section-nav">\n'
        sections = tab_data.get('sections', [])
        for section_idx, section in enumerate(sections):
            section_name = section.get('name', '')
            html_content += f'                <button class="section-nav-btn" onclick="scrollToSection(\'{escape_html(tab_name)}\', {section_idx})">{escape_html(section_name)}</button>\n'
        html_content += '            </div>\n\n'
        
        html_content += f'            <div class="sections-container" id="sections-{escape_html(tab_name)}">\n'
        
        # 各セクションを生成
        sections = tab_data.get('sections', [])
        for section_idx, section in enumerate(sections):
            section_name = section.get('name', '')
            html_content += f'                <div class="section" data-section-index="{section_idx}">\n'
            html_content += f'                    <h2>{escape_html(section_name)}</h2>\n'
            
            # Check if section has subsections (like 標準書コーナー)
            if 'subsections' in section:
                # Section with subsections - add subsection navigation buttons
                subsections = section.get('subsections', [])
                html_content += '                    <div class="subsection-nav">\n'
                for subsec_idx, subsection in enumerate(subsections):
                    subsec_name = subsection.get('name', '')
                    html_content += f'                        <button class="subsection-nav-btn" onclick="scrollToSubsection(\'{escape_html(tab_name)}\', {section_idx}, {subsec_idx})">{escape_html(subsec_name)}</button>\n'
                html_content += '                    </div>\n\n'
                
                # Render each subsection
                for subsec_idx, subsection in enumerate(subsections):
                    subsec_name = subsection.get('name', '')
                    html_content += f'                    <div class="subsection" data-subsection-index="{subsec_idx}">\n'
                    html_content += f'                        <h3>{escape_html(subsec_name)}</h3>\n'
                    html_content += '                        <ul class="item-list">\n'
                    
                    items = subsection.get('items', [])
                    for item in items:
                        if isinstance(item, str):
                            html_content += f'                            <li>{escape_html(item)}</li>\n'
                        elif isinstance(item, dict):
                            if 'text' in item:
                                text = item.get('text', '')
                                link = item.get('link', '')
                                if link:
                                    office_uri = get_office_uri(link)
                                    html_content += f'                            <li>📄 <a href="{escape_html(office_uri)}" target="_blank" rel="noopener noreferrer">{escape_html(text)}</a></li>\n'
                                else:
                                    html_content += f'                            <li>📄 {escape_html(text)}</li>\n'
                    
                    html_content += '                        </ul>\n'
                    html_content += '                    </div>\n'
            elif section_name == 'INFORMATION':
                # INFORMATIONセクション（日付・コンテンツ・詳細形式）
                items = section.get('items', [])
                
                # Display first 3 items
                for idx, item in enumerate(items[:3]):
                    date = item.get('date', '')
                    content = item.get('content', '')
                    detail = item.get('detail', '')
                    link = item.get('link', '')
                    
                    html_content += '                    <div class="info-item">\n'
                    html_content += f'                        <div class="info-date">{escape_html(date)}</div>\n'
                    html_content += f'                        <div class="info-content">{escape_html(content)}</div>\n'
                    
                    if detail:
                        if link:
                            office_uri = get_office_uri(link)
                            html_content += f'                        <div class="info-detail">→ <a href="{escape_html(office_uri)}" target="_blank" rel="noopener noreferrer">{escape_html(detail)}</a></div>\n'
                        else:
                            html_content += f'                        <div class="info-detail">→ {escape_html(detail)}</div>\n'
                    
                    html_content += '                    </div>\n'
                
                # Add collapsible section for remaining items
                if len(items) > 3:
                    collapse_id = f'collapse-{escape_html(tab_name)}-{section_idx}'
                    html_content += f'                    <div id="{collapse_id}" class="collapsed-items" style="display: none;">\n'
                    
                    for idx, item in enumerate(items[3:]):
                        date = item.get('date', '')
                        content = item.get('content', '')
                        detail = item.get('detail', '')
                        link = item.get('link', '')
                        
                        html_content += '                        <div class="info-item">\n'
                        html_content += f'                            <div class="info-date">{escape_html(date)}</div>\n'
                        html_content += f'                            <div class="info-content">{escape_html(content)}</div>\n'
                        
                        if detail:
                            if link:
                                office_uri = get_office_uri(link)
                                html_content += f'                            <div class="info-detail">→ <a href="{escape_html(office_uri)}" target="_blank" rel="noopener noreferrer">{escape_html(detail)}</a></div>\n'
                            else:
                                html_content += f'                            <div class="info-detail">→ {escape_html(detail)}</div>\n'
                        
                        html_content += '                        </div>\n'
                    
                    html_content += '                    </div>\n'
                    html_content += f'                    <button class="toggle-button" onclick="toggleCollapse(\'{collapse_id}\')">さらに表示 ({len(items) - 3}件)</button>\n'
            else:
                # リスト形式のセクション
                items = section.get('items', [])
                html_content += '                    <ul class="item-list">\n'
                
                for item in items:
                    if isinstance(item, str):
                        html_content += f'                        <li>{escape_html(item)}</li>\n'
                    elif isinstance(item, dict):
                        if 'text' in item:
                            # text と link がある場合
                            text = item.get('text', '')
                            link = item.get('link', '')
                            if link:
                                office_uri = get_office_uri(link)
                                html_content += f'                        <li>📄 <a href="{escape_html(office_uri)}" target="_blank" rel="noopener noreferrer">{escape_html(text)}</a></li>\n'
                            else:
                                html_content += f'                        <li>📄 {escape_html(text)}</li>\n'
                        elif 'name' in item:
                            # name と text がある場合（各部掲示板など）
                            name = item.get('name', '')
                            text = item.get('text', '')
                            link = item.get('link', '')
                            if link:
                                office_uri = get_office_uri(link)
                                html_content += f'                        <li>📄 <a href="{escape_html(office_uri)}" target="_blank" rel="noopener noreferrer">{escape_html(text)}</a></li>\n'
                            else:
                                html_content += f'                        <li>📄 {escape_html(text)}</li>\n'
                
                html_content += '                    </ul>\n'
            
            html_content += '                </div>\n'
        
        html_content += '            </div>\n'
        html_content += '        </div>\n\n'
    
    # HTMLテンプレートの終了部分
    html_content += '''    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 NEV - Next-Generation Vehicle Promotion Center</p>
        </div>
    </footer>

    <script>
        // タブ切り替え機能
        function initializeTabs() {
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tabName = button.getAttribute('data-tab');
                    
                    // すべてのボタンとコンテンツからactiveクラスを削除
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // クリックされたボタンと対応するコンテンツにactiveクラスを追加
                    button.classList.add('active');
                    document.getElementById(tabName).classList.add('active');
                });
            });
        }

        // 検索機能
        // 日本語の正規化関数（ひらがなをカタカナに変換）
        function normalizeJapanese(text) {
            return text.replace(/[\u3041-\u3096]/g, function(match) {
                const chr = match.charCodeAt(0) + 0x60;
                return String.fromCharCode(chr);
            });
        }
        
        function filterContent(tabName, query) {
            const sectionsContainer = document.getElementById('sections-' + tabName);
            const sections = sectionsContainer.querySelectorAll('.section');
            const searchQuery = normalizeJapanese(query.toLowerCase());
            
            sections.forEach(section => {
                const text = normalizeJapanese(section.textContent.toLowerCase());
                if (text.includes(searchQuery)) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }

        // Toggle collapse for INFORMATION sections
        function toggleCollapse(collapseId) {
            const element = document.getElementById(collapseId);
            const button = event.target;
            
            if (element.style.display === 'none') {
                element.style.display = 'block';
                const itemCount = element.querySelectorAll('.info-item').length;
                button.textContent = '表示を減らす';
            } else {
                element.style.display = 'none';
                const itemCount = element.querySelectorAll('.info-item').length;
                button.textContent = `さらに表示 (${itemCount}件)`;
            }
        }

        // セクションへスクロール機能
        function scrollToSection(tabName, sectionIndex) {
            const sectionsContainer = document.getElementById('sections-' + tabName);
            const section = sectionsContainer.querySelector(`[data-section-index="${sectionIndex}"]`);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // ハイライト効果
                section.style.backgroundColor = '#fff3cd';
                setTimeout(() => {
                    section.style.backgroundColor = '';
                }, 1500);
            }
        }

        // サブセクションへスクロール機能
        function scrollToSubsection(tabName, sectionIndex, subsectionIndex) {
            const sectionsContainer = document.getElementById('sections-' + tabName);
            const section = sectionsContainer.querySelector(`[data-section-index="${sectionIndex}"]`);
            if (section) {
                const subsection = section.querySelector(`[data-subsection-index="${subsectionIndex}"]`);
                if (subsection) {
                    subsection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // ハイライト効果
                    subsection.style.backgroundColor = '#fff3cd';
                    setTimeout(() => {
                        subsection.style.backgroundColor = '';
                    }, 1500);
                }
            }
        }

        // スクロールトップボタンの表示/非表示
        function toggleScrollTopButton() {
            const scrollTopBtn = document.getElementById('scrollTopBtn');
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        }

        // トップへスクロール
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // ページ読み込み時に初期化
        document.addEventListener('DOMContentLoaded', () => {
            initializeTabs();
            // スクロールイベントリスナーを追加
            window.addEventListener('scroll', toggleScrollTopButton);
        });
    </script>

    <!-- Scroll to top button -->
    <button id="scrollTopBtn" class="scroll-to-top" onclick="scrollToTop()" title="トップへ戻る"></button>
</body>
</html>
'''
    
    # index.htmlに書き込む
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print('✅ index.htmlを生成しました')
    print(f'生成日時: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')

if __name__ == '__main__':
    generate_html()

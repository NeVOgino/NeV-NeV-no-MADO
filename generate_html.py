#!/usr/bin/env python3
"""
Generate HTML files from the structured JSON data
"""
import json

def generate_html(data):
    """Generate HTML files for both sections"""
    
    # Generate index page
    generate_index_page()
    
    # Generate 全員向け page
    generate_all_staff_page(data['全員向け'])
    
    # Generate 職員向け page
    generate_staff_page(data['職員向け'])

def generate_index_page():
    """Generate the main index page"""
    html = """<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEVの窓 - トップページ</title>
    <style>
        body {
            font-family: 'Meiryo', 'Yu Gothic', sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.1em;
        }
        .section-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .section-card {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .section-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .section-card a {
            text-decoration: none;
            color: #2c3e50;
            display: block;
        }
        .section-card h2 {
            margin: 0 0 10px 0;
            font-size: 1.8em;
            color: #3498db;
        }
        .section-card p {
            margin: 0;
            color: #7f8c8d;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NEVの窓</h1>
        <p>次世代自動車振興センター 情報ポータル</p>
    </div>
    
    <div class="section-links">
        <div class="section-card">
            <a href="all_staff.html">
                <h2>全員向け</h2>
                <p>全職員共通の情報・お知らせ</p>
            </a>
        </div>
        <div class="section-card">
            <a href="staff.html">
                <h2>職員向け</h2>
                <p>職員専用の規程・標準書等</p>
            </a>
        </div>
    </div>
    
    <div class="footer">
        <p>© 次世代自動車振興センター (NeV)</p>
    </div>
</body>
</html>
"""
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Generated: index.html")

def generate_all_staff_page(data):
    """Generate the 全員向け page"""
    html = """<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEVの窓 - 全員向け</title>
    <style>
        body {
            font-family: 'Meiryo', 'Yu Gothic', sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
        }
        .nav {
            margin-bottom: 20px;
        }
        .nav a {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-right: 10px;
        }
        .nav a:hover {
            background-color: #2980b9;
        }
        .section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            margin-top: 0;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #3498db;
            color: white;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        ul {
            list-style-type: none;
            padding-left: 0;
        }
        ul li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        ul li:before {
            content: "▶ ";
            color: #3498db;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NEVの窓 - 全員向け</h1>
    </div>
    
    <div class="nav">
        <a href="index.html">トップページ</a>
        <a href="staff.html">職員向け</a>
    </div>
    
    <div class="section">
        <h2>INFORMATION</h2>
        <table>
            <thead>
                <tr>
                    <th>発信日</th>
                    <th>内容</th>
                    <th>詳細内容（リンク先名）</th>
                </tr>
            </thead>
            <tbody>
"""
    
    for entry in data['information']:
        html += f"""                <tr>
                    <td>{entry['date']}</td>
                    <td>{entry['content']}</td>
                    <td>{entry['detail']}</td>
                </tr>
"""
    
    html += """            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>共通コーナー（全職員向け）</h2>
        <ul>
"""
    
    for item in data['共通コーナー']:
        html += f"            <li>{item}</li>\n"
    
    html += """        </ul>
    </div>
    
    <div class="section">
        <h2>会議室予約</h2>
        <ul>
"""
    
    for item in data['会議室予約']:
        html += f"            <li>{item}</li>\n"
    
    html += """        </ul>
    </div>
</body>
</html>
"""
    
    with open('all_staff.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Generated: all_staff.html")

def generate_staff_page(data):
    """Generate the 職員向け page with subdivisions"""
    html = """<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEVの窓 - 職員向け</title>
    <style>
        body {
            font-family: 'Meiryo', 'Yu Gothic', sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
        }
        .nav {
            margin-bottom: 20px;
        }
        .nav a {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-right: 10px;
        }
        .nav a:hover {
            background-color: #2980b9;
        }
        .section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            margin-top: 0;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .subdivision {
            margin-bottom: 25px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #3498db;
            border-radius: 4px;
        }
        .subdivision h3 {
            margin-top: 0;
            color: #2c3e50;
            font-size: 1.3em;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #3498db;
            color: white;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        ul {
            list-style-type: none;
            padding-left: 0;
        }
        ul li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        ul li:before {
            content: "▶ ";
            color: #3498db;
        }
        .grid-layout {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NEVの窓 - 職員向け</h1>
    </div>
    
    <div class="nav">
        <a href="index.html">トップページ</a>
        <a href="all_staff.html">全員向け</a>
    </div>
    
    <div class="section">
        <h2>INFORMATION</h2>
        <table>
            <thead>
                <tr>
                    <th>発信日</th>
                    <th>内容</th>
                    <th>詳細内容</th>
                </tr>
            </thead>
            <tbody>
"""
    
    for entry in data['information']:
        html += f"""                <tr>
                    <td>{entry['date']}</td>
                    <td>{entry['content']}</td>
                    <td>{entry['detail']}</td>
                </tr>
"""
    
    html += """            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>標準書コーナー</h2>
"""
    
    # Add each subdivision
    subdivisions_order = ['基本規則', '稟議・契約関係', '組織・運営', '就業規則・出張・旅費他', '安全衛生他', 'ITセキュリティ関係他', 'その他']
    
    for subdivision in subdivisions_order:
        items = data['標準書コーナー'][subdivision]
        html += f"""        <div class="subdivision">
            <h3>{subdivision}</h3>
            <ul>
"""
        for item in items:
            html += f"                <li>{item}</li>\n"
        
        html += """            </ul>
        </div>
"""
    
    html += """    </div>
    
    <div class="section">
        <h2>職員向け情報コーナー</h2>
        <ul>
"""
    
    for item in data['職員向け情報コーナー']:
        html += f"            <li>{item}</li>\n"
    
    html += """        </ul>
    </div>
    
    <div class="section">
        <h2>各種帳票フォーマット</h2>
        <ul>
"""
    
    for item in data['各種帳票フォーマット']:
        html += f"            <li>{item}</li>\n"
    
    html += """        </ul>
    </div>
</body>
</html>
"""
    
    with open('staff.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Generated: staff.html")

def main():
    # Load the JSON data
    with open('data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("Generating HTML files...")
    generate_html(data)
    print("\nHTML files generated successfully!")
    print("- index.html (main page)")
    print("- all_staff.html (全員向け)")
    print("- staff.html (職員向け with 標準書コーナー subdivisions)")

if __name__ == '__main__':
    main()

// タブ切り替え機能
function showTab(tabName) {
    // すべてのタブコンテンツを非表示
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // すべてのタブボタンを非アクティブ化
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // 選択されたタブを表示
    document.getElementById(tabName).classList.add('active');
    
    // 対応するボタンをアクティブ化
    event.target.classList.add('active');
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('NeVの窓 ポータルが読み込まれました');
    
    // デフォルトで「全員向け」タブを表示
    document.getElementById('everyone').classList.add('active');
});

// リンクのクリックイベント（デモ用）
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('link')) {
        // 実際のファイルリンクがない場合のデモ動作
        if (event.target.getAttribute('href') === '#') {
            event.preventDefault();
            alert('このリンクは後でファイルのURLに置き換えてください。\n\n編集方法：\n1. index.htmlを開く\n2. 該当するリンクを探す\n3. href="#" を実際のファイルURLに変更する');
        }
    }
});

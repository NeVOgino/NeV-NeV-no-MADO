// Load data and initialize the admin interface
let boardData = {};
let originalData = {};

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load data from JSON file
async function loadData() {
    try {
        const response = await fetch('data.json');
        boardData = await response.json();
        originalData = JSON.parse(JSON.stringify(boardData)); // Deep copy
        renderAdminContent('全員向け');
        renderAdminContent('職員向け');
    } catch (error) {
        console.error('Error loading data:', error);
        alert('データの読み込みに失敗しました。');
    }
}

// Render admin content for a specific tab
function renderAdminContent(tabName) {
    const container = document.getElementById(tabName);
    const data = boardData[tabName];
    
    if (!data) return;
    
    let html = `<h1 class="section-title">${escapeHtml(data.title)}</h1>`;
    
    const escapedTabName = escapeHtml(tabName);
    data.sections.forEach((section, sectionIndex) => {
        html += `
            <div class="edit-section" id="section-${escapedTabName}-${sectionIndex}">
                <h2>
                    ${escapeHtml(section.name)}
                    <button class="edit-button" onclick="editSection('${escapedTabName}', ${sectionIndex})">
                        ✏️ 編集
                    </button>
                </h2>
                
                <div class="section-preview" id="preview-${escapedTabName}-${sectionIndex}">
                    ${renderSectionPreview(section)}
                </div>
                
                <div class="section-editor-container" id="editor-${escapedTabName}-${sectionIndex}" style="display: none;">
                    <textarea class="section-editor" id="textarea-${escapedTabName}-${sectionIndex}">
${JSON.stringify(section, null, 2)}
                    </textarea>
                    <div class="button-group">
                        <button class="save-button" onclick="saveSection('${escapedTabName}', ${sectionIndex})">
                            💾 保存
                        </button>
                        <button class="cancel-button" onclick="cancelEdit('${escapedTabName}', ${sectionIndex})">
                            ❌ キャンセル
                        </button>
                    </div>
                    <div class="success-message" id="success-${tabName}-${sectionIndex}">
                        ✅ 保存しました！「data.jsonをダウンロード」ボタンでファイルを保存してください。
                    </div>
                    <div class="error-message" id="error-${tabName}-${sectionIndex}">
                        ❌ エラー：JSONの形式が正しくありません。
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Render section preview
function renderSectionPreview(section) {
    let html = '';
    
    if (section.name === 'INFORMATION' || section.name.includes('INFORMATION')) {
        section.items.forEach(item => {
            if (typeof item === 'object' && item.date) {
                const detailContent = item.link 
                    ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.detail)}</a>`
                    : escapeHtml(item.detail);
                
                html += `
                    <div class="info-item">
                        <div class="info-date">${escapeHtml(item.date)}</div>
                        <div class="info-content">${escapeHtml(item.content)}</div>
                        ${item.detail ? `<div class="info-detail">→ ${detailContent}</div>` : ''}
                    </div>
                `;
            }
        });
    } else {
        html += '<ul class="item-list">';
        section.items.forEach(item => {
            if (typeof item === 'string') {
                html += `<li>${escapeHtml(item)}</li>`;
            } else if (item.text) {
                // New structure with text and optional link
                const itemContent = item.link 
                    ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.text)}</a>`
                    : escapeHtml(item.text);
                html += `<li>${itemContent}</li>`;
            } else if (item.name) {
                // Department board structure
                const itemText = item.link 
                    ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.text)}</a>`
                    : escapeHtml(item.text);
                html += `<li><strong>${escapeHtml(item.name)}</strong> - ${itemText}</li>`;
            }
        });
        html += '</ul>';
    }
    
    return html;
}

// Edit section
function editSection(tabName, sectionIndex) {
    const preview = document.getElementById(`preview-${tabName}-${sectionIndex}`);
    const editor = document.getElementById(`editor-${tabName}-${sectionIndex}`);
    const editButton = document.querySelector(`#section-${tabName}-${sectionIndex} .edit-button`);
    
    preview.style.display = 'none';
    editor.style.display = 'block';
    editButton.style.display = 'none';
}

// Save section
function saveSection(tabName, sectionIndex) {
    const textarea = document.getElementById(`textarea-${tabName}-${sectionIndex}`);
    const successMsg = document.getElementById(`success-${tabName}-${sectionIndex}`);
    const errorMsg = document.getElementById(`error-${tabName}-${sectionIndex}`);
    
    try {
        const updatedSection = JSON.parse(textarea.value);
        boardData[tabName].sections[sectionIndex] = updatedSection;
        
        // Update preview
        const preview = document.getElementById(`preview-${tabName}-${sectionIndex}`);
        preview.innerHTML = renderSectionPreview(updatedSection);
        
        // Hide editor, show preview
        cancelEdit(tabName, sectionIndex);
        
        // Show success message
        successMsg.classList.add('show');
        errorMsg.classList.remove('show');
        
        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 5000);
        
    } catch (error) {
        console.error('Error parsing JSON:', error);
        errorMsg.classList.add('show');
        successMsg.classList.remove('show');
    }
}

// Cancel edit
function cancelEdit(tabName, sectionIndex) {
    const preview = document.getElementById(`preview-${tabName}-${sectionIndex}`);
    const editor = document.getElementById(`editor-${tabName}-${sectionIndex}`);
    const editButton = document.querySelector(`#section-${tabName}-${sectionIndex} .edit-button`);
    
    preview.style.display = 'block';
    editor.style.display = 'none';
    editButton.style.display = 'inline-block';
}

// Download data as JSON file
function downloadData() {
    const dataStr = JSON.stringify(boardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('data.jsonをダウンロードしました。このファイルを元のdata.jsonと置き換えて、変更を反映させてください。');
}

// Upload data from JSON file
function uploadData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const newData = JSON.parse(e.target.result);
            boardData = newData;
            renderAdminContent('全員向け');
            renderAdminContent('職員向け');
            alert('データをアップロードしました。');
        } catch (error) {
            console.error('Error parsing uploaded file:', error);
            alert('ファイルの読み込みに失敗しました。JSONフォーマットを確認してください。');
        }
    };
    reader.readAsText(file);
}

// Tab switching functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeTabs();
});

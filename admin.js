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
        if (!response.ok) {
            throw new Error('Failed to load data.json');
        }
        boardData = await response.json();
        originalData = JSON.parse(JSON.stringify(boardData)); // Deep copy
        renderAdminContent('全員向け');
        renderAdminContent('職員向け');
        console.log('✅ データの読み込みが完了しました');
    } catch (error) {
        console.error('Error loading data:', error);
        // データ読み込み失敗時は空の状態で初期化
        console.log('⚠️ data.jsonの読み込みに失敗しました。「📤 data.jsonをアップロード」ボタンからファイルを読み込んでください。');
        showUploadPrompt();
    }
}

// Show upload prompt when data loading fails
function showUploadPrompt() {
    const containers = ['全員向け', '職員向け'];
    containers.forEach(tabName => {
        const container = document.getElementById(tabName);
        container.innerHTML = `
            <div style="background: #fff3cd; border: 2px dashed #ffc107; border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
                <h2 style="color: #856404; margin-bottom: 15px;">📤 data.jsonをアップロードしてください</h2>
                <p style="color: #856404; margin-bottom: 20px;">
                    編集を開始するには、まず「📤 data.jsonをアップロード」ボタンをクリックして、
                    <br>既存のdata.jsonファイルを読み込んでください。
                </p>
                <button class="upload-button" onclick="document.getElementById('fileInput').click()" style="font-size: 1.2em; padding: 15px 30px;">
                    📤 data.jsonをアップロード
                </button>
            </div>
        `;
    });
}

// Render admin content for a specific tab
function renderAdminContent(tabName) {
    const container = document.getElementById(tabName);
    const data = boardData[tabName];
    
    if (!data) return;
    
    let html = `<h1 class="section-title">${escapeHtml(data.title)}</h1>`;
    
    // Add section navigation buttons
    html += '<div class="section-nav">';
    data.sections.forEach((section, index) => {
        html += `<button class="section-nav-btn" onclick="scrollToAdminSection('${escapeHtml(tabName)}', ${index})">${escapeHtml(section.name)}</button>`;
    });
    html += '</div>';
    
    const escapedTabName = escapeHtml(tabName);
    data.sections.forEach((section, sectionIndex) => {
        html += `
            <div class="edit-section" id="section-${escapedTabName}-${sectionIndex}" data-section-index="${sectionIndex}">
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
        const totalItems = section.items.length;
        const visibleItems = section.items.slice(0, 3);
        const hiddenItems = section.items.slice(3);
        
        // Show first 3 items
        visibleItems.forEach(item => {
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
        
        // Add collapsible section for remaining items if there are more than 3
        if (hiddenItems.length > 0) {
            const collapseId = `collapse-${section.name.replace(/\s+/g, '-')}`;
            html += `<div class="collapsed-items" id="${collapseId}" style="display: none;">`;
            hiddenItems.forEach(item => {
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
            html += '</div>';
            html += `
                <button class="toggle-collapse-btn" onclick="toggleAdminCollapse('${collapseId}', this)">
                    さらに表示 (${hiddenItems.length}件)
                </button>
            `;
        }
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
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #d4edda; border: 2px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 10000; font-size: 1.1em; font-weight: 600;';
            successDiv.innerHTML = '✅ data.jsonを正常に読み込みました！<br>編集を開始できます。';
            document.body.appendChild(successDiv);
            
            setTimeout(() => {
                successDiv.remove();
            }, 5000);
            
            console.log('✅ data.jsonを正常に読み込みました');
        } catch (error) {
            console.error('Error parsing uploaded file:', error);
            alert('❌ ファイルの読み込みに失敗しました。\n\nJSONフォーマットを確認してください。\n\nエラー内容: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input so the same file can be uploaded again
    event.target.value = '';
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

// Toggle collapse for INFORMATION sections
function toggleAdminCollapse(collapseId, button) {
    const collapsedItems = document.getElementById(collapseId);
    const isExpanded = collapsedItems.style.display === 'block';
    
    if (isExpanded) {
        collapsedItems.style.display = 'none';
        const hiddenCount = collapsedItems.querySelectorAll('.info-item').length;
        button.textContent = `さらに表示 (${hiddenCount}件)`;
    } else {
        collapsedItems.style.display = 'block';
        button.textContent = '表示を減らす';
    }
}

// Scroll to top functionality
// Scroll to a specific section with highlighting
function scrollToAdminSection(tabName, sectionIndex) {
    const sectionId = `section-${tabName}-${sectionIndex}`;
    const section = document.getElementById(sectionId);
    
    if (section) {
        // Scroll to the section
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add highlight effect
        section.style.backgroundColor = '#fff9c4';
        setTimeout(() => {
            section.style.backgroundColor = '';
        }, 1500);
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button based on scroll position
window.addEventListener('scroll', function() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeTabs();
});

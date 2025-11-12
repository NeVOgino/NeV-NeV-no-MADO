// Load data and initialize the admin interface
let boardData = {};
let originalData = {};

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get Office URI scheme for Office files
function getOfficeUri(link) {
    if (!link) return link;
    
    // HTTP/HTTPS links remain unchanged
    if (link.startsWith('http://') || link.startsWith('https://')) {
        return link;
    }
    
    const lowerLink = link.toLowerCase();
    
    // Office URI scheme mapping
    // Using ofv (Office File View) to avoid security warnings
    // ofv opens files in read-only mode, users can enable editing if needed
    const officeSchemes = {
        '.xlsx': 'ms-excel:ofv|u|',
        '.xls': 'ms-excel:ofv|u|',
        '.xlsm': 'ms-excel:ofv|u|',
        '.xlsb': 'ms-excel:ofv|u|',
        '.docx': 'ms-word:ofv|u|',
        '.doc': 'ms-word:ofv|u|',
        '.docm': 'ms-word:ofv|u|',
        '.pptx': 'ms-powerpoint:ofv|u|',
        '.ppt': 'ms-powerpoint:ofv|u|',
        '.pptm': 'ms-powerpoint:ofv|u|'
    };
    
    // Check if it's an Office file
    for (const [ext, scheme] of Object.entries(officeSchemes)) {
        if (lowerLink.endsWith(ext)) {
            let path = link;
            
            // Convert relative paths to absolute paths
            if (path.startsWith('..\\') || path.startsWith('..')) {
                path = path.replace('..\\nev_window\\', 'H:/nev_window/');
                path = path.replace('..\\', 'H:/');
                path = path.replace(/\\/g, '/');
            } else if (path.startsWith('H:\\') || path.startsWith('H:/')) {
                // Already an absolute H: drive path, just convert backslashes to forward slashes
                path = path.replace(/\\/g, '/');
            } else if (path.startsWith('共通コーナー\\') || path.startsWith('INFORMATION\\') || path.startsWith('20')) {
                path = 'H:/nev_window/' + path.replace(/\\/g, '/');
            } else if (!path.startsWith('file:///')) {
                path = 'H:/nev_window/' + path.replace(/\\/g, '/');
            }
            
            // Convert file:/// paths
            if (path.startsWith('file:///')) {
                path = path.replace('file:///', '').replace(/\//g, '\\');
            }
            
            return scheme + path;
        }
    }
    
    // Not an Office file, return as-is
    return link;
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
        console.log('⚠️ data.jsonの読み込みに失敗しました。「📂 初めに：data.jsonよみこみ」ボタンからファイルを読み込んでください。');
        // Initialize with empty data structure
        boardData = { '全員向け': { title: '全員向け', sections: [] }, '職員向け': { title: '職員向け', sections: [] } };
        originalData = JSON.parse(JSON.stringify(boardData));
    }
}

// Render admin content for a specific tab
function renderAdminContent(tabName) {
    const container = document.getElementById(tabName);
    const data = boardData[tabName];
    
    if (!data) return;
    
    let html = `<h1 class="section-title">${escapeHtml(data.title)}</h1>`;
    
    // Add button to add new section
    html += `<button class="add-item-btn" style="margin-bottom: 20px;" onclick="showAddSectionModal('${escapeHtml(tabName)}')">
        ➕ セクションを追加
    </button>`;
    
    // Add section navigation buttons
    html += '<div class="section-nav">';
    data.sections.forEach((section, index) => {
        html += `<button class="section-nav-btn" onclick="scrollToAdminSection('${escapeHtml(tabName)}', ${index})">${escapeHtml(section.name)}</button>`;
    });
    html += '</div>';
    
    const escapedTabName = escapeHtml(tabName);
    data.sections.forEach((section, sectionIndex) => {
        const totalSections = data.sections.length;
        html += `
            <div class="edit-section" id="section-${escapedTabName}-${sectionIndex}" data-section-index="${sectionIndex}">
                <h2>
                    ${escapeHtml(section.name)}
                    <span class="section-actions">
                        ${sectionIndex > 0 ? `<button class="item-action-btn move-up-btn" onclick="moveSectionUp('${escapedTabName}', ${sectionIndex})" title="セクションを上に移動">↑</button>` : ''}
                        ${sectionIndex < totalSections - 1 ? `<button class="item-action-btn move-down-btn" onclick="moveSectionDown('${escapedTabName}', ${sectionIndex})" title="セクションを下に移動">↓</button>` : ''}
                        <button class="edit-button" onclick="editSection('${escapedTabName}', ${sectionIndex})">
                            ✏️ 編集
                        </button>
                        <button class="item-action-btn delete-btn" onclick="deleteSection('${escapedTabName}', ${sectionIndex})" title="セクションを削除">🗑️</button>
                    </span>
                </h2>
                
                <div class="section-preview" id="preview-${escapedTabName}-${sectionIndex}">
                    ${renderSectionPreview(section, tabName, sectionIndex)}
                </div>
                
                <button class="add-item-btn" onclick="showAddItemModal('${escapedTabName}', ${sectionIndex})">
                    ➕ 項目を追加
                </button>
                
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

// Helper function to generate action buttons for items
function generateItemActionButtons(tabName, sectionIndex, itemIdx, totalItems, isSubsection = false, subsectionIndex = null) {
    let buttons = '';
    
    // Move up button (disabled if first item)
    if (itemIdx > 0) {
        buttons += `<button class="item-action-btn move-up-btn" onclick="moveItemUp('${escapeHtml(tabName)}', ${sectionIndex}, ${itemIdx}, ${isSubsection}, ${subsectionIndex})">↑</button>`;
    }
    
    // Move down button (disabled if last item)
    if (itemIdx < totalItems - 1) {
        buttons += `<button class="item-action-btn move-down-btn" onclick="moveItemDown('${escapeHtml(tabName)}', ${sectionIndex}, ${itemIdx}, ${isSubsection}, ${subsectionIndex})">↓</button>`;
    }
    
    // Move to another section button
    buttons += `<button class="item-action-btn" onclick="moveItem('${escapeHtml(tabName)}', ${sectionIndex}, ${itemIdx}, ${isSubsection}, ${subsectionIndex})">移動</button>`;
    
    // Delete button
    buttons += `<button class="item-action-btn delete-btn" onclick="deleteItem('${escapeHtml(tabName)}', ${sectionIndex}, ${itemIdx}, ${isSubsection}, ${subsectionIndex})">削除</button>`;
    
    return `<span class="item-actions">${buttons}</span>`;
}

// Render section preview
function renderSectionPreview(section, tabName, sectionIndex) {
    let html = '';
    
    // Check if section has subsections
    if (section.subsections) {
        // Render subsection navigation
        html += '<div class="subsection-nav">';
        section.subsections.forEach((subsec, idx) => {
            html += `<button class="subsection-nav-btn" onclick="scrollToAdminSubsection(${idx})">${escapeHtml(subsec.name)}</button>`;
        });
        html += '</div>';
        
        // Render each subsection
        section.subsections.forEach((subsec, idx) => {
            html += `<div class="subsection" data-subsection-index="${idx}">`;
            html += `<h3>${escapeHtml(subsec.name)}</h3>`;
            html += '<ul class="item-list">';
            subsec.items.forEach((item, itemIdx) => {
                if (typeof item === 'string') {
                    html += `<li>${escapeHtml(item)}${generateItemActionButtons(tabName, sectionIndex, itemIdx, subsec.items.length, true, idx)}</li>`;
                } else if (item.text) {
                    const itemContent = item.link 
                        ? `<a href="${escapeHtml(getOfficeUri(item.link))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.text)}</a>`
                        : escapeHtml(item.text);
                    html += `<li>${itemContent}${generateItemActionButtons(tabName, sectionIndex, itemIdx, subsec.items.length, true, idx)}</li>`;
                }
            });
            html += '</ul>';
            html += '</div>';
        });
    } else if (section.name === 'INFORMATION' || section.name.includes('INFORMATION')) {
        const totalItems = section.items.length;
        const visibleItems = section.items.slice(0, 3);
        const hiddenItems = section.items.slice(3);
        
        // Show first 3 items
        visibleItems.forEach((item, itemIdx) => {
            if (typeof item === 'object' && item.date) {
                const detailContent = item.link 
                    ? `<a href="${escapeHtml(getOfficeUri(item.link))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.detail)}</a>`
                    : escapeHtml(item.detail);
                
                html += `
                    <div class="info-item">
                        <div class="info-date">${escapeHtml(item.date)}</div>
                        <div class="info-content">${escapeHtml(item.content)}</div>
                        ${item.detail ? `<div class="info-detail">→ ${detailContent}</div>` : ''}
                        ${generateItemActionButtons(tabName, sectionIndex, itemIdx, section.items.length)}
                    </div>
                `;
            }
        });
        
        // Add collapsible section for remaining items if there are more than 3
        if (hiddenItems.length > 0) {
            const collapseId = `collapse-${section.name.replace(/\s+/g, '-')}`;
            html += `<div class="collapsed-items" id="${collapseId}" style="display: none;">`;
            hiddenItems.forEach((item, idx) => {
                const itemIdx = idx + 3; // Offset by 3 for the visible items
                if (typeof item === 'object' && item.date) {
                    const detailContent = item.link 
                        ? `<a href="${escapeHtml(getOfficeUri(item.link))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.detail)}</a>`
                        : escapeHtml(item.detail);
                    
                    html += `
                        <div class="info-item">
                            <div class="info-date">${escapeHtml(item.date)}</div>
                            <div class="info-content">${escapeHtml(item.content)}</div>
                            ${item.detail ? `<div class="info-detail">→ ${detailContent}</div>` : ''}
                            ${generateItemActionButtons(tabName, sectionIndex, itemIdx, section.items.length)}
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
        section.items.forEach((item, itemIdx) => {
            if (typeof item === 'string') {
                html += `<li>${escapeHtml(item)}${generateItemActionButtons(tabName, sectionIndex, itemIdx, section.items.length)}</li>`;
            } else if (item.text) {
                // New structure with text and optional link
                const itemContent = item.link 
                    ? `<a href="${escapeHtml(getOfficeUri(item.link))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.text)}</a>`
                    : escapeHtml(item.text);
                html += `<li>${itemContent}${generateItemActionButtons(tabName, sectionIndex, itemIdx, section.items.length)}</li>`;
            } else if (item.name) {
                // Department board structure
                const itemText = item.link 
                    ? `<a href="${escapeHtml(getOfficeUri(item.link))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.text)}</a>`
                    : escapeHtml(item.text);
                html += `<li><strong>${escapeHtml(item.name)}</strong> - ${itemText}${generateItemActionButtons(tabName, sectionIndex, itemIdx, section.items.length)}</li>`;
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
        preview.innerHTML = renderSectionPreview(updatedSection, tabName, sectionIndex);
        
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
    
    // Generate timestamp for backup filename
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    
    // Download backup file first
    const backupUrl = URL.createObjectURL(dataBlob);
    const backupLink = document.createElement('a');
    backupLink.href = backupUrl;
    backupLink.download = `data_編集前バックアップ_${timestamp}.json`;
    document.body.appendChild(backupLink);
    backupLink.click();
    document.body.removeChild(backupLink);
    URL.revokeObjectURL(backupUrl);
    
    // Wait a moment before downloading the main file
    setTimeout(() => {
        // Download main data.json file
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`data.jsonをダウンロードしました。\nバックアップファイル（data_編集前バックアップ_${timestamp}.json）も保存されました。\n\n重要：バックアップファイルは「json_backup」フォルダに保存してください。\ndata.jsonを元のファイルと置き換えて、変更を反映させてください。`);
    }, 500);
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

// Scroll to a specific subsection with highlighting
function scrollToAdminSubsection(subsectionIndex) {
    const subsection = document.querySelector(`[data-subsection-index="${subsectionIndex}"]`);
    
    if (subsection) {
        // Scroll to the subsection
        subsection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add highlight effect
        subsection.style.backgroundColor = '#fff9c4';
        setTimeout(() => {
            subsection.style.backgroundColor = '';
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

// Modal state management
let currentModalAction = null;
let currentModalData = null;

// Move item to another section
function moveItem(tabName, sectionIndex, itemIndex, isSubsection = false, subsectionIndex = null) {
    const modal = document.getElementById('actionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = '項目を移動';
    
    // Get the item to move
    let item;
    if (isSubsection) {
        item = boardData[tabName].sections[sectionIndex].subsections[subsectionIndex].items[itemIndex];
    } else {
        item = boardData[tabName].sections[sectionIndex].items[itemIndex];
    }
    
    // Get item display text
    let itemText = '';
    if (typeof item === 'string') {
        itemText = item;
    } else if (item.text) {
        itemText = item.text;
    } else if (item.content) {
        itemText = item.content;
    } else if (item.name) {
        itemText = item.name;
    }
    
    // Build section selection dropdown
    let html = `
        <div class="form-group">
            <label>移動する項目:</label>
            <p style="padding: 10px; background: #f8f9fa; border-radius: 5px;">${escapeHtml(itemText)}</p>
        </div>
        <div class="form-group">
            <label>移動先タブ:</label>
            <select id="targetTab" onchange="updateTargetSections()">
    `;
    
    // Add tab options
    Object.keys(boardData).forEach(tab => {
        html += `<option value="${escapeHtml(tab)}">${escapeHtml(tab)}</option>`;
    });
    
    html += `
            </select>
        </div>
        <div class="form-group">
            <label>移動先セクション:</label>
            <select id="targetSection">
                <!-- Will be populated by updateTargetSections() -->
            </select>
        </div>
    `;
    
    modalBody.innerHTML = html;
    
    // Store action data
    currentModalAction = 'move';
    currentModalData = { tabName, sectionIndex, itemIndex, isSubsection, subsectionIndex };
    
    // Populate sections for the default tab
    updateTargetSections();
    
    // Show modal
    modal.classList.add('active');
}

// Update target sections when tab changes
function updateTargetSections() {
    const targetTab = document.getElementById('targetTab').value;
    const targetSectionSelect = document.getElementById('targetSection');
    
    const sections = boardData[targetTab].sections;
    let html = '';
    sections.forEach((section, index) => {
        html += `<option value="${index}">${escapeHtml(section.name)}</option>`;
    });
    
    targetSectionSelect.innerHTML = html;
}

// Show add item modal
function showAddItemModal(tabName, sectionIndex) {
    const modal = document.getElementById('actionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = '項目を追加';
    
    const section = boardData[tabName].sections[sectionIndex];
    
    // Determine item type based on section structure
    let html = `
        <div class="form-group">
            <label>追加先セクション:</label>
            <p style="padding: 10px; background: #f8f9fa; border-radius: 5px;">${escapeHtml(section.name)}</p>
        </div>
    `;
    
    // Check if this is an INFORMATION section
    if (section.name === 'INFORMATION' || section.name.includes('INFORMATION')) {
        html += `
            <div class="form-group">
                <label>日付:</label>
                <input type="text" id="itemDate" placeholder="例: 2025.11.10">
            </div>
            <div class="form-group">
                <label>内容:</label>
                <input type="text" id="itemContent" placeholder="お知らせのタイトル" required>
            </div>
            <div class="form-group">
                <label>詳細:</label>
                <input type="text" id="itemDetail" placeholder="詳細情報">
            </div>
            <div class="form-group">
                <label>リンク先 (オプション):</label>
                <input type="text" id="itemLink" placeholder="例: INFORMATION\\ファイル名.pdf">
            </div>
        `;
    } else {
        // For other sections with text/link structure
        html += `
            <div class="form-group">
                <label>テキスト:</label>
                <input type="text" id="itemText" placeholder="項目名" required>
            </div>
            <div class="form-group">
                <label>リンク先 (オプション):</label>
                <input type="text" id="itemLink" placeholder="例: 共通コーナー\\ファイル名.pdf">
            </div>
        `;
    }
    
    modalBody.innerHTML = html;
    
    // Store action data
    currentModalAction = 'add';
    currentModalData = { tabName, sectionIndex };
    
    // Show modal
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('actionModal');
    modal.classList.remove('active');
    currentModalAction = null;
    currentModalData = null;
}

// Confirm modal action
function confirmModalAction() {
    if (currentModalAction === 'move') {
        confirmMoveItem();
    } else if (currentModalAction === 'add') {
        confirmAddItem();
    } else if (currentModalAction === 'addSection') {
        confirmAddSection();
    }
}

// Confirm move item action
function confirmMoveItem() {
    const { tabName, sectionIndex, itemIndex, isSubsection, subsectionIndex } = currentModalData;
    
    const targetTab = document.getElementById('targetTab').value;
    const targetSectionIndex = parseInt(document.getElementById('targetSection').value);
    
    // Get the item to move
    let item;
    if (isSubsection) {
        item = boardData[tabName].sections[sectionIndex].subsections[subsectionIndex].items[itemIndex];
        // Remove from source
        boardData[tabName].sections[sectionIndex].subsections[subsectionIndex].items.splice(itemIndex, 1);
    } else {
        item = boardData[tabName].sections[sectionIndex].items[itemIndex];
        // Remove from source
        boardData[tabName].sections[sectionIndex].items.splice(itemIndex, 1);
    }
    
    // Add to target at the top (index 0)
    boardData[targetTab].sections[targetSectionIndex].items.unshift(item);
    
    // Refresh both affected sections
    renderAdminContent(tabName);
    if (targetTab !== tabName) {
        renderAdminContent(targetTab);
    }
    
    closeModal();
    
    alert('項目を移動しました。「data.jsonかきこみ」ボタンをクリックして保存してください。');
}

// Confirm add item action
function confirmAddItem() {
    const { tabName, sectionIndex } = currentModalData;
    const section = boardData[tabName].sections[sectionIndex];
    
    let newItem;
    
    // Check if this is an INFORMATION section
    if (section.name === 'INFORMATION' || section.name.includes('INFORMATION')) {
        const date = document.getElementById('itemDate').value.trim();
        const content = document.getElementById('itemContent').value.trim();
        const detail = document.getElementById('itemDetail').value.trim();
        const link = document.getElementById('itemLink').value.trim();
        
        if (!content) {
            alert('内容は必須です。');
            return;
        }
        
        newItem = {
            date: date || '',
            content: content,
            detail: detail || '',
            link: link || ''
        };
    } else {
        const text = document.getElementById('itemText').value.trim();
        const link = document.getElementById('itemLink').value.trim();
        
        if (!text) {
            alert('テキストは必須です。');
            return;
        }
        
        newItem = {
            text: text,
            link: link || ''
        };
    }
    
    // Add the new item at the top (index 0) instead of bottom
    boardData[tabName].sections[sectionIndex].items.unshift(newItem);
    
    // Refresh the section
    renderAdminContent(tabName);
    
    closeModal();
    
    alert('項目を追加しました。「data.jsonかきこみ」ボタンをクリックして保存してください。');
}

// Move item up within the same section
function moveItemUp(tabName, sectionIndex, itemIndex, isSubsection = false, subsectionIndex = null) {
    if (itemIndex === 0) return; // Already at the top
    
    let items;
    if (isSubsection) {
        items = boardData[tabName].sections[sectionIndex].subsections[subsectionIndex].items;
    } else {
        items = boardData[tabName].sections[sectionIndex].items;
    }
    
    // Swap with the item above
    const temp = items[itemIndex];
    items[itemIndex] = items[itemIndex - 1];
    items[itemIndex - 1] = temp;
    
    // Refresh the section
    renderAdminContent(tabName);
}

// Move item down within the same section
function moveItemDown(tabName, sectionIndex, itemIndex, isSubsection = false, subsectionIndex = null) {
    let items;
    if (isSubsection) {
        items = boardData[tabName].sections[sectionIndex].subsections[subsectionIndex].items;
    } else {
        items = boardData[tabName].sections[sectionIndex].items;
    }
    
    if (itemIndex === items.length - 1) return; // Already at the bottom
    
    // Swap with the item below
    const temp = items[itemIndex];
    items[itemIndex] = items[itemIndex + 1];
    items[itemIndex + 1] = temp;
    
    // Refresh the section
    renderAdminContent(tabName);
}

// Delete item from section
function deleteItem(tabName, sectionIndex, itemIndex, isSubsection = false, subsectionIndex = null) {
    // Get item details for confirmation
    let items;
    if (isSubsection) {
        items = boardData[tabName].sections[sectionIndex].subsections[subsectionIndex].items;
    } else {
        items = boardData[tabName].sections[sectionIndex].items;
    }
    
    const item = items[itemIndex];
    let itemText = '';
    
    // Get item display text for confirmation
    if (typeof item === 'string') {
        itemText = item;
    } else if (item.text) {
        itemText = item.text;
    } else if (item.content) {
        itemText = item.content;
    } else if (item.name) {
        itemText = item.name;
    }
    
    // Confirm deletion
    if (!confirm(`「${itemText}」を削除してもよろしいですか？\n\nこの操作は取り消せません。削除後、「data.jsonかきこみ」ボタンで保存してください。`)) {
        return;
    }
    
    // Remove the item
    items.splice(itemIndex, 1);
    
    // Refresh the section
    renderAdminContent(tabName);
    
    alert('項目を削除しました。「data.jsonかきこみ」ボタンをクリックして保存してください。');
}

// Add new section to a tab
function showAddSectionModal(tabName) {
    const modal = document.getElementById('actionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'セクションを追加';
    
    modalBody.innerHTML = `
        <div class="form-group">
            <label for="sectionName">セクション名:</label>
            <input type="text" id="sectionName" placeholder="例: 新しいセクション" required>
        </div>
    `;
    
    currentModalAction = 'addSection';
    currentModalData = { tabName };
    
    modal.classList.add('active');
}

// Confirm add section
function confirmAddSection() {
    const { tabName } = currentModalData;
    const sectionName = document.getElementById('sectionName').value.trim();
    
    if (!sectionName) {
        alert('セクション名は必須です。');
        return;
    }
    
    // Create new section
    const newSection = {
        name: sectionName,
        items: []
    };
    
    // Add to the beginning of sections array
    boardData[tabName].sections.unshift(newSection);
    
    // Refresh the tab
    renderAdminContent(tabName);
    
    closeModal();
    
    alert('セクションを追加しました。「data.jsonかきこみ」ボタンをクリックして保存してください。');
}

// Move section up
function moveSectionUp(tabName, sectionIndex) {
    if (sectionIndex === 0) return; // Already at the top
    
    const sections = boardData[tabName].sections;
    
    // Swap with the section above
    const temp = sections[sectionIndex];
    sections[sectionIndex] = sections[sectionIndex - 1];
    sections[sectionIndex - 1] = temp;
    
    // Refresh the tab
    renderAdminContent(tabName);
}

// Move section down
function moveSectionDown(tabName, sectionIndex) {
    const sections = boardData[tabName].sections;
    
    if (sectionIndex === sections.length - 1) return; // Already at the bottom
    
    // Swap with the section below
    const temp = sections[sectionIndex];
    sections[sectionIndex] = sections[sectionIndex + 1];
    sections[sectionIndex + 1] = temp;
    
    // Refresh the tab
    renderAdminContent(tabName);
}

// Delete section
function deleteSection(tabName, sectionIndex) {
    const section = boardData[tabName].sections[sectionIndex];
    
    // Confirm deletion
    if (!confirm(`セクション「${section.name}」を削除してもよろしいですか？\n\nこのセクション内のすべての項目も削除されます。この操作は取り消せません。`)) {
        return;
    }
    
    // Remove the section
    boardData[tabName].sections.splice(sectionIndex, 1);
    
    // Refresh the tab
    renderAdminContent(tabName);
    
    alert('セクションを削除しました。「data.jsonかきこみ」ボタンをクリックして保存してください。');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeTabs();
});

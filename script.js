// Load data and initialize the application
let boardData = {};

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
        renderTabContent('全員向け');
        renderTabContent('職員向け');
    } catch (error) {
        console.error('Error loading data:', error);
        alert('データの読み込みに失敗しました。');
    }
}

// Render content for a specific tab
function renderTabContent(tabName) {
    const container = document.getElementById(tabName);
    const data = boardData[tabName];
    
    if (!data) return;
    
    let html = `<h1 class="section-title">${escapeHtml(data.title)}</h1>`;
    
    // Add search box
    const escapedTabName = escapeHtml(tabName);
    html += `
        <div class="search-box">
            <input type="text" 
                   placeholder="🔍 検索..." 
                   data-tab="${escapedTabName}"
                   onkeyup="filterContent(this.dataset.tab, this.value)">
        </div>
    `;
    
    html += '<div class="sections-container" id="sections-' + escapedTabName + '">';
    
    data.sections.forEach((section, index) => {
        html += `<div class="section" data-section-index="${index}">`;
        html += `<h2>${escapeHtml(section.name)}</h2>`;
        
        if (section.name === 'INFORMATION') {
            // Render information items with date, content, and detail
            section.items.forEach(item => {
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
            });
        } else {
            // Render as a list
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
        
        html += '</div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Filter content based on search query
function filterContent(tabName, query) {
    const sectionsContainer = document.getElementById('sections-' + tabName);
    const sections = sectionsContainer.querySelectorAll('.section');
    const searchQuery = query.toLowerCase();
    
    sections.forEach(section => {
        const text = section.textContent.toLowerCase();
        if (text.includes(searchQuery)) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
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

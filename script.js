// Load data and initialize the application
let boardData = {};

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
    
    let html = `<h1 class="section-title">${data.title}</h1>`;
    
    // Add search box
    html += `
        <div class="search-box">
            <input type="text" 
                   placeholder="🔍 検索..." 
                   onkeyup="filterContent('${tabName}', this.value)">
        </div>
    `;
    
    html += '<div class="sections-container" id="sections-' + tabName + '">';
    
    data.sections.forEach((section, index) => {
        html += `<div class="section" data-section-index="${index}">`;
        html += `<h2>${section.name}</h2>`;
        
        if (section.name === 'INFORMATION') {
            // Render information items with date, content, and detail
            section.items.forEach(item => {
                html += `
                    <div class="info-item">
                        <div class="info-date">${item.date}</div>
                        <div class="info-content">${item.content}</div>
                        ${item.detail ? `<div class="info-detail">→ ${item.detail}</div>` : ''}
                    </div>
                `;
            });
        } else {
            // Render as a list
            html += '<ul class="item-list">';
            section.items.forEach(item => {
                if (typeof item === 'string') {
                    html += `<li>${item}</li>`;
                } else if (item.name) {
                    html += `<li><strong>${item.name}</strong>${item.link ? ` - ${item.link}` : ''}</li>`;
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

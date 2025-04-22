/**
 * 時間軸處理類
 */
class Timeline {
    constructor(dataUrl) {
        this.dataUrl = dataUrl;
        this.timelineData = null;
        this.timelineContent = document.querySelector('.timeline-content');
        this.companies = ['OpenAI', 'Google', 'Anthropic', 'Meta', '其他'];
        this.activeCompany = null; // 當前激活的公司
        this.currentEvent = null; // 當前展開的事件
        this.initialize();
        this.createOverlay();
    }

    /**
     * 初始化時間軸
     */
    async initialize() {
        try {
            // 加載時間軸數據
            this.timelineData = await this.loadData();
            
            // 根據日期排序事件（從新到舊）
            this.sortEventsByDate();
            
            // 按日期分組事件
            const eventsByDate = this.groupEventsByDate();
            
            // 渲染時間軸
            this.renderTimeline(eventsByDate);
            
            // 初始化公司篩選功能
            this.initializeCompanyFilter();
            
        } catch (error) {
            console.error('初始化時間軸失敗:', error);
            this.timelineContent.innerHTML = '<div class="error-message">載入時間軸數據失敗，請重新整理頁面。</div>';
        }
    }

    /**
     * 創建遮罩和展開卡片容器
     */
    createOverlay() {
        // 創建遮罩層
        this.overlay = document.createElement('div');
        this.overlay.className = 'overlay';
        document.body.appendChild(this.overlay);
        
        // 創建展開卡片容器
        this.expandedCard = document.createElement('div');
        this.expandedCard.className = 'expanded-card';
        this.overlay.appendChild(this.expandedCard);
        
        // 創建關閉按鈕
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => this.closeExpandedCard());
        this.expandedCard.appendChild(closeButton);
        
        // 點擊遮罩層關閉
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeExpandedCard();
            }
        });
        
        // 按ESC鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeExpandedCard();
            }
        });
    }

    /**
     * 加載時間軸數據
     */
    async loadData() {
        const response = await fetch(this.dataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * 根據日期排序事件（從新到舊）
     */
    sortEventsByDate() {
        this.timelineData.sort((a, b) => {
            const dateA = new Date(a.time);
            const dateB = new Date(b.time);
            return dateB - dateA; // 從新到舊排序
        });
    }

    /**
     * 按具體日期分組事件
     */
    groupEventsByDate() {
        const eventsByDate = {};
        
        this.timelineData.forEach(event => {
            const date = new Date(event.time);
            const year = date.getFullYear().toString();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;
            
            if (!eventsByDate[year]) {
                eventsByDate[year] = {};
            }
            
            if (!eventsByDate[year][dateKey]) {
                eventsByDate[year][dateKey] = {
                    date: date,
                    events: {}
                };
                
                // 為每個公司初始化空陣列
                this.companies.forEach(company => {
                    eventsByDate[year][dateKey].events[company] = [];
                });
            }
            
            // 判斷事件屬於哪個公司
            const title = event.title;
            let company = '其他';
            
            if (title.includes('OpenAI')) {
                company = 'OpenAI';
            } else if (title.includes('Google')) {
                company = 'Google';
            } else if (title.includes('Anthropic')) {
                company = 'Anthropic';
            } else if (title.includes('Meta')) {
                company = 'Meta';
            }
            
            // 將事件添加到對應公司
            eventsByDate[year][dateKey].events[company].push(event);
        });
        
        return eventsByDate;
    }

    /**
     * 渲染時間軸
     */
    renderTimeline(eventsByDate) {
        // 清空時間軸內容
        this.timelineContent.innerHTML = '';
        
        // 按年份遍歷
        Object.keys(eventsByDate).sort((a, b) => b - a).forEach(year => {
            // 創建年份區塊
            const yearSection = document.createElement('div');
            yearSection.className = 'year-section';
            
            // 添加年份標記
            const yearMarker = document.createElement('div');
            yearMarker.className = 'year-marker';
            yearMarker.textContent = year;
            yearSection.appendChild(yearMarker);
            
            // 按日期遍歷該年的事件
            const dates = Object.keys(eventsByDate[year]).sort((a, b) => {
                return new Date(b) - new Date(a); // 從新到舊排序
            });
            
            dates.forEach(dateKey => {
                const dateData = eventsByDate[year][dateKey];
                
                // 創建時間軸行
                const row = document.createElement('div');
                row.className = 'timeline-row';
                
                // 添加日期小圓點容器 - 作為第一列
                const dateContainer = document.createElement('div');
                dateContainer.className = 'date-container';
                
                // 添加日期小圓點
                const date = dateData.date;
                const dateMonth = date.getMonth() + 1;
                const dateDay = date.getDate();
                const datePoint = document.createElement('div');
                datePoint.className = 'date-point';
                datePoint.innerHTML = `<span>${dateMonth}.${dateDay}</span>`;
                dateContainer.appendChild(datePoint);
                row.appendChild(dateContainer);
                
                // 遍歷每個公司，創建事件卡片或空白單元格
                this.companies.forEach(company => {
                    const companyEvents = dateData.events[company];
                    const cell = document.createElement('div');
                    cell.className = 'company-cell';
                    cell.setAttribute('data-company', company);
                    
                    if (companyEvents.length > 0) {
                        // 如果該公司在這個日期有事件，創建事件卡片
                        const event = companyEvents[0]; // 取第一個事件
                        const timelineItem = this.createEventElement(event, company);
                        
                        // 添加點擊事件
                        timelineItem.addEventListener('click', () => {
                            this.expandCard(event, company);
                        });
                        
                        cell.appendChild(timelineItem);
                    }
                    
                    row.appendChild(cell);
                });
                
                yearSection.appendChild(row);
            });
            
            // 將年份區塊添加到時間軸
            this.timelineContent.appendChild(yearSection);
        });
    }

    /**
     * 創建事件元素
     */
    createEventElement(event, company) {
        // 創建事件項目元素
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${company}`;
        timelineItem.setAttribute('data-company', company);
        
        // 事件卡片內容 - 只顯示標題和縮小的圖片
        timelineItem.innerHTML = `
            <div class="company-label">${company}</div>
            <div class="event-card">
                <h3 class="event-title">${event.title}</h3>
                ${event.image ? `<img class="event-image thumbnail" src="${event.image}" alt="${event.title}">` : ''}
            </div>
        `;
        
        return timelineItem;
    }

    /**
     * 加載事件內容
     */
    async loadEventContent(event) {
        try {
            const date = new Date(event.time);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const fileName = `${dateStr}#${event.title}`;
            // fileName 中不能有特殊字符，所以需要做 url encode
            const encodedFileName = encodeURIComponent(fileName);
            const response = await fetch(`data/timeline_event_content/${encodedFileName}.md`);
            
            if (!response.ok) {
                throw new Error(`無法載入內容文件: ${fileName}.md`);
            }
            
            const content = await response.text();
            return this.markdownToHtml(content);
        } catch (error) {
            console.error('加載事件內容失敗:', error);
            return `<p>無法載入事件內容。</p>`;
        }
    }
    
    /**
     * 將Markdown轉換為HTML
     */
    markdownToHtml(markdown) {
        // 簡單的Markdown轉HTML實現
        let html = markdown
            // 將連續換行轉換為段落
            .replace(/\n\n/g, '</p><p>')
            // 處理標題
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 處理列表項
            .replace(/^\* (.*?)$/gm, '<li>$1</li>')
            // 將列表項包裝在ul中
            .replace(/<li>.*?<\/li>/gs, match => `<ul>${match}</ul>`)
            // 處理連結
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // 確保包裝在段落中
        if (!html.startsWith('<p>')) {
            html = `<p>${html}`;
        }
        if (!html.endsWith('</p>')) {
            html = `${html}</p>`;
        }
        
        return html;
    }

    /**
     * 展開卡片
     */
    async expandCard(event, company) {
        // 設置當前事件
        this.currentEvent = event;
        
        // 獲取日期
        const date = new Date(event.time);
        
        // 格式化日期
        const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        
        // 添加載入中提示
        this.expandedCard.innerHTML = `
            <button class="close-button">×</button>
            <div class="loading-indicator">載入中...</div>
        `;
        
        // 顯示遮罩和卡片
        this.overlay.classList.add('active');
        setTimeout(() => {
            this.expandedCard.classList.add('active');
        }, 50);
        
        // 禁止背景滾動
        document.body.style.overflow = 'hidden';
        
        // 加載事件內容
        const content = await this.loadEventContent(event);
        
        // 提取參考資料連結
        const referenceLinks = this.extractReferenceLinks(content);
        
        // 填充展開卡片內容
        this.expandedCard.innerHTML = `
            <button class="close-button">×</button>
            <div class="company-tag ${company}">${company}</div>
            <h2 class="expanded-title">${event.title}</h2>
            <div class="expanded-date">${formattedDate}</div>
            <div class="expanded-description">${content}</div>
            ${event.image ? 
                `<div class="image-container">
                    <img class="expanded-image" src="${event.image}" alt="${event.title}">
                    ${event.image_caption ? `<div class="image-caption">${event.image_caption}</div>` : ''}
                    ${event.image_credit ? `<div class="image-credit">來源: ${event.image_credit}</div>` : ''}
                </div>` 
                : ''}
            
            ${referenceLinks ? 
                `<div class="reference-links">
                    <h3>參考資料</h3>
                    <ul>${referenceLinks}</ul>
                </div>`
                : ''}
        `;
        
        // 重新綁定關閉按鈕事件
        const closeButton = this.expandedCard.querySelector('.close-button');
        closeButton.addEventListener('click', () => this.closeExpandedCard());
    }
    
    /**
     * 從內容中提取參考資料連結
     */
    extractReferenceLinks(content) {
        const linkRegex = /<a href="(.*?)".*?>(.*?)<\/a>/g;
        let match;
        let links = '';
        
        while ((match = linkRegex.exec(content)) !== null) {
            links += `<li><a href="${match[1]}" target="_blank">${match[2]}</a></li>`;
        }
        
        return links;
    }
    
    /**
     * 關閉展開的卡片
     */
    closeExpandedCard() {
        // 移除卡片活動狀態
        this.expandedCard.classList.remove('active');
        
        // 延遲一下再隱藏遮罩，以便有動畫效果
        setTimeout(() => {
            this.overlay.classList.remove('active');
            // 恢復背景滾動
            document.body.style.overflow = '';
            // 清空當前事件
            this.currentEvent = null;
        }, 300);
    }

    /**
     * 初始化公司篩選功能
     */
    initializeCompanyFilter() {
        const companyColumns = document.querySelectorAll('.company-column');
        const timeColumnHeader = document.querySelector('.time-column-header');
        
        // 為每個公司欄位添加點擊事件
        companyColumns.forEach(column => {
            column.addEventListener('click', () => {
                const company = column.getAttribute('data-company');
                this.filterByCompany(company);
                
                // 更新激活狀態
                companyColumns.forEach(col => col.classList.remove('active'));
                column.classList.add('active');
            });
        });
        
        // 為時間欄位添加點擊事件（顯示所有公司）
        if (timeColumnHeader) {
            timeColumnHeader.addEventListener('click', () => {
                this.showAllCompanies();
                companyColumns.forEach(col => col.classList.remove('active'));
            });
        }
    }
    
    /**
     * 按公司篩選事件
     */
    filterByCompany(company) {
        this.activeCompany = company;
        const companyCells = document.querySelectorAll('.company-cell');
        
        companyCells.forEach(cell => {
            const cellCompany = cell.getAttribute('data-company');
            
            if (cellCompany === company) {
                cell.style.display = 'block';
            } else {
                cell.style.display = 'none';
            }
        });
        
        // 調整網格模板
        const rows = document.querySelectorAll('.timeline-row');
        rows.forEach(row => {
            row.style.gridTemplateColumns = '70px 1fr';
        });
        
        // 添加篩選中的類，以便可以應用不同的樣式
        document.body.classList.add('filtering');
        document.body.setAttribute('data-filtered-company', company);
    }
    
    /**
     * 顯示所有公司的事件
     */
    showAllCompanies() {
        this.activeCompany = null;
        const companyCells = document.querySelectorAll('.company-cell');
        
        companyCells.forEach(cell => {
            cell.style.display = 'block';
        });
        
        // 恢復原始網格模板
        const rows = document.querySelectorAll('.timeline-row');
        rows.forEach(row => {
            row.style.gridTemplateColumns = '70px repeat(5, 1fr)';
        });
        
        // 移除篩選類
        document.body.classList.remove('filtering');
        document.body.removeAttribute('data-filtered-company');
    }
} 
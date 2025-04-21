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
        this.timelineData.events.sort((a, b) => {
            const dateA = new Date(`${a.start_date.year}-${a.start_date.month}-${a.start_date.day}`);
            const dateB = new Date(`${b.start_date.year}-${b.start_date.month}-${b.start_date.day}`);
            return dateB - dateA; // 從新到舊排序
        });
    }

    /**
     * 按具體日期分組事件
     */
    groupEventsByDate() {
        const eventsByDate = {};
        
        this.timelineData.events.forEach(event => {
            const year = event.start_date.year;
            const month = event.start_date.month.padStart(2, '0');
            const day = event.start_date.day.padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;
            
            if (!eventsByDate[year]) {
                eventsByDate[year] = {};
            }
            
            if (!eventsByDate[year][dateKey]) {
                eventsByDate[year][dateKey] = {
                    date: new Date(dateKey),
                    events: {}
                };
                
                // 為每個公司初始化空陣列
                this.companies.forEach(company => {
                    eventsByDate[year][dateKey].events[company] = [];
                });
            }
            
            // 判斷事件屬於哪個公司
            const headline = event.text.headline;
            let company = '其他';
            
            if (headline.includes('OpenAI')) {
                company = 'OpenAI';
            } else if (headline.includes('Google')) {
                company = 'Google';
            } else if (headline.includes('Anthropic')) {
                company = 'Anthropic';
            } else if (headline.includes('Meta')) {
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
                datePoint.innerHTML = `<span>${dateMonth}</span><span>${dateDay}</span>`;
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
                <h3 class="event-title">${event.text.headline}</h3>
                ${event.media && event.media.url ? `<img class="event-image thumbnail" src="${event.media.url}" alt="${event.text.headline}">` : ''}
            </div>
        `;
        
        return timelineItem;
    }

    /**
     * 展開卡片
     */
    expandCard(event, company) {
        // 設置當前事件
        this.currentEvent = event;
        
        // 獲取日期
        const year = event.start_date.year;
        const month = event.start_date.month.padStart(2, '0');
        const day = event.start_date.day.padStart(2, '0');
        const dateObj = new Date(`${year}-${month}-${day}`);
        
        // 格式化日期
        const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        
        // 處理描述文本，保留HTML結構
        let description = event.text.text;
        
        // 禁止背景滾動
        document.body.style.overflow = 'hidden';
        
        // 填充展開卡片內容
        this.expandedCard.innerHTML = `
            <button class="close-button">×</button>
            <div class="company-tag ${company}">${company}</div>
            <h2 class="expanded-title">${event.text.headline}</h2>
            <div class="expanded-date">${formattedDate}</div>
            <div class="expanded-description">${description}</div>
            ${event.media && event.media.url ? 
                `<div class="image-container">
                    <img class="expanded-image" src="${event.media.url}" alt="${event.text.headline}">
                    ${event.media.caption ? `<div class="image-caption">${event.media.caption}</div>` : ''}
                    ${event.media.credit ? `<div class="image-credit">來源: ${event.media.credit}</div>` : ''}
                </div>` 
                : ''}
            
            ${event.text.headline.includes('發布') ? 
                `<div class="reference-links">
                    <h3>參考資料</h3>
                    <ul>
                        ${event.text.text.includes('href') ? 
                            event.text.text.match(/<a href=["'](.*?)["']/g)
                                ?.map(href => {
                                    const url = href.replace(/<a href=["']/, '').replace(/["']$/, '');
                                    return `<li><a href="${url}" target="_blank">${url}</a></li>`;
                                }).join('') || ''
                            : ''}
                    </ul>
                </div>`
                : ''}
        `;
        
        // 重新綁定關閉按鈕事件
        const closeButton = this.expandedCard.querySelector('.close-button');
        closeButton.addEventListener('click', () => this.closeExpandedCard());
        
        // 顯示遮罩和卡片
        this.overlay.classList.add('active');
        
        // 延遲一下再顯示卡片，以便有動畫效果
        setTimeout(() => {
            this.expandedCard.classList.add('active');
        }, 50);
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
/**
 * 主題管理類
 * 處理主題切換和持久存儲
 */
class ThemeManager {
    /**
     * 初始化主題管理器
     */
    constructor() {
        this.themeToggleBtn = null;
        this.prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 創建主題切換按鈕
        this.createThemeToggle();
        
        // 從本地存儲載入主題配置
        this.loadThemePreference();
        
        // 監聽系統主題變化
        this.listenForSystemThemeChanges();
    }

    /**
     * 創建主題切換按鈕
     */
    createThemeToggle() {
        // 檢查頁面上是否已有主題切換按鈕
        this.themeToggleBtn = document.getElementById('theme-toggle');
        
        // 如果沒有，創建一個
        if (!this.themeToggleBtn) {
            // 創建頭部動作區域，如果不存在
            let headerActions = document.querySelector('.header-actions');
            
            if (!headerActions) {
                const header = document.querySelector('.main-header');
                if (header) {
                    headerActions = document.createElement('div');
                    headerActions.className = 'header-actions';
                    header.appendChild(headerActions);
                } else {
                    // 如果沒有主頁頭，在body頂部添加按鈕
                    headerActions = document.createElement('div');
                    headerActions.className = 'theme-toggle-container';
                    headerActions.style.position = 'fixed';
                    headerActions.style.top = '20px';
                    headerActions.style.right = '20px';
                    headerActions.style.zIndex = '1000';
                    document.body.appendChild(headerActions);
                }
            }
            
            // 創建按鈕
            this.themeToggleBtn = document.createElement('button');
            this.themeToggleBtn.id = 'theme-toggle';
            this.themeToggleBtn.className = 'theme-toggle';
            this.themeToggleBtn.setAttribute('aria-label', '切換主題');
            headerActions.appendChild(this.themeToggleBtn);
        }
        
        // 設置事件監聽器
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    /**
     * 載入主題配置
     */
    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && this.prefersDarkScheme.matches)) {
            // 設置為深色主題
            document.body.setAttribute('data-theme', 'dark');
            this.updateToggleButton(true);
        } else {
            // 設置為淺色主題
            document.body.removeAttribute('data-theme');
            this.updateToggleButton(false);
        }
    }
    
    /**
     * 更新切換按鈕圖標
     * @param {boolean} isDark - 是否為深色主題
     */
    updateToggleButton(isDark) {
        if (this.themeToggleBtn) {
            // 使用月亮和太陽圖標切換
            this.themeToggleBtn.innerHTML = isDark 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }
    }

    /**
     * 切換主題
     */
    toggleTheme() {
        if (document.body.getAttribute('data-theme') === 'dark') {
            // 切換到淺色主題
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            this.updateToggleButton(false);
        } else {
            // 切換到深色主題
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            this.updateToggleButton(true);
        }
    }

    /**
     * 監聽系統主題變化
     */
    listenForSystemThemeChanges() {
        this.prefersDarkScheme.addEventListener('change', (e) => {
            // 只有當用戶沒有手動設置主題時，才會根據系統主題變化
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    // 系統切換到深色主題
                    document.body.setAttribute('data-theme', 'dark');
                    this.updateToggleButton(true);
                } else {
                    // 系統切換到淺色主題
                    document.body.removeAttribute('data-theme');
                    this.updateToggleButton(false);
                }
            }
        });
    }
}

// 在文檔加載完成後初始化主題管理器
document.addEventListener('DOMContentLoaded', () => {
    // 創建銀河背景
    const galaxyBg = document.createElement('div');
    galaxyBg.className = 'galaxy-bg';
    document.body.prepend(galaxyBg);
    
    // 初始化主題管理器
    new ThemeManager();
}); 
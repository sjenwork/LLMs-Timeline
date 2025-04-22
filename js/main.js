/**
 * 主JS文件，初始化時間軸和處理頁面事件
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初始化時間軸
    const timeline = new Timeline('data/timeline_events.json');
    
    // 處理窗口滾動事件
    window.addEventListener('scroll', () => {
        // 淡入淡出效果
        handleScrollFadeEffect();
        // 固定類別頭部
        handleStickyCategories();
    });
    
    // 處理窗口調整大小事件
    window.addEventListener('resize', () => {
        // 調整時間軸高度
        // adjustTimelineHeight();
        // 更新固定頭部
        handleStickyCategories();
    });
    
    // 初始調整時間軸高度
    // adjustTimelineHeight();
    
    // 更新頁腳年份
    updateFooterYear();
});

/**
 * 處理公司類別頭部的固定效果
 */
function handleStickyCategories() {
    const header = document.querySelector('.main-header');
    const categories = document.querySelector('.company-categories');
    const container = document.querySelector('.container');
    
    if (!header || !categories || !container) return;
    
    const headerHeight = header.offsetHeight;
    const containerTop = container.getBoundingClientRect().top;
    const categoriesHeight = categories.offsetHeight;
    
    // 當container滾動到main-header底部時，固定categories
    if (containerTop <= headerHeight) {
        categories.classList.add('fixed');
    } else {
        categories.classList.remove('fixed');
    }
    
    // 調整timeline-wrapper的上邊距，避免內容被固定的categories遮擋
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    if (timelineWrapper && categories.classList.contains('fixed')) {
        timelineWrapper.style.marginTop = `${categoriesHeight}px`;
    } else if (timelineWrapper) {
        timelineWrapper.style.marginTop = '0';
    }
}

/**
 * 滾動淡入淡出效果
 */
function handleScrollFadeEffect() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        const itemTop = item.getBoundingClientRect().top;
        const itemBottom = item.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;
        
        // 檢查項目是否在視窗中
        if (itemTop < windowHeight * 0.9 && itemBottom > 0) {
            // 計算不透明度（基於項目在視窗中的位置）
            const distance = Math.min(itemTop, windowHeight - itemBottom);
            const opacity = Math.max(0.8, 1 - (distance / (windowHeight * 0.3)));
            
            item.style.opacity = opacity;
        } else {
            item.style.opacity = 0.8;
        }
    });
}


/**
 * 更新頁腳年份
 */
function updateFooterYear() {
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
} 
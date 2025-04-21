/**
 * 主JS文件，初始化時間軸和處理頁面事件
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初始化時間軸
    const timeline = new Timeline('data/timeline_data.json');
    
    // 處理窗口滾動事件
    window.addEventListener('scroll', () => {
        // 淡入淡出效果
        handleScrollFadeEffect();
    });
    
    // 處理窗口調整大小事件
    window.addEventListener('resize', () => {
        // 調整時間軸高度
        adjustTimelineHeight();
    });
    
    // 初始調整時間軸高度
    adjustTimelineHeight();
    
    // 更新頁腳年份
    updateFooterYear();
});

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
 * 調整時間軸高度
 */
function adjustTimelineHeight() {
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    const headerHeight = document.querySelector('.company-categories').offsetHeight;
    
    if (timelineWrapper) {
        timelineWrapper.style.maxHeight = `calc(100vh - ${headerHeight + 40}px)`;
    }
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
// 사용자 알림 시스템
// 브라우저 알림, 푸시 알림, 소리 알림 지원

class NotificationSystem {
    constructor() {
        this.permission = 'default';
        this.isSupported = 'Notification' in window;
        this.isPushSupported = 'PushManager' in window;
        this.subscription = null;
        
        this.init();
    }

    // 알림 시스템 초기화
    async init() {
        console.log('🔔 알림 시스템 초기화 시작...');
        
        // 브라우저 알림 권한 요청
        if (this.isSupported) {
            await this.requestPermission();
        }
        
        // 푸시 알림 구독 (Service Worker 지원 시)
        if (this.isPushSupported && 'serviceWorker' in navigator) {
            await this.subscribeToPush();
        }
        
        // 주기적인 알림 스케줄링
        this.scheduleNotifications();
        
        console.log('✅ 알림 시스템 초기화 완료');
    }

    // 알림 권한 요청
    async requestPermission() {
        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return;
        }
        
        if (Notification.permission === 'denied') {
            this.permission = 'denied';
            console.warn('❌ 알림 권한이 거부되었습니다.');
            return;
        }
        
        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            
            if (permission === 'granted') {
                console.log('✅ 알림 권한이 허용되었습니다.');
                this.showNotification('알림 활성화', 'The One의 알림이 활성화되었습니다.');
            } else {
                console.warn('❌ 알림 권한이 거부되었습니다.');
            }
        } catch (error) {
            console.error('알림 권한 요청 실패:', error);
        }
    }

    // 푸시 알림 구독
    async subscribeToPush() {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            if (!registration) {
                console.warn('Service Worker가 등록되지 않았습니다.');
                return;
            }
            
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // VAPID 키 필요
            });
            
            this.subscription = subscription;
            console.log('✅ 푸시 알림 구독 성공:', subscription);
            
        } catch (error) {
            console.error('푸시 알림 구독 실패:', error);
        }
    }

    // 알림 표시
    showNotification(title, body, options = {}) {
        if (!this.isSupported || this.permission !== 'granted') {
            console.warn('알림을 표시할 수 없습니다:', {
                supported: this.isSupported,
                permission: this.permission
            });
            return;
        }

        const defaultOptions = {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'the-one-stock',
            renotify: true,
            requireInteraction: false,
            silent: false,
            ...options
        };

        try {
            const notification = new Notification(title, {
                body: body,
                ...defaultOptions
            });

            // 자동으로 알림 닫기 (5초 후)
            setTimeout(() => {
                notification.close();
            }, 5000);

            // 알림 클릭 이벤트
            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            console.log('📱 알림 표시:', title);
            
        } catch (error) {
            console.error('알림 표시 실패:', error);
        }
    }

    // 주식 알림
    showStockNotification(stockName, changePercent, action = 'update') {
        const isPositive = changePercent >= 0;
        const emoji = isPositive ? '📈' : '📉';
        const actionText = action === 'update' ? '업데이트' : '새로운 추천';
        
        const title = `${emoji} The One - ${actionText}`;
        const body = `${stockName}: ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
        
        this.showNotification(title, body, {
            tag: `stock-${stockName}`,
            icon: isPositive ? '/icons/green.png' : '/icons/red.png'
        });
    }

    // 새로운 추천 알림
    showNewStockNotification(stockName, analysis) {
        const title = '🎯 The One - 새로운 추천';
        const body = `오늘의 추천: ${stockName}`;
        
        this.showNotification(title, body, {
            tag: 'new-stock',
            icon: '/icons/blue.png',
            requireInteraction: false
        });
    }

    // 장 마감 알림
    showMarketCloseNotification() {
        const title = '🏁 The One - 장 마감';
        const body = '오늘의 추천 종목이 확정되었습니다.';
        
        this.showNotification(title, body, {
            tag: 'market-close',
            icon: '/icons/orange.png'
        });
    }

    // 시스템 알림
    showSystemNotification(message, type = 'info') {
        const title = '🔔 The One - 시스템';
        
        this.showNotification(title, message, {
            tag: 'system',
            icon: '/icons/gray.png'
        });
    }

    // 주기적인 알림 스케줄링
    scheduleNotifications() {
        // 매일 오전 9시: 새로운 추천 알림
        this.scheduleDailyNotification(9, 0, '🎯 오늘의 추천', '새로운 추천 종목을 확인하세요!');
        
        // 매일 오후 3시 30분: 장 마감 알림
        this.scheduleDailyNotification(15, 30, '🏁 장 마감', '오늘의 추천 종목이 확정되었습니다.');
        
        // 매 1시간: 가격 변동 알림 (실시간 데이터 사용 시)
        this.scheduleHourlyNotification();
    }

    // 특정 시간에 알림 스케줄링
    scheduleDailyNotification(hour, minute, title, message) {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hour, minute, 0, 0);
        
        // 이미 지났으면 다음 날로 설정
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        const timeUntilNotification = scheduledTime - now;
        
        setTimeout(() => {
            this.showNotification(title, message, {
                tag: 'scheduled',
                icon: '/icons/clock.png'
            });
            
            // 다음 날 같은 시간으로 다시 스케줄링
            this.scheduleDailyNotification(hour, minute, title, message);
        }, timeUntilNotification);
        
        console.log(`⏰ 알림 스케줄링: ${title} at ${scheduledTime.toLocaleString()}`);
    }

    // 매 시간 알림
    scheduleHourlyNotification() {
        setInterval(() => {
            const now = new Date();
            const hour = now.getHours();
            
            // 장 시간 (9시-16시)에만 알림
            if (hour >= 9 && hour <= 16 && currentStock) {
                // 실시간 가격 확인 및 알림
                this.checkPriceChange();
            }
        }, 60 * 60 * 1000); // 1시간마다
    }

    // 가격 변동 확인
    async checkPriceChange() {
        if (!currentStock || !currentStock.code) return;
        
        try {
            // API로 현재 가격 확인
            const response = await fetch(`/api/stock/${currentStock.code}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const newPrice = result.data.currentPrice;
                const oldPrice = currentStock.currentPrice;
                const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
                
                // 1% 이상 변동 시에만 알림
                if (Math.abs(changePercent) >= 1) {
                    this.showStockNotification(
                        currentStock.name, 
                        changePercent, 
                        'price_change'
                    );
                    
                    // 현재 가격 업데이트
                    currentStock.currentPrice = newPrice;
                }
            }
        } catch (error) {
            console.error('가격 변동 확인 실패:', error);
        }
    }

    // 알림 설정 관리
    getSettings() {
        const settings = localStorage.getItem('notificationSettings');
        return settings ? JSON.parse(settings) : {
            enabled: true,
            sound: true,
            desktop: true,
            push: false,
            schedule: {
                morning: true,
                marketClose: true,
                hourly: false
            }
        };
    }

    // 알림 설정 저장
    saveSettings(settings) {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        console.log('알림 설정 저장됨:', settings);
    }

    // 알림 설정 토글
    toggleNotification(type) {
        const settings = this.getSettings();
        settings.enabled = !settings.enabled;
        this.saveSettings(settings);
        
        const status = settings.enabled ? '활성화' : '비활성화';
        this.showSystemNotification(`알림이 ${status}되었습니다.`);
    }

    // 알림 권한 상태 확인
    getPermissionStatus() {
        return {
            supported: this.isSupported,
            permission: this.permission,
            granted: this.permission === 'granted'
        };
    }

    // 알림 히스토리
    getNotificationHistory() {
        const history = localStorage.getItem('notificationHistory');
        return history ? JSON.parse(history) : [];
    }

    // 알림 히스토리 저장
    saveNotificationHistory(notification) {
        const history = this.getNotificationHistory();
        history.unshift({
            ...notification,
            timestamp: new Date().toISOString()
        });
        
        // 최대 50개만 유지
        if (history.length > 50) {
            history.splice(50);
        }
        
        localStorage.setItem('notificationHistory', JSON.stringify(history));
    }
}

// 알림 아이콘 생성 (동적)
function createNotificationIcons() {
    const icons = ['green', 'red', 'blue', 'orange', 'gray', 'clock'];
    
    icons.forEach(color => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // 간단한 아이콘 생성
        ctx.fillStyle = color === 'green' ? '#4caf50' :
                      color === 'red' ? '#f44336' :
                      color === 'blue' ? '#2196f3' :
                      color === 'orange' ? '#ff9800' :
                      color === 'gray' ? '#9e9e9e' : '#666';
        
        ctx.beginPath();
        ctx.arc(32, 32, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        // 아이콘으로 변환 (실제로는 파일이 필요)
        console.log(`Created ${color} icon`);
    });
}

// 알림 시스템 전역 인스턴스 생성
let notificationSystem;

// 페이지 로드 시 알림 시스템 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 알림 아이콘 생성
    createNotificationIcons();
    
    // 알림 시스템 초기화
    notificationSystem = new NotificationSystem();
    
    // 알림 설정 UI 추가
    addNotificationUI();
    
    console.log('🔔 알림 시스템 로드 완료');
});

// 알림 UI 추가
function addNotificationUI() {
    const notificationToggle = document.createElement('button');
    notificationToggle.innerHTML = '🔔 알림';
    notificationToggle.className = 'notification-toggle';
    notificationToggle.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 107, 107, 0.9);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    notificationToggle.addEventListener('click', () => {
        notificationSystem.toggleNotification();
        const settings = notificationSystem.getSettings();
        notificationToggle.innerHTML = settings.enabled ? '🔔 알림' : '🔕 알림';
        notificationToggle.style.background = settings.enabled ? 'rgba(255, 107, 107, 0.9)' : 'rgba(128, 128, 128, 0.5)';
    });
    
    document.body.appendChild(notificationToggle);
}

// 주식 변경 시 알림
function notifyStockChange(stock, changePercent) {
    if (notificationSystem) {
        notificationSystem.showStockNotification(stock.name, changePercent);
    }
}

// 새로운 추천 시 알림
function notifyNewStock(stock) {
    if (notificationSystem) {
        notificationSystem.showNewStockNotification(stock.name, '새로운 추천 종목입니다.');
    }
}

// 장 마감 알림
function notifyMarketClose() {
    if (notificationSystem) {
        notificationSystem.showMarketCloseNotification();
    }
}

// 전역으로 알림 함수 노출
window.notifyStockChange = notifyStockChange;
window.notifyNewStock = notifyNewStock;
window.notifyMarketClose = notifyMarketClose;
window.NotificationSystem = NotificationSystem;

// Data Monitor App - Main JavaScript File
// Arabic Data Monitoring Application with Session Management

class DataMonitorApp {
    constructor() {
        this.users = this.loadUsers();
        this.sessions = this.loadSessions();
        this.currentUser = null;
        this.activeSession = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.populateUserDropdown();
        this.updateStats();
        this.loadRecentSessions();
        
        // Initialize based on current page
        const currentPage = window.location.pathname.split('/').pop();
        switch(currentPage) {
            case 'index.html':
            case '':
                this.initHomePage();
                break;
            case 'session.html':
                this.initSessionPage();
                break;
            case 'analytics.html':
                this.initAnalyticsPage();
                break;
            case 'users.html':
                this.initUsersPage();
                break;
        }
    }
    
    // Sample data for demonstration
    loadDefaultUsers() {
        return [
            {
                id: 'user1',
                name: 'أحمد محمد',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                totalUsage: 1.2,
                sessionCount: 5,
                createdAt: new Date('2024-01-15')
            },
            {
                id: 'user2',
                name: 'فاطمة الزهراء',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                totalUsage: 0.8,
                sessionCount: 3,
                createdAt: new Date('2024-02-10')
            },
            {
                id: 'user3',
                name: 'يوسف علي',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                totalUsage: 2.1,
                sessionCount: 8,
                createdAt: new Date('2024-01-20')
            },
            {
                id: 'user4',
                name: 'سارة أحمد',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                totalUsage: 1.5,
                sessionCount: 6,
                createdAt: new Date('2024-03-05')
            },
            {
                id: 'user5',
                name: 'خالد حسن',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                totalUsage: 0.9,
                sessionCount: 4,
                createdAt: new Date('2024-02-28')
            }
        ];
    }
    
    loadDefaultSessions() {
        const sessions = [];
        const now = new Date();
        
        // Generate sample sessions for the last 7 days
        for (let i = 0; i < 12; i++) {
            const userIndex = i % this.users.length;
            const sessionDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000) + Math.random() * 12 * 60 * 60 * 1000);
            const duration = Math.random() * 120 + 30; // 30-150 minutes
            const dataUsed = Math.random() * 500 + 100; // 100-600 MB
            
            sessions.push({
                id: `session_${i + 1}`,
                userId: this.users[userIndex].id,
                userName: this.users[userIndex].name,
                startTime: sessionDate,
                endTime: new Date(sessionDate.getTime() + duration * 60 * 1000),
                dataUsed: dataUsed,
                duration: duration,
                status: 'completed'
            });
        }
        
        return sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }
    
    loadUsers() {
        const savedUsers = localStorage.getItem('dataMonitor_users');
        if (savedUsers) {
            return JSON.parse(savedUsers);
        } else {
            const defaultUsers = this.loadDefaultUsers();
            this.saveUsers(defaultUsers);
            return defaultUsers;
        }
    }
    
    saveUsers(users) {
        localStorage.setItem('dataMonitor_users', JSON.stringify(users));
    }
    
    loadSessions() {
        const savedSessions = localStorage.getItem('dataMonitor_sessions');
        if (savedSessions) {
            return JSON.parse(savedSessions);
        } else {
            const defaultSessions = this.loadDefaultSessions();
            this.saveSessions(defaultSessions);
            return defaultSessions;
        }
    }
    
    saveSessions(sessions) {
        localStorage.setItem('dataMonitor_sessions', JSON.stringify(sessions));
    }
    
    setupEventListeners() {
        // User dropdown
        const dropdownBtn = document.getElementById('user-dropdown-btn');
        const dropdown = document.getElementById('user-dropdown');
        
        if (dropdownBtn && dropdown) {
            dropdownBtn.addEventListener('click', () => {
                dropdown.classList.toggle('hidden');
                const arrow = document.getElementById('dropdown-arrow');
                arrow.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdownBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                    document.getElementById('dropdown-arrow').style.transform = 'rotate(0deg)';
                }
            });
        }
        
        // Start session button
        const startBtn = document.getElementById('start-session-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startSession();
            });
        }
    }
    
    populateUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        if (!dropdown) return;
        
        dropdown.innerHTML = '';
        
        this.users.forEach(user => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerHTML = `
                <img src="${user.avatar}" alt="${user.name}" class="w-10 h-10 rounded-full object-cover">
                <div>
                    <div class="font-medium text-gray-800">${user.name}</div>
                    <div class="text-sm text-gray-600">${user.sessionCount} جلسات</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectUser(user);
                dropdown.classList.add('hidden');
                document.getElementById('dropdown-arrow').style.transform = 'rotate(0deg)';
            });
            
            dropdown.appendChild(item);
        });
    }
    
    selectUser(user) {
        this.currentUser = user;
        
        // Update UI
        const selectedUserText = document.getElementById('selected-user-text');
        const selectedUserInfo = document.getElementById('selected-user-info');
        const selectedUserAvatar = document.getElementById('selected-user-avatar');
        const selectedUserName = document.getElementById('selected-user-name');
        const selectedUserSessions = document.getElementById('selected-user-sessions');
        const selectedUserUsage = document.getElementById('selected-user-usage');
        const startBtn = document.getElementById('start-session-btn');
        
        if (selectedUserText) {
            selectedUserText.textContent = user.name;
        }
        
        if (selectedUserInfo) {
            selectedUserInfo.classList.remove('hidden');
            selectedUserAvatar.src = user.avatar;
            selectedUserAvatar.alt = user.name;
            selectedUserName.textContent = user.name;
            selectedUserSessions.textContent = user.sessionCount;
            selectedUserUsage.textContent = user.totalUsage.toFixed(1);
        }
        
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.classList.add('pulse-animation');
        }
        
        // Animate selection
        anime({
            targets: selectedUserInfo,
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutElastic(1, .8)'
        });
    }
    
    startSession() {
        if (!this.currentUser) return;
        
        // Create new session
        this.activeSession = {
            id: `session_${Date.now()}`,
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            startTime: new Date(),
            dataUsed: 0,
            status: 'active'
        };
        
        // Save to localStorage
        localStorage.setItem('dataMonitor_activeSession', JSON.stringify(this.activeSession));
        localStorage.setItem('dataMonitor_currentUser', JSON.stringify(this.currentUser));
        
        // Navigate to session page
        window.location.href = 'session.html';
    }
    
    updateStats() {
        const totalUsers = this.users.length;
        const totalSessions = this.sessions.length;
        const totalData = this.sessions.reduce((sum, session) => sum + session.dataUsed, 0) / 1024; // Convert to GB
        
        // Update UI elements
        const totalUsersEl = document.getElementById('total-users');
        const totalSessionsEl = document.getElementById('total-sessions');
        const totalDataEl = document.getElementById('total-data');
        
        if (totalUsersEl) totalUsersEl.textContent = totalUsers;
        if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
        if (totalDataEl) totalDataEl.textContent = totalData.toFixed(1);
        
        // Animate stats
        anime({
            targets: '.stats-card',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 800,
            delay: anime.stagger(200),
            easing: 'easeOutElastic(1, .8)'
        });
    }
    
    loadRecentSessions() {
        const container = document.getElementById('recent-sessions');
        if (!container) return;
        
        const recentSessions = this.sessions.slice(0, 5);
        
        container.innerHTML = '';
        
        recentSessions.forEach(session => {
            const sessionEl = document.createElement('div');
            sessionEl.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
            
            const date = new Date(session.startTime);
            const timeAgo = this.getTimeAgo(date);
            
            sessionEl.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                    </div>
                    <div>
                        <div class="font-medium text-gray-800">${session.userName}</div>
                        <div class="text-sm text-gray-600">${timeAgo}</div>
                    </div>
                </div>
                <div class="text-left">
                    <div class="font-medium text-gray-800">${(session.dataUsed / 1024).toFixed(2)} GB</div>
                    <div class="text-sm text-gray-600">${Math.round(session.duration)} دقيقة</div>
                </div>
            `;
            
            container.appendChild(sessionEl);
        });
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'منذ لحظات';
        if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
        if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
        if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
        
        return date.toLocaleDateString('ar-SA');
    }
    
    // Page-specific initialization methods
    initHomePage() {
        // Already handled in main init
    }
    
    initSessionPage() {
        this.loadActiveSession();
        this.startSessionTimer();
        this.initSessionUI();
    }
    
    initAnalyticsPage() {
        this.loadAnalytics();
    }
    
    initUsersPage() {
        this.loadUsersList();
        this.setupUserManagement();
    }
    
    loadActiveSession() {
        const savedSession = localStorage.getItem('dataMonitor_activeSession');
        const savedUser = localStorage.getItem('dataMonitor_currentUser');
        
        if (savedSession && savedUser) {
            this.activeSession = JSON.parse(savedSession);
            this.currentUser = JSON.parse(savedUser);
        } else {
            // Redirect to home if no active session
            window.location.href = 'index.html';
        }
    }
    
    startSessionTimer() {
        if (!this.activeSession) return;
        
        this.sessionStartTime = new Date(this.activeSession.startTime);
        this.dataUsageInterval = setInterval(() => {
            this.updateSessionData();
        }, 1000);
    }
    
    updateSessionData() {
        if (!this.activeSession) return;
        
        const now = new Date();
        const elapsed = Math.floor((now - this.sessionStartTime) / 1000);
        
        // Simulate data usage (in real app, this would come from system APIs)
        this.activeSession.dataUsed += Math.random() * 0.1; // Random data usage
        
        // Update UI
        this.updateSessionDisplay(elapsed, this.activeSession.dataUsed);
    }
    
    updateSessionDisplay(elapsedSeconds, dataUsed) {
        // Update timer
        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = elapsedSeconds % 60;
        
        const timerEl = document.getElementById('session-timer');
        if (timerEl) {
            timerEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update data usage
        const dataEl = document.getElementById('session-data');
        if (dataEl) {
            dataEl.textContent = (dataUsed / 1024).toFixed(3);
        }
        
        // Update progress circle
        const progressCircle = document.getElementById('progress-circle');
        if (progressCircle) {
            const progress = Math.min((dataUsed / 1024) * 100, 100); // Assuming 1GB limit
            progressCircle.style.setProperty('--progress', progress);
        }
        
        // Update chart
        this.updateSessionChart(dataUsed);
    }
    
    updateSessionChart(dataUsed) {
        // This would update the real-time chart in the session page
        // Implementation depends on the chart library being used
    }
    
    initSessionUI() {
        // Initialize session page UI elements
        const endBtn = document.getElementById('end-session-btn');
        const pauseBtn = document.getElementById('pause-session-btn');
        
        if (endBtn) {
            endBtn.addEventListener('click', () => {
                this.endSession();
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.pauseSession();
            });
        }
    }
    
    endSession() {
        if (!this.activeSession) return;
        
        // Update session data
        this.activeSession.endTime = new Date();
        this.activeSession.status = 'completed';
        
        // Calculate duration
        const duration = Math.floor((new Date(this.activeSession.endTime) - new Date(this.activeSession.startTime)) / 60000);
        this.activeSession.duration = duration;
        
        // Add to sessions list
        this.sessions.unshift(this.activeSession);
        this.saveSessions(this.sessions);
        
        // Update user stats
        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user) {
            user.sessionCount++;
            user.totalUsage += this.activeSession.dataUsed / 1024;
            this.saveUsers(this.users);
        }
        
        // Clear active session
        localStorage.removeItem('dataMonitor_activeSession');
        localStorage.removeItem('dataMonitor_currentUser');
        
        // Show completion message
        this.showSessionComplete();
        
        // Redirect to home after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
    
    pauseSession() {
        if (!this.activeSession) return;
        
        if (this.dataUsageInterval) {
            clearInterval(this.dataUsageInterval);
            this.dataUsageInterval = null;
            
            // Update UI to show paused state
            const pauseBtn = document.getElementById('pause-session-btn');
            if (pauseBtn) {
                pauseBtn.textContent = 'استئناف';
                pauseBtn.onclick = () => this.resumeSession();
            }
        }
    }
    
    resumeSession() {
        if (!this.activeSession) return;
        
        // Resume data monitoring
        this.startSessionTimer();
        
        // Update UI to show active state
        const pauseBtn = document.getElementById('pause-session-btn');
        if (pauseBtn) {
            pauseBtn.textContent = 'إيقاف مؤقت';
            pauseBtn.onclick = () => this.pauseSession();
        }
    }
    
    showSessionComplete() {
        // Create completion overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">اكتملت الجلسة</h3>
                <p class="text-gray-600 mb-4">تم حفظ بيانات الجلسة بنجاح</p>
                <div class="text-sm text-gray-500">جاري العودة إلى الصفحة الرئيسية...</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Animate completion
        anime({
            targets: overlay.querySelector('div'),
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutElastic(1, .8)'
        });
    }
    
    loadAnalytics() {
        // This would load and display analytics data
        // Implementation depends on the analytics page structure
    }
    
    loadUsersList() {
        // This would load and display the users list
        // Implementation depends on the users page structure
    }
    
    setupUserManagement() {
        // This would setup user management functionality
        // Implementation depends on the users page structure
    }
}

// Android-specific features and enhancements
class AndroidFeatures {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupAndroidUI();
        this.setupHapticFeedback();
        this.setupAndroidNavigation();
        this.setupPullToRefresh();
        this.setupAndroidPermissions();
    }
    
    setupAndroidUI() {
        // Add Android-specific CSS classes
        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid) {
            document.body.classList.add('android-device');
            
            // Adjust status bar height for Android
            const statusBarHeight = this.getStatusBarHeight();
            if (statusBarHeight > 0) {
                document.documentElement.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
            }
        }
    }
    
    getStatusBarHeight() {
        // Estimate status bar height based on device pixel ratio
        const ratio = window.devicePixelRatio || 1;
        if (ratio >= 3) return 24; // High density
        if (ratio >= 2) return 20; // Medium density
        return 16; // Low density
    }
    
    setupHapticFeedback() {
        // Add haptic feedback for Android devices
        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid && 'vibrate' in navigator) {
            // Add haptic feedback to buttons
            document.addEventListener('click', (e) => {
                if (e.target.matches('button, .btn, .nav-item, .user-card, .session-item')) {
                    navigator.vibrate(10); // Short vibration
                }
            });
            
            // Add haptic feedback to form inputs
            document.addEventListener('focus', (e) => {
                if (e.target.matches('input, textarea, select')) {
                    navigator.vibrate(5); // Very short vibration
                }
            }, true);
        }
    }
    
    setupAndroidNavigation() {
        // Handle Android back button
        if ('addEventListener' in window) {
            window.addEventListener('popstate', (e) => {
                // Handle back navigation
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage === 'session.html') {
                    // Show confirmation dialog before exiting session
                    if (window.dataMonitorApp && window.dataMonitorApp.activeSession) {
                        e.preventDefault();
                        if (confirm('هل تريد إنهاء الجلسة والعودة؟')) {
                            window.dataMonitorApp.endSession();
                        }
                    }
                }
            });
        }
        
        // Add swipe gestures for Android
        this.setupSwipeGestures();
    }
    
    setupSwipeGestures() {
        let startX, startY, endX, endY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Swipe detection
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Swipe right - go back or show menu
                    this.handleSwipeRight();
                } else {
                    // Swipe left - go forward or hide menu
                    this.handleSwipeLeft();
                }
            }
        });
    }
    
    handleSwipeRight() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Navigate back or show navigation menu
        switch(currentPage) {
            case 'session.html':
                if (confirm('هل تريد العودة إلى الصفحة الرئيسية؟')) {
                    window.location.href = 'index.html';
                }
                break;
            case 'analytics.html':
            case 'users.html':
                window.location.href = 'index.html';
                break;
        }
    }
    
    handleSwipeLeft() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Navigate forward
        switch(currentPage) {
            case 'index.html':
                window.location.href = 'analytics.html';
                break;
            case 'analytics.html':
                window.location.href = 'users.html';
                break;
        }
    }
    
    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let pullDistance = 0;
        let isPulling = false;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isPulling) {
                currentY = e.touches[0].clientY;
                pullDistance = currentY - startY;
                
                if (pullDistance > 0 && pullDistance < 100) {
                    // Show pull to refresh indicator
                    this.showPullToRefreshIndicator(pullDistance);
                }
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (isPulling && pullDistance > 80) {
                // Trigger refresh
                this.triggerRefresh();
            }
            
            // Reset
            isPulling = false;
            pullDistance = 0;
            this.hidePullToRefreshIndicator();
        });
    }
    
    showPullToRefreshIndicator(distance) {
        let indicator = document.getElementById('pull-to-refresh');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pull-to-refresh';
            indicator.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 transform -translate-y-full transition-transform duration-300 z-50';
            indicator.innerHTML = `
                <div class="flex items-center justify-center gap-2">
                    <svg class="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2v4l-3-3 3-3zm0 20v-4l3 3-3 3z"/>
                    </svg>
                    <span>إفلت للتحديث</span>
                </div>
            `;
            document.body.appendChild(indicator);
        }
        
        const opacity = Math.min(distance / 80, 1);
        const translateY = Math.min((distance - 80) / 2, 0);
        
        indicator.style.opacity = opacity;
        indicator.style.transform = `translateY(${translateY}px)`;
    }
    
    hidePullToRefreshIndicator() {
        const indicator = document.getElementById('pull-to-refresh');
        if (indicator) {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(-100%)';
            
            setTimeout(() => {
                indicator.remove();
            }, 300);
        }
    }
    
    triggerRefresh() {
        // Show loading state
        showNotification('جاري التحديث...', 'info');
        
        // Reload current page data
        if (window.dataMonitorApp) {
            window.dataMonitorApp.updateStats();
        }
        
        // Simulate refresh delay
        setTimeout(() => {
            showNotification('تم التحديث بنجاح', 'success');
        }, 1500);
    }
    
    setupAndroidPermissions() {
        // Request necessary permissions for Android
        if ('permissions' in navigator) {
            // Request notification permission
            navigator.permissions.query({ name: 'notifications' })
                .then((permissionStatus) => {
                    if (permissionStatus.state === 'prompt') {
                        Notification.requestPermission();
                    }
                });
            
            // Request storage permission if needed
            if ('storage' in navigator && 'persist' in navigator.storage) {
                navigator.storage.persist().then((granted) => {
                    if (granted) {
                        console.log('Storage persistence granted');
                    }
                });
            }
        }
        
        // Setup battery optimization check
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                if (battery.level < 0.2 && !battery.charging) {
                    showNotification('البطارية منخفضة، سيتم تقليل استهلاك الطاقة', 'warning');
                }
            });
        }
    }
}

// Initialize Android features
let androidFeatures;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dataMonitorApp = new DataMonitorApp();
    androidFeatures = new AndroidFeatures();
});

// Utility functions
function formatDataUsage(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
        return `${hours} ساعة ${mins} دقيقة`;
    }
    return `${mins} دقيقة`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                document.body.removeChild(notification);
            }
        });
    }, 3000);
}
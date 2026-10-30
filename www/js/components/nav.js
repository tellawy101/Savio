// ==============================
// components/nav.js
// البوتوم ناف + الأيقونات (لازم يتحمّل الأول)
// ==============================

if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    document.body.classList.add('capacitor-app');
}

// بناء الـ Bottom Navigation حسب الصفحة الحالية
function renderBottomNav(activePage) {
    // activePage: 'home' | 'debts' | 'statistics' | 'accounts' | 'settings'
    const isHome = activePage === 'home';

    return `
<nav class="bottom-nav test-bottom ${isHome ? '' : 'no-fab'}">
    <button class="nav-item ${activePage === 'home' ? 'active' : ''}" data-page="home">
    <span class="nav-icon"><i data-lucide="home"></i></span>
    <span class="nav-label" data-i18n="nav_home">Home</span>
</button>

<button class="nav-item ${activePage === 'debts' ? 'active' : ''}" data-page="debts">
    <span class="nav-icon"><i data-lucide="hand-coins"></i></span>
    <span class="nav-label" data-i18n="nav_debts">Debts</span>
</button>

<button class="nav-item ${activePage === 'statistics' ? 'active' : ''}" data-page="statistics">
    <span class="nav-icon"><i data-lucide="chart-no-axes-combined"></i></span>
    <span class="nav-label" data-i18n="nav_stats">Statistics</span>
</button>

${ isHome ? `
<button id="addMenuBtn" class="fab-nav">
    <i data-lucide="plus"></i>
</button>
` : '' }

<button class="nav-item ${activePage === 'accounts' ? 'active' : ''}" data-page="accounts">
    <span class="nav-icon"><i data-lucide="wallet"></i></span>
    <span class="nav-label" data-i18n="nav_accounts">Accounts</span>
</button>

<button class="nav-item ${activePage === 'settings' ? 'active' : ''}" data-page="settings">
    <span class="nav-icon"><i data-lucide="settings"></i></span>
    <span class="nav-label" data-i18n="nav_settings">Settings</span>
</button>
</nav>
    `;
}

// تفعيل أيقونات lucide (موحدة)
function initIcons() {
    if (!window.lucide) return;
    lucide.createIcons();

    // عشان أي createIcons() تاني من الصفحات ما يعيد بنائها ويقطع الأنيميشن
    document.querySelectorAll('.bottom-nav .nav-icon svg[data-lucide]')
        .forEach(svg => svg.removeAttribute('data-lucide'));
}

// تجهيز الـ nav بعد إضافتها للصفحة (أيقونات + روابط الأزرار)
function setupBottomNav(basePath = '') {
    initIcons();

    document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;

            // أي صفحة اتسجلت في الراوتر (SPA) - تفتح من غير Reload
            if (typeof ROUTES !== 'undefined' && ROUTES[page] && typeof navigateTo === 'function' && document.getElementById('app')) {
                const nav = this.closest('.bottom-nav');
                const current = nav ? nav.querySelector('.nav-item.active') : null;
                if (current && current !== this) current.classList.remove('active');
                this.classList.add('active');
                navigateTo(page);
                return;
            }
        });
    });
}
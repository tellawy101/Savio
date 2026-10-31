// ======================================
// router/routerHardwareBack.js
// معالجة زر الرجوع الفيزيائي في الهاتف
// ======================================

// ==========================================
// معالجة زر الرجوع الفيزيائي في الهاتف (Hardware Back)
// ==========================================
window.handleHardwareBack = function() {
    // 1. إذا كانت قائمة اختيار الأيقونات مفتوحة، نغلقها أولاً
    const openIconList = document.querySelector(".icon-dropdown-list.show");
    if (openIconList) {
        openIconList.classList.remove("show");
        const trigger = document.getElementById("iconDropdownTrigger") || document.getElementById("categoryIconDropdownTrigger");
        if (trigger && trigger.parentElement && openIconList.parentElement === document.body) {
            trigger.parentElement.appendChild(openIconList);
        }
        return true;
    }
    
    // 2. فحص النوافذ المنبثقة المفتوحة (Modals)
    const openModals = Array.from(document.querySelectorAll(".modal.show"));
    if (openModals.length > 0) {
        const topmostModal = openModals[openModals.length - 1];
                // رسايل التأكيد/التنبيه: بنقفلها بدالتها عشان الكود اللي مستنيها يكمّل (مش مجرد إخفاء)
        if (topmostModal.id === "customConfirmModal" && typeof dismissCustomDialog === "function") {
            dismissCustomDialog();
            return true;
        }
        topmostModal.classList.remove("show");
        
        if (topmostModal.id === "addAccountModal" && window.activeAccountBox) {
            const accountModal = document.getElementById("accountModal");
            if (accountModal) accountModal.classList.add("show");
        }
        
        if (topmostModal.id === "addCategoryModal" && window.activeCategoryBox) {
            const categoryModal = document.getElementById("categoryModal");
            if (categoryModal) categoryModal.classList.add("show");
        }
        
        return true;
    }
    
    // 3. إذا لم يكن هناك أي نافذة مفتوحة وكنا خارج الصفحة الرئيسية، نرجع للرئيسية
    if (currentPageName !== "home") {
        navigateTo("home");
        return true;
    }
    
    // 4. إذا كنا بالفعل في الصفحة الرئيسية، نطلب إغلاق التطبيق
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AppExit) {
        window.Capacitor.Plugins.AppExit.exitApp();
        return true;
    }
    
    return false;
};

// ==============================================================
// screens/addTransactionPage.js
// صفحة إضافة معاملة (دخل / مصروف / تحويل) كصفحة SPA
// ==============================================================

function initAddTransactionPage(tab) {
document.body.classList.add("add-transaction-page");
document.body.classList.add("has-scroll");
    applyStoredTheme();

    // تعبئة الفورمات الثلاثة + المودالز المشتركة
    document.getElementById("incomeFormWrap").innerHTML = renderTransactionForm("income");
    document.getElementById("expenseFormWrap").innerHTML = renderTransactionForm("expense");
    document.getElementById("transferFormWrap").innerHTML = renderTransferForm();

    const modalsPlaceholder = document.getElementById("modals-placeholder");
    if (modalsPlaceholder) {
        modalsPlaceholder.innerHTML = renderSharedModals();
    }

    if (window.lucide) lucide.createIcons();

    // تشغيل منطق الحسابات/التصنيفات/الفورمات على العناصر الجديدة
    initAccountPicker();
    initCategoryPicker();
    initTransactionForm("income");
    initTransactionForm("expense");
    initTransferForm(tab);

    // ------------------------------
    // التابس (دخل / مصروف / تحويل)
    // ------------------------------
    const tabs = document.querySelectorAll(".tx-tab");
    const panels = {
        income: document.getElementById("incomeFormWrap"),
        expense: document.getElementById("expenseFormWrap"),
        transfer: document.getElementById("transferFormWrap")
    };
    const indicator = document.getElementById("txIndicator");

    function moveIndicator(target) {
        if (!indicator) return;
        const targetTab = Array.from(tabs).find(t => t.dataset.tab === target);
        if (!targetTab) return;
        indicator.style.left = targetTab.offsetLeft + "px";
        indicator.style.width = targetTab.offsetWidth + "px";
    }

    function activateTab(target) {
        if (!panels[target]) return;
        tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === target));
        Object.keys(panels).forEach(function (key) {
            panels[key].classList.toggle("active", key === target);
        });
        moveIndicator(target);
    }

    tabs.forEach(function (tabBtn) {
        tabBtn.onclick = function () {
            activateTab(this.dataset.tab);
        };
    });

    activateTab(tab || "income");

    // ------------------------------
    // زرار الإغلاق (X) - يرجع للهوم جوه الـSPA
    // ------------------------------
    const closeBtn = document.getElementById("txCloseBtn");
    if (closeBtn) {
        closeBtn.onclick = function () {
            navigateTo("home");
        };
    }

    // ------------------------------
    // زرار التأكيد (✓) - بيدوس على زرار حفظ التاب الحالي
    // ------------------------------
    const confirmBtn = document.getElementById("txConfirmBtn");
    if (confirmBtn) {
        confirmBtn.onclick = function () {
            const activeTabBtn = document.querySelector(".tx-tab.active");
            if (!activeTabBtn) return;
            const activeType = activeTabBtn.dataset.tab;
            const saveBtn = document.getElementById(
                "save" + activeType.charAt(0).toUpperCase() + activeType.slice(1) + "Btn"
            );
            if (saveBtn) saveBtn.click();
        };
    }
}
// ==============================
// components/dialogs.js
// customConfirm / customAlert / noAccountsModal / إغلاق المودال بالضغط برّه
// ==============================

// بتقفل رسالة التأكيد/التنبيه المفتوحة (زي ما لو المستخدم داس Cancel)
// بنستخدمها من زر الرجوع عشان الكود اللي مستني الرسالة يكمّل بدل ما يفضل معلّق
let dismissCustomDialog = null;

function customConfirm(message, options) {
    options = options || {};
    return new Promise(function(resolve) {
        const modal = document.getElementById("customConfirmModal");
        const msgEl = document.getElementById("customConfirmMessage");
        const okBtn = document.getElementById("customConfirmOkBtn");
        const cancelBtn = document.getElementById("customConfirmCancelBtn");

        if (!modal || !msgEl || !okBtn || !cancelBtn) {
            resolve(window.confirm(message));
            return;
        }

        msgEl.textContent = message;
        okBtn.className = "custom-confirm-ok-btn" + (options.danger ? " danger" : "");
        // زرار Cancel لازم يظهر دايماً (ممكن يكون اتخفى من customAlert قبل كده)
        cancelBtn.style.display = "";
        modal.classList.add("show");

        function cleanup(result) {
            modal.classList.remove("show");
            okBtn.onclick = null;
            cancelBtn.onclick = null;
            dismissCustomDialog = null;
            resolve(result);
        }

        okBtn.onclick = function() { cleanup(true); };
        cancelBtn.onclick = function() { cleanup(false); };
        dismissCustomDialog = function() { cleanup(false); };
    });
}

function customAlert(message) {
    return new Promise(function(resolve) {
        const modal = document.getElementById("customConfirmModal");
        const msgEl = document.getElementById("customConfirmMessage");
        const okBtn = document.getElementById("customConfirmOkBtn");
        const cancelBtn = document.getElementById("customConfirmCancelBtn");

        if (!modal || !msgEl || !okBtn || !cancelBtn) {
            window.alert(message);
            resolve();
            return;
        }

        msgEl.textContent = message;
        okBtn.className = "custom-confirm-ok-btn";
        cancelBtn.style.display = "none";
        modal.classList.add("show");

        function cleanup() {
            modal.classList.remove("show");
            cancelBtn.style.display = "";
            okBtn.onclick = null;
            dismissCustomDialog = null;
            resolve();
        }

        okBtn.onclick = cleanup;
        dismissCustomDialog = cleanup;
    });
}

// بيفتح مودال "محتاج تعمل حسابين" برسالة تختلف حسب عدد الحسابات الموجود
// existingAccountsCount = عدد الحسابات الحالي (0 أو 1)
function showNoAccountsModal(existingAccountsCount) {
    const modal = document.getElementById("noAccountsModal");
    const title = document.getElementById("noAccountsTitle");
    const message = document.getElementById("noAccountsMessage");

    if (!modal) return;

    if (existingAccountsCount === 0) {
        title.textContent = t("need_two_accounts_title");
        message.textContent = t("need_two_accounts_msg");
    } else {
        title.textContent = t("need_one_more_title");
        message.textContent = t("need_one_more_msg");
    }
    modal.classList.add("show");

    closeModalOnBackdropClick(modal);

    document.getElementById("noAccountsCancelBtn").onclick = function() {
        modal.classList.remove("show");
    };

    document.getElementById("noAccountsAddBtn").onclick = function() {
        modal.classList.remove("show");
        navigateTo("accounts");
    };
}

// إغلاق أي مودال لما يتم الضغط برّه (خارج المحتوى) - نمط متكرر في كل المودالز
function closeModalOnBackdropClick(modal, onClose) {
    if (!modal) return;
    modal.onclick = function (e) {
        if (e.target === modal) {
            const openIconList = document.querySelector(".icon-dropdown-list.show");
            if (openIconList) {
                openIconList.classList.remove("show");
                return;
            }
            modal.classList.remove("show");
            if (typeof onClose === "function") onClose();
        }
    };
}
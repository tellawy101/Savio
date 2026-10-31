// ==============================
// settings/settingsImport.js
// استيراد ملف النسخة الاحتياطية ومعاينته قبل الاستعادة
// ==============================
function setupImport() {
    const importBtn = document.getElementById("importData");
const importManualModal = document.getElementById("importManualModal");
const closeImportManualBtn = document.getElementById("closeImportManualBtn");
const importFileInput = document.getElementById("importFileInput");    const restorePreviewModal = document.getElementById("restorePreviewModal");
    const cancelRestorePreviewBtn = document.getElementById("cancelRestorePreviewBtn");
    const confirmRestoreBtn = document.getElementById("confirmRestoreBtn");
    let pendingBackupPayload = null;
    
    // دالة فحص وتجهيز شاشة المعاينة
    function processBackupJson(rawText) {
        try {
            const payload = JSON.parse(rawText);
                        if (!payload || payload.app !== "Savio" || !payload.data) {
                showToast(t("settings_import_invalid"), "error");
                return;
            }
            
            const validationError = validateBackupData(payload.data);
            if (validationError) {
                console.error("Backup rejected:", validationError);
                showToast(t("settings_import_invalid"), "error");
                return;
            }

            pendingBackupPayload = payload;

            const txs = payload.data.transactions ? JSON.parse(payload.data.transactions) : [];
            const debts = payload.data.debts ? JSON.parse(payload.data.debts) : [];
            const accounts = payload.data.accounts ? JSON.parse(payload.data.accounts) : [];

            document.getElementById("previewTxCount").textContent = txs.length;
            document.getElementById("previewDebtsCount").textContent = debts.length;
            document.getElementById("previewAccountsCount").textContent = accounts.length;
            document.getElementById("previewBackupDate").textContent = payload.exportedAt ? new Date(payload.exportedAt).toLocaleDateString() : "-";

            if (importManualModal) importManualModal.classList.remove("show");
            if (restorePreviewModal) restorePreviewModal.classList.add("show");
        } catch (e) {
            showToast(t("settings_import_invalid"), "error");
        }
    }

    if (importBtn && importManualModal) {
        importBtn.addEventListener("click", function() {
    if (importFileInput) importFileInput.value = "";
    const label = document.getElementById("importFileLabel");
    if (label) label.textContent = t ? t("settings_import_choose_file") : "Tap to choose your backup file";
    importManualModal.classList.add("show");
});
        if (closeImportManualBtn) {
            closeImportManualBtn.onclick = function () { importManualModal.classList.remove("show"); };
        }

        closeModalOnBackdropClick(importManualModal);

        if (importFileInput) {
    importFileInput.addEventListener("change", function() {
        const file = importFileInput.files && importFileInput.files[0];
        if (!file) return;
        const label = document.getElementById("importFileLabel");
        if (label) label.textContent = file.name;
        const reader = new FileReader();
        reader.onload = function() { processBackupJson(reader.result); };
        reader.readAsText(file);
    });
}

        if (cancelRestorePreviewBtn) {
            cancelRestorePreviewBtn.onclick = function() {
                restorePreviewModal.classList.remove("show");
                pendingBackupPayload = null;
            };
        }

        // زر تأكيد الاستعادة النهائي (استبدال كامل أو دمج ذكي)
        if (confirmRestoreBtn) {
            confirmRestoreBtn.onclick = function() {
                if (!pendingBackupPayload || !pendingBackupPayload.data) return;
                
                const modeRadio = document.querySelector('input[name="restoreMode"]:checked');
                const mode = modeRadio ? modeRadio.value : "replace";
                
                const done = mode === "replace" ?
                    replaceAllData(pendingBackupPayload.data) :
                    mergeBackupData(pendingBackupPayload.data);
                if (!done) return;
                
                // نمسح علامة التحويل عشان الاستعادة من نسخة قديمة تتحوّل للـ IDs تاني
                localStorage.removeItem("savioIdMigrationDone");
                restorePreviewModal.classList.remove("show");
                showToast(t("settings_import_done"), "success");
                setTimeout(function() { window.location.href = "index.html"; }, 800);
            };
        }
    }
}
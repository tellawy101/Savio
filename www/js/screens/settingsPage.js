
// ==============================================================
// screens/settingsPage.js
// كل منطق صفحة الإعدادات مجمّع في دالة واحدة initSettingsPage()
// بتتنادى يدويًا من الراوتر بعد ما محتوى الصفحة يتحقن جوه #app
// ==============================================================

function initSettingsPage() {
    
    // تحديث رقم الإصدار في كل الأماكن من مصدر واحد (APP_VERSION)
    function setupVersionTexts() {
    const aboutVersionText = document.getElementById("aboutVersionText");
    if (aboutVersionText) aboutVersionText.textContent = "Version " + APP_VERSION;
    
    const appVersionText = document.getElementById("appVersionText");
    if (appVersionText) appVersionText.textContent = "Version " + APP_VERSION;
}

setupVersionTexts();
    
    function setupSharedModals() {
    const modalsPlaceholder = document.getElementById("modals-placeholder");
if (modalsPlaceholder) {
    modalsPlaceholder.innerHTML = renderSharedModals();
    if (window.lucide) lucide.createIcons({ root: modalsPlaceholder });
}
}

setupSharedModals();
  // ------------------------------
// الوضع الليلي (Dark Mode)
// ------------------------------
function setupDarkMode() {
const darkModeToggle = document.getElementById("darkModeToggle");

    if (darkModeToggle) {
    const currentTheme = getTheme();
    darkModeToggle.checked = currentTheme === "dark";
    
    darkModeToggle.addEventListener("change", function() {
                const newTheme = this.checked ? "dark" : "light";
                saveTheme(newTheme);
            if (typeof applyTheme === "function") {
                applyTheme(newTheme);
            }
        });
    }
   }
setupDarkMode();
// ------------------------------
// العملة (Currency)
// ------------------------------
function setupPicker(config) {
    const selectBtn = document.getElementById(config.selectBtnId);
    const selectedLabel = document.getElementById(config.labelId);
    const modal = document.getElementById(config.modalId);
    const closeBtn = document.getElementById(config.closeBtnId);
    
    function refresh() {
        const current = config.getValue();
        if (selectedLabel) selectedLabel.textContent = config.getLabelText(current);
        if (modal) {
            modal.querySelectorAll(".picker-option").forEach(function(opt) {
                opt.classList.toggle("selected", opt.dataset.value === current);
            });
        }
    }
    refresh();
    
    if (selectBtn && modal) {
        selectBtn.addEventListener("click", function() {
            refresh();
            modal.classList.add("show");
        });
        
        modal.querySelectorAll(".picker-option").forEach(function(opt) {
            opt.addEventListener("click", function() {
                config.setValue(opt.dataset.value);
                refresh();
                modal.classList.remove("show");
            });
        });
        
        if (closeBtn) {
            closeBtn.addEventListener("click", function() {
                modal.classList.remove("show");
            });
        }
        
        closeModalOnBackdropClick(modal);
    }
}

setupPicker({
    selectBtnId: "currencySelectBtn",
    labelId: "currencySelectedLabel",
    modalId: "currencyPickerModal",
    closeBtnId: "closeCurrencyPickerBtn",
    getValue: getCurrency,
    setValue: setCurrency,
    getLabelText: function(value) {
        return value;
    }
});
// ------------------------------
// اللغة (Language)
// ------------------------------
setupPicker({
    selectBtnId: "languageSelectBtn",
    labelId: "languageSelectedLabel",
    modalId: "languagePickerModal",
    closeBtnId: "closeLanguagePickerBtn",
    getValue: getLanguage,
    setValue: setLanguage,
    getLabelText: function(value) {
        return value === "ar" ? "العربية" : "English";
    }
});
// ------------------------------
// المظهر (فاتح / داكن / حسب النظام)
// ------------------------------
setupPicker({
    selectBtnId: "themeSelectBtn",
    labelId: "themeSelectedLabel",
    modalId: "themePickerModal",
    closeBtnId: "closeThemePickerBtn",
    getValue: getTheme,
    setValue: function (value) {
        saveTheme(value);
        applyTheme(value);
    },
    getLabelText: function (value) {
        return t("theme_" + value);
    }
});
// ------------------------------
    // Savings Goals
    // ------------------------------
    function setupNavButtons() {
    const goalsBtn = document.getElementById("goalsBtn");

    if (goalsBtn) {
        goalsBtn.onclick = function () {
            navigateTo("goals");
        };
    }
        // ------------------------------
    // Recurring Transactions
    // ------------------------------
    const recurringBtn = document.getElementById("recurringBtn");
    
    if (recurringBtn) {
        recurringBtn.onclick = function() {
            navigateTo("recurring");
        };
    }
        const planningBtn = document.getElementById("planningBtn");
    if (planningBtn) {
        planningBtn.onclick = function () {
            navigateTo("planning");
        };
    }
        const catBudgetsBtn = document.getElementById("catBudgetsBtn");

    if (catBudgetsBtn) {
        catBudgetsBtn.onclick = function () {
            navigateTo("budgets");
        };
    }
    
}

setupNavButtons();
    // ------------------------------
    // Auto Backup
    // ------------------------------
    function setupAutoBackup() {
    const autoBackupToggle = document.getElementById("autoBackupToggle");

    if (autoBackupToggle) {

        autoBackupToggle.checked = isAutoBackupEnabled();

        autoBackupToggle.onchange = function () {

            if (autoBackupToggle.checked) {
                setAutoBackupEnabled(true);
                showToast(t("autobackup_enabled_toast"), "success");
                saveAutoBackup().then(function () {
                    updateLastBackupBadge();
                });
            } else {
                setAutoBackupEnabled(false);
                showToast(t("autobackup_disabled_toast"), "success");
            }
        };
    }
}

setupAutoBackup();
    // ------------------------------
// نافذة عامة (فتح وقفل) بتستخدمها نافذة عن التطبيق ونافذة الخصوصية
    // ------------------------------
    function setupInfoModal(openBtnId, modalId, closeBtnId) {
    const openBtn = document.getElementById(openBtnId);
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById(closeBtnId);
    
    if (openBtn && modal) {
        openBtn.addEventListener("click", function() {
            modal.classList.add("show");
        });
    }
    
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", function() {
            modal.classList.remove("show");
        });
    }
    
    closeModalOnBackdropClick(modal);
}

setupInfoModal("aboutSavioBtn", "aboutModal", "closeAboutBtn");
const dataBtn = document.getElementById("dataBtn");
if (dataBtn) dataBtn.onclick = function() { navigateTo("data"); };
// ------------------------------
    // Privacy Modal
    // ------------------------------
    function setupPrivacy() {
    setupInfoModal("privacyBtn", "privacyModal", "closePrivacyBtn");
}

setupPrivacy();
    // ------------------------------
    // Restore Last Snapshot
    // ------------------------------
    function setupRestoreSnapshot() {
    const restoreSnapshotBtn = document.getElementById("restoreSnapshotBtn");

    if (restoreSnapshotBtn) {
        restoreSnapshotBtn.onclick = async function () {
            const snapshotKeys = Object.keys(localStorage)
                .filter(function (k) { return k.indexOf(SNAPSHOT_PREFIX) === 0; })
                .sort();

            if (snapshotKeys.length === 0) {
                await customAlert(t("snapshot_restore_none"));
                return;
            }

            let snapshot;
            try {
                snapshot = JSON.parse(localStorage.getItem(snapshotKeys[snapshotKeys.length - 1]));
                if (!snapshot || !snapshot.data) throw new Error("bad snapshot");
            } catch (e) {
                await customAlert(t("snapshot_restore_failed"));
                return;
            }

            const ok = await customConfirm(t("snapshot_restore_confirm"), { danger: true });
            if (!ok) return;

            if (!createPreRestoreSnapshot()) {
                showToast(t("snapshot_restore_failed"), "error");
                return;
            }

            BACKUP_KEYS.forEach(function (key) {
                if (Object.prototype.hasOwnProperty.call(snapshot.data, key)) {
                    localStorage.setItem(key, snapshot.data[key]);
                } else {
                    localStorage.removeItem(key);
                }
            });

            await customAlert(t("snapshot_restore_done"));
            window.location.href = "index.html";
        };
    }
}

setupRestoreSnapshot();
    // ------------------------------
    // Clear All Data
    // ------------------------------
    function setupClearData() {
    const clearDataBtn = document.getElementById("clearData");

    if (clearDataBtn) {
    clearDataBtn.addEventListener("click", async function() {
                    const confirmClear = await customConfirm(t("settings_clear_confirm"), { danger: true });
                    if (!confirmClear) return;

            if (!createPreRestoreSnapshot()) {
showToast(t("backup_take_failed_clear"), "error");
                return;
            }
            
            BACKUP_KEYS.forEach(key => localStorage.removeItem(key));

            await customAlert(t("settings_clear_done"));

window.location.href = "index.html";
});
}
}

setupClearData();

    // ------------------------------
    // Export Data
    // ------------------------------
    
setupExport();
// ------------------------------
    // Import Data الذكي مع المعاينة (مثل التطبيقات الكبيرة)
    // ------------------------------

updateLastBackupBadge();

setupImport();
}
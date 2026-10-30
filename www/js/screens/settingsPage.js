
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
// مدخلات: بيانات التطبيق في التخزين ← مخرجات: نص الملف واسمه
function buildBackupFile() {
    const backup = {};
    BACKUP_KEYS.forEach(function(key) {
        const value = localStorage.getItem(key);
        if (value !== null) backup[key] = value;
    });
    
    const payload = {
        app: "Savio",
        version: 1,
        exportedAt: new Date().toISOString(),
        data: backup
    };
    
    return {
        jsonText: JSON.stringify(payload, null, 2),
        fileName: "savio-backup-" + Date.now() + ".json"
    };
}

// بتسجل وقت التصدير دلوقتي، وبترجّع دالة ترجّع الوقت القديم لو التصدير فشل
function markBackupTimeNow() {
    const previousBackupTime = localStorage.getItem("savio_last_backup_time");
    
    localStorage.setItem("savio_last_backup_time", new Date().toISOString());
    if (typeof updateLastBackupBadge === "function") updateLastBackupBadge();
    
    return function restoreBackupTime() {
        if (previousBackupTime === null) {
            localStorage.removeItem("savio_last_backup_time");
        } else {
            localStorage.setItem("savio_last_backup_time", previousBackupTime);
        }
        if (typeof updateLastBackupBadge === "function") updateLastBackupBadge();
    };
}

// حفظ تلقائي في Downloads، بترجّع true لو الملف اتحفظ
async function saveBackupToDownloads(fileName, jsonText) {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SaveToDownloads) {
            await window.Capacitor.Plugins.SaveToDownloads.save({
                fileName: fileName,
                content: jsonText
            });
            showToast(t("backup_saved_downloads"), "success");
            return true;
        }
    } catch (downloadsErr) {
        console.warn("Save to Downloads error:", downloadsErr);
    }
    return false;
}

// قائمة المشاركة بتاعة الموبايل
// بترجّع: "shared" لو اتفتحت، "failed" لو اتلغت أو فشلت، "unavailable" لو مش متاحة
async function shareBackupNative(fileName, jsonText) {
    try {
        if (window.Capacitor && window.Capacitor.Plugins) {
            const { Filesystem, Directory, Share } = window.Capacitor.Plugins;
            
            if (Filesystem) {
                const writtenFile = await Filesystem.writeFile({
                    path: fileName,
                    data: jsonText,
                    encoding: 'utf8',
                    directory: Directory ? Directory.Cache : 'CACHE'
                });
                
                if (Share) {
                    try {
                        await Share.share({
                            title: t("share_title"),
                            text: t("share_text_app"),
                            url: writtenFile.uri,
                            dialogTitle: t("share_dialog_title")
                        });
                        return "shared";
                    } catch (shareErr) {
                        console.warn("Share dismissed or failed:", shareErr);
                        return "failed";
                    }
                }
            }
        }
    } catch (nativeErr) {
        console.warn("Capacitor Native Share Error:", nativeErr);
    }
    return "unavailable";
}

// المشاركة في المتصفح العادي (ملف، وبعده نص). بترجّع true لو اتشاركت
async function shareBackupInBrowser(fileName, jsonText) {
    try {
        const file = new File([jsonText], fileName, { type: "application/json" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: t("share_title"),
                text: t("share_text_file"),
                files: [file]
            });
            return true;
        }
    } catch (e) {
        // تجاهل
    }
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: t("share_title"),
                text: jsonText
            });
            return true;
        } catch (e) {}
    }
    
    return false;
}

// تنزيل مباشر، آخر حل لو أندرويد قديم جداً
function downloadBackupDirectly(fileName, jsonText) {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// بتشغّل خطوات التصدير بالترتيب
async function handleExportClick() {
    const { jsonText, fileName } = buildBackupFile();
    const restoreBackupTime = markBackupTimeNow();
    
    const downloadsSaved = await saveBackupToDownloads(fileName, jsonText);
    
    const nativeResult = await shareBackupNative(fileName, jsonText);
    // المشاركة اتلغت ومفيش نسخة اتحفظت في Downloads: نرجّع التاريخ القديم
    if (nativeResult === "failed" && !downloadsSaved) restoreBackupTime();
    if (nativeResult !== "unavailable") return;
    
    if (downloadsSaved) return;
    
    if (await shareBackupInBrowser(fileName, jsonText)) return;
    
    try {
        downloadBackupDirectly(fileName, jsonText);
        showToast(t("download_started"), "success");
    } catch (err) {
        restoreBackupTime();
        showToast(t("export_failed"), "error");
    }
}

// نافذة النسخ الاحتياطي (إغلاق ونسخ النص)
function setupExportFallbackModal() {
    const fallbackModal = document.getElementById("exportFallbackModal");
    const fallbackText = document.getElementById("exportFallbackText");
    const closeFallbackBtn = document.getElementById("closeExportFallbackBtn");
    const copyFallbackBtn = document.getElementById("copyExportFallbackBtn");
    
    if (closeFallbackBtn) {
        closeFallbackBtn.addEventListener("click", function() {
            fallbackModal.classList.remove("show");
        });
    }
    
    closeModalOnBackdropClick(fallbackModal);
    
    if (copyFallbackBtn) {
        copyFallbackBtn.addEventListener("click", async function() {
            fallbackText.select();
            try {
                await navigator.clipboard.writeText(fallbackText.value);
            } catch (err) {
                document.execCommand("copy");
            }
            showToast(t("settings_export_copied"), "success");
        });
    }
}

function setupExport() {
    const exportBtn = document.getElementById("exportData");
    if (!exportBtn) return;
    
    setupExportFallbackModal();
    exportBtn.addEventListener("click", handleExportClick);
}

setupExport();
// ------------------------------
    // Import Data الذكي مع المعاينة (مثل التطبيقات الكبيرة)
    // ------------------------------
    // دالة تحديث شارة تاريخ آخر نسخة فوق كلمة Data
function updateLastBackupBadge() {
    const badge = document.getElementById("lastBackupBadge");
    if (!badge) return;
    const lastTime = localStorage.getItem("savio_last_backup_time");
    if (!lastTime) {
        badge.textContent = t("backup_none_yet");
    } else {
        const d = new Date(lastTime);
        badge.textContent = t("backup_last_prefix") + d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}
updateLastBackupBadge();
// ------------------------------
// استعادة البيانات: استبدال كامل أو دمج ذكي
// كل دالة بتاخد بيانات النسخة وبترجّع true لو نجحت، و false لو فشلت أو اتلغت
// ------------------------------

// استبدال كامل: بنمسح الحالي ونحط اللي في النسخة
function replaceAllData(data) {
    // لقطة احتياطية من البيانات الحالية قبل ما نمسحها
    if (!createPreRestoreSnapshot()) {
        showToast(t("backup_take_failed_replace"), "error");
        return false;
    }

    // الميزانيات منمسحهاش لو النسخة القديمة مفيهاش (النسخ القديمة قبل الميزة دي)
    const KEEP_IF_MISSING = [BUDGET_KEY, CATEGORY_BUDGETS_KEY];

    const previousValues = {};
    BACKUP_KEYS.forEach(function (key) {
        previousValues[key] = localStorage.getItem(key);
    });

    try {
        BACKUP_KEYS.forEach(function (key) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                localStorage.setItem(key, data[key]);
            } else if (KEEP_IF_MISSING.indexOf(key) === -1) {
                localStorage.removeItem(key);
            }
        });
    } catch (writeError) {
        console.error("Restore write failed:", writeError);
        BACKUP_KEYS.forEach(function (key) {
            try {
                if (previousValues[key] === null) localStorage.removeItem(key);
                else localStorage.setItem(key, previousValues[key]);
            } catch (e) {}
        });
        showToast(t("storage_full"), "error");
        return false;
    }

    return true;
}

// قراءة صارمة: لو البيانات الحالية تالفة نوقف الدمج كله
function readCurrentArray(key) {
    const raw = localStorage.getItem(key);
    if (raw === null) return [];
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) {
        throw new Error("Current data is corrupted: " + key);
    }
    return value;
}

// الحسابات اللي ينفع المعاملات والديون تشاور عليها (الحالية + اللي هتضاف من النسخة)
function collectKnownAccountIds(data) {
    const accountIds = new Set(getAccounts().map(a => a.id));
    const accountNames = new Set(getAccounts().map(a => a.name));
    if (data.accounts) {
        JSON.parse(data.accounts).forEach(function (a) {
            if (a.id && !accountNames.has(a.name)) accountIds.add(a.id);
        });
    }
    return accountIds;
}

// الفئات: بنضيف الجديد بس (بالاسم أو الـ id) من غير تكرار
function mergeCategories(data, writes) {
    if (!data[CATEGORIES_KEY]) return;

    const merged = readCurrentArray(CATEGORIES_KEY);
    const names = new Set(merged.map(x => x.name));
    const ids = new Set(merged.map(x => x.id).filter(Boolean));
    JSON.parse(data[CATEGORIES_KEY]).forEach(function (x) {
        if (names.has(x.name)) return;
        if (x.id && ids.has(x.id)) return;
        merged.push(x);
    });
    writes[CATEGORIES_KEY] = merged;
}

// الأهداف: بنضيف الجديد بس (بالـ id، أو بالمحتوى لو من غير id)
function mergeGoals(data, writes) {
    if (!data[GOALS_KEY]) return;

    const merged = readCurrentArray(GOALS_KEY);

    const goalSignature = function (x) {
        return [x.name, x.target, x.date].join("|");
    };

    const knownIds = new Set();
    const knownSignatures = new Set();
    merged.forEach(function (x) {
        if (x.id !== undefined && x.id !== null) knownIds.add(x.id);
        knownSignatures.add(goalSignature(x));
    });

    JSON.parse(data[GOALS_KEY]).forEach(function (x) {
        if (x.id !== undefined && x.id !== null) {
            if (knownIds.has(x.id)) return;
        } else {
            if (knownSignatures.has(goalSignature(x))) return;
            x.id = Date.now() + Math.floor(Math.random() * 1000);
        }
        merged.push(x);
    });

    writes[GOALS_KEY] = merged;
}

// المعاملات: بنضيف الجديد بس، وبنشيل أي ربط بحساب أو فئة مش موجودة
function mergeTransactions(data, writes) {
    if (!data.transactions) return;

    const merged = readCurrentArray("transactions");

    // المعاملة اللي من غير id بنقارنها بمحتواها
    const txSignature = function (x) {
        return [x.date, x.time, x.amount, x.account, x.type, x.category, x.description].join("|");
    };

    const knownIds = new Set();
    const knownSignatures = new Set();
    merged.forEach(function (x) {
        if (x.id) knownIds.add(x.id);
        knownSignatures.add(txSignature(x));
    });

    const knownAccountIds = collectKnownAccountIds(data);
    const knownCategoryIds = new Set((writes[CATEGORIES_KEY] || getCategories()).map(c => c.id));

    JSON.parse(data.transactions).forEach(function (x) {
        ["accountId", "transferToId", "transferFromId"].forEach(function (k) {
            if (x[k] && !knownAccountIds.has(x[k])) delete x[k];
        });
        if (x.categoryId && !knownCategoryIds.has(x.categoryId)) delete x.categoryId;
        if (x.id) {
            if (knownIds.has(x.id)) return;
        } else {
            if (knownSignatures.has(txSignature(x))) return;
            x.id = "tx_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
        }
        merged.push(x);
    });

    writes.transactions = merged;
}

// الديون: بنضيف الجديد بس، وبنشيل أي ربط بحساب مش موجود من الدفعات
function mergeDebts(data, writes) {
    if (!data.debts) return;

    const merged = readCurrentArray("debts");

    // الدين اللي من غير id بنقارنه بمحتواه
    const debtSignature = function (x) {
        return [x.type, x.person, x.amount, x.dueDate, x.createdAt, x.notes].join("|");
    };

    const knownIds = new Set();
    const knownSignatures = new Set();
    merged.forEach(function (x) {
        if (x.id !== undefined && x.id !== null) knownIds.add(x.id);
        knownSignatures.add(debtSignature(x));
    });

    const knownAccountIds = collectKnownAccountIds(data);

    JSON.parse(data.debts).forEach(function (x) {
        if (Array.isArray(x.payments)) {
            x.payments.forEach(function (p) {
                if (p.accountId && !knownAccountIds.has(p.accountId)) delete p.accountId;
            });
        }
        if (x.id !== undefined && x.id !== null) {
            if (knownIds.has(x.id)) return;
        } else {
            if (knownSignatures.has(debtSignature(x))) return;
            x.id = Date.now() + Math.floor(Math.random() * 1000);
        }
        merged.push(x);
    });

    writes.debts = merged;
}

// الحسابات: بنضيف الجديد بس (بالاسم أو الـ id)
function mergeAccounts(data, writes) {
    if (!data.accounts) return;

    const merged = readCurrentArray("accounts");
    const names = new Set(merged.map(x => x.name));
    const ids = new Set(merged.map(x => x.id).filter(Boolean));
    JSON.parse(data.accounts).forEach(x => {
        if (names.has(x.name)) return;
        if (x.id && ids.has(x.id)) return;
        merged.push(x);
    });
    writes.accounts = merged;
}

// الكتابة بعد ما كله نجح، ولو فشلت نرجّع القديم
function writeMergedData(writes) {
    const previousValues = {};
    Object.keys(writes).forEach(function (key) {
        previousValues[key] = localStorage.getItem(key);
    });

    try {
        Object.keys(writes).forEach(function (key) {
            localStorage.setItem(key, JSON.stringify(writes[key]));
        });
    } catch (writeError) {
        console.error("Merge write failed:", writeError);
        Object.keys(previousValues).forEach(function (key) {
            try {
                if (previousValues[key] === null) localStorage.removeItem(key);
                else localStorage.setItem(key, previousValues[key]);
            } catch (e) {}
        });
        showToast(t("storage_full"), "error");
        return false;
    }

    return true;
}

// دمج ذكي (Smart Merge): بنجهّز كل النتايج الأول من غير ما نكتب أي حاجة
function mergeBackupData(data) {
    try {
        const writes = {};

        // الترتيب مهم: المعاملات بتعتمد على الفئات اللي اتجهزت قبلها
        mergeCategories(data, writes);
        mergeGoals(data, writes);
        mergeTransactions(data, writes);
        mergeDebts(data, writes);
        mergeAccounts(data, writes);

        return writeMergedData(writes);
    } catch (e) {
        console.error("Merge aborted:", e);
        showToast(t("merge_cancelled_corrupt"), "error");
        return false;
    }
}
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

setupImport();
}
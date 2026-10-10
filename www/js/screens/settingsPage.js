
// ==============================================================
// screens/settingsPage.js
// كل منطق صفحة الإعدادات مجمّع في دالة واحدة initSettingsPage()
// بتتنادى يدويًا من الراوتر بعد ما محتوى الصفحة يتحقن جوه #app
// ==============================================================

function initSettingsPage() {
    
    // تحديث رقم الإصدار في كل الأماكن من مصدر واحد (APP_VERSION)
    const aboutVersionText = document.getElementById("aboutVersionText");
    if (aboutVersionText) aboutVersionText.textContent = "Version " + APP_VERSION;
    
    const appVersionText = document.getElementById("appVersionText");
    if (appVersionText) appVersionText.textContent = "Version " + APP_VERSION;
    
    const modalsPlaceholder = document.getElementById("modals-placeholder");
if (modalsPlaceholder) {
    modalsPlaceholder.innerHTML = renderSharedModals();
    if (window.lucide) lucide.createIcons({ root: modalsPlaceholder });
}
    
  // ------------------------------
// الوضع الليلي (Dark Mode)
// ------------------------------
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

// ------------------------------
// العملة (Currency)
// ------------------------------
const currencySelectBtn = document.getElementById("currencySelectBtn");
const currencySelectedLabel = document.getElementById("currencySelectedLabel");
const currencyPickerModal = document.getElementById("currencyPickerModal");
const closeCurrencyPickerBtn = document.getElementById("closeCurrencyPickerBtn");

function refreshCurrencyPicker() {
    const current = getCurrency();
    if (currencySelectedLabel) currencySelectedLabel.textContent = current;
    if (currencyPickerModal) {
        currencyPickerModal.querySelectorAll(".picker-option").forEach(function(opt) {
            opt.classList.toggle("selected", opt.dataset.value === current);
        });
    }
}
refreshCurrencyPicker();

if (currencySelectBtn && currencyPickerModal) {
    currencySelectBtn.addEventListener("click", function() {
        refreshCurrencyPicker();
        currencyPickerModal.classList.add("show");
    });
    
    currencyPickerModal.querySelectorAll(".picker-option").forEach(function(opt) {
        opt.addEventListener("click", function() {
            setCurrency(opt.dataset.value);
            refreshCurrencyPicker();
            currencyPickerModal.classList.remove("show");
        });
    });
    
    if (closeCurrencyPickerBtn) {
        closeCurrencyPickerBtn.addEventListener("click", function() {
            currencyPickerModal.classList.remove("show");
        });
    }
    
    currencyPickerModal.addEventListener("click", function(e) {
        if (e.target === currencyPickerModal) currencyPickerModal.classList.remove("show");
    });
}

// ------------------------------
// اللغة (Language)
// ------------------------------
const languageSelectBtn = document.getElementById("languageSelectBtn");
const languageSelectedLabel = document.getElementById("languageSelectedLabel");
const languagePickerModal = document.getElementById("languagePickerModal");
const closeLanguagePickerBtn = document.getElementById("closeLanguagePickerBtn");

function refreshLanguagePicker() {
    const current = getLanguage();
    if (languageSelectedLabel) {
        languageSelectedLabel.textContent = current === "ar" ? "العربية" : "English";
    }
    if (languagePickerModal) {
        languagePickerModal.querySelectorAll(".picker-option").forEach(function(opt) {
            opt.classList.toggle("selected", opt.dataset.value === current);
        });
    }
}
refreshLanguagePicker();

if (languageSelectBtn && languagePickerModal) {
    languageSelectBtn.addEventListener("click", function() {
        refreshLanguagePicker();
        languagePickerModal.classList.add("show");
    });
    
    languagePickerModal.querySelectorAll(".picker-option").forEach(function(opt) {
        opt.addEventListener("click", function() {
            setLanguage(opt.dataset.value);
            refreshLanguagePicker();
            languagePickerModal.classList.remove("show");
        });
    });
    
    if (closeLanguagePickerBtn) {
        closeLanguagePickerBtn.addEventListener("click", function() {
            languagePickerModal.classList.remove("show");
        });
    }
    
    languagePickerModal.addEventListener("click", function(e) {
        if (e.target === languagePickerModal) languagePickerModal.classList.remove("show");
    });
}

// ------------------------------
    // Savings Goals
    // ------------------------------
    const goalsBtn = document.getElementById("goalsBtn");

    if (goalsBtn) {
        goalsBtn.onclick = function () {
            navigateTo("goals");
        };
    }
        const catBudgetsBtn = document.getElementById("catBudgetsBtn");

    if (catBudgetsBtn) {
        catBudgetsBtn.onclick = function () {
            navigateTo("budgets");
        };
    }
    
    
    // ------------------------------
    // Auto Backup
    // ------------------------------
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
    
    // ------------------------------
    // About Savio Modal
    // ------------------------------
    const aboutBtn = document.getElementById("aboutSavioBtn");
    const aboutModal = document.getElementById("aboutModal");
    const closeAboutBtn = document.getElementById("closeAboutBtn");

    if (aboutBtn && aboutModal) {
        aboutBtn.addEventListener("click", function () {
            aboutModal.classList.add("show");
        });
    }

    if (closeAboutBtn && aboutModal) {
        closeAboutBtn.addEventListener("click", function () {
            aboutModal.classList.remove("show");
        });
    }

    if (aboutModal) {
        aboutModal.addEventListener("click", function (e) {
            if (e.target === aboutModal) {
                aboutModal.classList.remove("show");
            }
        });
    }
// ------------------------------
    // Privacy Modal
    // ------------------------------
    const privacyBtn = document.getElementById("privacyBtn");
    const privacyModal = document.getElementById("privacyModal");
    const closePrivacyBtn = document.getElementById("closePrivacyBtn");

    if (privacyBtn && privacyModal) {
        privacyBtn.addEventListener("click", function () {
            privacyModal.classList.add("show");
        });
    }

    if (closePrivacyBtn && privacyModal) {
        closePrivacyBtn.addEventListener("click", function () {
            privacyModal.classList.remove("show");
        });
    }

    if (privacyModal) {
        privacyModal.addEventListener("click", function (e) {
            if (e.target === privacyModal) {
                privacyModal.classList.remove("show");
            }
        });
    }
    // ------------------------------
    // Restore Last Snapshot
    // ------------------------------
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

    // ------------------------------
    // Clear All Data
    // ------------------------------
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

    // ------------------------------
    // Export Data
    // ------------------------------
    const exportBtn = document.getElementById("exportData");

    if (exportBtn) {
        const fallbackModal = document.getElementById("exportFallbackModal");
        const fallbackText = document.getElementById("exportFallbackText");
        const closeFallbackBtn = document.getElementById("closeExportFallbackBtn");
        const copyFallbackBtn = document.getElementById("copyExportFallbackBtn");

        if (closeFallbackBtn) {
            closeFallbackBtn.addEventListener("click", function () {
                fallbackModal.classList.remove("show");
            });
        }

        if (fallbackModal) {
            fallbackModal.addEventListener("click", function (e) {
                if (e.target === fallbackModal) fallbackModal.classList.remove("show");
            });
        }

        if (copyFallbackBtn) {
            copyFallbackBtn.addEventListener("click", async function () {
                fallbackText.select();
                try {
                    await navigator.clipboard.writeText(fallbackText.value);
                } catch (err) {
                    document.execCommand("copy");
                }
                showToast(t("settings_export_copied"), "success");
            });
        }

        exportBtn.addEventListener("click", async function () {
            const backup = {};
            BACKUP_KEYS.forEach(function (key) {
                const value = localStorage.getItem(key);
                if (value !== null) backup[key] = value;
            });

            const payload = {
                app: "Savio",
                version: 1,
                exportedAt: new Date().toISOString(),
                data: backup
            };

            const jsonText = JSON.stringify(payload, null, 2);
            const fileName = "savio-backup-" + Date.now() + ".json";

            // حفظ تاريخ التصدير وتحديث الشارة
            localStorage.setItem("savio_last_backup_time", new Date().toISOString());
            if (typeof updateLastBackupBadge === "function") updateLastBackupBadge();
// حفظ تلقائي في Downloads + بعدها فتح قائمة المشاركة
            let downloadsSaved = false;
            try {
                if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SaveToDownloads) {
                    await window.Capacitor.Plugins.SaveToDownloads.save({
                        fileName: fileName,
                        content: jsonText
                    });
showToast(t("backup_saved_downloads"), "success");
                    downloadsSaved = true;
                }
            } catch (downloadsErr) {
                console.warn("Save to Downloads error:", downloadsErr);
            }

            // 1. فتح قائمة المشاركة (Capacitor Native) - بدون أي رسائل لو اتلغت
            try {
                if (window.Capacitor && window.Capacitor.Plugins) {
                    const { Filesystem, Directory, Share } = window.Capacitor.Plugins;

                    if (Filesystem) {
                        const writtenFile = await Filesystem.writeFile({
                            path: fileName,
                            data: jsonText,
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
                            } catch (shareErr) {
                                // المستخدم لغى قائمة المشاركة - تجاهل بهدوء، الملف أصلاً محفوظ
                                console.warn("Share dismissed or failed:", shareErr);
                            }
                            return;
                        }
                    }
                }
            } catch (nativeErr) {
                console.warn("Capacitor Native Share Error:", nativeErr);
            }

            // لو مفيش Capacitor أصلاً (تشغيل من متصفح عادي)، ولم يتم الحفظ في Downloads
            if (downloadsSaved) return;

            // 2. المحاولة عبر Web Share في المتصفح العادي
            try {
                const file = new File([jsonText], fileName, { type: "application/json" });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                                                title: t("share_title"),
                            text: t("share_text_file"),
                        files: [file]
                    });
                    return;
                }
            } catch (e) {
                // تجاهل
            }

            // 3. مشاركة نصية كحل بديل
            if (navigator.share) {
                try {
                    await navigator.share({
title: t("share_title"),
                        text: jsonText
                    });
                    return;
                } catch (e) {}
            }

            // 4. في أسوأ الظروف لو أندرويد قديم جداً: تنزيل مباشر
            try {
                const blob = new Blob([jsonText], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
showToast(t("download_started"), "success");
            } catch (err) {
showToast(t("export_failed"), "error");
            }
        });


    }

// ------------------------------
    // Import Data الذكي مع المعاينة (مثل التطبيقات الكبيرة)
    // ------------------------------
    
    const importBtn = document.getElementById("importData");
const importManualModal = document.getElementById("importManualModal");
const closeImportManualBtn = document.getElementById("closeImportManualBtn");
const importFileInput = document.getElementById("importFileInput");    const restorePreviewModal = document.getElementById("restorePreviewModal");
    const cancelRestorePreviewBtn = document.getElementById("cancelRestorePreviewBtn");
    const confirmRestoreBtn = document.getElementById("confirmRestoreBtn");
    let pendingBackupPayload = null;

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

        importManualModal.addEventListener("click", function (e) {
            if (e.target === importManualModal) importManualModal.classList.remove("show");
        });

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

                                if (mode === "replace") {
                    // لقطة احتياطية من البيانات الحالية قبل ما نمسحها
                    if (!createPreRestoreSnapshot()) {
showToast(t("backup_take_failed_replace"), "error");
                        return;
                    }

                    // استبدال كامل
                    BACKUP_KEYS.forEach(function (key) {
                        if (Object.prototype.hasOwnProperty.call(pendingBackupPayload.data, key)) {
                            localStorage.setItem(key, pendingBackupPayload.data[key]);
                        } else {
                            localStorage.removeItem(key);
                        }
                    });
                } else {
                    // دمج ذكي (Smart Merge)
                                        try {
                        const data = pendingBackupPayload.data;

                        // قراءة صارمة: لو البيانات الحالية تالفة نوقف الدمج كله
                        const readCurrent = function (key) {
                            const raw = localStorage.getItem(key);
                            if (raw === null) return [];
                            const value = JSON.parse(raw);
                            if (!Array.isArray(value)) {
                                throw new Error("Current data is corrupted: " + key);
                            }
                            return value;
                        };

                        // بنجهّز كل النتايج الأول من غير ما نكتب أي حاجة
                        const writes = {};

                                                if (data.transactions) {
                            const merged = readCurrent("transactions");
                            
                            // المعاملة اللي من غير id بنقارنها بمحتواها
                            const txSignature = function(x) {
                                return [x.date, x.time, x.amount, x.account, x.type, x.category, x.description].join("|");
                            };
                            
                            const knownIds = new Set();
                            const knownSignatures = new Set();
                            merged.forEach(function(x) {
                                if (x.id) knownIds.add(x.id);
                                knownSignatures.add(txSignature(x));
                            });
                            
                            const curAccIds = new Set(getAccounts().map(a => a.id));
                            const curCatIds = new Set(getCategories().map(c => c.id));
                            
                            JSON.parse(data.transactions).forEach(function(x) {
                                        ["accountId", "transferToId", "transferFromId"].forEach(function(k) {
                                            if (x[k] && !curAccIds.has(x[k])) delete x[k];
                                        });
                                        if (x.categoryId && !curCatIds.has(x.categoryId)) delete x.categoryId;
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
                                                if (data.debts) {
                            const merged = readCurrent("debts");

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

                            const curDebtAccIds = new Set(getAccounts().map(a => a.id));
                            
                            JSON.parse(data.debts).forEach(function(x) {
                                        if (Array.isArray(x.payments)) {
                                            x.payments.forEach(function(p) {
                                                if (p.accountId && !curDebtAccIds.has(p.accountId)) delete p.accountId;
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
                        if (data.accounts) {
                            const merged = readCurrent("accounts");
                            const names = new Set(merged.map(x => x.name));
                            const ids = new Set(merged.map(x => x.id).filter(Boolean));
                            JSON.parse(data.accounts).forEach(x => {
                                if (names.has(x.name)) return;
                                if (x.id && ids.has(x.id)) return;
                                merged.push(x);
                            });
                            writes.accounts = merged;
                        }

                        // الكتابة بعد ما كله نجح
                        Object.keys(writes).forEach(function (key) {
                            localStorage.setItem(key, JSON.stringify(writes[key]));
                        });
                    } catch (e) {
                        console.error("Merge aborted:", e);
showToast(t("merge_cancelled_corrupt"), "error");
                        return;
                    }
                }

                restorePreviewModal.classList.remove("show");
                showToast(t("settings_import_done"), "success");
                setTimeout(function () { window.location.href = "index.html"; }, 800);
            };
        }
    }
}
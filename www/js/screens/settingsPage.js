
// ==============================================================
// screens/settingsPage.js
// كل منطق صفحة الإعدادات مجمّع في دالة واحدة initSettingsPage()
// بتتنادى يدويًا من الراوتر بعد ما محتوى الصفحة يتحقن جوه #app
// ==============================================================

function initSettingsPage() {
    
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
    // Clear All Data
    // ------------------------------
    const clearDataBtn = document.getElementById("clearData");

    if (clearDataBtn) {
    clearDataBtn.addEventListener("click", async function() {
                    const confirmClear = await customConfirm(t("settings_clear_confirm"), { danger: true });
                    if (!confirmClear) return;

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
                    showToast("تم حفظ النسخة في Downloads", "success");
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
                                    title: "نسخة احتياطية - Savio",
                                    text: "ملف النسخة الاحتياطية لتطبيق Savio",
                                    url: writtenFile.uri,
                                    dialogTitle: "حفظ أو مشاركة النسخة الاحتياطية"
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
                        title: "نسخة احتياطية - Savio",
                        text: "ملف النسخة الاحتياطية",
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
                        title: "نسخة احتياطية - Savio",
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
                showToast("تم بدء التنزيل", "success");
            } catch (err) {
                showToast("حدث خطأ أثناء التصدير", "error");
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
            badge.textContent = "لم يتم إنشاء نسخة بعد";
        } else {
            const d = new Date(lastTime);
            badge.textContent = "آخر نسخة: " + d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                        if (pendingBackupPayload.data.transactions) {
                            const newTxs = JSON.parse(pendingBackupPayload.data.transactions);
                            const currentTxs = JSON.parse(localStorage.getItem("transactions")) || [];
                            const currentIds = new Set(currentTxs.map(t => t.id));
                            newTxs.forEach(t => { if (!currentIds.has(t.id)) currentTxs.push(t); });
                            localStorage.setItem("transactions", JSON.stringify(currentTxs));
                        }
                        if (pendingBackupPayload.data.debts) {
                            const newDebts = JSON.parse(pendingBackupPayload.data.debts);
                            const currentDebts = JSON.parse(localStorage.getItem("debts")) || [];
                            const currentDebtIds = new Set(currentDebts.map(d => d.id));
                            newDebts.forEach(d => { if (!currentDebtIds.has(d.id)) currentDebts.push(d); });
                            localStorage.setItem("debts", JSON.stringify(currentDebts));
                        }
                        if (pendingBackupPayload.data.accounts) {
                            const newAccs = JSON.parse(pendingBackupPayload.data.accounts);
                            const currentAccs = JSON.parse(localStorage.getItem("accounts")) || [];
                            const currentNames = new Set(currentAccs.map(a => a.name));
                            newAccs.forEach(a => { if (!currentNames.has(a.name)) currentAccs.push(a); });
                            localStorage.setItem("accounts", JSON.stringify(currentAccs));
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }

                restorePreviewModal.classList.remove("show");
                showToast(t("settings_import_done"), "success");
                setTimeout(function () { window.location.href = "index.html"; }, 800);
            };
        }
    }
}
// ==============================================================
// screens/settingsPage.js
// كل منطق صفحة الإعدادات مجمّع في دالة واحدة initSettingsPage()
// بتتنادى يدويًا من الراوتر بعد ما محتوى الصفحة يتحقن جوه #app
// ==============================================================

function initSettingsPage() {

    // ------------------------------
    // الوضع الليلي (Dark Mode)
    // ------------------------------
    // ملحوظة: مش بنستخدم مرجع darkModeToggle بتاع theme.js
    // لأنه بيتحدد مرة واحدة بس وقت أول تحميل للتطبيق،
    // وهنا العنصر بيتحقن من جديد كل مرة الصفحة تتفتح، فلازم نجيبه "طازة"
    const darkModeToggle = document.getElementById("darkModeToggle");

    if (darkModeToggle) {
        const currentTheme = localStorage.getItem("theme") || "light";
        darkModeToggle.checked = currentTheme === "dark";

        darkModeToggle.addEventListener("change", function () {
            const newTheme = this.checked ? "dark" : "light";
            localStorage.setItem("theme", newTheme);
            if (typeof applyTheme === "function") {
                applyTheme(newTheme);
            }
        });
    }

    // ------------------------------
    // العملة (Currency)
    // ------------------------------
    const currencySelect = document.getElementById("currencySelect");

    if (currencySelect) {
        currencySelect.value = getCurrency();

        currencySelect.addEventListener("change", function () {
            setCurrency(this.value);
        });
    }

    // ------------------------------
    // اللغة (Language)
    // ------------------------------
    const languageSelect = document.getElementById("languageSelect");

    if (languageSelect) {
        languageSelect.value = getLanguage();

        languageSelect.addEventListener("change", function () {
            setLanguage(this.value);
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
    // Clear All Data
    // ------------------------------
    const clearDataBtn = document.getElementById("clearData");

    if (clearDataBtn) {
        clearDataBtn.addEventListener("click", function () {
            const confirmClear = confirm(t("settings_clear_confirm"));
            if (!confirmClear) return;

            localStorage.removeItem("transactions");
            localStorage.removeItem("accounts");
            localStorage.removeItem("categories");
            localStorage.removeItem("customCategoryIcons");
            localStorage.removeItem("debts");
            localStorage.removeItem("savioBudget");

            alert(t("settings_clear_done"));

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

            const BACKUP_KEYS = [
                "transactions", "accounts", "categories", "customCategoryIcons",
                "debts", "savioBudget", "theme", "language", "currency", "balanceHidden"
            ];

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

            try {
                if (
                    window.Capacitor &&
                    window.Capacitor.isNativePlatform &&
                    window.Capacitor.isNativePlatform() &&
                    window.Capacitor.Plugins &&
                    window.Capacitor.Plugins.Filesystem
                ) {
                    const { Filesystem, Directory, Encoding } = window.Capacitor.Plugins;
                    await Filesystem.writeFile({
                        path: fileName,
                        data: jsonText,
                        directory: Directory.Documents,
                        encoding: Encoding.UTF8
                    });
                    showToast(t("settings_export_done"), "success");
                    return;
                }
            } catch (err) {
                console.error("Filesystem export failed:", err);
            }

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
                showToast(t("settings_export_done"), "success");
                return;
            } catch (err) {
                console.error("Blob download export failed:", err);
            }

            fallbackText.value = jsonText;
            fallbackModal.classList.add("show");
        });
    }

    // ------------------------------
    // Import Data
    // ------------------------------
    const importBtn = document.getElementById("importData");
    const importManualModal = document.getElementById("importManualModal");
    const importManualText = document.getElementById("importManualText");
    const closeImportManualBtn = document.getElementById("closeImportManualBtn");
    const restoreImportManualBtn = document.getElementById("restoreImportManualBtn");
    const importFileInput = document.getElementById("importFileInput");

    if (importBtn && importManualModal) {

        if (importFileInput) {
            importFileInput.addEventListener("change", function () {
                const file = importFileInput.files && importFileInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function () {
                    importManualText.value = reader.result;
                };
                reader.onerror = function () {
                    showToast(t("settings_import_invalid"), "error");
                };
                reader.readAsText(file);
            });
        }

        const BACKUP_KEYS = [
            "transactions", "accounts", "categories", "customCategoryIcons",
            "debts", "savioBudget", "theme", "language", "currency", "balanceHidden"
        ];

        importBtn.addEventListener("click", function () {
            importManualText.value = "";
            importManualModal.classList.add("show");
        });

        if (closeImportManualBtn) {
            closeImportManualBtn.addEventListener("click", function () {
                importManualModal.classList.remove("show");
            });
        }

        importManualModal.addEventListener("click", function (e) {
            if (e.target === importManualModal) importManualModal.classList.remove("show");
        });

        if (restoreImportManualBtn) {
            restoreImportManualBtn.addEventListener("click", function () {
                const rawText = importManualText.value.trim();
                if (!rawText) { showToast(t("settings_import_invalid"), "error"); return; }

                try {
                    const payload = JSON.parse(rawText);
                    if (!payload || payload.app !== "Savio" || !payload.data) throw new Error("invalid");

                    if (!confirm(t("settings_import_confirm"))) return;

                    BACKUP_KEYS.forEach(function (key) {
                        if (Object.prototype.hasOwnProperty.call(payload.data, key)) {
                            localStorage.setItem(key, payload.data[key]);
                        } else {
                            localStorage.removeItem(key);
                        }
                    });

                    importManualModal.classList.remove("show");
                    showToast(t("settings_import_done"), "success");
                    setTimeout(function () { window.location.href = "index.html"; }, 800);

                } catch (error) {
                    showToast(t("settings_import_invalid"), "error");
                }
            });
        }
    }
}
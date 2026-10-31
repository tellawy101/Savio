// ==============================
// settings/settingsImport.js
// استيراد ملف النسخة الاحتياطية ومعاينته قبل الاستعادة
// ==============================
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
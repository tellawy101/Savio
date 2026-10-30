// ==============================
// export/exportShared.js
// دوال مشتركة بين تصدير CSV وExcel وPDF
// ==============================

// تحميل مكتبة JS عند الطلب بس (عشان فتح التطبيق يبقى أسرع)
function loadScriptOnce(src) {
    return new Promise(function (resolve, reject) {
        const existing = document.querySelector('script[data-lazy="' + src + '"]');
        if (existing) {
            if (existing.dataset.loaded === "1") return resolve();
            existing.addEventListener("load", resolve);
            existing.addEventListener("error", reject);
            return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.dataset.lazy = src;
        s.onload = function () { s.dataset.loaded = "1"; resolve(); };
        s.onerror = function () { s.remove(); reject(new Error("load failed: " + src)); };
        document.head.appendChild(s);
    });
}

// بتحوّل أي وقت متخزّن (قديم بصيغة 12 ساعة أو عربي، أو جديد HH:mm) لمفتاح ترتيب HH:mm بنظام 24 ساعة
function getTimeSortKey(time) {
    const text = normalizeDigits(time || "");
    const match = /(\d{1,2}):(\d{2})/.exec(text);
    if (!match) return "00:00";

    let hours = Number(match[1]);
    if (/pm|م/i.test(text) && hours < 12) hours += 12;
    if (/am|ص/i.test(text) && hours === 12) hours = 0;

    return String(hours).padStart(2, "0") + ":" + match[2];
}

// بترجع المعاملات مرتبة من الأحدث للأقدم
function getExportRows() {
    return loadTransactions()
        .slice()
        .map(function(tx) {
            return Object.assign({}, tx, {
                category: getTxCategoryName(tx),
                account: getTxAccountName(tx)
            });
        })
        .sort(function(a, b) {
            const da = (a.date || "") + " " + getTimeSortKey(a.time);
            const db = (b.date || "") + " " + getTimeSortKey(b.time);
            return db.localeCompare(da);
        });
}

function getExportTypeLabel(type, isTransfer) {
    if (isTransfer) {
        if (type === "income") return "Transfer In";
        if (type === "expense") return "Transfer Out";
        return "Transfer";
    }
    if (type === "income") return "Income";
    if (type === "expense") return "Expense";
    return type || "";
}

function getExportFileStamp() {
    return new Date().toISOString().slice(0, 10);
}

// بتكتب الملف وتفتح المشاركة (أندرويد) أو تنزله مباشرة (متصفح)
async function saveExportFile(fileName, text, mimeType) {

    // 1) Capacitor: كتابة في الكاش + قائمة المشاركة
    try {
        const plugins = window.Capacitor && window.Capacitor.Plugins;

        if (plugins && plugins.Filesystem) {
            const written = await plugins.Filesystem.writeFile({
                path: fileName,
                data: text,
                directory: "CACHE",
                encoding: "utf8"
            });

            if (plugins.Share) {
                try {
                    await plugins.Share.share({
                        title: fileName,
                        url: written.uri,
                        dialogTitle: fileName
                    });
                } catch (shareErr) {
                    // المستخدم قفل قائمة المشاركة
                    console.warn("Share dismissed:", shareErr);
                    return false;
                }
            }
            return true;
        }
    } catch (nativeErr) {
        console.warn("Native export error:", nativeErr);
        showToast(t("export_failed"), "error");
        return false;
    }

    // 2) متصفح عادي: تنزيل مباشر
    try {
        const blob = new Blob([text], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (err) {
        console.error("Export download error:", err);
        return false;
    }
}

// بتكتب ملف باينري (base64) وتفتح المشاركة (أندرويد) أو تنزله مباشرة (متصفح)
async function saveExportBinary(fileName, base64Data, mimeType) {

    // 1) Capacitor: من غير encoding يعني base64
    try {
        const plugins = window.Capacitor && window.Capacitor.Plugins;

        if (plugins && plugins.Filesystem) {
            const written = await plugins.Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: "CACHE"
            });

            if (plugins.Share) {
                try {
                    await plugins.Share.share({
                        title: fileName,
                        url: written.uri,
                        dialogTitle: fileName
                    });
                } catch (shareErr) {
                    console.warn("Share dismissed:", shareErr);
                    return false;
                }
            }
            return true;
        }
    } catch (nativeErr) {
        console.warn("Native binary export error:", nativeErr);
        showToast(t("export_failed"), "error");
        return false;
    }

    // 2) متصفح عادي: تنزيل مباشر
    try {
        const bin = atob(base64Data);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (err) {
        console.error("Binary export download error:", err);
        return false;
    }
}
// ==============================
// exportReport.js
// تصدير المعاملات (CSV الأول، وبعدين Excel وPDF)
// ==============================

// ---------- دوال مشتركة (هنستخدمها في Excel وPDF كمان) ----------

// بترجع المعاملات مرتبة من الأحدث للأقدم
function getExportRows() {
    return loadTransactions()
        .slice()
        .sort(function (a, b) {
            const da = (a.date || "") + " " + (a.time || "");
            const db = (b.date || "") + " " + (b.time || "");
            return db.localeCompare(da);
        });
}

function getExportTypeLabel(type) {
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

// ---------- CSV ----------

function csvCell(value) {
    let s = value === null || value === undefined ? "" : String(value);

    // حماية من تفسير النص كمعادلة في Excel
    if (/^[=+\-@]/.test(s)) s = "'" + s;

    if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';

    return s;
}

function buildTransactionsCsv() {
    const rows = getExportRows();
    const currency = getCurrency();

    const header = ["Date", "Time", "Type", "Category", "Account", "Description", "Amount", "Currency"];

    const lines = [header.map(csvCell).join(",")];

    rows.forEach(function (tx) {
        lines.push([
            tx.date,
            tx.time,
            getExportTypeLabel(tx.type),
            tx.category,
            tx.account,
            tx.description,
            Number(tx.amount) || 0,
            currency
        ].map(csvCell).join(","));
    });

    // BOM عشان Excel يقرا العربي صح
    return "\uFEFF" + lines.join("\r\n");
}

async function exportTransactionsCsv() {
    if (getExportRows().length === 0) {
        showToast(t("export_empty_toast"), "error");
        return;
    }

    const ok = await saveExportFile(
        "savio-transactions-" + getExportFileStamp() + ".csv",
        buildTransactionsCsv(),
        "text/csv;charset=utf-8"
    );

    if (ok) showToast(t("export_csv_done_toast"), "success");
}

// الصفحة بتتحمل ديناميك (SPA) فبنستخدم event delegation
document.addEventListener("click", function (e) {
    if (e.target.closest("#exportCsvBtn")) {
        exportTransactionsCsv();
    }
});
// ---------- Excel (XLSX) ----------

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

function buildTransactionsWorkbook() {
    const rows = getExportRows();
    const currency = getCurrency();

    const sheetData = [
        ["Date", "Time", "Type", "Category", "Account", "Description", "Amount", "Currency"]
    ];

    rows.forEach(function (tx) {
        sheetData.push([
            tx.date || "",
            tx.time || "",
            getExportTypeLabel(tx.type),
            tx.category || "",
            tx.account || "",
            tx.description || "",
            Number(tx.amount) || 0,
            currency
        ]);
    });

    const sheet = XLSX.utils.aoa_to_sheet(sheetData);

    // عرض الأعمدة
    sheet["!cols"] = [
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 18 },
        { wch: 18 },
        { wch: 30 },
        { wch: 12 },
        { wch: 10 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Transactions");

    return workbook;
}

async function exportTransactionsExcel() {
    if (typeof XLSX === "undefined") {
        showToast("مكتبة Excel مش متحملة", "error");
        return;
    }

    if (getExportRows().length === 0) {
        showToast(t("export_empty_toast"), "error");
        return;
    }

    const base64 = XLSX.write(buildTransactionsWorkbook(), {
        bookType: "xlsx",
        type: "base64"
    });

    const ok = await saveExportBinary(
        "savio-transactions-" + getExportFileStamp() + ".xlsx",
        base64,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    if (ok) showToast(t("export_excel_done_toast"), "success");
}

document.addEventListener("click", function (e) {
    if (e.target.closest("#exportExcelBtn")) {
        exportTransactionsExcel();
    }
});
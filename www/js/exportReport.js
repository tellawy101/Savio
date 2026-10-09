// ==============================
// exportReport.js
// تصدير المعاملات (CSV الأول، وبعدين Excel وPDF)
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
        s.onerror = function () { reject(new Error("load failed: " + src)); };
        document.head.appendChild(s);
    });
}
// ---------- دوال مشتركة (هنستخدمها في Excel وPDF كمان) ----------

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
        try {
        await loadScriptOnce("js/vendor/xlsx.full.min.js");
    } catch (err) {
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
// ---------- PDF ----------

function exportEscapeHtml(value) {
    return String(value === null || value === undefined ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function buildTransactionsPdfElement() {
    const rows = getExportRows();
    const currency = getCurrency();

    let totalIncome = 0;
    let totalExpense = 0;

    const cellStyle = "padding:6px 4px;border-bottom:1px solid #e0e0e0;text-align:center;font-size:11px;";

    const bodyRows = rows.map(function (tx) {
        const amount = Number(tx.amount) || 0;
        let color = "#555";

        if (tx.type === "income") {
            totalIncome += amount;
            color = "#2E7D32";
        } else if (tx.type === "expense") {
            totalExpense += amount;
            color = "#C62828";
        }

        return "<tr style='page-break-inside:avoid;'>" +
            "<td style='" + cellStyle + "'>" + exportEscapeHtml(tx.date) + "</td>" +
            "<td style='" + cellStyle + "'>" + exportEscapeHtml(tx.time) + "</td>" +
            "<td style='" + cellStyle + "color:" + color + ";'>" + exportEscapeHtml(getExportTypeLabel(tx.type)) + "</td>" +
            "<td style='" + cellStyle + "'>" + exportEscapeHtml(tx.category) + "</td>" +
            "<td style='" + cellStyle + "'>" + exportEscapeHtml(tx.account) + "</td>" +
            "<td style='" + cellStyle + "'>" + exportEscapeHtml(tx.description) + "</td>" +
            "<td style='" + cellStyle + "color:" + color + ";font-weight:bold;'>" +
                amount.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " " + exportEscapeHtml(currency) +
            "</td>" +
            "</tr>";
    }).join("");

    const net = totalIncome - totalExpense;
    const fmt = function (n) {
        return n.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " " + exportEscapeHtml(currency);
    };

    const headStyle = "padding:8px 4px;background:#1976D2;color:#fff;text-align:center;font-size:11px;";
    const heads = ["Date", "Time", "Type", "Category", "Account", "Description", "Amount"]
        .map(function (h) { return "<th style='" + headStyle + "'>" + h + "</th>"; })
        .join("");

    const box = document.createElement("div");
    box.style.cssText = "width:700px;padding:10px;font-family:Arial,sans-serif;color:#222;background:#fff;direction:ltr;";

    box.innerHTML =
        "<h2 style='text-align:center;margin:0 0 4px;'>Savio - Transactions</h2>" +
        "<p style='text-align:center;margin:0 0 14px;color:#777;font-size:12px;'>" + getExportFileStamp() + "</p>" +
        "<div style='display:flex;justify-content:space-around;margin-bottom:14px;font-size:12px;'>" +
            "<div>Income: <b style='color:#2E7D32;'>" + fmt(totalIncome) + "</b></div>" +
            "<div>Expense: <b style='color:#C62828;'>" + fmt(totalExpense) + "</b></div>" +
            "<div>Net: <b>" + fmt(net) + "</b></div>" +
        "</div>" +
        "<table style='width:100%;border-collapse:collapse;'>" +
            "<thead><tr>" + heads + "</tr></thead>" +
            "<tbody>" + bodyRows + "</tbody>" +
        "</table>";

    return box;
}

async function exportTransactionsPdf() {
        try {
        await loadScriptOnce("js/vendor/html2pdf.bundle.min.js");
    } catch (err) {
        showToast("مكتبة PDF مش متحملة", "error");
        return;
    }

    if (getExportRows().length === 0) {
        showToast(t("export_empty_toast"), "error");
        return;
    }

    const fileName = "savio-transactions-" + getExportFileStamp() + ".pdf";
    let base64;

    try {
        const dataUri = await html2pdf()
            .set({
                margin: 10,
                filename: fileName,
                image: { type: "jpeg", quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["css", "legacy"] }
            })
            .from(buildTransactionsPdfElement())
            .outputPdf("datauristring");

        base64 = dataUri.split("base64,")[1];
    } catch (err) {
        console.error("PDF build error:", err);
        showToast("حصلت مشكلة في تجهيز الـ PDF", "error");
        return;
    }

    const ok = await saveExportBinary(fileName, base64, "application/pdf");

    if (ok) showToast(t("export_pdf_done_toast"), "success");
}

document.addEventListener("click", function (e) {
    if (e.target.closest("#exportPdfBtn")) {
        exportTransactionsPdf();
    }
});
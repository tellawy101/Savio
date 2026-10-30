// ==============================
// export/exportCsv.js
// تصدير المعاملات CSV
// ==============================

function csvCell(value) {
    let s = value === null || value === undefined ? "" : String(value);

    // حماية من تفسير النص كمعادلة في Excel
    if (/^[=+\-@]/.test(s) && !/^[+-]?\d+(\.\d+)?$/.test(s)) s = "'" + s;

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
            getExportTypeLabel(tx.type, tx.isTransfer),
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
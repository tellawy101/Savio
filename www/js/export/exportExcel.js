// ==============================
// export/exportExcel.js
// تصدير المعاملات Excel (XLSX)
// ==============================

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
            getExportTypeLabel(tx.type, tx.isTransfer),
                        getTxCategoryName(tx) || "",
                getTxAccountName(tx) || "",            tx.description || "",
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
        showToast(t("excel_lib_missing"), "error");
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
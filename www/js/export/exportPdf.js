// ==============================
// export/exportPdf.js
// تصدير المعاملات PDF
// ==============================

// عدد المعاملات في الجزء الواحد من الـ PDF (عشان الذاكرة متخلصش مع الداتا الكبيرة)
const PDF_ROWS_PER_CHUNK = 100;

// rows: معاملات الجزء ده بس
// totals: إجماليات كل المعاملات (بتتبعت لأول جزء بس، وفيه العنوان والملخص)
function buildTransactionsPdfElement(rows, totals) {
    const currency = getCurrency();

    const cellStyle = "padding:6px 4px;border-bottom:1px solid #e0e0e0;text-align:center;font-size:11px;";

    const bodyRows = rows.map(function(tx) {
        const amount = Number(tx.amount) || 0;
        let color = "#555";

        if (!tx.isTransfer) {
            if (tx.type === "income") {
                color = "#2E7D32";
            } else if (tx.type === "expense") {
                color = "#C62828";
            }
        }

        return "<tr style='page-break-inside:avoid;'>" +
            "<td style='" + cellStyle + "'>" + escapeHTML(tx.date) + "</td>" +
            "<td style='" + cellStyle + "'>" + escapeHTML(tx.time) + "</td>" +
            "<td style='" + cellStyle + "color:" + color + ";'>" + escapeHTML(getExportTypeLabel(tx.type, tx.isTransfer)) + "</td>" +
            "<td style='" + cellStyle + "'>" + escapeHTML(tx.category) + "</td>" +
            "<td style='" + cellStyle + "'>" + escapeHTML(tx.account) + "</td>" +
            "<td style='" + cellStyle + "'>" + escapeHTML(tx.description) + "</td>" +
            "<td style='" + cellStyle + "color:" + color + ";font-weight:bold;'>" +
            amount.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " " + escapeHTML(currency) +
            "</td>" +
            "</tr>";
    }).join("");

    const fmt = function(n) {
        return n.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " " + escapeHTML(currency);
    };

    const headStyle = "padding:8px 4px;background:#1976D2;color:#fff;text-align:center;font-size:11px;";
    const heads = ["Date", "Time", "Type", "Category", "Account", "Description", "Amount"]
        .map(function(h) { return "<th style='" + headStyle + "'>" + h + "</th>"; })
        .join("");

    const summaryHtml = totals ?
        "<h2 style='text-align:center;margin:0 0 4px;'>Savio - Transactions</h2>" +
        "<p style='text-align:center;margin:0 0 14px;color:#777;font-size:12px;'>" + getExportFileStamp() + "</p>" +
        "<div style='display:flex;justify-content:space-around;margin-bottom:14px;font-
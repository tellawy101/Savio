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
        "<div style='display:flex;justify-content:space-around;margin-bottom:14px;font-size:12px;'>" +
        "<div>Income: <b style='color:#2E7D32;'>" + fmt(totals.income) + "</b></div>" +
            "<div>Expense: <b style='color:#C62828;'>" + fmt(totals.expense) + "</b></div>" +
            "<div>Net: <b>" + fmt(totals.net) + "</b></div>" +
            "</div>":
            "";
        
        const box = document.createElement("div");
        box.style.cssText = "width:700px;padding:10px;font-family:Arial,sans-serif;color:#222;background:#fff;direction:ltr;";
        
        box.innerHTML = summaryHtml +
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
                showToast(t("pdf_lib_missing"), "error");
                return;
            }
            
            const rows = getExportRows();
            
            if (rows.length === 0) {
                showToast(t("export_empty_toast"), "error");
                return;
            }
            
            // إجماليات كل المعاملات (التحويلات مش محسوبة)
            let totalIncome = 0;
            let totalExpense = 0;
            rows.forEach(function(tx) {
                if (tx.isTransfer) return;
                const amount = Number(tx.amount) || 0;
                if (tx.type === "income") totalIncome += amount;
                else if (tx.type === "expense") totalExpense += amount;
            });
            const totals = { income: totalIncome, expense: totalExpense, net: totalIncome - totalExpense };
            
            // تقسيم المعاملات لأجزاء، وكل جزء بيتحوّل لصفحات لوحده (بدل عنصر واحد ضخم)
            const chunks = [];
            for (let i = 0; i < rows.length; i += PDF_ROWS_PER_CHUNK) {
                chunks.push(rows.slice(i, i + PDF_ROWS_PER_CHUNK));
            }
            
            const fileName = "savio-transactions-" + getExportFileStamp() + ".pdf";
            const pdfOptions = {
                margin: 10,
                filename: fileName,
                image: { type: "jpeg", quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["css", "legacy"] }
            };
            let base64;
            
            try {
                let worker = html2pdf()
                    .set(pdfOptions)
                    .from(buildTransactionsPdfElement(chunks[0], totals))
                    .toContainer()
                    .toCanvas()
                    .toPdf();
                
                chunks.slice(1).forEach(function(chunkRows) {
                    worker = worker
                        .get("pdf")
                        .then(function(pdf) { pdf.addPage(); })
                        .from(buildTransactionsPdfElement(chunkRows, null))
                        .toContainer()
                        .toCanvas()
                        .toPdf();
                });
                
                const dataUri = await worker.outputPdf("datauristring");
                base64 = dataUri.split("base64,")[1];
            } catch (err) {
                console.error("PDF build error:", err);
                showToast(t("pdf_prepare_error"), "error");
                return;
            }
            
            const ok = await saveExportBinary(fileName, base64, "application/pdf");
            
            if (ok) showToast(t("export_pdf_done_toast"), "success");
        }
        
        document.addEventListener("click", function(e) {
            if (e.target.closest("#exportPdfBtn")) {
                exportTransactionsPdf();
            }
        });
// ======================================
// home/homeMonthFilter.js
// فلتر الفترة: بوتوم شيت (آخر 7 أيام / الشهر ده / ... / شهر معين / مخصص)
// ======================================

function initHomeMonthFilter(expenseList, renderExpenses) {
    const monthLabelBtn = document.getElementById("monthLabelBtn");

    function pad(n) { return String(n).padStart(2, "0"); }
    function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

    function rangeForKey(key) {
        const now = new Date();
        if (key === "last_7") {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
            return { from: iso(start), to: iso(now) };
        }
        if (key === "all") return { from: "0000-01-01", to: "9999-12-31" };
        return getPeriodRangeFor(key, "", "");
    }

    function setRange(key, from, to) {
        window.homeRange = { key: key, from: from, to: to };
        const rs = window.homeReportState || (window.homeReportState = { period: "this_month", from: "", to: "" });
        rs.period = "custom";
        rs.from = from;
        rs.to = to;
    }

    function setPreset(key) {
        const r = rangeForKey(key);
        setRange(key, r.from, r.to);
    }

    if (!window.homeRange) setPreset("this_month");

    function monthName(y, m) {
        return new Date(y, m - 1, 1).toLocaleDateString(getLanguage() === "ar" ? "ar-EG" : "en-US", { month: getLanguage() === "ar" ? "long" : "short" });
    }

    function formatDay(dateStr, withYear) {
        const p = dateStr.split("-").map(Number);
        const name = monthName(p[0], p[1]);
        const txt = getLanguage() === "ar" ? p[2] + " " + name : name + " " + p[2];
        return withYear ? txt + " " + p[0] : txt;
    }

    function renderLabel() {
        if (!monthLabelBtn) return;
        const r = window.homeRange;
        if (r.key === "all") {
                        monthLabelBtn.textContent = t("range_all");
            return;
        }
        const thisYear = new Date().getFullYear();
        const withYear = Number(r.from.slice(0, 4)) !== thisYear || Number(r.to.slice(0, 4)) !== thisYear;
        monthLabelBtn.textContent = formatDay(r.from, withYear) + " - " + formatDay(r.to, withYear);
    }

    const oldSheet = document.getElementById("homeRangeSheet");
    if (oldSheet) oldSheet.remove();
    const sheet = document.createElement("div");
    sheet.id = "homeRangeSheet";
    sheet.className = "modal select-sheet";
    document.body.appendChild(sheet);
    closeModalOnBackdropClick(sheet);

    function applyAndClose() {
        sheet.classList.remove("show");
        renderLabel();
        renderExpenses();
    }

    function openSheet() {
        const r = window.homeRange;
        const presets = [
            ["last_7", t("range_last_7")],
            ["this_month", t("range_this_month")],
            ["last_month", t("range_last_month")],
            ["this_year", t("range_this_year")],
            ["last_year", t("range_last_year")],
            ["all", t("range_all")]
        ];
        
        sheet.innerHTML = `
            <div class="modal-content">
                <h2>${t("range_select_title")}</h2>
                <div class="range-chips">
                    ${presets.map(function (p) {
                        return `<button type="button" class="range-chip ${r.key === p[0] ? "active" : ""}" data-key="${p[0]}">${p[1]}</button>`;
                    }).join("")}
                </div>
                <div class="range-section-title">${t("range_search_month")}</div>
                <input type="month" id="rangeMonthInput" class="range-input" required data-ph="${t("range_pick_month")}" value="${r.key === "month" ? r.from.slice(0, 7) : ""}">
                <div class="range-section-title">${t("range_custom")}</div>
                <div class="range-custom">
                    <label><span>${t("range_from")}</span><input type="date" id="rangeFromInput" class="range-input" required data-ph="${t("range_pick_date")}" value="${r.key === "custom" ? r.from : ""}"></label>
                    <label><span>${t("range_to")}</span><input type="date" id="rangeToInput" class="range-input" required data-ph="${t("range_pick_date")}" value="${r.key === "custom" ? r.to : ""}"></label>
                </div>
                <button type="button" id="rangeApplyBtn" class="range-apply">${t("range_apply")}</button>
            </div>
        `;
        sheet.querySelectorAll(".range-chip").forEach(function (btn) {
            btn.onclick = function () {
                setPreset(btn.dataset.key);
                applyAndClose();
            };
        });

        const monthInput = sheet.querySelector("#rangeMonthInput");
        monthInput.onchange = function () {
            if (!monthInput.value) return;
            const p = monthInput.value.split("-").map(Number);
            const last = new Date(p[0], p[1], 0).getDate();
            setRange("month", monthInput.value + "-01", monthInput.value + "-" + pad(last));
            applyAndClose();
        };

        sheet.querySelector("#rangeApplyBtn").onclick = function () {
            const from = sheet.querySelector("#rangeFromInput").value;
            const to = sheet.querySelector("#rangeToInput").value;
            if (!from || !to) return;
            if (from > to) setRange("custom", to, from);
            else setRange("custom", from, to);
            applyAndClose();
        };

        sheet.classList.add("show");
    }

    renderLabel();
    if (monthLabelBtn) monthLabelBtn.onclick = openSheet;
}
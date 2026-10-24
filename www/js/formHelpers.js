// ==============================================================
// formHelpers.js
// دوال مشتركة بين صفحة الدخل وصفحة المصروف (Reusable Component - DRY)
// بدل ما كل صفحة تكتب نفس دوال قياس/تنسيق الأرقام لوحدها
// ==============================================================

// دالة بتقيس عرض النص بالبكسل (مستخدمة في تحجيم خانة المبلغ)
function getTextWidth(text, font) {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    ctx.font = font;
    return ctx.measureText(text).width;
}

// دالة بتظبط شكل الخط وعرض خانة المبلغ حسب طول الرقم
function resizeAmountInput(inputEl, formatted) {
    const len = formatted.replace(/,/g, "").length;

    if (len <= 3) {
        inputEl.style.fontSize = "52px";
    } else if (len <= 6) {
        inputEl.style.fontSize = "44px";
    } else if (len <= 8) {
        inputEl.style.fontSize = "32px";
    } else if (len <= 10) {
        inputEl.style.fontSize = "26px";
    } else {
        inputEl.style.fontSize = "22px";
    }

    const computedStyle = window.getComputedStyle(inputEl);
    const font = computedStyle.fontWeight + " " + computedStyle.fontSize + " " + computedStyle.fontFamily;
    const textWidth = getTextWidth(formatted, font);

    inputEl.style.width = (Math.ceil(textWidth) + 8) + "px";
}

// بتحوّل الأرقام العربية/الفارسية (٠-٩ و ۰-۹) لإنجليزي وبتوحّد علامات الكسر والآلاف والسالب
function normalizeDigits(str) {
    return String(str)
        .replace(/[٠-٩]/g, function(d) { return String(d.charCodeAt(0) - 0x0660); })
        .replace(/[۰-۹]/g, function(d) { return String(d.charCodeAt(0) - 0x06F0); })
        .replace(/٫/g, ".")
        .replace(/[٬،]/g, ",")
        .replace(/[−–—]/g, "-");
}

// بتنظّف النص وتنسّقه: أرقام + كسر لحد خانتين + (اختياري) سالب + فواصل آلاف
function formatNumberText(raw, allowNegative) {
    let s = normalizeDigits(raw).replace(/,/g, "");
    const negative = allowNegative && s.trim().charAt(0) === "-";
    s = s.replace(/[^\d.]/g, "");
    
    const dotIndex = s.indexOf(".");
    let intPart = dotIndex === -1 ? s : s.slice(0, dotIndex);
    const decPart = dotIndex === -1 ? null : s.slice(dotIndex + 1).replace(/\./g, "").slice(0, 2);
    
    intPart = intPart.replace(/^0+(?=\d)/, "");
    
    if (intPart === "" && decPart === null) return negative ? "-" : "";
    
    const groupedInt = (intPart === "" ? "0" : intPart).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (negative ? "-" : "") + groupedInt + (decPart !== null ? "." + decPart : "");
}

// بتربط خانة "المبلغ" (Income/Expense) بمنطق التنسيق + التحجيم + التحقق من الفورم
// onValidChange: دالة بتتنده كل مرة القيمة تتغير (زي checkIncomeForm / checkExpenseForm)
function attachAmountFormatter(inputEl, onValidChange) {
    if (!inputEl) return;
    
    inputEl.addEventListener("input", function() {
        let formatted = formatNumberText(this.value, false);
        if (formatted === "") formatted = "0";
        
        this.value = formatted;
        resizeAmountInput(inputEl, formatted);
        
        if (typeof onValidChange === "function") onValidChange();
    });
}

// بتربط أي خانة رقم عادية (زي رصيد الحساب الجديد) بفواصل الآلاف تلقائيًا
// allowNegative: true بس للحقول اللي تقبل رقم سالب (زي رصيد الحساب)
function attachThousandsFormatter(inputEl, allowNegative) {
    if (!inputEl) return;
    
    inputEl.addEventListener("input", function() {
        this.value = formatNumberText(this.value, allowNegative);
    });
    
    inputEl.addEventListener("blur", function() {
        if (this.value === "-") this.value = "";
        else if (this.value.endsWith(".")) this.value = this.value.slice(0, -1);
    });
}
// بترجع الصفحة لفوق تلقائي لما الكيبورد يقفل (بعد الكتابة في أي input/textarea)
let focusOutScrollFixed = false;

function fixScrollOnFocusOut() {
    // نسجّل الـ listener مرة واحدة بس
    if (focusOutScrollFixed) return;
    focusOutScrollFixed = true;
    
    document.addEventListener("focusout", function(e) {
        // الرجوع لفوق في صفحة إضافة المعاملة بس، مش في باقي الصفحات
        if (!document.body.classList.contains("add-transaction-page")) return;
        
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            window.scrollTo(0, 0);
        }
    });
}
// بتفعّل الوضع الليلي المحفوظ فور تحميل الصفحة (لأي صفحة معندهاش زرار تبديل ثيم بنفسها)
function applyStoredTheme() {
    if (getTheme() === "dark") {
        document.body.classList.add("dark");
    }
}

// بترجع خانة "الحساب" الظاهرة في الصفحة الحالية (Income أو Expense)
function getAccountFieldEl() {
    if (typeof activeAccountBox !== "undefined" && activeAccountBox) {
        const field = activeAccountBox.querySelector(".account-select");
        if (field) return field;
    }
    return document.getElementById("incomeAccount") || document.getElementById("expenseAccount");
}

// بترجع خانة "التصنيف" الظاهرة في الصفحة الحالية (Income أو Expense)
function getCategoryFieldEl() {
    if (typeof activeCategoryBox !== "undefined" && activeCategoryBox) {
        const field = activeCategoryBox.querySelector(".category-select");
        if (field) return field;
    }
    return document.getElementById("incomeCategory") || document.getElementById("expenseCategory");
}

// بتنده على دالة التحقق من الفورم الخاصة بالصفحة الحالية (checkIncomeForm / checkExpenseForm)
// كل صفحة بتحدد window.onFormFieldChanged بنفسها
function notifyFormFieldChanged() {
    if (typeof window.onFormFieldChanged === "function") {
        window.onFormFieldChanged();
    }
}
// فلترة قايمة الأيقونات (مشتركة بين accounts.js و accountsPage.js)
function filterAccountIcons(term) {
    term = (term || "").trim().toLowerCase();
    document.querySelectorAll("#iconDropdownList .icon-option").forEach(function(opt) {
        const label = (opt.dataset.label || "").toLowerCase();
        const icon = (opt.dataset.icon || "").toLowerCase();
        const match = label.includes(term) || icon.includes(term);
        opt.style.display = match ? "flex" : "none";
    });
}
// تعبئة قايمة <select> من مصفوفة { value, label } - بتستبدل كل بناء <option> اليدوي
function fillSelect(select, options, selectedValue) {
    if (!select) return;
    select.innerHTML = "";
    options.forEach(function (option) {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.label;
        select.appendChild(opt);
    });
    select.value = selectedValue || "";
    if (select.selectedIndex === -1) select.value = "";
}
// خيارات الترتيب المشتركة (الرئيسية + سجل الحساب)
function getSortOptions() {
    return [
        { value: "date_desc", label: t("sort_newest") },
        { value: "date_asc", label: t("sort_oldest") },
        { value: "amount_desc", label: t("sort_highest") },
        { value: "amount_asc", label: t("sort_lowest") }
    ];
}
// تنسيق مبلغ كرقم صحيح بفواصل آلاف (بديل Math.round(...).toLocaleString)
function formatWholeAmount(v) {
    return Math.round(Number(v) || 0).toLocaleString("en-US");
}

// بتحذف حساب وتظهر Toast تراجع - onChange بتتنده بعد الحذف وبعد التراجع
function deleteAccountWithUndo(accountId, onChange) {
    const accounts = getAccounts();
    const deletedAccount = accounts.find(function (a) { return a.id === accountId; });
    if (!deletedAccount) return;
    const deletedPosition = accounts.indexOf(deletedAccount);
    saveAccounts(accounts.filter(function (a) { return a.id !== accountId; }));
    onChange();
    showUndoToast(t("account_deleted_toast"), function () {
        const current = getAccounts();
        current.splice(Math.min(deletedPosition, current.length), 0, deletedAccount);
        saveAccounts(current);
        onChange();
    });
}
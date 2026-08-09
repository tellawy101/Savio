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

// بتربط خانة "المبلغ" (Income/Expense) بمنطق التنسيق + التحجيم + التحقق من الفورم
// onValidChange: دالة بتتنده كل مرة القيمة تتغير (زي checkIncomeForm / checkExpenseForm)
function attachAmountFormatter(inputEl, onValidChange) {
    if (!inputEl) return;

    inputEl.addEventListener("input", function () {
        let value = this.value.replace(/,/g, "");

        if (value === "") {
            this.value = "0";
            if (typeof onValidChange === "function") onValidChange();
            return;
        }

        value = value.replace(/\D/g, "");

        if (value === "") {
            this.value = "0";
            if (typeof onValidChange === "function") onValidChange();
            return;
        }

        const formatted = Number(value).toLocaleString("en-US");
        this.value = formatted;

        resizeAmountInput(inputEl, formatted);

        if (typeof onValidChange === "function") onValidChange();
    });
}

// بتربط أي خانة رقم عادية (زي رصيد الحساب الجديد) بفواصل الآلاف تلقائيًا
function attachThousandsFormatter(inputEl) {
    if (!inputEl) return;

    inputEl.addEventListener("input", function () {
        let value = this.value.replace(/,/g, "");
        value = value.replace(/\D/g, "");

        if (value === "") {
            this.value = "";
            return;
        }

        this.value = Number(value).toLocaleString("en-US");
    });
}

// بترجع الصفحة لفوق تلقائي لما الكيبورد يقفل (بعد الكتابة في أي input/textarea)
function fixScrollOnFocusOut() {
    document.addEventListener("focusout", function (e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            window.scrollTo(0, 0);
        }
    });
}

// بتفعّل الوضع الليلي المحفوظ فور تحميل الصفحة (لأي صفحة معندهاش زرار تبديل ثيم بنفسها)
function applyStoredTheme() {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
}

// بترجع خانة "الحساب" الظاهرة في الصفحة الحالية (Income أو Expense)
function getAccountFieldEl() {
    return document.getElementById("incomeAccount") || document.getElementById("expenseAccount");
}

// بترجع خانة "التصنيف" الظاهرة في الصفحة الحالية (Income أو Expense)
function getCategoryFieldEl() {
    return document.getElementById("incomeCategory") || document.getElementById("expenseCategory");
}

// بتنده على دالة التحقق من الفورم الخاصة بالصفحة الحالية (checkIncomeForm / checkExpenseForm)
// كل صفحة بتحدد window.onFormFieldChanged بنفسها
function notifyFormFieldChanged() {
    if (typeof window.onFormFieldChanged === "function") {
        window.onFormFieldChanged();
    }
}
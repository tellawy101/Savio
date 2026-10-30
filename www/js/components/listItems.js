// ==============================
// components/listItems.js
// عناصر القوائم: كارت الحساب/التصنيف، كارت المعاملة، الحالة الفاضية، شريط التقدم
// ==============================

// شكل الكارت في ليستة الحسابات/التصنيفات (Icon + Title + Arrow)
function renderListItemHTML(icon, name, extraHTML) {
    return `
   <div class="account-item-icon"><i data-lucide="${escapeHTML(icon)}"></i></div>
    <div class="account-info">
        <div class="account-name">${escapeHTML(name)}</div>
        ${extraHTML || ""}
    </div>
    <div class="account-arrow">›</div>
`;
}

// قالب كارت المعاملة المشترك (مصروف / دخل / تحويل)
function createTransactionElement(expense, options = {}) {
    const curr = options.currency || (typeof getCurrency === "function" ? getCurrency() : "EGP");
    const isIncome = expense.type === "income";
    const isTransfer = !!expense.isTransfer;

    const li = document.createElement("li");
    li.className = "expense-item expense-swipe";

    // تحديد الأيقونة ولون الكارت
    let iconHTML = `<i data-lucide="receipt"></i>`;
    if (expense.categoryIcon) {
        iconHTML = `<i data-lucide="${escapeHTML(getTxCategoryIcon(expense))}"></i>`;
    } else if (isTransfer) {
        iconHTML = `<i data-lucide="repeat"></i>`;
    }

    // تحديد الإشارة والمبلغ
    let sign = "-";
    let amountClass = "expense-amount-negative";
    if (isTransfer) {
        sign = "";
        amountClass = "expense-amount-transfer";
    } else if (isIncome) {
        sign = "+";
        amountClass = "expense-amount-positive";
    }
    const formattedAmount = formatAmountNumber(expense.amount);

    // العنوان والوصف
    let title = getTxCategoryName(expense) || expense.title || (typeof t === "function" ? t("unspecified") : "Unspecified");
    let subtitle = getTxAccountName(expense);
    if (isTransfer) {
        title = typeof t === "function" ? t("transfer_title") : "Transfer";
        subtitle = `${getTxAccountName(expense)} ➔ ${getAccountNameById(expense.transferToId, expense.transferTo)}`;
    }

    li.innerHTML = `
       <div class="swipe-action swipe-delete" title="Delete">
            <i data-lucide="trash-2"></i>
        </div>
        <div class="swipe-action swipe-edit" title="Edit">
            <i data-lucide="pencil"></i>
        </div>
        <div class="expense-main">
            <div class="expense-icon-box ${isIncome ? 'income' : (isTransfer ? 'transfer' : 'expense')}">
                ${iconHTML}
            </div>
            <div class="expense-info">
                <span class="expense-title">${escapeHTML(title)}</span>
                <span class="expense-category">${escapeHTML(subtitle)}</span>
                ${(!isTransfer && expense.description) ? `<span class="expense-note">${escapeHTML(expense.description)}</span>` : ""}
            </div>
            <div class="expense-right">
                <span class="expense-amount ${amountClass}">${sign}${formattedAmount} <small class="expense-currency">${escapeHTML(curr)}</small></span>
                <span class="expense-date">${formatDisplayDate(expense.date)}</span>
${expense.time ? `<span class="expense-date">${escapeHTML(expense.time)}</span>` : ""}
            </div>
        </div>
    `;

    return li;
}

// قالب حالة الفراغ الموحد (عند عدم وجود بيانات)
function renderEmptyState(icon = "inbox", title = "No data found", subtitle = "") {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">
               <i data-lucide="${escapeHTML(icon)}"></i>
            </div>
            <p class="empty-state-title">${title}</p>
            ${subtitle ? `<span class="empty-state-sub">${subtitle}</span>` : ""}
        </div>
    `;
}

// شريط التقدم الموحد (الأهداف + الميزانيات)
function renderProgressBar(percent) {
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    return `
        <div class="goal-progress">
            <div class="goal-progress-fill" style="width: ${safePercent}%"></div>
        </div>
    `;
}
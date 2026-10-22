// ==============================================================
// screens/recurringPage.js
// صفحة المعاملات المتكررة: عرض + إضافة + تعديل + إيقاف + حذف
// ==============================================================

function initRecurringPage() {
  
  // ------------------------------
  // العناصر
  // ------------------------------
  const listEl = document.getElementById("recurringList");
  const subtitleEl = document.getElementById("recurringSubtitle");
  const addBtn = document.getElementById("addRecurringBtn");
  const modal = document.getElementById("recurringModal");
  const modalTitle = document.getElementById("recurringModalTitle");
  const cancelBtn = document.getElementById("cancelRecurringBtn");
  const saveBtn = document.getElementById("saveRecurringBtn");
  
  const typeSelect = document.getElementById("recType");
  const amountInput = document.getElementById("recAmount");
  const accountSelect = document.getElementById("recAccount");
  const categorySelect = document.getElementById("recCategory");
  const frequencySelect = document.getElementById("recFrequency");
  const dateInput = document.getElementById("recDate");
  const dateText = document.getElementById("recDateText");
  const dateLabel = document.getElementById("recDateLabel");
  const descriptionInput = document.getElementById("recDescription");
  
  let editingId = null;
  
  if (amountInput) attachThousandsFormatter(amountInput);
  
  // ------------------------------
  // تعبئة القوائم
  // ------------------------------
 
  
  function fillStaticSelects(typeValue, frequencyValue) {
    fillSelect(typeSelect, [
      { value: "expense", label: t("tab_expense") },
      { value: "income", label: t("tab_income") }
    ], typeValue || "expense");
    
    fillSelect(frequencySelect, [
      { value: "daily", label: t("recurring_freq_daily") },
      { value: "weekly", label: t("recurring_freq_weekly") },
      { value: "monthly", label: t("recurring_freq_monthly") },
      { value: "yearly", label: t("recurring_freq_yearly") }
    ], frequencyValue || "monthly");
  }
  
  function fillAccountAndCategory(accountId, categoryId) {
    const accountOptions = [{ value: "", label: t("select_account") }];
    getAccounts().forEach(function(acc) {
      accountOptions.push({ value: acc.id, label: acc.name });
    });
    fillSelect(accountSelect, accountOptions, accountId);
    
    const categoryOptions = [{ value: "", label: t("select_category") }];
    getCategories().forEach(function(cat) {
      categoryOptions.push({ value: cat.id, label: cat.name });
    });
    fillSelect(categorySelect, categoryOptions, categoryId);
  }
  
  fillStaticSelects();
  fillAccountAndCategory("", "");
  makeSelectSheet(typeSelect, t("recurring_type"));
  makeSelectSheet(accountSelect, t("select_account"));
  makeSelectSheet(categorySelect, t("select_category"));
  makeSelectSheet(frequencySelect, t("recurring_frequency"));
  
  if (dateInput) {
    dateInput.onchange = function() {
      syncDateText(dateInput, dateText);
    };
  }
  
  // ------------------------------
  // عرض القائمة
  // ------------------------------
  function readAmount() {
    return Number(normalizeDigits(amountInput.value).replace(/,/g, "")) || 0;
  }
  
  function renderRecurring() {
    if (!listEl) return;
    
    const items = getRecurring().slice().sort(function(a, b) {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return String(a.nextDate).localeCompare(String(b.nextDate));
    });
    
    if (subtitleEl) {
      subtitleEl.textContent = items.length ? items.length + " " + t("recurring_count_label") : "";
    }
    
    if (!items.length) {
      listEl.innerHTML = `
            <div class="empty-stat">
                <i data-lucide="repeat"></i>
                <span>${t("recurring_empty")}</span>
            </div>`;
      if (window.lucide) lucide.createIcons({ root: listEl });
      return;
    }
    
    const categories = getCategories();
    
    listEl.innerHTML = items.map(function(item) {
      const category = categories.find(function(c) { return c.id === item.categoryId; });
      const icon = category ? category.icon : (item.categoryIcon || "tag");
      const categoryName = category ? category.name : item.category;
      const name = item.description || categoryName || "";
      const sign = item.type === "income" ? "+" : "-";
      const frequencyLabel = t("recurring_freq_" + item.frequency);
      const metaText = item.active ?
        frequencyLabel + " · " + t("recurring_next") + " " + formatDisplayDate(item.nextDate) :
        frequencyLabel + " · " + t("recurring_paused");
      
      return `
            <div class="rec-card ${item.active ? "" : "rec-paused"}">
                <div class="rec-top">
                    <div class="rec-icon"><i data-lucide="${escapeHTML(icon)}"></i></div>
                    <div class="rec-info">
                        <span class="rec-name">${escapeHTML(name)}</span>
                        <span class="rec-meta">${escapeHTML(metaText)}</span>
                    </div>
                    <span class="rec-amount ${item.type === "income" ? "income" : "expense"}" dir="ltr">${sign}${formatCurrency(item.amount)}</span>
                </div>
                <div class="rec-actions">
                    <button class="rec-btn rec-toggle-btn" data-id="${escapeHTML(item.id)}">
                        <i data-lucide="${item.active ? "pause" : "play"}"></i>
                        <span>${item.active ? t("recurring_pause") : t("recurring_resume")}</span>
                    </button>
                    <button class="rec-btn rec-edit-btn" data-id="${escapeHTML(item.id)}" aria-label="Edit"><i data-lucide="pencil"></i></button>
                    <button class="rec-btn rec-delete-btn" data-id="${escapeHTML(item.id)}" aria-label="Delete"><i data-lucide="trash-2"></i></button>
                </div>
            </div>`;
    }).join("");
    
    if (window.lucide) lucide.createIcons({ root: listEl });
  }
  
  // ------------------------------
  // فتح المودال (إضافة أو تعديل)
  // ------------------------------
  function openModal(item) {
    editingId = item ? item.id : null;
    
    modalTitle.textContent = item ? t("recurring_edit_title") : t("recurring_add_title");
    dateLabel.textContent = item ? t("recurring_next_date") : t("recurring_start_date");
    
    fillStaticSelects(item ? item.type : "expense", item ? item.frequency : "monthly");
    fillAccountAndCategory(item ? item.accountId : "", item ? item.categoryId : "");
    
    amountInput.value = item ? Number(item.amount).toLocaleString("en-US") : "";
    descriptionInput.value = item ? (item.description || "") : "";
    dateInput.value = item ? item.nextDate : getTodayDateString();
    syncDateText(dateInput, dateText);
    
    modal.classList.add("show");
  }
  
  if (addBtn) {
    addBtn.onclick = function() {
      openModal(null);
    };
  }
  
  if (cancelBtn) {
    cancelBtn.onclick = function() {
      modal.classList.remove("show");
    };
  }
  
  closeModalOnBackdropClick(modal);
  
  // ------------------------------
  // الحفظ
  // ------------------------------
  if (saveBtn) {
    saveBtn.onclick = function() {
      const amount = readAmount();
      const account = getAccounts().find(function(a) { return a.id === accountSelect.value; });
      const category = getCategories().find(function(c) { return c.id === categorySelect.value; });
      
      let missing = null;
      if (amount <= 0) missing = t("field_amount");
      else if (!account) missing = t("field_account");
      else if (!category) missing = t("field_category");
      else if (!dateInput.value) missing = t("field_date");
      
      if (missing) {
        showToast(t("missing_prefix") + missing);
        return;
      }
      
      const data = {
        type: typeSelect.value === "income" ? "income" : "expense",
        amount: amount,
        accountId: account.id,
        account: account.name,
        categoryId: category.id,
        category: category.name,
        categoryIcon: category.icon || "tag",
        description: descriptionInput.value.trim(),
        frequency: frequencySelect.value || "monthly",
        nextDate: dateInput.value,
        anchorDay: Number(dateInput.value.split("-")[2])
      };
      
      const items = getRecurring();
      
      if (editingId) {
        const index = items.findIndex(function(x) { return String(x.id) === String(editingId); });
        if (index !== -1) items[index] = Object.assign({}, items[index], data);
      } else {
        items.push(Object.assign({ id: generateId("rec"), active: true, startDate: data.nextDate }, data));
      }
      
      saveRecurring(items);
      modal.classList.remove("show");
      
      // لو الموعد النهارده أو فات، المعاملة بتتضاف فورًا
      const added = processRecurringTransactions();
      renderRecurring();
      
      if (added > 0) {
        showToast(t("recurring_auto_added_toast") + " " + added, "success");
      } else {
        showToast(t("recurring_saved_toast"), "success");
      }
    };
  }
  
  // ------------------------------
  // إيقاف / تشغيل / تعديل / حذف
  // ------------------------------
  if (listEl) {
    listEl.onclick = function(e) {
      const toggleBtn = e.target.closest(".rec-toggle-btn");
      const editBtn = e.target.closest(".rec-edit-btn");
      const deleteBtn = e.target.closest(".rec-delete-btn");
      
      if (toggleBtn) {
        const items = getRecurring();
        const item = items.find(function(x) { return String(x.id) === toggleBtn.dataset.id; });
        if (!item) return;
        
        item.active = !item.active;
        // لما ترجع من الإيقاف بنعدّي المواعيد اللي فاتت من غير ما نضيفها
        if (item.active) skipRecurringToToday(item);
        
        saveRecurring(items);
        renderRecurring();
        return;
      }
      
      if (editBtn) {
        const item = getRecurring().find(function(x) { return String(x.id) === editBtn.dataset.id; });
        if (item) openModal(item);
        return;
      }
      
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        customConfirm(t("recurring_delete_confirm"), { danger: true }).then(function(confirmed) {
          if (!confirmed) return;
          
          const items = getRecurring().filter(function(x) { return String(x.id) !== id; });
          saveRecurring(items);
          renderRecurring();
          showToast(t("recurring_deleted_toast"), "success");
        });
      }
    };
  }
  
  renderRecurring();
}
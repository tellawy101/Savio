// ======================================
// home/homeSearchFilters.js
// البحث + الفلاتر (حساب / تصنيف / ترتيب / نوع) + لوحة البحث
// ======================================

function initHomeSearchFilters(renderExpenses, hasAnyFilter) {
    const searchInput = document.getElementById("searchInput");
    const accountFilter = document.getElementById("accountFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");
    const typeFilter = document.getElementById("typeFilter");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    let searchTimer = null;
    if (searchInput) {
        searchInput.oninput = function() {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(renderExpenses, 250);
        };
    }
        if (searchInput) {
        searchInput.addEventListener("focus", function() {
            setTimeout(function() {
                searchInput.style.scrollMarginTop = "20px";
                searchInput.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 400);
        });
    }
            fillSelect(accountFilter, [{ value: "", label: t("filter_all_accounts") }].concat(
        getAccounts().map(function(a) { return { value: a.id, label: a.name }; })
    ));
    if (accountFilter) accountFilter.onchange = renderExpenses;
    makeSelectSheet(accountFilter, t("filter_account"));
    
    fillSelect(categoryFilter, [{ value: "", label: t("filter_all_categories") }].concat(
        getCategories().map(function(c) { return { value: c.id, label: c.name }; })
    ));
    if (categoryFilter) categoryFilter.onchange = renderExpenses;
    makeSelectSheet(categoryFilter, t("filter_category"));
    
    fillSelect(sortFilter, getSortOptions(), "date_desc");
    if (sortFilter) sortFilter.onchange = renderExpenses;
    makeSelectSheet(sortFilter, t("sort_by"));
    
    fillSelect(typeFilter, [
        { value: "", label: t("filter_all_types") },
        { value: "income", label: t("tab_income") },
        { value: "expense", label: t("tab_expense") },
        { value: "transfer", label: t("tab_transfer") }
    ]);
    if (typeFilter) typeFilter.onchange = renderExpenses;
    makeSelectSheet(typeFilter, t("filter_type"));

    if (clearFiltersBtn) {
        clearFiltersBtn.onclick = function() {
            searchInput.value = "";
            if (accountFilter) accountFilter.value = "";
            if (categoryFilter) categoryFilter.value = "";
            if (typeFilter) typeFilter.value = "";
            if (sortFilter) sortFilter.value = "date_desc";
            renderExpenses();
        };
    }

    const searchBtn = document.getElementById("searchBtn");
    const searchPanel = document.getElementById("searchPanel");
    const expensesTitle = document.querySelector(".expenses-header h2");
    
    if (searchBtn) {
        searchBtn.onclick = function() {
            
            expensesTitle.style.display = "none";
            searchBtn.style.display = "none";
            
            searchPanel.style.display = "block";
            
document.body.style.paddingBottom = "70vh"; // مساحة إضافية عشان الاسكرول يشتغل
            
            //searchInput.focus();
            
            setTimeout(() => {
                searchInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 400);
            
        };
    }
    
        if (window._homeClickHandler) {
        document.removeEventListener("click", window._homeClickHandler);
    }
    window._homeClickHandler = function(e) {
        
        // لو لوحة البحث مش ظاهرة، متعملش حاجة
        if (searchPanel.style.display !== "block") return;
                // لو فيه فلتر شغّال، سيب اللوحة مفتوحة والفلتر زي ما هو
if (hasAnyFilter()) return;
        // لو اللي اتدوس عليه مش اللوحة نفسها ولا زرار البحث
        if (!searchPanel.contains(e.target) && !searchBtn.contains(e.target)) {
            
            searchPanel.style.display = "none";
            searchInput.value = "";
            if (accountFilter) accountFilter.value = "";
            if (categoryFilter) categoryFilter.value = "";
            
            if (sortFilter) sortFilter.value = "date_desc";
            
            expensesTitle.style.display = "block";
            searchBtn.style.display = "flex";
            
            document.body.style.paddingBottom = "";
            
            renderExpenses();
        }
        
    };
    document.addEventListener("click", window._homeClickHandler);

function cleanup() {
        if (window._homeClickHandler) {
            document.removeEventListener("click", window._homeClickHandler);
            window._homeClickHandler = null;
        }
        document.body.style.paddingBottom = "";
                clearTimeout(searchTimer);
}

return { cleanup };
}

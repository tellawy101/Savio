function initCategoriesPage() {
    const ph = document.getElementById("modals-placeholder");
    if (ph) {
        ph.innerHTML = renderSharedModals();
        if (window.lucide) lucide.createIcons({ root: ph });
    }
    initCategoryPicker();

    let currentType = "expense";
    const expanded = new Set();

    function buildRow(cat, isSub) {
        const el = document.createElement("div");
        el.className = "cat-row" + (isSub ? " cat-row-sub" : "");
        el.dataset.id = cat.id;
        el.innerHTML =
            '<span class="cat-drag"><i data-lucide="grip-vertical"></i></span>' +
            '<div class="category-tile-icon" style="' + categoryIconStyle(getCategoryColor(cat)) + '"><i data-lucide="' + escapeHTML(cat.icon) + '"></i></div>' +
            '<div class="cat-info"><b>' + escapeHTML(cat.name) + '</b><small>' +
                t("category_tx_count").replace("{n}", countCategoryTransactions(cat)) + '</small></div>' +
            (isSub ? "" : '<button type="button" class="cat-btn" data-act="sub"><i data-lucide="plus"></i></button>') +
            '<button type="button" class="cat-btn" data-act="edit"><i data-lucide="pencil"></i></button>' +
            '<button type="button" class="cat-btn" data-act="del"><i data-lucide="trash-2"></i></button>';
        return el;
    }

    function saveOrder(parent) {
        reorderCategories(Array.from(parent.children).map(function (c) { return c.dataset.id; }));
        if (typeof hapticTap === "function") hapticTap();
    }

    function makeDraggable(item, handle) {
        handle.addEventListener("pointerdown", function (e) {
            e.preventDefault();
            const parent = item.parentElement;
            handle.setPointerCapture(e.pointerId);
            item.classList.add("dragging");
            function move(ev) {
                const sib = Array.from(parent.children).find(function (s) {
                    if (s === item) return false;
                    const r = s.getBoundingClientRect();
                    return ev.clientY > r.top && ev.clientY < r.bottom;
                });
                if (!sib) return;
                const after = item.compareDocumentPosition(sib) & Node.DOCUMENT_POSITION_FOLLOWING;
                parent.insertBefore(item, after ? sib.nextSibling : sib);
            }
            function up() {
                handle.removeEventListener("pointermove", move);
                handle.removeEventListener("pointerup", up);
                handle.removeEventListener("pointercancel", up);
                item.classList.remove("dragging");
                saveOrder(parent);
            }
            handle.addEventListener("pointermove", move);
            handle.addEventListener("pointerup", up);
            handle.addEventListener("pointercancel", up);
        });
    }

    function render() {
        const box = document.getElementById("categoriesPageList");
        if (!box) return;
        box.innerHTML = "";
        const mains = getMainCategoriesByType(currentType);
        if (!mains.length) {
            box.innerHTML = '<div class="category-empty">' + t("no_results") + '</div>';
            return;
        }
        mains.forEach(function (main) {
            const group = document.createElement("div");
            group.className = "cat-group";
            group.dataset.id = main.id;
            const mainRow = buildRow(main, false);
            group.appendChild(mainRow);
            const subs = document.createElement("div");
            subs.className = "cat-subs" + (expanded.has(main.id) ? " open" : "");
            getSubCategories(main.id).forEach(function (s) {
                const r = buildRow(s, true);
                subs.appendChild(r);
                makeDraggable(r, r.querySelector(".cat-drag"));
            });
            group.appendChild(subs);
            box.appendChild(group);
            makeDraggable(group, mainRow.querySelector(".cat-drag"));
        });
        if (window.lucide) lucide.createIcons({ root: box });
    }

    document.getElementById("categoriesPageList").onclick = function (e) {
        const rowEl = e.target.closest(".cat-row");
        if (!rowEl || e.target.closest(".cat-drag")) return;
        const cat = getCategories().find(function (c) { return c.id === rowEl.dataset.id; });
        if (!cat) return;
        const btn = e.target.closest("[data-act]");
        if (btn) {
            if (btn.dataset.act === "sub") { expanded.add(cat.id); categoryActions.addSub(cat); }
            if (btn.dataset.act === "edit") categoryActions.edit(cat);
            if (btn.dataset.act === "del") categoryActions.remove(cat);
            return;
        }
        if (!isSubCategory(cat)) {
            if (expanded.has(cat.id)) expanded.delete(cat.id); else expanded.add(cat.id);
            rowEl.nextElementSibling.classList.toggle("open");
        }
    };

    document.querySelectorAll("#categoriesPageTabs .tx-tab").forEach(function (tab) {
        tab.onclick = function () {
            document.querySelectorAll("#categoriesPageTabs .tx-tab").forEach(function (x) {
                x.classList.toggle("active", x === tab);
            });
            currentType = tab.dataset.tab;
            render();
        };
    });

    document.getElementById("addCategoryPageBtn").onclick = function () {
        categoryActions.add(currentType);
    };

    window.onCategoriesChanged = render;
    render();
}
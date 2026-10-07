// تحويل أي <select> لزرار + bottom sheet (الـ select الأصلي بيفضل مخفي ومتزامن)
(function () {
    const nativeValue = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    let counter = 0;

    window.makeSelectSheet = function (select, title) {
        if (!select || select.dataset.sheetReady) return;
        select.dataset.sheetReady = "1";

        const sheetId = "selectSheet_" + (select.id || ++counter);
        const oldSheet = document.getElementById(sheetId);
        if (oldSheet) oldSheet.remove();

        // الزرار
        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = select.className + " select-sheet-trigger";
        const label = document.createElement("span");
        label.className = "select-sheet-label";
        const arrow = document.createElement("span");
        arrow.className = "select-sheet-arrow";
        arrow.textContent = "▾";
        trigger.appendChild(label);
        trigger.appendChild(arrow);
        select.style.display = "none";
        select.insertAdjacentElement("afterend", trigger);

        // الشيت
        const sheet = document.createElement("div");
        sheet.id = sheetId;
        sheet.className = "modal select-sheet";
        sheet.innerHTML =
            '<div class="modal-content"><h2></h2><div class="select-sheet-list"></div></div>';
        sheet.querySelector("h2").textContent = title || "";
        document.body.appendChild(sheet);
        const list = sheet.querySelector(".select-sheet-list");

        function refresh() {
            const opt = select.options[select.selectedIndex];
            label.textContent = opt ? opt.textContent : "";
        }

        function close() { sheet.classList.remove("show"); }

        function open() {
            list.innerHTML = "";
            Array.from(select.options).forEach(function (opt) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "select-sheet-option" +
                    (opt.value === select.value ? " selected" : "");
                b.textContent = opt.textContent;
                b.disabled = opt.disabled;
                b.onclick = function () {
                    select.value = opt.value;
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                    close();
                };
                list.appendChild(b);
            });
            sheet.classList.add("show");
        }

        trigger.onclick = open;

        // stopPropagation عشان click الـ document في homePage ميقفلش لوحة البحث
        sheet.addEventListener("click", function (e) {
            e.stopPropagation();
            if (e.target === sheet) close();
        });

        // لو الكود غيّر .value برمجياً أو ملى options جديدة، الزرار يتحدث
        Object.defineProperty(select, "value", {
            configurable: true,
            get: function () { return nativeValue.get.call(select); },
            set: function (v) { nativeValue.set.call(select, v); refresh(); }
        });
        new MutationObserver(refresh).observe(select, { childList: true });

        refresh();
    };
})();
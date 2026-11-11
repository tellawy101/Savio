// ==============================
// category/categoryColors.js
// ألوان التصنيفات: لوحة ألوان + ستايل الأيقونة + منتقي اللون
// ==============================

const CATEGORY_COLORS = [
    "#EF4444", "#F97316", "#F59E0B", "#EAB308",
    "#84CC16", "#22C55E", "#10B981", "#14B8A6",
    "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
    "#8B5CF6", "#A855F7", "#EC4899", "#F43F5E"
];

// لون التصنيف: المحفوظ، أو لون ثابت بيتحسب من الـ id للتصنيفات القديمة
function getCategoryColor(category) {
        // الفرعي بياخد لون الرئيسي
    if (category && category.parentId) {
        const parent = getParentCategory(category);
        if (parent) category = parent;
    }
    if (category && /^#[0-9a-fA-F]{6}$/.test(category.color || "")) return category.color;
    const key = String((category && (category.id || category.name)) || "");
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}

// ستايل دايرة الأيقونة: خلفية بلون التصنيف وأيقونة بيضا
function categoryIconStyle(color) {
    return "background:" + color + ";color:#fff;";
}

// منتقي اللون جوه مودال إضافة/تعديل التصنيف
function initCategoryColorPicker() {
    const box = document.getElementById("categoryColorPicker");
    const input = document.getElementById("newCategoryColor");
    if (!box || !input) {
        return { setColor: function () {}, getColor: function () { return CATEGORY_COLORS[0]; } };
    }

    box.innerHTML = "";
    CATEGORY_COLORS.forEach(function (color) {
        const swatch = document.createElement("button");
        swatch.type = "button";
        swatch.className = "color-swatch";
        swatch.dataset.color = color;
        swatch.style.background = color;
                swatch.style.color = color;
        swatch.onclick = function () {
            setColor(color);
        };
        box.appendChild(swatch);
    });

    function setColor(color) {
        input.value = color;
        box.querySelectorAll(".color-swatch").forEach(function (swatch) {
            swatch.classList.toggle("selected", swatch.dataset.color === color);
        });
    }

    setColor(input.value || CATEGORY_COLORS[0]);

    return {
        setColor: setColor,
        getColor: function () { return input.value || CATEGORY_COLORS[0]; }
    };
}
// ==============================
// category/categoryIconLibrary.js
// مكتبة أيقونات التصنيفات والأيقونات المخصصة
// ==============================
// مكتبة أيقونات كبيرة (Lucide) قابلة للبحث - المستخدم مش مقيد بأيقونات معينة
const CATEGORY_ICON_LIBRARY = [
    { icon: "utensils", label: "Food", keywords: ["eat", "dinner", "lunch", "meal", "restaurant"] },
    { icon: "coffee", label: "Coffee", keywords: ["drink", "cafe", "tea"] },
    { icon: "pizza", label: "Fast Food", keywords: ["eat", "burger", "snack"] },
    { icon: "shopping-cart", label: "Shopping", keywords: ["buy", "store", "market"] },
    { icon: "shopping-bag", label: "Shopping Bag", keywords: ["buy", "store", "mall"] },
    { icon: "car", label: "Transport", keywords: ["taxi", "ride", "drive", "uber"] },
    { icon: "bus", label: "Bus", keywords: ["transport", "ride"] },
    { icon: "fuel", label: "Fuel", keywords: ["gas", "petrol", "car"] },
    { icon: "bike", label: "Bike", keywords: ["cycle", "transport"] },
    { icon: "plane", label: "Travel", keywords: ["flight", "airport", "trip"] },
    { icon: "hotel", label: "Hotel", keywords: ["travel", "stay", "trip"] },
    { icon: "map-pin", label: "Location", keywords: ["place", "map"] },
    { icon: "receipt", label: "Bills", keywords: ["invoice", "payment"] },
    { icon: "file-text", label: "Documents", keywords: ["paper", "file"] },
    { icon: "heart-pulse", label: "Health", keywords: ["medical", "clinic"] },
    { icon: "pill", label: "Medicine", keywords: ["drug", "pharmacy", "health"] },
    { icon: "stethoscope", label: "Doctor", keywords: ["health", "clinic", "medical"] },
    { icon: "dumbbell", label: "Gym", keywords: ["fitness", "sport", "workout"] },
    { icon: "gamepad-2", label: "Entertainment", keywords: ["games", "fun"] },
    { icon: "clapperboard", label: "Movies", keywords: ["cinema", "film"] },
    { icon: "music", label: "Music", keywords: ["song", "audio"] },
    { icon: "tv", label: "TV", keywords: ["television", "screen"] },
    { icon: "home", label: "Home", keywords: ["house", "rent"] },
    { icon: "building-2", label: "Building", keywords: ["office", "apartment"] },
    { icon: "lamp", label: "Furniture", keywords: ["home", "decor"] },
    { icon: "wrench", label: "Maintenance", keywords: ["repair", "fix"] },
    { icon: "briefcase", label: "Work", keywords: ["job", "office", "salary"] },
    { icon: "graduation-cap", label: "Education", keywords: ["school", "university", "study"] },
    { icon: "book-open", label: "Books", keywords: ["read", "study"] },
    { icon: "gift", label: "Gifts", keywords: ["present", "birthday"] },
    { icon: "cake", label: "Celebration", keywords: ["birthday", "party"] },
    { icon: "wifi", label: "Internet", keywords: ["network", "data"] },
    { icon: "smartphone", label: "Phone", keywords: ["mobile", "call"] },
    { icon: "laptop", label: "Electronics", keywords: ["computer", "tech"] },
    { icon: "wallet", label: "Money", keywords: ["cash", "budget"] },
    { icon: "banknote", label: "Cash", keywords: ["money"] },
    { icon: "landmark", label: "Bank", keywords: ["money", "finance"] },
    { icon: "piggy-bank", label: "Savings", keywords: ["money", "budget"] },
    { icon: "credit-card", label: "Card", keywords: ["payment", "bank"] },
    { icon: "chart-no-axes-combined", label: "Investment", keywords: ["stocks", "growth"] },
    { icon: "circle-dollar-sign", label: "Income", keywords: ["salary", "money"] },
    { icon: "hand-coins", label: "Debts", keywords: ["loan", "borrow"] },
    { icon: "shirt", label: "Clothes", keywords: ["fashion", "wear"] },
    { icon: "scissors", label: "Salon", keywords: ["haircut", "barber"] },
    { icon: "baby", label: "Baby", keywords: ["kid", "child"] },
    { icon: "paw-print", label: "Pets", keywords: ["animal"] },
    { icon: "dog", label: "Dog", keywords: ["pet", "animal"] },
    { icon: "cat", label: "Cat", keywords: ["pet", "animal"] },
    { icon: "leaf", label: "Nature", keywords: ["plant", "eco"] },
    { icon: "sun", label: "Weather", keywords: ["sunny", "climate"] },
    { icon: "umbrella", label: "Insurance", keywords: ["protection"] },
    { icon: "shield", label: "Security", keywords: ["protection", "safety"] },
    { icon: "church", label: "Charity", keywords: ["donation"] },
    { icon: "hand-heart", label: "Donation", keywords: ["charity", "give"] },
    { icon: "trophy", label: "Sports", keywords: ["win", "competition"] },
    { icon: "party-popper", label: "Party", keywords: ["celebration", "fun"] },
    { icon: "camera", label: "Photography", keywords: ["photo", "picture"] },
    { icon: "palette", label: "Art", keywords: ["paint", "design"] },
    { icon: "hammer", label: "Repair", keywords: ["fix", "tools"] },
    { icon: "phone-call", label: "Calls", keywords: ["phone", "talk"] },
    { icon: "mail", label: "Mail", keywords: ["email", "post"] },
    { icon: "printer", label: "Printer", keywords: ["print", "office"] },
    { icon: "tag", label: "Tag", keywords: ["label", "other"] },
    { icon: "ellipsis", label: "Other", keywords: ["misc", "more"] }
];

function loadCustomCategoryIcons() {
    return getCustomCategoryIcons();
}

function saveCustomCategoryIcon(icon, label) {
    let custom = loadCustomCategoryIcons();
    const exists = custom.some(item => item.icon === icon) ||
        CATEGORY_ICON_LIBRARY.some(item => item.icon === icon);
    if (!exists) {
        custom.push({ icon, label });
        saveCustomCategoryIcons(custom);
    }
}

function getFullIconLibrary() {
    return CATEGORY_ICON_LIBRARY.concat(loadCustomCategoryIcons());
}
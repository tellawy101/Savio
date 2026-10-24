// ==============================
// backup.js
// النسخ الاحتياطي (تصدير / استيراد) + لقطة قبل الاستعادة
// بيتحمّل بعد storage.js مباشرة (بيستخدم مفاتيحه)
// ==============================
// ==============================
// Backup (Export / Import)
// ==============================

const BACKUP_KEYS = [
  STORAGE_KEY, ACCOUNTS_KEY, CATEGORIES_KEY, CUSTOM_CATEGORY_ICONS_KEY,
  DEBTS_KEY, GOALS_KEY, RECURRING_KEY, BUDGET_KEY, CATEGORY_BUDGETS_KEY, THEME_KEY, "language", CURRENCY_KEY, BALANCE_HIDDEN_KEY
];
// ==============================
// فحص بيانات ملف الاستعادة قبل ما تتكتب
// بترجع null لو كله سليم، أو سبب الرفض
// ==============================
function validateBackupData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "backup data is not an object";
  }
  
  // كل القيم لازم تكون نصوص (زي ما التصدير بيكتبها)
  for (const key of BACKUP_KEYS) {
    if (key in data && typeof data[key] !== "string") {
      return "value is not a string: " + key;
    }
  }
  
  // مفاتيح لازم تكون array، وعناصرها object (ماعدا الفئات والأيقونات)
  const objectArrayKeys = [STORAGE_KEY, ACCOUNTS_KEY, DEBTS_KEY, GOALS_KEY, RECURRING_KEY];
  const plainArrayKeys = [CATEGORIES_KEY, CUSTOM_CATEGORY_ICONS_KEY];
  
  for (const key of objectArrayKeys.concat(plainArrayKeys)) {
    if (!(key in data)) continue;
    
    let parsed;
    try {
      parsed = JSON.parse(data[key]);
    } catch (e) {
      return "invalid JSON: " + key;
    }
    
    if (!Array.isArray(parsed)) return "not an array: " + key;
    if (key === CATEGORIES_KEY &&
      parsed.some(function(c) { return !c; })) {
      return "invalid item in: " + key;
    }
    
    if (objectArrayKeys.indexOf(key) !== -1) {
      for (const item of parsed) {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return "invalid item in: " + key;
        }
        if (key === STORAGE_KEY && !Number.isFinite(Number(item.amount))) {
          return "invalid amount in transactions";
        }
        
        // رصيد الحساب (لو موجود) لازم يكون رقم
        if (key === ACCOUNTS_KEY && item.balance !== undefined && !Number.isFinite(Number(item.balance))) {
          return "invalid balance in accounts";
        }
        
        // الهدف لازم له رقم هدف، والمبلغ الحالي (لو موجود) لازم يكون رقم
        if (key === GOALS_KEY) {
          if (!Number.isFinite(Number(item.target))) return "invalid target in goals";
          if (item.current !== undefined && !Number.isFinite(Number(item.current))) return "invalid current in goals";
        }
        // المعاملة المتكررة: المبلغ لازم يكون رقم
        if (key === RECURRING_KEY && !Number.isFinite(Number(item.amount))) {
          return "invalid amount in recurring";
        }
        // الدين: المبلغ والمدفوع والدفعات لازم تكون أرقام
        if (key === DEBTS_KEY) {
          if (!Number.isFinite(Number(item.amount))) return "invalid amount in debts";
          if (item.paid !== undefined && !Number.isFinite(Number(item.paid))) return "invalid paid in debts";
          if (item.payments !== undefined) {
            if (!Array.isArray(item.payments)) return "invalid payments in debts";
            for (const payment of item.payments) {
              if (!payment || typeof payment !== "object" || !Number.isFinite(Number(payment.amount))) {
                return "invalid payment amount in debts";
              }
            }
          }
        }
      }
    }
  }
  
  // حدود الفئات لازم تكون object مش array
  if (CATEGORY_BUDGETS_KEY in data) {
    let budgets;
    try {
      budgets = JSON.parse(data[CATEGORY_BUDGETS_KEY]);
    } catch (e) {
      return "invalid JSON: " + CATEGORY_BUDGETS_KEY;
    }
    if (!budgets || typeof budgets !== "object" || Array.isArray(budgets)) {
      return "not an object: " + CATEGORY_BUDGETS_KEY;
    }
    
    // كل قيمة ميزانية لازم تكون رقم صحيح
    for (const id of Object.keys(budgets)) {
      if (!Number.isFinite(Number(budgets[id]))) {
        return "invalid amount in: " + CATEGORY_BUDGETS_KEY;
      }
    }
  }
  
  if (BUDGET_KEY in data && !Number.isFinite(Number(data[BUDGET_KEY]))) {
    return "budget is not a number";
  }
  
  if (BALANCE_HIDDEN_KEY in data &&
    data[BALANCE_HIDDEN_KEY] !== "true" &&
    data[BALANCE_HIDDEN_KEY] !== "false") {
    return "balanceHidden must be true or false";
  }
  
  return null;
}
// ==============================
// لقطة احتياطية تلقائية قبل الاستبدال الكامل
// بتحفظ نسخة من كل البيانات الحالية وبتحتفظ بآخر 3 لقطات بس
// بترجع true لو اتحفظت، و false لو فشلت (مثلاً مفيش مساحة)
// ==============================
const SNAPSHOT_PREFIX = "savio_pre_restore_snapshot_";
const MAX_SNAPSHOTS = 3;

function createPreRestoreSnapshot() {
  try {
    const data = {};
    BACKUP_KEYS.forEach(function(key) {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    });
    
    const snapshotKeys = Object.keys(localStorage)
      .filter(function(k) { return k.indexOf(SNAPSHOT_PREFIX) === 0; })
      .sort();
    const newKey = SNAPSHOT_PREFIX + Date.now();
    const payload = JSON.stringify({
      app: "Savio",
      version: 1,
      createdAt: new Date().toISOString(),
      data: data
    });
    
    // نكتب الجديدة الأول؛ لو المساحة خلصت نمسح أقدم لقطة ونعيد المحاولة
    while (true) {
      try {
        localStorage.setItem(newKey, payload);
        break;
      } catch (writeError) {
        if (!snapshotKeys.length) throw writeError;
        localStorage.removeItem(snapshotKeys.shift());
      }
    }
    
    // نسيب آخر MAX_SNAPSHOTS لقطات بس
    Object.keys(localStorage)
      .filter(function(k) { return k.indexOf(SNAPSHOT_PREFIX) === 0; })
      .sort()
      .slice(0, -MAX_SNAPSHOTS)
      .forEach(function(k) { localStorage.removeItem(k); });
    return true;
  } catch (e) {
    console.error("Snapshot failed:", e);
    return false;
  }
}
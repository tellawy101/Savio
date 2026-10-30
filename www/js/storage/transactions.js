// ==============================
// storage/transactions.js
// تخزين المعاملات (مصاريف + دخل)
// ==============================

// ==============================
// Transactions
// ==============================

// بترجع كل المعاملات المخزّنة
function loadTransactions() {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    try {

        const data = JSON.parse(raw);
        
        // لازم يكون array، أي شكل تاني يعتبر تلف في البيانات
        if (!Array.isArray(data)) {
            throw new Error("Corrupted transactions data (not an array)");
        }

        // إضافة id ثابت لأي معاملة قديمة متعرفلهاش id قبل كده
        let needsSave = false;

        data.forEach(transaction => {
            if (!transaction.id) {
                transaction.id = "tx_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
                needsSave = true;
            }
        });

        if (needsSave) {
safeSetItem(STORAGE_KEY, JSON.stringify(data));
        }

        return data;

    } catch (error) {

                console.error("Failed to load transactions, data may be corrupted:", error);
        
        // backup مرة واحدة بس وباسم فيه الوقت، عشان أي تلف جديد ميمسحش القديم
        if (!transactionsCorrupted) {
            try {
                localStorage.setItem(STORAGE_KEY + "_corrupted_backup_" + Date.now(), raw);
            } catch (backupErr) {
                console.error("Could not save corrupted-data backup:", backupErr);
            }
            transactionsCorrupted = true;
        }
        
        return [];

    }

}

// بتحفظ كل المعاملات
function saveTransactions(transactions) {
    
    // لو البيانات الأصلية تالفة، مفيش كتابة فوقها عشان منخسرهاش
    if (transactionsCorrupted) {
        console.error("Save blocked: stored transactions are corrupted");
        
        if (typeof showToast === "function") {
showToast(t("data_corrupted_save_stopped"), "error");
        }
        
        return false;
    }
    
        if (!safeSetItem(STORAGE_KEY, JSON.stringify(transactions))) {
        return false;
    }

    return true;
}

// ==============================
// حساب إجمالي معاملات حساب معيّن (منطق بيزنس منفصل عن العرض)
// ==============================
function calculateTransactionsTotal(transactions) {
    return transactions.reduce((sum, transaction) => {
        return sum + Number(transaction.amount || 0);
    }, 0);
}

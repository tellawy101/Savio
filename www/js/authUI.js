// js/authUI.js
// شاشة تسجيل الدخول بجوجل تظهر أول ما التطبيق يفتح (اختيارية - فيها زرار تخطي)

// استلام نتيجة تسجيل الدخول بعد التحويل من جوجل
if (window.Savio && window.Savio.getRedirectResult && window.Savio.auth) {
    window.Savio.getRedirectResult(window.Savio.auth)
        .then(async (result) => {
            if (result && result.user) {
                console.log("Logged in successfully via redirect:", result.user);
                if (window.Savio.syncFromCloud) await window.Savio.syncFromCloud(result.user.uid);
                if (window.Savio.syncToCloud) await window.Savio.syncToCloud(result.user.uid);
                if (typeof showToast === "function") showToast("تم تسجيل الدخول بنجاح", "success");
                if (typeof navigateTo === "function") navigateTo("home");
            }
        })
        .catch((err) => {
            console.error("Redirect login error:", err);
        });
}

function initLoginPrompt() {
    const modal = document.getElementById("loginPromptModal");
    const googleBtn = document.getElementById("loginPromptGoogleBtn");
    const skipBtn = document.getElementById("loginPromptSkipBtn");
    if (!modal) return;

    // لو المستخدم دوس "تخطي" قبل كده في نفس الجلسة، متظهرش تاني
    if (sessionStorage.getItem("savio_login_skipped") === "true") return;

    // بنستنى لحد ما firebase-init.js يخلص تحميله (لأنه بيشتغل كـ module منفصل)
    // التأكد من تحميل firebase-init.js (لأنه module)
function waitForSavio(callback) {
    if (window.Savio && window.Savio.ready && window.Savio.auth) {
        callback();
    } else {
        setTimeout(function() { waitForSavio(callback); }, 50);
    }
}

waitForSavio(function() {
    window.Savio.onAuthStateChanged(window.Savio.auth, function(user) {
        if (!user) {
            modal.classList.add("show");
        } else {
            modal.classList.remove("show");
        }
    });
});

if (googleBtn) {
    googleBtn.addEventListener("click", async function() {
        try {
            if (typeof showToast === "function") showToast("جاري تسجيل الدخول...", "info");
            
            // في تطبيقات الموبايل و Capacitor يتم فتح تسجيل الدخول وإذا فشل الـ Popup بيجرب الـ Redirect أو إشعار المستخدم
            let result;
// توجيه مباشر لصفحة جوجل لتفادي قفل النوافذ في تطبيقات الموبايل
            // استخدام Popup فقط بدون تحويل لصفحة خارجية
            result = await window.Savio.signInWithPopup(window.Savio.auth, window.Savio.googleProvider);

            if (result && result.user) {
                if (window.Savio.syncFromCloud) await window.Savio.syncFromCloud(result.user.uid);
                if (window.Savio.syncToCloud) await window.Savio.syncToCloud(result.user.uid);
            }
            if (modal) modal.classList.remove("show");
            if (typeof showToast === "function") showToast("تم تسجيل الدخول بنجاح", "success");
            if (typeof navigateTo === "function") navigateTo("home");
        } catch (err) {
            console.error("Google Sign-In Error:", err);
            const errorMsg = err.message || "";
            if (errorMsg.includes("missing initial state") || errorMsg.includes("popup-blocked") || err.code === "auth/popup-blocked") {
                if (typeof showToast === "function") {
                    showToast("يرجى تفعيل النوافذ المنبثقة أو تسجيل الدخول عبر متصفح Chrome", "error");
                }
            } else {
                if (typeof showToast === "function") showToast("فشل تسجيل الدخول: " + (err.code || "خطأ غير متوقع"), "error");
            }
        }
    });
}
if (skipBtn) {
    skipBtn.addEventListener("click", function() {
        sessionStorage.setItem("savio_login_skipped", "true");
        modal.classList.remove("show");
    });
}
}
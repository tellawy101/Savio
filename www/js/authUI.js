// js/authUI.js
// شاشة تسجيل الدخول بجوجل تظهر أول ما التطبيق يفتح (اختيارية - فيها زرار تخطي)

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
            const result = await window.Savio.signInWithPopup(window.Savio.auth, window.Savio.googleProvider);
            if (result && result.user) {
                await window.Savio.syncFromCloud(result.user.uid);
                await window.Savio.syncToCloud(result.user.uid);
            }
            modal.classList.remove("show");
            if (typeof showToast === "function") showToast("تم تسجيل الدخول بنجاح", "success");
            if (typeof navigateTo === "function") navigateTo("home");
        } catch (err) {
            console.error("Google Sign-In Error:", err);
            if (typeof showToast === "function") showToast("فشل تسجيل الدخول", "error");
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
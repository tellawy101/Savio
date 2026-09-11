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
    function waitForSavio(callback) {
        if (window.Savio && window.Savio.auth) {
            callback();
        } else {
            setTimeout(function () { waitForSavio(callback); }, 100);
        }
    }

    waitForSavio(function() {
            // نتأكد من نتيجة تسجيل الدخول لو الصفحة رجعت من جوجل
            window.Savio.getRedirectResult(window.Savio.auth).catch(function(err) {
                console.error("Redirect Sign-In Error:", err);
            });
            
            window.Savio.onAuthStateChanged(window.Savio.auth, function(user) {
            if (!user) {
                modal.classList.add("show");
            } else {
                modal.classList.remove("show");
            }
        });
    });

    if (googleBtn) {
        googleBtn.addEventListener("click", function () {
            window.Savio.signInWithRedirect(window.Savio.auth, window.Savio.googleProvider);
            // الصفحة هتنتقل لجوجل، وترجع تاني للتطبيق بعد التسجيل
        });
    }
    if (skipBtn) {
        skipBtn.addEventListener("click", function () {
            sessionStorage.setItem("savio_login_skipped", "true");
            modal.classList.remove("show");
        });
    }
}
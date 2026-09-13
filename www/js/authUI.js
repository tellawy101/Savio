// js/authUI.js
// شاشة تسجيل الدخول بالإيميل والباسورد تظهر أول ما التطبيق يفتح (اختيارية - فيها زرار تخطي)

function initLoginPrompt() {
    const modal = document.getElementById("loginPromptModal");
    const emailInput = document.getElementById("loginEmailInput");
    const passwordInput = document.getElementById("loginPasswordInput");
    const signInBtn = document.getElementById("loginPromptSignInBtn");
    const signUpBtn = document.getElementById("loginPromptSignUpBtn");
    const skipBtn = document.getElementById("loginPromptSkipBtn");
    if (!modal) return;
    
    if (sessionStorage.getItem("savio_login_skipped") === "true") return;
    
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
    
    async function handleAuth(mode) {
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";
        
        if (!email || !password) {
            if (typeof showToast === "function") showToast("اكتب الإيميل والباسورد", "error");
            return;
        }
        
        try {
            if (typeof showToast === "function") showToast("جاري تسجيل الدخول...", "info");
            
            const result = mode === "signup" ?
                await window.Savio.signUpWithEmail(email, password) :
                await window.Savio.signInWithEmail(email, password);
            
            if (result && result.user) {
                if (window.Savio.syncFromCloud) await window.Savio.syncFromCloud(result.user.uid);
                if (window.Savio.syncToCloud) await window.Savio.syncToCloud(result.user.uid);
            }
            if (modal) modal.classList.remove("show");
            if (typeof showToast === "function") showToast("تم تسجيل الدخول بنجاح", "success");
            if (typeof navigateTo === "function") navigateTo("home");
        } catch (err) {
            console.error("Auth Error:", err);
            if (typeof showToast === "function") {
                const msg = err && (err.message || err.code) ? (err.code ? err.code + ": " : "") + err.message : "حدث خطأ";
                showToast("فشل: " + msg, "error");
            }
        }
    }
    
    if (signInBtn) {
        signInBtn.addEventListener("click", function() {
            handleAuth("signin");
        });
    }
    if (signUpBtn) {
        signUpBtn.addEventListener("click", function() {
            handleAuth("signup");
        });
    }
    if (skipBtn) {
        skipBtn.addEventListener("click", function() {
            sessionStorage.setItem("savio_login_skipped", "true");
            modal.classList.remove("show");
        });
    }
}
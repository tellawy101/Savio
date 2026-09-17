// js/authUI.js
// شاشة تسجيل الدخول بالإيميل والباسورد (صفحة كاملة) تظهر أول ما التطبيق يفتح - فيها زرار تخطي

function initLoginPrompt() {
    const screen = document.getElementById("loginPromptScreen");
    const emailInput = document.getElementById("loginEmailInput");
    const passwordInput = document.getElementById("loginPasswordInput");
    const passwordToggle = document.getElementById("loginPasswordToggle");
    const signInBtn = document.getElementById("loginPromptSignInBtn");
    const signUpBtn = document.getElementById("loginPromptSignUpBtn");
    const skipBtn = document.getElementById("loginPromptSkipBtn");
    const strengthLabel = document.getElementById("loginStrengthLabel");
    const strengthBarFill = document.getElementById("loginStrengthBarFill");
    const langToggleBtn = document.getElementById("loginLangToggleBtn");
    if (!screen) return;

if (sessionStorage.getItem("savio_login_skipped") === "true") {
    screen.classList.remove("show");
    screen.classList.remove("loading");
    return;
}

function waitForSavio(callback) {
        if (window.Savio && window.Savio.ready && window.Savio.auth) {
            callback();
        } else {
            setTimeout(function() { waitForSavio(callback); }, 50);
        }
    }

    waitForSavio(function() {
        window.Savio.onAuthStateChanged(window.Savio.auth, function(user) {
            screen.classList.remove("loading");
            if (!user) {
                screen.classList.add("show");
            } else {
                screen.classList.remove("show");
            }
        });
    });

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener("click", function() {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            passwordToggle.setAttribute("data-lucide", isHidden ? "eye-off" : "eye");
            if (typeof initIcons === "function") initIcons();
        });
    }

    function checkPasswordStrength(value) {
        return {
            length: value.length >= 8,
            upper: /[A-Z]/.test(value),
            lower: /[a-z]/.test(value),
            digit: /[0-9]/.test(value),
            special: /[^A-Za-z0-9]/.test(value)
        };
    }

    function updateStrengthUI() {
        const value = passwordInput ? passwordInput.value : "";
        const rules = checkPasswordStrength(value);
        let metCount = 0;

        document.querySelectorAll(".login-strength-check").forEach(function(el) {
            const rule = el.getAttribute("data-rule");
            const met = !!rules[rule];
            el.classList.toggle("met", met);
            if (met) metCount++;
        });

        const percentages = [0, 20, 40, 60, 80, 100];
        const colors = ["#2C3A38", "#E53935", "#E53935", "#F59E0B", "#2DD4BF", "#2DD4BF"];
        const labels = ["-", "ضعيفة", "ضعيفة", "متوسطة", "قوية", "قوية جداً"];

        if (strengthBarFill) {
            strengthBarFill.style.width = percentages[metCount] + "%";
            strengthBarFill.style.background = colors[metCount];
        }
        if (strengthLabel) {
            strengthLabel.textContent = value ? labels[metCount] : "-";
        }
    }

    if (passwordInput) {
        passwordInput.addEventListener("input", updateStrengthUI);
        updateStrengthUI();
    }

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
            if (screen) screen.classList.remove("show");
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

    if (signInBtn) signInBtn.addEventListener("click", function() { handleAuth("signin"); });
if (signUpBtn) signUpBtn.addEventListener("click", function() { handleAuth("signup"); });
if (skipBtn) {
    skipBtn.addEventListener("click", function() {
        sessionStorage.setItem("savio_login_skipped", "true");
        screen.classList.remove("show");
    });
}

if (langToggleBtn) {
    langToggleBtn.addEventListener("click", function() {
        const current = typeof getLanguage === "function" ? getLanguage() : "ar";
        setLanguage(current === "ar" ? "en" : "ar");
    });
}
}
function showLockScreen(options) {
    
    options = options || {};
    
    const mode = options.mode || "verify";
    const cancellable = !!options.cancellable;
    const PIN_LENGTH = 4;
    
    const oldScreen = document.getElementById("lockScreen");
    if (oldScreen) oldScreen.remove();
    
    const screen = document.createElement("div");
    screen.id = "lockScreen";
    screen.className = "lock-screen show";
    
    screen.innerHTML = `
        <div class="lock-inner">
            <div class="lock-icon"><i data-lucide="lock"></i></div>
            <h2 class="lock-title" id="lockTitle"></h2>
            <p class="lock-desc" id="lockDesc"></p>
            <div class="lock-dots" id="lockDots">
                <span class="lock-dot"></span>
                <span class="lock-dot"></span>
                <span class="lock-dot"></span>
                <span class="lock-dot"></span>
            </div>
            <div class="lock-error" id="lockError"></div>
            <div class="lock-keypad">
                <button class="lock-key" data-key="1">1</button>
                <button class="lock-key" data-key="2">2</button>
                <button class="lock-key" data-key="3">3</button>
                <button class="lock-key" data-key="4">4</button>
                <button class="lock-key" data-key="5">5</button>
                <button class="lock-key" data-key="6">6</button>
                <button class="lock-key" data-key="7">7</button>
                <button class="lock-key" data-key="8">8</button>
                <button class="lock-key" data-key="9">9</button>
                <button class="lock-key lock-key-small" id="lockCancelBtn">${cancellable ? t("pin_cancel") : ""}</button>
                <button class="lock-key" data-key="0">0</button>
                <button class="lock-key lock-key-small" id="lockBackBtn">⌫</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(screen);
    
    if (typeof initIcons === "function") initIcons();
    
    const titleEl = document.getElementById("lockTitle");
    const descEl = document.getElementById("lockDesc");
    const dotsEl = document.getElementById("lockDots");
    const errorEl = document.getElementById("lockError");
    const cancelBtn = document.getElementById("lockCancelBtn");
    const backBtn = document.getElementById("lockBackBtn");
    
    let entered = "";
    let firstPin = "";
    let step = mode === "set" ? "new" : "verify";
    let busy = false;
    let lockedOut = false;
    let lockTimer = null;
    
    function setTexts(titleKey, descKey) {
        if (titleEl) titleEl.textContent = t(titleKey);
        if (descEl) descEl.textContent = t(descKey);
    }
    
    function updateDots() {
        if (!dotsEl) return;
        
        const dots = dotsEl.querySelectorAll(".lock-dot");
        
        dots.forEach(function(dot, i) {
            dot.classList.toggle("filled", i < entered.length);
        });
    }
    
    function closeLock() {
        if (lockTimer) clearInterval(lockTimer);
        screen.remove();
    }
    
    function fail(messageKey) {
        entered = "";
        updateDots();
        
        if (errorEl) errorEl.textContent = t(messageKey);
        
        if (dotsEl) {
            dotsEl.classList.remove("shake");
            void dotsEl.offsetWidth;
            dotsEl.classList.add("shake");
        }
    }
    
    function formatRemaining(ms) {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }
    
    function startLockoutCountdown() {
        if (lockTimer) clearInterval(lockTimer);
        
        function tick() {
            const remaining = getPinLockRemainingMs();
            
            if (remaining <= 0) {
                clearInterval(lockTimer);
                lockTimer = null;
                lockedOut = false;
                if (errorEl) errorEl.textContent = "";
                return;
            }
            
            lockedOut = true;
            
            if (errorEl) {
                errorEl.textContent = t("pin_locked_wait").replace("{time}", formatRemaining(remaining));
            }
        }
        
        tick();
        
        if (lockedOut) lockTimer = setInterval(tick, 1000);
    }
    
    async function processPin() {
        
        busy = true;
        
        const pin = entered;
        
        if (mode === "verify") {
            const ok = await verifyPin(pin);
            
            if (ok) {
                resetPinAttempts();
                closeLock();
                if (typeof options.onSuccess === "function") options.onSuccess();
            } else {
                registerPinFailure();
                fail("pin_wrong");
                
                if (getPinLockRemainingMs() > 0) startLockoutCountdown();
            }
            
            busy = false;
            return;
        }
        
        if (step === "new") {
            firstPin = pin;
            step = "confirm";
            entered = "";
            updateDots();
            setTexts("pin_confirm_title", "pin_confirm_desc");
            busy = false;
            return;
        }
        
        if (pin === firstPin) {
            await setPin(pin);
            closeLock();
            if (typeof options.onSuccess === "function") options.onSuccess();
        } else {
            step = "new";
            firstPin = "";
            fail("pin_mismatch");
            setTexts("pin_new_title", "pin_new_desc");
        }
        
        busy = false;
    }
    
    if (mode === "set") {
        setTexts(options.titleKey || "pin_new_title", options.descKey || "pin_new_desc");
    } else {
        setTexts(options.titleKey || "pin_enter_title", options.descKey || "pin_enter_desc");
    }
    
    screen.querySelectorAll("[data-key]").forEach(function(btn) {
        btn.onclick = function() {
            if (busy || lockedOut || entered.length >= PIN_LENGTH) return;
            
            if (errorEl) errorEl.textContent = "";
            
            entered += btn.dataset.key;
            updateDots();
            
            if (entered.length === PIN_LENGTH) processPin();
        };
    });
    
    if (backBtn) {
        backBtn.onclick = function() {
            if (busy || lockedOut) return;
            
            entered = entered.slice(0, -1);
            updateDots();
        };
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            if (!cancellable) return;
            
            closeLock();
            
            if (typeof options.onCancel === "function") options.onCancel();
        };
    }
    
    if (mode === "verify") startLockoutCountdown();
}
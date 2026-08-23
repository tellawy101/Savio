function showToast(message, type = "error") {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    if (type === "success") {
        toast.style.background = "#43A047";
    } else {
        toast.style.background = "#E53935";
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

}
// ==============================
// Toast مع خيار "تراجع" (Undo)
// بيتفضل ظاهر لحد ما المستخدم يدوس تراجع أو يخلص الوقت المحدد
// ==============================

let undoToastTimer = null;
let undoToastFrame = null;

function showUndoToast(message, onUndo, duration = 5000) {
    
    const toast = document.getElementById("toast");
    
    if (!toast) return;
    
    if (undoToastTimer) {
        clearTimeout(undoToastTimer);
        undoToastTimer = null;
    }
    
    if (undoToastFrame) {
        cancelAnimationFrame(undoToastFrame);
        undoToastFrame = null;
    }
    
    const undoLabel = typeof t === "function" ? t("undo_btn") : "Undo";
    
    // بنلف محتوى التوست جوه طبقة داخلية، عشان "الحلقة" (العداد) تتحط حوالين التوست كله
    toast.innerHTML =
        `<div class="toast-inner">` +
        `<span class="toast-message">${message}</span>` +
        `<button type="button" class="toast-undo-btn">${undoLabel}</button>` +
        `</div>`;
    
    toast.classList.add("show", "toast-with-undo");
    
    const startTime = performance.now();
    
    function tick(now) {
        
        const elapsed = now - startTime;
        const remaining = Math.max(0, 1 - elapsed / duration);
        const percent = remaining * 100;
        
        // بنرسم حلقة (conic-gradient) حوالين التوست بتتقلّص مع الوقت
        toast.style.background =
            `conic-gradient(#4fd1c5 ${percent}%, rgba(255,255,255,.25) 0)`;
        
        if (elapsed < duration) {
            undoToastFrame = requestAnimationFrame(tick);
        }
        
    }
    
    undoToastFrame = requestAnimationFrame(tick);
    
    function hide() {
        toast.classList.remove("show", "toast-with-undo");
        if (undoToastFrame) {
            cancelAnimationFrame(undoToastFrame);
            undoToastFrame = null;
        }
    }
    
    const undoBtn = toast.querySelector(".toast-undo-btn");
    
    undoBtn.onclick = function(e) {
        
        e.stopPropagation();
        
        clearTimeout(undoToastTimer);
        undoToastTimer = null;
        
        hide();
        
        if (typeof onUndo === "function") {
            onUndo();
        }
        
    };
    
    undoToastTimer = setTimeout(() => {
        undoToastTimer = null;
        hide();
    }, duration);
    
}
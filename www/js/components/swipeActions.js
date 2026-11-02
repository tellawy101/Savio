// ==============================
// components/swipeActions.js
// تفعيل السحب لليمين واليسار (حذف / تعديل) على أي كارت
// ==============================

function attachSwipeActions(cardElement, options) {
    if (!cardElement) return;

    const deleteBtn = options.deleteEl;
    const editBtn = options.editEl;
    const maxOffset = options.maxOffset || 70;
    const threshold = options.threshold || 45;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let offsetX = 0;
    let armed = false;
    cardElement.addEventListener("touchstart", function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        cardElement.style.transition = "none";
    });

    cardElement.addEventListener("touchmove", function(e) {
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;
        if (e.cancelable) e.preventDefault();
        
        const fullWidth = cardElement.offsetWidth || 300;
        currentX = offsetX + deltaX;
        if (currentX > fullWidth) currentX = fullWidth;
        if (currentX < -fullWidth) currentX = -fullWidth;
        
        cardElement.style.transform = `translateX(${currentX}px)`;
        if (deleteBtn) deleteBtn.style.transition = "none";
        if (editBtn) editBtn.style.transition = "none";
        
        const progress = Math.min(Math.abs(currentX) / maxOffset, 1);
        const nowArmed = Math.abs(currentX) > fullWidth * 0.5;
        if (nowArmed !== armed) {
            armed = nowArmed;
            if (typeof hapticTap === "function") hapticTap();
        }
        
        const activeBtn = currentX > 0 ? deleteBtn : editBtn;
        const otherBtn = currentX > 0 ? editBtn : deleteBtn;
        if (activeBtn) {
            activeBtn.style.opacity = progress;
            activeBtn.style.pointerEvents = "auto";
            activeBtn.style.setProperty("--swipe-p", progress);
            activeBtn.classList.toggle("armed", armed);
        }
        if (otherBtn) {
            otherBtn.style.opacity = 0;
            otherBtn.style.pointerEvents = "none";
            otherBtn.classList.remove("armed");
        }
    }, { passive: false });

    cardElement.addEventListener("touchend", function() {
        if (deleteBtn) deleteBtn.style.transition = "";
        if (editBtn) editBtn.style.transition = "";

        if (armed) {
            const actionBtn = currentX > 0 ? deleteBtn : editBtn;
            armed = false;
            offsetX = 0;
            currentX = 0;
            cardElement.style.transition = "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)";
            cardElement.style.transform = "translateX(0px)";
            if (actionBtn) actionBtn.click();
            setTimeout(function () {
                if (deleteBtn) { deleteBtn.style.opacity = 0; deleteBtn.style.pointerEvents = "none"; deleteBtn.classList.remove("armed"); }
                if (editBtn) { editBtn.style.opacity = 0; editBtn.style.pointerEvents = "none"; editBtn.classList.remove("armed"); }
            }, 300);
            return;
        }

        if (currentX > threshold) {
            offsetX = maxOffset;
        } else if (currentX < -threshold) {
            offsetX = -maxOffset;
        } else {
            offsetX = 0;
        }

        cardElement.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
        cardElement.style.transform = `translateX(${offsetX}px)`;

        if (offsetX === maxOffset) {
            if (deleteBtn) { deleteBtn.style.opacity = 1; deleteBtn.style.pointerEvents = "auto"; }
            if (editBtn) { editBtn.style.opacity = 0; editBtn.style.pointerEvents = "none"; }
        } else if (offsetX === -maxOffset) {
            if (editBtn) { editBtn.style.opacity = 1; editBtn.style.pointerEvents = "auto"; }
            if (deleteBtn) { deleteBtn.style.opacity = 0; deleteBtn.style.pointerEvents = "none"; }
        } else {
            if (deleteBtn) { deleteBtn.style.opacity = 0; deleteBtn.style.pointerEvents = "none"; }
            if (editBtn) { editBtn.style.opacity = 0; editBtn.style.pointerEvents = "none"; }
        }

        currentX = 0;
    });
    function handleOutsideTouch(e) {
        // لو الكارت اتشال من الصفحة، نشيل المستمع ده من على الصفحة
        if (!cardElement.isConnected) {
            document.removeEventListener("touchstart", handleOutsideTouch);
            return;
        }
        if (deleteBtn && deleteBtn.contains(e.target)) return;
        if (editBtn && editBtn.contains(e.target)) return;

        if (!cardElement.contains(e.target) && offsetX !== 0) {
            offsetX = 0;
            cardElement.style.transition = "transform 0.25s ease";
            cardElement.style.transform = "translateX(0px)";
            setTimeout(() => {
                if (deleteBtn) { deleteBtn.style.opacity = 0; deleteBtn.style.pointerEvents = "none"; }
                if (editBtn) { editBtn.style.opacity = 0; editBtn.style.pointerEvents = "none"; }
            }, 250);
        }
    }
    document.addEventListener("touchstart", handleOutsideTouch);
}
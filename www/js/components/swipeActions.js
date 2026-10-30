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

        currentX = offsetX + deltaX;
        if (currentX > maxOffset) currentX = maxOffset;
        if (currentX < -maxOffset) currentX = -maxOffset;

        cardElement.style.transform = `translateX(${currentX}px)`;
        if (deleteBtn) deleteBtn.style.transition = "none";
        if (editBtn) editBtn.style.transition = "none";
        if (currentX > 0) {
            if (deleteBtn) {
                deleteBtn.style.opacity = currentX / maxOffset;
                deleteBtn.style.pointerEvents = "auto";
            }
            if (editBtn) {
                editBtn.style.opacity = 0;
                editBtn.style.pointerEvents = "none";
            }
        } else {
            if (editBtn) {
                editBtn.style.opacity = Math.abs(currentX) / maxOffset;
                editBtn.style.pointerEvents = "auto";
            }
            if (deleteBtn) {
                deleteBtn.style.opacity = 0;
                deleteBtn.style.pointerEvents = "none";
            }
        }
    }, { passive: false });

    cardElement.addEventListener("touchend", function() {
        if (deleteBtn) deleteBtn.style.transition = "";
        if (editBtn) editBtn.style.transition = "";
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
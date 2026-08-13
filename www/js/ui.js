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

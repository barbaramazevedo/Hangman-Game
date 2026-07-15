function bindKeyboardEvents() {
    document.querySelectorAll(".key-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            handleKeyClick(btn.dataset.key);
        });
    });
}
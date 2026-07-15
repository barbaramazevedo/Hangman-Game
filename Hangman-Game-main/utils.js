function capitalizeText(text) {
    return text.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function formatDate(date = new Date()) {
    return new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}
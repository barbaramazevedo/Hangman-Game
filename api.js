async function fetchWord() {
    try {
        const res = await fetch("https://random-word-api.herokuapp.com/word");
        const data = await res.json();
        return data[0];
    } catch (error) {
        console.error("Error fetching word:", error);
        return null;
    }
}
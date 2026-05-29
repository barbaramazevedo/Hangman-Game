async function fetchWord() {
    try {
        const wordRes = await fetch("https://random-word-api.herokuapp.com/word");
        const wordData = await wordRes.json();
        const word = wordData[0].toUpperCase();

        try {
            const defRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
            const defData = await defRes.json();
            const meaning = defData[0].meanings[0];
            const definition = meaning.definitions[0].definition;
            const category = capitalizeText(meaning.partOfSpeech) || "API Word";
            return { word, definition, category };
        } catch {
            return { word, definition: "No definition available", category: "API Word" };
        }
    } catch (error) {
        console.error("Error fetching word from API:", error);
        return getRandomWord();
    }
}
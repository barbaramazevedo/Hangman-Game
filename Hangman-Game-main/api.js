async function fetchWordFromDB() {
    const res = await fetch("http://localhost:3000/words/random");
    if (!res.ok) throw new Error("DB fallback failed");
    const data = await res.json();
    return {
        word: data.text,
        definition: "No definition available",
        category: data.category || "General"
    };
}

async function fetchWord() {
    try {
        const wordRes = await fetch("https://random-word-api.herokuapp.com/word");
        if (!wordRes.ok) throw new Error("API error");
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
    } catch {
        console.warn("External API unavailable, falling back to database.");
        try {
            return await fetchWordFromDB();
        } catch {
            console.warn("Database unavailable, falling back to local word list.");
            return getRandomWord();
        }
    }
}
# 🎮 Hangman Game

## 📖 About the Project

Hangman Game is a responsive browser game developed with **HTML, CSS, and Vanilla JavaScript**.

The game fetches random English words from a public API and also retrieves their definitions and part-of-speech category from a dictionary API. If the API is unavailable or returns an error (e.g. rate limit), the game automatically falls back to a local word bank in `words.js` so the game always works.

Multiple local players can participate in different rounds, with scores, wins, losses, and match history persisted via `localStorage`.

The main goal of the project is to practice:
- API consumption with fallback handling
- DOM manipulation
- Asynchronous JavaScript
- Game logic
- CRUD operations
- LocalStorage persistence
- Responsive web development

---

# 👥 Team Members

| Person | Responsibility |
|---|---|
| Jéssica | API integration and game logic |
| Samara | Interface, DOM manipulation, and responsiveness |
| Bárbara | Players system, ranking, and LocalStorage |

---

# 🧠 Project Features

- Random word generation via external API
- Automatic fallback to local word bank if API fails
- Word definition displayed as a hint
- Word category displayed on screen
- Hint system (costs 1 attempt per use, max 2 uses)
- Multiplayer local player system
- Persistent ranking system
- Match history with filters
- Responsive interface
- Virtual keyboard
- Win and lose screens
- LocalStorage persistence

---

# 🌐 APIs Used

**Random Word API** — fetches a random English word:
```
https://random-word-api.herokuapp.com/word
```

**Dictionary API** — fetches the word's definition and part of speech:
```
https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

Example response used from Dictionary API:
```json
[
  {
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "A high-level programming language used to build web applications."
          }
        ]
      }
    ]
  }
]
```

---

# 🔁 API Fallback

If the API request fails for any reason (rate limit, network error, timeout), the game falls back to the local word bank defined in `words.js`:

```js
async function fetchWord() {
    try {
        const wordRes = await fetch("https://random-word-api.herokuapp.com/word");
        const wordData = await wordRes.json();
        const word = wordData[0].toUpperCase();

        try {
            const defRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
            const defData = await defRes.json();
            const meaning = defData[0].meanings[0];
            return {
                word,
                definition: meaning.definitions[0].definition,
                category: capitalizeText(meaning.partOfSpeech)
            };
        } catch {
            return { word, definition: "No definition available", category: "API Word" };
        }
    } catch (error) {
        return getRandomWord(); // fallback to words.js
    }
}
```

Each word in `words.js` follows this structure:
```js
{ word: "JAVASCRIPT", definition: "Programming language for web interactivity", category: "Technology" }
```

---

# 🎯 How the Game Works

1. The player types their name before starting the game.
2. The system checks if the player already exists in LocalStorage.
3. If the player does not exist, a new player is created.
4. A random word is fetched from the API (or from `words.js` if the API fails).
5. The word's definition and category are shown on screen.
6. The player tries to guess the hidden word letter by letter using the virtual keyboard.
7. Correct letters are revealed in the word display.
8. Wrong letters reduce the remaining attempts and draw parts of the hangman.
9. The player can use up to 2 hints (each costs 1 attempt):
   - 1st hint: shows the word definition
   - 2nd hint: reveals a random hidden letter
10. The game ends with victory or defeat.
11. The player's ranking and match history are automatically updated.

---

# 🔄 Game Flow

```
Start Game
   ↓
Player enters name
   ↓
System checks LocalStorage
   ↓
API fetches random word + definition
   ↓  (fallback to words.js if API fails)
Game starts
   ↓
Player guesses letters
   ↓
Correct or wrong attempts update the interface
   ↓
Victory or defeat
   ↓
Ranking and history saved
   ↓
New round can start
```

---

# 🏆 Ranking System

The game stores player statistics in LocalStorage.

Scoring formula:
```
score = (wins × 10) − (losses × 5)
```

| Action | Points |
|---|---|
| Victory | +10 |
| Defeat | −5 |

Example ranking:
```
🥇 Jessica — 40 pts
🥈 Samara — 35 pts
🥉 Barbara — 30 pts
```

The ranking updates automatically after every match.

---

# 💾 LocalStorage Structure

The project uses `localStorage` to persist data between sessions.

**Players** — key: `"players"`
```json
[
  {
    "name": "Barbara",
    "wins": 5,
    "losses": 2,
    "matches": 7,
    "score": 40
  }
]
```

**Match history** — key: `"history"`
```json
[
  {
    "player": "Samara",
    "word": "JAVASCRIPT",
    "won": true,
    "score": 10,
    "date": "2025-06-01T14:32:00.000Z"
  }
]
```

---

# 🧩 Project Structure

```
📁 hangman-game
 ├── index.html      — markup and screens
 ├── style.css       — all styles and responsive layout
 ├── main.js         — event registration and app init
 ├── api.js          — API fetch with fallback to words.js
 ├── game.js         — round logic, letter checking, hint system
 ├── ui.js           — keyboard rendering and DOM helpers
 ├── players.js      — player creation and score update
 ├── ranking.js      — ranking render
 ├── history.js      — match history render and filters
 ├── storage.js      — localStorage read/write
 ├── update.js       — match history record
 ├── utils.js        — shared utility functions
 └── words.js        — local word bank (API fallback)
```

---

# 👩 Jéssica — API and Game Logic

Responsible for:
- Fetching random words from the API
- Fetching word definitions from the Dictionary API
- Fallback to local word bank on API failure
- Starting game rounds
- Managing attempts and game state
- Validating letters
- Victory and defeat logic
- Hint system

Main JavaScript concepts:
- `fetch` API
- `async/await`
- `try/catch`
- Arrays and objects
- Conditionals and functions

Key functions (`api.js`, `game.js`):
```js
async function fetchWord() {}   // fetches word + definition, falls back to words.js
async function startRound() {}  // resets state and starts a new round
function checkLetter() {}       // validates a guessed letter
function checkVictory() {}      // checks if all letters were guessed
function useHint() {}           // reveals definition or a random letter
```

---

# 👩 Samara — Interface and DOM Manipulation

Responsible for:
- Rendering the hidden word slots
- Rendering wrong letter chips
- Virtual keyboard
- Updating the hangman drawing
- Responsive layout
- Visual feedback and screen transitions

Main JavaScript concepts:
- DOM manipulation
- Event listeners
- `classList`
- Dynamic rendering
- Responsive design (Flexbox, Grid, Media Queries)

Key functions (`ui.js`, `game.js`):
```js
function renderWordDisplay() {}   // renders letter slots
function resetKeyboard() {}       // clears keyboard state
function addWrongLetterChip() {}  // adds a chip for each wrong letter
function revealHangmanPart() {}   // shows next hangman body part
function showStatus() {}          // shows win/lose/loading/error panel
```

---

# 👩 Bárbara — Players, Ranking and LocalStorage

Responsible for:
- Creating and loading players
- Saving players in LocalStorage
- Ranking system
- Match history
- Updating scores after each round
- Clearing ranking and history

Main JavaScript concepts:
- `localStorage`
- `JSON.stringify` / `JSON.parse`
- CRUD operations
- Arrays of objects
- Sorting data

Key functions (`players.js`, `storage.js`, `ranking.js`, `history.js`):
```js
function registerPlayer() {}    // creates player if not exists
function searchPlayer() {}      // finds player by name
function updateScore() {}       // updates wins, losses, matches, score
function savePlayers() {}       // persists players to localStorage
function loadPlayers() {}       // reads players from localStorage
function addMatchToHistory() {} // records a match result
function renderHistory() {}     // renders history with filters
```

---

# 📱 Responsive Design

The project is fully responsive and works on:
- Desktop
- Tablet
- Mobile devices

Technologies used:
- Flexbox
- CSS Grid
- Media Queries

---

# 🚀 Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage API
- Fetch API

---

# ▶️ How to Run the Project

1. Clone the repository
2. Open the project folder
3. Open `index.html` in the browser

Or deploy using:
- GitHub Pages
- Netlify
- Vercel

---

# 📌 Main Learning Objectives

This project was created to practice:
- JavaScript logic
- API consumption with error handling and fallback
- DOM manipulation
- Asynchronous operations
- CRUD concepts
- State management
- Responsive web design
- Teamwork and code organization

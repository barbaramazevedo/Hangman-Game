# 🎮 Hangman Game Multiplayer

## 📖 About the Project

Hangman Game Multiplayer is a responsive browser game developed with **HTML, CSS, and Vanilla JavaScript**.

The project consumes a public API to generate random English words and allows multiple local players to participate in different rounds while saving their scores, victories, defeats, and match history using `localStorage`.

The main goal of the project is to practice:
- API consumption
- DOM manipulation
- asynchronous JavaScript
- game logic
- CRUD operations
- LocalStorage persistence
- responsive web development

---

# 👥 Team Members

| Person | Responsibility |
|---|---|
| Jéssica | API integration and game logic |
| Samara | Interface, DOM manipulation, and responsiveness |
| Bárbara | Players system, ranking, and LocalStorage |

---

# 🧠 Project Features

- Random word generation using API
- Multiplayer local player system
- Persistent ranking system
- Match history
- Responsive interface
- Virtual keyboard
- Win and lose screens
- Error handling
- LocalStorage persistence

---

# 🌐 API Used

Random Word API:

https://random-word-api.herokuapp.com/home

Example request:

```js
fetch("https://random-word-api.herokuapp.com/word")
```

---

# 🎯 How the Game Works

1. The player types their name before starting the game.
2. The system checks if the player already exists in LocalStorage.
3. If the player does not exist:
   - a new player is created.
4. A random word is fetched from the API.
5. The player tries to guess the hidden word letter by letter.
6. Correct letters are displayed in the word.
7. Wrong letters reduce the remaining attempts.
8. The game ends with:
   - victory
   - defeat
9. The player's ranking and match history are automatically updated.

---

# 🔄 Game Flow

```txt
Start Game
   ↓
Player enters name
   ↓
System checks LocalStorage
   ↓
API returns random word
   ↓
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

The game stores player statistics locally.

Each player has:
- victories
- defeats
- total matches
- score

Example scoring system:

| Action | Points |
|---|---|
| Victory | +10 |
| Defeat | -5 |
| Correct Letter | +1 |

Example ranking:

```txt
🥇 Jessica — 40 pts
🥈 Samara — 40 pts
🥉 Barbara — 30 pts
```

The ranking updates automatically after every match.

---

# 💾 LocalStorage System

The project uses `localStorage` to persist data even after the browser is closed.

Stored data:
- players
- ranking
- victories
- defeats
- score
- match history

Example structure:

```js
const players = [
  {
    name: "Barbara",
    victories: 5,
    defeats: 2,
    matches: 7,
    score: 50
  }
];
```

Example match history:

```js
const history = [
  {
    player: "Samara",
    word: "javascript",
    result: "Victory"
  }
];
```

---

# 🧩 Project Structure

```txt
📁 hangman-game
 ├── index.html
 ├── style.css
 ├── main.js
 ├── api.js
 ├── game.js
 ├── ui.js
 ├── players.js
 ├── storage.js
 └── utils.js
```

---

# 👩 Jéssica — API and Game Logic

Responsible for:
- Fetching random words from API
- Starting game rounds
- Managing attempts
- Validating letters
- Victory and defeat logic
- Error handling

Main JavaScript concepts:
- fetch API
- async/await
- try/catch
- arrays
- objects
- conditionals
- functions

Example functions:

```js
async function fetchWord() {}

function startRound() {}

function checkLetter() {}

function checkVictory() {}
```

---

# 👩 Samara — Interface and DOM Manipulation

Responsible for:
- Rendering hidden word
- Rendering wrong letters
- Virtual keyboard
- Updating the hangman drawing
- Responsive layout
- Visual feedback and screens

Main JavaScript concepts:
- DOM manipulation
- event listeners
- classList
- dynamic rendering
- responsive design

Example functions:

```js
function renderWord() {}

function renderKeyboard() {}

function updateHangman() {}

function showMessage() {}
```

---

# 👩 Bárbara — Players, Ranking and LocalStorage

Responsible for:
- Creating players
- Saving players in LocalStorage
- Ranking system
- Match history
- Updating scores
- Resetting ranking/history

Main JavaScript concepts:
- localStorage
- JSON.stringify
- JSON.parse
- CRUD operations
- arrays of objects
- sorting data

Example functions:

```js
function createPlayer() {}

function savePlayers() {}

function updateScore() {}

function renderRanking() {}
```

---

# 📱 Responsive Design

The project is fully responsive and works on:
- desktop
- tablet
- mobile devices

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
- API consumption
- DOM manipulation
- asynchronous operations
- CRUD concepts
- state management
- responsive web design
- teamwork and code organization
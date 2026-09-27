/* ==========================
    Elements
========================== */

// Shared
const screens = document.querySelectorAll(".screen");
const screenTitle = document.getElementById("screen-title");

//Setup Screen
const playerCountInput = document.getElementById("player-count");
const playerCountError = document.getElementById("player-count-error");

const playersMinusBtn = document.getElementById("players-minus");
const playersPlusBtn = document.getElementById("players-plus");

const playerInputs = document.getElementById("player-inputs");

const startGameBtn = document.getElementById("start-game-btn");

//Role Screen
const currentPlayerName = document.getElementById("current-player-name");
const flipCard = document.getElementById("flip-card");
const roleBack = document.getElementById("role-back");
const nextPlayerBtn = document.getElementById("next-player-btn");
const flipBackHint = document.getElementById("flip-back-hint");

//Grid Screen
const gridTopicText = document.getElementById("grid-topic-text");
const wordGrid = document.getElementById("word-grid");
const cluesDoneBtn = document.getElementById("clues-done-btn");

//Accustaion & Final Guess

const outsiderChoices = document.getElementById("outsider-choices");
const submitAccusationBtn = document.getElementById("submit-accusation-btn");

const finalGuessInstruction = document.getElementById("final-guess-instruction");
const finalGuessTopicText = document.getElementById("final-guess-topic-text");
const finalGuessGrid = document.getElementById("final-guess-grid");
const submitFinalGuessBtn = document.getElementById("submit-final-guess-btn");

const showGridBtn = document.getElementById("show-grid-btn");
const chosenWordDisplay = document.getElementById("chosen-word-display");
const chosenWordText = document.getElementById("chosen-word-text");

//Results Screen
const resultMessage = document.getElementById("result-message");
const resultText = document.getElementById("result-text");
const realWord = document.getElementById("real-word");
const outsiderName = document.getElementById("outsider-name");

const playAgainBtn = document.getElementById("play-again-btn");
const newGameBtn = document.getElementById("new-game-btn");


/* ==========================
    Game State
========================== */
const game = {
    playerCount: 4,
    players: [],
    roles: [],
    currentTopic: null,
    currentGridWords: [],
    secretWordIndex: null,
    secretWord: null,
    currentPlayer: 0
};

const SETTINGS = { 
    minPlayers: 3,
    maxPlayers: 8
};

let cardRevealed = false;


const wordGrids = [ //AI Generated
    { 
        topic: "Musical Instruments",
        words: [
            "Violin", "Trumpet", "Drums", "Flute",
            "Guitar", "Piano", "Saxophone", "Cello",
            "Clarinet", "Harp", "Trombone", "Banjo",
            "Accordion", "Xylophone", "Ukulele", "Bagpipes"
        ]
    },
    {
        topic: "Phobias",
        words: [
            "Spiders", "Heights", "Enclosed Spaces", "Public Speaking",
            "Needles", "Flying", "Deep Water", "The Dark",
            "Snakes", "Thunderstorms", "Clowns", "Crowds",
            "Germs", "Blood", "Open Spaces", "Dolls"
        ]
    },
    {
        topic: "Authors",
        words: [
            "Shakespeare", "Austen", "Tolkien", "Rowling",
            "Hemingway", "Dickens", "Orwell", "King",
            "Poe", "Twain", "Christie", "Angelou",
            "Fitzgerald", "Steinbeck", "Woolf", "Bradbury"
        ]
    }
];

/* ==========================
    Initalization
========================== */

initialize();

function initialize() {
    handleSetupUpdates();
}

function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.add("hidden");
    });

    const activeScreen = document.getElementById(screenId);
    activeScreen.classList.remove("hidden");

    screenTitle.textContent = activeScreen.dataset.title;
}

/* ==========================
    Setup
========================== */
function updatePlayerCount() {
    let count = parseInt(playerCountInput.value, 10);

    if(isNaN(count)) {
        count = SETTINGS.minPlayers;
    }

    if (count < SETTINGS.minPlayers) count = SETTINGS.minPlayers;
    if (count > SETTINGS.maxPlayers) count = SETTINGS.maxPlayers;

    playerCountInput.value = count;
    game.playerCount = count;
}

function generatePlayerInputs() {
    const existingInputs = playerInputs.querySelectorAll("input");
    const savedNames = [];
    existingInputs.forEach(input => {
        savedNames.push(input.value);
    });

    playerInputs.innerHTML = "";

    for (let i = 0; i < game.playerCount; i++) {
        const wrap = document.createElement("div");
        wrap.className = "player-input-wrap";
        wrap.innerHTML = `
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill player-input-icon" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
        </svg>
        `;

        const input = document.createElement("input");
        input.type = "text";
        input.id = `player-name-${i}`;
        input.placeholder = `Player ${i + 1}`;
        input.className = "player-name-field";

        if(savedNames[i]) { 
            input.value = savedNames[i];
        }
        wrap.appendChild(input);
        playerInputs.appendChild(wrap);
    }
}

function validateSetup() { 
    const inputs = playerInputs.querySelectorAll("input");
    let allNamesFilled = true;

    inputs.forEach(input => {
        if(input.value.trim() === "") {
            allNamesFilled = false;
        }
    });

    if (game.playerCount < SETTINGS.minPlayers || game.playerCount > SETTINGS.maxPlayers) {
        playerCountError.classList.remove("hidden");
        startGameBtn.disabled = true;
    } else {
        playerCountError.classList.add("hidden");
        startGameBtn.disabled = !(allNamesFilled && inputs.length === game.playerCount);
    }
}

function attachNameInputListeners() {
    const inputs =playerInputs.querySelectorAll("input");
    inputs.forEach(input => {
        input.removeEventListener("input", validateSetup);
        input.addEventListener("input", validateSetup);
    });
} 

function handleSetupUpdates() {
    updatePlayerCount();
    generatePlayerInputs();
    validateSetup();

    attachNameInputListeners();
}

function increasePlayers() {
    let currentVal = parseInt(playerCountInput.value, 10) || SETTINGS.minPlayers;
    if (currentVal < SETTINGS.maxPlayers) {
        playerCountInput.value = currentVal + 1;
        handleSetupUpdates();
    }
}

function decreasePlayers() {
    let currentVal = parseInt(playerCountInput.value, 10) || SETTINGS.minPlayers;
    if (currentVal > SETTINGS.minPlayers) {
        playerCountInput.value = currentVal - 1;
        handleSetupUpdates();
    }
}

playersPlusBtn.addEventListener("click", increasePlayers); 
playersMinusBtn.addEventListener("click", decreasePlayers);

playerCountInput.addEventListener("input", handleSetupUpdates); 
startGameBtn.addEventListener("click", startGame);

/* ==========================
    Role Generation
========================== */
function startGame() {
    game.players = [];
    const nameInputs = playerInputs.querySelectorAll("input");
    nameInputs.forEach(input => {
        game.players.push(input.value.trim());
    });

    assignRoles();
    assignSecretWord();

    game.currentPlayer = 0;
    cardRevealed = false;

    showCurrentPlayer();
    showScreen("role-screen");

}

function assignRoles() {
    game.roles = [];
    const outsiderIndex = Math.floor(Math.random() * game.playerCount);
    
    for (let i = 0; i < game.playerCount; i++) {
        game.roles[i] = (i === outsiderIndex) ? "Outsider" : "Insider";
    }
}

function assignSecretWord() {
    const randomTopicIndex = Math.floor(Math.random()*wordGrids.length);
    const chosenGrid = wordGrids[randomTopicIndex];
    const randomWordIndex = Math.floor(Math.random()*chosenGrid.words.length);
    
    game.currentTopic = chosenGrid.topic;
    game.currentGridWords = chosenGrid.words;
    game.secretWordIndex = randomWordIndex;
    game.secretWord = chosenGrid.words[randomWordIndex];
}

/* ==========================
    Role Reveal
========================== */
function showCurrentPlayer() {
    currentPlayerName.textContent = game.players[game.currentPlayer];
    flipCard.classList.remove("flipped");
    cardRevealed = false;
    flipBackHint.classList.add("hidden");
    nextPlayerBtn.disabled = true;

    const role = game.roles[game.currentPlayer];
    if (role === "Outsider") {
        roleBack.innerHTML =  `
            <p class="role-label">You are</p>
            <h2 style="color: #ff4911;  -webkit-text-stroke: 1.5px #2b2b2b;">the Outsider!</h2>
            <p class="role-detail"> You do not know the secret word! </p>
            <p class="role-detail"> Listen to clues and fake it till you make it!</p>
        `;
    } else {
        roleBack.innerHTML = `
            <p class="role-label">You are</p>
            <h2 style="color: var(--accent-primary); -webkit-text-stroke: 1.5px #2b2b2b;">an Insider!</h2>
            <p class="role-detail"> The secret word is: <strong>${game.secretWord}</strong></p>
            <p class="role-detail"> Give a clue that points to it, but don't make it too obvious. </p>
        `;
    }
}

function handleCardFlip() {
    flipCard.classList.toggle("flipped");
    cardRevealed = flipCard.classList.contains("flipped");

    if (cardRevealed){
        nextPlayerBtn.disabled=true;
        flipBackHint.classList.remove("hidden");
        
    } else {
        flipBackHint.classList.add("hidden");
        nextPlayerBtn.disabled = true;
        setTimeout(() => { nextPlayerBtn.disabled = false; }, 400);
    }

}

function nextPlayer() {
    game.currentPlayer++;

    if(game.currentPlayer < game.playerCount) {  //if there are players who have not viewed their role
        showCurrentPlayer();
    } else {
        initializeGridPhase();
    }
}

nextPlayerBtn.addEventListener("click", nextPlayer);
flipCard.addEventListener("click", handleCardFlip);

/* ==========================
    Main
========================== */
function initializeGridPhase() {
    gridTopicText.textContent = game.currentTopic;
    buildWordGrid();
    document.body.classList.add("grid-mode");
    showScreen("grid-screen");
}

function buildWordGrid() {
    wordGrid.innerHTML = "";

    game.currentGridWords.forEach((word, index) => {
    const cell = document.createElement("div");
    cell.className = "word-cell";
    if (word.length > 10) cell.classList.add("word-cell-long"); 
    cell.innerHTML = `<span>${word}</span>`;
    wordGrid.appendChild(cell);
});
}

/* ==========================
    Accusatiom and Final Guess
========================== */
cluesDoneBtn.addEventListener("click", () => {
    document.body.classList.remove("grid-mode");
    showAccusationScreen();
}) 

function showAccusationScreen() {
    game.guessedOutsiderIndex = null;
    submitAccusationBtn.disabled = true;
    buildOutsiderChoices();
    showScreen("accusation-screen");
}

function buildOutsiderChoices() {
    outsiderChoices.innerHTML = "";

    game.players.forEach((playerName, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "player-btn";
        btn.textContent = playerName;

        btn.addEventListener("click", () => {
            outsiderChoices.querySelectorAll(".player-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            game.guessedOutsiderIndex = index;
            submitAccusationBtn.disabled = false;
        });
        outsiderChoices.appendChild(btn);
    });
}

submitAccusationBtn.addEventListener("click", () => {
    const outsiderIndex = game.roles.indexOf("Outsider");
    game.outsiderCaught = (game.guessedOutsiderIndex === outsiderIndex);

    if (game.outsiderCaught) {
        game.guessAttemptsRemaining = (game.playerCount === 3) ? 2:1;
        showFinalGuessScreen();
    } else {
        game.outsiderGuessedCorrectly = false;
        showResultsScreen();
    }
});

function showFinalGuessScreen() {
    finalGuessTopicText.textContent = game.currentTopic;
    updateFinalGuessInstruction();
    buildFinalGuessGrid();
    submitFinalGuessBtn.disabled = true;
    chosenWordDisplay.classList.remove("visible");
    document.body.classList.remove("final-guess-grid-mode");
    showScreen("final-guess-screen");
}

function updateFinalGuessInstruction() {
    finalGuessInstruction.textContent = (game.guessAttemptsRemaining > 1)
    ? "You've been caught! With only 3 players, you get two guesses so choose wisely."
    : "You've been caught! Guess the secret word for one last chance to win.";
}

function buildFinalGuessGrid() {
    finalGuessGrid.innerHTML = "";
    let selectedIndex = null;

    game.currentGridWords.forEach((word, index) => {
        const cell = document.createElement("div");
        cell.className = "word-cell selectable";
        if (word.length > 10) cell.classList.add("word-cell-long");
        cell.innerHTML = `<span>${word}</span>`;

        cell.addEventListener("click", () => {
            finalGuessGrid.querySelectorAll(".word-cell").forEach(c => c.classList.remove("active"));
            cell.classList.add("active");
            selectedIndex = index;
            submitFinalGuessBtn.disabled = false;

            chosenWordText.textContent = word;
            chosenWordDisplay.classList.add("visible");
            document.body.classList.remove("final-guess-grid-mode");
        });
        finalGuessGrid.appendChild(cell);
    });

    finalGuessGrid._getSelectedIndex = () => selectedIndex;
}

submitFinalGuessBtn.addEventListener("click", () => {
    const guessedIndex = finalGuessGrid._getSelectedIndex();
    const correct = guessedIndex === game.secretWordIndex;;

    if (correct) {
        game.outsiderGuessedCorrectly = true;
        showResultsScreen();
        return;
    } 
    game.guessAttemptsRemaining--;
    
    if (game.guessAttemptsRemaining > 0) {
        updateFinalGuessInstruction();
        buildFinalGuessGrid();
        submitFinalGuessBtn.disabled = true;
        chosenWordDisplay.classList.remove("visible");
    } else {
        game.outsiderGuessedCorrectly = false;
        showResultsScreen();
    }
});

showGridBtn.addEventListener("click", () => {
    document.body.classList.add("final-guess-grid-mode");
});

/* ==========================
    Results
========================== */
function showResultsScreen() {
    const outsiderIndex = game.roles.indexOf("Outsider");

    realWord.textContent = game.secretWord;
    outsiderName.textContent = game.players[outsiderIndex];

    const groupWins = game.outsiderCaught && !game.outsiderGuessedCorrectly;

    if (groupWins) {
        resultMessage.innerHTML = "OUTSIDER EXPOSED";
        resultMessage.style.color = "var(--accent-primary)";
        resultText.textContent = "The group correctly identified the Outsider, who failed to guess the secret word.";
    } else {
        resultMessage.textContent = "THE OUTSIDER WINS";
        resultMessage.style.color = "#ff4911";
        resultText.textContent = game.outsiderCaught
        ? "The Outsider was not caught in time and got the inside scoop!"
        : "The Outsider blended in perfectly and was never caught.";
    }
   
    showScreen("results-screen");
}

function playAgain() {
    assignRoles();
    assignSecretSignal();

     ame.currentPlayer = 0;
    game.guessedOutsiderIndex = null;
    game.outsiderCaught = false;
    game.guessedFinalIndex = null;
    game.guessAttemptsRemaining = 1;
    game.outsiderGuessedCorrectly = false;
    cardRevealed = false;

    showCurrentPlayer();
    showScreen("role-screen");
}

function resetGame() {
    game.playerCount = 4;
    game.players = [];
    game.roles = [];
    game.currentTopic = null;
    game.currentGridWords = [];
    game.secretWordIndex = null;
    game.secretWord = null;
    game.currentPlayer = 0;
    game.guessedOutsiderIndex = null;
    game.outsiderCaught = false;
    game.guessAttemptsRemaining = 1;
    game.outsiderGuessedCorrectly = false;

    playerCountInput.value = 4;

    handleSetupUpdates();
    const inputs = playerInputs.querySelectorAll("input"); 
    inputs.forEach(input => { input.value =""; });

    showScreen("setup-screen");
}

playAgainBtn.addEventListener("click", playAgain);
newGameBtn.addEventListener("click", resetGame);

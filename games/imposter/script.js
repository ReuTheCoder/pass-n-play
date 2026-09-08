/* ==========================
    Cached Elements
========================== */

// Shared
const screens = document.querySelectorAll(".screen");
const screenTitle = document.getElementById("screen-title");

//Setup Screen
const playerCountInput = document.getElementById("player-count");
const playerCountError = document.getElementById("player-count-error");

const playersMinusBtn = document.getElementById("players-minus");
const playersPlusBtn = document.getElementById("players-plus");

const saboteurSection = document.getElementById("saboteur-section");
const saboteurInput = document.getElementById("saboteur-count");
const saboteurMinusBtn = document.getElementById("saboteur-minus");
const saboteurPlusBtn = document.getElementById("saboteur-plus");
const categoryChoicesGrid = document.getElementById("category-choices-grid");

const randomizeImpostersBtn = document.getElementById("randomize-players-btn");

const playerInputs = document.getElementById("player-inputs");

const startGameBtn = document.getElementById("start-game-btn");

//Role Screen
const currentPlayerName = document.getElementById("current-player-name");
const flipCard = document.getElementById("flip-card");
const roleBack = document.getElementById("role-back");
const nextPlayerBtn = document.getElementById("next-player-btn");

//Discussion Screen
const discussionNextBtn = document.getElementById("discussion-next-btn");

//Guess Screen
const saboteurChoices = document.getElementById("saboteur-choices");
const submitGuessBtn = document.getElementById("submit-guess-btn");

//Results Screen
const resultMessage = document.getElementById("result-message");
const resultText = document.getElementById("result-text");
const realNum = document.getElementById("real-num");
const saboteurName = document.getElementById("saboteur-name");

const playAgainBtn = document.getElementById("play-again-btn");
const newGameBtn = document.getElementById("new-game-btn");

const voteError = document.getElementById("guesser-count-error");


/* ==========================
    Game State
========================== */
const game = {
    playerCount: 4,
    saboteurCount: 1,
    selectedCategories: ["objects"],
    players: [],
    roles: [],
    secretWord: null,
    currentPlayer: 0,
    guessedImposters: []
};

const SETTINGS = { //constraints, basically
    minPlayers: 3,
    maxPlayers: 10,
    twoSaboteurMinPlayers: 6 
};

let cardRevealed = false;

const wordBank = {
  objects: ["Chair","Table","Phone","Backpack","Mirror","Clock","Lamp","Notebook","Pen","Wallet","Keys","Bottle"],
  food: ["Pizza","Burger","Pasta","Rice","Soup","Sandwich","Salad","Tacos","Fries","Noodles","Ice Cream","Cake"],
  animals: ["Dog","Cat","Horse","Cow","Pig","Sheep","Goat","Chicken","Duck","Goose","Lion","Tiger"],
  colors: ["Red","Blue","Green","Yellow","Orange","Purple","Pink","Brown","Black","White","Gray","Beige"],
  shapes: ["Circle","Square","Triangle","Rectangle","Oval","Diamond","Star","Heart","Pentagon"],
  emotions: ["Happy","Sad","Angry","Excited","Nervous","Calm","Relaxed","Stressed","Anxious","Confident"],
  music: ["Song","Album","Playlist","Concert","Band","Singer","Guitar","Piano","Drums","Violin"],
  brands: ["Apple","Google","Samsung","Nike","Adidas","Puma","Coca-Cola","Pepsi","McDonald's"],
  hobbies: ["Gaming","Drawing","Painting","Reading","Writing","Cooking","Baking","Gardening"],
  movies: ["Inception","Titanic","Avatar","Frozen","Toy Story","The Matrix","Jurassic Park","Star Wars"],
  jobs: ["Doctor","Nurse","Teacher","Professor","Student","Engineer","Programmer","Developer"],
  nature: ["Rain","Snow","Hail","Sleet","Wind","Breeze","Storm","Thunder","Lightning","Fog"],
  transport: ["Car","Truck","Van","Bus","Taxi","Uber","Train","Subway","Metro","Airplane"],
};

/* ==========================
    Initalization
========================== */

initialize();

function initialize() {
    handleSetupUpdates();
    setupCategoryEventListeners();
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
        const input = document.createElement("input");
        input.type = "text";
        input.id = `player-name-${i}`;
        input.placeholder = `Player ${i + 1}`;
        input.className = "player-name-field";

        if(savedNames[i]) { //keeps value saved in settings change after input
            input.value = savedNames[i];
        }

        playerInputs.appendChild(input);
    }
}

function updateSaboteurControls() {

    if(game.playerCount >= SETTINGS.minPlayers) {
        saboteurSection.classList.remove("hidden");
    } else {
        saboteurSection.classList.add("hidden");
    }
    const selectorWrap = document.getElementById("saboteur-selector-wrap");

    if (game.playerCount >= SETTINGS.twoSaboteurMinPlayers) {
        saboteurPlusBtn.disabled = false;
        randomizeImpostersBtn.classList.remove("hidden");

        if(randomizeImpostersBtn.classList.contains("active-random")) {
            selectorWrap.classList.add("hidden");
        } else {
            selectorWrap.classList.remove("hidden");
        }
    } else {
        saboteurInput.value = 1; //default value if player count is below 6
        game.saboteurCount = 1;
        saboteurPlusBtn.disabled = true;

        randomizeImpostersBtn.classList.add("hidden");
        randomizeImpostersBtn.classList.remove("active-random");
        selectorWrap.classList.remove("hidden");
    }
}

function validateSetup() { //all players must have name before starting
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

        if (allNamesFilled && inputs.length === game.playerCount) { //enables if bounds are safe and text input is filled
            startGameBtn.disabled = false;
        } else {
            startGameBtn.disabled = true;
        }
    }
}

function setupCategoryEventListeners() {
    const categoryButtons = categoryChoicesGrid.querySelectorAll(".category-btn:not([disabled])");
    categoryButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const cat = btn.dataset.cat;
            const isActive = btn.classList.contains("active");

            if(isActive) {
                if (game.selectedCategories.length === 1) return;
                btn.classList.remove("active");
                game.selectedCategories = game.selectedCategories.filter(c => c !== cat);
            } else {
                btn.classList.add("active");
                game.selectedCategories.push(cat);
            }
        });
    });
}

function handleSetupUpdates() {
    updatePlayerCount();
    generatePlayerInputs();
    updateSaboteurControls();
    validateSetup();

    attachNameInputListeners();
}

function attachNameInputListeners() {
    const inputs =playerInputs.querySelectorAll("input");
    inputs.forEach(input => {
        input.removeEventListener("input", validateSetup);
        input.addEventListener("input", validateSetup);
    });
} //should add live validation

//Helpers
function increasePlayers() {
    let currentVal = parseInt(playerCountInput.value, 10) || SETTINGS.minPlayers;
    if (currentVal < SETTINGS.maxPlayers) {
        playerCountInput.value = currentVal + 1;
        handleSetupUpdates();
    }
}
function increaseSaboteurs() {
    let currentVal = parseInt(saboteurInput.value, 10) || 1;
    if (currentVal < 2) {
        if(game.playerCount >= SETTINGS.twoSaboteurMinPlayers) { //checks for restrction
            saboteurInput.value = currentVal + 1;
            game.saboteurCount = currentVal +1;
            validateSetup();
        } 
    }
}
function decreasePlayers() {
    let currentVal = parseInt(playerCountInput.value, 10) || SETTINGS.minPlayers;
    if (currentVal > SETTINGS.minPlayers) {
        playerCountInput.value = currentVal - 1;
        handleSetupUpdates();
    }
}
function decreaseSaboteurs() {
    let currentVal = parseInt(saboteurInput.value, 10) || 1;
    if (currentVal > 1) { //min sab count
        saboteurInput.value = currentVal - 1;
        game.saboteurCount = currentVal - 1;
        validateSetup(); //refresh form status
    }
}

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
    let pool = [];
    for (let i = 0; i < game.playerCount; i++) {pool.push(i); }

    let activeImposterTarget = game.saboteurCount;
    if (game.playerCount >= SETTINGS.twoSaboteurMinPlayers && randomizeImpostersBtn.classList.contains("active-random")) {
        activeImposterTarget = Math.floor(Math.random()*2) + 1;
        saboteurInput.value = activeImposterTarget;
    }

    let chosenImposters = [];
    while (chosenImposters.length < activeImposterTarget && pool.length > 0) {
        const randomIndex = Math.floor(Math.random()* pool.length);
        const playerIndex = pool.splice(randomIndex, 1)[0];
        chosenImposters.push(playerIndex);
    }

    for (let i = 0; i < game.playerCount; i++) {
        game.roles[i] = chosenImposters.includes(i) ? "Imposter" : "Teammate";
    }
}

function assignSecretWord() {
    const combinedPool = game.selectedCategories.flatMap(cat => wordBank[cat]);
    const randomIndex = Math.floor(Math.random()*combinedPool.length);
    game.secretWord = combinedPool[randomIndex];
}

/* ==========================
    Game Generation
========================== */
function showCurrentPlayer() {
    currentPlayerName.textContent = game.players[game.currentPlayer];
    flipCard.classList.remove("flipped");
    cardRevealed = false;

    const role = game.roles[game.currentPlayer];
    if (role == "Imposter") {
        roleBack.innerHTML =  `
            <h2 style="color: #e60012;  -webkit-text-stroke: 1.5px #2b2b2b;"> You are the Imposter!</h2>
            <p style="margin-top:14px;"> You do not know the word! <br> Listen to clues and fake it till you make it!</p>
        `;
    } else {
        roleBack.innerHTML = `
            <h2 style="color: var(--accent-primary); -webkit-text-stroke: 1.5px #2b2b2b;"> You are a Civilian!</h2>
            <p style="margin-top:14px; font-weight:600;"> The secret word is: <br><strong style="font-size:1.6rem; color: var(--accent-primary);">${game.secretWord}</strong></p>
        `;
    }
}

function handleCardFlip() {
    flipCard.classList.toggle("flipped");
    cardRevealed = flipCard.classList.contains("flipped");

    nextPlayerBtn.disabled=true;
    setTimeout(() => { nextPlayerBtn.disabled = false; }, 400);
}

function nextPlayer() {
    game.currentPlayer++;

    if(game.currentPlayer < game.playerCount) {  //if there are players who have not viewed their role
        showCurrentPlayer();
    } else {
        initializeDiscussionPhase();
    }
}

/* ==========================
    Discussion
========================== */

function initializeDiscussionPhase() {
    
    const randomLeader = game.players[Math.floor(Math.random()*game.playerCount)];
    const instructionBanner = document.querySelector("#discussion-screen .discussion-leader-line");
    instructionBanner.innerHTML = `<svg xmlns="http://w3.org" width="18" height="18" fill="currentColor" class="bi bi-megaphone-fill" viewBox="0 0 16 16" style="color: var(--accent-primary); transform: scaleX(-1);"><path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0zm-1 .724c-2.067.95-4.539 1.481-7 1.656v6.237a25 25 0 0 1 1.088.085c2.053.204 4.038.668 5.912 1.56zm-8 7.841V4.934c-.68.027-1.399.043-2.008.053A2.02 2.02 0 0 0 0 7v2c0 1.106.896 1.996 1.994 2.009l.496.008a64 64 0 0 1 1.51.048m1.39 1.081q.428.032.85.078l.253 1.69a1 1 0 0 1-.983 1.187h-.548a1 1 0 0 1-.916-.599l-1.314-2.48a66 66 0 0 1 1.692.064q.491.026.966.06"/></svg>
    <strong>${randomLeader}</strong> must state their clue first!`;

    showScreen("discussion-screen");
}

/* ==========================
    Guessing
========================== */
function showGuessScreen() {

    game.guessedImposters = [];
    submitGuessBtn.disabled = true;
    voteError.classList.add("hidden");
    
    buildSuspectChoices();
    showScreen("guess-screen");
}

function buildSuspectChoices() {
    saboteurChoices.innerHTML = "";

    game.players.forEach((playerName, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "player-btn";
        btn.textContent = playerName;

        btn.addEventListener("click", () => {
            const alreadySelected = game.guessedImposters.includes(index);
            if (alreadySelected) {
                game.guessedImposters = game.guessedImposters.filter(playerIndex => playerIndex !== index);
                btn.classList.remove("active");
            } else if (game.guessedImposters.length < game.saboteurCount) {
                game.guessedImposters.push(index);
                btn.classList.add("active");
            }
            updateVoteValidation();
        });
        saboteurChoices.appendChild(btn);
    });
}

function updateVoteValidation() {
    const count = game.guessedImposters.length;
    const hasCorrectCount = count === game.saboteurCount;

    voteError.classList.toggle("hidden", count === 0 || hasCorrectCount);
    submitGuessBtn.disabled = !hasCorrectCount
}

function submitGuess() {
    calculateWinner();

    showScreen("results-screen");
}

/* ==========================
    Results
========================== */
function calculateWinner() {
    const actualImposterIndices = [];
    game.roles.forEach((role,index) => {
        if (role === "Imposter") {
            actualImposterIndices.push(index);
        }
    });


    const caughtImposters = game.guessedImposters.length === actualImposterIndices.length && game.guessedImposters.every(index => actualImposterIndices.includes(index));

    const imposterNames = actualImposterIndices.map(index => game.players[index]);
    saboteurName.textContent = imposterNames.join(",");
    realNum.textContent = game.secretWord;

    if (caughtImposters) {
        resultMessage.innerHTML = "Imposters Stopped! <br> Civilians Win!";
        resultMessage.style.color = "var(--accent-primary)";
        resultText.textContent = "The group unmasked the true Imposter!";
    } else {
        resultMessage.textContent = "Imposters Win!";
        resultMessage.style.color = "#e60012";
        resultText.textContent = "The Imposters successfully threw everyone off the scent and remained hidden!";
    }
}

function playAgain() {
    assignRoles();
    assignSecretWord();

    game.currentPlayer = 0;
    cardRevealed = false;

    showCurrentPlayer();
    showScreen("role-screen");
}

function resetGame() {
    game.playerCount = 4;
    game.saboteurCount = 1;
    game.players = [];
    game.roles = [];
    game.secretWord = null;
    game.currentPlayer = 0;
    game.guessedImposters = [];

    playerCountInput.value = 4;
    saboteurInput.value = 1;

    handleSetupUpdates();
    const inputs = playerInputs.querySelectorAll("input"); //clear names when New Game starts
    inputs.forEach(input => { input.value =""; });

    randomizeImpostersBtn.classList.remove("active-random");

    showScreen("setup-screen");
}
/* ==========================
    Event Listeners
========================== */

playersPlusBtn.addEventListener("click", increasePlayers); //controls the buttons
playersMinusBtn.addEventListener("click", decreasePlayers);
saboteurPlusBtn.addEventListener("click", increaseSaboteurs); 
saboteurMinusBtn.addEventListener("click", decreaseSaboteurs);
playerCountInput.addEventListener("input", handleSetupUpdates); //controls the input field
startGameBtn.addEventListener("click", startGame);

playAgainBtn.addEventListener("click", playAgain);
nextPlayerBtn.addEventListener("click", nextPlayer);
flipCard.addEventListener("click", handleCardFlip);

discussionNextBtn.addEventListener("click", showGuessScreen);

submitGuessBtn.addEventListener("click", submitGuess);
newGameBtn.addEventListener("click", resetGame);


randomizeImpostersBtn.addEventListener("click", () => {
    randomizeImpostersBtn.classList.toggle("active-random");
    const selectorWrap = document.getElementById("saboteur-selector-wrap");

    if (randomizeImpostersBtn.classList.contains("active-random")) {
        selectorWrap.classList.add("hidden");
        game.saboteurCount = "random";
    } else {
        selectorWrap.classList.remove("hidden");
        game.saboteurCount = parseInt(saboteurInput.value, 10);
    }
    validateSetup();
});

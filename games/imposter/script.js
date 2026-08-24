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

const randomizePlayersBtn = document.getElementById("randomize-players-btn");

const playerInputs = document.getElementById("player-inputs");

const startGameBtn = document.getElementById("start-game-btn");

//Role Screen
const currentPlayerName = document.getElementById("current-player-name");
const flipCard = document.getElementById("flip-card");
const roleBack = document.getElementById("role-back");
const nextPlayerBtn = document.getElementById("next-player-btn");

//Discussion Screen
const promptText = document.getElementById("prompt-text");
const lowLabel = document.getElementById("low-label");
const highLabel = document.getElementById("high-label");

const rerollPromptBtn = document.getElementById("reroll-prompt-btn");
const discussionNextBtn = document.getElementById("discussion-next-btn");

//Guess Screen
const guessPrompt = document.getElementById("guess-prompt");
const likelihoodHint = document.getElementById("likelihood-hint");
const saboteurChoices = document.getElementById("saboteur-choices");
const submitGuessBtn = document.getElementById("submit-guess-btn");

//Results Screen
const resultMessage = document.getElementById("result-message");
const resultText = document.getElementById("result-text");
const realNum = document.getElementById("real-num");
const guessNum = document.getElementById("guess-num");
const saboteurName = document.getElementById("saboteur-name");

const playAgainBtn = document.getElementById("play-again-btn");
const newGameBtn = document.getElementById("new-game-btn");

//Popup
const saboteurModal = document.getElementById("saboteur-modal");
const saboteurInfoBtn = document.getElementById("saboteur-info-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalAckBtn = document.getElementById("modal-ack-btn");

/* ==========================
    Game State
========================== */
const game = {
    playerCount: 4,
    saboteurCount: 1,
    players: [],
    roles: [],
    prompt: null,
    secretNumber: null,
    currentPlayer: 0,
    guessedNumber: null,
    guessedSaboteurs: []
};

const SETTINGS = { //constraints, basically
    minPlayers: 3,
    maxPlayers: 10,
    twoSaboteurMinPlayers: 6, //at what amount of players does 2 sabs unlock
    minGuess: 1,
    maxGuess: 10
};

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
  transport: ["Car","Truck","Van","Bus","Taxi","Uber","Train","Subway","Metro","Tram"],
};


let cardRevealed = false;

/* ==========================
    Initalization
========================== */

initialize();

function initialize() {
    handleSetupUpdates();
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

rerollPromptBtn.addEventListener("click", rerollPrompt);
discussionNextBtn.addEventListener("click", showGuessScreen);

submitGuessBtn.addEventListener("click", submitGuess);
document.getElementById("guess-plus").addEventListener("click", () => adjustGuessNumber(1));
document.getElementById("guess-minus").addEventListener("click", () => adjustGuessNumber(-1));

saboteurInfoBtn.addEventListener("click", openModal);
modalAckBtn.addEventListener("click", closeModal);
newGameBtn.addEventListener("click", resetGame);

saboteurModal.addEventListener("click", function(event) {
    if (event.target === saboteurModal) {
        closeModal();
    }
});

randomizePlayersBtn.addEventListener("click", () => {
    randomizePlayersBtn.classList.toggle("active-random");
    const selectorWrap = document.getElementById("saboteur-selector-wrap");

    if (randomizePlayersBtn.classList.contains("active-random")) {
        selectorWrap.classList.add("hidden");
        game.saboteurCount = "random";
    } else {
        selectorWrap.classList.remove("hidden");
        game.saboteurCount = parseInt(saboteurInput.value, 10);
    }
    validateSetup();
});

/* ==========================
    Screen Function
========================== */
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
        randomizePlayersBtn.classList.remove("hidden");

        if(randomizePlayersBtn.classList.contains("active-random")) {
            selectorWrap.classList.add("hidden");
        } else {
            selectorWrap.classList.remove("hidden");
        }
    } else {
        saboteurInput.value = 1; //default value if player count is below 6
        game.saboteurCount = 1;
        saboteurPlusBtn.disabled = true;

        randomizePlayersBtn.classList.add("hidden");
        randomizePlayersBtn.classList.remove("active-random");
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

function startGame() {
    game.players = [];
    const nameInputs = playerInputs.querySelectorAll("input");
    nameInputs.forEach(input => {
        game.players.push(input.value.trim());
    });

    assignRoles();
    assignSecretNumber();

    game.currentPlayer = 0;
    cardRevealed = false;

    showCurrentPlayer();
    showScreen("role-screen");

}


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


/* ==========================
    Role Generation
========================== */
function assignRoles() {
    game.roles = [];

    let allIndices = [];
    for (let i = 1; i < game.playerCount; i++) {
        allIndices.push(i);
    }

    const guesserRandomIndex = Math.floor(Math.random() * allIndices.length); // one player is assigned guesser
    const guesserPlayerIndex = allIndices.splice(guesserRandomIndex, 1)[0];
    game.roles[guesserPlayerIndex] = "Guesser";

    let activeSaboteurTarget = game.saboteurCount; //game logic, 6+ players mean 2 or random sabs

    if (game.playerCount >= SETTINGS.twoSaboteurMinPlayers && randomizePlayersBtn.classList.contains("active-random")) {
        activeSaboteurTarget = Math.floor(Math.random() * 2) + 1;
        saboteurInput.value = activeSaboteurTarget;
    }

    let selectedSaboteurs = [];
    while (selectedSaboteurs.length < activeSaboteurTarget && allIndices.length > 0) {
        const sabRandomIndex = Math.floor(Math.random() * allIndices.length);
        const sabPlayerIndex = allIndices.splice(sabRandomIndex, 1)[0];
        selectedSaboteurs.push(sabPlayerIndex);
    }

    allIndices.forEach(playerIndex => {
        game.roles[playerIndex] = "Teammate";
    });

    selectedSaboteurs.forEach(playerIndex => {
        game.roles[playerIndex] = "Saboteur";
    });
}

function assignSecretNumber() {
    game.secretNumber = Math.floor(Math.random() * (SETTINGS.maxGuess - SETTINGS.minGuess + 1)) + SETTINGS.minGuess;
}


/* ==========================
    Game Generation
========================== */
function showCurrentPlayer() {
    const name = game.players[game.currentPlayer];
    currentPlayerName.textContent = name;

    flipCard.classList.remove("flipped");
    cardRevealed = false;

    const role = game.roles[game.currentPlayer];
    if (role == "Guesser") {
        roleBack.innerHTML =  `
            <h2 style="color: #ffb703;  -webkit-text-stroke: 1.5px #2b2b2b;"> You are the Guesser!</h2>
            <p style="margin-top:12px;"> You do not get to know the secret number. Listen closely to everyone's clues to uncover the truth!</p>
        `;
    } else if (role == "Saboteur") {
        roleBack.innerHTML =  `
            <h2 style="color: #e60012;  -webkit-text-stroke: 1.5px #2b2b2b;"> You are a Saboteur!</h2>
            <p style="margin-top:12px;"> Blend in with the crew and mislead the group! <br> The number target is: <strong>${game.secretNumber}</strong></p>
        `;
    } else {
        roleBack.innerHTML = `
            <h2> You are a Teammate!</h2>
            <p style="margin-top:12px;"> Help the Guesser know the secret number! <br> The number target is: <strong>${game.secretNumber}</strong></p>
        `;
    }
}

function handleCardFlip() {
    flipCard.classList.toggle("flipped");
    cardRevealed = flipCard.classList.contains("flipped");
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
    rerollPrompt();

    let potentialLeaders = [];
    game.roles.forEach((role, index) => {
        if (role !== "Guesser") {
            potentialLeaders.push(game.players[index]);
        }
    });

    const randomLeader = potentialLeaders[Math.floor(Math.random() * potentialLeaders.length)];

    // discussion promt message frame banner
    const discussionInstruction = document.querySelector("#discussion-screen .game-instruction") || document.createElement("p");
    discussionInstruction.className = "game-instruction";
    discussionInstruction.style.marginBottom = "16px";
    discussionInstruction.innerHTML = `🗣️ <strong>${randomLeader}</strong> must start the discussion phase!`;

    const discussionScreen = document.getElementById("discussion-screen");
    if (!document.querySelector("#discussion-screen .game-instruction")) {
        discussionScreen.insertBefore(discussionInstruction, discussionScreen.firstChild);
    }

    showScreen("discussion-screen");
}

function rerollPrompt() {
    if (prompts.length === 0) return;

    const randomIndex = Math.floor(Math.random()* prompts.length);
    const chosenPrompt = prompts[randomIndex];

    game.prompt = chosenPrompt;

    promptText.textContent = chosenPrompt.title;
    lowLabel.textContent = `1 - ${chosenPrompt.low}`;
    highLabel.textContent = `10 - ${chosenPrompt.high}`;
}

/* ==========================
    Guessing
========================== */
function showGuessScreen() {
    game.guessedNumber = 5;
    game.guessedSaboteurs = [];

    const guessInput = document.getElementById("guess-number");
    guessInput.value = "5";

    document.getElementById("guesser-count-error").classList.add("hidden");

    guessPrompt.innerHTML = `
        <p style="margin-bottom: 12px;">Review the discussion details for:<br><strong>"${game.prompt.title}"</strong></p>
        <div class="organized-hint-box">
            <span class="hint-pill low">[1]: ${game.prompt.low}</span>
            <span class="hint-pill high">[10]: ${game.prompt.high}</span>
        </div>
    `;

    likelihoodHint.innerHTML = "";
    
    buildSaboteurChoices();

    updateGuessValidation();

    showScreen("guess-screen");
}

function buildSaboteurChoices() {
    saboteurChoices.innerHTML = "";

    game.players.forEach((playerName, index) => {
        if (game.roles[index] === "Guesser") return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "player-btn";
        btn.textContent = playerName;
        btn.dataset.playerIndex = index;

        btn.addEventListener("click", function() {
            handleSaboteurSelection(btn, index);
        });
        saboteurChoices.appendChild(btn);
    });
}

function handleSaboteurSelection(buttonElement, playerIndex) { // If they tap an already highlighted player button, remove them from selection
    const maxAllowedSelection = game.saboteurCount;
    const arrayIndexPosition = game.guessedSaboteurs.indexOf(playerIndex);
    
    if(arrayIndexPosition > -1) {
        game.guessedSaboteurs.splice(arrayIndexPosition, 1);
        buttonElement.classList.remove("active");
    } else {
        if (game.guessedSaboteurs.length < maxAllowedSelection) {
            game.guessedSaboteurs.push(playerIndex);
            buttonElement.classList.add("active");
        } else if ( maxAllowedSelection === 1) {
            const previouslySelectedBtn = saboteurChoices.querySelector(".player-btn.active");
            if (previouslySelectedBtn) previouslySelectedBtn.classList.remove("active");

            game.guessedSaboteurs = [playerIndex];
            buttonElement.classList.add("active");
        }
    }
    updateGuessValidation();
}

function adjustGuessNumber(direction) {
    const guessInput = document.getElementById("guess-number");
    let currentVal = parseInt(guessInput.value, 10);

    if(isNaN(currentVal)) { // for if the tracker field currently stores an empty placeholder string character 
        currentVal = 5;
    } else {
        currentVal = currentVal + direction;
    }

    if(currentVal < SETTINGS.minGuess) currentVal = SETTINGS.minGuess;
    if(currentVal > SETTINGS.maxGuess) currentVal = SETTINGS.maxGuess;

    guessInput.value = currentVal;
    game.guessedNumber = currentVal;

    updateGuessValidation();
}

function updateGuessValidation() {
    const errorBlock = document.getElementById("guesser-count-error");

    const hasGuessedNumber = (game.guessedNumber !== null && !isNaN(game.guessedNumber));
    const hasGuessedCorrectSaboteurCount = (game.guessedSaboteurs.length === game.saboteurCount);

    if(game.guessedNumber === null) {
        errorBlock.classList.remove("hidden");
    } else {
        errorBlock.classList.add("hidden");
    }

    if(hasGuessedNumber && hasGuessedCorrectSaboteurCount) {
        submitGuessBtn.disabled = false;
    } else {
        submitGuessBtn.disabled = true;
    }
}
function submitGuess() {
    calculateWinner();

    showScreen("results-screen");
}

/* ==========================
    Results
========================== */
function calculateWinner() {
    const actualSaboteurIndices = [];
    game.roles.forEach((role,index) => {
        if (role === "Saboteur") {
            actualSaboteurIndices.push(index);
        }
    });

    const correctlyIdentifiedSaboteurs = game.guessedSaboteurs.every(index =>
        actualSaboteurIndices.includes(index)
    );
    const correctlyGuessedNumber = (game.guessedNumber === game.secretNumber);

    const saboteurNamesArray = actualSaboteurIndices.map(index => game.players[index]);
    saboteurName.textContent = saboteurNamesArray.join(", ");

    realNum.textContent = game.secretNumber;
    guessNum.textContent = game.guessedNumber;

    if (correctlyGuessedNumber || correctlyIdentifiedSaboteurs) {
        resultMessage.textContent = "Saboteurs Stopped! Teammates Win!";
        resultMessage.style.color = "var(--accent-primary)";
        resultText.textContent = correctlyGuessedNumber
            ? "The Guesser cracked the code and found the exact secret number!" 
            : "The Guesser successfully exposed the secret Saboteur(s)!";
    } else {
        resultMessage.textContent = "Saboteurs Win!";
        resultMessage.style.color = "#e60012";
        resultText.textContent = "The Saboteurs successfully threw everyone off the scent and remained hidden!";
    }
}

function playAgain() {
    assignRoles();
    assignSecretNumber();

    game.currentPlayer = 0;
    cardRevealed = false;

    showCurrentPlayer();
    showScreen("role-screen");
}

function openModal() {
    saboteurModal.classList.remove("hidden");
}

function closeModal() {
    saboteurModal.classList.add("hidden");
}

function resetGame() {
    game.playerCount = 4;
    game.saboteurCount = 1;
    game.players = [];
    game.roles = [];
    game.prompt = null;
    game.secretNumber = null;
    game.currentPlayer = 0;
    game.guessedNumber = null;
    game.guessedSaboteurs = [];

    playerCountInput.value = 4;
    saboteurInput.value = 1;

    handleSetupUpdates();
    const inputs = playerInputs.querySelectorAll("input"); //clear names when New Game starts
    inputs.forEach(input => { input.value =""; });

    randomizePlayersBtn.classList.remove("active-random");

    showScreen("setup-screen");
}

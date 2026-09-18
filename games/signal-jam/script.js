/* ==========================
    Elements
========================== */
const screens = document.querySelectorAll(".screen");
const screenTitle = document.getElementById("screen-title");

//Setup Screen
const playerCountInput = document.getElementById("player-count");
const playerCountError = document.getElementById("player-count-error");

const playersMinusBtn = document.getElementById("players-minus");
const playersPlusBtn = document.getElementById("players-plus");

const timerToggleBtn = document.getElementById("timer-toggle-btn");
const timerDurationWrap = document.getElementById("timer-duration-wrap");
const timerDisabledHint = document.getElementById("timer-disabled-hint");
const roundDurationInput = document.getElementById("round-duration");
const durationMinusBtn = document.getElementById("duration-minus");
const durationPlusBtn = document.getElementById("duration-plus");

const playerInputs = document.getElementById("player-inputs");
const startGameBtn = document.getElementById("start-game-btn");

// Role Screen
const currentPlayerName = document.getElementById("current-player-name");
const flipCard = document.getElementById("flip-card");
const roleBack = document.getElementById("role-back");
const nextPlayerBtn = document.getElementById("next-player-btn");

// Transmission Screen
const timerDisplay = document.getElementById("timer-display");
const endRoundBtn = document.getElementById("end-round-btn");
const responseButtons = document.querySelectorAll(".response-btn");

const audioYes = document.getElementById("audio-yes");
const audioMaybe = document.getElementById("audio-maybe");
const audioNo = document.getElementById("audio-no");
const audioCorrect = document.getElementById("audio-correct");
const audioAlarm = document.getElementById("audio-alarm");

// Voting Screens
const jammerChoices = document.getElementById("jammer-choices");
const submitJammerBtn = document.getElementById("submit-jammer-btn");
const decoderChoices = document.getElementById("decoder-choices");
const submitDecoderBtn = document.getElementById("submit-decoder-btn");

// Results
const resultMessage = document.getElementById("result-message");
const resultText = document.getElementById("result-text");
const realSignal = document.getElementById("real-signal");
const jammerName = document.getElementById("jammer-name");
const decoderName = document.getElementById("decoder-name");
const playAgainBtn = document.getElementById("play-again-btn");
const newGameBtn = document.getElementById("new-game-btn");

/* ==========================
    Game State
========================== */
const game = {
    playerCount: 4,
    timerEnabled: true,
    roundDuration: 4,
    players: [],
    roles: [],
    secretSignal: null,
    currentPlayer: 0,
    remainingSeconds: 0,
    signalFound: false,
    guessedJammerIndex: null,
    jammerCorrectlyIdentified: false,
    guessedDecoderIndex: null,
    decoderCaught: false
};

const SETTINGS = { 
    minPlayers: 4,
    maxPlayers: 10,
    minDuration: 3,
    maxDuration: 15
};

let cardRevealed = false;

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
        wrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill player-input-icon" viewBox="0 0 16 16"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/></svg>`;

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

/* ==========================
    Timer stuff
========================== */

function increaseDuration() {
    let val = parseInt(roundDurationInput.value, 10) || SETTINGS.minDuration;
    if (val <  SETTINGS.maxDuration) {
        roundDurationInput.value = val +1;
        game.roundDuration = val + 1;
    }
}
function decreaseDuration(){
    let val = parseInt(roundDurationInput.value, 10) || SETTINGS.minDuration;
    if (val >  SETTINGS.minDuration) {
        roundDurationInput.value = val - 1;
        game.roundDuration = val - 1;
    }
}

timerToggleBtn.addEventListener("click", () => {
    game.timerEnabled = !game.timerEnabled;
    timerToggleBtn.setAttribute("aria-checked", String(game.timerEnabled));
    timerDurationWrap.classList.toggle("hidden", !game.timerEnabled);
    timerDisabledHint.classList.toggle("hidden", game.timerEnabled);
});

durationPlusBtn.addEventListener("click", increaseDuration);
durationMinusBtn.addEventListener("click", decreaseDuration);
playersPlusBtn.addEventListener("click", increasePlayers);
playersMinusBtn.addEventListener("click", decreasePlayers);
playerCountInput.addEventListener("click", handleSetupUpdates);
startGameBtn.addEventListener("click", startGame);

/* ==========================
    Role Generation
========================== */

const wordBank = [
    "Lighthouse", "Compass", "Telescope", "Anchor", "Satellite",
    "Volcano", "Glacier", "Origami", "Alcohol", "Cactus",
    "Umbrella", "Horse", "Windmill", "Gasoline", "Bonfire",
    "Backpack", "Bicycle", "Skateboard", "Snowman", "Tent",
    "Suitcase", "Camera", "Clock", "Guitar", "Piano",
    "Drum", "Microphone", "Headphones", "Television", "Computer",
    "Toothbrush", "Sunglasses", "Raincoat", "Sneakers", "Helmet",
    "Pillow", "Blanket", "Flashlight", "Candle", "Key",
    "Lock", "Wallet", "Water Bottle", "Lunchbox", "Pizza",
    "Hamburger", "Pancake", "Popcorn", "Ice Cream", "Watermelon",
    "Banana", "Apple", "Carrot", "Cookie", "Donut",
    "Sandwich", "Spaghetti", "Soup", "Chocolate", "Penguin",
    "Elephant", "Giraffe", "Dolphin", "Shark", "Turtle",
    "Rabbit", "Owl", "Butterfly", "Frog", "Monkey",
    "Castle", "Airport", "Library", "Museum", "Beach"
];

function startGame() {
    game.players = [];
    const nameInputs = playerInputs.querySelectorAll("input");
    nameInputs.forEach(input => game.players.push(input.value.trim()));

    assignRoles();
    assignSecretSignal();

    game.currentPlayer = 0;
    cardRevealed = false;

    showCurrentPlayer();
    showScreen("role-screen");

}

function assignRoles() {
    game.roles = [];
    let pool = [];
    for (let i = 0; i < game.playerCount; i++) pool.push(i); 

    const specialRoles = ["Operator", "Jammer", "Decoder"];
    specialRoles.forEach(role => {
        const randomIndex = Math.floor(Math.random()* pool.length);
        const playerIndex = pool.splice(randomIndex, 1)[0];
        game.roles[playerIndex] = role;
    });

   pool.forEach(playerIndex => {game.roles[playerIndex] = "Listener";});
}

function assignSecretSignal() {
    const randomIndex = Math.floor(Math.random() * wordBank.length);
    game.secretSignal = wordBank[randomIndex];
}

/* ==========================
    Role Reveal
========================== */
function showCurrentPlayer() {
    currentPlayerName.textContent = game.players[game.currentPlayer];
    flipCard.classList.remove("flipped");
    cardRevealed = false;

    const role = game.roles[game.currentPlayer];

    if (role === "Listener") {
        roleBack.innerHTML =  `
            <h2 style="color: var(--accent-primary);  -webkit-text-stroke: 1.5px #2b2b2b;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-antenna role-icon"><path d="M2 12 7 2"/><path d="m7 12 5-10"/><path d="m12 12 5-10"/><path d="m17 12 5-10"/><path d="M4.5 7h15"/><path d="M12 16v6"/></svg> 
                LISTENER 
            </h2>
            <p class="role-detail">Find the hidden Signal before transmission ends.</p>
        `;
    } else if (role === "Decoder") {
        roleBack.innerHTML =  `
            <h2 style="color: var(--accent-primary);  -webkit-text-stroke: 1.5px #2b2b2b;"> 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio role-icon"><path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/></svg>
                DECODER 
            </h2>
            <p class="role-detail">You know the hidden Signal: <strong>${game.secretSignal}</strong></p>
            <p class="role-detail">Help the Listeners find it, but don't let the Jammer discover who you are.</p>
        `;
    } else if (role === "Jammer") {
        roleBack.innerHTML =  `
            <h2 style="color: #e60012;  -webkit-text-stroke: 1.5px #2b2b2b;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio-off role-icon"><path d="M13.414 13.414a2 2 0 1 1-2.828-2.828"/><path d="M16.247 7.761a6 6 0 0 1 1.744 4.572"/><path d="M19.075 4.933a10 10 0 0 1 2.234 10.72"/><path d="m2 2 20 20"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/></svg>
                JAMMER 
            </h2>
            <p class="role-detail">You know the hidden Signal: <strong>${game.secretSignal}</strong></p>
            <p class="role-detail">Secretly mislead the group and prevent them from decoding it.</p>
        `;
    } else {
        roleBack.innerHTML = `
            <h2 style="color: var(--accent-primary); -webkit-text-stroke: 1.5px #2b2b2b;"> 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-satellite-dish role-icon"><path d="M18 12a6 6 0 00-6-6"/><path d="M2.824 10.459a8 8 0 0010.717 10.717c.558-.276.623-1.012.183-1.452l-9.448-9.448c-.44-.44-1.176-.375-1.452.183"/><path d="M22 12A10 10 0 0012 2"/><path d="m9 15 4-4"/></svg>
                OPERATOR
            </h2>
            <p class="role-detail">You control the transmission. Sucessfully broadcast the signal.</p>
            <p class="role-detail">Secret Signal: <strong>${game.secretSignal}</strong></p>
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

    if(game.currentPlayer < game.playerCount) {  
        showCurrentPlayer();
    } else {
        initializeTransmissionPhase();
    }
}

nextPlayerBtn.addEventListener("click", nextPlayer);
flipCard.addEventListener("click", handleCardFlip);

/* ==========================
    Transmission Screen
========================== */

let countdownInterval = null;

function initializeTransmissionPhase() {
    responseButtons.forEach(btn => btn.disabled = false);

    if (game.timerEnabled) {
        timerDisplay.classList.remove("hidden");
        endRoundBtn.classList.add("hidden");
        game.remainingSeconds = game.roundDuration * 60;
        updateTimerDisplay();
        countdownInterval = setInterval(tickCountdown, 1000);
    } else {
        timerDisplay.classList.add("hidden");
        endRoundBtn.classList.remove("hidden");
    }

    showScreen("transmission-screen");
}

function tickCountdown() {
    game.remainingSeconds--;
    updateTimerDisplay();

    if (game.remainingSeconds <= 10 ) {
        timerDisplay.classList.add("timer-urgent");
    }
    if (game.remainingSeconds <= 0) {
        clearInterval(countdownInterval);
        handleTimeExpired();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(game.remainingSeconds / 60);
    const seconds = game.remainingSeconds % 60;
    timerDisplay.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function handleTimeExpired() {
    game.signalFound = false;
    disabledResponseButtons();
    audioAlarm.currentTime = 0;
    audioAlarm.play();

    setTimeout(() => {
        showJammerGuessScreen();
    }, 1500);
}

function disabledResponseButtons() {
    responseButtons.forEach(btn => btn.disabled = true);
}

function handleResponseClick(responseType) {
    if (responseType === "correct") {
        game.signalFound = true;
        clearInterval(countdownInterval);
        disabledResponseButtons();
        audioCorrect.currentTime = 0;
        audioCorrect.play();

        setTimeout(() => {
            showDecoderGuessScreen();
        }, 1500);
        return;
    }

    const audioMap = {yes: audioYes, maybe: audioMaybe, no: audioNo };
    const audioEl = audioMap[responseType];
    if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play();
    }
}

responseButtons.forEach(btn => {
    btn.addEventListener("click", () => handleResponseClick(btn.dataset.response));
});

endRoundBtn.addEventListener("click", () => {
    disabledResponseButtons();
    showJammerGuessScreen();
});

/* ==========================
    Voting Screens
========================== */

function showJammerGuessScreen() {
    game.guessedJammerIndex = null;
    submitJammerBtn.disabled = true;
    buildJammerChoices();
    showScreen("triangulation-screen");
}

function buildJammerChoices() {
    jammerChoices.innerHTML = "";
    const operatorIndex = game.roles.indexOf("Operator");

    game.players.forEach((playerName, index) => {
        if (index === operatorIndex) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "player-btn";
        btn.textContent = playerName;

        btn.addEventListener("click", () => {
            jammerChoices.querySelectorAll(".player-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            game.guessedJammerIndex = index;
            submitJammerBtn.disabled = false;
        });
        jammerChoices.appendChild(btn);
    });
}

submitJammerBtn.addEventListener("click", () => {
    const jammerIndex = game.roles.indexOf("Jammer");
    game.jammerCorrectlyIdentified = (game.guessedJammerIndex === jammerIndex);

    if (game.jammerCorrectlyIdentified) {
        showDecoderGuessScreen();
    } else {
        showResultsScreen();
    }
});

function showDecoderGuessScreen() {
    game.guessedDecoderIndex = null;
    submitDecoderBtn.disabled = true;
    buildDecoderChoices();
    showScreen("interception-screen");
}

function buildDecoderChoices() {
    decoderChoices.innerHTML = "";
    const operatorIndex = game.roles.indexOf("Operator");
    const jammerIndex = game.roles.indexOf("Jammer");

    game.players.forEach((playerName, index) => {
        if (index === operatorIndex || index === jammerIndex) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "player-btn";
        btn.textContent = playerName;

        btn.addEventListener("click", () => {
            decoderChoices.querySelectorAll(".player-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            game.guessedDecoderIndex = index;
            submitDecoderBtn.disabled = false;
        });
        decoderChoices.appendChild(btn);
    });
}

submitDecoderBtn.addEventListener("click", () => {
    const decoderIndex = game.roles.indexOf("Decoder");
    game.decoderCaught = (game.guessedDecoderIndex === decoderIndex);
    showResultsScreen();
});

/* ==========================
    results
========================== */

function showResultsScreen() {
    const jammerIndex = game.roles.indexOf("Jammer");
    const decoderIndex= game.roles.indexOf("Decoder");

    realSignal.textContent = game.secretSignal;
    jammerName.textContent = game.players[jammerIndex];
    decoderName.textContent = game.players[decoderIndex];
    const listenersWin = !game.decoderCaught && (game.signalFound || game.jammerCorrectlyIdentified);

    if (listenersWin) {
        resultMessage.innerHTML = "TRANSMISSION SUCESSFUL";
        resultMessage.style.color = "var(--accent-primary)";
        resultText.textContent = game.signalFound
            ? "The group decoded the Signal and was not stopped by the Jammer." 
            : "The group could not decode the signal during transmission, but they correctly triangualted the Jammer's position!";
    } else {
        resultMessage.textContent = "TRANSMISSION JAMMED";
        resultMessage.style.color = "#ff4911";
        if (!game.signalFound && !game.jammerCorrectlyIdentified) {
            resultText.textContent = "Transmission time ran out and the Jammer's location was never uncovered";
        } else {
        resultText.textContent = "The Jammer struck back and correctly unmasked the Decoder!";
        }
    }
    showScreen("results-screen");
}

function playAgain() {
    assignRoles();
    assignSecretSignal();

    game.currentPlayer = 0;
    game.signalFound = false;
    game.guessedJammerIndex = null;
    game.jammerCorrectlyIdentified = false;
    game.guessedDecoderIndex = null;
    game.decoderCaught = false;
    cardRevealed = false;

    showCurrentPlayer();
    showScreen("role-screen");
}

function resetGame() {
    game.playerCount = 4;
    game.players = [];
    game.roles = [];
    game.secretSignal = null;
    game.currentPlayer = 0;
    game.remainingSeconds = 0;
    game.signalFound = false;
    game.guessedJammerIndex = null;
    game.jammerCorrectlyIdentified = false;
    game.guessedDecoderIndex = null;
    game.decoderCaught = false;

    playerCountInput.value = 4;

    handleSetupUpdates();
    const inputs = playerInputs.querySelectorAll("input"); 
    inputs.forEach(input => { input.value =""; });

    showScreen("setup-screen");
}

playAgainBtn.addEventListener("click", playAgain);
newGameBtn.addEventListener("click", resetGame);
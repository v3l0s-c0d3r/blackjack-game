// Initialize game state and audio elements
let player = JSON.parse(localStorage.getItem('blackjackPlayer')) || {
    name: "",
    chips: 250
};

let gameState = JSON.parse(localStorage.getItem('blackjackGameState')) || {
    firstCard: 0,
    secondCard: 0,
    cards: [],
    sum: 0,
    hasBlackJack: false,
    isAlive: false,
    message: ""
};

// Audio elements
const tadaSound = new Audio('assets/audio/tada-fanfare.mp3');
const cardSound = new Audio('assets/audio/card-sound.mp3');

// Game state variables
let firstCard = gameState.firstCard;
let secondCard = gameState.secondCard;
let cards = gameState.cards;
let sum = gameState.sum;
let hasBlackJack = gameState.hasBlackJack;
let isAlive = gameState.isAlive;
let message = gameState.message;

// DOM elements
let messageEl = document.getElementById("message-el");
let sumEl = document.querySelector("#sum");
let cardsEl = document.querySelector(".cards");
let playerEl = document.getElementById("player-el");
let blackjackDiv = document.getElementById("blackjack");

// Dynamic element references
let buttonsContainer = document.querySelector(".buttons");
let errorMsgContainer = null;

// Modal elements
const modal = document.createElement("div");
modal.className = "modal";
modal.innerHTML = `
    <div class="modal-content">
        <h2>Welcome to Blackjack!</h2>
        <p>Please enter your name to begin:</p>
        <input type="text" id="name-input" placeholder="Your first name:" maxlength="15">
        <button id="start-game-btn">START GAME</button>
    </div>
`;

// Check if player name exists, if not show modal
if (!player.name) {
    document.body.appendChild(modal);
    document.getElementById("start-game-btn").addEventListener("click", () => {
        const nameInput = document.getElementById("name-input").value.trim();
        if (nameInput) {
            player.name = nameInput;
            document.body.removeChild(modal);
            initializeUI();
            saveGameState();
        }
    });
} else {
    initializeUI();
}

// Initialize UI
function initializeUI() {
    playerEl.textContent = `${player.name}: $${player.chips}`;
    messageEl.textContent = hasBlackJack ? "You've got Blackjack!" : (message || "Want to play a round?");
    cardsEl.textContent = "Cards: ";
    sumEl.textContent = "Sum: ";

    if (player.chips <= 0) {
        handleZeroChips();
    } else {
        if (!buttonsContainer) {
            recreateButtons();
        }
        removeErrorMsg();
    }
}

// Dynamic DOM management
function createErrorMsg() {
    if (!errorMsgContainer) {
        errorMsgContainer = document.createElement("div");
        errorMsgContainer.className = "error-msg";
        
        const errorSpan = document.createElement("span");
        errorSpan.id = "error-el";
        errorSpan.textContent = "No cash left to play the game. Kindly fund your account.";
        
        errorMsgContainer.appendChild(errorSpan);
        blackjackDiv.insertBefore(errorMsgContainer, playerEl);
    }
}

function removeErrorMsg() {
    if (errorMsgContainer) {
        errorMsgContainer.remove();
        errorMsgContainer = null;
    }
}

function recreateButtons() {
    buttonsContainer = document.createElement("div");
    buttonsContainer.className = "buttons";
    
    const startButton = document.createElement("button");
    startButton.id = "start";
    startButton.textContent = "START GAME";
    startButton.onclick = startGame;
    
    const newCardButton = document.createElement("button");
    newCardButton.id = "newcard";
    newCardButton.textContent = "NEW CARD";
    newCardButton.onclick = newCard;
    
    const resetButton = document.createElement("button");
    resetButton.id = "reset";
    resetButton.textContent = "RESET";
    resetButton.onclick = resetGame;
    
    buttonsContainer.appendChild(startButton);
    buttonsContainer.appendChild(newCardButton);
    buttonsContainer.appendChild(resetButton);
    
    blackjackDiv.insertBefore(buttonsContainer, playerEl);
}

// Game logic functions
function handleZeroChips() {
    player.chips = 0;
    playerEl.textContent = `${player.name}: $0`;
    
    createErrorMsg();
    if (buttonsContainer) {
        buttonsContainer.remove();
        buttonsContainer = null;
    }
    
    saveGameState();
}

function saveGameState() {
    localStorage.setItem('blackjackPlayer', JSON.stringify(player));
    localStorage.setItem('blackjackGameState', JSON.stringify({
        firstCard,
        secondCard,
        cards,
        sum,
        hasBlackJack,
        isAlive,
        message
    }));
}

function getRandomCard() {
    let randomNumber = Math.floor(Math.random() * 12) + 1;
    return randomNumber > 10 ? 10 : randomNumber === 1 ? 11 : randomNumber;
}

function fireConfetti() {
    confetti({ particleCount: 220, angle: 60, spread: 70, origin: { x: 0 } });
    confetti({ particleCount: 220, angle: 120, spread: 70, origin: { x: 1 } });
    tadaSound.play();
}

function playCardSound() {
    if (player.chips > 0) {
        cardSound.currentTime = 0;
        cardSound.play();
    }
}

function startGame() {
    // Only allow starting a new game if not currently in a game
    if (!isAlive && !hasBlackJack && cards.length === 0) {
        firstCard = getRandomCard();
        secondCard = getRandomCard();
        cards = [firstCard, secondCard];
        sum = firstCard + secondCard;
        isAlive = true;
        playCardSound();
        renderGame();
    }
}

function renderGame() {
    cardsEl.textContent = "Cards: " + cards.join(" ");
    sumEl.textContent = "Sum: " + sum;

    if (sum <= 20) {
        message = "Do you want to draw a new card?";
        isAlive = true;
        hasBlackJack = false;
    } else if (sum === 21) {
        message = "You've got Blackjack!";
        hasBlackJack = true;
        isAlive = false;
        player.chips += 20;
        fireConfetti();
    } else {
        message = "You're out of the game!";
        isAlive = false;
        hasBlackJack = false;
        player.chips -= 15;
    }

    messageEl.textContent = message;
    playerEl.textContent = `${player.name}: $${player.chips}`;
    
    if (player.chips <= 0) {
        handleZeroChips();
    } else {
        saveGameState();
    }
}

function newCard() {
    // Only allow drawing new card if in active game and haven't won yet
    if (isAlive && !hasBlackJack && sum < 21) {
        const card = getRandomCard();
        sum += card;
        cards.push(card);
        playCardSound();
        renderGame();
    }
}

function resetGame() {
    firstCard = 0;
    secondCard = 0;
    cards = [];
    sum = 0;
    hasBlackJack = false;
    isAlive = false;
    message = "";
    
    messageEl.textContent = "Want to play a round?";
    cardsEl.textContent = "Cards: ";
    sumEl.textContent = "Sum: ";
    
    removeErrorMsg();
    if (!buttonsContainer) {
        recreateButtons();
    }
    
    saveGameState();
}

window.addEventListener('beforeunload', () => {
    if (!isAlive) {
        localStorage.removeItem('blackjackGameState');
    }
});

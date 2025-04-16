// Initialize game state
let player = JSON.parse(localStorage.getItem('blackjackPlayer')) || {
    name: "Melody",
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
let errorEl = document.getElementById("error-el");

// Initialize UI
playerEl.textContent = `${player.name}: $${player.chips}`;
messageEl.textContent = message || "Want to play a round?";
cardsEl.textContent = "Cards: ";
sumEl.textContent = "Sum: ";

// Check for zero chips on load
if (player.chips <= 0) {
    handleZeroChips();
}

function handleZeroChips() {
    player.chips = 0;
    playerEl.textContent = `${player.name}: $0`;
    errorEl.textContent = "No cash left to play the game. Kindly fund your account.";
    document.getElementById("start").style.display = "none";
    document.getElementById("newcard").style.display = "none";
    document.getElementById("reset").style.display = "none";
    document.getElementById("blackjack").style.height = "450px";
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
    if (randomNumber > 10) {
        return 10;
    } else if (randomNumber === 1) {
        return 11;
    } else {
        return randomNumber;
    }
}

function fireConfetti() {
    confetti({
        particleCount: 200,
        angle: 65,
        spread: 60,
        origin: { x: 0 }
    });
    confetti({
        particleCount: 200,
        angle: 130,
        spread: 60,
        origin: { x: 1 }
    });
}

function startGame() {
    if (!isAlive && cards.length === 0) {
        firstCard = getRandomCard();
        secondCard = getRandomCard();
        cards = [firstCard, secondCard];
        sum = firstCard + secondCard;
    }
    isAlive = true;
    renderGame();
}

function renderGame() {
    cardsEl.textContent = "Cards: ";
    for (let i = 0; i < cards.length; i++) {
        cardsEl.textContent += cards[i] + " ";
    }

    sumEl.textContent = "Sum: " + sum;

    if (sum <= 20) {
        message = "Do you want to draw a new card?";
        isAlive = true;
    } else if (sum === 21) {
        message = "You've got Blackjack!";
        hasBlackJack = true;
        player.chips += 20;
        fireConfetti();
    } else {
        message = "You're out of the game!";
        isAlive = false;
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
    if (isAlive === true && hasBlackJack === false) {
        let thirdCard = getRandomCard();
        sum += thirdCard;
        cards.push(thirdCard);
        renderGame();
    }
}

function resetGame() {
    firstCard = getRandomCard();
    secondCard = getRandomCard();
    cards = [firstCard, secondCard];
    sum = firstCard + secondCard;
    hasBlackJack = false;
    isAlive = false;
    message = "";
    
    messageEl.textContent = "Want to play a round?";
    cardsEl.textContent = "Cards: ";
    sumEl.textContent = "Sum: ";
    errorEl.textContent = "";
    
    document.getElementById("start").style.display = "inline-block";
    document.getElementById("newcard").style.display = "inline-block";
    document.getElementById("reset").style.display = "inline-block";
    document.getElementById("blackjack").style.height = "500px";
    
    saveGameState();
}

window.addEventListener('beforeunload', () => {
    if (!isAlive) {
        localStorage.removeItem('blackjackGameState');
    }
});
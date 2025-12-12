// ===== GAME STATE =====
let action = "start menu";
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let canClick = true;
let score = 0;
let matches = 0;
let gameScores = [];
let currentLevel = 1;
let gameTime = 120;
let timeRemaining = gameTime;
let gameActive = true;
let bonusTime = 1;
let cardsAnimating = false;
let bonusTimeFrozen = false;
let bonusTimeDelay = 0;
let bonusMethod = "add";
let lastBonusScore = 0;
let bonusesEarned = 0;
let timeBonusActive = false;
let eyeBonusActive = false;
let x2BonusActive = false;
let timeBonusRemaining = 0;
let x2BonusRemaining = 0;
let lastTickSecond = -1;
let pauseKeyPressed = false;
let baseScore = 0;
let multiplierBonus = 0;
let x2Bonus = 0;
let totalMatches = 0;
let levelScore = 0;
let levelMatchPoints = [];
let levelStartTime = performance.now();
let cardContainer = null;
let dt = 0;
let lastTime = new Date().getTime();
let muteState = false;

// ===== SOUND SYSTEM =====
let soundArray = ["good", "bad", "clue", "pickup", "tick", "complete"];
let loadedSounds = {};

function initSounds() {
    // console.log("Initializing sounds...");
    // console.log("Howler available:", typeof Howl !== 'undefined');
    
    soundArray.forEach(soundName => {
        try {
            loadedSounds[soundName] = new Howl({
                src: [`../../sounds/${soundName}.mp3`]
            });
            // console.log(`Sound loaded: ${soundName}`);
        } catch(e) {
            console.error(`Error loading sound ${soundName}:`, e);
        }
    });
    
    // console.log("Sound initialization complete. Total sounds:", Object.keys(loadedSounds).length);
}

function playSound(type) {
    if (!muteState && loadedSounds[type]) {
        loadedSounds[type].play();
    }
}

// ===== STAR THRESHOLDS =====
const starThresholds = [0, 18000, 26000, 32000, 38000];

// ===== CARD TYPES =====
const cardTypes = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
    '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
    '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞',
    '🐢', '🐍', '🦎', '🦀', '🦑', '🐙', '🦐', '🐠',
    '🐟', '🐡', '🐬', '🐳', '🐋'
];

// Jos card types (images)
const josCardTypes = [
    'images/jos/card1.png',
    'images/jos/card2.png',
    'images/jos/card3.png',
    'images/jos/card4.png',
    'images/jos/card5.png',
    'images/jos/card6.png',
    'images/jos/card7.png',
    'images/jos/card8.png',
    'images/jos/card9.png'
];

let useJosImages = false;
let josImagesPreloaded = false;

// Preload Jos images
function preloadJosImages() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const totalImages = josCardTypes.length;
        
        if (totalImages === 0) {
            resolve();
            return;
        }
        
        josCardTypes.forEach((src) => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    // console.log("All Jos images preloaded!");
                    josImagesPreloaded = true;
                    resolve();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            };
            img.src = src;
        });
    });
}

// ===== INITIALIZATION =====
function init() {
    console.log("Loading Memory game...");
    
    // Fade out loading screen
    const loadingBack = document.getElementById('loadingBack');
    const loadingImage = document.getElementById('loadingImage');
    
    // console.log("LoadingBack element:", loadingBack);
    // console.log("LoadingImage element:", loadingImage);
    
    if (loadingBack) {
        // console.log("Fading out loading screen...");
        if (typeof gsap !== 'undefined') {
            gsap.to(loadingBack, {
                opacity: 0,
                duration: 0.33,
                delay: 0.5,
                ease: "sine.out",
                onComplete: () => {
                    // console.log("Loading screen faded out");
                }
            });
        } else {
            // console.log("GSAP not available, setting opacity directly");
            setTimeout(() => {
                loadingBack.style.opacity = '0';
            }, 500);
        }
    }
    
    if (loadingImage) {
        if (typeof gsap !== 'undefined') {
            gsap.to(loadingImage, {
                opacity: 0,
                duration: 0.33,
                delay: 0.5,
                ease: "sine.out"
            });
        } else {
            setTimeout(() => {
                loadingImage.style.opacity = '0';
            }, 500);
        }
    }
    
    initSounds();
    // console.log("Sounds initialized");
    
    createTimer();
    // console.log("Timer created");
    
    createScoreDisplay();
    // console.log("Score display created");
    
    updateLevelDisplay();
    // console.log("Level display updated");
    
    updateBonusDisplay();
    // console.log("Bonus display updated");
    
    setupPlayButton();
    // console.log("Play button set up");
    
    setupInstructionsButton();
    // console.log("Instructions button set up");
    
    setupPauseListener();
    // console.log("Pause listener set up");
    
    // Check start menu visibility
    const startMenu = document.getElementById('startMenu');
    const startMenuContainer = document.getElementById('startMenuContainer');
    const splashImage = document.getElementById('splashImage');
    // console.log("Start menu elements:");
    // console.log("- startMenu:", startMenu, "display:", startMenu?.style.display || window.getComputedStyle(startMenu).display);
    // console.log("- startMenuContainer:", startMenuContainer, "opacity:", startMenuContainer?.style.opacity || window.getComputedStyle(startMenuContainer).opacity);
    // console.log("- splashImage:", splashImage);
    
    // console.log("=== INITIALIZATION COMPLETE ===");
    // console.log("Current action:", action);
    
    // Start update loop
    requestAnimationFrame(update);
}

// ===== UPDATE LOOP =====
function update() {
    // Calculate delta time
    const currentTime = new Date().getTime();
    dt = (currentTime - lastTime) / 1000;
    if (dt > 1) dt = 0;
    lastTime = currentTime;
    
    // Debug logging (only log occasionally to avoid spam)
    if (Math.random() < 0.01) {
        // console.log("Update loop running. Action:", action);
    }
    
    // Prevent scrolling
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    
    if (action === "start menu") {
        // Wait for play button
    } else if (action === "set up") {
        createCardGridForLevel(currentLevel);
        action = "go";
    } else if (action === "go") {
        // Clamp bonus time
        if (bonusTime < 1) bonusTime = 1;
        else if (bonusTime > 5) bonusTime = 5;
        
        updateBonusDisplay();
        
        // Update timer
        if (gameActive && timeRemaining > 0) {
            if (!cardsAnimating && !bonusTimeFrozen && !timeBonusActive && !eyeBonusActive) {
                timeRemaining -= dt;
                updateTimerDisplay();
            }
            
            // Update bonus time decay
            if (bonusTime > 1 && canClick && !cardsAnimating && !bonusTimeFrozen && !timeBonusActive && !eyeBonusActive) {
                if (bonusMethod === "add") {
                    bonusTime -= dt / 6.5;
                }
            }
            
            // Update bonus countdowns
            updateBonusCountdowns();
            
            // Play tick sound
            if (timeRemaining <= 10 && timeRemaining > 0) {
                const currentSecond = Math.floor(timeRemaining);
                if (currentSecond !== lastTickSecond) {
                    playSound("tick");
                    lastTickSecond = currentSecond;
                }
            }
            
            if (timeRemaining <= 0) {
                action = "end";
            }
        }
        
        updateTimeFreezeDisplay();
    } else if (action === "end") {
        endGame();
        action = "ended";
    } else if (action === "pause") {
        updateTimeFreezeDisplay();
    }
    
    requestAnimationFrame(update);
}

// ===== CARD GRID CREATION =====
function createCardGrid(cols, rows) {
    cardContainer = document.createElement('div');
    cardContainer.className = 'card-grid';
    cardContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: clamp(8px, 1.5vw, 15px);
        max-width: 480px;
        width: min(90vw, 480px);
        box-sizing: border-box;
        padding: 0;
        margin: 0;
        line-height: 0;
        z-index: 10;
    `;
    
    document.body.appendChild(cardContainer);
    
    cardsAnimating = true;
    fillCardGridWithMatches(cols * rows);
}

function createCard(cardType, cardId) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.cardId = cardId;
    card.dataset.cardType = cardType;
    card.style.cssText = `
        width: 100%;
        aspect-ratio: 3/4.5;
        position: relative;
        cursor: pointer;
        perspective: 1000px;
        transform-style: preserve-3d;
        margin: 0;
        padding: 0;
        line-height: 0;
        transform: translateX(${window.innerWidth + 200}px) rotate(-45deg);
    `;
    
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    cardBack.textContent = '?';
    const cardGradient = window.josCardGradient || 'linear-gradient(to bottom, #6BDFFF, #5BCFEF)';
    cardBack.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        background: ${cardGradient};
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 60px;
        font-weight: 400;
        color: white;
        font-family: 'Orelega One', cursive;
    `;
    
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transform: rotateY(180deg);
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
    `;
    
    // Use image or emoji based on scheme
    if (useJosImages && cardType.startsWith('images/')) {
        const img = document.createElement('img');
        img.src = cardType;
        img.style.cssText = `
            width: 70%;
            height: 70%;
            object-fit: contain;
        `;
        cardFront.appendChild(img);
    } else {
        cardFront.textContent = cardType;
    }
    
    card.appendChild(cardBack);
    card.appendChild(cardFront);
    
    card.addEventListener('click', () => handleCardClick(card));
    
    cards.push({
        element: card,
        type: cardType,
        id: cardId,
        isFlipped: false,
        isMatched: false
    });
    
    return card;
}

function fillCardGridWithMatches(totalCards) {
    const typesToUse = useJosImages ? josCardTypes : cardTypes;
    const availableTypes = [...typesToUse];
    const selectedTypes = [];
    const pairsNeeded = totalCards / 2;
    
    for (let i = 0; i < pairsNeeded; i++) {
        const randomIndex = Math.floor(Math.random() * availableTypes.length);
        const cardType = availableTypes[randomIndex];
        selectedTypes.push(cardType);
        availableTypes.splice(randomIndex, 1);
    }
    
    const cardPairs = [];
    for (let i = 0; i < selectedTypes.length; i++) {
        cardPairs.push(selectedTypes[i], selectedTypes[i]);
    }
    
    // Shuffle
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    
    // playSound("woosh1");
    
    for (let i = 0; i < cardPairs.length; i++) {
        const cardElement = createCard(cardPairs[i], i);
        cardContainer.appendChild(cardElement);
        
        gsap.to(cardElement, {
            x: 0,
            rotation: 0,
            duration: 0.5,
            delay: (i * 0.05),
            ease: "sine.inOut",
            onComplete: () => {
                if (i === cardPairs.length - 1) {
                    cardsAnimating = false;
                }
            }
        });
    }
    
    totalPairs = pairsNeeded;
}

function createCardGridForLevel(level) {
    let rows, cols;
    
    if (level === 1) {
        rows = 2; cols = 4;
    } else if (level === 2 || level === 3) {
        rows = 3; cols = 4;
    } else {
        rows = 4; cols = 4;
    }
    
    // console.log(`Creating card grid for level ${level}: ${cols}x${rows}`);
    createCardGrid(cols, rows);
}

// ===== CARD INTERACTION =====
function handleCardClick(cardElement) {
    if (!canClick) return;
    
    const cardId = parseInt(cardElement.dataset.cardId);
    const card = cards.find(c => c.id === cardId);
    
    if (!card || card.isFlipped || card.isMatched) return;
    
    flipCard(card);
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        canClick = false;
        
        if (flippedCards[0].type === flippedCards[1].type) {
            handleMatch();
        } else {
            setTimeout(() => {
                handleNoMatch();
            }, 500);
        }
    }
}

function flipCard(card) {
    card.isFlipped = true;
    // playSound("flip1");
    
    gsap.to(card.element, {
        rotationY: 180,
        duration: 0.1,
        ease: "power2.out"
    });
}

function flipCardBack(card) {
    card.isFlipped = false;
    // playSound("flip2");
    
    gsap.to(card.element, {
        rotationY: 0,
        duration: 0.1,
        ease: "power2.out"
    });
}

function handleMatch() {
    flippedCards.forEach(card => {
        card.isMatched = true;
    });
    
    matchedPairs++;
    matches++;
    totalMatches++;
    
    let basePoints = 100;
    let multiplierPoints = Math.round(100 * (bonusTime - 1));
    let totalPoints = basePoints + multiplierPoints;
    
    baseScore += basePoints;
    multiplierBonus += multiplierPoints;
    
    if (x2BonusActive) {
        let x2BonusAmount = totalPoints;
        x2Bonus += x2BonusAmount;
        totalPoints *= 2;
    }
    
    score += totalPoints;
    levelScore += totalPoints;
    levelMatchPoints.push(totalPoints);
    
    playSound("good");
    showScorePopup(totalPoints);
    checkForBonusButton();
    
    if (bonusMethod === "add") {
        bonusTime += .5;
    }
    
    if (matchedPairs >= totalPairs) {
        bonusTimeFrozen = true;
    }
    
    updateScoreDisplay();
    updateBonusDisplay();
    
    flippedCards = [];
    canClick = true;
    
    if (matchedPairs === totalPairs) {
        handleGameComplete();
    }
}

function handleNoMatch() {
    flippedCards.forEach(card => {
        flipCardBack(card);
    });
    
    updateBonusDisplay();
    flippedCards = [];
    canClick = true;
}

function handleGameComplete() {
    gameScores.push(levelScore);
    playSound("complete");
    
    const fader = document.getElementById('fader');
    if (fader) {
        fader.style.opacity = '0.5';
        setTimeout(() => {
            gsap.to(fader, {
                opacity: 0,
                duration: 0.5,
                ease: "sine.inOut"
            });
        }, 500);
    }
    
    setTimeout(() => {
        animateCardsOut();
    }, 750);
}

function animateCardsOut() {
    cardsAnimating = true;
    
    if (cardContainer) {
        cardContainer.style.overflow = 'visible';
        cardContainer.style.position = 'fixed';
        cardContainer.style.zIndex = '1000';
    }
    
    cards.forEach((card, index) => {
        card.element.style.position = 'relative';
        card.element.style.zIndex = '1001';
        
        gsap.to(card.element, {
            x: -window.innerWidth - 500,
            rotation: 45,
            duration: 0.8,
            delay: index * 0.02,
            ease: "sine.inOut",
            onComplete: () => {
                if (index === cards.length - 1) {
                    cardsAnimating = false;
                    startNextLevel();
                }
            }
        });
    });
}

function startNextLevel() {
    if (cardContainer) {
        cardContainer.remove();
    }
    
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    totalPairs = 0;
    canClick = true;
    matches = 0;
    bonusTimeFrozen = false;
    bonusTimeDelay = 0;
    
    levelScore = 0;
    levelMatchPoints = [];
    levelStartTime = performance.now();
    
    currentLevel++;
    updateLevelDisplay();
    
    action = "set up";
}

// ===== UI UPDATES =====
function createTimer() {
    updateTimerDisplay();
}

function createScoreDisplay() {
    updateScoreDisplay();
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timeDisplay');
    if (timerElement) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = Math.floor(timeRemaining % 60);
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('scoreDisplay');
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

function updateLevelDisplay() {
    const levelElement = document.getElementById('levelDiv');
    if (levelElement) {
        levelElement.textContent = `LEVEL: ${currentLevel}`;
    }
}

function updateBonusDisplay() {
    const bonusDisplay = document.getElementById('bonusDisplay');
    
    if (bonusDisplay) {
        let bonusText = `BONUS: x${bonusTime.toFixed(1)}`;
        // Check if double points is active and append it
        if (x2BonusRemaining > 0) {
            bonusText += ' • DOUBLE POINTS';
        }
        bonusDisplay.textContent = bonusText;
    }
}

function showScorePopup(points) {
    const scorePopup = document.getElementById('scorePopup');
    if (scorePopup) {
        scorePopup.textContent = `+${points}`;
        
        // Start position: lower and transparent
        gsap.set(scorePopup, {
            opacity: 0,
            y: 20
        });
        
        // Animate up and fade in
        gsap.to(scorePopup, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'quint.out'
        });
        
        // Fade out after delay
        gsap.to(scorePopup, {
            opacity: 0,
            duration: 0.1,
            delay: 0.6,
            ease: 'linear'
        });
    }
}

function updateBonusCountdowns() {
    if (timeBonusActive && timeBonusRemaining > 0) {
        if (!cardsAnimating && !eyeBonusActive) {
            timeBonusRemaining -= dt;
        }
        
        if (timeBonusRemaining <= 0) {
            timeBonusActive = false;
            timeBonusRemaining = 0;
        }
    }
    
    if (x2BonusActive && x2BonusRemaining > 0) {
        if (!cardsAnimating && !eyeBonusActive) {
            x2BonusRemaining -= dt;
        }
        
        if (x2BonusRemaining <= 0) {
            x2BonusActive = false;
            x2BonusRemaining = 0;
        }
    }
}

function updateTimeFreezeDisplay() {
    const timeFreezeDisplay = document.getElementById('timeFreezeDisplay');
    const x2BonusDisplay = document.getElementById('x2BonusDisplay');
    const timeDisplay = document.getElementById('timeDisplay');
    const windowHeight = window.innerHeight;
    
    if (timeFreezeDisplay) {
        if (timeBonusActive) {
            const timeLeft = Math.ceil(timeBonusRemaining);
            timeFreezeDisplay.textContent = `TIME FROZEN: ${Math.max(0, timeLeft)}`;
            // Only show timeFreezeDisplay if height >= 700px
            if (windowHeight >= 700) {
                timeFreezeDisplay.style.opacity = '1';
            } else {
                timeFreezeDisplay.style.opacity = '0';
            }
        } else {
            timeFreezeDisplay.style.opacity = '0';
        }
    }
    
    // Change timer background color when time is frozen (only when height < 700px)
    const scoreTimeContainer = document.getElementById('scoreTimeContainer');
    if (scoreTimeContainer && windowHeight < 700) {
        if (timeBonusActive) {
            scoreTimeContainer.style.background = '#ff4444';
        } else {
            scoreTimeContainer.style.background = 'linear-gradient(to bottom, #00d4ff, #0099cc)';
        }
    }
    
    if (x2BonusDisplay) {
        // Always hide x2BonusDisplay - we'll show it in bonusDisplay instead
        x2BonusDisplay.style.opacity = '0';
        
        // Update bonusDisplay to include DOUBLE POINTS when active
        const bonusDisplay = document.getElementById('bonusDisplay');
        if (bonusDisplay) {
            if (x2BonusActive) {
                // Get current bonus text and add DOUBLE POINTS if not already there
                let bonusText = bonusDisplay.textContent || `BONUS: x${bonusTime.toFixed(1)}`;
                if (!bonusText.includes('DOUBLE POINTS')) {
                    bonusText += ' • DOUBLE POINTS';
                }
                bonusDisplay.textContent = bonusText;
            } else {
                // Remove DOUBLE POINTS from bonusDisplay
                let bonusText = bonusDisplay.textContent || `BONUS: x${bonusTime.toFixed(1)}`;
                bonusDisplay.textContent = bonusText.replace(/ • DOUBLE POINTS.*/, '');
            }
        }
    }
}

// ===== BONUS BUTTONS =====
function checkForBonusButton() {
    let requiredPoints = bonusesEarned < 5 ? 1000 : 2000;
    
    if (score >= lastBonusScore + requiredPoints) {
        lastBonusScore = score;
        bonusesEarned++;
        addRandomBonusButton();
    }
}

function addRandomBonusButton() {
    const container = document.getElementById('bonusButtonContainer');
    if (container && container.children.length >= 3) return;
    
    const bonusTypes = ['timeBonus', 'eyeBonus', 'x2Bonus'];
    const randomType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    
    const bonusButton = document.createElement('img');
    bonusButton.className = 'bonusButton';
    bonusButton.dataset.type = randomType;
    
    switch(randomType) {
        case 'timeBonus':
            bonusButton.src = 'images/bonus_clock.png';
            break;
        case 'eyeBonus':
            bonusButton.src = 'images/bonus_eye.png';
            break;
        case 'x2Bonus':
            bonusButton.src = 'images/bonus_x2.png';
            break;
    }
    
    bonusButton.addEventListener('click', () => {
        useBonusButton(bonusButton, randomType);
    });
    
    if (container) {
        container.appendChild(bonusButton);
    }
}

function useBonusButton(button, type) {
    button.remove();
    
    switch(type) {
        case 'timeBonus':
            // playSound("agSpell_magic");
            activateTimeBonus();
            break;
        case 'eyeBonus':
            // playSound("answerlens");
            activateEyeBonus();
            break;
        case 'x2Bonus':
            // playSound("bonus1");
            activateX2Bonus();
            break;
    }
}

function activateTimeBonus() {
    timeBonusActive = true;
    timeBonusRemaining = 10;
    updateTimeFreezeDisplay();
}

function activateEyeBonus() {
    cards.forEach(card => {
        if (!card.isMatched) {
            card.element.style.transform = 'rotateY(180deg)';
        }
    });
    
    eyeBonusActive = true;
    
    setTimeout(() => {
        cards.forEach(card => {
            if (!card.isMatched && !card.isFlipped) {
                card.element.style.transform = 'rotateY(0deg)';
            }
        });
        eyeBonusActive = false;
    }, 2250);
}

function activateX2Bonus() {
    x2BonusActive = true;
    x2BonusRemaining = 10;
    updateTimeFreezeDisplay();
}

// ===== PLAY BUTTON =====
function setupPlayButton() {
    const playButton = document.getElementById('playButton');
    // console.log("Setting up play button. Element found:", !!playButton);
    
    if (playButton) {
        playButton.addEventListener('click', () => {
            // console.log("Play button clicked! Current action:", action);
            
            if (action === "start menu") {
                // playSound("brightClick");
                // console.log("Starting game...");
                
                const startMenu = document.getElementById('startMenu');
                if (startMenu) {
                    startMenu.style.display = 'none';
                }
                
                // Fade in HUD elements
                const scoreTimeContainer = document.getElementById('scoreTimeContainer');
                const bonusDisplay = document.getElementById('bonusDisplay');
                
                if (scoreTimeContainer) {
                    scoreTimeContainer.style.opacity = '0';
                    requestAnimationFrame(() => {
                        scoreTimeContainer.style.opacity = '1';
                    });
                }
                
                if (bonusDisplay) {
                    bonusDisplay.style.opacity = '0';
                    requestAnimationFrame(() => {
                        bonusDisplay.style.opacity = '1';
                    });
                }
                
                // console.log("Setting action to 'set up'");
                action = "set up";
            }
        });
    } else {
        console.error("Play button not found!");
    }
}

function setupInstructionsButton() {
    // Instructions are now shown on start menu, no need for overlay
}

function setupPauseListener() {
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'p' && !pauseKeyPressed) {
            pauseKeyPressed = true;
            
            if (action === "go") {
                action = "pause";
            } else if (action === "pause") {
                action = "go";
            }
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (event.key.toLowerCase() === 'p') {
            pauseKeyPressed = false;
        }
    });
}

// ===== END GAME =====
function endGame() {
    gameActive = false;
    // playSound("transitionLogo");
    playSound("complete");
    
    gameScores.push(levelScore);
    showGameOverScreen();
}

function showGameOverScreen() {
    if (cardContainer) {
        cardContainer.style.display = 'none';
    }
    
    const bonusButtonContainer = document.getElementById('bonusButtonContainer');
    if (bonusButtonContainer) bonusButtonContainer.style.display = 'none';
    
    const bonusDisplay = document.getElementById('bonusDisplay');
    if (bonusDisplay) bonusDisplay.style.display = 'none';
    
    const x2BonusDisplay = document.getElementById('x2BonusDisplay');
    if (x2BonusDisplay) x2BonusDisplay.style.display = 'none';
    
    const timeFreezeDisplay = document.getElementById('timeFreezeDisplay');
    if (timeFreezeDisplay) timeFreezeDisplay.style.display = 'none';
    
    const matchesScore = totalMatches * 100;
    const levelReached = currentLevel - 1;
    
    const statsArray = [
        ['Number of Matches', `${totalMatches} (${matchesScore})`],
        ['Match Multiplier Bonus', multiplierBonus],
        ['x2 Bonus', x2Bonus],
        ['Level Reached', levelReached]
    ];
    
    createFinalScoreOverlay(score, statsArray);
    
    // Calculate stars earned and save to local storage
    const starsEarned = calculateStarsFromScore(score);
    saveMemoryGameResult(score, starsEarned);
}

// Calculate stars from score
function calculateStarsFromScore(scoreValue) {
    let stars = 0;
    // starThresholds: [0, 18000, 26000, 32000, 38000]
    // 0 stars = < 0 (impossible, so minimum is 1)
    // 1 star = >= 0
    // 2 stars = >= 18000
    // 3 stars = >= 26000
    // 4 stars = >= 32000
    // 5 stars = >= 38000
    for (let i = starThresholds.length - 1; i >= 0; i--) {
        if (scoreValue >= starThresholds[i]) {
            stars = i + 1; // Add 1 because index 0 = 1 star, index 4 = 5 stars
            break;
        }
    }
    return stars;
}

// Save memory game result to local storage
function saveMemoryGameResult(finalScore, starsEarned) {
    const todayKey = getTodayKey();
    
    // Check if already played today BEFORE overwriting
    const previousStars = parseInt(localStorage.getItem(`memoryStars_${todayKey}`) || '0');
    const previousScore = parseInt(localStorage.getItem(`memoryScore_${todayKey}`) || '0');
    const wasComplete = localStorage.getItem(`memoryComplete_${todayKey}`) === 'true';
    
    // Check if this is a better result
    const isBetter = !wasComplete || finalScore > previousScore || starsEarned > previousStars;
    
    if (isBetter) {
        // Calculate star difference to add to totals
        const starDifference = wasComplete ? (starsEarned - previousStars) : starsEarned;
        
        // Update daily and total stars if there's a difference
        if (starDifference !== 0) {
    const currentDailyStars = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
    const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
    
            localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + starDifference));
            localStorage.setItem('totalStars', String(currentTotalStars + starDifference));
            
            // Award games played (1 point per game, only once per game)
            // Try parent window first (if in iframe), then current window
            const awardFn = (window.parent && window.parent.awardStars) ? window.parent.awardStars : (window.awardStars || null);
            if (awardFn) {
                awardFn(starDifference, 'memory');
            } else {
                // Fallback if awardStars not available - manually add usable stars
                const currentGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
                localStorage.setItem('gamesPlayed', String(Math.max(0, currentGamesPlayed + 1)));
                // Also add usable stars manually
                const currentUsableStars = parseInt(localStorage.getItem(`usableStars_${todayKey}`) || localStorage.getItem(`moveStars_${todayKey}`) || '0');
                localStorage.setItem(`usableStars_${todayKey}`, String(currentUsableStars + starDifference));
            }
        }
        
        // Always save the new score and stars if better
        localStorage.setItem(`memoryScore_${todayKey}`, String(finalScore));
        localStorage.setItem(`memoryStars_${todayKey}`, String(starsEarned));
        localStorage.setItem(`memoryComplete_${todayKey}`, 'true');
    }
    
    // Update parent window displays if accessible
    if (window.parent && window.parent.updateStarDisplay) {
        window.parent.updateStarDisplay();
    }
    if (window.parent && window.parent.updateWalletStars) {
        window.parent.updateWalletStars();
    }
    if (window.parent && window.parent.updateRivalStars) {
        window.parent.updateRivalStars();
    }
    if (window.parent && window.parent.updateHeaderStarCounter) {
        window.parent.updateHeaderStarCounter();
    }
    if (window.parent && window.parent.updateWalletStars2) {
        window.parent.updateWalletStars2();
    }
    if (window.parent && window.parent.updateCalendar) {
        window.parent.updateCalendar();
    }
    if (window.parent && window.parent.updateMemoryDisplay) {
        window.parent.updateMemoryDisplay();
    }
}

// Get today's key for local storage
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// ===== FINAL SCORE OVERLAY =====
function createFinalScoreOverlay(scoreValue, statsArray = []) {
    const overlay = document.createElement('div');
    overlay.className = 'finalScoreOverlay';
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'finalScoreContentContainer';
    
    const scoreText = document.createElement('div');
    scoreText.className = 'finalScoreText';
    scoreText.style.fontFamily = "'Sanchez', serif";
    scoreText.textContent = `${scoreValue.toLocaleString()}`;
    
    const statsContainer = document.createElement('div');
    statsContainer.className = 'finalScoreStatsContainer';
    
    const starDiv = document.createElement('div');
    starDiv.className = 'finalScoreStarDiv';
    
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('div');
        star.className = 'finalScoreStar';
        star.innerHTML = '★';
        star.style.color = '#808080';
        
        const threshold = starThresholds[i];
        const targetColor = (scoreValue >= threshold) ? '#FFD700' : '#808080';
        star.dataset.targetColor = targetColor;
        
        starDiv.appendChild(star);
    }
    
    statsContainer.appendChild(starDiv);
    
    const statsHeader = document.createElement('div');
    statsHeader.className = 'finalScoreStatsHeader';
    statsHeader.style.fontFamily = "'Sanchez', serif";
    statsHeader.style.color = '#555555';
    statsHeader.style.fontWeight = '400';
    statsHeader.textContent = 'GAME STATS';
    statsContainer.appendChild(statsHeader);
    
    const separatorLine = document.createElement('div');
    separatorLine.className = 'finalScoreStatsSeparator';
    statsContainer.appendChild(separatorLine);
    
    statsArray.forEach(statInfo => {
        const [label, count] = statInfo;
        const statItem = document.createElement('div');
        statItem.className = 'finalScoreStatItem';
        statItem.style.fontFamily = "'Sanchez', serif";
        statItem.style.color = '#555555';
        statItem.style.fontWeight = '400';
        statItem.textContent = `${label}: ${count}`;
        statsContainer.appendChild(statItem);
    });
    
    contentContainer.appendChild(scoreText);
    contentContainer.appendChild(statsContainer);
    
    const viewportHeight = window.innerHeight;
    const initialTop = (viewportHeight / 2) - 45;
    contentContainer.style.top = initialTop + "px";
    
    overlay.appendChild(contentContainer);
    document.body.appendChild(overlay);
    
    gsap.to(overlay, {
        duration: 0.8,
        opacity: 1,
        ease: "sine.out"
    });
    
    gsap.to(scoreText, {
        duration: .9,
        opacity: 1,
        scale: 1,
        ease: "back.out(4)"
    });
    
    createSparks(scoreText, 45, 10, 300);
    
    setTimeout(() => {
        const contentHeight = contentContainer.offsetHeight;
        const finalTop = (viewportHeight - contentHeight) / 2;
        
        gsap.to(contentContainer, {
            duration: 1,
            top: finalTop,
            ease: "sine.out"
        });
        
        gsap.to(statsContainer, {
            duration: 1,
            opacity: 1,
            delay: 1,
            ease: "sine.out",
            onComplete: () => {
                animateStars(starDiv);
            }
        });
    }, 3000);
    
    const fader = document.getElementById("fader");
    if (fader) {
        gsap.to(fader, { opacity: 0.5, duration: 0.1, ease: "linear" });
        gsap.to(fader, { opacity: 0, duration: 1, ease: "linear", delay: 0.1 });
    }
}

function animateStars(starDiv) {
    const stars = starDiv.querySelectorAll('.finalScoreStar');
    let currentStar = 0;
    
    const starsToLight = Array.from(stars).filter(star => 
        star.dataset.targetColor === '#FFD700'
    ).length;
    
    const lightNextStar = () => {
        if (currentStar < starsToLight && currentStar < stars.length) {
            const star = stars[currentStar];
            const targetColor = star.dataset.targetColor;
            
            gsap.to(star, {
                duration: 0.3,
                color: targetColor,
                scale: 1.8,
                ease: "back.out(1.7)",
                onComplete: () => {
                    gsap.to(star, {
                        duration: 0.3,
                        scale: 1,
                        ease: "power2.out"
                    });
                }
            });
            
            createSparks(star, 16, 4, 100);
            // playSound('brightClick');
            
            currentStar++;
            setTimeout(lightNextStar, 300);
        }
    };
    
    lightNextStar();
}

function createSparks(star, num, starScale, starDistance) {
    const starRect = star.getBoundingClientRect();
    const starCenterX = starRect.left + starRect.width / 2;
    const starCenterY = starRect.top + starRect.height / 2;
    
    for (let i = 0; i < num; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        
        const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
        const distance = 1 + Math.random() * starDistance;
        const sparkSize = 3 + Math.random() * starScale * 2;
        
        const endX = starCenterX + Math.cos(angle) * distance;
        const endY = starCenterY + Math.sin(angle) * distance;
        
        spark.style.cssText = `
            position: fixed;
            left: ${starCenterX}px;
            top: ${starCenterY}px;
            width: ${sparkSize}px;
            height: ${sparkSize}px;
            background: radial-gradient(circle at center, #FFD700 0%, #FFD700 40%, rgba(255, 215, 0, 0.3) 70%, rgba(255, 215, 0, 0) 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 17000;
            opacity: 1;
            transform: scale(1);
        `;
        
        document.body.appendChild(spark);
        
        gsap.to(spark, {
            duration: 0.8,
            x: endX - starCenterX,
            y: endY - starCenterY,
            scale: .1,
            opacity: 0,
            rotation: Math.random() * 720 - 360,
            ease: "sine.out",
            onComplete: () => {
                document.body.removeChild(spark);
            }
        });
    }
}

// Check URL parameters and apply color scheme
async function applyColorScheme() {
    const urlParams = new URLSearchParams(window.location.search);
    const scheme = urlParams.get('s');
    
    if (scheme === 'jos') {
        const josGradient = 'linear-gradient(to bottom, #fe5094, #ea327e)';
        const josCardGradient = 'linear-gradient(to bottom, #FF8C42, #FF6F3C)';
        
        // Set flag to use Jos images
        useJosImages = true;
        
        // Preload Jos images
        if (!josImagesPreloaded) {
            // console.log("Preloading Jos images...");
            await preloadJosImages();
        }
        
        // Update score time container
        const scoreTimeContainer = document.getElementById('scoreTimeContainer');
        if (scoreTimeContainer) {
            scoreTimeContainer.style.background = josGradient;
        }
        
        // Update play button
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.style.background = josGradient;
            
            // Update hover effect
            playButton.addEventListener('mouseenter', () => {
                playButton.style.boxShadow = '0 4px 12px rgba(254, 80, 148, 0.4)';
            });
            playButton.addEventListener('mouseleave', () => {
                playButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            });
        }
        
        // Update card backs
        window.josCardGradient = josCardGradient;
        const cardBacks = document.querySelectorAll('.card-back');
        cardBacks.forEach(cardBack => {
            cardBack.style.background = josCardGradient;
        });
    }
}

// ===== START GAME =====
// console.log("Memory.js loaded!");
// console.log("Document ready state:", document.readyState);
// console.log("GSAP available:", typeof gsap !== 'undefined');
// console.log("Howler available:", typeof Howl !== 'undefined');

if (document.readyState === 'loading') {
    // console.log("Waiting for DOMContentLoaded...");
    document.addEventListener('DOMContentLoaded', async () => {
        // console.log("DOMContentLoaded fired!");
        // console.log("GSAP in DOM:", typeof gsap !== 'undefined');
        // console.log("Howler in DOM:", typeof Howl !== 'undefined');
        await applyColorScheme();
        init();
    });
} else {
    // console.log("Document already loaded, initializing immediately");
    applyColorScheme().then(() => init());
}


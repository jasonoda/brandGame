// Game state
const WORD_LENGTH = 5;
const MAX_GUESSES = 13;
let targetWord = '';
let firstWord = '';
let lastWord = '';
let currentGuess = '';
let guesses = [];
let gameOver = false;
let validWords = new Set(); // Store valid words for quick lookup

// Local storage helper functions
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function isBeticleComplete() {
    const todayKey = getTodayKey();
    return localStorage.getItem(`beticleComplete_${todayKey}`) === 'true';
}

function markBeticleComplete() {
    const todayKey = getTodayKey();
    localStorage.setItem(`beticleComplete_${todayKey}`, 'true');
}

function addStars(count) {
    const todayKey = getTodayKey();
    
    // Check if already completed today
    const previousStars = parseInt(localStorage.getItem(`beticleStars_${todayKey}`) || '0');
    const wasComplete = localStorage.getItem(`beticleComplete_${todayKey}`) === 'true';
    
    // Only add stars if first play or if earned more stars
    const starDifference = wasComplete ? Math.max(0, count - previousStars) : count;
    
    if (starDifference > 0) {
        const currentDailyStars = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
        const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
        
        // Update daily stars
        localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + starDifference));
        
        // Update total stars
        localStorage.setItem('totalStars', String(currentTotalStars + starDifference));
        
        // Add move stars (same amount as regular stars)
        const currentMoveStars = parseInt(localStorage.getItem(`moveStars_${todayKey}`) || '0');
        localStorage.setItem(`moveStars_${todayKey}`, String(currentMoveStars + starDifference));
    }
    
    // Always update beticle stars to the new count (even if no star difference)
    localStorage.setItem(`beticleStars_${todayKey}`, String(count));
    
    // Update parent window star display if accessible
    if (window.parent && window.parent.updateStarDisplay) {
        window.parent.updateStarDisplay();
    }
    
    // Update wallet and rival displays if accessible
    if (window.parent && window.parent.updateWalletStars) {
        window.parent.updateWalletStars();
    }
    if (window.parent && window.parent.updateRivalStars) {
        window.parent.updateRivalStars();
    }
    
    // Update parent window beticle stars if accessible
    if (window.parent && window.parent.loadGameScores) {
        window.parent.loadGameScores();
    }
    
    // Update parent window calendar if accessible
    if (window.parent && window.parent.updateCalendar) {
        window.parent.updateCalendar();
    }
}

// Common 5-letter words that people would know (same as Mystery Word)
const commonWords = [
    'APPLE', 'BEACH', 'BRAIN', 'BREAD', 'CHAIR', 'CLOUD', 'DANCE', 'EARTH', 'FIELD', 'FLAME',
    'GLASS', 'GRASS', 'HEART', 'HOUSE', 'LIGHT', 'MUSIC', 'OCEAN', 'PAPER', 'PLANT', 'RIVER',
    'SMILE', 'SPACE', 'STONE', 'STORM', 'SUNNY', 'SWEET', 'TABLE', 'THING', 'TIGER', 'TRAIN',
    'WATER', 'WHEEL', 'WORLD', 'WRITE', 'YELLOW', 'YOUNG', 'ZEBRA', 'ANGEL', 'ARROW', 'BERRY',
    'BLOCK', 'BRAND', 'BRICK', 'CANDY', 'CROWN', 'DREAM', 'EAGLE', 'FENCE', 'FLASH', 'GHOST',
    'GREEN', 'HAPPY', 'HORSE', 'IMAGE', 'JELLY', 'KNIFE', 'LEMON', 'MAGIC', 'MOUSE', 'NIGHT',
    'PEACE', 'PHONE', 'PIZZA', 'QUEEN', 'QUIET', 'RADIO', 'ROBOT', 'SHARK', 'SHEEP', 'SNAKE',
    'SPEED', 'SPOON', 'STAMP', 'STICK', 'STONE', 'STORE', 'STORY', 'SWEET', 'SWING', 'THUMB',
    'TOAST', 'TOWER', 'TRACK', 'TRUCK', 'TRUTH', 'TWIST', 'UNITY', 'VALUE', 'VIBES', 'VIDEO',
    'VITAL', 'VOICE', 'WASTE', 'WATCH', 'WAVES', 'WHEAT', 'WHEEL', 'WHITE', 'WOMAN', 'WORLD',
    'WRITE', 'YACHT', 'YOUTH', 'ZEBRA', 
];

// Get today's target word - uses same word as Mystery Word
function getTargetWord() {
    const todayKey = getTodayKey();
    // Use a separate localStorage key from Mystery Word so they have different words
    const storedWord = localStorage.getItem(`beticleTarget_${todayKey}`);
    
    // If we already have a word for today, use it
    if (storedWord) {
        console.log('Beticle using stored target word:', storedWord);
        return storedWord;
    }
    
    // Otherwise, pick a random word from common words
    const randomIndex = Math.floor(Math.random() * commonWords.length);
    const selectedWord = commonWords[randomIndex];
    
    // Store it for today (using separate key from Mystery Word)
    localStorage.setItem(`beticleTarget_${todayKey}`, selectedWord);
    
    console.log('Beticle answer:', selectedWord);
    return selectedWord;
}

// Save game state to localStorage
function saveGameState() {
    const todayKey = getTodayKey();
    
    const gameState = {
        targetWord: targetWord,
        firstWord: firstWord,
        lastWord: lastWord,
        guesses: guesses,
        gameOver: gameOver
    };
    
    localStorage.setItem(`beticleState_${todayKey}`, JSON.stringify(gameState));
}

// Load game state from localStorage
function loadGameState() {
    const todayKey = getTodayKey();
    const savedState = localStorage.getItem(`beticleState_${todayKey}`);
    
    if (!savedState) return false;
    
    const gameState = JSON.parse(savedState);
    
    // Verify the target word matches
    if (gameState.targetWord !== targetWord) {
        // Clear invalid saved state
        localStorage.removeItem(`beticleState_${todayKey}`);
        return false;
    }
    
    // Restore guesses
    guesses = gameState.guesses || [];
    gameOver = gameState.gameOver;
    firstWord = gameState.firstWord || 'AAAAA';
    lastWord = gameState.lastWord || 'ZZZZZ';
    
    // Update boundary words if they've changed from defaults
    if (firstWord !== 'AAAAA') {
        updateBoundaryWord('top', firstWord);
    }
    if (lastWord !== 'ZZZZZ') {
        updateBoundaryWord('bottom', lastWord);
    }
    
    // If game is over (won or lost), show the target word in the guess row
    if (gameOver) {
        const tiles = document.querySelectorAll('[data-row="guess"]');
        tiles.forEach((tile, index) => {
            tile.textContent = targetWord[index];
            tile.classList.add('filled');
        });
        
        // If game was lost (max guesses reached), update hint and stars
        const won = guesses.some(g => g === targetWord);
        if (!won) {
            // Game was lost - show "out of guesses" and make all stars grey
            const hintElement = document.getElementById('proximityHint');
            if (hintElement) {
                hintElement.textContent = 'out of guesses';
                hintElement.style.opacity = '1';
            }
            
            // Make all stars grey
            const stars = document.querySelectorAll('.guess-star');
            stars.forEach(star => star.classList.add('grey'));
        }
    }
    
    // Update guess counter with loaded state
    updateGuessDisplay_Counter();
    
    // No longer rebuilding guess list
    
    return true;
}

// Load valid words list
async function loadWordList() {
    try {
        const response = await fetch('../words.txt');
        const text = await response.text();
        const words = text.split('\n').map(word => word.trim().toUpperCase()).filter(word => word.length === WORD_LENGTH);
        validWords = new Set(words);
    } catch (error) {
        console.error('Error loading word list:', error);
        // If word list fails to load, allow all words (fallback)
        validWords = new Set();
    }
}

// Initialize game
async function init() {
    console.log("Loading Beticle game...");
    await loadWordList();
    targetWord = getTargetWord();
    firstWord = 'AAAAA';
    lastWord = 'ZZZZZ';
    
    // Create the three word rows
    createWordRows();
    setupKeyboard();
    setupPhysicalKeyboard();
    setupHelpButton();
    setupPlayButton();
    handleResponsiveLayout();
    
    // Check if game is complete (won) or over (lost) by checking saved state
    const todayKey = getTodayKey();
    const savedState = localStorage.getItem(`beticleState_${todayKey}`);
    let gameIsDone = isBeticleComplete(); // Check if won
    if (!gameIsDone && savedState) {
        // Check if game is over (lost) by parsing saved state
        try {
            const gameState = JSON.parse(savedState);
            // Verify target word matches before checking gameOver
            if (gameState.targetWord === targetWord && gameState.gameOver === true) {
                gameIsDone = true;
            }
        } catch (e) {
            // Ignore parse errors
        }
    }
    
    // If game is done (won or lost), skip start menu and go straight to game
    if (gameIsDone) {
        const startMenu = document.getElementById('startMenu');
        const gameContainer = document.getElementById('gameContainer');
        
        if (startMenu) {
            startMenu.style.display = 'none';
        }
        
        if (gameContainer) {
            gameContainer.style.display = 'flex';
            // Handle responsive layout after container is visible
            setTimeout(() => {
                handleResponsiveLayout();
            }, 100);
        }
        
        // Load saved game state
        const hasLoadedState = loadGameState();
        
        // If game is over (won or lost), fade out keyboard and show appropriate message
        if (hasLoadedState && gameOver) {
            const keyboard = document.querySelector('.keyboard');
            if (keyboard) {
                keyboard.style.transition = 'opacity 0.5s ease';
                keyboard.style.opacity = '0';
            }
            // Check if game was won or lost
            const won = guesses.some(g => g === targetWord);
            if (won) {
                // Show win message after a delay and mark as shown
                setTimeout(() => {
                    console.log("1");
                    showWinMessage();
                    winMessageShownOnLoad = true;
                }, 600);
            }
            // If lost, the correct answer is already shown in loadGameState
        }
    }
}

// Setup play button
function setupPlayButton() {
    const playButton = document.getElementById('playButton');
    
    if (playButton) {
        playButton.addEventListener('click', () => {
            const startMenu = document.getElementById('startMenu');
            const gameContainer = document.getElementById('gameContainer');
            
            if (startMenu) {
                startMenu.style.display = 'none';
            }
            
            if (gameContainer) {
                gameContainer.style.display = 'flex';
                // Handle responsive layout after container is visible
                setTimeout(() => {
                    handleResponsiveLayout();
                }, 100);
            }
            
            // Load saved game state
            const hasLoadedState = loadGameState();
            
            // If game is over (won or lost), fade out keyboard and show appropriate message
            if (hasLoadedState && gameOver) {
                const keyboard = document.querySelector('.keyboard');
                if (keyboard) {
                    keyboard.style.transition = 'opacity 0.5s ease';
                    keyboard.style.opacity = '0';
                }
                // Check if game was won or lost
                const won = guesses.some(g => g === targetWord);
                if (won && isBeticleComplete()) {
                    // Show win message after a delay to ensure rendering is complete
                    setTimeout(() => {
                        console.log("2");
                        showWinMessage();
                        winMessageShownOnLoad = true;
                    }, 300);
                }
                // If lost, the correct answer is already shown in loadGameState
            }
        });
    }
}

// Create the three word rows
function createWordRows() {
    const topRow = document.getElementById('topWordRow');
    const guessRow = document.getElementById('guessRow');
    const bottomRow = document.getElementById('bottomWordRow');
    
    // Initialize guess counter
    updateGuessDisplay_Counter();
    
    // Create top row (AAAAA)
    topRow.innerHTML = '';
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.createElement('div');
        tile.className = 'letter-tile empty';
        tile.textContent = 'A';
        tile.dataset.row = 'top';
        tile.dataset.position = i;
        topRow.appendChild(tile);
    }
    
    // Create guess row (where user types)
    guessRow.innerHTML = '';
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = '';
        tile.dataset.row = 'guess';
        tile.dataset.position = i;
        guessRow.appendChild(tile);
    }
    
    // Create bottom row (ZZZZZ)
    bottomRow.innerHTML = '';
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.createElement('div');
        tile.className = 'letter-tile empty';
        tile.textContent = 'Z';
        tile.dataset.row = 'bottom';
        tile.dataset.position = i;
        bottomRow.appendChild(tile);
    }
}

// Setup keyboard clicks
function setupKeyboard() {
    const keys = document.querySelectorAll('.key');
    
    keys.forEach(key => {
        key.addEventListener('click', () => {
            const keyValue = key.dataset.key;
            handleKey(keyValue);
        });
    });
}

// Setup help button
function setupHelpButton() {
    const helpButton = document.getElementById('helpButton');
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            // Show start menu and hide game
            const startMenu = document.getElementById('startMenu');
            const gameContainer = document.getElementById('gameContainer');
            if (startMenu) startMenu.style.display = 'flex';
            if (gameContainer) gameContainer.style.display = 'none';
        });
    }
}

// Setup physical keyboard
function setupPhysicalKeyboard() {
    document.addEventListener('keydown', (e) => {
        if (gameOver) return;
        
        const key = e.key.toUpperCase();
        
        if (key === 'ENTER') {
            handleKey('ENTER');
        } else if (key === 'BACKSPACE') {
            handleKey('BACKSPACE');
        } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
            handleKey(key);
        }
    });
}

// Handle key press
function handleKey(key) {
    if (gameOver) return;
    
    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else {
        addLetter(key);
    }
}

// Add letter to current guess
function addLetter(letter) {
    if (currentGuess.length < WORD_LENGTH) {
        currentGuess += letter;
        updateGuessDisplay();
    }
}

// Delete last letter
function deleteLetter() {
    if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateGuessDisplay();
    }
}

// Update the guess input display
function updateGuessDisplay() {
    const tiles = document.querySelectorAll('[data-row="guess"]');
    tiles.forEach((tile, index) => {
        if (index < currentGuess.length) {
            tile.textContent = currentGuess[index];
            tile.classList.add('filled');
            tile.classList.remove('empty');
        } else {
            tile.textContent = '';
            tile.classList.remove('filled');
            tile.classList.remove('empty');
        }
    });
}

// Show warning message
function showWordWarning() {
    // Remove any existing warning
    const existingWarning = document.querySelector('.word-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    // Create warning message - use fixed positioning to avoid affecting layout
    const warning = document.createElement('div');
    warning.className = 'word-warning';
    warning.textContent = 'not on word list';
    
    // Set styles using setProperty to ensure they're applied
    warning.style.setProperty('position', 'fixed', 'important');
    warning.style.setProperty('top', '20px', 'important');
    warning.style.setProperty('left', '50%', 'important');
    warning.style.setProperty('transform', 'translateX(-50%)', 'important');
    warning.style.setProperty('background', '#ff4444', 'important');
    warning.style.setProperty('color', 'white', 'important');
    warning.style.setProperty('padding', '10px 20px', 'important');
    warning.style.setProperty('border-radius', '8px', 'important');
    warning.style.setProperty('font-family', 'Nunito, sans-serif', 'important');
    warning.style.setProperty('font-size', '14px', 'important');
    warning.style.setProperty('font-weight', '600', 'important');
    warning.style.setProperty('z-index', '10000', 'important');
    warning.style.setProperty('animation', 'fadeInOut 2s', 'important');
    warning.style.setProperty('pointer-events', 'none', 'important');
    warning.style.setProperty('margin', '0', 'important');
    warning.style.setProperty('box-sizing', 'border-box', 'important');
    
    // Use requestAnimationFrame to append without causing layout shift
    requestAnimationFrame(() => {
        document.documentElement.appendChild(warning);
    });
    
    // Remove after animation
    setTimeout(() => {
        if (warning.parentNode) {
            warning.remove();
        }
    }, 2000);
}

// Submit the current guess
function submitGuess() {
    if (currentGuess.length !== WORD_LENGTH) {
        // Not enough letters
        shakeGuessInput();
        return;
    }
    
    const guess = currentGuess.toUpperCase();
    
    // Check if word is in the valid words list
    if (validWords.size > 0 && !validWords.has(guess)) {
        shakeGuessInput();
        showWordWarning();
        return;
    }
    
    // Check if word is between boundaries
    if (guess <= firstWord || guess >= lastWord) {
        shakeGuessInput();
        return;
    }
    
    // Add guess to history
    guesses.push(guess);
    addGuessToList(guess, true);
    
    // Check if correct
    if (guess === targetWord) {
        gameOver = true;
        // Show the correct word in the guess row
        updateGuessDisplay();
        saveGameState();
        setTimeout(() => {
            celebrateWin();
        }, 500);
        return;
    }
    
    // Update boundary words with animation
    if (guess < targetWord) {
        // Word is before target, update top boundary
        firstWord = guess;
        animateGuessToRow('top', guess);
        updateProximityHint(guess, lastWord);
    } else {
        // Word is after target, update bottom boundary
        lastWord = guess;
        animateGuessToRow('bottom', guess);
        updateProximityHint(firstWord, guess);
    }
    
    // Update guess counter and stars
    updateGuessDisplay_Counter();
    
    // Check if max guesses reached
    if (guesses.length >= MAX_GUESSES) {
        gameOver = true;
        saveGameState();
        
        // Show the correct answer in the middle row
        const guessTiles = document.querySelectorAll('[data-row="guess"]');
        guessTiles.forEach((tile, index) => {
            tile.textContent = targetWord[index];
            tile.classList.add('filled');
        });
        
        // Update hint to show out of guesses
        const hintElement = document.getElementById('proximityHint');
        if (hintElement) {
            hintElement.textContent = 'out of guesses';
            hintElement.style.opacity = '1';
        }
        
        // Make all stars grey
        const stars = document.querySelectorAll('.guess-star');
        stars.forEach(star => star.classList.add('grey'));
    } else {
        // Save state after each guess
        saveGameState();
    }
    
    // Note: currentGuess is cleared in animateGuessToRow
}

// Animate guess to boundary row
function animateGuessToRow(targetRow, word) {
    const guessRow = document.getElementById('guessRow');
    const targetRowElement = document.getElementById(targetRow === 'top' ? 'topWordRow' : 'bottomWordRow');
    
    // Step 1: Create animated copy of guess row - don't clone, build from scratch
    const animatedRow = document.createElement('div');
    animatedRow.id = 'animatedGuessRow';
    animatedRow.className = guessRow.className;
    animatedRow.style.position = 'absolute';
    animatedRow.style.left = guessRow.offsetLeft + 'px';
    animatedRow.style.top = guessRow.offsetTop + 'px';
    animatedRow.style.width = guessRow.offsetWidth + 'px';
    animatedRow.style.zIndex = '100';
    animatedRow.style.display = 'flex';
    animatedRow.style.gap = '5px';
    
    // Create tiles with the word content
    for (let i = 0; i < word.length; i++) {
        const tile = document.createElement('div');
        tile.className = 'letter-tile filled';
        tile.textContent = word[i];
        tile.style.backgroundColor = 'white';
        tile.style.color = 'black';
        animatedRow.appendChild(tile);
    }
    
    guessRow.parentElement.appendChild(animatedRow);
    
    // Step 2: Clear the actual middle row immediately
    currentGuess = '';
    updateGuessDisplay();
    
    // Step 3: Get target position and animate
    const targetTop = targetRowElement.offsetTop;
    
    gsap.to(animatedRow, {
        top: targetTop + 'px',
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
            // Step 4: Update the actual target row
            updateBoundaryWord(targetRow, word);
            
            // Step 5: Fade out animated row
            gsap.to(animatedRow, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    animatedRow.remove();
                }
            });
        }
    });
}

// Update a boundary word (top or bottom)
function updateBoundaryWord(row, word) {
    const tiles = document.querySelectorAll(`[data-row="${row}"]`);
    tiles.forEach((tile, index) => {
        tile.textContent = word[index];
        tile.classList.remove('empty');
    });
}

// Calculate and display proximity hint
function updateProximityHint(topWord, bottomWord) {
    const hintElement = document.getElementById('proximityHint');
    if (!hintElement) {
        console.log('Hint element not found');
        return;
    }
    
    // Get all words between top and bottom
    const wordsArray = Array.from(validWords).sort();
    
    // Handle special cases for AAAAA and ZZZZZ
    let topIndex = topWord === 'AAAAA' ? 0 : wordsArray.indexOf(topWord);
    let bottomIndex = bottomWord === 'ZZZZZ' ? wordsArray.length - 1 : wordsArray.indexOf(bottomWord);
    const targetIndex = wordsArray.indexOf(targetWord);
    
    console.log('Proximity calculation:', { topWord, bottomWord, targetWord, topIndex, bottomIndex, targetIndex, totalWords: validWords.size });
    
    if (topIndex === -1 || bottomIndex === -1 || targetIndex === -1) {
        console.log('Word not found in array');
        hintElement.textContent = '';
        return;
    }
    
    // Calculate total words in range and position
    const totalWords = bottomIndex - topIndex;
    const positionFromTop = targetIndex - topIndex;
    const positionFromBottom = bottomIndex - targetIndex;
    
    // Calculate percentages
    const percentFromTop = (positionFromTop / totalWords) * 100;
    const percentFromBottom = (positionFromBottom / totalWords) * 100;
    
    // Determine message
    let message = '';
    if (percentFromTop < 10) {
        message = `extremely close to ${topWord}`;
    } else if (percentFromTop < 20) {
        message = `very close to ${topWord}`;
    } else if (percentFromTop < 35) {
        message = `closer to ${topWord}`;
    } else if (percentFromBottom < 10) {
        message = `extremely close to ${bottomWord}`;
    } else if (percentFromBottom < 20) {
        message = `very close to ${bottomWord}`;
    } else if (percentFromBottom < 35) {
        message = `closer to ${bottomWord}`;
    } else {
        message = `right in the middle of ${topWord} and ${bottomWord}`;
    }
    
    console.log('Proximity hint:', message);
    // Store original hint text
    originalHintText = message;
    hintElement.textContent = message;
    hintElement.style.opacity = '1';
    
    // Update hint display with guess count if counter is hidden
    updateHintWithGuessCount();
}

// Update guess counter and stars display
function updateGuessDisplay_Counter() {
    const guessNumber = document.getElementById('guessNumber');
    const stars = document.querySelectorAll('.guess-star');
    
    const guessesRemaining = MAX_GUESSES - guesses.length;
    
    if (guessNumber) {
        guessNumber.textContent = guessesRemaining;
    }
    
    // Update stars based on guesses remaining (to match the number in the circle)
    // If 0 guesses remaining (game lost), all stars should be grey
    let activeStars = 5;
    
    if (guessesRemaining === 0) {
        // Game lost - all stars grey
        activeStars = 0;
    } else if (guessesRemaining <= 1) {
        activeStars = 1;
    } else if (guessesRemaining <= 3) {
        activeStars = 2;
    } else if (guessesRemaining <= 6) {
        activeStars = 3;
    } else if (guessesRemaining <= 8) {
        activeStars = 4;
    } else {
        activeStars = 5;
    }
    
    console.log('Active stars:', activeStars);
    
    stars.forEach((star, index) => {
        if (index < activeStars) {
            star.classList.remove('grey');
        } else {
            star.classList.add('grey');
        }
    });
    
    // Update hint display with guess count if counter is hidden
    updateHintWithGuessCount();
}

// Add guess to the list with feedback (not used anymore but kept for compatibility)
function addGuessToList(guess, animate) {
    // No longer showing guess list
}

// Shake guess input animation
function shakeGuessInput() {
    const guessRow = document.getElementById('guessRow');
    if (!guessRow) return;
    
    gsap.killTweensOf(guessRow);
    gsap.set(guessRow, { x: 0 });
    
    gsap.fromTo(guessRow, 
        { x: -4 },
        { 
            x: 4,
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            ease: 'power1.inOut',
            onComplete: () => {
                gsap.set(guessRow, { x: 0 });
            }
        }
    );
}

// Celebrate win
function celebrateWin() {
    // Calculate stars based on guesses remaining BEFORE the winning guess
    // The winning guess is already in the array, so we need to add 1
    const guessesRemaining = MAX_GUESSES - guesses.length + 1;
    let starsEarned = 5;
    
    if (guessesRemaining <= 1) {
        starsEarned = 1;
    } else if (guessesRemaining <= 3) {
        starsEarned = 2;
    } else if (guessesRemaining <= 6) {
        starsEarned = 3;
    } else if (guessesRemaining <= 8) {
        starsEarned = 4;
    } else {
        starsEarned = 5;
    }

    console.log('Stars earned:', starsEarned);
    
    // Award stars first (before marking complete and saving beticle stars)
    addStars(starsEarned);
    
    // Save beticle stars to local storage
    const todayKey = getTodayKey();
    localStorage.setItem(`beticleStars_${todayKey}`, String(starsEarned));
    
    // Mark as complete
    markBeticleComplete();
    
    // Hide proximity hint
    const hintElement = document.getElementById('proximityHint');
    if (hintElement) {
        hintElement.style.opacity = '0';
    }
    
    // Fade out keyboard
    const keyboard = document.querySelector('.keyboard');
    if (keyboard) {
        keyboard.style.transition = 'opacity 0.5s ease';
        keyboard.style.opacity = '0';
    }
    
    // Show win message and stars
    setTimeout(() => {
        // console.log("3");
        showWinMessage();
    }, 300);
}

// Show win message
function showWinMessage() {
    console.log('>>> showWinMessage called in beticle.js');
    const gameContainer = document.querySelector('.game-container');
    const gameRows = document.getElementById('gameRows');
    
    // Remove any existing win message first
    const existingWin = gameContainer.querySelector('.beticle-win-container');
    if (existingWin) {
        existingWin.remove();
    }
    
    // Create container for message and stars
    const winContainer = document.createElement('div');
    winContainer.className = 'beticle-win-container';
    winContainer.style.position = 'absolute';
    winContainer.style.left = '50%';
    winContainer.style.transform = 'translateX(-50%)';
    winContainer.style.display = 'flex';
    winContainer.style.flexDirection = 'column';
    winContainer.style.alignItems = 'center';
    winContainer.style.zIndex = '100';
    winContainer.style.opacity = '0';
    
    // Create message
    const message = document.createElement('div');
    message.textContent = 'CORRECT!';
    message.style.fontSize = '16px';
    message.style.fontWeight = '700';
    message.style.fontFamily = "'Nunito', sans-serif";
    message.style.color = '#000';
    message.style.paddingTop = '15px';
    message.style.marginBottom = '3px';
    
    winContainer.appendChild(message);
    
    // Add stars display if screen height is less than 700px
    if (window.innerHeight < 700) {
        // Calculate stars based on guesses remaining (same logic as celebrateWin)
        const guessesRemaining = MAX_GUESSES - guesses.length + 1;
        let starsEarned = 5;
        
        if (guessesRemaining <= 1) {
            starsEarned = 1;
        } else if (guessesRemaining <= 3) {
            starsEarned = 2;
        } else if (guessesRemaining <= 6) {
            starsEarned = 3;
        } else if (guessesRemaining <= 8) {
            starsEarned = 4;
        } else {
            starsEarned = 5;
        }
        
        // Create stars display
        const stars = document.createElement('div');
        stars.style.fontSize = '18px';
        stars.style.letterSpacing = '0px';
        stars.style.display = 'flex';
        stars.style.gap = '0px';
        
        // Add earned stars (orange) and unearned stars (grey)
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            if (i < starsEarned) {
                star.style.color = '#FF8C42';
            } else {
                star.style.color = '#999';
            }
            stars.appendChild(star);
        }
        
        winContainer.appendChild(stars);
    }
    
    gameContainer.appendChild(winContainer);
    
    // Function to calculate and set position below game rows
    const positionWinMessage = () => {
        const gameRowsRect = gameRows.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        
        console.log('Positioning win message:', {
            gameRowsBottom: gameRowsRect.bottom,
            containerTop: containerRect.top,
            calculatedTop: gameRowsRect.bottom - containerRect.top + 15
        });
        
        // Only set position if both rects have valid dimensions
        if (gameRowsRect.height > 0 && containerRect.height > 0) {
            winContainer.style.top = `${gameRowsRect.bottom - containerRect.top + 15}px`;
        }
    };
    
    // Calculate and set position multiple times to ensure it's correct
    requestAnimationFrame(() => {
        positionWinMessage();
        requestAnimationFrame(() => {
            positionWinMessage();
            setTimeout(() => {
                positionWinMessage();
            }, 100);
            setTimeout(() => {
                positionWinMessage();
            }, 300);
            // Final positioning and then make visible
            setTimeout(() => {
                positionWinMessage();
                winContainer.style.transition = 'opacity 0.3s ease';
                winContainer.style.opacity = '1';
            }, 600);
        });
    });
}

// Show game over message
function showGameOver() {
    // Could add a game over overlay here
    // console.log("Game Over! The word was:", targetWord);
}


// Store original hint text
let originalHintText = '';

// Update hint display with guess count when counter is hidden
function updateHintWithGuessCount() {
    const hintElement = document.getElementById('proximityHint');
    const windowHeight = window.innerHeight;
    
    if (!hintElement) return;
    
    if (windowHeight < 630) {
        // Counter is hidden, append guess count
        const guessesRemaining = MAX_GUESSES - guesses.length;
        // Store original text if not already stored
        if (!originalHintText && hintElement.textContent && !hintElement.textContent.includes('GUESSES:')) {
            originalHintText = hintElement.textContent;
        }
        // Append guess count with bullet separator
        if (originalHintText) {
            hintElement.textContent = originalHintText + ' • GUESSES: ' + guessesRemaining;
        } else {
            hintElement.textContent = hintElement.textContent.replace(/ • GUESSES: \d+/, '') + ' • GUESSES: ' + guessesRemaining;
        }
    } else {
        // Counter is shown, restore original text
        if (originalHintText) {
            hintElement.textContent = originalHintText;
            originalHintText = '';
        } else {
            // Remove guess count if present
            hintElement.textContent = hintElement.textContent.replace(/ • GUESSES: \d+/, '');
        }
    }
}

// Handle responsive layout
function handleResponsiveLayout() {
    const guessCounter = document.getElementById('guessCounter');
    const gameRows = document.getElementById('gameRows');
    const windowHeight = window.innerHeight;
    
    if (windowHeight < 630) {
        // Hide guess counter
        if (guessCounter) {
            guessCounter.style.display = 'none';
        }
        // Adjust gameRows to center better when guess counter is hidden
        if (gameRows) {
            gameRows.style.transform = 'translateY(40px)';
        }
    } else {
        // Show guess counter
        if (guessCounter) {
            guessCounter.style.display = 'flex';
        }
        // Reset gameRows to original position when guess counter is shown
        if (gameRows) {
            gameRows.style.transform = 'translateY(-30px)';
        }
    }
    
    // Update hint display with guess count
    updateHintWithGuessCount();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Handle window resize
window.addEventListener('resize', () => {
    handleResponsiveLayout();
});

// Track if we've shown the win message on iframe visibility
let winMessageShownOnLoad = false;

// Listen for parent window telling us to show win message
window.addEventListener('message', (event) => {

    // Hide the win container first (no animation)
    const existingWin = document.querySelector('.beticle-win-container');
    if (existingWin) {
        existingWin.style.transition = 'none';
        existingWin.style.opacity = '0';
    }

    console.log('Beticle received message:', event.data);
    console.log('  - isBeticleComplete():', isBeticleComplete());
    console.log('  - gameOver:', gameOver);
    console.log('  - winMessageShownOnLoad:', winMessageShownOnLoad);
    
    if (event.data === 'beticleShown') {
        // Always check if we should show win message when iframe becomes visible
        if (isBeticleComplete() && gameOver) {
            console.log('✓ All conditions met! Showing win message in 400ms');
            setTimeout(() => {
                console.log("4");
                showWinMessage();
            }, 400);
        } else {
            console.log('✗ Conditions not met for showing win message');
            // If game is complete but gameOver is not set yet, try again after a delay
            if (isBeticleComplete() && !gameOver) {
                console.log('  → Game is complete but not loaded yet, retrying in 300ms');
                setTimeout(() => {
                    if (gameOver) {
                        console.log('  → Retry successful! Showing win message');
                        showWinMessage();
                    } else {
                        console.log('  → Retry failed, gameOver:', gameOver);
                    }
                }, 300);
            }
        }
    }
});


// Game state
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
let targetWord = '';
let currentRow = 0;
let currentTile = 0;
let gameOver = false;
let validWords = new Set(); // Store valid words for quick lookup

// Local storage helper functions
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function isMysteryWordComplete() {
    const todayKey = getTodayKey();
    return localStorage.getItem(`mysteryWordComplete_${todayKey}`) === 'true';
}

function markMysteryWordComplete() {
    const todayKey = getTodayKey();
    localStorage.setItem(`mysteryWordComplete_${todayKey}`, 'true');
}

function addStars(count) {
    const todayKey = getTodayKey();
    const currentDailyStars = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
    const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
    
    // Update daily stars
    localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + count));
    
    // Update total stars
    localStorage.setItem('totalStars', String(currentTotalStars + count));
    
    // Add move stars (same amount as regular stars)
    const currentMoveStars = parseInt(localStorage.getItem(`moveStars_${todayKey}`) || '0');
    localStorage.setItem(`moveStars_${todayKey}`, String(currentMoveStars + count));
    
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
    
    // Update parent window mystery word stars if accessible
    if (window.parent && window.parent.updateMysteryWordStars) {
        window.parent.updateMysteryWordStars();
    }
}

// Get target word based on URL parameter
function getTargetWord() {
    const urlParams = new URLSearchParams(window.location.search);
    const scheme = urlParams.get('s');
    
    if (scheme === 'jos') {
        return 'DONUT';
    } else if (scheme === 'goodValue') {
        return 'PRICE';
    } else {
        return 'PLACE';
    }
}

// Save game state to localStorage
function saveGameState() {
    const todayKey = getTodayKey();
    const guesses = [];
    
    // Collect all guesses from the grid
    for (let row = 0; row < currentRow; row++) {
        let guess = '';
        for (let col = 0; col < WORD_LENGTH; col++) {
            const tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            guess += tile.textContent;
        }
        guesses.push(guess);
    }
    
    const gameState = {
        targetWord: targetWord,
        guesses: guesses,
        currentRow: currentRow,
        gameOver: gameOver
    };
    
    localStorage.setItem(`mysteryWordState_${todayKey}`, JSON.stringify(gameState));
}

// Load game state from localStorage
function loadGameState() {
    const todayKey = getTodayKey();
    const savedState = localStorage.getItem(`mysteryWordState_${todayKey}`);
    
    if (!savedState) return false;
    
    const gameState = JSON.parse(savedState);
    
    // Verify the target word matches
    if (gameState.targetWord !== targetWord) {
        // Clear invalid saved state
        localStorage.removeItem(`mysteryWordState_${todayKey}`);
        return false;
    }
    
    // Restore guesses
    gameState.guesses.forEach((guess, rowIndex) => {
        // Fill in the letters
        for (let col = 0; col < WORD_LENGTH; col++) {
            const tile = document.querySelector(`[data-row="${rowIndex}"][data-col="${col}"]`);
            tile.textContent = guess[col];
            tile.classList.add('filled');
        }
        
        // Check and color the guess without animation
        checkGuess(guess, rowIndex, true);
    });
    
    // Restore game state
    currentRow = gameState.currentRow;
    currentTile = 0;
    gameOver = gameState.gameOver;
    
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
    console.log("Mystery Word game initializing...");
    await loadWordList();
    targetWord = getTargetWord();
    // console.log("Target word:", targetWord); // For debugging
    
    createGrid();
    setupKeyboard();
    setupPhysicalKeyboard();
    setupPlayButton();
    
    // If game is already complete, skip start menu and go straight to game
    if (isMysteryWordComplete()) {
        const startMenu = document.getElementById('startMenu');
        const gameContainer = document.getElementById('gameContainer');
        
        if (startMenu) {
            startMenu.style.display = 'none';
        }
        
        if (gameContainer) {
            gameContainer.style.display = 'flex';
        }
        
        // Load saved game state
        const hasLoadedState = loadGameState();
        
        // If game was won, fade out keyboard and show win message
        if (hasLoadedState && gameOver) {
            const keyboard = document.querySelector('.keyboard');
            if (keyboard) {
                keyboard.style.transition = 'opacity 0.5s ease';
                keyboard.style.opacity = '0';
            }
            // Show win message after a delay and mark as shown
            setTimeout(() => {
                console.log("1");
                showWinMessage();
                winMessageShownOnLoad = true;
            }, 600);
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
            }
            
            // Load saved game state
            const hasLoadedState = loadGameState();
            
            // If game was already won, fade out keyboard and show win message
            if (hasLoadedState && gameOver && isMysteryWordComplete()) {
                const keyboard = document.querySelector('.keyboard');
                if (keyboard) {
                    keyboard.style.transition = 'opacity 0.5s ease';
                    keyboard.style.opacity = '0';
                }
                // Show win message after a delay to ensure rendering is complete
                setTimeout(() => {
                    console.log("2");
                    showWinMessage();
                    winMessageShownOnLoad = true;
                }, 300);
            }
        });
    }
}

// Create the grid
function createGrid() {
    const grid = document.getElementById('grid');
    
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'grid-row';
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.row = i;
            tile.dataset.col = j;
            row.appendChild(tile);
        }
        
        grid.appendChild(row);
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

// Add letter to current tile
function addLetter(letter) {
    if (currentTile < WORD_LENGTH) {
        const tile = document.querySelector(`[data-row="${currentRow}"][data-col="${currentTile}"]`);
        tile.textContent = letter;
        tile.classList.add('filled');
        currentTile++;
    }
}

// Delete last letter
function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const tile = document.querySelector(`[data-row="${currentRow}"][data-col="${currentTile}"]`);
        tile.textContent = '';
        tile.classList.remove('filled');
    }
}

// Show warning message
function showWordWarning() {
    // Remove any existing warning
    const existingWarning = document.querySelector('.word-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    // Create warning message
    const warning = document.createElement('div');
    warning.className = 'word-warning';
    warning.textContent = 'not on word list';
    warning.style.cssText = 'position: fixed !important; top: 20px !important; left: 50% !important; transform: translateX(-50%) !important; background: #ff4444 !important; color: white !important; padding: 10px 20px !important; border-radius: 8px !important; font-family: Nunito, sans-serif !important; font-size: 14px !important; font-weight: 600 !important; z-index: 10000 !important; animation: fadeInOut 2s !important; pointer-events: none !important; margin: 0 !important; width: auto !important; height: auto !important; box-sizing: border-box !important;';
    
    // Append to document element to avoid affecting body layout
    document.documentElement.appendChild(warning);
    
    // Remove after animation
    setTimeout(() => {
        warning.remove();
    }, 2000);
}

// Submit the current guess
function submitGuess() {
    if (currentTile !== WORD_LENGTH) {
        // Not enough letters
        shakeTiles(currentRow);
        return;
    }
    
    // Get the guess
    let guess = '';
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
        guess += tile.textContent;
    }
    
    // Check if word is in the valid words list
    if (validWords.size > 0 && !validWords.has(guess.toUpperCase())) {
        shakeTiles(currentRow);
        showWordWarning();
        return;
    }
    
    // Check the guess
    checkGuess(guess);
    
    // Move to next row
    currentRow++;
    currentTile = 0;
    
    // Check if game is won or lost
    if (guess === targetWord) {
        gameOver = true;
        saveGameState();
        setTimeout(() => {
            celebrateWin();
        }, WORD_LENGTH * 400 + 300); // Wait for all flips to complete
    } else if (currentRow === MAX_GUESSES) {
        gameOver = true;
        saveGameState();
        setTimeout(() => {
            showGameOver();
        }, WORD_LENGTH * 400 + 300); // Wait for all flips to complete
    } else {
        // Save state after each guess
        saveGameState();
    }
}

// Check guess and color tiles
function checkGuess(guess, rowIndex = null, skipAnimation = false) {
    const row = rowIndex !== null ? rowIndex : currentRow;
    const guessArray = guess.split('');
    const targetArray = targetWord.split('');
    const results = new Array(WORD_LENGTH).fill('absent');
    const targetUsed = new Array(WORD_LENGTH).fill(false);
    
    // First pass: mark correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessArray[i] === targetArray[i]) {
            results[i] = 'correct';
            targetUsed[i] = true;
        }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (results[i] === 'correct') continue;
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            if (!targetUsed[j] && guessArray[i] === targetArray[j]) {
                results[i] = 'present';
                targetUsed[j] = true;
                break;
            }
        }
    }
    
    if (skipAnimation) {
        // Apply colors immediately without animation (for loading saved state)
        for (let i = 0; i < WORD_LENGTH; i++) {
            const tile = document.querySelector(`[data-row="${row}"][data-col="${i}"]`);
            tile.classList.add(results[i]);
        }
        // Update keyboard immediately
        updateKeyboard(guessArray, results);
    } else {
        // Apply colors to tiles with flip animation
        for (let i = 0; i < WORD_LENGTH; i++) {
            const tile = document.querySelector(`[data-row="${row}"][data-col="${i}"]`);
            
            setTimeout(() => {
                // Start flip animation
                tile.classList.add('flip');
                
                // Change color at midpoint of flip (when tile is at 90 degrees)
                setTimeout(() => {
                    tile.classList.add(results[i]);
                }, 300); // Half of the 600ms flip animation
                
                // Remove flip class after animation completes
                setTimeout(() => {
                    tile.classList.remove('flip');
                }, 600);
            }, i * 400); // Stagger each tile by 400ms
        }
        
        // Update keyboard colors
        setTimeout(() => {
            updateKeyboard(guessArray, results);
        }, WORD_LENGTH * 400);
    }
}

// Update keyboard key colors
function updateKeyboard(guessArray, results) {
    for (let i = 0; i < guessArray.length; i++) {
        const letter = guessArray[i];
        const result = results[i];
        const key = document.querySelector(`[data-key="${letter}"]`);
        
        if (key) {
            // Only update if the new state is better than current
            if (result === 'correct') {
                key.classList.remove('present', 'absent');
                key.classList.add('correct');
            } else if (result === 'present' && !key.classList.contains('correct')) {
                key.classList.remove('absent');
                key.classList.add('present');
            } else if (result === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
                key.classList.add('absent');
            }
        }
    }
}

// Shake tiles animation
function shakeTiles(row) {
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.querySelector(`[data-row="${row}"][data-col="${i}"]`);
        tile.style.animation = 'shake 0.5s';
        
        setTimeout(() => {
            tile.style.animation = '';
        }, 500);
    }
}

// Celebrate win
function celebrateWin() {
    const tiles = document.querySelectorAll(`[data-row="${currentRow - 1}"] .tile`);
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.style.animation = 'bounce 0.5s';
        }, index * 100);
    });
    
    // Mark as complete and award stars
    markMysteryWordComplete();
    addStars(3);
    
    // Fade out keyboard
    const keyboard = document.querySelector('.keyboard');
    if (keyboard) {
        setTimeout(() => {
            keyboard.style.transition = 'opacity 0.5s ease';
            keyboard.style.opacity = '0';
        }, 500);
    }
    
    // Show win message and stars
    setTimeout(() => {
        console.log("3");
        showWinMessage();
    }, 500);
}

// Show win message
function showWinMessage() {
    console.log('>>> showWinMessage called in mysteryWord.js');
    const gameContainer = document.querySelector('.game-container');
    const grid = document.getElementById('grid');
    
    // Remove any existing win message first
    const existingWin = gameContainer.querySelector('.mystery-word-win-container');
    if (existingWin) {
        existingWin.remove();
    }
    
    // Create container for message and stars
    const winContainer = document.createElement('div');
    winContainer.className = 'mystery-word-win-container';
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
    message.textContent = 'CORRECT';
    message.style.fontSize = '16px';
    message.style.fontWeight = '700';
    message.style.fontFamily = "'Nunito', sans-serif";
    message.style.color = '#000';
    message.style.paddingTop = '15px';
    message.style.marginBottom = '3px';
    
    // Create stars
    const stars = document.createElement('div');
    stars.textContent = '★★★';
    stars.style.fontSize = '18px';
    stars.style.color = '#FFB84D';
    stars.style.letterSpacing = '2px';
    
    winContainer.appendChild(message);
    winContainer.appendChild(stars);
    
    gameContainer.appendChild(winContainer);
    
    // Function to calculate and set position
    const positionWinMessage = () => {
        const gridRect = grid.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        
        console.log('Positioning win message:', {
            gridBottom: gridRect.bottom,
            containerTop: containerRect.top,
            calculatedTop: gridRect.bottom - containerRect.top + 15
        });
        
        // Only set position if both rects have valid dimensions
        if (gridRect.height > 0 && containerRect.height > 0) {
            winContainer.style.top = `${gridRect.bottom - containerRect.top + 15}px`;
        }
    };
    
    // Calculate and set position multiple times to ensure it's correct
    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
        positionWinMessage();
        requestAnimationFrame(() => {
            positionWinMessage();
            // Continue positioning but keep invisible
            setTimeout(() => {
                positionWinMessage();
            }, 100);
            setTimeout(() => {
                positionWinMessage();
            }, 300);
            // Final positioning and then make visible
            setTimeout(() => {
                positionWinMessage();
                // Make visible after all positioning is complete
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

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Track if we've shown the win message on iframe visibility
let winMessageShownOnLoad = false;

// Listen for parent window telling us to show win message
window.addEventListener('message', (event) => {

    // Hide the win container first (no animation)
    const existingWin = document.querySelector('.mystery-word-win-container');
    if (existingWin) {
        existingWin.style.transition = 'none';
        existingWin.style.opacity = '0';
    }

    console.log('Mystery word received message:', event.data);
    console.log('  - isMysteryWordComplete():', isMysteryWordComplete());
    console.log('  - gameOver:', gameOver);
    console.log('  - winMessageShownOnLoad:', winMessageShownOnLoad);
    
    if (event.data === 'mysteryWordShown') {
        // Always check if we should show win message when iframe becomes visible
        if (isMysteryWordComplete() && gameOver) {
            console.log('✓ All conditions met! Showing win message in 400ms');
            setTimeout(() => {
                console.log("4");
                showWinMessage();
            }, 400);
        } else {
            console.log('✗ Conditions not met for showing win message');
            // If game is complete but gameOver is not set yet, try again after a delay
            if (isMysteryWordComplete() && !gameOver) {
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


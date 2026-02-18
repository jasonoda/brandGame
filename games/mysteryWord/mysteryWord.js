// Game state
const WORD_LENGTH = 5;
const MAX_GUESSES = 5;
let targetWord = '';
let currentRow = 0;
let currentTile = 0;
let gameOver = false;
let validWords = new Set(); // Store valid words for quick lookup
let letterStatuses = {}; // Track best status for each letter: 'correct' > 'present' > 'absent'

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
    localStorage.setItem(`mysteryWordComplete_${todayKey}`, 'true');

    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'puzzleComplete',
            gameId: 'mysteryWord',
            stars: count,
            notes: [],
            delay: 1
        }, '*');
    }
}

// Get target word from gameVars
function getTargetWord() {
    const word = getMysteryWordTargetWord();
    console.log('Mystery Word answer:', word);
    return word;
}


// Load valid words list
async function loadWordList() {
    try {
        const response = await fetch('../../words.txt');
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
    console.log("Loading Mystery Word game...");
    const themeHintEl = document.getElementById('instructionThemeHint');
    if (themeHintEl && typeof getCurrentTheme === 'function') {
        themeHintEl.textContent = 'HINT: ' + getCurrentTheme().name.toUpperCase();
    } else if (themeHintEl) {
        themeHintEl.textContent = 'HINT: THANKSGIVING';
    }
    await loadWordList();
    targetWord = getTargetWord();
    // console.log("Target word:", targetWord); // For debugging
    
    // Reset letter statuses
    letterStatuses = {};
    
    createGrid();
    setupKeyboard();
    setupPhysicalKeyboard();
    setupHelpButton();
    setupPlayButton();
    
    // Set guess counter and grid opacity to 0 immediately before positioning
    const guessCounter = document.getElementById('guessCounter');
    const grid = document.getElementById('grid');
    if (guessCounter) {
        guessCounter.style.opacity = '0';
    }
    if (grid) {
        grid.style.opacity = '0';
    }
    
    updateGuessCounter();
    handleResponsiveLayout();
    
    // If game is already complete (won), skip start menu and go straight to game
    if (isMysteryWordComplete()) {
        const startMenu = document.getElementById('startMenu');
        const gameContainer = document.getElementById('gameContainer');
        
        if (startMenu) {
            startMenu.style.display = 'none';
        }
        
        if (gameContainer) {
            // Set guess counter and grid opacity to 0 BEFORE showing container
            const guessCounter = document.getElementById('guessCounter');
            const grid = document.getElementById('grid');
            if (guessCounter) {
                guessCounter.style.opacity = '0';
                guessCounter.style.transition = 'none'; // No transition during positioning
                guessCounter.style.visibility = 'hidden';
            }
            if (grid) {
                grid.style.opacity = '0';
                grid.style.transition = 'none';
                grid.style.visibility = 'hidden';
            }
            
            gameContainer.style.display = 'flex';
            // Handle responsive layout after container is visible
            setTimeout(() => {
                handleResponsiveLayout();
            }, 100);
        }
        
        // If game is complete (won), hide keyboard and guess counter completely
        if (isMysteryWordComplete()) {
            const keyboard = document.querySelector('.keyboard');
            const guessCounter = document.getElementById('guessCounter');
            if (keyboard) {
                keyboard.style.transition = 'opacity 0.5s ease';
                keyboard.style.opacity = '0';
            }
            if (guessCounter) {
                guessCounter.style.transition = 'opacity 0.5s ease';
                guessCounter.style.opacity = '0';
                // Hide it completely
                guessCounter.style.display = 'none';
            }
            // Show win message after a delay
            setTimeout(() => {
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
        let _mwClick = (function() { try { const a = new Audio(new URL('../../sounds/click.mp3', window.location.href).href); a.preload = 'auto'; a.load(); return a; } catch (e) { return null; } })();
        const playMwClick = () => { try { if (_mwClick) { _mwClick.currentTime = 0; _mwClick.play().catch(() => {}); } } catch (e) {} };
        playButton.addEventListener('click', () => {
            playMwClick();
            // Notify parent that Mystery Word has started (for quit warning logic)
            if (window.parent) {
                window.parent.postMessage('puzzleStarted:mysteryWord', '*');
            }

            const startMenu = document.getElementById('startMenu');
            const gameContainer = document.getElementById('gameContainer');
            
            if (startMenu) {
                startMenu.style.display = 'none';
            }
            
            if (gameContainer) {
                // Set guess counter and grid opacity to 0 BEFORE showing container
                const guessCounter = document.getElementById('guessCounter');
                const grid = document.getElementById('grid');
                if (guessCounter) {
                    guessCounter.style.opacity = '0';
                    guessCounter.style.transition = 'none'; // No transition during positioning
                    guessCounter.style.visibility = 'hidden';
                }
                if (grid) {
                    grid.style.opacity = '0';
                    grid.style.transition = 'none';
                    grid.style.visibility = 'hidden';
                }
                
                gameContainer.style.display = 'flex';
                // Handle responsive layout after container is visible
                setTimeout(() => {
                    handleResponsiveLayout();
                }, 100);
            }
            
            // Load saved game state
            const hasLoadedState = loadGameState();
            
            // If game is over (won or lost), hide keyboard and guess counter completely
            if (hasLoadedState && gameOver) {
                const keyboard = document.querySelector('.keyboard');
                const guessCounter = document.getElementById('guessCounter');
                if (keyboard) {
                    keyboard.style.transition = 'opacity 0.5s ease';
                    keyboard.style.opacity = '0';
                }
                if (guessCounter) {
                    guessCounter.style.transition = 'opacity 0.5s ease';
                    guessCounter.style.opacity = '0';
                    // Hide it completely
                    guessCounter.style.display = 'none';
                }
                // Show appropriate message after a delay to ensure rendering is complete
                setTimeout(() => {
                    if (isMysteryWordComplete()) {
                        // Game was won
                        showWinMessage();
                    } else {
                        // Game was lost
                        showGameOver();
                    }
                    winMessageShownOnLoad = true;
                }, 300);
            }
        });
    }
}

// Always lock grid and tiles to 60px so they never grow or shift (same size at all viewports)
function applyGridSizeLock() {
    const grid = document.getElementById('grid');
    if (!grid) return;
    const tiles = grid.querySelectorAll('.tile');
    const rows = grid.querySelectorAll('.grid-row');
    const gridWidth = 5 * 60 + 4 * 5 + 20;

    grid.style.width = gridWidth + 'px';
    grid.style.minWidth = gridWidth + 'px';
    grid.style.maxWidth = gridWidth + 'px';
    grid.style.gridTemplateRows = 'repeat(5, 60px)';
    rows.forEach(function (row) {
        row.style.gridTemplateColumns = 'repeat(5, 60px)';
    });
    tiles.forEach(function (tile) {
        tile.style.width = '60px';
        tile.style.height = '60px';
        tile.style.minWidth = '60px';
        tile.style.minHeight = '60px';
        tile.style.maxWidth = '60px';
        tile.style.maxHeight = '60px';
        tile.style.fontSize = '32px';
    });
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
    applyGridSizeLock();
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
    
    // Check if game is won or lost BEFORE moving to next row
    if (guess === targetWord) {
        gameOver = true;
        setTimeout(() => {
            celebrateWin();
        }, WORD_LENGTH * 400 + 300); // Wait for all flips to complete
        // Don't increment row or update counter - game is over
        return;
    } else if (currentRow === MAX_GUESSES - 1) {
        // This was the last guess (5th guess at row index 4)
        gameOver = true;
        setTimeout(() => {
            showGameOver();
        }, WORD_LENGTH * 400 + 300); // Wait for all flips to complete
        // Don't increment row or update counter - game is over
        return;
    }
    
    // Move to next row
    currentRow++;
    currentTile = 0;
    
    // Update guess counter
    updateGuessCounter();
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

// Update keyboard key colors based on letter statuses
function updateKeyboard(guessArray, results) {
    // Update letter statuses - correct > present > absent
    for (let i = 0; i < guessArray.length; i++) {
        const letter = guessArray[i];
        const status = results[i];
        
        // Only upgrade status (correct > present > absent)
        if (!letterStatuses[letter]) {
            letterStatuses[letter] = status;
        } else if (status === 'correct') {
            letterStatuses[letter] = 'correct';
        } else if (status === 'present' && letterStatuses[letter] !== 'correct') {
            letterStatuses[letter] = 'present';
        } else if (status === 'absent' && letterStatuses[letter] === 'absent') {
            // Keep absent if it's already absent
            letterStatuses[letter] = 'absent';
        }
    }
    
    // Apply colors to all keys based on their best status
    const allKeys = document.querySelectorAll('.key');
    allKeys.forEach(key => {
        const letter = key.getAttribute('data-key');
        if (letter && letterStatuses[letter]) {
            // Remove all status classes
            key.classList.remove('correct', 'present', 'absent', 'used');
            // Add the appropriate status class
            key.classList.add(letterStatuses[letter]);
        }
    });
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
// Position guess counter in the center of space between top and grid
function positionGuessCounter() {
    const guessCounter = document.getElementById('guessCounter');
    const grid = document.getElementById('grid');
    
    if (guessCounter && grid) {
        const gridRect = grid.getBoundingClientRect();
        const gridTop = gridRect.top;
        const topOfPage = 0;
        const centerY = (topOfPage + gridTop) / 2;
        
        guessCounter.style.top = centerY + 'px';
        guessCounter.style.transform = 'translate(-50%, -50%)';
    }
}

// Handle responsive layout
function handleResponsiveLayout() {
    applyGridSizeLock();
    const guessCounter = document.getElementById('guessCounter');
    const grid = document.getElementById('grid');
    const keyboard = document.querySelector('.keyboard');
    // Check if game is done (won)
    const todayKey = getTodayKey();
    const isComplete = localStorage.getItem(`mysteryWordComplete_${todayKey}`) === 'true';
    const gameDone = isComplete;
    
    // Hide guess counter (same as before for shifted-up layout)
    if (guessCounter) {
        guessCounter.style.display = 'none';
    }
    
    // Always center grid between top and keyboard (shift upwards) at all viewport heights
    if (grid && keyboard) {
        const keyboardRect = keyboard.getBoundingClientRect();
        const keyboardTop = keyboardRect.top;
        const topOfPage = 0;
        const centerY = (topOfPage + keyboardTop) / 2 - 30;
        
        grid.style.top = centerY + 'px';
        grid.style.transform = 'translate(-50%, -50%)';
        grid.style.opacity = '0';
        grid.style.transition = 'none';
        grid.style.visibility = 'hidden';
    }
    
    if (!gameDone) {
        if (grid) {
            setTimeout(() => {
                grid.style.visibility = 'visible';
                grid.style.transition = 'opacity 0.5s ease';
                grid.style.opacity = '1';
            }, 100);
        }
    } else {
        if (grid) {
            grid.style.visibility = 'visible';
            grid.style.opacity = '1';
        }
    }
}

// Update guess counter display
function updateGuessCounter() {
    const guessesLeft = MAX_GUESSES - currentRow;
    const guessNumberElement = document.getElementById('guessNumber');
    if (guessNumberElement) {
        guessNumberElement.textContent = guessesLeft;
    }
    
    // Update stars (5 stars for first guess, 4 for second, etc.)
    const starsEarned = 5 - currentRow;
    const starElements = document.querySelectorAll('.guess-star');
    starElements.forEach((star, index) => {
        if (index < starsEarned) {
            star.classList.remove('grey');
        } else {
            star.classList.add('grey');
        }
    });
    
    // Reposition after update (but keep opacity 0 if not already faded in)
    const guessCounter = document.getElementById('guessCounter');
    if (guessCounter && guessCounter.style.opacity !== '1') {
        guessCounter.style.opacity = '0';
        guessCounter.style.transition = 'none';
    }
    positionGuessCounter();
}

function celebrateWin() {
    const tiles = document.querySelectorAll(`[data-row="${currentRow - 1}"] .tile`);
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.style.animation = 'bounce 0.5s';
        }, index * 100);
    });
    
    markMysteryWordComplete();
    const starsEarned = 5 - currentRow;
    addStars(starsEarned);

    // Hide keyboard and guess counter completely
    const keyboard = document.querySelector('.keyboard');
    const guessCounter = document.getElementById('guessCounter');
    if (keyboard) {
        setTimeout(() => {
            keyboard.style.transition = 'opacity 0.5s ease';
            keyboard.style.opacity = '0';
        }, 500);
    }
    if (guessCounter) {
        // Hide the guess counter immediately (no fade)
        guessCounter.style.display = 'none';
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
    
    // Create stars based on guesses used
    const starsEarned = 5 - currentRow;
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
    // Hide keyboard and guess counter completely
    const keyboard = document.querySelector('.keyboard');
    const guessCounter = document.getElementById('guessCounter');
    if (keyboard) {
        setTimeout(() => {
            keyboard.style.transition = 'opacity 0.5s ease';
            keyboard.style.opacity = '0';
        }, 500);
    }
    if (guessCounter) {
        // Hide the guess counter immediately (no fade)
        guessCounter.style.display = 'none';
    }
    
    // Show game over message (same structure as win message)
    setTimeout(() => {
        const gameContainer = document.querySelector('.game-container');
        const grid = document.getElementById('grid');
        
        if (!gameContainer || !grid) return;
        
        // Remove any existing game over message first
        const existingGameOver = gameContainer.querySelector('.mystery-word-win-container');
        if (existingGameOver) {
            existingGameOver.remove();
        }
        
        // Create container for message and stars (same class as win message for consistency)
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
        
        // Create message - just the word, no "CORRECT" or "GAME OVER"
        const message = document.createElement('div');
        message.textContent = targetWord;
        message.style.fontSize = '16px';
        message.style.fontWeight = '700';
        message.style.fontFamily = "'Nunito', sans-serif";
        message.style.color = '#000';
        message.style.paddingTop = '15px';
        message.style.marginBottom = '3px';
        
        // Create stars - all 5 stars are grey
        const stars = document.createElement('div');
        stars.style.fontSize = '18px';
        stars.style.letterSpacing = '0px';
        stars.style.display = 'flex';
        stars.style.gap = '0px';
        
        // Add all 5 stars as grey
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = '#999'; // All grey
            stars.appendChild(star);
        }
        
        winContainer.appendChild(message);
        winContainer.appendChild(stars);
        
        gameContainer.appendChild(winContainer);
        
        // Function to calculate and set position (same as win message)
        const positionMessage = () => {
            const gridRect = grid.getBoundingClientRect();
            const containerRect = gameContainer.getBoundingClientRect();
            
            // Only set position if both rects have valid dimensions
            if (gridRect.height > 0 && containerRect.height > 0) {
                winContainer.style.top = `${gridRect.bottom - containerRect.top + 15}px`;
            }
        };
        
        // Calculate and set position multiple times to ensure it's correct
        // Use requestAnimationFrame to ensure layout is complete (same as win message)
        requestAnimationFrame(() => {
            positionMessage();
            requestAnimationFrame(() => {
                positionMessage();
                // Continue positioning but keep invisible
                setTimeout(() => {
                    positionMessage();
                }, 100);
                setTimeout(() => {
                    positionMessage();
                }, 300);
                // Final positioning and then make visible
                setTimeout(() => {
                    positionMessage();
                    // Make visible after all positioning is complete
                    winContainer.style.transition = 'opacity 0.3s ease';
                    winContainer.style.opacity = '1';
                }, 600);
            });
        });
    }, 500);
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

// Handle responsive layout on window resize
window.addEventListener('resize', () => {
    if (document.getElementById('gameContainer')?.style.display !== 'none') {
        handleResponsiveLayout();
    }
});

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


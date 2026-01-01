const phraseDisplay = document.getElementById('phraseDisplay');
const instructionLine = document.querySelector('.instruction-line');
const usesLine = document.querySelectorAll('.instruction-line')[1];
let selectionBoxes = document.querySelectorAll('.selection-box');
const nextLetterBtn = document.querySelector('.next-letter-btn');
const solveBtn = document.querySelector('.solve-btn');
const letterSelectionUI = document.querySelector('.letter-selection-ui');
const solveUI = document.querySelector('.solve-ui');
const solveTitle = document.querySelector('.solve-title');
const solveInput = document.getElementById('solveInput');
const solveUIBtn = document.querySelector('.solve-ui-btn');
const backBtn = document.querySelector('.back-btn');
const keyboard = document.querySelector('.keyboard');
const guessNumber = document.getElementById('guessNumber');
const shortGuessCounter = document.getElementById('shortGuessCounter');
const guessStars = document.getElementById('guessStars');
const guessStars2 = document.getElementById('guessStars2');
const gameContent = document.querySelector('.game-content');
const bottomSection = document.querySelector('.bottom-section');

let phrases = [];
let currentPhrase = '';
let letterBoxes = [];
let letterCounts = {}; // Map of letter to count
let goodArray = []; // Letters that appear at least once in the phrase
let zeroArray = []; // Letters that never appear in the phrase
let currentSelection = []; // Current letters shown
let lastSelectedLetter = ''; // Last letter that was selected
let isAnimating = false;
let keyboardClickHandlers = new Map(); // Store keyboard click handlers for cleanup
let currentTurn = 0; // Current turn number
let maxTurn = 15; // Maximum number of turns
let puzzleSolved = false; // Track if puzzle is solved
let isFirstSelection = true; // Track if this is the first selection

// Star threshold variables
const STAR_THRESHOLDS = {
    STAR_5: 5,  // < 5 turns = 5 stars
    STAR_4: 7,  // < 7 turns = 4 stars
    STAR_3: 10, // < 10 turns = 3 stars
    STAR_2: 12, // < 12 turns = 2 stars
    STAR_1: 15  // <= 15 turns = 1 star
};

// Vowels
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

// UI State constants
const UI_STATE = {
    GAMEPLAY: 'gameplay',
    SOLVE_UI: 'solve_ui',
    SOLVED: 'solved'
};

// Load phrases from JSON
fetch('phrases.json')
    .then(response => response.json())
    .then(data => {
        phrases = data.phrases;
        // Pick a random phrase on load
        const randomIndex = Math.floor(Math.random() * phrases.length);
        initializeGame(phrases[randomIndex]);
    })
    .catch(error => {
        console.error('Error loading phrases:', error);
    });

function initializeGame(phrase) {
    currentPhrase = phrase.toUpperCase();
    console.log('Answer:', currentPhrase);
    letterBoxes = [];
    letterCounts = {};
    goodArray = [];
    zeroArray = [];
    currentSelection = [];
    isAnimating = false;
    currentTurn = 0;
    puzzleSolved = false;
    isFirstSelection = true;
    
    // Count letters in phrase
    const lettersInPhrase = new Set();
    for (let char of currentPhrase) {
        if (char >= 'A' && char <= 'Z') {
            letterCounts[char] = (letterCounts[char] || 0) + 1;
            lettersInPhrase.add(char);
        }
    }
    
    // Categorize all letters into goodArray (appear at least once) and zeroArray (never appear)
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (let letter of allLetters) {
        if (lettersInPhrase.has(letter)) {
            // Letter appears at least once - add to goodArray
            goodArray.push(letter);
        } else {
            // Letter never appears - add to zeroArray
            zeroArray.push(letter);
        }
    }
    
    displayPhrase(currentPhrase);
    setButtonsDisabled(true);
    instructionLine.textContent = 'select your first letter';
    instructionLine.style.color = '#666';
    // Hide uses display line since we don't track uses anymore
    if (usesLine) {
        usesLine.style.display = 'none';
    }
    // Show letter selection UI on new game
    letterSelectionUI.style.display = 'flex';
    // Hide guessStars2 on new game
    if (guessStars2) {
        guessStars2.style.display = 'none';
    }
    updateGuessDisplay();
    updatePointerEvents(UI_STATE.GAMEPLAY);
    selectAndShowLetters();
}

function updateGuessDisplay() {
    const remaining = Math.max(0, maxTurn - currentTurn);
    if (guessNumber) {
        guessNumber.textContent = remaining;
    }
    
    // Update star display in guessStars (big top) each turn
    if (guessStars && !puzzleSolved) {
        const starsEarned = getStarCount();
        const starElements = guessStars.querySelectorAll('.guess-star');
        starElements.forEach((star, index) => {
            // Remove any existing classes that might affect color
            star.classList.remove('grey');
            // Add grey class if this star wasn't earned yet
            if (index >= starsEarned) {
                star.classList.add('grey');
            }
        });
    }
    
    // Don't update button text here - it will be updated when buttons are re-enabled after animation
    
    if (shortGuessCounter) {
        if (puzzleSolved) {
            // Hide small top when puzzle is solved with display none (override media query)
            shortGuessCounter.style.setProperty('display', 'none', 'important');
        } else {
            // Reset display to allow media query to control it
            shortGuessCounter.style.display = '';
            shortGuessCounter.classList.remove('show-stars');
            shortGuessCounter.textContent = `GUESSES: ${remaining}`;
        }
    }
    // Update star display in guessStars2 when puzzle is solved
    if (guessStars2 && puzzleSolved) {
        const starsEarned = getStarCount();
        const starElements = guessStars2.querySelectorAll('.guess-star');
        starElements.forEach((star, index) => {
            // Remove any existing classes that might affect color
            star.classList.remove('grey');
            // Add grey class if this star wasn't earned
            if (index >= starsEarned) {
                star.classList.add('grey');
            }
        });
        // Show guessStars2
        guessStars2.style.display = 'flex';
    } else if (guessStars2) {
        // When puzzle is not solved, hide guessStars2
        guessStars2.style.display = 'none';
        // Ensure all stars are yellow (not grey) when hidden
        const starElements = guessStars2.querySelectorAll('.guess-star');
        starElements.forEach((star) => {
            star.classList.remove('grey');
        });
    }
}

function getStarCount(turn = currentTurn) {
    if (turn < STAR_THRESHOLDS.STAR_5) return 5;
    if (turn < STAR_THRESHOLDS.STAR_4) return 4;
    if (turn < STAR_THRESHOLDS.STAR_3) return 3;
    if (turn < STAR_THRESHOLDS.STAR_2) return 2;
    if (turn <= STAR_THRESHOLDS.STAR_1) return 1;
    return 0;
}

function updateNextLetterButtonText() {
    if (nextLetterBtn && !puzzleSolved) {
        const currentStars = getStarCount(currentTurn);
        const nextStars = getStarCount(currentTurn + 1);
        if (nextStars < currentStars) {
            nextLetterBtn.innerHTML = 'next letter -1<span class="button-star">★</span>';
        } else {
            nextLetterBtn.innerHTML = 'next letter';
        }
    }
}

function displayPhrase(phrase) {
    phraseDisplay.innerHTML = '';
    
    const words = phrase.split(' ');
    
    words.forEach((word) => {
        // Create a container for each word
        const wordContainer = document.createElement('div');
        wordContainer.className = 'word-container';
        
        // Add letter boxes for each letter in the word (uppercase)
        for (let i = 0; i < word.length; i++) {
            const box = document.createElement('div');
            box.className = 'letter-box';
            box.dataset.letter = word[i].toUpperCase();
            wordContainer.appendChild(box);
            letterBoxes.push(box);
        }
        
        phraseDisplay.appendChild(wordContainer);
    });
    
    // Check if any word has 9+ letters and adjust letter box sizes if needed
    const hasLongWord = words.some(word => word.length >= 9);
    const hasVeryLongWord = words.some(word => word.length >= 10);
    adjustLetterBoxSizes(hasLongWord, hasVeryLongWord);
}

function adjustLetterBoxSizes(hasLongWord, hasVeryLongWord = false) {
    const wordContainers = document.querySelectorAll('.word-container');
    
    if (!hasLongWord) {
        // Reset to default size
        letterBoxes.forEach(box => {
            box.style.width = '';
            box.style.height = '';
            box.style.fontSize = '';
        });
        wordContainers.forEach(container => {
            container.style.gap = '';
        });
        return;
    }
    
    // Get window width
    const windowWidth = window.innerWidth;
    
    // If there's a 10+ letter word, use even smaller sizes
    if (hasVeryLongWord) {
        // Extra small sizes for 10+ letter words
        if (windowWidth <= 360) {
            letterBoxes.forEach(box => {
                box.style.width = '24px';
                box.style.height = '24px';
                box.style.fontSize = '13px';
            });
            wordContainers.forEach(container => {
                container.style.gap = '4px';
            });
        } else if (windowWidth <= 400) {
            letterBoxes.forEach(box => {
                box.style.width = '28px';
                box.style.height = '28px';
                box.style.fontSize = '15px';
            });
            wordContainers.forEach(container => {
                container.style.gap = '4px';
            });
        } else if (windowWidth <= 480) {
            letterBoxes.forEach(box => {
                box.style.width = '32px';
                box.style.height = '32px';
                box.style.fontSize = '17px';
            });
            wordContainers.forEach(container => {
                container.style.gap = '5px';
            });
        } else if (windowWidth <= 600) {
            letterBoxes.forEach(box => {
                box.style.width = '36px';
                box.style.height = '36px';
                box.style.fontSize = '19px';
            });
            wordContainers.forEach(container => {
                container.style.gap = '6px';
            });
        } else {
            letterBoxes.forEach(box => {
                box.style.width = '40px';
                box.style.height = '40px';
                box.style.fontSize = '21px';
            });
            wordContainers.forEach(container => {
                container.style.gap = '7px';
            });
        }
    } else {
        // Normal small sizes for 9 letter words - don't change gap, keep CSS default
        if (windowWidth <= 360) {
            letterBoxes.forEach(box => {
                box.style.width = '28px';
                box.style.height = '28px';
                box.style.fontSize = '15px';
            });
            // Don't set gap - let CSS default handle it
        } else if (windowWidth <= 400) {
            letterBoxes.forEach(box => {
                box.style.width = '32px';
                box.style.height = '32px';
                box.style.fontSize = '17px';
            });
            // Don't set gap - let CSS default handle it
        } else if (windowWidth <= 480) {
            letterBoxes.forEach(box => {
                box.style.width = '36px';
                box.style.height = '36px';
                box.style.fontSize = '19px';
            });
            // Don't set gap - let CSS default handle it
        } else if (windowWidth <= 600) {
            letterBoxes.forEach(box => {
                box.style.width = '42px';
                box.style.height = '42px';
                box.style.fontSize = '21px';
            });
            // Don't set gap - let CSS default handle it
        } else {
            // Reset to default size if width is above threshold
            letterBoxes.forEach(box => {
                box.style.width = '';
                box.style.height = '';
                box.style.fontSize = '';
            });
            wordContainers.forEach(container => {
                container.style.gap = '';
            });
        }
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    const words = currentPhrase ? currentPhrase.split(' ') : [];
    const hasLongWord = words.some(word => word.length >= 9);
    const hasVeryLongWord = words.some(word => word.length >= 10);
    if (hasLongWord) {
        adjustLetterBoxSizes(true, hasVeryLongWord);
    }
});

function setButtonsDisabled(disabled) {
    nextLetterBtn.disabled = disabled;
    solveBtn.disabled = disabled;
    if (disabled) {
        nextLetterBtn.style.opacity = '0.5';
        solveBtn.style.opacity = '0.5';
    } else {
        nextLetterBtn.style.opacity = '1';
        solveBtn.style.opacity = '1';
    }
}

/**
 * Updates pointer-events for all UI containers based on the current state.
 * This ensures proper click handling and prevents blocking between layers.
 */
function updatePointerEvents(state) {
    switch (state) {
        case UI_STATE.GAMEPLAY:
            // Normal gameplay: letter selection UI is active, solve UI is hidden
            if (gameContent) gameContent.style.pointerEvents = 'auto';
            if (letterSelectionUI) letterSelectionUI.style.pointerEvents = 'auto';
            if (bottomSection) bottomSection.style.pointerEvents = 'none';
            if (solveUI) solveUI.style.pointerEvents = 'none';
            if (keyboard) keyboard.style.pointerEvents = 'none';
            break;
            
        case UI_STATE.SOLVE_UI:
            // Solve UI active: letter selection UI is faded, solve UI and keyboard are active
            if (gameContent) gameContent.style.pointerEvents = 'none';
            if (letterSelectionUI) letterSelectionUI.style.pointerEvents = 'none';
            if (bottomSection) bottomSection.style.pointerEvents = 'auto';
            if (solveUI) solveUI.style.pointerEvents = 'auto';
            if (keyboard) keyboard.style.pointerEvents = 'auto';
            break;
            
        case UI_STATE.SOLVED:
            // Puzzle solved: everything hidden except phrase display
            if (gameContent) gameContent.style.pointerEvents = 'auto';
            if (letterSelectionUI) letterSelectionUI.style.pointerEvents = 'none';
            if (bottomSection) bottomSection.style.pointerEvents = 'none';
            if (solveUI) solveUI.style.pointerEvents = 'none';
            if (keyboard) keyboard.style.pointerEvents = 'none';
            break;
    }
}

function selectAndShowLetters() {
    const letters = selectLetters();
    currentSelection = letters;
    
    // Show slot machine animation
    if (letters.length > 0) {
        animateSlotMachine(letters);
    } else {
        // No more letters available
        isAnimating = false;
        instructionLine.textContent = 'no more letters. solve the puzzle.';
        setButtonsDisabled(true);
        nextLetterBtn.disabled = true;
        nextLetterBtn.style.opacity = '0.5';
        solveBtn.disabled = false;
        solveBtn.style.opacity = '1';
    }
}

function selectLetters() {
    let result = [];
    
    // Helper function to get a random item from an array and remove it
    const getRandomAndRemove = (arr) => {
        if (arr.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * arr.length);
        const item = arr[randomIndex];
        arr.splice(randomIndex, 1);
        return item;
    };
    
    // Helper function to get random items without removing them
    const getRandomItems = (arr, count) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    };
    
    // Get the array to use for good letters (with 50/50 chance to exclude A, E, S, T, R)
    let lettersToUse = goodArray;
    const randomNum = Math.random() * 100; // 0-100
    if (randomNum > 50) {
        // Create temporary copy and remove A, E, S, T, R
        const excludedLetters = ['A', 'E', 'S', 'T', 'R'];
        lettersToUse = goodArray.filter(letter => !excludedLetters.includes(letter));
        
        // If no letters left after filtering, revert to original goodArray
        if (lettersToUse.length === 0) {
            lettersToUse = goodArray;
        }
    }
    
    if (isFirstSelection) {
        // First selection: use all letters from lettersToUse (up to 3) - randomly selected
        const count = Math.min(3, lettersToUse.length);
        result = getRandomItems(lettersToUse, count);
        isFirstSelection = false;
    } else {
        // After first selection: use 2 from lettersToUse and 1 from zeroArray - randomly selected
        if (lettersToUse.length >= 2) {
            const selected = getRandomItems(lettersToUse, 2);
            result.push(...selected);
        } else if (lettersToUse.length === 1) {
            result.push(lettersToUse[0]);
        }
        
        // Add one from zeroArray if available (randomly selected)
        if (zeroArray.length > 0) {
            const randomIndex = Math.floor(Math.random() * zeroArray.length);
            result.push(zeroArray[randomIndex]);
        }
        
        // If we don't have enough and lettersToUse is empty, use zeroArray
        if (result.length < 3 && lettersToUse.length === 0 && zeroArray.length > 0) {
            // Fill remaining slots from zeroArray (randomly selected)
            const needed = 3 - result.length;
            const available = Math.min(needed, zeroArray.length);
            const selected = getRandomItems(zeroArray, available);
            result.push(...selected);
        }
    }
    
    return result.slice(0, 3);
}

function animateSlotMachine(targetLetters) {
    isAnimating = true;
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const duration = 1000; // 1 second
    const interval = 50; // Change letter every 50ms for smoother animation
    const steps = duration / interval;
    let completed = 0;
    
    // Re-query boxes to get fresh references
    selectionBoxes = document.querySelectorAll('.selection-box');
    
    selectionBoxes.forEach((box, index) => {
        let step = 0;
        const targetLetter = targetLetters[index] || '';
        box.textContent = '';
        box.style.color = '#000';
        box.style.opacity = '1';
        box.style.pointerEvents = 'none';
        
        const animate = () => {
            if (step < steps) {
                const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
                box.textContent = randomLetter;
                step++;
                setTimeout(animate, interval);
            } else {
                box.textContent = targetLetter;
                box.style.color = '#000';
                completed++;
                if (completed === selectionBoxes.length) {
                    isAnimating = false;
                    // Set instruction text when slot machine animation completes
                    instructionLine.textContent = 'select a letter';
                    instructionLine.style.color = '#666';
                    enableLetterSelection();
                }
            }
        };
        animate();
    });
}


function enableLetterSelection() {
    // Re-query boxes to get fresh references
    selectionBoxes = document.querySelectorAll('.selection-box');
    
    selectionBoxes.forEach((box, index) => {
        box.style.cursor = 'pointer';
        box.style.pointerEvents = 'auto';
        box.addEventListener('click', () => selectLetter(index));
    });
}

function selectLetter(index) {
    if (isAnimating) return;
    
    const selectedLetter = currentSelection[index];
    lastSelectedLetter = selectedLetter;
    
    // Remove selected letter from whichever array it's in
    const goodIndex = goodArray.indexOf(selectedLetter);
    if (goodIndex !== -1) {
        goodArray.splice(goodIndex, 1);
    }
    
    const zeroIndex = zeroArray.indexOf(selectedLetter);
    if (zeroIndex !== -1) {
        zeroArray.splice(zeroIndex, 1);
    }
    
    // Increment turn
    // currentTurn++;
    updateGuessDisplay();
    
    // Disable selection boxes
    const letterCount = letterCounts[selectedLetter] || 0;
    selectionBoxes.forEach((box, i) => {
        box.style.pointerEvents = 'none';
        if (i === index) {
            box.style.opacity = '1';
            // Check if letter has 0 count (not in phrase) - make it red
            if (letterCount === 0) {
                box.style.color = '#ff0000';
            }
        } else {
            box.style.color = '#999';
        }
    });
    
    // Update instruction line based on whether letter is in phrase
    if (letterCount === 0) {
        instructionLine.textContent = 'letter not in phrase';
        instructionLine.style.color = '#ff0000';
    } else {
        const timesText = letterCount === 1 ? 'time' : 'times';
        instructionLine.textContent = `letter found ${letterCount} ${timesText}`;
        instructionLine.style.color = '#666';
    }
    
    // Animate letter reveals
    revealLetters();
}

function revealLetters() {
    isAnimating = true;
    setButtonsDisabled(true);
    
    if (!lastSelectedLetter) return;
    
    // Find all boxes with this letter
    const boxesToReveal = letterBoxes.filter(box => box.dataset.letter === lastSelectedLetter);
    
    let boxIndex = 0;
    const revealNext = () => {
        if (boxIndex < boxesToReveal.length) {
            const box = boxesToReveal[boxIndex];
            box.textContent = lastSelectedLetter;
            
            // Set to bright immediately
            gsap.set(box, { filter: 'brightness(1.5)' });
            
            // Tween back to normal over 1 second, then wait 0.8 seconds
            gsap.to(box, {
                filter: 'brightness(1)',
                duration: 1,
                ease: 'none',
                onComplete: () => {
                    // Wait 0.8 seconds after tween completes, then move to next
                    setTimeout(() => {
                        boxIndex++;
                        revealNext();
                    }, 800);
                }
            });
        } else {
            isAnimating = false;
            // Check if out of turns
            if (currentTurn >= maxTurn) {
                nextLetterBtn.disabled = true;
                nextLetterBtn.style.opacity = '0.5';
                instructionLine.textContent = 'no more letters. solve the puzzle.';
                solveBtn.disabled = false;
                solveBtn.style.opacity = '1';
            } else {
                setButtonsDisabled(false);
                // Reset instruction line text only if letter was found (count > 0)
                // If letter was not found (count === 0), keep "letter not in phrase" message
                const letterCount = letterCounts[lastSelectedLetter] || 0;
                if (letterCount > 0) {
                    instructionLine.textContent = 'select a letter or solve';
                    instructionLine.style.color = '#666';
                }
                // Update button text NOW when enabling buttons after animation completes
                // This shows what will happen if you press "next letter" next time
                updateNextLetterButtonText();
            }
        }
    };
    
    revealNext();
}

nextLetterBtn.addEventListener('click', () => {
    if (isAnimating) return;
    if (currentTurn >= maxTurn) return; // Don't allow if out of turns
    
    // Clear instruction text when pressing next letter button
    instructionLine.textContent = 'getting letters...';
    instructionLine.style.color = '#666';
    
    // Increment turn when pressing next letter button
    currentTurn++;
    // Update guess display but don't update button text yet
    const remaining = Math.max(0, maxTurn - currentTurn);
    if (guessNumber) {
        guessNumber.textContent = remaining;
    }
    // Update stars in big top
    if (guessStars && !puzzleSolved) {
        const starsEarned = getStarCount();
        const starElements = guessStars.querySelectorAll('.guess-star');
        starElements.forEach((star, index) => {
            star.classList.remove('grey');
            if (index >= starsEarned) {
                star.classList.add('grey');
            }
        });
    }
    
    // Re-query boxes to get fresh references
    selectionBoxes = document.querySelectorAll('.selection-box');
    
    // Clear selection boxes
    selectionBoxes.forEach(box => {
        box.textContent = '';
        box.style.color = '#000';
        box.style.opacity = '1';
        box.style.pointerEvents = 'none';
        box.style.cursor = 'default';
    });
    
    setButtonsDisabled(true);
    selectAndShowLetters();
});

solveBtn.addEventListener('click', () => {
    showSolveUI();
});

function showSolveUI() {
    // Disable the two buttons
    setButtonsDisabled(true);
    
    // Reset solve title
    solveTitle.textContent = 'SOLVE THE PUZZLE';
    solveTitle.classList.remove('incorrect');
    
    // Clear input
    solveInput.value = '';
    
    // Fade out letter selection UI
    letterSelectionUI.classList.add('faded');
    
    // Fade in solve UI and keyboard
    setTimeout(() => {
        solveUI.classList.add('visible');
        keyboard.classList.add('visible');
        
        // Update pointer events for solve UI state
        updatePointerEvents(UI_STATE.SOLVE_UI);
        
        enableKeyboardForTyping();
        solveInput.focus();
    }, 50);
}

function hideSolveUI() {
    // Fade out solve UI and keyboard
    solveUI.classList.remove('visible');
    keyboard.classList.remove('visible');
    disableKeyboard();
    
    // Update pointer events back to gameplay state
    updatePointerEvents(UI_STATE.GAMEPLAY);
    
    // Fade in letter selection UI
    setTimeout(() => {
        letterSelectionUI.classList.remove('faded');
        setButtonsDisabled(false);
    }, 50);
}

backBtn.addEventListener('click', () => {
    hideSolveUI();
});

function enableKeyboardForTyping() {
    const keys = keyboard.querySelectorAll('.key');
    keys.forEach(key => {
        key.disabled = false;
        const handler = handleKeyClick;
        keyboardClickHandlers.set(key, handler);
        key.addEventListener('click', handler);
    });
}

function disableKeyboard() {
    const keys = keyboard.querySelectorAll('.key');
    keys.forEach(key => {
        key.disabled = true;
        const handler = keyboardClickHandlers.get(key);
        if (handler) {
            key.removeEventListener('click', handler);
            keyboardClickHandlers.delete(key);
        }
    });
}

function handleKeyClick(e) {
    const key = e.target.closest('.key');
    if (!key) return;
    const keyValue = key.dataset.key;
    
    if (keyValue === 'SPACE') {
        solveInput.value += ' ';
    } else if (keyValue === 'BACKSPACE') {
        solveInput.value = solveInput.value.slice(0, -1);
    } else {
        solveInput.value += keyValue;
    }
}

solveUIBtn.addEventListener('click', () => {
    checkSolve();
});

function checkSolve() {
    const userInput = solveInput.value.trim().toUpperCase();
    const correctAnswer = currentPhrase.toUpperCase();
    
    if (userInput === correctAnswer) {
        // Mark puzzle as solved
        puzzleSolved = true;
        updateGuessDisplay();
        
        // Clear instruction line text
        if (instructionLine) {
            instructionLine.textContent = 'CORRECT!';
        }
        
        // Hide keyboard immediately
        solveUI.classList.remove('visible');
        keyboard.classList.remove('visible');
        disableKeyboard();
        
        // Correct - animate letters with shiny effect
        animateShinyLetters();
        setTimeout(() => {
            // Fade out letter selection UI when solved (opacity 0, not display none)
            letterSelectionUI.classList.add('faded');
            // Update pointer events for solved state
            updatePointerEvents(UI_STATE.SOLVED);
        }, 1500);
    } else {
        // Incorrect - show error
        solveTitle.textContent = 'incorrect';
        solveTitle.classList.add('incorrect');
    }
}

function animateShinyLetters() {
    letterBoxes.forEach((box, index) => {
        setTimeout(() => {
            box.classList.add('shiny');
            box.textContent = box.dataset.letter;
            setTimeout(() => {
                box.classList.remove('shiny');
            }, 1000);
        }, index * 50);
    });
}

// Handle typing in input field
solveInput.addEventListener('input', (e) => {
    // Convert to uppercase
    e.target.value = e.target.value.toUpperCase();
});

solveInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkSolve();
    }
});

function toggleKeyboard(show) {
    if (show) {
        keyboard.classList.add('visible');
        enableKeyboardForTyping();
    } else {
        keyboard.classList.remove('visible');
        disableKeyboard();
    }
}

toggleKeyboard(false);

// Keyboard event listener
document.addEventListener('keydown', (e) => {
    if ((e.key === 's' || e.key === 'S') && !solveUI.classList.contains('visible')) {
        showSolveUI();
    }
});

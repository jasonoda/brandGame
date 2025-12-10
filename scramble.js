// Game state
let gameData = [];
let currentWord = '';
let scrambledLetters = [];
let currentDayData = null;
let gameWon = false;

// Local storage helper functions
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function isScrambleComplete() {
    const todayKey = getTodayKey();
    return localStorage.getItem(`scrambleComplete_${todayKey}`) === 'true';
}

function markScrambleComplete() {
    const todayKey = getTodayKey();
    localStorage.setItem(`scrambleComplete_${todayKey}`, 'true');
}

function getDailyStars() {
    const todayKey = getTodayKey();
    return parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
}

function getTotalStars() {
    return parseInt(localStorage.getItem('totalStars') || '0');
}

function addStars(count) {
    const todayKey = getTodayKey();
    const currentDailyStars = getDailyStars();
    const currentTotalStars = getTotalStars();
    
    // Update daily stars
    localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + count));
    
    // Update total stars
    localStorage.setItem('totalStars', String(currentTotalStars + count));
    
    // Add move stars (same amount as regular stars)
    const currentMoveStars = parseInt(localStorage.getItem(`moveStars_${todayKey}`) || '0');
    localStorage.setItem(`moveStars_${todayKey}`, String(currentMoveStars + count));
    
    updateStarDisplay();
    updateWalletStars();
    updateRivalStars();
}

function updateStarDisplay() {
    const stars = getTotalStars();
    const starCountElement = document.querySelector('.star-count');
    if (starCountElement) {
        starCountElement.textContent = `x ${stars}`;
    }
}

function updateWalletStars() {
    const stars = getTotalStars();
    const walletStarsElement = document.querySelector('.profile-total-stars');
    if (walletStarsElement) {
        const text = walletStarsElement.textContent;
        // Replace the number after "x " with the total stars
        walletStarsElement.textContent = text.replace(/x \d+/, `x ${stars}`);
    }
}

function updateRivalStars() {
    const stars = getDailyStars();
    // Only update the first rival-stars element (user's stars), not the rival's
    const userRivalStars = document.querySelector('.rival-profile:first-child .rival-stars');
    if (userRivalStars) {
        // Preserve the star icon HTML structure
        const starIcon = userRivalStars.querySelector('.star-icon');
        if (starIcon) {
            // Keep the star icon and just update the text after it
            const textAfterStar = userRivalStars.childNodes;
            let textNode = null;
            for (let i = 0; i < textAfterStar.length; i++) {
                if (textAfterStar[i].nodeType === 3) { // Text node
                    textNode = textAfterStar[i];
                    break;
                }
            }
            if (textNode) {
                textNode.textContent = textNode.textContent.replace(/x\s*\d+/, ` x ${stars}`);
            } else {
                // If no text node exists, create one
                const newTextNode = document.createTextNode(` x ${stars}`);
                userRivalStars.appendChild(newTextNode);
            }
            // Ensure star icon is orange
            starIcon.style.color = '#FFB84D';
        } else {
            // Fallback: if star icon doesn't exist, recreate the structure
            userRivalStars.innerHTML = `<span class="star-icon" style="color: #FFB84D;">★</span> x ${stars}`;
        }
    }
}

// Check and update mystery word stars
function updateMysteryWordStars() {
    const todayKey = getTodayKey();
    const mysteryWordStars = document.getElementById('mysteryWordStars');
    const isMysteryComplete = localStorage.getItem(`mysteryWordComplete_${todayKey}`) === 'true';
    
    if (mysteryWordStars && isMysteryComplete) {
        mysteryWordStars.style.color = '#FFB84D';
    }
}

// Check and update beticle stars
function updateBeticleStars() {
    const todayKey = getTodayKey();
    const beticleStars = document.getElementById('beticleStars');
    const isBeticleComplete = localStorage.getItem(`beticleComplete_${todayKey}`) === 'true';
    
    if (beticleStars && isBeticleComplete) {
        beticleStars.style.color = '#FFB84D';
    }
}

// Check and update memory display
function updateMemoryDisplay() {
    const todayKey = getTodayKey();
    const memoryScore = document.querySelector('#memoryBox .score-text');
    const memoryStars = document.querySelector('#memoryBox .stars');
    const isMemoryComplete = localStorage.getItem(`memoryComplete_${todayKey}`) === 'true';
    
    if (isMemoryComplete) {
        const score = parseInt(localStorage.getItem(`memoryScore_${todayKey}`) || '0');
        const starsEarned = parseInt(localStorage.getItem(`memoryStars_${todayKey}`) || '0');
        
        if (memoryScore) {
            memoryScore.textContent = score.toLocaleString();
        }
        
        if (memoryStars) {
            // Color earned stars orange, unearned grey
            memoryStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                if (i < starsEarned) {
                    star.style.color = '#FFB84D';
                } else {
                    star.style.color = '#ddd';
                }
                memoryStars.appendChild(star);
            }
        }
    } else {
        if (memoryScore) {
            memoryScore.textContent = '0';
        }
        if (memoryStars) {
            memoryStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = '#ddd';
                memoryStars.appendChild(star);
            }
        }
    }
}

// Check and update blackjack display
function updateBlackjackDisplay() {
    const todayKey = getTodayKey();
    const blackjackScore = document.getElementById('blackjackScore');
    const blackjackStars = document.getElementById('blackjackStars');
    const isBlackjackComplete = localStorage.getItem(`blackjackComplete_${todayKey}`) === 'true';
    
    if (isBlackjackComplete) {
        const score = parseInt(localStorage.getItem(`blackjackScore_${todayKey}`) || '0');
        const starsEarned = parseInt(localStorage.getItem(`blackjackStars_${todayKey}`) || '0');
        
        if (blackjackScore) {
            blackjackScore.textContent = score.toLocaleString();
        }
        
        if (blackjackStars) {
            // Color earned stars orange, unearned grey
            blackjackStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                if (i < starsEarned) {
                    star.style.color = '#FFB84D';
                } else {
                    star.style.color = '#ddd';
                }
                blackjackStars.appendChild(star);
            }
        }
    } else {
        if (blackjackScore) {
            blackjackScore.textContent = '0';
        }
        if (blackjackStars) {
            blackjackStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = '#ddd';
                blackjackStars.appendChild(star);
            }
        }
    }
    
    // Load Lost and Found scores
    const lostAndFoundScore = document.getElementById('lostAndFoundScore');
    const lostAndFoundStars = document.getElementById('lostAndFoundStars');
    const isLostAndFoundComplete = localStorage.getItem(`lostAndFoundComplete_${todayKey}`) === 'true';
    
    if (isLostAndFoundComplete) {
        const score = parseInt(localStorage.getItem(`lostAndFoundScore_${todayKey}`) || '0');
        const starsEarned = parseInt(localStorage.getItem(`lostAndFoundStars_${todayKey}`) || '0');
        
        console.log('[MainPage] Loading Lost and Found scores:', { score, starsEarned, todayKey, isLostAndFoundComplete });
        
        if (lostAndFoundScore) {
            lostAndFoundScore.textContent = score.toLocaleString();
        }
        
        if (lostAndFoundStars) {
            // Color earned stars orange, unearned grey
            lostAndFoundStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                if (i < starsEarned) {
                    star.style.color = '#FFB84D';
                } else {
                    star.style.color = '#ddd';
                }
                lostAndFoundStars.appendChild(star);
            }
            console.log('[MainPage] Displayed', starsEarned, 'stars for Lost and Found');
        }
    } else {
        if (lostAndFoundScore) {
            lostAndFoundScore.textContent = '0';
        }
        if (lostAndFoundStars) {
            lostAndFoundStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = '#ddd';
                lostAndFoundStars.appendChild(star);
            }
        }
    }
}

// Function to load all game scores (for refreshing after games complete)
function loadGameScores() {
    const todayKey = getTodayKey();
    
    // Load Memory scores
    const memoryScore = document.querySelector('#memoryBox .score-text');
    const memoryStars = document.getElementById('memoryStars');
    const isMemoryComplete = localStorage.getItem(`memoryComplete_${todayKey}`) === 'true';
    
    if (isMemoryComplete) {
        const score = parseInt(localStorage.getItem(`memoryScore_${todayKey}`) || '0');
        const starsEarned = parseInt(localStorage.getItem(`memoryStars_${todayKey}`) || '0');
        
        if (memoryScore) {
            memoryScore.textContent = score.toLocaleString();
        }
        
        if (memoryStars) {
            // Color earned stars orange, unearned grey
            memoryStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                if (i < starsEarned) {
                    star.style.color = '#FFB84D';
                } else {
                    star.style.color = '#ddd';
                }
                memoryStars.appendChild(star);
            }
        }
    } else {
        if (memoryScore) {
            memoryScore.textContent = '0';
        }
        if (memoryStars) {
            memoryStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = '#ddd';
                memoryStars.appendChild(star);
            }
        }
    }
    
    // Load Blackjack scores
    const blackjackScore = document.getElementById('blackjackScore');
    const blackjackStars = document.getElementById('blackjackStars');
    const isBlackjackComplete = localStorage.getItem(`blackjackComplete_${todayKey}`) === 'true';
    
    if (isBlackjackComplete) {
        const score = parseInt(localStorage.getItem(`blackjackScore_${todayKey}`) || '0');
        const starsEarned = parseInt(localStorage.getItem(`blackjackStars_${todayKey}`) || '0');
        
        if (blackjackScore) {
            blackjackScore.textContent = score.toLocaleString();
        }
        
        if (blackjackStars) {
            // Color earned stars orange, unearned grey
            blackjackStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                if (i < starsEarned) {
                    star.style.color = '#FFB84D';
                } else {
                    star.style.color = '#ddd';
                }
                blackjackStars.appendChild(star);
            }
        }
    } else {
        if (blackjackScore) {
            blackjackScore.textContent = '0';
        }
        if (blackjackStars) {
            blackjackStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = '#ddd';
                blackjackStars.appendChild(star);
            }
        }
    }
    
    // Load Lost and Found scores
    const lostAndFoundScore = document.getElementById('lostAndFoundScore');
    const lostAndFoundStars = document.getElementById('lostAndFoundStars');
    const isLostAndFoundComplete = localStorage.getItem(`lostAndFoundComplete_${todayKey}`) === 'true';
    
    if (isLostAndFoundComplete) {
        const score = parseInt(localStorage.getItem(`lostAndFoundScore_${todayKey}`) || '0');
        const starsEarned = parseInt(localStorage.getItem(`lostAndFoundStars_${todayKey}`) || '0');
        
        console.log('[MainPage] Loading Lost and Found scores:', { score, starsEarned, todayKey, isLostAndFoundComplete });
        
        if (lostAndFoundScore) {
            lostAndFoundScore.textContent = score.toLocaleString();
        }
        
        if (lostAndFoundStars) {
            // Color earned stars orange, unearned grey
            lostAndFoundStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                if (i < starsEarned) {
                    star.style.color = '#FFB84D';
                } else {
                    star.style.color = '#ddd';
                }
                lostAndFoundStars.appendChild(star);
            }
            console.log('[MainPage] Displayed', starsEarned, 'stars for Lost and Found');
        }
    } else {
        if (lostAndFoundScore) {
            lostAndFoundScore.textContent = '0';
        }
        if (lostAndFoundStars) {
            lostAndFoundStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = '#ddd';
                lostAndFoundStars.appendChild(star);
            }
        }
    }
}

// Expose functions to window for iframe access
window.updateStarDisplay = updateStarDisplay;
window.updateWalletStars = updateWalletStars;
window.updateRivalStars = updateRivalStars;
window.loadGameScores = loadGameScores;
window.updateMysteryWordStars = updateMysteryWordStars;
window.updateBeticleStars = updateBeticleStars;
window.updateMemoryDisplay = updateMemoryDisplay;
window.updateBlackjackDisplay = updateBlackjackDisplay;

// DOM elements
let lettersContainer = null;
let unscrambleLabel = null;
let onThisDayContainer = null;

// Drag system state
let letters = [];
let isDragging = false;
let draggedLetter = null;
let dragOffset = { x: 0, y: 0 };
let animationFrame = null;

// Load the JSON data
async function loadGameData() {
    try {
        const response = await fetch('scramble/history.json');
        gameData = await response.json();
        initializeScramble();
        updateStarDisplay();
        updateWalletStars();
        updateRivalStars();
        updateMysteryWordStars();
        updateBeticleStars();
        updateMemoryDisplay();
        updateBlackjackDisplay();
        if (typeof loadGameScores === 'function') {
            loadGameScores();
        }
        
        // Ensure rival page star icons are orange
        setTimeout(() => {
            const rivalStarIcons = document.querySelectorAll('#rival-page .star-icon');
            rivalStarIcons.forEach(icon => {
                icon.style.color = '#FFB84D';
            });
        }, 100);
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

// Pick a random day from the data
function pickRandomDay() {
    const randomIndex = Math.floor(Math.random() * gameData.length);
    return gameData[randomIndex];
}

// Scramble the letters of a word - ensure no letter is in correct position
function scrambleWord(word) {
    const letters = word.toUpperCase().split('');
        const scrambled = [...letters];
        
    // Shuffle until no letter is in its original position
    let attempts = 0;
    let validScramble = false;
    
    while (!validScramble && attempts < 100) {
        // Fisher-Yates shuffle algorithm
        for (let i = scrambled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
        }
        
        // Check if any letter is in its original position
        validScramble = true;
        for (let i = 0; i < letters.length; i++) {
            if (scrambled[i] === letters[i]) {
                validScramble = false;
                break;
            }
        }
        
        attempts++;
    }
    
        return scrambled;
}

// Letter class for position management
class Letter {
    constructor(char, index, element) {
        this.char = char;
        this.index = index;
        this.targetX = 0;
        this.currentX = 0;
        this.element = element;
        this.isDragging = false;
    }
    
    updateTargetPosition() {
        const letterWidth = this.element.offsetWidth;
        const containerWidth = lettersContainer.offsetWidth;
        const gap = 4; // Match the gap from CSS
        
        // Calculate total width
        const totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
        const startX = (containerWidth - totalWidth) / 2;
        
        this.targetX = startX + this.index * (letterWidth + gap);
    }
    
    lerp(current, target, factor = 0.15) {
        return current + (target - current) * factor;
    }
    
    update() {
        if (!this.isDragging) {
            this.currentX = this.lerp(this.currentX, this.targetX);
            this.element.style.left = `${this.currentX}px`;
        }
    }
    
    setPosition(x) {
        this.currentX = x;
        this.targetX = x;
        this.element.style.left = `${x}px`;
    }
}

// Initialize scramble functionality
function initializeScramble() {
    // Get DOM elements
    lettersContainer = document.querySelector('.unscramble-boxes');
    unscrambleLabel = document.querySelector('.unscramble-label');
    onThisDayContainer = document.querySelector('.on-this-day-container');
    
    if (!lettersContainer) {
        console.error('Letter container not found');
        return;
    }
    
    // Update star display on load
    updateStarDisplay();
    updateCalendar();
    
    // Pick random word
    currentDayData = pickRandomDay();
    currentWord = currentDayData.word;
    scrambledLetters = scrambleWord(currentWord);
    
    // Check if scramble is already complete
    if (isScrambleComplete()) {
        // Show completed state immediately without animation
        gameWon = true;
        showCompletedScramble();
        return;
    }
    
    gameWon = false;
    
    console.log('Today\'s word:', currentWord); // For debugging
    
    // Clear existing letter boxes and create new ones
    lettersContainer.innerHTML = '';
    letters = [];
    
    // Calculate responsive letter size based on container and word length
    const containerWidth = lettersContainer.parentElement.offsetWidth - 30; // Account for padding
    const gap = 4;
    const gapSpace = (scrambledLetters.length - 1) * gap;
    const availableForLetters = containerWidth - gapSpace;
    const letterSize = Math.floor(availableForLetters / scrambledLetters.length);
    
    // Clamp between reasonable bounds
    const finalLetterSize = Math.max(40, Math.min(60, letterSize));
    
    // Update container height
    lettersContainer.style.height = `${finalLetterSize}px`;
    
    // Create letter divs
    scrambledLetters.forEach((char, index) => {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter-box';
        letterDiv.textContent = char;
        letterDiv.dataset.letter = char;
        
        // Apply dynamic sizing
        letterDiv.style.width = `${finalLetterSize}px`;
        letterDiv.style.height = `${finalLetterSize}px`;
        letterDiv.style.fontSize = `${finalLetterSize * 0.43}px`;
        letterDiv.style.position = 'absolute';
        letterDiv.style.top = '0';
        letterDiv.style.cursor = 'grab';
        
        // Create Letter object
        const letter = new Letter(char, index, letterDiv);
        letters.push(letter);
        
        // Add drag event listeners
        letterDiv.addEventListener('mousedown', startDrag);
        letterDiv.addEventListener('touchstart', startDrag, { passive: false });
        
        // Add hover animations
        letterDiv.addEventListener('mouseenter', () => {
            if (!isDragging) {
                gsap.to(letterDiv, { 
                    duration: 0.2, 
                    scale: 1.05,
                    ease: 'power2.out' 
                });
            }
        });
        
        letterDiv.addEventListener('mouseleave', () => {
            if (!isDragging) {
                gsap.to(letterDiv, { 
                    duration: 0.2, 
                    scale: 1, 
                    ease: 'power2.out' 
                });
            }
        });
        
        lettersContainer.appendChild(letterDiv);
    });
    
    // Initial positioning
    setTimeout(() => {
        letters.forEach(letter => {
            letter.updateTargetPosition();
            letter.setPosition(letter.targetX);
        });
        startAnimationLoop();
    }, 10);
}

// Animation loop
function startAnimationLoop() {
    function animate() {
        letters.forEach(letter => letter.update());
        animationFrame = requestAnimationFrame(animate);
    }
    animate();
}

// Drag system
function startDrag(e) {
    if (gameWon) return; // Don't allow dragging after puzzle is solved
    
    e.preventDefault();
    
    const element = e.currentTarget;
    draggedLetter = letters.find(letter => letter.element === element);
    
    if (!draggedLetter) return;
    
    draggedLetter.isDragging = true;
    isDragging = true;
    
    // Get initial mouse/touch position
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Calculate offset from element center
    const rect = element.getBoundingClientRect();
    dragOffset.x = clientX - rect.left - rect.width / 2;
    dragOffset.y = clientY - rect.top - rect.height / 2;
    
    // Add dragging class and GSAP animation
    element.classList.add('dragging');
    element.style.cursor = 'grabbing';
    gsap.to(element, {
        duration: 0.2,
        scale: 1.15,
        rotation: 5,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
        ease: 'power2.out',
        zIndex: 1000
    });
    
    // Add event listeners for drag movement
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', endDrag);
}

function handleDragMove(e) {
    if (!isDragging || !draggedLetter) return;
    
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const containerRect = lettersContainer.getBoundingClientRect();
    
    // Update dragged letter position
    const newX = clientX - containerRect.left - dragOffset.x - draggedLetter.element.offsetWidth / 2;
    draggedLetter.element.style.left = `${newX}px`;
    
    // Calculate which position this letter should be in
    const letterWidth = draggedLetter.element.offsetWidth;
    const containerWidth = lettersContainer.offsetWidth;
    const gap = 4;
    
    const totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
    const startX = (containerWidth - totalWidth) / 2;
    
    let newIndex = Math.round((newX - startX) / (letterWidth + gap));
    newIndex = Math.max(0, Math.min(letters.length - 1, newIndex));
    
    // Reorder letters array if needed
    if (newIndex !== draggedLetter.index) {
        // Remove from current position
        letters.splice(draggedLetter.index, 1);
        // Insert at new position
        letters.splice(newIndex, 0, draggedLetter);
        
        // Update indices
        letters.forEach((letter, index) => {
            letter.index = index;
            letter.updateTargetPosition();
        });
    }
}

function endDrag(e) {
    if (!isDragging || !draggedLetter) return;
    
    e.preventDefault();
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', endDrag);
    
    // Update final position
    draggedLetter.updateTargetPosition();
    draggedLetter.setPosition(draggedLetter.targetX);
    draggedLetter.isDragging = false;
    
    // Clean up dragging state
    draggedLetter.element.classList.remove('dragging');
    draggedLetter.element.style.cursor = 'grab';
    
    // Animate back to normal state
    gsap.to(draggedLetter.element, {
        duration: 0.3,
        scale: 1,
        rotation: 0,
        boxShadow: 'none',
        ease: 'power2.out',
        zIndex: 1
    });
    
    // Reset state
    isDragging = false;
    draggedLetter = null;
    
    // Check if puzzle is solved
    setTimeout(checkIfCorrect, 200);
}

// Check if the current arrangement matches the correct word
function checkIfCorrect() {
    if (gameWon) return;
    
    const currentArrangement = letters.map(letter => letter.char).join('');
    const currentWord_upper = currentWord.toUpperCase();
    
    if (currentArrangement === currentWord_upper) {
        gameWon = true;
        celebrateWin();
    }
}

// Celebrate the win with animations
function celebrateWin() {
    // Check if hint was used
    const hintButton = document.querySelector('.unscramble-hint-btn');
    const hintUsed = hintButton && hintButton.disabled;
    
    // Mark scramble as complete and award stars (1 if hint used, 2 if not)
    const starsEarned = hintUsed ? 1 : 2;
    markScrambleComplete();
    addStars(starsEarned);
    updateCalendar();
    
    // Save the stars earned for this scramble
    const todayKey = getTodayKey();
    localStorage.setItem(`scrambleStars_${todayKey}`, String(starsEarned));
    
    // Update star display to show earned (orange) and unearned (grey) stars
    const starsElement = document.querySelector('.unscramble-stars');
    if (starsElement) {
        const maxStars = 2;
        let starsHTML = '';
        for (let i = 0; i < maxStars; i++) {
            if (i < starsEarned) {
                starsHTML += '<span style="color: #FF8C42;">★</span>';
            } else {
                starsHTML += '<span style="color: #ddd;">★</span>';
            }
        }
        starsElement.innerHTML = starsHTML;
    }
    
    // First, ensure all letters are properly positioned
    letters.forEach(letter => {
        letter.updateTargetPosition();
        letter.setPosition(letter.targetX);
        // Disable dragging by removing cursor style
        letter.element.style.cursor = 'default';
    });
    
    // Flash the letter divs
    const letterElements = letters.map(letter => letter.element);
    
    // Flash animation for letters
    gsap.to(letterElements, {
        duration: 0.3,
        backgroundColor: '#90EE90',
        scale: 1.05,
        ease: "power2.out",
        stagger: 0.05,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            // After flash, show success elements
            showSuccessElements();
        }
    });
}

// Show completed scramble without animation
function showCompletedScramble() {
    // Hide hint button
    const hintButton = document.querySelector('.unscramble-hint-btn');
    if (hintButton) {
        hintButton.style.display = 'none';
    }
    
    // Center justify the label
    const unscrambleLabel = document.querySelector('.unscramble-label');
    if (unscrambleLabel) {
        unscrambleLabel.style.textAlign = 'center';
    }
    
    // Get saved stars earned
    const todayKey = getTodayKey();
    const savedStarsEarned = parseInt(localStorage.getItem(`scrambleStars_${todayKey}`) || '2');
    
    // Update star display to show earned (orange) and unearned (grey) stars
    const starsElementCompleted = document.querySelector('.unscramble-stars');
    if (starsElementCompleted) {
        const maxStars = 2;
        let starsHTML = '';
        for (let i = 0; i < maxStars; i++) {
            if (i < savedStarsEarned) {
                starsHTML += '<span style="color: #FF8C42;">★</span>';
            } else {
                starsHTML += '<span style="color: #ddd;">★</span>';
            }
        }
        starsElementCompleted.innerHTML = starsHTML;
    }
    
    // Clear existing letter boxes and create new ones with correct answer
    lettersContainer.innerHTML = '';
    letters = [];
    
    const correctLetters = currentWord.toUpperCase().split('');
    
    // Calculate responsive letter size
    const containerWidth = lettersContainer.parentElement.offsetWidth - 30;
    const gap = 4;
    const gapSpace = (correctLetters.length - 1) * gap;
    const availableForLetters = containerWidth - gapSpace;
    const letterSize = Math.floor(availableForLetters / correctLetters.length);
    const finalLetterSize = Math.max(40, Math.min(60, letterSize));
    
    lettersContainer.style.height = `${finalLetterSize}px`;
    
    // Create letter divs with correct answer
    correctLetters.forEach((char, index) => {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter-box';
        letterDiv.textContent = char;
        letterDiv.dataset.letter = char;
        
        letterDiv.style.width = `${finalLetterSize}px`;
        letterDiv.style.height = `${finalLetterSize}px`;
        letterDiv.style.fontSize = `${finalLetterSize * 0.43}px`;
        letterDiv.style.position = 'absolute';
        letterDiv.style.top = '0';
        letterDiv.style.cursor = 'default';
        
        const letter = new Letter(char, index, letterDiv);
        letters.push(letter);
        lettersContainer.appendChild(letterDiv);
    });
    
    // Position letters immediately
    setTimeout(() => {
        letters.forEach(letter => {
            letter.updateTargetPosition();
            letter.setPosition(letter.targetX);
        });
    }, 10);
    
    // Show the fact and stars immediately without animation
    unscrambleLabel.textContent = currentDayData.event;
    const starsElement = document.querySelector('.unscramble-stars');
    if (starsElement) {
        starsElement.style.display = 'block';
        starsElement.style.opacity = '1';
    }
}

// Show success message and historical fact
function showSuccessElements() {
    // Get the stars element
    const starsElement = document.querySelector('.unscramble-stars');
    const hintButton = document.querySelector('.unscramble-hint-btn');
    
    // Get the current height of the container
    const currentHeight = onThisDayContainer.offsetHeight;
    
    // Step 1: Fade out the label and hint button together
    gsap.to([unscrambleLabel, hintButton], {
        duration: 0.3,
        opacity: 0,
        ease: "power2.out",
        onComplete: () => {
            // Step 2: Wait 0.2 seconds
            setTimeout(() => {
                // Hide hint button
                if (hintButton) {
                    hintButton.style.display = 'none';
                }
                
                // Step 3: Set fixed height, change text, measure target height
                onThisDayContainer.style.height = currentHeight + 'px';
                
                // Change text and justification
                unscrambleLabel.style.textAlign = 'center';
                unscrambleLabel.textContent = currentDayData.event;
                unscrambleLabel.style.opacity = '0';
            
                // Show stars temporarily to measure
            starsElement.style.display = 'block';
            starsElement.style.opacity = '0';
            
                // Use requestAnimationFrame to ensure layout is complete
                requestAnimationFrame(() => {
                    const targetHeight = onThisDayContainer.scrollHeight;
            
                    // Animate to target height
                gsap.to(onThisDayContainer, {
                        duration: 0.3,
                        height: targetHeight + 'px',
                    ease: "power2.inOut",
                    onComplete: () => {
                            onThisDayContainer.style.height = 'auto';
                            
                            // Step 5: Wait 0.2 seconds
                            setTimeout(() => {
                                // Step 6: Fade in text and stars
                        gsap.to(unscrambleLabel, {
                            duration: 0.5,
                            opacity: 1,
                            ease: "power2.out"
                        });
                                
                        gsap.to(starsElement, {
                            duration: 0.5,
                            opacity: 1,
                            ease: "power2.out"
                        });
                            }, 200);
                    }
                });
                });
            }, 200);
        }
    });
}

// Add hint button functionality
const hintButton = document.querySelector('.unscramble-hint-btn');
if (hintButton) {
    hintButton.addEventListener('click', function() {
        // Change button to lighter grey gradient and disable it
        hintButton.style.background = 'linear-gradient(to bottom, #e8e8e8, #d0d0d0)';
        hintButton.style.cursor = 'not-allowed';
        hintButton.disabled = true;
        
        // Get the first letter of the correct word
        const firstLetter = currentWord.charAt(0).toUpperCase();
    
        // Update the label text
        const unscrambleLabel = document.querySelector('.unscramble-label');
        if (unscrambleLabel) {
            unscrambleLabel.textContent = `The first letter is ${firstLetter}`;
        }
    });
}

// Update calendar with star counts for the week
function updateCalendar() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Get all week boxes
    const weekBoxes = document.querySelectorAll('.week-box');
    
    // Calculate the start of the week (Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    
    
    weekBoxes.forEach((box, index) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + index);
        
        const dayKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
        const dayNumberElement = box.querySelector('.day-number');
        
        if (index < dayOfWeek) {
            // Past days
            const stars = parseInt(localStorage.getItem(`dailyStars_${dayKey}`) || '0');
            dayNumberElement.textContent = stars;
        } else if (index === dayOfWeek) {
            // Today
            const stars = getDailyStars();
            dayNumberElement.textContent = stars;
        } else {
            // Future days
            dayNumberElement.innerHTML = '&nbsp;';
        }
    });
}

// Reset progress (Q key)
document.addEventListener('keydown', (e) => {
    if (e.key === 'q' || e.key === 'Q') {
        // Clear all progress
        const todayKey = getTodayKey();
        
        console.log('[Reset] Resetting all data for:', todayKey);
        console.log('[Reset] Before removal - highLowComplete:', localStorage.getItem(`highLowComplete_${todayKey}`));
        
        // Clear ALL highLow data (including old date formats)
        console.log('[Reset] Clearing all highLow-related data...');
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('highLow') || key.includes('scramble') || key.includes('mystery') || 
                        key.includes('beticle') || key.includes('memory') || key.includes('blackjack') || 
                        key.includes('lostAndFound') || key.includes('multipleChoice') || key.includes('factOrFiction'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => {
            console.log('[Reset] Removing:', key);
            localStorage.removeItem(key);
        });
        
        console.log('[Reset] After removal - highLowComplete:', localStorage.getItem(`highLowComplete_${todayKey}`));
        
        // Reset mystery word completion and state
        localStorage.removeItem(`mysteryWordComplete_${todayKey}`);
        localStorage.removeItem(`mysteryWordState_${todayKey}`);
        
        // Reset beticle completion and state
        localStorage.removeItem(`beticleComplete_${todayKey}`);
        localStorage.removeItem(`beticleState_${todayKey}`);
        
        // Reset memory game completion and data
        localStorage.removeItem(`memoryComplete_${todayKey}`);
        localStorage.removeItem(`memoryScore_${todayKey}`);
        localStorage.removeItem(`memoryStars_${todayKey}`);
        localStorage.removeItem(`blackjackComplete_${todayKey}`);
        localStorage.removeItem(`blackjackScore_${todayKey}`);
        localStorage.removeItem(`blackjackStars_${todayKey}`);
        localStorage.removeItem(`lostAndFoundComplete_${todayKey}`);
        localStorage.removeItem(`lostAndFoundScore_${todayKey}`);
        localStorage.removeItem(`lostAndFoundStars_${todayKey}`);
        
        // Reset daily stars to zero
        localStorage.setItem(`dailyStars_${todayKey}`, '0');
        
        // Reset total stars to zero
        localStorage.setItem('totalStars', '0');
        
        // Reset move stars to zero
        localStorage.removeItem(`moveStars_${todayKey}`);
        
        // Reset coins
        localStorage.removeItem('goldCoins');
        localStorage.removeItem('silverCoins');
        localStorage.removeItem('bronzeCoins');
        
        // Reset journey progress
        localStorage.removeItem('journeyLevel');
        for (let i = 1; i <= 10; i++) {
            localStorage.removeItem(`journeyPosition_level${i}`);
        }
        
        console.log('[Reset] All data cleared, reloading page...');
        
        // Update displays immediately before reload
        updateStarDisplay();
        updateWalletStars();
        updateRivalStars();
        updateMemoryDisplay();
        updateBlackjackDisplay();
        if (typeof loadGameScores === 'function') {
            loadGameScores();
        }
        updateMysteryWordStars();
        updateBeticleStars();
        updateCalendar();
        
        // Small delay to ensure display updates before reload
        setTimeout(() => {
            // location.reload();
        }, 100);
    }
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGameData);
} else {
    loadGameData();
}


// Unified Scramble Game - Works in both iframe and main page contexts

// Game state
let gameData = [];
let currentWord = '';
let scrambledLetters = [];
let currentDayData = null;
let gameWon = false;

// Detect context: iframe (standalone game) or main page
const isIframeContext = document.getElementById('lettersContainer') !== null;
const isMainPageContext = document.querySelector('.unscramble-boxes') !== null;

// DOM elements - will be set based on context
let lettersContainer = null;
let successMessage = null;
let gameContainer = null;
let gameHeader = null;
let historicalFact = null;
let unscrambleLabel = null;
let onThisDayContainer = null;

// Drag system state
let letters = [];
let isDragging = false;
let draggedLetter = null;
let dragOffset = { x: 0, y: 0 };
let animationFrame = null;

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

// Save the word and day data to localStorage
function saveScrambleWord() {
    const todayKey = getTodayKey();
    if (currentDayData && currentWord) {
        const wordData = {
            word: currentWord,
            dayData: currentDayData
        };
        localStorage.setItem(`scrambleWord_${todayKey}`, JSON.stringify(wordData));
    }
}

// Load the saved word and day data from localStorage
function loadScrambleWord() {
    const todayKey = getTodayKey();
    const savedWordData = localStorage.getItem(`scrambleWord_${todayKey}`);
    if (savedWordData) {
        try {
            const wordData = JSON.parse(savedWordData);
            return wordData;
        } catch (error) {
            console.error('Error loading saved scramble word:', error);
            return null;
        }
    }
    return null;
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
    
    // Award stars and games played (1 point per game, only once per game)
    if (window.awardStars) {
        window.awardStars(count, 'scramble');
    } else {
        // Fallback if awardStars not available
        const currentGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
        localStorage.setItem('gamesPlayed', String(Math.max(0, currentGamesPlayed + 1)));
    }
    
    updateStarDisplay();
    updateWalletStars();
    updateRivalStars();
}

function updateStarDisplay() {
    // Don't update .star-count here - it should only show usable stars via updateMoveStarsDisplay
    // Update usable stars display if available
    if (window.updateMoveStarsDisplay) {
        window.updateMoveStarsDisplay();
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
            starIcon.style.color = '#FF8C42';
        } else {
            // Fallback: if star icon doesn't exist, recreate the structure
            userRivalStars.innerHTML = `<span class="star-icon" style="color: #FF8C42;">★</span> x ${stars}`;
        }
    }
    if (window.updateRivalsYouStarCount) window.updateRivalsYouStarCount();
}

// Check and update mystery word stars
function updateMysteryWordStars() {
    const todayKey = getTodayKey();
    const mysteryWordStars = document.getElementById('mysteryWordStars');
    const isMysteryComplete = localStorage.getItem(`mysteryWordComplete_${todayKey}`) === 'true';
    
    if (mysteryWordStars && isMysteryComplete) {
        mysteryWordStars.style.color = '#FF8C42';
    }
}

// Check and update beticle stars
function updateBeticleStars() {
    const todayKey = getTodayKey();
    const beticleStars = document.getElementById('beticleStars');
    const isBeticleComplete = localStorage.getItem(`beticleComplete_${todayKey}`) === 'true';
    
    if (beticleStars && isBeticleComplete) {
        beticleStars.style.color = '#FF8C42';
    }
}

// Check and update memory display
function updateMemoryDisplay() {
    const todayKey = getTodayKey();
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
                    star.style.color = '#FF8C42';
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
                    star.style.color = '#FF8C42';
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
                    star.style.color = '#FF8C42';
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
                    star.style.color = '#FF8C42';
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
                    star.style.color = '#FF8C42';
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
                    star.style.color = '#FF8C42';
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
    
    // Load Phrases stars
    const phrasesStars = document.getElementById('phrasesStars');
    const savedPhrasesStars = localStorage.getItem(`phrasesStars_${todayKey}`);
    
    if (phrasesStars && savedPhrasesStars) {
        const starsEarned = parseInt(savedPhrasesStars) || 0;
        phrasesStars.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            if (i < starsEarned) {
                star.style.color = '#FF8C42';
            } else {
                star.style.color = '#ddd';
            }
            phrasesStars.appendChild(star);
        }
    } else if (phrasesStars) {
        phrasesStars.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = '#ddd';
            phrasesStars.appendChild(star);
        }
    }
    
    // Load Suspect stars
    const suspectStars = document.getElementById('suspectStars');
    const savedSuspectStars = localStorage.getItem(`suspectStars_${todayKey}`);
    
    if (suspectStars && savedSuspectStars) {
        const starsEarned = parseInt(savedSuspectStars) || 0;
        suspectStars.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            if (i < starsEarned) {
                star.style.color = '#FF8C42';
            } else {
                star.style.color = '#ddd';
            }
            suspectStars.appendChild(star);
        }
    } else if (suspectStars) {
        suspectStars.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = '#ddd';
            suspectStars.appendChild(star);
        }
    }
}

// Expose functions to window for iframe access
window.updateWalletStars = updateWalletStars;
window.updateRivalStars = updateRivalStars;
window.loadGameScores = loadGameScores;
window.updateMysteryWordStars = updateMysteryWordStars;
window.updateBeticleStars = updateBeticleStars;
window.updateMemoryDisplay = updateMemoryDisplay;
window.updateBlackjackDisplay = updateBlackjackDisplay;
window.updatePhrasesStars = function() {
    const todayKey = getTodayKey();
    const phrasesStars = document.getElementById('phrasesStars');
    const isPhrasesComplete = localStorage.getItem(`phrasesComplete_${todayKey}`) === 'true';
    
    if (isPhrasesComplete) {
        const starsEarned = parseInt(localStorage.getItem(`phrasesStars_${todayKey}`) || '0');
        
        if (phrasesStars) {
            phrasesStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                if (i < starsEarned) {
                    star.style.color = '#FF8C42';
                } else {
                    star.style.color = '#ddd';
                }
                phrasesStars.appendChild(star);
            }
        }
    }
};

window.updateSuspectStars = function() {
    const todayKey = getTodayKey();
    const suspectStars = document.getElementById('suspectStars');
    const isSuspectComplete = localStorage.getItem(`suspectComplete_${todayKey}`) === 'true';
    
    if (isSuspectComplete) {
        const starsEarned = parseInt(localStorage.getItem(`suspectStars_${todayKey}`) || '0');
        
        if (suspectStars) {
            suspectStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                if (i < starsEarned) {
                    star.style.color = '#FF8C42';
                } else {
                    star.style.color = '#ddd';
                }
                suspectStars.appendChild(star);
            }
        }
    }
};

// Pick a random day from gameVars
function pickRandomDay() {
    return getRandomScrambleDay();
}

// Scramble the letters of a word
function scrambleWord(word) {
    const letters = word.toUpperCase().split('');
    
    if (isIframeContext) {
        // Iframe version: For words 7+ letters, keep first and last letters in place
        if (letters.length >= 7) {
            const middleLetters = letters.slice(1, -1);
            
            // Fisher-Yates shuffle algorithm for middle letters only
            for (let i = middleLetters.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [middleLetters[i], middleLetters[j]] = [middleLetters[j], middleLetters[i]];
            }
            
            // Reconstruct with first and last in original positions
            return [letters[0], ...middleLetters, letters[letters.length - 1]];
        } else {
            // For shorter words, scramble all letters
            const scrambled = [...letters];
            
            // Fisher-Yates shuffle algorithm
            for (let i = scrambled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
            }
            
            return scrambled;
        }
    } else {
        // Main page version: ensure no letter is in correct position
        const scrambled = [...letters];
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
}

// Letter class for position management
class Letter {
    constructor(char, index, element = null) {
        this.char = char;
        this.index = index;
        this.targetX = 0;
        this.currentX = 0;
        this.element = element;
        this.isDragging = false;
    }
    
    updateTargetPosition() {
        if (!this.element || !lettersContainer) return;
        
        const letterWidth = this.element.offsetWidth;
        const containerWidth = lettersContainer.offsetWidth;
        
        if (isIframeContext) {
            const availableWidth = containerWidth - 40; // Leave 20px margin on each side
            let gap = 10;
            let totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
            
            if (totalWidth > availableWidth) {
                gap = Math.max(5, (availableWidth - letters.length * letterWidth) / (letters.length - 1));
                totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
            }
            
            const startX = (containerWidth - totalWidth) / 2;
            this.targetX = startX + this.index * (letterWidth + gap);
        } else {
            const gap = 4; // Match the gap from CSS
            const totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
            const startX = (containerWidth - totalWidth) / 2;
            this.targetX = startX + this.index * (letterWidth + gap);
        }
    }
    
    lerp(current, target, factor = 0.15) {
        return current + (target - current) * factor;
    }
    
    update() {
        if (!this.isDragging && this.element) {
            this.currentX = this.lerp(this.currentX, this.targetX);
            this.element.style.left = `${this.currentX}px`;
        }
    }
    
    setPosition(x) {
        this.currentX = x;
        this.targetX = x;
        if (this.element) {
            this.element.style.left = `${x}px`;
        }
    }
}

// Initialize DOM elements based on context
function initializeDOMElements() {
    if (isIframeContext) {
        lettersContainer = document.getElementById('lettersContainer');
        successMessage = document.getElementById('successMessage');
        gameContainer = document.getElementById('gameContainer');
        gameHeader = document.getElementById('gameHeader');
        historicalFact = document.getElementById('historicalFact');
    } else {
        lettersContainer = document.querySelector('.unscramble-boxes');
        unscrambleLabel = document.querySelector('.unscramble-label');
        onThisDayContainer = document.querySelector('.on-this-day-container');
    }
}

// Create letter divs
function createLetterDivs(letterChars) {
    if (!lettersContainer) return;
    
    lettersContainer.innerHTML = '';
    letters = [];
    
    let finalLetterSize;
    let letterClassName;
    
    if (isIframeContext) {
        // Iframe version: Calculate responsive letter size based on viewport
        const viewportWidth = window.innerWidth;
        const availableWidth = Math.min(viewportWidth * 0.9, 800);
        const gapSpace = (letterChars.length - 1) * 10;
        const availableForLetters = availableWidth - gapSpace;
        const letterSize = Math.floor(availableForLetters / letterChars.length);
        finalLetterSize = Math.max(40, Math.min(80, letterSize));
        letterClassName = 'letter';
    } else {
        // Main page version: Calculate responsive letter size based on container
        const containerWidth = lettersContainer.parentElement.offsetWidth - 30;
        const gap = 4;
        const gapSpace = (letterChars.length - 1) * gap;
        const availableForLetters = containerWidth - gapSpace;
        const letterSize = Math.floor(availableForLetters / letterChars.length);
        finalLetterSize = Math.max(40, Math.min(60, letterSize));
        letterClassName = 'letter-box';
    }
    
    // Update container height
    lettersContainer.style.height = `${finalLetterSize}px`;
    
    letterChars.forEach((char, index) => {
        const letterDiv = document.createElement('div');
        letterDiv.className = letterClassName;
        letterDiv.textContent = char;
        letterDiv.dataset.letter = char;
        
        if (isIframeContext) {
            letterDiv.dataset.originalIndex = index;
            letterDiv.style.width = `${finalLetterSize}px`;
            letterDiv.style.height = `${finalLetterSize}px`;
            letterDiv.style.fontSize = `${finalLetterSize * 0.4}px`;
            
            // Check if this letter should be draggable (not first/last for 7+ letter words)
            const isFixedLetter = letterChars.length >= 7 && (index === 0 || index === letterChars.length - 1);
            
            if (!isFixedLetter) {
                letterDiv.addEventListener('mousedown', startDrag);
                letterDiv.addEventListener('touchstart', startDrag, { passive: false });
                
                // Add GSAP hover animations
                letterDiv.addEventListener('mouseenter', () => {
                    if (!isDragging) {
                        gsap.to(letterDiv, { 
                            duration: 0.2, 
                            backgroundColor: '#d0d0d0', 
                            scale: 1.05, 
                            ease: 'power2.out' 
                        });
                    }
                });
                
                letterDiv.addEventListener('mouseleave', () => {
                    if (!isDragging) {
                        gsap.to(letterDiv, { 
                            duration: 0.2, 
                            backgroundColor: '#c0c0c0', 
                            scale: 1, 
                            ease: 'power2.out' 
                        });
                    }
                });
            } else {
                letterDiv.classList.add('fixed-letter');
            }
        } else {
            letterDiv.style.width = `${finalLetterSize}px`;
            letterDiv.style.height = `${finalLetterSize}px`;
            letterDiv.style.fontSize = `${finalLetterSize * 0.43}px`;
            letterDiv.style.position = 'absolute';
            letterDiv.style.top = '0';
            letterDiv.style.cursor = 'grab';
            
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
        }
        
        const letter = new Letter(char, index, letterDiv);
        letters.push(letter);
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
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    function animate() {
        letters.forEach(letter => letter.update());
        animationFrame = requestAnimationFrame(animate);
    }
    animate();
}

// Drag system
function startDrag(e) {
    if (gameWon) return;
    
    e.preventDefault();
    
    const element = e.currentTarget;
    draggedLetter = letters.find(letter => letter.element === element);
    
    if (!draggedLetter) return;
    
    draggedLetter.isDragging = true;
    isDragging = true;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const rect = element.getBoundingClientRect();
    dragOffset.x = clientX - rect.left - rect.width / 2;
    dragOffset.y = clientY - rect.top - rect.height / 2;
    
    element.classList.add('dragging');
    if (isIframeContext) {
        gsap.to(element, {
            duration: 0.2,
            scale: 1.1,
            rotation: 5,
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            ease: 'power2.out'
        });
    } else {
        element.style.cursor = 'grabbing';
        gsap.to(element, {
            duration: 0.2,
            scale: 1.15,
            rotation: 5,
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
            ease: 'power2.out',
            zIndex: 1000
        });
    }
    
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
    
    const newX = clientX - containerRect.left - dragOffset.x - draggedLetter.element.offsetWidth / 2;
    draggedLetter.element.style.left = `${newX}px`;
    
    const letterWidth = draggedLetter.element.offsetWidth;
    const containerWidth = lettersContainer.offsetWidth;
    
    let gap, totalWidth, startX;
    
    if (isIframeContext) {
        const availableWidth = containerWidth - 40;
        gap = 10;
        totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
        
        if (totalWidth > availableWidth) {
            gap = Math.max(5, (availableWidth - letters.length * letterWidth) / (letters.length - 1));
            totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
        }
        startX = (containerWidth - totalWidth) / 2;
    } else {
        gap = 4;
        totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
        startX = (containerWidth - totalWidth) / 2;
    }
    
    let newIndex = Math.round((newX - startX) / (letterWidth + gap));
    newIndex = Math.max(0, Math.min(letters.length - 1, newIndex));
    
    if (newIndex !== draggedLetter.index) {
        const wordLength = letters.length;
        const hasFixedLetters = isIframeContext && wordLength >= 7;
        
        if (hasFixedLetters) {
            newIndex = Math.max(1, Math.min(wordLength - 2, newIndex));
        }
        
        if (newIndex !== draggedLetter.index) {
            letters.splice(draggedLetter.index, 1);
            letters.splice(newIndex, 0, draggedLetter);
            
            letters.forEach((letter, index) => {
                letter.index = index;
                letter.updateTargetPosition();
            });
        }
    }
}

function endDrag(e) {
    if (!isDragging || !draggedLetter) return;
    
    e.preventDefault();
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', endDrag);
    
    draggedLetter.updateTargetPosition();
    draggedLetter.setPosition(draggedLetter.targetX);
    draggedLetter.isDragging = false;
    
    draggedLetter.element.classList.remove('dragging');
    
    if (isIframeContext) {
        gsap.to(draggedLetter.element, {
            duration: 0.3,
            scale: 1,
            rotation: 0,
            boxShadow: 'none',
            ease: 'power2.out'
        });
    } else {
        draggedLetter.element.style.cursor = 'grab';
        gsap.to(draggedLetter.element, {
            duration: 0.3,
            scale: 1,
            rotation: 0,
            boxShadow: 'none',
            ease: 'power2.out',
            zIndex: 1
        });
    }
    
    isDragging = false;
    draggedLetter = null;
    
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
    letters.forEach(letter => {
        letter.updateTargetPosition();
        letter.setPosition(letter.targetX);
        if (letter.element) {
            letter.element.style.cursor = 'default';
        }
    });
    
    const letterElements = letters.map(letter => letter.element);
    
    if (isIframeContext) {
        // Iframe version: Flash animation then show success elements
        gsap.to(letterElements, {
            duration: 0.3,
            backgroundColor: '#90EE90',
            scale: 1.03,
            ease: "power2.out",
            stagger: 0.05,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                showSuccessElements();
            }
        });
    } else {
        // Main page version: Check hint, award stars, then show success
        const hintButton = document.querySelector('.unscramble-hint-btn');
        const hintUsed = hintButton && hintButton.disabled;
        
        const starsEarned = hintUsed ? 1 : 2;
        markScrambleComplete();
        addStars(starsEarned);
        if (window.updateCalendar) {
            window.updateCalendar();
        }
        
        const todayKey = getTodayKey();
        localStorage.setItem(`scrambleStars_${todayKey}`, String(starsEarned));
        saveScrambleWord();
        
        const starsElement = document.querySelector('.unscramble-stars');
        if (starsElement) {
            starsElement.style.display = 'none';
            const starElements = starsElement.querySelectorAll('.unscramble-star');
            starElements.forEach((star, index) => {
                if (index < starsEarned) {
                    star.classList.remove('grey');
                } else {
                    star.classList.add('grey');
                }
            });
            starsElement.style.opacity = '0';
        }
        
        gsap.to(letterElements, {
            duration: 0.3,
            backgroundColor: '#90EE90',
            scale: 1.05,
            ease: "power2.out",
            stagger: 0.05,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                showSuccessElements();
            }
        });
    }
}

// Show success elements (unified for both contexts)
function showSuccessElements() {
    if (isIframeContext) {
        // Iframe version: Show success message and historical fact
        if (successMessage) {
            gsap.to(successMessage, {
                duration: 0.8,
                opacity: 1,
                scale: 1.1,
                ease: "back.out(1.7)"
            });
        }
        
        if (gameContainer) {
            gsap.to(gameContainer, {
                duration: 1,
                y: -50,
                ease: "power2.out",
                delay: 0.5,
                onComplete: () => {
                    if (historicalFact) {
                        historicalFact.textContent = currentDayData.event;
                        
                        const lettersContainerRect = lettersContainer.getBoundingClientRect();
                        const factBoxTop = lettersContainerRect.bottom + 20;
                        
                        gsap.set(historicalFact, {
                            top: `${factBoxTop}px`
                        });
                        
                        gsap.to(historicalFact, {
                            duration: 1,
                            opacity: 1,
                            ease: "power2.out"
                        });
                    }
                    
                    if (!animationFrame) {
                        startAnimationLoop();
                    }
                }
            });
        }
        return;
    }
    
    // Main page version
    const starsElement = document.querySelector('.unscramble-stars');
    const hintButton = document.querySelector('.unscramble-hint-btn');
    
    if (!onThisDayContainer) return;
    
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
        // Desktop: stars already visible (grey) from CSS; no height animation
        if (hintButton) hintButton.style.display = 'none';
        if (unscrambleLabel) {
            unscrambleLabel.style.textAlign = 'center';
            unscrambleLabel.textContent = currentDayData.event;
            unscrambleLabel.style.opacity = '1';
        }
        if (starsElement) starsElement.style.opacity = '1';
        return;
    }

    const currentHeight = onThisDayContainer.offsetHeight;
    
    gsap.to([unscrambleLabel, hintButton], {
        duration: 0.3,
        opacity: 0,
        ease: "power2.out",
        onComplete: () => {
            setTimeout(() => {
                if (hintButton) {
                    hintButton.style.display = 'none';
                }
                
                onThisDayContainer.style.height = currentHeight + 'px';
                
                if (unscrambleLabel) {
                    unscrambleLabel.style.textAlign = 'center';
                    unscrambleLabel.textContent = currentDayData.event;
                    unscrambleLabel.style.opacity = '0';
                }
            
                if (starsElement) {
                    starsElement.style.display = 'flex';
                    starsElement.style.opacity = '0';
                    starsElement.style.visibility = 'hidden';
                }
            
                requestAnimationFrame(() => {
                    const targetHeight = onThisDayContainer.scrollHeight;
            
                    gsap.to(onThisDayContainer, {
                        duration: 0.3,
                        height: targetHeight + 'px',
                        ease: "power2.inOut",
                        onComplete: () => {
                            onThisDayContainer.style.height = 'auto';
                            
                            setTimeout(() => {
                                if (starsElement) {
                                    starsElement.style.visibility = 'visible';
                                    starsElement.style.display = 'flex';
                                }
                                
                                if (unscrambleLabel) {
                                    gsap.to(unscrambleLabel, {
                                        duration: 0.5,
                                        opacity: 1,
                                        ease: "power2.out"
                                    });
                                }
                                
                                if (starsElement) {
                                    gsap.to(starsElement, {
                                        duration: 0.5,
                                        opacity: 1,
                                        ease: "power2.out"
                                    });
                                }
                            }, 200);
                        }
                    });
                });
            }, 200);
        }
    });
}

// Show completed scramble (main page version)
function showCompletedScramble() {
    if (isIframeContext) return; // Not used in iframe context
    
    const savedWordData = loadScrambleWord();
    if (savedWordData && !currentWord) {
        currentDayData = savedWordData.dayData;
        currentWord = savedWordData.word;
    }
    
    const hintButton = document.querySelector('.unscramble-hint-btn');
    if (hintButton) {
        hintButton.style.display = 'none';
    }
    
    if (unscrambleLabel) {
        unscrambleLabel.style.textAlign = 'center';
    }
    
    const todayKey = getTodayKey();
    const savedStarsEarned = parseInt(localStorage.getItem(`scrambleStars_${todayKey}`) || '2');
    
    const starsElementCompleted = document.querySelector('.unscramble-stars');
    if (starsElementCompleted) {
        starsElementCompleted.style.display = 'flex';
        const starElements = starsElementCompleted.querySelectorAll('.unscramble-star');
        starElements.forEach((star, index) => {
            if (index < savedStarsEarned) {
                star.classList.remove('grey');
            } else {
                star.classList.add('grey');
            }
        });
        starsElementCompleted.style.opacity = '1';
    }
    
    if (!lettersContainer) return;
    
    lettersContainer.innerHTML = '';
    letters = [];
    
    const correctLetters = currentWord.toUpperCase().split('');
    
    const containerWidth = lettersContainer.parentElement.offsetWidth - 30;
    const gap = 4;
    const gapSpace = (correctLetters.length - 1) * gap;
    const availableForLetters = containerWidth - gapSpace;
    const letterSize = Math.floor(availableForLetters / correctLetters.length);
    const finalLetterSize = Math.max(40, Math.min(60, letterSize));
    
    lettersContainer.style.height = `${finalLetterSize}px`;
    
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
    
    setTimeout(() => {
        letters.forEach(letter => {
            letter.updateTargetPosition();
            letter.setPosition(letter.targetX);
        });
    }, 10);
    
    applyLetterBoxStyling();
    
    if (unscrambleLabel) {
        unscrambleLabel.textContent = currentDayData.event;
    }
    if (starsElementCompleted) {
        starsElementCompleted.style.display = 'flex';
        starsElementCompleted.style.opacity = '1';
    }
}

// Apply letter box styling: rely on CSS variables / base styles only
function applyLetterBoxStyling() {
    if (isIframeContext) return; // Only for main page
    const letterBoxes = document.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.style.background = '';
        box.style.color = '';
        box.style.border = '';
    });
}

// Add hint button functionality
function setupHintButton() {
    if (isIframeContext) return; // Only for main page
    
    const hintButton = document.querySelector('.unscramble-hint-btn');
    if (hintButton) {
        const newHintButton = hintButton.cloneNode(true);
        hintButton.parentNode.replaceChild(newHintButton, hintButton);
        
        newHintButton.addEventListener('click', function() {
            newHintButton.style.background = 'linear-gradient(to bottom, #e8e8e8, #d0d0d0)';
            newHintButton.style.cursor = 'not-allowed';
            newHintButton.disabled = true;
        
            const firstLetter = currentWord.charAt(0).toUpperCase();
    
            if (unscrambleLabel) {
                unscrambleLabel.textContent = `Hint : First letter is ${firstLetter}`;
            }
        });
    }
}

// Start the game (iframe version)
function startGame() {
    if (!isIframeContext) return;
    
    currentDayData = pickRandomDay();
    currentWord = currentDayData.word;
    scrambledLetters = scrambleWord(currentWord);
    gameWon = false;
    
    if (gameHeader) {
        const factDate = currentDayData.date.toUpperCase();
        gameHeader.textContent = `WARM UP - ${factDate}`;
        
        setTimeout(() => {
            if (gameContainer) {
                const gameContainerRect = gameContainer.getBoundingClientRect();
                const finalGameTop = gameContainerRect.top - 50;
                const headerTop = finalGameTop - 50;
                gameHeader.style.top = `${headerTop}px`;
            }
        }, 100);
    }
    
    console.log('Today\'s word:', currentWord);
    console.log('Event:', currentDayData.event);
    
    createLetterDivs(scrambledLetters);
}

// Initialize scramble functionality (main page version)
function initializeScramble() {
    if (isIframeContext) return;
    
    if (!lettersContainer) {
        console.error('Letter container not found');
        return;
    }
    
    updateStarDisplay();
    if (window.updateCalendar) {
        window.updateCalendar();
    }
    
    const savedWordData = loadScrambleWord();
    if (savedWordData) {
        currentDayData = savedWordData.dayData;
        currentWord = savedWordData.word;
        scrambledLetters = scrambleWord(currentWord);
    } else {
        currentDayData = pickRandomDay();
        currentWord = currentDayData.word;
        scrambledLetters = scrambleWord(currentWord);
    }
    
    if (isScrambleComplete()) {
        gameWon = true;
        showCompletedScramble();
        return;
    }
    
    gameWon = false;
    
    console.log('Today\'s word:', currentWord);
    
    createLetterDivs(scrambledLetters);
    setupHintButton();
    applyLetterBoxStyling();
}

// Load game data
async function loadGameData() {
    initializeDOMElements();
    
    if (isIframeContext) {
        startGame();
    } else {
        try {
            gameData = [];
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
            
            setTimeout(() => {
                const rivalStarIcons = document.querySelectorAll('#rival-page .star-icon');
                rivalStarIcons.forEach(icon => {
                    icon.style.color = '#FF8C42';
                });
            }, 100);
        } catch (error) {
            console.error('Error loading game data:', error);
        }
    }
}

// Recalculate letter layout for main-page scramble when container becomes visible
function resizeMainPageScramble() {
    if (!isMainPageContext) return;
    
    initializeDOMElements();
    if (!lettersContainer || !scrambledLetters || !scrambledLetters.length) return;

    // If today's scramble is already complete, render the solved word layout
    if (isScrambleComplete()) {
        showCompletedScramble();
    } else {
        // Otherwise, re-create the scrambled layout based on the current container width
        createLetterDivs(scrambledLetters);
        applyLetterBoxStyling();
    }
}

// Clean up function for game reset
function resetGame() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    isDragging = false;
    draggedLetter = null;
    letters = [];
}

// Reset and reload the game (for 'q' key handler)
function resetAndReloadGame() {
    resetGame();
    gameWon = false;
    currentWord = '';
    scrambledLetters = [];
    currentDayData = null;
    
    if (isIframeContext) {
        if (successMessage) {
            successMessage.style.opacity = '0';
        }
        if (historicalFact) {
            historicalFact.style.opacity = '0';
            historicalFact.textContent = '';
        }
        if (gameContainer) {
            gsap.set(gameContainer, { y: 0 });
        }
    } else {
        if (unscrambleLabel) {
            unscrambleLabel.textContent = 'Unscramble the letters';
            unscrambleLabel.style.textAlign = '';
            unscrambleLabel.style.opacity = '1';
        }
        
        const starsElement = document.querySelector('.unscramble-stars');
        if (starsElement) {
            starsElement.style.display = 'none';
            starsElement.style.opacity = '0';
            const starElements = starsElement.querySelectorAll('.unscramble-star');
            starElements.forEach(star => {
                star.classList.add('grey');
            });
        }
        
        const hintButton = document.querySelector('.unscramble-hint-btn');
        if (hintButton) {
            hintButton.style.display = '';
            hintButton.style.background = '';
            hintButton.style.cursor = '';
            hintButton.disabled = false;
        }
    }
    
    loadGameData();
}

// Make reset function globally accessible
window.resetScrambleGame = resetAndReloadGame;

// Setup hint button when DOM is ready (main page only)
if (!isIframeContext) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupHintButton);
    } else {
        setupHintButton();
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGameData);
} else {
    loadGameData();
}

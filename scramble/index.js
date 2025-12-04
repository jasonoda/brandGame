// Game state
let gameData = [];
let currentWord = '';
let scrambledLetters = [];
let currentDayData = null;
let gameWon = false;

// DOM elements
const lettersContainer = document.getElementById('lettersContainer');
const successMessage = document.getElementById('successMessage');
const gameContainer = document.getElementById('gameContainer');
const gameHeader = document.getElementById('gameHeader');
const historicalFact = document.getElementById('historicalFact');
const factContent = document.getElementById('factContent');

// Drag system state
let letters = [];
let isDragging = false;
let draggedLetter = null;
let dragOffset = { x: 0, y: 0 };
let animationFrame = null;

// Load the JSON data
async function loadGameData() {
    try {
        const response = await fetch('history.json');
        gameData = await response.json();
        startGame();
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

// Pick a random day from the data
function pickRandomDay() {
    const randomIndex = Math.floor(Math.random() * gameData.length);
    return gameData[randomIndex];
}

// Scramble the letters of a word
function scrambleWord(word) {
    const letters = word.toUpperCase().split('');
    
    // For words 7+ letters, keep first and last letters in place
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
}

// Letter class for position management
class Letter {
    constructor(char, index) {
        this.char = char;
        this.index = index;
        this.targetX = 0;
        this.currentX = 0;
        this.element = null;
        this.isDragging = false;
    }
    
    updateTargetPosition() {
        const letterWidth = this.element.offsetWidth;
        const containerWidth = lettersContainer.offsetWidth;
        const availableWidth = containerWidth - 40; // Leave 20px margin on each side
        
        // Calculate gap based on available space
        let gap = 10;
        let totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
        
        // If total width exceeds available space, reduce gap
        if (totalWidth > availableWidth) {
            gap = Math.max(5, (availableWidth - letters.length * letterWidth) / (letters.length - 1));
            totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
        }
        
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

// Create letter divs with new system
function createLetterDivs(letterChars) {
    lettersContainer.innerHTML = '';
    letters = [];
    
    // Calculate responsive letter size based on viewport and word length
    const viewportWidth = window.innerWidth;
    const availableWidth = Math.min(viewportWidth * 0.9, 800); // Use 90% of viewport, max 800px
    const gapSpace = (letterChars.length - 1) * 10; // Space for gaps between letters
    const availableForLetters = availableWidth - gapSpace;
    const letterSize = Math.floor(availableForLetters / letterChars.length);
    
    // Clamp between reasonable bounds
    const finalLetterSize = Math.max(40, Math.min(80, letterSize));
    
    letterChars.forEach((char, index) => {
        const letter = new Letter(char, index);
        
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter';
        letterDiv.textContent = char;
        letterDiv.dataset.originalIndex = index; // Keep track of original creation order
        letterDiv.dataset.letter = char;
        
        // Apply dynamic sizing
        letterDiv.style.width = `${finalLetterSize}px`;
        letterDiv.style.height = `${finalLetterSize}px`;
        letterDiv.style.fontSize = `${finalLetterSize * 0.4}px`; // Font size proportional to box size
        
        // Store reference
        letter.element = letterDiv;
        letters.push(letter);
        
        // Check if this letter should be draggable (not first/last for 7+ letter words)
        const isFixedLetter = letterChars.length >= 7 && (index === 0 || index === letterChars.length - 1);
        
        if (!isFixedLetter) {
            // Add event listeners only for draggable letters
            letterDiv.addEventListener('mousedown', startDrag);
            letterDiv.addEventListener('touchstart', startDrag, { passive: false });
        } else {
            // Add fixed letter styling
            letterDiv.classList.add('fixed-letter');
        }
        
        // Add GSAP hover animations only for draggable letters
        if (!isFixedLetter) {
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
        }
        
        lettersContainer.appendChild(letterDiv);
    });
    
    // Update container height to match letter size
    lettersContainer.style.height = `${finalLetterSize}px`;
    
    // Initial positioning
    setTimeout(() => {
        letters.forEach(letter => {
            letter.updateTargetPosition();
            letter.setPosition(letter.targetX); // Use setPosition to avoid lerping on initial setup
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

// New drag system
function startDrag(e) {
    e.preventDefault();
    
    const element = e.currentTarget;
    // Find the letter by matching the element
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
    gsap.to(element, {
        duration: 0.2,
        scale: 1.1,
        rotation: 5,
        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
        ease: 'power2.out'
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
    const availableWidth = containerWidth - 40;
    
    // Calculate gap based on available space (same logic as updateTargetPosition)
    let gap = 10;
    let totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
    
    if (totalWidth > availableWidth) {
        gap = Math.max(5, (availableWidth - letters.length * letterWidth) / (letters.length - 1));
        totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
    }
    
    const startX = (containerWidth - totalWidth) / 2;
    
    let newIndex = Math.round((newX - startX) / (letterWidth + gap));
    newIndex = Math.max(0, Math.min(letters.length - 1, newIndex));
    
    // Reorder letters array if needed, but respect fixed positions
    if (newIndex !== draggedLetter.index) {
        const wordLength = letters.length;
        const hasFixedLetters = wordLength >= 7;
        
        // For words with fixed letters, constrain movement to middle positions
        if (hasFixedLetters) {
            // Don't allow dragging into first or last position
            newIndex = Math.max(1, Math.min(wordLength - 2, newIndex));
        }
        
        // Only reorder if the new position is different and valid
        if (newIndex !== draggedLetter.index) {
            // Remove from current position
            letters.splice(draggedLetter.index, 1);
            // Insert at new position
            letters.splice(newIndex, 0, draggedLetter);
            
            // Update indices for middle letters only
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
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', endDrag);
    
    // Update final position - set both current and target to avoid lerping back
    draggedLetter.updateTargetPosition();
    draggedLetter.setPosition(draggedLetter.targetX); // Immediately snap to final position
    draggedLetter.isDragging = false;
    
    // Clean up dragging state properly with GSAP animation
    draggedLetter.element.classList.remove('dragging');
    
    // Animate back to normal state
    gsap.to(draggedLetter.element, {
        duration: 0.3,
        scale: 1,
        rotation: 0,
        boxShadow: 'none',
        ease: 'power2.out'
    });
    
    // Reset state
    isDragging = false;
    draggedLetter = null;
    
    // Check if puzzle is solved
    setTimeout(checkIfCorrect, 200);
}

// Check if the current arrangement matches the correct word
function checkIfCorrect() {
    if (gameWon) return; // Prevent multiple wins
    
    const currentArrangement = letters.map(letter => letter.char).join('');
    const currentWord_upper = currentWord.toUpperCase();
    
    if (currentArrangement === currentWord_upper) {
        gameWon = true;
        celebrateWin();
    }
}

// Celebrate the win with animations
function celebrateWin() {
    // First, ensure all letters are properly positioned before celebrating
    letters.forEach(letter => {
        letter.updateTargetPosition();
        letter.setPosition(letter.targetX);
    });
    
    // Flash the letter divs
    const letterElements = letters.map(letter => letter.element);
    
    // Flash animation for letters (single flash)
    gsap.to(letterElements, {
        duration: 0.3,
        backgroundColor: '#90EE90',
        scale: 1.03,
        ease: "power2.out",
        stagger: 0.05,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            // After flash, show success message and move elements
            showSuccessElements();
        }
    });
}

// Show success message and historical fact
function showSuccessElements() {
    // Fade in "GOT IT!" message
    gsap.to(successMessage, {
        duration: 0.8,
        opacity: 1,
        scale: 1.1,
        ease: "back.out(1.7)"
    });
    
    // Move game container up (reduced by 50%) - header stays in place
    gsap.to(gameContainer, {
        duration: 1,
        y: -50,
        ease: "power2.out",
        delay: 0.5,
        onComplete: () => {
            // Set content and position
            historicalFact.textContent = currentDayData.event;
            
            // After letters have moved up, position the fact box
            const lettersContainerRect = lettersContainer.getBoundingClientRect();
            const factBoxTop = lettersContainerRect.bottom + 20;
            
            // Position and fade in historical fact
            gsap.set(historicalFact, {
                top: `${factBoxTop}px`
            });
            
            gsap.to(historicalFact, {
                duration: 1,
                opacity: 1,
                ease: "power2.out"
            });
            
            // Keep the animation loop running for any final positioning adjustments
            if (!animationFrame) {
                startAnimationLoop();
            }
        }
    });
}

// Start the game
function startGame() {
    currentDayData = pickRandomDay();
    currentWord = currentDayData.word;
    scrambledLetters = scrambleWord(currentWord);
    gameWon = false;
    
    // Set the header with the historical fact's date and position it
    const factDate = currentDayData.date.toUpperCase();
    gameHeader.textContent = `WARM UP - ${factDate}`;
    
    // Calculate header position based on game container's final position
    setTimeout(() => {
        const gameContainerRect = gameContainer.getBoundingClientRect();
        const finalGameTop = gameContainerRect.top - 50; // After it moves up 50px
        const headerTop = finalGameTop - 50; // 50px gap above final position
        
        gameHeader.style.top = `${headerTop}px`;
    }, 100); // Small delay to ensure elements are positioned
    
    console.log('Today\'s word:', currentWord); // For debugging
    console.log('Event:', currentDayData.event); // For debugging
    
    createLetterDivs(scrambledLetters);
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

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', loadGameData);

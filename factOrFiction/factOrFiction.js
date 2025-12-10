// Game state
let fofGameData = [];
let fofCurrentSet = null;
let fofSelectedStatements = new Set();
let fofGameWon = false;

// Local storage helper functions
function fofGetTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function isFOFComplete() {
    const todayKey = fofGetTodayKey();
    return localStorage.getItem(`factOrFictionComplete_${todayKey}`) === 'true';
}

function markFOFComplete() {
    const todayKey = fofGetTodayKey();
    localStorage.setItem(`factOrFictionComplete_${todayKey}`, 'true');
}

function fofGetDailyStars() {
    const todayKey = fofGetTodayKey();
    return parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
}

function fofAddStars(count) {
    const todayKey = fofGetTodayKey();
    const currentDailyStars = fofGetDailyStars();
    const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
    
    // Update daily stars
    localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + count));
    
    // Update total stars
    localStorage.setItem('totalStars', String(currentTotalStars + count));
    
    // Add move stars (same amount as regular stars)
    const currentMoveStars = parseInt(localStorage.getItem(`moveStars_${todayKey}`) || '0');
    localStorage.setItem(`moveStars_${todayKey}`, String(currentMoveStars + count));
    
    // Update the display
    if (window.updateHeaderStarCounter) {
        window.updateHeaderStarCounter();
    }
    if (window.updateWalletStars2) {
        window.updateWalletStars2();
    }
    if (window.updateCalendar) {
        window.updateCalendar();
    }
}

// Load game data from JSON
async function loadFOFData() {
    try {
        const response = await fetch('factOrFiction/factOrFiction.json');
        const allSets = await response.json();
        
        // Pick a random set
        const randomIndex = Math.floor(Math.random() * allSets.length);
        fofCurrentSet = allSets[randomIndex];
        fofGameData = fofCurrentSet.statements;
        
        // console.log('Today\'s Fact or Fiction set:', fofCurrentSet.set);
        
        initFOFGame();
    } catch (error) {
        // console.error('Error loading fact or fiction data:', error);
    }
}

// Initialize the game
function initFOFGame() {
    const container = document.querySelector('.fof-container');
    if (!container) return;
    
    // Check if already complete
    if (isFOFComplete()) {
        fofGameWon = true;
        showCompletedFOF();
        return;
    }
    
    fofGameWon = false;
    fofSelectedStatements.clear();
    
    // Display statements
    const buttonsContainer = document.querySelector('.fof-buttons');
    if (buttonsContainer) {
        buttonsContainer.innerHTML = '';
        
        fofGameData.forEach((item, index) => {
            const button = document.createElement('button');
            button.className = 'fof-button';
            button.textContent = item.statement;
            button.dataset.index = index;
            
            button.addEventListener('click', () => toggleStatement(index, button));
            
            buttonsContainer.appendChild(button);
        });
    }
    
    // Setup guess button
    const guessBtn = document.querySelector('.fof-guess-btn');
    if (guessBtn) {
        guessBtn.onclick = checkAnswers;
    }
}

// Toggle statement selection
function toggleStatement(index, button) {
    if (fofGameWon) return;
    
    if (fofSelectedStatements.has(index)) {
        fofSelectedStatements.delete(index);
        button.style.background = 'linear-gradient(to bottom, #FF8FA3, #FF6B82)';
    } else {
        fofSelectedStatements.add(index);
        button.style.background = 'linear-gradient(to bottom, #26D7A4, #1DB88A)';
    }
}

// Check answers
function checkAnswers() {
    if (fofGameWon) return;
    
    const buttons = document.querySelectorAll('.fof-button');
    const footer = document.querySelector('.fof-footer');
    
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
    });
    
    // Calculate correct answers and save results
    let correctCount = 0;
    const results = [];
    
    fofGameData.forEach((item, index) => {
        const isSelected = fofSelectedStatements.has(index);
        const shouldBeSelected = item.isFact;
        
        const isCorrect = isSelected === shouldBeSelected;
        if (isCorrect) {
            correctCount++;
        }
        
        // Save result for this question
        results.push({
            isCorrect: isCorrect,
            isFact: item.isFact
        });
        
        
        // Add check or X emoji
        const emoji = isCorrect ? ' ✓' : ' ✗';
        buttons[index].textContent = item.statement + emoji;
    });
    
    // Save stars earned and results
    const todayKey = fofGetTodayKey();
    localStorage.setItem(`factOrFictionStars_${todayKey}`, String(correctCount));
    localStorage.setItem(`factOrFictionResults_${todayKey}`, JSON.stringify(results));
    
    // Mark complete and award stars
    markFOFComplete();
    fofAddStars(correctCount);
    
    // Fade out footer
    const container = document.querySelector('.fof-container');
    const currentHeight = container.offsetHeight;
    
    gsap.to(footer, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
            footer.style.display = 'none';
            
            // Set explicit height to prevent jump
            container.style.height = currentHeight + 'px';
            
            // Show stars with animation
            showStars(correctCount);
        }
    });
    
    fofGameWon = true;
}

// Show stars
function showStars(correctCount) {
    const container = document.querySelector('.fof-container');
    const starsElement = document.querySelector('.fof-stars');
    
    if (starsElement && container) {
        let starsHTML = '';
        for (let i = 0; i < fofGameData.length; i++) {
            if (i < correctCount) {
                starsHTML += '<span style="color: #FF8C42;">★</span>';
            } else {
                starsHTML += '<span style="color: #999;">★</span>';
            }
        }
        starsElement.innerHTML = starsHTML;
        starsElement.style.display = 'block';
        starsElement.style.opacity = '0';
        
        // Wait a frame for the star element to render, then calculate height
        requestAnimationFrame(() => {
            const targetHeight = container.scrollHeight;
            
            // Animate container to new height
            gsap.to(container, {
                height: targetHeight + 'px',
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                    // Remove fixed height after animation
                    container.style.height = 'auto';
                    
                    // Fade in stars
                    gsap.to(starsElement, {
                        opacity: 1,
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                }
            });
        });
    }
}

// Show completed state
function showCompletedFOF() {
    const buttonsContainer = document.querySelector('.fof-buttons');
    const footer = document.querySelector('.fof-footer');
    const starsElement = document.querySelector('.fof-stars');
    
    // Get stored answers to show correct/incorrect marks
    const todayKey = fofGetTodayKey();
    const starsEarned = parseInt(localStorage.getItem(`factOrFictionStars_${todayKey}`) || '0');
    const resultsJSON = localStorage.getItem(`factOrFictionResults_${todayKey}`);
    const results = resultsJSON ? JSON.parse(resultsJSON) : [];
    
    if (buttonsContainer) {
        buttonsContainer.innerHTML = '';
        
        fofGameData.forEach((item, index) => {
            const button = document.createElement('button');
            button.className = 'fof-button';
            button.style.pointerEvents = 'none';
            
            // Get saved result for this question
            const result = results[index];
            const isCorrect = result ? result.isCorrect : true;
            const isFact = result ? result.isFact : item.isFact;
            
            // Keep default styling; do not change colors on reveal
            button.style.background = '';
            
            // Add check or X emoji based on whether user got it right
            const emoji = isCorrect ? ' ✓' : ' ✗';
            button.textContent = item.statement + emoji;
            
            buttonsContainer.appendChild(button);
        });
    }
    
    // Hide footer
    if (footer) {
        footer.style.display = 'none';
    }
    
    // Show stars
    if (starsElement) {
        let starsHTML = '';
        for (let i = 0; i < fofGameData.length; i++) {
            if (i < starsEarned) {
                starsHTML += '<span style="color: #FF8C42;">★</span>';
            } else {
                starsHTML += '<span style="color: #999;">★</span>';
            }
        }
        starsElement.innerHTML = starsHTML;
        starsElement.style.display = 'block';
        starsElement.style.opacity = '1';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadFOFData);


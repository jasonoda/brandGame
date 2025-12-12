// Game state
let mcGameData = [];
let mcCurrentQuestion = null;
let mcGameWon = false;

// Local storage helper functions
function mcGetTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function isMCComplete() {
    const todayKey = mcGetTodayKey();
    return localStorage.getItem(`multipleChoiceComplete_${todayKey}`) === 'true';
}

function markMCComplete() {
    const todayKey = mcGetTodayKey();
    localStorage.setItem(`multipleChoiceComplete_${todayKey}`, 'true');
}

// Save the question to localStorage
function saveMCQuestion() {
    const todayKey = mcGetTodayKey();
    if (mcCurrentQuestion) {
        localStorage.setItem(`multipleChoiceQuestion_${todayKey}`, JSON.stringify(mcCurrentQuestion));
    }
}

// Load the saved question from localStorage
function loadMCQuestion() {
    const todayKey = mcGetTodayKey();
    const savedQuestion = localStorage.getItem(`multipleChoiceQuestion_${todayKey}`);
    if (savedQuestion) {
        try {
            return JSON.parse(savedQuestion);
        } catch (error) {
            console.error('Error loading saved multiple choice question:', error);
            return null;
        }
    }
    return null;
}

function mcGetDailyStars() {
    const todayKey = mcGetTodayKey();
    return parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
}

function mcAddStars(count) {
    const todayKey = mcGetTodayKey();
    const currentDailyStars = mcGetDailyStars();
    const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
    
    // Update daily stars
    localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + count));
    
    // Update total stars
    localStorage.setItem('totalStars', String(currentTotalStars + count));
    
    // Award stars and games played (1 point per game, only once per game)
    if (window.awardStars) {
        window.awardStars(count, 'multipleChoice');
    } else {
        // Fallback if awardStars not available
        const currentGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
        localStorage.setItem('gamesPlayed', String(Math.max(0, currentGamesPlayed + 1)));
    }
    
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
async function loadMCData() {
    try {
        const response = await fetch('games/multipleChoice/multipleChoice.json');
        mcGameData = await response.json();
        initMCGame();
    } catch (error) {
        console.error('Error loading multiple choice data:', error);
    }
}

// Initialize the game
function initMCGame() {
    const container = document.querySelector('.mc-container');
    if (!container) return;
    
    // Try to load saved question first, otherwise pick random
    const savedQuestion = loadMCQuestion();
    if (savedQuestion) {
        mcCurrentQuestion = savedQuestion;
    } else {
        // Pick a random question
        if (mcGameData.length === 0) {
            console.log('No multiple choice questions available');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * mcGameData.length);
        mcCurrentQuestion = mcGameData[randomIndex];
    }
    
    // Check if already complete
    if (isMCComplete()) {
        mcGameWon = true;
        showCompletedMC();
        return;
    }
    
    mcGameWon = false;
    
    console.log('Today\'s MC question:', mcCurrentQuestion.question);
    console.log('Correct answer:', mcCurrentQuestion.answers[mcCurrentQuestion.correct]);
    
    // Display question
    const questionElement = document.querySelector('.mc-question');
    if (questionElement) {
        questionElement.textContent = mcCurrentQuestion.question;
    }
    
    // Display answer buttons
    const buttonsContainer = document.querySelector('.mc-buttons');
    const gradientColors = [
        'linear-gradient(to bottom, #F86DAA, #C6387A)',
        'linear-gradient(to bottom, #AB69E0, #7B37B0)',
        'linear-gradient(to bottom, #6B9FF8, #3B5FA8)',
        'linear-gradient(to bottom, #5EBEE8, #2E7EA8)'
    ];
    
    if (buttonsContainer) {
        buttonsContainer.innerHTML = '';
        
        mcCurrentQuestion.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'mc-button';
            button.textContent = answer;
            button.dataset.index = index;
            button.style.background = gradientColors[index];
            
            button.addEventListener('click', () => checkMCAnswer(index));
            
            buttonsContainer.appendChild(button);
        });
    }
}

// Check if answer is correct
function checkMCAnswer(selectedIndex) {
    if (mcGameWon) return;
    
    const isCorrect = selectedIndex === mcCurrentQuestion.correct;
    const buttons = document.querySelectorAll('.mc-button');
    
    // Disable all buttons
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
    });
    
    if (isCorrect) {
        // Correct answer
        buttons[selectedIndex].style.background = 'linear-gradient(to bottom, #26D7A4, #1DB88A)';
        
        // Grey out other buttons
        buttons.forEach((btn, index) => {
            if (index !== selectedIndex) {
                btn.style.background = 'linear-gradient(to bottom, #C8C8C8, #A8A8A8)';
            }
        });
        
        // Mark complete and award stars
        markMCComplete();
        mcAddStars(2);
        
        // Save stars earned
        const todayKey = mcGetTodayKey();
        localStorage.setItem(`multipleChoiceStars_${todayKey}`, '2');
        
        // Save the question so it can be reloaded
        saveMCQuestion();
        
        // Show stars with animation
        setTimeout(() => {
            const starsElement = document.querySelector('.mc-stars');
            if (starsElement) {
                starsElement.innerHTML = '<span style="color: #FF8C42;">★</span><span style="color: #FF8C42;">★</span>';
                starsElement.style.display = 'block';
                starsElement.style.opacity = '0';
                
                // First animate the container height
                gsap.to(starsElement, {
                    maxHeight: '30px',
                    duration: 0.3,
                    ease: 'power2.out',
                    onComplete: () => {
                        // Then fade in the stars with scale
                        gsap.to(starsElement, {
                            opacity: 1,
                            duration: 0.4,
                            ease: 'power2.out'
                        });
                        
                        gsap.fromTo(starsElement, 
                            { scale: 0.5 },
                            { 
                                scale: 1, 
                                duration: 0.4,
                                ease: 'back.out(1.7)'
                            }
                        );
                    }
                });
            }
        }, 500);
        
        mcGameWon = true;
    } else {
        // Wrong answer
        buttons[selectedIndex].style.background = 'linear-gradient(to bottom, #FF8FA3, #FF6B82)';
        
        // Grey out other buttons (except selected and correct)
        buttons.forEach((btn, index) => {
            if (index !== selectedIndex && index !== mcCurrentQuestion.correct) {
                btn.style.background = 'linear-gradient(to bottom, #C8C8C8, #A8A8A8)';
            }
        });
        
        // Show correct answer after delay
        setTimeout(() => {
            buttons[mcCurrentQuestion.correct].style.background = 'linear-gradient(to bottom, #26D7A4, #1DB88A)';
        }, 500);
        
        // Show grey stars with animation
        setTimeout(() => {
            const starsElement = document.querySelector('.mc-stars');
            if (starsElement) {
                starsElement.innerHTML = '<span style="color: #999;">★</span><span style="color: #999;">★</span>';
                starsElement.style.display = 'block';
                starsElement.style.opacity = '0';
                
                // First animate the container height
                gsap.to(starsElement, {
                    maxHeight: '30px',
                    duration: 0.3,
                    ease: 'power2.out',
                    onComplete: () => {
                        // Then fade in the grey stars
                        gsap.to(starsElement, {
                            opacity: 1,
                            duration: 0.4,
                            ease: 'power2.out'
                        });
                        
                        gsap.fromTo(starsElement, 
                            { scale: 0.5 },
                            { 
                                scale: 1, 
                                duration: 0.4,
                                ease: 'back.out(1.7)'
                            }
                        );
                    }
                });
            }
        }, 800);
    }
}

// Show completed state
function showCompletedMC() {
    // Load saved question if it exists (in case mcCurrentQuestion wasn't set)
    const savedQuestion = loadMCQuestion();
    if (savedQuestion && !mcCurrentQuestion) {
        mcCurrentQuestion = savedQuestion;
    }
    
    const questionElement = document.querySelector('.mc-question');
    if (questionElement && mcCurrentQuestion) {
        questionElement.textContent = mcCurrentQuestion.question;
    }
    
    const buttonsContainer = document.querySelector('.mc-buttons');
    const gradientColors = [
        'linear-gradient(to bottom, #F86DAA, #C6387A)',
        'linear-gradient(to bottom, #AB69E0, #7B37B0)',
        'linear-gradient(to bottom, #6B9FF8, #3B5FA8)',
        'linear-gradient(to bottom, #5EBEE8, #2E7EA8)'
    ];
    
    if (buttonsContainer) {
        buttonsContainer.innerHTML = '';
        
        mcCurrentQuestion.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'mc-button';
            button.textContent = answer;
            button.style.pointerEvents = 'none';
            
            if (index === mcCurrentQuestion.correct) {
                button.style.background = 'linear-gradient(to bottom, #26D7A4, #1DB88A)';
            } else {
                button.style.background = 'linear-gradient(to bottom, #C8C8C8, #A8A8A8)';
            }
            
            buttonsContainer.appendChild(button);
        });
    }
    
    // Show stars
    const todayKey = mcGetTodayKey();
    const starsEarned = parseInt(localStorage.getItem(`multipleChoiceStars_${todayKey}`) || '0');
    const starsElement = document.querySelector('.mc-stars');
    if (starsElement) {
        let starsHTML = '';
        const starColor = starsEarned > 0 ? '#FF8C42' : '#999';
        for (let i = 0; i < 2; i++) {
            starsHTML += `<span style="color: ${starColor};">★</span>`;
        }
        starsElement.innerHTML = starsHTML;
        starsElement.style.display = 'block';
        starsElement.style.opacity = '1';
        starsElement.style.maxHeight = '30px';
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMCData);
} else {
    loadMCData();
}


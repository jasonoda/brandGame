// Quiz Game - Based on quiz/thanksgiving.json
let quizGameData = [];
let quizCurrentSet = null;
let quizCurrentQuestionIndex = 0;
let quizCorrectCount = 0;
let quizGameWon = false;
let quizGameEnded = false;

// Local storage helper functions
function quizGetTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function isQuizComplete() {
    const todayKey = quizGetTodayKey();
    return localStorage.getItem(`quizComplete_${todayKey}`) === 'true';
}

function markQuizComplete() {
    const todayKey = quizGetTodayKey();
    localStorage.setItem(`quizComplete_${todayKey}`, 'true');
}

function saveQuizState() {
    const todayKey = quizGetTodayKey();
    const state = {
        setIndex: quizGameData.findIndex(set => set === quizCurrentSet),
        questionIndex: quizCurrentQuestionIndex,
        correctCount: quizCorrectCount,
        gameWon: quizGameWon,
        gameEnded: quizGameEnded
    };
    localStorage.setItem(`quizState_${todayKey}`, JSON.stringify(state));
}

function loadQuizState() {
    const todayKey = quizGetTodayKey();
    const savedState = localStorage.getItem(`quizState_${todayKey}`);
    
    if (!savedState) {
        return false;
    }
    
    // Make sure quiz data is loaded
    if (!quizGameData || quizGameData.length === 0) {
        return false;
    }
    
    try {
        const state = JSON.parse(savedState);
        
        // Restore the quiz set
        if (state.setIndex >= 0 && state.setIndex < quizGameData.length) {
            quizCurrentSet = quizGameData[state.setIndex];
        } else {
            return false;
        }
        
        // Restore game state
        quizCurrentQuestionIndex = state.questionIndex || 0;
        quizCorrectCount = state.correctCount || 0;
        quizGameWon = state.gameWon || false;
        quizGameEnded = state.gameEnded || false;
        
        return true;
    } catch (error) {
        console.error('Error loading quiz state:', error);
        return false;
    }
}


function quizGetDailyStars() {
    const todayKey = quizGetTodayKey();
    return parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
}

function quizAddStars(count) {
    const todayKey = quizGetTodayKey();
    const currentDailyStars = quizGetDailyStars();
    const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
    
    // Update daily stars
    localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + count));
    
    // Update total stars
    localStorage.setItem('totalStars', String(currentTotalStars + count));
    
    // Award stars and games played
    if (window.awardStars) {
        window.awardStars(count, 'quiz');
    } else {
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

// Load game data from gameVars
function loadQuizData() {
    try {
        quizGameData = getQuizData();
        initQuizGame();
    } catch (error) {
        console.error('Error loading quiz data:', error);
    }
}

// Get difficulty text
function getDifficultyText(questionIndex) {
    const difficulties = ['VERY EASY', 'EASY', 'MEDIUM', 'HARD', 'HARD'];
    return difficulties[questionIndex] || 'VERY EASY';
}

// Initialize the game
function initQuizGame() {
    const container = document.querySelector('.quiz-container');
    if (!container) return;
    
    // Reset game state variables
    quizCurrentSet = null;
    quizCurrentQuestionIndex = 0;
    quizCorrectCount = 0;
    quizGameWon = false;
    quizGameEnded = false;
    
    // Try to load saved state first
    const hasSavedState = loadQuizState();
    
    // Check if already complete
    if (isQuizComplete()) {
        // Make sure we have the saved set loaded
        if (!hasSavedState) {
            // If no saved state but marked complete, try to load it again
            loadQuizState();
        }
        if (quizCurrentSet) {
            quizGameWon = true;
            showCompletedQuiz();
            return;
        } else {
            console.error('Quiz marked complete but no saved set found');
            return;
        }
    }
    
    // If no saved state, pick random set
    if (!hasSavedState) {
        // Pick a random set
        if (quizGameData.length === 0) {
            console.log('No quiz sets available');
            return;
        }
        
        const randomSetIndex = Math.floor(Math.random() * quizGameData.length);
        quizCurrentSet = quizGameData[randomSetIndex];
        quizCurrentQuestionIndex = 0;
        quizCorrectCount = 0;
        // Save the initial state
        saveQuizState();
    }
    
    quizGameWon = false;
    quizGameEnded = false;
    
    displayQuestion();
}

// Display current question
function displayQuestion() {
    if (!quizCurrentSet || !quizCurrentSet.questions) return;
    
    const currentQuestion = quizCurrentSet.questions[quizCurrentQuestionIndex];
    if (!currentQuestion) return;
    
    // Update difficulty and question number (on same line)
    const difficultyElement = document.querySelector('.quiz-difficulty');
    const questionNumberElement = document.querySelector('.quiz-question-number');
    if (difficultyElement) {
        if (quizCurrentQuestionIndex === 4 && quizGameWon && quizCorrectCount === 5) {
            difficultyElement.textContent = 'PERFECT';
        } else {
            difficultyElement.textContent = getDifficultyText(quizCurrentQuestionIndex);
        }
    }
    // Only show question number if game is not ended
    if (questionNumberElement) {
        if (quizGameEnded || quizGameWon) {
            questionNumberElement.style.display = 'none';
        } else {
            questionNumberElement.style.display = 'inline';
            questionNumberElement.textContent = `${quizCurrentQuestionIndex + 1} / 5`;
        }
    }
    
    // Display question
    const questionElement = document.querySelector('.quiz-question');
    if (questionElement) {
        questionElement.textContent = currentQuestion.question;
    }
    
    // Display answer buttons (only 3 answers) with different colors like MC
    const buttonsContainer = document.querySelector('.quiz-buttons');
    if (buttonsContainer) {
        buttonsContainer.innerHTML = '';
        
        const gradientColors = [
            'linear-gradient(to bottom, #F86DAA, #E04D8A)',
            'linear-gradient(to bottom, #AB69E0, #9549C8)',
            'linear-gradient(to bottom, #6B9FF8, #5A8FE8)'
        ];
        
        currentQuestion.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'quiz-button';
            button.textContent = answer;
            button.dataset.index = index;
            button.style.background = gradientColors[index] || gradientColors[0];
            button.style.opacity = '1'; // Ensure full opacity
            button.disabled = false; // Ensure not disabled
            
            button.addEventListener('click', () => checkQuizAnswer(index));
            
            buttonsContainer.appendChild(button);
        });
    }
    
    // Reset opacity for fade in
    const difficultyNumberContainer = document.querySelector('.quiz-difficulty-number');
    
    // Fade in the new question
    if (typeof gsap !== 'undefined') {
        if (questionElement) {
            questionElement.style.opacity = '0';
            gsap.to(questionElement, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        }
        if (buttonsContainer) {
            buttonsContainer.style.opacity = '0';
            gsap.to(buttonsContainer, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        }
        if (difficultyNumberContainer) {
            difficultyNumberContainer.style.opacity = '0';
            gsap.to(difficultyNumberContainer, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        }
    } else {
        // Fallback if GSAP not available
        if (questionElement) questionElement.style.opacity = '1';
        if (buttonsContainer) buttonsContainer.style.opacity = '1';
        if (difficultyNumberContainer) difficultyNumberContainer.style.opacity = '1';
    }
}

// Check if answer is correct
function checkQuizAnswer(selectedIndex) {
    if (quizGameEnded || quizGameWon) return;
    
    if (!quizCurrentSet || !quizCurrentSet.questions) return;
    const currentQuestion = quizCurrentSet.questions[quizCurrentQuestionIndex];
    if (!currentQuestion) return;
    
    const isCorrect = selectedIndex === currentQuestion.correct;
    const buttons = document.querySelectorAll('.quiz-button');
    const bottomSection = document.querySelector('.quiz-bottom-section');
    
    // Disable all buttons
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.disabled = true;
    });
    
    if (isCorrect) {
        // Correct answer
        quizCorrectCount++;
        
        // Highlight correct answer in green (same as header)
        buttons[selectedIndex].style.background = 'linear-gradient(to bottom, #26D7A4, #1DB88A)';
        
        // Grey out other buttons
        buttons.forEach((btn, index) => {
            if (index !== selectedIndex) {
                btn.style.background = 'linear-gradient(to bottom, #C8C8C8, #A8A8A8)';
            }
        });
        
        // Remove background color animation to prevent flash
        // Background stays as set by CSS (blue for bigy2)
        
        // Wait 1.5 seconds, then fade out and go to next question (unless it's the last question)
        setTimeout(() => {
            if (quizCurrentQuestionIndex === 4) {
                // Last question - don't fade out, just end the game
                quizGameWon = true;
                endQuizGame(true);
            } else {
                // Not the last question - fade out
                const questionElement = document.querySelector('.quiz-question');
                const buttonsContainer = document.querySelector('.quiz-buttons');
                const difficultyNumberContainer = document.querySelector('.quiz-difficulty-number');
                
                // Fade out (twice as long - 0.6s instead of 0.3s)
                if (typeof gsap !== 'undefined') {
                    if (questionElement) {
                        gsap.to(questionElement, { opacity: 0, duration: 0.6, ease: 'power2.out' });
                    }
                    if (buttonsContainer) {
                        gsap.to(buttonsContainer, { opacity: 0, duration: 0.6, ease: 'power2.out' });
                    }
                    if (difficultyNumberContainer) {
                        gsap.to(difficultyNumberContainer, { opacity: 0, duration: 0.6, ease: 'power2.out' });
                    }
                } else {
                    // Fallback if GSAP not available
                    if (questionElement) questionElement.style.opacity = '0';
                    if (buttonsContainer) buttonsContainer.style.opacity = '0';
                    if (difficultyNumberContainer) difficultyNumberContainer.style.opacity = '0';
                }
                
                // Move to next question after fade (wait for fade to complete - 600ms)
                setTimeout(() => {
                    // Next question
                    quizCurrentQuestionIndex++;
                    saveQuizState(); // Save state after moving to next question
                    displayQuestion();
                    
                    // Ensure opacity is reset for new question
                    const questionElement = document.querySelector('.quiz-question');
                    const buttonsContainer = document.querySelector('.quiz-buttons');
                    const difficultyNumberContainer = document.querySelector('.quiz-difficulty-number');
                    
                    if (questionElement) questionElement.style.opacity = '';
                    if (buttonsContainer) buttonsContainer.style.opacity = '';
                    if (difficultyNumberContainer) difficultyNumberContainer.style.opacity = '';
                }, 600);
            }
        }, 1500);
        
    } else {
        // Wrong answer - end game
        quizGameEnded = true;
        
        const currentQuestion = quizCurrentSet.questions[quizCurrentQuestionIndex];
        
        // Save the wrong answer
        
        // Highlight wrong answer in red (more vibrant)
        buttons[selectedIndex].style.background = 'linear-gradient(to bottom, #FF5252, #D32F2F)';
        
        // Show correct answer in green (same as header)
        buttons[currentQuestion.correct].style.background = 'linear-gradient(to bottom, #26D7A4, #1DB88A)';
        
        // Grey out other buttons
        buttons.forEach((btn, index) => {
            if (index !== selectedIndex && index !== currentQuestion.correct) {
                btn.style.background = 'linear-gradient(to bottom, #C8C8C8, #A8A8A8)';
            }
        });
        
        // Add check/X marks
        buttons.forEach((btn, index) => {
            if (index === currentQuestion.correct) {
                btn.textContent = btn.textContent + ' ✓';
            } else if (index === selectedIndex) {
                btn.textContent = btn.textContent + ' ✗';
            }
        });
        
        // Remove background color animation to prevent flash
        // Background stays as set by CSS (blue for bigy2)
        
        // End game and show stars
        setTimeout(() => {
            endQuizGame(false);
        }, 1000);
    }
}

// End the quiz game
function endQuizGame(won) {
    quizGameEnded = true;
    
    if (won) {
        // All 5 correct - 5 stars
        quizCorrectCount = 5;
        markQuizComplete();
        quizAddStars(5);
        
        const todayKey = quizGetTodayKey();
        localStorage.setItem(`quizStars_${todayKey}`, '5');
        
        // Update difficulty text to "YOU WON!" (only if all 5 correct)
        const difficultyElement = document.querySelector('.quiz-difficulty');
        const questionNumberElement = document.querySelector('.quiz-question-number');
        if (difficultyElement) {
            difficultyElement.textContent = 'PERFECT';
            difficultyElement.style.opacity = '1';
        }
        // Hide question number
        if (questionNumberElement) {
            questionNumberElement.style.display = 'none';
        }
    } else {
        // Award stars based on correct count (1 per correct answer)
        markQuizComplete();
        quizAddStars(quizCorrectCount);
        
        const todayKey = quizGetTodayKey();
        localStorage.setItem(`quizStars_${todayKey}`, String(quizCorrectCount));
        
        // Update difficulty text to "GAME OVER"
        const difficultyElement = document.querySelector('.quiz-difficulty');
        const questionNumberElement = document.querySelector('.quiz-question-number');
        if (difficultyElement) {
            difficultyElement.textContent = 'GAME OVER';
        }
        // Hide question number
        if (questionNumberElement) {
            questionNumberElement.style.display = 'none';
        }
    }
    
    // Save final state
    saveQuizState();
    
    // Show stars
    setTimeout(() => {
        showQuizStars();
        
        // Update parent window star display
        if (window.parent && window.parent.loadGameScores2) {
            window.parent.loadGameScores2();
        }
        if (window.parent && window.parent.updateStarDisplay) {
            window.parent.updateStarDisplay();
        }
    }, 500);
}

// Show stars earned
function showQuizStars() {
    const todayKey = quizGetTodayKey();
    const starsEarned = parseInt(localStorage.getItem(`quizStars_${todayKey}`) || '0');
    const starsElement = document.querySelector('.quiz-stars');
    
    if (starsElement) {
        const starElements = starsElement.querySelectorAll('.quiz-star');
        starElements.forEach((star, index) => {
            if (index < starsEarned) {
                star.classList.remove('grey');
            } else {
                star.classList.add('grey');
            }
        });

        const isDesktop = window.innerWidth >= 768;
        if (isDesktop) {
            // Desktop: stars already visible (grey) from CSS; just update colors
            starsElement.style.opacity = '1';
            starsElement.style.maxHeight = '20px';
            starsElement.style.overflow = 'visible';
            return;
        }

        // Mobile: hide initially then expand and fade in
        starsElement.style.display = 'flex';
        starsElement.style.opacity = '0';
        starsElement.style.maxHeight = '0';
        starsElement.style.overflow = 'hidden';
        
        if (typeof gsap !== 'undefined') {
            gsap.to(starsElement, {
                maxHeight: '20px',
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                    gsap.to(starsElement, {
                        opacity: 1,
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                }
            });
        } else {
            starsElement.style.maxHeight = '20px';
            starsElement.style.opacity = '1';
        }
    }
}

// Show completed state
function showCompletedQuiz() {
    // Load the saved state first
    const hasSavedState = loadQuizState();
    if (!hasSavedState || !quizCurrentSet) {
        console.error('No saved quiz state found');
        return;
    }
    
    // Show the last question that was completed (use the saved index, which should be 4 for last question)
    // The saved index is the question that was just answered, so use it directly
    const lastQuestionIndex = quizCurrentQuestionIndex >= 0 && quizCurrentQuestionIndex <= 4 ? quizCurrentQuestionIndex : 4;
    quizCurrentQuestionIndex = lastQuestionIndex;
    
    const currentQuestion = quizCurrentSet.questions[lastQuestionIndex];
    if (!currentQuestion) return;
    
    // Update difficulty - show "GAME OVER" if completed but not all 5 correct, "YOU WON!" only if all 5 correct
    const difficultyElement = document.querySelector('.quiz-difficulty');
    const questionNumberElement = document.querySelector('.quiz-question-number');
    if (difficultyElement) {
        if (quizGameWon && quizCorrectCount === 5) {
            difficultyElement.textContent = 'PERFECT';
        } else {
            difficultyElement.textContent = 'GAME OVER';
        }
    }
    
    // Hide question number when game is over
    if (questionNumberElement) {
        questionNumberElement.style.display = 'none';
    }
    
    // Display question
    const questionElement = document.querySelector('.quiz-question');
    if (questionElement) {
        questionElement.textContent = currentQuestion.question;
    }
    
    // Display answer buttons with last answer highlighted
    const buttonsContainer = document.querySelector('.quiz-buttons');
    if (buttonsContainer) {
        buttonsContainer.innerHTML = '';
        
        const todayKey = quizGetTodayKey();
        const lastAnswerIndex = -1;
        
        currentQuestion.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'quiz-button';
            let buttonText = answer;
            
            // Add check/X marks if we have a last answer
            if (lastAnswerIndex >= 0) {
                if (index === currentQuestion.correct) {
                    buttonText += ' ✓';
                } else if (index === lastAnswerIndex) {
                    buttonText += ' ✗';
                }
            }
            
            button.textContent = buttonText;
            button.style.pointerEvents = 'none';
            button.disabled = true;
            
            // Highlight based on last answer
            if (index === currentQuestion.correct) {
                button.style.background = 'linear-gradient(to bottom, #26D7A4, #1DB88A)';
            } else if (index === lastAnswerIndex) {
                button.style.background = 'linear-gradient(to bottom, #FF5252, #D32F2F)';
            } else {
                button.style.background = 'linear-gradient(to bottom, #C8C8C8, #A8A8A8)';
            }
            
            buttonsContainer.appendChild(button);
        });
    }
    
    // Show stars
    showQuizStars();
}

// Make reset function globally accessible for 'q' key handler
window.resetQuizGame = function() {
    // Clear saved state
    const todayKey = quizGetTodayKey();
    localStorage.removeItem(`quizState_${todayKey}`);
    localStorage.removeItem(`quizComplete_${todayKey}`);
    localStorage.removeItem(`quizStars_${todayKey}`);
    
    // Reset game state
    quizCurrentSet = null;
    quizCurrentQuestionIndex = 0;
    quizCorrectCount = 0;
    quizGameWon = false;
    quizGameEnded = false;
    
    // Reinitialize if data is loaded
    if (quizGameData && quizGameData.length > 0) {
        initQuizGame();
    } else {
        // Reload data if not loaded yet
        loadQuizData();
    }
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadQuizData);
} else {
    loadQuizData();
}


// Helper function to get week start date
function getWeekStartDate() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    return weekStart;
}

// Helper function to get today's key
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Function to update calendar display
function updateCalendar() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const weekStart = getWeekStartDate();
    
    // Helper function to update a single calendar box
    const updateCalendarBox = (box, index, dayNumberSelector) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + index);
        const dayKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
        const dayNumberElement = box.querySelector(dayNumberSelector);
        
        if (!dayNumberElement) return;

        // Highlight today
        if (index === dayOfWeek) {
            box.classList.add('today');
        } else {
            box.classList.remove('today');
        }
        
        // If this day is in the past or today, show stars earned (without star icon)
        if (index <= dayOfWeek) {
            const stars = parseInt(localStorage.getItem(`dailyStars_${dayKey}`) || '0');
            dayNumberElement.textContent = stars;
        } else {
            // Future days show nothing
            dayNumberElement.innerHTML = '&nbsp;';
        }
    };

    // Update original calendar (header-type2)
    const weekBoxes = document.querySelectorAll('.week-box');
    weekBoxes.forEach((box, index) => {
        updateCalendarBox(box, index, '.day-number');
    });

    // Update type1 calendars separately - each calendar container needs its own index
    // Update header-type1 calendar
    const headerType1Calendar = document.querySelector('.header-type1 .week-days-container-type1');
    if (headerType1Calendar) {
        const weekBoxesType1 = headerType1Calendar.querySelectorAll('.week-box-type1');
        weekBoxesType1.forEach((box, index) => {
            updateCalendarBox(box, index, '.day-number-type1');
        });
    }
    
    // Update container2B calendar (bigy2)
    const container2BCalendar = document.querySelector('.week-combined-container2B .week-days-container-type1');
    if (container2BCalendar) {
        const weekBoxes2B = container2BCalendar.querySelectorAll('.week-box-type1');
        weekBoxes2B.forEach((box, index) => {
            updateCalendarBox(box, index, '.day-number-type1');
        });
    }
}

// Make it globally accessible
window.updateCalendar = updateCalendar;

// Function to update header star counter (shows usable stars ONLY)
function updateHeaderStarCounter() {
    // Always use updateMoveStarsDisplay to show usable stars in header
    if (window.updateMoveStarsDisplay) {
        window.updateMoveStarsDisplay();
    } else {
        // If updateMoveStarsDisplay not available, set to 0 (don't show wrong value)
    const starCountElement = document.querySelector('.star-count');
    if (starCountElement) {
            starCountElement.textContent = 'x 0';
        }
    }
}

// Make it globally accessible
window.updateHeaderStarCounter = updateHeaderStarCounter;
// Alias for games that call updateStarDisplay
window.updateStarDisplay = updateHeaderStarCounter;

// Function to update wallet star displays
// Calculate longest streak of consecutive days played
function calculateLongestStreak() {
    // Get all dates that have dailyStars > 0 (days played)
    const playedDates = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dailyStars_')) {
            const stars = parseInt(localStorage.getItem(key) || '0');
            if (stars > 0) {
                // Extract date from key (format: dailyStars_YYYY-MM-DD)
                const dateStr = key.replace('dailyStars_', '');
                playedDates.push(dateStr);
            }
        }
    }
    
    if (playedDates.length === 0) {
        return 0;
    }
    
    // Sort dates chronologically
    playedDates.sort();
    
    // Find longest consecutive sequence
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < playedDates.length; i++) {
        const prevDate = new Date(playedDates[i - 1]);
        const currDate = new Date(playedDates[i]);
        
        // Calculate difference in days
        const diffTime = currDate - prevDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Consecutive day
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else {
            // Streak broken
            currentStreak = 1;
        }
    }
    
    return longestStreak;
}

// ----- Puzzle game helpers -----
function getPuzzleStarsKey(gameId) {
    const todayKey = getTodayKey();
    switch (gameId) {
        case 'beticle':
            return `beticleStars_${todayKey}`;
        case 'phrases':
            return `phrasesStars_${todayKey}`;
        case 'cross':
            return `crossStars_${todayKey}`;
        case 'mysteryWord':
            return `mysteryWordStars_${todayKey}`;
        case 'goldCase':
            return `goldCaseStars_${todayKey}`;
        case 'suspect':
            return `suspectStars_${todayKey}`;
        case 'defuser':
            return `defuserStars_${todayKey}`;
        case 'tally':
            return `tallyStars_${todayKey}`;
        case 'zoom':
            return `zoomStars_${todayKey}`;
        case 'shift':
            return `shiftStars_${todayKey}`;
        default:
            return null;
    }
}

function isPuzzleGameCompleted(gameId) {
    const key = getPuzzleStarsKey(gameId);
    if (!key) return false;
    // Treat any saved value (including '0') as completed
    return localStorage.getItem(key) !== null;
}

// Track puzzle sessions for current page load (not per-day) for puzzle games.
// These are set to true when the game iframe sends a "puzzleStarted:<id>" message.
const puzzleSessionStarted = {
    defuser: false,
    tally: false,
    beticle: false,
    cross: false,
    mysteryWord: false,
    phrases: false,
    zoom: false,
    shift: false,
    suspect: false,
    goldCase: false
};

// Listen for messages from iframes when games actually start
window.addEventListener('message', (event) => {
    if (typeof event.data === 'string') {
        if (event.data === 'defuserStarted') {
            puzzleSessionStarted.defuser = true;
        } else if (event.data === 'tallyStarted') {
            puzzleSessionStarted.tally = true;
        } else if (event.data.startsWith('puzzleStarted:')) {
            const gameId = event.data.split(':')[1];
            if (gameId && Object.prototype.hasOwnProperty.call(puzzleSessionStarted, gameId)) {
                puzzleSessionStarted[gameId] = true;
            }
        }
    }
});

// Determine whether a puzzle has actually "started" (so we should warn on quit).
// For ALL puzzle games this should be tied to their own PLAY/START behavior,
// not just opening the iframe. For now, we have explicit signals only for
// DEFUSER and TALLY, so we treat other puzzles as started as soon as the
// iframe is opened (their internal PLAY is effectively "open and play").
function isPuzzleSessionStarted(gameId) {
    return !!puzzleSessionStarted[gameId];
}

function showCompletedBadge(boxElement) {
    if (!boxElement) return;
    if (boxElement.querySelector('.completed-overlay')) return;
    
    // Ensure the play box can position the overlay
    if (!boxElement.style.position || boxElement.style.position === '') {
        boxElement.style.position = 'relative';
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'completed-overlay';
    overlay.textContent = 'COMPLETED';
    overlay.style.position = 'absolute';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.background = '#ffffff';
    overlay.style.color = '#000000';
    overlay.style.borderRadius = '5px';
    overlay.style.padding = '3px 8px';
    overlay.style.fontSize = '11px';
    overlay.style.fontWeight = '600';
    overlay.style.pointerEvents = 'none';
    boxElement.appendChild(overlay);
    
    // Fade out after 2 seconds using GSAP, then remove
    if (typeof gsap !== 'undefined') {
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.4,
            delay: 2,
            onComplete: () => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }
        });
    } else {
        // Fallback: simple timeout hide if GSAP is not available
        setTimeout(() => {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 2000);
    }
}

function updateWalletStars2() {

    try {
        const todayKey = getTodayKey();
        
        // Update level display
        const journeyLevel = parseInt(localStorage.getItem('journeyLevel') || '1');
        const journeyPosition = parseInt(localStorage.getItem(`journeyPosition_level${journeyLevel}`) || '0');
        const levelElement = document.querySelector('.profile-level');
        if (levelElement) {
            levelElement.textContent = `Level ${journeyLevel}-${journeyPosition + 1}`;
        }
        
        // Update today's stars
        const todayStars = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
        
        // Calculate week's stars (sum of all days this week)
        let weekStars = 0;
        const weekStart = getWeekStartDate();
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            const dayKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
            const dayStars = parseInt(localStorage.getItem(`dailyStars_${dayKey}`) || '0');
            weekStars += dayStars;
        }
        
        // Update ever stars (sum of all dailyStars from all dates)
        let everStars = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('dailyStars_')) {
                const stars = parseInt(localStorage.getItem(key) || '0');
                everStars += stars;
            }
        }
        
        // Get all stat-number elements (Today is [0], Week is [1], Ever is [2])
        const weekElements = document.querySelectorAll('.profile-stat-small .stat-number');
        if (weekElements[0]) {
            weekElements[0].textContent = todayStars;
        }
        if (weekElements[1]) {
            weekElements[1].textContent = weekStars;
        }
        if (weekElements[2]) {
            weekElements[2].textContent = everStars;
        }
        
        // Update longest streak
        const longestStreak = calculateLongestStreak();
        const streakElement = document.getElementById('longestStreakValue');
        if (streakElement) {
            streakElement.textContent = `${longestStreak} ${longestStreak === 1 ? 'Day' : 'Days'}`;
        }
    } catch (error) {
        console.error('[Wallet] ERROR:', error);
    }
}


// Set the current date in the header
function setCurrentDate() {
    // Always remove weekly background element entirely
    const weekHeaderBackground = document.querySelector('.week-header-background');
    if (weekHeaderBackground) {
        weekHeaderBackground.remove();
    }
    
    
    const dateElement = document.querySelector('.date');
    if (!dateElement) return;
    
    const dateSubtitleElement = document.querySelector('.date-subtitle');
    
    // Always show title in caps
    dateElement.textContent = 'Daily Game Center'
        
    // Always show current date in subtitle, regardless of URL params
        if (dateSubtitleElement) {
            const today = new Date();
            const months = [
                'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
            ];
            const month = months[today.getMonth()];
            const day = today.getDate();
            const year = today.getFullYear();
            dateSubtitleElement.textContent = `${month} ${day}, ${year}`;
    }
}

// Load game stars and display them on main page
// Alias for loadGameScores2 for backward compatibility
function loadGameScores() {
    loadGameScores2();
}

function loadGameScores2() {
    // console.log("loadGameScores called1");
    const todayKey = getTodayKey();
    
    // console.log("loadGameScores called");
    // console.log('todayKey:', todayKey);
    // console.log('All localStorage keys:', Object.keys(localStorage));
    
    // Load beticle stars
    const beticleStarsKey = `beticleStars_${todayKey}`;
    const beticleStarsValue = localStorage.getItem(beticleStarsKey);
    // console.log('beticleStars key:', beticleStarsKey);
    // console.log('beticleStars raw value:', beticleStarsValue);
    const beticleStars = parseInt(beticleStarsValue || '0');
    // console.log('Loading beticle stars:', beticleStars, 'for key:', todayKey);
    const beticleStarsElement = document.getElementById('beticleStars');
    if (beticleStarsElement) {
        beticleStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < beticleStars ? '#FF8C42' : '#ddd';
            beticleStarsElement.appendChild(star);
        }
        // console.log('Beticle stars updated on main page');
    } else {
        // console.log('beticleStars element not found');
    }
    
    // Load cross stars
    const crossStars = parseInt(localStorage.getItem(`crossStars_${todayKey}`) || '0');
    const crossStarsElement = document.getElementById('crossStars');
    if (crossStarsElement) {
        crossStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < crossStars ? '#FF8C42' : '#ddd';
            crossStarsElement.appendChild(star);
        }
    }
    
    // Load mystery word stars
    const mysteryWordStars = parseInt(localStorage.getItem(`mysteryWordStars_${todayKey}`) || '0');
    const mysteryWordStarsElement = document.getElementById('mysteryWordStars');
    if (mysteryWordStarsElement) {
        mysteryWordStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < mysteryWordStars ? '#FF8C42' : '#ddd';
            mysteryWordStarsElement.appendChild(star);
        }
    }
    
    // Load blackjack stars
    const blackjackStars = parseInt(localStorage.getItem(`blackjackStars_${todayKey}`) || '0');
    const blackjackStarsElement = document.getElementById('blackjackStars');
    if (blackjackStarsElement) {
        blackjackStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < blackjackStars ? '#FF8C42' : '#ddd';
            blackjackStarsElement.appendChild(star);
        }
    }
    
    // Don't modify goldCaseLockText here - it's now managed by updateBonusSpinDisplay()
    // The bonus spin game uses goldCaseLockText and goldCaseStars (the 10-star display)
    // Only handle goldCaseScoreText if it exists (for backward compatibility with old Gold Case game)
    const goldCaseScore = parseInt(localStorage.getItem(`goldCaseScore_${todayKey}`) || '0');
    const goldCaseStars = parseInt(localStorage.getItem(`goldCaseStars_${todayKey}`) || '0');
    const goldCaseComplete = localStorage.getItem(`goldCaseComplete_${todayKey}`) === 'true';
    
    const goldCaseScoreText = document.getElementById('goldCaseScoreText');
    const goldCaseScoreElement = document.getElementById('goldCaseScore');
    const goldCaseStarsElement = document.getElementById('goldCaseStars');
    
    // Only handle goldCaseScoreText (old Gold Case game display), not goldCaseLockText
    if (goldCaseComplete && goldCaseScoreText) {
        goldCaseScoreText.style.display = 'flex';
        
        // Update score
        if (goldCaseScoreElement) {
            goldCaseScoreElement.textContent = goldCaseScore.toLocaleString();
        }
        
        // Update stars (old 5-star display for Gold Case)
        if (goldCaseStarsElement) {
            goldCaseStarsElement.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = i < goldCaseStars ? '#FF8C42' : '#ddd';
                goldCaseStarsElement.appendChild(star);
            }
        }
    } else {
        // Hide score/stars if not complete (but don't touch lock text - that's managed by updateBonusSpinDisplay)
        if (goldCaseScoreText) {
            goldCaseScoreText.style.display = 'none';
        }
    }
    
    // Load Gold Case puzzle stars (for the puzzle game display)
    const goldCasePuzzleStarsElement = document.getElementById('goldCasePuzzleStars');
    if (goldCasePuzzleStarsElement) {
        goldCasePuzzleStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < goldCaseStars ? '#FF8C42' : '#ddd';
            goldCasePuzzleStarsElement.appendChild(star);
        }
    }
    
    // Load zoom stars (tilesStars element)
    const zoomStars = parseInt(localStorage.getItem(`zoomStars_${todayKey}`) || '0');
    const tilesStarsElement = document.getElementById('tilesStars');
    if (tilesStarsElement) {
        tilesStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < zoomStars ? '#FF8C42' : '#ddd';
            tilesStarsElement.appendChild(star);
        }
    }
    
    // Load DEFUSER stars
    const defuserStars = parseInt(localStorage.getItem(`defuserStars_${todayKey}`) || '0');
    const defuserStarsElement = document.getElementById('defuserStars');
    if (defuserStarsElement) {
        defuserStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < defuserStars ? '#FF8C42' : '#ddd';
            defuserStarsElement.appendChild(star);
        }
    }
    
    // Load TALLY stars
    const tallyStars = parseInt(localStorage.getItem(`tallyStars_${todayKey}`) || '0');
    const tallyStarsElement = document.getElementById('tallyStars');
    if (tallyStarsElement) {
        tallyStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < tallyStars ? '#FF8C42' : '#ddd';
            tallyStarsElement.appendChild(star);
        }
    }
    
    // Load shift stars
    const shiftStars = parseInt(localStorage.getItem(`shiftStars_${todayKey}`) || '0');
    const shiftStarsElement = document.getElementById('shiftStars');
    if (shiftStarsElement) {
        shiftStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < shiftStars ? '#FF8C42' : '#ddd';
            shiftStarsElement.appendChild(star);
        }
    }
    
    // Load quiz stars
    const quizStars = parseInt(localStorage.getItem(`quizStars_${todayKey}`) || '0');
    const quizStarsElement = document.querySelector('.quiz-stars');
    if (quizStarsElement) {
        quizStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.className = 'quiz-star';
            star.textContent = '★';
            star.style.color = i < quizStars ? '#FF8C42' : '#ddd';
            if (i >= quizStars) {
                star.classList.add('grey');
            }
            quizStarsElement.appendChild(star);
        }
        if (quizStars > 0) {
            quizStarsElement.style.display = 'flex';
        }
    }
}

// Function to update blackjack stars display
function updateBlackjackStars() {
    const todayKey = getTodayKey();
    const blackjackStars = parseInt(localStorage.getItem(`blackjackStars_${todayKey}`) || '0');
    const blackjackStarsElement = document.getElementById('blackjackStars');
    if (blackjackStarsElement) {
        blackjackStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < blackjackStars ? '#FF8C42' : '#ddd';
            blackjackStarsElement.appendChild(star);
        }
    }
}

// Make it globally accessible
window.updateBlackjackStars = updateBlackjackStars;

function updateCrossStars() {
    const todayKey = getTodayKey();
    const crossStars = parseInt(localStorage.getItem(`crossStars_${todayKey}`) || '0');
    const crossStarsElement = document.getElementById('crossStars');
    if (crossStarsElement) {
        crossStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < crossStars ? '#FF8C42' : '#ddd';
            crossStarsElement.appendChild(star);
        }
    }
}

// Make it globally accessible
window.updateCrossStars = updateCrossStars;

// Hide weekly background immediately - run multiple times to ensure it's hidden
(function() {
    function hideWeekHeaderBackground() {
        const weekHeaderBackground = document.querySelector('.week-header-background');
        if (weekHeaderBackground) {
            weekHeaderBackground.remove();
        }
    }
    // Run immediately
    hideWeekHeaderBackground();
    // Run again after delays to catch any late-loading scripts
    setTimeout(hideWeekHeaderBackground, 100);
    setTimeout(hideWeekHeaderBackground, 500);
    setTimeout(hideWeekHeaderBackground, 1000);
})();

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setCurrentDate();
    updateHeaderStarCounter();
    updateWalletStars2();
    // Update bonus spin display - ensure it runs after DOM is ready
    setTimeout(() => {
        updateBonusSpinDisplay();
    }, 0);
    
    // Update calendar after a short delay to ensure all containers are set up
    setTimeout(() => {
    updateCalendar();
    }, 100);
    
    loadGameScores2();
    updateBoostHighScore();
    // console.log("loadGameScores called");
    
    // Initialize coin displays if function exists
    if (window.updateCoinDisplays) {
        window.updateCoinDisplays();
    }
    
    // Initialize help button
    const helpButton = document.querySelector('.help-button');
    const helpPopup = document.getElementById('help-popup-overlay');
    const helpPopupClose = document.querySelector('.help-popup-close');
    
    if (helpButton && helpPopup) {
        helpButton.addEventListener('click', () => {
            helpPopup.classList.add('show');
            // Disable body scrolling when popup is open
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (helpPopupClose && helpPopup) {
        const closePopup = () => {
            helpPopup.classList.remove('show');
            // Re-enable body scrolling when popup is closed
            document.body.style.overflow = '';
        };
        
        helpPopupClose.addEventListener('click', closePopup);
        
        // Close when clicking overlay
        helpPopup.addEventListener('click', (e) => {
            if (e.target === helpPopup) {
                closePopup();
            }
        });
    }
    
    // Don't call updateLogoVisibility here - it will be called at the end of checkURLParameters
    // after all styling is applied
});

// Tab button functionality
const buttons = document.querySelectorAll('.tab-button');
const pages = document.querySelectorAll('.page');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const targetPage = button.getAttribute('data-page');
        
        // Remove active class from all buttons and pages
        buttons.forEach(btn => btn.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));
        
        // Add active class to clicked button and corresponding page
        button.classList.add('active');
        
        // Show the target page
        const targetPageElement = document.getElementById(`${targetPage}-page`);
        if (targetPageElement) {
            targetPageElement.classList.add('active');
        }
        
        // Update logo visibility when switching pages
        updateLogoVisibility();
        
        // Update move stars display when switching to journey tab
        if (targetPage === 'journey') {
            if (window.updateMoveStarsDisplay) {
                window.updateMoveStarsDisplay();
            }
            // Update journey button state (games played count and button appearance)
            if (window.updateJourneyButtonState) {
                window.updateJourneyButtonState();
            }
            // Log current move stars
            const today = new Date();
            const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const moveStars = localStorage.getItem(`moveStars_${todayKey}`);
            console.log('[Journey Tab] Current move stars:', moveStars);
            
            // Hide help button on journey page
            const helpButton = document.querySelector('.help-button');
            if (helpButton) {
                helpButton.classList.add('hidden');
            }
            
            // Snap container position when journey tab becomes active
            if (window.snapJourneyContainer) {
                const journeyPage = document.getElementById('journey-page');
                if (journeyPage && journeyPage.classList.contains('active')) {
                                window.snapJourneyContainer();
                    }
                }
        } else {
            // Show help button on other pages (if close button is not showing)
            const helpButton = document.querySelector('.help-button');
            if (helpButton) {
                updateLogoVisibility();
            }
        }
        
        
        // Trigger rival page animations
        if (targetPage === 'rival') {
            animateRivalPage();
            // Update rival stars with daily stars
            if (window.updateRivalStars) {
                window.updateRivalStars();
            }
            // Ensure all star icons on rival page are orange
            setTimeout(() => {
                const rivalStarIcons = document.querySelectorAll('#rival-page .star-icon');
                rivalStarIcons.forEach(icon => {
                    icon.style.color = '#FFB84D';
                    icon.style.setProperty('color', '#FFB84D', 'important');
                });
            }, 50);
        }
        
        // Update wallet stars when wallet page is shown
        if (targetPage === 'wallet') {
            setTimeout(() => {
                updateWalletStars2();
            }, 50);
        }
        
        // Update boost page stats when boost page is shown
        if (targetPage === 'sweeps' && mode === 'b') {
            updateBoostStats();
            // Update boost page for bigy style if applicable
            updateBoostPageForBigy();
        }
        
        // Initialize sweepstakes page when shown (only if not boost mode)
        if (targetPage === 'sweeps' && mode !== 'b') {
            setTimeout(initSweepsPage, 100);
        }
    });
});

// Rival page animations
function animateRivalPage() {
    const rivalProfiles = document.querySelectorAll('.rival-profile');
    const rivalTitle = document.querySelector('.rival-title');
    const rivalDivider = document.querySelector('.rival-divider');
    const rivalChallenge = document.querySelector('.rival-challenge');
    
    if (rivalProfiles.length < 2) return;
    
    const leftProfile = rivalProfiles[0];
    const rightProfile = rivalProfiles[1];
    
    // Set initial states
    gsap.set(leftProfile, { x: -200, opacity: 0 });
    gsap.set(rightProfile, { x: 200, opacity: 0 });
    gsap.set([rivalTitle, rivalDivider, rivalChallenge], { opacity: 0 });
    
    // Animate left profile sliding in from left
    gsap.to(leftProfile, {
        duration: 0.6,
        x: 0,
        opacity: 1,
        ease: 'power2.out'
    });
    
    // Animate right profile sliding in from right
    gsap.to(rightProfile, {
        duration: 0.6,
        x: 0,
        opacity: 1,
        ease: 'power2.out',
    });
    
    // Fade in title
    gsap.to(rivalTitle, {
        duration: 0.5,
        opacity: 1,
        ease: 'power2.out',
        delay: 0.2
    });
    
    // Fade in divider
    gsap.to(rivalDivider, {
        duration: 0.5,
        opacity: 1,
        ease: 'power2.out',
        delay: 0.2
    });
    
    // Fade in challenge text
    gsap.to(rivalChallenge, {
        duration: 0.5,
        opacity: 1,
        ease: 'power2.out',
        delay: 0.2
    });
}

// Check URL parameters on page load
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const scheme = urlParams.get('s');
    const headerType = urlParams.get('d');
    
    // Handle header type switching
    const headerType1 = document.querySelector('.header-type1');
    const headerType2 = document.querySelector('.header-type2');
    
    // Set logo based on header type
    const headerLogo = document.querySelector('.header-logo');
    const carouselLogos = document.querySelectorAll('.carousel-slide-type1 img');
    
    // Handle calendar containers
    const container2A = document.querySelector('.week-combined-container2A');
    const container2B = document.querySelector('.week-combined-container2B');
    
    if (headerType === 'bigy') {
        // Remove bigy2 class if it exists
        document.body.classList.remove('bigy2');
        
        // Show header-type2, hide header-type1
        if (headerType1) headerType1.style.display = 'none';
        if (headerType2) headerType2.style.display = 'block';
        
        // Show container2A, hide container2B
        if (container2A) container2A.style.display = 'flex';
        if (container2B) container2B.style.display = 'none';
        
        // Set bigy logo
        if (headerLogo) {
            headerLogo.src = 'src/img/bigy/bigy.png';
        }
        carouselLogos.forEach(logo => {
            logo.src = 'src/img/bigy/bigy.png';
        });
        
        // Apply DM Sans font to all elements except serif fonts and letter-box
        applyFontScheme('DM Sans');
        
        // Apply blue styling and white text for scramble, MC, and FoF
        applyBigyStyling();
    } else if (headerType === 'bigy2') {
        // Show header-type2, hide header-type1
        if (headerType1) headerType1.style.display = 'none';
        if (headerType2) headerType2.style.display = 'block';
        
        // Show container2B, hide container2A
        if (container2A) container2A.style.display = 'none';
        if (container2B) container2B.style.display = 'flex';
        
        // Set bigy logo
        if (headerLogo) {
            headerLogo.src = 'src/img/bigy/bigy.png';
        }
        carouselLogos.forEach(logo => {
            logo.src = 'src/img/bigy/bigy.png';
        });
        
        // Apply DM Sans font to all elements except serif fonts and letter-box
        applyFontScheme('DM Sans');
        
        // Add body class for bigy2 styling
        document.body.classList.add('bigy2');
        
        // Apply blue styling and white text for scramble, MC, and FoF
        applyBigyStyling();
        
        // Show logo for bigy2 (same as bigy)
        if (headerLogo) {
            headerLogo.style.display = 'block';
        }
        
        // For bigy2, use default hint button styling (no lightbulb)
        const hintButton = document.querySelector('.unscramble-hint-btn');
        if (hintButton) {
            // Remove any existing event listeners by cloning and replacing
            const newHintButton = hintButton.cloneNode(true);
            hintButton.parentNode.replaceChild(newHintButton, hintButton);
            
            // Apply default teal styling
            newHintButton.style.background = 'linear-gradient(to bottom, #6EDDD4, #4ECDC4)';
            newHintButton.style.color = 'white';
            newHintButton.style.borderRadius = '6px';
            newHintButton.style.padding = '8px 24px';
            newHintButton.style.fontWeight = '600';
            newHintButton.style.boxShadow = '0 2px 6px rgba(78, 205, 196, 0.3)';
            // Remove lightbulb emoji for bigy2
            newHintButton.textContent = newHintButton.textContent.replace('💡 ', '').replace('💡', '');
            if (newHintButton.textContent.trim() === '') {
                newHintButton.textContent = 'Hint';
            }
        }
        
        // Update calendar for bigy2 after container is shown
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (typeof updateCalendar === 'function') {
                    console.log('[Bigy2] Updating calendar after container shown');
                    updateCalendar();
                }
            }, 50);
        });
    } else {
        // Remove bigy2 class if it exists
        document.body.classList.remove('bigy2');
        
        // Default: show header-type1, hide header-type2
        if (headerType1) headerType1.style.display = 'block';
        if (headerType2) headerType2.style.display = 'none';
        
        // Hide both containers for default
        if (container2A) container2A.style.display = 'none';
        if (container2B) container2B.style.display = 'none';
        
        // Set default temp logo
        if (headerLogo) {
            headerLogo.src = 'src/img/tempLogo.png';
        }
        carouselLogos.forEach(logo => {
            logo.src = 'src/img/tempLogo.png';
        });
        
        // Apply Nunito font (default)
        applyFontScheme('Nunito');
        
        // Apply default grey/white styling
        applyDefaultStyling();
    }
    
    if (scheme === 'jos') {
        // Apply Jos color scheme
        const schemeBack = '#925441';
        const schemeBarGrad = 'linear-gradient(to bottom, #fe5094, #ea327e)';
        const schemeCalendarGrad = 'linear-gradient(to bottom, #FF8C42, #FF6F3C)';
        const schemeBigText = '#f4efe5';
        const logoPath = 'src/img/jos/jos_logo.png';
        
        changeColorScheme(schemeBack, schemeBarGrad, schemeCalendarGrad, schemeBigText, logoPath);
    } else if (scheme === 'goodValue') {
        // Apply Good Value color scheme - based on logo colors
        const schemeBack = '#ececec';
        const schemeBarGrad = 'linear-gradient(to bottom, #3aa9e3, #1785ca)';
        const schemeCalendarGrad = 'linear-gradient(to bottom, #7adc75, #4fb971)';
        const schemeBigText = '#333333';
        const logoPath = 'src/img/goodValue/goodValue_logo.png';
        
        changeColorScheme(schemeBack, schemeBarGrad, schemeCalendarGrad, schemeBigText, logoPath);
    } else if (scheme === 'dark') {
        // Apply Dark color scheme
        const schemeBack = '#000000';
        const schemeBarGrad = 'linear-gradient(to bottom, #FFB84D, #FF8C42)';
        const schemeCalendarGrad = 'linear-gradient(to bottom, #FFB84D, #FF8C42)';
        const schemeBigText = '#ccc';
        const logoPath = null; // Keep logo hidden
        
        changeColorScheme(schemeBack, schemeBarGrad, schemeCalendarGrad, schemeBigText, logoPath);
    } else if (scheme === 'bigy') {
        // Apply Bigy color scheme - keep default background and text, use red for header/calendar
        const schemeBack = '#f5f5f5';
        const schemeBarGrad = 'linear-gradient(to bottom, #df2b51, #c82a48)';
        const schemeCalendarGrad = 'linear-gradient(to bottom, #df2b51, #c82a48)';
        const schemeBigText = '#363636';
        const logoPath = 'src/img/bigy/bigy.png';  
        
        changeColorScheme(schemeBack, schemeBarGrad, schemeCalendarGrad, schemeBigText, logoPath);
        
        // Update boost page for bigy style when using bigy scheme
    updateBoostPageForBigy();
    }
        
    // Initialize the appropriate carousel based on header type
    if (headerType === 'bigy') {
        initBigyCarousel();
    } else {
        initType1Carousel();
    }
    
    // Update date display based on p parameter
    setCurrentDate();
    
    // Update boost high score on page load
    updateBoostHighScore();
    
    // Ensure logo visibility is correct after all styling is applied
    updateLogoVisibility();
}

// Function to apply font scheme (Nunito or DM Sans)
function applyFontScheme(fontFamily) {
    const dmSansFont = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const nunitoFont = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const targetFont = fontFamily === 'DM Sans' ? dmSansFont : nunitoFont;
    
    // Get all elements on the page
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
        // Skip elements that should keep their font (serif fonts, letter-box)
        const computedStyle = window.getComputedStyle(element);
        const currentFont = computedStyle.fontFamily;
        
        // Skip if it's a serif font (Abril Fatface, Aleo, Spectral)
        if (currentFont.includes('Abril Fatface') || 
            currentFont.includes('Aleo') || 
            currentFont.includes('Spectral')) {
            return;
        }
        
        // Skip letter-box elements (scramble letter tiles)
        if (element.classList.contains('letter-box')) {
            return;
        }
        
        // Apply the font
        element.style.fontFamily = targetFont;
    });
}

// Function to apply bigy styling (blue backgrounds, white text)
function applyBigyStyling() {
    // Change page background to white for bigy
    document.body.style.backgroundColor = 'white';
    
    // Change all sections to white background
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.backgroundColor = 'white';
    });
    
    // Scramble sections - blue for bigy
    const scrambleTop = document.querySelector('.scramble-top-section');
    const scrambleBottom = document.querySelector('.scramble-bottom-section');
    if (scrambleTop) {
        scrambleTop.style.background = '#283f7e';
        scrambleTop.style.backgroundColor = '#283f7e';
        scrambleTop.style.borderBottom = 'none';
    }
    if (scrambleBottom) {
        scrambleBottom.style.background = '#3d5188';
        scrambleBottom.style.backgroundColor = '#3d5188';
    }
    
    // MC sections - blue for bigy
    const mcTop = document.querySelector('.mc-top-section');
    const mcBottom = document.querySelector('.mc-bottom-section');
    if (mcTop) {
        mcTop.style.background = '#283f7e';
        mcTop.style.backgroundColor = '#283f7e';
        mcTop.style.borderBottom = 'none';
    }
    if (mcBottom) {
        mcBottom.style.background = '#3e528b';
        mcBottom.style.backgroundColor = '#3e528b';
    }
    
    // Quiz sections - blue for bigy (same as MC)
    const quizTop = document.querySelector('.quiz-top-section');
    const quizBottom = document.querySelector('.quiz-bottom-section');
    if (quizTop) {
        quizTop.style.background = '#283f7e';
        quizTop.style.backgroundColor = '#283f7e';
        quizTop.style.borderBottom = 'none';
    }
    if (quizBottom) {
        quizBottom.style.background = '#3e528b';
        quizBottom.style.backgroundColor = '#3e528b';
    }
    
    // FoF sections - blue for bigy
    const fofTop = document.querySelector('.fof-top-section');
    const fofBottom = document.querySelector('.fof-bottom-section');
    if (fofTop) {
        fofTop.style.background = '#283f7e';
        fofTop.style.backgroundColor = '#283f7e';
        fofTop.style.borderBottom = 'none';
    }
    if (fofBottom) {
        fofBottom.style.background = '#3e528b';
        fofBottom.style.backgroundColor = '#3e528b';
    }
    
    // Stars - red for bigy
    const unscrambleStars = document.querySelectorAll('.unscramble-stars');
    unscrambleStars.forEach(stars => {
        stars.style.color = '#dc3545';
        const starIcons = stars.querySelectorAll('span, .star-icon');
        starIcons.forEach(icon => {
            icon.style.color = '#dc3545';
        });
    });
    
    const mcStars = document.querySelectorAll('.mc-stars');
    mcStars.forEach(stars => {
        stars.style.color = '#dc3545';
        const starIcons = stars.querySelectorAll('span, .star-icon');
        starIcons.forEach(icon => {
            icon.style.color = '#dc3545';
        });
    });
    
    const fofStars = document.querySelectorAll('.fof-stars');
    fofStars.forEach(stars => {
        stars.style.color = '#dc3545';
        const starIcons = stars.querySelectorAll('span, .star-icon');
        starIcons.forEach(icon => {
            icon.style.color = '#dc3545';
        });
    });
    
    const quizStars = document.querySelectorAll('.quiz-stars');
    quizStars.forEach(stars => {
        stars.style.color = '#dc3545';
        const starIcons = stars.querySelectorAll('.quiz-star');
        starIcons.forEach(icon => {
            icon.style.color = '#dc3545';
        });
    });
    
    // Header bar - white for bigy
    const headerBar = document.querySelector('.header-bar');
    if (headerBar) {
        headerBar.style.background = 'white';
    }
    
    // Star counter - red background for bigy
    const starCounter = document.querySelector('.star-counter');
    if (starCounter) {
        starCounter.style.backgroundColor = '#dc3545';
        const starCount = starCounter.querySelector('.star-count');
        if (starCount) {
            starCount.style.color = 'white';
        }
        const starIcon = starCounter.querySelector('.star-icon');
        if (starIcon) {
            starIcon.style.color = '#FFD700';
        }
    }
    
    // Date text - black for bigy
    const dateElement = document.querySelector('.date');
    if (dateElement) {
        dateElement.style.color = '#000';
    }
    const dateSubtitle = document.querySelector('.date-subtitle');
    if (dateSubtitle) {
        dateSubtitle.style.color = '#000';
    }
    
    // Show Big Y logo for bigy
    const headerLogo = document.querySelector('.header-logo');
    if (headerLogo) {
        headerLogo.style.display = 'block';
    }
    
    // Question mark - white for bigy
    const helpButton = document.querySelector('.help-button');
    if (helpButton) {
        helpButton.style.color = 'white';
        helpButton.style.borderColor = 'white';
    }
    
    // Profile picture - blue for bigy (chess piece background)
    const profilePicture = document.querySelector('.profile-picture');
    if (profilePicture) {
        profilePicture.style.background = 'linear-gradient(to bottom, #758ed1, #283f7e)';
        profilePicture.style.backgroundColor = '';
    }
    
    // Profile container - white background for bigy
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        profileContainer.style.background = 'white';
        profileContainer.style.backgroundColor = 'white';
    }
    
    // Profile page red elements - change to red for bigy
    const dealEarnContainer = document.querySelector('.deal-earn-container');
    if (dealEarnContainer) {
        dealEarnContainer.style.backgroundColor = '#dc3545';
    }
    
    // Deal button containers - red for bigy (already red by default, but ensure it)
    const dealButtonContainers = document.querySelectorAll('.deal-button-container');
    dealButtonContainers.forEach(container => {
        container.style.backgroundColor = '#dc3545';
    });
    
    const challengesContainer = document.querySelector('.profile-challenges-container');
    if (challengesContainer) {
        challengesContainer.style.borderColor = '#dc3545';
        challengesContainer.style.background = 'linear-gradient(to bottom, rgba(220, 53, 69, 0.05) 0%, rgba(220, 53, 69, 0.03) 100%)';
        challengesContainer.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.15)';
    }
    
    const achievementsContainer = document.querySelector('.profile-achievements-container');
    if (achievementsContainer) {
        achievementsContainer.style.borderColor = '#dc3545';
        achievementsContainer.style.background = 'linear-gradient(to bottom, rgba(220, 53, 69, 0.05) 0%, rgba(220, 53, 69, 0.03) 100%)';
        achievementsContainer.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.15)';
    }
    
    const achievementsHeader = document.querySelector('.achievements-header');
    if (achievementsHeader) {
        achievementsHeader.style.backgroundColor = '#dc3545';
        achievementsHeader.style.borderBottomColor = 'rgba(220, 53, 69, 0.3)';
    }
    
    const challengesHeader = document.querySelector('.challenges-header');
    if (challengesHeader) {
        challengesHeader.style.backgroundColor = '#dc3545';
        challengesHeader.style.borderBottomColor = 'rgba(220, 53, 69, 0.3)';
    }
    
    // Challenge items - red for bigy
    const challengeItems = document.querySelectorAll('.challenge-item');
    challengeItems.forEach(item => {
        item.style.borderBottomColor = 'rgba(220, 53, 69, 0.2)';
        item.style.background = 'linear-gradient(to bottom, rgba(220, 53, 69, 0.08) 0%, rgba(220, 53, 69, 0.04) 100%)';
    });
    
    // Challenge rewards - red for bigy
    const challengeRewards = document.querySelectorAll('.challenge-reward');
    challengeRewards.forEach(reward => {
        reward.style.color = '#dc3545';
        reward.style.background = 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.1) 100%)';
        reward.style.boxShadow = '0 2px 4px rgba(220, 53, 69, 0.2)';
    });
    
    // Star icons inline - red for bigy
    const starIconsInline = document.querySelectorAll('.star-icon-inline');
    starIconsInline.forEach(icon => {
        icon.style.color = '#dc3545';
        icon.style.textShadow = '0 1px 2px rgba(220, 53, 69, 0.3)';
    });
    
    // Text colors - white for bigy (keep as is, no uppercase)
    const subsectionTitles = document.querySelectorAll('.subsection-title');
    subsectionTitles.forEach(title => {
        title.style.color = 'white';
        title.style.textTransform = 'none'; // Remove uppercase for bigy
    });
    
    // Section titles - remove transform for bigy and change to Nunito
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.style.transform = 'translateY(0)';
        title.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    });
    
    // Journey page - blue gradient for bigy
    const journeyPage = document.getElementById('journey-page');
    if (journeyPage) {
        journeyPage.style.background = 'linear-gradient(to bottom, #283f7e, #1a2d5c)';
    }
    
    // Apply gold styling to hint button for bigy
    const hintButton = document.querySelector('.unscramble-hint-btn');
    if (hintButton) {
        hintButton.style.background = '#FFD700';
        hintButton.style.color = '#000';
        hintButton.style.borderRadius = '8px';
        hintButton.style.padding = '8px 20px';
        hintButton.style.fontWeight = '700';
        hintButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        // Add lightbulb emoji for bigy
        const buttonText = hintButton.textContent.trim();
        if (!buttonText.includes('💡')) {
            hintButton.textContent = '💡 Hint';
        }
        // Override hover state for bigy
        hintButton.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }
        }, { once: false });
        hintButton.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }, { once: false });
    }
    
    const mcQuestions = document.querySelectorAll('.mc-question');
    mcQuestions.forEach(question => {
        question.style.color = 'white';
    });
    
    // Quiz text elements - white for bigy
    const quizQuestions = document.querySelectorAll('.quiz-question');
    quizQuestions.forEach(question => {
        question.style.color = 'white';
    });
    
    const quizDifficulties = document.querySelectorAll('.quiz-difficulty');
    quizDifficulties.forEach(difficulty => {
        difficulty.style.color = 'white';
    });
    
    const quizQuestionNumbers = document.querySelectorAll('.quiz-question-number');
    quizQuestionNumbers.forEach(number => {
        number.style.color = 'white';
    });
    
    const unscrambleLabels = document.querySelectorAll('.unscramble-label');
    unscrambleLabels.forEach(label => {
        label.style.color = 'white';
    });
    
    const fofInstructions = document.querySelectorAll('.fof-instruction');
    fofInstructions.forEach(instruction => {
        instruction.style.color = 'white';
    });
    
    // Change letter boxes to white background with blue text for bigy
    const letterBoxes = document.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.style.background = 'white';
        box.style.color = '#1a237e';
    });
    
    // Also call the scramble.js function if it exists (for dynamically created boxes)
    if (typeof applyLetterBoxStyling === 'function') {
        applyLetterBoxStyling();
    }
    
    // Remove drop shadow from quiz containers for bigy
    const quizContainers = document.querySelectorAll('.on-this-day-container, .mc-container, .fof-container, .quiz-container');
    quizContainers.forEach(container => {
        container.style.boxShadow = 'none';
    });
}

// Function to apply default styling (grey/white backgrounds, grey text)
function applyDefaultStyling() {
    // Change page background to #f5f5f5 for default
    document.body.style.backgroundColor = '#f5f5f5';
    
    // Change all sections to #f5f5f5 background
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.backgroundColor = '#f5f5f5';
    });
    
    // Scramble sections - default styling now handled by CSS
    
    // MC and FoF sections - default styling now handled by CSS
    
    // Profile picture - pink gradient for default
    const profilePicture = document.querySelector('.profile-picture');
    if (profilePicture) {
        profilePicture.style.background = 'linear-gradient(to bottom, #F093FB, #F5576C)';
        profilePicture.style.backgroundColor = '';
    }
    
    // Profile container - white background for default
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        profileContainer.style.background = 'white';
        profileContainer.style.backgroundColor = 'white';
    }
    
    // Text colors - dark grey for default (on light grey background)
    // Skip top sections which have green background and white text
    const subsectionTitles = document.querySelectorAll('.subsection-title');
    subsectionTitles.forEach(title => {
        // Set white if it's inside a top section (which has green background and white text)
        if (title.closest('.scramble-top-section') || 
            title.closest('.mc-top-section') || 
            title.closest('.fof-top-section') ||
            title.closest('.quiz-top-section')) {
            title.style.color = 'white';
        } else {
            title.style.color = '#666';
        }
        title.style.textTransform = 'uppercase'; // Ensure uppercase for default
    });
    
    const mcQuestions = document.querySelectorAll('.mc-question');
    mcQuestions.forEach(question => {
        question.style.color = '#666';
    });
    
    const unscrambleLabels = document.querySelectorAll('.unscramble-label');
    unscrambleLabels.forEach(label => {
        label.style.color = '#666';
    });
    
    const fofInstructions = document.querySelectorAll('.fof-instruction');
    fofInstructions.forEach(instruction => {
        instruction.style.color = '#666';
    });
    
    // Quiz text elements - dark grey for default
    const quizQuestions = document.querySelectorAll('.quiz-question');
    quizQuestions.forEach(question => {
        question.style.color = '#666';
    });
    
    const quizDifficulties = document.querySelectorAll('.quiz-difficulty');
    quizDifficulties.forEach(difficulty => {
        difficulty.style.color = '#666';
    });
    
    const quizQuestionNumbers = document.querySelectorAll('.quiz-question-number');
    quizQuestionNumbers.forEach(number => {
        number.style.color = '#999';
    });
    
    // Change section titles to Aleo (default) - remove any inline styles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.style.fontFamily = "'Aleo', serif";
        title.style.transform = 'translateY(2px)';
    });
    
    // Journey page - purple gradient for default
    const journeyPage = document.getElementById('journey-page');
    if (journeyPage) {
        journeyPage.style.background = 'linear-gradient(to bottom, #4A148C, #2E0E5C)';
    }
    
    // Remove any inline styles from letter boxes for default mode (let CSS handle it)
    const letterBoxes = document.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.style.background = '';
        box.style.color = '';
    });
    
    // Also call the scramble.js function if it exists (for dynamically created boxes)
    if (typeof applyLetterBoxStyling === 'function') {
        applyLetterBoxStyling();
    }
    
    // Profile page elements - ensure orange for default (remove any bigy overrides)
    // Note: Deal button containers stay red for both default and bigy
    const dealEarnContainer = document.querySelector('.deal-earn-container');
    if (dealEarnContainer) {
        dealEarnContainer.style.backgroundColor = '#FF8C42';
    }
    
    // Deal button containers - red for default (not orange)
    const dealButtonContainers = document.querySelectorAll('.deal-button-container');
    dealButtonContainers.forEach(container => {
        container.style.backgroundColor = '#dc3545';
    });
    
    const challengesContainer = document.querySelector('.profile-challenges-container');
    if (challengesContainer) {
        challengesContainer.style.borderColor = '#FF8C42';
        challengesContainer.style.background = 'linear-gradient(to bottom, rgba(255, 140, 66, 0.05) 0%, rgba(255, 140, 66, 0.03) 100%)';
        challengesContainer.style.boxShadow = '0 4px 12px rgba(255, 140, 66, 0.15)';
    }
    
    const achievementsContainer = document.querySelector('.profile-achievements-container');
    if (achievementsContainer) {
        achievementsContainer.style.borderColor = '#FF8C42';
        achievementsContainer.style.background = 'linear-gradient(to bottom, rgba(255, 140, 66, 0.05) 0%, rgba(255, 140, 66, 0.03) 100%)';
        achievementsContainer.style.boxShadow = '0 4px 12px rgba(255, 140, 66, 0.15)';
    }
    
    const achievementsHeader = document.querySelector('.achievements-header');
    if (achievementsHeader) {
        achievementsHeader.style.backgroundColor = '#FF8C42';
        achievementsHeader.style.borderBottomColor = 'rgba(255, 140, 66, 0.3)';
    }
    
    const challengesHeader = document.querySelector('.challenges-header');
    if (challengesHeader) {
        challengesHeader.style.backgroundColor = '#FF8C42';
        challengesHeader.style.borderBottomColor = 'rgba(255, 140, 66, 0.3)';
    }
    
    // Challenge items - orange for default (CSS already has orange, but ensure no bigy overrides)
    const challengeItems = document.querySelectorAll('.challenge-item');
    challengeItems.forEach(item => {
        item.style.borderBottomColor = 'rgba(255, 140, 66, 0.2)';
        item.style.background = 'linear-gradient(to bottom, rgba(255, 140, 66, 0.08) 0%, rgba(255, 140, 66, 0.04) 100%)';
    });
    
    // Challenge rewards - orange for default
    const challengeRewards = document.querySelectorAll('.challenge-reward');
    challengeRewards.forEach(reward => {
        reward.style.color = '#FF8C42';
        reward.style.background = 'linear-gradient(135deg, rgba(255, 140, 66, 0.15) 0%, rgba(255, 140, 66, 0.1) 100%)';
        reward.style.boxShadow = '0 2px 4px rgba(255, 140, 66, 0.2)';
    });
    
    // Star icons inline - orange for default
    const starIconsInline = document.querySelectorAll('.star-icon-inline');
    starIconsInline.forEach(icon => {
        icon.style.color = '#FF8C42';
        icon.style.textShadow = '0 1px 2px rgba(255, 140, 66, 0.3)';
    });
    
    // Restore drop shadow on quiz containers for default
    const quizContainers = document.querySelectorAll('.on-this-day-container, .mc-container, .fof-container, .quiz-container');
    quizContainers.forEach(container => {
        container.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    });
    
    // Apply default teal styling to hint button (remove gold styling)
    const hintButton = document.querySelector('.unscramble-hint-btn');
    if (hintButton) {
        hintButton.style.background = 'linear-gradient(to bottom, #6EDDD4, #4ECDC4)';
        hintButton.style.color = 'white';
        hintButton.style.borderRadius = '6px';
        hintButton.style.padding = '8px 24px';
        hintButton.style.fontWeight = '600';
        hintButton.style.boxShadow = '0 2px 6px rgba(78, 205, 196, 0.3)';
        // Remove lightbulb emoji for default
        hintButton.textContent = hintButton.textContent.replace('💡 ', '').replace('💡', '');
        if (hintButton.textContent.trim() === '') {
            hintButton.textContent = 'Hint';
        }
    }
    
    // Star counter - set star icon to orange for default
    const starCounter = document.querySelector('.star-counter');
    if (starCounter) {
        const starIcon = starCounter.querySelector('.star-icon');
        if (starIcon) {
            starIcon.style.color = '#FF8C42';
        }
    }
}

// Initialize bigy carousel
let carouselInterval = null;

function initBigyCarousel() {
    const carouselContainer = document.querySelector('.top-logo-carousel-container');
    if (!carouselContainer) {
        console.error('Carousel container not found!');
        return;
    }
    
    // Show carousel
    carouselContainer.classList.add('active');
    carouselContainer.style.display = 'block';
    
    const slides = carouselContainer.querySelectorAll('.carousel-slide');
    
    const carousel = carouselContainer.querySelector('.top-logo-carousel');
    const leftArrow = carouselContainer.querySelector('.carousel-arrow-left');
    const rightArrow = carouselContainer.querySelector('.carousel-arrow-right');
    let currentSlide = 0;
    
    if (!carousel || slides.length === 0) {
        return;
    }
    
    
    // Initialize carousel wrapper for sliding
    carousel.style.display = 'flex';
    carousel.style.transition = 'transform 1.2s ease';
    // Reset any existing transform - start at slide 0
    carousel.style.transform = 'translateX(0px)';
    carousel.style.left = '0';
    carousel.style.right = 'auto';
    carousel.style.marginLeft = '0';
    carousel.style.marginRight = '0';
    
    // Function to update carousel width and slide positioning
    function updateCarouselDimensions() {
        const containerWidth = carouselContainer.offsetWidth || window.innerWidth;
        if (containerWidth === 0) return;
        
        carousel.style.width = `${slides.length * containerWidth}px`;
        
        // Update each slide to be full container width
        slides.forEach((slide, index) => {
            slide.style.width = `${containerWidth}px`;
            slide.style.flexShrink = '0';
            slide.style.position = 'relative';
        });
    }
    
    // Function to show slide with horizontal movement
    // Each slide is full container width, so translate by -index * containerWidth
    function showSlide(index, instant = false) {
        if (index < 0 || index >= slides.length) {
            console.warn('Invalid slide index:', index);
            return;
        }
        const containerWidth = carouselContainer.offsetWidth || window.innerWidth;
        if (containerWidth === 0) {
            // Container not ready yet, try again
            requestAnimationFrame(() => showSlide(index, instant));
            return;
        }
        
        // If instant, disable transition temporarily
        if (instant) {
            carousel.style.transition = 'none';
        } else {
            carousel.style.transition = 'transform 1.2s ease';
        }
        
        // Calculate offset: move carousel left by index * containerWidth
        // This positions slide[index] at the left edge of the visible container
        const offset = -index * containerWidth;
        carousel.style.transform = `translateX(${offset}px)`;
        currentSlide = index;
        
        // If instant, re-enable transition after a brief moment
        if (instant) {
            requestAnimationFrame(() => {
                carousel.style.transition = 'transform 0.5s ease';
            });
        }
    }
    
    // Function to go to next slide (for auto-cycling - loops around)
    function nextSlide() {
        // If we're at slide 3 (index 2), go to slide 4 (index 3), then instantly jump to slide 1 (index 0)
        if (currentSlide === 2) {
            // Animate to slide 4 (duplicate of slide 1)
            showSlide(3, false);
            // After animation completes, instantly jump to slide 1
            setTimeout(() => {
                showSlide(0, true);
            }, 1200); // Match the transition duration (1.2s = 1200ms)
        } else {
            const next = currentSlide + 1;
            showSlide(next);
        }
    }
    
    // Function to go to next slide manually (no wrap around)
    function nextSlideManual() {
        // Don't go past slide 2 (the last real slide, index 2)
        if (currentSlide >= 2) {
            return;
        }
        const next = currentSlide + 1;
        showSlide(next);
    }
    
    // Function to go to previous slide manually (no wrap around)
    function prevSlide() {
        // Don't go before slide 0 (the first slide)
        if (currentSlide <= 0) {
            return;
        }
        const prev = currentSlide - 1;
        showSlide(prev);
    }
    
    // Initialize dimensions and show first slide (logo)
    // Use requestAnimationFrame to ensure container is rendered
    requestAnimationFrame(() => {
        updateCarouselDimensions();
        // Reset to slide 0 (logo) - ensure transform is 0
        currentSlide = 0;
        carousel.style.transform = 'translateX(0px)';
        
        // Double-check after dimensions are set
        setTimeout(() => {
            updateCarouselDimensions();
            carousel.style.transform = 'translateX(0px)';
            currentSlide = 0;
        }, 10);
    });
    
    // Update on window resize
    window.addEventListener('resize', () => {
        updateCarouselDimensions();
        showSlide(currentSlide); // Re-center current slide after resize
    });
    
    // Arrow click handlers
    if (leftArrow) {
        leftArrow.addEventListener('click', () => {
            prevSlide(); // Manual navigation - no wrap around
            // Reset auto-cycle timer
            clearInterval(carouselInterval);
            carouselInterval = setInterval(nextSlide, 10000);
        });
    }
    
    if (rightArrow) {
        rightArrow.addEventListener('click', () => {
            nextSlideManual(); // Manual navigation - no wrap around
            // Reset auto-cycle timer
            clearInterval(carouselInterval);
            carouselInterval = setInterval(nextSlide, 10000);
        });
    }
    
    // Auto-cycle every 8 seconds (slower pace, longer linger)
    clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 8000);
}

// Initialize type 1 carousel
let carouselIntervalType1 = null;

function initType1Carousel() {
    // Only initialize if header-type1 is visible
    const headerType1 = document.querySelector('.header-type1');
    if (!headerType1 || headerType1.style.display === 'none') {
        return;
    }
    
    const carouselContainer = document.querySelector('.top-logo-carousel-container-type1');
    if (!carouselContainer) {
        return;
    }
    
    const slides = carouselContainer.querySelectorAll('.carousel-slide-type1');
    const carousel = carouselContainer.querySelector('.top-logo-carousel-type1');
    const leftArrow = carouselContainer.querySelector('.carousel-arrow-left-type1');
    const rightArrow = carouselContainer.querySelector('.carousel-arrow-right-type1');
    let currentSlide = 0;
    
    if (!carousel || slides.length === 0) {
        return;
    }
    
    // Initialize carousel wrapper for sliding
    carousel.style.display = 'flex';
    carousel.style.transition = 'transform 1.2s ease';
    carousel.style.transform = 'translateX(0px)';
    carousel.style.left = '0';
    carousel.style.top = '0';
    
    // Function to update carousel width and slide positioning
    function updateCarouselDimensions() {
        const containerWidth = carouselContainer.offsetWidth || window.innerWidth;
        if (containerWidth === 0) return;
        
        carousel.style.width = `${slides.length * containerWidth}px`;
        
        slides.forEach((slide, index) => {
            slide.style.width = `${containerWidth}px`;
            slide.style.flexShrink = '0';
            slide.style.position = 'relative';
        });
    }
    
    // Function to show slide with horizontal movement
    function showSlide(index, instant = false) {
        if (index < 0 || index >= slides.length) {
            return;
        }
        const containerWidth = carouselContainer.offsetWidth || window.innerWidth;
        if (containerWidth === 0) {
            requestAnimationFrame(() => showSlide(index, instant));
            return;
        }
        
        // Check if header-type1 is still visible before animating
        if (headerType1.style.display === 'none') {
            return;
        }
        
        if (instant) {
            carousel.style.transition = 'none';
        } else {
            carousel.style.transition = 'transform 1.2s ease';
        }
        
        const offset = -index * containerWidth;
        carousel.style.transform = `translateX(${offset}px)`;
        currentSlide = index;
        
        if (instant) {
            requestAnimationFrame(() => {
                carousel.style.transition = 'transform 0.5s ease';
            });
        }
    }
    
    // Function to go to next slide (for auto-cycling - loops around)
    function nextSlide() {
        // Check if header-type1 is still visible
        if (headerType1.style.display === 'none') {
            clearInterval(carouselIntervalType1);
            return;
        }
        
        if (currentSlide === 2) {
            showSlide(3, false);
            setTimeout(() => {
                showSlide(0, true);
            }, 1200);
        } else {
            const next = currentSlide + 1;
            showSlide(next);
        }
    }
    
    // Function to go to next slide manually (no wrap around)
    function nextSlideManual() {
        if (headerType1.style.display === 'none') {
            return;
        }
        if (currentSlide >= 2) {
            return;
        }
        const next = currentSlide + 1;
        showSlide(next);
    }
    
    // Function to go to previous slide manually (no wrap around)
    function prevSlide() {
        if (headerType1.style.display === 'none') {
            return;
        }
        if (currentSlide <= 0) {
            return;
        }
        const prev = currentSlide - 1;
        showSlide(prev);
    }
    
    // Initialize dimensions and show first slide
    requestAnimationFrame(() => {
        updateCarouselDimensions();
        currentSlide = 0;
        carousel.style.transform = 'translateX(0px)';
        
        setTimeout(() => {
            updateCarouselDimensions();
            carousel.style.transform = 'translateX(0px)';
            currentSlide = 0;
        }, 10);
    });
    
    // Update on window resize
    window.addEventListener('resize', () => {
        if (headerType1.style.display !== 'none') {
            updateCarouselDimensions();
            showSlide(currentSlide);
        }
    });
    
    // Arrow click handlers
    if (leftArrow) {
        leftArrow.addEventListener('click', () => {
            if (headerType1.style.display !== 'none') {
                prevSlide();
                clearInterval(carouselIntervalType1);
                carouselIntervalType1 = setInterval(nextSlide, 10000);
            }
        });
    }
    
    if (rightArrow) {
        rightArrow.addEventListener('click', () => {
            if (headerType1.style.display !== 'none') {
                nextSlideManual();
                clearInterval(carouselIntervalType1);
                carouselIntervalType1 = setInterval(nextSlide, 10000);
            }
        });
    }
    
    // Auto-cycle every 8 seconds
    clearInterval(carouselIntervalType1);
    carouselIntervalType1 = setInterval(nextSlide, 8000);
}

// Update boost high score from localStorage
function updateBoostHighScore(score = null) {
    const highScoreElement = document.getElementById('boost-high-score');
    if (highScoreElement) {
        if (score !== null) {
            // If score is provided, use it (for real-time updates)
            highScoreElement.textContent = score.toLocaleString();
        } else {
            // Otherwise, read from localStorage
            const highScore = parseInt(localStorage.getItem('match3HighScore') || '0');
            highScoreElement.textContent = highScore.toLocaleString();
        }
    }
}

// Update boost page stats
function updateBoostStats() {
    updateBoostHighScore();
}

// Update boost page for bigy style
function updateBoostPageForBigy() {
    const urlParams = new URLSearchParams(window.location.search);
    const scheme = urlParams.get('s');
    
    // Market Match is now the default, only show Donut Matcher if scheme is explicitly set to 'donut'
    if (scheme === 'donut') {
        // Show Donut Matcher only if explicitly requested
        const gameTitle = document.querySelector('#boost-page .game-title');
        if (gameTitle) {
            gameTitle.textContent = 'DONUT MATCHER';
        }
        const playColorBox = document.querySelector('#boost-page .play-color-box');
        if (playColorBox) {
            playColorBox.style.background = 'linear-gradient(to bottom, #FF6B9D, #C44569)';
            // Remove image if it exists
            const img = playColorBox.querySelector('img');
            if (img) {
                img.remove();
            }
            // Restore SVG if it was removed
            if (!playColorBox.querySelector('svg')) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '120');
                svg.setAttribute('height', '120');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('style', 'margin-bottom: 1px;');
                const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle1.setAttribute('cx', '12');
                circle1.setAttribute('cy', '12');
                circle1.setAttribute('r', '10');
                circle1.setAttribute('fill', 'white');
                circle1.setAttribute('opacity', '0.9');
                const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle2.setAttribute('cx', '12');
                circle2.setAttribute('cy', '12');
                circle2.setAttribute('r', '6');
                circle2.setAttribute('fill', 'none');
                circle2.setAttribute('stroke', '#FF6B9D');
                circle2.setAttribute('stroke-width', '2');
                const circle3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle3.setAttribute('cx', '12');
                circle3.setAttribute('cy', '12');
                circle3.setAttribute('r', '3');
                circle3.setAttribute('fill', '#FF6B9D');
                svg.appendChild(circle1);
                svg.appendChild(circle2);
                svg.appendChild(circle3);
                const gameTitle = playColorBox.querySelector('.game-title');
                if (gameTitle) {
                    playColorBox.insertBefore(svg, gameTitle);
                } else {
                    playColorBox.appendChild(svg);
                }
            }
        }
        return;
    }
    
    // Market Match is now the default - Change game title to Market Match
    const gameTitle = document.querySelector('#boost-page .game-title');
    if (gameTitle) {
        gameTitle.textContent = 'MARKET MATCH';
    }
    
    // Update play-color-box with image and red gradient
    const playColorBox = document.querySelector('#boost-page .play-color-box');
    if (playColorBox) {
        playColorBox.style.background = 'linear-gradient(to bottom, #e84066, #c82a48)';
        
        // Remove existing SVG
        const svg = playColorBox.querySelector('svg');
        if (svg) {
            svg.remove();
        }
        
        // Add image if it doesn't exist
        let img = playColorBox.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            img.src = 'src/img/bigy/sweepsGame.png';
            img.style.height = '100px';
            img.style.width = 'auto';
            img.style.marginBottom = '4px';
            img.style.marginTop = '8px';
            img.style.objectFit = 'contain';
            const title = playColorBox.querySelector('.game-title');
            if (title) {
                playColorBox.insertBefore(img, title);
            } else {
                playColorBox.appendChild(img);
            }
        } else {
            img.src = 'src/img/bigy/sweepsGame.png';
            img.style.height = '100px';
        }
    }
}

// Store current color scheme
let currentColorScheme = null;
// Store whether a logo has been specified
let hasLogo = false;

// Color scheme function
function changeColorScheme(backgroundColor, barColor, calendarColor, textColor, logoPath) {
    // Store the scheme for later use
    currentColorScheme = { backgroundColor, barColor, calendarColor, textColor };
    
    // Change site background
    document.body.style.backgroundColor = backgroundColor;
    
    // Change all light grey sections (but not rival-container and profile-container which should stay light)
    const sections = document.querySelectorAll('.page, .week-section, .section');
    sections.forEach(section => {
        section.style.backgroundColor = backgroundColor;
    });
    
    // Keep rival and wallet pages light (unless dark mode)
    const lightPages = document.querySelectorAll('#rival-page, #wallet-page, #prizes-page');
    lightPages.forEach(page => {
        if (backgroundColor === '#000000') {
            page.style.backgroundColor = '#1a1a1a';
        } else {
            page.style.backgroundColor = '#f8f8f8';
        }
    });
    
    // Keep rival and profile containers light (unless dark mode)
    const lightContainers = document.querySelectorAll('.rival-container, .profile-container, .sweeps-container, .boost-container');
    lightContainers.forEach(container => {
        if (backgroundColor === '#000000') {
            container.style.background = '#1a1a1a';
            container.style.backgroundColor = '#1a1a1a';
            container.style.border = 'none';
        } else {
            container.style.background = '#f8f8f8';
            container.style.backgroundColor = '#f8f8f8';
            container.style.border = 'none';
        }
    });
    
    // Only change header bar if we're not in default/bigy mode
    const currentUrlParams = new URLSearchParams(window.location.search);
    const currentHeaderType = currentUrlParams.get('d');
    const currentScheme = currentUrlParams.get('s');
    const shouldChangeHeader = currentScheme && currentScheme !== 'bigy' && !currentHeaderType;
    
    if (shouldChangeHeader) {
    const headerBar = document.querySelector('.header-bar');
    if (headerBar) {
        headerBar.style.background = barColor;
        }
    }
    
    // Change week container (calendar)
    const weekContainer = document.querySelector('.week-container');
    if (weekContainer) {
        weekContainer.style.background = calendarColor;
        weekContainer.style.border = 'none';
        weekContainer.style.boxShadow = 'none';
    }
    
    // Change game overlay background
    const gameOverlays = document.querySelectorAll('.game-overlay');
    gameOverlays.forEach(overlay => {
        overlay.style.backgroundColor = backgroundColor;
    });
    
    // Change large serif text (section titles)
    const sectionTitles = document.querySelectorAll('.section-title, .week-subtitle, .week-title');
    sectionTitles.forEach(title => {
        title.style.color = textColor;
    });
    
    // Change scramble letter boxes to match top bar (only for custom schemes, not default)
    // Default mode uses CSS red gradient, bigy mode is handled separately
    const currentUrlParamsForBoxes = new URLSearchParams(window.location.search);
    const currentSchemeForBoxes = currentUrlParamsForBoxes.get('s');
    if (currentSchemeForBoxes && currentSchemeForBoxes !== 'bigy') {
    const letterBoxes = document.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.style.background = barColor;
    });
    }
    
    // Hide borders on white boxes
    const whiteBoxes = document.querySelectorAll('.play-box, .arcade-box, .bonus-box, .on-this-day-container, .highlow-container, .profile-container');
    whiteBoxes.forEach(box => {
        box.style.border = 'none';
    });
    
    // Change white backgrounds to dark grey in dark mode
    if (backgroundColor === '#000000') {
        const darkGrey = '#1a1a1a';
        const lightGrey = '#ccc';
        whiteBoxes.forEach(box => {
            box.style.backgroundColor = darkGrey;
        });
        
        // Also change other white elements
        const starCounter = document.querySelector('.star-counter');
        if (starCounter) {
            starCounter.style.backgroundColor = darkGrey;
        }
        
        const profileIcon = document.querySelector('.profile-icon');
        if (profileIcon) {
            profileIcon.style.backgroundColor = darkGrey;
        }
        
        // Change rival-vs background to dark grey and text to light grey
        const rivalVs = document.querySelector('.rival-vs');
        if (rivalVs) {
            rivalVs.style.backgroundColor = darkGrey;
            rivalVs.style.color = lightGrey;
        }
        
        // Change rival page text colors to light grey
        const rivalTitle = document.querySelector('.rival-title');
        if (rivalTitle) {
            rivalTitle.style.color = lightGrey;
        }
        
        const rivalChallenge = document.querySelector('.rival-challenge');
        if (rivalChallenge) {
            rivalChallenge.style.color = lightGrey;
        }
        
        // Change wallet page text colors to light grey
        const walletTextElements = document.querySelectorAll('.profile-username, .profile-level, .stat-label, .stat-value');
        walletTextElements.forEach(element => {
            element.style.color = lightGrey;
        });
        
        // Change sweepstakes page text colors to light grey
        const sweepsTextElements = document.querySelectorAll('.sweeps-subtitle, .current-balance, .entry-count, .rules-text');
        sweepsTextElements.forEach(element => {
            element.style.color = lightGrey;
        });
        
        // Ensure wallet and rival page backgrounds are set
        const walletPage = document.querySelector('#wallet-page');
        if (walletPage) {
            walletPage.style.backgroundColor = darkGrey;
        }
        
        const walletProfileContainer = document.querySelector('#wallet-page .profile-container');
        if (walletProfileContainer) {
            walletProfileContainer.style.background = darkGrey;
            walletProfileContainer.style.backgroundColor = darkGrey;
            walletProfileContainer.style.border = 'none';
        }
        
        const prizesPage = document.querySelector('#prizes-page');
        if (prizesPage) {
            prizesPage.style.backgroundColor = darkGrey;
        }
        
        const rivalPage = document.querySelector('#rival-page');
        if (rivalPage) {
            rivalPage.style.backgroundColor = darkGrey;
        }
        
        const sweepsPage = document.querySelector('#sweeps-page');
        if (sweepsPage) {
            sweepsPage.style.backgroundColor = darkGrey;
        }
        
        const sweepsContainer = document.querySelector('.sweeps-container');
        if (sweepsContainer) {
            sweepsContainer.style.background = darkGrey;
            sweepsContainer.style.backgroundColor = darkGrey;
        }
        
        const boostContainer = document.querySelector('.boost-container');
        if (boostContainer) {
            boostContainer.style.background = darkGrey;
            boostContainer.style.backgroundColor = darkGrey;
        }
        
        // Change all small text to light grey (except date and game titles)
        const smallTextSelectors = '.play-text, .subsection-title, .week-day, .week-date, .bonus-text, .arcade-text, .on-this-day-text, .rival-name, .profile-name, .rival-stars, .profile-total-stars';
        const smallTextElements = document.querySelectorAll(smallTextSelectors);
        smallTextElements.forEach(element => {
            element.style.color = lightGrey;
            // Ensure star icons inside keep their orange color
            const starIcons = element.querySelectorAll('.star-icon');
            starIcons.forEach(icon => {
                icon.style.color = '#FFB84D';
            });
        });
        
        // Keep date text white
        const dateElement = document.querySelector('.date');
        if (dateElement) {
            dateElement.style.color = 'white';
        }
        
        // Also change any text inside white boxes that has dark color
        whiteBoxes.forEach(box => {
            const textElements = box.querySelectorAll('*');
            textElements.forEach(element => {
                if (!element.classList.contains('section-title') && 
                    !element.classList.contains('week-subtitle') &&
                    !element.classList.contains('date') &&
                    !element.classList.contains('game-title') &&
                    !element.classList.contains('star-counter') &&
                    !element.classList.contains('star-icon') &&
                    !element.classList.contains('star-count')) {
                    const computedStyle = window.getComputedStyle(element);
                    const color = computedStyle.color;
                    // Only change dark text colors (black, dark grey)
                    if (color === 'rgb(0, 0, 0)' || color === 'rgb(51, 51, 51)' || color === 'rgb(68, 68, 68)' || color === 'rgb(102, 102, 102)' || color === 'rgb(34, 34, 34)') {
                        // Skip if it's white text or already styled
                        if (color !== 'rgb(255, 255, 255)' && !element.style.color) {
                            element.style.color = lightGrey;
                        }
                    }
                }
            });
        });
    }
    
    // Check URL parameter for logo placement
    const urlParams = new URLSearchParams(window.location.search);
    const headerType = urlParams.get('d');
    const isBigy = headerType === 'bigy';
    const isBigy2 = headerType === 'bigy2';
    const isBigyMode = isBigy || isBigy2;
    
    // Show and set logo
    const logo = document.querySelector('.header-logo');
    
    if (logoPath) {
        hasLogo = true;
            if (logo) {
                logo.src = logoPath;
            // Only show logo if close button is not showing AND we're in bigy or bigy2 mode
                const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton && !closeButton.classList.contains('show') && isBigyMode) {
                    logo.style.display = 'block';
                } else {
                    logo.style.display = 'none';
            }
        }
    } else {
        if (logo) {
        logo.style.display = 'none';
        }
        hasLogo = false;
    }
    
    // Watch for dynamically added letter boxes
    observeLetterBoxes();
}

// Helper function to update logo visibility based on close button state
function updateLogoVisibility() {
    const logo = document.querySelector('.header-logo');
    const closeButton = document.querySelector('.game-overlay-close');
    const helpButton = document.querySelector('.help-button');
    
    // Check if we're in default, bigy, or bigy2 mode
    const urlParams = new URLSearchParams(window.location.search);
    const headerType = urlParams.get('d');
    const isBigy = headerType === 'bigy';
    const isBigy2 = headerType === 'bigy2';
    const isBigyMode = isBigy || isBigy2;
    
    // Hide/show help button based on close button state
    if (helpButton) {
        if (closeButton && closeButton.classList.contains('show')) {
            helpButton.classList.add('hidden');
            helpButton.style.display = 'none';
        } else {
            helpButton.classList.remove('hidden');
            helpButton.style.display = 'inline-flex';
            // Set help button color based on mode
            if (isBigyMode) {
                helpButton.style.color = 'white';
                helpButton.style.borderColor = 'white';
            } else {
                helpButton.style.color = '#666';
                helpButton.style.borderColor = '#666';
            }
        }
    }
    
    // Show/hide logo based on game overlay state and mode
            if (logo) {
                if (closeButton && closeButton.classList.contains('show')) {
            // Game overlay is open - hide logo
                    logo.style.display = 'none';
                } else {
            // Game overlay is closed - show logo for bigy and bigy2
            logo.style.display = isBigyMode ? 'block' : 'none';
            }
        }
}

// Function to observe and style dynamically added letter boxes
function observeLetterBoxes() {
    const unscrambleContainer = document.querySelector('.unscramble-boxes');
    if (!unscrambleContainer || !currentColorScheme) return;
    
    // Only observe for custom schemes, not default (default uses CSS)
    const urlParams = new URLSearchParams(window.location.search);
    const scheme = urlParams.get('s');
    if (!scheme || scheme === 'bigy') return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('letter-box')) {
                    node.style.background = currentColorScheme.barColor;
                }
            });
        });
    });
    
    observer.observe(unscrambleContainer, { childList: true });
}

// Check URL parameters when page loads
checkURLParameters();

// Check for splash overlay parameter
function checkSplashOverlay() {
    const urlParams = new URLSearchParams(window.location.search);
    const splash = urlParams.get('splash');
    
    if (splash === 'true') {
        // Use multiple attempts to ensure DOM is ready
        const showOverlay = () => {
            const splashOverlay = document.getElementById('splash-overlay');
            if (splashOverlay) {
                splashOverlay.style.display = 'block';
                
                // Remove overlay on click
                splashOverlay.addEventListener('click', () => {
                    splashOverlay.style.display = 'none';
                });
                return true;
            }
            return false;
        };
        
        // Try immediately
        if (!showOverlay()) {
            // If element not found, try after DOMContentLoaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(showOverlay, 50);
                });
            } else {
                // DOM already loaded, try with a small delay
                setTimeout(showOverlay, 50);
            }
        }
    }
}

// Initialize splash overlay
checkSplashOverlay();

// Also check on window load as a fallback
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const splash = urlParams.get('splash');
    if (splash === 'true') {
        const splashOverlay = document.getElementById('splash-overlay');
        if (splashOverlay && splashOverlay.style.display === 'none') {
            splashOverlay.style.display = 'block';
        }
    }
});

// Keyboard shortcut to test color scheme
document.addEventListener('keydown', (e) => {
    // '8' key cheat to unlock bonus spin
    if (e.key === '8') {
        localStorage.setItem('bonusSpinCheatUnlocked', 'true');
        updateBonusSpinDisplay();
        console.log('Bonus spin unlocked via cheat');
    }
    
    if (e.key === 'q' || e.key === 'Q') {
        // Reset daily game data for today
        const todayKey = getTodayKey();
        
        // Phrases
        localStorage.removeItem(`phrasesState_${todayKey}`);
        localStorage.removeItem(`phrasesStars_${todayKey}`);
        localStorage.removeItem(`phrasesComplete_${todayKey}`);
        
        // Suspect
        localStorage.removeItem(`suspectState_${todayKey}`);
        localStorage.removeItem(`suspectStars_${todayKey}`);
        localStorage.removeItem(`suspectComplete_${todayKey}`);
        localStorage.removeItem(`suspectWon_${todayKey}`);
        
        // Cross
        localStorage.removeItem(`crossState_${todayKey}`);
        localStorage.removeItem(`crossStars_${todayKey}`);
        localStorage.removeItem(`crossComplete_${todayKey}`);
        
        // Defuser
        localStorage.removeItem(`defuserStars_${todayKey}`);
        localStorage.removeItem(`defuserStarted_${todayKey}`);
        if (window.defuserIframe) {
            try {
                const iframe = document.getElementById('defuserIframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage('resetDefuserLocalStorage', '*');
                }
            } catch (err) {
                console.warn('Could not message defuser iframe to reset storage:', err);
            }
        }
        
        // Tally
        localStorage.removeItem(`tallyStars_${todayKey}`);
        localStorage.removeItem(`tallyStarted_${todayKey}`);
        localStorage.removeItem(`tallyState_${todayKey}`);
        localStorage.removeItem(`tallyComplete_${todayKey}`);
        try {
            const tallyIframe = document.getElementById('tallyIframe');
            if (tallyIframe && tallyIframe.contentWindow) {
                tallyIframe.contentWindow.postMessage('resetTallyLocalStorage', '*');
            }
        } catch (err) {
            console.warn('Could not message tally iframe to reset storage:', err);
        }
        
        // Gold Case (puzzle game)
        localStorage.removeItem(`goldCaseStars_${todayKey}`);
        localStorage.removeItem(`goldCaseComplete_${todayKey}`);
        localStorage.removeItem(`goldCaseScore_${todayKey}`);
        // Reset bonus spin data
        localStorage.removeItem(`bonusSpinSpun_${todayKey}`);
        localStorage.removeItem(`bonusSpinStars_${todayKey}`);
        localStorage.removeItem('bonusSpinCheatUnlocked');
        console.log('[MainPage] RESET: Cleared puzzle and bonus spin data for key:', todayKey);
        
        // Update bonus spin display after reset
        updateBonusSpinDisplay();
        
        // Update cross stars display
        if (window.updateCrossStars) {
            window.updateCrossStars();
        }
        
        // Reload main game scores so puzzle stars / cards refresh
        if (window.loadGameScores2) {
            window.loadGameScores2();
        }
        
        // Update the display
        if (window.loadGameScores) {
            window.loadGameScores();
        }
        if (window.updatePhrasesStars) {
            window.updatePhrasesStars();
        }
        if (window.updateSuspectStars) {
            window.updateSuspectStars();
        }
        if (window.updateCrossStars) {
            window.updateCrossStars();
        }
    } else if (e.key === '1') {
        // Debug: Show all data for today
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        console.log('=== TODAY\'S DATA (' + todayKey + ') ===');
        const todayKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(todayKey)) {
                todayKeys.push({ key, value: localStorage.getItem(key) });
            }
        }
        
        // Sort and display
        todayKeys.sort((a, b) => a.key.localeCompare(b.key));
        todayKeys.forEach(item => {
            console.log(`${item.key}: ${item.value}`);
        });
        
        // Also show non-dated items
        console.log('\n=== GLOBAL DATA ===');
        console.log('totalStars:', localStorage.getItem('totalStars'));
        console.log('=== END TODAY\'S DATA ===\n');
    } else if (e.key === '2') {
        // Debug: Show all data organized by date
        console.log('=== ALL DATA BY DATE ===');
        
        const dataByDate = {};
        const globalData = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            
            // Check if key contains a date pattern (YYYY-MM-DD or YYYY-M-D)
            const dateMatch = key.match(/(\d{4}-\d{1,2}-\d{1,2})/);
            
            if (dateMatch) {
                const date = dateMatch[1];
                if (!dataByDate[date]) {
                    dataByDate[date] = [];
                }
                dataByDate[date].push({ key, value });
            } else if (key.includes('Stars') || key.includes('stars') || key.includes('Complete') || key.includes('Score')) {
                globalData[key] = value;
            }
        }
        
        // Sort dates and display
        const sortedDates = Object.keys(dataByDate).sort().reverse();
        sortedDates.forEach(date => {
            console.log(`\n--- ${date} ---`);
            dataByDate[date].sort((a, b) => a.key.localeCompare(b.key));
            dataByDate[date].forEach(item => {
                console.log(`${item.key}: ${item.value}`);
            });
        });
        
        console.log('\n--- GLOBAL DATA ---');
        Object.keys(globalData).sort().forEach(key => {
            console.log(`${key}: ${globalData[key]}`);
        });
        
        console.log('=== END ALL DATA ===\n');
    }
});

// Memory game overlay
const memoryBox = document.getElementById('memoryBox');
const memoryOverlay = document.getElementById('memoryOverlay');

if (memoryBox) {
    memoryBox.addEventListener('click', () => {
        if (memoryOverlay) {
            memoryOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();
            
            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('memoryIframe');
            if (iframe) {
                iframe.src = scheme ? `games/memory/index.html?s=${scheme}` : 'games/memory/index.html';
                console.log(`Reloading memory game iframe: ${iframe.src}`);
            }
        }
    });
}

// memoryClose removed - now using single close button

let pendingCloseGameId = null;
let pendingCloseOverlayElement = null;
let pendingCloseIframeElement = null;

function actuallyCloseOverlay(activeOverlay, overlayElement, iframeToUnload) {
    if (overlayElement) {
        overlayElement.classList.remove('active');
    }
    if (iframeToUnload) {
        console.log(`Unloading ${activeOverlay} game iframe by setting src to 'about:blank'`);
        iframeToUnload.src = 'about:blank';
    }
    
    // Update bonus spin display when closing other games (to check if unlock status changed)
    // But NOT when closing the bonus spin game itself
    if (activeOverlay !== 'goldCase') {
        setTimeout(() => {
            updateBonusSpinDisplay();
        }, 200);
    }
    
    document.body.style.overflow = '';
    
    // Reload game scores to update stars
    loadGameScores2();
}

// Main close button handler
const closeButton = document.querySelector('.game-overlay-close');
if (closeButton) {
    closeButton.addEventListener('click', () => {
        
        // Hide close button
        closeButton.classList.remove('show');
        updateLogoVisibility();
        
        // Find which overlay is currently active
        const memoryOverlay = document.getElementById('memoryOverlay');
        const mysteryWordOverlay = document.getElementById('mysteryWordOverlay');
        const beticleOverlay = document.getElementById('beticleOverlay');
        const blackjackOverlay = document.getElementById('blackjackOverlay');
        const lostAndFoundOverlay = document.getElementById('lostAndFoundOverlay');
        const goldCaseOverlay = document.getElementById('goldCaseOverlay');
        const zoomOverlay = document.getElementById('zoomOverlay');
        const shiftOverlay = document.getElementById('shiftOverlay');
        const phrasesOverlay = document.getElementById('phrasesOverlay');
        const crossOverlay = document.getElementById('crossOverlay');
        const suspectOverlay = document.getElementById('suspectOverlay');
        const match3Overlay = document.getElementById('match3Overlay');
        const defuserOverlay = document.getElementById('defuserOverlay');
        const tallyOverlay = document.getElementById('tallyOverlay');
        
        // Determine which overlay is active
        let activeOverlay = null;
        let overlayElement = null;
        let iframeToUnload = null;
        if (memoryOverlay && memoryOverlay.classList.contains('active')) {
            activeOverlay = 'memory';
            overlayElement = memoryOverlay;
            iframeToUnload = document.getElementById('memoryIframe');
        } else if (mysteryWordOverlay && mysteryWordOverlay.classList.contains('active')) {
            activeOverlay = 'mysteryWord';
            overlayElement = mysteryWordOverlay;
            iframeToUnload = document.getElementById('mysteryWordIframe');
        } else if (beticleOverlay && beticleOverlay.classList.contains('active')) {
            activeOverlay = 'beticle';
            overlayElement = beticleOverlay;
            iframeToUnload = document.getElementById('beticleIframe');
        } else if (blackjackOverlay && blackjackOverlay.classList.contains('active')) {
            activeOverlay = 'blackjack';
            overlayElement = blackjackOverlay;
            iframeToUnload = document.getElementById('blackjackIframe');
        } else if (lostAndFoundOverlay && lostAndFoundOverlay.classList.contains('active')) {
            activeOverlay = 'lostAndFound';
            overlayElement = lostAndFoundOverlay;
            iframeToUnload = document.getElementById('lostAndFoundIframe');
        } else if (goldCaseOverlay && goldCaseOverlay.classList.contains('active')) {
            activeOverlay = 'goldCase';
            overlayElement = goldCaseOverlay;
            iframeToUnload = document.getElementById('goldCaseIframe');
        } else if (zoomOverlay && zoomOverlay.classList.contains('active')) {
            activeOverlay = 'zoom';
            overlayElement = zoomOverlay;
            iframeToUnload = document.getElementById('zoomIframe');
        } else if (shiftOverlay && shiftOverlay.classList.contains('active')) {
            activeOverlay = 'shift';
            overlayElement = shiftOverlay;
            iframeToUnload = document.getElementById('shiftIframe');
        } else if (phrasesOverlay && phrasesOverlay.classList.contains('active')) {
            activeOverlay = 'phrases';
            overlayElement = phrasesOverlay;
            iframeToUnload = document.getElementById('phrasesIframe');
        } else if (crossOverlay && crossOverlay.classList.contains('active')) {
            activeOverlay = 'cross';
            overlayElement = crossOverlay;
            iframeToUnload = document.getElementById('crossIframe');
        } else if (suspectOverlay && suspectOverlay.classList.contains('active')) {
            activeOverlay = 'suspect';
            overlayElement = suspectOverlay;
            iframeToUnload = document.getElementById('suspectIframe');
        } else if (match3Overlay && match3Overlay.classList.contains('active')) {
            activeOverlay = 'match3';
            overlayElement = match3Overlay;
            iframeToUnload = document.getElementById('match3Iframe');
        } else if (defuserOverlay && defuserOverlay.classList.contains('active')) {
            activeOverlay = 'defuser';
            overlayElement = defuserOverlay;
            iframeToUnload = document.getElementById('defuserIframe');
        } else if (tallyOverlay && tallyOverlay.classList.contains('active')) {
            activeOverlay = 'tally';
            overlayElement = tallyOverlay;
            iframeToUnload = document.getElementById('tallyIframe');
        }
        
        // For puzzle games that are not yet completed, show the "Game not complete" modal
        const modal = document.getElementById('gameIncompleteModal');
        const isPuzzle = activeOverlay && !!getPuzzleStarsKey(activeOverlay);
        const hasStarted = isPuzzle && isPuzzleSessionStarted(activeOverlay);
        if (modal && isPuzzle && hasStarted && !isPuzzleGameCompleted(activeOverlay)) {
            pendingCloseGameId = activeOverlay;
            pendingCloseOverlayElement = overlayElement;
            pendingCloseIframeElement = iframeToUnload;
            modal.style.display = 'flex';
            return;
        }
        
        // Non-puzzle games or already-completed puzzles: close immediately
        if (activeOverlay) {
            actuallyCloseOverlay(activeOverlay, overlayElement, iframeToUnload);
        }
    });
}

// Game incomplete modal buttons
const gameIncompleteModal = document.getElementById('gameIncompleteModal');
const gameQuitButton = document.getElementById('gameQuitButton');
const gameKeepPlayingButton = document.getElementById('gameKeepPlayingButton');

if (gameQuitButton && gameIncompleteModal) {
    gameQuitButton.addEventListener('click', () => {
        if (pendingCloseGameId) {
            const key = getPuzzleStarsKey(pendingCloseGameId);
            if (key) {
                // Always mark game as completed with 0 stars (override any previous value)
                localStorage.setItem(key, '0');
            }
            
            // Reset per-game localStorage for DEFUSER and TALLY on quit
            const todayKey = getTodayKey();
            if (pendingCloseGameId === 'defuser') {
                localStorage.removeItem(`defuserStarted_${todayKey}`);
                // Ask defuser iframe to clear any of its own localStorage keys
                const defuserIframe = document.getElementById('defuserIframe');
                if (defuserIframe && defuserIframe.contentWindow) {
                    defuserIframe.contentWindow.postMessage('resetDefuserLocalStorage', '*');
                }
            } else if (pendingCloseGameId === 'tally') {
                localStorage.removeItem(`tallyStarted_${todayKey}`);
                localStorage.removeItem(`tallyState_${todayKey}`);
                localStorage.removeItem(`tallyComplete_${todayKey}`);
                // Ask tally iframe to clear any of its own localStorage keys
                const tallyIframe = document.getElementById('tallyIframe');
                if (tallyIframe && tallyIframe.contentWindow) {
                    tallyIframe.contentWindow.postMessage('resetTallyLocalStorage', '*');
                }
            }
            
            actuallyCloseOverlay(pendingCloseGameId, pendingCloseOverlayElement, pendingCloseIframeElement);
        }
        pendingCloseGameId = null;
        pendingCloseOverlayElement = null;
        pendingCloseIframeElement = null;
        gameIncompleteModal.style.display = 'none';
    });
}

if (gameKeepPlayingButton && gameIncompleteModal) {
    gameKeepPlayingButton.addEventListener('click', () => {
        pendingCloseGameId = null;
        pendingCloseOverlayElement = null;
        pendingCloseIframeElement = null;
        gameIncompleteModal.style.display = 'none';
        
        // Restore close button since overlay is still active
        const closeButtonEl = document.querySelector('.game-overlay-close');
        if (closeButtonEl) {
            closeButtonEl.classList.add('show');
            updateLogoVisibility();
        }
    });
}

// Close overlay when clicking outside
if (memoryOverlay) {
    memoryOverlay.addEventListener('click', (e) => {
        if (e.target === memoryOverlay) {
            memoryOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Hide close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.remove('show');
            updateLogoVisibility();
            
            const iframe = document.getElementById('memoryIframe');
            if (iframe) {
                console.log("Unloading memory game iframe by setting src to 'about:blank' (click outside)");
                iframe.src = 'about:blank';
            }
        }
    });
}

// Mystery Word game overlay
const mysteryWordBox = document.getElementById('mysteryWordBox');
const mysteryWordOverlay = document.getElementById('mysteryWordOverlay');

// Beticle game overlay
const beticleBox = document.getElementById('beticleBox');
const beticleOverlay = document.getElementById('beticleOverlay');

if (mysteryWordBox) {
    mysteryWordBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('mysteryWord')) {
            showCompletedBadge(mysteryWordBox);
            return;
        }
        
        if (mysteryWordOverlay) {
            console.log('SHOWING mystery word game');
            mysteryWordOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();
            
            // Reload iframe (it may have been unloaded to 'about:blank')
            const mysteryIframe = document.getElementById('mysteryWordIframe');
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            if (mysteryIframe) {
                mysteryIframe.src = scheme ? `games/mysteryWord/index.html?s=${scheme}` : 'games/mysteryWord/index.html';
                console.log(`Reloading mysteryWord game iframe: ${mysteryIframe.src}`);
            }
            
            // Tell iframe it's now visible - call positioning win message
            setTimeout(() => {
                if (mysteryIframe && mysteryIframe.contentWindow) {
                    // console.log('Sending mysteryWordShown message to iframe');
                    mysteryIframe.contentWindow.postMessage('mysteryWordShown', '*');
                }
            }, 100);
        }
    });
}

// This code was moved up to closeButton handler

// Close mystery word overlay when clicking outside
if (mysteryWordOverlay) {
    mysteryWordOverlay.addEventListener('click', (e) => {
        if (e.target === mysteryWordOverlay) {
            console.log('HIDING mystery word game (click outside)');
            mysteryWordOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Hide close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.remove('show');
            updateLogoVisibility();
            
            const iframe = document.getElementById('mysteryWordIframe');
            if (iframe) {
                console.log("Unloading mysteryWord game iframe by setting src to 'about:blank' (click outside)");
                iframe.src = 'about:blank';
            }
        }
    });
}

if (beticleBox) {
    beticleBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('beticle')) {
            showCompletedBadge(beticleBox);
            return;
        }
        
        if (beticleOverlay) {
            console.log('SHOWING beticle game');
            beticleOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();
            
            // Reload iframe (it may have been unloaded to 'about:blank')
            const beticleIframe = document.getElementById('beticleIframe');
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            if (beticleIframe) {
                beticleIframe.src = scheme ? `games/beticle/index.html?s=${scheme}` : 'games/beticle/index.html';
                console.log(`Reloading beticle game iframe: ${beticleIframe.src}`);
            }
            
            // Tell iframe it's now visible
            setTimeout(() => {
                if (beticleIframe && beticleIframe.contentWindow) {
                    console.log('Sending beticleShown message to iframe');
                    beticleIframe.contentWindow.postMessage('beticleShown', '*');
                }
            }, 100);
        }
    });
}

// Close beticle overlay when clicking outside
if (beticleOverlay) {
    beticleOverlay.addEventListener('click', (e) => {
        if (e.target === beticleOverlay) {
            console.log('HIDING beticle game (click outside)');
            beticleOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Hide close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.remove('show');
            updateLogoVisibility();
            
            const iframe = document.getElementById('beticleIframe');
            if (iframe) {
                console.log("Unloading beticle game iframe by setting src to 'about:blank' (click outside)");
                iframe.src = 'about:blank';
            }
        }
    });
}

// Blackjack (Speed 21) game overlay
const speed21Box = document.getElementById('speed21Box');
const blackjackOverlay = document.getElementById('blackjackOverlay');

if (speed21Box) {
    speed21Box.addEventListener('click', () => {
        if (blackjackOverlay) {
            blackjackOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();
            
            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('blackjackIframe');
            if (iframe) {
                iframe.src = scheme ? `games/blackjack/index.html?s=${scheme}` : 'games/blackjack/index.html';
                console.log(`Reloading blackjack game iframe: ${iframe.src}`);
            }
        }
    });
}

// Close blackjack overlay when clicking outside
if (blackjackOverlay) {
    blackjackOverlay.addEventListener('click', (e) => {
        if (e.target === blackjackOverlay) {
            blackjackOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Hide close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.remove('show');
            updateLogoVisibility();
            
            const iframe = document.getElementById('blackjackIframe');
            if (iframe) {
                console.log("Unloading blackjack game iframe by setting src to 'about:blank' (click outside)");
                iframe.src = 'about:blank';
            }
        }
    });
}

// Lost and Found game overlay
const lostAndFoundBox = document.getElementById('lostAndFoundBox');
const lostAndFoundOverlay = document.getElementById('lostAndFoundOverlay');

if (lostAndFoundBox) {
    lostAndFoundBox.addEventListener('click', () => {
        if (lostAndFoundOverlay) {
            lostAndFoundOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();
            
            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('lostAndFoundIframe');
            if (iframe) {
                iframe.src = scheme ? `games/lostAndFound/index.html?s=${scheme}` : 'games/lostAndFound/index.html';
                // Set iOS-specific attributes for touch handling
                iframe.setAttribute('allow', 'touch');
                iframe.style.touchAction = 'none';
                iframe.style.webkitOverflowScrolling = 'touch';
                console.log(`Reloading lostAndFound game iframe: ${iframe.src}`);
            }
        }
    });
}

// Zoom puzzle box (Daily Puzzles)
const tilesBox = document.getElementById('tilesBox');
const zoomOverlay = document.getElementById('zoomOverlay');

if (tilesBox) {
    tilesBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('zoom')) {
            showCompletedBadge(tilesBox);
            return;
        }
        
        if (zoomOverlay) {
            zoomOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();

            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('zoomIframe');
            if (iframe) {
                iframe.src = scheme ? `games/zoom/index.html?s=${scheme}` : 'games/zoom/index.html';
                console.log(`Reloading zoom game iframe: ${iframe.src}`);
            }
        }
    });
}

// Shift puzzle box (Daily Puzzles)
const shiftBox = document.getElementById('shiftBox');
const shiftOverlay = document.getElementById('shiftOverlay');

if (shiftBox) {
    shiftBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('shift')) {
            showCompletedBadge(shiftBox);
            return;
        }
        
        if (shiftOverlay) {
            shiftOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();

            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('shiftIframe');
            if (iframe) {
                iframe.src = scheme ? `games/shift/index.html?s=${scheme}` : 'games/shift/index.html';
                console.log(`Reloading shift game iframe: ${iframe.src}`);
            }
        }
    });
}

// Cross game box
const crossBox = document.getElementById('crossBox');
const crossOverlay = document.getElementById('crossOverlay');

if (crossBox) {
    crossBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('cross')) {
            showCompletedBadge(crossBox);
            return;
        }
        
        if (crossOverlay) {
            crossOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();

            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('crossIframe');
            if (iframe) {
                iframe.src = scheme ? `games/cross/index.html?s=${scheme}` : 'games/cross/index.html';
                console.log(`Reloading cross game iframe: ${iframe.src}`);
            }
        }
    });
}

// Suspect game box
const suspectBox = document.getElementById('suspectBox');
const suspectOverlay = document.getElementById('suspectOverlay');

if (suspectBox) {
    suspectBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('suspect')) {
            showCompletedBadge(suspectBox);
            return;
        }
        
        if (suspectOverlay) {
            suspectOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();

            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('suspectIframe');
            if (iframe) {
                iframe.src = scheme ? `games/suspect/index.html?s=${scheme}` : 'games/suspect/index.html';
                console.log(`Reloading suspect game iframe: ${iframe.src}`);
            }
        }
    });
}

// Defuser game box
const defuserBox = document.getElementById('defuserBox');
const defuserOverlay = document.getElementById('defuserOverlay');

if (defuserBox) {
    defuserBox.addEventListener('click', () => {
        // Reset per-session started flag whenever opening the game
        defuserSessionStarted = false;
        
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('defuser')) {
            showCompletedBadge(defuserBox);
            return;
        }
        
        if (defuserOverlay) {
            defuserOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();

            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('defuserIframe');
            if (iframe) {
                iframe.src = scheme ? `games/defuser/index.html?s=${scheme}` : 'games/defuser/index.html';
                console.log(`Reloading defuser game iframe: ${iframe.src}`);
            }
        }
    });
}

// TALLY game box
const tallyBox = document.getElementById('tallyBox');
const tallyOverlay = document.getElementById('tallyOverlay');

if (tallyBox) {
    tallyBox.addEventListener('click', () => {
        // Reset per-session started flag whenever opening the game
        tallySessionStarted = false;
        
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('tally')) {
            showCompletedBadge(tallyBox);
            return;
        }
        
        if (tallyOverlay) {
            tallyOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();

            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('tallyIframe');
            if (iframe) {
                iframe.src = scheme ? `games/tally/index.html?s=${scheme}` : 'games/tally/index.html';
                console.log(`Reloading tally game iframe: ${iframe.src}`);
            }
        }
    });
}

const phrasesBox = document.getElementById('phrasesBox');
const phrasesOverlay = document.getElementById('phrasesOverlay');

if (phrasesBox) {
    phrasesBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('phrases')) {
            showCompletedBadge(phrasesBox);
            return;
        }
        
        if (phrasesOverlay) {
            phrasesOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();

            // Reload iframe (it may have been unloaded to 'about:blank')
            const phrasesIframe = document.getElementById('phrasesIframe');
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            if (phrasesIframe) {
                phrasesIframe.src = scheme ? `games/phrases/index.html?s=${scheme}` : 'games/phrases/index.html';
                console.log(`Reloading phrases game iframe: ${phrasesIframe.src}`);
            }
        }
    });
}

// Gold Case puzzle box (Daily Puzzles)
const goldCasePuzzleBox = document.getElementById('goldCasePuzzleBox');
const goldCaseOverlay = document.getElementById('goldCaseOverlay');

if (goldCasePuzzleBox) {
    goldCasePuzzleBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('goldCase')) {
            showCompletedBadge(goldCasePuzzleBox);
            return;
        }
        
        if (goldCaseOverlay) {
            goldCaseOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();

            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('goldCaseIframe');
            if (iframe) {
                iframe.src = scheme ? `games/goldCase/index.html?s=${scheme}` : 'games/goldCase/index.html';
                console.log(`Reloading goldCase game iframe: ${iframe.src}`);
            }
        }
    });
}

// Gold Case game overlay (Daily Bonus)
// Check if 8 games have been played today (games that awarded stars, even if 0)
function checkBonusSpinUnlock() {
    const todayKey = getTodayKey();
    const playedGames = JSON.parse(localStorage.getItem(`playedGames_${todayKey}`) || '[]');
    return playedGames.length >= 8;
}

// Initialize bonus spin display immediately (before DOMContentLoaded)
(function() {
    function initBonusSpinDisplay() {
        const goldCaseLockText = document.getElementById('goldCaseLockText');
        const goldCaseStars = document.getElementById('goldCaseStars');
        
        if (goldCaseLockText && goldCaseStars) {
            // Start with both hidden to prevent flash, then immediately show the correct one
            goldCaseLockText.style.display = 'none';
            goldCaseStars.style.display = 'none';
            
            // Immediately call updateBonusSpinDisplay to show the correct state
            updateBonusSpinDisplay();
        }
    }
    
    // Run immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBonusSpinDisplay);
    } else {
        initBonusSpinDisplay();
    }
})();

// Update bonus spin display (lock/unlock and stars)
function updateBonusSpinDisplay() {
    const goldCaseBox = document.getElementById('goldCaseBox');
    const goldCaseLockText = document.getElementById('goldCaseLockText');
    const goldCaseStars = document.getElementById('goldCaseStars');
    const todayKey = getTodayKey();
    const starsWon = parseInt(localStorage.getItem(`bonusSpinStars_${todayKey}`) || '0');
    const isUnlocked = checkBonusSpinUnlock() || localStorage.getItem('bonusSpinCheatUnlocked') === 'true';
    const hasSpun = localStorage.getItem(`bonusSpinSpun_${todayKey}`) === 'true';
    
    if (!goldCaseBox || !goldCaseLockText || !goldCaseStars) return;
    
    // Always hide both first to prevent both showing at once
    goldCaseLockText.style.display = 'none';
    goldCaseStars.style.display = 'none';
    
    // If unlocked OR has spun (has stars), show stars. Otherwise show lock.
    // Once unlocked, never show lock again.
    if (isUnlocked || hasSpun || starsWon > 0) {
        // Show stars, keep lock text hidden
        goldCaseStars.style.display = 'flex';
        
        // Update star colors based on stars won (10 stars total, 5x2 layout)
        const rows = goldCaseStars.querySelectorAll('.bonus-stars-row');
        if (rows.length === 2) {
            rows[0].innerHTML = '';
            rows[1].innerHTML = '';
            
            // Ensure starsWon is a valid number and doesn't exceed 10
            const validStarsWon = Math.min(Math.max(0, starsWon), 10);
            
            for (let i = 0; i < 10; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = i < validStarsWon ? '#FF8C42' : '#ddd';
                star.style.fontSize = '18px';
                star.style.letterSpacing = '0px';
                
                // First 5 stars go in first row, next 5 in second row
                if (i < 5) {
                    rows[0].appendChild(star);
                } else {
                    rows[1].appendChild(star);
                }
            }
        }
        
        // Make clickable
        goldCaseBox.style.cursor = 'pointer';
    } else {
        // Show lock text only (stars already hidden above)
        goldCaseLockText.style.display = 'flex';
        
        // Make clickable (don't grey out)
        goldCaseBox.style.cursor = 'pointer';
    }
}

// Function to update bonus spin stars (called from iframe)
window.updateBonusSpinStars = function() {
    updateBonusSpinDisplay();
};

const goldCaseBox = document.getElementById('goldCaseBox');

if (goldCaseBox) {
    goldCaseBox.addEventListener('click', () => {
        const isUnlocked = checkBonusSpinUnlock() || localStorage.getItem('bonusSpinCheatUnlocked') === 'true';
        
        if (!isUnlocked) {
            return; // Don't open if locked
        }
        
        if (goldCaseOverlay) {
            goldCaseOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.add('show');
            updateLogoVisibility();

            // Reload iframe (it may have been unloaded to 'about:blank')
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('goldCaseIframe');
            if (iframe) {
                iframe.src = scheme ? `games/bonusSpin/index.html?s=${scheme}` : 'games/bonusSpin/index.html';
                console.log(`Reloading bonusSpin game iframe: ${iframe.src}`);
            }
        }
    });
}

// Close Gold Case overlay when clicking outside
if (goldCaseOverlay) {
    goldCaseOverlay.addEventListener('click', (e) => {
        if (e.target === goldCaseOverlay) {
            goldCaseOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Hide close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.remove('show');
            updateLogoVisibility();
            
            const iframe = document.getElementById('goldCaseIframe');
            if (iframe) {
                console.log("Unloading goldCase game iframe by setting src to 'about:blank' (click outside)");
                iframe.src = 'about:blank';
            }
        }
    });
}

// Close Gold Case overlay when clicking close button
// goldCaseClose and lostAndFoundClose removed - now using single close button

// Close lost and found overlay when clicking outside
if (lostAndFoundOverlay) {
    lostAndFoundOverlay.addEventListener('click', (e) => {
        if (e.target === lostAndFoundOverlay) {
            lostAndFoundOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Hide close button
            const closeButton = document.querySelector('.game-overlay-close');
            if (closeButton) closeButton.classList.remove('show');
            updateLogoVisibility();
            
            const iframe = document.getElementById('lostAndFoundIframe');
            if (iframe) {
                console.log("Unloading lostAndFound game iframe by setting src to 'about:blank' (click outside)");
                iframe.src = 'about:blank';
            }
            loadGameScores2();
        }
    });
}

// Removed duplicate - moved to top of file

// Sweepstakes functionality
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getDailyStars() {
    const todayKey = getTodayKey();
    return parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
}

function getSweepsEntries() {
    const todayKey = getTodayKey();
    return parseInt(localStorage.getItem(`sweepsEntries_${todayKey}`) || '0');
}

function addSweepsEntry() {
    const todayKey = getTodayKey();
    const currentEntries = getSweepsEntries();
    localStorage.setItem(`sweepsEntries_${todayKey}`, String(currentEntries + 1));
    updateSweepsDisplay();
}

function updateSweepsDisplay() {
    const balance = parseInt(localStorage.getItem('totalStars') || '0');
    const entries = getSweepsEntries();
    const balanceElement = document.getElementById('sweeps-balance');
    const entryCountElement = document.getElementById('entry-count');
    
    if (balanceElement) {
        balanceElement.textContent = balance;
    }
    if (entryCountElement) {
        entryCountElement.textContent = entries;
    }
}

// Initialize sweepstakes page
function initSweepsPage() {
    updateSweepsDisplay();
    
    const enterButton = document.getElementById('enter-sweeps-btn');
    if (enterButton && !enterButton.dataset.listenerAdded) {
        enterButton.dataset.listenerAdded = 'true';
        enterButton.addEventListener('click', () => {
            const balance = parseInt(localStorage.getItem('totalStars') || '0');
            const entryCost = 10;
            
            if (balance >= entryCost) {
                // Deduct from total stars
                const todayKey = getTodayKey();
                const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
                localStorage.setItem('totalStars', String(currentTotalStars - entryCost));
                
                // Also deduct from daily stars
                const currentDailyStars = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
                localStorage.setItem(`dailyStars_${todayKey}`, String(Math.max(0, currentDailyStars - entryCost)));
                
                // Add entry
                addSweepsEntry();
                
                // Update all star displays
                if (window.updateStarDisplay) {
                    window.updateStarDisplay();
                }
               
                if (window.updateRivalStars) {
                    window.updateRivalStars();
                }
                
                // Show confirmation
                enterButton.textContent = 'Entry Added!';
                enterButton.style.background = 'linear-gradient(135deg, #7adc75, #4fb971)';
                setTimeout(() => {
                    enterButton.innerHTML = '<span class="button-star">★</span><span>Enter Sweepstakes</span>';
                    enterButton.style.background = 'linear-gradient(135deg, #FFB84D, #FF8C42)';
                }, 1500);
            } else {
                // Not enough stars
                enterButton.textContent = 'Not Enough Stars';
                enterButton.style.background = 'linear-gradient(135deg, #999, #777)';
                setTimeout(() => {
                    enterButton.innerHTML = '<span class="button-star">★</span><span>Enter Sweepstakes</span>';
                    enterButton.style.background = 'linear-gradient(135deg, #FFB84D, #FF8C42)';
                }, 1500);
            }
        });
    }
}

// Initialize sweepstakes on page load if active
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode')?.toLowerCase();
    
    // Check if sweeps page is active (and not boost mode)
    if (document.getElementById('sweeps-page')?.classList.contains('active') && mode !== 'b') {
        initSweepsPage();
    }
    
    // If mode=b, ensure boost page shows when sweeps tab is clicked
    // Also handle if sweeps tab is already active on page load
    if (mode === 'b') {
        const sweepsButton = document.querySelector('.tab-button[data-page="sweeps"]');
        const sweepsPage = document.getElementById('sweeps-page');
        const boostPage = document.getElementById('boost-page');
        
        if (sweepsButton && sweepsButton.classList.contains('active')) {
            if (sweepsPage) sweepsPage.classList.remove('active');
            if (boostPage) boostPage.classList.add('active');
        }
    }
});

// Reset all data function (called by Q key and reset button)
function resetAllData() {
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
                    key.includes('lostAndFound') || key.includes('multipleChoice') || key.includes('factOrFiction') ||
                    key.includes('match3') || key.includes('zoom') || key.includes('shift') || key.includes('quiz'))) {
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
    
    // Reset zoom game completion and data
    localStorage.removeItem(`zoomComplete_${todayKey}`);
    localStorage.removeItem(`zoomStars_${todayKey}`);
    localStorage.removeItem(`zoomMoves_${todayKey}`);
    
    // Reset shift game completion and data
    localStorage.removeItem(`shiftComplete_${todayKey}`);
    localStorage.removeItem(`shiftStars_${todayKey}`);
    localStorage.removeItem(`shiftFinalColor_${todayKey}`);
    
    // Reset quiz game completion and data
    localStorage.removeItem(`quizComplete_${todayKey}`);
    localStorage.removeItem(`quizStars_${todayKey}`);
    localStorage.removeItem(`quizSet_${todayKey}`);
    localStorage.removeItem(`quizQuestionIndex_${todayKey}`);
    localStorage.removeItem(`quizCorrectCount_${todayKey}`);
    localStorage.removeItem(`quizLastAnswer_${todayKey}`);
    
    // Reset daily stars to zero
    localStorage.setItem(`dailyStars_${todayKey}`, '0');
    
    // Reset total stars to zero
    localStorage.setItem('totalStars', '0');
    
    // Reset move stars to zero
    localStorage.removeItem(`moveStars_${todayKey}`);
    
    // Reset usable stars to zero
    localStorage.removeItem(`usableStars_${todayKey}`);
    
    // Reset games played
    localStorage.setItem('gamesPlayed', '0');
    localStorage.removeItem(`playedGames_${todayKey}`);
    
    // Reset prize tiles
    localStorage.removeItem('prizeTiles');
    
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
    if (typeof updateStarDisplay === 'function') {
        updateStarDisplay();
    }
    if (typeof updateWalletStars === 'function') {
        updateWalletStars();
    }
    if (typeof updateRivalStars === 'function') {
        updateRivalStars();
    }
    if (typeof updateMemoryDisplay === 'function') {
        updateMemoryDisplay();
    }
    if (typeof updateBlackjackDisplay === 'function') {
        updateBlackjackDisplay();
    }
    if (typeof loadGameScores === 'function') {
        loadGameScores();
    }
    if (typeof loadGameScores2 === 'function') {
        loadGameScores2();
    }
    if (typeof updateBoostHighScore === 'function') {
        updateBoostHighScore();
    }
    if (typeof updateMysteryWordStars === 'function') {
        updateMysteryWordStars();
    }
    if (typeof updateBeticleStars === 'function') {
        updateBeticleStars();
    }
    if (typeof updateCalendar === 'function') {
        updateCalendar();
    }
    
    // Update usable stars display
    if (window.updateMoveStarsDisplay) {
        window.updateMoveStarsDisplay();
    }
    
    // Update journey button state
    if (window.updateJourneyButtonState) {
        window.updateJourneyButtonState();
    }
    
    // Small delay to ensure display updates before reload
    setTimeout(() => {
        location.reload();
    }, 100);
}

// Helper function to get today's key (if not already defined)
function getTodayKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Add reset button click handler
document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.getElementById('reset-all-data-button');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
                resetAllData();
            }
        });
    }
    
    // Add boost spend button handler for match3 game
    const boostSpendButton = document.querySelector('.boost-spend-button');
    if (boostSpendButton) {
        boostSpendButton.addEventListener('click', () => {
            const match3Overlay = document.getElementById('match3Overlay');
            if (match3Overlay) {
                match3Overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Show close button
                const closeButton = document.querySelector('.game-overlay-close');
                if (closeButton) closeButton.classList.add('show');
                updateLogoVisibility();
                
                // Load match3 game in iframe - Market Match is now default
                const urlParams = new URLSearchParams(window.location.search);
                const scheme = urlParams.get('s');
                const iframe = document.getElementById('match3Iframe');
                if (iframe) {
                    // Use 'bigy' scheme (Market Match) as default, unless explicitly set to 'donut'
                    const gameScheme = scheme === 'donut' ? 'donut' : (scheme || 'bigy');
                    iframe.src = `games/match3/index.html?s=${gameScheme}`;
                    console.log(`Loading match3 game iframe: ${iframe.src}`);
                }
            }
        });
    }
    
    // Add practice game button handler for match3 game
    const practiceButton = document.querySelector('.boost-practice-button');
    if (practiceButton) {
        practiceButton.addEventListener('click', () => {
            const match3Overlay = document.getElementById('match3Overlay');
            if (match3Overlay) {
                match3Overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Show close button
                const closeButton = document.querySelector('.game-overlay-close');
                if (closeButton) closeButton.classList.add('show');
                updateLogoVisibility();
                
                // Load match3 game in iframe with practice parameter - Market Match is now default
                const urlParams = new URLSearchParams(window.location.search);
                const scheme = urlParams.get('s');
                const iframe = document.getElementById('match3Iframe');
                if (iframe) {
                    // Use 'bigy' scheme (Market Match) as default, unless explicitly set to 'donut'
                    const gameScheme = scheme === 'donut' ? 'donut' : (scheme || 'bigy');
                    iframe.src = `games/match3/index.html?s=${gameScheme}&practice=true`;
                    console.log(`Loading match3 practice game iframe: ${iframe.src}`);
                }
            }
        });
    }
});

// Expose reset function globally for Q key handler
window.resetAllData = resetAllData;


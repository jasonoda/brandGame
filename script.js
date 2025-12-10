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
    const weekBoxes = document.querySelectorAll('.week-box');
    
    
    weekBoxes.forEach((box, index) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + index);
        const dayKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
        const dayNumberElement = box.querySelector('.day-number');
        
        if (!dayNumberElement) return;
        
        // If this day is in the past or today, show stars earned (without star icon)
        if (index <= dayOfWeek) {
            const stars = parseInt(localStorage.getItem(`dailyStars_${dayKey}`) || '0');
            dayNumberElement.textContent = stars;
        } else {
            // Future days show nothing
            dayNumberElement.innerHTML = '&nbsp;';
        }
    });
}

// Make it globally accessible
window.updateCalendar = updateCalendar;

// Function to update header star counter
function updateHeaderStarCounter() {
    const todayKey = getTodayKey();
    const todayStars = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
    const starCountElement = document.querySelector('.star-count');
    if (starCountElement) {
        starCountElement.textContent = `x ${todayStars}`;
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

function updateLoyaltyStats() {
    try {
        const todayKey = getTodayKey();
        
        // Update daily stars
        const todayStars = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
        const dailyStarsElement = document.getElementById('loyalty-daily-stars');
        if (dailyStarsElement) {
            dailyStarsElement.textContent = todayStars;
        }
        
        // Update coins (get from localStorage - same key as journey uses)
        const coins = parseInt(localStorage.getItem('goldCoins') || '0');
        const coinCountElement = document.getElementById('loyalty-coin-count');
        if (coinCountElement) {
            coinCountElement.textContent = coins;
        }
        
        // Update extra seconds (daily stars + coins)
        const extraSeconds = todayStars + coins;
        const extraSecondsElement = document.getElementById('loyalty-extra-seconds');
        if (extraSecondsElement) {
            extraSecondsElement.textContent = extraSeconds;
        }
    } catch (error) {
        console.error('[Loyalty] ERROR:', error);
    }
}

// Set the current date in the header
function setCurrentDate() {
    // Check if p=2 parameter is set first
    const urlParams = new URLSearchParams(window.location.search);
    const logoPlacement = urlParams.get('p');
    
    // Always remove weekly background element entirely
    const weekHeaderBackground = document.querySelector('.week-header-background');
    if (weekHeaderBackground) {
        weekHeaderBackground.remove();
    }
    
    // Hide/remove standalone top-logo-box div when p=2
    if (logoPlacement === '2') {
        const topLogoBoxStandalone = document.querySelector('.top-logo-box:not(.top-logo-box-carousel)');
        if (topLogoBoxStandalone) {
            topLogoBoxStandalone.style.display = 'none';
        }
    }
    
    const dateElement = document.querySelector('.date');
    if (!dateElement) return;
    
    const dateSubtitleElement = document.querySelector('.date-subtitle');
    
    if (logoPlacement === '2') {
        dateElement.textContent = 'DAILY GAME SUITE';
        
        // Set date in subtitle
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
    } else {
        const today = new Date();
        
        const months = [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
        ];
        
        const month = months[today.getMonth()];
        const day = today.getDate();
        const year = today.getFullYear();
        
        // dateElement.textContent = `${month} ${day}, ${year}`;
        
        // Hide subtitle when not p=2
        if (dateSubtitleElement) {
            dateSubtitleElement.textContent = '';
        }
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
    
    // Load gold case score and stars
    const goldCaseScore = parseInt(localStorage.getItem(`goldCaseScore_${todayKey}`) || '0');
    const goldCaseStars = parseInt(localStorage.getItem(`goldCaseStars_${todayKey}`) || '0');
    const goldCaseComplete = localStorage.getItem(`goldCaseComplete_${todayKey}`) === 'true';
    
    const goldCaseLockText = document.getElementById('goldCaseLockText');
    const goldCaseScoreText = document.getElementById('goldCaseScoreText');
    const goldCaseScoreElement = document.getElementById('goldCaseScore');
    const goldCaseStarsElement = document.getElementById('goldCaseStars');
    
    if (goldCaseComplete && goldCaseLockText && goldCaseScoreText) {
        // Hide lock text and show score/stars
        goldCaseLockText.style.display = 'none';
        goldCaseScoreText.style.display = 'flex';
        
        // Update score
        if (goldCaseScoreElement) {
            goldCaseScoreElement.textContent = goldCaseScore.toLocaleString();
        }
        
        // Update stars
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
        // Show lock text and hide score/stars
        if (goldCaseLockText) {
            goldCaseLockText.style.display = 'flex';
        }
        if (goldCaseScoreText) {
            goldCaseScoreText.style.display = 'none';
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

// Hide weekly background immediately - run multiple times to ensure it's hidden
(function() {
    function hideWeekHeaderBackground() {
        const weekHeaderBackground = document.querySelector('.week-header-background');
        if (weekHeaderBackground) {
            weekHeaderBackground.remove();
        }
        // Hide/remove standalone top-logo-box div when p=2
        const urlParams = new URLSearchParams(window.location.search);
        const logoPlacement = urlParams.get('p');
        if (logoPlacement === '2') {
            const topLogoBoxStandalone = document.querySelector('.top-logo-box:not(.top-logo-box-carousel)');
            if (topLogoBoxStandalone) {
                topLogoBoxStandalone.style.display = 'none';
            }
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
    updateCalendar();
    loadGameScores2();
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
    
    // Update help button visibility on load
    updateLogoVisibility();
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
        
        // Check for mode=B parameter (case-insensitive)
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode')?.toLowerCase();
        
        // If mode=b and clicking sweeps tab, show loyalty page instead
        if (targetPage === 'sweeps' && mode === 'b') {
            const loyaltyPage = document.getElementById('loyalty-page');
            const sweepsPage = document.getElementById('sweeps-page');
            if (loyaltyPage) {
                loyaltyPage.classList.add('active');
            }
            if (sweepsPage) {
                sweepsPage.classList.remove('active');
            }
        } else {
            const targetPageElement = document.getElementById(`${targetPage}-page`);
            if (targetPageElement) {
                targetPageElement.classList.add('active');
            }
            // Make sure loyalty page is hidden if not in mode=b
            if (targetPage === 'sweeps' && mode !== 'b') {
                const loyaltyPage = document.getElementById('loyalty-page');
                if (loyaltyPage) {
                    loyaltyPage.classList.remove('active');
                }
            }
        }
        
        // Update move stars display when switching to journey tab
        if (targetPage === 'journey') {
            if (window.updateMoveStarsDisplay) {
                window.updateMoveStarsDisplay();
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
        
        // Hide top-logo-box when switching to games tab if p=2 is set
        if (targetPage === 'games') {
            const urlParams = new URLSearchParams(window.location.search);
            const logoPlacement = urlParams.get('p');
            if (logoPlacement === '2') {
                const topLogoBoxStandalone = document.querySelector('.top-logo-box:not(.top-logo-box-carousel)');
                if (topLogoBoxStandalone) {
                    topLogoBoxStandalone.style.display = 'none';
                }
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
        
        // Update loyalty page stats when loyalty page is shown
        if (targetPage === 'sweeps' && mode === 'b') {
            updateLoyaltyStats();
            // Update loyalty page for bigy style if applicable
            updateLoyaltyPageForBigy();
        }
        
        // Initialize sweepstakes page when shown (only if not loyalty mode)
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
        const schemeBarGrad = 'linear-gradient(to bottom, #e84066, #c82a48)';
        const schemeCalendarGrad = 'linear-gradient(to bottom, #e84066, #c82a48)';
        const schemeBigText = '#363636';
        const logoPath = 'src/img/bigy/bigy.png';  
        
        changeColorScheme(schemeBack, schemeBarGrad, schemeCalendarGrad, schemeBigText, logoPath);
        
        // Update loyalty page for bigy style
        updateLoyaltyPageForBigy();
        
        // Hide regular top-logo-box when bigy is active
        const topLogoBox = document.querySelector('.top-logo-box:not(.top-logo-box-carousel)');
        if (topLogoBox) {
            topLogoBox.style.display = 'none';
        }
        
        // Initialize carousel for bigy
        initBigyCarousel();
    } else {
        // Hide carousel if not bigy
        const carouselContainer = document.querySelector('.top-logo-carousel-container');
        if (carouselContainer) {
            carouselContainer.classList.remove('active');
        }
        // Show regular top-logo-box if not bigy
        const topLogoBox = document.querySelector('.top-logo-box:not(.top-logo-box-carousel)');
        if (topLogoBox) {
            topLogoBox.style.display = 'block';
        }
    }
    
    // Update date display based on p parameter
    setCurrentDate();
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
    
    // Set logo in first slide (index 0) and duplicate slide (index 3)
    if (slides.length > 0) {
        const firstSlide = slides[0];
        const firstSlideLogo = firstSlide.querySelector('.top-logo-box-carousel');
        if (firstSlideLogo) {
            firstSlideLogo.style.backgroundImage = "url('src/img/bigy/bigy.png')";
            firstSlideLogo.style.backgroundSize = 'contain';
            firstSlideLogo.style.backgroundPosition = 'center';
            firstSlideLogo.style.backgroundRepeat = 'no-repeat';
            firstSlideLogo.style.border = 'none';
            firstSlideLogo.style.backgroundColor = 'transparent';
        }
        
        // Set logo in duplicate slide (index 3, which is slide 4)
        if (slides.length > 3) {
            const duplicateSlide = slides[3];
            const duplicateSlideLogo = duplicateSlide.querySelector('.top-logo-box-carousel');
            if (duplicateSlideLogo) {
                duplicateSlideLogo.style.backgroundImage = "url('src/img/bigy/bigy.png')";
                duplicateSlideLogo.style.backgroundSize = 'contain';
                duplicateSlideLogo.style.backgroundPosition = 'center';
                duplicateSlideLogo.style.backgroundRepeat = 'no-repeat';
                duplicateSlideLogo.style.border = 'none';
                duplicateSlideLogo.style.backgroundColor = 'transparent';
            }
        }
    }
    const carousel = carouselContainer.querySelector('.top-logo-carousel');
    const leftArrow = carouselContainer.querySelector('.carousel-arrow-left');
    const rightArrow = carouselContainer.querySelector('.carousel-arrow-right');
    let currentSlide = 0;
    
    if (!carousel || slides.length === 0) {
        return;
    }
    
    
    // Initialize carousel wrapper for sliding
    carousel.style.display = 'flex';
    carousel.style.transition = 'transform 0.5s ease';
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
            carousel.style.transition = 'transform 0.5s ease';
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
            }, 500); // Match the transition duration
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
            carouselInterval = setInterval(nextSlide, 6000);
        });
    }
    
    if (rightArrow) {
        rightArrow.addEventListener('click', () => {
            nextSlideManual(); // Manual navigation - no wrap around
            // Reset auto-cycle timer
            clearInterval(carouselInterval);
            carouselInterval = setInterval(nextSlide, 6000);
        });
    }
    
    // Auto-cycle every 3 seconds
    clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 3000);
}

// Update loyalty page for bigy style
function updateLoyaltyPageForBigy() {
    const urlParams = new URLSearchParams(window.location.search);
    const scheme = urlParams.get('s');
    
    if (scheme !== 'bigy') {
        // Reset to default if not bigy
        const gameTitle = document.querySelector('#loyalty-page .game-title');
        if (gameTitle) {
            gameTitle.textContent = 'DONUT MATCHER';
        }
        const playColorBox = document.querySelector('#loyalty-page .play-color-box');
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
    
    // Change game title to Market Match
    const gameTitle = document.querySelector('#loyalty-page .game-title');
    if (gameTitle) {
        gameTitle.textContent = 'MARKET MATCH';
    }
    
    // Update play-color-box with image and red gradient
    const playColorBox = document.querySelector('#loyalty-page .play-color-box');
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
    const lightPages = document.querySelectorAll('#rival-page, #wallet-page');
    lightPages.forEach(page => {
        if (backgroundColor === '#000000') {
            page.style.backgroundColor = '#1a1a1a';
        } else {
            page.style.backgroundColor = '#f8f8f8';
        }
    });
    
    // Keep rival and profile containers light (unless dark mode)
    const lightContainers = document.querySelectorAll('.rival-container, .profile-container, .sweeps-container');
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
    
    // Change header bar
    const headerBar = document.querySelector('.header-bar');
    if (headerBar) {
        headerBar.style.background = barColor;
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
    
    // Change scramble letter boxes to match top bar
    const letterBoxes = document.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.style.background = barColor;
    });
    
    // Hide borders on white boxes
    const whiteBoxes = document.querySelectorAll('.play-box, .arcade-box, .bonus-box, .coupon-item, .on-this-day-container, .highlow-container, .profile-container');
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
        
        // Change all small text to light grey (except date and game titles)
        const smallTextSelectors = '.play-text, .subsection-title, .coupon-description, .coupon-cost, .week-day, .week-date, .bonus-text, .arcade-text, .on-this-day-text, .rival-name, .profile-name, .rival-stars, .profile-total-stars';
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
    const logoPlacement = urlParams.get('p');
    
    // Show and set logo
    const logo = document.querySelector('.logo-img');
    const topLogoBox = document.querySelector('.top-logo-box');
    
    if (logoPath) {
        hasLogo = true;
        
        if (logoPlacement === '2') {
            // Place logo in top-logo-box instead of header
            if (logo) {
                logo.style.display = 'none';
            }
            // Find top-logo-box (could be in carousel or standalone)
            const topLogoBoxInCarousel = document.querySelector('.carousel-slide .top-logo-box-carousel');
            const topLogoBoxStandalone = document.querySelector('.top-logo-box:not(.top-logo-box-carousel)');
            const topLogoBox = topLogoBoxInCarousel || topLogoBoxStandalone;
            
            if (topLogoBox) {
                topLogoBox.style.backgroundImage = `url('${logoPath}')`;
                topLogoBox.style.backgroundSize = 'contain';
                topLogoBox.style.backgroundPosition = 'center';
                topLogoBox.style.backgroundRepeat = 'no-repeat';
                topLogoBox.style.border = 'none';
                topLogoBox.style.backgroundColor = 'transparent';
                // Only show if close button is not showing
                const closeButton = document.querySelector('.game-overlay-close');
                if (closeButton && !closeButton.classList.contains('show')) {
                    topLogoBox.style.display = 'block';
                } else {
                    topLogoBox.style.display = 'none';
                }
            }
        } else {
            // Default: place logo in header
            if (topLogoBox) {
                topLogoBox.style.display = 'block';
                topLogoBox.style.border = '2px solid #000';
            }
            if (logo) {
                logo.src = logoPath;
                // Only show logo if close button is not showing
                const closeButton = document.querySelector('.game-overlay-close');
                if (closeButton && !closeButton.classList.contains('show')) {
                    logo.style.display = 'block';
                } else {
                    logo.style.display = 'none';
                }
            }
        }
    } else {
        logo.style.display = 'none';
        hasLogo = false;
        if (topLogoBox && logoPlacement !== '2') {
            topLogoBox.style.border = '2px solid #000';
        }
    }
    
    // Watch for dynamically added letter boxes
    observeLetterBoxes();
}

// Helper function to update logo visibility based on close button state
function updateLogoVisibility() {
    const logo = document.querySelector('.logo-img');
    const topLogoBox = document.querySelector('.top-logo-box');
    const closeButton = document.querySelector('.game-overlay-close');
    const helpButton = document.querySelector('.help-button');
    const urlParams = new URLSearchParams(window.location.search);
    const logoPlacement = urlParams.get('p');
    
    // Hide/show help button based on close button state
    if (helpButton) {
        if (closeButton && closeButton.classList.contains('show')) {
            helpButton.classList.add('hidden');
        } else {
            helpButton.classList.remove('hidden');
        }
    }
    
    if (hasLogo) {
        if (logoPlacement === '2') {
            // Logo is in top-logo-box
            if (topLogoBox) {
                if (closeButton && closeButton.classList.contains('show')) {
                    topLogoBox.style.display = 'none';
                } else {
                    topLogoBox.style.display = 'block';
                }
            }
        } else {
            // Logo is in header
            if (logo) {
                if (closeButton && closeButton.classList.contains('show')) {
                    logo.style.display = 'none';
                } else {
                    logo.style.display = 'block';
                }
            }
        }
    }
}

// Function to observe and style dynamically added letter boxes
function observeLetterBoxes() {
    const unscrambleContainer = document.querySelector('.unscramble-boxes');
    if (!unscrambleContainer || !currentColorScheme) return;
    
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

// Keyboard shortcut to test color scheme
document.addEventListener('keydown', (e) => {
    if (e.key === '1') {
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
                iframe.src = scheme ? `memory/index.html?s=${scheme}` : 'memory/index.html';
                console.log(`Reloading memory game iframe: ${iframe.src}`);
            }
        }
    });
}

// memoryClose removed - now using single close button

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
        
        // Determine which overlay is active and only reload that iframe
        let activeOverlay = null;
        let iframeToUnload = null;
        if (memoryOverlay && memoryOverlay.classList.contains('active')) {
            activeOverlay = 'memory';
            memoryOverlay.classList.remove('active');
            iframeToUnload = document.getElementById('memoryIframe');
        } else if (mysteryWordOverlay && mysteryWordOverlay.classList.contains('active')) {
            activeOverlay = 'mysteryWord';
            mysteryWordOverlay.classList.remove('active');
            iframeToUnload = document.getElementById('mysteryWordIframe');
        } else if (beticleOverlay && beticleOverlay.classList.contains('active')) {
            activeOverlay = 'beticle';
            beticleOverlay.classList.remove('active');
            iframeToUnload = document.getElementById('beticleIframe');
        } else if (blackjackOverlay && blackjackOverlay.classList.contains('active')) {
            activeOverlay = 'blackjack';
            blackjackOverlay.classList.remove('active');
            iframeToUnload = document.getElementById('blackjackIframe');
        } else if (lostAndFoundOverlay && lostAndFoundOverlay.classList.contains('active')) {
            activeOverlay = 'lostAndFound';
            lostAndFoundOverlay.classList.remove('active');
            iframeToUnload = document.getElementById('lostAndFoundIframe');
        } else if (goldCaseOverlay && goldCaseOverlay.classList.contains('active')) {
            activeOverlay = 'goldCase';
            goldCaseOverlay.classList.remove('active');
            iframeToUnload = document.getElementById('goldCaseIframe');
        }
        
        // Unload the iframe by setting src to blank
        if (iframeToUnload) {
            console.log(`Unloading ${activeOverlay} game iframe by setting src to 'about:blank'`);
            iframeToUnload.src = 'about:blank';
        }
        
        document.body.style.overflow = '';
        
        // Don't reload iframes when closing - just close the overlay
        
        // Reload game scores to update stars
        // if (typeof loadGameScores === 'function') {
            loadGameScores2();
        // }
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
                mysteryIframe.src = scheme ? `mysteryWord/index.html?s=${scheme}` : 'mysteryWord/index.html';
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
                beticleIframe.src = scheme ? `beticle/index.html?s=${scheme}` : 'beticle/index.html';
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
                iframe.src = scheme ? `blackjack/index.html?s=${scheme}` : 'blackjack/index.html';
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
                iframe.src = scheme ? `lostAndFound/index.html?s=${scheme}` : 'lostAndFound/index.html';
                // Set iOS-specific attributes for touch handling
                iframe.setAttribute('allow', 'touch');
                iframe.style.touchAction = 'none';
                iframe.style.webkitOverflowScrolling = 'touch';
                console.log(`Reloading lostAndFound game iframe: ${iframe.src}`);
            }
        }
    });
}

// Gold Case game overlay (Daily Bonus)
const goldCaseBox = document.getElementById('goldCaseBox');
const goldCaseOverlay = document.getElementById('goldCaseOverlay');

if (goldCaseBox) {
    goldCaseBox.addEventListener('click', () => {
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
                iframe.src = scheme ? `goldCase/index.html?s=${scheme}` : 'goldCase/index.html';
                console.log(`Reloading goldCase game iframe: ${iframe.src}`);
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
    
    // Check if sweeps page is active (and not loyalty mode)
    if (document.getElementById('sweeps-page')?.classList.contains('active') && mode !== 'b') {
        initSweepsPage();
    }
    
    // If mode=b, ensure loyalty page shows when sweeps tab is clicked
    // Also handle if sweeps tab is already active on page load
    if (mode === 'b') {
        const sweepsButton = document.querySelector('.tab-button[data-page="sweeps"]');
        const sweepsPage = document.getElementById('sweeps-page');
        const loyaltyPage = document.getElementById('loyalty-page');
        
        if (sweepsButton && sweepsButton.classList.contains('active')) {
            if (sweepsPage) sweepsPage.classList.remove('active');
            if (loyaltyPage) loyaltyPage.classList.add('active');
        }
    }
});


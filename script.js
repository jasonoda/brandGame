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
        
        // If this day is in the past or today, show stars earned
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

// Function to update wallet star displays
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
        const todayElement = document.querySelector('.profile-today-stars .star-number');
        if (todayElement) {
            todayElement.textContent = todayStars;
        }
        
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
        
        const weekElements = document.querySelectorAll('.profile-stat-small .stat-number');
        if (weekElements[0]) {
            weekElements[0].textContent = weekStars;
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
        if (weekElements[1]) {
            weekElements[1].textContent = everStars;
        }
    } catch (error) {
        console.error('[Wallet] ERROR:', error);
    }
}

// Set the current date in the header
function setCurrentDate() {
    const dateElement = document.querySelector('.date');
    const today = new Date();
    
    const months = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    
    const month = months[today.getMonth()];
    const day = today.getDate();
    const year = today.getFullYear();
    
    // dateElement.textContent = `${month} ${day}, ${year}`;
}

// Load game stars and display them on main page
function loadGameScores2() {
    console.log("loadGameScores called1");
    const todayKey = getTodayKey();
    
    console.log("loadGameScores called");
    console.log('todayKey:', todayKey);
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    // Load beticle stars
    const beticleStarsKey = `beticleStars_${todayKey}`;
    const beticleStarsValue = localStorage.getItem(beticleStarsKey);
    console.log('beticleStars key:', beticleStarsKey);
    console.log('beticleStars raw value:', beticleStarsValue);
    const beticleStars = parseInt(beticleStarsValue || '0');
    console.log('Loading beticle stars:', beticleStars, 'for key:', todayKey);
    const beticleStarsElement = document.getElementById('beticleStars');
    if (beticleStarsElement) {
        beticleStarsElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < beticleStars ? '#FF8C42' : '#ddd';
            beticleStarsElement.appendChild(star);
        }
        console.log('Beticle stars updated on main page');
    } else {
        console.log('beticleStars element not found');
    }
    
    // Load mystery word stars
    const mysteryWordStars = parseInt(localStorage.getItem(`mysteryWordStars_${todayKey}`) || '0');
    const mysteryWordStarsElement = document.getElementById('mysteryWordStars');
    if (mysteryWordStarsElement) {
        mysteryWordStarsElement.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.style.color = i < mysteryWordStars ? '#FF8C42' : '#ddd';
            mysteryWordStarsElement.appendChild(star);
        }
    }
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setCurrentDate();
    updateHeaderStarCounter();
    updateWalletStars2();
    updateCalendar();
    loadGameScores2();
    console.log("loadGameScores called");
    
    // Initialize coin displays if function exists
    if (window.updateCoinDisplays) {
        window.updateCoinDisplays();
    }
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
        const targetPageElement = document.getElementById(`${targetPage}-page`);
        if (targetPageElement) {
            targetPageElement.classList.add('active');
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
        
        // Initialize sweepstakes page when shown
        if (targetPage === 'sweeps') {
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
    }
}

// Store current color scheme
let currentColorScheme = null;

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
    const sectionTitles = document.querySelectorAll('.section-title, .week-subtitle');
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
    
    // Show and set logo
    const logo = document.querySelector('.logo-img');
    if (logo) {
        if (logoPath) {
            logo.src = logoPath;
            logo.style.display = 'block';
        } else {
            logo.style.display = 'none';
        }
    }
    
    // Watch for dynamically added letter boxes
    observeLetterBoxes();
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
            
            // Pass color scheme to iframe
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('memoryIframe');
            if (iframe && scheme) {
                iframe.src = `memory/index.html?s=${scheme}`;
            }
        }
    });
}

// memoryClose removed - now using single close button

// Main close button handler
const closeButton = document.querySelector('.game-overlay-close');
if (closeButton) {
    closeButton.addEventListener('click', () => {
        console.log('HIDING game (close button)');
        
        // Hide close button
        closeButton.classList.remove('show');
        
        // Close all overlays
        const memoryOverlay = document.getElementById('memoryOverlay');
        const mysteryWordOverlay = document.getElementById('mysteryWordOverlay');
        const beticleOverlay = document.getElementById('beticleOverlay');
        const blackjackOverlay = document.getElementById('blackjackOverlay');
        const lostAndFoundOverlay = document.getElementById('lostAndFoundOverlay');
        const goldCaseOverlay = document.getElementById('goldCaseOverlay');
        
        if (memoryOverlay) memoryOverlay.classList.remove('active');
        if (mysteryWordOverlay) mysteryWordOverlay.classList.remove('active');
        if (beticleOverlay) beticleOverlay.classList.remove('active');
        if (blackjackOverlay) blackjackOverlay.classList.remove('active');
        if (lostAndFoundOverlay) lostAndFoundOverlay.classList.remove('active');
        if (goldCaseOverlay) goldCaseOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reload iframes for arcade games
        const memoryIframe = document.getElementById('memoryIframe');
        const blackjackIframe = document.getElementById('blackjackIframe');
        const lostAndFoundIframe = document.getElementById('lostAndFoundIframe');
        const goldCaseIframe = document.getElementById('goldCaseIframe');
        
        const urlParams = new URLSearchParams(window.location.search);
        const scheme = urlParams.get('s');
        
        if (memoryIframe) memoryIframe.src = scheme ? `memory/index.html?s=${scheme}` : 'memory/index.html';
        if (blackjackIframe) blackjackIframe.src = scheme ? `blackjack/index.html?s=${scheme}` : 'blackjack/index.html';
        if (lostAndFoundIframe) lostAndFoundIframe.src = scheme ? `lostAndFound/index.html?s=${scheme}` : 'lostAndFound/index.html';
        if (goldCaseIframe) goldCaseIframe.src = scheme ? `goldCase/index.html?s=${scheme}` : 'goldCase/index.html';
        
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
            
            const iframe = document.getElementById('memoryIframe');
            if (iframe) {
                const urlParams = new URLSearchParams(window.location.search);
                const scheme = urlParams.get('s');
                iframe.src = scheme ? `memory/index.html?s=${scheme}` : 'memory/index.html';
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
            
            // Set iframe src with scheme parameter on first open
            const mysteryIframe = document.getElementById('mysteryWordIframe');
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            if (mysteryIframe && !mysteryIframe.dataset.initialized) {
                mysteryIframe.src = scheme ? `mysteryWord/index.html?s=${scheme}` : 'mysteryWord/index.html';
                mysteryIframe.dataset.initialized = 'true';
            }
            
            // Tell iframe it's now visible - call positioning win message
            setTimeout(() => {
                if (mysteryIframe && mysteryIframe.contentWindow) {
                    console.log('Sending mysteryWordShown message to iframe');
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
            
            // Set iframe src with scheme parameter on first open
            const beticleIframe = document.getElementById('beticleIframe');
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            if (beticleIframe && !beticleIframe.dataset.initialized) {
                beticleIframe.src = scheme ? `beticle/index.html?s=${scheme}` : 'beticle/index.html';
                beticleIframe.dataset.initialized = 'true';
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
            
            // Pass color scheme to iframe
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('blackjackIframe');
            if (iframe && scheme) {
                iframe.src = `blackjack/index.html?s=${scheme}`;
            } else if (iframe) {
                iframe.src = 'blackjack/index.html';
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
            
            const iframe = document.getElementById('blackjackIframe');
            if (iframe) {
                const urlParams = new URLSearchParams(window.location.search);
                const scheme = urlParams.get('s');
                iframe.src = scheme ? `blackjack/index.html?s=${scheme}` : 'blackjack/index.html';
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
            
            // Pass color scheme to iframe
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('lostAndFoundIframe');
            if (iframe && scheme) {
                iframe.src = `lostAndFound/index.html?s=${scheme}`;
            } else if (iframe) {
                iframe.src = 'lostAndFound/index.html';
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

            // Pass color scheme to iframe
            const urlParams = new URLSearchParams(window.location.search);
            const scheme = urlParams.get('s');
            const iframe = document.getElementById('goldCaseIframe');
            if (iframe && scheme) {
                iframe.src = `goldCase/index.html?s=${scheme}`;
            } else if (iframe) {
                iframe.src = 'goldCase/index.html';
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
            
            const iframe = document.getElementById('goldCaseIframe');
            if (iframe) {
                const urlParams = new URLSearchParams(window.location.search);
                const scheme = urlParams.get('s');
                iframe.src = scheme ? `goldCase/index.html?s=${scheme}` : 'goldCase/index.html';
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
            
            const iframe = document.getElementById('lostAndFoundIframe');
            if (iframe) {
                const urlParams = new URLSearchParams(window.location.search);
                const scheme = urlParams.get('s');
                iframe.src = scheme ? `lostAndFound/index.html?s=${scheme}` : 'lostAndFound/index.html';
            }
            // Reload game scores to update stars
            // if (typeof loadGameScores === 'function') {
                loadGameScores2();
            // }
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
    if (document.getElementById('sweeps-page')?.classList.contains('active')) {
        initSweepsPage();
    }
});


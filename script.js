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

// Ordinal suffix for dates: 1st, 2nd, 3rd, 4th, etc.
function getOrdinalDate(day) {
    const n = Math.floor(day);
    const v = n % 100;
    if (v >= 11 && v <= 13) return n + 'th';
    const u = v % 10;
    if (u === 1) return n + 'st';
    if (u === 2) return n + 'nd';
    if (u === 3) return n + 'rd';
    return n + 'th';
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 2 days before Thanksgiving (4th Thursday of November)
function getThanksgivingTwoDaysBefore(year) {
    const nov1 = new Date(year, 10, 1);
    const firstThu = (4 - nov1.getDay() + 7) % 7;
    const thanksgiving = new Date(year, 10, 1 + firstThu + 21);
    const twoBefore = new Date(thanksgiving.getTime());
    twoBefore.setDate(twoBefore.getDate() - 2);
    return twoBefore;
}

function getBannerDateText() {
    if (typeof getCurrentTheme !== 'function') return "TODAY'S GAMES";
    const theme = getCurrentTheme();
    const name = theme.name;
    if (name === 'Thanksgiving') {
        return 'COMMUNITY';
    }
    if (name === '4th of July') return 'Jul 2nd GAMES';
    const today = new Date();
    return MONTH_ABBREV[today.getMonth()] + ' ' + getOrdinalDate(today.getDate()) + ' GAMES';
}

function getSubtitleText() {
    if (typeof getCurrentTheme !== 'function') return 'THANKSGIVING';
    const theme = getCurrentTheme();
    const name = theme.name;
    return theme.name.toUpperCase();
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
    const starCountElements = document.querySelectorAll('.star-counter .star-count');
    starCountElements.forEach(function(el) { el.textContent = 'x 0'; });
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

// Game configuration mapping
const gameConfig = {
    'memory': { path: 'games/memory/index.html', specialAttrs: {} },
    'mysteryWord': { path: 'games/mysteryWord/index.html', specialAttrs: {} },
    'beticle': { path: 'games/beticle/index.html', specialAttrs: {} },
    'blackjack': { path: 'games/blackjack/index.html', specialAttrs: {} },
    'lostAndFound': { path: 'games/lostAndFound/index.html', specialAttrs: { allow: 'touch', sandbox: 'allow-scripts allow-same-origin allow-pointer-lock', style: 'touch-action: none; -webkit-overflow-scrolling: touch; width: 100%; height: 100%; border: none;' } },
    'goldCase': { path: 'games/goldCase/index.html', specialAttrs: {} },
    'zoom': { path: 'games/zoom/index.html', specialAttrs: {} },
    'shift': { path: 'games/shift/index.html', specialAttrs: {} },
    'phrases': { path: 'games/phrases/index.html', specialAttrs: {} },
    'cross': { path: 'games/cross/index.html', specialAttrs: {} },
    'suspect': { path: 'games/suspect/index.html', specialAttrs: {} },
    'defuser': { path: 'games/defuser/index.html', specialAttrs: { style: 'width: 100%; height: 100%; border: none;' } },
    'tally': { path: 'games/tally/index.html', specialAttrs: {} },
    'match3': { path: 'games/match3/index.html', specialAttrs: {} },
    'bonusSpin': { path: 'games/bonusSpin/index.html', specialAttrs: {} }
};

// Reward overlay thumbnail config (gradient, title, img src)
const rewardThumbConfig = {
    phrases: { gradient: 'linear-gradient(to bottom, #2DD7A4, #1DB88A)', title: 'PHRASES', img: 'src/img/phrases.svg' },
    cross: { gradient: 'linear-gradient(to bottom, #00d4ff, #06b6e2)', title: 'CROSS', img: 'src/img/cross.svg' },
    goldCase: { gradient: 'linear-gradient(to bottom, #FFD700, #FFA500)', title: 'GOLD CASE', img: 'src/img/goldCase.svg' },
    suspect: { gradient: 'linear-gradient(to bottom, #FF6B6B, #D63645)', title: 'SUSPECT', img: 'src/img/suspect.svg' },
    defuser: { gradient: 'linear-gradient(to bottom, #808080, #404040)', title: 'DEFUSER', img: 'src/img/defuser.svg' },
    tally: { gradient: '#FF69B4', title: 'TALLY', img: 'src/img/tally.svg' },
    zoom: { gradient: 'linear-gradient(to bottom, #FF8C42, #FF6B35)', title: 'ZOOM', img: 'src/img/tiles.svg' },
    shift: { gradient: 'linear-gradient(to bottom, #6B8FE8, #596fc2)', title: 'SHIFT', img: 'src/img/shift.svg' },
    beticle: { gradient: 'linear-gradient(to bottom, #AB69E0, #7B37B0)', title: 'BETICLE', img: 'src/img/betical.svg' },
    mysteryWord: { gradient: 'linear-gradient(to bottom, #00CED1, #00b4b4)', title: 'MYSTERY WORD', img: 'src/img/mysteryWord.svg' },
    blackjack: { gradient: 'linear-gradient(to bottom, #52d077, #2aa04a)', title: 'SPEED 21', img: 'src/img/speed21.svg' },
    lostAndFound: { gradient: 'linear-gradient(to bottom, #F86DAA, #C6387A)', title: 'LOST & FOUND', img: 'src/img/lostAndFount.svg' },
    memory: { gradient: 'linear-gradient(to bottom, #00d4ff, #0099cc)', title: 'MEMORY', img: 'src/img/memory.svg' },
    match3: { gradient: 'linear-gradient(to bottom, #e84066, #c82a48)', title: 'MARKET MATCH', img: 'src/img/bigy/sweepsGame.png' }
};

// Track current active game
let currentGameId = null;

// Preload main sounds with Howler (loaded at start)
const appSounds = {};
(function loadAppSounds() {
    if (typeof Howl === 'undefined') return;
    ['reward1'].forEach(function(name) {
        appSounds[name] = new Howl({ src: ['sounds/' + name + '.mp3'], preload: true });
    });
})();

// Resume Web Audio context on first user interaction (improves mobile quality, required for iOS)
(function initMobileAudio() {
    if (typeof Howler === 'undefined') return;
    var didResume = false;
    function resumeCtx() {
        if (didResume) return;
        didResume = true;
        if (Howler.ctx && typeof Howler.ctx.resume === 'function') {
            Howler.ctx.resume().then(function() { /* ready */ }).catch(function() {});
        }
        document.removeEventListener('touchend', resumeCtx);
        document.removeEventListener('click', resumeCtx);
    }
    document.addEventListener('touchend', resumeCtx, { passive: true, once: true });
    document.addEventListener('click', resumeCtx, { once: true });
})();

function startRewardCelebration(stars) {
    if (navigator.vibrate) navigator.vibrate(30);
    const el = document.getElementById('rewardOverlay');
    if (!el) return;
    const box = el.querySelector('.reward-overlay-box');
    el.style.display = 'flex';
    el.classList.add('pointer-events-on');
    if (box) gsap.set(box, { opacity: 0, visibility: 'hidden' });
    const backdrop = el.querySelector('.reward-overlay-backdrop');
    if (backdrop) gsap.set(backdrop, { opacity: 0 });
    requestAnimationFrame(() => startRewardRain(stars));
}

function startRewardRain(stars) {
    if (appSounds.reward1) appSounds.reward1.play();
    const rain = document.getElementById('rewardOverlayRain');
    if (!rain || typeof gsap === 'undefined') return;
    rain.innerHTML = '';
    const firstEmoji = (typeof getCurrentTheme === 'function' && getCurrentTheme().suspectEmojis)
        ? (getCurrentTheme().suspectEmojis[0] || '★')
        : '★';
    const itemCount = Math.min(40, 6 + stars * 6);
    const rect = rain.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    for (let i = 0; i < itemCount; i++) {
        const isEmoji = Math.random() < 0.5;
        const span = document.createElement('span');
        span.className = 'rain-item' + (isEmoji ? ' rain-item-emoji' : '');
        span.textContent = isEmoji ? firstEmoji : '★';
        span.style.left = rand(-20, w + 20) + 'px';
        span.style.top = '-50px';
        rain.appendChild(span);

        const duration = rand(1, 1.8);
        const rotation = rand(-360, 360);
        const driftX = rand(-120, 120);
        const delay = rand(0, 0.8);

        gsap.fromTo(span,
            {
                y: 0,
                x: 0,
                rotation: 0,
                opacity: 0.9
            },
            {
                y: h + 80,
                x: driftX,
                rotation: rotation,
                duration: duration,
                delay: delay,
                ease: 'linear',
                onComplete: () => span.remove()
            }
        );
    }
}

function showRewardOverlay(gameId, stars, notes, diceLabel) {
    const el = document.getElementById('rewardOverlay');
    if (!el) return;
    el.style.display = 'flex';
    el.classList.add('pointer-events-on');
    const box = el.querySelector('.reward-overlay-box');
    const headerEl = el.querySelector('.reward-overlay-header');
    const starsEl = el.querySelector('.reward-overlay-stars');
    const notesEl = el.querySelector('.reward-overlay-notes');
    const diceLabelEl = el.querySelector('.reward-overlay-dice-label');
    const config = rewardThumbConfig[gameId] || { gradient: 'linear-gradient(to bottom, #888, #555)', title: gameId || 'GAME', img: '' };
    stars = typeof stars === 'number' ? stars : 1;
    notes = Array.isArray(notes) ? notes : (notes ? [notes] : []);
    diceLabel = diceLabel != null ? String(diceLabel) : '+1';

    headerEl.innerHTML = '';
    const headerInner = document.createElement('div');
    headerInner.className = 'reward-header-gradient';
    headerInner.style.background = config.gradient;
    headerInner.innerHTML = `
        <button type="button" class="reward-overlay-close" aria-label="Close">✕</button>
        <div class="reward-header-image"><img src="${config.img}" alt=""></div>
        <div class="reward-header-title">${config.title}</div>
    `;
    headerEl.appendChild(headerInner);
    const closeBtn = headerInner.querySelector('.reward-overlay-close');
    if (closeBtn) {
        closeBtn.onclick = (e) => { e.stopPropagation(); hideRewardOverlay(); };
    }

    starsEl.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.className = 'reward-star' + (i >= stars ? ' grey' : '');
        star.textContent = '★';
        starsEl.appendChild(star);
    }

    notesEl.innerHTML = '';
    notesEl.classList.toggle('reward-overlay-notes--empty', notes.length === 0);
    notes.forEach(text => {
        const p = document.createElement('p');
        p.className = 'reward-note';
        p.textContent = text;
        notesEl.appendChild(p);
    });

    if (diceLabelEl) diceLabelEl.textContent = diceLabel;

    const backdrop = el.querySelector('.reward-overlay-backdrop');
    const flash = el.querySelector('.reward-overlay-flash');
    if (backdrop) {
        gsap.set(backdrop, { opacity: 0 });
        if (typeof gsap !== 'undefined') {
            gsap.to(backdrop, { opacity: 0.95, duration: 0.5, ease: 'power2.out' });
        } else {
            backdrop.style.opacity = '0.95';
        }
    }
    if (flash) {
        flash.style.background = 'rgba(255,255,255,0.5)';
        flash.style.opacity = '1';
        if (typeof gsap !== 'undefined') {
            gsap.to(flash, { opacity: 0, duration: 0.6, ease: 'power2.out' });
        } else {
            flash.style.opacity = '0';
        }
    }

    if (typeof gsap !== 'undefined') {
        gsap.set(box, { opacity: 0, scale: 0.5, visibility: 'visible' });
        gsap.to(box, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
            delay: 0.1
        });
    } else {
        box.style.opacity = '1';
        box.style.transform = 'scale(1)';
        box.style.visibility = 'visible';
    }
}

function hideRewardOverlay() {
    const el = document.getElementById('rewardOverlay');
    if (!el) return;
    const rain = document.getElementById('rewardOverlayRain');
    if (rain) rain.innerHTML = '';
    el.style.display = 'none';
    el.classList.remove('pointer-events-on');
}

/**
 * Standardized end-game handler for puzzle games.
 * Awards stars, saves completion, shows reward overlay with +1 dice roll.
 * @param {string} gameId - Game identifier (phrases, cross, etc.)
 * @param {number} starsEarned - Total stars earned for this game
 * @param {string[]} [notes=[]] - Optional notes to display
 * @param {number} [delay=1] - Delay in seconds before showing the overlay
 */
function endGameFunction(gameId, starsEarned, notes, delay) {
    notes = Array.isArray(notes) ? notes : (notes ? [notes] : []);
    const delayMs = (typeof delay === 'number' ? delay : 1) * 1000;

    const key = getPuzzleStarsKey(gameId);
    if (key) {
        const previousStars = parseInt(localStorage.getItem(key) || '0');
        const starDifference = Math.max(0, starsEarned - previousStars);
        localStorage.setItem(key, String(starsEarned));

        if (starDifference > 0) {
            const todayKey = getTodayKey();
            const currentDaily = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
            const currentTotal = parseInt(localStorage.getItem('totalStars') || '0');
            // Always update daily and total stars for puzzle games
            localStorage.setItem(`dailyStars_${todayKey}`, String(currentDaily + starDifference));
            localStorage.setItem('totalStars', String(currentTotal + starDifference));

            // Let journey/journey.js handle usable (spendable) stars & gamesPlayed if available
            if (typeof window.awardStars === 'function') {
                window.awardStars(starDifference, gameId);
            } else {
                // Fallback: manually update usable stars only when awardStars is not available
                const currentUsable = parseInt(localStorage.getItem(`usableStars_${todayKey}`) || '0');
                localStorage.setItem(`usableStars_${todayKey}`, String(currentUsable + starDifference));
                if (window.updateMoveStarsDisplay) window.updateMoveStarsDisplay();
            }
        }
    }

    if (window.updateStarDisplay) window.updateStarDisplay();
    if (window.updatePhrasesStars) window.updatePhrasesStars();
    if (window.loadGameScores) window.loadGameScores();
    if (window.updateWalletStars) window.updateWalletStars();
    if (window.updateRivalStars) window.updateRivalStars();
    if (window.updateHeaderStarCounter) window.updateHeaderStarCounter();
    if (window.updateWalletStars2) window.updateWalletStars2();
    if (window.updateCalendar) window.updateCalendar();

    if (typeof window.addBoardDiceRolls === 'function') {
        window.addBoardDiceRolls(1);
    }

    if (starsEarned > 0) {
        startRewardCelebration(starsEarned);
    }
    setTimeout(function() {
        showRewardOverlay(gameId, starsEarned, notes, '+1');
    }, delayMs);
}

window.endGameFunction = endGameFunction;

// Helper to show/hide main sections under the game overlay
function setMainSectionsVisible(isVisible) {
    const displayValue = isVisible ? '' : 'none';
    const sections = document.querySelectorAll('.section');
    const titles = document.querySelectorAll('.section-title');
    sections.forEach((el) => {
        el.style.display = displayValue;
    });
    titles.forEach((el) => {
        el.style.display = displayValue;
    });
}

// Unified function to open a game
// extraParams: optional object of params to add (e.g. { practice: 'true' })
function openGame(gameId, extraParams) {
    const config = gameConfig[gameId];
    if (!config) {
        console.error(`Unknown game ID: ${gameId}`);
        return;
    }
    
    const overlay = document.getElementById('gameOverlay');
    const iframe = document.getElementById('gameIframe');
    
    if (!overlay || !iframe) {
        console.error('Game overlay or iframe not found');
        return;
    }
    
    // Reset session started flag for puzzle games
    if (puzzleSessionStarted.hasOwnProperty(gameId)) {
        puzzleSessionStarted[gameId] = false;
    }
    
    hideRewardOverlay();
    
    // Set current game ID
    currentGameId = gameId;
    
    // Apply special attributes if needed
    if (config.specialAttrs) {
        Object.keys(config.specialAttrs).forEach(attr => {
            if (attr === 'style') {
                iframe.setAttribute('style', config.specialAttrs[attr]);
            } else {
                iframe.setAttribute(attr, config.specialAttrs[attr]);
            }
        });
    } else {
        // Reset to default attributes
        iframe.removeAttribute('allow');
        iframe.removeAttribute('sandbox');
        iframe.setAttribute('style', 'width: 100%; height: 100%; border: none;');
    }
    
    // Build URL with header type if present
    const urlParams = new URLSearchParams(window.location.search);
    const headerType = urlParams.get('d');
    const theme = urlParams.get('theme');
    
    // Build game URL with parameters
    let gameUrl = config.path;
    const gameParams = new URLSearchParams();
    if (headerType && gameId === 'match3') {
        // Pass header type to match3 game so it can detect firehouse
        gameParams.set('d', headerType);
    }
    if (theme && (gameId === 'zoom' || gameId === 'suspect')) {
        // Pass theme to zoom and suspect games so they can use the correct images/content
        gameParams.set('theme', theme);
    }
    if (extraParams) {
        Object.keys(extraParams).forEach(key => gameParams.set(key, extraParams[key]));
    }
    if (gameParams.toString()) {
        gameUrl += '?' + gameParams.toString();
    }
    
    // Load the game
    iframe.src = gameUrl;
    console.log(`Loading game ${gameId}: ${gameUrl}`);
    if (gameId === 'match3' && headerType) {
        console.log(`Match3 - Passing headerType '${headerType}' in URL: ${gameUrl}`);
    }
    
    // Show overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Hide main sections while the game iframe is visible
    setMainSectionsVisible(false);
    
    // Show close button(s) - both header and desktop bar
    document.querySelectorAll('.game-overlay-close').forEach(function(btn) { btn.classList.add('show'); });
    updateLogoVisibility();
}

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
    } else if (event.data && typeof event.data === 'object' && event.data.type === 'puzzleComplete') {
        const { gameId, stars, notes, delay } = event.data;
        if (gameId && currentGameId === gameId) {
            endGameFunction(gameId, stars != null ? stars : 1, notes || [], delay);
        }
    } else if (event.data && typeof event.data === 'object' && event.data.type === 'arcadeComplete') {
        const { gameId, stars } = event.data;
        if (gameId && currentGameId === gameId) {
            const starsEarned = typeof stars === 'number' ? stars : 1;
            if (starsEarned > 0) {
                startRewardCelebration(starsEarned);
            }
            setTimeout(() => {
                showRewardOverlay(gameId, starsEarned, [], '+1');
            }, 1000);
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
    
    const dateElements = document.querySelectorAll('.header-bar .date, .desktop-date .date');
    const dateSubtitleElements = document.querySelectorAll('.header-bar .date-subtitle, .desktop-date .date-subtitle');
    if (!dateElements.length) return;
    
    const today = new Date();
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[today.getMonth()];
    const day = today.getDate();
    const year = today.getFullYear();
    const dateStr = `${month} ${day}, ${year}`;
    
    const isBrandMode = new URLSearchParams(window.location.search).get('m') === 'brand';
    dateElements.forEach(function(dateElement) {
        if (isBrandMode) {
            dateElement.textContent = 'Daily Game Center';
            dateElement.classList.remove('date-tiles-mode');
        } else {
            dateElement.textContent = dateStr;
            dateElement.classList.add('date-tiles-mode');
            dateElement.style.textTransform = 'none';
            dateElement.style.fontSize = '14px';
            dateElement.style.fontWeight = '800';
        }
    });
    dateSubtitleElements.forEach(function(dateSubtitleElement) {
        if (isBrandMode) {
            dateSubtitleElement.textContent = dateStr;
            dateSubtitleElement.style.display = '';
            dateSubtitleElement.style.textTransform = 'none';
            dateSubtitleElement.style.fontSize = '9px';
        } else {
            dateSubtitleElement.style.display = 'none';
        }
    });
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
    
    // Load blackjack score and stars
    const blackjackScore = parseInt(localStorage.getItem(`blackjackScore_${todayKey}`) || '0');
    const blackjackStars = parseInt(localStorage.getItem(`blackjackStars_${todayKey}`) || '0');
    const blackjackScoreElement = document.getElementById('blackjackScore');
    const blackjackStarsElement = document.getElementById('blackjackStars');
    if (blackjackScoreElement) {
        blackjackScoreElement.textContent = blackjackScore.toLocaleString();
    }
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

// Function to update blackjack score and stars display
function updateBlackjackStars() {
    const todayKey = getTodayKey();
    const blackjackScore = parseInt(localStorage.getItem(`blackjackScore_${todayKey}`) || '0');
    const blackjackStars = parseInt(localStorage.getItem(`blackjackStars_${todayKey}`) || '0');
    const blackjackScoreElement = document.getElementById('blackjackScore');
    const blackjackStarsElement = document.getElementById('blackjackStars');
    if (blackjackScoreElement) {
        blackjackScoreElement.textContent = blackjackScore.toLocaleString();
    }
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

// Function to apply theme settings
function applyThemeSettings() {
    if (typeof getCurrentTheme === 'function') {
        const theme = getCurrentTheme();
        
        // Update week subtitle text (e.g. "2 days before Thanksgiving" or "July 2nd")
        const weekSubtitles = document.querySelectorAll('.week-subtitle, .week-subtitle-type1');
        const subtitleText = getSubtitleText();
        weekSubtitles.forEach(subtitle => {
            subtitle.textContent = subtitleText;
        });
        
        // Update banner date (instead of TODAY'S GAMES)
        const bannerText = document.querySelector('.todays-games-text');
        if (bannerText) bannerText.textContent = getBannerDateText();
        
        // Update TODAY'S GAMES banner background (day1 image per theme)
        const day1Image = theme.day1Image || 'weeklyBackgrounds/thanksgiving_day1.png';
        const todaysBanner = document.querySelector('.todays-games-banner');
        if (todaysBanner) {
            todaysBanner.style.backgroundImage = `url('${day1Image}')`;
        }
        
        // Update quiz titles
        const quizTitles = document.querySelectorAll('.subsection-title');
        quizTitles.forEach(title => {
            if (title.textContent.includes('THANKSGIVING QUIZ') || title.textContent.includes('4TH OF JULY QUIZ')) {
                title.textContent = theme.quizTitle;
            }
        });
        
        // Update background images
        const themePattern = theme.backgroundPattern;
        if (themePattern) {
            // Check if it's firehouse or bigy - if so, put image on calendar, otherwise on carousel
            const urlParams = new URLSearchParams(window.location.search);
            const headerType = urlParams.get('d');
            const isFirehouseOrBigy = headerType === 'firehouse2' || headerType === 'bigy' || headerType === 'bigy2';
            
            const style = document.createElement('style');
            style.id = 'theme-background-styles';
            
            if (isFirehouseOrBigy) {
                // Put background on week-theme-section for firehouse/bigy (behind "THIS WEEK'S THEME")
                // Use ::before pseudo-element with 0.15 opacity
                style.textContent = `
                    .week-theme-section::before {
                        content: '' !important;
                        display: block !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 0 !important;
                        background-image: url('${themePattern}') !important;
                        background-size: cover !important;
                        background-position: center !important;
                        background-repeat: no-repeat !important;
                        opacity: 0.15 !important;
                        pointer-events: none !important;
                        z-index: 0 !important;
                    }
                    body.firehouse2 .week-combined-container2B .week-theme-section::before,
                    body.bigy2 .week-combined-container2B .week-theme-section::before,
                    .week-combined-container2A .week-theme-section::before {
                        content: '' !important;
                        display: block !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 0 !important;
                        background-image: url('${themePattern}') !important;
                        background-size: cover !important;
                        background-position: center !important;
                        background-repeat: no-repeat !important;
                        opacity: 0.15 !important;
                        pointer-events: none !important;
                        z-index: 0 !important;
                    }
                `;
            } else {
                // Put background on carousel for normal
                style.textContent = `
                    .top-logo-carousel-container-type1 {
                        background-image: url('${themePattern}') !important;
                    }
                `;
            }
            
            // Remove existing theme style if present
            const existingStyle = document.getElementById('theme-background-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
            document.head.appendChild(style);
        }
    }
}

// Run when DOM is loaded
// DEBUG: set to "morning" | "afternoon" | "evening" | "night" to override; "" = use real time
const DEBUG_TIME_OF_DAY_OVERRIDE = "";

function updateCommunityOnlineHeader() {
    const el = document.getElementById('community-online-header-text');
    if (!el) return;
    let hour = new Date().getHours();
    if (DEBUG_TIME_OF_DAY_OVERRIDE) {
        const override = DEBUG_TIME_OF_DAY_OVERRIDE.toLowerCase();
        if (override === "morning") hour = 8;
        else if (override === "afternoon") hour = 14;
        else if (override === "evening") hour = 18;
        else if (override === "night") hour = 22;
    }
    const baseClass = 'community-online-header';
    const bannerImg = document.querySelector('.community-online-banner-img');
    const wrapper = el.closest('.community-online-wrapper');
    if (wrapper) {
        wrapper.classList.remove('community-online-wrapper--morning', 'community-online-wrapper--afternoon', 'community-online-wrapper--evening', 'community-online-wrapper--night');
    }
    if (hour >= 5 && hour < 12) {
        el.textContent = 'GOOD MORNING!';
        el.className = baseClass + ' community-online-header--morning';
        if (bannerImg) bannerImg.src = 'src/img/morning.png';
        if (wrapper) wrapper.classList.add('community-online-wrapper--morning');
    } else if (hour >= 12 && hour < 17) {
        el.textContent = 'GOOD AFTERNOON!';
        el.className = baseClass + ' community-online-header--afternoon';
        if (bannerImg) bannerImg.src = 'src/img/afternoon.png';
        if (wrapper) wrapper.classList.add('community-online-wrapper--afternoon');
    } else if (hour >= 17 && hour < 20) {
        el.textContent = 'GOOD EVENING!';
        el.className = baseClass + ' community-online-header--evening';
        if (bannerImg) bannerImg.src = 'src/img/evening.png';
        if (wrapper) wrapper.classList.add('community-online-wrapper--evening');
    } else {
        el.textContent = 'GOOD EVENING';
        el.className = baseClass + ' community-online-header--night';
        if (bannerImg) bannerImg.src = 'src/img/night.png';
        if (wrapper) wrapper.classList.add('community-online-wrapper--night');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setCurrentDate();
    updateHeaderStarCounter();
    updateWalletStars2();
    if (typeof updateRivalsYouStarCount === 'function') updateRivalsYouStarCount();
    updateCommunityOnlineHeader();

    // Apply theme settings
    applyThemeSettings();
    
    // Update bonus spin display - ensure it runs after DOM is ready
    setTimeout(() => {
        updateBonusSpinDisplay();
    }, 0);
    
    // Update calendar after a short delay to ensure all containers are set up
    setTimeout(() => {
    updateCalendar();
    }, 100);
    
    // Ensure main-page scramble letters are laid out correctly on initial load.
    // Use a small delay so this runs after the scramble script finishes its own initialization.
    if (typeof resizeMainPageScramble === 'function') {
        setTimeout(() => {
            resizeMainPageScramble();
        }, 250);
    }

    // Wallet/profile page: update level display under avatar
    try {
        const levelEl = document.getElementById('profile-level-display');
        if (levelEl) {
            let level = 1;
            if (typeof getJourneyLevel === 'function') {
                level = getJourneyLevel();
            } else {
                const stored = localStorage.getItem('journeyLevel');
                const parsed = parseInt(stored || '1', 10);
                if (!isNaN(parsed) && parsed > 0) level = parsed;
            }
            levelEl.textContent = `LEVEL ${level}`;
        }
    } catch (e) {
        console.warn('[Profile] Failed to update level display:', e);
    }
    
    // Initialize deals page display if it's the active page
    const dealsPage = document.getElementById('deals-page');
    if (dealsPage && dealsPage.classList.contains('active')) {
        const urlParams = new URLSearchParams(window.location.search);
        const headerType = urlParams.get('d');
        const regularDeals = document.getElementById('regular-deals');
        const firehouseDeals = document.getElementById('dealsFirehouse');
        
        if (headerType === 'firehouse2' && firehouseDeals) {
            // Show firehouse deals, hide regular deals
            if (regularDeals) regularDeals.style.display = 'none';
            firehouseDeals.style.display = 'grid';
        } else {
            // Show regular deals, hide firehouse deals
            if (regularDeals) regularDeals.style.display = 'grid';
            if (firehouseDeals) firehouseDeals.style.display = 'none';
        }
    }
    
    loadGameScores2();
    updateBoostHighScore();
    // console.log("loadGameScores called");
    
    // Initialize coin displays if function exists
    
    // Initialize help button(s) - original + desktop bar
    const helpButtons = document.querySelectorAll('.help-button');
    const helpPopup = document.getElementById('help-popup-overlay');
    const helpPopupClose = document.querySelector('.help-popup-close');
    
    if (helpPopup) {
        helpButtons.forEach(function(helpButton) {
            helpButton.addEventListener('click', function() {
                helpPopup.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        });
    }
    
    // Avatar select popup
    const AVATAR_STORAGE_KEY = 'selectedAvatarPath';
    const AVATAR_PATHS = Array(50).fill('src/img/profile.png');
    const avatarSelectOverlay = document.getElementById('avatarSelectOverlay');
    const avatarSelectGrid = document.getElementById('avatarSelectGrid');
    const profileImage = document.querySelector('.profile-image');
    const profileActions = document.querySelector('.profile-actions');

    function buildAvatarGrid() {
        if (!avatarSelectGrid) return;
        const currentPath = localStorage.getItem(AVATAR_STORAGE_KEY) || 'src/img/profile.png';
        avatarSelectGrid.innerHTML = '';
        AVATAR_PATHS.forEach((path, i) => {
            const cell = document.createElement('div');
            cell.className = 'avatar-select-cell' + (path === currentPath ? ' selected' : '');
            cell.dataset.path = path;
            cell.dataset.index = String(i);
            const img = document.createElement('img');
            img.src = path;
            img.alt = 'Avatar ' + (i + 1);
            cell.appendChild(img);
            cell.addEventListener('click', () => {
                document.querySelectorAll('.avatar-select-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                localStorage.setItem(AVATAR_STORAGE_KEY, path);
                if (profileImage) profileImage.src = path;
                if (typeof updateBoardPlayerAvatar === 'function') updateBoardPlayerAvatar(path);
            });
            avatarSelectGrid.appendChild(cell);
        });
    }

    function showAvatarSelectPopup() {
        if (!avatarSelectOverlay) return;
        buildAvatarGrid();
        avatarSelectOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function hideAvatarSelectPopup() {
        if (!avatarSelectOverlay) return;
        avatarSelectOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    if (profileActions) {
        profileActions.addEventListener('click', showAvatarSelectPopup);
    }
    const avatarSelectClose = document.querySelector('.avatar-select-close');
    if (avatarSelectClose) {
        avatarSelectClose.addEventListener('click', hideAvatarSelectPopup);
    }
    if (avatarSelectOverlay) {
        avatarSelectOverlay.addEventListener('click', (e) => {
            if (e.target === avatarSelectOverlay) hideAvatarSelectPopup();
        });
    }

    const savedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (savedAvatar && profileImage) {
        profileImage.src = savedAvatar;
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
        
        // Handle firehouse deals display
        if (targetPage === 'deals') {
            const urlParams = new URLSearchParams(window.location.search);
            const headerType = urlParams.get('d');
            const regularDeals = document.getElementById('regular-deals');
            const firehouseDeals = document.getElementById('dealsFirehouse');
            
            if (headerType === 'firehouse2' && firehouseDeals) {
                // Show firehouse deals, hide regular deals
                if (regularDeals) regularDeals.style.display = 'none';
                firehouseDeals.style.display = 'grid';
            } else {
                // Show regular deals, hide firehouse deals
                if (regularDeals) regularDeals.style.display = 'grid';
                if (firehouseDeals) firehouseDeals.style.display = 'none';
            }
        }
        
        // Update logo visibility when switching pages
        updateLogoVisibility();
        
        // Scroll viewport to top when switching tabs/pages (snap, no animation)
        window.scrollTo(0, 0);
        
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
            const moveStars = localStorage.getItem(`usableStars_${todayKey}`);
            console.log('[Journey Tab] Current move stars:', moveStars);
            
            // Snap container position when journey tab becomes active
            if (window.snapJourneyContainer) {
                const journeyPage = document.getElementById('journey-page');
                if (journeyPage && journeyPage.classList.contains('active')) {
                                window.snapJourneyContainer();
                    }
                }
            // Center board (x and y) when journey tab is shown
            if (window.boardCenterWrapper) {
                requestAnimationFrame(function() { window.boardCenterWrapper(); });
            }
            // Re-enable roll button if user returned from question-mark (prizes) flow
            if (window.boardRollWaitingForReturn && typeof window.boardRollReactivate === "function") {
                window.boardRollReactivate();
                window.boardRollWaitingForReturn = false;
            }
        }
        
        // Help button visibility: only on home page (updateLogoVisibility checks home + close button)
        updateLogoVisibility();
        
        
        // Trigger rival page animations
        if (targetPage === 'rival') {
            animateRivalPage();
            if (typeof updateRivalsYouStarCount === 'function') updateRivalsYouStarCount();
            if (window.updateRivalStars) window.updateRivalStars();
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
        
        // Update community page stats when community page is shown
        if (targetPage === 'community') {
            updateCommunityOnlineHeader();
            if (typeof updateRivalsYouStarCount === 'function') updateRivalsYouStarCount();
            updateGamesPageStats();
            updateBoostGameBox();

            // Ensure scramble letters are laid out correctly now that container is visible
            if (typeof resizeMainPageScramble === 'function') {
                resizeMainPageScramble();
            }
        }
        
        // When returning to the main page, re-layout the main-page scramble letters
        if (targetPage === 'main') {
            if (typeof resizeMainPageScramble === 'function') {
                resizeMainPageScramble();
            }
        }
        
    });
});

// TODAY'S GAMES banner: click goes to community tab
const todaysGamesLink = document.getElementById('todays-games-link');
if (todaysGamesLink) {
    todaysGamesLink.addEventListener('click', () => {
        const communityTab = document.querySelector('.tab-button[data-page="community"]');
        if (communityTab) communityTab.click();
    });
}

// Daily question: show thanks if already answered; on Enter save answer, add 3 stars, fade to thanks
function initDailyQuestion() {
    const todayKey = getTodayKey();
    const storageKey = 'dailyQuestionAnswered_' + todayKey;
    const answerKey = 'dailyQuestionAnswer_' + todayKey;
    const entryRow = document.getElementById('daily-question-entry-row');
    const thanksRow = document.getElementById('daily-question-thanks-row');
    const inputEl = document.getElementById('daily-question-input');
    const enterBtn = document.getElementById('daily-question-enter-btn');

    function showThanksHideEntry() {
        if (entryRow) entryRow.style.opacity = '0';
        if (thanksRow) {
            thanksRow.classList.add('visible');
            thanksRow.style.opacity = '1';
        }
        if (inputEl) inputEl.disabled = true;
        if (enterBtn) enterBtn.disabled = true;
    }

    if (localStorage.getItem(storageKey) === 'true') {
        if (entryRow) entryRow.style.display = 'none';
        if (thanksRow) {
            thanksRow.classList.add('visible');
            thanksRow.style.opacity = '1';
        }
        if (inputEl) inputEl.disabled = true;
        if (enterBtn) enterBtn.disabled = true;
    }

    if (!enterBtn || !inputEl || !entryRow || !thanksRow) return;

    enterBtn.addEventListener('click', function submitDailyQuestion() {
        if (localStorage.getItem(storageKey) === 'true') return;
        const answer = (inputEl.value || '').trim();
        localStorage.setItem(answerKey, answer);
        localStorage.setItem(storageKey, 'true');

        var currentDaily = parseInt(localStorage.getItem('dailyStars_' + todayKey) || '0');
        var currentTotal = parseInt(localStorage.getItem('totalStars') || '0');
        var currentUsable = parseInt(localStorage.getItem('usableStars_' + todayKey) || '0');
        localStorage.setItem('dailyStars_' + todayKey, String(currentDaily + 3));
        localStorage.setItem('totalStars', String(currentTotal + 3));
        localStorage.setItem('usableStars_' + todayKey, String(currentUsable + 3));
        if (window.updateHeaderStarCounter) window.updateHeaderStarCounter();
        if (window.updateWalletStars2) window.updateWalletStars2();
        if (typeof updateRivalsYouStarCount === 'function') updateRivalsYouStarCount();
        if (window.updateRivalStars) window.updateRivalStars();
        if (window.updateMoveStarsDisplay) window.updateMoveStarsDisplay();

        if (typeof gsap !== 'undefined') {
            gsap.to(entryRow, { opacity: 0, duration: 0.3, ease: 'power2.out', onComplete: function() {
                entryRow.style.display = 'none';
                thanksRow.classList.add('visible');
                gsap.fromTo(thanksRow, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
            }});
        } else {
            showThanksHideEntry();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDailyQuestion);
} else {
    initDailyQuestion();
}

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

// Apply mode (m param): default/tiles vs m=brand
function applyMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('m');
    const isBrandMode = mode === 'brand';
    document.body.classList.toggle('mode-brand', isBrandMode);
    document.body.classList.toggle('mode-tiles', !isBrandMode);

    const dailyBoostWrapper = document.getElementById('daily-boost-wrapper');
    const carouselType1 = document.querySelector('.top-logo-carousel-container-type1');
    const carouselType2 = document.querySelector('.top-logo-carousel-container');
    const prizesTabLabels = document.querySelectorAll('.tab-button[data-page="prizes"] .label');
    const prizesTabTilesIcons = document.querySelectorAll('.tab-button[data-page="prizes"] .icon-tiles');
    const prizesTabPrizesIcons = document.querySelectorAll('.tab-button[data-page="prizes"] .icon-prizes');
    const prizesTitle = document.getElementById('prizes-page-title');
    const prizesSubtitle = document.getElementById('prizes-page-subtitle');
    const prizeTierTitles = document.querySelectorAll('.prize-section-title[data-prize-tier]');

    const helpPopupTitle = document.querySelector('.help-popup-title');
    if (helpPopupTitle) {
        helpPopupTitle.textContent = isBrandMode ? 'Daily Game Center' : 'Welcome!';
    }

    if (isBrandMode) {
        if (dailyBoostWrapper) dailyBoostWrapper.style.display = '';
        if (carouselType1) carouselType1.style.display = '';
        if (carouselType2) carouselType2.style.display = '';
        prizesTabLabels.forEach(el => { el.textContent = 'Prizes'; });
        prizesTabTilesIcons.forEach(el => { el.style.display = 'none'; });
        prizesTabPrizesIcons.forEach(el => { el.style.display = ''; });
        if (prizesTitle) prizesTitle.textContent = 'PRIZES';
        if (prizesSubtitle) prizesSubtitle.innerHTML = 'Spend your stars to buy prize tiles.<br>Fill in all the spaces to win the prize.';
        prizeTierTitles.forEach(el => {
            const tier = el.getAttribute('data-prize-tier');
            if (tier === 'gold') el.textContent = '$100 Prize';
            else if (tier === 'silver') el.textContent = '$20 gift Certificate';
            else if (tier === 'regular') el.textContent = '$5 Coupons';
        });
    } else {
        if (dailyBoostWrapper) dailyBoostWrapper.style.display = 'none';
        if (carouselType1) carouselType1.style.display = 'none';
        if (carouselType2) carouselType2.style.display = 'none';
        prizesTabLabels.forEach(el => { el.textContent = 'Tiles'; });
        prizesTabTilesIcons.forEach(el => { el.style.display = ''; });
        prizesTabPrizesIcons.forEach(el => { el.style.display = 'none'; });
        if (prizesTitle) prizesTitle.textContent = 'TILES';
        if (prizesSubtitle) prizesSubtitle.innerHTML = 'Spend your stars to buy tiles.<br>Fill in all the spaces to win avatars.<br>Resets weekly.';
        prizeTierTitles.forEach(el => {
            const tier = el.getAttribute('data-prize-tier');
            if (tier === 'gold') el.textContent = 'GOLDEN AVATAR';
            else if (tier === 'silver') el.textContent = 'SILVER AVATAR';
            else if (tier === 'regular') el.textContent = 'AVATAR';
        });
    }
}

// Check URL parameters on page load
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
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
        
        // Re-apply theme settings after bigy styling is applied
        applyThemeSettings();
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
        
        // Re-apply theme settings after bigy2 styling is applied
        applyThemeSettings();
        
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
    } else if (headerType === 'firehouse2') {
        // Show header-type2, hide header-type1
        if (headerType1) headerType1.style.display = 'none';
        if (headerType2) headerType2.style.display = 'block';
        
        // Show container2B, hide container2A
        if (container2A) container2A.style.display = 'none';
        if (container2B) container2B.style.display = 'flex';
        
        // Set firehouse logo
        if (headerLogo) {
            headerLogo.src = 'src/img/firehousesubs/logo.png';
        }
        carouselLogos.forEach(logo => {
            logo.src = 'src/img/firehousesubs/logo.png';
        });
        
        // Apply DM Sans font to all elements except serif fonts and letter-box
        applyFontScheme('DM Sans');
        
        // Add body class for firehouse2 styling
        document.body.classList.add('firehouse2');
        
        // Apply firehouse red styling and white text for scramble, MC, and FoF
        applyFirehouseStyling();
        
        // Re-apply theme settings after firehouse styling is applied
        applyThemeSettings();
        
        // Show logo for firehouse2
        if (headerLogo) {
            headerLogo.style.display = 'block';
        }
        
        // For firehouse2, use yellow gradient hint button styling
        const hintButton = document.querySelector('.unscramble-hint-btn');
        if (hintButton) {
            // Remove any existing event listeners by cloning and replacing
            const newHintButton = hintButton.cloneNode(true);
            hintButton.parentNode.replaceChild(newHintButton, hintButton);
            
            // Apply yellow gradient styling for firehouse2
            newHintButton.style.background = 'linear-gradient(to bottom, #FFD700, #FFA500)';
            newHintButton.style.color = 'white';
            newHintButton.style.borderRadius = '6px';
            newHintButton.style.padding = '8px 24px';
            newHintButton.style.fontWeight = '700';
            newHintButton.style.boxShadow = 'none';
            // Remove lightbulb emoji for firehouse2
            newHintButton.textContent = newHintButton.textContent.replace('💡 ', '').replace('💡', '');
            if (newHintButton.textContent.trim() === '') {
                newHintButton.textContent = 'Hint';
            }
        }
        
        // Update carousel text for firehouse2
        const carouselSlides = document.querySelectorAll('.top-logo-carousel .carousel-slide');
        carouselSlides.forEach(slide => {
            const title = slide.querySelector('.promotional-banner-title');
            const subtitle = slide.querySelector('.promotional-banner-subtitle');
            if (title && title.textContent.includes('GO UNLIMITED')) {
                title.innerHTML = 'Feed the Crowd. Save the Day.';
                title.style.textTransform = 'none';
                if (subtitle) {
                    subtitle.textContent = 'Got a big crew to feed? Call for backup with Firehouse Subs catering for any occasion.';
                }
            }
            if (title && title.textContent.includes('DAILY GAMES')) {
                title.innerHTML = '$100 Million Donated<br>to First Responders';
                title.style.textTransform = 'none';
                if (subtitle) {
                    subtitle.textContent = 'The Foundation has supported thousands of equipment grants for first responders across the country.';
                }
            }
        });
        
        // Update boost game image for firehouse
        const boostGameImg = document.getElementById('boost-game-img');
        if (boostGameImg) {
            boostGameImg.src = 'src/img/firehousesubs/sweepsGame.png';
        }
        
        // Update calendar for firehouse2 after container is shown
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (typeof updateCalendar === 'function') {
                    console.log('[Firehouse2] Updating calendar after container shown');
                    updateCalendar();
                }
                // Re-apply theme settings after container is shown
                applyThemeSettings();
            }, 50);
        });
    } else if (headerType === 'wegmans') {
        // Show header-type1, hide header-type2 (normal version)
        if (headerType1) headerType1.style.display = 'block';
        if (headerType2) headerType2.style.display = 'none';
        
        // Hide both containers for wegmans (uses normal calendar)
        if (container2A) container2A.style.display = 'none';
        if (container2B) container2B.style.display = 'none';
        
        // Set wegmans logo for wegmans header (upper left)
        if (headerLogo) {
            headerLogo.src = 'src/img/wegmans/wegmans.png';
            headerLogo.style.display = 'block'; // Explicitly show logo for wegmans
        }
        // Update all carousel logos to use wegmans2.png
        carouselLogos.forEach(logo => {
            logo.src = 'src/img/wegmans/wegmans2.png';
        });
        
        // Also update first and last carousel slides specifically for wegmans
        const carouselSlides = document.querySelectorAll('.carousel-slide-type1');
        if (carouselSlides.length > 0) {
            // First slide
            const firstSlide = carouselSlides[0];
            const firstSlideImg = firstSlide.querySelector('img');
            if (firstSlideImg) {
                firstSlideImg.src = 'src/img/wegmans/wegmans2.png';
            }
            // Last slide
            const lastSlide = carouselSlides[carouselSlides.length - 1];
            const lastSlideImg = lastSlide.querySelector('img');
            if (lastSlideImg) {
                lastSlideImg.src = 'src/img/wegmans/wegmans2.png';
            }
        }
        
        // Apply Nunito font (default)
        applyFontScheme('Nunito');
        
        // Add body class for wegmans styling
        document.body.classList.add('wegmans');
        
        // Re-apply theme settings
        applyThemeSettings();
    } else {
        // Remove bigy2 and firehouse2 classes if they exist
        document.body.classList.remove('bigy2');
        document.body.classList.remove('firehouse2');
        document.body.classList.remove('wegmans');
        
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
    
    // Update boost game box (Market Match / Firehouse Match) based on header type
    updateBoostGameBox();
    
    // Apply mode (m param): tiles vs brand
    applyMode();
        
    // Initialize the appropriate carousel based on header type
    if (headerType === 'bigy' || headerType === 'bigy2' || headerType === 'firehouse2') {
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
function applyWegmansStyling() {
    // Change page background to white for wegmans
    document.body.style.backgroundColor = 'white';
    
    // Change all sections to white background
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.backgroundColor = 'white';
    });
    
    // Scramble sections - orange gradient for wegmans
    const scrambleTop = document.querySelector('.scramble-top-section');
    const scrambleBottom = document.querySelector('.scramble-bottom-section');
    if (scrambleTop) {
        scrambleTop.style.background = 'linear-gradient(to bottom, #e65f45, #ce3f24)';
        scrambleTop.style.backgroundColor = '';
        scrambleTop.style.borderBottom = 'none';
    }
    if (scrambleBottom) {
        scrambleBottom.style.background = '#ce3f24';
        scrambleBottom.style.backgroundColor = '#ce3f24';
    }
    
    // MC sections - orange for wegmans (darker top, lighter bottom)
    const mcTop = document.querySelector('.mc-top-section');
    const mcBottom = document.querySelector('.mc-bottom-section');
    if (mcTop) {
        mcTop.style.background = '#a0301a';
        mcTop.style.backgroundColor = '#a0301a';
        mcTop.style.borderBottom = 'none';
    }
    if (mcBottom) {
        mcBottom.style.background = '#ce3f24';
        mcBottom.style.backgroundColor = '#ce3f24';
    }
    
    // Quiz sections - orange gradient for wegmans
    const quizTop = document.querySelector('.quiz-top-section');
    const quizBottom = document.querySelector('.quiz-bottom-section');
    if (quizTop) {
        quizTop.style.background = 'linear-gradient(to bottom, #e65f45, #ce3f24)';
        quizTop.style.backgroundColor = '';
        quizTop.style.borderBottom = 'none';
    }
    if (quizBottom) {
        // quizBottom.style.background = '#ce3f24';
        quizBottom.style.backgroundColor = '#ce3f24';
    }
    
    // FoF sections - orange for wegmans (darker top, lighter bottom)
    const fofTop = document.querySelector('.fof-top-section');
    const fofBottom = document.querySelector('.fof-bottom-section');
    if (fofTop) {
        fofTop.style.background = '#a0301a';
        fofTop.style.backgroundColor = '#a0301a';
        fofTop.style.borderBottom = 'none';
    }
    if (fofBottom) {
        fofBottom.style.background = '#ce3f24';
        fofBottom.style.backgroundColor = '#ce3f24';
    }
    
    // Stars - wegmans color (#ce3f24) instead of red
    const unscrambleStars = document.querySelectorAll('.unscramble-stars');
    unscrambleStars.forEach(stars => {
        stars.style.color = '#ce3f24';
        const starIcons = stars.querySelectorAll('span, .star-icon');
        starIcons.forEach(icon => {
            icon.style.color = '#ce3f24';
        });
    });
    
    const mcStars = document.querySelectorAll('.mc-stars');
    mcStars.forEach(stars => {
        stars.style.color = '#ce3f24';
        const starIcons = stars.querySelectorAll('span, .star-icon');
        starIcons.forEach(icon => {
            icon.style.color = '#ce3f24';
        });
    });
    
    const fofStars = document.querySelectorAll('.fof-stars');
    fofStars.forEach(stars => {
        stars.style.color = '#ce3f24';
        const starIcons = stars.querySelectorAll('span, .star-icon');
        starIcons.forEach(icon => {
            icon.style.color = '#ce3f24';
        });
    });
    
    const quizStars = document.querySelectorAll('.quiz-stars');
    quizStars.forEach(stars => {
        stars.style.color = '#ce3f24';
        const starIcons = stars.querySelectorAll('.quiz-star');
        starIcons.forEach(icon => {
            icon.style.color = '#ce3f24';
        });
    });
    
    // Header bar and desktop top bar - orange gradient for wegmans
    document.querySelectorAll('.header-bar, .desktop-top-bar').forEach(function(bar) {
        if (bar) bar.style.background = 'linear-gradient(to bottom, #e65f45, #ce3f24)';
    });
    
    // Star counter - wegmans color background
    starCounters.forEach(function(starCounter) {
        starCounter.style.backgroundColor = '#ce3f24';
        const starCount = starCounter.querySelector('.star-count');
        if (starCount) starCount.style.color = 'white';
        const starIcon = starCounter.querySelector('.star-icon');
        if (starIcon) starIcon.style.color = '#FFD700';
    });
    
    // Date text - black for wegmans
    const dateElement = document.querySelector('.date');
    if (dateElement) {
        dateElement.style.color = '#000';
    }
    const dateSubtitle = document.querySelector('.date-subtitle');
    if (dateSubtitle) {
        dateSubtitle.style.color = '#000';
    }
    
    // Show logo for wegmans
    const headerLogo = document.querySelector('.header-logo');
    if (headerLogo) {
        headerLogo.style.display = 'block';
    }
    
    // Question mark - default grey for wegmans (don't override)
    
    // Profile picture - orange for wegmans
    const profilePicture = document.querySelector('.profile-picture');
    if (profilePicture) {
        profilePicture.style.background = 'linear-gradient(to bottom, #ce3f24, #a0301a)';
        profilePicture.style.backgroundColor = '';
    }
    
    // Profile container - white background for wegmans
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        profileContainer.style.background = 'white';
        profileContainer.style.backgroundColor = 'white';
    }
    
    // Profile page wegmans color elements
    const dealEarnContainer = document.querySelector('.deal-earn-container');
    if (dealEarnContainer) {
        dealEarnContainer.style.backgroundColor = '#ce3f24';
    }
    
    // Deal button containers - wegmans color
    const dealButtonContainers = document.querySelectorAll('.deal-button-container');
    dealButtonContainers.forEach(container => {
        container.style.backgroundColor = '#ce3f24';
    });
    
    const challengesContainer = document.querySelector('.profile-challenges-container');
    if (challengesContainer) {
        challengesContainer.style.borderColor = '';
        challengesContainer.style.background = '';
        challengesContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    }
    
    const achievementsContainer = document.querySelector('.profile-achievements-container');
    if (achievementsContainer) {
        achievementsContainer.style.borderColor = '';
        achievementsContainer.style.background = '';
        achievementsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    }
    
    const achievementsHeader = document.querySelector('.achievements-header');
    if (achievementsHeader) {
        achievementsHeader.style.background = 'linear-gradient(to bottom, #ce3f24, #a0301a)';
    }
    
    const challengesHeader = document.querySelector('.challenges-header');
    if (challengesHeader) {
        challengesHeader.style.background = 'linear-gradient(to bottom, #ce3f24, #a0301a)';
    }
    
    // Challenge items - wegmans color
    const challengeItems = document.querySelectorAll('.challenge-item');
    challengeItems.forEach(item => {
        item.style.borderBottomColor = 'rgba(206, 63, 36, 0.2)';
        item.style.background = 'linear-gradient(to bottom, rgba(206, 63, 36, 0.08) 0%, rgba(206, 63, 36, 0.04) 100%)';
    });
    
    // Challenge rewards - wegmans color
    const challengeRewards = document.querySelectorAll('.challenge-reward');
    challengeRewards.forEach(reward => {
        reward.style.color = '#ce3f24';
        reward.style.background = 'linear-gradient(135deg, rgba(206, 63, 36, 0.15) 0%, rgba(206, 63, 36, 0.1) 100%)';
        reward.style.boxShadow = '0 2px 4px rgba(206, 63, 36, 0.2)';
    });
    
    // Star icons inline - wegmans color
    const starIconsInline = document.querySelectorAll('.star-icon-inline');
    starIconsInline.forEach(icon => {
        icon.style.color = '#ce3f24';
        icon.style.textShadow = '0 1px 2px rgba(206, 63, 36, 0.3)';
    });
    
    // Text colors - white for wegmans
    const subsectionTitles = document.querySelectorAll('.subsection-title');
    subsectionTitles.forEach(title => {
        title.style.color = 'white';
        title.style.textTransform = 'none';
    });
    
    // Section titles - remove transform for wegmans but keep default font (Aleo)
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.style.transform = 'translateY(0)';
    });
    
    // Apply yellow gradient styling to hint button for wegmans (same as firehouse)
    const hintButton = document.querySelector('.unscramble-hint-btn');
    if (hintButton) {
        // Remove any existing event listeners by cloning and replacing
        const newHintButton = hintButton.cloneNode(true);
        hintButton.parentNode.replaceChild(newHintButton, hintButton);
        
        // Apply yellow gradient styling for wegmans (same as firehouse)
        newHintButton.style.background = 'linear-gradient(to bottom, #FFD700, #FFA500)';
        newHintButton.style.color = 'white';
        newHintButton.style.borderRadius = '6px';
        newHintButton.style.padding = '8px 24px';
        newHintButton.style.fontWeight = '700';
        newHintButton.style.boxShadow = 'none';
        // Remove lightbulb emoji for wegmans (same as firehouse)
        newHintButton.textContent = newHintButton.textContent.replace('💡 ', '').replace('💡', '');
        if (newHintButton.textContent.trim() === '') {
            newHintButton.textContent = 'Hint';
        }
    }
    
    const mcQuestions = document.querySelectorAll('.mc-question');
    mcQuestions.forEach(question => {
        question.style.color = 'white';
    });
    
    // Quiz text elements - white for wegmans
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
        label.style.color = '#666'; // Normal grey like bottom part
    });
    
    const fofInstructions = document.querySelectorAll('.fof-instruction');
    fofInstructions.forEach(instruction => {
        instruction.style.color = 'white';
    });
    
    // Change letter boxes to white to light grey gradient background with orange text for wegmans
    const letterBoxes = document.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.style.background = 'linear-gradient(to bottom, white, #e0e0e0)';
        box.style.color = '#ce3f24';
        box.style.border = '2px solid #ce3f24';
    });
    
    // Center the calendar "this week's theme" text for wegmans
    const weekThemeSection = document.querySelector('.week-theme-section');
    if (weekThemeSection) {
        weekThemeSection.style.alignItems = 'center';
    }
    const weekTitle = document.querySelector('.week-title');
    if (weekTitle) {
        weekTitle.style.textAlign = 'center';
    }
    const weekSubtitle = document.querySelector('.week-subtitle');
    if (weekSubtitle) {
        weekSubtitle.style.textAlign = 'center';
    }
}

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
    
    // Header bar and desktop top bar - white for bigy
    document.querySelectorAll('.header-bar, .desktop-top-bar').forEach(function(bar) {
        if (bar) bar.style.background = 'white';
    });
    
    // Star counter - red background for bigy
    document.querySelectorAll('.star-counter').forEach(function(starCounter) {
        starCounter.style.backgroundColor = '#dc3545';
        const starCount = starCounter.querySelector('.star-count');
        if (starCount) starCount.style.color = 'white';
        const starIcon = starCounter.querySelector('.star-icon');
        if (starIcon) starIcon.style.color = '#FFD700';
    });
    
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
        challengesContainer.style.borderColor = '';
        challengesContainer.style.background = '';
        challengesContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    }
    
    const achievementsContainer = document.querySelector('.profile-achievements-container');
    if (achievementsContainer) {
        achievementsContainer.style.borderColor = '';
        achievementsContainer.style.background = '';
        achievementsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    }
    
    const achievementsHeader = document.querySelector('.achievements-header');
    if (achievementsHeader) {
        achievementsHeader.style.background = 'linear-gradient(to bottom, #dc3545, #c82333)';
    }
    
    const challengesHeader = document.querySelector('.challenges-header');
    if (challengesHeader) {
        challengesHeader.style.background = 'linear-gradient(to bottom, #dc3545, #c82333)';
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
    
    // Section titles - remove transform for bigy but keep default font (Aleo)
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.style.transform = 'translateY(0)';
        // Keep default Aleo font for section titles
    });
    
    // Journey page - blue gradient for bigy
    const journeyPage = document.getElementById('journey-page');
    if (journeyPage) {
        journeyPage.style.background = 'linear-gradient(to bottom, #4A5A9E, #1a2d5c)';
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

// Function to apply firehouse styling (red backgrounds, white text)
function applyFirehouseStyling() {
    // Change page background to off-white for firehouse (same as normal version)
    document.body.style.backgroundColor = '#f5f5f5';
    document.documentElement.style.backgroundColor = '#f5f5f5';
    
    // Change all sections to off-white background to match body (not white)
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.backgroundColor = '#f5f5f5';
    });
    
    // Also set content wrapper and html background if they exist
    const content = document.querySelector('.content');
    if (content) {
        content.style.backgroundColor = '#f5f5f5';
    }
    
    // Ensure html element also has the background
    const html = document.documentElement;
    html.style.backgroundColor = '#f5f5f5';
    
    // Scramble sections - light red to dark red gradient for firehouse
    const scrambleTop = document.querySelector('.scramble-top-section');
    const scrambleBottom = document.querySelector('.scramble-bottom-section');
    if (scrambleTop) {
        scrambleTop.style.background = 'linear-gradient(to bottom, #bf1722, #a00910)';
        scrambleTop.style.backgroundColor = '';
        scrambleTop.style.borderBottom = 'none';
    }
    if (scrambleBottom) {
        scrambleBottom.style.background = '#bf1722';
        scrambleBottom.style.backgroundColor = '#bf1722';
    }
    
    // MC sections - red for firehouse
    const mcTop = document.querySelector('.mc-top-section');
    const mcBottom = document.querySelector('.mc-bottom-section');
    if (mcTop) {
        mcTop.style.background = '#a00910';
        mcTop.style.backgroundColor = '#a00910';
        mcTop.style.borderBottom = 'none';
    }
    if (mcBottom) {
        mcBottom.style.background = '#bf1722';
        mcBottom.style.backgroundColor = '#bf1722';
    }
    
    // Quiz sections - light red to dark red gradient for firehouse
    const quizTop = document.querySelector('.quiz-top-section');
    const quizBottom = document.querySelector('.quiz-bottom-section');
    if (quizTop) {
        quizTop.style.background = 'linear-gradient(to bottom, #bf1722, #a00910)';
        quizTop.style.backgroundColor = '';
        quizTop.style.borderBottom = 'none';
    }
    if (quizBottom) {
        quizBottom.style.background = '#bf1722';
        quizBottom.style.backgroundColor = '#bf1722';
    }
    
    // FoF sections - red for firehouse
    const fofTop = document.querySelector('.fof-top-section');
    const fofBottom = document.querySelector('.fof-bottom-section');
    if (fofTop) {
        fofTop.style.background = '#a00910';
        fofTop.style.backgroundColor = '#a00910';
        fofTop.style.borderBottom = 'none';
    }
    if (fofBottom) {
        fofBottom.style.background = '#bf1722';
        fofBottom.style.backgroundColor = '#bf1722';
    }
    
    // Stars - red for firehouse
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
    
    // Header bar and desktop top bar - dark grey to black gradient with white text and Nunito for firehouse
    document.querySelectorAll('.header-bar, .desktop-top-bar').forEach(function(headerBar) {
        headerBar.style.background = 'linear-gradient(to bottom,rgb(48, 48, 48), #000000)';
        headerBar.style.color = 'white';
        headerBar.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        headerBar.querySelectorAll('.date, .date-subtitle, .header-title, .header-logo, span, div').forEach(function(element) {
            element.style.color = 'white';
            element.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        });
    });
    
    // Star counter - light red background for firehouse
    document.querySelectorAll('.star-counter').forEach(function(starCounter) {
        starCounter.style.backgroundColor = '#bf1722';
        const starCount = starCounter.querySelector('.star-count');
        if (starCount) starCount.style.color = 'white';
        const starIcon = starCounter.querySelector('.star-icon');
        if (starIcon) starIcon.style.color = '#FFD700';
    });
    
    // Date text - white for firehouse (in header bar with dark gradient)
    const dateElement = document.querySelector('.date');
    if (dateElement) {
        dateElement.style.color = 'white';
        dateElement.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
    const dateSubtitle = document.querySelector('.date-subtitle');
    if (dateSubtitle) {
        dateSubtitle.style.color = 'white';
        dateSubtitle.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
    
    // Show Firehouse logo for firehouse
    const headerLogo = document.querySelector('.header-logo');
    if (headerLogo) {
        headerLogo.style.display = 'block';
    }
    
    // Question mark - white for firehouse
    const helpButton = document.querySelector('.help-button');
    if (helpButton) {
        helpButton.style.color = 'white';
        helpButton.style.borderColor = 'white';
    }
    
    // Profile picture - red for firehouse
    const profilePicture = document.querySelector('.profile-picture');
    if (profilePicture) {
        profilePicture.style.background = 'linear-gradient(to bottom, #bf1722, #a00910)';
        profilePicture.style.backgroundColor = '';
    }
    
    // Profile container - white background for firehouse
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        profileContainer.style.background = 'white';
        profileContainer.style.backgroundColor = 'white';
    }
    
    // Profile page red elements - change to red for firehouse
    const dealEarnContainer = document.querySelector('.deal-earn-container');
    if (dealEarnContainer) {
        dealEarnContainer.style.backgroundColor = '#dc3545';
    }
    
    // Deal button containers - red for firehouse
    const dealButtonContainers = document.querySelectorAll('.deal-button-container');
    dealButtonContainers.forEach(container => {
        container.style.backgroundColor = '#dc3545';
    });
    
    const challengesContainer = document.querySelector('.profile-challenges-container');
    if (challengesContainer) {
        challengesContainer.style.borderColor = '';
        challengesContainer.style.background = '';
        challengesContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    }
    
    const achievementsContainer = document.querySelector('.profile-achievements-container');
    if (achievementsContainer) {
        achievementsContainer.style.borderColor = '';
        achievementsContainer.style.background = '';
        achievementsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    }
    
    const achievementsHeader = document.querySelector('.achievements-header');
    if (achievementsHeader) {
        achievementsHeader.style.background = 'linear-gradient(to bottom, #dc3545, #c82333)';
    }
    
    const challengesHeader = document.querySelector('.challenges-header');
    if (challengesHeader) {
        challengesHeader.style.background = 'linear-gradient(to bottom, #dc3545, #c82333)';
    }
    
    // Challenge items - red for firehouse
    const challengeItems = document.querySelectorAll('.challenge-item');
    challengeItems.forEach(item => {
        item.style.borderBottomColor = 'rgba(220, 53, 69, 0.2)';
        item.style.background = 'linear-gradient(to bottom, rgba(220, 53, 69, 0.08) 0%, rgba(220, 53, 69, 0.04) 100%)';
    });
    
    // Challenge rewards - red for firehouse
    const challengeRewards = document.querySelectorAll('.challenge-reward');
    challengeRewards.forEach(reward => {
        reward.style.color = '#dc3545';
        reward.style.background = 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.1) 100%)';
        reward.style.boxShadow = '0 2px 4px rgba(220, 53, 69, 0.2)';
    });
    
    // Star icons inline - red for firehouse
    const starIconsInline = document.querySelectorAll('.star-icon-inline');
    starIconsInline.forEach(icon => {
        icon.style.color = '#dc3545';
        icon.style.textShadow = '0 1px 2px rgba(220, 53, 69, 0.3)';
    });
    
    // Text colors - white for firehouse (keep as is, no uppercase)
    const subsectionTitles = document.querySelectorAll('.subsection-title');
    subsectionTitles.forEach(title => {
        title.style.color = 'white';
        title.style.textTransform = 'none'; // Remove uppercase for firehouse
        title.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    });
    
    // Section titles - remove transform for firehouse but keep default font (Aleo)
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.style.transform = 'translateY(0)';
        // Keep default Aleo font for section titles
    });
    
    // Journey page - purple gradient for firehouse
    const journeyPage = document.getElementById('journey-page');
    if (journeyPage) {
        journeyPage.style.background = 'linear-gradient(to bottom,rgb(103, 37, 190), #2E0E5C)';
    }
    
    // Boost game title - Firehouse Match for firehouse
    const gameTitle = document.querySelector('#community-page .boost-game-box .game-title');
    if (gameTitle) {
        gameTitle.textContent = 'FIREHOUSE MATCH';
    }
    
    // Apply yellow gradient styling to hint button for firehouse
    const hintButton = document.querySelector('.unscramble-hint-btn');
    if (hintButton) {
        hintButton.style.background = 'linear-gradient(to bottom, #FFD700, #FFA500)';
        hintButton.style.color = 'white';
        hintButton.style.borderRadius = '8px';
        hintButton.style.padding = '8px 20px';
        hintButton.style.fontWeight = '700';
        hintButton.style.boxShadow = 'none';
        // Add lightbulb emoji for firehouse
        const buttonText = hintButton.textContent.trim();
        if (!buttonText.includes('💡')) {
            hintButton.textContent = '💡 Hint';
        }
        // Override hover state for firehouse
        hintButton.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = 'none';
            }
        }, { once: false });
        hintButton.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = 'none';
        }, { once: false });
    }
    
    const mcQuestions = document.querySelectorAll('.mc-question');
    mcQuestions.forEach(question => {
        question.style.color = 'white';
    });
    
    // Quiz text elements - white for firehouse
    const quizQuestions = document.querySelectorAll('.quiz-question');
    quizQuestions.forEach(question => {
        question.style.color = 'white';
        question.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    });
    
    const quizDifficulties = document.querySelectorAll('.quiz-difficulty');
    quizDifficulties.forEach(difficulty => {
        difficulty.style.color = 'white';
        difficulty.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    });
    
    const quizQuestionNumbers = document.querySelectorAll('.quiz-question-number');
    quizQuestionNumbers.forEach(number => {
        number.style.color = 'white';
        number.style.fontFamily = "'Nunito', sans-serif";
    });
    
    const quizQuestionsFirehouse = document.querySelectorAll('.quiz-question');
    quizQuestionsFirehouse.forEach(question => {
        question.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    });
    
    const unscrambleLabels = document.querySelectorAll('.unscramble-label');
    unscrambleLabels.forEach(label => {
        label.style.color = 'white';
        label.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    });
    
    const fofInstructions = document.querySelectorAll('.fof-instruction');
    fofInstructions.forEach(instruction => {
        instruction.style.color = 'white';
        instruction.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    });
    
    // Ensure subsection titles use Nunito (they're originally Nunito in CSS)
    const subsectionTitlesFirehouse = document.querySelectorAll('.subsection-title');
    subsectionTitlesFirehouse.forEach(title => {
        title.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    });
    
    // Change letter boxes to white background with lighter red text for firehouse
    const letterBoxes = document.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.style.background = 'white';
        box.style.color = '#bf1722';
    });
    
    // Also call the scramble.js function if it exists (for dynamically created boxes)
    if (typeof applyLetterBoxStyling === 'function') {
        applyLetterBoxStyling();
    }
    
    // Remove drop shadow from quiz containers for firehouse
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
        journeyPage.style.background = 'linear-gradient(to bottom,rgb(94, 35, 172), #2E0E5C)';
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
        challengesContainer.style.borderColor = '';
        challengesContainer.style.background = '';
        challengesContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    }
    
    const achievementsContainer = document.querySelector('.profile-achievements-container');
    if (achievementsContainer) {
        achievementsContainer.style.borderColor = '';
        achievementsContainer.style.background = '';
        achievementsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    }
    
    const achievementsHeader = document.querySelector('.achievements-header');
    if (achievementsHeader) {
        achievementsHeader.style.background = 'linear-gradient(to bottom, #FFB84D, #FF8C42)';
    }
    
    const challengesHeader = document.querySelector('.challenges-header');
    if (challengesHeader) {
        challengesHeader.style.background = 'linear-gradient(to bottom, #FFB84D, #FF8C42)';
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

// Update games page stats (e.g. Market Match high score)
function updateGamesPageStats() {
    updateBoostHighScore();
}

// Update boost game box (Market Match / Firehouse Match) based on header type
function updateBoostGameBox() {
    const gameTitle = document.querySelector('#community-page .boost-game-box .game-title');
    if (gameTitle) {
        // Check if firehouse is active
        const urlParams = new URLSearchParams(window.location.search);
        const headerType = urlParams.get('d');
        if (headerType === 'firehouse2') {
            gameTitle.textContent = 'FIREHOUSE MATCH';
        } else {
            gameTitle.textContent = 'MARKET MATCH';
        }
    }
    
    // Update play-color-box with image and red gradient
    const playColorBox = document.querySelector('#community-page .boost-game-box .play-color-box');
    if (playColorBox) {
        playColorBox.style.background = 'linear-gradient(to bottom, #e84066, #c82a48)';
        
        // Remove existing SVG
        const svg = playColorBox.querySelector('svg');
        if (svg) {
            svg.remove();
        }
        
        // Add image if it doesn't exist
        let img = playColorBox.querySelector('img');
        // Check if firehouse mode
        const urlParams = new URLSearchParams(window.location.search);
        const headerType = urlParams.get('d');
        const isFirehouse = headerType === 'firehouse2';
        const imageSrc = isFirehouse ? 'src/img/firehousesubs/sweepsGame.png' : 'src/img/bigy/sweepsGame.png';
        
        if (!img) {
            img = document.createElement('img');
            img.src = imageSrc;
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
            img.src = imageSrc;
            img.style.height = '100px';
        }
    }
}

// Helper function to update logo visibility based on close button state
function updateLogoVisibility() {
    const logo = document.querySelector('.header-logo');
    const closeButton = document.querySelector('.game-overlay-close');
    const helpButton = document.querySelector('.help-button');
    
    // Check if we're in default, bigy, bigy2, firehouse2, or wegmans mode
    const urlParams = new URLSearchParams(window.location.search);
    const headerType = urlParams.get('d');
    const isBigy = headerType === 'bigy';
    const isBigy2 = headerType === 'bigy2';
    const isFirehouse2 = headerType === 'firehouse2';
    const isWegmans = headerType === 'wegmans';
    const isBigyMode = isBigy || isBigy2 || isFirehouse2 || isWegmans;
    
    // Show help button(s): on mobile show only on main screen unless game open; on desktop show only when game open (upper left)
    const shouldHideHelp = closeButton && closeButton.classList.contains('show');
    const isDesktop = window.matchMedia && window.matchMedia('(min-width: 768px)').matches;
    const activeTab = document.querySelector('.tab-button.active');
    const isMainPage = activeTab && activeTab.getAttribute('data-page') === 'main';
    const helpButtons = document.querySelectorAll('.help-button');
    helpButtons.forEach(function(helpButton) {
        if (isDesktop && !shouldHideHelp) {
            helpButton.classList.add('hidden');
            helpButton.style.display = 'none';
        } else if (shouldHideHelp && !isDesktop) {
            helpButton.classList.add('hidden');
            helpButton.style.display = 'none';
        } else if (!isDesktop && !isMainPage) {
            helpButton.classList.add('hidden');
            helpButton.style.display = 'none';
        } else {
            helpButton.classList.remove('hidden');
            helpButton.style.display = 'inline-flex';
            if (isBigyMode && headerType !== 'wegmans') {
                helpButton.style.color = 'white';
                helpButton.style.borderColor = 'white';
            } else {
                helpButton.style.color = '#666';
                helpButton.style.borderColor = '#666';
            }
        }
    });
    // Desktop help link (6th tab) - hide when game overlay open
    const desktopHelpLink = document.querySelector('.desktop-help-link');
    if (desktopHelpLink) {
        desktopHelpLink.style.display = shouldHideHelp ? 'none' : 'flex';
    }
    
    // Show/hide logo based on game overlay state and mode
    if (logo) {
        if (closeButton && closeButton.classList.contains('show')) {
            // Game overlay is open - hide logo
            logo.style.display = 'none';
        } else {
            // Game overlay is closed - show logo for bigy, bigy2, firehouse2, and wegmans
            logo.style.display = isBigyMode ? 'block' : 'none';
        }
    }
}

// Check URL parameters when page loads
checkURLParameters();

// Keyboard shortcut to test color scheme
document.addEventListener('keydown', (e) => {
    // '8' key cheat to unlock bonus spin
    if (e.key === '8') {
        localStorage.setItem('bonusSpinCheatUnlocked', 'true');
        updateBonusSpinDisplay();
        console.log('Bonus spin unlocked via cheat');
    }
    
    if (e.key === 'q' || e.key === 'Q') {
        // Reset all data (same as reset button, but without popup)
        resetAllData();
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
if (memoryBox) {
    memoryBox.addEventListener('click', () => {
        openGame('memory');
    });
}

// memoryClose removed - now using single close button

let pendingCloseGameId = null;
let pendingCloseOverlayElement = null;
let pendingCloseIframeElement = null;

function actuallyCloseOverlay(gameId, overlayElement, iframeToUnload) {
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    hideRewardOverlay();
    if (overlayElement) {
        overlayElement.classList.remove('active');
    }
    if (iframeToUnload) {
        console.log(`Unloading ${gameId} game iframe by setting src to 'about:blank'`);
        iframeToUnload.src = 'about:blank';
    }
    
    // Clear current game ID
    currentGameId = null;
    
    // Update bonus spin display when closing other games (to check if unlock status changed)
    // But NOT when closing the bonus spin game itself
    if (gameId !== 'goldCase') {
        setTimeout(() => {
            updateBonusSpinDisplay();
        }, 200);
    }
    
    document.body.style.overflow = '';
    
    // Restore main sections once the iframe is closed
    setMainSectionsVisible(true);
    
    // Reload game scores to update stars
    loadGameScores2();
    
    requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
    });
}

// Main close button handler - attach to all close buttons (header + desktop bar)
document.querySelectorAll('.game-overlay-close').forEach(function(closeButton) {
    closeButton.addEventListener('click', function() {
        if (!currentGameId) return;
        
        // Hide close button(s)
        document.querySelectorAll('.game-overlay-close').forEach(function(btn) { btn.classList.remove('show'); });
        updateLogoVisibility();
        
        const overlay = document.getElementById('gameOverlay');
        const iframe = document.getElementById('gameIframe');
        
        // For puzzle games that are not yet completed, show the "Game not complete" modal
        const modal = document.getElementById('gameIncompleteModal');
        const isPuzzle = !!getPuzzleStarsKey(currentGameId);
        const hasStarted = isPuzzle && isPuzzleSessionStarted(currentGameId);
        if (modal && isPuzzle && hasStarted && !isPuzzleGameCompleted(currentGameId)) {
            pendingCloseGameId = currentGameId;
            pendingCloseOverlayElement = overlay;
            pendingCloseIframeElement = iframe;
            modal.style.display = 'flex';
            return;
        }
        
        // Non-puzzle games or already-completed puzzles: close immediately
        actuallyCloseOverlay(currentGameId, overlay, iframe);
    });
});

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
            const iframe = document.getElementById('gameIframe');
            if (pendingCloseGameId === 'defuser') {
                // Ask defuser iframe to clear any of its own localStorage keys
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage('resetDefuserLocalStorage', '*');
                }
            } else if (pendingCloseGameId === 'tally') {
                localStorage.removeItem(`tallyComplete_${todayKey}`);
                // Ask tally iframe to clear any of its own localStorage keys
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage('resetTallyLocalStorage', '*');
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
        
        // Restore close button(s) since overlay is still active
        document.querySelectorAll('.game-overlay-close').forEach(function(btn) { btn.classList.add('show'); });
        updateLogoVisibility();
    });
}

// Unified click-outside handler for game overlay
const gameOverlay = document.getElementById('gameOverlay');
if (gameOverlay) {
    gameOverlay.addEventListener('click', (e) => {
        if (e.target === gameOverlay && currentGameId) {
            const overlay = document.getElementById('gameOverlay');
            const iframe = document.getElementById('gameIframe');
            
            // For puzzle games that are not yet completed, show the "Game not complete" modal
            const modal = document.getElementById('gameIncompleteModal');
            const isPuzzle = !!getPuzzleStarsKey(currentGameId);
            const hasStarted = isPuzzle && isPuzzleSessionStarted(currentGameId);
            if (modal && isPuzzle && hasStarted && !isPuzzleGameCompleted(currentGameId)) {
                pendingCloseGameId = currentGameId;
                pendingCloseOverlayElement = overlay;
                pendingCloseIframeElement = iframe;
                modal.style.display = 'flex';
                return;
            }
            
            // Non-puzzle games or already-completed puzzles: close immediately
            actuallyCloseOverlay(currentGameId, overlay, iframe);
        }
    });
}

// Mystery Word game overlay
const mysteryWordBox = document.getElementById('mysteryWordBox');

// Beticle game overlay
const beticleBox = document.getElementById('beticleBox');

if (mysteryWordBox) {
    mysteryWordBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('mysteryWord')) {
            showCompletedBadge(mysteryWordBox);
            return;
        }
        openGame('mysteryWord');
        // Tell iframe it's now visible - call positioning win message
        setTimeout(() => {
            const iframe = document.getElementById('gameIframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage('mysteryWordShown', '*');
            }
        }, 100);
    });
}

// This code was moved up to closeButton handler


if (beticleBox) {
    beticleBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('beticle')) {
            showCompletedBadge(beticleBox);
            return;
        }
        openGame('beticle');
        // Tell iframe it's now visible
        setTimeout(() => {
            const iframe = document.getElementById('gameIframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage('beticleShown', '*');
            }
        }, 100);
    });
}


// Blackjack (Speed 21) game overlay
const speed21Box = document.getElementById('speed21Box');
if (speed21Box) {
    speed21Box.addEventListener('click', () => {
        openGame('blackjack');
    });
}


// Lost and Found game overlay
const lostAndFoundBox = document.getElementById('lostAndFoundBox');

if (lostAndFoundBox) {
    lostAndFoundBox.addEventListener('click', () => {
        openGame('lostAndFound');
    });
}

// Zoom puzzle box (Daily Puzzles)
const tilesBox = document.getElementById('tilesBox');

if (tilesBox) {
    tilesBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('zoom')) {
            showCompletedBadge(tilesBox);
            return;
        }
        openGame('zoom');
    });
}

// Shift puzzle box (Daily Puzzles)
const shiftBox = document.getElementById('shiftBox');

if (shiftBox) {
    shiftBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('shift')) {
            showCompletedBadge(shiftBox);
            return;
        }
        openGame('shift');
    });
}

// Cross game box
const crossBox = document.getElementById('crossBox');

if (crossBox) {
    crossBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('cross')) {
            showCompletedBadge(crossBox);
            return;
        }
        openGame('cross');
    });
}

// Suspect game box
const suspectBox = document.getElementById('suspectBox');

if (suspectBox) {
    suspectBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('suspect')) {
            showCompletedBadge(suspectBox);
            return;
        }
        openGame('suspect');
    });
}

// Defuser game box
const defuserBox = document.getElementById('defuserBox');

if (defuserBox) {
    defuserBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('defuser')) {
            showCompletedBadge(defuserBox);
            return;
        }
        openGame('defuser');
    });
}

// TALLY game box
const tallyBox = document.getElementById('tallyBox');

if (tallyBox) {
    tallyBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('tally')) {
            showCompletedBadge(tallyBox);
            return;
        }
        openGame('tally');
    });
}

const phrasesBox = document.getElementById('phrasesBox');

if (phrasesBox) {
    phrasesBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('phrases')) {
            showCompletedBadge(phrasesBox);
            return;
        }
        
        openGame('phrases');
    });
}

// Gold Case puzzle box (Daily Puzzles)
const goldCasePuzzleBox = document.getElementById('goldCasePuzzleBox');

if (goldCasePuzzleBox) {
    goldCasePuzzleBox.addEventListener('click', () => {
        // If already completed today, show COMPLETED badge and don't reopen
        if (isPuzzleGameCompleted('goldCase')) {
            showCompletedBadge(goldCasePuzzleBox);
            return;
        }
        
        openGame('goldCase');
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
        openGame('bonusSpin');
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

// Rivals section "you" star count = today's daily total (earned today), not spendable balance
function updateRivalsYouStarCount() {
    const dailyStars = getDailyStars();
    const vsRow = document.querySelector(".challengers-vs-row");
    const firstCard = vsRow ? vsRow.querySelector(".challenger-card") : null;
    const challengerCount = firstCard ? firstCard.querySelector(".challenger-star-count") : null;
    if (challengerCount) challengerCount.textContent = String(dailyStars);
    const rivalStarsEl = document.querySelector('.rival-profile:first-child .rival-stars');
    if (rivalStarsEl) {
        const starIcon = rivalStarsEl.querySelector('.star-icon');
        if (starIcon) {
            const textAfter = Array.from(rivalStarsEl.childNodes).find(function(n) { return n.nodeType === 3; });
            if (textAfter) textAfter.textContent = textAfter.textContent.replace(/x\s*\d+/, ' x ' + dailyStars);
            else rivalStarsEl.appendChild(document.createTextNode(' x ' + dailyStars));
        } else rivalStarsEl.innerHTML = '<span class="star-icon" style="color:#FF8C42;">★</span> x ' + dailyStars;
    }
}
window.updateRivalsYouStarCount = updateRivalsYouStarCount;

// Reset all data function (called by Q key and reset button)
function resetAllData() {
    // Clear ALL localStorage variables
    console.log('[Reset] Clearing all localStorage data...');
    localStorage.clear();
    
    console.log('[Reset] All data cleared, reloading page...');
    
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
            openGame('match3');
        });
    }
    
    // Add practice game button handler for match3 game
    const practiceButton = document.querySelector('.boost-practice-button');
    if (practiceButton) {
        practiceButton.addEventListener('click', () => {
            openGame('match3', { practice: 'true' });
        });
    }
});

// Expose reset function globally for Q key handler
window.resetAllData = resetAllData;

// Online indicator: random number 120–140 (all instances)
document.addEventListener('DOMContentLoaded', () => {
    const n = 120 + Math.floor(Math.random() * 21);
    document.querySelectorAll('.online-count-num').forEach(el => { el.textContent = n; });
});


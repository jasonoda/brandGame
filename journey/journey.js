// Helper functions for journey progress
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Get current journey level (1-10)
function getJourneyLevel() {
    return parseInt(localStorage.getItem('journeyLevel') || '1');
}

// Set journey level
function setJourneyLevel(level) {
    localStorage.setItem('journeyLevel', String(level));
}

// Get player position on current level (0-49)
function getPlayerPosition() {
    const level = getJourneyLevel();
    return parseInt(localStorage.getItem(`journeyPosition_level${level}`) || '0');
}

// Set player position
function setPlayerPosition(position) {
    const level = getJourneyLevel();
    localStorage.setItem(`journeyPosition_level${level}`, String(position));
}

// Coin inventory functions - only gold coins now
function getCoins() {
    return parseInt(localStorage.getItem('goldCoins') || '0');
}

function addCoin() {
    const current = getCoins();
    localStorage.setItem('goldCoins', String(current + 1));
    updateCoinDisplays();
}

function updateCoinDisplays() {
    // Update all coin displays across the site
    const goldCount = getCoins();
    
    // Update wallet page
    const walletGold = document.getElementById('gold-coin-count');
    if (walletGold) walletGold.textContent = goldCount;
    
    // Update sweeps page
    const sweepsGold = document.getElementById('sweeps-gold-coin-count');
    if (sweepsGold) sweepsGold.textContent = goldCount;
}

// Make globally accessible
window.updateCoinDisplays = updateCoinDisplays;

function getMoveStars() {
    const todayKey = getTodayKey();
    const usableKey = `usableStars_${todayKey}`;
    const legacyKey = `moveStars_${todayKey}`;
    const val = localStorage.getItem(usableKey);
    const legacy = localStorage.getItem(legacyKey);
    const parsed = parseInt(val ?? legacy ?? '0');
    const result = isNaN(parsed) ? 0 : parsed;
    if (result > 0 && !val && !legacy) {
        console.warn('[Journey] getMoveStars returning non-zero value but no localStorage found:', result);
    }
    return result;
}

function setMoveStars(amount) {
    const todayKey = getTodayKey();
    const usableKey = `usableStars_${todayKey}`;
    const safe = Math.max(0, amount);
    localStorage.setItem(usableKey, String(safe));
    updateMoveStarsDisplay();
}

function addMoveStars(amount) {
    if (amount <= 0) {
        console.warn('[Journey] addMoveStars called with non-positive amount:', amount);
        return;
    }
    const current = getMoveStars();
    console.log('[Journey] addMoveStars: current=', current, 'amount=', amount, 'new total=', current + amount);
    setMoveStars(current + amount);
}

function removeMoveStars(amount) {
    const current = getMoveStars();
    const next = Math.max(0, current - amount);
    setMoveStars(next);
    return next >= 0;
}

function updateMoveStarsDisplay() {
    const moveStars = getMoveStars();
    const displayElement = document.querySelector('.journey-star-count');
    const headerStars = document.querySelector('.star-count');
    if (displayElement) displayElement.textContent = moveStars;
    if (headerStars) headerStars.textContent = 'x ' + moveStars;
}

// Make updateMoveStarsDisplay globally accessible
window.updateMoveStarsDisplay = updateMoveStarsDisplay;

// Helper function to check if a game has been played today
function hasGameBeenPlayedToday(gameId) {
    const todayKey = getTodayKey();
    const playedGames = JSON.parse(localStorage.getItem(`playedGames_${todayKey}`) || '[]');
    return playedGames.includes(gameId);
}

// Helper function to mark a game as played today
function markGameAsPlayedToday(gameId) {
    const todayKey = getTodayKey();
    const playedGames = JSON.parse(localStorage.getItem(`playedGames_${todayKey}`) || '[]');
    if (!playedGames.includes(gameId)) {
        playedGames.push(gameId);
        localStorage.setItem(`playedGames_${todayKey}`, JSON.stringify(playedGames));
        return true; // Game was not played before
    }
    return false; // Game was already played
}

// Global function for games to award stars and games played
window.awardStars = function(amount, gameId) {
    console.log('[Journey] awardStars called: amount=', amount, 'gameId=', gameId, 'stack:', new Error().stack);
    // Add regular stars
    const currentStars = parseInt(localStorage.getItem('totalStars') || '0');
    localStorage.setItem('totalStars', String(currentStars + amount));
    
    // Add to usable stars (move stars) - equal to stars earned
    addMoveStars(amount);
    
    // Add to games played: 1 point per game, only once per game
    if (gameId) {
        const wasNewGame = markGameAsPlayedToday(gameId);
        if (wasNewGame) {
            const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
            setGamesPlayed(gamesPlayed + 1);
        }
    } else {
        // Fallback: if no gameId provided, add amount (for backwards compatibility)
        const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
        setGamesPlayed(gamesPlayed + amount);
    }
    
    // Update star counter in header to show usable stars
    updateMoveStarsDisplay();
};

// Expose helper function for games to check if they've been played
window.hasGameBeenPlayedToday = hasGameBeenPlayedToday;
window.markGameAsPlayedToday = markGameAsPlayedToday;

// Expose usable stars helpers
window.getUsableStars = getMoveStars;
window.setUsableStars = setMoveStars;
window.addUsableStars = addMoveStars;

// Games played helper functions
function getGamesPlayed() {
    return parseInt(localStorage.getItem('gamesPlayed') || '0');
}

function setGamesPlayed(amount) {
    localStorage.setItem('gamesPlayed', String(Math.max(0, amount)));
}

function subtractGamesPlayed(amount) {
    const current = getGamesPlayed();
    setGamesPlayed(current - amount);
    return getGamesPlayed();
}
window.removeUsableStars = removeMoveStars;

// Level data - each array represents a level with 50 platforms
// Each number represents what's on that platform: 0 = empty, 1 = gold coin
const levels = [
    // Level 1
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    // Level 2
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // Level 3
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // Level 4
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // Level 5
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // Level 6
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // Level 7
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // Level 8
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // Level 9
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // Level 10
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
];

// Create platforms in zig-zag pattern
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.platforms-container');
    if (!container) return;
    
    // Initialize container transform
    container.style.transform = 'translateX(-50%) translateY(0px)';
    
    console.log('[Journey] DOMContentLoaded - initializing...');
    
    // Get current level and player position
    const currentLevel = getJourneyLevel();
    const savedPosition = getPlayerPosition();
    console.log('[Journey] Current level:', currentLevel);
    console.log('[Journey] Saved position:', savedPosition);
    
    // Get level data (levels array is 0-indexed, but level numbers are 1-10)
    const levelData = levels[currentLevel - 1] || levels[0];

    // Platform width variable
    const platformWidth = 90;
    
    // Platform color (hex)
    const platformColor = '#4ECDC4'; // Bluish-green color
    
    // Middle of the 400px container
    let xx = 200;
    const yy = 25; // Vertical spacing between rows
    const step = 360 / 7; // Horizontal step size (approximately 57.14)
    const threshold = 300; // Upper threshold
    const negativeThreshold = 100; // Lower threshold
    
    const threshold2 = 300; // Upper threshold
    const negativeThreshold2 = 100; // Lower threshold
    let direction = 1; // 1 for adding, -1 for subtracting
    let currentY = window.innerHeight - 60 - 120; // Start from bottom
    
    const totalPlatforms = 50;
    let platformsInRow = 0;
    const platformsPerRow = 7;
    let turns = 0;
    
    // Array to store all platforms
    const platforms = [];

    for (let i = 0; i < totalPlatforms; i++) {
        // Create platform wrapper for color tinting
        const platformWrapper = document.createElement('div');
        platformWrapper.style.position = 'absolute';
        platformWrapper.style.left = xx + 'px';
        platformWrapper.style.top = currentY + 'px';
        platformWrapper.style.width = platformWidth + 'px';
        platformWrapper.style.height = platformWidth + 'px';
        platformWrapper.style.transform = 'translateX(-50%)';
        platformWrapper.style.backgroundColor = platformColor;
        platformWrapper.style.maskImage = 'url(src/img/journey/plat.svg)';
        platformWrapper.style.maskSize = 'contain';
        platformWrapper.style.maskRepeat = 'no-repeat';
        platformWrapper.style.maskPosition = 'center';
        platformWrapper.style.webkitMaskImage = 'url(src/img/journey/plat.svg)';
        platformWrapper.style.webkitMaskSize = 'contain';
        platformWrapper.style.webkitMaskRepeat = 'no-repeat';
        platformWrapper.style.webkitMaskPosition = 'center';
        
        container.appendChild(platformWrapper);
        
        // Add platform to array
        platforms.push(platformWrapper);
        
        platformsInRow++;
        currentY -= yy;
        
            if (direction === 1) {
                xx += step;
                // Check if we've hit the upper threshold
                if (xx >= threshold) {
                    direction = -1;
                    turns+=1;
                }
            } else {
                xx -= step;
                // Check if we've hit the lower threshold
                if (xx <= negativeThreshold) {
                    direction = 1;
                    turns+=1;
                }
            }
    }
    
    // Create player container div
    const player = document.createElement('div');
    player.style.position = 'absolute';
    player.style.width = '60px';
    player.style.height = '60px';
    player.style.transform = 'translateX(-47%)';
    player.style.pointerEvents = 'none';
    // Debug border for container
    // player.style.border = '1px solid red';
    
    // Create level progress display at top of page
    const levelProgress = document.createElement('div');
    levelProgress.className = 'journey-level-progress';
    levelProgress.style.position = 'fixed';
    levelProgress.style.left = '50%';
    levelProgress.style.top = '70px';
    levelProgress.style.transform = 'translateX(-50%)';
        levelProgress.style.backgroundColor = '#283f7e';
    levelProgress.style.color = 'white';
    levelProgress.style.fontFamily = "'Nunito', 'Helvetica Neue', sans-serif";
    levelProgress.style.fontSize = '12px';
    levelProgress.style.fontWeight = '700';
    levelProgress.style.textAlign = 'center';
    levelProgress.style.whiteSpace = 'nowrap';
    levelProgress.style.pointerEvents = 'none';
    levelProgress.style.padding = '4px 10px';
    levelProgress.style.borderRadius = '20px';
    levelProgress.style.zIndex = '10002';
    
    // Function to update level progress display
    function updateLevelProgress() {
        const level = getJourneyLevel();
        const position = getPlayerPosition();
        levelProgress.textContent = `LEVEL: ${level} - ${position + 1}`;
    }
    
    // Update progress display initially
    updateLevelProgress();
    
    // Add progress display to journey page
    const journeyPage = document.getElementById('journey-page');
    if (journeyPage) {
        journeyPage.appendChild(levelProgress);
    }

    // Create shadow div (behind the player, at the feet)
    const shadow = document.createElement('div');
    shadow.style.position = 'absolute';
    shadow.style.left = '50%';
    shadow.style.bottom = '28px';
    shadow.style.transform = 'translateX(-50%)';
    shadow.style.width = '55px';
    shadow.style.height = '20px';
    shadow.style.background = 'radial-gradient(ellipse at center, rgba(0,0,0,.3) 0%, rgba(0,0,0,0) 70%)';
    // shadow.style.filter = 'blur(2px)';
    shadow.style.opacity = '0.8';
    // Debug border for shadow
    // shadow.style.border = '1px solid green';

    // Create inner player div that holds the image (above the shadow)
    const innerPlayer = document.createElement('div');
    innerPlayer.style.position = 'absolute';
    innerPlayer.style.left = '0';
    innerPlayer.style.bottom = '-1px'; // sit just above the 35px shadow
    innerPlayer.style.width = '100%';
    innerPlayer.style.height = '60px';
    innerPlayer.style.transform = 'translateX(-3px)';
    // innerPlayer.style.borderRight = '13px';
    // Debug border for inner player
    // innerPlayer.style.border = '1px solid blue';
    innerPlayer.style.backgroundImage = 'url(\"journey/player.png\")';
    innerPlayer.style.backgroundSize = 'cover';
    innerPlayer.style.backgroundPosition = 'center';
    innerPlayer.style.backgroundRepeat = 'no-repeat';

    // Assemble player structure
    player.appendChild(shadow);
    player.appendChild(innerPlayer);
    
    // Function to create a coin on a platform - only gold coins now
    function createCoin(platformIndex) {
        if (platformIndex < 0 || platformIndex >= platforms.length) return;
        
        const platform = platforms[platformIndex];
        const platformLeft = parseFloat(platform.style.left);
        const platformTop = parseFloat(platform.style.top);
        
        // Create coin container
        const coinContainer = document.createElement('div');
        coinContainer.className = 'journey-coin';
        coinContainer.style.position = 'absolute';
        coinContainer.style.width = '60px';
        coinContainer.style.height = '60px';
        coinContainer.style.left = platformLeft + 'px';
        coinContainer.style.top = platformTop + 'px';
        coinContainer.style.transform = 'translateX(-50%)';
        coinContainer.style.pointerEvents = 'none';
        // coinContainer.style.border = '1px solid blue';
        
        // Create shadow
        const coinShadow = document.createElement('div');
        coinShadow.style.position = 'absolute';
        coinShadow.style.left = '50%';
        coinShadow.style.bottom = '32px';
        coinShadow.style.transform = 'translateX(-50%)';
        coinShadow.style.width = '45px';
        coinShadow.style.height = '15px';
        coinShadow.style.background = 'radial-gradient(ellipse at center, rgba(0,0,0,.3) 0%, rgba(0,0,0,0) 70%)';
        coinShadow.style.opacity = '0.8';
        // coinShadow.style.border = '1px solid red';
        
        // Create coin graphic
        const coinGraphic = document.createElement('div');
        coinGraphic.style.position = 'absolute';
        coinGraphic.style.left = '12px';
        coinGraphic.style.bottom = '24px';
        coinGraphic.style.transform = 'translateY(-50%)';
        coinGraphic.style.width = '40px';
        coinGraphic.style.height = '40px';
        coinGraphic.style.display = 'flex';
        coinGraphic.style.alignItems = 'center';
        coinGraphic.style.justifyContent = 'center';
        coinGraphic.style.borderRadius = '6px';
        coinGraphic.style.background = 'linear-gradient(to bottom, #df2b51, #c82a48)';
        coinGraphic.style.border = '3px solid #ffffff';
        coinGraphic.style.boxShadow = '0 4px 10px rgba(0,0,0,0.35)';
        coinGraphic.style.color = '#ffffff';
        coinGraphic.style.fontFamily = 'Spectral, serif';
        coinGraphic.style.fontWeight = '800';
        coinGraphic.style.fontSize = '18px';
        coinGraphic.textContent = '?';
        
        // Assemble coin
        coinContainer.appendChild(coinShadow);
        coinContainer.appendChild(coinGraphic);
        
        // Add to container
        container.appendChild(coinContainer);
        
        return coinContainer;
    }
    
    // Array to track coin elements
    const coinElements = [];
    
    // Place coins based on level data (only for platforms player hasn't reached yet)
    levelData.forEach((coinType, index) => {
        // Only place coins on platforms ahead of player
        if (index > savedPosition && coinType > 0) {
            const coin = createCoin(index);
            coinElements[index] = coin;
        }
    });
    
    // Set initial Y transform value on the inner player (for bounce)
    innerPlayer.style.transform = 'translateY(-35px)';
    
    // Track current platform index
    let currentPlatformIndex = 0;
    
    // Track container's current Y offset
    let containerYOffset = 0;
    let targetContainerYOffset = 0;
    
    // Lerp function for smooth interpolation
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Track initial player Y position
    let initialPlayerY = 0;
    
    // Function to snap container to correct position (no lerp, no animations)
    function snapContainerPosition() {
        // Use the exact same calculation as updateContainerPosition
        const playerTop = parseFloat(player.style.top) || 0;
        // Get player Y from GSAP property (reading, not animating)
        const playerY = parseFloat(gsap.getProperty(innerPlayer, "y") || -35);
        const playerCenterY = playerTop + playerY + 125;

        // Current container position on screen
        const containerRect = container.getBoundingClientRect();
        const playerCenterScreenY = containerRect.top + playerCenterY;

        // Target screen Y is 2/3 down the viewport
        const screenHeight = window.innerHeight || 0;
        const targetScreenY = screenHeight * (2 / 3);

        // Desired delta to move container so player sits at target
        const desiredDelta = targetScreenY - playerCenterScreenY;
        
        // Calculate final position
        const finalOffset = containerYOffset + desiredDelta;
        if (isNaN(finalOffset)) {
            containerYOffset = 0;
            targetContainerYOffset = 0;
            return;
        }
        
        // Set target and current to the same value (snap, no lerp)
        targetContainerYOffset = finalOffset;
        containerYOffset = finalOffset;

        // Set position immediately (no animation - just snap)
        container.style.transform = `translateX(-50%) translateY(${finalOffset}px)`;
        
        // Set opacity to 1 immediately (no animation)
        container.style.opacity = '1';
    }
    
    // Expose snap function globally for tab switching
    window.snapJourneyContainer = snapContainerPosition;
    
    // Function to update container position based on player movement
    function updateContainerPosition() {
        // Player center in container space
        const playerTop = parseFloat(player.style.top) || 0;
        // Get player Y from GSAP property (reading, not animating)
        const playerY = parseFloat(gsap.getProperty(innerPlayer, "y") || -35);
        const playerCenterY = playerTop + playerY + 35;

        // Current container position on screen
        const containerRect = container.getBoundingClientRect();
        const playerCenterScreenY = containerRect.top + playerCenterY;

        // Target screen Y is 2/3 down the viewport
        const screenHeight = window.innerHeight || 0;
        const targetScreenY = screenHeight * (2 / 3);

        // Desired delta to move container so player sits at target
        const desiredDelta = targetScreenY - playerCenterScreenY;
        targetContainerYOffset = containerYOffset + desiredDelta;

        // Lerp towards target (faster to follow player)
        const lerpFactor = 0.08;
        containerYOffset = lerp(containerYOffset, targetContainerYOffset, lerpFactor);

        if (isNaN(containerYOffset)) containerYOffset = 0;

        container.style.transform = `translateX(-50%) translateY(${containerYOffset}px)`;
    }
    
    // Continuous animation loop
    function animateLoop() {
        updateContainerPosition();
        requestAnimationFrame(animateLoop);
    }
    
    // Function to move player to a specific platform
    // Returns true if a card was collected, false otherwise
    function movePlayerToPlatform(index) {
        if (index >= 0 && index < platforms.length) {
            const platform = platforms[index];
            const targetLeft = parseFloat(platform.style.left);
            const targetTop = parseFloat(platform.style.top);
            
            // Check if there's a coin on this platform
            const coinOnPlatform = coinElements[index];
            const coinType = levelData[index];
            
            // Create timeline for coordinated animations
            const tl = gsap.timeline();
            const totalDuration = 0.3;
            const halfDuration = totalDuration / 2;
            
            // Move position (full duration)
            tl.to(player, {
                left: targetLeft + 'px',
                top: targetTop + 'px',
                duration: totalDuration,
                ease: 'power2.out'
            });
            
            // Bounce up during first half (inner player only)
            tl.to(innerPlayer, {
                y: -50, // Bounce up at midpoint
                duration: halfDuration, // First half - going up
                ease: 'quint.out'
            }, 0); // Start at beginning
            
            // Bounce down during second half (inner player only)
            tl.to(innerPlayer, {
                y: -35, // Return to normal offset
                duration: halfDuration, // Second half - coming down
                ease: 'quint.out'
            }, halfDuration); // Start at midpoint
            
            currentPlatformIndex = index;
            
            // Update level progress display
            if (typeof updateLevelProgress === 'function') {
                updateLevelProgress();
            }
            
            // Collect coin if present
            if (coinOnPlatform && coinType > 0) {
                // Animate coin collection with timeline
                const coinGraphic = coinOnPlatform.querySelector('div:last-child');
                const coinShadow = coinOnPlatform.querySelector('div:first-child');
                
                const coinTimeline = gsap.timeline({ delay: 0.15 });
                
                // Move coin up (slower)
                coinTimeline.to(coinGraphic, {
                    y: -100,
                    duration: 0.7,
                    ease: 'expo.out'
                });
                
                // Fade shadow out during move
                coinTimeline.to(coinShadow, {
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                }, 0);
                
                // Wait 0.5 seconds at the top, then fade out
                coinTimeline.to(coinGraphic, {
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power2.in'
                });
                
                // Add coin to inventory after full animation (0.3 delay + 0.7 up + 0.5 wait + 0.75 fade = 2.25s)
                setTimeout(() => {
                    addCoin();
                    coinElements[index] = null; // Remove reference
                    
                    // Switch to prizes tab and auto-draw a card
                    const prizesTabBtn = document.querySelector('.tab-button[data-page="prizes"]');
                    if (prizesTabBtn) {
                        prizesTabBtn.click();
                        setTimeout(() => {
                            if (window.resetPrizesOverlay) {
                                window.resetPrizesOverlay();
                            } else {
                                const overlay = document.getElementById('prizes-overlay');
                                if (overlay) overlay.style.display = 'flex';
                            }
                            setTimeout(() => {
                                const drawBtn = document.getElementById('prizes-draw-button');
                                if (drawBtn) drawBtn.click();
                            }, 200);
                        }, 200);
                    }
                }, 2250);
                
                return true; // Card was collected
            }
            
            return false; // No card collected
        }
        return false;
    }
    
    // Track if initial positioning is complete
    let initialPositionComplete = false;
    
    // Position player on saved position or first platform
    if (platforms.length > 0) {
        const startPosition = Math.min(savedPosition, platforms.length - 1);
        const platform = platforms[startPosition];
        const targetLeft = parseFloat(platform.style.left);
        const targetTop = parseFloat(platform.style.top);
        
        // Set player position immediately (no animation on initial load)
        player.style.left = targetLeft + 'px';
        player.style.top = targetTop + 'px';
        innerPlayer.style.transform = 'translateY(-35px)';
        currentPlatformIndex = startPosition;
        
        console.log('[Journey] Positioned player at platform:', startPosition);
    }
    
    container.appendChild(player);
    
    // Initialize move stars display after button is in DOM
    console.log('[Journey] Button should be in DOM now, updating display...');
    setTimeout(() => {
        updateMoveStarsDisplay();
    }, 100);
    
    // Wait for layout to settle, then get initial player Y position and start loop
    requestAnimationFrame(() => {
        // Get initial player Y position
        const playerTop = parseFloat(player.style.top) || 0;
        const playerY = parseFloat(gsap.getProperty(innerPlayer, "y") || -35);
        initialPlayerY = playerTop + playerY;
        
        // Start the animation loop - it will handle positioning
        animateLoop();
    });
    
    // Track if button is active
    let isButtonActive = true;
    
    // Function to update button state based on gamesPlayed
    const updateGoButtonState = () => {
        const goButton = document.querySelector('.journey-go-button');
        if (!goButton) return;
        
        const gamesPlayed = getGamesPlayed();
        
        // Update button appearance (no opacity change, just grayscale)
        if (gamesPlayed <= 0) {
            goButton.style.cursor = 'not-allowed';
            goButton.style.filter = 'grayscale(100%)';
        } else {
            goButton.style.cursor = 'pointer';
            goButton.style.filter = 'none';
        }
        
        // Update games played display
        const gamesPlayedDisplay = document.getElementById('journey-games-played');
        if (gamesPlayedDisplay) {
            gamesPlayedDisplay.textContent = gamesPlayed;
        }
    };
    
    // Expose update function globally for tab switching
    window.updateJourneyButtonState = updateGoButtonState;
    
    // Update button state on load
    updateGoButtonState();
    
    // Go button functionality
    const goButton = document.querySelector('.journey-go-button');
    const glowDiv = document.querySelector('.journey-button-glow');
    if (goButton) {
        goButton.addEventListener('click', function() {
            // Don't do anything if button is inactive
            if (!isButtonActive) {
                console.log('[Journey] Button is inactive, ignoring click');
                return;
            }
            
            console.log('[Journey] GO button clicked');
            
            // Check if player has gamesPlayed and isn't at the end
            const gamesPlayed = getGamesPlayed();
            console.log('[Journey] Current gamesPlayed:', gamesPlayed);
            
            if (gamesPlayed <= 0) {
                console.log('[Journey] No games played, button disabled');
                return;
            }
            
            if (currentPlatformIndex < platforms.length - 1) {
                if (gamesPlayed > 0) {
                    // Disable button during movement sequence
                    isButtonActive = false;
                    goButton.style.cursor = 'not-allowed';
                    goButton.style.pointerEvents = 'none';
                    
                    // Create animation timeline for button
                    const buttonTimeline = gsap.timeline();
                    
                    // Button grows and brightens
                    buttonTimeline.to(goButton, {
                        scale: 1.15,
                        filter: 'brightness(1.3)',
                        duration: 0.25,
                        ease: 'power2.out'
                    })
                    // Button shrinks and returns to normal
                    .to(goButton, {
                        scale: 1,
                        filter: 'brightness(1)',
                        duration: 0.25,
                        ease: 'power2.in'
                    });
                    
                    // Glow div animation (starts at 0 scale, 100% opacity, grows and fades)
                    if (glowDiv) {
                        gsap.fromTo(glowDiv, 
                            {
                                scale: 0,
                                opacity: 1
                            },
                            {
                                scale: 3,
                                opacity: 0,
                                duration: 0.5,
                                ease: 'power2.out'
                            }
                        );
                    }
                    
                    // Loop through moves until gamesPlayed is 0 or a card is hit
                    let moveIndex = 0;
                    const performMove = () => {
                        const currentGamesPlayed = getGamesPlayed();
                        const isAtEnd = currentPlatformIndex >= platforms.length - 1;
                        
                        // Stop if no games left or at the end
                        if (currentGamesPlayed <= 0 || isAtEnd) {
                            isButtonActive = true;
                            goButton.style.cursor = 'pointer';
                            goButton.style.pointerEvents = 'auto';
                            updateGoButtonState();
                            console.log('[Journey] Movement sequence complete');
                            return;
                        }
                        
                        // Move to next platform
                        const nextIndex = currentPlatformIndex + 1;
                        if (nextIndex < platforms.length) {
                            // Subtract 1 from gamesPlayed
                            subtractGamesPlayed(1);
                            
                            // Save new position
                            setPlayerPosition(nextIndex);
                            
                            // Update level progress display
                            if (typeof updateLevelProgress === 'function') {
                                updateLevelProgress();
                            }
                            
                            // Move player and check if card was collected
                            const cardCollected = movePlayerToPlatform(nextIndex);
                            
                            // If card was collected, stop the sequence
                            if (cardCollected) {
                                isButtonActive = true;
                                goButton.style.cursor = 'pointer';
                                goButton.style.pointerEvents = 'auto';
                                updateGoButtonState();
                                console.log('[Journey] Card collected, stopping movement');
                                return;
                            }
                            
                            // Continue to next move after animation completes (0.3s)
                            moveIndex++;
                            setTimeout(() => {
                                // Update button state after movement animation completes
                                updateGoButtonState();
                                performMove();
                            }, 300);
                        } else {
                            // At the end
                            isButtonActive = true;
                            goButton.style.cursor = 'pointer';
                            goButton.style.pointerEvents = 'auto';
                            updateGoButtonState();
                            console.log('[Journey] At end of platforms');
                        }
                    };
                    
                    // Start the move sequence
                    performMove();
                }
                // If no games played, do nothing (no alert)
            }
            // If at the end, do nothing (no alert)
        });
    }
    
    // Keyboard controls
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowUp') {
            // Move to next platform (higher index = higher up)
            if (currentPlatformIndex < platforms.length - 1) {
                const newIndex = currentPlatformIndex + 1;
                movePlayerToPlatform(newIndex);
                setPlayerPosition(newIndex);
                // Update level progress display
                if (typeof updateLevelProgress === 'function') {
                    updateLevelProgress();
                }
            }
        } else if (event.key === 'ArrowDown') {
            // Move to previous platform (lower index = lower down)
            if (currentPlatformIndex > 0) {
                const newIndex = currentPlatformIndex - 1;
                movePlayerToPlatform(newIndex);
                setPlayerPosition(newIndex);
                // Update level progress display
                if (typeof updateLevelProgress === 'function') {
                    updateLevelProgress();
                }
            }
        } else if (event.key === 'w' || event.key === 'W') {
            // Cheat key: add 5 stars and 5 move stars
            window.awardStars(5);
            console.log('Cheat activated: +5 stars, +5 move stars');
        } else if (event.key === '9') {
            // Cheat key: add 10 gamesPlayed
            const current = getGamesPlayed();
            setGamesPlayed(current + 10);
            console.log('Cheat activated: +10 gamesPlayed');
        }
    });
});


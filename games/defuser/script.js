// Number of wires - must be divisible by 3 for even distribution
// Helper function to get number of wires for current round
function getCurrentNumWires() {
    const roundConfig = ROUNDS_CONFIG[gameState.currentRound] || ROUNDS_CONFIG[1];
    return roundConfig.numWires;
}

// Color definitions
const COLOR_PALETTES = {
    cool: [
        'rgb(12, 192, 93)',   // green
        'rgb(57, 255, 20)',   // neon green
        'rgb(61, 231, 231)',  // cyan
        'rgb(86, 117, 255)',  // blue
        'rgb(108, 31, 216)'    // purple
    ],
    warm: [
        'rgb(250, 237, 56)',   // yellow
        'orange',              // orange
        'red',                 // red
        'rgb(255, 176, 231)',      // pink
        'magenta'              // magenta
    ],
    neutral: [
        '#d3d3d3',            // light grey (was white)
        'grey',                // grey
        'black',               // black
        '#8B4513',            // brown
        '#D2B48C'             // darker beige (tan)
    ]
};

// Human-readable labels for colors by category (used in logs and tutorial)
const COLOR_LABELS = {
    cool: ['green', 'neon green', 'cyan', 'blue', 'purple'],
    warm: ['yellow', 'orange', 'red', 'pink', 'magenta'],
    neutral: ['light grey', 'grey', 'black', 'brown', 'tan']
};

// Apply colors to key boxes (only show colors being used)
function applyKeyBoxColors() {
    const keyGroups = document.querySelectorAll('.key-group');
    const colorsPerCategory = getCurrentNumWires() / 3;
    
    keyGroups.forEach((group, groupIndex) => {
        const keyBoxes = group.querySelectorAll('.key-box');
        let palette;
        
        if (groupIndex === 0) {
            palette = COLOR_PALETTES.cool.slice(0, colorsPerCategory);
        } else if (groupIndex === 1) {
            palette = COLOR_PALETTES.warm.slice(0, colorsPerCategory);
        } else if (groupIndex === 2) {
            palette = COLOR_PALETTES.neutral.slice(0, colorsPerCategory);
        }
        
        keyBoxes.forEach((box, boxIndex) => {
            if (palette && palette[boxIndex]) {
                box.style.backgroundColor = palette[boxIndex];
            } else {
                box.style.backgroundColor = 'transparent';
            }
        });
    });
}

// Get colors evenly distributed across categories based on NUM_WIRES
function getAllColors() {
    const colorsPerCategory = getCurrentNumWires() / 3; // Must be divisible by 3
    const colors = [];
    
    // Take the first colorsPerCategory colors from each category
    for (let i = 0; i < colorsPerCategory; i++) {
        if (COLOR_PALETTES.cool[i]) colors.push(COLOR_PALETTES.cool[i]);
    }
    for (let i = 0; i < colorsPerCategory; i++) {
        if (COLOR_PALETTES.warm[i]) colors.push(COLOR_PALETTES.warm[i]);
    }
    for (let i = 0; i < colorsPerCategory; i++) {
        if (COLOR_PALETTES.neutral[i]) colors.push(COLOR_PALETTES.neutral[i]);
    }
    
    return colors;
}

// Get colors for a specific category (used for bad wire selection)
function getCategoryColors(category) {
    const colorsPerCategory = getCurrentNumWires() / 3;
    return COLOR_PALETTES[category].slice(0, colorsPerCategory);
}

// Preload sounds with Howler at start
var defuserSounds = {};
if (typeof Howl !== 'undefined') {
    ['click', 'defuser_cut', 'defuser_explode'].forEach(function(name) {
        defuserSounds[name] = new Howl({ src: ['../../sounds/' + name + '.mp3'] });
    });
}

// Store wire lines for cutting detection
let wireLines = [];
let globalTopIndices = [];
let globalBottomIndices = [];
let originalWireConnections = null;
let isCutting = false;
let cutStartPos = null;
let currentCutLine = null;

function defuserGetTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

function defuserMarkStarted() {
    // Let parent page know this session has actually started
    if (window.parent) {
        window.parent.postMessage('defuserStarted', '*');
        window.parent.postMessage('puzzleStarted:defuser', '*');
    }
}

// Listen for parent asking us to reset DEFUSER-specific localStorage
window.addEventListener('message', (event) => {
    if (event.data === 'resetDefuserLocalStorage') {
        // State keys cleared by parent
    }
});

// ----- Star + progress helpers -----
function defuserGetTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function defuserGetDailyStars() {
    const todayKey = defuserGetTodayKey();
    return parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
}

function defuserAddStars(count) {
    if (!count || count <= 0) return;
    
    const todayKey = defuserGetTodayKey();
    const currentDailyStars = defuserGetDailyStars();
    const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
    
    // Update daily stars
    localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + count));
    
    // Update total stars
    localStorage.setItem('totalStars', String(currentTotalStars + count));
    
    // Award stars and games played
    if (window.parent && window.parent.awardStars) {
        window.parent.awardStars(count, 'defuser');
    } else {
        const currentGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
        localStorage.setItem('gamesPlayed', String(Math.max(0, currentGamesPlayed + 1)));
    }
    
    // Update global displays if parent page is available
    if (window.parent && window.parent.updateHeaderStarCounter) {
        window.parent.updateHeaderStarCounter();
    }
    if (window.parent && window.parent.updateWalletStars2) {
        window.parent.updateWalletStars2();
    }
    if (window.parent && window.parent.updateCalendar) {
        window.parent.updateCalendar();
    }
}

function defuserGetStarsForRoundsCompleted(roundsCompleted) {
    if (!roundsCompleted || roundsCompleted <= 0) return 0;
    if (roundsCompleted >= TOTAL_ROUNDS) return 5; // completed all rounds
    if (roundsCompleted >= TOTAL_ROUNDS - 1) return 4;
    if (roundsCompleted >= Math.ceil(TOTAL_ROUNDS * 0.6)) return 3;
    if (roundsCompleted >= Math.ceil(TOTAL_ROUNDS * 0.3)) return 2;
    // Very low completion still gets 1 star
    return 1;
}

function defuserGetStarRowHTML(starCount) {
    const total = 5;
    let html = '';
    for (let i = 0; i < total; i++) {
        const earned = i < starCount;
        const color = earned ? '#FF8C42' : '#ddd';
        html += `<span style="color:${color}; font-size:18px;">★</span>`;
    }
    return html;
}

function defuserAwardStarsForCurrentRun(didWin) {
    const todayKey = defuserGetTodayKey();
    const existing = parseInt(localStorage.getItem(`defuserStars_${todayKey}`) || '0');
    
    // Wires successfully cut.
    // Use explicit counter, and on a loss hard‑clamp to at most TOTAL_ROUNDS - 1,
    // and never exceed the last fully completed round (currentRound - 1).
    const rawCompleted = Math.max(0, gameState.wiresCutTotal || 0);
    const maxFullRounds = Math.max(0, gameState.currentRound - 1);
    const safeCompleted = Math.min(rawCompleted, maxFullRounds);
    const roundsCompleted = didWin
        ? TOTAL_ROUNDS
        : Math.min(safeCompleted, TOTAL_ROUNDS - 1);
    const isGameWon = didWin === true;
    const starsThisRun = isGameWon ? 5 : defuserGetStarsForRoundsCompleted(roundsCompleted);
    const newStars = starsThisRun <= 0 ? 0 : Math.max(existing, starsThisRun);
    const displayRounds = roundsCompleted;

    // Compute additional stats for end-of-game window
    const misses = gameState.wrongMoves || 0;
    const remaining = Math.max(0, gameState.timeRemaining || 0);
    const remMinutes = Math.floor(remaining / 60);
    const remSeconds = remaining % 60;
    const remainingStr = `${remMinutes}:${remSeconds.toString().padStart(2, '0')}`;

    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'puzzleComplete',
            gameId: 'defuser',
            stars: newStars,
            notes: [
                'WIRES CUT ' + displayRounds + ' / ' + TOTAL_ROUNDS,
                'MISSES: ' + misses,
                'TIME LEFT: ' + remainingStr
            ],
            delay: 0
        }, '*');
    }

    if (starsThisRun <= 0) return { roundsCompleted, starsEarned: 0 };
    return { roundsCompleted, starsEarned: newStars };
}

// Draw connecting lines
function drawConnectingLines(updatePositionsOnly = false) {
    const canvas = document.getElementById('linesCanvas');
    const ctx = canvas.getContext('2d');
    const middleSection = document.querySelector('.middle-section');
    
    // Set canvas size to match middle section
    const rect = middleSection.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const topBoxes = document.querySelectorAll('.top-boxes .box');
    const bottomBoxes = document.querySelectorAll('.bottom-boxes .box');
    const allColors = getAllColors();
    
    // Get positions relative to middle section
    const middleRect = middleSection.getBoundingClientRect();
    
    // If we have original connections and we're just updating positions, use them
    if (updatePositionsOnly && originalWireConnections) {
        // Save current opacities before clearing
        const opacityMap = new Map();
        wireLines.forEach(wire => {
            opacityMap.set(wire.lineIndex, wire.opacity);
        });
        
        // Clear wire lines array
        wireLines = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw with same connections but updated positions
        originalWireConnections.forEach((connection, colorIndex) => {
            const topIndex = connection.topIndex;
            const bottomIndex = connection.bottomIndex;
            const color = connection.color;
            
            const topBox = topBoxes[topIndex];
            const bottomBox = bottomBoxes[bottomIndex];
            
            // Get box positions relative to middle section
            const topBoxRect = topBox.getBoundingClientRect();
            const bottomBoxRect = bottomBox.getBoundingClientRect();
            
            const startX = topBoxRect.left + topBoxRect.width / 2 - middleRect.left;
            const startY = topBoxRect.bottom + 10 - middleRect.top;
            const endX = bottomBoxRect.left + bottomBoxRect.width / 2 - middleRect.left;
            const endY = bottomBoxRect.top - 10 - middleRect.top;
            
            // Preserve opacity from previous wire state
            const opacity = opacityMap.has(colorIndex) ? opacityMap.get(colorIndex) : 1;
            
            wireLines.push({
                color,
                startX,
                startY,
                endX,
                endY,
                lineIndex: colorIndex,
                opacity: opacity,
                topIndex: topIndex,
                bottomIndex: bottomIndex,
                category: connection.category,
                indexInCategory: connection.indexInCategory,
                isDotted: connection.isDotted,
                isCurved: connection.isCurved || false,
                topBoxColor: connection.topBoxColor,
                bottomBoxColor: connection.bottomBoxColor,
                matchesRules: connection.matchesRules,
                isCorrect: connection.isCorrect,
                startShape: connection.startShape,
                endShape: connection.endShape
            });
            
            // Draw the line with rounded edges (colored, dotted if needed)
            drawWireLine(ctx, startX, startY, endX, endY, color, opacity, connection.isDotted, connection.isCurved || false);
            
            // Don't update box colors here - they should only be set during initial drawing
            // Box colors are managed separately and shouldn't change during position updates
            
            // Draw endpoint shapes at start and end points (only if visible)
            if (opacity > 0) {
                const startShape = connection.startShape || 'circle';
                const endShape = connection.endShape || 'circle';
                drawEndpointShape(ctx, startX, startY, startShape, color);
                drawEndpointShape(ctx, endX, endY, endShape, color);
            }
        });
        
        // Re-apply circuit colors to boxes based on each connection's circuitColor
        originalWireConnections.forEach((connection) => {
            const topIndex = connection.topIndex;
            const bottomIndex = connection.bottomIndex;
            const topBox = topBoxes[topIndex];
            const bottomBox = bottomBoxes[bottomIndex];
            if (!topBox || !bottomBox) return;

            let topBoxColor, bottomBoxColor;
            if (connection.circuitColor === 'dark') {
                topBoxColor = 'linear-gradient(to bottom, #555555, #333333)';
                bottomBoxColor = 'linear-gradient(to bottom, #555555, #333333)';
            } else if (connection.circuitColor === 'light') {
                topBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
                bottomBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
            } else if (connection.circuitColor === 'opposite') {
                topBoxColor = 'linear-gradient(to bottom, #555555, #333333)';
                bottomBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
            } else {
                topBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
                bottomBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
            }

            topBox.style.background = topBoxColor;
            bottomBox.style.background = bottomBoxColor;
        });
        
        // Redraw cut line if active
        if (currentCutLine) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.globalAlpha = currentCutLine.opacity || 1;
            ctx.beginPath();
            ctx.moveTo(currentCutLine.startX, currentCutLine.startY);
            ctx.lineTo(currentCutLine.endX, currentCutLine.endY);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        return; // Don't proceed with creating new connections
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create arrays of indices and shuffle them (only on initial creation)
    const topIndices = Array.from({ length: topBoxes.length }, (_, i) => i);
    const bottomIndices = Array.from({ length: bottomBoxes.length }, (_, i) => i);
    
    // Shuffle both arrays
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    shuffleArray(topIndices);
    shuffleArray(bottomIndices);
    
    // Store globally for number assignment
    globalTopIndices = [...topIndices];
    globalBottomIndices = [...bottomIndices];
    
    // Store original connections
    originalWireConnections = [];
    
    // Clear wire lines array
    wireLines = [];
    
    // Use wireAssignments if available, otherwise use default behavior
    if (!gameState.wireAssignments || gameState.wireAssignments.length === 0) {
        // Fallback: create default assignments
        assignWireProperties();
    }
    
    const wireAssignments = gameState.wireAssignments;

    // Determine how many wires we can safely draw based on available boxes
    const maxByBoxes = Math.min(topIndices.length, bottomIndices.length, topBoxes.length, bottomBoxes.length);
    const maxByAssignments = wireAssignments.length;
    const wireCount = Math.min(maxByBoxes, maxByAssignments, getCurrentNumWires());

    // Draw a line for each wire assignment, clamped to safe wireCount
    for (let wireIndex = 0; wireIndex < wireCount; wireIndex++) {
        const assignment = wireAssignments[wireIndex];
        // Use shuffled indices to ensure one-to-one mapping
        const topIndex = topIndices[wireIndex];
        const bottomIndex = bottomIndices[wireIndex];
        
        // Determine box colors based on circuitColor rule
        let topBoxColor, bottomBoxColor;
        if (assignment.circuitColor === 'dark') {
            topBoxColor = 'linear-gradient(to bottom, #555555, #333333)';
            bottomBoxColor = 'linear-gradient(to bottom, #555555, #333333)';
        } else if (assignment.circuitColor === 'light') {
            topBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
            bottomBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
        } else if (assignment.circuitColor === 'opposite') {
            topBoxColor = 'linear-gradient(to bottom, #555555, #333333)';
            bottomBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
        } else {
            // Default
            topBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
            bottomBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
        }
        
        // Helper to choose shapes for endpoints, respecting shapeKey ('same' | 'different')
        const SHAPES = ['circle', 'square', 'triangle'];
        function getRandomShape() {
            const idx = Math.floor(Math.random() * SHAPES.length);
            return SHAPES[idx];
        }
        function getRandomDifferentShape(baseShape) {
            const otherShapes = SHAPES.filter(s => s !== baseShape);
            const idx = Math.floor(Math.random() * otherShapes.length);
            return otherShapes[idx];
        }

        const shouldBeSameShape = assignment.shapeKey === 'same';
        const startShape = getRandomShape();
        const endShape = shouldBeSameShape ? startShape : getRandomDifferentShape(startShape);

        // Store original connection (include shapes so debug can use reliable data)
        originalWireConnections.push({
            topIndex,
            bottomIndex,
            color: assignment.color,
            category: assignment.category,
            indexInCategory: assignment.indexInCategory,
            isDotted: assignment.isDotted,
            isCurved: assignment.isCurved || false,
            topBoxColor: topBoxColor,
            bottomBoxColor: bottomBoxColor,
            circuitColor: assignment.circuitColor,
            matchesRules: assignment.matchesRules,
            matchRules: assignment.matchRules || [],
            excludeRules: assignment.excludeRules || [],
            startShape,
            endShape
        });
        
        const topBox = topBoxes[topIndex];
        const bottomBox = bottomBoxes[bottomIndex];
        
        // Safety check: ensure boxes exist before accessing properties
        if (!topBox || !bottomBox) {
            console.error(`Error: Missing box at index ${wireIndex}. topBox: ${!!topBox}, bottomBox: ${!!bottomBox}, topIndex: ${topIndex}, bottomIndex: ${bottomIndex}, total topBoxes: ${topBoxes.length}, total bottomBoxes: ${bottomBoxes.length}, wireAssignments: ${wireAssignments.length}`);
            return; // Skip this wire if boxes don't exist
        }
        
        // Color the boxes based on circuitColor rule
        topBox.style.background = topBoxColor;
        bottomBox.style.background = bottomBoxColor;
        
        // Get box positions relative to middle section
        const topBoxRect = topBox.getBoundingClientRect();
        const bottomBoxRect = bottomBox.getBoundingClientRect();
        
        const startX = topBoxRect.left + topBoxRect.width / 2 - middleRect.left;
        const startY = topBoxRect.bottom + 18 - middleRect.top; // 18px below bottom of top box (extra space for shape)
        const endX = bottomBoxRect.left + bottomBoxRect.width / 2 - middleRect.left;
        const endY = bottomBoxRect.top - 18 - middleRect.top; // 18px above top of bottom box (extra space for shape)
        
        // Store wire line data for intersection detection
        wireLines.push({
            color: assignment.color,
            startX,
            startY,
            endX,
            endY,
            lineIndex: wireIndex,
            opacity: 1,
            topIndex: topIndex,
            bottomIndex: bottomIndex,
            category: assignment.category,
            indexInCategory: assignment.indexInCategory,
            isDotted: assignment.isDotted,
            isCurved: assignment.isCurved || false,
            topBoxColor: topBoxColor,
            bottomBoxColor: bottomBoxColor,
            matchesRules: assignment.matchesRules,
            isCorrect: assignment.isCorrect,
            startShape,
            endShape
        });
        
        // Draw the line with rounded edges (colored, dotted if needed)
        drawWireLine(ctx, startX, startY, endX, endY, assignment.color, 1, assignment.isDotted, assignment.isCurved || false);

        // Draw shapes at start and end points, matching the wire color
        drawEndpointShape(ctx, startX, startY, startShape, assignment.color);
        drawEndpointShape(ctx, endX, endY, endShape, assignment.color);
    }
    
    // Keep top boxes grey (they're already grey from CSS)
    
    // Note: logWireAssignments() is now called after assignNumbers() in initializeGame()
    // Don't call it here since numbers haven't been assigned yet
}

// Log wire assignments in left-to-right order by top connection
function logWireAssignments() {
    if (!gameState.wireAssignments || gameState.wireAssignments.length === 0) return;
    if (!originalWireConnections || originalWireConnections.length === 0) return;
    
    const rules = gameState.selectedRules;
    const totalRules = rules.length; // Get actual total rule count
    
    // Helper to check if wire matches a rule (mirror main rule logic)
    function matchesRuleForDebug(wireProps, rule) {
        if (rule.category === 'color') {
            return wireProps.category === rule.key;
        } else if (rule.category === 'lineStyle') {
            return wireProps.isDotted === (rule.key === 'dotted');
        } else if (rule.category === 'circuits') {
            return wireProps.circuitColor === rule.key;
        } else if (rule.category === 'curvature') {
            return wireProps.isCurved === (rule.key === 'curved');
        } else if (rule.category === 'shape') {
            return wireProps.shapeKey === rule.key;
        }
        // numbers handled separately
        return false;
    }
    
    // Helper to count matches
    function countMatches(wireProps) {
        let count = 0;
        rules.forEach(rule => {
            if (rule.category !== 'numbers' && matchesRuleForDebug(wireProps, rule)) {
                count++;
            }
        });
        return count;
    }
    
    // Create array with topIndex from connections
    const wiresWithTopIndex = gameState.wireAssignments.map(wire => {
        // Try to find connection by matching all properties
        const connection = originalWireConnections.find(c => {
            // Match by comparing wire properties
            const colorMatch = c.color === wire.color;
            const categoryMatch = c.category === wire.category;
            const indexMatch = c.indexInCategory === wire.indexInCategory;
            const dottedMatch = c.isDotted === wire.isDotted;
            const circuitMatch = c.circuitColor === wire.circuitColor;
            
            return colorMatch && categoryMatch && indexMatch && dottedMatch && circuitMatch;
        });
        return {
            ...wire,
            topIndex: connection ? connection.topIndex : 999
        };
    });
    
    // Sort by topIndex (left to right)
    wiresWithTopIndex.sort((a, b) => a.topIndex - b.topIndex);
    
    // Helper function to determine actual category from color
    // Handles RGB strings and named colors, with normalization
    function getActualCategoryFromColor(colorValue) {
        // Normalize color value (remove spaces, lowercase)
        const normalized = (colorValue || '').toString().trim().toLowerCase();
        
        // Check cool colors
        for (let i = 0; i < COLOR_PALETTES.cool.length; i++) {
            const paletteColor = COLOR_PALETTES.cool[i].toString().trim().toLowerCase();
            if (paletteColor === normalized || 
                paletteColor === colorValue || 
                COLOR_PALETTES.cool[i] === colorValue) {
                return 'cool';
            }
        }
        
        // Check warm colors
        for (let i = 0; i < COLOR_PALETTES.warm.length; i++) {
            const paletteColor = COLOR_PALETTES.warm[i].toString().trim().toLowerCase();
            if (paletteColor === normalized || 
                paletteColor === colorValue || 
                COLOR_PALETTES.warm[i] === colorValue) {
                return 'warm';
            }
        }
        
        // Check neutral colors
        for (let i = 0; i < COLOR_PALETTES.neutral.length; i++) {
            const paletteColor = COLOR_PALETTES.neutral[i].toString().trim().toLowerCase();
            if (paletteColor === normalized || 
                paletteColor === colorValue || 
                COLOR_PALETTES.neutral[i] === colorValue) {
                return 'neutral';
            }
        }
        
        console.warn(`Could not determine category for color: ${colorValue}`);
        return null;
    }
    
    // Get all available colors to find labels
    const colorsPerCategory = getCurrentNumWires() / 3;
    const allAvailableColors = [];
    for (let i = 0; i < colorsPerCategory; i++) {
        allAvailableColors.push({ 
            color: COLOR_PALETTES.cool[i], 
            label: COLOR_LABELS.cool[i] || `cool-${i}`,
            category: 'cool'
        });
        allAvailableColors.push({ 
            color: COLOR_PALETTES.warm[i], 
            label: COLOR_LABELS.warm[i] || `warm-${i}`,
            category: 'warm'
        });
        allAvailableColors.push({ 
            color: COLOR_PALETTES.neutral[i], 
            label: COLOR_LABELS.neutral[i] || `neutral-${i}`,
            category: 'neutral'
        });
    }
    
    // Helper to find color label with flexible matching
    function findColorLabel(colorValue) {
        // First try exact match
        let found = allAvailableColors.find(c => c.color === colorValue);
        if (found) return found.label;
        
        // Try normalized match
        const normalized = (colorValue || '').toString().trim().toLowerCase();
        found = allAvailableColors.find(c => {
            const cNormalized = (c.color || '').toString().trim().toLowerCase();
            return cNormalized === normalized;
        });
        if (found) return found.label;
        
        // Fallback to actual category lookup
        const category = getActualCategoryFromColor(colorValue);
        if (category) {
            // Find by matching category and position
            const categoryColors = category === 'cool' ? COLOR_PALETTES.cool : 
                                 category === 'warm' ? COLOR_PALETTES.warm : 
                                 COLOR_PALETTES.neutral;
            const labels = category === 'cool' ? COLOR_LABELS.cool :
                          category === 'warm' ? COLOR_LABELS.warm :
                          COLOR_LABELS.neutral;
            const index = categoryColors.findIndex(c => {
                const cNorm = (c || '').toString().trim().toLowerCase();
                const vNorm = (colorValue || '').toString().trim().toLowerCase();
                return cNorm === vNorm || c === colorValue;
            });
            if (index >= 0 && labels[index]) {
                return labels[index];
            }
        }
        
        return colorValue;
    }
    
    console.log('\n=== RULES THIS ROUND ===');
    rules.forEach((rule, idx) => {
        console.log(`  Rule ${idx + 1}: [${rule.category}] ${rule.text} (key=${rule.key})`);
    });

    console.log('\n=== WIRES (Left to Right) ===');
    wiresWithTopIndex.forEach((wire, wireIndex) => {
        // Get actual category from color (don't trust stored category)
        const actualCategory = getActualCategoryFromColor(wire.color);
        
        // Find the connection to get topIndex and bottomIndex
        const connection = originalWireConnections.find(c => {
            const colorMatch = c.color === wire.color;
            const categoryMatch = c.category === wire.category;
            const indexMatch = c.indexInCategory === wire.indexInCategory;
            const dottedMatch = c.isDotted === wire.isDotted;
            const circuitMatch = c.circuitColor === wire.circuitColor;
            const curvatureMatch = (c.isCurved || false) === (wire.isCurved || false);
            return colorMatch && categoryMatch && indexMatch && dottedMatch && circuitMatch && curvatureMatch;
        });
        
        // Get numbers from DOM boxes
        let numberRelationship = 'unknown';
        if (connection) {
            const topBoxes = document.querySelectorAll('.top-boxes .box');
            const bottomBoxes = document.querySelectorAll('.bottom-boxes .box');
            if (topBoxes[connection.topIndex] && bottomBoxes[connection.bottomIndex]) {
                const topNumText = topBoxes[connection.topIndex].textContent.trim();
                const bottomNumText = bottomBoxes[connection.bottomIndex].textContent.trim();
                const topNum = parseInt(topNumText);
                const bottomNum = parseInt(bottomNumText);
                
                // Check if we got valid numbers
                if (!isNaN(topNum) && !isNaN(bottomNum)) {
                    const sum = topNum + bottomNum;
                    
                    if (topNum === bottomNum) {
                        numberRelationship = 'same';
                    } else if (sum % 2 === 0) {
                        numberRelationship = 'even';
                    } else {
                        numberRelationship = 'odd';
                    }
                } else {
                    // Numbers not set yet, try to determine from default
                    numberRelationship = 'unknown';
                }
            }
        }
        
        // Helper function to get marker for a property
        function getPropertyMarker(category, wireValue) {
            const rule = rules.find(r => r.category === category);
            if (!rule) {
                return '(-)'; // No rule for this category
            }
            
            let matches = false;
            if (category === 'color') {
                matches = wireValue === rule.key;
            } else if (category === 'lineStyle') {
                // wireValue is boolean, rule.key is 'dotted' or 'solid'
                matches = wireValue === (rule.key === 'dotted');
            } else if (category === 'circuits') {
                matches = wireValue === rule.key;
            } else if (category === 'curvature') {
                // wireValue is boolean, rule.key is 'curved' or 'straight'
                matches = wireValue === (rule.key === 'curved');
            } else if (category === 'numbers') {
                matches = wireValue === rule.key;
            } else if (category === 'shape') {
                // wireValue is 'same' or 'different'
                matches = wireValue === rule.key;
            }
            
            if (rule.isFake) {
                return matches ? '(x)' : '(f)';
            } else {
                return matches ? '(t)' : '(f)';
            }
        }
        
        // Get markers for each property
        const colorMarker = getPropertyMarker('color', actualCategory);
        const lineStyleMarker = getPropertyMarker('lineStyle', wire.isDotted);
        const curvatureMarker = getPropertyMarker('curvature', wire.isCurved || false);
        const numbersMarker = getPropertyMarker('numbers', numberRelationship);
        const circuitsMarker = getPropertyMarker('circuits', wire.circuitColor);

        // Shape debug: are the endpoint shapes the same or different?
        // Use connection data so order is reliable.
        let shapeRelationship = 'unknown';
        let shapeMarker = '(-)';
        if (connection && connection.startShape && connection.endShape) {
            const isSameShape = (connection.startShape === connection.endShape);
            shapeRelationship = isSameShape ? 'same' : 'different';
            shapeMarker = getPropertyMarker('shape', shapeRelationship);
        }

        // Count (t)'s and (x)'s for match count
        // x/3 tally should be all the (t)'s plus the (x) if matching
        let matchCount = 0;
        if (colorMarker === '(t)' || colorMarker === '(x)') matchCount++;
        if (lineStyleMarker === '(t)' || lineStyleMarker === '(x)') matchCount++;
        if (curvatureMarker === '(t)' || curvatureMarker === '(x)') matchCount++;
        if (numbersMarker === '(t)' || numbersMarker === '(x)') matchCount++;
        if (circuitsMarker === '(t)' || circuitsMarker === '(x)') matchCount++;
        if (shapeMarker === '(t)' || shapeMarker === '(x)') matchCount++;
        
        // Cap at total rules
        matchCount = Math.min(matchCount, totalRules);
        
        // Format properties
        const colorLabel = findColorLabel(wire.color);
        const correctStatus = wire.isCorrect ? '[CORRECT]' : '';
        const dottedStatus = wire.isDotted ? 'dotted' : 'solid';
        const circuitStatus = wire.circuitColor || 'unknown';
        
        // Format: COLOR [CORRECT] - X/totalRules - color category(t/f/-/x), dotted/solid(t/f/-/x),
        // straight/curved(t/f/-/x), even/odd/same(t/f/-/x), circuit light/dark/opposite(t/f/-/x),
        // shape same/different(t/f)
        const curvatureStatus = (wire.isCurved || false) ? 'curved' : 'straight';
        const statusPart = correctStatus ? ` ${correctStatus}` : '';
        const shapeStatusLabel = shapeRelationship !== 'unknown' ? `shape ${shapeRelationship}` : 'shape';
        console.log(`${colorLabel.toUpperCase()}${statusPart} - ${matchCount}/${totalRules} - ${actualCategory}${colorMarker}, ${dottedStatus}${lineStyleMarker}, ${curvatureStatus}${curvatureMarker}, ${numberRelationship}${numbersMarker}, ${circuitStatus}${circuitsMarker}, ${shapeStatusLabel}${shapeMarker}`);
    });
}

// Draw a wire line with opacity (colored, optionally dotted, optionally curved)
function drawWireLine(ctx, startX, startY, endX, endY, color, opacity, isDotted = false, isCurved = false) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color; // Wires are colored
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    if (isDotted) {
        // Draw dotted line
        ctx.setLineDash([5, 5]); // 5px dash, 5px gap
    } else {
        ctx.setLineDash([]); // Solid line
    }
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    if (isCurved) {
        // Calculate control point for quadratic curve
        // Offset perpendicular to the line, with some randomness
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Perpendicular vector (swap and negate one component)
        const perpX = -dy / length;
        const perpY = dx / length;
        
        // Curve amount - try 80px offset for now
        const curveAmount = 80;
        const controlX = midX + perpX * curveAmount;
        const controlY = midY + perpY * curveAmount;
        
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    } else {
        ctx.lineTo(endX, endY);
    }
    
    ctx.stroke();
    ctx.restore();
}

// Draw an endpoint shape (circle, square, triangle) at a given position
function drawEndpointShape(ctx, x, y, shape, color) {
    const size = 9; // slightly smaller approximate "radius" for all shapes
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = color || '#888888';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    if (shape === 'square') {
        ctx.beginPath();
        ctx.rect(x - size, y - size, size * 2, size * 2);
        ctx.fill();
        ctx.stroke();
    } else if (shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x - size, y + size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else {
        // default to circle
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();
}

// Redraw all wire lines
function redrawWireLines() {
    const canvas = document.getElementById('linesCanvas');
    const ctx = canvas.getContext('2d');
    const middleSection = document.querySelector('.middle-section');
    
    if (!canvas || !middleSection) return;
    
    const middleRect = middleSection.getBoundingClientRect();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all wire lines
    const topBoxes = document.querySelectorAll('.top-boxes .box');
    const bottomBoxes = document.querySelectorAll('.bottom-boxes .box');
    
    wireLines.forEach(wire => {
        // Always draw endpoint shapes so they don't fade out with the line
        drawEndpointShape(ctx, wire.startX, wire.startY, wire.startShape || 'circle', wire.color);
        drawEndpointShape(ctx, wire.endX, wire.endY, wire.endShape || 'circle', wire.color);

        // Only draw the connecting line if it still has opacity
        if (wire.opacity > 0) {
            drawWireLine(ctx, wire.startX, wire.startY, wire.endX, wire.endY, wire.color, wire.opacity, wire.isDotted, wire.isCurved || false);
        }
    });
    
    // Redraw cut line if active
    if (currentCutLine) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.globalAlpha = currentCutLine.opacity || 1;
        ctx.beginPath();
        ctx.moveTo(currentCutLine.startX, currentCutLine.startY);
        ctx.lineTo(currentCutLine.endX, currentCutLine.endY);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

// Line-line intersection detection
function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Calculate direction vectors
    const d1x = x2 - x1;
    const d1y = y2 - y1;
    const d2x = x4 - x3;
    const d2y = y4 - y3;
    
    // Calculate denominator
    const denom = d1x * d2y - d1y * d2x;
    
    // If denominator is zero, lines are parallel
    if (Math.abs(denom) < 0.0001) {
        return false;
    }
    
    // Calculate t and u parameters
    const t = ((x3 - x1) * d2y - (y3 - y1) * d2x) / denom;
    const u = ((x3 - x1) * d1y - (y3 - y1) * d1x) / denom;
    
    // Check if intersection point is within both line segments
    const intersects = t >= 0 && t <= 1 && u >= 0 && u <= 1;
    
    return intersects;
}

// Check if a line segment intersects with a quadratic curve
// The curve is defined by start (sx, sy), control point (cx, cy), and end (ex, ey)
function lineIntersectsCurve(lineX1, lineY1, lineX2, lineY2, sx, sy, cx, cy, ex, ey, tolerance = 5) {
    // Sample points along the curve and check if any are close to the line
    const samples = 50; // Number of points to sample along the curve
    const dt = 1 / samples;
    
    for (let i = 0; i <= samples; i++) {
        const t = i * dt;
        // Quadratic Bezier curve: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
        const mt = 1 - t;
        const curveX = mt * mt * sx + 2 * mt * t * cx + t * t * ex;
        const curveY = mt * mt * sy + 2 * mt * t * cy + t * t * ey;
        
        // Check distance from this curve point to the line segment
        const dist = distancePointToLineSegment(curveX, curveY, lineX1, lineY1, lineX2, lineY2);
        
        if (dist <= tolerance) {
            return true;
        }
    }
    
    return false;
}

// Calculate distance from a point to a line segment
function distancePointToLineSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    
    if (lengthSq === 0) {
        // Line segment is actually a point
        const dx2 = px - x1;
        const dy2 = py - y1;
        return Math.sqrt(dx2 * dx2 + dy2 * dy2);
    }
    
    // Parameter t: position along the line segment (0 = start, 1 = end)
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
    
    // Closest point on the line segment
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;
    
    // Distance from point to closest point on line segment
    const dx2 = px - closestX;
    const dy2 = py - closestY;
    return Math.sqrt(dx2 * dx2 + dy2 * dy2);
}

// Handle cut gesture
function handleCutStart(e) {
    if (!gameState.isCuttingEnabled) return;
    // Allow cutting in tutorial mode only on the last step (TRY IT OUT)
    if (tutorialMode && tutorialStep !== tutorialSteps.length - 1) return;
    
    if (e.touches) {
        e.preventDefault();
    }
    
    const middleSection = document.querySelector('.middle-section');
    const middleRect = middleSection.getBoundingClientRect();
    
    const pos = getEventPosition(e);
    const relativeX = pos.x - middleRect.left;
    const relativeY = pos.y - middleRect.top;
    
    // Check if position is within middle section
    if (relativeX >= 0 && relativeX <= middleRect.width && 
        relativeY >= 0 && relativeY <= middleRect.height) {
        isCutting = true;
        cutStartPos = { x: relativeX, y: relativeY };
    }
}

function handleCutMove(e) {
    if (!isCutting || !cutStartPos) return;
    
    if (e.touches) {
        e.preventDefault();
    }
    
    const middleSection = document.querySelector('.middle-section');
    const middleRect = middleSection.getBoundingClientRect();
    
    const pos = getEventPosition(e);
    const relativeX = pos.x - middleRect.left;
    const relativeY = pos.y - middleRect.top;
    
    // Draw red cut line
    currentCutLine = {
        startX: cutStartPos.x,
        startY: cutStartPos.y,
        endX: relativeX,
        endY: relativeY,
        opacity: 1
    };
    
    redrawWireLines();
}

function handleCutEnd(e) {
    if (e.touches || e.changedTouches) {
        e.preventDefault();
    }
    
    if (!isCutting || !cutStartPos) {
        isCutting = false;
        cutStartPos = null;
        return;
    }
    
    const middleSection = document.querySelector('.middle-section');
    if (!middleSection) {
        isCutting = false;
        cutStartPos = null;
        return;
    }
    
    const middleRect = middleSection.getBoundingClientRect();
    
    const pos = getEventPosition(e);
    
    if (!pos || isNaN(pos.x) || isNaN(pos.y)) {
        if (!currentCutLine) {
            isCutting = false;
            cutStartPos = null;
            return;
        }
    } else {
        const relativeX = pos.x - middleRect.left;
        const relativeY = pos.y - middleRect.top;
        
        // If no current cut line, create one from start to end
        if (!currentCutLine) {
            currentCutLine = {
                startX: cutStartPos.x,
                startY: cutStartPos.y,
                endX: relativeX,
                endY: relativeY,
                opacity: 1
            };
        } else {
            // Ensure current cut line has end position
            currentCutLine.endX = relativeX;
            currentCutLine.endY = relativeY;
        }
    }
    
    // If currentCutLine still doesn't exist, we can't proceed
    if (!currentCutLine) {
        isCutting = false;
        cutStartPos = null;
        return;
    }
    
    // Check for intersections with wire lines
    const cutWires = [];
    
    if (wireLines.length === 0) {
        isCutting = false;
        cutStartPos = null;
        return;
    }
    
    wireLines.forEach((wire, index) => {
        if (wire.opacity > 0) {
            let intersects = false;
            
            if (wire.isCurved) {
                // For curved wires, calculate the control point (same as in drawWireLine)
                const midX = (wire.startX + wire.endX) / 2;
                const midY = (wire.startY + wire.endY) / 2;
                const dx = wire.endX - wire.startX;
                const dy = wire.endY - wire.startY;
                const length = Math.sqrt(dx * dx + dy * dy);
                
                if (length > 0) {
                    // Perpendicular vector (swap and negate one component)
                    const perpX = -dy / length;
                    const perpY = dx / length;
                    
                    // Curve amount - same as in drawWireLine (80px)
                    const curveAmount = 80;
                    const controlX = midX + perpX * curveAmount;
                    const controlY = midY + perpY * curveAmount;
                    
                    // Check if cut line intersects the curve
                    intersects = lineIntersectsCurve(
                        currentCutLine.startX, currentCutLine.startY,
                        currentCutLine.endX, currentCutLine.endY,
                        wire.startX, wire.startY,
                        controlX, controlY,
                        wire.endX, wire.endY,
                        5 // tolerance in pixels
                    );
                }
            } else {
                // For straight wires, use the original line intersection check
                intersects = linesIntersect(
                    currentCutLine.startX, currentCutLine.startY,
                    currentCutLine.endX, currentCutLine.endY,
                    wire.startX, wire.startY,
                    wire.endX, wire.endY
                );
            }
            
            if (intersects) {
                cutWires.push(wire);
            }
        }
    });
    
    // Process cut wires
    if (cutWires.length > 0 && gameState.isCuttingEnabled) {
        if (defuserSounds.defuser_cut) defuserSounds.defuser_cut.play();
        // Separate correct and wrong wires
        const correctWires = cutWires.filter(w => w.isCorrect === true);
        const wrongWires = cutWires.filter(w => w.isCorrect !== true);
        
        // Handle multiple cuts logic
        if (cutWires.length > 1) {
            if (tutorialMode) {
                // In tutorial mode, only allow single correct cut - ignore multiple cuts
                console.log('Multiple wires cut in tutorial mode - ignoring');
                return;
            }
            
            // Multiple wires cut
            if (correctWires.length > 0 && wrongWires.length > 0) {
                // Mixed: only cut wrong ones, leave correct alone
                // WRONG transition: turn middle section red and fade back to white
                const middleSection = document.querySelector('.middle-section');
                if (middleSection && typeof gsap !== 'undefined') {
                    middleSection.style.backgroundColor = '#ff4b4b'; // red
                    gsap.to(middleSection, {
                        backgroundColor: '#ffffff',
                        duration: 0.75,
                        ease: 'sine.out'
                    });
                }
                showPopup('WRONG!');
                gameState.wrongMoves += wrongWires.length;
                updateBombBoxes();
                
                // Check if 3 mistakes reached - game over
                if (gameState.wrongMoves >= 3) {
                    handleGameOver();
                    return;
                }
                
                // Only fade out wrong wires
                wrongWires.forEach(wire => {
                    wire.opacity = 1;
                    gsap.to(wire, {
                        opacity: 0,
                        duration: 0.5,
                        onUpdate: () => redrawWireLines()
                    });
                });
            } else if (wrongWires.length > 0) {
                // All wrong
                // WRONG transition: turn middle section red and fade back to white
                const middleSection = document.querySelector('.middle-section');
                if (middleSection && typeof gsap !== 'undefined') {
                    middleSection.style.backgroundColor = '#ff4b4b'; // red
                    gsap.to(middleSection, {
                        backgroundColor: '#ffffff',
                        duration: 0.75,
                        ease: 'sine.out'
                    });
                }
                showPopup('WRONG!');
                gameState.wrongMoves += wrongWires.length;
                updateBombBoxes();
                
                // Check if 3 mistakes reached - game over
                if (gameState.wrongMoves >= 3) {
                    handleGameOver();
                    return;
                }
                
                wrongWires.forEach(wire => {
                    wire.opacity = 1;
                    gsap.to(wire, {
                        opacity: 0,
                        duration: 0.5,
                        onUpdate: () => redrawWireLines()
                    });
                });
            }
        } else {
            // Single wire cut
            const wire = cutWires[0];
            const isCorrect = wire.isCorrect === true;
            
            if (isCorrect) {
                if (tutorialMode) {
                    // In tutorial mode, go back to menu after correct cut
                    handleTutorialCorrectCut(wire);
                } else {
                    handleCorrectAnswer(wire);
                }
            } else {
                // Wrong wire cut
                if (tutorialMode) {
                    // In tutorial mode, don't allow wrong cuts - just ignore
                    console.log('Wrong wire cut in tutorial mode - ignoring');
                    return;
                }
                
                // WRONG transition: turn middle section red and fade back to white
                const middleSection = document.querySelector('.middle-section');
                if (middleSection && typeof gsap !== 'undefined') {
                    middleSection.style.backgroundColor = '#ff4b4b'; // red
                    gsap.to(middleSection, {
                        backgroundColor: '#ffffff',
                        duration: 0.75,
                        ease: 'sine.out'
                    });
                }
                showPopup('WRONG!');
                gameState.wrongMoves++;
                updateBombBoxes();
                
                // Check if 3 mistakes reached - game over
                if (gameState.wrongMoves >= 3) {
                    handleGameOver();
                    return;
                }
                
                // Only fade out the wrong wire
                wire.opacity = 1;
                gsap.to(wire, {
                    opacity: 0,
                    duration: 0.5,
                    onUpdate: () => redrawWireLines()
                });
            }
        }
        
        // Redraw immediately to show the cut
        redrawWireLines();
    }
    
    // Reset cutting state
    isCutting = false;
    cutStartPos = null;
    
    // Fade out cut line at the same pace as wires
    if (currentCutLine) {
        gsap.to(currentCutLine, {
            opacity: 0,
            duration: 0.5,
            onUpdate: () => {
                redrawWireLines();
            },
            onComplete: () => {
                currentCutLine = null;
                redrawWireLines();
            }
        });
    }
}

// Helper function to get event position
function getEventPosition(e) {
    // Handle touch events
    if (e.touches && e.touches.length > 0) {
        return {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
    // Handle changedTouches for touchend
    if (e.changedTouches && e.changedTouches.length > 0) {
        return {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };
    }
    // Handle mouse events
    if (e.clientX !== undefined && e.clientY !== undefined) {
        return {
            x: e.clientX,
            y: e.clientY
        };
    }
    // Fallback
    return { x: 0, y: 0 };
}

const TOTAL_ROUNDS = 10;

// Game state
let gameState = {
    selectedRules: [], // Array of {category, ruleText, ruleKey}
    totalRules: [], // Array of rules currently in play
    wireAssignments: [], // Array of wire property assignments
    correctWireIndex: null, // Index of the correct wire
    correctCuts: 0, // Number of correct wires cut
    wiresCutTotal: 0, // Total correct wires cut this run
    wrongMoves: 0, // Number of wrong wires cut
    timeRemaining: 120, // Time in seconds (2 minutes)
    currentRound: 1, // Current round number
    isCuttingEnabled: true, // Whether wire cutting is enabled
    roundStartTime: null, // Timestamp when current round started
    roundDurations: [] // Array of per-round durations in seconds
};

let timerInterval = null;
let isPaused = false;
let tutorialMode = false;
let tutorialStep = 0;

// Rule categories
// Rounds configuration
const ROUNDS_CONFIG = {
    // Round 1: introductory – all easy rules, fewer wires
    1: {
        numWires: 6,
        totalRules: 3,
        easyRules: 3,
        hardRules: 0,
        wireDistribution: {
            right3: 1,
            right2: 3,
            right1: 1,
            right0: 1
        }
    },
    // Round 2: similar difficulty, slightly more wires
    2: {
        numWires: 7,
        totalRules: 3,
        easyRules: 3,
        hardRules: 0,
        wireDistribution: {
            right3: 1,
            right2: 3,
            right1: 2,
            right0: 1
        }
    },
    // Round 3: introduce 1 hard rule
    3: {
        numWires: 8,
        totalRules: 3,
        easyRules: 2,
        hardRules: 1,
        wireDistribution: {
            right3: 1,
            right2: 4,
            right1: 2,
            right0: 1
        }
    },
    // Round 4: similar rule mix, more wires
    4: {
        numWires: 9,
        totalRules: 3,
        easyRules: 2,
        hardRules: 1,
        wireDistribution: {
            right3: 1,
            right2: 4,
            right1: 3,
            right0: 1
        }
    },
    // Round 5: 1 easy + 2 hard
    5: {
        numWires: 10,
        totalRules: 3,
        easyRules: 2,
        hardRules: 1,
        wireDistribution: {
            right3: 1,
            right2: 5,
            right1: 3,
            right0: 1
        }
    },
    // Round 6: 1 easy + 2 hard, more wires
    6: {
        numWires: 11,
        totalRules: 3,
        easyRules: 1,
        hardRules: 2,
        wireDistribution: {
            right3: 1,
            right2: 6,
            right1: 3,
            right0: 1
        }
    },
    // Round 7: 1 easy + 3 hard (4 rules total)
    7: {
        numWires: 12,
        totalRules: 4,
        easyRules: 1,
        hardRules: 3,
        wireDistribution: {
            right4: 1,
            right3: 6,
            right2: 3,
            right1: 2
        }
    },
    // Round 8: 1 easy + 3 hard, more wires
    8: {
        numWires: 13,
        totalRules: 4,
        easyRules: 1,
        hardRules: 3,
        wireDistribution: {
            right4: 1,
            right3: 7,
            right2: 3,
            right1: 2
        }
    },
    // Round 9: 1 easy + 3 hard, near max wires
    9: {
        numWires: 14,
        totalRules: 3,
        easyRules: 0, // all hard rules
        hardRules: 3,
        wireDistribution: {
            right3: 1,
            right2: 8,
            right1: 3,
            right0: 2
        }
    },
    // Round 10: 1 easy + 3 hard, max wires (15)
    10: {
        numWires: 15,
        totalRules: 3,
        easyRules: 0, // all hard rules
        hardRules: 3,
        wireDistribution: {
            right3: 1,
            right2: 9,
            right1: 3,
            right0: 2
        }
    }
};

const RULE_CATEGORIES = {
    // Easy rule categories
    color: [
        { text: 'cool color', key: 'cool' },
        { text: 'warm color', key: 'warm' },
        { text: 'neutral color', key: 'neutral' }
    ],
    lineStyle: [
        { text: 'solid line', key: 'solid' },
        { text: 'dotted line', key: 'dotted' }
    ],
    curvature: [
        { text: 'straight', key: 'straight' },
        { text: 'curved', key: 'curved' }
    ],
    // Hard rule categories
    circuits: [
        { text: "dark circuits", key: 'dark' },
        { text: "light circuits", key: 'light' },
        { text: "opposite color circuits", key: 'opposite' }
    ],
    numbers: [
        { text: "numbers add to even", key: 'even' },
        { text: "numbers add to odd", key: 'odd' },
        { text: "numbers are the same", key: 'same' }
    ],
    shape: [
        { text: 'shapes are the same', key: 'same' },
        { text: 'shapes are different', key: 'different' }
    ]
};

// Select rules based on current round configuration
function selectRules() {
    const roundConfig = ROUNDS_CONFIG[gameState.currentRound] || ROUNDS_CONFIG[1];
    const numTotalRules = roundConfig.totalRules;
    const numEasy = Math.min(roundConfig.easyRules || 0, numTotalRules);
    const numHard = Math.max(0, numTotalRules - numEasy);

    const easyCategories = ['color', 'lineStyle', 'curvature'];
    const hardCategories = ['circuits', 'numbers', 'shape'];

    const shuffledEasy = [...easyCategories].sort(() => Math.random() - 0.5);
    const shuffledHard = [...hardCategories].sort(() => Math.random() - 0.5);

    const selectedEasy = shuffledEasy.slice(0, numEasy);
    const selectedHard = shuffledHard.slice(0, numHard);
    const selectedCategories = [...selectedEasy, ...selectedHard];
    
    // Select total rules for this round
    gameState.totalRules = [];
    selectedCategories.forEach((category) => {
        const rulesForCategory = RULE_CATEGORIES[category];
        const randomRule = rulesForCategory[Math.floor(Math.random() * rulesForCategory.length)];
        gameState.totalRules.push({
            category: category,
            text: randomRule.text,
            key: randomRule.key
        });
    });
    
    // All rules in totalRules are active for this round
    gameState.selectedRules = [...gameState.totalRules];
    
    // Console log
    console.log('=== RULE SELECTION ===');
    const totalRulesCount = numTotalRules;
    console.log(`Round ${gameState.currentRound}: ${numTotalRules} total rules`);
    console.log('Rules:');
    gameState.totalRules.forEach((rule, index) => {
        console.log(`  [${index}] ${rule.text}`);
    });
    // No maybe rules to log – all rules are true now
    
    return gameState.selectedRules;
}

// Helper function to create color palette display
function createColorPaletteDisplay(category) {
    const colors = COLOR_PALETTES[category];
    if (!colors || colors.length === 0) return null;
    
    const paletteContainer = document.createElement('div');
    paletteContainer.className = 'color-palette-display';
    
    // Display all 5 colors
    colors.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-palette-box';
        colorBox.style.backgroundColor = color;
        paletteContainer.appendChild(colorBox);
    });
    
    return paletteContainer;
}

// Helper function to create circuit display
function createCircuitDisplay(circuitType) {
    const circuitContainer = document.createElement('div');
    circuitContainer.className = 'circuit-display';
    
    if (circuitType === 'light') {
        // Two light grey boxes with X
        for (let i = 0; i < 2; i++) {
            const circuitBox = document.createElement('div');
            circuitBox.className = 'circuit-display-box circuit-light';
            circuitBox.textContent = 'X';
            circuitContainer.appendChild(circuitBox);
        }
    } else if (circuitType === 'dark') {
        // Two dark grey boxes with X
        for (let i = 0; i < 2; i++) {
            const circuitBox = document.createElement('div');
            circuitBox.className = 'circuit-display-box circuit-dark';
            circuitBox.textContent = 'X';
            circuitContainer.appendChild(circuitBox);
        }
    } else if (circuitType === 'opposite') {
        // One dark and one light grey box with X
        const darkBox = document.createElement('div');
        darkBox.className = 'circuit-display-box circuit-dark';
        darkBox.textContent = 'X';
        circuitContainer.appendChild(darkBox);
        
        const lightBox = document.createElement('div');
        lightBox.className = 'circuit-display-box circuit-light';
        lightBox.textContent = 'X';
        circuitContainer.appendChild(lightBox);
    }
    
    return circuitContainer;
}

// Helper function to create line style display
function createLineStyleDisplay(lineStyle) {
    const lineContainer = document.createElement('div');
    lineContainer.className = 'line-style-display';
    
    const lineElement = document.createElement('div');
    lineElement.className = 'line-style-line';
    
    if (lineStyle === 'dotted') {
        lineElement.classList.add('line-dotted');
    } else {
        lineElement.classList.add('line-solid');
    }
    
    lineContainer.appendChild(lineElement);
    return lineContainer;
}

// Helper function to create curvature display
function createCurvatureDisplay(curvatureType) {
    const curvatureContainer = document.createElement('div');
    curvatureContainer.className = 'curvature-display';
    
    const lineElement = document.createElement('div');
    lineElement.className = 'curvature-line';
    
    if (curvatureType === 'curved') {
        lineElement.classList.add('line-curved');
        // Create an SVG or use CSS to create a curved line
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '80');
        svg.setAttribute('height', '20');
        svg.setAttribute('viewBox', '0 0 80 20');
        svg.style.overflow = 'visible';
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 0 10 Q 40 0 80 10');
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
        
        lineElement.appendChild(svg);
    } else {
        // Straight line
        lineElement.classList.add('line-straight');
    }
    
    curvatureContainer.appendChild(lineElement);
    return curvatureContainer;
}

// Helper function to create number display
function createNumberDisplay(numberType) {
    const numberContainer = document.createElement('div');
    numberContainer.className = 'number-display';
    
    if (numberType === 'odd') {
        // Two grey boxes with 0 and 1, plus in between
        const box1 = document.createElement('div');
        box1.className = 'number-display-box';
        box1.textContent = '0';
        numberContainer.appendChild(box1);
        
        const plus = document.createElement('span');
        plus.className = 'number-plus';
        plus.textContent = '+';
        numberContainer.appendChild(plus);
        
        const box2 = document.createElement('div');
        box2.className = 'number-display-box';
        box2.textContent = '1';
        numberContainer.appendChild(box2);
    } else if (numberType === 'even') {
        // Two grey boxes with 0 and 2, plus in between
        const box1 = document.createElement('div');
        box1.className = 'number-display-box';
        box1.textContent = '0';
        numberContainer.appendChild(box1);
        
        const plus = document.createElement('span');
        plus.className = 'number-plus';
        plus.textContent = '+';
        numberContainer.appendChild(plus);
        
        const box2 = document.createElement('div');
        box2.className = 'number-display-box';
        box2.textContent = '2';
        numberContainer.appendChild(box2);
    } else if (numberType === 'same') {
        // Two grey boxes with 2 in each, no plus
        const box1 = document.createElement('div');
        box1.className = 'number-display-box';
        box1.textContent = '2';
        numberContainer.appendChild(box1);
        
        const box2 = document.createElement('div');
        box2.className = 'number-display-box';
        box2.textContent = '2';
        numberContainer.appendChild(box2);
    }
    
    return numberContainer;
}

// Helper function to set tutorial rules
// Accepts either:
//   - Array of rules: setTutorialRules([rule1, rule2, rule3])
//   - Object with trueRules: setTutorialRules({ trueRules: [...] })
function setTutorialRules(rules) {
    console.log('setTutorialRules called with:', rules);
    
    const trueRulesList = Array.isArray(rules)
        ? rules
        : (rules && typeof rules === 'object' ? (rules.trueRules || []) : []);
    
    // Helper function to create rule display in a rule box
    function populateRuleBox(ruleBox, rule) {
        if (!ruleBox || !rule) return;
        
        // Clear existing content
        ruleBox.innerHTML = '';
        
        // Add text
        const textNode = document.createTextNode(rule.text);
        ruleBox.appendChild(textNode);
        
        // Add display element based on category
        if (rule.category === 'color' && (rule.key === 'cool' || rule.key === 'warm' || rule.key === 'neutral')) {
            const paletteDisplay = createColorPaletteDisplay(rule.key);
            if (paletteDisplay) {
                ruleBox.appendChild(paletteDisplay);
                console.log(`Added color palette display for ${rule.key}`);
            }
        } else if (rule.category === 'circuits' && (rule.key === 'light' || rule.key === 'dark' || rule.key === 'opposite')) {
            const circuitDisplay = createCircuitDisplay(rule.key);
            if (circuitDisplay) {
                ruleBox.appendChild(circuitDisplay);
                console.log(`Added circuit display for ${rule.key}`);
            }
        } else if (rule.category === 'lineStyle' && (rule.key === 'solid' || rule.key === 'dotted')) {
            const lineStyleDisplay = createLineStyleDisplay(rule.key);
            if (lineStyleDisplay) {
                ruleBox.appendChild(lineStyleDisplay);
                console.log(`Added line style display for ${rule.key}`);
            }
        } else if (rule.category === 'numbers' && (rule.key === 'odd' || rule.key === 'even' || rule.key === 'same')) {
            const numberDisplay = createNumberDisplay(rule.key);
            if (numberDisplay) {
                ruleBox.appendChild(numberDisplay);
                console.log(`Added number display for ${rule.key}`);
            }
        } else if (rule.category === 'curvature' && (rule.key === 'straight' || rule.key === 'curved')) {
            const curvatureDisplay = createCurvatureDisplay(rule.key);
            if (curvatureDisplay) {
                ruleBox.appendChild(curvatureDisplay);
                console.log(`Added curvature display for ${rule.key}`);
            }
        }
    }
    
    // Update true rules header
    const trueRulesHeader = document.getElementById('trueRulesHeader');
    if (trueRulesHeader) {
        trueRulesHeader.style.display = (trueRulesList.length > 0) ? 'flex' : 'none';
        console.log('trueRulesHeader found and shown');
    } else {
        console.log('ERROR: trueRulesHeader not found!');
    }
    
    // Update true rule boxes
    for (let i = 0; i < 3; i++) {
        const trueRuleBox = document.getElementById(`trueRule${i + 1}`);
        if (trueRuleBox) {
            if (i < trueRulesList.length && trueRulesList[i]) {
                const rule = trueRulesList[i];
                console.log(`Setting true rule ${i + 1}:`, rule);
                populateRuleBox(trueRuleBox, rule);
                trueRuleBox.style.display = 'flex';
                trueRuleBox.style.background = 'linear-gradient(to bottom, #4dcfa8, #3eb994)';
                trueRuleBox.style.color = '#ffffff';
                console.log(`True rule ${i + 1} box updated`);
            } else {
                trueRuleBox.style.display = 'none';
                console.log(`True rule ${i + 1} box hidden (no rule provided)`);
            }
        } else {
            console.log(`ERROR: trueRule${i + 1} not found!`);
        }
    }
    
    // Hide maybe rules header and boxes – tutorial now only shows green rules
    const maybeRulesHeader = document.getElementById('maybeRulesHeader');
    if (maybeRulesHeader) maybeRulesHeader.style.display = 'none';
    for (let i = 0; i < 4; i++) {
        const maybeRuleBox = document.getElementById(`falseRule${i + 1}`);
        if (maybeRuleBox) maybeRuleBox.style.display = 'none';
    }
    
    // Store rules in gameState for wire assignment
    gameState.totalRules = trueRulesList;
    gameState.selectedRules = [...trueRulesList];
    
    // Recalculate heights
    updateRuleHeights();
    console.log('setTutorialRules completed');
}

// Update rule display in HTML
function updateRuleDisplay() {
    // Don't update rules if we're in tutorial mode and not initializing round 3
    if (tutorialMode && gameState.currentRound !== 3) {
        console.log('updateRuleDisplay skipped - tutorial mode active');
        return;
    }
    
    const roundConfig = ROUNDS_CONFIG[gameState.currentRound] || ROUNDS_CONFIG[1];
    const numTrueRules = roundConfig.totalRules;
    
    // Hide/show header above the rule list
    const trueRulesHeader = document.getElementById('trueRulesHeader');
    if (trueRulesHeader) {
        trueRulesHeader.style.display = (numTrueRules > 0) ? 'flex' : 'none';
    }
    
    // Update all true rule boxes
    // Use totalRules count from round config; hide any extra boxes beyond that
    for (let i = 0; i < numTrueRules || document.getElementById(`trueRule${i + 1}`); i++) {
        const trueRuleBox = document.getElementById(`trueRule${i + 1}`);
        if (trueRuleBox) {
            if (i < numTrueRules && gameState.totalRules[i]) {
                // Clear existing content
                trueRuleBox.innerHTML = '';
                
                // Add text
                const textNode = document.createTextNode(gameState.totalRules[i].text);
                trueRuleBox.appendChild(textNode);
                
                // If rule mentions a color category, add color palette display
                const rule = gameState.totalRules[i];
                if (rule.category === 'color' && (rule.key === 'cool' || rule.key === 'warm' || rule.key === 'neutral')) {
                    const paletteDisplay = createColorPaletteDisplay(rule.key);
                    if (paletteDisplay) {
                        trueRuleBox.appendChild(paletteDisplay);
                    }
                } else if (rule.category === 'circuits' && (rule.key === 'light' || rule.key === 'dark' || rule.key === 'opposite')) {
                    // If rule mentions circuits, add circuit display
                    const circuitDisplay = createCircuitDisplay(rule.key);
                    if (circuitDisplay) {
                        trueRuleBox.appendChild(circuitDisplay);
                    }
                } else if (rule.category === 'lineStyle' && (rule.key === 'solid' || rule.key === 'dotted')) {
                    // If rule mentions line style, add line style display
                    const lineStyleDisplay = createLineStyleDisplay(rule.key);
                    if (lineStyleDisplay) {
                        trueRuleBox.appendChild(lineStyleDisplay);
                    }
                } else if (rule.category === 'numbers' && (rule.key === 'odd' || rule.key === 'even' || rule.key === 'same')) {
                    // If rule mentions numbers, add number display
                    const numberDisplay = createNumberDisplay(rule.key);
                    if (numberDisplay) {
                        trueRuleBox.appendChild(numberDisplay);
                    }
                } else if (rule.category === 'curvature' && (rule.key === 'straight' || rule.key === 'curved')) {
                    // If rule mentions curvature, add curvature display
                    const curvatureDisplay = createCurvatureDisplay(rule.key);
                    if (curvatureDisplay) {
                        trueRuleBox.appendChild(curvatureDisplay);
                    }
                }
                
                trueRuleBox.style.display = 'flex';
                // Ensure green gradient styling is applied
                trueRuleBox.style.background = 'linear-gradient(to bottom, #4dcfa8, #3eb994)';
                trueRuleBox.style.borderColor = '#006400';
                trueRuleBox.style.color = '#ffffff';
            } else {
                trueRuleBox.style.display = 'none';
            }
        }
    }
    
    // Hide maybe rules section – no maybe rules in gameplay
    const maybeRulesHeader = document.getElementById('maybeRulesHeader');
    if (maybeRulesHeader) maybeRulesHeader.style.display = 'none';
    for (let i = 1; i <= 4; i++) {
        const falseRuleBox = document.getElementById(`falseRule${i}`);
        if (falseRuleBox) falseRuleBox.style.display = 'none';
    }
    
    // Recalculate heights based on visible elements
    updateRuleHeights();
}

// Update rule heights based on number of visible elements
function updateRuleHeights() {
    const rulesContainer = document.querySelector('.rules-container');
    if (!rulesContainer) return;
    
    // Get all elements and filter to only visible ones
    const allRuleElements = Array.from(rulesContainer.querySelectorAll('.rule-section-header, .rule-box'));
    const visibleElements = allRuleElements.filter(el => {
        const display = window.getComputedStyle(el).display;
        return display !== 'none' && el.style.display !== 'none';
    });
    
    // Each visible element should take equal space using flex: 1
    visibleElements.forEach(el => {
        el.style.flex = '1 1 0';
        el.style.minHeight = '0';
    });
}

// Generate boxes dynamically based on NUM_WIRES
function generateBoxes() {
    const topBoxesContainer = document.querySelector('.top-boxes');
    const bottomBoxesContainer = document.querySelector('.bottom-boxes');
    
    // Clear existing boxes
    topBoxesContainer.innerHTML = '';
    bottomBoxesContainer.innerHTML = '';
    
    // Generate boxes
    for (let i = 0; i < getCurrentNumWires(); i++) {
        const topBox = document.createElement('div');
        topBox.className = 'box';
        topBox.textContent = '0';
        topBoxesContainer.appendChild(topBox);
        
        const bottomBox = document.createElement('div');
        bottomBox.className = 'box';
        bottomBox.textContent = '0';
        bottomBoxesContainer.appendChild(bottomBox);
    }
    
    // Update key boxes to match NUM_WIRES
    const colorsPerCategory = getCurrentNumWires() / 3;
    const keyGroups = document.querySelectorAll('.key-group');
    keyGroups.forEach((group) => {
        const keyBoxes = group.querySelectorAll('.key-box');
        // Show/hide key boxes based on colorsPerCategory
        keyBoxes.forEach((box, index) => {
            if (index < colorsPerCategory) {
                box.style.display = '';
            } else {
                box.style.display = 'none';
            }
        });
    });
}

// Assign wire properties based on rule distribution
// 1 wire matches all 3 rules (WRONG - one rule is fake)
// 2 wires match 2 rules (one is CORRECT - matches 2 real rules)
// Assign wire properties based on round configuration wireDistribution
// Process: Create correct wire first, then sequentially create wires from distribution
function assignWireProperties() {
    const roundConfig = ROUNDS_CONFIG[gameState.currentRound] || ROUNDS_CONFIG[1];
    const distribution = roundConfig.wireDistribution;
    const rules = gameState.selectedRules;
    const trueRules = gameState.totalRules;
    const totalRules = rules.length; // Total number of rules
    console.log('=== WIRE ASSIGNMENT START ===');
    
    // Track distributions for balance
    const colorCounts = { cool: 0, warm: 0, neutral: 0 };
    let dottedCount = 0;
    let curvedCount = 0;
    let darkCircuitCount = 0;
    let lightCircuitCount = 0;
    const totalWires = getCurrentNumWires();
    
    // Color labels for display
    const COLOR_LABELS = {
        cool: ['green', 'neon green', 'cyan', 'blue', 'purple'],
        warm: ['yellow', 'orange', 'red', 'pink', 'magenta'],
        neutral: ['light grey', 'grey', 'black', 'brown', 'tan']
    };
    
    // Get available colors evenly distributed - RANDOMLY SELECT which colors from each palette
    const colorsPerCategory = getCurrentNumWires() / 3;
    const availableColors = [];
    
    // Helper to randomly select N items from an array
    function randomlySelectFromArray(array, count) {
        const shuffled = [...array];
        // Shuffle the array
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        // Take first N items
        return shuffled.slice(0, count);
    }
    
    // Build full available color pool (all distinct colors from all categories)
    COLOR_PALETTES.cool.forEach((color, idx) => {
        availableColors.push({
            color,
            category: 'cool',
            index: idx,
            label: COLOR_LABELS.cool[idx] || `cool-${idx}`
        });
    });
    COLOR_PALETTES.warm.forEach((color, idx) => {
        availableColors.push({
            color,
            category: 'warm',
            index: idx,
            label: COLOR_LABELS.warm[idx] || `warm-${idx}`
        });
    });
    COLOR_PALETTES.neutral.forEach((color, idx) => {
        availableColors.push({
            color,
            category: 'neutral',
            index: idx,
            label: COLOR_LABELS.neutral[idx] || `neutral-${idx}`
        });
    });
    
    // Shuffle colors MULTIPLE TIMES to ensure true randomization
    for (let shufflePass = 0; shufflePass < 3; shufflePass++) {
        for (let i = availableColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableColors[i], availableColors[j]] = [availableColors[j], availableColors[i]];
        }
    }
    
    // Also add a random offset seed based on current time to ensure different games get different results
    const timeSeed = Date.now() % 1000;
    for (let i = 0; i < timeSeed; i++) {
        const swapIndex1 = Math.floor(Math.random() * availableColors.length);
        const swapIndex2 = Math.floor(Math.random() * availableColors.length);
        [availableColors[swapIndex1], availableColors[swapIndex2]] = [availableColors[swapIndex2], availableColors[swapIndex1]];
    }
    
    // Helper function to check if wire matches a rule
    function matchesRule(wireProps, rule) {
        if (rule.category === 'color') {
            return wireProps.category === rule.key;
        } else if (rule.category === 'lineStyle') {
            return wireProps.isDotted === (rule.key === 'dotted');
        } else if (rule.category === 'circuits') {
            return wireProps.circuitColor === rule.key;
        } else if (rule.category === 'curvature') {
            return wireProps.isCurved === (rule.key === 'curved');
        } else if (rule.category === 'shape') {
            // wireProps.shapeKey is 'same' or 'different'
            return wireProps.shapeKey === rule.key;
        }
        // numbers rule is checked separately in assignNumbers
        return false;
    }
    
    // Helper function to count how many rules a wire matches (display only; all rules are true)
    function countMatches(wireProps) {
        let count = 0;
        let details = [];
        rules.forEach(rule => {
            if (rule.category !== 'numbers') {
                if (matchesRule(wireProps, rule)) {
                    count++;
                    details.push(`${rule.category}(${rule.key})`);
                } else {
                    // Show which rule it doesn't match
                    details.push(`NOT ${rule.category}(${rule.key})`);
                }
            }
        });
        return { count, details };
    }
    
    const wireAssignments = [];
    const usedColors = []; // Track which colors have been used
    
    // Helper function to get next color maintaining balance (randomized)
    function getNextBalancedColor(preferredCategory = null) {
        // Find least used category (for balance), but if there's a tie, randomize
        let targetCategory;
        if (preferredCategory) {
            targetCategory = preferredCategory;
        } else {
            const minCount = Math.min(colorCounts.cool, colorCounts.warm, colorCounts.neutral);
            const candidates = [];
            if (colorCounts.cool === minCount) candidates.push('cool');
            if (colorCounts.warm === minCount) candidates.push('warm');
            if (colorCounts.neutral === minCount) candidates.push('neutral');
            // Randomly pick from candidates if there's a tie
            targetCategory = candidates[Math.floor(Math.random() * candidates.length)];
        }
        
        // Get all unused colors in target category
        const matchingColors = availableColors.filter(
            colorObj => colorObj.category === targetCategory && !usedColors.includes(colorObj.color)
        );
        
        // Shuffle MULTIPLE TIMES to ensure true randomness
        for (let shufflePass = 0; shufflePass < 3; shufflePass++) {
            for (let i = matchingColors.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [matchingColors[i], matchingColors[j]] = [matchingColors[j], matchingColors[i]];
            }
        }
        
        if (matchingColors.length > 0) {
            // Truly random selection - use random index after multiple shuffles
            const randomIndex = Math.floor(Math.random() * matchingColors.length);
            const selectedColor = matchingColors[randomIndex];
            usedColors.push(selectedColor.color);
            colorCounts[targetCategory]++;
            return selectedColor;
        }
        
        // Fallback: any unused color
        const unusedColors = availableColors.filter(
            colorObj => !usedColors.includes(colorObj.color)
        );
        
        // Shuffle to ensure random selection order
        for (let i = unusedColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unusedColors[i], unusedColors[j]] = [unusedColors[j], unusedColors[i]];
        }
        
        if (unusedColors.length > 0) {
            // Truly random selection - add small random delay to seed to ensure different results each game
            const randomIndex = Math.floor(Math.random() * unusedColors.length);
            const selectedColor = unusedColors[randomIndex];
            usedColors.push(selectedColor.color);
            colorCounts[selectedColor.category]++;
            return selectedColor;
        }
        
        return availableColors[0]; // Last resort
    }
    
    // Helper function to get next available color that matches rule and hasn't been used
    function getNextUnusedColorForRule(ruleKey, startIndex = 0) {
        // Get all unused colors that match the rule
        const matchingColors = availableColors.filter(
            colorObj => colorObj.category === ruleKey && !usedColors.includes(colorObj.color)
        );
        
        // Shuffle to ensure random selection order
        for (let i = matchingColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [matchingColors[i], matchingColors[j]] = [matchingColors[j], matchingColors[i]];
        }
        
        if (matchingColors.length > 0) {
            // Randomly pick from matching colors
            const selectedColor = matchingColors[Math.floor(Math.random() * matchingColors.length)];
            usedColors.push(selectedColor.color);
            colorCounts[selectedColor.category]++;
            const colorLabel = selectedColor.label || selectedColor.color;
            console.log(`  Assigned color ${colorLabel} (${selectedColor.category}) to match rule ${ruleKey}. Used colors: [${usedColors.map(c => availableColors.find(ac => ac.color === c)?.label || c).join(', ')}]`);
            return selectedColor;
        }
        
        // Fallback: find any unused color
        const unusedColors = availableColors.filter(
            colorObj => !usedColors.includes(colorObj.color)
        );
        
        // Shuffle to ensure random selection order
        for (let i = unusedColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unusedColors[i], unusedColors[j]] = [unusedColors[j], unusedColors[i]];
        }
        
        if (unusedColors.length > 0) {
            // Truly random selection - add small random delay to seed to ensure different results each game
            const randomIndex = Math.floor(Math.random() * unusedColors.length);
            const selectedColor = unusedColors[randomIndex];
            usedColors.push(selectedColor.color);
            colorCounts[selectedColor.category]++;
            const colorLabel = selectedColor.label || selectedColor.color;
            console.log(`  Fallback: Assigned color ${colorLabel} (${selectedColor.category}). Used colors: [${usedColors.map(c => availableColors.find(ac => ac.color === c)?.label || c).join(', ')}]`);
            return selectedColor;
        }
        
        const errorUsedLabels = usedColors.map(c => availableColors.find(ac => ac.color === c)?.label || c);
        console.error(`  ERROR: No unused colors available! Used: [${errorUsedLabels.join(', ')}]`);
        return availableColors[0]; // Last resort
    }
    
    // Helper function to get next available color that doesn't match rule and hasn't been used
    function getNextUnusedNonMatchingColor(ruleKey, startIndex = 0) {
        // Get all unused colors that don't match the rule
        const nonMatchingColors = availableColors.filter(
            colorObj => colorObj.category !== ruleKey && !usedColors.includes(colorObj.color)
        );
        
        // Shuffle to ensure random selection order
        for (let i = nonMatchingColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nonMatchingColors[i], nonMatchingColors[j]] = [nonMatchingColors[j], nonMatchingColors[i]];
        }
        
        if (nonMatchingColors.length > 0) {
            // Truly random selection - add small random delay to seed to ensure different results each game
            const randomIndex = Math.floor(Math.random() * nonMatchingColors.length);
            const selectedColor = nonMatchingColors[randomIndex];
            usedColors.push(selectedColor.color);
            colorCounts[selectedColor.category]++;
            const colorLabel = selectedColor.label || selectedColor.color;
            console.log(`  Assigned non-matching color ${colorLabel} (${selectedColor.category}) for rule ${ruleKey}. Used colors: [${usedColors.map(c => availableColors.find(ac => ac.color === c)?.label || c).join(', ')}]`);
            return selectedColor;
        }
        
        // Fallback: find any unused color
        const unusedColors = availableColors.filter(
            colorObj => !usedColors.includes(colorObj.color)
        );
        
        // Shuffle to ensure random selection order
        for (let i = unusedColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unusedColors[i], unusedColors[j]] = [unusedColors[j], unusedColors[i]];
        }
        
        if (unusedColors.length > 0) {
            // Truly random selection - add small random delay to seed to ensure different results each game
            const randomIndex = Math.floor(Math.random() * unusedColors.length);
            const selectedColor = unusedColors[randomIndex];
            usedColors.push(selectedColor.color);
            colorCounts[selectedColor.category]++;
            const colorLabel = selectedColor.label || selectedColor.color;
            console.log(`  Fallback: Assigned color ${colorLabel} (${selectedColor.category}). Used colors: [${usedColors.map(c => availableColors.find(ac => ac.color === c)?.label || c).join(', ')}]`);
            return selectedColor;
        }
        
        const errorUsedLabels = usedColors.map(c => availableColors.find(ac => ac.color === c)?.label || c);
        console.error(`  ERROR: No unused colors available! Used: [${errorUsedLabels.join(', ')}]`);
        return availableColors[0]; // Last resort
    }
    
    // Helper function to create a wire with specific match count
    // matchCount: number of rules this wire should match
    // matchRules: array of rules this wire MUST match
    // excludeRules: array of rules this wire must NOT match
    function createWireWithMatches(matchCount, matchRules = [], excludeRules = []) {
        // Determine which properties to match/exclude
        const matchCategories = matchRules.map(r => r.category);
        const excludeCategories = excludeRules.map(r => r.category);
        
        // Color: match if color rule in matchRules, exclude if in excludeRules
        const colorRuleMatch = matchRules.find(r => r.category === 'color');
        const colorRuleExclude = excludeRules.find(r => r.category === 'color');
        let wireColor;
        if (colorRuleMatch) {
            wireColor = getNextUnusedColorForRule(colorRuleMatch.key, 0);
        } else if (colorRuleExclude) {
            wireColor = getNextUnusedNonMatchingColor(colorRuleExclude.key, 0);
        } else {
            wireColor = getNextBalancedColor();
        }
        
        // LineStyle: match dotted/solid based on rules
        const lineStyleRuleMatch = matchRules.find(r => r.category === 'lineStyle');
        const lineStyleRuleExclude = excludeRules.find(r => r.category === 'lineStyle');
        let wireLineStyle;
        if (lineStyleRuleMatch) {
            wireLineStyle = (lineStyleRuleMatch.key === 'dotted');
        } else if (lineStyleRuleExclude) {
            wireLineStyle = !(lineStyleRuleExclude.key === 'dotted');
        } else {
            // Balance dotted/solid: choose based on current count
            wireLineStyle = (dottedCount < totalWires / 2);
        }
        if (wireLineStyle) dottedCount++;
        
        // Circuits: match dark/light/opposite based on rules
        const circuitsRuleMatch = matchRules.find(r => r.category === 'circuits');
        const circuitsRuleExclude = excludeRules.find(r => r.category === 'circuits');
        let wireCircuits;
        if (circuitsRuleMatch) {
            wireCircuits = circuitsRuleMatch.key;
        } else if (circuitsRuleExclude) {
            // Opposite
            if (circuitsRuleExclude.key === 'dark') wireCircuits = 'light';
            else if (circuitsRuleExclude.key === 'light') wireCircuits = 'dark';
            else wireCircuits = 'dark';
        } else {
            // Balance dark/light: choose based on current count (50/50 split)
            if (darkCircuitCount < totalWires / 2) {
                wireCircuits = 'dark';
            } else if (lightCircuitCount < totalWires / 2) {
                wireCircuits = 'light';
            } else {
                // If counts are equal, randomly choose
                wireCircuits = (Math.random() < 0.5) ? 'dark' : 'light';
            }
        }
        // Track circuit color counts (only for dark/light, not opposite)
        if (wireCircuits === 'dark') darkCircuitCount++;
        else if (wireCircuits === 'light') lightCircuitCount++;
        
        // Curvature: match curved/straight based on rules or balance
        const curvatureRuleMatch = matchRules.find(r => r.category === 'curvature');
        const curvatureRuleExclude = excludeRules.find(r => r.category === 'curvature');
        let wireCurvature;
        if (curvatureRuleMatch) {
            wireCurvature = (curvatureRuleMatch.key === 'curved');
        } else if (curvatureRuleExclude) {
            wireCurvature = !(curvatureRuleExclude.key === 'curved');
        } else {
            // Balance curved/straight: choose based on current count
            wireCurvature = (curvedCount < totalWires / 2);
        }
        if (wireCurvature) curvedCount++;
        
        // Shape: decide whether endpoints should be the same or different
        const shapeRuleMatch = matchRules.find(r => r.category === 'shape');
        const shapeRuleExclude = excludeRules.find(r => r.category === 'shape');
        let wireShapeKey;
        if (shapeRuleMatch) {
            // Must satisfy the shape rule ('same' or 'different')
            wireShapeKey = shapeRuleMatch.key;
        } else if (shapeRuleExclude) {
            // Must NOT satisfy the excluded shape rule
            wireShapeKey = (shapeRuleExclude.key === 'same') ? 'different' : 'same';
        } else {
            // No shape rule involved for this wire: random but balanced later
            wireShapeKey = Math.random() < 0.5 ? 'same' : 'different';
        }

        const wire = {
            color: wireColor.color,
            category: wireColor.category,
            indexInCategory: wireColor.index,
            isDotted: wireLineStyle,
            circuitColor: wireCircuits,
            isCurved: wireCurvature,
            shapeKey: wireShapeKey,
            matchesRules: matchCount,
            isCorrect: false,
            matchRules: [...matchRules], // Store which rules should be matched
            excludeRules: [...excludeRules] // Store which rules should be excluded
        };
        
        // Validate that wire actually matches the expected count
        // Count how many rules this wire actually matches (excluding numbers)
        // Numbers will be assigned later in assignNumbers()
        let actualMatchCount = 0;
        rules.forEach(rule => {
            if (rule.category !== 'numbers') { // Numbers are checked separately
                if (matchesRule(wire, rule)) {
                    actualMatchCount++;
                }
            }
        });
        
        // Calculate expected non-numbers match count
        // If matchCount includes a numbers rule, subtract 1
        const numbersRuleInMatchRules = matchRules.find(r => r.category === 'numbers');
        const expectedNonNumbersMatchCount = numbersRuleInMatchRules ? matchCount - 1 : matchCount;
        
        // If the actual match count doesn't match expected, adjust properties
        if (actualMatchCount !== expectedNonNumbersMatchCount) {
            console.warn(`  WARNING: Wire created with expected matchesRules=${matchCount}, but actual matches=${actualMatchCount}`);
            console.warn(`    matchRules: ${matchRules.map(r => r.text).join(', ')}`);
            console.warn(`    excludeRules: ${excludeRules.map(r => r.text).join(', ')}`);
            console.warn(`    Wire properties: color=${wireColor.category}, dotted=${wireLineStyle}, circuits=${wireCircuits}, curved=${wireCurvature}`);
            
            // Force the match count to be correct by adjusting properties
            if (actualMatchCount > expectedNonNumbersMatchCount) {
                // Too many matches - need to break some matches
                // First, break matches with excludeRules
                excludeRules.forEach(excludeRule => {
                    if (excludeRule.category === 'numbers') return; // Skip numbers
                    if (actualMatchCount > expectedNonNumbersMatchCount && matchesRule(wire, excludeRule)) {
                        console.warn(`    Breaking match with excludeRule: ${excludeRule.text} (category: ${excludeRule.category})`);
                        // Break the match by setting opposite property
                        if (excludeRule.category === 'color') {
                            // Remove old color from usedColors and colorCounts
                            const oldColorIndex = usedColors.indexOf(wire.color);
                            if (oldColorIndex !== -1) {
                                usedColors.splice(oldColorIndex, 1);
                                if (colorCounts[wire.category] > 0) {
                                    colorCounts[wire.category]--;
                                }
                            }
                            const newColor = getNextUnusedNonMatchingColor(excludeRule.key, 0);
                            wire.color = newColor.color;
                            wire.category = newColor.category;
                            wire.indexInCategory = newColor.index;
                            actualMatchCount--;
                        } else if (excludeRule.category === 'lineStyle') {
                            wire.isDotted = !(excludeRule.key === 'dotted');
                            actualMatchCount--;
                        } else if (excludeRule.category === 'circuits') {
                            if (excludeRule.key === 'dark') wire.circuitColor = 'light';
                            else if (excludeRule.key === 'light') wire.circuitColor = 'dark';
                            else wire.circuitColor = 'dark';
                            actualMatchCount--;
                        } else if (excludeRule.category === 'curvature') {
                            wire.isCurved = !(excludeRule.key === 'curved');
                            actualMatchCount--;
                        }
                    }
                });
                
                // If still too many matches, break matches with rules not in matchRules
                if (actualMatchCount > expectedNonNumbersMatchCount) {
                    rules.forEach(rule => {
                        if (actualMatchCount > expectedNonNumbersMatchCount && rule.category !== 'numbers') {
                            const isInMatchRules = matchRules.some(mr => mr.category === rule.category && mr.key === rule.key);
                            if (!isInMatchRules && matchesRule(wire, rule)) {
                                console.warn(`    Breaking match with non-matchRule: ${rule.text} (category: ${rule.category})`);
                                // Break the match
                                if (rule.category === 'color') {
                                    // Remove old color from usedColors and colorCounts
                                    const oldColorIndex = usedColors.indexOf(wire.color);
                                    if (oldColorIndex !== -1) {
                                        usedColors.splice(oldColorIndex, 1);
                                        if (colorCounts[wire.category] > 0) {
                                            colorCounts[wire.category]--;
                                        }
                                    }
                                    const newColor = getNextUnusedNonMatchingColor(rule.key, 0);
                                    wire.color = newColor.color;
                                    wire.category = newColor.category;
                                    wire.indexInCategory = newColor.index;
                                    actualMatchCount--;
                                } else if (rule.category === 'lineStyle') {
                                    wire.isDotted = !(rule.key === 'dotted');
                                    actualMatchCount--;
                                } else if (rule.category === 'circuits') {
                                    if (rule.key === 'dark') wire.circuitColor = 'light';
                                    else if (rule.key === 'light') wire.circuitColor = 'dark';
                                    else wire.circuitColor = 'dark';
                                    actualMatchCount--;
                                } else if (rule.category === 'curvature') {
                                    wire.isCurved = !(rule.key === 'curved');
                                    actualMatchCount--;
                                }
                            }
                        }
                    });
                }
            } else if (actualMatchCount < expectedNonNumbersMatchCount) {
                // Too few matches - need to add some matches
                // Try to match rules from matchRules that aren't currently matched
                matchRules.forEach(matchRule => {
                    if (matchRule.category === 'numbers') return; // Skip numbers
                    if (actualMatchCount < expectedNonNumbersMatchCount && !matchesRule(wire, matchRule)) {
                        if (!matchesRule(wire, matchRule)) {
                            console.warn(`    Adding match with matchRule: ${matchRule.text} (category: ${matchRule.category})`);
                            // Add the match
                            if (matchRule.category === 'color') {
                                // Remove old color from usedColors and colorCounts
                                const oldColorIndex = usedColors.indexOf(wire.color);
                                if (oldColorIndex !== -1) {
                                    usedColors.splice(oldColorIndex, 1);
                                    if (colorCounts[wire.category] > 0) {
                                        colorCounts[wire.category]--;
                                    }
                                }
                                const newColor = getNextUnusedColorForRule(matchRule.key, 0);
                                wire.color = newColor.color;
                                wire.category = newColor.category;
                                wire.indexInCategory = newColor.index;
                                actualMatchCount++;
                            } else if (matchRule.category === 'lineStyle') {
                                wire.isDotted = (matchRule.key === 'dotted');
                                actualMatchCount++;
                            } else if (matchRule.category === 'circuits') {
                                wire.circuitColor = matchRule.key;
                                actualMatchCount++;
                            } else if (matchRule.category === 'curvature') {
                                wire.isCurved = (matchRule.key === 'curved');
                                actualMatchCount++;
                            }
                        }
                    }
                });
            }
            
            // Update the matchesRules to reflect actual count (will be updated after numbers are assigned)
            // For now, store the expected match count
            wire.matchesRules = matchCount;
            if (actualMatchCount !== expectedNonNumbersMatchCount) {
                console.error(`    ERROR: Could not fix wire match count! Expected ${expectedNonNumbersMatchCount} non-numbers matches, got ${actualMatchCount}`);
            }
        }
        
        return wire;
    }
    
    // STEP 1: Create CORRECT wire
    // Correct wire always matches all currently active rules
    console.log('\n=== STEP 1: Creating CORRECT wire ===');
    
    let correctMatchRules = [...rules];
    let correctExcludeRules = [];
    let correctMatchCount = totalRules;
    console.log(`Correct wire will match ALL ${totalRules} rules (${totalRules}/${totalRules})`);
    console.log(`  matchRules: ${correctMatchRules.map(r => r.text).join(', ')}`);
    
    console.log(`Creating correct wire with matchesRules: ${correctMatchCount}`);
    const correctWire = createWireWithMatches(correctMatchCount, correctMatchRules, correctExcludeRules);
    correctWire.isCorrect = true;
    colorCounts[correctWire.category]++;
    if (correctWire.isDotted) dottedCount++;
    if (correctWire.isCurved) curvedCount++;
    wireAssignments.push(correctWire);
    console.log(`✓ Created CORRECT wire: matchesRules=${correctWire.matchesRules}, isCorrect=${correctWire.isCorrect}`);
    console.log(`  Current wireAssignments count: ${wireAssignments.length}`);
    
    // Create wires based on rightN distribution
    // Start from highest match count and work down
    const matchCounts = Object.keys(distribution)
        .filter(k => k.startsWith('right'))
        .map(k => parseInt(k.replace('right', '')))
        .sort((a, b) => b - a); // Sort descending
    
    for (const matchCount of matchCounts) {
        const key = `right${matchCount}`;
        const numWires = distribution[key] || 0;
        
        if (numWires === 0) continue;
        
        console.log(`\n=== Creating ${key} wires (${matchCount}/${totalRules}) ===`);
        console.log(`distribution.${key}: ${numWires}`);
        console.log(`correctMatchCount: ${correctMatchCount}`);
        
        // Calculate how many additional wires to create (subtract 1 if this is the correct match count)
        const numWiresToCreate = (matchCount === correctMatchCount) 
            ? Math.max(0, numWires - 1)  // Subtract 1 because correct wire already created
            : numWires;
        
        console.log(`Creating ${numWiresToCreate} additional ${key} wires (${matchCount === correctMatchCount ? 'correct wire already created, subtracting 1' : 'not correct match count, creating all'})`);
        
        if (numWiresToCreate === 0) {
            console.log(`  Skipping ${key} wire creation (correct wire already accounts for this)`);
        }
        
        for (let i = 0; i < numWiresToCreate; i++) {
            let matchRules = [];
            let excludeRules = [];
            
            if (matchCount === totalRules && !fakeRule) {
                // Matches all rules - but this shouldn't happen if correct wire is already created
                matchRules = rules;
                excludeRules = [];
            } else if (matchCount === totalRules && fakeRule) {
                // Matches all rules including fake - incorrect
                matchRules = rules;
                excludeRules = [];
            } else if (matchCount === 0) {
                // Matches no rules
                matchRules = [];
                excludeRules = rules;
            } else {
                // Match some but not all rules (all rules are true)
                const combinations = generateCombinations(rules.length, matchCount);
                const combo = combinations[i % combinations.length];
                matchRules = combo.map(idx => rules[idx]);
                excludeRules = rules.filter((r, idx) => !combo.includes(idx));
            }
            
            const wire = createWireWithMatches(matchCount, matchRules, excludeRules);
            wireAssignments.push(wire);
            console.log(`  ✓ Created ${key} wire ${i + 1}: matchesRules=${wire.matchesRules}`);
        }
        
        const currentCount = wireAssignments.filter(w => w.matchesRules === matchCount).length;
        const expectedCount = (matchCount === correctMatchCount) ? numWires : numWires; // Should match distribution
        console.log(`After ${key}: wireAssignments count: ${wireAssignments.length}, wires with ${matchCount}/${totalRules}: ${currentCount} (expected: ${expectedCount})`);
        if (matchCount === correctMatchCount && currentCount !== expectedCount) {
            console.error(`ERROR: Expected ${expectedCount} wires with ${matchCount}/${totalRules}, but found ${currentCount}!`);
        }
    }
    
    // Summary before shuffle
    console.log('\n=== BEFORE SHUFFLE: Wire Summary ===');
    wireAssignments.forEach((wire, idx) => {
        console.log(`  Wire ${idx}: matchesRules=${wire.matchesRules}, isCorrect=${wire.isCorrect}`);
    });
    const correctWires = wireAssignments.filter(w => w.isCorrect);
    const correctCount = correctWires.length;
    const actualCorrectMatchCount = correctWires.length > 0 ? correctWires[0].matchesRules : correctMatchCount;
    const totalCorrectMatchCount = wireAssignments.filter(w => w.matchesRules === actualCorrectMatchCount).length;
    console.log(`Total wires with ${actualCorrectMatchCount}/${totalRules} (correct): ${totalCorrectMatchCount} (${correctCount} marked as correct)`);
    if (correctCount !== 1) {
        console.error(`ERROR: Found ${correctCount} wires marked as correct (expected 1)!`);
    }
    
    // Shuffle assignments so correct wire isn't always first
    const correctIndex = wireAssignments.findIndex(w => w.isCorrect);
    const shuffleTarget = Math.floor(Math.random() * wireAssignments.length);
    if (shuffleTarget !== correctIndex) {
        [wireAssignments[correctIndex], wireAssignments[shuffleTarget]] = 
            [wireAssignments[shuffleTarget], wireAssignments[correctIndex]];
    }
    
    // Note: Balance for dotted/curved is already handled in createWireWithMatches
    // If curvature is not a rule, ensure 50% are curved (should already be balanced)
    const curvatureRule = rules.find(r => r.category === 'curvature');
    if (!curvatureRule) {
        // Double-check balance - if not balanced, adjust
        const currentCurved = wireAssignments.filter(w => w.isCurved).length;
        const targetCurved = Math.floor(wireAssignments.length / 2);
        if (currentCurved !== targetCurved) {
            // Adjust to reach target
            const diff = targetCurved - currentCurved;
            if (diff > 0) {
                // Need more curved
                const straightWires = wireAssignments
                    .map((w, i) => ({ wire: w, index: i }))
                    .filter(({ wire }) => !wire.isCurved);
                for (let i = 0; i < Math.min(diff, straightWires.length); i++) {
                    straightWires[i].wire.isCurved = true;
                }
            } else {
                // Need fewer curved
                const curvedWires = wireAssignments
                    .map((w, i) => ({ wire: w, index: i }))
                    .filter(({ wire }) => wire.isCurved);
                for (let i = 0; i < Math.min(-diff, curvedWires.length); i++) {
                    curvedWires[i].wire.isCurved = false;
                }
            }
        }
    }
    
    gameState.wireAssignments = wireAssignments;
    gameState.correctWireIndex = wireAssignments.findIndex(w => w.isCorrect);
    
    // Console log wire details
    console.log('\n=== WIRE ASSIGNMENTS ===');
    
    // Return early - validation will happen after numbers are assigned
    return wireAssignments;
    console.log(`Total available colors: ${availableColors.length}`);
    const usedColorLabels = usedColors.map(c => availableColors.find(ac => ac.color === c)?.label || c);
    console.log(`Used colors: ${usedColors.length} - [${usedColorLabels.join(', ')}]`);
    
    // Check for duplicates
    const allColors = wireAssignments.map(w => w.color);
    const uniqueColors = new Set(allColors);
    if (allColors.length !== uniqueColors.size) {
        console.error('ERROR: Duplicate colors detected!');
        const duplicates = allColors.filter((color, index) => allColors.indexOf(color) !== index);
        const duplicateLabels = duplicates.map(c => availableColors.find(ac => ac.color === c)?.label || c);
        console.error('Duplicate colors:', duplicateLabels);
        wireAssignments.forEach((wire, idx) => {
            const isDuplicate = duplicates.includes(wire.color);
            const colorLabel = availableColors.find(c => c.color === wire.color)?.label || wire.color;
            console.error(`  Wire ${idx}: ${colorLabel} ${isDuplicate ? '[DUPLICATE!]' : ''}`);
        });
    }
    
    gameState.wireAssignments = wireAssignments;
    gameState.correctWireIndex = wireAssignments.findIndex(w => w.isCorrect);
    console.log(`Correct Wire Index: ${gameState.correctWireIndex}`);
    
    return wireAssignments;
}

// Helper function to generate all combinations of k elements from n total (returns array of index arrays)
function generateCombinations(n, k) {
    if (k === 0) return [[]];
    if (k > n) return [];
    
    const combinations = [];
    
    function combine(start, combo) {
        if (combo.length === k) {
            combinations.push([...combo]);
            return;
        }
        
        for (let i = start; i < n; i++) {
            combo.push(i);
            combine(i + 1, combo);
            combo.pop();
        }
    }
    
    combine(0, []);
    return combinations;
}

// Helper function to get a color matching a rule
function getColorForRule(ruleKey, availableColors, startIndex) {
    for (let i = startIndex; i < availableColors.length; i++) {
        if (availableColors[i].category === ruleKey) {
            return availableColors[i];
        }
    }
    // Fallback
    return availableColors[startIndex];
}

// Helper function to get a color NOT matching a rule
function getNonMatchingColor(ruleKey, availableColors, startIndex) {
    for (let i = startIndex; i < availableColors.length; i++) {
        if (availableColors[i].category !== ruleKey) {
            return availableColors[i];
        }
    }
    // Fallback
    return availableColors[startIndex];
}

// Initialize game
// Set viewport height for mobile browsers
function setViewportHeight() {
    // Set CSS custom property for actual viewport height (accounts for mobile browser UI)
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Position start menu to be centered in the middle section
function positionStartMenu() {
    // Start menu covers the whole page, no repositioning needed
}

// Position tutorial overlay to be centered in the middle section
function positionTutorialOverlay() {
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const middleSection = document.querySelector('.middle-section');
    
    if (tutorialOverlay && middleSection) {
        const middleRect = middleSection.getBoundingClientRect();
        
        // Position the tutorial overlay to match the middle section
        tutorialOverlay.style.position = 'absolute';
        tutorialOverlay.style.top = `${middleRect.top}px`;
        tutorialOverlay.style.left = `${middleRect.left}px`;
        tutorialOverlay.style.width = `${middleRect.width}px`;
        tutorialOverlay.style.height = `${middleRect.height}px`;
        tutorialOverlay.style.right = 'auto';
        tutorialOverlay.style.bottom = 'auto';
    }
}

function initializeGame() {
    // Set viewport height for mobile
    setViewportHeight();
    window.addEventListener('resize', () => {
        setViewportHeight();
        // Reposition start menu and tutorial overlay on resize
        positionStartMenu();
        positionTutorialOverlay();
    });
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            setViewportHeight();
            positionStartMenu();
            positionTutorialOverlay();
        }, 100);
    });
    
    // Initialize round 1
    gameState.currentRound = 1;
    gameState.isCuttingEnabled = false; // Disable cutting until start menu is closed
    gameState.correctCuts = 0;
    gameState.wiresCutTotal = 0;
    gameState.wrongMoves = 0;
    gameState.timeRemaining = 120; // Initialize timer to 2 minutes at game start
    
    // Disable pause button until game starts
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
        pauseButton.disabled = true;
    }
    
    // Reset bomb boxes to show numbers
    const bombBoxes = document.querySelectorAll('.bomb-box');
    if (bombBoxes) {
        bombBoxes.forEach((box, index) => {
            box.textContent = '💣';
            box.style.backgroundColor = '#4CAF50';
        });
    }
    
    // Ensure containers start at opacity 1 for initial display
    const topSection = document.querySelector('.top-section');
    const middleSection = document.querySelector('.middle-section');
    if (topSection) topSection.style.opacity = '1';
    if (middleSection) middleSection.style.opacity = '1';
    
    // Initialize first round (but don't start timer yet - wait for play button)
    initializeRound(() => {
        // Ensure opacity is 1 after initialization (in case it was set to 0)
        if (topSection) topSection.style.opacity = '1';
        if (middleSection) middleSection.style.opacity = '1';
        // Don't show round callout or start timer yet - wait for play button
        
        // Position and show start menu after round is initialized
        setTimeout(() => {
            positionStartMenu();
            const startMenu = document.getElementById('startMenu');
            if (startMenu) {
                startMenu.style.display = 'flex';
            }
        }, 100);
    });
}

// Handle correct answer - proceed to next round
function handleCorrectAnswer(cutWire) {
    // Correct wire cut - proceed to next round
    gameState.correctCuts++;
    // Only increment wiresCutTotal for real gameplay rounds (1..TOTAL_ROUNDS)
    if (!tutorialMode && gameState.currentRound >= 1 && gameState.currentRound <= TOTAL_ROUNDS) {
        gameState.wiresCutTotal = (gameState.wiresCutTotal || 0) + 1;
    }
    
    // Disable cutting
    gameState.isCuttingEnabled = false;
    
    // Stop timer (freeze time)
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Fade out the cut wire immediately (if wire provided)
    if (cutWire) {
        cutWire.opacity = cutWire.opacity || 1;
        gsap.to(cutWire, {
            opacity: 0,
            duration: 0.5,
            onUpdate: () => {
                const canvas = document.getElementById('linesCanvas');
                if (canvas) redrawWireLines();
            }
        });
    }
    
    // Record duration for this round
    if (gameState.roundStartTime != null) {
        const now = performance.now ? performance.now() : Date.now();
        const durationSec = (now - gameState.roundStartTime) / 1000;
        gameState.roundDurations.push({
            round: gameState.currentRound,
            seconds: durationSec
        });
    }

    // Check if this is the final round (all wires completed)
    const isFinalRound = gameState.currentRound >= TOTAL_ROUNDS;
    
    if (isFinalRound) {
        // Log per-round timing breakdown on win
        if (gameState.roundDurations && gameState.roundDurations.length > 0) {
            console.log('=== DEFUSER ROUND TIME BREAKDOWN ===');
            gameState.roundDurations.forEach(entry => {
                const secs = entry.seconds.toFixed(2);
                console.log(`Round ${entry.round}: ${secs} seconds`);
            });
            const total = gameState.roundDurations.reduce((sum, r) => sum + r.seconds, 0);
            console.log(`Total active round time: ${total.toFixed(2)} seconds`);
            console.log('=== END DEFUSER ROUND TIME BREAKDOWN ===');
        }

        defuserAwardStarsForCurrentRun(true);
        const pauseButton = document.getElementById('pauseButton');
        if (pauseButton) {
            pauseButton.disabled = true;
        }
    } else {
        // CORRECT transition:
        // 1) Immediately turn middle section green
        // 2) Wait 0.8s
        // 3) Set up next round, where initializeRound() makes middle opacity 0
        // 4) fadeInRound() fades the middle back in
        const middleSection = document.querySelector('.middle-section');
        if (middleSection) {
            middleSection.style.backgroundColor = '#4dcfa8';
        }

        setTimeout(() => {
            // Move to next round
            gameState.currentRound++;
            updateInfoDisplay();

            // Initialize next round, then use the existing fade-in helper
            initializeRound(() => {
                fadeInRound(() => {
                    // Enable cutting and restart timer (without resetting time)
                    gameState.isCuttingEnabled = true;
                    startTimer();
                });
            });
        }, 1000);
    }
}

// Show popup message (CORRECT!, WRONG!, GAME OVER, or YOU WON!)
function showPopup(message, onComplete, isWin = false, subText = '') {
    const popup = document.getElementById('popupMessage');
    const popupMainText = document.getElementById('popupMainText');
    const popupSubText = document.getElementById('popupSubText');
    if (!popup || !popupMainText || !popupSubText) return;
    
    // Kill any existing tweens on the popup
    gsap.killTweensOf(popup);
    
    // Position popup in center of middle-section
    const middleSection = document.querySelector('.middle-section');
    if (middleSection) {
        const rect = middleSection.getBoundingClientRect();
        popup.style.position = 'absolute';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
    }
    
    // Set main text
    popupMainText.textContent = message;
    
    // Set subtext if provided
    if (subText) {
        // Allow basic HTML in subText (used for star row)
        popupSubText.innerHTML = subText;
        popupSubText.style.display = 'block';
    } else {
        popupSubText.style.display = 'none';
    }
    
    // Set class based on message type
    if (isWin) {
        popup.className = 'popup-message correct';
    } else if (message === 'CORRECT!') {
        popup.className = 'popup-message correct';
    } else if (message === 'GAME OVER') {
        popup.className = 'popup-message wrong';
    } else {
        popup.className = 'popup-message wrong';
    }
    
    popup.style.display = 'block';
    popup.style.opacity = '1';
    
    // Hide after delay based on message type
    if (onComplete) {
        // CORRECT! message - hide after 1 second
        setTimeout(() => {
            gsap.to(popup, {
                opacity: 0,
                duration: 0.4,
                onComplete: () => {
                    popup.style.display = 'none';
                    if (onComplete) onComplete();
                }
            });
        }, 1000);
    } else if (message === 'WRONG!') {
        // WRONG! message - hide after 2 seconds
        setTimeout(() => {
            gsap.to(popup, {
                opacity: 0,
                duration: 0.4,
                onComplete: () => {
                    popup.style.display = 'none';
                }
            });
        }, 2000);
    }
    // Game over and win messages stay visible (no auto-hide)
}

// Handle game over when timer runs out
function handleGameOver() {
    if (defuserSounds.defuser_explode) defuserSounds.defuser_explode.play();
    // Record duration for the current round if in progress
    if (gameState.roundStartTime != null) {
        const now = performance.now ? performance.now() : Date.now();
        const durationSec = (now - gameState.roundStartTime) / 1000;
        gameState.roundDurations.push({
            round: gameState.currentRound,
            seconds: durationSec
        });
    }

    // Disable cutting
    gameState.isCuttingEnabled = false;
    
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    defuserAwardStarsForCurrentRun(false);

    // Log per-round timing breakdown
    if (gameState.roundDurations && gameState.roundDurations.length > 0) {
        console.log('=== DEFUSER ROUND TIME BREAKDOWN ===');
        gameState.roundDurations.forEach(entry => {
            const secs = entry.seconds.toFixed(2);
            console.log(`Round ${entry.round}: ${secs} seconds`);
        });
        const total = gameState.roundDurations.reduce((sum, r) => sum + r.seconds, 0);
        console.log(`Total active round time: ${total.toFixed(2)} seconds`);
        console.log('=== END DEFUSER ROUND TIME BREAKDOWN ===');
    }

    // Show red flash
    showFlashOverlay(false); // false = red flash for game over
}

// Show flash overlay (green for win, red for game over)
function showFlashOverlay(isWin) {
    const overlay = document.getElementById('flashOverlay');
    if (!overlay) return;
    
    // Set color based on win/lose
    overlay.style.backgroundColor = isWin ? '#00ff00' : '#8B0000'; // Dark red for game over
    overlay.style.opacity = '0.5';
    overlay.style.display = 'block';
    
    // Fade to 0 in 0.75 seconds for both win and game over
    gsap.to(overlay, {
        opacity: 0,
        duration: 0.75,
        onComplete: () => {
            overlay.style.display = 'none';
        }
    });
}

// Update bomb boxes based on wrongMoves
function updateBombBoxes() {
    const bombBoxes = document.querySelectorAll('.bomb-box');
    if (!bombBoxes || bombBoxes.length === 0) return;
    
    // For each wrong move, change the corresponding box to an explosion
    for (let i = 0; i < Math.min(gameState.wrongMoves, 3); i++) {
        if (bombBoxes[i]) {
            bombBoxes[i].textContent = '💥';
            bombBoxes[i].style.background = 'linear-gradient(to bottom, #8B0000, #660000)';
        }
    }
}

// Show round callout at the start of each round
function showRoundCallout() {
    return; // still disabled visually, but comment no longer mentions 7
}

// Update info display with current round
function updateInfoDisplay() {
    const infoSectionText = document.getElementById('infoSectionText');
    if (infoSectionText) {
        infoSectionText.textContent = `WIRE ${gameState.currentRound}/${TOTAL_ROUNDS} - Drag to cut a wire`;
    }
}

// Fade out current round (wires and clues)
function fadeOutRound(onComplete) {
    const middleSection = document.querySelector('.middle-section');
    
    // Only fade out the middle section; leave the top section visible
    const fadeTargets = [];
    if (middleSection) fadeTargets.push(middleSection);
    
    // Fade out containers (slower: 1.5s)
    if (fadeTargets.length > 0) {
        gsap.to(fadeTargets, {
            opacity: 0,
            duration: 0.75
        });
    }
    
    // Call onComplete after fade duration (0.75s)
    setTimeout(() => {
        if (onComplete) onComplete();
    }, 750);
}

// Fade in new round
function fadeInRound(onComplete) {
    const middleSection = document.querySelector('.middle-section');

    // Only fade in the middle section (top stays untouched)
    if (middleSection && typeof gsap !== 'undefined') {
        gsap.to(middleSection, {
            opacity: 1,
            duration: 0.5
        });
    } else if (middleSection) {
        // Fallback: ensure it's visible
        middleSection.style.opacity = '1';
    }

    // Show round callout
    showRoundCallout();

    // Run callback after tween duration so timing stays consistent
    setTimeout(() => {
        if (onComplete) onComplete();
    }, 500);
}

// Initialize a new round
function initializeRound(onComplete) {
    // Clear previous state
    wireLines = [];
    originalWireConnections = [];
    gameState.wireAssignments = [];
    gameState.correctCuts = 0;

    // Prepare middle section for a clean fade-in:
    // make it fully transparent and reset background to white
    // *before* we change its contents.
    const middleSection = document.querySelector('.middle-section');
    if (middleSection) {
        middleSection.style.opacity = '0';
        middleSection.style.backgroundColor = '#ffffff';
    }

    // Regenerate boxes for new wire count
    generateBoxes();
    
    // Select rules for new round
    selectRules();
    updateRuleDisplay();
    
    // Assign wire properties
    assignWireProperties();
    
    // Apply key colors
    applyKeyBoxColors();
    
    // Record round start time for per-round timing
    gameState.roundStartTime = performance.now ? performance.now() : Date.now();

    // Draw wires - ensure boxes are fully created before drawing
    setTimeout(() => {
        // Verify boxes match wire count
        const topBoxes = document.querySelectorAll('.top-boxes .box');
        const bottomBoxes = document.querySelectorAll('.bottom-boxes .box');
        const expectedCount = getCurrentNumWires();
        
        if (topBoxes.length !== expectedCount || bottomBoxes.length !== expectedCount) {
            console.error(`Box count mismatch: expected ${expectedCount}, got topBoxes: ${topBoxes.length}, bottomBoxes: ${bottomBoxes.length}. Regenerating boxes...`);
            generateBoxes();
            // Wait a bit longer for DOM to update
            setTimeout(() => {
                drawConnectingLines();
                assignNumbers();
                
                // Check for duplicate correct match counts after numbers are assigned
                checkForDuplicateCorrectAnswers();
                
                // Verify opposite circuit colors are actually different
                verifyOppositeCircuitColors();
                
                logWireAssignments();
                if (onComplete) onComplete();
            }, 50);
            return;
        }
        
        drawConnectingLines();
        assignNumbers();
        
        // Check for duplicate correct match counts after numbers are assigned
        checkForDuplicateCorrectAnswers();
        
        // Verify opposite circuit colors are actually different
        verifyOppositeCircuitColors();
        
        logWireAssignments();
        if (onComplete) onComplete();
    }, 100);
}

// Update correct cut display (kept for backward compatibility)
function updateCorrectCutDisplay() {
    const infoSectionText = document.getElementById('infoSectionText');
    if (infoSectionText) {
        infoSectionText.textContent = `CORRECT ${gameState.correctCuts}/1`;
        
        setTimeout(() => {
            updateInfoDisplay();
        }, 2000);
    }
}

// Update timer display
function updateTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay && gameState.timeRemaining >= 0) {
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Start timer countdown
function startTimer() {
    // Don't start timer if paused
    if (isPaused) {
        return;
    }
    
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Only initialize timeRemaining to 2:00 if it hasn't been set yet
    // or has gone invalid (e.g., after a previous game)
    if (gameState.timeRemaining === undefined || gameState.timeRemaining < 0) {
        gameState.timeRemaining = 120;
    }

    // Don't start timer if time is already 0 (game over)
    if (gameState.timeRemaining <= 0) {
        return;
    }
    
    // Update immediately
    updateTimer();
    
    // Update every second
    timerInterval = setInterval(() => {
        // Don't update if paused
        if (isPaused) {
            return;
        }
        gameState.timeRemaining--;
        updateTimer();
        
        if (gameState.timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            // Timer reached 0 - Game Over
            handleGameOver();
        }
    }, 1000);
}

// Start game from start menu
function startGame() {
    const startMenu = document.getElementById('startMenu');
    const startMenu2 = document.getElementById('startMenu2');
    if (startMenu) {
        startMenu.style.display = 'none';
    }
    if (startMenu2) {
        startMenu2.style.display = 'none';
    }
    
    // Mark this session as started for today (used by parent to decide on quit warning)
    defuserMarkStarted();
    
    // Select new rules for the game
    selectRules();
    updateRuleDisplay();
    
    // Reassign wire properties based on new rules
    assignWireProperties();
    
    // Apply key colors
    applyKeyBoxColors();
    
    // Redraw wires with new assignments
    drawConnectingLines();
    assignNumbers();
    
    // Check for duplicate correct match counts after numbers are assigned
    checkForDuplicateCorrectAnswers();
    
    // Verify opposite circuit colors are actually different
    verifyOppositeCircuitColors();
    
    // Enable cutting
    gameState.isCuttingEnabled = true;
    
    // Re-enable pause button
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
        pauseButton.disabled = false;
    }
    
    // Show round callout for first round
    showRoundCallout();
    
    // Start timer
    startTimer();
}

// Tutorial steps
const tutorialSteps = [
    {
        title: "DISARM THE BOMB",
        content: "Follow the rules at the top to determine which wire you need to cut."
    },
    {
        title: "WIRES CAN BE:",
        content: "• solid or dotted<br>• straight or curved<br>• of warm, cool, or neutral colors"
    },
    {
        title: "CIRCUITS:",
        content: "Wires are connected to 2 circuits<br>• They can be light or dark<br>• They can have numbers that are the same or add to odd or even<br>• They can have shapes that are the same or different"
    },
    {
        title: "DEFUSE THE BOMB",
        content: "• You have 2 minutes to cut 10 wires.<br>• You can cut 3 connections<br>incorrectly before losing"
    },
    {
        title: "Drag to cut a wire",
        content: "" // Will be populated dynamically
    }
];

// Show tutorial
function showTutorial() {
    console.log('showTutorial called');
    tutorialMode = true;
    tutorialStep = 0;
    gameState.isCuttingEnabled = false;
    
    // Set tutorial rules - dotted line, curved line, cool color
    setTutorialRules([
        { text: 'dotted line', category: 'lineStyle', key: 'dotted' },
        { text: 'curved line', category: 'curvature', key: 'curved' },
        { text: 'cool color', category: 'color', key: 'cool' }
    ]);
    
    // Update wires to match the initial tutorial rules
    console.log('Updating wires for initial tutorial rules');
    assignWireProperties();
    drawConnectingLines();
    
    // Position tutorial overlay in middle section
    positionTutorialOverlay();
    
    // Hide start menus
    const startMenu = document.getElementById('startMenu');
    const startMenu2 = document.getElementById('startMenu2');
    if (startMenu) {
        startMenu.style.display = 'none';
    }
    if (startMenu2) {
        startMenu2.style.display = 'none';
    }
    
    // Show first tutorial step
    showTutorialStep(0);
}

// Show a tutorial step
function showTutorialStep(stepIndex) {
    console.log('showTutorialStep called with stepIndex:', stepIndex);
    
    // Position tutorial overlay in middle section
    positionTutorialOverlay();
    
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const tutorialTitle = document.getElementById('tutorialTitle');
    const tutorialContent = document.getElementById('tutorialContent');
    const tutorialNextButton = document.getElementById('tutorialNextButton');
    
    if (!tutorialOverlay || !tutorialTitle || !tutorialContent || !tutorialNextButton) {
        console.log('ERROR: Tutorial elements not found!');
        return;
    }
    
    if (stepIndex < tutorialSteps.length) {
        // Regular tutorial step
        const step = tutorialSteps[stepIndex];
        tutorialTitle.textContent = step.title;
        
        // Change rules when reaching circuits step
        if (stepIndex === 2) {
            console.log('Changing to circuits rules');
            setTutorialRules([
                { text: 'numbers add to even', category: 'numbers', key: 'even' },
                { text: 'circuits are dark', category: 'circuits', key: 'dark' },
                { text: 'solid line', category: 'lineStyle', key: 'solid' }
            ]);
        }
        
        // Special handling for circuits step to show visual representation
        if (stepIndex === 2) {
            const circuitDemo = `
                <div class="tutorial-circuit-demo">
                    <div class="tutorial-circuit-box tutorial-circuit-light">0</div>
                    <div class="tutorial-circuit-box tutorial-circuit-dark">2</div>
                </div>
            `;
            tutorialContent.innerHTML = step.content.replace(/\[put a representation of a light circuit with a 0 and a dark one with a 2\]/i, circuitDemo);
        } else {
            tutorialContent.innerHTML = step.content;
        }
        
        // Change rules when reaching FALSE RULES step (step 4)
        if (stepIndex === 4) {
            console.log('Updating rules for FALSE RULES tutorial step (now using only true rules)');
            setTutorialRules([
                { text: 'cool color', category: 'color', key: 'cool' },
                { text: 'straight', category: 'curvature', key: 'straight' },
                { text: 'numbers are the same', category: 'numbers', key: 'same' }
            ]);

            // Update wires to match the new rules
            console.log('Updating wires for tutorial rules');
            assignWireProperties();
            drawConnectingLines();
        }
        
        // Handle TRY IT OUT step (last step)
        if (stepIndex === tutorialSteps.length - 1) {
            // Get correct wire color label
            const correctWire = gameState.wireAssignments.find(w => w.isCorrect);
            let colorLabel = 'wire';
            if (correctWire) {
                const COLOR_LABELS = {
                    cool: ['green', 'neon green', 'cyan', 'blue', 'purple'],
                    warm: ['yellow', 'orange', 'red', 'pink', 'magenta'],
                    neutral: ['light grey', 'grey', 'black', 'brown', 'tan']
                };
                
                const category = correctWire.category;
                const indexInCategory = correctWire.indexInCategory;
                if (category && typeof indexInCategory === 'number' && COLOR_LABELS[category] && COLOR_LABELS[category][indexInCategory]) {
                    colorLabel = COLOR_LABELS[category][indexInCategory];
                }
            }
            
            // Update tutorial content with color
            tutorialContent.innerHTML = `• cut the ${colorLabel} wire`;
            
            // Enable cutting and make overlay non-blocking so user can cut through it
            gameState.isCuttingEnabled = true;
            tutorialOverlay.style.display = 'flex';
            // Make overlay non-blocking for pointer events so user can cut wires
            tutorialOverlay.style.pointerEvents = 'none';
            // But allow button to work if needed (though it's hidden)
            const tutorialButton = tutorialOverlay.querySelector('.tutorial-next-button');
            if (tutorialButton) {
                tutorialButton.style.pointerEvents = 'none';
            }
        } else {
            tutorialOverlay.style.display = 'flex';
            // Reset pointer events for other steps
            tutorialOverlay.style.pointerEvents = 'all';
        }
        
        // Update button text
        if (stepIndex === tutorialSteps.length - 1) {
            tutorialNextButton.textContent = 'BACK TO MENU';
            tutorialNextButton.style.display = 'none'; // Hide button for cut step
        } else {
            tutorialNextButton.textContent = 'NEXT';
            tutorialNextButton.style.display = 'block'; // Show button for other steps
        }
    } else if (stepIndex === tutorialSteps.length) {
        // End tutorial and return to menu
        endTutorial();
    }
}

// Handle tutorial next button
function nextTutorialStep() {
    // Check if we're on the final instruction screen
    const tutorialContent = document.getElementById('tutorialContent');
    if (tutorialContent && tutorialContent.textContent === 'You cut the correct wire!') {
        // On final instruction, return to menu
        endTutorial();
        return;
    }
    
    tutorialStep++;
    if (tutorialStep > tutorialSteps.length) {
        // Return to start menu
        endTutorial();
    } else {
        showTutorialStep(tutorialStep);
    }
}

// Handle correct cut in tutorial mode
function handleTutorialCorrectCut(cutWire) {
    // Disable cutting
    gameState.isCuttingEnabled = false;
    
    // Fade out the cut wire
    if (cutWire) {
        cutWire.opacity = cutWire.opacity || 1;
        gsap.to(cutWire, {
            opacity: 0,
            duration: 0.5,
            onUpdate: () => {
                const canvas = document.getElementById('linesCanvas');
                if (canvas) redrawWireLines();
            },
            onComplete: () => {
                // After wire fades, show final instruction
                showTutorialFinalInstruction();
            }
        });
    } else {
        showTutorialFinalInstruction();
    }
}

// Show final tutorial instruction after correct cut
function showTutorialFinalInstruction() {
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const tutorialTitle = document.getElementById('tutorialTitle');
    const tutorialContent = document.getElementById('tutorialContent');
    const tutorialNextButton = document.getElementById('tutorialNextButton');
    
    if (tutorialOverlay && tutorialTitle && tutorialContent && tutorialNextButton) {
        tutorialTitle.textContent = '';
        tutorialContent.textContent = 'You cut the correct wire!';
        tutorialNextButton.textContent = 'MENU';
        tutorialNextButton.style.display = 'block';
        
        // Re-enable pointer events on overlay and button
        tutorialOverlay.style.pointerEvents = 'all';
        tutorialNextButton.style.pointerEvents = 'all';
        tutorialOverlay.style.display = 'flex';
    }
}

// End tutorial and return to start menu
function endTutorial() {
    tutorialMode = false;
    tutorialStep = 0;
    gameState.isCuttingEnabled = false;
    
    // Hide tutorial overlay
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    if (tutorialOverlay) {
        tutorialOverlay.style.display = 'none';
    }
    
    // Show tutorial next button (in case it was hidden)
    const tutorialNextButton = document.getElementById('tutorialNextButton');
    if (tutorialNextButton) {
        tutorialNextButton.style.display = 'block';
    }
    
    // Reset to round 1
    gameState.currentRound = 1;
    initializeRound(() => {
        // Ensure main sections are visible after tutorial
        const topSection = document.querySelector('.top-section');
        const middleSection = document.querySelector('.middle-section');
        if (topSection) topSection.style.opacity = '1';
        if (middleSection) middleSection.style.opacity = '1';

        // Position and show start menu 2 after round is initialized
        setTimeout(() => {
            positionStartMenu();
            const startMenu = document.getElementById('startMenu');
            const startMenu2 = document.getElementById('startMenu2');
            if (startMenu) {
                startMenu.style.display = 'none';
            }
            if (startMenu2) {
                startMenu2.style.display = 'flex';
            }
        }, 100);
    });
}

// Toggle pause state
function togglePause() {
    // Prevent multiple clicks during animation
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton && pauseButton.disabled) {
        return; // Already animating, ignore click
    }
    
    isPaused = !isPaused;
    const pauseOverlay = document.getElementById('pauseOverlay');
    const topSection = document.querySelector('.top-section');
    const middleSection = document.querySelector('.middle-section');
    
    // Disable button during animation
    if (pauseButton) {
        pauseButton.disabled = true;
    }
    
    if (isPaused) {
        // Stop timer
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Hide top and middle sections with opacity
        if (topSection) {
            topSection.classList.add('paused');
            topSection.style.opacity = '0'; // Force opacity via inline style as backup
        }
        if (middleSection) {
            middleSection.classList.add('paused');
            middleSection.style.opacity = '0'; // Force opacity via inline style as backup
        }
        
        // Show pause overlay
        if (pauseOverlay) {
            pauseOverlay.style.display = 'flex';
        }
        
        // Update button text
        if (pauseButton) {
            pauseButton.textContent = 'RESUME';
        }
        
        // Disable cutting
        gameState.isCuttingEnabled = false;
    } else {
        // Resume timer
        startTimer();
        
        // Show top and middle sections
        if (topSection) {
            topSection.classList.remove('paused');
            topSection.style.opacity = ''; // Remove inline style to allow CSS to control
        }
        if (middleSection) {
            middleSection.classList.remove('paused');
            middleSection.style.opacity = ''; // Remove inline style to allow CSS to control
        }
        
        // Hide pause overlay
        if (pauseOverlay) {
            pauseOverlay.style.display = 'none';
        }
        
        // Update button text
        if (pauseButton) {
            pauseButton.textContent = 'PAUSE';
        }
        
        // Re-enable cutting
        gameState.isCuttingEnabled = true;
    }
    
    // Re-enable button after animation completes (0.3s transition)
    setTimeout(() => {
        if (pauseButton) {
            pauseButton.disabled = false;
        }
    }, 300);
}

// Select one bad wire from each category
function selectBadWires() {
    const colorsPerCategory = getCurrentNumWires() / 3;
    const coolColors = getCategoryColors('cool');
    const warmColors = getCategoryColors('warm');
    const neutralColors = getCategoryColors('neutral');
    
    // Find indices of bad wires in their respective arrays
    gameState.badWires.cool = Math.floor(Math.random() * coolColors.length);
    gameState.badWires.warm = Math.floor(Math.random() * warmColors.length);
    gameState.badWires.neutral = Math.floor(Math.random() * neutralColors.length);
}

// Assign rules to each category
function assignRules() {
    const ruleIndices = [0, 1, 2];
    // Shuffle rule indices
    for (let i = ruleIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ruleIndices[i], ruleIndices[j]] = [ruleIndices[j], ruleIndices[i]];
    }
    
    gameState.rules.cool = RULE_SETS[ruleIndices[0]];
    gameState.rules.warm = RULE_SETS[ruleIndices[1]];
    gameState.rules.neutral = RULE_SETS[ruleIndices[2]];
}

// Update key stats display
function updateKeyStats() {
    const keyGroups = document.querySelectorAll('.key-group');
    
    keyGroups.forEach((group, groupIndex) => {
        const stats = group.querySelector('.key-stats');
        let rules;
        
        if (groupIndex === 0) {
            rules = gameState.rules.cool;
        } else if (groupIndex === 1) {
            rules = gameState.rules.warm;
        } else if (groupIndex === 2) {
            rules = gameState.rules.neutral;
        }
        
        if (stats && rules) {
            // Find which condition has BOMB/BAD
            let bombCondition = null;
            if (rules.same === 'BAD' || rules.same === 'BOMB') {
                bombCondition = 'SAME';
            } else if (rules.even === 'BAD' || rules.even === 'BOMB') {
                bombCondition = 'EVEN';
            } else if (rules.odd === 'BAD' || rules.odd === 'BOMB') {
                bombCondition = 'ODD';
            }
            
            // Show only the BOMB condition
            if (bombCondition) {
                stats.children[0].textContent = `BOMB = ${bombCondition} #`;
            }
        }
    });
}

// Assign numbers to top and bottom boxes based on rules
// Assign numbers to boxes based on number rules
function assignNumbers() {
    const topBoxes = document.querySelectorAll('.top-boxes .box');
    const bottomBoxes = document.querySelectorAll('.bottom-boxes .box');
    
    // Find the numbers rule if it exists
    const numbersRule = gameState.selectedRules.find(r => r.category === 'numbers');
    
    // Get wire connections
    const allConnections = originalWireConnections || [];

    // Guard against having more connections than the configured number of wires
    const expectedWires = getCurrentNumWires();
    const connections = allConnections.slice(0, expectedWires);
    
    // Safety check: ensure we have enough boxes
    if (topBoxes.length < connections.length || bottomBoxes.length < connections.length) {
        console.error(`Error in assignNumbers: Box count mismatch. Expected at least ${connections.length} boxes, got topBoxes: ${topBoxes.length}, bottomBoxes: ${bottomBoxes.length}. Expected wires: ${expectedWires}`);
        // Try to regenerate boxes
        generateBoxes();
        // Wait for DOM update and retry
        setTimeout(() => {
            assignNumbers();
        }, 50);
        return;
    }
    
    connections.forEach((connection, wireIndex) => {
        const topIndex = connection.topIndex;
        const bottomIndex = connection.bottomIndex;
        
        let topNum, bottomNum;
        
        // Check if numbers rule is in matchRules or excludeRules
        const numbersRuleMatched = connection.matchRules && connection.matchRules.find(r => r.category === 'numbers');
        const numbersRuleExcluded = connection.excludeRules && connection.excludeRules.find(r => r.category === 'numbers');
        
        if (numbersRule && connection.matchesRules >= 3) {
            // Wire matches all rules - numbers must match the rule
            if (numbersRule.key === 'even') {
                [topNum, bottomNum] = generateNumbersForCondition('even');
            } else if (numbersRule.key === 'odd') {
                [topNum, bottomNum] = generateNumbersForCondition('odd');
            } else if (numbersRule.key === 'same') {
                [topNum, bottomNum] = generateNumbersForCondition('same');
            } else {
                [topNum, bottomNum] = generateNumbersForCondition('even');
            }
        } else if (numbersRule && connection.matchesRules === 2) {
            // Wire matches 2 rules - check if numbers rule is in matchRules or excludeRules
            if (numbersRuleMatched) {
                // Numbers rule should be matched
                if (numbersRule.key === 'even') {
                    [topNum, bottomNum] = generateNumbersForCondition('even');
                } else if (numbersRule.key === 'odd') {
                    [topNum, bottomNum] = generateNumbersForCondition('odd');
                } else if (numbersRule.key === 'same') {
                    [topNum, bottomNum] = generateNumbersForCondition('same');
                } else {
                    [topNum, bottomNum] = generateNumbersForCondition('even');
                }
            } else if (numbersRuleExcluded) {
                // Numbers rule should be EXCLUDED - assign opposite
                if (numbersRule.key === 'even') {
                    [topNum, bottomNum] = generateNumbersForCondition('odd');
                } else if (numbersRule.key === 'odd') {
                    [topNum, bottomNum] = generateNumbersForCondition('even');
                } else if (numbersRule.key === 'same') {
                    [topNum, bottomNum] = generateNumbersForCondition('even'); // Use even (different) for same
                } else {
                    [topNum, bottomNum] = generateNumbersForCondition('even');
                }
            } else {
                // Numbers rule is not in matchRules or excludeRules
                // For wires with matchesRules === 2, if numbers is not explicitly in matchRules,
                // we MUST NOT match it, otherwise the wire will accidentally become 2/3
                // Assign numbers that DON'T match to preserve the 2/3 match count
                if (numbersRule.key === 'even') {
                    [topNum, bottomNum] = generateNumbersForCondition('odd');
                } else if (numbersRule.key === 'odd') {
                    [topNum, bottomNum] = generateNumbersForCondition('even');
                } else if (numbersRule.key === 'same') {
                    [topNum, bottomNum] = generateNumbersForCondition('even'); // Use even (different) for same
                } else {
                    [topNum, bottomNum] = generateNumbersForCondition('odd');
                }
            }
        } else if (numbersRule && connection.matchesRules === 1) {
            // Wire matches 1 rule - numbers should NOT match the rule
            if (numbersRule.key === 'even') {
                [topNum, bottomNum] = generateNumbersForCondition('odd');
            } else if (numbersRule.key === 'odd') {
                [topNum, bottomNum] = generateNumbersForCondition('even');
            } else if (numbersRule.key === 'same') {
                [topNum, bottomNum] = generateNumbersForCondition('even');
            } else {
                [topNum, bottomNum] = generateNumbersForCondition('even');
            }
        } else {
            // Wire matches 0 rules - random numbers that don't match
            if (numbersRule && numbersRule.key === 'even') {
                [topNum, bottomNum] = generateNumbersForCondition('odd');
            } else if (numbersRule && numbersRule.key === 'odd') {
                [topNum, bottomNum] = generateNumbersForCondition('even');
            } else {
                [topNum, bottomNum] = generateNumbersForCondition('even');
            }
        }
        
        // Safety check: ensure boxes exist before setting textContent
        if (topBoxes[topIndex] && bottomBoxes[bottomIndex]) {
            topBoxes[topIndex].textContent = topNum;
            bottomBoxes[bottomIndex].textContent = bottomNum;
        } else {
            console.error(`Error in assignNumbers: Missing box at wireIndex ${wireIndex}. topBox: ${!!topBoxes[topIndex]}, bottomBox: ${!!bottomBoxes[bottomIndex]}, topIndex: ${topIndex}, bottomIndex: ${bottomIndex}, total topBoxes: ${topBoxes.length}, total bottomBoxes: ${bottomBoxes.length}, connections: ${connections.length}`);
        }
    });
}

// Check for duplicate correct match counts after numbers are assigned
function checkForDuplicateCorrectAnswers() {
    const rules = gameState.selectedRules;
    const numbersRule = rules.find(r => r.category === 'numbers');
    const totalRules = rules.length;

    // With no fake rules, the correct match count is simply the total number of rules
    const correctMatchCount = totalRules;
    
    console.log('\n=== CHECKING FOR DUPLICATE CORRECT ANSWERS ===');
    console.log(`Correct match count should be: ${correctMatchCount}/${totalRules}`);
    
    // Helper to check if wire matches a rule (must mirror main rule logic)
    function matchesRule(wireProps, rule) {
        if (rule.category === 'color') {
            return wireProps.category === rule.key;
        } else if (rule.category === 'lineStyle') {
            return wireProps.isDotted === (rule.key === 'dotted');
        } else if (rule.category === 'circuits') {
            return wireProps.circuitColor === rule.key;
        } else if (rule.category === 'curvature') {
            return wireProps.isCurved === (rule.key === 'curved');
        } else if (rule.category === 'shape') {
            // wireProps.shapeKey is 'same' or 'different'
            return wireProps.shapeKey === rule.key;
        }
        return false;
    }
    
    // Get numbers from DOM boxes
    const topBoxes = document.querySelectorAll('.top-boxes .box');
    const bottomBoxes = document.querySelectorAll('.bottom-boxes .box');
    const connections = originalWireConnections || [];
    
    // Recalculate actual match counts for all wires (including numbers)
    const wiresWithActualCounts = gameState.wireAssignments.map((wire, wireIndex) => {
        const connection = connections[wireIndex];
        
        // Get number relationship
        let numberRelationship = 'unknown';
        if (connection && topBoxes[connection.topIndex] && bottomBoxes[connection.bottomIndex]) {
            const topNumText = topBoxes[connection.topIndex].textContent.trim();
            const bottomNumText = bottomBoxes[connection.bottomIndex].textContent.trim();
            const topNum = parseInt(topNumText);
            const bottomNum = parseInt(bottomNumText);
            
            if (!isNaN(topNum) && !isNaN(bottomNum)) {
                const sum = topNum + bottomNum;
                if (topNum === bottomNum) {
                    numberRelationship = 'same';
                } else if (sum % 2 === 0) {
                    numberRelationship = 'even';
                } else {
                    numberRelationship = 'odd';
                }
            }
        }
        
        // Count actual matches (including numbers)
        let actualMatchCount = 0;
        rules.forEach(rule => {
            if (rule.category === 'numbers') {
                if (numberRelationship === rule.key) {
                    actualMatchCount++;
                }
            } else {
                if (matchesRule(wire, rule)) {
                    actualMatchCount++;
                }
            }
        });
        
        return {
            wire,
            wireIndex,
            actualMatchCount,
            isCorrect: wire.isCorrect,
            connection,
            numberRelationship
        };
    });
    
    // Find all wires with the correct match count
    const wiresWithCorrectCount = wiresWithActualCounts.filter(w => w.actualMatchCount === correctMatchCount);
    
    // Color labels for display
    const COLOR_LABELS = {
        cool: ['green', 'neon green', 'cyan', 'blue', 'purple'],
        warm: ['yellow', 'orange', 'red', 'pink', 'magenta'],
        neutral: ['light grey', 'grey', 'black', 'brown', 'tan']
    };
    
    // Helper to get color label
    function getColorLabel(colorValue, category, indexInCategory) {
        if (category && typeof indexInCategory === 'number' && COLOR_LABELS[category] && COLOR_LABELS[category][indexInCategory]) {
            return COLOR_LABELS[category][indexInCategory];
        }
        // Fallback: try to find by color value
        const colorsPerCategory = getCurrentNumWires() / 3;
        for (let i = 0; i < colorsPerCategory; i++) {
            if (COLOR_PALETTES.cool[i] === colorValue && COLOR_LABELS.cool[i]) {
                return COLOR_LABELS.cool[i];
            }
            if (COLOR_PALETTES.warm[i] === colorValue && COLOR_LABELS.warm[i]) {
                return COLOR_LABELS.warm[i];
            }
            if (COLOR_PALETTES.neutral[i] === colorValue && COLOR_LABELS.neutral[i]) {
                return COLOR_LABELS.neutral[i];
            }
        }
        return colorValue; // Fallback to raw color value
    }
    
    console.log(`Found ${wiresWithCorrectCount.length} wire(s) with ${correctMatchCount}/${totalRules} matches:`);
    wiresWithCorrectCount.forEach(({ wire, wireIndex, actualMatchCount, isCorrect, numberRelationship }) => {
        const colorLabel = getColorLabel(wire.color, wire.category, wire.indexInCategory);
        console.log(`  Wire ${wireIndex} (${colorLabel.toUpperCase()}): ${actualMatchCount}/${totalRules} - isCorrect=${isCorrect}, numberRelationship=${numberRelationship}, color=${wire.color}, category=${wire.category}, dotted=${wire.isDotted}, circuit=${wire.circuitColor}, curved=${wire.isCurved}`);
    });
    
    // Check for duplicates (more than 1 wire with correct match count)
    if (wiresWithCorrectCount.length > 1) {
        console.log('\nDUPLICATE FOUND!!!');
        console.log(`Found ${wiresWithCorrectCount.length} wires with ${correctMatchCount}/${totalRules} matches! Only 1 should have this count.`);
        
        // Keep the correct wire, change all others to match 0 rules
        const correctWire = wiresWithCorrectCount.find(w => w.isCorrect);
        const duplicateWires = wiresWithCorrectCount.filter(w => !w.isCorrect);
        
        if (!correctWire) {
            console.error('  ERROR: No correct wire found among duplicates!');
            // Mark the first one as correct
            wiresWithCorrectCount[0].wire.isCorrect = true;
            wiresWithCorrectCount[0].isCorrect = true;
            duplicateWires.push(...wiresWithCorrectCount.slice(1));
        }
        
        const correctColorLabel = correctWire ? getColorLabel(correctWire.wire.color, correctWire.wire.category, correctWire.wire.indexInCategory) : getColorLabel(wiresWithCorrectCount[0].wire.color, wiresWithCorrectCount[0].wire.category, wiresWithCorrectCount[0].wire.indexInCategory);
        console.log(`  Keeping correct wire (index ${correctWire ? correctWire.wireIndex : wiresWithCorrectCount[0].wireIndex}, color: ${correctColorLabel.toUpperCase()})`);
        console.log(`  Fixing ${duplicateWires.length} duplicate wire(s) to match 0 rules`);
        
        duplicateWires.forEach(({ wire, wireIndex, connection }) => {
            const colorLabelBefore = getColorLabel(wire.color, wire.category, wire.indexInCategory);
            const beforeState = {
                color: wire.color,
                colorLabel: colorLabelBefore,
                category: wire.category,
                isDotted: wire.isDotted,
                circuitColor: wire.circuitColor,
                isCurved: wire.isCurved,
                matchesRules: wire.matchesRules
            };
            
            console.log(`\n  BEFORE FIX - Wire ${wireIndex} (${colorLabelBefore.toUpperCase()}):`);
            console.log(`    Color: ${beforeState.color} (${beforeState.colorLabel.toUpperCase()})`);
            console.log(`    Category: ${beforeState.category}`);
            console.log(`    Dotted: ${beforeState.isDotted}`);
            console.log(`    Circuit: ${beforeState.circuitColor}`);
            console.log(`    Curved: ${beforeState.isCurved}`);
            console.log(`    Matches: ${beforeState.matchesRules}`);
            
            // Change all properties to NOT match any rules
            
            // Color: use a color that doesn't match any color rule AND isn't already used
            const colorRule = rules.find(r => r.category === 'color');
            if (colorRule) {
                // Get all currently used colors (from both wireAssignments and connections, excluding the wire we're fixing)
                const usedColors = new Set();
                gameState.wireAssignments.forEach((w, idx) => {
                    if (idx !== wireIndex && w.color) {
                        usedColors.add(w.color);
                    }
                });
                if (originalWireConnections) {
                    originalWireConnections.forEach((conn, idx) => {
                        if (idx !== wireIndex && conn.color) {
                            usedColors.add(conn.color);
                        }
                    });
                }
                
                const colorsPerCategory = getCurrentNumWires() / 3;
                const allAvailableColors = [];
                for (let i = 0; i < colorsPerCategory; i++) {
                    if (COLOR_PALETTES.cool[i]) allAvailableColors.push({ color: COLOR_PALETTES.cool[i], category: 'cool', index: i });
                    if (COLOR_PALETTES.warm[i]) allAvailableColors.push({ color: COLOR_PALETTES.warm[i], category: 'warm', index: i });
                    if (COLOR_PALETTES.neutral[i]) allAvailableColors.push({ color: COLOR_PALETTES.neutral[i], category: 'neutral', index: i });
                }
                
                // Find a color that doesn't match the color rule AND isn't already used
                const nonMatchingColor = allAvailableColors.find(c => 
                    c.category !== colorRule.key && !usedColors.has(c.color)
                );
                
                if (nonMatchingColor) {
                    const colorLabelNew = getColorLabel(nonMatchingColor.color, nonMatchingColor.category, nonMatchingColor.index);
                    console.log(`    Changing color from ${colorLabelBefore.toUpperCase()} to ${colorLabelNew.toUpperCase()} (not used, doesn't match rule)`);
                    
                    wire.color = nonMatchingColor.color;
                    wire.category = nonMatchingColor.category;
                    wire.indexInCategory = nonMatchingColor.index;
                    
                    // Update the connection to reflect the new color
                    if (connection) {
                        connection.color = nonMatchingColor.color;
                        connection.category = nonMatchingColor.category;
                        connection.indexInCategory = nonMatchingColor.index;
                    }
                } else {
                    console.warn(`  WARNING: Could not find unused non-matching color for wire ${wireIndex}. Used colors: ${Array.from(usedColors).join(', ')}`);
                }
            }
            
            // LineStyle: opposite of line style rule
            const lineStyleRule = rules.find(r => r.category === 'lineStyle');
            if (lineStyleRule) {
                wire.isDotted = !(lineStyleRule.key === 'dotted');
                if (connection) {
                    connection.isDotted = wire.isDotted;
                }
            }
            
            // Circuits: opposite of circuit rule
            const circuitsRule = rules.find(r => r.category === 'circuits');
            if (circuitsRule) {
                if (circuitsRule.key === 'dark') wire.circuitColor = 'light';
                else if (circuitsRule.key === 'light') wire.circuitColor = 'dark';
                else if (circuitsRule.key === 'opposite') wire.circuitColor = 'dark'; // For 'opposite' rule, set to 'dark' to not match
                else wire.circuitColor = 'dark';
                
                if (connection) {
                    connection.circuitColor = wire.circuitColor;
                    // Update circuit box colors based on circuitColor
                    let newTopBoxColor, newBottomBoxColor;
                    if (wire.circuitColor === 'dark') {
                        newTopBoxColor = 'linear-gradient(to bottom, #555555, #333333)';
                        newBottomBoxColor = 'linear-gradient(to bottom, #555555, #333333)';
                    } else if (wire.circuitColor === 'light') {
                        newTopBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
                        newBottomBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
                    } else if (wire.circuitColor === 'opposite') {
                        // Opposite: one dark, one light
                        newTopBoxColor = 'linear-gradient(to bottom, #555555, #333333)';
                        newBottomBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
                    } else {
                        // Default to light
                        newTopBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
                        newBottomBoxColor = 'linear-gradient(to bottom, #999999, #777777)';
                    }
                    
                    connection.topBoxColor = newTopBoxColor;
                    connection.bottomBoxColor = newBottomBoxColor;
                    
                    // Update DOM boxes to match
                    const topBoxes = document.querySelectorAll('.top-boxes .box');
                    const bottomBoxes = document.querySelectorAll('.bottom-boxes .box');
                    if (topBoxes[connection.topIndex]) {
                        topBoxes[connection.topIndex].style.background = newTopBoxColor;
                    }
                    if (bottomBoxes[connection.bottomIndex]) {
                        bottomBoxes[connection.bottomIndex].style.background = newBottomBoxColor;
                    }
                    
                    // Update wireLines if it exists
                    if (wireLines && wireLines.length > 0) {
                        const matchingWireLine = wireLines.find(w => 
                            w.topIndex === connection.topIndex && 
                            w.bottomIndex === connection.bottomIndex
                        );
                        if (matchingWireLine) {
                            matchingWireLine.topBoxColor = newTopBoxColor;
                            matchingWireLine.bottomBoxColor = newBottomBoxColor;
                        }
                    }
                }
            }
            
            // Curvature: opposite of curvature rule
            const curvatureRule = rules.find(r => r.category === 'curvature');
            if (curvatureRule) {
                wire.isCurved = !(curvatureRule.key === 'curved');
                if (connection) {
                    connection.isCurved = wire.isCurved;
                }
            }
            
            // Numbers: assign opposite numbers
            if (numbersRule && connection) {
                let newTopNum, newBottomNum;
                if (numbersRule.key === 'even') {
                    [newTopNum, newBottomNum] = generateNumbersForCondition('odd');
                } else if (numbersRule.key === 'odd') {
                    [newTopNum, newBottomNum] = generateNumbersForCondition('even');
                } else if (numbersRule.key === 'same') {
                    [newTopNum, newBottomNum] = generateNumbersForCondition('even');
                } else {
                    [newTopNum, newBottomNum] = generateNumbersForCondition('odd');
                }
                
                if (topBoxes[connection.topIndex] && bottomBoxes[connection.bottomIndex]) {
                    topBoxes[connection.topIndex].textContent = newTopNum;
                    bottomBoxes[connection.bottomIndex].textContent = newBottomNum;
                }
            }
            
            // Update stored match count
            wire.matchesRules = 0;
            wire.isCorrect = false; // Ensure duplicate wire is marked as not correct
            if (connection) {
                connection.matchesRules = 0;
                connection.isCorrect = false; // Sync connection isCorrect with wire
            }
            
            const colorLabelAfter = getColorLabel(wire.color, wire.category, wire.indexInCategory);
            const afterState = {
                color: wire.color,
                colorLabel: colorLabelAfter,
                category: wire.category,
                isDotted: wire.isDotted,
                circuitColor: wire.circuitColor,
                isCurved: wire.isCurved,
                matchesRules: wire.matchesRules
            };
            
            console.log(`  AFTER FIX - Wire ${wireIndex} (${colorLabelAfter.toUpperCase()}):`);
            console.log(`    Color: ${afterState.color} (${afterState.colorLabel.toUpperCase()})`);
            console.log(`    Category: ${afterState.category}`);
            console.log(`    Dotted: ${afterState.isDotted}`);
            console.log(`    Circuit: ${afterState.circuitColor}`);
            console.log(`    Curved: ${afterState.isCurved}`);
            console.log(`    Matches: ${afterState.matchesRules}`);
            console.log(`  ✓ Fixed wire ${wireIndex} from ${colorLabelBefore.toUpperCase()} to ${colorLabelAfter.toUpperCase()} (0 matches)`);
        });
        
        // Ensure correct wire's connection has isCorrect=true
        if (correctWire && correctWire.connection) {
            correctWire.wire.isCorrect = true;
            correctWire.connection.isCorrect = true;
            console.log(`  Verified correct wire ${correctWire.wireIndex} connection.isCorrect = true`);
        } else if (wiresWithCorrectCount[0] && wiresWithCorrectCount[0].connection) {
            // If no explicit correct wire found, mark first one
            wiresWithCorrectCount[0].wire.isCorrect = true;
            wiresWithCorrectCount[0].connection.isCorrect = true;
            console.log(`  Marked first wire ${wiresWithCorrectCount[0].wireIndex} as correct (connection.isCorrect = true)`);
        }
        
        // Sync all wire isCorrect properties with their connections
        gameState.wireAssignments.forEach((wire, idx) => {
            if (originalWireConnections && originalWireConnections[idx]) {
                originalWireConnections[idx].isCorrect = wire.isCorrect;
            }
        });
        
        // Redraw the wires to reflect the updated properties
        drawConnectingLines(true);
        
        console.log('  Validation complete - duplicate wires fixed to 0 matches');
    } else {
        console.log('  No duplicates found - only 1 wire has the correct match count');
    }
    console.log('=== END DUPLICATE CHECK ===\n');
}

// Verify all circuit colors match their actual box colors
function verifyOppositeCircuitColors() {
    console.log('=== VERIFYING ALL CIRCUIT COLORS ===');
    
    const darkGradient = 'linear-gradient(to bottom, #555555, #333333)';
    const lightGradient = 'linear-gradient(to bottom, #999999, #777777)';
    const topBoxes = document.querySelectorAll('.top-boxes .box');
    const bottomBoxes = document.querySelectorAll('.bottom-boxes .box');
    
    // Helper function to get color label
    function getColorLabel(colorValue, category, indexInCategory) {
        const COLOR_LABELS = {
            cool: ['green', 'neon green', 'cyan', 'blue', 'purple'],
            warm: ['yellow', 'orange', 'red', 'pink', 'magenta'],
            neutral: ['light grey', 'grey', 'black', 'brown', 'tan']
        };
        if (category && typeof indexInCategory === 'number' && COLOR_LABELS[category] && COLOR_LABELS[category][indexInCategory]) {
            return COLOR_LABELS[category][indexInCategory];
        }
        return colorValue;
    }
    
    // Helper function to determine what box colors SHOULD be based on circuitColor
    function getExpectedBoxColors(circuitColor) {
        if (circuitColor === 'dark') {
            return {
                top: darkGradient,
                bottom: darkGradient
            };
        } else if (circuitColor === 'light') {
            return {
                top: lightGradient,
                bottom: lightGradient
            };
        } else if (circuitColor === 'opposite') {
            return {
                top: darkGradient,
                bottom: lightGradient
            };
        } else {
            // Default to light
            return {
                top: lightGradient,
                bottom: lightGradient
            };
        }
    }
    
    let errorsFound = false;
    
    // Check all connections
    if (originalWireConnections && originalWireConnections.length > 0) {
        originalWireConnections.forEach((connection, index) => {
            const circuitColor = connection.circuitColor || 'light'; // Default to light if undefined
            const topIndex = connection.topIndex;
            const bottomIndex = connection.bottomIndex;
            
            // Get ACTUAL DOM box colors (what's actually displayed)
            const actualTopBox = topBoxes[topIndex];
            const actualBottomBox = bottomBoxes[bottomIndex];
            
            if (!actualTopBox || !actualBottomBox) {
                console.warn(`  Warning: Wire ${index} has invalid box indices (topIndex=${topIndex}, bottomIndex=${bottomIndex})`);
                return;
            }
            
            // Get computed style - try style.background first, then computed style
            let actualTopColor = actualTopBox.style.background || '';
            let actualBottomColor = actualBottomBox.style.background || '';
            
            // If style.background is empty, try to get computed style
            if (!actualTopColor && window.getComputedStyle) {
                const computedTop = window.getComputedStyle(actualTopBox);
                actualTopColor = computedTop.background || computedTop.backgroundColor || '';
            }
            if (!actualBottomColor && window.getComputedStyle) {
                const computedBottom = window.getComputedStyle(actualBottomBox);
                actualBottomColor = computedBottom.background || computedBottom.backgroundColor || '';
            }
            
            // Determine what the box colors SHOULD be based on circuitColor
            const expectedColors = getExpectedBoxColors(circuitColor);
            const expectedTopColor = expectedColors.top;
            const expectedBottomColor = expectedColors.bottom;
            
            // Check if actual DOM colors match expected colors
            // Normalize gradient strings for comparison (remove whitespace differences)
            const normalizeGradient = (grad) => grad ? grad.replace(/\s+/g, ' ').trim() : '';
            const normalizedActualTop = normalizeGradient(actualTopColor);
            const normalizedActualBottom = normalizeGradient(actualBottomColor);
            const normalizedExpectedTop = normalizeGradient(expectedTopColor);
            const normalizedExpectedBottom = normalizeGradient(expectedBottomColor);
            
            const topMatches = (normalizedActualTop === normalizedExpectedTop || normalizedActualTop.includes('#555555') === normalizedExpectedTop.includes('#555555'));
            const bottomMatches = (normalizedActualBottom === normalizedExpectedBottom || normalizedActualBottom.includes('#555555') === normalizedExpectedBottom.includes('#555555'));
            
            // More robust check: check if gradients contain the right colors
            // Handle both hex (#555555, #333333) and rgb (rgb(85, 85, 85), rgb(51, 51, 51)) formats
            // Dark colors: #555555 = rgb(85, 85, 85), #333333 = rgb(51, 51, 51)
            // Light colors: #999999 = rgb(153, 153, 153), #777777 = rgb(119, 119, 119)
            const topIsDark = normalizedActualTop.includes('#555555') || normalizedActualTop.includes('#333333') ||
                              normalizedActualTop.includes('rgb(85, 85, 85)') || normalizedActualTop.includes('rgb(51, 51, 51)') ||
                              normalizedActualTop.includes('rgb(85,85,85)') || normalizedActualTop.includes('rgb(51,51,51)');
            const topIsLight = normalizedActualTop.includes('#999999') || normalizedActualTop.includes('#777777') ||
                               normalizedActualTop.includes('rgb(153, 153, 153)') || normalizedActualTop.includes('rgb(119, 119, 119)') ||
                               normalizedActualTop.includes('rgb(153,153,153)') || normalizedActualTop.includes('rgb(119,119,119)');
            const bottomIsDark = normalizedActualBottom.includes('#555555') || normalizedActualBottom.includes('#333333') ||
                                 normalizedActualBottom.includes('rgb(85, 85, 85)') || normalizedActualBottom.includes('rgb(51, 51, 51)') ||
                                 normalizedActualBottom.includes('rgb(85,85,85)') || normalizedActualBottom.includes('rgb(51,51,51)');
            const bottomIsLight = normalizedActualBottom.includes('#999999') || normalizedActualBottom.includes('#777777') ||
                                  normalizedActualBottom.includes('rgb(153, 153, 153)') || normalizedActualBottom.includes('rgb(119, 119, 119)') ||
                                  normalizedActualBottom.includes('rgb(153,153,153)') || normalizedActualBottom.includes('rgb(119,119,119)');
            
            let topMatchesExpected = false;
            let bottomMatchesExpected = false;
            
            if (circuitColor === 'dark') {
                topMatchesExpected = topIsDark && !topIsLight;
                bottomMatchesExpected = bottomIsDark && !bottomIsLight;
            } else if (circuitColor === 'light') {
                topMatchesExpected = topIsLight && !topIsDark;
                bottomMatchesExpected = bottomIsLight && !bottomIsDark;
            } else if (circuitColor === 'opposite') {
                topMatchesExpected = topIsDark && !topIsLight;
                bottomMatchesExpected = bottomIsLight && !bottomIsDark;
            }
            
            if (!topMatchesExpected || !bottomMatchesExpected) {
                errorsFound = true;
                const colorLabel = getColorLabel(connection.color, connection.category, connection.indexInCategory);
                console.error(`CIRCUIT ERROR: Wire ${index} (${colorLabel.toUpperCase()}) has circuitColor='${circuitColor}' but DOM box colors don't match.`);
                console.error(`  Expected: top=${circuitColor === 'opposite' ? 'dark' : circuitColor}, bottom=${circuitColor === 'opposite' ? 'light' : circuitColor}`);
                console.error(`  Actual DOM: top=${topIsDark ? 'dark' : topIsLight ? 'light' : 'unknown'}, bottom=${bottomIsDark ? 'dark' : bottomIsLight ? 'light' : 'unknown'}`);
                console.error(`  Actual values: top='${actualTopColor}', bottom='${actualBottomColor}'`);
                console.error(`  Fixing...`);
                
                // Fix: set to expected colors
                const newTopBoxColor = expectedTopColor;
                const newBottomBoxColor = expectedBottomColor;
                
                // Update DOM boxes first (this is what's actually displayed)
                actualTopBox.style.background = newTopBoxColor;
                actualBottomBox.style.background = newBottomBoxColor;
                
                // Update connection (to keep stored values in sync)
                connection.topBoxColor = newTopBoxColor;
                connection.bottomBoxColor = newBottomBoxColor;
                
                // Update wireLines if it exists - match by topIndex and bottomIndex
                if (wireLines && wireLines.length > 0) {
                    const matchingWireLine = wireLines.find(w => 
                        w.topIndex === topIndex && 
                        w.bottomIndex === bottomIndex
                    );
                    if (matchingWireLine) {
                        matchingWireLine.topBoxColor = newTopBoxColor;
                        matchingWireLine.bottomBoxColor = newBottomBoxColor;
                    }
                }
                
                console.log(`  Fixed: Wire ${index} - top=${newTopBoxColor}, bottom=${newBottomBoxColor}`);
            }
        });
    }
    
    if (!errorsFound) {
        console.log('  All circuit colors verified correctly');
    }
    console.log('=== END VERIFYING ALL CIRCUIT COLORS ===\n');
}

function assignNumbers_OLD() {
    const topBoxes = document.querySelectorAll('.top-boxes .box');
    const bottomBoxes = document.querySelectorAll('.bottom-boxes .box');
    const allColors = getAllColors();
    
    // Get wire connections from the drawn lines
    const canvas = document.getElementById('linesCanvas');
    const topBoxesArray = Array.from(topBoxes);
    const bottomBoxesArray = Array.from(bottomBoxes);
    
    // We need to track which color is connected to which boxes
    const colorsPerCategory = getCurrentNumWires() / 3;
    allColors.forEach((color, colorIndex) => {
        let category = 'cool';
        let indexInCategory = colorIndex;
        if (colorIndex >= colorsPerCategory) {
            if (colorIndex < colorsPerCategory * 2) {
                category = 'warm';
                indexInCategory = colorIndex - colorsPerCategory;
            } else {
                category = 'neutral';
                indexInCategory = colorIndex - colorsPerCategory * 2;
            }
        }
        const isBad = 
            (category === 'cool' && indexInCategory === gameState.badWires.cool) ||
            (category === 'warm' && indexInCategory === gameState.badWires.warm) ||
            (category === 'neutral' && indexInCategory === gameState.badWires.neutral);
        
        const rules = gameState.rules[category];
        
        // Determine which condition the bad wire should satisfy
        let badCondition = null;
        if (rules.same === 'BAD') badCondition = 'same';
        else if (rules.even === 'BAD') badCondition = 'even';
        else if (rules.odd === 'BAD') badCondition = 'odd';
        
        // Get the wire connection (we need to track this from drawConnectingLines)
        // For now, we'll use the shuffled indices from the drawConnectingLines function
        // We need to modify drawConnectingLines to store the connections
    });
    
    // Store connections and assign numbers
    const connections = getWireConnections();
    connections.forEach((connection, index) => {
        const { color, topIndex, bottomIndex, category, indexInCategory, isDotted } = connection;
        
        const isBad = 
            (category === 'cool' && indexInCategory === gameState.badWires.cool) ||
            (category === 'warm' && indexInCategory === gameState.badWires.warm) ||
            (category === 'neutral' && indexInCategory === gameState.badWires.neutral);
        
        const rules = gameState.rules[category];
        
        // Determine which condition the bad wire should satisfy
        let badCondition = null;
        if (rules.same === 'BAD') badCondition = 'same';
        else if (rules.even === 'BAD') badCondition = 'even';
        else if (rules.odd === 'BAD') badCondition = 'odd';
        
        let topNum, bottomNum;
        
        if (isBad) {
            // Bad wire must satisfy the BAD condition (reversed if dotted)
            if (isDotted) {
                // Reverse the condition: same -> different, even -> odd, odd -> even
                let reversedCondition;
                if (badCondition === 'same') {
                    // Use 'different' (not same) - we'll generate numbers that are different
                    reversedCondition = 'different';
                } else if (badCondition === 'even') {
                    reversedCondition = 'odd';
                } else if (badCondition === 'odd') {
                    reversedCondition = 'even';
                } else {
                    reversedCondition = badCondition;
                }
                [topNum, bottomNum] = generateNumbersForCondition(reversedCondition);
            } else {
                [topNum, bottomNum] = generateNumbersForCondition(badCondition);
            }
        } else {
            // Good wire must satisfy one of the OK conditions AND NOT satisfy the BAD condition (reversed if dotted)
            const okConditions = [];
            if (rules.same === 'OK') okConditions.push('same');
            if (rules.even === 'OK') okConditions.push('even');
            if (rules.odd === 'OK') okConditions.push('odd');
            
            if (isDotted) {
                // Reverse the OK conditions: same -> different, even -> odd, odd -> even
                const reversedOkConditions = okConditions.map(cond => {
                    if (cond === 'same') return 'different';
                    if (cond === 'even') return 'odd';
                    if (cond === 'odd') return 'even';
                    return cond;
                });
                
                // Also reverse the bad condition check
                let reversedBadCondition = null;
                if (badCondition === 'same') reversedBadCondition = 'different';
                else if (badCondition === 'even') reversedBadCondition = 'odd';
                else if (badCondition === 'odd') reversedBadCondition = 'even';
                
                // Generate numbers that satisfy a reversed OK condition but not the reversed BAD condition
                let valid = false;
                let attempts = 0;
                while (!valid && attempts < 100) {
                    const okCondition = reversedOkConditions[Math.floor(Math.random() * reversedOkConditions.length)];
                    [topNum, bottomNum] = generateNumbersForCondition(okCondition);
                    
                    // Check if it satisfies the reversed bad condition (if so, it's invalid)
                    const satisfiesBad = 
                        (reversedBadCondition === 'different' && topNum === bottomNum) ||
                        (reversedBadCondition === 'even' && (topNum + bottomNum) % 2 === 0) ||
                        (reversedBadCondition === 'odd' && (topNum + bottomNum) % 2 === 1);
                    
                    if (!satisfiesBad) {
                        valid = true;
                    }
                    attempts++;
                }
                
                // Fallback
                if (!valid) {
                    const okCondition = reversedOkConditions[Math.floor(Math.random() * reversedOkConditions.length)];
                    [topNum, bottomNum] = generateNumbersForCondition(okCondition);
                }
            } else {
                // Normal logic for non-dotted wires
                let valid = false;
                let attempts = 0;
                while (!valid && attempts < 100) {
                    const okCondition = okConditions[Math.floor(Math.random() * okConditions.length)];
                    [topNum, bottomNum] = generateNumbersForCondition(okCondition);
                    
                    // Check if it satisfies the bad condition (if so, it's invalid)
                    const satisfiesBad = 
                        (badCondition === 'same' && topNum === bottomNum) ||
                        (badCondition === 'even' && (topNum + bottomNum) % 2 === 0) ||
                        (badCondition === 'odd' && (topNum + bottomNum) % 2 === 1);
                    
                    if (!satisfiesBad) {
                        valid = true;
                    }
                    attempts++;
                }
                
                // Fallback
                if (!valid) {
                    const okCondition = okConditions[Math.floor(Math.random() * okConditions.length)];
                    [topNum, bottomNum] = generateNumbersForCondition(okCondition);
                }
            }
        }
        
        topBoxes[topIndex].textContent = topNum;
        bottomBoxes[bottomIndex].textContent = bottomNum;
    });
}

// Generate numbers (0, 1, 2, or 3) that satisfy a condition
function generateNumbersForCondition(condition) {
    let num1, num2;
    const numRange = 4; // Numbers from 0 to 3
    
    switch(condition) {
        case 'same':
            // Same numbers - vary them (0,0 or 1,1 or 2,2 or 3,3)
            num1 = num2 = Math.floor(Math.random() * numRange);
            break;
        case 'even':
            // Even sum, numbers must be different: (0,2), (2,0), (1,3), (3,1)
            const evenPairs = [[0,2], [2,0], [1,3], [3,1]];
            [num1, num2] = evenPairs[Math.floor(Math.random() * evenPairs.length)];
            break;
        case 'odd':
            // Odd sum, numbers must be different: (0,1), (1,0), (0,3), (3,0), (1,2), (2,1), (2,3), (3,2)
            const oddPairs = [[0,1], [1,0], [0,3], [3,0], [1,2], [2,1], [2,3], [3,2]];
            [num1, num2] = oddPairs[Math.floor(Math.random() * oddPairs.length)];
            break;
        default:
            num1 = num2 = 0; // Fallback
    }
    
    return [num1, num2];
}

// Get wire connections using the stored shuffled indices
function getWireConnections() {
    // Use originalWireConnections if available (includes isDotted)
    if (originalWireConnections && originalWireConnections.length > 0) {
        return originalWireConnections;
    }
    
    const allColors = getAllColors();
    
    const connections = [];
    const colorsPerCategory = getCurrentNumWires() / 3;
    allColors.forEach((color, colorIndex) => {
        let category = 'cool';
        let indexInCategory = colorIndex;
        if (colorIndex >= colorsPerCategory) {
            if (colorIndex < colorsPerCategory * 2) {
                category = 'warm';
                indexInCategory = colorIndex - colorsPerCategory;
            } else {
                category = 'neutral';
                indexInCategory = colorIndex - colorsPerCategory * 2;
            }
        }
        
        connections.push({
            color,
            topIndex: globalTopIndices[colorIndex],
            bottomIndex: globalBottomIndices[colorIndex],
            category,
            indexInCategory,
            isDotted: false // Fallback
        });
    });
    
    return connections;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    
    // Add cut gesture handlers to middle section
    const middleSection = document.querySelector('.middle-section');
    
    // Mouse events
    middleSection.addEventListener('mousedown', handleCutStart);
    middleSection.addEventListener('mousemove', handleCutMove);
    middleSection.addEventListener('mouseup', handleCutEnd);
    middleSection.addEventListener('mouseleave', handleCutEnd);
    
    // Touch events
    middleSection.addEventListener('touchstart', handleCutStart, { passive: false });
    middleSection.addEventListener('touchmove', handleCutMove, { passive: false });
    middleSection.addEventListener('touchend', handleCutEnd, { passive: false });
    middleSection.addEventListener('touchcancel', handleCutEnd, { passive: false });
    
    // Redraw lines on window resize (update positions only, don't shuffle)
    window.addEventListener('resize', () => {
        setTimeout(() => {
            // Update wire positions only, don't create new connections
            drawConnectingLines(true);
        }, 100);
    });
    
    // Pause button handler
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }
    
    // Start menu button handlers
    const playButton = document.getElementById('playButton');
    const startMenu2 = document.getElementById('startMenu2');
    const startButton = document.getElementById('startButton');
    const tutorialButton = document.getElementById('tutorialButton');
    
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (defuserSounds.click) defuserSounds.click.play();
            // Hide start menu and show start menu 2
            const startMenu = document.getElementById('startMenu');
            if (startMenu) {
                startMenu.style.display = 'none';
            }
            if (startMenu2) {
                startMenu2.style.display = 'flex';
            }
        });
    }
    
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (defuserSounds.click) defuserSounds.click.play();
            startGame();
        });
    }
    
    if (tutorialButton) {
        tutorialButton.addEventListener('click', showTutorial);
    }
    
    // Tutorial next button handler
    const tutorialNextButton = document.getElementById('tutorialNextButton');
    if (tutorialNextButton) {
        tutorialNextButton.addEventListener('click', nextTutorialStep);
    }
    
    // Keyboard shortcut: 'g' key to trigger correct answer
    // Keyboard shortcut: 'h' key to trigger correct answer and skip to round 6
    // Keyboard shortcut: 'u' key to drop timer to 3 seconds (fast test)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'g' || event.key === 'G') {
            // Only trigger if cutting is enabled (game is active)
            if (gameState.isCuttingEnabled) {
                event.preventDefault();
                // Find the correct wire
                const correctWire = gameState.wireAssignments.find(w => w.isCorrect === true);
                if (correctWire) {
                    handleCorrectAnswer(correctWire);
                }
            }
        } else if (event.key === 'h' || event.key === 'H') {
            // Skip to round 6
            if (gameState.isCuttingEnabled) {
                event.preventDefault();
                // Set round to 5, then handle correct answer to advance to 6
                gameState.currentRound = 5;
                const correctWire = gameState.wireAssignments.find(w => w.isCorrect === true);
                if (correctWire) {
                    handleCorrectAnswer(correctWire);
                }
            }
        } else if (event.key === 'u' || event.key === 'U') {
            // Testing key: force remaining time to 3 seconds
            gameState.timeRemaining = 3;
            updateTimer();
        }
    });
});

console.log('Game 10 initialized');

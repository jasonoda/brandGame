// Configuration - change these values to adjust the game
const numAttributes = 5; // Number of colors, shapes, and dot counts
const gridRows = 6;
const gridCols = 6;
const numPeople = gridRows * gridCols; // 16
const killerKillsSimilarPeople = false; // If true, killer prioritizes people with traits in common. If false, kills randomly.

// Visual variation mode: use emojis instead of shapes, colored backgrounds, and horizontal dots
// Controlled by URL parameter `suspectMode`:
//   suspectMode=emoji   -> use emojis
//   suspectMode=classic -> use original shapes
let useEmojis = true; // default ON
const suspectUrlParams = new URLSearchParams(window.location.search);
const suspectModeParam = suspectUrlParams.get('suspectMode');
if (suspectModeParam === 'classic') {
    useEmojis = false;
} else if (suspectModeParam === 'emoji') {
    useEmojis = true;
}

// Get emojis from gameVars - will be called dynamically to get current theme
// Note: getSuspectEmojis() is called each time emojis are needed to ensure current theme

// Helper function to get color letter from hex
function getColorLetter(colorHex) {
    if (!colorHex) {
        console.error('getColorLetter called with undefined/null colorHex');
        return 'r';
    }
    const colorMap = {
        '#e63946': 'r', // red
        '#1a7a3d': 'g', // green
        '#3a5ec6': 'b', // blue
        '#f77f00': 'o', // orange
        '#8338ec': 'p'  // purple
    };
    const letter = colorMap[colorHex.toLowerCase()];
    if (!letter) {
        console.error(`Unknown color hex: "${colorHex}", defaulting to 'r'. Available colors:`, Object.keys(colorMap));
        return 'r';
    }
    return letter;
}

// Helper function to get shape name from index
function getShapeName(shapeIndex) {
    const shapeMap = {
        1: 'square',
        2: 'rounded',
        3: 'circle',
        4: 'octagon',
        5: 'arrow'
    };
    return shapeMap[shapeIndex] || 'square';
}

// Update instructions text based on mode
const suspectInstructionLines = document.querySelectorAll('#instructionsStartDiv .instructionLine');
if (suspectInstructionLines[1]) {
    suspectInstructionLines[1].innerHTML = useEmojis
        ? 'each person has a<br>color, image, and number'
        : 'each person has a<br>color, shape, and number';
}

const gameArea = document.getElementById('gameArea');
// Set grid dimensions dynamically - use CSS for responsive sizing
gameArea.style.gridTemplateColumns = `repeat(${gridCols}, var(--cell-size, 70px))`;
gameArea.style.gridTemplateRows = `repeat(${gridRows}, var(--cell-size, 70px))`;
gameArea.style.setProperty('--grid-cols', gridCols);
gameArea.style.setProperty('--grid-rows', gridRows);

const colors = [
    '#e63946', // red
    '#1a7a3d', // dark green
    '#3a5ec6', // blue
    '#f77f00', // orange
    '#8338ec'  // purple
].slice(0, numAttributes); // Use only the first numAttributes colors

// Pick killer randomly
let killerIndex = Math.floor(Math.random() * numPeople);
let savedAssignments = null;

// Assign killer random attributes (or use saved)
let killerColor, killerShape, killerDots;
if (savedAssignments) {
    killerColor = savedAssignments.killerColor;
    killerShape = savedAssignments.killerShape;
    killerDots = savedAssignments.killerDots;
    console.log('[Suspect] Using saved killer attributes');
} else {
    killerColor = colors[Math.floor(Math.random() * colors.length)];
    killerShape = Math.floor(Math.random() * numAttributes) + 1;
    killerDots = Math.floor(Math.random() * numAttributes) + 1;
    console.log('[Suspect] Generating new killer attributes');
}

// Initialize arrays for all people (or use saved)
let colorAssignments, shapeAssignments, dotAssignments;
if (savedAssignments) {
    colorAssignments = [...savedAssignments.colorAssignments];
    shapeAssignments = [...savedAssignments.shapeAssignments];
    dotAssignments = [...savedAssignments.dotAssignments];
    console.log('[Suspect] Using saved assignments arrays');
} else {
    colorAssignments = new Array(numPeople);
    shapeAssignments = new Array(numPeople);
    dotAssignments = new Array(numPeople);
}

// Set killer's attributes (only if not already set from saved state)
if (!savedAssignments) {
colorAssignments[killerIndex] = killerColor;
shapeAssignments[killerIndex] = killerShape;
dotAssignments[killerIndex] = killerDots;
} else {
    // Verify killer's attributes match saved state
    if (colorAssignments[killerIndex] !== killerColor || 
        shapeAssignments[killerIndex] !== killerShape || 
        dotAssignments[killerIndex] !== killerDots) {
        console.warn('[Suspect] Killer attributes mismatch, updating from saved state');
        colorAssignments[killerIndex] = killerColor;
        shapeAssignments[killerIndex] = killerShape;
        dotAssignments[killerIndex] = killerDots;
    }
}

// Helper function to count common traits
function countCommonTraitsSetup(personColor, personShape, personDots, killerColor, killerShape, killerDots) {
    let count = 0;
    if (personColor === killerColor) count++;
    if (personShape === killerShape) count++;
    if (personDots === killerDots) count++;
    return count;
}

// Helper function to create a unique key for a combination
function getCombinationKey(color, shape, dots) {
    return `${color}-${shape}-${dots}`;
}

// Helper function to find valid attributes for a target common trait count
function findValidAttributes(targetCommonCount, killerColor, killerShape, killerDots, usedCombinations) {
    const attempts = 10000; // Increased attempts to find unique combinations
    for (let attempt = 0; attempt < attempts; attempt++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = Math.floor(Math.random() * numAttributes) + 1;
        const dots = Math.floor(Math.random() * numAttributes) + 1;
        
        const commonCount = countCommonTraitsSetup(color, shape, dots, killerColor, killerShape, killerDots);
        const combinationKey = getCombinationKey(color, shape, dots);
        
        if (commonCount === targetCommonCount && !usedCombinations.has(combinationKey)) {
            return { color, shape, dots };
        }
    }
    // Fallback: try to find any unique combination (relax trait count requirement)
    for (let attempt = 0; attempt < 1000; attempt++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = Math.floor(Math.random() * numAttributes) + 1;
        const dots = Math.floor(Math.random() * numAttributes) + 1;
        const combinationKey = getCombinationKey(color, shape, dots);
        
        if (!usedCombinations.has(combinationKey)) {
            return { color, shape, dots };
        }
    }
    // Last resort: return random attributes (may not be unique)
    return {
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.floor(Math.random() * numAttributes) + 1,
        dots: Math.floor(Math.random() * numAttributes) + 1
    };
}

// Calculate distribution
// 1 person with 2 traits in common
// Remaining split 50/50 between 0 and 1
const remainingPeople = numPeople - 1; // Excluding killer
const numWith2Traits = 1;
const numWith0Traits = Math.floor((remainingPeople - numWith2Traits) / 2);
const numWith1Traits = remainingPeople - numWith2Traits - numWith0Traits;

// Create list of indices (excluding killer)
const indices = [];
for (let i = 0; i < numPeople; i++) {
    if (i !== killerIndex) {
        indices.push(i);
    }
}

// Shuffle indices
for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
}

// Only generate new assignments if we don't have saved ones
if (!savedAssignments) {
    // Track used combinations to ensure uniqueness
    const usedCombinations = new Set();
    // Add killer's combination to used set
    const killerCombinationKey = getCombinationKey(killerColor, killerShape, killerDots);
    usedCombinations.add(killerCombinationKey);

// Assign attributes based on constraints
let idx = 0;

// Assign 1 person with 2 traits in common
if (numWith2Traits > 0 && idx < indices.length) {
    const attrs = findValidAttributes(2, killerColor, killerShape, killerDots, usedCombinations);
    const personIdx = indices[idx++];
    colorAssignments[personIdx] = attrs.color;
    shapeAssignments[personIdx] = attrs.shape;
    dotAssignments[personIdx] = attrs.dots;
    // Mark this combination as used
    usedCombinations.add(getCombinationKey(attrs.color, attrs.shape, attrs.dots));
}

// Assign people with 0 traits in common
for (let i = 0; i < numWith0Traits && idx < indices.length; i++) {
    const attrs = findValidAttributes(0, killerColor, killerShape, killerDots, usedCombinations);
    const personIdx = indices[idx++];
    colorAssignments[personIdx] = attrs.color;
    shapeAssignments[personIdx] = attrs.shape;
    dotAssignments[personIdx] = attrs.dots;
    // Mark this combination as used
    usedCombinations.add(getCombinationKey(attrs.color, attrs.shape, attrs.dots));
}

// Assign people with 1 trait in common
for (let i = 0; i < numWith1Traits && idx < indices.length; i++) {
    const attrs = findValidAttributes(1, killerColor, killerShape, killerDots, usedCombinations);
    const personIdx = indices[idx++];
    colorAssignments[personIdx] = attrs.color;
    shapeAssignments[personIdx] = attrs.shape;
    dotAssignments[personIdx] = attrs.dots;
    // Mark this combination as used
    usedCombinations.add(getCombinationKey(attrs.color, attrs.shape, attrs.dots));
}
} else {
    console.log('[Suspect] Using saved assignments, skipping generation');
}

// Verify all people have colors assigned and check for duplicates
const missingColors = [];
const colorCounts = {};
const combinationMap = new Map();
const duplicates = [];

for (let check = 0; check < numPeople; check++) {
    const color = colorAssignments[check];
    if (!color) {
        missingColors.push(check);
    } else {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
        
        // Check for duplicate combinations
        const comboKey = getCombinationKey(color, shapeAssignments[check], dotAssignments[check]);
        if (combinationMap.has(comboKey)) {
            duplicates.push({ person: check, duplicateOf: combinationMap.get(comboKey), combo: comboKey });
        } else {
            combinationMap.set(comboKey, check);
        }
    }
}
if (missingColors.length > 0) {
    console.error(`ERROR: ${missingColors.length} people missing colors:`, missingColors);
}
if (duplicates.length > 0) {
    console.warn(`WARNING: Found ${duplicates.length} duplicate combinations:`, duplicates);
} else {
    console.log('✓ All combinations are unique');
}
console.log('Color distribution:', colorCounts);
console.log('Unique colors:', Object.keys(colorCounts).length);

// Create 15 boxes, each representing a person with a random color, shape, and dots
for (let i = 0; i < numPeople; i++) {
    const personBox = document.createElement('div');
    personBox.className = 'person-box';
    personBox.style.position = 'relative';
    personBox.setAttribute('data-person-index', i); // Add identifier
    const boxColor = colorAssignments[i];
    
    if (useEmojis) {
        // Thanksgiving variation: colored background, emoji instead of shape, horizontal dots
        personBox.style.backgroundColor = boxColor;
    
        // Add emoji instead of shape - get current emojis from theme
        const currentEmojis = getSuspectEmojis();
    const shapeIndex = shapeAssignments[i];
        const emojiIndex = (shapeIndex - 1) % currentEmojis.length; // Map shape 1-5 to emoji 0-4
        const emoji = currentEmojis[emojiIndex];
        
        const emojiElement = document.createElement('div');
        emojiElement.textContent = emoji;
        emojiElement.style.position = 'absolute';
        emojiElement.style.top = '40%';
        emojiElement.style.left = '50%';
        emojiElement.style.transform = 'translate(-50%, calc(-50% + 2px))';
        emojiElement.style.zIndex = '1';
        emojiElement.style.fontSize = '26px';
        emojiElement.style.lineHeight = '1';
        personBox.appendChild(emojiElement);
        
        // Add dots in a row below the emoji
        const numDots = dotAssignments[i];
        const dotsContainer = document.createElement('div');
        dotsContainer.style.position = 'absolute';
        dotsContainer.style.top = '65%';
        dotsContainer.style.left = '50%';
        dotsContainer.style.transform = 'translate(-50%, calc(-50% + 9px))';
        dotsContainer.style.zIndex = '2';
        dotsContainer.style.display = 'flex';
        dotsContainer.style.flexDirection = 'row';
        dotsContainer.style.alignItems = 'center';
        dotsContainer.style.justifyContent = 'center';
        dotsContainer.style.gap = '4px';
        
        // Create all dots in a single row
        for (let j = 0; j < numDots; j++) {
            const dot = document.createElement('div');
            dot.style.width = '5px';
            dot.style.height = '5px';
            dot.style.backgroundColor = 'white';
            dot.style.borderRadius = '50%';
            dotsContainer.appendChild(dot);
        }
        
        personBox.appendChild(dotsContainer);
    } else {
        // Original mode: transparent background, SVG shapes, stacked dots
        personBox.style.backgroundColor = 'transparent';
        
        // Load and add pre-colored shape - capture all values immediately
        const personColor = colorAssignments[i];
        const personShape = shapeAssignments[i];
        const currentPersonBox = personBox; // Capture the box reference
        const currentPersonIndex = i; // Capture the index
        
        if (!personColor || !personShape) {
            console.error(`Person ${currentPersonIndex} missing color or shape! color=${personColor}, shape=${personShape}`);
        } else {
            // Immediately capture values and load shape
            const colorLetter = getColorLetter(personColor);
            const shapeFileName = `s${personShape}_${colorLetter}.svg`;
            
            console.log(`Person ${currentPersonIndex}: color=${personColor}, shape=${personShape}, letter=${colorLetter}, file=${shapeFileName}`);
            
            // Use fetch with proper closure - capture all values
            fetch(shapeFileName)
                .then(response => {
                    if (!response.ok) {
                        console.error(`Person ${currentPersonIndex}: Failed to load ${shapeFileName}: ${response.status}`);
                        return null;
                    }
                    return response.text();
                })
                .then(svgText => {
                    if (!svgText) return;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgText;
            const svgElement = tempDiv.querySelector('svg');
            
            if (svgElement) {
                        // Make class names unique to prevent CSS conflicts between SVGs
                        // Each SVG gets its own unique ID so styles don't override each other
                        const uniqueId = `svg-${currentPersonIndex}`;
                        const styleTag = svgElement.querySelector('style');
                        
                        if (styleTag) {
                            // First, update class names on all elements and groups
                            const allElements = svgElement.querySelectorAll('*');
                            allElements.forEach(el => {
                                const classes = el.getAttribute('class');
                                if (classes) {
                                    const updatedClasses = classes.split(/\s+/).map(cls => {
                                        // Match st followed by digits
                                        if (/^st\d+$/.test(cls)) {
                                            return `${cls}-${uniqueId}`;
                                        }
                                        return cls;
                                    }).join(' ');
                                    el.setAttribute('class', updatedClasses);
                                }
                            });
                            
                            // Then update class names in style tag to match
                            let styleText = styleTag.textContent || styleTag.innerHTML;
                            // Replace all occurrences of .st0, .st1, .st2, etc. with unique versions
                            // Handle both .st0{ and .st0 { formats
                            styleText = styleText.replace(/\.(st\d+)/g, `.$1-${uniqueId}`);
                            styleTag.textContent = styleText;
                            
                            console.log(`Person ${currentPersonIndex}: Updated SVG classes with unique ID ${uniqueId}`);
                        }
                        
                svgElement.setAttribute('width', '50');
                svgElement.setAttribute('height', '50');
                svgElement.style.width = '71%';
                svgElement.style.height = '71%';
                svgElement.style.maxWidth = '50px';
                svgElement.style.maxHeight = '50px';
                svgElement.style.position = 'absolute';
                svgElement.style.top = '50%';
                svgElement.style.left = '50%';
                svgElement.style.transform = 'translate(-50%, -50%)';
                svgElement.style.zIndex = '1';
                
                        // Shape is pre-colored, no need to modify colors
                        // Use the captured box reference
                        currentPersonBox.appendChild(svgElement);
                        console.log(`Person ${currentPersonIndex}: Appended ${shapeFileName} to box`);
            }
                })
                .catch(error => {
                    console.error(`Person ${currentPersonIndex}: Error loading ${shapeFileName}:`, error);
                });
        }
    
        // Add dots in stacked pattern
    const numDots = dotAssignments[i];
    const dotsContainer = document.createElement('div');
    dotsContainer.style.position = 'absolute';
    dotsContainer.style.top = '50%';
    dotsContainer.style.left = '50%';
    dotsContainer.style.transform = 'translate(-50%, -50%)';
    dotsContainer.style.zIndex = '2';
    dotsContainer.style.display = 'flex';
    dotsContainer.style.flexDirection = 'column';
    dotsContainer.style.alignItems = 'center';
    dotsContainer.style.justifyContent = 'center';
    dotsContainer.style.gap = '2px';
    
    // Define dot patterns (same as game1, but only up to numAttributes)
    const dotPatterns = {
        1: [1],
        2: [2],
        3: [3],
        4: [2, 2],
        5: [2, 1, 2]
    };
    
    const pattern = dotPatterns[numDots];
    if (pattern) {
        pattern.forEach(rowDots => {
            const dotRow = document.createElement('div');
            dotRow.style.display = 'flex';
            dotRow.style.gap = '2px';
            dotRow.style.justifyContent = 'center';
            for (let j = 0; j < rowDots; j++) {
                const dot = document.createElement('div');
                dot.style.width = '5px';
                dot.style.height = '5px';
                dot.style.backgroundColor = 'white';
                dot.style.borderRadius = '50%';
                dotRow.appendChild(dot);
            }
            dotsContainer.appendChild(dotRow);
        });
    }
    
    personBox.appendChild(dotsContainer);
    }
    
    gameArea.appendChild(personBox);
}

// Game Logic
const instructionDiv = document.getElementById('instruction');
const nextButton = document.getElementById('nextButton');
const accuseButton = document.getElementById('accuseButton');
const resultsButton = document.getElementById('resultsButton');
const popupOverlay = document.getElementById('popupOverlay');
const popupContent = document.getElementById('popupContent');
const closeButton = document.getElementById('closeButton');
const redFlashOverlay = document.getElementById('redFlashOverlay');

// Play stab sound helper - creates a fresh Audio each time (more reliable on mobile)
function playStabSound() {
    try {
        const audio = new Audio('stab.mp3');
        audio.volume = 0.5; // Adjust volume as needed
        const p = audio.play();
        if (p && typeof p.catch === 'function') {
            p.catch(e => console.log('Sound play failed:', e));
        }
    } catch (e) {
        console.log('Error playing stab sound:', e);
    }
}

// Get today's key for localStorage
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Save game state to localStorage

// Check if game is complete
function isGameComplete() {
    const todayKey = getTodayKey();
    return localStorage.getItem(`suspectComplete_${todayKey}`) === 'true';
}

// Show completed game screen
function showCompletedScreen() {
    console.log('[Suspect] showCompletedScreen() called');
    
    
    const todayKey = getTodayKey();
    const starsEarned = parseInt(localStorage.getItem(`suspectStars_${todayKey}`) || '0');
    const gameWon = localStorage.getItem(`suspectWon_${todayKey}`) === 'true';
    
    // Hide game UI
    nextButton.style.opacity = '0';
    nextButton.style.pointerEvents = 'none';
    accuseButton.style.opacity = '0';
    accuseButton.style.pointerEvents = 'none';
    
    // Restore dead people opacity
    console.log('[Suspect] Restoring dead people in showCompletedScreen...');
    console.log('[Suspect] showCompletedScreen: deadPeople array:', deadPeople);
    console.log('[Suspect] showCompletedScreen: gameWon:', gameWon);
    
    const restoreDeadPeople = () => {
        console.log(`[Suspect] showCompletedScreen: Attempting to restore ${deadPeople.length} dead people`);
        let restoredCount = 0;
        
        // If game was lost, all people except killer should be dead
        if (!gameWon) {
            console.log('[Suspect] showCompletedScreen: Game was lost, ensuring all except killer are dead');
            for (let i = 0; i < numPeople; i++) {
                if (i !== killerIndex) {
                    if (!deadPeople.includes(i)) {
                        deadPeople.push(i);
                        console.log(`[Suspect] showCompletedScreen: Added person ${i} to deadPeople array`);
                    }
                }
            }
        }
        
        deadPeople.forEach(personIndex => {
            if (peopleData && peopleData[personIndex] && peopleData[personIndex].element) {
                peopleData[personIndex].dead = true;
                peopleData[personIndex].element.style.opacity = '0.15';
                restoredCount++;
                console.log(`[Suspect] showCompletedScreen: Restored dead state for person ${personIndex}`);
            } else {
                console.warn(`[Suspect] showCompletedScreen: Could not restore person ${personIndex}`);
            }
        });
        
        console.log(`[Suspect] showCompletedScreen: Restored ${restoredCount} dead people`);
    };
    
    // Try to restore dead people with multiple attempts
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            restoreDeadPeople();
            setTimeout(() => {
                restoreDeadPeople();
            }, 100);
        });
    });
    
    // Show final result
    if (gameWon) {
        const starDisplay = createStarDisplay(starsEarned);
        instructionDiv.classList.add('has-result');
        instructionDiv.innerHTML = `<div class="suspect-star-container">${starDisplay}</div><div>turn ${questionCount} - ${totalKilled} dead</div>`;
        
        // Show jail on killer
        const killerElement = peopleData[killerIndex].element;
        const jailImg = document.createElement('img');
        jailImg.src = 'jail.svg';
        jailImg.style.position = 'absolute';
        jailImg.style.top = '0';
        jailImg.style.left = '0';
        jailImg.style.width = '100%';
        jailImg.style.height = '100%';
        jailImg.style.objectFit = 'contain';
        jailImg.style.zIndex = '100';
        jailImg.style.pointerEvents = 'none';
        killerElement.appendChild(jailImg);
    } else {
        const starDisplay = createStarDisplay(0);
        instructionDiv.classList.add('has-result');
        // End notes when suspect is wrong
        instructionDiv.innerHTML = `<div class="suspect-star-container">${starDisplay}</div><div>THE KILLER WON</div>`;
    }
}

// Calculate stars based on number of suspects questioned
function calculateStars(questionCount) {
    if (questionCount <= 1) return 5;
    if (questionCount === 2) return 4;
    if (questionCount === 3) return 3;
    if (questionCount === 4) return 2;
    return 0;
}

// Create star display HTML
function createStarDisplay(starsEarned) {
    let starHTML = '';
    for (let i = 0; i < 5; i++) {
        const isGrey = i >= starsEarned;
        starHTML += `<span class="suspect-star ${isGrey ? 'grey' : ''}">★</span>`;
    }
    return starHTML;
}

// Award stars for suspect game
function awardSuspectStars(stars) {
    const todayKey = getTodayKey();
    localStorage.setItem(`suspectComplete_${todayKey}`, 'true');

    let notes;
    if (stars > 0) {
        // Use the same turn count shown in the in-game message so the end popup matches
        notes = ['Killed: ' + totalKilled, 'Turns ' + questionCount];
    } else {
        // On a loss, the popup should just say that the killer won
        notes = ['THE KILLER WON'];
    }

    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'puzzleComplete',
            gameId: 'suspect',
            stars: stars,
            notes: notes,
            delay: 1
        }, '*');
    }

    return stars;
}

// Initialize next button as disabled
nextButton.style.opacity = '0.5';
nextButton.style.pointerEvents = 'none';

// Initialize accuse button as enabled (only available during "my turn")
accuseButton.style.opacity = '1';
accuseButton.style.pointerEvents = 'auto';

// Game state
let action = "enemy turn"; // Start with killer's turn
let deathAnimationCount = 0;
let questionedPeople = [];
let deadPeople = [];
let questionResults = [];
let lastFrameTime = performance.now();
let accuseMode = false;
let roundNumber = 1;
let currentRoundVictims = [];
let totalKilled = 0;
let questionCount = 0;
const maxQuestions = 4;

// Store person data
const peopleData = [];
for (let i = 0; i < numPeople; i++) {
    peopleData.push({
        index: i,
        color: colorAssignments[i],
        shape: shapeAssignments[i],
        dots: dotAssignments[i],
        element: gameArea.children[i],
        questioned: false,
        dead: false
    });
}

// Log killer at start
const killer = peopleData[killerIndex];
console.log('=== KILLER IDENTIFIED ===');
console.log(`Killer Index: ${killerIndex}`);
console.log(`Color: ${getColorName(killer.color)}`);
console.log(`Shape: ${getShapeName(killer.shape)}`);
console.log(`Dots: ${killer.dots}`);
console.log('========================');

// Count how many people have each number of traits in common with the killer
const traitCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
for (let i = 0; i < numPeople; i++) {
    if (i !== killerIndex) {
        const commonCount = countCommonTraits(peopleData[i], killer);
        traitCounts[commonCount]++;
    }
}

console.log('\n=== TRAIT DISTRIBUTION ===');
console.log(`People with 0 traits in common: ${traitCounts[0]}`);
console.log(`People with 1 trait in common: ${traitCounts[1]}`);
console.log(`People with 2 traits in common: ${traitCounts[2]}`);
console.log(`People with 3 traits in common: ${traitCounts[3]}`);
console.log('==========================\n');

// Helper functions for debugging
function getColorName(colorHex) {
    const colorMap = {
        '#e63946': 'red',
        '#1a7a3d': 'green',
        '#3a5ec6': 'blue',
        '#f77f00': 'orange',
        '#8338ec': 'purple'
    };
    return colorMap[colorHex] || colorHex;
}


function getCommonTraitsList(person1, person2) {
    const traits = [];
    if (person1.color === person2.color) traits.push('color');
    if (person1.shape === person2.shape) traits.push('shape');
    if (person1.dots === person2.dots) traits.push('dots');
    return traits;
}

// Count common traits between two people
function countCommonTraits(person1, person2) {
    let count = 0;
    if (person1.color === person2.color) count++;
    if (person1.shape === person2.shape) count++;
    if (person1.dots === person2.dots) count++;
    return count;
}

// Question a person
function questionPerson(personIndex) {
    if (peopleData[personIndex].dead) return;
    
    // If in accuse mode, handle accusation (allow during any action)
    if (accuseMode) {
        if (personIndex === killerIndex) {
            // Calculate stars and award them
            const starsEarned = calculateStars(questionCount);
            awardSuspectStars(starsEarned);
            
            // Save win state
            const todayKey = getTodayKey();
            localStorage.setItem(`suspectWon_${todayKey}`, 'true');
            
            // Format final message with star display
            const turnNumber = questionCount;
            const starDisplay = createStarDisplay(starsEarned);
            instructionDiv.classList.add('has-result');
            instructionDiv.innerHTML = `<div class="suspect-star-container">${starDisplay}</div><div>turn ${turnNumber} - ${totalKilled} dead</div>`;
            
            accuseMode = false;
            // Disable both buttons when game is won
            nextButton.style.opacity = '0';
            nextButton.style.pointerEvents = 'none';
            accuseButton.style.opacity = '0';
            accuseButton.style.pointerEvents = 'none';
            
            // Add jail overlay over the killer
            const killerElement = peopleData[killerIndex].element;
            const jailImg = document.createElement('img');
            jailImg.src = 'jail.svg';
            jailImg.style.position = 'absolute';
            jailImg.style.top = '0';
            jailImg.style.left = '0';
            jailImg.style.width = '100%';
            jailImg.style.height = '100%';
            jailImg.style.objectFit = 'contain';
            jailImg.style.zIndex = '100';
            jailImg.style.pointerEvents = 'none';
            killerElement.appendChild(jailImg);
        } else {
            // Wrong accusation - fail the game, award 0 stars
            awardSuspectStars(0);
            
            // Wrong accusation - kill everyone except the killer
            for (let i = 0; i < numPeople; i++) {
                if (i !== killerIndex && !peopleData[i].dead) {
                    peopleData[i].dead = true;
                    deadPeople.push(i);
                    peopleData[i].element.style.opacity = '0.15';
                }
            }
            
            // Save loss state AFTER updating deadPeople array
            const todayKey = getTodayKey();
            localStorage.setItem(`suspectWon_${todayKey}`, 'false');
            console.log('[Suspect] Wrong answer: All people except killer marked as dead. deadPeople array:', deadPeople);
            
            // Update instruction with fail message
            const starDisplay = createStarDisplay(0); // Always 5 grey stars (0 stars earned)
            instructionDiv.classList.add('has-result');
            // End notes when suspect is wrong
            instructionDiv.innerHTML = `<div class="suspect-star-container">${starDisplay}</div><div>THE KILLER WON</div>`;
            
            // Shake screen
            document.body.style.animation = 'shake 0.5s';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 500);
            
            // Red flash animation with GSAP
            gsap.set(redFlashOverlay, { opacity: 0 });
            // Play stab sound
            playStabSound();
            gsap.to(redFlashOverlay, {
                opacity: 0.3,
                duration: 0.1,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(redFlashOverlay, {
                        opacity: 0,
                        duration: 0.4,
                        ease: "power2.in"
                    });
                }
            });
            
            accuseMode = false;
            accuseButton.style.opacity = '0.5';
            accuseButton.style.pointerEvents = 'none';
            nextButton.style.opacity = '0.5';
            nextButton.style.pointerEvents = 'none';
        }
        return;
    }
    
    // Normal questioning - only allow during "my turn"
    if (action !== "my turn") return;
    
    // Check if player has used all questions
    if (questionCount >= maxQuestions) return;
    
    // Normal questioning
    if (peopleData[personIndex].questioned) return;
    
    const person = peopleData[personIndex];
    const killer = peopleData[killerIndex];
    const commonTraits = countCommonTraits(person, killer);
    const commonTraitsList = getCommonTraitsList(person, killer);
    
    // Console log all details
    console.log(`\n=== QUESTIONING PERSON ${personIndex} ===`);
    console.log(`Person ${personIndex}:`);
    console.log(`  Color: ${getColorName(person.color)}`);
    console.log(`  Shape: ${getShapeName(person.shape)}`);
    console.log(`  Dots: ${person.dots}`);
    console.log(`Killer:`);
    console.log(`  Color: ${getColorName(killer.color)}`);
    console.log(`  Shape: ${getShapeName(killer.shape)}`);
    console.log(`  Dots: ${killer.dots}`);
    console.log(`Common traits (${commonTraits}):`);
    if (commonTraitsList.length > 0) {
        commonTraitsList.forEach(trait => {
            if (trait === 'color') {
                console.log(`  ✓ Color: ${getColorName(person.color)}`);
            } else if (trait === 'shape') {
                console.log(`  ✓ Shape: ${getShapeName(person.shape)}`);
            } else if (trait === 'dots') {
                console.log(`  ✓ Dots: ${person.dots}`);
            }
        });
    } else {
        console.log(`  None`);
    }
    console.log('===================================\n');
    
    person.questioned = true;
    questionedPeople.push(personIndex);
    questionResults.push({
        person: personIndex,
        commonTraits: commonTraits
    });
    
    questionCount++;
    
    // Save game state after questioning
    
    // Create indicator circle (position depends on visual mode)
    const indicator = document.createElement('div');
    indicator.className = 'question-indicator';
    indicator.textContent = commonTraits.toString();
    if (useEmojis) {
        // Move to upper right in variation mode
        indicator.style.bottom = 'auto';
        indicator.style.top = '2px';
    }
    person.element.appendChild(indicator);
    
    const traitText = commonTraits === 1 ? 'trait' : 'traits';
    instructionDiv.innerHTML = `This person has ${commonTraits} ${traitText}<br>in common with the killer.`;
    
    // If this is the 4th question, don't show next button
    if (questionCount >= maxQuestions) {
        nextButton.style.opacity = '0.5';
        nextButton.style.pointerEvents = 'none';
        instructionDiv.textContent = `No more questioning. Accuse someone.`;
    } else {
        nextButton.style.opacity = '1';
        nextButton.style.pointerEvents = 'auto';
    }
    
    // Keep accuse button enabled during questioning phase
    accuseButton.style.opacity = '1';
    accuseButton.style.pointerEvents = 'auto';
    action = "waiting for next";
}

// Killer's turn
function killerTurn() {
    action = "enemy turn";
    instructionDiv.textContent = "Killer's turn";
    nextButton.style.opacity = '0.5';
    nextButton.style.pointerEvents = 'none';
    accuseButton.style.opacity = '0.5';
    accuseButton.style.pointerEvents = 'none';
    
    // Calculate how many people to kill this round (1, 2, 4, 8...)
    const numToKill = Math.pow(2, roundNumber - 1);
    
    // Wait 2 seconds, then kill
    setTimeout(() => {
        const killer = peopleData[killerIndex];
        let targets = [];
        let isRandomKill = false;
        
        if (killerKillsSimilarPeople) {
            // Original behavior: prioritize people with traits in common
            // First, find all people with traits in common (not killer, not dead)
            const potentialVictims = peopleData.filter((p, i) => 
                i !== killerIndex && 
                !p.dead && 
                countCommonTraits(p, killer) > 0
            );
            
            // Prioritize un-questioned people with traits in common
            const unQuestionedWithTraits = potentialVictims.filter(p => !p.questioned);
            
            // Determine targets: prioritize people with traits in common, then random if none left
            if (unQuestionedWithTraits.length > 0) {
                // First priority: un-questioned people with traits in common
                targets = unQuestionedWithTraits;
            } else if (potentialVictims.length > 0) {
                // Second priority: questioned people with traits in common
                targets = potentialVictims;
            } else {
                // All people with traits in common are dead, kill randomly from remaining
                targets = peopleData.filter((p, i) => 
                    i !== killerIndex && 
                    !p.dead
                );
                isRandomKill = true;
            }
        } else {
            // Prefer killing people with 0 traits in common with the killer
            const eligible = peopleData.filter((p, i) => 
                i !== killerIndex && 
                !p.dead &&
                !p.questioned
            );
            const zeroTraits = eligible.filter(p => countCommonTraits(p, killer) === 0);
            const withTraits = eligible.filter(p => countCommonTraits(p, killer) > 0);
            // Build target list: fill from zero-traits first (shuffled), then from with-traits if needed
            const shuffle = (arr) => {
                const a = [...arr];
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                }
                return a;
            };
            const zeroShuffled = shuffle(zeroTraits);
            const withShuffled = shuffle(withTraits);
            targets = [...zeroShuffled, ...withShuffled];
            if (zeroTraits.length === 0) isRandomKill = true;
        }
        
        // Select multiple victims
        const victimsToKill = Math.min(numToKill, targets.length);
        currentRoundVictims = [];
        
        if (victimsToKill > 0) {
            // Pick first N from targets (zero-traits preferred, already ordered)
            const shuffled = targets.slice(0, victimsToKill);
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            
            console.log(`\n=== ROUND ${roundNumber} - KILLER KILLS ${victimsToKill} PERSON(S) ===`);
            if (isRandomKill) {
                console.log('⚠️ All people with traits in common are dead. Killing randomly...');
            }
            for (let i = 0; i < victimsToKill; i++) {
                const victim = shuffled[i];
                const victimIndex = peopleData.indexOf(victim);
                victim.dead = true;
                deadPeople.push(victimIndex);
                currentRoundVictims.push(victimIndex);
                
                // Log what they have in common
                const commonTraits = getCommonTraitsList(killer, victim);
                const commonCount = countCommonTraits(killer, victim);
                console.log(`Victim ${victimIndex}:`);
                console.log(`  Color: ${getColorName(victim.color)}, Shape: ${getShapeName(victim.shape)}, Dots: ${victim.dots}`);
                console.log(`  Common traits (${commonCount}): ${commonTraits.length > 0 ? commonTraits.join(', ') : 'none (random kill)'}`);
            }
            console.log('==========================================\n');
            
            // Shake screen
            document.body.style.animation = 'shake 0.5s';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 500);
            
            // Red flash animation with GSAP
            gsap.set(redFlashOverlay, { opacity: 0 });
            // Play stab sound
            playStabSound();
            gsap.to(redFlashOverlay, {
                opacity: 0.3,
                duration: 0.1,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(redFlashOverlay, {
                        opacity: 0,
                        duration: 0.4,
                        ease: "power2.in"
                    });
                }
            });
            
            // If killerKillsSimilarPeople is false, wait 2 seconds after shake then go to questioning
            if (!killerKillsSimilarPeople) {
                setTimeout(() => {
                    // Set victims to 15% opacity
                    currentRoundVictims.forEach(victimIndex => {
                        const victim = peopleData[victimIndex];
                        if (victim) {
                            victim.element.style.opacity = '0.15';
                        }
                    });
                    // Increment round number for next time
                    roundNumber++;
                    currentRoundVictims = [];
                    action = "my turn";
                    accuseMode = false;
                    const totalDead = deadPeople.length;
                    if (questionCount >= maxQuestions) {
                        instructionDiv.textContent = "No more questioning. Accuse someone.";
                    } else {
                        instructionDiv.innerHTML = `Turn ${questionCount + 1} / ${maxQuestions}<br>Select a person to question`;
                    }
                    nextButton.style.opacity = '0.5';
                    nextButton.style.pointerEvents = 'none';
                    accuseButton.style.opacity = '1';
                    accuseButton.style.pointerEvents = 'auto';
                }, 2000);
            }
            
            // Start death animation
            action = "death animation";
            deathAnimationCount = 0;
            } else {
                // No valid targets (everyone is dead except killer), skip to player turn
            action = "my turn";
            if (questionCount >= maxQuestions) {
                instructionDiv.textContent = "No more questioning. Accuse someone.";
            } else {
                instructionDiv.innerHTML = `Turn ${questionCount + 1} / ${maxQuestions}<br>Select a person to question`;
            }
        }
    }, 2000);
}

// Game loop
function gameLoop(currentTime) {
    const dt = (currentTime - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = currentTime;
    
    if (action === "enemy turn") {
        // Handled by setTimeout in killerTurn()
    } else if (action === "death animation") {
        // Tween opacity between 0.3 and 0 for all victims in this round (only if killerKillsSimilarPeople is true)
        if (killerKillsSimilarPeople) {
            const opacity = 0.15 + 0.15 * Math.sin(deathAnimationCount * 5);
            currentRoundVictims.forEach(victimIndex => {
                const victim = peopleData[victimIndex];
                if (victim) {
                    victim.element.style.opacity = opacity.toString();
                }
            });
        } else {
            // No animation, just set to 15% opacity
            currentRoundVictims.forEach(victimIndex => {
                const victim = peopleData[victimIndex];
                if (victim) {
                    victim.element.style.opacity = '0.15';
                }
            });
        }
        deathAnimationCount += dt;
        
        // After animation, show next button (or go directly to questioning if killerKillsSimilarPeople)
        if (deathAnimationCount > 1) {
            const numKilled = currentRoundVictims.length;
            totalKilled += numKilled;
            
            if (killerKillsSimilarPeople) {
                // Wait 2 seconds after shake, then go to questioning phase
                setTimeout(() => {
                    // Stop death animation, leave at 15% opacity
                    currentRoundVictims.forEach(victimIndex => {
                        const victim = peopleData[victimIndex];
                        if (victim) {
                            victim.element.style.opacity = '0.15';
                        }
                    });
                    // Increment round number for next time
                    roundNumber++;
                    currentRoundVictims = [];
                    action = "my turn";
                    accuseMode = false;
                    if (questionCount >= maxQuestions) {
                        instructionDiv.textContent = "No more questioning. Accuse someone.";
                    } else {
                        instructionDiv.innerHTML = `Turn ${questionCount + 1} / ${maxQuestions}<br>Select a person to question`;
                    }
                    nextButton.style.opacity = '0.5';
                    nextButton.style.pointerEvents = 'none';
                    accuseButton.style.opacity = '1';
                    accuseButton.style.pointerEvents = 'auto';
                }, 2000);
            } else {
                // killerKillsSimilarPeople is false - already handled above with setTimeout
                // Don't show next button, just wait for the setTimeout to complete
                action = "death animation wait";
            }
            deathAnimationCount = 0;
        }
    } else if (action === "death animation wait") {
        // Keep tweening between 0.3 and 0 until next is clicked (only if killerKillsSimilarPeople is true)
        if (killerKillsSimilarPeople) {
            const opacity = 0.15 + 0.15 * Math.sin(deathAnimationCount * 5);
            currentRoundVictims.forEach(victimIndex => {
                const victim = peopleData[victimIndex];
                if (victim) {
                    victim.element.style.opacity = opacity.toString();
                }
            });
        }
        deathAnimationCount += dt;
    } else if (action === "my turn") {
        // Player can question
    }
    
    requestAnimationFrame(gameLoop);
}

// Next button click
nextButton.addEventListener('click', () => {
    if (action === "waiting for next") {
        action = "death animation wait";
        deathAnimationCount = 0;
        killerTurn();
    } else if (action === "death animation wait") {
        // Stop death animation for all victims, leave at 15% opacity
        currentRoundVictims.forEach(victimIndex => {
            const victim = peopleData[victimIndex];
            if (victim) {
                victim.element.style.opacity = '0.15';
            }
        });
        // Increment round number for next time
        roundNumber++;
        currentRoundVictims = [];
        action = "my turn";
        accuseMode = false;
        if (questionCount >= maxQuestions) {
            instructionDiv.textContent = "No more questioning. Accuse someone.";
        } else {
            instructionDiv.textContent = `Turn ${questionCount + 1} / ${maxQuestions}`;
        }
        nextButton.style.opacity = '0.5';
        nextButton.style.pointerEvents = 'none';
        accuseButton.style.opacity = '1';
        accuseButton.style.pointerEvents = 'auto';
    }
});

// Create a mini person box for display in results
async function createMiniPersonBox(person, commonTraits) {
    const container = document.createElement('div');
    container.className = 'result-item';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '15px';
    container.style.marginBottom = '15px';
    container.style.padding = '10px';
    container.style.border = '1px solid #ddd';
    container.style.borderRadius = '8px';
    
    // Mini person box
    const miniBox = document.createElement('div');
    miniBox.className = 'mini-person-box';
    miniBox.style.width = '60px';
    miniBox.style.height = '60px';
    miniBox.style.position = 'relative';
    miniBox.style.borderRadius = '4px';
    miniBox.style.overflow = 'hidden';
    
    if (useEmojis) {
        // Thanksgiving variation: colored background, emoji instead of shape, horizontal dots
        miniBox.style.backgroundColor = person.color;
        
        // Add emoji instead of shape - get current emojis from theme
        const currentEmojis = getSuspectEmojis();
        const emojiIndex = (person.shape - 1) % currentEmojis.length;
        const emoji = currentEmojis[emojiIndex];
        
        const emojiElement = document.createElement('div');
        emojiElement.textContent = emoji;
        emojiElement.style.position = 'absolute';
        emojiElement.style.top = '35%';
        emojiElement.style.left = '50%';
        emojiElement.style.transform = 'translate(-50%, calc(-50% + 2px))';
        emojiElement.style.zIndex = '1';
        emojiElement.style.fontSize = '24px';
        emojiElement.style.lineHeight = '1';
        miniBox.appendChild(emojiElement);
        
        // Add dots in a row below the emoji
        const dotsContainer = document.createElement('div');
        dotsContainer.style.position = 'absolute';
        dotsContainer.style.top = '65%';
        dotsContainer.style.left = '50%';
        dotsContainer.style.transform = 'translate(-50%, calc(-50% + 9px))';
        dotsContainer.style.zIndex = '2';
        dotsContainer.style.display = 'flex';
        dotsContainer.style.flexDirection = 'row';
        dotsContainer.style.alignItems = 'center';
        dotsContainer.style.justifyContent = 'center';
        dotsContainer.style.gap = '3px';
        
        // Create all dots in a single row
        for (let j = 0; j < person.dots; j++) {
            const dot = document.createElement('div');
            dot.style.width = '4px';
            dot.style.height = '4px';
            dot.style.backgroundColor = 'white';
            dot.style.borderRadius = '50%';
            dotsContainer.appendChild(dot);
        }
        
        miniBox.appendChild(dotsContainer);
    } else {
        // Original mode: transparent background, SVG shapes, stacked dots
        miniBox.style.backgroundColor = 'transparent';
        
        // Load and add pre-colored shape
        const colorLetter = getColorLetter(person.color);
        const shapeFileName = `s${person.shape}_${colorLetter}.svg`;
        
        try {
            const response = await fetch(shapeFileName);
        const svgText = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgText;
        const svgElement = tempDiv.querySelector('svg');
        
        if (svgElement) {
            // Clone the SVG to avoid affecting the original
            const clonedSvg = svgElement.cloneNode(true);
            clonedSvg.setAttribute('width', '40');
            clonedSvg.setAttribute('height', '40');
            clonedSvg.style.width = '40px';
            clonedSvg.style.height = '40px';
            clonedSvg.style.position = 'absolute';
            clonedSvg.style.top = '50%';
            clonedSvg.style.left = '50%';
            clonedSvg.style.transform = 'translate(-50%, -50%)';
            clonedSvg.style.zIndex = '1';
            
                // Shape is pre-colored, no need to modify colors
            miniBox.appendChild(clonedSvg);
        }
    } catch (error) {
            console.error(`Error loading ${shapeFileName}:`, error);
    }
    
        // Add dots in stacked pattern
    const dotsContainer = document.createElement('div');
    dotsContainer.style.position = 'absolute';
    dotsContainer.style.top = '50%';
    dotsContainer.style.left = '50%';
    dotsContainer.style.transform = 'translate(-50%, -50%)';
    dotsContainer.style.zIndex = '2';
    dotsContainer.style.display = 'flex';
    dotsContainer.style.flexDirection = 'column';
    dotsContainer.style.alignItems = 'center';
    dotsContainer.style.justifyContent = 'center';
    dotsContainer.style.gap = '2px';
    
    const dotPatterns = {
        1: [1],
        2: [2],
        3: [3],
        4: [2, 2],
        5: [2, 1, 2]
    };
    
    const pattern = dotPatterns[person.dots];
    if (pattern) {
        pattern.forEach(rowDots => {
            const dotRow = document.createElement('div');
            dotRow.style.display = 'flex';
            dotRow.style.gap = '2px';
            dotRow.style.justifyContent = 'center';
            for (let j = 0; j < rowDots; j++) {
                const dot = document.createElement('div');
                dot.style.width = '4px';
                dot.style.height = '4px';
                dot.style.backgroundColor = 'white';
                dot.style.borderRadius = '50%';
                dotRow.appendChild(dot);
            }
            dotsContainer.appendChild(dotRow);
        });
    }
    
    miniBox.appendChild(dotsContainer);
    }
    
    // Text info
    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `<strong>Person ${person.index + 1}:</strong> ${commonTraits} trait(s) in common`;
    
    container.appendChild(miniBox);
    container.appendChild(infoDiv);
    
    return container;
}

// Results button
resultsButton.addEventListener('click', async () => {
    popupContent.innerHTML = '';
    if (questionResults.length === 0) {
        popupContent.innerHTML = '<p>No questions asked yet.</p>';
    } else {
        for (const result of questionResults) {
            const person = peopleData[result.person];
            const miniBox = await createMiniPersonBox(person, result.commonTraits);
            popupContent.appendChild(miniBox);
        }
    }
    popupOverlay.style.display = 'flex';
});

// Close popup
closeButton.addEventListener('click', () => {
    popupOverlay.style.display = 'none';
});

// Accuse button click
accuseButton.addEventListener('click', () => {
    if ((action === "my turn" || action === "waiting for next") && !accuseMode) {
        accuseMode = true;
        instructionDiv.textContent = "Accuse a person of being the killer";
        accuseButton.style.opacity = '0.5';
        accuseButton.style.pointerEvents = 'none';
    }
});

// Click person to question
for (let i = 0; i < numPeople; i++) {
    peopleData[i].element.addEventListener('click', () => {
        questionPerson(i);
    });
}

// Start menu functionality
const startMenu = document.getElementById('startMenu');
const playButton = document.getElementById('playButton');
const gameContainer = document.getElementById('gameContainer');

function startGame() {
    // Notify parent that Suspect has started (for quit warning logic)
    if (window.parent) {
        window.parent.postMessage('puzzleStarted:suspect', '*');
    }

    console.log('[Suspect] startGame() called');
    startMenu.style.display = 'none';
    gameContainer.style.display = 'flex';
    
    // Always try to load saved game state first (even if complete)
    const todayKey = getTodayKey();
    const savedStateString = localStorage.getItem(`suspectState_${todayKey}`);
    const savedState = savedStateString ? JSON.parse(savedStateString) : null;
    console.log('[Suspect] startGame: savedState loaded:', !!savedState);
    if (savedState) {
        console.log('[Suspect] startGame: deadPeople array:', deadPeople);
        console.log('[Suspect] startGame: totalKilled:', totalKilled);
    }
    
    // Check if game is already complete
    if (isGameComplete()) {
        console.log('[Suspect] startGame: Game is complete, calling showCompletedScreen()');
        showCompletedScreen();
        return;
    }
    
    console.log('[Suspect] startGame: Game not complete, continuing with game restoration')
    
    if (savedState) {
        // Store peopleDataState for restoration
        const savedPeopleDataState = savedState.peopleDataState;
        
        // Restore game from saved state
        // Update instruction display
        if (questionCount >= maxQuestions) {
            instructionDiv.textContent = `No more questioning. Accuse someone.`;
            nextButton.style.opacity = '0.5';
            nextButton.style.pointerEvents = 'none';
        } else {
            instructionDiv.innerHTML = `Turn ${questionCount + 1} / ${maxQuestions}<br>Select a person to question`;
            nextButton.style.opacity = '1';
            nextButton.style.pointerEvents = 'auto';
        }
        
        accuseButton.style.opacity = '1';
        accuseButton.style.pointerEvents = 'auto';

        console.log("try restore")
        
        // Restore dead people opacity - use multiple requestAnimationFrame to ensure DOM is ready
        // Also use setTimeout as backup to ensure elements are fully rendered
        const restoreDeadPeople = () => {
            console.log('=== [Suspect] RESTORE DEAD PEOPLE FUNCTION CALLED ===');
            console.log(`[Suspect] deadPeople array:`, deadPeople);
            console.log(`[Suspect] deadPeople.length:`, deadPeople.length);
            console.log(`[Suspect] peopleData exists:`, !!peopleData);
            console.log(`[Suspect] peopleData.length:`, peopleData ? peopleData.length : 'N/A');
            console.log(`[Suspect] savedPeopleDataState exists:`, !!savedPeopleDataState);
            
            let restoredCount = 0;
            
            // First, restore from deadPeople array
            console.log('[Suspect] Starting restoration from deadPeople array...');
            deadPeople.forEach((personIndex, idx) => {
                console.log(`[Suspect] Processing dead person ${idx + 1}/${deadPeople.length}: index ${personIndex}`);
                console.log(`  - peopleData exists:`, !!peopleData);
                console.log(`  - peopleData[${personIndex}] exists:`, !!(peopleData && peopleData[personIndex]));
                console.log(`  - element exists:`, !!(peopleData && peopleData[personIndex] && peopleData[personIndex].element));
                
                if (peopleData && peopleData[personIndex] && peopleData[personIndex].element) {
                    peopleData[personIndex].dead = true;
                    peopleData[personIndex].element.style.opacity = '0.15';
                    const currentOpacity = window.getComputedStyle(peopleData[personIndex].element).opacity;
                    console.log(`  ✓ SET opacity to 0.15 for person ${personIndex}, current computed opacity: ${currentOpacity}`);
                    restoredCount++;
                } else {
                    console.warn(`  ✗ FAILED to restore person ${personIndex}`);
                }
            });
            
            // Also check peopleDataState for any dead people that might have been missed
            if (savedPeopleDataState) {
                console.log('[Suspect] Checking savedPeopleDataState for additional dead people...');
                savedPeopleDataState.forEach((state, i) => {
                    if (state.dead) {
                        console.log(`[Suspect] Found dead person ${i} in peopleDataState`);
                        if (peopleData && peopleData[i] && peopleData[i].element) {
                            if (!peopleData[i].dead) {
                                peopleData[i].dead = true;
                                peopleData[i].element.style.opacity = '0.15';
                                const currentOpacity = window.getComputedStyle(peopleData[i].element).opacity;
                                console.log(`  ✓ SET opacity to 0.15 for person ${i} from peopleDataState, current computed opacity: ${currentOpacity}`);
                                restoredCount++;
                            } else {
                                console.log(`  - Person ${i} already marked as dead, setting opacity anyway`);
                                peopleData[i].element.style.opacity = '0.15';
                                const currentOpacity = window.getComputedStyle(peopleData[i].element).opacity;
                                console.log(`  ✓ SET opacity to 0.15 for person ${i}, current computed opacity: ${currentOpacity}`);
                            }
                        } else {
                            console.warn(`  ✗ Could not restore person ${i} from peopleDataState - element not ready`);
                        }
                    }
                });
            }
            
            console.log(`[Suspect] === RESTORATION COMPLETE: ${restoredCount} dead people restored ===`);
            return restoredCount;
        };
        
        // Try multiple times to ensure elements are ready
        // Use a more aggressive approach with multiple attempts
        let attempts = 0;
        const maxAttempts = 20;
        const tryRestore = () => {
            attempts++;
            const restored = restoreDeadPeople();
            if (restored < deadPeople.length && attempts < maxAttempts) {
                setTimeout(tryRestore, 50);
            } else if (attempts >= maxAttempts) {
                console.warn(`[Suspect] Max attempts reached. Restored ${restored} out of ${deadPeople.length} dead people`);
            }
        };
        
        // Start restoration after a short delay to ensure DOM is ready
        setTimeout(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    tryRestore();
                });
            });
        }, 200);
        
        // Continue game from saved state
        if (action === 'enemy turn') {
            killerTurn();
        }
        
        // Start game loop
        requestAnimationFrame(gameLoop);
    } else {
        // New game - reset game state
instructionDiv.textContent = "Killer's turn";
nextButton.style.opacity = '0.5';
nextButton.style.pointerEvents = 'none';
accuseButton.style.opacity = '0.5';
accuseButton.style.pointerEvents = 'none';
        accuseMode = false;
        questionCount = 0;
        questionedPeople = [];
        deadPeople = [];
        questionResults = [];
        currentRoundVictims = [];
        totalKilled = 0;
        action = "enemy turn";
        
        // Start game with killer's turn
killerTurn();

// Start game loop
requestAnimationFrame(gameLoop);
    }
}

let _suspectClick = (function() { try { const a = new Audio(new URL('../../sounds/click.mp3', window.location.href).href); a.preload = 'auto'; a.load(); return a; } catch (e) { return null; } })();
const playSuspectClick = () => { try { if (_suspectClick) { _suspectClick.currentTime = 0; _suspectClick.play().catch(() => {}); } } catch (e) {} };
playButton.addEventListener('click', () => {
    playSuspectClick();
    startGame();
});

// Setup help button
function setupHelpButton() {
    const helpButton = document.getElementById('helpButton');
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            // Show start menu and hide game
            const startMenu = document.getElementById('startMenu');
            const gameContainer = document.getElementById('gameContainer');
            if (startMenu) startMenu.style.display = 'flex';
            if (gameContainer) gameContainer.style.display = 'none';
        });
    }
}

// Initialize help button
setupHelpButton();

// Check for saved game state on page load and skip start menu if game has started
function checkForSavedGameOnLoad() {
    const todayKey = getTodayKey();
    const savedState = localStorage.getItem(`suspectState_${todayKey}`);
    const isComplete = localStorage.getItem(`suspectComplete_${todayKey}`) === 'true';
    
    // If there's saved state or game is complete, hide start menu immediately
    if (savedState || isComplete) {
        if (startMenu) {
            startMenu.style.display = 'none';
        }
        if (gameContainer) {
            gameContainer.style.display = 'flex';
        }
        
        // Wait for peopleData to be populated, then start game
        const checkAndStart = () => {
            if (peopleData && peopleData.length > 0) {
                startGame();
            } else {
                setTimeout(checkAndStart, 50);
            }
        };
        checkAndStart();
    }
}

// Check for saved game immediately when script loads (before DOM ready)
// Hide start menu right away if there's saved state
(function() {
    const todayKey = getTodayKey();
    const savedState = localStorage.getItem(`suspectState_${todayKey}`);
    const isComplete = localStorage.getItem(`suspectComplete_${todayKey}`) === 'true';
    
    if (savedState || isComplete) {
        // Hide start menu as soon as DOM elements are available
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                const startMenu = document.getElementById('startMenu');
                const gameContainer = document.getElementById('gameContainer');
                if (startMenu) startMenu.style.display = 'none';
                if (gameContainer) gameContainer.style.display = 'flex';
            });
        } else {
            const startMenu = document.getElementById('startMenu');
            const gameContainer = document.getElementById('gameContainer');
            if (startMenu) startMenu.style.display = 'none';
            if (gameContainer) gameContainer.style.display = 'flex';
        }
    }
})();

// Check for saved game when page loads (after all initialization)
// This runs at the end of the script, after peopleData is created
setTimeout(() => {
    checkForSavedGameOnLoad();
}, 100);

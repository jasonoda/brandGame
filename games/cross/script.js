const referenceGrid = document.getElementById('referenceGrid');
const cellsContainer = document.getElementById('cellsContainer');
const numberLeftBtn = document.getElementById('numberLeft');
const numberRightBtn = document.getElementById('numberRight');
const letterLeftBtn = document.getElementById('letterLeft');
const letterRightBtn = document.getElementById('letterRight');
const hintButton = document.getElementById('hintButton');
const hintAnswers = document.getElementById('hintAnswers');

const gridSize = 5;
const cellSize = 60;
const gap = 4;

// Number track positions (outer ring, clockwise starting from top-left)
// Based on pattern: 1,16,15,14,11 (top), 12,11,10,9 (right), 8,7,6,5 (bottom), 4,3,2 (left)
const numberPositions = [
    [0,0], [0,1], [0,2], [0,3], [0,4],  // Top: 1,16,15,14,11
    [1,4], [2,4], [3,4], [4,4],         // Right: 12,11,10,9
    [4,3], [4,2], [4,1], [4,0],         // Bottom: 8,7,6,5
    [3,0], [2,0], [1,0]                  // Left: 4,3,2
];

// Letter track positions (inner ring, clockwise starting from top-left)
// Based on pattern: A,H,G (top), F (right), E,D,C (bottom), B (left)
// Note: Center [2,2] is handled separately and does NOT shift - it's NOT in this array
const letterPositions = [
    [1,1], [1,2], [1,3],  // Top: A,H,G
    [2,3],                 // Right: F
    [3,3], [3,2], [3,1],  // Bottom: E,D,C
    [2,1]                  // Left: B
];

// Get random words from gameVars
const answerWords = getRandomCrossWords(2);
let answerWord1 = answerWords[0];
let answerWord2 = answerWords[1];
const answerWord = answerWord1; // For backwards compatibility
let answerWordLength = answerWord1.length;

// Store answer chains globally for validation
let globalAnswerChain1 = null;
let globalAnswerChain2 = null;
let globalShiftedNumberPositions1 = null;
let globalShiftedLetterPositions1 = null;
let globalShiftedNumberPositions2 = null;
let globalShiftedLetterPositions2 = null;
let globalNumberShift1 = null;
let globalLetterShift1 = null;
let globalNumberShift2 = null;
let globalLetterShift2 = null;
let globalWord1CellIndices = null; // Set of cell indices that belong to word1 (e.g., "number-5", "letter-3", "center")
let globalWord2CellIndices = null; // Set of cell indices that belong to word2

// Generate unique random letters excluding answer letters (no repeats)
function getUniqueRandomLetters(count, excludeLetters = []) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const available = letters.split('').filter(letter => !excludeLetters.includes(letter));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Fixed blank indices (cell-based, not grid-based)
// Outer ring: indices 0, 4, 8, 12 are always blank
// Inner ring: indices 6, 2 are always blank
// NO OTHER BLANKS should exist

// Get all available positions (outer + inner rings + center, excluding always-blank indices)
function getAllAvailablePositions() {
    const alwaysBlankNumberIndices = [0, 4, 8, 12];
    const alwaysBlankLetterIndices = [6, 2];
    
    const available = [];
    
    // Add non-blank number positions
    numberPositions.forEach((pos, index) => {
        if (!alwaysBlankNumberIndices.includes(index)) {
            available.push(pos);
        }
    });
    
    // Add non-blank letter positions
    letterPositions.forEach((pos, index) => {
        if (!alwaysBlankLetterIndices.includes(index)) {
            available.push(pos);
        }
    });
    
    // Add center
    available.push([2,2]);
    
    return available;
}

// Check if a position is within the grid bounds
function isValidPosition(row, col) {
    return row >= 0 && row < gridSize && col >= 0 && col < gridSize && !(row === 2 && col === 2);
}

// Get 4 possible directions (horizontal and vertical only, no diagonals)
function getDirections() {
    return [
        [-1, 0],  // top
        [0, 1],   // right
        [1, 0],   // bottom
        [0, -1]   // left
    ];
}

// Find a valid chain by starting at random position and moving in random directions
function findValidChain(wordLength, availablePositions) {
    const maxAttempts = 100;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Create a set of available positions for quick lookup
        const availableSet = new Set(availablePositions.map(pos => `${pos[0]},${pos[1]}`));
        const usedSet = new Set();
        const chain = [];
        
        // Start at a random position
        const startPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        let currentRow = startPos[0];
        let currentCol = startPos[1];
        
        chain.push([currentRow, currentCol]);
        usedSet.add(`${currentRow},${currentCol}`);
        
        // Place each letter by moving in a random direction
        for (let i = 1; i < wordLength; i++) {
            const directions = getDirections();
            const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
            
            let foundNext = false;
            for (const [dr, dc] of shuffledDirs) {
                const newRow = currentRow + dr;
                const newCol = currentCol + dc;
                const posKey = `${newRow},${newCol}`;
                
                // Check if this position is valid and available
                if (isValidPosition(newRow, newCol) && availableSet.has(posKey) && !usedSet.has(posKey)) {
                    currentRow = newRow;
                    currentCol = newCol;
                    chain.push([currentRow, currentCol]);
                    usedSet.add(posKey);
                    foundNext = true;
                    break;
                }
            }
            
            // If we can't find a next position, this attempt failed
            if (!foundNext) {
                break;
            }
        }
        
        // If we successfully placed all letters, return the chain
        if (chain.length === wordLength) {
            return chain;
        }
    }
    
    // If all attempts failed, return null to indicate failure
    return null;
}

// Generate puzzle with two answer words at different shift states
function generatePuzzle() {
    const maxTotalAttempts = 50; // Maximum attempts to place both words
    const maxWord2Attempts = 20; // Maximum attempts to place word 2 per word 1 placement
    
    for (let totalAttempt = 0; totalAttempt < maxTotalAttempts; totalAttempt++) {
        // Fixed blank indices that should ALWAYS be blank (BEFORE puzzle generation)
        const alwaysBlankNumberIndices = [0, 4, 8, 12]; // Outer ring blanks
        const alwaysBlankLetterIndices = [6, 2]; // Inner ring blanks
        const centerPosKey = '2,2'; // Center position key
        
        // FIRST: Apply random shift 1 to both rings (for word 1)
        const randomNumberShift1 = Math.floor(Math.random() * numberPositions.length);
        const randomLetterShift1 = Math.floor(Math.random() * letterPositions.length);
        
        // Calculate shifted positions for shift 1
        const shiftedNumberPositions1 = [];
        for (let i = 0; i < numberPositions.length; i++) {
            const targetPositionIndex = (i + randomNumberShift1) % numberPositions.length;
            shiftedNumberPositions1[i] = numberPositions[targetPositionIndex];
        }
        
        const shiftedLetterPositions1 = [];
        for (let i = 0; i < letterPositions.length; i++) {
            const targetPositionIndex = (i + randomLetterShift1) % letterPositions.length;
            shiftedLetterPositions1[i] = letterPositions[targetPositionIndex];
        }
        
        // Get available positions after shift 1 (excluding always-blank indices)
        const availableShiftedNumberPositions1 = [];
        const availableShiftedLetterPositions1 = [];
        
        for (let i = 0; i < shiftedNumberPositions1.length; i++) {
            if (!alwaysBlankNumberIndices.includes(i)) {
                availableShiftedNumberPositions1.push(shiftedNumberPositions1[i]);
            }
        }
        
        for (let i = 0; i < shiftedLetterPositions1.length; i++) {
            if (!alwaysBlankLetterIndices.includes(i)) {
                availableShiftedLetterPositions1.push(shiftedLetterPositions1[i]);
            }
        }
        
        const allPositionsShifted1 = [...availableShiftedNumberPositions1, ...availableShiftedLetterPositions1, [2,2]];
        
        // Place word 1 at shift 1
        const answerLetters1 = answerWord1.split('');
        let answerChain1 = findValidChain(answerWord1.length, allPositionsShifted1);
        
        if (!answerChain1) {
            continue; // Try again with new shift 1
        }
        
        // Create position map with word 1 placed
        const positionToLetter = new Map();
        answerChain1.forEach((pos, index) => {
            const posKey = `${pos[0]},${pos[1]}`;
            positionToLetter.set(posKey, answerLetters1[index]);
        });
        
        // Track which CELL INDICES are used by word1 (at shift1)
        // We need to ensure word2 doesn't use the same cells (at shift2)
        const word1CellIndices = new Set();
        for (let i = 0; i < shiftedNumberPositions1.length; i++) {
            const pos = shiftedNumberPositions1[i];
            const posKey = `${pos[0]},${pos[1]}`;
            if (answerChain1.some(chainPos => `${chainPos[0]},${chainPos[1]}` === posKey)) {
                word1CellIndices.add(`number-${i}`);
            }
        }
        for (let i = 0; i < shiftedLetterPositions1.length; i++) {
            const pos = shiftedLetterPositions1[i];
            const posKey = `${pos[0]},${pos[1]}`;
            if (answerChain1.some(chainPos => `${chainPos[0]},${chainPos[1]}` === posKey)) {
                word1CellIndices.add(`letter-${i}`);
            }
        }
        if (answerChain1.some(pos => pos[0] === 2 && pos[1] === 2)) {
            word1CellIndices.add('center');
        }
        
        // Now try to place word 2 at a DIFFERENT shift state
        const answerLetters2 = answerWord2.split('');
        let answerChain2 = null;
        let shift2Success = false;
        let randomNumberShift2, randomLetterShift2;
        let shiftedNumberPositions2, shiftedLetterPositions2;
        
        for (let word2Attempt = 0; word2Attempt < maxWord2Attempts; word2Attempt++) {
            // Apply a DIFFERENT random shift 2 (must be different from shift 1)
            do {
                randomNumberShift2 = Math.floor(Math.random() * numberPositions.length);
                randomLetterShift2 = Math.floor(Math.random() * letterPositions.length);
            } while (randomNumberShift2 === randomNumberShift1 && randomLetterShift2 === randomLetterShift1);
            
            // Calculate shifted positions for shift 2
            shiftedNumberPositions2 = [];
            for (let i = 0; i < numberPositions.length; i++) {
                const targetPositionIndex = (i + randomNumberShift2) % numberPositions.length;
                shiftedNumberPositions2[i] = numberPositions[targetPositionIndex];
            }
            
            shiftedLetterPositions2 = [];
            for (let i = 0; i < letterPositions.length; i++) {
                const targetPositionIndex = (i + randomLetterShift2) % letterPositions.length;
                shiftedLetterPositions2[i] = letterPositions[targetPositionIndex];
            }
            
            // Get available positions after shift 2, BUT EXCLUDE positions where cells would overlap with word1
            // A position is available for word2 only if the cell that will be there at shift2 is NOT used by word1 at shift1
            const availableShiftedNumberPositions2 = [];
            const availableShiftedLetterPositions2 = [];
            
            for (let i = 0; i < shiftedNumberPositions2.length; i++) {
                if (!alwaysBlankNumberIndices.includes(i)) {
                    // Check if this cell index is used by word1 - if so, skip this position for word2
                    if (!word1CellIndices.has(`number-${i}`)) {
                        availableShiftedNumberPositions2.push(shiftedNumberPositions2[i]);
                    }
                }
            }
            
            for (let i = 0; i < shiftedLetterPositions2.length; i++) {
                if (!alwaysBlankLetterIndices.includes(i)) {
                    // Check if this cell index is used by word1 - if so, skip this position for word2
                    if (!word1CellIndices.has(`letter-${i}`)) {
                        availableShiftedLetterPositions2.push(shiftedLetterPositions2[i]);
                    }
                }
            }
            
            // Check center - only available if not used by word1
            const allPositionsShifted2 = [...availableShiftedNumberPositions2, ...availableShiftedLetterPositions2];
            if (!word1CellIndices.has('center')) {
                allPositionsShifted2.push([2,2]);
            }
            
            // Try to place word 2 at shift 2 (using only positions where cells don't overlap with word1)
            answerChain2 = findValidChain(answerWord2.length, allPositionsShifted2);
            
            if (answerChain2) {
                // Success! Verify that word2 cells don't overlap with word1 cells
                let hasConflict = false;
                for (const word2Pos of answerChain2) {
                    const posKey = `${word2Pos[0]},${word2Pos[1]}`;
                    // Find which cell index will be at this position at shift2
                    for (let i = 0; i < shiftedNumberPositions2.length; i++) {
                        if (shiftedNumberPositions2[i][0] === word2Pos[0] && shiftedNumberPositions2[i][1] === word2Pos[1]) {
                            if (word1CellIndices.has(`number-${i}`)) {
                                hasConflict = true;
                                break;
                            }
                        }
                    }
                    if (!hasConflict) {
                        for (let i = 0; i < shiftedLetterPositions2.length; i++) {
                            if (shiftedLetterPositions2[i][0] === word2Pos[0] && shiftedLetterPositions2[i][1] === word2Pos[1]) {
                                if (word1CellIndices.has(`letter-${i}`)) {
                                    hasConflict = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (word2Pos[0] === 2 && word2Pos[1] === 2 && word1CellIndices.has('center')) {
                        hasConflict = true;
                    }
                    if (hasConflict) break;
                }
                
                if (!hasConflict) {
                    shift2Success = true;
                    break; // Found both words with no cell conflicts!
                }
            }
        }
        
        if (!shift2Success) {
            continue; // Start over with new shift 1
        }
        
        // Both words placed! Now create position maps for both shift states
        // positionToLetter already has word 1 at shift 1 positions
        // Create positionToLetter2 for word 2 at shift 2 positions
        const positionToLetter2 = new Map();
        answerChain2.forEach((pos, index) => {
            const posKey = `${pos[0]},${pos[1]}`;
            positionToLetter2.set(posKey, answerLetters2[index]);
        });
        
        // Store answer chains and shift positions globally for validation
        globalAnswerChain1 = answerChain1;
        globalAnswerChain2 = answerChain2;
        globalShiftedNumberPositions1 = shiftedNumberPositions1;
        globalShiftedLetterPositions1 = shiftedLetterPositions1;
        globalShiftedNumberPositions2 = shiftedNumberPositions2;
        globalShiftedLetterPositions2 = shiftedLetterPositions2;
        globalNumberShift1 = randomNumberShift1;
        globalLetterShift1 = randomLetterShift1;
        globalNumberShift2 = randomNumberShift2;
        globalLetterShift2 = randomLetterShift2;
        
        // Fill remaining positions at shift 1 with random letters (for word 1 visibility)
        const remainingPositions1 = [];
        for (let i = 0; i < shiftedNumberPositions1.length; i++) {
            if (!alwaysBlankNumberIndices.includes(i)) {
                const pos = shiftedNumberPositions1[i];
                const posKey = `${pos[0]},${pos[1]}`;
                if (!positionToLetter.has(posKey)) {
                    remainingPositions1.push(pos);
                }
            }
        }
        for (let i = 0; i < shiftedLetterPositions1.length; i++) {
            if (!alwaysBlankLetterIndices.includes(i)) {
                const pos = shiftedLetterPositions1[i];
                const posKey = `${pos[0]},${pos[1]}`;
                if (!positionToLetter.has(posKey)) {
                    remainingPositions1.push(pos);
                }
            }
        }
        if (!positionToLetter.has(centerPosKey)) {
            remainingPositions1.push([2,2]);
        }
        
        // Fill remaining positions at shift 2 with random letters (for word 2 visibility)
        const remainingPositions2 = [];
        for (let i = 0; i < shiftedNumberPositions2.length; i++) {
            if (!alwaysBlankNumberIndices.includes(i)) {
                const pos = shiftedNumberPositions2[i];
                const posKey = `${pos[0]},${pos[1]}`;
                if (!positionToLetter2.has(posKey)) {
                    remainingPositions2.push(pos);
                }
            }
        }
        for (let i = 0; i < shiftedLetterPositions2.length; i++) {
            if (!alwaysBlankLetterIndices.includes(i)) {
                const pos = shiftedLetterPositions2[i];
                const posKey = `${pos[0]},${pos[1]}`;
                if (!positionToLetter2.has(posKey)) {
                    remainingPositions2.push(pos);
                }
            }
        }
        if (!positionToLetter2.has(centerPosKey)) {
            remainingPositions2.push([2,2]);
        }
        
        // Fill both maps with unique random letters (excluding both answer words' letters)
        const allAnswerLetters = [...answerLetters1, ...answerLetters2];
        const uniqueRandomLetters1 = getUniqueRandomLetters(remainingPositions1.length, allAnswerLetters);
        remainingPositions1.forEach((pos, index) => {
            const posKey = `${pos[0]},${pos[1]}`;
            positionToLetter.set(posKey, uniqueRandomLetters1[index]);
        });
        
        const uniqueRandomLetters2 = getUniqueRandomLetters(remainingPositions2.length, allAnswerLetters);
        remainingPositions2.forEach((pos, index) => {
            const posKey = `${pos[0]},${pos[1]}`;
            positionToLetter2.set(posKey, uniqueRandomLetters2[index]);
        });
        
        // Map values back to original positions
        // Strategy: For each cell index i, assign the letter that should be at its shift2 position (for word2)
        // OR the letter from shift1 position (for word1), prioritizing word2 positions
        // This ensures: at shift1, word1 appears; at shift2, word2 appears
        const numberValues = [];
        const letterValues = [];
        let centerLetter = '';
        
        // Map values back: Assign letters based on which word uses each cell
        // Word1 uses certain cells at shift1, word2 uses different cells at shift2
        // Since they don't share cells, we can assign without conflicts
        
        // Build map: which cell index is used by word1
        const word1CellIndicesFinal = new Set();
        answerChain1.forEach((pos) => {
            const posKey = `${pos[0]},${pos[1]}`;
            // Find which cell index will be at this position at shift1
            for (let i = 0; i < shiftedNumberPositions1.length; i++) {
                const shift1Pos = shiftedNumberPositions1[i];
                if (shift1Pos[0] === pos[0] && shift1Pos[1] === pos[1]) {
                    word1CellIndicesFinal.add(`number-${i}`);
                    break;
                }
            }
            for (let i = 0; i < shiftedLetterPositions1.length; i++) {
                const shift1Pos = shiftedLetterPositions1[i];
                if (shift1Pos[0] === pos[0] && shift1Pos[1] === pos[1]) {
                    word1CellIndicesFinal.add(`letter-${i}`);
                    break;
                }
            }
            if (pos[0] === 2 && pos[1] === 2) {
                word1CellIndicesFinal.add('center');
            }
        });
        
        // Build map: which cell index is used by word2
        const word2CellIndicesFinal = new Set();
        answerChain2.forEach((pos) => {
            const posKey = `${pos[0]},${pos[1]}`;
            // Find which cell index will be at this position at shift2
            for (let i = 0; i < shiftedNumberPositions2.length; i++) {
                const shift2Pos = shiftedNumberPositions2[i];
                if (shift2Pos[0] === pos[0] && shift2Pos[1] === pos[1]) {
                    word2CellIndicesFinal.add(`number-${i}`);
                    break;
                }
            }
            for (let i = 0; i < shiftedLetterPositions2.length; i++) {
                const shift2Pos = shiftedLetterPositions2[i];
                if (shift2Pos[0] === pos[0] && shift2Pos[1] === pos[1]) {
                    word2CellIndicesFinal.add(`letter-${i}`);
                    break;
                }
            }
            if (pos[0] === 2 && pos[1] === 2) {
                word2CellIndicesFinal.add('center');
            }
        });
        
        // Store which cells belong to which word (after they're defined)
        globalWord1CellIndices = word1CellIndicesFinal;
        globalWord2CellIndices = word2CellIndicesFinal;
        
        // Map back: assign word1 letters to word1 cells, word2 letters to word2 cells
        for (let i = 0; i < numberPositions.length; i++) {
            if (alwaysBlankNumberIndices.includes(i)) {
                numberValues[i] = '';
            } else {
                if (word1CellIndicesFinal.has(`number-${i}`)) {
                    // This cell is used by word1 - assign word1 letter
                    const shiftedPos1 = shiftedNumberPositions1[i];
                    const posKey1 = `${shiftedPos1[0]},${shiftedPos1[1]}`;
                    numberValues[i] = positionToLetter.get(posKey1) || getUniqueRandomLetters(1, allAnswerLetters)[0] || 'A';
                } else if (word2CellIndicesFinal.has(`number-${i}`)) {
                    // This cell is used by word2 - assign word2 letter
                    const shiftedPos2 = shiftedNumberPositions2[i];
                    const posKey2 = `${shiftedPos2[0]},${shiftedPos2[1]}`;
                    numberValues[i] = positionToLetter2.get(posKey2) || getUniqueRandomLetters(1, allAnswerLetters)[0] || 'A';
                } else {
                    // This cell is not used by either word - use word1 mapping (random letter)
                    const shiftedPos1 = shiftedNumberPositions1[i];
                    const posKey1 = `${shiftedPos1[0]},${shiftedPos1[1]}`;
                    numberValues[i] = positionToLetter.get(posKey1) || getUniqueRandomLetters(1, allAnswerLetters)[0] || 'A';
                }
            }
        }
        
        for (let i = 0; i < letterPositions.length; i++) {
            if (alwaysBlankLetterIndices.includes(i)) {
                letterValues[i] = '';
            } else {
                if (word1CellIndicesFinal.has(`letter-${i}`)) {
                    // This cell is used by word1 - assign word1 letter
                    const shiftedPos1 = shiftedLetterPositions1[i];
                    const posKey1 = `${shiftedPos1[0]},${shiftedPos1[1]}`;
                    letterValues[i] = positionToLetter.get(posKey1) || getUniqueRandomLetters(1, allAnswerLetters)[0] || 'A';
                } else if (word2CellIndicesFinal.has(`letter-${i}`)) {
                    // This cell is used by word2 - assign word2 letter
                    const shiftedPos2 = shiftedLetterPositions2[i];
                    const posKey2 = `${shiftedPos2[0]},${shiftedPos2[1]}`;
                    letterValues[i] = positionToLetter2.get(posKey2) || getUniqueRandomLetters(1, allAnswerLetters)[0] || 'A';
                } else {
                    // This cell is not used by either word - use word1 mapping (random letter)
                    const shiftedPos1 = shiftedLetterPositions1[i];
                    const posKey1 = `${shiftedPos1[0]},${shiftedPos1[1]}`;
                    letterValues[i] = positionToLetter.get(posKey1) || getUniqueRandomLetters(1, allAnswerLetters)[0] || 'A';
                }
            }
        }
        
        // Center: assign based on which word uses it
        if (word1CellIndicesFinal.has('center')) {
            centerLetter = positionToLetter.get(centerPosKey) || getUniqueRandomLetters(1, allAnswerLetters)[0] || 'A';
        } else if (word2CellIndicesFinal.has('center')) {
            centerLetter = positionToLetter2.get(centerPosKey) || getUniqueRandomLetters(1, allAnswerLetters)[0] || 'A';
        } else {
            centerLetter = positionToLetter.get(centerPosKey) || getUniqueRandomLetters(1, allAnswerLetters)[0] || 'A';
        }
        
        // Store shift states and position maps for finding the words
        window.word1ShiftState = { numberShift: randomNumberShift1, letterShift: randomLetterShift1 };
        window.word2ShiftState = { numberShift: randomNumberShift2, letterShift: randomLetterShift2 };
        window.word1Positions = positionToLetter;
        window.word2Positions = positionToLetter2;
        
        return { 
            numberValues: numberValues, 
            letterValues: letterValues,
            centerLetter: centerLetter
        };
    }
    
    // If we couldn't place both words after many attempts, fall back to single word
    console.warn('Could not place both words after many attempts, falling back to single word');
    return generateSingleWordPuzzle();
}

// Fallback: Generate puzzle with single word (original logic)
function generateSingleWordPuzzle() {
    const alwaysBlankNumberIndices = [0, 4, 8, 12];
    const alwaysBlankLetterIndices = [6, 2];
    
    const randomNumberShift = Math.floor(Math.random() * numberPositions.length);
    const randomLetterShift = Math.floor(Math.random() * letterPositions.length);
    
    const shiftedNumberPositions = [];
    for (let i = 0; i < numberPositions.length; i++) {
        const targetPositionIndex = (i + randomNumberShift) % numberPositions.length;
        shiftedNumberPositions[i] = numberPositions[targetPositionIndex];
    }
    
    const shiftedLetterPositions = [];
    for (let i = 0; i < letterPositions.length; i++) {
        const targetPositionIndex = (i + randomLetterShift) % letterPositions.length;
        shiftedLetterPositions[i] = letterPositions[targetPositionIndex];
    }
    
    const availableShiftedNumberPositions = [];
    const availableShiftedLetterPositions = [];
    
    for (let i = 0; i < shiftedNumberPositions.length; i++) {
        if (!alwaysBlankNumberIndices.includes(i)) {
            availableShiftedNumberPositions.push(shiftedNumberPositions[i]);
        }
    }
    
    for (let i = 0; i < shiftedLetterPositions.length; i++) {
        if (!alwaysBlankLetterIndices.includes(i)) {
            availableShiftedLetterPositions.push(shiftedLetterPositions[i]);
        }
    }
    
    const allPositionsShifted = [...availableShiftedNumberPositions, ...availableShiftedLetterPositions, [2,2]];
    
    const answerLetters = answerWord1.split('');
    let answerChain = null;
    while (!answerChain) {
        answerChain = findValidChain(answerWord1.length, allPositionsShifted);
    }
    
    const positionToLetter = new Map();
    answerChain.forEach((pos, index) => {
        const posKey = `${pos[0]},${pos[1]}`;
        positionToLetter.set(posKey, answerLetters[index]);
    });
    
    const remainingPositions = [];
    for (let i = 0; i < shiftedNumberPositions.length; i++) {
        if (!alwaysBlankNumberIndices.includes(i)) {
            const pos = shiftedNumberPositions[i];
            const posKey = `${pos[0]},${pos[1]}`;
            if (!positionToLetter.has(posKey)) {
                remainingPositions.push(pos);
            }
        }
    }
    
    for (let i = 0; i < shiftedLetterPositions.length; i++) {
        if (!alwaysBlankLetterIndices.includes(i)) {
            const pos = shiftedLetterPositions[i];
            const posKey = `${pos[0]},${pos[1]}`;
            if (!positionToLetter.has(posKey)) {
                remainingPositions.push(pos);
            }
        }
    }
    
    const centerPosKey = '2,2';
    if (!positionToLetter.has(centerPosKey)) {
        remainingPositions.push([2,2]);
    }
    
    const uniqueRandomLetters = getUniqueRandomLetters(remainingPositions.length, answerLetters);
    remainingPositions.forEach((pos, index) => {
        const posKey = `${pos[0]},${pos[1]}`;
        positionToLetter.set(posKey, uniqueRandomLetters[index]);
    });
    
    const numberValues = [];
    const letterValues = [];
    let centerLetter = '';
    
    for (let i = 0; i < numberPositions.length; i++) {
        if (alwaysBlankNumberIndices.includes(i)) {
            numberValues[i] = '';
        } else {
            const shiftedPos = shiftedNumberPositions[i];
            const posKey = `${shiftedPos[0]},${shiftedPos[1]}`;
            const value = positionToLetter.get(posKey);
            if (value === undefined || value === '') {
                numberValues[i] = getUniqueRandomLetters(1, answerLetters)[0] || 'A';
            } else {
                numberValues[i] = value;
            }
        }
    }
    
    for (let i = 0; i < letterPositions.length; i++) {
        if (alwaysBlankLetterIndices.includes(i)) {
            letterValues[i] = '';
        } else {
            const shiftedPos = shiftedLetterPositions[i];
            const posKey = `${shiftedPos[0]},${pos[1]}`;
            const value = positionToLetter.get(posKey);
            if (value === undefined || value === '') {
                letterValues[i] = getUniqueRandomLetters(1, answerLetters)[0] || 'A';
            } else {
                letterValues[i] = value;
            }
        }
    }
    
    centerLetter = positionToLetter.get('2,2') || '';
    
    // Build word1 cell indices for single word puzzle
    const word1CellIndicesSingle = new Set();
    answerChain.forEach((pos) => {
        // Find which cell index will be at this position
        for (let i = 0; i < shiftedNumberPositions.length; i++) {
            const shiftPos = shiftedNumberPositions[i];
            if (shiftPos[0] === pos[0] && shiftPos[1] === pos[1]) {
                word1CellIndicesSingle.add(`number-${i}`);
                break;
            }
        }
        for (let i = 0; i < shiftedLetterPositions.length; i++) {
            const shiftPos = shiftedLetterPositions[i];
            if (shiftPos[0] === pos[0] && shiftPos[1] === pos[1]) {
                word1CellIndicesSingle.add(`letter-${i}`);
                break;
            }
        }
        if (pos[0] === 2 && pos[1] === 2) {
            word1CellIndicesSingle.add('center');
        }
    });
    
    // Set global word associations for single word puzzle
    globalWord1CellIndices = word1CellIndicesSingle;
    globalWord2CellIndices = new Set(); // Empty for single word puzzle
    
    return { 
        numberValues: numberValues, 
        letterValues: letterValues,
        centerLetter: centerLetter
    };
}

// Get today's key for localStorage
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Generate puzzle
let savedState = null;
let puzzle;
let numberValues, letterValues, centerLetter;

// Track which word was found FIRST (for color assignment) - declare before use
let firstWordFound = null; // 'word1' or 'word2' or null
let firstWordCells = []; // Cells for the first word found (always green)
let secondWordCells = []; // Cells for the second word found (always blue)

if (savedState && savedState.numberValues && savedState.letterValues) {
    // Load from saved state
    answerWord1 = savedState.answerWord1;
    answerWord2 = savedState.answerWord2;
    answerWordLength = answerWord1.length;
    numberValues = savedState.numberValues;
    letterValues = savedState.letterValues;
    centerLetter = savedState.centerLetter || '';
    word1Found = savedState.word1Found || false;
    word2Found = savedState.word2Found || false;
    hintCount = savedState.hintCount || 0;
    firstWordFound = savedState.firstWordFound || null;
    console.log('[Cross] Loaded game state from localStorage');
} else {
    // Generate new puzzle
    puzzle = generatePuzzle();
    numberValues = puzzle.numberValues;
    letterValues = puzzle.letterValues;
    centerLetter = puzzle.centerLetter;
}

let numberCells = [];
let letterCells = [];
let centerCell = null;
let word1Cells = [];
let word2Cells = [];

// Always start with rings in default position (no shifts)
numberShift = 0;
letterShift = 0;

// hintCount, word1Found, word2Found are set from savedState above if available
if (!savedState) {
    hintCount = 0;
    word1Found = false;
    word2Found = false;
    firstWordFound = null;
}

// Drag selection variables
let isDragging = false;
let selectedPath = [];
let allCells = [];
let dragHandlersSetup = false;
let gameInitialized = false;

// Create reference grid
function createReferenceGrid() {
    // Clear existing cells
    referenceGrid.innerHTML = '';
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        referenceGrid.appendChild(cell);
    }
}

// Create number cells (outer ring)
function createNumberCells() {
    // Clear existing number cells
    numberCells.forEach(cell => {
        if (cell.parentNode) {
            cell.parentNode.removeChild(cell);
        }
    });
    numberCells = [];
    
    numberValues.forEach((letter, index) => {
        const cell = document.createElement('div');
        cell.className = 'letter-cell';
        const [row, col] = numberPositions[index];
        
        // Simple: if value is empty, it's blank. Otherwise show the letter.
        if (letter === '') {
            cell.dataset.blank = 'true';
            cell.textContent = '';
        } else {
            cell.textContent = letter;
        }
        cell.dataset.numberIndex = index;
        
        // Associate cell with word1 or word2 if it belongs to one
        if (globalWord1CellIndices && globalWord1CellIndices.has(`number-${index}`)) {
            cell.dataset.wordAssociation = 'word1';
        } else if (globalWord2CellIndices && globalWord2CellIndices.has(`number-${index}`)) {
            cell.dataset.wordAssociation = 'word2';
        }
        
        cell.style.top = `${row * (cellSize + gap)}px`;
        cell.style.left = `${col * (cellSize + gap)}px`;
        
        cellsContainer.appendChild(cell);
        numberCells.push(cell);
    });
}

// Create letter cells (inner ring)
function createLetterCells() {
    // Clear existing letter cells
    letterCells.forEach(cell => {
        if (cell.parentNode) {
            cell.parentNode.removeChild(cell);
        }
    });
    letterCells = [];
    
    letterValues.forEach((letter, index) => {
        const cell = document.createElement('div');
        cell.className = 'letter-cell';
        const [row, col] = letterPositions[index];
        
        // Simple: if value is empty, it's blank. Otherwise show the letter.
        if (letter === '') {
            cell.dataset.blank = 'true';
            cell.textContent = '';
        } else {
            cell.textContent = letter;
        }
        cell.dataset.letterIndex = index;
        
        // Associate cell with word1 or word2 if it belongs to one
        if (globalWord1CellIndices && globalWord1CellIndices.has(`letter-${index}`)) {
            cell.dataset.wordAssociation = 'word1';
        } else if (globalWord2CellIndices && globalWord2CellIndices.has(`letter-${index}`)) {
            cell.dataset.wordAssociation = 'word2';
        }
        
        cell.style.top = `${row * (cellSize + gap)}px`;
        cell.style.left = `${col * (cellSize + gap)}px`;
        
        cellsContainer.appendChild(cell);
        letterCells.push(cell);
    });
    
    // Add center cell - this does NOT shift, it's static
    centerCell = document.createElement('div');
    centerCell.className = 'letter-cell';
    if (centerLetter === '') {
        centerCell.dataset.blank = 'true';
        centerCell.textContent = '';
    } else {
        centerCell.textContent = centerLetter;
    }
    // Associate center cell with word1 or word2 if it belongs to one
    if (globalWord1CellIndices && globalWord1CellIndices.has('center')) {
        centerCell.dataset.wordAssociation = 'word1';
    } else if (globalWord2CellIndices && globalWord2CellIndices.has('center')) {
        centerCell.dataset.wordAssociation = 'word2';
    }
    centerCell.style.top = `${2 * (cellSize + gap)}px`;
    centerCell.style.left = `${2 * (cellSize + gap)}px`;
    cellsContainer.appendChild(centerCell);
    
    // Store all cells for drag functionality (after centerCell is created)
    updateAllCells();
}

// Update the allCells array (called after cells are created/updated)
function updateAllCells() {
    // Preserve word1 cells when updating
    const oldWord1Cells = word1Found ? [...word1Cells] : [];
    
    allCells = [...numberCells, ...letterCells];
    if (centerCell) {
        allCells.push(centerCell);
    }
    allCells = allCells.filter(cell => !cell.dataset.blank && cell.textContent.trim() !== '');
    
    // If word1 was found, preserve the green highlighting on word1 cells
    if (word1Found && oldWord1Cells.length > 0) {
        // Update word1Cells to only include cells that still exist in allCells
        word1Cells = oldWord1Cells.filter(cell => allCells.includes(cell));
        // Ensure all word1 cells still have their green class
        word1Cells.forEach(cell => {
            cell.classList.add('selected-word1');
            cell.classList.remove('selected-word2');
        });
    }
}

// Shift numbers (outer ring)
function shiftNumbers(direction) {
    numberShift += direction;
    
    // Normalize numberShift to prevent overflow (keep it within reasonable range)
    if (Math.abs(numberShift) > numberPositions.length * 100) {
        numberShift = numberShift % numberPositions.length;
    }
    
    // Make sure numberCells and numberPositions have matching lengths
    if (numberCells.length !== numberPositions.length) {
        console.error(`Length mismatch: numberCells.length=${numberCells.length}, numberPositions.length=${numberPositions.length}`);
        return;
    }
    
    numberCells.forEach((cell, index) => {
        // Cell at index i moves to position (i + shiftCount) % length in the circular track
        // The cell carries its original value (numberValues[index]) with it
        // Ensure positive result from modulo
        let targetPositionIndex = (index + numberShift) % numberPositions.length;
        if (targetPositionIndex < 0) {
            targetPositionIndex += numberPositions.length;
        }
        targetPositionIndex = targetPositionIndex % numberPositions.length;
        
        // Safety check to ensure index is valid
        if (targetPositionIndex < 0 || targetPositionIndex >= numberPositions.length) {
            console.error(`Invalid targetPositionIndex: ${targetPositionIndex} for number cell index ${index}, numberShift=${numberShift}`);
            return;
        }
        const targetPos = numberPositions[targetPositionIndex];
        if (!targetPos || !Array.isArray(targetPos) || targetPos.length !== 2) {
            console.error(`Invalid position at index ${targetPositionIndex}:`, targetPos);
            return;
        }
        const [row, col] = targetPos;
        if (index >= numberValues.length) {
            console.error(`Index ${index} out of bounds for numberValues (length=${numberValues.length})`);
            return;
        }
        const value = numberValues[index] || '';  // Cell keeps its original value
        
        // Simple: if value is empty, it's blank. Otherwise show the letter.
        if (value === '') {
            cell.dataset.blank = 'true';
            cell.textContent = '';
        } else {
            cell.removeAttribute('data-blank');
            cell.textContent = value;
        }
        
        gsap.to(cell, {
            top: `${row * (cellSize + gap)}px`,
            left: `${col * (cellSize + gap)}px`,
            duration: 0.3,
            ease: "power2.out"
        });
    });
}

// Shift letters (inner ring) - center [2,2] does NOT shift (it's handled separately and NOT in letterPositions)
function shiftLetters(direction) {
    letterShift += direction;
    
    // Normalize letterShift to prevent overflow (keep it within reasonable range)
    if (Math.abs(letterShift) > letterPositions.length * 100) {
        letterShift = letterShift % letterPositions.length;
    }
    
    // Only shift cells in letterPositions (center [2,2] is excluded)
    // Make sure letterCells and letterPositions have matching lengths
    if (letterCells.length !== letterPositions.length) {
        console.error(`Length mismatch: letterCells.length=${letterCells.length}, letterPositions.length=${letterPositions.length}`);
        return;
    }
    
    letterCells.forEach((cell, index) => {
        // Cell at index i moves to position (i + shiftCount) % length in the circular track
        // The cell carries its original value (letterValues[index]) with it
        // Ensure positive result from modulo
        let targetPositionIndex = (index + letterShift) % letterPositions.length;
        if (targetPositionIndex < 0) {
            targetPositionIndex += letterPositions.length;
        }
        targetPositionIndex = targetPositionIndex % letterPositions.length;
        
        // Safety check to ensure index is valid
        if (targetPositionIndex < 0 || targetPositionIndex >= letterPositions.length) {
            console.error(`Invalid targetPositionIndex: ${targetPositionIndex} for letter cell index ${index}, letterShift=${letterShift}`);
            return;
        }
        const targetPos = letterPositions[targetPositionIndex];
        if (!targetPos || !Array.isArray(targetPos) || targetPos.length !== 2) {
            console.error(`Invalid position at index ${targetPositionIndex}:`, targetPos);
            return;
        }
        const [row, col] = targetPos;
        if (index >= letterValues.length) {
            console.error(`Index ${index} out of bounds for letterValues (length=${letterValues.length})`);
            return;
        }
        const value = letterValues[index] || '';  // Cell keeps its original value
        
        // Simple: if value is empty, it's blank. Otherwise show the letter.
        if (value === '') {
            cell.dataset.blank = 'true';
            cell.textContent = '';
        } else {
            cell.removeAttribute('data-blank');
            cell.textContent = value;
        }
        
        gsap.to(cell, {
            top: `${row * (cellSize + gap)}px`,
            left: `${col * (cellSize + gap)}px`,
            duration: 0.3,
            ease: "power2.out"
        });
    });
    
    // Note: Center cell at [2,2] is NOT shifted - it's static and created separately
}

// Button event listeners - support both mouse and touch
function addButtonHandlers(button, handler) {
    // Mouse click
    button.addEventListener('click', handler);
    // Touch events for mobile
    button.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent double-tap zoom
        handler();
    }, { passive: false });
}

addButtonHandlers(numberLeftBtn, () => shiftNumbers(-1));
addButtonHandlers(numberRightBtn, () => shiftNumbers(1));
addButtonHandlers(letterLeftBtn, () => shiftLetters(-1));
addButtonHandlers(letterRightBtn, () => shiftLetters(1));

// Hint functionality
function handleHint() {
    if (hintButton.disabled) return;
    hintCount++;
    
    if (hintCount === 1) {
        // First hint: make 2 boxes blank (priority: boxes 6 and 10, then random)
        const allAnswerLetters = [...answerWord1.split(''), ...answerWord2.split('')];
        
        // Get all eligible cells (not blank, letter not in words)
        const eligibleCells = [];
        for (let i = 0; i < numberCells.length; i++) {
            const cell = numberCells[i];
            if (!cell.dataset.blank && cell.textContent.trim() !== '') {
                const letter = cell.textContent.trim();
                if (!allAnswerLetters.includes(letter)) {
                    eligibleCells.push({ cell: cell, index: i, type: 'number' });
                }
            }
        }
        for (let i = 0; i < letterCells.length; i++) {
            const cell = letterCells[i];
            if (!cell.dataset.blank && cell.textContent.trim() !== '') {
                const letter = cell.textContent.trim();
                if (!allAnswerLetters.includes(letter)) {
                    eligibleCells.push({ cell: cell, index: i, type: 'letter' });
                }
            }
        }
        if (centerCell && !centerCell.dataset.blank && centerCell.textContent.trim() !== '') {
            const letter = centerCell.textContent.trim();
            if (!allAnswerLetters.includes(letter)) {
                eligibleCells.push({ cell: centerCell, index: -1, type: 'center' });
            }
        }
        
        // Priority: number index 6 and 10
        const cellsToBlank = [];
        const priorityIndices = [6, 10];
        for (const priorityIndex of priorityIndices) {
            const found = eligibleCells.find(e => e.type === 'number' && e.index === priorityIndex);
            if (found) {
                cellsToBlank.push(found.cell);
                eligibleCells.splice(eligibleCells.indexOf(found), 1);
            }
        }
        
        // Fill remaining slots with random eligible cells
        while (cellsToBlank.length < 2 && eligibleCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * eligibleCells.length);
            cellsToBlank.push(eligibleCells[randomIndex].cell);
            eligibleCells.splice(randomIndex, 1);
        }
        
        // Make cells blank
        cellsToBlank.forEach(cell => {
            cell.dataset.blank = 'true';
            cell.textContent = '';
            // Update the underlying values
            if (cell.dataset.numberIndex !== undefined) {
                const index = parseInt(cell.dataset.numberIndex);
                numberValues[index] = '';
            } else if (cell.dataset.letterIndex !== undefined) {
                const index = parseInt(cell.dataset.letterIndex);
                letterValues[index] = '';
            } else if (cell === centerCell) {
                centerLetter = '';
            }
        });
        
        hintButton.innerHTML = 'HINT -<span class="star">★</span>2';
    } else if (hintCount === 2) {
        // Second hint: make 2 more boxes blank (not already blank, not in words)
        const allAnswerLetters = [...answerWord1.split(''), ...answerWord2.split('')];
        
        // Get all eligible cells (not blank, letter not in words)
        const eligibleCells = [];
        for (let i = 0; i < numberCells.length; i++) {
            const cell = numberCells[i];
            if (!cell.dataset.blank && cell.textContent.trim() !== '') {
                const letter = cell.textContent.trim();
                if (!allAnswerLetters.includes(letter)) {
                    eligibleCells.push({ cell: cell, index: i, type: 'number' });
                }
            }
        }
        for (let i = 0; i < letterCells.length; i++) {
            const cell = letterCells[i];
            if (!cell.dataset.blank && cell.textContent.trim() !== '') {
                const letter = cell.textContent.trim();
                if (!allAnswerLetters.includes(letter)) {
                    eligibleCells.push({ cell: cell, index: i, type: 'letter' });
                }
            }
        }
        if (centerCell && !centerCell.dataset.blank && centerCell.textContent.trim() !== '') {
            const letter = centerCell.textContent.trim();
            if (!allAnswerLetters.includes(letter)) {
                eligibleCells.push({ cell: centerCell, index: -1, type: 'center' });
            }
        }
        
        // Pick 2 random eligible cells
        const cellsToBlank = [];
        while (cellsToBlank.length < 2 && eligibleCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * eligibleCells.length);
            cellsToBlank.push(eligibleCells[randomIndex].cell);
            eligibleCells.splice(randomIndex, 1);
        }
        
        // Make cells blank
        cellsToBlank.forEach(cell => {
            cell.dataset.blank = 'true';
            cell.textContent = '';
            // Update the underlying values
            if (cell.dataset.numberIndex !== undefined) {
                const index = parseInt(cell.dataset.numberIndex);
                numberValues[index] = '';
            } else if (cell.dataset.letterIndex !== undefined) {
                const index = parseInt(cell.dataset.letterIndex);
                letterValues[index] = '';
            } else if (cell === centerCell) {
                centerLetter = '';
            }
        });
        
        hintButton.innerHTML = 'HINT -<span class="star">★</span>3';
    } else if (hintCount === 3) {
        // Third hint: show answer hints
        const word1Hint = answerWord1[0] + '_'.repeat(answerWord1.length - 1);
        const word2Hint = answerWord2[0] + '_'.repeat(answerWord2.length - 1);
        hintAnswers.textContent = `ANSWERS: ${word1Hint}, ${word2Hint}`;
        hintAnswers.style.display = 'block';
        hintButton.disabled = true;
    }
}

addButtonHandlers(hintButton, handleHint);

// Get cell at a given point
function getCellAtPoint(x, y) {
    // Use elementFromPoint for more reliable detection
    const element = document.elementFromPoint(x, y);
    if (element && element.classList.contains('letter-cell') && 
        !element.dataset.blank && element.textContent.trim() !== '') {
        return element;
    }
    
    // Fallback: check all cells manually
    const containerRect = cellsContainer.getBoundingClientRect();
    const relX = x - containerRect.left;
    const relY = y - containerRect.top;
    
    // Check all letter cells in the container
    const allLetterCells = cellsContainer.querySelectorAll('.letter-cell');
    for (const cell of allLetterCells) {
        if (cell.dataset.blank) continue;
        
        const cellRect = cell.getBoundingClientRect();
        const cellContainerX = cellRect.left - containerRect.left;
        const cellContainerY = cellRect.top - containerRect.top;
        
        if (relX >= cellContainerX && relX <= cellContainerX + cellSize &&
            relY >= cellContainerY && relY <= cellContainerY + cellSize) {
            return cell;
        }
    }
    return null;
}

// Check if two cells are adjacent (horizontally or vertically, not diagonal)
function areAdjacent(cell1, cell2) {
    const rect1 = cell1.getBoundingClientRect();
    const rect2 = cell2.getBoundingClientRect();
    
    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;
    
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    const cellSizeWithGap = cellSize + gap;
    const tolerance = 5;
    
    // Adjacent if horizontally or vertically aligned within tolerance
    const horizontalAdj = dx < cellSizeWithGap + tolerance && dy < tolerance;
    const verticalAdj = dy < cellSizeWithGap + tolerance && dx < tolerance;
    
    return (horizontalAdj || verticalAdj) && !(dx < tolerance && dy < tolerance); // Not the same cell
}

// Ensure first word cells always have their green class (defensive safeguard)
function ensureWord1Green() {
    if (firstWordFound && firstWordCells.length > 0) {
        firstWordCells.forEach(cell => {
            // ALWAYS ensure first word cells have green class - this is permanent
            if (cell && cell.classList && cell.parentNode) {
                cell.dataset.firstWordPermanent = 'true';
                cell.classList.add('selected-word1');
                cell.classList.remove('selected-word2');
            }
        });
        // Also ensure any cells marked with data attribute have green
        const allLetterCells = document.querySelectorAll('.letter-cell[data-first-word-permanent="true"]');
        allLetterCells.forEach(cell => {
            if (cell && cell.classList) {
                cell.classList.add('selected-word1');
                cell.classList.remove('selected-word2');
            }
        });
    }
}

// Ensure second word cells always have their blue class (defensive safeguard)
function ensureWord2Blue() {
    if (secondWordCells.length > 0) {
        secondWordCells.forEach(cell => {
            // ALWAYS ensure second word cells have blue class - this is permanent
            // But don't overwrite first word green
            if (cell && cell.classList && cell.parentNode) {
                if (cell.dataset.firstWordPermanent === 'true') {
                    // First word takes priority - keep green
                    cell.classList.add('selected-word1');
                    cell.classList.remove('selected-word2');
                } else {
                    // Not a first word cell, so keep blue
                    cell.dataset.secondWordPermanent = 'true';
                    cell.classList.add('selected-word2');
                    cell.classList.remove('selected-word1');
                }
            }
        });
        // Also ensure any cells marked with data attribute have blue (unless first word)
        const allLetterCells = document.querySelectorAll('.letter-cell[data-second-word-permanent="true"]');
        allLetterCells.forEach(cell => {
            if (cell && cell.classList) {
                if (cell.dataset.firstWordPermanent === 'true') {
                    // First word takes priority
                    cell.classList.add('selected-word1');
                    cell.classList.remove('selected-word2');
                } else {
                    cell.classList.add('selected-word2');
                    cell.classList.remove('selected-word1');
                }
            }
        });
    }
}

// Reset highlighting (only clears current selection, preserves found words)
function resetHighlighting() {
    // First, ensure found words keep their colors (defensive)
    ensureWord1Green();
    ensureWord2Blue();
    
    // Remove current selection classes, but NEVER remove found word colors
    const allLetterCells = document.querySelectorAll('.letter-cell');
    allLetterCells.forEach(cell => {
        // If this is a permanent first word cell, keep green
        if (cell.dataset.firstWordPermanent === 'true') {
            cell.classList.add('selected-word1');
            cell.classList.remove('selected-word2');
        }
        // If this is a permanent second word cell (and not first word), keep blue
        else if (cell.dataset.secondWordPermanent === 'true') {
            cell.classList.add('selected-word2');
            cell.classList.remove('selected-word1');
        }
        // Otherwise, remove all selection classes (temporary selections)
        else {
            cell.classList.remove('selected-word1');
            cell.classList.remove('selected-word2');
        }
    });
    
    // Final safeguard - ensure found words still have their colors
    ensureWord1Green();
    ensureWord2Blue();
    selectedPath = [];
}

// Reset highlighting when one word is already found (for selecting the second word)
function resetWord2Highlighting() {
    // Preserve all found words first
    ensureWord1Green();
    ensureWord2Blue();
    
    // Remove temporary selections, but preserve permanent word colors
    const allLetterCells = document.querySelectorAll('.letter-cell');
    allLetterCells.forEach(cell => {
        // If this is a permanent first word cell, keep green
        if (cell.dataset.firstWordPermanent === 'true') {
            cell.classList.add('selected-word1');
            cell.classList.remove('selected-word2');
        }
        // If this is a permanent second word cell (and not first word), keep blue
        else if (cell.dataset.secondWordPermanent === 'true') {
            cell.classList.add('selected-word2');
            cell.classList.remove('selected-word1');
        }
        // Otherwise, remove all selection classes (temporary selections)
        else {
            cell.classList.remove('selected-word1');
            cell.classList.remove('selected-word2');
        }
    });
    
    // Final safeguard - ensure found words still have their colors
    ensureWord1Green();
    ensureWord2Blue();
    selectedPath = [];
}

// Celebration animation for found words
function celebrateWord(cells) {
    cells.forEach((cell, index) => {
        const delay = index * 0.03;
        const isWord1 = cell.classList.contains('selected-word1');
        const originalColor = isWord1 ? '#4CAF50' : '#2196F3';
        const lighterColor = isWord1 ? '#6BCF7F' : '#64B5F6'; // Lighter green or lighter blue
        
        // Set initial CSS variable
        cell.style.setProperty('--cell-bg', originalColor);
        
        const tl = gsap.timeline({ delay: delay });
        tl.to(cell, {
            scale: 1.1,
            '--cell-bg': lighterColor,
            duration: 0.3,
            ease: "power2.out"
        })
        .to(cell, {
            scale: 1,
            '--cell-bg': originalColor,
            duration: 0.3,
            ease: "power2.in"
        });
    });
}

// Check if selected path matches either answer word
function checkAnswer() {
    if (selectedPath.length === 0) return false;
    
    const selectedLetters = selectedPath.map(cell => cell.textContent.trim()).filter(letter => letter !== '');
    const selectedWord = selectedLetters.join('');
    
    // Check if all selected cells belong to the same word
    const wordAssociations = selectedPath.map(cell => cell.dataset.wordAssociation).filter(assoc => assoc);
    if (wordAssociations.length === 0) {
        // No cells are associated with a word - wrong answer
        resetHighlighting();
        ensureWord1Green();
        ensureWord2Blue();
        return false;
    }
    
    // Check if all cells belong to the same word
    const firstAssociation = wordAssociations[0];
    const allSameWord = wordAssociations.every(assoc => assoc === firstAssociation);
    if (!allSameWord) {
        // Cells belong to different words - wrong answer
        resetHighlighting();
        ensureWord1Green();
        ensureWord2Blue();
        return false;
    }
    
    // Check if matches word 1
    if (selectedLetters.length === answerWord1.length && selectedWord === answerWord1) {
        // Verify that all selected cells belong to word1
        if (firstAssociation !== 'word1') {
            // Word matches but cells belong to word2 - wrong answer
            resetHighlighting();
            ensureWord1Green();
            ensureWord2Blue();
            return false;
        }
        // Check if this is the first word found or second word found
        const isFirstWord = firstWordFound === null;
        
        if (isFirstWord) {
            // This is the first word found - make it GREEN
            firstWordFound = 'word1';
            const cellsToCelebrate = [...selectedPath];
            selectedPath.forEach(cell => {
                if (!word1Cells.includes(cell)) {
                    word1Cells.push(cell);
                }
                if (!firstWordCells.includes(cell)) {
                    firstWordCells.push(cell);
                }
                // First word = GREEN
                cell.classList.add('selected-word1');
                cell.classList.remove('selected-word2');
                cell.classList.remove('selected');
                cell.dataset.firstWordPermanent = 'true';
            });
            word1Found = true;
            selectedPath = [];
            console.log(`WIN! You found ${answerWord1} (first word - GREEN)!`);
            celebrateWord(cellsToCelebrate);
            
            // Check if both words are found - show win screen
            if (word1Found && word2Found) {
                showWinScreen();
            }
            
            return true;
        } else {
            // This is the second word found - make it BLUE
            const cellsToCelebrate = [...selectedPath];
            selectedPath.forEach(cell => {
                if (!word1Cells.includes(cell)) {
                    word1Cells.push(cell);
                }
                if (!secondWordCells.includes(cell)) {
                    secondWordCells.push(cell);
                }
                // Second word = BLUE (but don't overwrite first word green if same cell)
                if (cell.dataset.firstWordPermanent === 'true') {
                    // This cell is part of first word - keep it green
                    cell.classList.add('selected-word1');
                    cell.classList.remove('selected-word2');
                } else {
                    // This cell is only part of second word - make it blue
                    cell.classList.add('selected-word2');
                    cell.classList.remove('selected-word1');
                    cell.dataset.secondWordPermanent = 'true';
                }
                cell.classList.remove('selected');
            });
            word1Found = true;
            selectedPath = [];
            console.log(`WIN! You found ${answerWord1} (second word - BLUE)!`);
            celebrateWord(cellsToCelebrate);
            
            // Check if both words are found - show win screen
            if (word1Found && word2Found) {
                showWinScreen();
            }
            
            return true;
        }
    }
    
    // Check if matches word 2
    if (selectedLetters.length === answerWord2.length && selectedWord === answerWord2) {
        // Verify that all selected cells belong to word2
        if (firstAssociation !== 'word2') {
            // Word matches but cells belong to word1 - wrong answer
            resetHighlighting();
            ensureWord1Green();
            ensureWord2Blue();
            return false;
        }
        // Check if this is the first word found or second word found
        const isFirstWord = firstWordFound === null;
        
        if (isFirstWord) {
            // This is the first word found - make it GREEN
            firstWordFound = 'word2';
            const cellsToCelebrate = [...selectedPath];
            selectedPath.forEach(cell => {
                if (!word2Cells.includes(cell)) {
                    word2Cells.push(cell);
                }
                if (!firstWordCells.includes(cell)) {
                    firstWordCells.push(cell);
                }
                // First word = GREEN
                cell.classList.add('selected-word1');
                cell.classList.remove('selected-word2');
                cell.classList.remove('selected');
                cell.dataset.firstWordPermanent = 'true';
            });
            word2Found = true;
            selectedPath = [];
            console.log(`WIN! You found ${answerWord2} (first word - GREEN)!`);
            celebrateWord(cellsToCelebrate);
            
            // Check if both words are found - show win screen
            if (word1Found && word2Found) {
                showWinScreen();
            }
            
            return true;
        } else {
            // This is the second word found - make it BLUE
            const cellsToCelebrate = [...selectedPath];
            selectedPath.forEach(cell => {
                if (!word2Cells.includes(cell)) {
                    word2Cells.push(cell);
                }
                if (!secondWordCells.includes(cell)) {
                    secondWordCells.push(cell);
                }
                // Second word = BLUE (but don't overwrite first word green if same cell)
                if (cell.dataset.firstWordPermanent === 'true') {
                    // This cell is part of first word - keep it green
                    cell.classList.add('selected-word1');
                    cell.classList.remove('selected-word2');
                } else {
                    // This cell is only part of second word - make it blue
                    cell.classList.add('selected-word2');
                    cell.classList.remove('selected-word1');
                    cell.dataset.secondWordPermanent = 'true';
                }
                cell.classList.remove('selected');
            });
            word2Found = true;
            selectedPath = [];
            console.log(`WIN! You found ${answerWord2} (second word - BLUE)!`);
            celebrateWord(cellsToCelebrate);
            
            // Check if both words are found - show win screen
            if (word1Found && word2Found) {
                showWinScreen();
            }
            
            return true;
        }
    }
    
    // Wrong answer - reset current selection (but preserve found words)
    resetHighlighting();
    // Final safeguard - ensure found words still have their colors after reset
    ensureWord1Green();
    ensureWord2Blue();
    return false;
}

// Drag functionality
let currentDragCell = null;

// Prevent text selection globally
document.addEventListener('selectstart', (e) => {
    e.preventDefault();
});

document.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

// Setup drag functionality after cells are created
function setupDragHandlers() {
    if (dragHandlersSetup) {
        // Remove existing handlers before re-adding
        cellsContainer.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        cellsContainer.removeEventListener('mouseleave', handleMouseLeave);
        cellsContainer.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        dragHandlersSetup = false;
    }
    dragHandlersSetup = true;
    
    // Mouse events for desktop
    cellsContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    cellsContainer.addEventListener('mouseleave', handleMouseLeave);
    
    // Touch events for mobile
    cellsContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });
}

function handleMouseDown(e) {
    e.preventDefault(); // Prevent text selection
    
    // If both words are found, disable highlighting
    if (word1Found && word2Found) {
        return;
    }
    
    const cell = e.target;
    if (cell && cell.classList.contains('letter-cell') && 
        !cell.dataset.blank && cell.textContent.trim() !== '') {
        isDragging = true;
        
        // CRITICAL: Preserve found words BEFORE resetting
        if (firstWordFound !== null) {
            // One word already found - preserve first word green
            ensureWord1Green();
            ensureWord2Blue();
            resetWord2Highlighting(); // This preserves both found words
            // Double-check after reset
            ensureWord1Green();
            ensureWord2Blue();
        } else {
            // No words found yet - reset all highlighting
            resetHighlighting();
        }
        
        currentDragCell = cell;
        selectedPath = [cell];
        
        // Determine which color to use for selection based on order found
        // Check if cell is part of a found word - preserve its color
        if (cell.dataset.firstWordPermanent === 'true') {
            // This is a permanent first word cell - keep green
            cell.classList.add('selected-word1');
            cell.classList.remove('selected-word2');
        } else if (cell.dataset.secondWordPermanent === 'true') {
            // This is a permanent second word cell - keep blue
            cell.classList.add('selected-word2');
            cell.classList.remove('selected-word1');
        } else {
            // Not a permanent word - add selection color based on what we're looking for
            if (firstWordFound === null) {
                // No words found yet - looking for first word (GREEN)
                cell.classList.add('selected-word1');
            } else {
                // One word found - looking for second word (BLUE)
                cell.classList.add('selected-word2');
            }
        }
        
        // Final check - ensure found words still have their colors after starting selection
        ensureWord1Green();
        ensureWord2Blue();
    }
}

function handleTouchStart(e) {
    e.preventDefault(); // Prevent scrolling and default touch behavior
    
    // If both words are found, disable highlighting
    if (word1Found && word2Found) {
        return;
    }
    
    const touch = e.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (cell && cell.classList.contains('letter-cell') && 
        !cell.dataset.blank && cell.textContent.trim() !== '') {
        isDragging = true;
        
        // CRITICAL: Preserve found words BEFORE resetting
        if (firstWordFound !== null) {
            // One word already found - preserve first word green
            ensureWord1Green();
            ensureWord2Blue();
            resetWord2Highlighting(); // This preserves both found words
            // Double-check after reset
            ensureWord1Green();
            ensureWord2Blue();
        } else {
            // No words found yet - reset all highlighting
            resetHighlighting();
        }
        
        currentDragCell = cell;
        selectedPath = [cell];
        
        // Determine which color to use for selection based on order found
        // Check if cell is part of a found word - preserve its color
        if (cell.dataset.firstWordPermanent === 'true') {
            // This is a permanent first word cell - keep green
            cell.classList.add('selected-word1');
            cell.classList.remove('selected-word2');
        } else if (cell.dataset.secondWordPermanent === 'true') {
            // This is a permanent second word cell - keep blue
            cell.classList.add('selected-word2');
            cell.classList.remove('selected-word1');
        } else {
            // Not a permanent word - add selection color based on what we're looking for
            if (firstWordFound === null) {
                // No words found yet - looking for first word (GREEN)
                cell.classList.add('selected-word1');
            } else {
                // One word found - looking for second word (BLUE)
                cell.classList.add('selected-word2');
            }
        }
        
        // Final check - ensure found words still have their colors after starting selection
        ensureWord1Green();
        ensureWord2Blue();
    }
}

function handleMouseMove(e) {
    if (!isDragging || !currentDragCell) return;
    
    // If both words are found, stop dragging
    if (word1Found && word2Found) {
        isDragging = false;
        currentDragCell = null;
        return;
    }
    
    e.preventDefault(); // Prevent text selection
    
    // Ensure found words are preserved during dragging
    ensureWord1Green();
    ensureWord2Blue();
    
    const cell = getCellAtPoint(e.clientX, e.clientY);
    if (cell && cell !== currentDragCell && !cell.dataset.blank && cell.textContent.trim() !== '') {
        // Check if this cell is adjacent to the last cell in the path
        const lastCell = selectedPath[selectedPath.length - 1];
        if (cell !== lastCell && !selectedPath.includes(cell)) {
            // Check if adjacent (horizontally or vertically)
            if (areAdjacent(lastCell, cell)) {
                selectedPath.push(cell);
                // Don't overwrite found word cells
                if (cell.dataset.firstWordPermanent === 'true') {
                    // First word cell - keep green
                    ensureWord1Green();
                } else if (cell.dataset.secondWordPermanent === 'true') {
                    // Second word cell - keep blue
                    ensureWord2Blue();
                } else if (firstWordFound === null) {
                    // No words found yet - looking for first word (GREEN)
                    cell.classList.add('selected-word1');
                } else {
                    // One word found - looking for second word (BLUE)
                    cell.classList.add('selected-word2');
                }
            }
        } else if (selectedPath.length > 1 && cell === selectedPath[selectedPath.length - 2]) {
            // Moving backwards - remove last cell from path
            const removedCell = selectedPath.pop();
            if (removedCell && removedCell !== currentDragCell) {
            // Don't remove found word colors
            if (removedCell.dataset.firstWordPermanent !== 'true' && removedCell.dataset.secondWordPermanent !== 'true') {
                removedCell.classList.remove('selected-word1');
                removedCell.classList.remove('selected-word2');
            }
            }
            // Ensure found words still have their colors after removing
            ensureWord1Green();
            ensureWord2Blue();
        }
    }
}

function handleTouchMove(e) {
    if (!isDragging || !currentDragCell) return;
    
    // If both words are found, stop dragging
    if (word1Found && word2Found) {
        isDragging = false;
        currentDragCell = null;
        return;
    }
    
    e.preventDefault(); // Prevent scrolling
    
    // Ensure found words are preserved during dragging
    ensureWord1Green();
    ensureWord2Blue();
    
    const touch = e.touches[0];
    const cell = getCellAtPoint(touch.clientX, touch.clientY);
    if (cell && cell !== currentDragCell && !cell.dataset.blank && cell.textContent.trim() !== '') {
        // Check if this cell is adjacent to the last cell in the path
        const lastCell = selectedPath[selectedPath.length - 1];
        if (cell !== lastCell && !selectedPath.includes(cell)) {
            // Check if adjacent (horizontally or vertically)
            if (areAdjacent(lastCell, cell)) {
                selectedPath.push(cell);
                // Don't overwrite found word cells
                if (cell.dataset.firstWordPermanent === 'true') {
                    // First word cell - keep green
                    ensureWord1Green();
                } else if (cell.dataset.secondWordPermanent === 'true') {
                    // Second word cell - keep blue
                    ensureWord2Blue();
                } else if (firstWordFound === null) {
                    // No words found yet - looking for first word (GREEN)
                    cell.classList.add('selected-word1');
                } else {
                    // One word found - looking for second word (BLUE)
                    cell.classList.add('selected-word2');
                }
            }
        } else if (selectedPath.length > 1 && cell === selectedPath[selectedPath.length - 2]) {
            // Moving backwards - remove last cell from path
            const removedCell = selectedPath.pop();
            if (removedCell && removedCell !== currentDragCell) {
            // Don't remove found word colors
            if (removedCell.dataset.firstWordPermanent !== 'true' && removedCell.dataset.secondWordPermanent !== 'true') {
                removedCell.classList.remove('selected-word1');
                removedCell.classList.remove('selected-word2');
            }
            }
            // Ensure found words still have their colors after removing
            ensureWord1Green();
            ensureWord2Blue();
        }
    }
}

function handleMouseUp(e) {
    e.preventDefault(); // Prevent text selection
    if (isDragging) {
        isDragging = false;
        // Ensure found words are preserved before checking answer
        ensureWord1Green();
        ensureWord2Blue();
        checkAnswer();
        // Ensure found words still have their colors after checking answer
        ensureWord1Green();
        ensureWord2Blue();
        currentDragCell = null;
    }
}

function handleTouchEnd(e) {
    e.preventDefault(); // Prevent default touch behavior
    if (isDragging) {
        isDragging = false;
        // Ensure found words are preserved before checking answer
        ensureWord1Green();
        ensureWord2Blue();
        checkAnswer();
        // Ensure found words still have their colors after checking answer
        ensureWord1Green();
        ensureWord2Blue();
        currentDragCell = null;
    }
}

function handleMouseLeave() {
    if (isDragging) {
        isDragging = false;
        checkAnswer();
        currentDragCell = null;
    }
}

// Restore solved words from saved state
function restoreSolvedWords() {
    if (!savedState) return;
    
    // Wait for cells to be created
    setTimeout(() => {
        // Determine which word was found first
        const firstWord = savedState.firstWordFound; // 'word1' or 'word2' or null
        
        // Restore the first word found (always green)
        if (firstWord === 'word1' && savedState.word1Found && savedState.word1Cells) {
            // Word1 was found first - make it green
            savedState.word1Cells.forEach(cellInfo => {
                let cell = null;
                if (cellInfo.type === 'number') {
                    cell = numberCells[cellInfo.index];
                } else if (cellInfo.type === 'letter') {
                    cell = letterCells[cellInfo.index];
                } else if (cellInfo.type === 'center') {
                    cell = centerCell;
                }
                if (cell) {
                    cell.classList.add('selected-word1');
                    cell.dataset.firstWordPermanent = 'true';
                    if (!word1Cells.includes(cell)) {
                        word1Cells.push(cell);
                    }
                    if (!firstWordCells.includes(cell)) {
                        firstWordCells.push(cell);
                    }
                }
            });
        } else if (firstWord === 'word2' && savedState.word2Found && savedState.word2Cells) {
            // Word2 was found first - make it green
            savedState.word2Cells.forEach(cellInfo => {
                let cell = null;
                if (cellInfo.type === 'number') {
                    cell = numberCells[cellInfo.index];
                } else if (cellInfo.type === 'letter') {
                    cell = letterCells[cellInfo.index];
                } else if (cellInfo.type === 'center') {
                    cell = centerCell;
                }
                if (cell) {
                    cell.classList.add('selected-word1');
                    cell.dataset.firstWordPermanent = 'true';
                    if (!word2Cells.includes(cell)) {
                        word2Cells.push(cell);
                    }
                    if (!firstWordCells.includes(cell)) {
                        firstWordCells.push(cell);
                    }
                }
            });
        }
        
        // Restore the second word found (always blue)
        if (firstWord === 'word1' && savedState.word2Found && savedState.word2Cells) {
            // Word2 was found second - make it blue
            savedState.word2Cells.forEach(cellInfo => {
                let cell = null;
                if (cellInfo.type === 'number') {
                    cell = numberCells[cellInfo.index];
                } else if (cellInfo.type === 'letter') {
                    cell = letterCells[cellInfo.index];
                } else if (cellInfo.type === 'center') {
                    cell = centerCell;
                }
                if (cell) {
                    if (cell.dataset.firstWordPermanent === 'true') {
                        // Keep it green (first word takes precedence)
                        cell.classList.add('selected-word1');
                        cell.classList.remove('selected-word2');
                    } else {
                        cell.classList.add('selected-word2');
                        cell.dataset.secondWordPermanent = 'true';
                    }
                    if (!word2Cells.includes(cell)) {
                        word2Cells.push(cell);
                    }
                    if (!secondWordCells.includes(cell)) {
                        secondWordCells.push(cell);
                    }
                }
            });
        } else if (firstWord === 'word2' && savedState.word1Found && savedState.word1Cells) {
            // Word1 was found second - make it blue
            savedState.word1Cells.forEach(cellInfo => {
                let cell = null;
                if (cellInfo.type === 'number') {
                    cell = numberCells[cellInfo.index];
                } else if (cellInfo.type === 'letter') {
                    cell = letterCells[cellInfo.index];
                } else if (cellInfo.type === 'center') {
                    cell = centerCell;
                }
                if (cell) {
                    if (cell.dataset.firstWordPermanent === 'true') {
                        // Keep it green (first word takes precedence)
                        cell.classList.add('selected-word1');
                        cell.classList.remove('selected-word2');
                    } else {
                        cell.classList.add('selected-word2');
                        cell.dataset.secondWordPermanent = 'true';
                    }
                    if (!word1Cells.includes(cell)) {
                        word1Cells.push(cell);
                    }
                    if (!secondWordCells.includes(cell)) {
                        secondWordCells.push(cell);
                    }
                }
            });
        }
        
        // If game is complete, show win screen
        const todayKey = getTodayKey();
        const isComplete = localStorage.getItem(`crossComplete_${todayKey}`) === 'true';
        // Check both the loaded state and current variables
        const bothWordsFound = (word1Found && word2Found) || (savedState && savedState.word1Found && savedState.word2Found);
        
        if (isComplete && bothWordsFound) {
            if (hintButton) hintButton.disabled = true;
            const starsEarned = parseInt(localStorage.getItem(`crossStars_${todayKey}`) || '0');
            const instructionText = document.getElementById('instructionText');
            if (instructionText && starsEarned > 0) {
                const starDisplay = createStarDisplay(starsEarned);
                instructionText.innerHTML = `<div class="cross-star-container">${starDisplay}</div>`;
            }
            
            // Update main page stars display
            setTimeout(() => {
                if (window.parent && window.parent.updateCrossStars) {
                    window.parent.updateCrossStars();
                } else if (window.updateCrossStars) {
                    window.updateCrossStars();
                }
            }, 100);
        }
    }, 150);
}

// Game initialization
function init() {
    // Update instruction text
    const instructionText = document.getElementById('instructionText');
    // Get current theme name
    const themeName = (typeof getCurrentTheme === 'function') ? getCurrentTheme().name : 'Thanksgiving';
    instructionText.textContent = `Topic: ${themeName} • find 2 words `;
    
    createReferenceGrid();
    createNumberCells();
    createLetterCells();
    
    // Restore solved words (rings always start at default position)
    restoreSolvedWords();
    
    setupDragHandlers(); // Setup drag handlers after cells are created
    
    // Keyboard shortcut: press 'g' to log the answer words
    document.addEventListener('keydown', (e) => {
        if (e.key === 'g' || e.key === 'G') {
            console.log('Answer word 1:', answerWord1);
            console.log('Answer word 2:', answerWord2);
            if (window.word1ShiftState) {
                console.log('Word 1 shift state:', window.word1ShiftState);
            }
            if (window.word2ShiftState) {
                console.log('Word 2 shift state:', window.word2ShiftState);
            }
        }
    });
    
    console.log('Game 8 initialized');
}

// Create star display
function createStarDisplay(starsEarned) {
    let starHTML = '';
    for (let i = 0; i < 5; i++) {
        const isGrey = i >= starsEarned;
        starHTML += `<span class="cross-star ${isGrey ? 'grey' : ''}">★</span>`;
    }
    return starHTML;
}

// Show win screen with GSAP animation
function showWinScreen() {
    const instructionText = document.getElementById('instructionText');
    if (!instructionText) return;
    
    if (hintButton) hintButton.disabled = true;
    
    // Calculate stars based on hints used
    // No hints: 5 stars, 1 hint: 4 stars, 2 hints: 3 stars, 3 hints: 2 stars
    const starsEarned = 5 - hintCount;

    const todayKey = getTodayKey();
    localStorage.setItem(`crossComplete_${todayKey}`, 'true');

    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'puzzleComplete',
            gameId: 'cross',
            stars: starsEarned,
            notes: ['Hints used: ' + hintCount],
            delay: 1
        }, '*');
    }
    
    // Fade out the instruction text
    gsap.to(instructionText, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
            // Create star display
            const starDisplay = createStarDisplay(starsEarned);
            instructionText.innerHTML = `<div class="cross-star-container">${starDisplay}</div>`;
            
            // Fade in the star display
            gsap.fromTo(instructionText, 
                { opacity: 0 },
                { opacity: 1, duration: 0.5, ease: 'power2.out' }
            );
        }
    });
}

// Start menu handling
const startMenu = document.getElementById('startMenu');
const playButton = document.getElementById('playButton');
const gameContainer = document.getElementById('gameContainer');

function startGame() {
    // Notify parent that Cross has started (for quit warning logic)
    if (window.parent) {
        window.parent.postMessage('puzzleStarted:cross', '*');
    }

    startMenu.style.display = 'none';
    gameContainer.style.display = 'flex';
    
    // Only initialize once
    if (!gameInitialized) {
init();
        gameInitialized = true;
    }
}

// Check if game is complete on page load
(function() {
    const todayKey = getTodayKey();
    const isComplete = localStorage.getItem(`crossComplete_${todayKey}`) === 'true';
    const bothWordsFound = savedState && savedState.word1Found && savedState.word2Found;
    
    if (isComplete && bothWordsFound && startMenu && gameContainer) {
        // Game is complete - skip start screen
        startMenu.style.display = 'none';
        gameContainer.style.display = 'flex';
        
        // Initialize if not already initialized
        if (!gameInitialized) {
            init();
            gameInitialized = true;
        }
        if (hintButton) hintButton.disabled = true;
    }
})();

let _crossClick = (function() { try { const a = new Audio(new URL('../../sounds/click.mp3', window.location.href).href); a.preload = 'auto'; a.load(); return a; } catch (e) { return null; } })();
const playCrossClick = () => { try { if (_crossClick) { _crossClick.currentTime = 0; _crossClick.play().catch(() => {}); } } catch (e) {} };
if (playButton) {
    playButton.addEventListener('click', () => {
        playCrossClick();
        startGame();
    });
    playButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        playCrossClick();
        startGame();
    });
}

// Expose updateCrossStars function to parent window
if (typeof window !== 'undefined') {
    window.updateCrossStars = function() {
        const todayKey = getTodayKey();
        const crossStars = parseInt(localStorage.getItem(`crossStars_${todayKey}`) || '0');
        const crossStarsElement = window.parent ? window.parent.document.getElementById('crossStars') : document.getElementById('crossStars');
        if (crossStarsElement) {
            crossStarsElement.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = i < crossStars ? '#FF8C42' : '#ddd';
                crossStarsElement.appendChild(star);
            }
        }
    };
}

// Help button handling - show start screen
const helpButton = document.getElementById('helpButton');
console.log('[Cross] helpButton element:', helpButton);
console.log('[Cross] helpButton computed style:', helpButton ? window.getComputedStyle(helpButton).pointerEvents : 'N/A');
if (helpButton) {
    // Mouse events
    helpButton.addEventListener('click', (e) => {
        console.log('[Cross] Help button clicked (click event)');
        e.preventDefault();
        e.stopPropagation();
        handleHelpButtonClick();
    });
    
    // Touch events
    helpButton.addEventListener('touchstart', (e) => {
        console.log('[Cross] Help button touchstart');
        e.preventDefault();
        e.stopPropagation();
    });
    helpButton.addEventListener('touchend', (e) => {
        console.log('[Cross] Help button touchend');
        e.preventDefault();
        e.stopPropagation();
        handleHelpButtonClick();
    });
    
    console.log('[Cross] Help button event listeners added');
}

function handleHelpButtonClick() {
    console.log('[Cross] handleHelpButtonClick called');
    console.log('[Cross] startMenu element:', startMenu);
    console.log('[Cross] gameContainer element:', gameContainer);
    console.log('[Cross] startMenu current display:', startMenu ? startMenu.style.display : 'null');
    console.log('[Cross] gameContainer current display:', gameContainer ? gameContainer.style.display : 'null');
    
    // Show start menu and hide game
    if (startMenu) {
        startMenu.style.display = 'flex';
        console.log('[Cross] Set startMenu display to flex');
    } else {
        console.log('[Cross] ERROR: startMenu is null');
    }
    if (gameContainer) {
        gameContainer.style.display = 'none';
        console.log('[Cross] Set gameContainer display to none');
    } else {
        console.log('[Cross] ERROR: gameContainer is null');
    }
    
    console.log('[Cross] After changes - startMenu display:', startMenu ? startMenu.style.display : 'null');
    console.log('[Cross] After changes - gameContainer display:', gameContainer ? gameContainer.style.display : 'null');
}

// Game state
let gameState = {
    numbers: [],
    operators: ['+', '-', '×', '÷'],
    correctAnswer: 0,
    usedNumbers: [],
    equation: [],
    slots: {
        number1: null,
        number2: null,
        number3: null,
        operator1: null,
        operator2: null
    }
};

let draggedElement = null;
let touchStartElement = null;
let touchStartX = 0;
let touchStartY = 0;
let touchOffsetX = 0;
let touchOffsetY = 0;
let touchClone = null;

// ----- Daily key & save helpers -----
function tallyGetTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function tallyMarkStarted() {
    const todayKey = tallyGetTodayKey();
    
    // Let parent page know this session has actually started
    if (window.parent) {
        window.parent.postMessage('tallyStarted', '*');
        window.parent.postMessage('puzzleStarted:tally', '*');
    }
}

// Listen for parent asking us to reset TALLY-specific localStorage
window.addEventListener('message', (event) => {
    if (event.data === 'resetTallyLocalStorage') {
        const todayKey = tallyGetTodayKey();
        localStorage.removeItem(`tallyComplete_${todayKey}`);
    }
});


function tallyIsComplete() {
    const todayKey = tallyGetTodayKey();
    return localStorage.getItem(`tallyComplete_${todayKey}`) === 'true';
}

// Star helpers (copied pattern from quiz)
function tallyGetDailyStars() {
    const todayKey = tallyGetTodayKey();
    return parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
}

function tallyAddStars(count) {
    const todayKey = tallyGetTodayKey();
    const currentDailyStars = tallyGetDailyStars();
    const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
    
    // Update daily stars
    localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + count));
    
    // Update total stars
    localStorage.setItem('totalStars', String(currentTotalStars + count));
    
    // Award stars and games played
    if (window.awardStars) {
        window.awardStars(count, 'tally');
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

function tallyAwardWinStars() {
    const todayKey = tallyGetTodayKey();
    const existing = parseInt(localStorage.getItem(`tallyStars_${todayKey}`) || '0');
    if (existing > 0) {
        return;
    }

    const starsEarned = 5;
    localStorage.setItem(`tallyComplete_${todayKey}`, 'true');

    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'puzzleComplete',
            gameId: 'tally',
            stars: starsEarned,
            notes: [],
            delay: 1
        }, '*');
    }
}

// Initialize the game
function initializeGame() {
    const saved = null;
    
    if (saved) {
        // Restore saved puzzle instead of generating a new one
        gameState.numbers = Array.isArray(saved.numbers) ? saved.numbers : [];
        gameState.correctAnswer = saved.correctAnswer;
        gameState.equation = Array.isArray(saved.equation) ? saved.equation : [];
        if (Array.isArray(saved.usedNumbers) && saved.usedNumbers.length === 3) {
            gameState.usedNumbers = saved.usedNumbers;
        } else if (Array.isArray(saved.equation) && saved.equation.length === 5) {
            const [n1, , n2, , n3] = saved.equation;
            gameState.usedNumbers = [n1, n2, n3];
        }
    } else {
    generatePuzzle();
        // Save the newly generated puzzle for today
    }
    
    setupDragAndDrop();
    updateDisplay();
    
    // If this puzzle was already completed, show the solved state
    if (saved && saved.isComplete) {
        const equation = Array.isArray(saved.equation) ? saved.equation : gameState.equation;
        if (equation && equation.length === 5) {
            const [n1, op1, n2, op2, n3] = equation;
            const slot1 = document.getElementById('slot1');
            const slot2 = document.getElementById('slot2');
            const slot3 = document.getElementById('slot3');
            const opSlot1 = document.getElementById('opSlot1');
            const opSlot2 = document.getElementById('opSlot2');
            
            if (slot1) {
                slot1.textContent = String(n1);
                slot1.classList.add('filled');
            }
            if (slot2) {
                slot2.textContent = String(n2);
                slot2.classList.add('filled');
                slot2.draggable = false;
                slot2.setAttribute('data-prefilled', 'true');
            }
            if (slot3) {
                slot3.textContent = String(n3);
                slot3.classList.add('filled');
            }
            if (opSlot1) {
                opSlot1.textContent = op1;
                opSlot1.classList.add('filled');
            }
            if (opSlot2) {
                opSlot2.textContent = op2;
                opSlot2.classList.add('filled');
            }
            
            // Hide used number/operator boxes in the top rows
            const numberBoxes = document.querySelectorAll('.number-box');
            const operatorBoxes = document.querySelectorAll('.operator-box');
            [n1, n2, n3].forEach(num => {
                for (let box of numberBoxes) {
                    if (Number(box.textContent) === num && box.style.display !== 'none') {
                        box.style.display = 'none';
                        break;
                    }
                }
            });
            [op1, op2].forEach(op => {
                for (let box of operatorBoxes) {
                    if (box.textContent.trim() === op && box.style.display !== 'none') {
                        box.style.display = 'none';
                        break;
                    }
                }
            });
            
            // Show CORRECT state
            const currentTotalDiv = document.getElementById('currentTotal');
            if (currentTotalDiv) {
                currentTotalDiv.textContent = 'CORRECT ★★★★★';
                currentTotalDiv.classList.add('correct-total');
            }
        }
    }
}

// Generate the puzzle
function generatePuzzle() {
    let answer;
    let attempts = 0;
    const maxAttempts = 100;
    let firstOperator, secondOperator, num1, num2, num3;
    
    // Keep generating until we get a whole number answer
    do {
        // Generate 6 unique random numbers between -10 and 10, excluding -2 to 2
        gameState.numbers = [];
        
        // Valid numbers: -10 to -3, 3 to 10
        const validNumbers = [];
        for (let i = -10; i <= 10; i++) {
            if (i < -2 || i > 2) {
                validNumbers.push(i);
            }
        }
        
        // Generate first 4 numbers randomly
        while (gameState.numbers.length < 4) {
            const randomIndex = Math.floor(Math.random() * validNumbers.length);
            const num = validNumbers[randomIndex];
            if (!gameState.numbers.includes(num)) {
                gameState.numbers.push(num);
            }
        }
        
        // Try to find a 5th number that divides evenly into one of the first 4
        let foundDivisiblePair = false;
        let divisorNumber = null;
        let dividendNumber = null;
        const remainingNumbers = validNumbers.filter(n => !gameState.numbers.includes(n));
        
        // Check each remaining number to see if it divides evenly into any of the first 4
        for (let candidate of remainingNumbers) {
            if (candidate === 0) continue;
            
            // Check if candidate divides into any of the first 4
            for (let existingNum of gameState.numbers) {
                // Check both directions: existingNum / candidate and candidate / existingNum
                const result1 = existingNum / candidate;
                const result2 = candidate / existingNum;
                
                // existingNum ÷ candidate = result1 (candidate divides into existingNum)
                // In this case, candidate (divisor) is not in array yet, existingNum (dividend) is already in array
                if (Number.isInteger(result1) && Math.abs(result1) > 1 && Math.abs(result1) <= 10) {
                    foundDivisiblePair = true;
                    divisorNumber = candidate;  // This is the new number to add
                    dividendNumber = existingNum;  // This is already in the array
                    console.log('Found divisibility pair:', dividendNumber, '÷', divisorNumber, '=', result1);
                    break;
                } 
                // candidate ÷ existingNum = result2 (existingNum divides into candidate)
                // In this case, existingNum (divisor) is already in array, candidate (dividend) is not in array yet
                // So we want to add candidate, not existingNum
                else if (Number.isInteger(result2) && Math.abs(result2) > 1 && Math.abs(result2) <= 10) {
                    foundDivisiblePair = true;
                    divisorNumber = existingNum;  // This is already in the array (we keep it for the equation)
                    dividendNumber = candidate;  // This is the new number to add
                    console.log('Found divisibility pair:', dividendNumber, '÷', divisorNumber, '=', result2);
                    break;
                }
            }
            if (foundDivisiblePair) break;
        }
        
        // Add the 5th number
        if (foundDivisiblePair) {
            // The new number to add is either divisorNumber or dividendNumber, whichever is not already in the array
            let numberToAdd = null;
            if (!gameState.numbers.includes(divisorNumber)) {
                numberToAdd = divisorNumber;
            } else if (!gameState.numbers.includes(dividendNumber)) {
                numberToAdd = dividendNumber;
            }
            
            if (numberToAdd !== null) {
                gameState.numbers.push(numberToAdd);
                console.log('Using divisible number as 5th number:', numberToAdd);
            } else {
                // Fallback: both numbers somehow already in array (shouldn't happen, but just in case)
                const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
                gameState.numbers.push(remainingNumbers[randomIndex]);
                console.log('Divisible pair found but both numbers already in array, using random 5th number:', gameState.numbers[4]);
            }
        } else {
            // No divisible pair found, use random
            const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
            gameState.numbers.push(remainingNumbers[randomIndex]);
            console.log('No divisible pair found, using random 5th number:', gameState.numbers[4]);
        }
        
        // Safety check: ensure we have exactly 5 numbers before adding the 6th
        if (gameState.numbers.length !== 5) {
            console.error('ERROR: Expected 5 numbers after adding 5th, but have', gameState.numbers.length, gameState.numbers);
            // Remove duplicates if any
            gameState.numbers = [...new Set(gameState.numbers)];
            // If still not 5, pad or trim
            while (gameState.numbers.length < 5) {
                const remainingFor5 = validNumbers.filter(n => !gameState.numbers.includes(n));
                if (remainingFor5.length > 0) {
                    gameState.numbers.push(remainingFor5[0]);
                } else {
                    break;
                }
            }
            gameState.numbers = gameState.numbers.slice(0, 5);
        }
        
        // Generate 6th number randomly from remaining
        const remainingAfter5 = validNumbers.filter(n => !gameState.numbers.includes(n));
        const randomIndex6 = Math.floor(Math.random() * remainingAfter5.length);
        gameState.numbers.push(remainingAfter5[randomIndex6]);
        
        // Track if we're using the divisible pair and need to ensure division is used
        let usingDivisiblePair = false;
        
        // Select 3 random numbers from the 6
        // If we found a divisible pair, 50% chance to use those numbers
        let shuffled = [...gameState.numbers].sort(() => Math.random() - 0.5);
        
        if (foundDivisiblePair && divisorNumber !== null && Math.random() < 0.5) {
            console.log('Using divisible pair in equation (50% chance)');
            console.log('Divisible pair:', dividendNumber, 'and', divisorNumber);
            usingDivisiblePair = true;
            
            // Ensure both numbers from the divisible pair are included
            // Put the divisible pair in num1 and num2 so we can use division as first operator
            // Pick one more random number
            const otherNumbers = gameState.numbers.filter(n => n !== dividendNumber && n !== divisorNumber);
            const thirdNum = otherNumbers[Math.floor(Math.random() * otherNumbers.length)];
            
            // Put divisible pair in positions 1 and 2 for easier division handling
            num1 = dividendNumber;
            num2 = divisorNumber;
            num3 = thirdNum;
            
            console.log('+++Selected numbers for equation:', num1, num2, num3);
            console.log('Will ensure division is used between num1 and num2');
        } else {
            if (foundDivisiblePair) {
                console.log('---Not using divisible pair in equation (50% chance)');
            }
            // Normal random selection
            num1 = shuffled[0];
            num2 = shuffled[1];
            num3 = shuffled[2];
        }
        
        // Select operator types
        // First operator: either + or -, or × or ÷
        // Second operator: opposite type (if first is +/-, second is ×/÷, and vice versa)
        const addSub = ['+', '-'];
        const multDiv = ['×', '÷'];
        
        let firstOpType, secondOpType;
        
        // If using divisible pair, ensure division is used as first operator (between num1 and num2)
        if (usingDivisiblePair) {
            // Force first operator to be division
            firstOpType = multDiv;
            firstOperator = '÷';
            console.log('Forcing division as first operator (divisible pair)');
            
            // Second operator is from opposite type
            secondOpType = addSub;
            secondOperator = secondOpType[Math.floor(Math.random() * secondOpType.length)];
        } else {
            // Normal random selection
            if (Math.random() < 0.5) {
                // First is + or -, second is × or ÷
                firstOpType = addSub;
                secondOpType = multDiv;
            } else {
                // First is × or ÷, second is + or -
                firstOpType = multDiv;
                secondOpType = addSub;
            }
            
            // Select random operators from each type
            firstOperator = firstOpType[Math.floor(Math.random() * firstOpType.length)];
            secondOperator = secondOpType[Math.floor(Math.random() * secondOpType.length)];
        }
        
        gameState.usedNumbers = [num1, num2, num3];
        gameState.equation = [num1, firstOperator, num2, secondOperator, num3];
        
        // Calculate answer - always evaluate left to right with parentheses around first two numbers
        // Always evaluate as (num1 op1 num2) op2 num3
        let intermediateResult;
        intermediateResult = calculate(num1, firstOperator, num2);
        // Check if intermediate result is a whole number
        if (!Number.isInteger(intermediateResult)) {
            answer = NaN;
        } else {
            answer = calculate(intermediateResult, secondOperator, num3);
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
            console.warn('Could not generate whole number answer after', maxAttempts, 'attempts');
            break;
        }
    } while (!Number.isInteger(answer) || isNaN(answer));
    
    gameState.correctAnswer = answer;
    
    // Update instruction text - always show the example
    gameState.instructionText = 'Solve left to right as in ( 1 + 2 ) × 3 = 9';
    
    console.log('Generated puzzle:', gameState.equation.join(' '), '=', answer);
    console.log('Available numbers:', gameState.numbers);
}

// Calculate result of two numbers and an operator
// Returns NaN if result is not a whole number
function calculate(a, op, b) {
    // Check for NaN inputs
    if (isNaN(a) || isNaN(b)) {
        return NaN;
    }
    
    let result;
    switch (op) {
        case '+':
            result = a + b;
            break;
        case '-':
            result = a - b;
            break;
        case '×':
            result = a * b;
            break;
        case '÷':
            // Check for division by zero
            if (b === 0) {
                return NaN;
            }
            result = a / b;
            break;
        default:
            return NaN;
    }
    
    // Ensure result is a whole number
    return Number.isInteger(result) ? result : NaN;
}

// Setup drag and drop
function setupDragAndDrop() {
    // Make number boxes draggable
    const numberBoxes = document.querySelectorAll('.number-box');
    numberBoxes.forEach(box => {
        box.addEventListener('dragstart', handleDragStart);
        box.addEventListener('dragend', handleDragEnd);
        box.addEventListener('touchstart', handleTouchStart, { passive: false });
        box.addEventListener('touchmove', handleTouchMove, { passive: false });
        box.addEventListener('touchend', handleTouchEnd);
        box.addEventListener('touchcancel', handleTouchEnd);
        box.draggable = true;
    });
    
    // Make operator boxes draggable
    const operatorBoxes = document.querySelectorAll('.operator-box');
    operatorBoxes.forEach(box => {
        box.addEventListener('dragstart', handleDragStart);
        box.addEventListener('dragend', handleDragEnd);
        box.addEventListener('touchstart', handleTouchStart, { passive: false });
        box.addEventListener('touchmove', handleTouchMove, { passive: false });
        box.addEventListener('touchend', handleTouchEnd);
        box.addEventListener('touchcancel', handleTouchEnd);
        box.draggable = true;
    });
    
    // Setup drop zones for slots
    const numberSlots = document.querySelectorAll('.number-slot');
    numberSlots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('dragstart', handleSlotDragStart);
        slot.addEventListener('dragend', handleDragEnd);
        slot.addEventListener('touchstart', handleTouchStart, { passive: false });
        slot.addEventListener('touchmove', handleTouchMove, { passive: false });
        slot.addEventListener('touchend', handleTouchEnd);
        slot.addEventListener('touchcancel', handleTouchEnd);
        // Only make draggable if filled and not pre-filled
        slot.draggable = slot.classList.contains('filled') && !slot.hasAttribute('data-prefilled');
    });
    
    const operatorSlots = document.querySelectorAll('.operator-slot');
    operatorSlots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('dragstart', handleSlotDragStart);
        slot.addEventListener('dragend', handleDragEnd);
        slot.addEventListener('touchstart', handleTouchStart, { passive: false });
        slot.addEventListener('touchmove', handleTouchMove, { passive: false });
        slot.addEventListener('touchend', handleTouchEnd);
        slot.addEventListener('touchcancel', handleTouchEnd);
        // Only make draggable if filled and not pre-filled
        slot.draggable = slot.classList.contains('filled') && !slot.hasAttribute('data-prefilled');
    });
    
    // Add global drop handler to body to catch drops outside valid zones
    document.body.addEventListener('drop', handleBodyDrop);
    document.body.addEventListener('dragover', handleBodyDragOver);
    
    // Setup top area as drop zone to return items
    const numbersRow = document.getElementById('numbersRow');
    const operatorsRow = document.querySelector('.operators-row');
    
    if (numbersRow) {
        numbersRow.addEventListener('dragover', handleTopAreaDragOver);
        numbersRow.addEventListener('drop', handleTopAreaDrop);
        numbersRow.addEventListener('dragleave', handleTopAreaDragLeave);
    }
    
    if (operatorsRow) {
        operatorsRow.addEventListener('dragover', handleTopAreaDragOver);
        operatorsRow.addEventListener('drop', handleTopAreaDrop);
        operatorsRow.addEventListener('dragleave', handleTopAreaDragLeave);
    }
}

function handleDragStart(e) {
    // Don't allow dragging if it's a filled slot being dragged outside
    if (e.target.classList.contains('filled')) {
        // Allow dragging filled slots to remove them
        draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.textContent);
        e.dataTransfer.setData('is-slot', 'true');
    } else {
        draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
        e.dataTransfer.setData('is-slot', 'false');
    }
}

function handleSlotDragStart(e) {
    // Only allow dragging if the slot is filled
    if (!e.target.classList.contains('filled')) {
        e.preventDefault();
        return;
    }
    // Prevent dragging if it's the pre-filled slot2
    if (e.target.id === 'slot2' && e.target.hasAttribute('data-prefilled')) {
        e.preventDefault();
        return;
    }
    handleDragStart(e);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    // Remove drag-over class from all slots
    document.querySelectorAll('.number-slot, .operator-slot').forEach(slot => {
        slot.classList.remove('drag-over');
    });
    
    // Remove drag-over class from top areas
    const numbersRow = document.getElementById('numbersRow');
    const operatorsRow = document.querySelector('.operators-row');
    if (numbersRow) numbersRow.classList.remove('drag-over');
    if (operatorsRow) operatorsRow.classList.remove('drag-over');
    
    // Track if this was a successful drop
    if (e.dataTransfer.dropEffect === 'none' || e.dataTransfer.dropEffect === '') {
        // Drag was cancelled or dropped outside valid zone
        // If dragging from a filled slot, return it to top area
        if (e.target.classList.contains('filled') && 
            (e.target.classList.contains('number-slot') || e.target.classList.contains('operator-slot'))) {
            const slot = e.target;
            const value = slot.textContent.trim();
            const isNumberSlot = slot.classList.contains('number-slot');
            
            // Restore the original box
            if (isNumberSlot) {
                restoreNumberBox(value);
            } else {
                restoreOperatorBox(value);
            }
            
            // Clear the slot
            slot.textContent = '';
            slot.classList.remove('filled');
            slot.draggable = false;
            updateSlots();
            checkAnswer();
        }
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const slot = e.currentTarget;
    const isNumberSlot = slot.classList.contains('number-slot');
    const isOperatorSlot = slot.classList.contains('operator-slot');
    const isNumberBox = draggedElement && (draggedElement.classList.contains('number-box') || (draggedElement.classList.contains('number-slot') && draggedElement.classList.contains('filled')));
    const isOperatorBox = draggedElement && (draggedElement.classList.contains('operator-box') || (draggedElement.classList.contains('operator-slot') && draggedElement.classList.contains('filled')));
    
    // Check if drag is valid (numbers go to number slots, operators to operator slots)
    // Also allow dragging from slots to other slots
    if ((isNumberSlot && isNumberBox) || (isOperatorSlot && isOperatorBox)) {
        slot.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== DROP EVENT ===');
    
    const slot = e.currentTarget;
    const isNumberSlot = slot.classList.contains('number-slot');
    const isOperatorSlot = slot.classList.contains('operator-slot');
    const isNumberBox = draggedElement && (draggedElement.classList.contains('number-box') || (draggedElement.classList.contains('number-slot') && draggedElement.classList.contains('filled')));
    const isOperatorBox = draggedElement && (draggedElement.classList.contains('operator-box') || (draggedElement.classList.contains('operator-slot') && draggedElement.classList.contains('filled')));
    
    console.log('Drop target:', slot.id);
    console.log('Dragged element:', draggedElement?.className);
    console.log('Is number slot:', isNumberSlot, 'Is number box:', isNumberBox);
    console.log('Is operator slot:', isOperatorSlot, 'Is operator box:', isOperatorBox);
    
    // Validate drop
    if ((isNumberSlot && !isNumberBox) || (isOperatorSlot && !isOperatorBox)) {
        console.log('Drop validation failed');
        return;
    }
    
    // Get the value from dragged element
    let value;
    if (draggedElement.classList.contains('number-box') || draggedElement.classList.contains('operator-box')) {
        value = draggedElement.textContent.trim();
    } else if (draggedElement.classList.contains('filled')) {
        // Dragging from a slot
        value = draggedElement.textContent.trim();
        
        // If dropping on the same slot, do nothing
        if (draggedElement === slot) {
            console.log('Dropped on same slot, ignoring');
            return;
        }
        
        // Clear the source slot
        draggedElement.textContent = '';
        draggedElement.classList.remove('filled');
    }
    
    console.log('Dropped value:', value);
    
    // Clear destination slot if already filled
    if (slot.classList.contains('filled')) {
        const existingContent = slot.textContent;
        console.log('Slot already filled with:', existingContent);
        // Find the original box and restore it (or if it's the same value, just leave it)
        if (existingContent !== value) {
            if (isNumberSlot) {
                restoreNumberBox(existingContent);
            } else {
                restoreOperatorBox(existingContent);
            }
        }
    }
    
    // Place the dragged item in the slot
    slot.textContent = value;
    slot.classList.add('filled');
    slot.classList.remove('drag-over');
    // Make it draggable only if it's not the pre-filled slot2
    slot.draggable = slot.id !== 'slot2' || !slot.hasAttribute('data-prefilled');
    
    console.log('Slot filled, calling updateSlots()');
    
    // Update game state
    updateSlots();
    
    // Hide the original box if it's a box (not a slot)
    if (draggedElement.classList.contains('number-box') || draggedElement.classList.contains('operator-box')) {
        draggedElement.style.display = 'none';
    }
    
    console.log('Calling checkAnswer()');
    
    // Check answer
    checkAnswer();
    
    console.log('=== END DROP EVENT ===');
}

function updateSlots() {
    console.log('updateSlots() called');
    
    const slot1 = document.getElementById('slot1');
    const slot2 = document.getElementById('slot2');
    const slot3 = document.getElementById('slot3');
    const opSlot1 = document.getElementById('opSlot1');
    const opSlot2 = document.getElementById('opSlot2');
    
    // Use Number() instead of parseInt() to handle negative numbers correctly
    gameState.slots.number1 = slot1.classList.contains('filled') ? Number(slot1.textContent) : null;
    gameState.slots.number2 = slot2.classList.contains('filled') ? Number(slot2.textContent) : null;
    gameState.slots.number3 = slot3.classList.contains('filled') ? Number(slot3.textContent) : null;
    
    // Normalize operators (convert Unicode minus to ASCII minus)
    let op1Text = opSlot1.classList.contains('filled') ? opSlot1.textContent.trim() : null;
    let op2Text = opSlot2.classList.contains('filled') ? opSlot2.textContent.trim() : null;
    gameState.slots.operator1 = op1Text === '−' ? '-' : op1Text;
    gameState.slots.operator2 = op2Text === '−' ? '-' : op2Text;
    
    console.log('Updated slots:', gameState.slots);
    
    // Update current total display
    updateCurrentTotal();
    
    // Also check answer after updating total
    checkAnswer();
}


function updateCurrentTotal() {
    const num1 = gameState.slots.number1;
    const num2 = gameState.slots.number2;
    const num3 = gameState.slots.number3;
    const op1 = gameState.slots.operator1;
    const op2 = gameState.slots.operator2;
    
    const currentTotalDiv = document.getElementById('currentTotal');
    
    if (!num1 || !num2 || !num3 || !op1 || !op2) {
        // Not all slots filled - make blank
        currentTotalDiv.textContent = '';
        currentTotalDiv.classList.remove('correct-total');
        return;
    }
    
    // Calculate current total - always evaluate left to right with parentheses around first two numbers
    // Always evaluate as (num1 op1 num2) op2 num3
    let result;
    
    // Normalize operators (convert Unicode minus to ASCII minus)
    const normalizedOp1 = op1 === '−' ? '-' : op1;
    const normalizedOp2 = op2 === '−' ? '-' : op2;
    
    const firstResult = calculate(num1, normalizedOp1, num2);
    if (isNaN(firstResult)) {
        console.log('First calculation resulted in NaN:', num1, normalizedOp1, num2);
        currentTotalDiv.textContent = '';
        currentTotalDiv.classList.remove('correct-total');
        return;
    }
    result = calculate(firstResult, normalizedOp2, num3);
    
    if (isNaN(result)) {
        currentTotalDiv.textContent = '';
        currentTotalDiv.classList.remove('correct-total');
    } else {
        // Check if answer matches
        const correctAnswer = Math.round(gameState.correctAnswer * 100) / 100;
        const roundedResult = Math.round(result * 100) / 100;
        
        if (Math.abs(roundedResult - correctAnswer) < 0.01) {
            // Correct answer - don't show total here, let checkAnswer handle it
            // But we need to make sure checkAnswer is called
            return;
        } else {
            // Wrong answer - show TOTAL: x
            currentTotalDiv.textContent = `TOTAL: ${result}`;
            currentTotalDiv.classList.remove('correct-total');
        }
    }
}

function restoreNumberBox(value) {
    const numberBoxes = document.querySelectorAll('.number-box');
    for (let box of numberBoxes) {
        if (box.textContent.trim() === value && box.style.display === 'none') {
            box.style.display = 'flex';
            return;
        }
    }
}

function restoreOperatorBox(value) {
    const operatorBoxes = document.querySelectorAll('.operator-box');
    for (let box of operatorBoxes) {
        // Normalize the operator symbols for comparison
        const boxText = box.textContent.trim();
        const normalizedBox = boxText === '−' ? '-' : boxText;
        const normalizedValue = value === '−' ? '-' : value;
        
        if (normalizedBox === normalizedValue && box.style.display === 'none') {
            box.style.display = 'flex';
            return;
        }
    }
}

// Handle dragging over top area (return zone)
function handleTopAreaDragOver(e) {
    // Only allow drop if dragging from a filled slot
    if (draggedElement && draggedElement.classList.contains('filled')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }
}

function handleTopAreaDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

// Handle dropping item back to top area
function handleTopAreaDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Only handle if dragging from a filled slot
    if (!draggedElement || !draggedElement.classList.contains('filled')) {
        return;
    }
    
    const slot = draggedElement;
    const value = slot.textContent.trim();
    const isNumberSlot = slot.classList.contains('number-slot');
    const targetArea = e.currentTarget;
    
    // Verify we're dropping in the correct area
    const isNumbersRow = targetArea.id === 'numbersRow';
    const isOperatorsRow = targetArea.classList.contains('operators-row');
    
    if ((isNumberSlot && !isNumbersRow) || (!isNumberSlot && !isOperatorsRow)) {
        // Not the right area, don't drop
        return;
    }
    
    // Restore the original box
    if (isNumberSlot) {
        restoreNumberBox(value);
    } else {
        restoreOperatorBox(value);
    }
    
    // Clear the slot
    slot.textContent = '';
    slot.classList.remove('filled');
    slot.draggable = false;
    targetArea.classList.remove('drag-over');
    
    // Update game state
    updateSlots();
    checkAnswer();
}

// Handle drops on body (outside valid zones) - return items to top
function handleBodyDrop(e) {
    // Only handle if dragging from a filled slot
    if (!draggedElement || !draggedElement.classList.contains('filled')) {
        return;
    }
    
    // Check if we're dropping on a valid zone (if so, let that handler take over)
    const target = e.target;
    if (target.classList.contains('number-slot') || 
        target.classList.contains('operator-slot') ||
        target.id === 'numbersRow' ||
        target.classList.contains('operators-row')) {
        return; // Let the specific handler deal with it
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const slot = draggedElement;
    const value = slot.textContent.trim();
    const isNumberSlot = slot.classList.contains('number-slot');
    
    // Restore the original box
    if (isNumberSlot) {
        restoreNumberBox(value);
    } else {
        restoreOperatorBox(value);
    }
    
    // Clear the slot
    slot.textContent = '';
    slot.classList.remove('filled');
    slot.draggable = false;
    
    // Update game state
    updateSlots();
    checkAnswer();
}

function handleBodyDragOver(e) {
    // Only allow if dragging from a filled slot
    if (draggedElement && draggedElement.classList.contains('filled')) {
        // Check if we're over a valid drop zone
        const target = e.target;
        if (!target.classList.contains('number-slot') && 
            !target.classList.contains('operator-slot') &&
            target.id !== 'numbersRow' &&
            !target.classList.contains('operators-row')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
    }
}

// Touch event handlers for mobile
function handleTouchStart(e) {
    const element = e.target;
    
    // Check if element is draggable
    const isDraggableBox = element.classList.contains('number-box') || element.classList.contains('operator-box');
    const isDraggableSlot = element.classList.contains('filled') && 
                           (element.classList.contains('number-slot') || element.classList.contains('operator-slot')) &&
                           !(element.id === 'slot2' && element.hasAttribute('data-prefilled'));
    
    if (!isDraggableBox && !isDraggableSlot) {
        return;
    }
    
    e.preventDefault();
    
    touchStartElement = element;
    draggedElement = element;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    // Get element position
    const rect = element.getBoundingClientRect();
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;
    
    // Create a clone for visual feedback
    touchClone = element.cloneNode(true);
    touchClone.style.position = 'fixed';
    touchClone.style.left = (touch.clientX - touchOffsetX) + 'px';
    touchClone.style.top = (touch.clientY - touchOffsetY) + 'px';
    touchClone.style.zIndex = '10000';
    touchClone.style.pointerEvents = 'none';
    touchClone.style.opacity = '0.8';
    touchClone.classList.add('dragging');
    document.body.appendChild(touchClone);
    
    // Hide original element slightly
    element.style.opacity = '0.5';
}

function handleTouchMove(e) {
    if (!touchStartElement || !touchClone) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    touchClone.style.left = (touch.clientX - touchOffsetX) + 'px';
    touchClone.style.top = (touch.clientY - touchOffsetY) + 'px';
    
    // Find element under touch point
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Remove drag-over from all slots
    document.querySelectorAll('.number-slot, .operator-slot').forEach(slot => {
        slot.classList.remove('drag-over');
    });
    
    // Remove drag-over from top areas
    const numbersRow = document.getElementById('numbersRow');
    const operatorsRow = document.querySelector('.operators-row');
    if (numbersRow) numbersRow.classList.remove('drag-over');
    if (operatorsRow) operatorsRow.classList.remove('drag-over');
    
    // Check if over a valid drop target
    if (elementBelow) {
        const isNumberSlot = elementBelow.classList.contains('number-slot');
        const isOperatorSlot = elementBelow.classList.contains('operator-slot');
        const isNumbersRow = elementBelow.id === 'numbersRow' || elementBelow.closest('#numbersRow');
        const isOperatorsRow = elementBelow.classList.contains('operators-row') || elementBelow.closest('.operators-row');
        
        const isNumberBox = touchStartElement.classList.contains('number-box') || 
                           (touchStartElement.classList.contains('number-slot') && touchStartElement.classList.contains('filled'));
        const isOperatorBox = touchStartElement.classList.contains('operator-box') || 
                             (touchStartElement.classList.contains('operator-slot') && touchStartElement.classList.contains('filled'));
        
        if (isNumberSlot && isNumberBox) {
            elementBelow.classList.add('drag-over');
        } else if (isOperatorSlot && isOperatorBox) {
            elementBelow.classList.add('drag-over');
        } else if (isNumbersRow && isNumberBox && touchStartElement.classList.contains('filled')) {
            numbersRow.classList.add('drag-over');
        } else if (isOperatorsRow && isOperatorBox && touchStartElement.classList.contains('filled')) {
            operatorsRow.classList.add('drag-over');
        }
    }
}

function handleTouchEnd(e) {
    if (!touchStartElement || !touchClone) return;
    
    e.preventDefault();
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Remove clone
    if (touchClone) {
        touchClone.remove();
        touchClone = null;
    }
    
    // Restore original element opacity
    touchStartElement.style.opacity = '';
    
    // Remove drag-over classes
    document.querySelectorAll('.number-slot, .operator-slot').forEach(slot => {
        slot.classList.remove('drag-over');
    });
    const numbersRow = document.getElementById('numbersRow');
    const operatorsRow = document.querySelector('.operators-row');
    if (numbersRow) numbersRow.classList.remove('drag-over');
    if (operatorsRow) operatorsRow.classList.remove('drag-over');
    
    if (elementBelow) {
        // Check if dropped on a valid target
        const isNumberSlot = elementBelow.classList.contains('number-slot');
        const isOperatorSlot = elementBelow.classList.contains('operator-slot');
        const isNumbersRow = elementBelow.id === 'numbersRow' || elementBelow.closest('#numbersRow');
        const isOperatorsRow = elementBelow.classList.contains('operators-row') || elementBelow.closest('.operators-row');
        
        const isNumberBox = touchStartElement.classList.contains('number-box') || 
                           (touchStartElement.classList.contains('number-slot') && touchStartElement.classList.contains('filled'));
        const isOperatorBox = touchStartElement.classList.contains('operator-box') || 
                             (touchStartElement.classList.contains('operator-slot') && touchStartElement.classList.contains('filled'));
        
        if (isNumberSlot && isNumberBox) {
            // Simulate drop on number slot
            const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {}, currentTarget: elementBelow };
            handleDrop(fakeEvent);
        } else if (isOperatorSlot && isOperatorBox) {
            // Simulate drop on operator slot
            const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {}, currentTarget: elementBelow };
            handleDrop(fakeEvent);
        } else if (isNumbersRow && isNumberBox && touchStartElement.classList.contains('filled')) {
            // Simulate drop on numbers row
            const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {}, currentTarget: numbersRow };
            handleTopAreaDrop(fakeEvent);
        } else if (isOperatorsRow && isOperatorBox && touchStartElement.classList.contains('filled')) {
            // Simulate drop on operators row
            const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {}, currentTarget: operatorsRow };
            handleTopAreaDrop(fakeEvent);
        } else if (touchStartElement.classList.contains('filled')) {
            // Dropped outside valid zone - return to top
            const isNumberSlot = touchStartElement.classList.contains('number-slot');
            const value = touchStartElement.textContent.trim();
            
            if (isNumberSlot) {
                restoreNumberBox(value);
            } else {
                restoreOperatorBox(value);
            }
            
            touchStartElement.textContent = '';
            touchStartElement.classList.remove('filled');
            touchStartElement.draggable = false;
            updateSlots();
            checkAnswer();
        }
    } else if (touchStartElement.classList.contains('filled')) {
        // Dropped outside - return to top
        const isNumberSlot = touchStartElement.classList.contains('number-slot');
        const value = touchStartElement.textContent.trim();
        
        if (isNumberSlot) {
            restoreNumberBox(value);
        } else {
            restoreOperatorBox(value);
        }
        
        touchStartElement.textContent = '';
        touchStartElement.classList.remove('filled');
        touchStartElement.draggable = false;
        updateSlots();
        checkAnswer();
    }
    
    touchStartElement = null;
    draggedElement = null;
}

function checkAnswer() {
    // Check if all slots are filled
    if (!gameState.slots.number1 || !gameState.slots.number2 || !gameState.slots.number3 ||
        !gameState.slots.operator1 || !gameState.slots.operator2) {
        return;
    }
    
    const num1 = gameState.slots.number1;
    const num2 = gameState.slots.number2;
    const num3 = gameState.slots.number3;
    const op1 = gameState.slots.operator1;
    const op2 = gameState.slots.operator2;
    
    // Check if all three numbers are from the available numbers
    const usedNums = [num1, num2, num3];
    const availableNums = [...gameState.numbers];
    
    for (let num of usedNums) {
        const index = availableNums.indexOf(num);
        if (index === -1) {
            // Number not available or used twice
            console.log('Number validation failed:', num, 'not in', availableNums);
            return;
        }
        availableNums.splice(index, 1);
    }
    
    // Calculate result - always evaluate left to right with parentheses around first two numbers
    // Always evaluate as (num1 op1 num2) op2 num3
    let result;
    
    // Normalize operators (convert Unicode minus to ASCII minus)
    const normalizedOp1 = op1 === '−' ? '-' : op1;
    const normalizedOp2 = op2 === '−' ? '-' : op2;
    
    console.log('Calculating:', num1, normalizedOp1, num2, 'then', normalizedOp2, num3);
    
    const firstResult = calculate(num1, normalizedOp1, num2);
    if (isNaN(firstResult)) {
        console.log('First calculation resulted in NaN');
        return; // Can't calculate
    }
    console.log('First result:', firstResult);
    result = calculate(firstResult, normalizedOp2, num3);
    console.log('Final result:', result);
    
    // Round to 2 decimal places for comparison
    result = Math.round(result * 100) / 100;
    const correctAnswer = Math.round(gameState.correctAnswer * 100) / 100;
    
    // Check if answer matches
    console.log('Checking answer:', result, 'vs', correctAnswer);
    if (Math.abs(result - correctAnswer) < 0.01) {
        // Correct!
        console.log('Answer is correct!');
        showResult(true);
    } else {
        // Check if this is a valid alternative solution
        // (we already verified the numbers are from the available set)
        console.log('Answer is wrong');
        showResult(false);
    }
}

function showResult(isCorrect) {
    if (isCorrect) {
        console.log('WIN!');
        
        // Animate the 5 equation slots
        const slots = document.querySelectorAll('.number-slot.filled, .operator-slot.filled');
        slots.forEach(slot => {
            slot.classList.add('correct-animation');
        });
        
        // Update total to show "CORRECT" and stars
        const currentTotalDiv = document.getElementById('currentTotal');
        currentTotalDiv.textContent = 'CORRECT ★★★★★';
        currentTotalDiv.classList.add('correct-total');
        
        // Save completed puzzle and award stars
        tallyAwardWinStars();
        
        setTimeout(() => {
            // Remove animation class
            slots.forEach(slot => {
                slot.classList.remove('correct-animation');
            });
            
            // Don't reset the game - keep the correct answer showing
        }, 800);
    } else {
        // Don't show red background - just leave it as is
        // The TOTAL: x will already be showing from updateCurrentTotal
    }
}

function resetGame() {
    // Clear all slots
    const slots = document.querySelectorAll('.number-slot, .operator-slot');
    slots.forEach(slot => {
        slot.textContent = '';
        slot.classList.remove('filled');
        slot.classList.remove('correct-animation');
    });
    
    // Show all boxes
    document.querySelectorAll('.number-box, .operator-box').forEach(box => {
        box.style.display = 'flex';
    });
    
    // Reset total display
    const currentTotalDiv = document.getElementById('currentTotal');
    currentTotalDiv.textContent = '';
    currentTotalDiv.classList.remove('correct-total');
    
    // Reset game state
    gameState.slots = {
        number1: null,
        number2: null,
        number3: null,
        operator1: null,
        operator2: null
    };
    
    // Generate new puzzle
    generatePuzzle();
    updateDisplay();
}

// Update the display
function updateDisplay() {
    const numbersRow = document.getElementById('numbersRow');
    numbersRow.innerHTML = '';
    
    gameState.numbers.forEach(num => {
        const box = document.createElement('div');
        box.className = 'number-box';
        box.textContent = num;
        box.draggable = true;
        box.addEventListener('dragstart', handleDragStart);
        box.addEventListener('dragend', handleDragEnd);
        numbersRow.appendChild(box);
    });
    
    document.getElementById('answerDisplay').textContent = gameState.correctAnswer;
    
    // Update instruction text
    const instructionTextDiv = document.getElementById('instructionText');
    if (instructionTextDiv && gameState.instructionText) {
        instructionTextDiv.textContent = gameState.instructionText;
    }
    
    // Pre-fill the second number slot with num2 from the equation
    const slot2 = document.getElementById('slot2');
    if (slot2 && gameState.usedNumbers.length >= 2) {
        const num2 = gameState.usedNumbers[1];
        // Ensure negative numbers are displayed correctly
        slot2.textContent = String(num2);
        slot2.classList.add('filled');
        slot2.draggable = false; // Make it non-draggable - it's the given number
        slot2.setAttribute('data-prefilled', 'true'); // Mark as pre-filled
        
        // Hide the corresponding number box
        const numberBoxes = document.querySelectorAll('.number-box');
        for (let box of numberBoxes) {
            // Use Number() instead of parseInt() to handle negative numbers correctly
            const boxValue = Number(box.textContent);
            if (boxValue === num2 && box.style.display !== 'none') {
                box.style.display = 'none';
                break;
            }
        }
        
        // Update slots state
        gameState.slots.number2 = num2;
    }
    
    // Update draggable state for all slots (except pre-filled slot2)
    document.querySelectorAll('.number-slot, .operator-slot').forEach(slot => {
        slot.draggable = slot.classList.contains('filled') && !slot.hasAttribute('data-prefilled');
    });
    
    // Re-setup drag and drop for new boxes
    setupDragAndDrop();
}

// Handle viewport height for mobile
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setViewportHeight);
setViewportHeight();

// Setup play button
function setupPlayButton() {
    const playButton = document.getElementById('playButton');
    
    if (playButton) {
        let _tallyClick = (function() { try { const a = new Audio(new URL('../../sounds/click.mp3', window.location.href).href); a.preload = 'auto'; a.load(); return a; } catch (e) { return null; } })();
        const playTallyClick = () => { try { if (_tallyClick) { _tallyClick.currentTime = 0; _tallyClick.play().catch(() => {}); } } catch (e) {} };
        playButton.addEventListener('click', () => {
            playTallyClick();
            const startMenu = document.getElementById('startMenu');
            const gameContainer = document.getElementById('gameContainer');
            
            if (startMenu) {
                startMenu.style.display = 'none';
            }
            
            if (gameContainer) {
                gameContainer.style.display = 'flex';
                // Mark this session as started for today (used by parent to decide on quit warning)
                tallyMarkStarted();
                initializeGame();
            }
        });
    }
}

// Initialize setup when page loads
document.addEventListener('DOMContentLoaded', () => {
    setupPlayButton();
    
    // If there's a saved puzzle for today, skip the start screen and go straight to the game
    if (false) {
        const startMenu = document.getElementById('startMenu');
        const gameContainer = document.getElementById('gameContainer');
        if (startMenu) {
            startMenu.style.display = 'none';
        }
        if (gameContainer) {
            gameContainer.style.display = 'flex';
        }
        // Saved puzzle implies the game has been started previously
        tallyMarkStarted();
        initializeGame();
    }
});

// Prevent default touch behavior on body to avoid scrolling while dragging
document.addEventListener('touchmove', (e) => {
    if (touchStartElement) {
        e.preventDefault();
    }
}, { passive: false });

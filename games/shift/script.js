const colors = ['light', 'medium', 'dark'];
const colorValues = {
    'light': '#87ceeb',
    'medium': '#4682b4',
    'dark': '#191970'
};

// Get URL parameter
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Get number of blocks from URL parameter 'b', default to 4
function getNumberOfBlocks() {
    const bParam = getURLParameter('b');
    if (bParam) {
        const numBlocks = parseInt(bParam, 10);
        // Validate: must be between 1 and 6 (we have 6 block patterns)
        if (numBlocks >= 1 && numBlocks <= 6) {
            return numBlocks;
        }
    }
    return 4; // Default
}

const grid = document.getElementById('grid');
const blocksPool = document.getElementById('blocksPool');
const resetButton = document.getElementById('resetButton');
const undoButton = document.getElementById('undoButton');
const giveUpButton = document.getElementById('giveUpButton');
const hintButton = document.getElementById('hintButton');
const helpButton = document.getElementById('helpButton');
let hintPressCount = 0;
let gaveUp = false;
let buttonsFadedOut = false;
let gameStarted = false;
let isResetting = false;
let savedFinalColor = null;

// Get today's date key for localStorage
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Define all possible block patterns with anchor points
// anchorRow, anchorCol define where the piece anchors when dropped
const blockPatterns = [
    { type: 'horizontal', shape: [[1, 1, 1]], anchorRow: 0, anchorCol: 1 }, // xax - anchor at middle
    { type: 'vertical', shape: [[1], [1], [1]], anchorRow: 1, anchorCol: 0 }, // x a x - anchor at middle
    { type: 'l-top-left', shape: [[1, 1], [1, 0]], anchorRow: 0, anchorCol: 0 }, // ox xa - anchor at bottom-left
    { type: 'l-top-right', shape: [[1, 1], [0, 1]], anchorRow: 0, anchorCol: 1 }, // ax xo - anchor shifted down
    { type: 'l-bottom-left', shape: [[1, 0], [1, 1]], anchorRow: 1, anchorCol: 0 }, // xo ax - anchor shifted down
    { type: 'l-bottom-right', shape: [[0, 1], [1, 1]], anchorRow: 1, anchorCol: 1 } // xa xo - anchor shifted down
];

let gridState = [];
let initialGridState = []; // Store initial state for reset
let targetColor = 'red'; // Target color for win condition
let selectedBlocks = [];
let draggedBlock = null;
let gameBlocks = []; // Blocks available for the player
let moveHistory = []; // Store history of moves for undo
let solutionPositions = []; // Store solution positions for give up animation
let isAnimating = false; // Track if animation is in progress

// Initialize grid state with target color
function initializeGrid(target) {
    gridState = [];
    for (let row = 0; row < 4; row++) {
        gridState[row] = [];
        for (let col = 0; col < 4; col++) {
            gridState[row][col] = target;
        }
    }
}

// Shift color forward: red -> green -> blue -> red
function shiftColorForward(color) {
    const index = colors.indexOf(color);
    return colors[(index + 1) % 3];
}

// Shift color backward: red -> blue -> green -> red
function shiftColorBackward(color) {
    const index = colors.indexOf(color);
    return colors[(index + 2) % 3];
}

// Apply block to grid (forward shift) using anchor point
function applyBlockToGrid(pattern, anchorRow, anchorCol, shiftForward = true) {
    const shape = pattern.shape;
    const anchorRowOffset = pattern.anchorRow;
    const anchorColOffset = pattern.anchorCol;
    
    // Calculate the top-left position based on anchor
    const topLeftRow = anchorRow - anchorRowOffset;
    const topLeftCol = anchorCol - anchorColOffset;
    
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
                const gridRow = topLeftRow + r;
                const gridCol = topLeftCol + c;
                if (gridRow >= 0 && gridRow < 4 && gridCol >= 0 && gridCol < 4) {
                    if (shiftForward) {
                        gridState[gridRow][gridCol] = shiftColorForward(gridState[gridRow][gridCol]);
                    } else {
                        gridState[gridRow][gridCol] = shiftColorBackward(gridState[gridRow][gridCol]);
                    }
                }
            }
        }
    }
}

// Check if block can be placed using anchor point
function canPlaceBlock(pattern, anchorRow, anchorCol) {
    const shape = pattern.shape;
    const anchorRowOffset = pattern.anchorRow;
    const anchorColOffset = pattern.anchorCol;
    
    // Calculate the top-left position based on anchor
    const topLeftRow = anchorRow - anchorRowOffset;
    const topLeftCol = anchorCol - anchorColOffset;
    
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
                const gridRow = topLeftRow + r;
                const gridCol = topLeftCol + c;
                if (gridRow < 0 || gridRow >= 4 || gridCol < 0 || gridCol >= 4) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Update grid display
function updateGridDisplay() {
    const cells = grid.querySelectorAll('.grid-cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const color = gridState[row][col];
        cell.className = `grid-cell color-${color}`;
    });
}

// Create block element
function createBlockElement(pattern, isDraggable = true) {
    const block = document.createElement('div');
    block.className = `block ${pattern.type}`;
    block.dataset.type = pattern.type;
    block.dataset.shape = JSON.stringify(pattern.shape);
    
    // Determine grid dimensions
    const maxCols = Math.max(...pattern.shape.map(row => row.length));
    const maxRows = pattern.shape.length;
    
    // Set grid template
    if (pattern.type === 'horizontal') {
        block.style.gridTemplateColumns = `repeat(${maxCols}, auto)`;
        block.style.gridTemplateRows = 'auto';
    } else if (pattern.type === 'vertical') {
        block.style.gridTemplateColumns = 'auto';
        block.style.gridTemplateRows = `repeat(${maxRows}, auto)`;
    } else {
        block.style.gridTemplateColumns = `repeat(${maxCols}, auto)`;
        block.style.gridTemplateRows = `repeat(${maxRows}, auto)`;
    }
    
    // Create cells based on pattern
    for (let r = 0; r < pattern.shape.length; r++) {
        for (let c = 0; c < pattern.shape[r].length; c++) {
            if (pattern.shape[r][c] === 1) {
                const cell = document.createElement('div');
                cell.className = 'block-cell';
                cell.style.gridRow = r + 1;
                cell.style.gridColumn = c + 1;
                block.appendChild(cell);
            }
        }
    }
    
    if (isDraggable) {
        block.draggable = true;
        block.addEventListener('dragstart', handleDragStart);
        block.addEventListener('dragend', handleDragEnd);
        
        // Add touch support for mobile
        block.addEventListener('touchstart', handleTouchStart, { passive: false });
    }
    
    return block;
}

// Setup puzzle by randomly selecting 5 blocks and applying them backward
function setupPuzzle() {
    // Clear existing blocks
    blocksPool.innerHTML = '';
    gameBlocks = [];
    
    // Randomly select target color
    targetColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Initialize grid to target color
    initializeGrid(targetColor);
    
    // Get number of blocks from URL parameter
    const numBlocks = getNumberOfBlocks();
    
    // Randomly select blocks from the 6 patterns
    const shuffled = [...blockPatterns].sort(() => Math.random() - 0.5);
    selectedBlocks = shuffled.slice(0, numBlocks);
    
    // Randomly place them on the grid (shifting backward) and store solution positions
    solutionPositions = [];
    for (const blockPattern of selectedBlocks) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 50) {
            const startRow = Math.floor(Math.random() * 4);
            const startCol = Math.floor(Math.random() * 4);
            
            if (canPlaceBlock(blockPattern, startRow, startCol)) {
                applyBlockToGrid(blockPattern, startRow, startCol, false); // backward
                // Store solution position (where to place this block to solve)
                solutionPositions.push({
                    pattern: blockPattern,
                    anchorRow: startRow,
                    anchorCol: startCol
                });
                placed = true;
            }
            attempts++;
        }
    }
    
    // Sort solution positions from left to right (by column, then by row)
    solutionPositions.sort((a, b) => {
        if (a.anchorCol !== b.anchorCol) {
            return a.anchorCol - b.anchorCol;
        }
        return a.anchorRow - b.anchorRow;
    });
    
    // Store initial state for reset
    initialGridState = gridState.map(row => [...row]);
    
    // Clear move history and disable undo button
    moveHistory = [];
    undoButton.disabled = true;
    
    // Create draggable blocks for the player (same 4 blocks, but for forward shifting)
    gameBlocks = selectedBlocks.map(pattern => {
        const blockElement = createBlockElement(pattern, true);
        blocksPool.appendChild(blockElement);
        return { pattern, element: blockElement };
    });
    
    updateGridDisplay();
}

// Undo last move
function undoMove() {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory.pop();
    
    // Restore previous grid state
    gridState = lastMove.previousState.map(row => [...row]);
    updateGridDisplay();
    
    // Re-enable the block that was placed
    const blockElement = lastMove.blockElement;
    blockElement.style.opacity = '1';
    blockElement.classList.remove('placed');
    blockElement.draggable = true;
    blockElement.addEventListener('dragstart', handleDragStart);
    blockElement.addEventListener('dragend', handleDragEnd);
    blockElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    // Disable undo button if no more moves
    if (moveHistory.length === 0) {
        undoButton.disabled = true;
    }
}

// Reset game to initial state
function resetGame(fadeOutButtons = false) {
    // Ensure fadeOutButtons is explicitly false if not provided
    if (fadeOutButtons === undefined) {
        fadeOutButtons = false;
    }
    
    // Set resetting flag to prevent win checks
    isResetting = true;
    
    // Reset gave up flag (unless we're resetting from giveUp function)
    if (!isAnimating) {
        gaveUp = false;
    }
    
    // Stop any ongoing animation
    isAnimating = false;
    
    // Restore initial grid state
    gridState = initialGridState.map(row => [...row]);
    // Update display without triggering win check
    const cells = grid.querySelectorAll('.grid-cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const color = gridState[row][col];
        cell.className = `grid-cell color-${color}`;
    });
    
    // Reset all blocks - set opacity to 100% and restore draggability
    document.querySelectorAll('.block').forEach(blockElement => {
        blockElement.style.opacity = '1';
        blockElement.classList.remove('placed');
        blockElement.classList.remove('dragging');
        blockElement.draggable = true;
        // Re-add event listeners if they were removed
        blockElement.addEventListener('dragstart', handleDragStart);
        blockElement.addEventListener('dragend', handleDragEnd);
        blockElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    });
    
    // Clear any touch state
    touchStartBlock = null;
    
    // Clear move history and disable undo button
    moveHistory = [];
    undoButton.disabled = true;
    
    // Only fade out buttons if explicitly requested (from giveUp)
    if (fadeOutButtons) {
        // Disable all three buttons
        if (undoButton) {
            undoButton.disabled = true;
        }
        if (resetButton) {
            resetButton.disabled = true;
        }
        if (hintButton) {
            hintButton.disabled = true;
        }
        
        // Fade out button container
        fadeOutButtonContainer();
    } else {
        // Normal reset - restore buttons immediately
        // Reset hint button state (but keep hintPressCount if hint was already used)
        if (hintButton) {
            if (hintPressCount >= 2) {
                // If hint was fully used (2 presses), keep it disabled
                hintButton.disabled = true;
                hintButton.style.opacity = '0.6';
            } else {
                hintButton.disabled = false;
                hintButton.style.opacity = '1';
            }
        }
        
        // Restore button container visibility immediately (no transition)
        restoreButtons();
        
        // CRITICAL: Always enable reset button - it should NEVER be disabled during normal reset
        if (resetButton) {
            resetButton.disabled = false;
        }
    }
    
    // Reset instruction text only if hint hasn't been used
    const instructionText = document.querySelector('.instruction-text');
    const starsDisplay = document.getElementById('starsDisplay');
    if (instructionText && starsDisplay) {
        if (hintPressCount === 0) {
            instructionText.textContent = 'drag blocks to shift colors';
            instructionText.style.display = 'block';
            starsDisplay.style.display = 'none';
        } else if (hintPressCount >= 1) {
            // Keep the color hint text if hint was used
            const colorName = targetColor === 'light' ? 'light blue' : 
                            targetColor === 'medium' ? 'middle blue' : 'dark blue';
            instructionText.textContent = `the final color is ${colorName}`;
            instructionText.style.display = 'block';
            starsDisplay.style.display = 'none';
        }
    }
    
    // Clear resetting flag immediately after reset operations complete
    isResetting = false;
}

// Give up and show solution animation
function giveUp() {
    // Mark that user gave up
    gaveUp = true;
    
    // First reset the game (with fade out buttons)
    resetGame(true);
    
    // Disable give up button during animation
    giveUpButton.disabled = true;
    isAnimating = true;
    
    // Animate placing blocks one by one from left to right
    let animationIndex = 0;
    
    function animateNextBlock() {
        if (!isAnimating || animationIndex >= solutionPositions.length) {
            isAnimating = false;
            giveUpButton.disabled = false;
            
            // Show stars with all grey (0 stars)
            const instructionText = document.querySelector('.instruction-text');
            const starsDisplay = document.getElementById('starsDisplay');
            if (instructionText && starsDisplay) {
                instructionText.style.display = 'none';
                starsDisplay.style.display = 'flex';
                
                const starElements = starsDisplay.querySelectorAll('.shift-star');
                starElements.forEach(star => {
                    star.classList.add('grey');
                });
            }
            
            return;
        }
        
        const solution = solutionPositions[animationIndex];
        const { pattern, anchorRow, anchorCol } = solution;
        
        // Find the corresponding block element
        const blockElement = Array.from(blocksPool.children).find(block => 
            block.dataset.type === pattern.type && !block.classList.contains('placed')
        );
        
        if (blockElement && canPlaceBlock(pattern, anchorRow, anchorCol)) {
            // Save state before move
            const previousState = gridState.map(row => [...row]);
            
            // Apply block (forward shift)
            applyBlockToGrid(pattern, anchorRow, anchorCol, true);
            updateGridDisplay();
            
            // Highlight the cells that were affected
            highlightCells(pattern, anchorRow, anchorCol);
            
            // Mark block as placed
            blockElement.style.opacity = '0.5';
            blockElement.classList.add('placed');
            blockElement.draggable = false;
            blockElement.removeEventListener('dragstart', handleDragStart);
            blockElement.removeEventListener('dragend', handleDragEnd);
            
            // Add to move history
            moveHistory.push({
                previousState: previousState,
                blockElement: blockElement
            });
            
            undoButton.disabled = false;
            
            // Clear highlight after a delay
            setTimeout(() => {
                clearHighlights();
            }, 800);
        }
        
        animationIndex++;
        
        // Continue animation with longer delay
        setTimeout(animateNextBlock, 1200); // 1200ms delay between blocks
    }
    
    // Start animation
    setTimeout(animateNextBlock, 300); // Small delay after reset
}

// Create grid cells
function createGrid() {
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.index = i;
        
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('drop', handleDrop);
        cell.addEventListener('dragleave', handleDragLeave);
        
        // Add touch support for mobile
        cell.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        grid.appendChild(cell);
    }
}

// Touch handlers for mobile
let touchStartBlock = null;
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't allow dragging if block is already placed
    if (this.classList.contains('placed')) return;
    
    touchStartBlock = this;
    this.classList.add('dragging');
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    // Add touchmove and touchend to document to track movement
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEndDocument, { passive: false });
}

// Touch move handler for mobile
function handleTouchMove(e) {
    if (!touchStartBlock) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const elementFromPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find if we're over a grid cell
    const gridCell = elementFromPoint?.closest('.grid-cell');
    if (gridCell) {
        clearHighlights();
        const cellIndex = parseInt(gridCell.dataset.index);
        const startRow = Math.floor(cellIndex / 4);
        const startCol = cellIndex % 4;
        
        const blockType = touchStartBlock.dataset.type;
        const pattern = blockPatterns.find(p => p.type === blockType);
        
        if (pattern && canPlaceBlock(pattern, startRow, startCol)) {
            highlightCells(pattern, startRow, startCol);
        }
    } else {
        clearHighlights();
    }
}

// Touch end handler for document (when dragging)
function handleTouchEndDocument(e) {
    if (!touchStartBlock) return;
    
    e.preventDefault();
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEndDocument);
    
    const touch = e.changedTouches[0];
    const elementFromPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find if we're over a grid cell
    const gridCell = elementFromPoint?.closest('.grid-cell');
    
    if (gridCell) {
        const cellIndex = parseInt(gridCell.dataset.index);
        const startRow = Math.floor(cellIndex / 4);
        const startCol = cellIndex % 4;
        
        // Find the pattern for this block
        const blockType = touchStartBlock.dataset.type;
        const pattern = blockPatterns.find(p => p.type === blockType);
        
        if (pattern && canPlaceBlock(pattern, startRow, startCol)) {
            // Save state before move
            const previousState = gridState.map(row => [...row]);
            
            // Apply block (forward shift)
            applyBlockToGrid(pattern, startRow, startCol, true);
            updateGridDisplay();
            
            // Mark block as placed - set opacity to 50%
            touchStartBlock.style.opacity = '0.5';
            touchStartBlock.classList.add('placed');
            touchStartBlock.classList.remove('dragging');
            touchStartBlock.draggable = false;
            touchStartBlock.removeEventListener('dragstart', handleDragStart);
            touchStartBlock.removeEventListener('dragend', handleDragEnd);
            touchStartBlock.removeEventListener('touchstart', handleTouchStart);
            
            // Add to move history
            moveHistory.push({
                previousState: previousState,
                blockElement: touchStartBlock
            });
            
            // Enable undo button
            undoButton.disabled = false;
            
            // Check win condition
            checkWin();
        } else {
            // If placement failed, remove dragging class
            touchStartBlock.classList.remove('dragging');
        }
    } else {
        // If not dropped on a cell, just remove dragging class
        touchStartBlock.classList.remove('dragging');
    }
    
    clearHighlights();
    touchStartBlock = null;
}

// Touch end handler for grid cells (for tap-to-place)
function handleTouchEnd(e) {
    e.preventDefault();
    
    if (!touchStartBlock) return;
    
    const cellIndex = parseInt(this.dataset.index);
    const startRow = Math.floor(cellIndex / 4);
    const startCol = cellIndex % 4;
    
    // Find the pattern for this block
    const blockType = touchStartBlock.dataset.type;
    const pattern = blockPatterns.find(p => p.type === blockType);
    
    if (pattern && canPlaceBlock(pattern, startRow, startCol)) {
        // Save state before move
        const previousState = gridState.map(row => [...row]);
        
        // Apply block (forward shift)
        applyBlockToGrid(pattern, startRow, startCol, true);
        updateGridDisplay();
        
        // Mark block as placed - set opacity to 50%
        touchStartBlock.style.opacity = '0.5';
        touchStartBlock.classList.add('placed');
        touchStartBlock.classList.remove('dragging');
        touchStartBlock.draggable = false;
        touchStartBlock.removeEventListener('dragstart', handleDragStart);
        touchStartBlock.removeEventListener('dragend', handleDragEnd);
        touchStartBlock.removeEventListener('touchstart', handleTouchStart);
        
        // Add to move history
        moveHistory.push({
            previousState: previousState,
            blockElement: touchStartBlock
        });
        
        // Enable undo button
        undoButton.disabled = false;
        
        // Check win condition
        checkWin();
    } else {
        // If placement failed, remove dragging class
        touchStartBlock.classList.remove('dragging');
    }
    
    clearHighlights();
    touchStartBlock = null;
}

// Drag and drop handlers
function handleDragStart(e) {
    draggedBlock = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedBlock = null;
    clearHighlights();
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedBlock) return;
    
    const cellIndex = parseInt(this.dataset.index);
    const startRow = Math.floor(cellIndex / 4);
    const startCol = cellIndex % 4;
    
    // Find the pattern for this block
    const blockType = draggedBlock.dataset.type;
    const pattern = blockPatterns.find(p => p.type === blockType);
    
    if (pattern) {
        clearHighlights();
        if (canPlaceBlock(pattern, startRow, startCol)) {
            highlightCells(pattern, startRow, startCol);
        }
    }
}

function handleDragLeave(e) {
    clearHighlights();
}

function handleDrop(e) {
    e.preventDefault();
    clearHighlights();
    
    if (!draggedBlock) return;
    
    const cellIndex = parseInt(this.dataset.index);
    const startRow = Math.floor(cellIndex / 4);
    const startCol = cellIndex % 4;
    
    // Find the pattern for this block
    const blockType = draggedBlock.dataset.type;
    const pattern = blockPatterns.find(p => p.type === blockType);
    
    if (pattern && canPlaceBlock(pattern, startRow, startCol)) {
        // Save state before move for undo
        const previousState = gridState.map(row => [...row]);
        
        // Apply block (forward shift)
        applyBlockToGrid(pattern, startRow, startCol, true);
        updateGridDisplay();
        
        // Mark block as placed - set opacity to 50%
        draggedBlock.style.opacity = '0.5';
        draggedBlock.classList.add('placed');
        draggedBlock.draggable = false;
        draggedBlock.removeEventListener('dragstart', handleDragStart);
        draggedBlock.removeEventListener('dragend', handleDragEnd);
        
        // Add to move history
        moveHistory.push({
            previousState: previousState,
            blockElement: draggedBlock
        });
        
        // Enable undo button
        undoButton.disabled = false;
        
        // Check win condition
        checkWin();
    }
}

// Highlight cells that will be affected by a block placement using anchor point
function highlightCells(pattern, anchorRow, anchorCol) {
    const shape = pattern.shape;
    const anchorRowOffset = pattern.anchorRow;
    const anchorColOffset = pattern.anchorCol;
    const cells = grid.querySelectorAll('.grid-cell');
    
    // Calculate the top-left position based on anchor
    const topLeftRow = anchorRow - anchorRowOffset;
    const topLeftCol = anchorCol - anchorColOffset;
    
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
                const gridRow = topLeftRow + r;
                const gridCol = topLeftCol + c;
                if (gridRow >= 0 && gridRow < 4 && gridCol >= 0 && gridCol < 4) {
                    const cellIndex = gridRow * 4 + gridCol;
                    cells[cellIndex].classList.add('highlight');
                }
            }
        }
    }
}

// Clear all highlights
function clearHighlights() {
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('highlight');
    });
}

// Check if all cells are the same color (target color) and all blocks are used
function checkWin() {
    // Don't check for win if we're resetting
    if (isResetting) {
        return;
    }
    
    // Don't check for win if buttons are already faded out (game already won)
    if (buttonsFadedOut) {
        return;
    }
    
    const allSame = gridState.every(row => row.every(cell => cell === targetColor));
    
    // Check if all blocks are placed
    const allBlocksPlaced = document.querySelectorAll('.block.placed').length === gameBlocks.length;
    
    if (allSame && allBlocksPlaced) {
        // Start win animation sequence
        animateWin();
    }
}

function fadeOutButtonContainer() {
    buttonsFadedOut = true;
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
        buttonContainer.style.opacity = '0';
        buttonContainer.style.transition = 'opacity 0.5s ease-out';
    }
}

function restoreButtons() {
    buttonsFadedOut = false;
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
        buttonContainer.style.transition = 'none';
        buttonContainer.style.opacity = '1';
        // Force immediate update
        void buttonContainer.offsetHeight;
    }
}

function animateWin() {
    // Don't animate win if we're resetting
    if (isResetting) {
        return;
    }
    
    buttonsFadedOut = true;
    
    // Fade out blocks pool
    const blocksPool = document.getElementById('blocksPool');
    if (blocksPool) {
        blocksPool.style.opacity = '0';
        blocksPool.style.transition = 'opacity 0.5s ease-out';
    }
    
    // Fade out buttons
    fadeOutButtonContainer();
    
    // Hide give up button
    if (giveUpButton) {
        giveUpButton.style.opacity = '0';
        giveUpButton.style.pointerEvents = 'none';
    }
    
    // Disable the three buttons
    if (undoButton) {
        undoButton.disabled = true;
    }
    if (resetButton) {
        resetButton.disabled = true;
    }
    if (hintButton) {
        hintButton.disabled = true;
    }
    
    // Animate grid cells with staggered delays
    const cells = grid.querySelectorAll('.grid-cell');
    cells.forEach((cell, index) => {
        cell.style.animationDelay = `${index * 0.08}s`;
        cell.classList.add('win-celebration');
    });
    
    // Notify parent immediately when you win (haptic, sound, rain start right away)
    let stars = 0;
    if (gaveUp) {
        stars = 0;
    } else if (hintPressCount === 0) {
        stars = 5;
    } else if (hintPressCount === 1) {
        stars = 4;
    } else if (hintPressCount >= 2) {
        stars = 3;
    }
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'puzzleComplete',
            gameId: 'shift',
            stars: stars,
            notes: ['Hint used: ' + hintPressCount],
            delay: 1
        }, '*');
    }
    
    // After animations, save and show stars
    setTimeout(() => {
        const todayKey = getTodayKey();
        savedFinalColor = targetColor;
        localStorage.setItem(`shiftComplete_${todayKey}`, 'true');
        
        // Display stars in instruction area
        const instructionText = document.querySelector('.instruction-text');
        const starsDisplay = document.getElementById('starsDisplay');
        if (instructionText && starsDisplay) {
            instructionText.style.display = 'none';
            starsDisplay.style.display = 'flex';
            
            const starElements = starsDisplay.querySelectorAll('.shift-star');
            starElements.forEach((star, index) => {
                if (index < stars) {
                    star.classList.remove('grey');
                } else {
                    star.classList.add('grey');
                }
            });
        }
    }, 1000); // Wait for animations to complete
}

// Handle hint button
function handleHint() {
    // Save current hint press count before reset
    const savedHintPressCount = hintPressCount;
    
    // First reset the puzzle
    resetGame();
    
    // Restore hint press count and increment
    hintPressCount = savedHintPressCount + 1;
    
    if (hintPressCount === 1) {
        // First press: Show target color
        const instructionText = document.querySelector('.instruction-text');
        const starsDisplay = document.getElementById('starsDisplay');
        if (instructionText && starsDisplay) {
            const colorName = targetColor === 'light' ? 'light blue' : 
                            targetColor === 'medium' ? 'middle blue' : 'dark blue';
            instructionText.textContent = `the final color is ${colorName}`;
            instructionText.style.display = 'block';
            starsDisplay.style.display = 'none';
        }
    } else if (hintPressCount === 2) {
        // Second press: Place first block
        if (solutionPositions.length > 0) {
            const firstSolution = solutionPositions[0];
            const { pattern, anchorRow, anchorCol } = firstSolution;
            
            // Find the corresponding block element (furthest left, first in blocksPool)
            const blockElement = Array.from(blocksPool.children).find(block => 
                block.dataset.type === pattern.type && !block.classList.contains('placed')
            );
            
            if (blockElement && canPlaceBlock(pattern, anchorRow, anchorCol)) {
                // Save state before move
                const previousState = gridState.map(row => [...row]);
                
                // Apply block (forward shift)
                applyBlockToGrid(pattern, anchorRow, anchorCol, true);
                updateGridDisplay();
                
                // Highlight the cells that were affected
                highlightCells(pattern, anchorRow, anchorCol);
                
                // Mark block as placed
                blockElement.style.opacity = '0.5';
                blockElement.classList.add('placed');
                blockElement.draggable = false;
                blockElement.removeEventListener('dragstart', handleDragStart);
                blockElement.removeEventListener('dragend', handleDragEnd);
                
                // Add to move history
                moveHistory.push({
                    previousState: previousState,
                    blockElement: blockElement
                });
                
                undoButton.disabled = false;
                
                // Clear highlight after a delay
                setTimeout(() => {
                    clearHighlights();
                }, 800);
            }
        }
        
        // Disable hint button
        hintButton.disabled = true;
        hintButton.style.opacity = '0.6';
    }
}

// Initialize game
function startGame() {
    // If game already started, just hide start menu
    if (gameStarted) {
        const startMenu = document.getElementById('startMenu');
        const container = document.querySelector('.container');
        if (startMenu) {
            startMenu.style.display = 'none';
        }
        if (container) {
            container.style.display = 'block';
        }
        return;
    }
    
    // Check if game was already completed
    const todayKey = getTodayKey();
    const isComplete = localStorage.getItem(`shiftComplete_${todayKey}`) === 'true';
    
    if (isComplete) {
        // Hide start menu and show container first
        const startMenu = document.getElementById('startMenu');
        const container = document.querySelector('.container');
        if (startMenu) {
            startMenu.style.display = 'none';
        }
        if (container) {
            container.style.display = 'block';
        }
        
        // Restore completed state
        const savedColor = null;
        const savedStars = parseInt(localStorage.getItem(`shiftStars_${todayKey}`) || '0');
        
        if (savedColor) {
            savedFinalColor = savedColor;
            createGrid();
            
            // Initialize gridState structure
            gridState = [];
            for (let row = 0; row < 4; row++) {
                gridState[row] = [];
                for (let col = 0; col < 4; col++) {
                    gridState[row][col] = savedColor;
                }
            }
            updateGridDisplay();
            
            // Hide buttons and blocks (opacity 0, no fade)
            const buttonContainer = document.querySelector('.button-container');
            const blocksPool = document.getElementById('blocksPool');
            if (buttonContainer) {
                buttonContainer.style.opacity = '0';
                buttonContainer.style.transition = 'none';
            }
            if (blocksPool) {
                blocksPool.style.opacity = '0';
                blocksPool.style.transition = 'none';
            }
            
            // Show stars
            const instructionText = document.querySelector('.instruction-text');
            const starsDisplay = document.getElementById('starsDisplay');
            if (instructionText && starsDisplay) {
                instructionText.style.display = 'none';
                starsDisplay.style.display = 'flex';
                
                const starElements = starsDisplay.querySelectorAll('.shift-star');
                starElements.forEach((star, index) => {
                    if (index < savedStars) {
                        star.classList.remove('grey');
                    } else {
                        star.classList.add('grey');
                    }
                });
            }
            
            gameStarted = true;
            buttonsFadedOut = true;
            return;
        }
    }
    
    createGrid();
    setupPuzzle();
    
    // Reset hint state and gave up flag
    hintPressCount = 0;
    gaveUp = false;
    if (hintButton) {
        hintButton.disabled = false;
        hintButton.style.opacity = '1';
    }
    
    // Show give up button
    if (giveUpButton) {
        giveUpButton.style.opacity = '1';
        giveUpButton.style.pointerEvents = 'auto';
    }
    
    // Reset instruction text
    const instructionText = document.querySelector('.instruction-text');
    const starsDisplay = document.getElementById('starsDisplay');
    if (instructionText && starsDisplay) {
        instructionText.textContent = 'drag blocks to shift colors';
        instructionText.style.display = 'block';
        starsDisplay.style.display = 'none';
    }

    // Hide start menu and show game
    const startMenu = document.getElementById('startMenu');
    const container = document.querySelector('.container');
    if (startMenu) {
        startMenu.style.display = 'none';
    }
    if (container) {
        container.style.display = 'block';
    }
    
    gameStarted = true;
}

// Trigger win animation (for testing with 't' key)
function triggerWinAnimation() {
    const cells = grid.querySelectorAll('.grid-cell');
    cells.forEach((cell, index) => {
        cell.style.animationDelay = `${index * 0.08}s`;
        cell.classList.add('win-celebration');
    });
    
    // Remove class after animation completes so it can be triggered again
    setTimeout(() => {
        cells.forEach(cell => {
            cell.classList.remove('win-celebration');
        });
    }, 2000);
}

// Setup event listeners once
document.addEventListener('DOMContentLoaded', () => {
    // Check if game was already completed and show completed state
    const todayKey = getTodayKey();
    const isComplete = localStorage.getItem(`shiftComplete_${todayKey}`) === 'true';
    
    if (isComplete) {
        // Hide start menu immediately
        const startMenu = document.getElementById('startMenu');
        if (startMenu) {
            startMenu.style.display = 'none';
        }
        // Automatically show completed state
        startGame();
    } else {
        const playButton = document.getElementById('playButton');
        if (playButton) {
            let _shiftClick = (function() { try { const a = new Audio(new URL('../../sounds/click.mp3', window.location.href).href); a.preload = 'auto'; a.load(); return a; } catch (e) { return null; } })();
            const playShiftClick = () => { try { if (_shiftClick) { _shiftClick.currentTime = 0; _shiftClick.play().catch(() => {}); } } catch (e) {} };
            playButton.addEventListener('click', () => {
                playShiftClick();
                // Notify parent that Shift has started (for quit warning logic)
                if (window.parent) {
                    window.parent.postMessage('puzzleStarted:shift', '*');
                }
                startGame();
            });
        }
    }
    
    // Button handlers - set up once
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            resetGame(false);
        });
    }
    if (undoButton) {
        undoButton.addEventListener('click', undoMove);
        undoButton.disabled = true; // Disable initially since no moves yet
    }
    if (giveUpButton) {
        giveUpButton.addEventListener('click', giveUp);
    }
    if (hintButton) {
        hintButton.addEventListener('click', handleHint);
    }
    
    // Help button handler - show start menu
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            const startMenu = document.getElementById('startMenu');
            const container = document.querySelector('.container');
            if (startMenu) {
                startMenu.style.display = 'flex';
            }
            if (container) {
                container.style.display = 'none';
            }
        });
    }
    
    // Keyboard shortcut: 't' key to trigger win animation
    document.addEventListener('keydown', (e) => {
        if (e.key === 't' || e.key === 'T') {
            triggerWinAnimation();
        }
        // Keyboard shortcut: 'q' key to reset saved data
        if (e.key === 'q' || e.key === 'Q') {
            // Call the global reset function if available, otherwise use local implementation
            if (window.parent && window.parent.resetAllData) {
                window.parent.resetAllData();
            } else if (window.resetAllData) {
                window.resetAllData();
            } else {
                // Fallback: Clear shift data only
                const todayKey = getTodayKey();
                localStorage.removeItem(`shiftStars_${todayKey}`);
                localStorage.removeItem(`shiftComplete_${todayKey}`);
                // Reload the page to show start menu
                location.reload();
            }
        }
    });
});


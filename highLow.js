// Game state
let hlGameData = [
    { name: 'Meryl Streep', value: 3 },
    { name: 'Denzel Washington', value: 2 },
    { name: 'Jennifer Lawrence', value: 1 },
    { name: 'Glenn Close', value: 0 }
];
let hlItems = [];
let hlIsDragging = false;
let hlDraggedItem = null;
let hlDragOffset = { x: 0, y: 0 };
let hlAnimationFrame = null;
let hlContainer = null;
let hlGameWon = false;

// Local storage helper functions
function hlGetTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function isHighLowComplete() {
    const todayKey = hlGetTodayKey();
    return localStorage.getItem(`highLowComplete_${todayKey}`) === 'true';
}

function markHighLowComplete() {
    const todayKey = hlGetTodayKey();
    localStorage.setItem(`highLowComplete_${todayKey}`, 'true');
}

function hlGetDailyStars() {
    const todayKey = hlGetTodayKey();
    return parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
}

function hlAddStars(count) {
    const todayKey = hlGetTodayKey();
    const currentDailyStars = hlGetDailyStars();
    const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
    
    //console.log('[HighLow] Adding stars:', count);
    //console.log('[HighLow] Current daily stars:', currentDailyStars);
    //console.log('[HighLow] Current total stars:', currentTotalStars);
    
    // Update daily stars
    localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + count));
    
    // Update total stars
    localStorage.setItem('totalStars', String(currentTotalStars + count));
    
    // Add move stars (same amount as regular stars)
    const currentMoveStars = parseInt(localStorage.getItem(`moveStars_${todayKey}`) || '0');
    //console.log('[HighLow] Current move stars:', currentMoveStars);
    localStorage.setItem(`moveStars_${todayKey}`, String(currentMoveStars + count));
    //console.log('[HighLow] New move stars:', currentMoveStars + count);
    
    hlUpdateStarDisplay();
    hlUpdateCalendar();
    
    // Update wallet and rival displays if functions exist
    if (window.updateWalletStars) {
        window.updateWalletStars();
    }
    if (window.updateRivalStars) {
        window.updateRivalStars();
    }
}

function hlUpdateStarDisplay() {
    const stars = parseInt(localStorage.getItem('totalStars') || '0');
    const starCountElement = document.querySelector('.star-count');
    if (starCountElement) {
        starCountElement.textContent = `x ${stars}`;
    }
}

function hlUpdateCalendar() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekBoxes = document.querySelectorAll('.week-box');
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    
    weekBoxes.forEach((box, index) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + index);
        
        const dayKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
        const dayNumberElement = box.querySelector('.day-number');
        
        if (index < dayOfWeek) {
            const stars = localStorage.getItem(`dailyStars_${dayKey}`);
            dayNumberElement.innerHTML = '<span style="color: #FF8C42; font-size: 14px; transform: translateY(-1px); display: inline-block;">★</span><span style="font-size: 15px;">' + (stars || '0') + '</span>';
        } else if (index === dayOfWeek) {
            const stars = hlGetDailyStars();
            dayNumberElement.innerHTML = '<span style="color: #FF8C42; font-size: 14px; transform: translateY(-1px); display: inline-block;">★</span><span style="font-size: 15px;">' + stars + '</span>';
        } else {
            dayNumberElement.innerHTML = '&nbsp;';
        }
    });
}

// Item class for position management
class HighLowItem {
    constructor(data, index, element) {
        this.name = data.name;
        this.value = data.value;
        this.index = index;
        this.targetY = 0;
        this.currentY = 0;
        this.element = element;
        this.isDragging = false;
    }
    
    updateTargetPosition() {
        const itemHeight = this.element.offsetHeight;
        const gap = 8; // Gap between items
        
        this.targetY = this.index * (itemHeight + gap);
    }
    
    lerp(current, target, factor = 0.15) {
        return current + (target - current) * factor;
    }
    
    update() {
        if (!this.isDragging) {
            this.currentY = this.lerp(this.currentY, this.targetY);
            this.element.style.top = `${this.currentY}px`;
        }
    }
    
    setPosition(y) {
        this.currentY = y;
        this.targetY = y;
        this.element.style.top = `${y}px`;
    }
}

// Initialize high-low game
function initializeHighLow() {
    hlContainer = document.querySelector('.highlow-items');
    
    if (!hlContainer) {
        //console.error('High-low container not found');
        return;
    }
    
    // Check if highlow is already complete
    const todayKey = hlGetTodayKey();
    
    // List relevant localStorage items (stars, completion, game data)
    //console.log('[HighLow] === GAME LOCALSTORAGE DATA ===');
    const relevantKeys = ['totalStars', 'dailyStars', 'moveStars', 'highLowComplete', 'highLowStars', 'highLowWrongCount', 
                          'scrambleComplete', 'memoryComplete', 'blackjackComplete', 'lostAndFoundComplete',
                          'mysteryWordComplete', 'beticleComplete'];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Only show keys that match our game data patterns
        if (relevantKeys.some(pattern => key.includes(pattern))) {
            const value = localStorage.getItem(key);
            //console.log(`[HighLow] ${key}: ${value}`);
        }
    }
    //console.log('[HighLow] === END GAME DATA ===');
    
    const completeStatus = localStorage.getItem(`highLowComplete_${todayKey}`);
    //console.log('[HighLow] Today key:', todayKey);
    //console.log('[HighLow] Complete status:', completeStatus);
    //console.log('[HighLow] Looking for key: highLowComplete_' + todayKey);
    
    if (isHighLowComplete()) {
        //console.log('[HighLow] Game is complete, showing completed state');
        hlGameWon = true;
        showCompletedHighLow();
        return;
    }
    
    //console.log('[HighLow] Game not complete, initializing fresh game');
    
    // Shuffle the data
    const shuffledData = [...hlGameData].sort(() => Math.random() - 0.5);
    
    // Clear and create items
    hlContainer.innerHTML = '';
    hlItems = [];
    
    shuffledData.forEach((data, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'highlow-item';
        itemDiv.textContent = data.name;
        itemDiv.dataset.value = data.value;
        
        // Apply gradient colors from top to bottom
        const gradientColors = [
            'linear-gradient(to bottom, #E85D9A, #D6488A)',
            'linear-gradient(to bottom, #9B59D0, #8747C0)',
            'linear-gradient(to bottom, #5B8ED8, #4A7DC8)',
            'linear-gradient(to bottom, #4EAED8, #3D9DC8)'
        ];
        itemDiv.style.background = gradientColors[index % gradientColors.length];
        
        itemDiv.style.position = 'absolute';
        itemDiv.style.left = '0';
        itemDiv.style.width = '100%';
        itemDiv.style.cursor = 'grab';
        
        // Create item object
        const item = new HighLowItem(data, index, itemDiv);
        hlItems.push(item);
        
        // Add drag event listeners
        itemDiv.addEventListener('mousedown', hlStartDrag);
        itemDiv.addEventListener('touchstart', hlStartDrag, { passive: false });
        
        // Add hover animations
        itemDiv.addEventListener('mouseenter', () => {
            if (!hlIsDragging && !hlGameWon) {
                gsap.to(itemDiv, { 
                    duration: 0.2, 
                    scale: 1.02,
                    ease: 'power2.out' 
                });
            }
        });
        
        itemDiv.addEventListener('mouseleave', () => {
            if (!hlIsDragging && !hlGameWon) {
                gsap.to(itemDiv, { 
                    duration: 0.2, 
                    scale: 1, 
                    ease: 'power2.out' 
                });
            }
        });
        
        hlContainer.appendChild(itemDiv);
    });
    
    // Calculate container height
    const itemHeight = 50; // Height of each item
    const gap = 8;
    const totalHeight = hlItems.length * itemHeight + (hlItems.length - 1) * gap;
    hlContainer.style.height = `${totalHeight}px`;
    
    // Initial positioning
    setTimeout(() => {
        hlItems.forEach(item => {
            item.updateTargetPosition();
            item.setPosition(item.targetY);
        });
        hlStartAnimationLoop();
    }, 10);
}

// Animation loop
function hlStartAnimationLoop() {
    function animate() {
        hlItems.forEach(item => item.update());
        hlAnimationFrame = requestAnimationFrame(animate);
    }
    animate();
}

// Drag system
function hlStartDrag(e) {
    if (hlGameWon) return; // Don't allow dragging after game is won
    
    e.preventDefault();
    
    const element = e.currentTarget;
    hlDraggedItem = hlItems.find(item => item.element === element);
    
    if (!hlDraggedItem) return;
    
    hlDraggedItem.isDragging = true;
    hlIsDragging = true;
    
    // Get initial mouse/touch position
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Calculate offset from element center
    const rect = element.getBoundingClientRect();
    hlDragOffset.x = clientX - rect.left - rect.width / 2;
    hlDragOffset.y = clientY - rect.top - rect.height / 2;
    
    // Add dragging class and GSAP animation
    element.classList.add('dragging');
    element.style.cursor = 'grabbing';
    gsap.to(element, {
        duration: 0.2,
        scale: 1.05,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
        ease: 'power2.out',
        zIndex: 1000
    });
    
    // Add event listeners for drag movement
    document.addEventListener('mousemove', hlHandleDragMove);
    document.addEventListener('mouseup', hlEndDrag);
    document.addEventListener('touchmove', hlHandleDragMove, { passive: false });
    document.addEventListener('touchend', hlEndDrag);
}

function hlHandleDragMove(e) {
    if (!hlIsDragging || !hlDraggedItem) return;
    
    e.preventDefault();
    
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const containerRect = hlContainer.getBoundingClientRect();
    
    // Update dragged item position
    const newY = clientY - containerRect.top - hlDragOffset.y - hlDraggedItem.element.offsetHeight / 2;
    hlDraggedItem.element.style.top = `${newY}px`;
    
    // Calculate which position this item should be in
    const itemHeight = hlDraggedItem.element.offsetHeight;
    const gap = 8;
    
    let newIndex = Math.round(newY / (itemHeight + gap));
    newIndex = Math.max(0, Math.min(hlItems.length - 1, newIndex));
    
    // Reorder items array if needed
    if (newIndex !== hlDraggedItem.index) {
        // Remove from current position
        hlItems.splice(hlDraggedItem.index, 1);
        // Insert at new position
        hlItems.splice(newIndex, 0, hlDraggedItem);
        
        // Update indices
        hlItems.forEach((item, index) => {
            item.index = index;
            item.updateTargetPosition();
        });
    }
}

function hlEndDrag(e) {
    if (!hlIsDragging || !hlDraggedItem) return;
    
    e.preventDefault();
    
    // Remove event listeners
    document.removeEventListener('mousemove', hlHandleDragMove);
    document.removeEventListener('mouseup', hlEndDrag);
    document.removeEventListener('touchmove', hlHandleDragMove);
    document.removeEventListener('touchend', hlEndDrag);
    
    // Update final position
    hlDraggedItem.updateTargetPosition();
    hlDraggedItem.setPosition(hlDraggedItem.targetY);
    hlDraggedItem.isDragging = false;
    
    // Clean up dragging state
    hlDraggedItem.element.classList.remove('dragging');
    hlDraggedItem.element.style.cursor = 'grab';
    
    // Animate back to normal state
    gsap.to(hlDraggedItem.element, {
        duration: 0.3,
        scale: 1,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        ease: 'power2.out',
        zIndex: 1
    });
    
    // Reset state
    hlIsDragging = false;
    hlDraggedItem = null;
}

// Check if order is correct
function hlCheckOrder() {
    if (hlGameWon) return;
    
    hlGameWon = true; // Prevent multiple submissions
    
    // Fade out button text and instruction
    const guessButton = document.querySelector('.highlow-guess-btn');
    const instruction = document.querySelector('.highlow-instruction');
    
    guessButton.style.pointerEvents = 'none'; // Make button unpressable
    
    gsap.to([guessButton, instruction], {
        duration: 0.3,
        opacity: 0,
        ease: 'power2.out'
    });
    
    // Disable dragging
    hlItems.forEach(item => {
        item.element.style.cursor = 'default';
    });
    
    // Count wrong answers
    let wrongCount = 0;
    const sortedByValue = [...hlItems].sort((a, b) => b.value - a.value);
    hlItems.forEach((item, index) => {
        const correctPosition = sortedByValue.findIndex(i => i.name === item.name) + 1;
        if ((index + 1) !== correctPosition) {
            wrongCount++;
        }
    });
    
    // Reveal answers with delay
    hlItems.forEach((item, index) => {
        setTimeout(() => {
            hlRevealAnswer(item, index + 1); // index + 1 is the position (1-4)
        }, index * 250); // 0.25s delay between each
    });
    
    // Show final result after all items are revealed
    setTimeout(() => {
        hlShowFinalResult(wrongCount);
    }, hlItems.length * 250 + 500);
}

// Reveal answer for a single item
function hlRevealAnswer(item, currentPosition) {
    // Calculate correct position (1-4, where 1 is highest value)
    const sortedByValue = [...hlItems].sort((a, b) => b.value - a.value);
    const correctPosition = sortedByValue.findIndex(i => i.name === item.name) + 1;
    const isCorrect = currentPosition === correctPosition;
    
    // Scale animation
    gsap.to(item.element, {
        duration: 0.2,
        scale: 1.08,
        ease: 'power2.out',
        onComplete: () => {
            gsap.to(item.element, {
                duration: 0.2,
                scale: 1,
                ease: 'power2.out'
            });
        }
    });
    
    // Create result display (order number on left shows CORRECT position)
    const orderSpan = document.createElement('span');
    orderSpan.className = 'highlow-order';
    orderSpan.style.color = isCorrect ? '#90EE90' : '#FFB8B8';
    orderSpan.style.fontWeight = '700';
    orderSpan.style.marginRight = '8px';
    orderSpan.style.opacity = '0';
    orderSpan.textContent = `${correctPosition}.`;
    
    // Create Oscar count display (on right)
    const oscarSpan = document.createElement('span');
    oscarSpan.className = 'highlow-oscars';
    oscarSpan.style.color = 'rgba(255, 255, 255, 0.8)';
    oscarSpan.style.fontSize = '13px';
    oscarSpan.style.marginLeft = '8px';
    oscarSpan.style.opacity = '0';
    oscarSpan.textContent = `(${item.value})`;
    
    // Clear element and rebuild with order, name, and oscars
    item.element.innerHTML = '';
    item.element.appendChild(orderSpan);
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = item.name;
    item.element.appendChild(nameSpan);
    item.element.appendChild(oscarSpan);
    
    // Fade in results
    setTimeout(() => {
        gsap.to([orderSpan, oscarSpan], {
            duration: 0.4,
            opacity: 1,
            ease: 'power2.out'
        });
    }, 200);
}

// Show final result message
function hlShowFinalResult(wrongCount) {
    const footer = document.querySelector('.highlow-footer');
    const hlContainer = document.querySelector('.highlow-container');
    const starsElement = document.querySelector('.highlow-stars');
    
    // Calculate earned stars based on correct answers: 4 right = 3 stars, 3 right = 2 stars, 2-1 right = 1 star, 0 right = 0 stars
    const correctCount = hlItems.length - wrongCount;
    let earnedStars = 0;
    if (correctCount === 4) earnedStars = 3;
    else if (correctCount === 3) earnedStars = 2;
    else if (correctCount === 2 || correctCount === 1) earnedStars = 1;
    else earnedStars = 0;
    
    // Only mark as complete if stars were earned
    //console.log('[HighLow] Earned stars:', earnedStars);
    //console.log('[HighLow] Correct count:', correctCount, 'Wrong count:', wrongCount);
    
    if (earnedStars > 0) {
        //console.log('[HighLow] Marking game as complete');
        markHighLowComplete();
        hlAddStars(earnedStars);
    } else {
        //console.log('[HighLow] Not marking complete (0 stars earned)');
    }
    
    // Save earned stars count and wrong count for this game
    const todayKey = hlGetTodayKey();
    localStorage.setItem(`highLowStars_${todayKey}`, String(earnedStars));
    localStorage.setItem(`highLowWrongCount_${todayKey}`, String(wrongCount));
    
    // Update star classes and colors
    const starSpans = starsElement.querySelectorAll('.star');
    starSpans.forEach((star, index) => {
        if (index < earnedStars) {
            star.classList.add('earned');
            star.classList.remove('unearned');
            star.style.color = '#FFB84D';
        } else {
            star.classList.add('unearned');
            star.classList.remove('earned');
            star.style.color = '#ccc';
        }
    });
    
    // Get current container height
    const currentHeight = hlContainer.offsetHeight;
    
    // Temporarily show stars to measure height
    starsElement.style.display = 'block';
    starsElement.style.opacity = '0';
    const starsHeight = starsElement.offsetHeight - 3; // -3px margin-top + 0px margin-bottom
    starsElement.style.display = 'none';
    
    // Create result message element
    const resultDiv = document.createElement('div');
    resultDiv.className = 'highlow-final-result';
    resultDiv.style.position = 'absolute';
    resultDiv.style.left = '0';
    resultDiv.style.right = '0';
    resultDiv.style.textAlign = 'center';
    resultDiv.style.fontSize = '16px';
    resultDiv.style.fontWeight = '700';
    resultDiv.style.fontFamily = "'Nunito', sans-serif";
    resultDiv.style.opacity = '0';
    
    resultDiv.textContent = `${correctCount} / ${hlItems.length}`;
    
    if (wrongCount === 0) {
        resultDiv.style.color = '#4CAF50';
    } else {
        resultDiv.style.color = '#F44336';
    }
    
    footer.appendChild(resultDiv);
    
    // Expand container and fade in result message and stars
    gsap.to(hlContainer, {
        duration: 0.5,
        height: currentHeight + starsHeight,
        ease: 'power2.inOut',
        onComplete: () => {
            // Show stars
            starsElement.style.display = 'block';
            starsElement.style.opacity = '0';
            gsap.to(starsElement, {
                duration: 0.5,
                opacity: 1,
                ease: 'power2.out'
            });
        }
    });
    
    // Fade in result message
    gsap.to(resultDiv, {
        duration: 0.5,
        opacity: 1,
        ease: 'power2.out'
    });
}


// Show completed high-low without animation
function showCompletedHighLow() {
    // Sort data by value (highest to lowest) for correct answer
    const sortedData = [...hlGameData].sort((a, b) => b.value - a.value);
    
    // Clear and create items
    hlContainer.innerHTML = '';
    hlItems = [];
    
    sortedData.forEach((data, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'highlow-item';
        itemDiv.dataset.value = data.value;
        
        // Apply gradient colors
        const gradientColors = [
            'linear-gradient(to bottom, #E85D9A, #D6488A)',
            'linear-gradient(to bottom, #9B59D0, #8747C0)',
            'linear-gradient(to bottom, #5B8ED8, #4A7DC8)',
            'linear-gradient(to bottom, #4EAED8, #3D9DC8)'
        ];
        itemDiv.style.background = gradientColors[index % gradientColors.length];
        itemDiv.style.position = 'absolute';
        itemDiv.style.left = '0';
        itemDiv.style.width = '100%';
        itemDiv.style.cursor = 'default';
        
        // Create order number (left)
        const orderSpan = document.createElement('span');
        orderSpan.className = 'highlow-order';
        orderSpan.style.color = '#90EE90';
        orderSpan.style.fontWeight = '700';
        orderSpan.style.marginRight = '8px';
        orderSpan.textContent = `${index + 1}.`;
        
        // Create name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = data.name;
        
        // Create Oscar count (right)
        const oscarSpan = document.createElement('span');
        oscarSpan.className = 'highlow-oscars';
        oscarSpan.style.color = 'rgba(255, 255, 255, 0.8)';
        oscarSpan.style.fontSize = '13px';
        oscarSpan.style.marginLeft = '8px';
        oscarSpan.textContent = `(${data.value})`;
        
        itemDiv.appendChild(orderSpan);
        itemDiv.appendChild(nameSpan);
        itemDiv.appendChild(oscarSpan);
        
        const item = new HighLowItem(data, index, itemDiv);
        hlItems.push(item);
        hlContainer.appendChild(itemDiv);
    });
    
    // Calculate container height
    const itemHeight = 50;
    const gap = 8;
    const totalHeight = hlItems.length * itemHeight + (hlItems.length - 1) * gap;
    hlContainer.style.height = `${totalHeight}px`;
    
    // Position items immediately
    setTimeout(() => {
        hlItems.forEach(item => {
            item.updateTargetPosition();
            item.setPosition(item.targetY);
        });
    }, 10);
    
    // Hide button and instruction immediately
    const guessButton = document.querySelector('.highlow-guess-btn');
    const instruction = document.querySelector('.highlow-instruction');
    const footer = document.querySelector('.highlow-footer');
    if (guessButton) guessButton.style.opacity = '0';
    if (instruction) instruction.style.opacity = '0';
    
    // Get saved earned stars and wrong count
    const todayKey = hlGetTodayKey();
    const wrongCount = parseInt(localStorage.getItem(`highLowWrongCount_${todayKey}`) || '0');
    
    // Recalculate stars based on correct count to ensure consistency
    const correctCount = sortedData.length - wrongCount;
    let earnedStars = 0;
    if (correctCount === 4) earnedStars = 3;
    else if (correctCount === 3) earnedStars = 2;
    else if (correctCount === 2 || correctCount === 1) earnedStars = 1;
    else earnedStars = 0;
    
    // Show result message
    const resultDiv = document.createElement('div');
    resultDiv.className = 'highlow-final-result';
    resultDiv.style.position = 'absolute';
    resultDiv.style.left = '0';
    resultDiv.style.right = '0';
    resultDiv.style.textAlign = 'center';
    resultDiv.style.fontSize = '16px';
    resultDiv.style.fontWeight = '700';
    resultDiv.style.fontFamily = "'Nunito', sans-serif";
    resultDiv.style.opacity = '1';
    
    resultDiv.textContent = `${correctCount} / ${sortedData.length}`;
    
    if (wrongCount === 0) {
        resultDiv.style.color = '#4CAF50';
    } else {
        resultDiv.style.color = '#F44336';
    }
    
    if (footer) {
        footer.appendChild(resultDiv);
    }
    
    // Show stars immediately
    const starsElement = document.querySelector('.highlow-stars');
    if (starsElement) {
        starsElement.style.display = 'block';
        starsElement.style.opacity = '1';
        
        // Set star classes and colors based on saved earned stars
        const starSpans = starsElement.querySelectorAll('.star');
        starSpans.forEach((star, index) => {
            if (index < earnedStars) {
                star.classList.add('earned');
                star.classList.remove('unearned');
                star.style.color = '#FFB84D';
            } else {
                star.classList.add('unearned');
                star.classList.remove('earned');
                star.style.color = '#ccc';
            }
        });
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeHighLow();
        
        // Check if game is completed and hide stars if not
        const todayKey = hlGetTodayKey();
        const isComplete = localStorage.getItem(`highLowComplete_${todayKey}`) === 'true';
        const starsElement = document.querySelector('.highlow-stars');
        
        if (!isComplete && starsElement) {
            starsElement.style.display = 'none';
        }
        
        // Add guess button listener
        const guessButton = document.querySelector('.highlow-guess-btn');
        if (guessButton) {
            guessButton.addEventListener('click', hlCheckOrder);
        }
    });
} else {
    initializeHighLow();
    
    // Check if game is completed and hide stars if not
    const todayKey = hlGetTodayKey();
    const isComplete = localStorage.getItem(`highLowComplete_${todayKey}`) === 'true';
    const starsElement = document.querySelector('.highlow-stars');
    
    if (!isComplete && starsElement) {
        starsElement.style.display = 'none';
    }
    
    // Add guess button listener
    const guessButton = document.querySelector('.highlow-guess-btn');
    if (guessButton) {
        guessButton.addEventListener('click', hlCheckOrder);
    }
}


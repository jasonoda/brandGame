// Bonus Spin Game

// Rearranged: 2 and 3 opposite, 8 and 10 opposite
// Position 0 opposite position 4, position 2 opposite position 6
// Positions: 0:2, 1:4, 2:8, 3:5, 4:3, 5:6, 6:10, 7:4
const wheelAmounts = [2, 4, 8, 5, 3, 6, 10, 4];
// All pie slices are black
const colors = [
    '#000000', // 0 - black
    '#000000', // 1 - black
    '#000000', // 2 - black
    '#000000', // 3 - black
    '#000000', // 4 - black
    '#000000', // 5 - black
    '#000000', // 6 - black
    '#000000'  // 7 - black
];

let canvas, ctx;
let wheelSpun = false;
let currentRotation = 0;
let isSpinning = false;

var spinLoopSound = null;
var reward2Sound = null;
if (typeof Howl !== 'undefined') {
    spinLoopSound = new Howl({ src: ['../../sounds/wheel_spinLoop.mp3'], loop: true });
    reward2Sound = new Howl({ src: ['../../sounds/reward2.mp3'] });
}

function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function loadSpinState() {
    const todayKey = getTodayKey();
    const spun = localStorage.getItem(`bonusSpinSpun_${todayKey}`) === 'true';
    const starsWon = parseInt(localStorage.getItem(`bonusSpinStars_${todayKey}`) || '0');
    return { spun, starsWon };
}

function saveSpinState(starsWon) {
    const todayKey = getTodayKey();
    // Ensure starsWon is a number and save it correctly
    const starsToSave = parseInt(starsWon) || 0;
    localStorage.setItem(`bonusSpinSpun_${todayKey}`, 'true');
    localStorage.setItem(`bonusSpinStars_${todayKey}`, String(starsToSave));
    console.log('[BonusSpin] Saved stars:', starsToSave, 'for key:', todayKey);
}

function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 10;
    const innerRadius = outerRadius - 15; // Inner segments are recessed
    const ringWidth = 15;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const anglePerSection = (2 * Math.PI) / wheelAmounts.length;
    
    // Draw inner circle (background for segments) - black background
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#000000';
    ctx.fill();
    
    // Draw wheel sections (recessed segments)
    wheelAmounts.forEach((amount, index) => {
        const startAngle = index * anglePerSection + currentRotation;
        const endAngle = (index + 1) * anglePerSection + currentRotation;
        const midAngle = startAngle + anglePerSection / 2;
        
        // Draw segment (no shadow, flat color for clean look)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, innerRadius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();
        
        // Draw dividing lines (dark grey)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(startAngle) * innerRadius,
            centerY + Math.sin(startAngle) * innerRadius
        );
        ctx.strokeStyle = '#404040'; // Dark grey
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw numbers - always white (closer to center)
        const textRadius = innerRadius * 0.55; // Moved closer to center (was 0.7)
        const textX = centerX + Math.cos(midAngle) * textRadius;
        const textY = centerY + Math.sin(midAngle) * textRadius;
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(midAngle + Math.PI / 2);
        
        // Draw orange star above number
        function drawStar(ctx, x, y, outerRadius, innerRadius, points) {
            ctx.beginPath();
            for (let i = 0; i < points * 2; i++) {
                const angle = (i * Math.PI) / points - Math.PI / 2;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const px = x + radius * Math.cos(angle);
                const py = y + radius * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
        }
        
        // Star color: yellow for 8 and 10, orange for others
        const starColor = (amount === 8 || amount === 10) ? '#FFD700' : '#FF8C42';
        ctx.fillStyle = starColor;
        drawStar(ctx, 0, -40, 10, 5, 5); // Star above number, 40px up (more space from number)
        
        ctx.fillStyle = '#FFFFFF'; // Always white
        ctx.font = 'bold 32px Nunito';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(amount.toString(), 0, 0);
        ctx.restore();
    });
    
    // Draw outer ring shadow (cast on pie wedges) - draw this after segments so shadow appears on them
    ctx.save();
    ctx.shadowColor = 'rgba(255, 140, 66, 0.5)'; // Orange shadow
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    // Draw ring shadow as a ring shape (not a full circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true); // Counter-clockwise to create hole
    ctx.fillStyle = 'rgba(255, 140, 66, 0.3)';
    ctx.fill();
    ctx.restore();
    
    // Draw outer ring with diagonal gradient (yellow to orange) - floats above segments
    // Draw as a proper ring shape (donut) using two arcs
    const ringGradient = ctx.createLinearGradient(
        centerX - outerRadius, centerY - outerRadius,
        centerX + outerRadius, centerY + outerRadius
    );
    ringGradient.addColorStop(0, '#FFD700'); // Yellow
    ringGradient.addColorStop(1, '#FF8C42'); // Orange
    
    // Draw ring as a donut shape (outer arc, then inner arc counter-clockwise)
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true); // Counter-clockwise creates hole
    ctx.fillStyle = ringGradient;
    ctx.fill();
    
    // Add subtle inner border to ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw center circle shadow
    const centerRadius = 25;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.arc(centerX + 1, centerY + 1, centerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fill();
    ctx.restore();
    
    // Draw center circle (simple, clean)
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

function spinWheel() {
    if (isSpinning || wheelSpun) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    if (spinLoopSound) spinLoopSound.play();

    // Choose random result
    const randomIndex = Math.floor(Math.random() * wheelAmounts.length);
    const selectedAmount = wheelAmounts[randomIndex];
    
    // Calculate target rotation (5 full rotations + position to selected section)
    const anglePerSection = (2 * Math.PI) / wheelAmounts.length;
    
    // The pointer is at the top, which is at -π/2 (or 3π/2) radians
    // We want the selected section to be at the top when the wheel stops
    // The center of the selected section is at: randomIndex * anglePerSection + anglePerSection / 2
    // To put that section at the top (-π/2), we need to rotate by:
    // - (center angle of section) + (-π/2)
    const sectionCenterAngle = randomIndex * anglePerSection + anglePerSection / 2;
    const pointerAngle = -Math.PI / 2; // Top of the wheel
    const targetRotation = pointerAngle - sectionCenterAngle;
    
    // Add 6 full rotations for visual effect
    const totalRotation = 6 * 2 * Math.PI + targetRotation;
    
    const startTime = Date.now();
    const duration = 3500; // 3.5 seconds (medium speed between 2s and 5s)
    const startRotation = currentRotation;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Constant speed rotation
        currentRotation = startRotation + (totalRotation * progress);
        
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation complete
            isSpinning = false;
            wheelSpun = true;
            if (spinLoopSound) spinLoopSound.stop();
            if (reward2Sound) reward2Sound.play();

            // Trigger flash and stars effect
            triggerWinEffect();
            
            // Verify which section is actually at the top (pointer position)
            const pointerAngle = -Math.PI / 2;
            const normalizedAngle = ((pointerAngle - currentRotation) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);
            const actualSectionIndex = Math.floor(normalizedAngle / anglePerSection);
            const actualAmount = wheelAmounts[actualSectionIndex];
            
            console.log('Selected index:', randomIndex, 'Selected amount:', selectedAmount);
            console.log('Final rotation:', currentRotation);
            console.log('Actual section at top:', actualSectionIndex, 'Actual amount:', actualAmount);
            
            // Save the actual result (in case there's a mismatch)
            saveSpinState(actualAmount);
            
            // Award stars to parent (calendar/profile/header)
            if (window.parent) {
                try {
                    const todayKey = getTodayKey();
                    const currentDaily = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
                    localStorage.setItem(`dailyStars_${todayKey}`, String(currentDaily + actualAmount));
                    if (typeof window.parent.awardStars === 'function') {
                        window.parent.awardStars(actualAmount, 'bonusSpin');
                    } else {
                        const currentTotal = parseInt(localStorage.getItem('totalStars') || '0');
                        const currentUsable = parseInt(localStorage.getItem(`usableStars_${todayKey}`) || '0');
                        localStorage.setItem('totalStars', String(currentTotal + actualAmount));
                        localStorage.setItem(`usableStars_${todayKey}`, String(currentUsable + actualAmount));
                    }
                    if (window.parent.updateHeaderStarCounter) window.parent.updateHeaderStarCounter();
                    if (window.parent.updateWalletStars2) window.parent.updateWalletStars2();
                    if (window.parent.updateCalendar) window.parent.updateCalendar();
                } catch (e) {
                    console.log('[BonusSpin] Error awarding stars to parent:', e);
                }
            }
            
            // Update parent bonus spin UI
            if (window.parent && window.parent.updateBonusSpinStars) {
                window.parent.updateBonusSpinStars();
            }
            
            // Show result
            console.log('Won:', actualAmount, 'stars');
        }
    }
    
    animate();
}

function triggerWinEffect() {
    // Flash effect
    const flashOverlay = document.getElementById('flashOverlay');
    if (flashOverlay) {
        flashOverlay.classList.add('flash');
        setTimeout(() => {
            flashOverlay.classList.remove('flash');
        }, 300);
    }
    
    // Create floating stars
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const centerX = canvasRect.left + canvasRect.width / 2;
    const centerY = canvasRect.top + canvasRect.height / 2;
    
    const numStars = 15;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'floating-star';
        star.textContent = '★';
        
        // Random x position at top of screen
        const randomX = Math.random() * screenWidth;
        const fallDistance = screenHeight + 100; // Fall off bottom of screen
        const fallDuration = 2 + Math.random() * 3; // Different speeds: 2-5 seconds
        
        // Start at top of screen
        star.style.left = randomX + 'px';
        star.style.top = '-50px';
        
        star.style.setProperty('--fall-distance', fallDistance + 'px');
        star.style.animation = `fallDown ${fallDuration}s linear forwards`;
        
        document.body.appendChild(star);
        
        // Remove star after animation
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, fallDuration * 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('wheelCanvas');
    ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spinButton');
    
    if (!canvas || !ctx || !spinButton) {
        console.error('Failed to initialize bonus spin game');
        return;
    }
    
    // Load spin state
    const { spun, starsWon } = loadSpinState();
    wheelSpun = spun;
    
    if (wheelSpun) {
        spinButton.disabled = true;
        spinButton.textContent = 'ALREADY SPUN';
        
        // Position wheel to show the winning amount
        if (starsWon > 0) {
            // Find which section has this amount
            const sectionIndex = wheelAmounts.findIndex(amount => amount === starsWon);
            if (sectionIndex !== -1) {
                // Calculate rotation to position this section at the top (pointer)
                const anglePerSection = (2 * Math.PI) / wheelAmounts.length;
                const sectionCenterAngle = sectionIndex * anglePerSection + anglePerSection / 2;
                const pointerAngle = -Math.PI / 2; // Top of the wheel
                currentRotation = pointerAngle - sectionCenterAngle;
            }
        }
    }
    
    // Draw initial wheel
    drawWheel();
    
    let _spinClick = (function() { try { const a = new Audio(new URL('../../sounds/click.mp3', window.location.href).href); a.preload = 'auto'; a.load(); return a; } catch (e) { return null; } })();
    const playSpinClick = () => { try { if (_spinClick) { _spinClick.currentTime = 0; _spinClick.play().catch(() => {}); } } catch (e) {} };
    spinButton.addEventListener('click', () => {
        playSpinClick();
        spinWheel();
    });
    spinButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        playSpinClick();
        spinWheel();
    });
    
    // Handle 'q' key to reset data
    document.addEventListener('keydown', (e) => {
        if (e.key === 'q' || e.key === 'Q') {
            if (window.parent && window.parent.resetAllData) {
                window.parent.resetAllData();
            }
        }
    });
});

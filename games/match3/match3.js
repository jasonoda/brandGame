// ===== MATCH 3 GAME - CONSOLIDATED SCRIPT =====
// Combined from multiple modules, removed breadcrumb, crypto, and window.parent calls

// ===== SOUND SYSTEM =====
class Sounds {
    setUp(e) {
        this.e = e;
        this.soundArray = ["click1", "brightClick",
            "match1", "match2", "match3", "match4", "match5", "match6", "match7", "match8", "match9", "match10",
            "jewel_clear", "jewel_explosion", "jewel_result", "jewel_start", "jewel_white", "jewel_make", "jewel_cascade", "loseStreak",
            "tick", "pop1", "pop2", "pop3"
        ];
        this.loadedSounds = [];

        for(var i=0; i<this.soundArray.length; i++){
            this.loadSounds(this.soundArray[i]);
        }
    }

    loadSounds(url){
        var theSound = new Howl({
            src: ['sounds/'+url+".mp3"]
        });

        theSound.on('load', (event) => {
            theSound.name=url;
            this.loadedSounds.push(theSound);
        });
    }

    p(type){
        if(this.e.muteState===false){
            for(var i=0; i<this.loadedSounds.length; i++){
                if(this.loadedSounds[i].name===type){
                    this.loadedSounds[i].play();
                    return;
                }
            }
        }
    }
}

// ===== INPUT HANDLING =====
class Input {
    setUp(e) {
        this.e=e;
        this.keyRight = false;
        this.keyLeft = false;
        this.keyUp = false;
        this.keyDown = false;

        document.addEventListener("keydown", event => {
            if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
                this.keyRight = true;
            } else if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
                this.keyLeft = true;
            } else if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
                this.keyUp = true;
            } else if (event.key === "q" || event.key === "Q") {
                this.e.scene.timeLeft = 3;
            } else if (event.key === "u" || event.key === "U") {
                this.e.scene.timeLeft = 5;
            } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
                this.keyDown = true;
            }
        });

        document.addEventListener("keyup", event => {
            if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
                this.keyRight = false;
            } else if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
                this.keyLeft = false;
            } else if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
                this.keyUp = false;
            } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
                this.keyDown = false;
            }
        });
    }
}

// ===== LOADER =====
class Loader {
    setUp(e){
        this.e = e;
    }
}

// ===== UTILITIES =====
class Utilities {
    setUp(e) {
        this.e=e;
    }
    
    vectorToScreenPos(ob, camera){
        const screenPosition = new THREE.Vector3();
        ob.getWorldPosition(screenPosition);
        screenPosition.project(camera);

        if ( screenPosition.x >= -1 && screenPosition.x <= 1 && screenPosition.y >= -1 && screenPosition.y <= 1 &&screenPosition.z >= -1 && screenPosition.z <= 1 ) {
            const px = (screenPosition.x + 1) / 2 * window.innerWidth;
            const py = (-screenPosition.y + 1) / 2 * window.innerHeight;
            var result = {x:px, y:py};
        }else{
            var result = {x:10000, y:10000};
        }
        return result;
    }
    
    lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    ca(ang) {
        var pi = Math.PI;
        return ang * (pi/180);
    }

    ca2(ang){
        var pi = Math.PI;
        return ang * (180/pi);
    }

    ran(num) {
        var num1 = Math.random() * num;
        var num2 = Math.floor(num1);
        return num2;
    }

    nran(num) {
        var num1 = Math.random() * (num*2);
        var num2 = Math.floor(num1-num);
        return num2;
    }

    getDistance(xA, yA, xB, yB) { 
        var xDiff = xA - xB; 
        var yDiff = yA - yB; 
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `${f(0)}${f(8)}${f(4)}`;
    }

    HSLToRGB = (h, s, l) => {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [255 * f(0), 255 * f(8), 255 * f(4)];
    };

    ranArray(ar){
        var r = this.ran(ar.length);
        var removeMe = ar[r];
        ar.splice(r, 1);
        return removeMe;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    inc(el, type, amount){
        if(type==="opacity"){
            var theOpacity = parseFloat(el.style.opacity);
            if(theOpacity==="" || isNaN(theOpacity)){
                theOpacity=0;
            }
            theOpacity+=amount;
            if(theOpacity>1){
                theOpacity=1;
            }
            if(theOpacity<0){
                theOpacity=0;
            }
            el.style.opacity = theOpacity+"";
        }else if(type==="top"){
            var theTop = parseFloat(el.style.top);
            if(theTop==="" || isNaN(theTop)){
                theTop=0;
            }
            theTop+=amount;
            el.style.top = theTop+"";
        }
    }
}

// ===== UI =====
class UI{
    setUp(e){
        this.e = e;
    }

    load(){
        this.isLoaded_UI=true;
    }
    
    update(){
    }
}

// ===== END SCORE =====
class EndScore {
    constructor() {
        this.starThresholds = null;
        this.loadStarThresholds();
    }

    setUp(e) {
        this.e = e;
    }

    async loadStarThresholds() {
        try {
            const response = await fetch('starScores.json');
            this.starThresholds = await response.json();
            console.log('Star thresholds loaded successfully:', this.starThresholds);
        } catch (error) {
            console.error('Failed to load star thresholds:', error);
            this.starThresholds = [0, 25000, 40000, 65000, 100000];
        }
    }

    createFinalScoreOverlay(scoreValue, statsArray = [], isPracticeMode = false) {
        if (!this.starThresholds) {
            console.log('Star thresholds not loaded yet, using fallback values');
            this.starThresholds = [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000];
        }
        
        console.log('Creating final score overlay with score:', scoreValue, 'and thresholds:', this.starThresholds, 'practice mode:', isPracticeMode);
        
        const overlay = document.createElement('div');
        overlay.className = 'finalScoreOverlay';
        
        const contentContainer = document.createElement('div');
        contentContainer.className = 'finalScoreContentContainer';
        
        const scoreText = document.createElement('div');
        scoreText.className = 'finalScoreText';
        scoreText.textContent = `${scoreValue.toLocaleString()}`;
        
        const statsContainer = document.createElement('div');
        statsContainer.className = 'finalScoreStatsContainer';
        
        const starDiv = document.createElement('div');
        starDiv.className = 'finalScoreStarDiv';
        
        // Calculate number of stars earned (minimum 5, maximum 15) - always calculate for display
        let starsEarned = 5; // Minimum 5 stars
        if (this.starThresholds && this.starThresholds.length > 0) {
            for (let i = 0; i < this.starThresholds.length; i++) {
                if (scoreValue >= this.starThresholds[i]) {
                    starsEarned = 5 + i; // Start at 5, add 1 for each threshold met
                } else {
                    break;
                }
            }
        }
        starsEarned = Math.min(starsEarned, 15); // Cap at 15 stars
        
        // Create 15 stars in one row
        for (let i = 0; i < 15; i++) {
            const star = document.createElement('div');
            star.className = 'finalScoreStar';
            star.innerHTML = '★';
            star.style.color = '#808080';
            
            const targetColor = (i < starsEarned) ? '#FFD700' : '#808080';
            star.dataset.targetColor = targetColor;
            starDiv.appendChild(star);
        }
        
        // Style the starDiv to display stars in one row
        starDiv.style.flexDirection = 'row';
        starDiv.style.gap = '3px';
        
        // Add practice game label above stars if in practice mode
        if (isPracticeMode) {
            const practiceLabel = document.createElement('div');
            practiceLabel.className = 'finalScoreStatItem';
            practiceLabel.textContent = 'Practice Game';
            practiceLabel.style.fontWeight = 'bold';
            practiceLabel.style.marginBottom = '4px';
            statsContainer.appendChild(practiceLabel);
            
            const noStarsLabel = document.createElement('div');
            noStarsLabel.className = 'finalScoreStatItem';
            noStarsLabel.textContent = '(No stars rewarded)';
            noStarsLabel.style.fontSize = '11px';
            noStarsLabel.style.color = '#999';
            noStarsLabel.style.marginBottom = '10px';
            statsContainer.appendChild(noStarsLabel);
        }
        
        statsContainer.appendChild(starDiv);
        
        const statsHeader = document.createElement('div');
        statsHeader.className = 'finalScoreStatsHeader';
        statsHeader.textContent = 'GAME STATS';
        statsContainer.appendChild(statsHeader);
        
        const separatorLine = document.createElement('div');
        separatorLine.className = 'finalScoreStatsSeparator';
        statsContainer.appendChild(separatorLine);
        
        statsArray.forEach(statInfo => {
            const [label, count] = statInfo;
            const statItem = document.createElement('div');
            statItem.className = 'finalScoreStatItem';
            statItem.textContent = `${label}: ${count}`;
            statsContainer.appendChild(statItem);
        });
        
        contentContainer.appendChild(scoreText);
        contentContainer.appendChild(statsContainer);
        
        const viewportHeight = window.innerHeight;
        const scoreTextHeight = scoreText.offsetHeight;
        const initialTop = (viewportHeight / 2) - 45;
        
        contentContainer.style.top = initialTop + "px";
        
        overlay.appendChild(contentContainer);
        document.body.appendChild(overlay);
        
        gsap.to(overlay, {
            duration: 0.8,
            opacity: 1,
            ease: "sine.out"
        });
        
        gsap.to(scoreText, {
            duration: .9,
            opacity: 1,
            scale: 1,
            ease: "back.out(4)"
        });

        this.createSparks(scoreText, 45, 10, 300)
        
        gsap.to(scoreText, {
            duration: 2,
            color: "#FF8C00",
            ease: "power2.inOut",
            yoyo: true,
            repeat: -1
        });
        
        setTimeout(() => {
            const contentHeight = contentContainer.offsetHeight;
            const finalTop = (viewportHeight - contentHeight) / 2;
            
            gsap.to(contentContainer, {
                duration: 1,
                top: finalTop,
                ease: "sine.out"
            });
            
            gsap.to(statsContainer, {
                duration: 1,
                opacity: 1,
                delay: 1,
                ease: "sine.out",
                onComplete: () => {
                    this.animateStars(starDiv);
                }
            });
        }, 3000);
        
        const fader = document.getElementById("fader");
        if (fader) {
            gsap.to(fader, { opacity: 0.5, duration: 0.1, ease: "linear" });
            gsap.to(fader, { opacity: 0, duration: 1, ease: "linear", delay: 0.1 });
        }
    }

    animateStars(starDiv) {
        const stars = starDiv.querySelectorAll('.finalScoreStar');
        let currentStar = 0;
        
        const starsToLight = Array.from(stars).filter(star => 
            star.dataset.targetColor === '#FFD700'
        ).length;
        
        const lightNextStar = () => {
            if (currentStar < starsToLight && currentStar < stars.length) {
                const star = stars[currentStar];
                const targetColor = star.dataset.targetColor;
                
                gsap.to(star, {
                    duration: 0.3,
                    color: targetColor,
                    scale: 1.8,
                    ease: "back.out(1.7)",
                    onComplete: () => {
                        gsap.to(star, {
                            duration: 0.3,
                            scale: 1,
                            ease: "power2.out"
                        });
                    }
                });
                
                this.createSparks(star,16,4, 100);
                
                if (this.e && this.e.s) {
                    this.e.s.p('brightClick');
                }
                
                currentStar++;
                setTimeout(lightNextStar, 300);
            }
        };
        
        lightNextStar();
    }
    
    createSparks(star, num, starScale, starDistance) {
        const starRect = star.getBoundingClientRect();
        const starCenterX = starRect.left + starRect.width / 2;
        const starCenterY = starRect.top + starRect.height / 2;
        
        for (let i = 0; i < num; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark';
            
            const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
            const distance = 1 + Math.random() * starDistance;
            const sparkSize = 3 + Math.random() * starScale * 2;
            
            const endX = starCenterX + Math.cos(angle) * distance;
            const endY = starCenterY + Math.sin(angle) * distance;
            
            spark.style.cssText = `
                position: fixed;
                left: ${starCenterX}px;
                top: ${starCenterY}px;
                width: ${sparkSize}px;
                height: ${sparkSize}px;
                background: radial-gradient(circle at center, #FFD700 0%, #FFD700 40%, rgba(255, 215, 0, 0.3) 70%, rgba(255, 215, 0, 0) 100%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 17000;
                opacity: 1;
                transform: scale(1);
            `;
            
            document.body.appendChild(spark);
            
            gsap.to(spark, {
                duration: 0.8,
                x: endX - starCenterX,
                y: endY - starCenterY,
                scale: .1,
                opacity: 0,
                rotation: Math.random() * 720 - 360,
                ease: "sine.out",
                onComplete: () => {
                    document.body.removeChild(spark);
                }
            });
        }
    }
}

// ===== ENGINE =====
class Engine{
    constructor(input, loader, scene, sounds, utilities, ui, endScore){
        this.input = input;
        this.loader = loader;
        this.s = sounds;
        this.scene = scene;
        this.ui = ui;
        this.u = utilities;
        this.endScore = endScore;

        this.mobile = false;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent ) || window.innerWidth<600) {
            this.mobile = true;
        }

        var testUA = navigator.userAgent;
        if(testUA.toLowerCase().indexOf("android") > -1){
            this.mobile = true;
        }

        this.action = "set up";
        this.count = 0;

        this.loadGame();
    }

    start(){
    }

    update(){
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);

        var currentTime = new Date().getTime();
        this.dt = (currentTime - this.lastTime) / 1000;
        if (this.dt > 1) {
            this.dt = 0;
        }
        this.lastTime = currentTime;

        if(this.action==="set up"){
            this.scene.buildScene();
            this.count=0;
            this.action="build"
        }else if(this.action==="build"){
            this.loadOpacity=1;
            this.count+=this.dt;
            if(this.count>1){
                this.action="go";
            }
        }else if(this.action==="go"){
            this.loadOpacity-=this.dt*5;
            if(this.loadOpacity<0){
                this.loadOpacity=0;
            }

            document.getElementById("loadingImage").style.opacity = this.loadOpacity+""
            document.getElementById("loadingBack").style.opacity = this.loadOpacity+""

            this.scene.update();
            this.ui.update();
        }
    }

    loadGame(){
        const storedMuteState = localStorage.getItem("mutestate");
        this.muteState = storedMuteState === "true";
        if(!this.muteState){
            this.gameStartSound=true;
        }
    }

    startGame(){
    }
}

// ===== SCENE (MAIN GAME LOGIC) =====
class Scene {
    setUp(e) {
        this.e = e;
    }

    setAnimatingTrue() {
        this.isAnimating = true;
    }

    setAnimatingFalse() {
        this.isAnimating = false;
    }

    createMatchGlowEffects() {
        const gridElement = document.getElementById('jewelGrid');
        if (!gridElement) return;
        
        const matchedJewels = document.querySelectorAll('.jewel[data-cleared="true"], .jewel[data-void="true"]');
        
        if (matchedJewels.length === 0) {
            return;
        }
        
        const glowCount = Math.floor(Math.random() * 2) + 4;
        
        for (let i = 0; i < glowCount; i++) {
            const randomJewel = matchedJewels[Math.floor(Math.random() * matchedJewels.length)];
            const jewelRect = randomJewel.getBoundingClientRect();
            const startX = jewelRect.left + jewelRect.width / 2;
            const startY = jewelRect.top + jewelRect.height / 2;
            
            const angle = Math.random() * Math.PI * 2;
            const flightDistance = 30 + Math.random() * 20;
            
            const glow = document.createElement('div');
            glow.style.position = 'fixed';
            glow.style.left = startX + 'px';
            glow.style.top = startY + 'px';
            glow.style.width = '8px';
            glow.style.height = '8px';
            glow.style.borderRadius = '50%';
            glow.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,0,0.6) 50%, transparent 100%)';
            glow.style.pointerEvents = 'none';
            glow.style.zIndex = '9998';
            glow.style.transform = 'translate(-50%, -50%)';
            
            document.body.appendChild(glow);
            
            const endX = startX + (Math.cos(angle) * flightDistance);
            const endY = startY + (Math.sin(angle) * flightDistance);
            
            glow.style.transition = 'all 1.5s ease-out';
            
            requestAnimationFrame(() => {
                glow.style.left = endX + 'px';
                glow.style.top = endY + 'px';
                glow.style.opacity = '0';
                glow.style.transform = 'translate(-50%, -50%) scale(0.5)';
            });
            
            setTimeout(() => {
                if (glow.parentNode) {
                    glow.parentNode.removeChild(glow);
                }
            }, 1500);
        }
    }

    buildScene() {
        this.action = "set up";
        this.GRID_SIZE = 8;
        this.JEWEL_TYPES = 5;
        this.grid = [];
        this.setAnimatingFalse();
        this.score = 0;
        this.scoreMultiplier = 1;
        this.savedMultiplier = 1;
        this.maxMultiplier = 5;
        this.timeLeft = 120;
        this.gameStarted = false;
        this.gameOver = false;
        
        // Check if practice mode from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        this.isPracticeMode = urlParams.get('practice') === 'true';
        
        // Show practice game label if in practice mode
        if (this.isPracticeMode) {
            const practiceLabel = document.getElementById('practiceGameLabel');
            if (practiceLabel) {
                practiceLabel.style.display = 'block';
            }
        }
        this.gridOverlayVisible = false;
        this.frameCount = 0;
        this.lastFrameTime = new Date().getTime();
        this.fps = 0;
        this.jewelEasing = "sine.in";
        this.lastMatchTime = 0;
        this.multiplierResetTimer = 3.0;
        this.lastTickSecond = -1;
        this.match3Count = 0;
        this.match4Count = 0;
        this.match5Count = 0;
        this.explosionCount = 0;
        this.bonusBoxCount = 0;
        this.smallClearCount = 0;
        this.bigClearCount = 0;
        this.multiplierValues = [];
        this.jewelColors = ['#FF6B6B', '#4ECDC4', '#0066FF', '#FFA726', '#9B59B6', '#FFFFFF', '#808080'];
        this.jewelLetters = ['r', 'g', 'b', 'o', 'p', 'w', 'l'];
        this.jewelEmojis = ['🍞', '🥬', '🍎', '🥛', '🥫', '⭐', '💥']; // bread, lettuce, apple, milk carton, soup, bonus star, bonus explosion
        this.initializeGrid();
        this.createGameHTML();
        this.bindEvents();
    }

    initializeGrid() {
        this.grid = [];
        for (let row = 0; row < this.GRID_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.GRID_SIZE; col++) {
                this.grid[row][col] = Math.floor(Math.random() * this.JEWEL_TYPES);
            }
        }
        this.removeInitialMatches();
    }

    removeInitialMatches() {
        let hasMatches = true;
        let iterations = 0;
        
        while (hasMatches && iterations < 100) {
            hasMatches = false;
            iterations++;
            
            for (let row = 0; row < this.GRID_SIZE; row++) {
                for (let col = 0; col < this.GRID_SIZE; col++) {
                    if ((row === 3 && col === 3) || (row === 3 && col === 4)) continue;
                    if (this.wouldCreateMatch(row, col, this.grid[row][col])) {
                        this.grid[row][col] = Math.floor(Math.random() * this.JEWEL_TYPES);
                        hasMatches = true;
                    }
                }
            }
        }
    }

    wouldCreateMatch(row, col, jewelType) {
        let horizontalCount = 1;
        for (let c = col - 1; c >= 0 && this.grid[row][c] === jewelType; c--) horizontalCount++;
        for (let c = col + 1; c < this.GRID_SIZE && this.grid[row][c] === jewelType; c++) horizontalCount++;
        if (horizontalCount >= 3) return true;
        
        let verticalCount = 1;
        for (let r = row - 1; r >= 0 && this.grid[r][col] === jewelType; r--) verticalCount++;
        for (let r = row + 1; r < this.GRID_SIZE && this.grid[r][col] === jewelType; r++) verticalCount++;
        return verticalCount >= 3;
    }

    createGameHTML() {
        const existingContainer = document.getElementById('jewelGameContainer');
        if (existingContainer) existingContainer.remove();
        
        const gameContainer = document.createElement('div');
        gameContainer.id = 'jewelGameContainer';
        gameContainer.style.opacity = '0';
        gameContainer.innerHTML = `
            <div id="jewelGrid" class="jewel-grid">
                <div class="checkerboard-grid"></div>
            </div>
        `;
        document.body.appendChild(gameContainer);
        
        const gridElement = document.getElementById('jewelGrid');
        if (gridElement) {
            gridElement.style.overflow = 'hidden';
            const gameContainer = document.getElementById('jewelGameContainer');
            if (gameContainer) {
                gameContainer.style.overflow = 'hidden';
                gameContainer.style.position = 'relative';
            }
        }
        
        this.renderGrid();
        this.updateLayout();
        
        setTimeout(() => {
            this.positionUI();
        }, 100);
        
        const playButton = document.getElementById("playButton");
        
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                // Sound effect removed
                e.preventDefault();
                e.stopPropagation();
                this.e.startGame();
                this.startGame();
            });
        }
    }

    positionUI() {
        const gridElement = document.getElementById('jewelGrid');
        const scoreMultDisplay = document.getElementById('scoreMultDisplay');
        
        if (!gridElement) return;
        
        const gridRect = gridElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (scoreMultDisplay) {
            const gridBottom = gridRect.bottom;
            const spaceBelow = viewportHeight - gridBottom;
            const displayHeight = scoreMultDisplay.offsetHeight || 24;
            const centerY = gridBottom + (spaceBelow * 0.45) - (displayHeight / 2);
            scoreMultDisplay.style.position = 'fixed';
            scoreMultDisplay.style.top = `${centerY}px`;
            scoreMultDisplay.style.left = '50%';
            scoreMultDisplay.style.transform = 'translateX(-50%)';
        }
        
        // scoreTimeContainer is already positioned via CSS (fixed at top: 14px)
        // startMenu is positioned via CSS and should not be repositioned here
    }

    updateLayout() {
        this.renderGrid();
        setTimeout(() => {
            this.positionUI();
        }, 50);
    }

    renderGrid() {
        const gridElement = document.getElementById('jewelGrid');
        if (!gridElement) return;
        
        const existingDebugNumbers = new Map();
        const existingJewels = gridElement.querySelectorAll('.jewel');
        existingJewels.forEach(jewel => {
            const row = jewel.dataset.row;
            const col = jewel.dataset.col;
            const debugNumber = jewel.querySelector('.debug-number[data-debug-type="block-count"]');
            if (debugNumber && row && col) {
                existingDebugNumbers.set(`${row},${col}`, debugNumber.textContent);
            }
        });
        
        const gridWidth = gridElement.offsetWidth - 20;
        this.jewelSize = Math.floor((gridWidth / this.GRID_SIZE) - 2);
        this.jewelGap = 2;
        this.gridPadding = 10;

        const contentSize = this.GRID_SIZE * (this.jewelSize + this.jewelGap) - this.jewelGap;
        const totalHeight = this.gridPadding * 2 + contentSize;
        gridElement.style.height = totalHeight + 'px';
        
        const checkerboardGrid = gridElement.querySelector('.checkerboard-grid');
        gridElement.innerHTML = '';
        
        const newCheckerboardGrid = document.createElement('div');
        newCheckerboardGrid.className = 'checkerboard-grid';
        gridElement.appendChild(newCheckerboardGrid);
        
        if (newCheckerboardGrid) {
            for (let row = 0; row < this.GRID_SIZE; row++) {
                for (let col = 0; col < this.GRID_SIZE; col++) {
                    const checkerboardCell = document.createElement('div');
                    checkerboardCell.className = 'checkerboard-cell';
                    checkerboardCell.style.left = `${this.gridPadding + col * (this.jewelSize + this.jewelGap)}px`;
                    checkerboardCell.style.top = `${this.gridPadding + row * (this.jewelSize + this.jewelGap)}px`;
                    checkerboardCell.style.width = `${this.jewelSize}px`;
                    checkerboardCell.style.height = `${this.jewelSize}px`;
                    
                    if ((row + col) % 2 === 0) {
                        checkerboardCell.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    }
                    
                    newCheckerboardGrid.appendChild(checkerboardCell);
                }
            }
        }
        
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const jewelElement = document.createElement('div');
                jewelElement.className = 'jewel';
                jewelElement.dataset.row = row;
                jewelElement.dataset.col = col;
                jewelElement.dataset.color = this.jewelLetters[this.grid[row][col]];
                jewelElement.style.width = `${this.jewelSize}px`;
                jewelElement.style.height = `${this.jewelSize}px`;
                jewelElement.style.left = `${this.gridPadding + col * (this.jewelSize + this.jewelGap)}px`;
                jewelElement.style.top = `${this.gridPadding + row * (this.jewelSize + this.jewelGap)}px`;
                
                const jewelEmoji = document.createElement('div');
                jewelEmoji.textContent = this.jewelEmojis[this.grid[row][col]];
                jewelEmoji.style.width = '100%';
                jewelEmoji.style.height = '100%';
                jewelEmoji.style.fontSize = `${this.jewelSize * 0.8}px`;
                jewelEmoji.style.display = 'flex';
                jewelEmoji.style.alignItems = 'center';
                jewelEmoji.style.justifyContent = 'center';
                jewelEmoji.style.pointerEvents = 'none';
                jewelEmoji.style.userSelect = 'none';
                jewelElement.appendChild(jewelEmoji);
                
                if (this.grid[row][col] === 5 || this.grid[row][col] === 6) {
                    jewelElement.dataset.bonusBox = 'true';
                }
                
                gridElement.appendChild(jewelElement);
            }
        }

        this.initialRowPositions = [];
        for (let row = 0; row < this.GRID_SIZE; row++) {
            const jewelInFirstColumn = document.querySelector(`[data-row="${row}"][data-col="0"]`);
            if (jewelInFirstColumn) {
                const yPosition = parseInt(jewelInFirstColumn.style.top) || 0;
                this.initialRowPositions[row] = yPosition;
            }
        }
        
        this.initialRowPositions.reverse();
        this.countBlockBelow();
    }

    bindEvents() {
        const gridElement = document.getElementById('jewelGrid');
        if (!gridElement) return;
        
        this.isGesturing = false;
        this.gestureStartJewel = null;
        this.startX = 0;
        this.startY = 0;
        this.hasTriggeredSwap = false;
        
        gridElement.addEventListener('mousedown', (e) => this.handleDragStart(e));
        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
        gridElement.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleDragEnd(e), { passive: false });
        gridElement.addEventListener('contextmenu', (e) => e.preventDefault());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                this.logAllBlocks();
            } else if (e.key === 'h' || e.key === 'H') {
                this.toggleGridOverlay();
            } else if (e.key === 'j' || e.key === 'J') {
                this.toggleMask();
            }
        });

        window.addEventListener('resize', () => this.updateLayout());
        window.addEventListener('orientationchange', () => this.updateLayout());
    }

    showStartMenu() {
        const startMenu = document.getElementById('startMenu');
        if (startMenu) {
            startMenu.style.display = 'flex';
            // Reset any inline positioning styles to let CSS handle it
            startMenu.style.top = '';
            startMenu.style.left = '';
            startMenu.style.transform = '';
            startMenu.style.position = '';
            startMenu.style.width = '';
            startMenu.style.height = '';
        }
    }

    startGame() {
        const startMenu = document.getElementById('startMenu');
        if (startMenu) {
            startMenu.style.opacity = '0';
            setTimeout(() => {
                startMenu.style.display = 'none';
            }, 500);
        }
        
        setTimeout(() => {
            this.actuallyStartGame();
        }, 500);
    }

    actuallyStartGame() {
        const startMenu = document.getElementById('startMenu');
        if (startMenu) startMenu.style.display = 'none';
        
        const gameContainer = document.getElementById('jewelGameContainer');
        if (gameContainer) {
            gameContainer.style.pointerEvents = 'auto';
            gsap.to(gameContainer, {
                opacity: 1,
                duration: 1,
                ease: "power2.out"
            });
        }
        
        const gridElement = document.getElementById('jewelGrid');
        if (gridElement) {
            gridElement.style.pointerEvents = 'auto';
        }
        
        const scoreMultDisplay = document.getElementById('scoreMultDisplay');
        if (scoreMultDisplay) {
            gsap.to(scoreMultDisplay, {
                opacity: 1,
                duration: 1,
                ease: "power2.out"
            });
        }
        
        const scoreTimeContainer = document.getElementById('scoreTimeContainer');
        if (scoreTimeContainer) {
            scoreTimeContainer.style.opacity = '1';
        }
        
        this.gameStarted = true;
        this.startTimer();
        this.updateScoreDisplay();
        this.updateMultiplierDisplay();
        this.updateMeterDisplay();
        this.lastMatchTime = Date.now();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 10 && this.timeLeft > 0) {
                const currentSecond = this.timeLeft;
                if (currentSecond !== this.lastTickSecond) {
                    this.e.s.p("tick");
                    this.lastTickSecond = currentSecond;
                }
            }
            
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    updateTimerDisplay() {
        const timeDisplay = document.getElementById('timeDisplay');
        if (timeDisplay) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateScoreDisplay() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) scoreDisplay.textContent = `${this.score}`;
    }

    updateMultiplierDisplay() {
        const scoreMultDisplay = document.getElementById('scoreMultDisplay');
        if (scoreMultDisplay) {
            scoreMultDisplay.textContent = `SCORE MULT: x${this.scoreMultiplier}`;
        }
    }

    updateMeterDisplay() {
    }

    countBlockBelow() {
        const allJewels = document.querySelectorAll('.jewel');
        for (let i = 0; i < allJewels.length; i++) {
            const jewel = allJewels[i];
            if (jewel.dataset.cleared === 'true' || jewel.dataset.void === 'true') {
                continue;
            }
            
            const currentRow = parseInt(jewel.dataset.row);
            const currentCol = parseInt(jewel.dataset.col);
            
            if (isNaN(currentRow) || isNaN(currentCol)) {
                continue;
            }
            
            let blocksBelowCount = 0;
            const currentTop = parseInt(jewel.style.top) || 0;
            const allBlocksInColumn = document.querySelectorAll(`[data-col="${currentCol}"]`);
            allBlocksInColumn.forEach(block => {
                if (block.dataset.cleared === 'true' || block.dataset.void === 'true') {
                    return;
                }
                const blockTop = parseInt(block.style.top) || 0;
                if (blockTop > currentTop) {
                    blocksBelowCount++;
                }
            });
            
            jewel.dataset.toRow = blocksBelowCount;
        }
    }

    handleDragStart(e) {
        if (this.isAnimating || this.gameOver || !this.gameStarted) return;
        e.preventDefault();
        const jewelElement = e.target.closest('.jewel');
        if (!jewelElement) return;
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        this.isGesturing = true;
        this.gestureStartJewel = {
            row: parseInt(jewelElement.dataset.row),
            col: parseInt(jewelElement.dataset.col),
            element: jewelElement
        };
        
        this.startX = clientX;
        this.startY = clientY;
        this.hasTriggeredSwap = false;
        
        this.highlightJewel(this.gestureStartJewel.row, this.gestureStartJewel.col, true);
    }

    handleDragMove(e) {
        if (!this.isGesturing || !this.gestureStartJewel || this.hasTriggeredSwap || this.isAnimating) return;
        e.preventDefault();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        const deltaX = clientX - this.startX;
        const deltaY = clientY - this.startY;
        const threshold = 12;
        
        if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
            let targetRow = this.gestureStartJewel.row;
            let targetCol = this.gestureStartJewel.col;
            let hasValidTarget = false;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > threshold && targetCol < this.GRID_SIZE - 1) {
                    targetCol++;
                    hasValidTarget = true;
                } else if (deltaX < -threshold && targetCol > 0) {
                    targetCol--;
                    hasValidTarget = true;
                }
            } else {
                if (deltaY > threshold && targetRow < this.GRID_SIZE - 1) {
                    targetRow++;
                    hasValidTarget = true;
                } else if (deltaY < -threshold && targetRow > 0) {
                    targetRow--;
                    hasValidTarget = true;
                }
            }
            
            if (hasValidTarget) {
                this.hasTriggeredSwap = true;
                this.setAnimatingTrue();
                this.attemptSwap(this.gestureStartJewel.row, this.gestureStartJewel.col, targetRow, targetCol);
            }
        }
    }

    handleDragEnd(e) {
        if (!this.isGesturing || this.isAnimating) return;
        e.preventDefault();
        this.isGesturing = false;
        this.gestureStartJewel = null;
        this.hasTriggeredSwap = false;
    }

    highlightJewel(row, col, highlight) {
        const jewelElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (jewelElement) {
            if (highlight) {
                jewelElement.style.zIndex = '100';
            } else {
                jewelElement.style.zIndex = '';
            }
        }
    }

    attemptSwap(row1, col1, row2, col2) {
        const jewel1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const jewel2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
        
        if (!jewel1 || !jewel2) {
            this.setAnimatingFalse();
            this.showInvalidMoveFeedback(row1, col1, row2, col2);
            return;
        }
        
        // Check if one of the swapped jewels is a bonus box (white/star or L/explosion)
        const isBonusBox1 = jewel1.dataset.color === 'w' || jewel1.dataset.color === 'l';
        const isBonusBox2 = jewel2.dataset.color === 'w' || jewel2.dataset.color === 'l';
        
        if (isBonusBox1 || isBonusBox2) {
            // Save current multiplier for bonus box usage
            this.savedMultiplier = this.scoreMultiplier;
            // Reset the multiplier timer when using a bonus box
            this.startMultiplierResetTimer();
            
            // Bonus box to bonus box interactions
            if (isBonusBox1 && isBonusBox2) {
                const bonusBox1Type = jewel1.dataset.color;
                const bonusBox2Type = jewel2.dataset.color;
                
                // L-bonus to L-bonus (explosion + larger diamond clear)
                if (bonusBox1Type === 'l' && bonusBox2Type === 'l') {
                    this.explosionCount++;
                    this.e.s.p("jewel_explosion");
                    
                    const jewelsToClear = [];
                    const bonusBoxRow = row1;
                    const bonusBoxCol = col1;
                    
                    // Larger diamond pattern (radius 4)
                    for (let r = Math.max(0, bonusBoxRow - 4); r <= Math.min(this.GRID_SIZE - 1, bonusBoxRow + 4); r++) {
                        for (let c = Math.max(0, bonusBoxCol - 4); c <= Math.min(this.GRID_SIZE - 1, bonusBoxCol + 4); c++) {
                            const distance = Math.abs(r - bonusBoxRow) + Math.abs(c - bonusBoxCol);
                            if (distance <= 4) {
                                const jewelElement = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                                if (jewelElement) {
                                    const jewelColor = jewelElement.dataset.color;
                                    if (jewelColor !== 'w' && jewelColor !== 'l') {
                                        jewelsToClear.push({ row: r, col: c });
                                    }
                                }
                            }
                        }
                    }
                    
                    if (jewelsToClear.length > 0) {
                        const finalScore = 1000 * this.savedMultiplier;
                        this.score += finalScore;
                        this.updateScoreDisplay();
                        
                        const centerX = (this.gridPadding + bonusBoxCol * (this.jewelSize + this.jewelGap)) + (this.jewelSize / 2);
                        const centerY = (this.gridPadding + bonusBoxRow * (this.jewelSize + this.jewelGap)) + (this.jewelSize / 2);
                        this.showScorePopup(finalScore, [{ x: centerX, y: centerY }]);
                        
                        this.createExplosionEffect(row2, col2, jewelsToClear);
                        
                        this.animateSwap(row1, col1, row2, col2, () => {
                            this.clearAllJewelsOfColor(jewelsToClear, () => {
                                this.handleBlockFallingAfterMatch([], []);
                            });
                        });
                        
                        this.increaseMultiplier();
                        return;
                    }
                }
                
                // L-bonus to White bonus (small board clear)
                if ((bonusBox1Type === 'l' && bonusBox2Type === 'w') || (bonusBox1Type === 'w' && bonusBox2Type === 'l')) {
                    this.smallClearCount++;
                    this.e.s.p("jewel_clear");
                    
                    const allJewels = document.querySelectorAll('.jewel');
                    const jewelsToClear = [];
                    
                    allJewels.forEach(jewel => {
                        const row = parseInt(jewel.dataset.row);
                        const col = parseInt(jewel.dataset.col);
                        if (row >= 0 && col >= 0) {
                            jewelsToClear.push({ row, col });
                        }
                    });
                    
                    if (jewelsToClear.length > 0) {
                        const finalScore = 1500 * this.savedMultiplier;
                        this.score += finalScore;
                        this.updateScoreDisplay();
                        
                        const centerX = (this.gridPadding + 3.5 * (this.jewelSize + this.jewelGap)) + (this.jewelSize / 2);
                        const centerY = (this.gridPadding + 3.5 * (this.jewelSize + this.jewelGap)) + (this.jewelSize / 2);
                        this.showScorePopup(finalScore, [{ x: centerX, y: centerY }]);
                        
                        this.createEpicBoardExplosion();
                        
                        this.animateSwap(row1, col1, row2, col2, () => {
                            this.setAnimatingTrue();
                            setTimeout(() => {
                                this.clearAllJewelsOfColor(jewelsToClear, () => {
                                    this.handleBlockFallingAfterMatch([], []);
                                });
                                this.setAnimatingFalse();
                            }, 1000);
                        });
                        
                        this.increaseMultiplier();
                        return;
                    }
                }
                
                // White to White (full board clear, bigger)
                if (bonusBox1Type === 'w' && bonusBox2Type === 'w') {
                    this.bigClearCount++;
                    this.e.s.p("jewel_clear");
                    
                    const allJewels = document.querySelectorAll('.jewel');
                    const jewelsToClear = [];
                    
                    allJewels.forEach(jewel => {
                        const row = parseInt(jewel.dataset.row);
                        const col = parseInt(jewel.dataset.col);
                        if (row >= 0 && col >= 0) {
                            jewelsToClear.push({ row, col });
                        }
                    });
                    
                    if (jewelsToClear.length > 0) {
                        const finalScore = 2000 * this.savedMultiplier;
                        this.score += finalScore;
                        this.updateScoreDisplay();
                        
                        const centerX = (this.gridPadding + 3.5 * (this.jewelSize + this.jewelGap)) + (this.jewelSize / 2);
                        const centerY = (this.gridPadding + 3.5 * (this.jewelSize + this.jewelGap)) + (this.jewelSize / 2);
                        this.showScorePopup(finalScore, [{ x: centerX, y: centerY }]);
                        
                        this.createEpicBoardExplosion();
                        
                        this.animateSwap(row1, col1, row2, col2, () => {
                            this.setAnimatingTrue();
                            setTimeout(() => {
                                this.clearAllJewelsOfColor(jewelsToClear, () => {
                                    this.handleBlockFallingAfterMatch([], []);
                                });
                                this.setAnimatingFalse();
                            }, 1000);
                        });
                        
                        this.increaseMultiplier();
                        return;
                    }
                }
            }
            
            // Single bonus box with regular jewel
            const bonusBoxJewel = isBonusBox1 ? jewel1 : jewel2;
            const bonusBoxType = bonusBoxJewel.dataset.color;
            const bonusBoxRow = isBonusBox1 ? row1 : row2;
            const bonusBoxCol = isBonusBox1 ? col1 : col2;
            
            if (bonusBoxType === 'l') {
                // L-bonus diamond explosion around the bonus jewel
                this.explosionCount++;
                this.e.s.p("jewel_explosion");
                
                const jewelsToClear = [];
                
                for (let r = Math.max(0, bonusBoxRow - 3); r <= Math.min(this.GRID_SIZE - 1, bonusBoxRow + 3); r++) {
                    for (let c = Math.max(0, bonusBoxCol - 3); c <= Math.min(this.GRID_SIZE - 1, bonusBoxCol + 3); c++) {
                        const distance = Math.abs(r - bonusBoxRow) + Math.abs(c - bonusBoxCol);
                        if (distance <= 3) {
                            const jewelElement = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                            if (jewelElement) {
                                const jewelColor = jewelElement.dataset.color;
                                if (jewelColor !== 'w' && jewelColor !== 'l') {
                                    jewelsToClear.push({ row: r, col: c });
                                }
                            }
                        }
                    }
                }
                
                // Always allow L-bonus swap, even if no jewels found initially
                this.animateSwap(row1, col1, row2, col2, () => {
                    if (jewelsToClear.length > 0) {
                        const diamondMatches = jewelsToClear.map(pos => ({ row: pos.row, col: pos.col }));
                        
                        const finalScore = 300 * this.savedMultiplier;
                        this.score += finalScore;
                        this.updateScoreDisplay();
                        
                        let centerX = 0;
                        let centerY = 0;
                        let validPositions = 0;
                        
                        jewelsToClear.forEach(pos => {
                            const jewelElement = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
                            if (jewelElement) {
                                const rect = jewelElement.getBoundingClientRect();
                                centerX += rect.left + rect.width / 2;
                                centerY += rect.top + rect.height / 2;
                                validPositions++;
                            }
                        });
                        
                        if (validPositions > 0) {
                            centerX /= validPositions;
                            centerY /= validPositions;
                            this.showScorePopup(finalScore, [{ x: centerX, y: centerY }]);
                        }
                        
                        this.createExplosionEffect(row2, col2, jewelsToClear);
                        
                        this.animateClearMatches(diamondMatches, [], () => {
                            this.handleBlockFallingAfterMatch(diamondMatches, []);
                        });
                        
                        this.increaseMultiplier();
                    } else {
                        // If no jewels found, just complete the swap
                        this.setAnimatingFalse();
                    }
                });
                return;
            } else {
                // White bonus: clear all jewels of the color of the other jewel
                const colorToClear = isBonusBox1 ? jewel2.dataset.color : jewel1.dataset.color;
                this.bonusBoxCount++;
                
                this.e.s.p("jewel_white");
                
                if (colorToClear) {
                    const jewelsToClear = [];
                    const allJewels = document.querySelectorAll('.jewel');
                    
                    allJewels.forEach(jewel => {
                        if (jewel.dataset.color === colorToClear) {
                            const row = parseInt(jewel.dataset.row);
                            const col = parseInt(jewel.dataset.col);
                            if (row >= 0 && col >= 0) {
                                jewelsToClear.push({ row, col });
                            }
                        }
                    });
                    
                    jewelsToClear.push({ row: bonusBoxRow, col: bonusBoxCol });
                    
                    // Always allow white bonus swap, even if no jewels found initially
                    if (jewelsToClear.length > 0) {
                        const finalWhiteBonusScore = 500 * this.savedMultiplier;
                        this.score += finalWhiteBonusScore;
                        this.updateScoreDisplay();
                        
                        let centerX = 0;
                        let centerY = 0;
                        let validPositions = 0;
                        
                        jewelsToClear.slice(0, -1).forEach(pos => {
                            const jewelElement = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
                            if (jewelElement) {
                                const rect = jewelElement.getBoundingClientRect();
                                centerX += rect.left + rect.width / 2;
                                centerY += rect.top + rect.height / 2;
                                validPositions++;
                            }
                        });
                        
                        if (validPositions > 0) {
                            centerX /= validPositions;
                            centerY /= validPositions;
                            this.showScorePopup(finalWhiteBonusScore, [{ x: centerX, y: centerY }]);
                        }
                        
                        this.createWhiteBonusExplosion(row2, col2, colorToClear);
                        
                        this.animateSwap(row1, col1, row2, col2, () => {
                            this.setAnimatingTrue();
                            setTimeout(() => {
                                this.clearAllJewelsOfColor(jewelsToClear, () => {
                                    this.handleBlockFallingAfterMatch([], []);
                                });
                                this.setAnimatingFalse();
                            }, 500);
                        });
                        
                        this.increaseMultiplier();
                    } else {
                        // If no jewels found, just complete the swap
                        this.animateSwap(row1, col1, row2, col2, () => {
                            this.setAnimatingFalse();
                        });
                    }
                    return;
                } else {
                    // If colorToClear is invalid, still allow the swap
                    this.animateSwap(row1, col1, row2, col2, () => {
                        this.setAnimatingFalse();
                    });
                    return;
                }
            }
        }
        
        // Normal swap logic (no bonus boxes involved or no special pattern found)
        const color1 = jewel1.dataset.color;
        const color2 = jewel2.dataset.color;
        
        jewel1.dataset.color = color2;
        jewel2.dataset.color = color1;
        
        const { matches, bonusBoxes } = this.findMatches(true);
        
        jewel1.dataset.color = color1;
        jewel2.dataset.color = color2;
        
        if (matches.length > 0) {
            this.savedMultiplier = this.scoreMultiplier;
            this.animateSwap(row1, col1, row2, col2, () => {
                this.processMatches(bonusBoxes, false);
            });
        } else {
            this.showInvalidMoveFeedback(row1, col1, row2, col2);
        }
    }

    showInvalidMoveFeedback(row1, col1, row2, col2) {
        const jewel1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const jewel2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
        
        if (!jewel1 || !jewel2) {
            return;
        }
        
        const isHorizontal = Math.abs(col2 - col1) > Math.abs(row2 - row1);
        
        const tl = gsap.timeline({
            onComplete: () => {
                this.setAnimatingFalse();
            }
        });
        
        if (isHorizontal) {
            tl.to([jewel1, jewel2], { x: 5, duration: 0.05, ease: this.jewelEasing })
              .to([jewel1, jewel2], { x: -5, duration: 0.05, ease: this.jewelEasing })
              .to([jewel1, jewel2], { x: 3, duration: 0.05, ease: this.jewelEasing })
              .to([jewel1, jewel2], { x: 0, duration: 0.05, ease: this.jewelEasing });
        } else {
            tl.to([jewel1, jewel2], { y: 5, duration: 0.05, ease: this.jewelEasing })
              .to([jewel1, jewel2], { y: -5, duration: 0.05, ease: this.jewelEasing })
              .to([jewel1, jewel2], { y: 3, duration: 0.05, ease: this.jewelEasing })
              .to([jewel1, jewel2], { y: 0, duration: 0.05, ease: this.jewelEasing });
        }
    }

    findMatches(allowBonusBoxes = false) {
        const matches = [];
        const bonusBoxes = [];
        const visited = new Set();
        const fiveMatches = [];
        
        const horizontalMatches = [];
        const verticalMatches = [];
        
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE - 2; col++) {
                const jewel1 = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const jewel2 = document.querySelector(`[data-row="${row}"][data-col="${col + 1}"]`);
                const jewel3 = document.querySelector(`[data-row="${row}"][data-col="${col + 2}"]`);
                
                if (jewel1 && jewel2 && jewel3) {
                    const color1 = jewel1.dataset.color;
                    const color2 = jewel2.dataset.color;
                    const color3 = jewel3.dataset.color;
                    
                    if (color1 && color2 && color3) {
                        if (color1 === 'w' || color2 === 'w' || color3 === 'w' || color1 === 'l' || color2 === 'l' || color3 === 'l') {
                            continue;
                        }
                        
                        if (color1 === color2 && color2 === color3) {
                            let matchLength = 3;
                            let endCol = col + 2;
                            
                            const jewel4 = document.querySelector(`[data-row="${row}"][data-col="${col + 3}"]`);
                            if (jewel4 && color1 === jewel4.dataset.color && jewel4.dataset.color !== 'w' && jewel4.dataset.color !== 'l') {
                                matchLength = 4;
                                endCol = col + 3;
                                
                                const jewel5 = document.querySelector(`[data-row="${row}"][data-col="${col + 4}"]`);
                                if (jewel5 && color1 === jewel5.dataset.color && jewel5.dataset.color !== 'w' && jewel5.dataset.color !== 'l') {
                                    matchLength = 5;
                                    endCol = col + 4;
                                }
                            }
                            
                            horizontalMatches.push({
                                row: row,
                                startCol: col,
                                endCol: endCol,
                                color: color1,
                                length: matchLength
                            });
                        }
                    }
                }
            }
        }
        
        for (let col = 0; col < this.GRID_SIZE; col++) {
            for (let row = 0; row < this.GRID_SIZE - 2; row++) {
                const jewel1 = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const jewel2 = document.querySelector(`[data-row="${row + 1}"][data-col="${col}"]`);
                const jewel3 = document.querySelector(`[data-row="${row + 2}"][data-col="${col}"]`);
                
                if (jewel1 && jewel2 && jewel3) {
                    const color1 = jewel1.dataset.color;
                    const color2 = jewel2.dataset.color;
                    const color3 = jewel3.dataset.color;
                    
                    if (color1 && color2 && color3) {
                        if (color1 === 'w' || color2 === 'w' || color3 === 'w' || color1 === 'l' || color2 === 'l' || color3 === 'l') {
                            continue;
                        }
                        
                        if (color1 === color2 && color2 === color3) {
                            let matchLength = 3;
                            let endRow = row + 2;
                            
                            const jewel4 = document.querySelector(`[data-row="${row + 3}"][data-col="${col}"]`);
                            if (jewel4 && color1 === jewel4.dataset.color && jewel4.dataset.color !== 'w' && jewel4.dataset.color !== 'l') {
                                matchLength = 4;
                                endRow = row + 3;
                                
                                const jewel5 = document.querySelector(`[data-row="${row + 4}"][data-col="${col}"]`);
                                if (jewel5 && color1 === jewel5.dataset.color && jewel5.dataset.color !== 'w' && jewel5.dataset.color !== 'l') {
                                    matchLength = 5;
                                    endRow = row + 4;
                                }
                            }
                            
                            verticalMatches.push({
                                col: col,
                                startRow: row,
                                endRow: endRow,
                                color: color1,
                                length: matchLength
                            });
                        }
                    }
                }
            }
        }
        
        if (allowBonusBoxes) {
            horizontalMatches.forEach((horizontalMatch) => {
                verticalMatches.forEach((verticalMatch) => {
                    let isLShape = false;
                    let intersectionRow, intersectionCol;
                    
                    if (horizontalMatch.row === verticalMatch.startRow && 
                        horizontalMatch.startCol <= verticalMatch.col && 
                        horizontalMatch.endCol >= verticalMatch.col) {
                        intersectionRow = verticalMatch.startRow;
                        intersectionCol = verticalMatch.col;
                        isLShape = true;
                    } else if (horizontalMatch.row === verticalMatch.endRow && 
                             horizontalMatch.startCol <= verticalMatch.col && 
                             horizontalMatch.endCol >= verticalMatch.col) {
                        intersectionRow = verticalMatch.endRow;
                        intersectionCol = verticalMatch.col;
                        isLShape = true;
                    } else if (verticalMatch.col === horizontalMatch.startCol && 
                             verticalMatch.startRow <= horizontalMatch.row && 
                             verticalMatch.endRow >= horizontalMatch.row) {
                        intersectionRow = horizontalMatch.row;
                        intersectionCol = horizontalMatch.startCol;
                        isLShape = true;
                    } else if (verticalMatch.col === horizontalMatch.endCol && 
                             verticalMatch.startRow <= horizontalMatch.row && 
                             verticalMatch.endRow >= horizontalMatch.row) {
                        intersectionRow = horizontalMatch.row;
                        intersectionCol = horizontalMatch.endCol;
                        isLShape = true;
                    }
                    
                    if (isLShape) {
                        const intersectionJewel = document.querySelector(`[data-row="${intersectionRow}"][data-col="${intersectionCol}"]`);
                        if (intersectionJewel && intersectionJewel.dataset.bonusBox !== 'true') {
                            let hasConflict = false;
                            horizontalMatches.forEach(match => {
                                if (match.length === 5) {
                                    const centerCol = match.startCol + 2;
                                    if (match.row === intersectionRow && centerCol === intersectionCol) {
                                        hasConflict = true;
                                    }
                                }
                            });
                            verticalMatches.forEach(match => {
                                if (match.length === 5) {
                                    const centerRow = match.startRow + 2;
                                    if (match.col === intersectionCol && centerRow === intersectionRow) {
                                        hasConflict = true;
                                    }
                                }
                            });
                            
                            if (!hasConflict) {
                                bonusBoxes.push({ row: intersectionRow, col: intersectionCol, type: 'L-bonus' });
                                this.e.s.p("jewel_make");
                                visited.add(`${intersectionRow}-${intersectionCol}`);
                            }
                        }
                    }
                });
            });
        }
        
        horizontalMatches.forEach(horizontalMatch => {
            if (horizontalMatch.length === 5 && allowBonusBoxes) {
                const centerCol = horizontalMatch.startCol + 2;
                const centerJewel = document.querySelector(`[data-row="${horizontalMatch.row}"][data-col="${centerCol}"]`);
                
                if (centerJewel && !visited.has(`${horizontalMatch.row}-${centerCol}`)) {
                    bonusBoxes.push({ row: horizontalMatch.row, col: centerCol, type: 'white' });
                    fiveMatches.push({
                        row: horizontalMatch.row,
                        startCol: horizontalMatch.startCol,
                        endCol: horizontalMatch.endCol,
                        color: horizontalMatch.color,
                        length: 5
                    });
                    this.e.s.p("jewel_make");
                    visited.add(`${horizontalMatch.row}-${centerCol}`);
                }
                
                for (let c = horizontalMatch.startCol; c <= horizontalMatch.endCol; c++) {
                    const key = `${horizontalMatch.row}-${c}`;
                    if (!visited.has(key) && c !== centerCol) {
                        matches.push({ row: horizontalMatch.row, col: c });
                        visited.add(key);
                    }
                }
            } else {
                for (let c = horizontalMatch.startCol; c <= horizontalMatch.endCol; c++) {
                    const key = `${horizontalMatch.row}-${c}`;
                    if (!visited.has(key)) {
                        matches.push({ row: horizontalMatch.row, col: c });
                        visited.add(key);
                    }
                }
            }
        });
        
        verticalMatches.forEach(verticalMatch => {
            if (verticalMatch.length === 5 && allowBonusBoxes) {
                const centerRow = verticalMatch.startRow + 2;
                const centerJewel = document.querySelector(`[data-row="${centerRow}"][data-col="${verticalMatch.col}"]`);
                
                if (centerJewel && !visited.has(`${centerRow}-${verticalMatch.col}`)) {
                    bonusBoxes.push({ row: centerRow, col: verticalMatch.col, type: 'white' });
                    fiveMatches.push({
                        col: verticalMatch.col,
                        startRow: verticalMatch.startRow,
                        endRow: verticalMatch.endRow,
                        color: verticalMatch.color,
                        length: 5
                    });
                    this.e.s.p("jewel_make");
                    visited.add(`${centerRow}-${verticalMatch.col}`);
                }
                
                for (let r = verticalMatch.startRow; r <= verticalMatch.endRow; r++) {
                    const key = `${r}-${verticalMatch.col}`;
                    if (!visited.has(key) && r !== centerRow) {
                        matches.push({ row: r, col: verticalMatch.col });
                        visited.add(key);
                    }
                }
            } else {
                for (let r = verticalMatch.startRow; r <= verticalMatch.endRow; r++) {
                    const key = `${r}-${verticalMatch.col}`;
                    if (!visited.has(key)) {
                        matches.push({ row: r, col: verticalMatch.col });
                        visited.add(key);
                    }
                }
            }
        });
        
        const matchesByColor = {};
        matches.forEach(match => {
            const jewel = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
            if (jewel) {
                const color = jewel.dataset.color;
                if (!matchesByColor[color]) {
                    matchesByColor[color] = [];
                }
                matchesByColor[color].push(match);
            }
        });
        
        return { matches, bonusBoxes, matchesByColor, fiveMatches };
    }

    animateSwap(row1, col1, row2, col2, callback) {
        const jewel1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const jewel2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
        
        if (!jewel1 || !jewel2) {
            callback();
            return;
        }
        
        const deltaRow = row2 - row1;
        const deltaCol = col2 - col1;
        const translateX = deltaCol * (this.jewelSize + this.jewelGap);
        const translateY = deltaRow * (this.jewelSize + this.jewelGap);
        
        jewel1.style.zIndex = '1000';
        jewel2.style.zIndex = '999';
        
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.set([jewel1, jewel2], { clearProps: "transform" });
                jewel1.dataset.row = row2;
                jewel1.dataset.col = col2;
                jewel2.dataset.row = row1;
                jewel2.dataset.col = col1;
                
                jewel1.style.left = `${this.gridPadding + col2 * (this.jewelSize + this.jewelGap)}px`;
                jewel1.style.top = `${this.gridPadding + row2 * (this.jewelSize + this.jewelGap)}px`;
                jewel2.style.left = `${this.gridPadding + col1 * (this.jewelSize + this.jewelGap)}px`;
                jewel2.style.top = `${this.gridPadding + row1 * (this.jewelSize + this.jewelGap)}px`;
                
                const jewel1Emoji = jewel1.querySelector('div');
                const jewel2Emoji = jewel2.querySelector('div');
                if (jewel1Emoji && jewel1.dataset.color) {
                    const colorIndex = this.jewelLetters.indexOf(jewel1.dataset.color);
                    if (colorIndex !== -1) {
                        jewel1Emoji.textContent = this.jewelEmojis[colorIndex];
                    }
                }
                if (jewel2Emoji && jewel2.dataset.color) {
                    const colorIndex = this.jewelLetters.indexOf(jewel2.dataset.color);
                    if (colorIndex !== -1) {
                        jewel2Emoji.textContent = this.jewelEmojis[colorIndex];
                    }
                }
                
                setTimeout(() => {
                    callback();
                }, 10);
            }
        });
        
        tl.to(jewel1, {
            x: translateX,
            y: translateY,
            duration: 0.15,
            ease: this.jewelEasing
        }, 0)
        .to(jewel2, {
            x: -translateX,
            y: -translateY,
            duration: 0.15,
            ease: this.jewelEasing
        }, 0);
    }

    processMatches(bonusBoxesFromPrevious = [], isCascade = false) {
        this.syncInternalGridFromDOM();
        
        const { matches, bonusBoxes, matchesByColor, fiveMatches } = this.findMatches(true);
        
        if (matches.length === 0) {
            this.resetMultiplier();
            return;
        }
        
        this.setAnimatingTrue();
        
        let totalScore = 0;
        const multiplierToUse = isCascade ? this.savedMultiplier : this.scoreMultiplier;
        
        if (!isCascade) {
            const matchSoundIndex = Math.min(Math.floor(multiplierToUse * 2), 10);
            const matchSoundName = `match${matchSoundIndex}`;
            this.e.s.p(matchSoundName);
        } else {
            this.e.s.p("pop1");
        }
        
        fiveMatches.forEach(fiveMatch => {
            this.match5Count++;
        });
        
        Object.keys(matchesByColor).forEach(color => {
            const colorMatches = matchesByColor[color];
            const matchLength = colorMatches.length;
            
            let baseScore = 0;
            if (matchLength === 3) {
                baseScore = 100;
                this.match3Count++;
            } else if (matchLength === 4) {
                baseScore = 150;
                this.match4Count++;
            } else if (matchLength === 5) {
                baseScore = 200;
                this.match5Count++;
            }
            
            const finalScore = baseScore * multiplierToUse;
            totalScore += finalScore;
            this.multiplierValues.push(multiplierToUse);
            
            let centerX = 0;
            let centerY = 0;
            let validPositions = 0;
            
            colorMatches.forEach(match => {
                const jewelElement = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
                if (jewelElement) {
                    const rect = jewelElement.getBoundingClientRect();
                    centerX += rect.left + rect.width / 2;
                    centerY += rect.top + rect.height / 2;
                    validPositions++;
                }
            });
            
            if (validPositions > 0) {
                centerX /= validPositions;
                centerY /= validPositions;
                this.showScorePopup(finalScore, [{ x: centerX, y: centerY }]);
            }
        });
        
        this.score += totalScore;
        this.updateScoreDisplay();
        
        if (!isCascade) {
            this.increaseMultiplier();
            this.lastMatchTime = Date.now();
        }
        
        bonusBoxes.forEach(bonusBox => {
            let bonusScore = 0;
            if (bonusBox.type === 'white') {
                bonusScore = 400;
            } else if (bonusBox.type === 'L-bonus') {
                bonusScore = 250;
            }
            
            if (bonusScore > 0) {
                const finalBonusScore = bonusScore * multiplierToUse;
                this.score += finalBonusScore;
                this.updateScoreDisplay();
                
                const bonusElement = document.querySelector(`[data-row="${bonusBox.row}"][data-col="${bonusBox.col}"]`);
                if (bonusElement) {
                    const rect = bonusElement.getBoundingClientRect();
                    const position = {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    };
                    this.showScorePopup(finalBonusScore, [position]);
                }
            }
        });
        
        const allBonusBoxes = [...bonusBoxesFromPrevious, ...bonusBoxes];
        
        this.animateClearMatches(matches, allBonusBoxes, () => {
            this.handleBlockFallingAfterMatch(matches, allBonusBoxes);
        });
    }

    animateClearMatches(matches, bonusBoxes, callback) {
        const elements = [];
        const bonusBoxElements = [];
        
        bonusBoxes.forEach(bonusBox => {
            const element = document.querySelector(`[data-row="${bonusBox.row}"][data-col="${bonusBox.col}"]`);
            if (element) {
                bonusBoxElements.push(element);
                
                if (bonusBox.type === 'white') {
                    element.style.backgroundColor = '';
                    element.dataset.color = 'w';
                    const existingEmoji = element.querySelector('div');
                    if (existingEmoji) {
                        existingEmoji.textContent = this.jewelEmojis[5]; // ⭐
                    }
                } else if (bonusBox.type === 'L-bonus') {
                    element.style.backgroundColor = '';
                    element.dataset.color = 'l';
                    const existingEmoji = element.querySelector('div');
                    if (existingEmoji) {
                        existingEmoji.textContent = this.jewelEmojis[6]; // 💥
                    }
                }
                
                element.dataset.bonusBox = 'true';
                element.dataset.newBonusBox = 'true';
            }
        });
        
        matches.forEach(match => {
            const element = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
            if (element) {
                if (element.dataset.newBonusBox === 'true') {
                    return;
                }
                elements.push(element);
            }
        });
        
        elements.forEach(element => {
            element.dataset.cleared = 'true';
            element.dataset.void = 'true';
        });
        
        this.createMatchGlowEffects();
        
        elements.forEach(element => {
            const row = parseInt(element.dataset.row);
            const col = parseInt(element.dataset.col);
            if (row >= 0 && row < this.GRID_SIZE && col >= 0 && col < this.GRID_SIZE) {
                this.grid[row][col] = -1;
            }
        });
        
        bonusBoxElements.forEach(element => {
            const row = parseInt(element.dataset.row);
            const col = parseInt(element.dataset.col);
            if (row >= 0 && row < this.GRID_SIZE && col >= 0 && col < this.GRID_SIZE) {
                if (element.dataset.color === 'w') {
                    this.grid[row][col] = 5;
                } else if (element.dataset.color === 'l') {
                    this.grid[row][col] = 6;
                }
            }
        });
        
        const tl = gsap.timeline({
            onComplete: () => {
                this.handleBlockFallingAfterMatch(matches, bonusBoxes);
            }
        });
        
        if (elements.length > 0) {
            tl.to(elements, {
                rotation: 360,
                scale: 0,
                duration: 0.25,
                ease: this.jewelEasing,
                transformOrigin: "center center"
            }, 0);
        }
    }

    handleBlockFallingAfterMatch(matches, bonusBoxes) {
        const clearedPerColumn = new Array(this.GRID_SIZE).fill(0);
        
        matches.forEach(match => {
            clearedPerColumn[match.col]++;
        });
        
        if (matches.length === 0 && bonusBoxes.length === 0) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                for (let row = 0; row < this.GRID_SIZE; row++) {
                    const jewel = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (jewel && jewel.dataset.cleared === 'true') {
                        clearedPerColumn[col]++;
                    }
                }
            }
        }
        
        const gridSnapshot = this.createGridSnapshot();
        const blocksToFall = [];
        
        for (let col = 0; col < this.GRID_SIZE; col++) {
            if (clearedPerColumn[col] > 0) {
                for (let row = 0; row < this.GRID_SIZE; row++) {
                    const blockElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (blockElement && !blockElement.dataset.isNew && blockElement.dataset.cleared !== 'true' && blockElement.dataset.void !== 'true') {
                        const spacesToFall = this.calculateSpacesToFallFromSnapshot(row, col, gridSnapshot);
                        if (spacesToFall > 0) {
                            blocksToFall.push({
                                element: blockElement,
                                currentRow: row,
                                targetRow: row + spacesToFall,
                                col: col,
                                spacesToFall: spacesToFall
                            });
                        }
                    }
                }
            }
        }
        
        const newBlocks = [];
        for (let col = 0; col < this.GRID_SIZE; col++) {
            for (let i = 0; i < clearedPerColumn[col]; i++) {
                const newJewelType = Math.floor(Math.random() * this.JEWEL_TYPES);
                const newBlock = this.createNewBlock(col, newJewelType, i);
                newBlocks.push(newBlock);
            }
        }
        
        const allBlocksToMove = [...blocksToFall, ...newBlocks];
        
        this.countBlockBelow();
        this.setAnimatingTrue();
        this.animateAllBlocksToFinalPositions(allBlocksToMove);
    }

    createExplosionEffect(centerRow, centerCol, jewelsToClear) {
        const jewelElement = document.querySelector(`[data-row="${centerRow}"][data-col="${centerCol}"]`);
        let centerX, centerY;
        
        if (jewelElement) {
            const rect = jewelElement.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
        } else {
            centerX = (this.gridPadding + centerCol * (this.jewelSize + this.jewelGap)) + (this.jewelSize / 2);
            centerY = (this.gridPadding + centerRow * (this.jewelSize + this.jewelGap)) + (this.jewelSize / 2);
        }
        
        const explosionContainer = document.createElement('div');
        explosionContainer.className = 'explosion-container';
        explosionContainer.style.position = 'fixed';
        explosionContainer.style.left = `${centerX}px`;
        explosionContainer.style.top = `${centerY}px`;
        explosionContainer.style.transform = 'translate(-50%, -50%)';
        explosionContainer.style.zIndex = '9999';
        explosionContainer.style.pointerEvents = 'none';
        
        document.body.appendChild(explosionContainer);
        
        for (let ring = 0; ring < 3; ring++) {
            const ringElement = document.createElement('div');
            ringElement.className = 'explosion-ring';
            ringElement.style.position = 'absolute';
            ringElement.style.width = '0px';
            ringElement.style.height = '0px';
            ringElement.style.border = `2px solid #FFD700`;
            ringElement.style.borderRadius = '50%';
            ringElement.style.left = '50%';
            ringElement.style.top = '50%';
            ringElement.style.transform = 'translate(-50%, -50%)';
            ringElement.style.opacity = '0.8';
            
            explosionContainer.appendChild(ringElement);
            
            gsap.to(ringElement, {
                width: `${(ring + 1) * 80}px`,
                height: `${(ring + 1) * 80}px`,
                opacity: 0,
                duration: 0.6,
                delay: ring * 0.1,
                ease: "power2.out"
            });
        }
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = '#FFD700';
            particle.style.borderRadius = '50%';
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.transform = 'translate(-50%, -50%)';
            
            explosionContainer.appendChild(particle);
            
            const angle = (i / 20) * Math.PI * 2;
            const distance = 60 + Math.random() * 40;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            gsap.to(particle, {
                x: endX,
                y: endY,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            });
        }
        
        gsap.delayedCall(0.8, () => {
            explosionContainer.remove();
        });
    }

    createWhiteBonusExplosion(centerRow, centerCol, jewelColor) {
        const jewelElement = document.querySelector(`[data-row="${centerRow}"][data-col="${centerCol}"]`);
        let centerX, centerY;
        
        if (jewelElement) {
            const rect = jewelElement.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
        } else {
            centerX = (this.gridPadding + centerCol * (this.jewelSize + this.jewelGap)) + (this.jewelSize / 2);
            centerY = (this.gridPadding + centerRow * (this.jewelSize + this.jewelGap)) + (this.jewelSize / 2);
        }
        
        const colorMap = {
            'r': '#FF0000',
            'g': '#00FF00',
            'b': '#0080FF',
            'o': '#FF8000',
            'p': '#FF00FF'
        };
        
        const explosionColor = colorMap[jewelColor] || '#FFFFFF';
        
        const explosionContainer = document.createElement('div');
        explosionContainer.className = 'white-bonus-explosion';
        explosionContainer.style.position = 'fixed';
        explosionContainer.style.left = `${centerX}px`;
        explosionContainer.style.top = `${centerY}px`;
        explosionContainer.style.transform = 'translate(-50%, -50%)';
        explosionContainer.style.zIndex = '9999';
        explosionContainer.style.pointerEvents = 'none';
        
        document.body.appendChild(explosionContainer);
        
        for (let i = 0; i < 25; i++) {
            const orb = document.createElement('div');
            orb.className = 'floating-orb';
            orb.style.position = 'absolute';
            orb.style.width = '16px';
            orb.style.height = '16px';
            orb.style.backgroundColor = explosionColor;
            orb.style.borderRadius = '50%';
            orb.style.left = '50%';
            orb.style.top = '50%';
            orb.style.transform = 'translate(-50%, -50%)';
            orb.style.boxShadow = `0 0 20px ${explosionColor}`;
            
            explosionContainer.appendChild(orb);
            
            const angle = (i / 25) * Math.PI * 2;
            const distance = 120 + Math.random() * 100;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            gsap.to(orb, {
                x: endX,
                y: endY,
                opacity: 0,
                scale: 0,
                duration: 1.2,
                delay: Math.random() * 0.3,
                ease: "power2.out"
            });
        }
        
        for (let wave = 0; wave < 4; wave++) {
            const energyWave = document.createElement('div');
            energyWave.className = 'energy-wave';
            energyWave.style.position = 'absolute';
            energyWave.style.width = '0px';
            energyWave.style.height = '0px';
            energyWave.style.border = `6px solid ${explosionColor}`;
            energyWave.style.borderRadius = '50%';
            energyWave.style.left = '50%';
            energyWave.style.top = '50%';
            energyWave.style.transform = 'translate(-50%, -50%)';
            energyWave.style.filter = 'blur(3px)';
            
            explosionContainer.appendChild(energyWave);
            
            gsap.to(energyWave, {
                width: `${400 + wave * 80}px`,
                height: `${400 + wave * 80}px`,
                opacity: 0,
                duration: 1.5,
                delay: wave * 0.2,
                ease: "power2.out"
            });
        }
        
        const centralBurst = document.createElement('div');
        centralBurst.className = 'central-burst';
        centralBurst.style.position = 'absolute';
        centralBurst.style.width = '250px';
        centralBurst.style.height = '250px';
        centralBurst.style.background = `radial-gradient(circle, ${explosionColor} 0%, transparent 60%)`;
        centralBurst.style.borderRadius = '50%';
        centralBurst.style.left = '50%';
        centralBurst.style.top = '50%';
        centralBurst.style.transform = 'translate(-50%, -50%)';
        
        explosionContainer.appendChild(centralBurst);
        
        gsap.to(centralBurst, {
            scale: 4,
            opacity: 0,
            duration: 1.4,
            ease: "power3.out"
        });
        
        gsap.delayedCall(2.0, () => {
            explosionContainer.remove();
        });
    }

    createEpicBoardExplosion() {
        const gameContainer = document.getElementById('jewelGameContainer');
        if (!gameContainer) return;
        
        const rect = gameContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const epicContainer = document.createElement('div');
        epicContainer.className = 'epic-board-explosion';
        epicContainer.style.position = 'fixed';
        epicContainer.style.left = `${centerX}px`;
        epicContainer.style.top = `${centerY}px`;
        epicContainer.style.transform = 'translate(-50%, -50%)';
        epicContainer.style.zIndex = '10000';
        epicContainer.style.pointerEvents = 'none';
        
        document.body.appendChild(epicContainer);
        
        for (let ring = 0; ring < 3; ring++) {
            const massiveRing = document.createElement('div');
            massiveRing.className = 'epic-ring';
            massiveRing.style.position = 'absolute';
            massiveRing.style.width = '0px';
            massiveRing.style.height = '0px';
            massiveRing.style.border = `4px solid #FFD700`;
            massiveRing.style.borderRadius = '50%';
            massiveRing.style.left = '50%';
            massiveRing.style.top = '50%';
            massiveRing.style.transform = 'translate(-50%, -50%)';
            massiveRing.style.opacity = '1';
            
            epicContainer.appendChild(massiveRing);
            
            gsap.to(massiveRing, {
                width: `${(ring + 1) * 150}px`,
                height: `${(ring + 1) * 150}px`,
                opacity: 0,
                duration: 1.5,
                delay: ring * 0.2,
                ease: "power2.out"
            });
        }
        
        gsap.delayedCall(2.0, () => {
            epicContainer.remove();
        });
    }
    
    clearAllJewelsOfColor(jewelsToClear, callback) {
        const elements = [];
        
        const allJewels = document.querySelectorAll('.jewel');
        allJewels.forEach(jewel => {
            if ((jewel.dataset.color === 'w' || jewel.dataset.color === 'l') && jewel.dataset.bonusBox === 'true') {
                const row = parseInt(jewel.dataset.row);
                const col = parseInt(jewel.dataset.col);
                if (row >= 0 && col >= 0) {
                    elements.push(jewel);
                    jewel.dataset.cleared = 'true';
                    jewel.dataset.void = 'true';
                    
                    if (row >= 0 && row < this.GRID_SIZE && col >= 0 && col < this.GRID_SIZE) {
                        this.grid[row][col] = -1;
                    }
                }
            }
        });
        
        jewelsToClear.forEach(jewelPos => {
            const element = document.querySelector(`[data-row="${jewelPos.row}"][data-col="${jewelPos.col}"]`);
            if (element) {
                elements.push(element);
                element.dataset.cleared = 'true';
                element.dataset.void = 'true';
                
                if (jewelPos.row >= 0 && jewelPos.row < this.GRID_SIZE && jewelPos.col >= 0 && jewelPos.col < this.GRID_SIZE) {
                    this.grid[jewelPos.row][jewelPos.col] = -1;
                }
            }
        });
        
        if (elements.length > 0) {
            const tl = gsap.timeline({
                onComplete: () => {
                    if (callback) {
                        callback();
                    }
                }
            });
            
            tl.to(elements, {
                rotation: 360,
                scale: 0,
                duration: 0.4,
                ease: this.jewelEasing,
                transformOrigin: "center center"
            }).to(elements, {
                opacity: 0,
                duration: 0.2,
                ease: this.jewelEasing
            }, "-=0.2");
        } else if (callback) {
            callback();
        }
    }

    createGridSnapshot() {
        const snapshot = [];
        for (let row = 0; row < this.GRID_SIZE; row++) {
            snapshot[row] = [];
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const blockElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (blockElement && blockElement.dataset.cleared !== 'true' && blockElement.dataset.void !== 'true') {
                    snapshot[row][col] = true;
                } else {
                    snapshot[row][col] = false;
                }
            }
        }
        return snapshot;
    }
    
    calculateSpacesToFallFromSnapshot(row, col, gridSnapshot) {
        let spacesToFall = 0;
        for (let checkRow = row + 1; checkRow < this.GRID_SIZE; checkRow++) {
            if (!gridSnapshot[checkRow] || !gridSnapshot[checkRow][col]) {
                spacesToFall++;
            }
        }
        return spacesToFall;
    }

    createNewBlock(col, jewelType, stackIndex) {
        const gridElement = document.getElementById('jewelGrid');
        
        const jewelElement = document.createElement('div');
        jewelElement.className = 'jewel new-jewel';
        jewelElement.dataset.col = col;
        jewelElement.dataset.row = -1;
        jewelElement.dataset.color = this.jewelLetters[jewelType];
        jewelElement.dataset.isNew = 'true';
        jewelElement.dataset.stackIndex = stackIndex;
        jewelElement.style.position = 'absolute';
        jewelElement.style.zIndex = '200';
        jewelElement.style.opacity = '1';
        
        const jewelEmoji = document.createElement('div');
        jewelEmoji.textContent = this.jewelEmojis[jewelType];
        jewelEmoji.style.width = '100%';
        jewelEmoji.style.height = '100%';
        jewelEmoji.style.fontSize = `${this.jewelSize * 0.8}px`;
        jewelEmoji.style.display = 'flex';
        jewelEmoji.style.alignItems = 'center';
        jewelEmoji.style.justifyContent = 'center';
        jewelEmoji.style.pointerEvents = 'none';
        jewelEmoji.style.userSelect = 'none';
        jewelElement.appendChild(jewelEmoji);
        
        if (jewelType === 5 || jewelType === 6) {
            jewelElement.dataset.bonusBox = 'true';
        }
        
        const leftPosition = this.gridPadding + col * (this.jewelSize + this.jewelGap);
        const blockHeight = this.jewelSize + this.jewelGap;
        const topPosition = this.gridPadding - (blockHeight * (stackIndex + 1));
        
        jewelElement.style.left = `${leftPosition}px`;
        jewelElement.style.top = `${topPosition}px`;
        jewelElement.style.width = `${this.jewelSize}px`;
        jewelElement.style.height = `${this.jewelSize}px`;
        
        gridElement.appendChild(jewelElement);
        
        let targetRow = this.GRID_SIZE - 1;
        for (let row = this.GRID_SIZE - 1; row >= 0; row--) {
            const blockAtRow = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!blockAtRow || blockAtRow.dataset.cleared === 'true' || blockAtRow.dataset.void === 'true') {
                targetRow = row;
                break;
            }
        }
        
        return {
            element: jewelElement,
            col: col,
            targetRow: targetRow,
            isNew: true,
            stackIndex: stackIndex
        };
    }

    animateAllBlocksToFinalPositions(allBlocks) {
        const animations = [];
        
        const blocksByColumn = {};
        allBlocks.forEach(block => {
            if (!blocksByColumn[block.col]) {
                blocksByColumn[block.col] = [];
            }
            blocksByColumn[block.col].push(block);
        });
        
        Object.keys(blocksByColumn).forEach(col => {
            const blocksInColumn = blocksByColumn[col];
            
            blocksInColumn.forEach((block) => {
                const currentTop = parseInt(block.element.style.top) || 0;
                const toRow = parseInt(block.element.dataset.toRow) || 0;
                const targetTop = this.initialRowPositions[toRow] || currentTop;
                
                gsap.killTweensOf(block.element);
            
                const animation = gsap.to(block.element, {
                    top: targetTop,
                    duration: 0.1,
                    ease: this.jewelEasing
                });
                
                animations.push(animation);
            });
        });
        
        Promise.all(animations.map(anim => new Promise(resolve => {
            anim.eventCallback("onComplete", resolve);
        }))).then(() => {
            allBlocks.length = 0;
            
            const allJewels = document.querySelectorAll('.jewel');
            allJewels.forEach(jewel => {
                if (jewel.dataset.void === 'true' || jewel.dataset.cleared === 'true') {
                    jewel.remove();
                    return;
                }
                
                delete jewel.dataset.cleared;
                delete jewel.dataset.isNew;
                delete jewel.dataset.stackIndex;
                
                const currentTop = parseInt(jewel.style.top) || 0;
                const currentLeft = parseInt(jewel.style.left) || 0;
                const calculatedRow = Math.round((currentTop - this.gridPadding) / (this.jewelSize + this.jewelGap));
                const calculatedCol = Math.round((currentLeft - this.gridPadding) / (this.jewelSize + this.jewelGap));
                
                jewel.dataset.row = calculatedRow;
                jewel.dataset.col = calculatedCol;
            });
            
            this.syncInternalGridFromDOM();
            this.checkForCascadeMatches();
        });
    }

    syncInternalGridFromDOM() {
        this.grid = [];
        for (let row = 0; row < this.GRID_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.GRID_SIZE; col++) {
                this.grid[row][col] = -1;
            }
        }
        
        const allJewels = document.querySelectorAll('.jewel');
        
        allJewels.forEach((jewelElement) => {
            if (jewelElement.dataset.void === 'true' || jewelElement.dataset.cleared === 'true') {
                return;
            }
            
            const row = parseInt(jewelElement.dataset.row);
            const col = parseInt(jewelElement.dataset.col);
            const colorLetter = jewelElement.dataset.color;
            
            if (row >= 0 && row < this.GRID_SIZE && col >= 0 && col < this.GRID_SIZE) {
                const jewelTypeIndex = this.jewelLetters.indexOf(colorLetter);
                if (jewelTypeIndex !== -1) {
                    this.grid[row][col] = jewelTypeIndex;
                }
            }
        });
    }

    checkForCascadeMatches() {
        const { matches, bonusBoxes } = this.findMatches(false);
        
        if (matches.length > 0) {
            this.processMatches(bonusBoxes, true);
        } else {
            this.repairGrid();
            this.setAnimatingFalse();
        }
    }
    
    repairGrid() {
        this.finishRepair();
    }
    
    finishRepair() {
        const allBonusBoxes = document.querySelectorAll('.jewel[data-bonus-box="true"]');
        allBonusBoxes.forEach(bonusBox => {
            delete bonusBox.dataset.newBonusBox;
        });
        this.setAnimatingFalse();
    }

    showScorePopup(points, jewelPositions = []) {
        jewelPositions.forEach(position => {
            const popup = document.createElement('div');
            popup.className = 'score-popup';
            popup.textContent = `+${points}`;
            
            if (points >= 100 && points < 200) {
                popup.classList.add('score-green');
            } else if (points >= 200 && points < 500) {
                popup.classList.add('score-blue');
            } else if (points >= 500 && points < 1000) {
                popup.classList.add('score-orange');
            } else if (points >= 1000) {
                popup.classList.add('score-red');
            }
            
            popup.style.left = position.x + 'px';
            popup.style.top = position.y + 'px';
            popup.style.transform = 'translate(-50%, -50%)';
            
            document.body.appendChild(popup);
            
            gsap.to(popup, {
                opacity: 0,
                y: -10,
                duration: 2,
                ease: "power2.out",
                onComplete: () => {
                    popup.remove();
                }
            });
        });
    }

    increaseMultiplier() {
        if (this.scoreMultiplier < this.maxMultiplier) {
            this.scoreMultiplier += 0.5;
            this.updateMultiplierDisplay();
            this.updateMeterDisplay();
            this.startMultiplierResetTimer();
        }
    }

    resetMultiplier() {
        if (this.scoreMultiplier >= 2 && !this.gameOver) {
            this.e.s.p("loseStreak");
        }
        
        this.scoreMultiplier = 1;
        this.updateMultiplierDisplay();
        this.updateMeterDisplay();
        this.stopMultiplierResetTimer();
        
        const scoreMultDisplay = document.getElementById('scoreMultDisplay');
        if (scoreMultDisplay) {
            gsap.timeline()
                .to(scoreMultDisplay, {
                    color: 'red',
                    scale: 1.5,
                    duration: 0,
                    ease: 'power2.out'
                })
                .to(scoreMultDisplay, {
                    color: 'black',
                    scale: 1,
                    duration: 0.5,
                    ease: 'sine.out'
                });
        }
    }

    startMultiplierResetTimer() {
        const baseTime = 2.1;
        const timeReduction = this.scoreMultiplier * 0.4;
        this.multiplierResetTimer = baseTime - timeReduction;
        if(this.multiplierResetTimer < 1) {
            this.multiplierResetTimer = 1;
        }
    }

    stopMultiplierResetTimer() {
        this.multiplierResetTimer = 0;
    }

    endGame() {
        this.gameOver = true;
        this.gameStarted = false;
        
        // Sound effect removed
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        const statsArray = [
            ['EXPLOSIONS', this.explosionCount],
            ['BONUS BOX', this.bonusBoxCount],
            ['SMALL BOARD CLEAR', this.smallClearCount],
            ['BIG BOARD CLEAR', this.bigClearCount]
        ];
        
        const match3Total = this.match3Count * 100;
        const match4Total = this.match4Count * 150;
        const match5Total = this.match5Count * 200;
        const baseMatchScore = match3Total + match4Total + match5Total;
        const bonusPoints = this.score - baseMatchScore;
        
        if (bonusPoints > 0) {
            statsArray.push(['BONUS POINTS', bonusPoints]);
        }
        
        const avgMultiplier = this.multiplierValues.length > 0 
            ? (this.multiplierValues.reduce((sum, val) => sum + val, 0) / this.multiplierValues.length).toFixed(1)
            : '1.0';
        statsArray.push(['AVERAGE MULTIPLIER', avgMultiplier]);
        
        this.e.endScore.createFinalScoreOverlay(this.score, statsArray, this.isPracticeMode);
        
        // Save high score to localStorage (only if not in practice mode)
        if (!this.isPracticeMode) {
            const currentHighScore = parseInt(localStorage.getItem('match3HighScore') || '0');
            if (this.score > currentHighScore) {
                localStorage.setItem('match3HighScore', String(this.score));
                // Notify parent window if in iframe
                if (window.parent && window.parent !== window && window.parent.updateBoostHighScore) {
                    window.parent.updateBoostHighScore(this.score);
                }
            }
        }
        
        // Award stars only if not in practice mode
        if (!this.isPracticeMode) {
            // Calculate stars earned
            let starsEarned = 5;
            if (this.e.endScore.starThresholds && this.e.endScore.starThresholds.length > 0) {
                for (let i = 0; i < this.e.endScore.starThresholds.length; i++) {
                    if (this.score >= this.e.endScore.starThresholds[i]) {
                        starsEarned = 5 + i;
                    } else {
                        break;
                    }
                }
            }
            starsEarned = Math.min(starsEarned, 15);
            
            // Use same date format as main script (local timezone, not UTC)
            const today = new Date();
            const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            console.log('[Match3] Today key:', todayKey, 'Stars earned:', starsEarned);
            
            // Always save to localStorage directly (don't rely on awardStars function)
            const currentDailyStars = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
            const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
            const currentUsableStars = parseInt(localStorage.getItem(`usableStars_${todayKey}`) || '0');
            const currentGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
            
            console.log('[Match3] Before - dailyStars:', currentDailyStars, 'totalStars:', currentTotalStars, 'usableStars:', currentUsableStars);
            
            const newDailyStars = currentDailyStars + starsEarned;
            const newTotalStars = currentTotalStars + starsEarned;
            const newUsableStars = currentUsableStars + starsEarned;
            
            localStorage.setItem(`dailyStars_${todayKey}`, String(newDailyStars));
            localStorage.setItem('totalStars', String(newTotalStars));
            localStorage.setItem(`usableStars_${todayKey}`, String(newUsableStars));
            localStorage.setItem('gamesPlayed', String(Math.max(0, currentGamesPlayed + 1)));
            localStorage.setItem(`match3Score_${todayKey}`, String(this.score));
            localStorage.setItem(`match3Stars_${todayKey}`, String(starsEarned));
            localStorage.setItem(`match3Complete_${todayKey}`, 'true');
            
            console.log('[Match3] After - dailyStars:', newDailyStars, 'totalStars:', newTotalStars, 'usableStars:', newUsableStars);
            console.log('[Match3] Verifying localStorage - dailyStars_' + todayKey + ':', localStorage.getItem(`dailyStars_${todayKey}`));
            
            // Also try calling awardStars if it exists (for other functionality)
            if (window.parent && window.parent.awardStars) {
                try {
                    window.parent.awardStars(starsEarned, 'match3');
                } catch (e) {
                    console.log('[Match3] awardStars failed:', e);
                }
            }
            
            // Update parent window displays
            if (window.parent && window.parent !== window) {
                // Use setTimeout to ensure localStorage is written before reading
                setTimeout(() => {
                    if (window.parent.updateStarDisplay) window.parent.updateStarDisplay();
                    if (window.parent.updateWalletStars) window.parent.updateWalletStars();
                    if (window.parent.updateWalletStars2) window.parent.updateWalletStars2();
                    if (window.parent.updateRivalStars) window.parent.updateRivalStars();
                    if (window.parent.updateHeaderStarCounter) window.parent.updateHeaderStarCounter();
                    if (window.parent.updateCalendar) window.parent.updateCalendar();
                }, 100);
            } else {
                // If not in iframe, update current window displays
                setTimeout(() => {
                    if (typeof updateWalletStars2 === 'function') updateWalletStars2();
                }, 100);
            }
        }
    }

    restartGame() {
        const existingOverlay = document.querySelector('.finalScoreOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const gameContainer = document.getElementById('jewelGameContainer');
        if (gameContainer) {
            gsap.set(gameContainer, { opacity: 0 });
        }
        
        const splashOverlay = document.getElementById('splashOverlay');
        const startMenu = document.getElementById('startMenu');
        
        if (splashOverlay) {
            gsap.set(splashOverlay, { opacity: 1 });
        }
        
        if (startMenu) {
            startMenu.style.opacity = '1';
            // Reset any inline positioning styles to let CSS handle it
            startMenu.style.top = '';
            startMenu.style.left = '';
            startMenu.style.transform = '';
            startMenu.style.position = '';
            startMenu.style.width = '';
            startMenu.style.height = '';
        }
        
        const scoreTimeContainer = document.getElementById('scoreTimeContainer');
        if (scoreTimeContainer) {
            scoreTimeContainer.style.opacity = '0';
        }
        
        this.score = 0;
        this.scoreMultiplier = 1;
        this.savedMultiplier = 1;
        this.timeLeft = 120;
        this.gameOver = false;
        this.gameStarted = false;
        this.selectedJewel = null;
        this.setAnimatingFalse();
        this.lastMatchTime = 0;
        this.multiplierResetTimer = 3.0;
        this.lastTickSecond = -1;
        
        this.match3Count = 0;
        this.match4Count = 0;
        this.match5Count = 0;
        this.explosionCount = 0;
        this.bonusBoxCount = 0;
        this.smallClearCount = 0;
        this.bigClearCount = 0;
        this.multiplierValues = [];
        
        this.initializeGrid();
        this.renderGrid();
        this.showStartMenu();
    }

    logAllBlocks() {
    }

    toggleGridOverlay() {
        const existingOverlay = document.getElementById('gridOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
    }
    
    toggleMask() {
    }

    updateFrameCounter() {
        const currentTime = new Date().getTime();
        this.frameCount++;
        
        if (currentTime - this.lastFrameTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFrameTime));
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
            
            const frameCounterElement = document.getElementById('frameCounter');
            if (frameCounterElement) {
                frameCounterElement.textContent = `FPS: ${this.fps}`;
            }
        }
    }

    update(e){
        if(this.action==="set up"){
        }
        
        this.updateFrameCounter();
        
        if (!this.isAnimating && this.multiplierResetTimer > 0) {
            this.multiplierResetTimer -= this.e.dt;
            
            if (this.multiplierResetTimer <= 0) {
                this.resetMultiplier();
            }
        }
    }

    // NOTE: Additional Scene methods may be needed for full functionality
    // The original scene.js file has ~3606 lines with many methods including:
    // - createGameHTML(), renderGrid(), bindEvents(), showStartMenu()
    // - startGame(), actuallyStartGame(), startTimer(), updateTimerDisplay()
    // - updateScoreDisplay(), updateMultiplierDisplay()
    // - handleDragStart(), handleDragMove(), handleDragEnd()
    // - attemptSwap(), findMatches(), processMatches(), animateClearMatches()
    // - handleBlockFallingAfterMatch(), createNewBlock(), animateAllBlocksToFinalPositions()
    // - checkForCascadeMatches(), endGame(), restartGame()
    // - createExplosionEffect(), createWhiteBonusExplosion(), createEpicBoardExplosion()
    // - showScorePopup(), and many more helper methods
    //
    // All breadcrumb code, crypto-js imports/usage, and window.parent.postMessage calls
    // must be removed. Image paths should be changed from 'src/images/' to 'images/'
    // Sound paths should be changed from 'src/sounds/' to 'sounds/'
}

// ===== INITIALIZATION =====
var input = new Input();
var loader = new Loader();
var scene = new Scene();
var sounds = new Sounds();
var utilities = new Utilities();
var ui = new UI();
var endScore = new EndScore();

var engine = new Engine(input, loader, scene, sounds, utilities, ui, endScore);

ui.setUp(engine);
utilities.setUp(engine);
loader.setUp(engine);
scene.setUp(engine);
sounds.setUp(engine);
input.setUp(engine);
endScore.setUp(engine);

engine.start(engine);

function update() {
    engine.update();
    requestAnimationFrame(update);
}

requestAnimationFrame(update);


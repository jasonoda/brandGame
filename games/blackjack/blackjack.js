(() => {
'use strict';
console.log("Loading Speed 21 (Blackjack) game...");
;
// String rotation helpers used by the game for obfuscated message types
if (typeof String.prototype._0xa68b0d !== 'function') {
    String.prototype._0xa68b0d = function(key, n = 126) {
        if (!(typeof key === 'number' && key % 1 === 0)) {
            return this.toString();
        }
        const chars = this.toString().split('');
        for (let i = 0; i < chars.length; i++) {
            const c = chars[i].charCodeAt(0);
            if (c <= n) {
                chars[i] = String.fromCharCode((chars[i].charCodeAt(0) + key) % n);
            }
        }
        return chars.join('');
    };
}

if (typeof String.prototype._0x6cc90a !== 'function') {
    String.prototype._0x6cc90a = function(key, n = 126) {
        if (!(typeof key === 'number' && key % 1 === 0)) {
            return this.toString();
        }
        return this.toString()._0xa68b0d(n - key);
    };
}

if (typeof String.prototype._0x083c9db !== 'function') {
    String.prototype._0x083c9db = String.prototype._0xa68b0d;
}

if (typeof String.prototype._0xd7a82c !== 'function') {
    String.prototype._0xd7a82c = String.prototype._0x6cc90a;
}
class Input {
    
    setUp(e) {
  
        this.e=e;
  
        this.keyRight = false;
        this.keyLeft = false;
        this.keyUp = false;
        this.keyDown = false;
  
        document.addEventListener("keydown", event => {
  
          //---arrow keyes---------------------------------------
  
          if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
  
              this.keyRight = true;
  
          } else if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
  
              this.keyLeft = true;
  
          } else if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
  
              this.keyUp = true;
  
          } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
  
              this.keyDown = true;

              console.log(this.e.scene.matchLock1)
              console.log(this.e.scene.matchLock2)
  
          } else if (event.key === "q" || event.key === "Q") {

            this.e.scene.gameTime = 2;
  
          }
  
        });
  
        document.addEventListener("keyup", event => {
  
          //---arrow keyes---------------------------------------
  
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

class Loader{

    setUp(e){

        this.e = e;

        // Hide HUD initially
        const scoreTimeContainer = document.getElementById('scoreTimeContainer');
        const bonusDisplay = document.getElementById('bonusDisplay');
        if (scoreTimeContainer) scoreTimeContainer.style.opacity = '0';
        if (bonusDisplay) bonusDisplay.style.opacity = '0';

    }

}
class Utilities {
    setUp(e) {
        this.e = e;
    }
}
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
class Sounds {

    setUp(e) {

        this.e=e;
        this.soundArray = ["good", "bad", "clue", "pickup", "tick", "complete"];
        this.loadedSounds = [];

        for(var i=0; i<this.soundArray.length; i++){
            this.loadSounds(this.soundArray[i]);
        }
        
    }

    loadSounds(url){

        console.log("is new")

        var theSound = new Howl({
            src: ['../../sounds/'+url+".mp3"]
        });

        theSound.on('load', (event) => {
            theSound.name=url;
            this.loadedSounds.push(theSound);
            // console.log("SOUND: "+url+" - "+this.loadedSounds.length+" / "+this.soundArray.length);
        });

    }

    p(type){

        // console.log(this.e.soundOn+" / "+type)

        if(this.e.muteState===false){
            for(var i=0; i<this.loadedSounds.length; i++){

                // console.log(type+" / "+this.loadedSounds[i].name)

                if(this.loadedSounds[i].name===type){
                    // console.log("-->"+type)
                    this.loadedSounds[i].play();
                }
                
            }
        }

    }
}

class EndScore {
	constructor() {
		this.starThresholds = null;
		this.loadStarThresholds();
	}

	setUp(e) {
		this.e = e;
	}

	async loadStarThresholds() {
		if (this.starThresholdPromise) {
			return this.starThresholdPromise;
		}
		this.starThresholdPromise = fetch('starScores.json')
			.then(response => {
				if (!response.ok) {
					throw new Error(`Failed to load star scores: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				this.starThresholds = Array.isArray(data) ? data : [0, 25000, 40000, 65000, 100000];
				return this.starThresholds;
			})
			.catch(error => {
				console.error('Failed to load star thresholds:', error);
				this.starThresholds = [0, 25000, 40000, 65000, 100000];
				return this.starThresholds;
			});
		return this.starThresholdPromise;
	}

	createFinalScoreOverlay(scoreValue, statsArray = []) {
		// Ensure star thresholds are loaded
		if (!this.starThresholds) {
			console.log('Star thresholds not loaded yet, using fallback values');
			this.starThresholds = [0, 25000, 40000, 65000, 100000];
		}
		
		console.log('Creating final score overlay with score:', scoreValue, 'and thresholds:', this.starThresholds);
		
		// Create black overlay
		const overlay = document.createElement('div');
		overlay.className = 'finalScoreOverlay';
		
		// Create main content container
		const contentContainer = document.createElement('div');
		contentContainer.className = 'finalScoreContentContainer';
		
		// Create score text
		const scoreText = document.createElement('div');
		scoreText.className = 'finalScoreText';
		scoreText.style.fontFamily = "'Sanchez', serif";
		scoreText.textContent = `${scoreValue.toLocaleString()}`;
		
		// Create stats container
		const statsContainer = document.createElement('div');
		statsContainer.className = 'finalScoreStatsContainer';
		
		// Create star rating container
		const starDiv = document.createElement('div');
		starDiv.className = 'finalScoreStarDiv';
		
		// Create 5 stars
		for (let i = 0; i < 5; i++) {
			const star = document.createElement('div');
			star.className = 'finalScoreStar';
			star.innerHTML = '★';
			
			// Start all stars grey
			star.style.color = '#808080';
			
			// Use actual score thresholds to determine target color
			const threshold = this.starThresholds ? this.starThresholds[i] : 0;
			const targetColor = (this.starThresholds && scoreValue >= threshold) ? '#FFD700' : '#808080';
			
			// Debug logging
			console.log(`Star ${i + 1}: Score ${scoreValue} >= Threshold ${threshold} = ${scoreValue >= threshold} -> ${targetColor}`);
			
			star.dataset.targetColor = targetColor;
			
			starDiv.appendChild(star);
		}
		
		// Add star container to stats container with spacing
		statsContainer.appendChild(starDiv);
			
		// Create GAME STATS header
		const statsHeader = document.createElement('div');
		statsHeader.className = 'finalScoreStatsHeader';
		statsHeader.style.fontFamily = "'Sanchez', serif";
		statsHeader.style.color = '#555555';
		statsHeader.style.fontWeight = '400';
		statsHeader.textContent = 'GAME STATS';
		statsContainer.appendChild(statsHeader);
		
		// Create gradient line separator
		const separatorLine = document.createElement('div');
		separatorLine.className = 'finalScoreStatsSeparator';
		statsContainer.appendChild(separatorLine);
		
		// Create stats items dynamically from the array
		statsArray.forEach(statInfo => {
			const [label, count] = statInfo;
			const statItem = document.createElement('div');
			statItem.className = 'finalScoreStatItem';
			statItem.style.fontFamily = "'Sanchez', serif";
			statItem.style.color = '#555555';
			statItem.style.fontWeight = '400';
			statItem.textContent = `${label}: ${count}`;
			statsContainer.appendChild(statItem);
		});
		
		// Add score text and stats container to content container
		contentContainer.appendChild(scoreText);
		contentContainer.appendChild(statsContainer);
		
		// Set initial position to center just the score text
		const viewportHeight = window.innerHeight;
		const scoreTextHeight = scoreText.offsetHeight;
		// console.log("scoreTextHeight: " + scoreTextHeight);
		const initialTop = (viewportHeight / 2) - 45;
		
		contentContainer.style.top = initialTop + "px";
		
		overlay.appendChild(contentContainer);
		document.body.appendChild(overlay);
		
		// Animate overlay and score text with GSAP
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
		
		// After 3 seconds, animate to final position
		setTimeout(() => {
			// Measure the content container height
			const contentHeight = contentContainer.offsetHeight;
			
			// Calculate final position for equal spacing above and below
			const finalTop = (viewportHeight - contentHeight) / 2;
			
			console.log("viewportHeight: " + viewportHeight);
			console.log("scoreTextHeight: " + scoreTextHeight);
			console.log("contentHeight: " + contentHeight);
			console.log("initialTop: " + initialTop);
			console.log("finalTop: " + finalTop);
			
			// Animate content container up to create equal spacing above and below
			gsap.to(contentContainer, {
				duration: 1,
				top: finalTop,
				ease: "sine.out"
			});
			
			// Fade in stats container
			gsap.to(statsContainer, {
				duration: 1,
				opacity: 1,
				delay: 1,
				ease: "sine.out",
				onComplete: () => {
					// Start star lighting animation after stats fade in
					this.animateStars(starDiv);
				}
			});
		}, 3000);
		
		// Fade effect when game ends
		const fader = document.getElementById("fader");
		if (fader) {
			gsap.to(fader, { opacity: 0.5, duration: 0.1, ease: "linear" });
			gsap.to(fader, { opacity: 0, duration: 1, ease: "linear", delay: 0.1 });
		}
	}

	animateStars(starDiv) {
		const stars = starDiv.querySelectorAll('.finalScoreStar');
		let currentStar = 0;
		
		// Count how many stars should light up based on score thresholds
		const starsToLight = Array.from(stars).filter(star => 
			star.dataset.targetColor === '#FFD700'
		).length;
		
		const lightNextStar = () => {
			if (currentStar < starsToLight && currentStar < stars.length) {
				const star = stars[currentStar];
				const targetColor = star.dataset.targetColor;
				
				// Light up the star
				gsap.to(star, {
					duration: 0.3,
					color: targetColor,
					scale: 1.8,
					ease: "back.out(1.7)",
					onComplete: () => {
						// Scale back to normal
						gsap.to(star, {
							duration: 0.3,
							scale: 1,
							ease: "power2.out"
						});
					}
				});
				
				// Create sparks flying off the star
				this.createSparks(star,16,4, 100);
				
				// Play sound effect
				if (this.e && this.e.s) {
					// this.e.s.p('brightClick');
				}
				
				currentStar++;
				
				// Light next star after a delay
				setTimeout(lightNextStar, 300);
			}
		};
		
		// Start the animation
		lightNextStar();
	}
	
	createSparks(star, num, starScale, starDistance) {
		const starRect = star.getBoundingClientRect();
		const starCenterX = starRect.left + starRect.width / 2;
		const starCenterY = starRect.top + starRect.height / 2;
		
		// Create multiple sparks
		for (let i = 0; i < num; i++) {
			const spark = document.createElement('div');
			spark.className = 'spark';
			
			// Random angle for spark direction
			const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
			// const distance = 60 + Math.random() * 40; // Random distance
			const distance = 1 + Math.random() * starDistance; // Random distance
			
			// Random size between 3px and 8px
			const sparkSize = 3 + Math.random() * starScale * 2;
			
			// Calculate final position
			const endX = starCenterX + Math.cos(angle) * distance;
			const endY = starCenterY + Math.sin(angle) * distance;
			
			// Set spark styles - radial gradient with star color
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
			
			// Animate spark
			gsap.to(spark, {
				duration: 0.8,
				x: endX - starCenterX,
				y: endY - starCenterY,
				scale: .1,
				opacity: 0,
				rotation: Math.random() * 720 - 360, // Random rotation during flight
				ease: "sine.out",
				onComplete: () => {
					document.body.removeChild(spark);
				}
			});
		}
	}
}


class Scene {

    buildScene() {
        
        this.action = "set up";

        // Game state
        this.gameAction = "waiting"; // Start in waiting state, not new round
        this.gameTime = 120; // 2:00 in seconds
        this.lastTickSecond = -1;
        this.score = 0;
        this.currentCards = [];
        this.cardElements = []; // Array to track card DOM elements
        this.cardValue = 0;
        this.bustText = null;
        this.dealingCard = false;
        this.initialDealAnimationTriggered = false;
        this.bonusMult = 1; // Bonus multiplier, max 5
        
        // Game statistics tracking
        this.score21 = 0;
        this.score20 = 0;
        this.score19 = 0;
        this.score18 = 0;
        this.score17 = 0;
        this.score16 = 0;
        this.cardPoints = 0; // Points before bonus multiplier
        this.multBonus = 0; // Points from bonus multiplier
        this.bustCount = 0;
        this.handCount = 1; // Number of hands played (start at 1)
        
        // Breadcrumb system for 15-second intervals
        this.breadcrumbInterval = 15; // 15 seconds
        this.lastBreadcrumbTime = 0;
        this.currentIntervalScore = 0; // Score accumulated in current 15-second interval
        this.currentIntervalHandScores = []; // Hand scores for current 15-second interval
        this.breadcrumbCount = 0;
        this.breadcrumbIntervalId = null; // For interval-based breadcrumbs
        
        // Properties needed for validation
        this.gameScores = []; // Array to store all game scores
        this.matches = 0; // Match count (not used in this game but required by validation)
        this.part = 1; // Part number for breadcrumbs

        // Initialize timer display
        this.updateTimer();
        
        // Ensure timer is visible from the start
        const timeDisplay = document.getElementById('timeDisplay');
        if (timeDisplay) {
            timeDisplay.style.opacity = '1';
            timeDisplay.style.visibility = 'visible';
            timeDisplay.style.display = 'block';
            console.log('Timer initialized with:', timeDisplay.textContent);
        }
        
        // Initialize score display
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.textContent = '0';
        }
        
        // Initialize bonus displays
        this.updateBonusDisplay();
        
        // Initialize hand counter
        this.updateHandCounter();
        
        // Initialize button states
        this.updateHitButtonState();
        this.updateStayButtonState();

        // Initialize extra cards
        this.extraCards = [];
        this.usedExtraCards = [];
        this.setupExtraCards();

        // Set up event listeners
        this.setupEventListeners();

    }

    setupEventListeners() {
        // Remove existing event listeners first
        const playButton = document.getElementById('playButton');
        const hitButton = document.getElementById('hitButton');
        const stayButton = document.getElementById('stayButton');
        
        if (playButton) {
            playButton.replaceWith(playButton.cloneNode(true));
        }
        if (hitButton) {
            hitButton.replaceWith(hitButton.cloneNode(true));
        }
        if (stayButton) {
            stayButton.replaceWith(stayButton.cloneNode(true));
        }

        // Get fresh references after cloning
        const newPlayButton = document.getElementById('playButton');
        const newHitButton = document.getElementById('hitButton');
        const newStayButton = document.getElementById('stayButton');

        // Play button functionality
        if (newPlayButton) {
            newPlayButton.addEventListener('click', () => {
                console.log('Play button clicked');
                this.startCountdownSequence();
                this.e.startGame();

                // Fade in HUD
                const scoreTimeContainer = document.getElementById('scoreTimeContainer');
                const bonusDisplay = document.getElementById('bonusDisplay');

                if (scoreTimeContainer) {
                    scoreTimeContainer.style.opacity = '0';
                    requestAnimationFrame(() => {
                        scoreTimeContainer.style.opacity = '1';
                    });
                }

                if (bonusDisplay) {
                    bonusDisplay.style.opacity = '0';
                    requestAnimationFrame(() => {
                        bonusDisplay.style.opacity = '1';
                    });
                }
            });
        }

        // Hit button functionality
        if (newHitButton) {
            newHitButton.addEventListener('click', () => {
                // console.log('Hit button clicked, gameAction:', this.gameAction, 'dealingCard:', this.dealingCard);
                if (this.gameAction === "game" && this.currentCards.length < 5) {
                    console.log('Calling dealCard()');
                    // this.e.s.p('tap');
                    this.dealCard();
                    
                    // Check if this hit will result in 21
                    const currentValue = this.cardValue;
                    const newCard = this.generateRandomCard();
                    const newValue = currentValue + this.getCardValue(newCard);
                    
                    if (newValue === 21) {
                        // Animate fader for 21 on hit
                        setTimeout(() => {
                            this.animateFader(0.5, 0.5);
                        }, 300); // Wait for card animation to complete
                    }
                } else {
                    // console.log('Game not in "game" state or max cards reached, cannot deal card');
                }
            });
        }

        // Instructions button functionality
        const instructionsButton = document.getElementById('instructionsButton');
        if (instructionsButton) {
            instructionsButton.addEventListener('click', () => {
                console.log('Instructions button clicked');
                // this.e.s.p('brightClick');
                document.getElementById('instructionsOverlay').style.display = 'flex';
            });
        }

        // Close instructions button functionality
        const closeInstructionsButton = document.getElementById('closeInstructionsButton');
        if (closeInstructionsButton) {
            closeInstructionsButton.addEventListener('click', () => {
                console.log('Close instructions button clicked');
                // this.e.s.p('brightClick');
                document.getElementById('instructionsOverlay').style.display = 'none';
            });
        }

        // Stay button functionality
        if (newStayButton) {
            newStayButton.addEventListener('click', () => {
                console.log('Stay button clicked, gameAction:', this.gameAction);
                if (this.gameAction === "game") {
                    // Calculate base score based on card value
                    let basePoints = 0;
                    if (this.cardValue >= 16) {
                        const pointMap = { 16: 50, 17: 100, 18: 200, 19: 300, 20: 400, 21: 800 };
                        basePoints = pointMap[this.cardValue] || 0;
                    }
                    
                    // Track statistics
                    if (this.cardValue >= 16 && this.cardValue <= 21) {
                        this[`score${this.cardValue}`]++;
                    }
                    this.cardPoints += basePoints;
                    
                    // Apply bonus multiplier to score
                    const finalPoints = Math.floor(basePoints * this.bonusMult);
                    this.score += finalPoints;
                    this.currentIntervalScore += finalPoints; // Track score for current breadcrumb interval
                    this.currentIntervalHandScores.push(finalPoints); // Track hand score for current interval
                    this.multBonus += (finalPoints - basePoints);
                    document.getElementById('scoreDisplay').textContent = this.score;
                    console.log('Score updated to:', this.score);
                    
                    // Create score callout
                    const scoreCallout = document.createElement('div');
                    scoreCallout.className = 'score-callout';
                    scoreCallout.textContent = `+${finalPoints}`;
                    
                    // Get card value div position
                    const cardValueDiv = document.getElementById('cardValue');
                    const cardValueRect = cardValueDiv ? cardValueDiv.getBoundingClientRect() : null;
                    const startY = cardValueRect ? cardValueRect.top + cardValueRect.height / 2 : window.innerHeight / 2;
                    
                    scoreCallout.style.top = `${startY}px`;
                    document.body.appendChild(scoreCallout);
                    
                    // Animate score callout
                    gsap.to(scoreCallout, {
                        y: -100,
                        opacity: 0,
                        duration: 1,
                        ease: "power2.out",
                        onComplete: () => {
                            document.body.removeChild(scoreCallout);
                        }
                    });
                    
                    // Add bonus reward to bonus multiplier
                    const bonusReward = this.calculateBonusReward(this.cardValue);
                    this.bonusMult = Math.min(5, this.bonusMult + bonusReward);
                    this.updateBonusDisplay();
                    
                    // Replace used extra cards if player got 21
                    if (this.cardValue === 21) {
                        this.replaceUsedExtraCards();
                        // Animate fader for 21 on stay
                        this.animateFader(0.5, 0.8);
                        this.e.s.p('good');
                    } else {
                        this.e.s.p('good');
                    }
                    
                    this.gameAction = "end round";
                    
                    // Increment hand counter for next round
                    this.handCount++;
                    this.updateHandCounter();
                }
            });
        }
    }

    startCountdownSequence() {
        const startMenu = document.getElementById('startMenu');
        const startMenuContainer = document.getElementById('startMenuContainer');
        const gameContainer = document.getElementById('gameContainer');

        if (startMenuContainer) {
            startMenuContainer.style.transition = 'opacity 0.3s ease-out';
            startMenuContainer.style.opacity = '0';
        }

        setTimeout(() => {
            if (startMenu) {
                startMenu.style.display = 'none';
            }

            if (gameContainer) {
                gameContainer.style.display = 'flex';
                gameContainer.style.opacity = '1';
            }

            this.gameAction = "new round";
            this.e.startGame();
        }, 300);
    }

    update() {
        
        if(this.action==="set up"){
            this.action = "start";
            this.count=0;
        }else if(this.action==="start"){
            // Timer countdown (only after game starts)
            if (this.gameAction !== "waiting") {
                this.gameTime -= this.e.dt;
                
                // Play tick sound when time is running out (last 20 seconds)
                if (this.gameTime <= 20 && this.gameTime > 0) {
                    const currentSecond = Math.floor(this.gameTime);
                    if (currentSecond !== this.lastTickSecond) {
                        this.e.s.p("tick");
                        this.lastTickSecond = currentSecond;
                    }
                }
                
                if (this.gameTime <= 0) {
                    this.gameTime = 0;
                    // Clear breadcrumb interval
                    if (this.breadcrumbIntervalId) {
                        clearInterval(this.breadcrumbIntervalId);
                        this.breadcrumbIntervalId = null;
                    }
                    // Time's up logic
                    this.showFinalScore();
                    this.action="end"
                }
            }
            
            // Game logic
            if(this.gameAction==="waiting"){
                // Waiting for play button to be clicked
                this.updateTimer();
                // Ensure timer is visible
                const timeDisplay = document.getElementById('timeDisplay');
                if (timeDisplay) {
                    timeDisplay.style.opacity = '1';
                    timeDisplay.style.visibility = 'visible';
                }
            }else if(this.gameAction==="new round"){

                console.log('Starting new round');
                
                // Start breadcrumb interval (every 15 seconds)
                if (!this.breadcrumbIntervalId) {
                    this.breadcrumbIntervalId = setInterval(() => {
                        this.levelScore = this.currentIntervalScore; // Set levelScore for existing breadCrumb method
                        this.gameScores = this.currentIntervalHandScores; // Set handScores for existing breadCrumb method
                        this.breadCrumb(); // Use existing breadCrumb method
                        this.currentIntervalScore = 0; // Reset for next interval
                        this.currentIntervalHandScores = []; // Reset hand scores for next interval
                        this.resetBreadCrumbTempData(); // Reset levelScore and levelStartTime
                    }, this.breadcrumbInterval * 1000); // Convert to milliseconds
                }
                
                // Hide card value and bust text initially
                const cardValueElement = document.getElementById('cardValue');
                if (cardValueElement) {
                    cardValueElement.style.opacity = '0';
                }
                
                const bustTextElement = document.getElementById('bustText');
                if (bustTextElement) {
                    bustTextElement.style.opacity = '0';
                }
                
                // Deal 2 cards almost simultaneously
                console.log('Dealing first card');
                this.dealCard();
                setTimeout(() => {
                    console.log('Dealing second card');
                    this.dealCard();
                }, 100); // Much shorter delay for almost simultaneous dealing
                
                this.gameAction = "new round wait";

            }else if(this.gameAction==="new round wait"){
                
                this.updateTimer();
                
                // Update bonus background lerp
                this.updateBonusBackgroundLerp();

                this.count+=this.e.dt;
                if(this.count>.3){
                    this.count=0;
                    this.gameAction="game";
                }

            }else if(this.gameAction==="game"){

                this.updateTimer();
                
                // Update bonus background lerp
                this.updateBonusBackgroundLerp();

            }else if(this.gameAction==="bust"){
                // Update bonus background lerp
                this.updateBonusBackgroundLerp();
                
                // Disable buttons
                const hitButton = document.getElementById('hitButton');
                const stayButton = document.getElementById('stayButton');
                if (hitButton) hitButton.style.pointerEvents = 'none';
                if (stayButton) stayButton.style.pointerEvents = 'none';
                
                this.e.s.p("bad");
                
                // Show BUST text
                const bustTextElement = document.getElementById('bustText');
                if (bustTextElement) {
                    bustTextElement.style.opacity = '1';
                }
                
                // Subtract 200 points for bust
                const bustPenalty = Math.min(200, this.score); // Don't go below 0
                this.score = Math.max(0, this.score - 200);
                this.currentIntervalScore -= bustPenalty; // Track bust penalty for current breadcrumb interval
                this.currentIntervalHandScores.push(-bustPenalty); // Track bust penalty as negative hand score
                const scoreDisplay = document.getElementById('scoreDisplay');
                if (scoreDisplay) {
                    scoreDisplay.textContent = this.score;
                }
                
                // Track bust
                this.bustCount++;
                
                // Reset bonus multiplier to 1
                this.bonusMult = 1;
                this.updateBonusDisplay();
                
                // Clear and replace all extra cards on bust
                this.replaceAllExtraCards();
                
                // Increment hand counter for bust
                this.handCount++;
                this.updateHandCounter();
                
                this.gameAction = "bust wait";
                // Wait 1 second, then fade out with GSAP
                setTimeout(() => {
                    // Fade out background and text with GSAP
                    gsap.to(this.bustBackground, {
                        duration: 0.25,
                        opacity: 0,
                        ease: "power2.out",
                        onComplete: () => {
                            // Remove background div (text is child, so it will be removed too)
                            if (this.bustBackground && this.bustBackground.parentNode) {
                                document.body.removeChild(this.bustBackground);
                            }
                            this.gameAction = "end round";
                        }
                    });
                }, 1000);
            }else if(this.gameAction==="bust wait"){
                // Wait for bust animation
                this.updateTimer();
                
                // Update bonus background lerp
                this.updateBonusBackgroundLerp();
            }else if(this.gameAction==="end round"){
                // Update bonus background lerp
                this.updateBonusBackgroundLerp();
                
                // Animate cards out with GSAP using tracked array
                if (this.cardElements.length > 0) {
                    this.cardElements.forEach((card, index) => {
                        gsap.to(card, {
                            left: '-300px',
                            rotation: 45,
                            duration: 0.2,
                            ease: "power2.in",
                            delay: 0
                            
                        });
                    });
                }
                
                // Fade out card value
                const cardValueElement = document.getElementById('cardValue');
                if (cardValueElement) {
                    cardValueElement.style.transition = 'opacity 0.5s ease-out';
                    cardValueElement.style.opacity = '0';
                }
                
                const bustTextElement = document.getElementById('bustText');
                if (bustTextElement) {
                    bustTextElement.style.transition = 'opacity 0.5s ease-out';
                    bustTextElement.style.opacity = '0';
                }

                this.count=0;
                this.gameAction="end round wait"

            }else if(this.gameAction==="end round wait"){
                
                // Update bonus background lerp
                this.updateBonusBackgroundLerp();

                this.count+=this.e.dt;
                if(this.count>.4){
                    this.count=0;
                    this.gameAction="reset";
                }
                
            }else if(this.gameAction==="reset"){
                
                // Update bonus background lerp
                this.updateBonusBackgroundLerp();

                for(var i=0;i<this.cardElements.length;i++){
                    if (this.cardElements[i].parentNode) {
                        this.cardElements[i].remove();
                    }                
                }

                this.updateTimer();
                
                // Clear all card arrays and state
                this.cardElements = [];
                this.currentCards = [];
                this.cardValue = 0;
                this.dealingCard = false;
                this.initialDealAnimationTriggered = false;
                
                // Only subtract 200 points if player busted (not if they stayed)
                // The score is already calculated in the stay button click handler
                const scoreDisplay = document.getElementById('scoreDisplay');
                if (scoreDisplay) {
                    scoreDisplay.textContent = this.score;
                }
                
                // Re-enable buttons
                const hitButton = document.getElementById('hitButton');
                const stayButton = document.getElementById('stayButton');
                if (hitButton) hitButton.style.pointerEvents = 'auto';
                if (stayButton) stayButton.style.pointerEvents = 'auto';
                
                // Update button states
                this.updateHitButtonState();
                this.updateStayButtonState();
                
                // Only replace used extra cards if player got 21 or busted
                // (Extra cards will persist between rounds otherwise)
                
                this.gameAction = "new round";
            }
        }else if(this.action==="go"){
            this.action = "end";
        }

    }

    // Update timer display
    updateTimer() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        const timeDisplay = document.getElementById('timeDisplay');
        // console.log('updateTimer called, gameTime:', this.gameTime, 'minutes:', minutes, 'seconds:', seconds);
        if (timeDisplay) {
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            timeDisplay.style.opacity = '1';
            timeDisplay.style.visibility = 'visible';
            // console.log('Timer updated to:', timeDisplay.textContent);
        } else {
            // console.log('Timer div not found');
        }
    }

    // Deal a card
    dealCard() {
        // Special case for initial two-card deal - allow simultaneous dealing
        const isInitialDeal = this.currentCards.length < 2 && this.gameAction === "new round wait";
        
        // Prevent multiple cards from being dealt simultaneously (except initial deal)
        if (this.dealingCard && !isInitialDeal) {
            // console.log('Already dealing a card, skipping');
            return;
        }
        
        if (!isInitialDeal) {
            this.dealingCard = true;
        }
        
        // console.log('Dealing card, current cards:', this.currentCards.length);
        
        const card = this.generateRandomCard();
        this.currentCards.push(card);
        
        // Animate card in
        this.animateCardIn(card);
        
        // Update card value after animation
        setTimeout(() => {
            // Only update card value and trigger animation when we have 2 cards (initial deal) or when it's not the initial deal
            const shouldUpdateValue = (this.currentCards.length === 2 && !this.initialDealAnimationTriggered) || !isInitialDeal;
            if (shouldUpdateValue) {
                this.updateCardValue();
                if (isInitialDeal && this.currentCards.length === 2) {
                    this.initialDealAnimationTriggered = true;
                }
            }
            
            if (!isInitialDeal) {
                this.dealingCard = false;
            }
           
            // Update hit button state
            this.updateHitButtonState();
            this.updateStayButtonState();
        }, 300); // Reduced to match the faster animation
    }

    // Generate random card
    generateRandomCard() {
        const suits = ['S', 'H', 'D', 'C'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K', 'A'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return { suit, value, displayValue: value };
    }

    // Get card value
    getCardValue(card) {
        if (card.value === 'A') return 11;
        if (['J', 'Q', 'K'].includes(card.value)) return 10;
        return parseInt(card.value);
    }

    // Calculate total card value with proper ace handling
    calculateCardValue() {
        let total = 0;
        let aces = 0;
        
        // First pass: count all non-ace cards and count aces
        for (let card of this.currentCards) {
            if (card.value === 'A') {
                aces++;
            } else {
                total += this.getCardValue(card);
            }
        }
        
        // Second pass: add aces, using 11 if possible, otherwise 1
        for (let i = 0; i < aces; i++) {
            if (total + 11 <= 21) {
                total += 11;
            } else {
                total += 1;
            }
        }
        
        return total;
    }

    // Calculate bonus reward based on card value
    calculateBonusReward(cardValue) {
        if (cardValue === 21) return 1;
        if (cardValue === 20) return 0.5;
        if (cardValue === 19) return 0.4;
        if (cardValue === 18) return 0.3;
        if (cardValue === 17) return 0.2;
        if (cardValue === 16) return 0.1;
        return 0;
    }

    // Update bonus display
    updateBonusDisplay() {
        const bonusDisplay = document.getElementById('bonusDisplay');
        if (bonusDisplay) {
            bonusDisplay.textContent = `BONUS: x${this.bonusMult.toFixed(1)}`;
        }
    }
    
    // Update bonus background lerp
    updateBonusBackgroundLerp() {
        const bonusBackground = document.getElementById('bonusBackground');
        if (bonusBackground) {
            // Calculate target scaleY (0 at 1.0, 1 at 5.0)
            const targetScaleY = (this.bonusMult - 1) / 4;
            
            // Get current scaleY
            const currentTransform = bonusBackground.style.transform;
            const currentScaleY = currentTransform.includes('scaleY') 
                ? parseFloat(currentTransform.match(/scaleY\(([^)]+)\)/)?.[1] || 0)
                : 0;
            
            // Lerp towards target scaleY
            const lerpFactor = 0.05; // Adjust this value for faster/slower lerp
            const newScaleY = currentScaleY + (targetScaleY - currentScaleY) * lerpFactor;
            
            bonusBackground.style.transform = `scaleY(${newScaleY})`;
        }
    }

    // Update hand counter display
    updateHandCounter() {
        // Hand counter removed
    }

    // Show final score screen
    showFinalScore() {
        // Animate fader for game end
        this.animateFader(1, 1);
        this.e.s.p('complete');
        
        // Hide game elements
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
        
        // Hide bonus background
        const bonusBackground = document.getElementById('bonusBackground');
        if (bonusBackground) {
            bonusBackground.style.display = 'none';
        }
        
        // Create stats array for the endScore system
        const statsArray = [
            ['21', this.score21],
            ['20', this.score20],
            ['19', this.score19],
            ['18', this.score18],
            ['17', this.score17],
            ['16', this.score16],
            ['CARD POINTS', this.cardPoints],
            ['MULT BONUS', this.multBonus],
            ['BUSTS', this.bustCount]
        ];
        
        // Use the new endScore system
        this.e.endScore.createFinalScoreOverlay(this.score, statsArray);
        
        // Calculate stars earned and save to local storage
        const starsEarned = calculateBlackjackStarsFromScore(this.score);
        saveBlackjackGameResult(this.score, starsEarned);
        
        // Send final validation breadcrumb
        this.levelScore = this.currentIntervalScore; // Set the levelScore for the existing breadCrumb method
        this.gameScores = this.currentIntervalHandScores; // Set handScores for existing breadCrumb method
        this.breadCrumb("validate");
    }

    // Animate card in
    animateCardIn(card) {
        const currentCardsDiv = document.getElementById('currentCards');
        if (!currentCardsDiv) {
            // console.log('currentCards div not found');
            return;
        }
        
        // console.log('Creating card image for:', card.value + card.suit);
        
        // Create new card
        const cardImg = document.createElement('img');
        cardImg.src = `images/cards/${card.value}${card.suit}.svg`;
        cardImg.alt = `${card.value} of ${card.suit}`;
        cardImg.className = 'card-image';
        
        // Set initial position (off-screen to the right)
        cardImg.style.position = 'absolute';
        cardImg.style.left = '100%';
        cardImg.style.top = '10px';
        cardImg.style.transform = 'rotate(-45deg)';
        
        // Add to container but don't track in array yet
        currentCardsDiv.appendChild(cardImg);
        // console.log('Card image added to DOM');
        
        // Calculate card positions based on the expected final number of cards
        const cardWidth = 60; // Approximate card width in pixels
        const cardSpacing = 6; // Space between cards
        const containerWidth = currentCardsDiv.offsetWidth;
        
        let targetLeft;
        let startLeft;
        
        // Special handling for the first two cards (initial deal)
        if (this.cardElements.length < 2) {
            // Position as if there are exactly 2 cards total
            const twoCardWidth = (2 * cardWidth) + cardSpacing;
            startLeft = Math.max(0, (containerWidth - twoCardWidth) / 2);
            // Use the actual card being added (this.currentCards.length - 1) for the index
            const currentCardIndex = this.currentCards.length - 1;
            targetLeft = startLeft + (currentCardIndex * (cardWidth + cardSpacing));
        } else {
            // Normal positioning for 3rd card onwards
            const currentCardIndex = this.cardElements.length; // This card's index
            const totalCards = this.currentCards.length; // Total cards that will exist (including this one)
            const totalWidth = (totalCards * cardWidth) + ((totalCards - 1) * cardSpacing);
            startLeft = Math.max(0, (containerWidth - totalWidth) / 2);
            targetLeft = startLeft + (currentCardIndex * (cardWidth + cardSpacing));
        }
        
        // For the very first card, animate it in from the right
        if (this.cardElements.length === 0) {
            setTimeout(() => {
                gsap.to(cardImg, {
                    left: targetLeft,
                    rotation: 0,
                    duration: 0.2,
                    ease: "sine.out",
                    onComplete: () => {
                        this.cardElements.push(cardImg);
                        // console.log('First card positioned, total elements:', this.cardElements.length);
                    }
                });
            }, 25);
        } else {
            // Animate existing cards to their new positions with GSAP
            this.cardElements.forEach((existingCard, index) => {
                const existingCardTargetLeft = startLeft + (index * (cardWidth + cardSpacing));
                existingCard.style.position = 'absolute';
                existingCard.style.top = '10px';
                
                gsap.to(existingCard, {
                    left: existingCardTargetLeft,
                    duration: 0.2,
                    ease: "sine.out"
                });
            });
            
            // Animate new card in with GSAP
            setTimeout(() => {
                gsap.to(cardImg, {
                    left: targetLeft,
                    rotation: 0,
                    duration: 0.2,
                    ease: "sine.out",
                    onComplete: () => {
                        // Add to array after animation completes
                        this.cardElements.push(cardImg);
                        console.log('Card added to array, total elements:', this.cardElements.length);
                    }
                });
            }, 25);
        }
    }

    // Update card value
    updateCardValue() {
        this.cardValue = this.calculateCardValue();
        const cardValueElement = document.getElementById('cardValue');
        if (cardValueElement) {
            console.log("cardValue", this.cardValue);
            cardValueElement.textContent = this.cardValue;
            cardValueElement.style.opacity = '1';
            cardValueElement.style.fontFamily = 'Sanchez, serif';
            cardValueElement.style.fontWeight = '400';
            
            // Kill any existing animations on the card value
            gsap.killTweensOf(cardValueElement);
            
            // Set colors without scale animation
            if (this.cardValue > 21) {
                cardValueElement.style.color = '#ff4444';
                cardValueElement.style.background = 'linear-gradient(180deg, #ff6666, #ff4444)';
                cardValueElement.style.webkitBackgroundClip = 'text';
                cardValueElement.style.webkitTextFillColor = 'transparent';
                cardValueElement.style.backgroundClip = 'text';
            } else if (this.cardValue === 21) {
                cardValueElement.style.color = '#ffd700';
                cardValueElement.style.background = 'linear-gradient(180deg, #ffd700, #ffb700)';
                cardValueElement.style.webkitBackgroundClip = 'text';
                cardValueElement.style.webkitTextFillColor = 'transparent';
                cardValueElement.style.backgroundClip = 'text';
            } else if (this.cardValue >= 16) {
                cardValueElement.style.color = '#ffd700';
                cardValueElement.style.background = 'linear-gradient(180deg, #44bb63, #2b9346)';
                cardValueElement.style.webkitBackgroundClip = 'text';
                cardValueElement.style.webkitTextFillColor = 'transparent';
                cardValueElement.style.backgroundClip = 'text';
            } else if (this.cardValue < 16) {
                cardValueElement.style.color = '#000000';
                cardValueElement.style.background = 'none';
                cardValueElement.style.webkitBackgroundClip = '';
                cardValueElement.style.webkitTextFillColor = '';
                cardValueElement.style.backgroundClip = '';
                    } else {
                // 16-20: black
                cardValueElement.style.color = '#000000';
                cardValueElement.style.background = 'none';
                        cardValueElement.style.webkitBackgroundClip = '';
                        cardValueElement.style.webkitTextFillColor = '';
                        cardValueElement.style.backgroundClip = '';
                    }
        }
        
        // Update stay button state
        this.updateStayButtonState();
        
        // Check for bust
        if (this.cardValue > 21) {
            this.gameAction = "bust";
        }
    }

    // Update hit button state based on number of cards
    updateHitButtonState() {
        const hitButton = document.getElementById('hitButton');
        if (hitButton) {
            if (this.currentCards.length >= 5) {
                // Disable and grey out hit button
                hitButton.style.opacity = '0.5';
                hitButton.style.pointerEvents = 'none';
                hitButton.style.background = 'linear-gradient(135deg, #cccccc 0%, #999999 50%, #cccccc 100%)';
            } else {
                // Enable hit button
                hitButton.style.opacity = '1';
                hitButton.style.pointerEvents = 'auto';
                hitButton.style.background = 'linear-gradient(to bottom, #FFB84D, #FF8C22)';
            }
        }
    }

    // Update stay button state based on card value and number of cards
    updateStayButtonState() {
        const stayButton = document.getElementById('stayButton');
        if (stayButton) {
            const canStay = this.cardValue > 15 || this.currentCards.length >= 5;
            if (canStay) {
                // Enable stay button
                stayButton.style.opacity = '1';
                stayButton.style.pointerEvents = 'auto';
                stayButton.style.background = 'linear-gradient(to bottom, #44bb63, #2b9346)';
                stayButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            } else {
                // Disable and grey out stay button
                stayButton.style.opacity = '0.5';
                stayButton.style.pointerEvents = 'none';
                stayButton.style.background = 'linear-gradient(135deg, #cccccc 0%, #999999 50%, #cccccc 100%)';
                stayButton.style.boxShadow = 'none';
            }
        }
    }

    // Helper function to position extra cards
    positionExtraCard(cardImg, index) {
        const cardWidth = 60; // Approximate card width
        const spacing = 6;
        const totalWidth = cardWidth + spacing;
        
        if (index === 0) {
            // Left card: center - (card width + spacing) - (half card width for middle card shift)
            cardImg.style.left = `calc(50% - ${totalWidth}px - 30px)`;
        } else if (index === 1) {
            // Middle card: center
            cardImg.style.left = '50%';
            cardImg.style.transform = 'translateX(-50%)';
        } else {
            // Right card: center + (card width + spacing) - (half card width for middle card shift)
            cardImg.style.left = `calc(50% + ${totalWidth}px - 27px)`;
        }
    }

    // Setup extra cards
    setupExtraCards() {
        const extraCardsDiv = document.getElementById('extraCards');
        if (!extraCardsDiv) return;
        
        // Clear existing cards
        extraCardsDiv.innerHTML = '';
        this.extraCards = [];
        
        // Create 3 random cards
        for (let i = 0; i < 3; i++) {
            const card = this.generateRandomCard();
            this.extraCards.push(card);
            
            const cardImg = document.createElement('img');
            cardImg.src = `images/cards/${card.value}${card.suit}.svg`;
            cardImg.alt = `${card.value} of ${card.suit}`;
            cardImg.className = 'card-image';
            cardImg.style.cursor = 'pointer';
            cardImg.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
            cardImg.style.position = 'absolute';
            cardImg.style.top = '10px'; // Center vertically
            
            // Position the card using helper function
            this.positionExtraCard(cardImg, i);
            
            // Add click event
            cardImg.addEventListener('click', () => {
                this.useExtraCard(card, cardImg);
            });
            
            extraCardsDiv.appendChild(cardImg);
        }
    }

    // Replace used extra cards
    replaceUsedExtraCards() {
        const extraCardsDiv = document.getElementById('extraCards');
        if (!extraCardsDiv) return;
        
        // Get all card images
        const cardImages = extraCardsDiv.querySelectorAll('.card-image');

        console.log("hello");
        
        // Update each hidden card with a new card
        cardImages.forEach((cardImg, index) => {
            if (cardImg.style.opacity === '0') {
                // Generate new card
                const newCard = this.generateRandomCard();
                this.extraCards.push(newCard);
                
                // Update the existing image
                cardImg.src = `images/cards/${newCard.value}${newCard.suit}.svg`;
                cardImg.alt = `${newCard.value} of ${newCard.suit}`;
                cardImg.style.opacity = '0'; // Start invisible
                cardImg.style.pointerEvents = 'auto';
                // Start scaled down, but preserve any existing transform (like translateX for middle card)
                if (index === 1) {
                    cardImg.style.transform = 'translateX(-50%) scale(0)';
                } else {
                    cardImg.style.transform = 'scale(0)';
                }
                cardImg.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                
                // Remove old click event and add new one
                cardImg.replaceWith(cardImg.cloneNode(true));
                const newCardImg = extraCardsDiv.querySelectorAll('.card-image')[index];
                newCardImg.style.position = 'absolute';
                newCardImg.style.top = '10px'; // Center vertically
                
                // Position the card using helper function
                this.positionExtraCard(newCardImg, index);
                newCardImg.onclick = () => {
                    this.useExtraCard(newCard, newCardImg);
                };
                
                // Animate in with delay based on index
                setTimeout(() => {
                    if (index === 1) {
                        newCardImg.style.transform = 'translateX(-50%) scale(1)';
                    } else {
                        newCardImg.style.transform = 'scale(1)';
                    }
                    newCardImg.style.opacity = '1';
                }, index * 100); // Stagger the animations
            }
        });
    }

    // Replace all extra cards (used on bust)
    replaceAllExtraCards() {
        const extraCardsDiv = document.getElementById('extraCards');
        if (!extraCardsDiv) return;
        
        // Clear all existing cards
        extraCardsDiv.innerHTML = '';
        this.extraCards = [];
        
        // Create 3 new random cards
        for (let i = 0; i < 3; i++) {
            const card = this.generateRandomCard();
            this.extraCards.push(card);
            
            const cardImg = document.createElement('img');
            cardImg.src = `images/cards/${card.value}${card.suit}.svg`;
            cardImg.alt = `${card.value} of ${card.suit}`;
            cardImg.className = 'card-image';
            cardImg.style.position = 'absolute';
            cardImg.style.top = '10px'; // Center vertically
            
            // Position the card using helper function
            this.positionExtraCard(cardImg, i);
            cardImg.style.cursor = 'pointer';
            cardImg.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            // Start scaled down, but preserve any existing transform (like translateX for middle card)
            if (i === 1) {
                cardImg.style.transform = 'translateX(-50%) scale(0)';
            } else {
                cardImg.style.transform = 'scale(0)';
            }
            cardImg.style.opacity = '0'; // Start invisible
            
            // Add click event
            cardImg.onclick = () => {
                this.useExtraCard(card, cardImg);
            };
            
            extraCardsDiv.appendChild(cardImg);
            
            // Animate in with delay based on index
            setTimeout(() => {
                if (i === 1) {
                    cardImg.style.transform = 'translateX(-50%) scale(1)';
                } else {
                    cardImg.style.transform = 'scale(1)';
                }
                cardImg.style.opacity = '1';
            }, i * 100); // Stagger the animations
        }
    }

    // Use an extra card
    useExtraCard(card, cardImg) {
        // Disable pointer events
        cardImg.style.pointerEvents = 'none';
        
        // Hide the card with opacity
        cardImg.style.opacity = '0';
        
        // Play sound
        // this.e.s.p('tap');
        
        // Deal the specific card
        this.dealSpecificCard(card);
        
        // Remove the card from extraCards array
        const cardIndex = this.extraCards.indexOf(card);
        if (cardIndex > -1) {
            this.extraCards.splice(cardIndex, 1);
        }
    }

    // Deal a specific card
    dealSpecificCard(card) {
        // Prevent multiple cards from being dealt simultaneously
        if (this.dealingCard) {
            console.log('Already dealing a card, skipping');
            return;
        }
        this.dealingCard = true;
        
        console.log('Dealing specific card:', card.value + card.suit);
        
        this.currentCards.push(card);
        
        // Animate card in
        this.animateCardIn(card);
        
        // Update card value after animation
        setTimeout(() => {
            this.updateCardValue();
            this.dealingCard = false;
            this.updateHitButtonState();
            this.updateStayButtonState();
            console.log('Specific card dealt, total cards:', this.currentCards.length);
        }, 300);
    }

    // Fader animation function
    animateFader(opacity, duration, color = 'white') {
        const fader = document.getElementById('fader');
        if (!fader) return;
        
        // Ensure the fader has a proper background color
        if (color === 'black') {
            fader.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        } else if (color === 'red') {
            fader.style.backgroundColor = 'rgba(255, 0, 0, 0.6)';
        } else {
            fader.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        }
        
        fader.style.opacity = opacity;

        gsap.to(fader, {
            opacity: 0,
            duration: duration,
            ease: "linear", // Linear tween
            
        });
        
        setTimeout(() => {
            // fader.style.opacity = '0';
        }, 100);
    }



    //-----------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------

    // This is MESSAGE_FACTORY (I am obfuscating the name)
    _0x8db29a(name, data) {
        return JSON.stringify({
        type: name,
        data: data,
        });
    }

    setUp(e) {
        this.e = e;

        console.log("startme")

    }

    resetBreadCrumbTempData(){

        //reset every level

        this.levelScore=0;
        this.levelStartTime = performance.now();

    }

    breadCrumb(type){

        console.log("---------BREADCRUMB----------------------------------------------------------");

        this.levelElapsedTime = (performance.now() - this.levelStartTime) / 1000;
        console.log("Level duration (in seconds):", this.levelElapsedTime);

        const breadCrumbPayload = {
            currentScore: this.score,
            levelScore: this.levelScore,
            levelTime: this.levelElapsedTime,
            handScores: this.gameScores,
            matches: this.matches,
            part: this.part,
            clientTimestamp: Date.now()
        };

        const messageType = type === "validate"
            ? 'Sv{ny`p|r'._0xd7a82c(13)
            : 'OrnqPzo'._0xd7a82c(13);

        const dataPayload = type === "validate"
            ? {
                score: this.score,
                matches: this.matches,
                gameScores: this.gameScores,
                metadata: { breadcrumb: breadCrumbPayload }
            }
            : breadCrumbPayload;

        try {
            const message = JSON.stringify({ type: messageType, data: dataPayload });
            if (window.parent) {
                window.parent.postMessage(message, "*");
            } else {
                console.log('no parent');
            }
        } catch (error) {
            console.log('Not configured properly', error);
        }

        if (type === "validate") {
            this.breadCrumbDone = true;
        }

        this.resetBreadCrumbTempData();
    }



}


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

        // Hide side blockers on tablets (UA-based detection, no measurements)
        try {
            const ua = navigator.userAgent || navigator.vendor || (window.opera ? window.opera : "");
            const isIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && 'ontouchend' in document);
            const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);
				const isAmazonOrOtherTablet = /(Kindle|Silk|KF[A-Z]{2,}|Tablet|PlayBook)/i.test(ua);
				// Microsoft Surface / Windows tablets: Windows UA + touch capability OR explicit Surface token
				const isWindowsTablet = (/Windows/i.test(ua) && (navigator.maxTouchPoints || 0) > 0 && !/Phone/i.test(ua)) || /Surface/i.test(ua) || /Tablet PC/i.test(ua);
				this.isTablet = !!(isIPad || isAndroidTablet || isAmazonOrOtherTablet || isWindowsTablet);
            if (this.isTablet) {
                console.log("isTablet");
                const leftBlocker = document.getElementById('leftBlocker');
                const rightBlocker = document.getElementById('rightBlocker');
                if (leftBlocker) leftBlocker.style.display = 'none';
                if (rightBlocker) rightBlocker.style.display = 'none';
            }
        } catch (e) {
            // fail-safe: do nothing if UA parsing fails
        }
        
        this.action = "set up";
        this.count = 0;

        this.lastTime = new Date().getTime();

        this.loadGame()

    }

    start(){

    }

    update(){

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);

        //---deltatime--------------------------------------------------------------------------------------------------------------

        var currentTime = new Date().getTime();
        this.dt = (currentTime - this.lastTime) / 1000;
        if (this.dt > 1) {
            this.dt = 0;
        }
        this.lastTime = currentTime;

        // document.getElementById("feedback").innerHTML = this.scene.action;

        if(this.action==="set up"){

            //---end--------------------------------------------------------------------------------------------------------------

            this.serverData = null;

            window.addEventListener('message', event => {

                try {

                    const message = JSON.parse(event.data);
                    if (message?.type) {

                        const _0x87c0da = 'V{vTnzr'._0x6cc90a(13);
                        if (message.type === _0x87c0da) {
                            try {
                                this.serverData = typeof message.data === 'string'
                                    ? JSON.parse(message.data)
                                    : message.data;
                                console.log("Loaded server data");
                            } catch (parseError) {
                                console.log('Failed to parse init data', parseError);
                            }
                        }

                        // Handle MuteState message from parent
                        if (message.type === 'MuteState' && message.data) {
                            const { musicMuted, soundsMuted } = message.data;
                            // Both should be the same value
                            this.muteState = soundsMuted;
                            console.log('MuteState received from parent:', this.muteState);
                            
                            // Update localStorage
                            localStorage.setItem("mutestate", this.muteState.toString());
                            
                        }
                        
                    }

                } catch (e) {
                    
                    console.log("FAIL:");
                    console.log(e);

                }
            });

            //---end--------------------------------------------------------------------------------------------------------------

            this.scene.buildScene();
            
            this.count=0;
            this.action="build"
            
        }else if(this.action==="build"){

            this.count+=this.dt;
            if(this.count>1){
                this.action="go";
            }
            
        }else if(this.action==="go"){

            // Loading handled by loadGame() fade out
            this.scene.update();
            this.ui.update();

        }

    }

    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------

    // GENERIC LOADING CODE

    loadGame(){

        console.log("---loadGame");

        this.muteState=false;
        this.mutePosition = 1;

        window.parent.postMessage(JSON.stringify({
            type: 'GameLoaded'
        }), "*");

        // Fade out loading screen (same as memory game)
        const loadingBack = document.getElementById('loadingBack');
        if (loadingBack) {
            if (typeof gsap !== 'undefined') {
                gsap.to(loadingBack, {
                    opacity: 0,
                    duration: 0.33,
                    delay: 0.5,
                    ease: "sine.out",
                    onComplete: () => {
                        // Loading screen faded out
                    }
                });
            } else {
                setTimeout(() => {
                    loadingBack.style.opacity = '0';
                }, 500);
            }
        }

        // this.createMuteButton();

    }

    startGame(){

        window.parent.postMessage(JSON.stringify({
            type: 'GameStart'
        }), "*");

    }

    createMuteButton() {
        
        // Remove existing mute button if it exists
        const existingMuteButton = document.getElementById('muteButton');
        if (existingMuteButton) {
            existingMuteButton.remove();
        }
        
        const storedMuteState = localStorage.getItem("mutestate");
        this.muteState = storedMuteState === "true";
        console.log('Mute state from localStorage:', this.muteState);
        
        if(!this.muteState){
            this.gameStartSound=true;
        }
        
        const muteButton = document.createElement('div');
        muteButton.id = 'muteButton';

        //--------------------------------------------------------------------
        
        let positionStyle;
        if (this.mutePosition === 1 && !this.mobile) {
           
            const centerX = window.innerWidth / 2;
            const leftPosition = centerX - 240;
            positionStyle = `
                position: fixed;
                bottom: 10px;
                left: ${leftPosition}px;
            `;

        } else {
            
            positionStyle = `
                position: fixed;
                bottom: 10px;
                left: 10px;
            `;
            
        }

        muteButton.style.cssText = `
            ${positionStyle}
            width: 20px;
            height: 20px;
            background: #1a6d4b;
            border: 2px solid #1ac07d;
            border-radius: 3px;
            cursor: pointer;
            z-index: 8000;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const icon = document.createElement('img');
        icon.src = 'images/audio_on.svg';
        icon.style.cssText = `
            width: 18px;
            height: 18px;
            pointer-events: none;
        `;
        icon.id = 'muteIcon';
        muteButton.appendChild(icon);

        muteButton.addEventListener('click', (e) => {
            console.log('Mute button clicked! Current state:', this.muteState);
            e.preventDefault();
            e.stopPropagation();
            this.toggleMute(!this.muteState);
        });

        muteButton.addEventListener('touchstart', (e) => {
            console.log('Mute button touched! Current state:', this.muteState);
            e.preventDefault();
            this.toggleMute(!this.muteState);
        });

        document.body.appendChild(muteButton);
        
        const icon2 = document.getElementById('muteIcon');
        if (icon2) {
            icon2.src = this.muteState ? 'images/audio_off.svg' : 'images/audio_on.svg';
        }
    }

    toggleMute(value) {
        console.log("toggleMute:", value);
        
        this.muteState = value;
        
        localStorage.setItem("mutestate", value.toString());
        
        const icon = document.getElementById('muteIcon');
        const button = document.getElementById('muteButton');
        if (icon && button) {
            if (this.muteState) {
                icon.src = 'images/audio_off.svg';
            } else {
                icon.src = 'images/audio_on.svg';
            }
        }
        
        window.parent.postMessage(JSON.stringify({
            type: 'MuteMusic',
            data: { value }
        }), "*");
        
        window.parent.postMessage(JSON.stringify({
            type: 'MuteSounds',
            data: { value }
        }), "*");
    }

    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------


}
const input = new Input();
const loader = new Loader();
const scene = new Scene();
const sounds = new Sounds();
const utilities = new Utilities();
const ui = new UI();
const endScore = new EndScore();

const engine = new Engine(input, loader, scene, sounds, utilities, ui, endScore);

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
})();

// Helper function to get today's date key
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Calculate stars from blackjack score
function calculateBlackjackStarsFromScore(scoreValue) {
    let stars = 0;

    // Star thresholds for blackjack (adjust as needed)
    const starThresholds = [0, 40000, 55000, 75000, 85000];
    // 1 star = >= 0
    // 2 stars = >= 5000
    // 3 stars = >= 10000
    // 4 stars = >= 15000
    // 5 stars = >= 20000
    for (let i = starThresholds.length - 1; i >= 0; i--) {
        if (scoreValue >= starThresholds[i]) {
            stars = i + 1; // Add 1 because index 0 = 1 star, index 4 = 5 stars
            break;
        }
    }
    return stars;
}

// Save blackjack game result to local storage
function saveBlackjackGameResult(finalScore, starsEarned) {
    const todayKey = getTodayKey();
    
    // Check if already played today BEFORE overwriting
    const previousStars = parseInt(localStorage.getItem(`blackjackStars_${todayKey}`) || '0');
    const previousScore = parseInt(localStorage.getItem(`blackjackScore_${todayKey}`) || '0');
    const wasComplete = localStorage.getItem(`blackjackComplete_${todayKey}`) === 'true';
    
    // Check if this is a better result
    const isBetter = !wasComplete || finalScore > previousScore || starsEarned > previousStars;
    
    if (isBetter) {
        // Calculate star difference to add to totals
        const starDifference = wasComplete ? (starsEarned - previousStars) : starsEarned;
        
        // Update daily and total stars if there's a difference
        if (starDifference !== 0) {
    const currentDailyStars = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
    const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
            const currentMoveStars = parseInt(localStorage.getItem(`moveStars_${todayKey}`) || '0');
    
            localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + starDifference));
            localStorage.setItem('totalStars', String(currentTotalStars + starDifference));
            localStorage.setItem(`moveStars_${todayKey}`, String(currentMoveStars + starDifference));
        }
        
        // Always save the new score and stars if better
        localStorage.setItem(`blackjackScore_${todayKey}`, String(finalScore));
        localStorage.setItem(`blackjackStars_${todayKey}`, String(starsEarned));
        localStorage.setItem(`blackjackComplete_${todayKey}`, 'true');
    }
    
    // Update parent window displays if accessible
    if (window.parent && window.parent.updateStarDisplay) {
        window.parent.updateStarDisplay();
    }
    if (window.parent && window.parent.updateBlackjackStars) {
        window.parent.updateBlackjackStars();
    }
    if (window.parent && window.parent.updateWalletStars) {
        window.parent.updateWalletStars();
    }
    if (window.parent && window.parent.updateRivalStars) {
        window.parent.updateRivalStars();
    }
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

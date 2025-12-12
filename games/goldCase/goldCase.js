// ============================================================================
// GOLD CASE GAME - Combined from source files
// ============================================================================

// ============================================================================
// INPUT CLASS
// ============================================================================
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


// ============================================================================
// UI CLASS
// ============================================================================
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


// ============================================================================
// LOADER CLASS
// ============================================================================


class Loader{

    setUp(e){

        this.e = e;

    }

}


// ============================================================================
// U CLASS
// ============================================================================

class Utilities {

    setUp(e) {
        this.e=e;
    }
  
    vectorToScreenPos2(ob, camera){

      var width = window.innerWidth;
      var height = window.innerHeight;
      var widthHalf = width / 2, heightHalf = height / 2;
    
      var vector = ob.geometry.vertices[0].clone();
      vector.applyMatrix4( ob.matrixWorld );
    
      var pos = vector.clone();
      // var pos = ob.position.clone();
    
      pos.project(camera);
      pos.x = ( pos.x * widthHalf ) + widthHalf;
      pos.y = - ( pos.y * heightHalf ) + heightHalf;
    
      var result = {x:pos.x, y:pos.y};
      
      return result;
    
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
    
    vectorToScreenPosLight(ob, camera){

      const screenPosition = new THREE.Vector3();
      ob.getWorldPosition(screenPosition);
      screenPosition.project(camera);
  
      if ( screenPosition.x >= -1 && screenPosition.x <= 1 && screenPosition.y >= -1 && screenPosition.y <= 1 &&screenPosition.z >= -1 && screenPosition.z <= 1 ) {

        const px = (screenPosition.x + 1) / 2 * window.innerWidth;
        const py = (-screenPosition.y + 1) / 2 * window.innerHeight;
        
        var result = {x:px, y:py, d:true};

      }else{

        const px = (screenPosition.x + 1) / 2 * window.innerWidth;
        const py = (-screenPosition.y + 1) / 2 * window.innerHeight;
        
        var result = {x:px, y:py, d:false};

      }
      
      return result;
    
    }

    //---------------------------------------------------------------------------

  generateRandomColor() {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      return `#${randomColor.padStart(6, '0')}`;
  }
  
  // Function to convert a hex color to RGB format
  hexToRgb(hex) {
      let r = 0, g = 0, b = 0;
      // 3 digits
      if (hex.length === 4) {
          r = parseInt(hex[1] + hex[1], 16);
          g = parseInt(hex[2] + hex[2], 16);
          b = parseInt(hex[3] + hex[3], 16);
      }
      // 6 digits
      else if (hex.length === 7) {
          r = parseInt(hex[1] + hex[2], 16);
          g = parseInt(hex[3] + hex[4], 16);
          b = parseInt(hex[5] + hex[6], 16);
      }
      return { r, g, b };
  }
  
  // Function to calculate the Euclidean distance between two colors
  colorDistance(color1, color2) {
      const rgb1 = this.hexToRgb(color1);
      const rgb2 = this.hexToRgb(color2);
      return Math.sqrt(
          Math.pow(rgb2.r - rgb1.r, 2) + 
          Math.pow(rgb2.g - rgb1.g, 2) + 
          Math.pow(rgb2.b - rgb1.b, 2)
      );
  }
  
  // Function to generate a set of random colors that are not too close to each other
  generateDistinctColors(numColors, minDistance = 50) {
      const colors = [];
      
      while (colors.length < numColors) {
          const newColor = this.generateRandomColor();
  
          // Check if the new color is sufficiently different from the already chosen colors
          let isDistinct = true;
          for (let i = 0; i < colors.length; i++) {
              if (this.colorDistance(newColor, colors[i]) < minDistance) {
                  isDistinct = false;
                  break;
              }
          }
  
          // If the color is distinct, add it to the list
          if (isDistinct) {
              colors.push(newColor);
          }
      }
  
      return colors;
    }

    //---------------------------------------------------------------------------

    generateRandomHexColor() {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      return `#${randomColor.padStart(6, '0')}`;
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
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
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
      // console.log(" ran "+r)
  
      var removeMe = ar[r];
      // for(var i=0; i<ar.length; i++){
        // if(removeMe===ar[i]){
          ar.splice(r, 1);
        // }
      // }
  
      return removeMe;
  
    }
  
    rgbToHex(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  
    //---------------------------------------------------------------------------------------------
  
    //-----color tester-----------------------------------------------------------------------------------------
  
    testColors(){
  
      if(this.e.useColorChanger1===true){
  
        //-----change this--------------------
  
        this.changeOb1 = this.e.whiteMachine.material.color
  
        //-----change this--------------------
        
        if(this.e.setUpColorChanger1===false){
          
            this.hexColor = this.changeOb1.getHSL();
  
            document.getElementById("hueSlider1").value = this.hexColor.h*100;
            document.getElementById("satSlider1").value = this.hexColor.s*100;
            document.getElementById("briSlider1").value = this.hexColor.l*100;
  
            this.e.setUpColorChanger1=true;
        }
  
        var h = document.getElementById("hueSlider1").value;
        var s = document.getElementById("satSlider1").value;
        var l = document.getElementById("briSlider1").value;
        
        this.testColor1 = this.hslToHex(h, s, l);
        this.changeOb1.setHex(this.testColor1);
  
        document.getElementById("val1").value = this.testColor1;
  
      }
  
      if(this.e.useColorChanger2===true){
  
        //-----change this--------------------
  
        this.changeOb2 = this.e.testMe4.material.color
  
        //-----change this--------------------
        
        if(this.e.setUpColorChanger2===false){
          
            this.hexColor = this.changeOb2.getHSL();
  
            document.getElementById("hueSlider2").value = this.hexColor.h*100;
            document.getElementById("satSlider2").value = this.hexColor.s*100;
            document.getElementById("briSlider2").value = this.hexColor.l*100;
  
            this.e.setUpColorChanger2=true;
        }
  
        var h = document.getElementById("hueSlider2").value;
        var s = document.getElementById("satSlider2").value;
        var l = document.getElementById("briSlider2").value;
        
        this.testColor2 = this.hslToHex(h, s, l);
        this.changeOb2.setHex(this.testColor2);
  
        document.getElementById("val2").value = this.testColor2;
  
      }
  
      if(this.e.useColorChanger3===true){
  
        //-----change this--------------------
  
        this.changeOb3 = this.e.testMe5.material.color
  
        //-----change this--------------------
        
        if(this.e.setUpColorChanger3===false){
          
            this.hexColor = this.changeOb3.getHSL();
  
            document.getElementById("hueSlider3").value = this.hexColor.h*100;
            document.getElementById("satSlider3").value = this.hexColor.s*100;
            document.getElementById("briSlider3").value = this.hexColor.l*100;
  
            this.e.setUpColorChanger3=true;
        }
  
        var h = document.getElementById("hueSlider3").value;
        var s = document.getElementById("satSlider3").value;
        var l = document.getElementById("briSlider3").value;
        
        this.testColor3 = this.hslToHex(h, s, l);
        this.changeOb3.setHex(this.testColor3);
  
        document.getElementById("val3").value = this.testColor3;
      
      }
  
      if(this.e.useColorChanger4===true){
  
        var n = document.getElementById("slider4").value;
  
        //-----change this--------------------
  
        // this.e.water.material.metalness = n/100;
        this.e.windowGlass.material.opacity = this.e.u.ca(360*(n/100));
  
        //-----change this--------------------
  
        document.getElementById("val4").value = n/100;
  
      }
  
    }
  
    inc(el, type, amount){
      if(type==="opacity"){
          // console.log("op")
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
          // console.log(theOpacity)
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


// ============================================================================
// SOUNDS CLASS
// ============================================================================

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

        // console.log('SOUND PLAY called with type:', type);
        // console.log('Total loaded sounds:', this.loadedSounds.length);
        // console.log('Looking for sound named:', type);

        if(this.e.muteState===false){
            for(var i=0; i<this.loadedSounds.length; i++){

                // console.log('Checking sound', i, ':', this.loadedSounds[i].name);

                if(this.loadedSounds[i].name===type){
                    // console.log('MATCH FOUND! Playing sound:', type);
                    this.loadedSounds[i].play();
                    return; // Exit after playing
                }
                
            }
        } else {
        }

    }
}


// ============================================================================
// ENDSCORE CLASS
// ============================================================================

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
			// Fetch the JSON file
			const response = await fetch('./starScores.json');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			this.starThresholds = data;
		} catch (error) {
			console.error('Failed to load star thresholds via fetch:', error);
			// Fallback to default values
			this.starThresholds = [0, 100000, 600000, 1200000, 2000000];
		}
	}
	createFinalScoreOverlay(scoreValue, statsArray = []) {
		// Ensure star thresholds are loaded
		if (!this.starThresholds) {
			this.starThresholds = [0, 100000, 600000, 1200000, 2000000];
		}
		
		
		// Create black overlay
		const overlay = document.createElement('div');
		overlay.className = 'finalScoreOverlay';
		
		// Create main content container
		const contentContainer = document.createElement('div');
		contentContainer.className = 'finalScoreContentContainer';
		
		// Create score text
		const scoreText = document.createElement('div');
		scoreText.className = 'finalScoreText';
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
			
			star.dataset.targetColor = targetColor;
			
			starDiv.appendChild(star);
		}
		
		// Add star container to stats container with spacing
		statsContainer.appendChild(starDiv);
			
		// Create GAME STATS header
		const statsHeader = document.createElement('div');
		statsHeader.className = 'finalScoreStatsHeader';
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
		
		// Animate overlay with GSAP (score text styling handled via CSS, no glow/extra animation)
		gsap.to(overlay, {
			duration: 0.8,
			opacity: 1,
			ease: "sine.out"
		});

		// Make score text visible immediately, matching Lost & Found behavior
		scoreText.style.opacity = "1";
		scoreText.style.transform = "scale(1)";
		
		// After 3 seconds, animate to final position
		setTimeout(() => {
			// Measure the content container height
			const contentHeight = contentContainer.offsetHeight;
			
			// Calculate final position for equal spacing above and below
			const finalTop = (viewportHeight - contentHeight) / 2;
			
			
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



// ============================================================================
// ENGINE CLASS
// ============================================================================



class Engine{
    constructor(input, loader, scene, sounds, suitcase, utilities, ui, endScore){

        this.input = input;
        this.loader = loader;
        this.s = sounds;
        this.scene = scene;
        this.ui = ui;
        this.suitcase = suitcase;
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
                            // Case CG_API.InitGame
                            // Decrypt the data
                            const bytes  = AES.decrypt(message.data, 'DrErDE?F:nEsF:AA=A:EEDB:>C?nAABA@r>E'._0x6cc90a(13));
                            this.serverData = JSON.parse(bytes.toString(enc));
                        }
                    }

                } catch (e) {
                    

                }
            });

            //---end--------------------------------------------------------------------------------------------------------------

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

            this.loadOpacity-=this.dt;
            if(this.loadOpacity<0){
                this.loadOpacity=0;
            }

            // Loading image removed - fade handled by fader only

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

        this.muteState=false;
        this.mutePosition = 1;

        window.parent.postMessage(JSON.stringify({
            type: 'GameLoaded'
        }), "*");

        // this.createMuteButton();

    }

    startGame(){

        window.parent.postMessage(JSON.stringify({
            type: 'GameStart'
        }), "*");

    }

    createMuteButton() {
        
        const storedMuteState = localStorage.getItem("mutestate");
        this.muteState = storedMuteState === "true";
        
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
            background: #9c6833;
            border: 2px solid #e09938;
            border-radius: 3px;
            cursor: pointer;
            z-index: 8000;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const icon = document.createElement('img');
        icon.src = './images/audio_on.svg';
        icon.style.cssText = `
            width: 18px;
            height: 18px;
            pointer-events: none;
        `;
        icon.id = 'muteIcon';
        muteButton.appendChild(icon);

        muteButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMute(!this.muteState);
        });

        muteButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleMute(!this.muteState);
        });

        document.body.appendChild(muteButton);
        
        const icon2 = document.getElementById('muteIcon');
        if (icon2) {
            icon2.src = this.muteState ? './images/audio_off.svg' : './images/audio_on.svg';
        }
    }

    toggleMute(value) {
        
        this.muteState = value;
        
        localStorage.setItem("mutestate", value.toString());
        
        const icon = document.getElementById('muteIcon');
        const button = document.getElementById('muteButton');
        if (icon && button) {
            if (this.muteState) {
                icon.src = './images/audio_off.svg';
            } else {
                icon.src = './images/audio_on.svg';
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


// ============================================================================
// SCENE CLASS
// ============================================================================


class Scene {
    setUp(e) {
        this.e = e;
    
        this.action="set up";
        this.count=0;
        this.cases = [];
        this.caseValues = [];
        this.originalCaseValues = []; // Track original values for reference
        this.selectedCase = null;
        this.clues = [];
        this.cluesFound = [];
        this.availableClues = [
            "quadrant",
            "oddEven",
            "columns",
            "row",
            "medium",
            "halfTopBottomLow",
            "halfSideLow",
            "pick3",
            "nextTo",
            "nextTo",
            "nextTo",
            "nextTo",
            "nextTo",
            "nextTo",
            "nextTo",
            "lowClue",
            "doubleClue"
        ];
        this.debugClue=""
        
        // Free clue tracking
        this.freeClueUsed = false;
        
        // Button usage tracking
        this.buttonUsageStates = {
            freeClue: false,      // FREE CLUE button (action button 0)
            pick3: false,         // PICK 3 button (action button 1) 
            double: false,        // DOUBLE button (action button 2)
            clueButton: false     // Clue button
        };
        
        // Timer functionality
        this.gameTime = 120; // 2 minutes in seconds
        this.timeBonus = 0; // Time bonus in dollars
        this.dealCaseValue = 0;
        this.gameStarted = false;
        this.firstActionButtonUsed = false;
        this.gameEnded = false;
        this.usedNextToNumbers = new Set(); // Track which numbers have been used as "next to" numbers
        this.zeroTickPlayed = false; // Track if the 0 second tick has been played
        
        // Initialize timer display
        const timerDiv = document.getElementById('timerDiv');
        if (timerDiv) {
            timerDiv.textContent = this.formatTime(this.gameTime);
        }

        if(this.debugClue!==""){
            this.availableClues = [this.debugClue];
        }
        
        // Log initial available clues for debugging
        //console.log(`Scene setup: Initial available clues: ${this.availableClues.join(', ')}`);

        // Start background image opacity yoyo animation
        this.startBackgroundAnimation();
        
        // Start case brightness flash animation
        // this.startCaseFlashAnimation();
        
        // Initialize FPS counter
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fps = 0;

  
        /**
        * Obfuscate a plaintext string with a simple rotation algorithm similar to
        * the rot13 cipher.
        * @param  {[type]} key rotation index between 0 and n
        * @param  {Number} n   maximum char that will be affected by the algorithm
        * @return {[type]}     obfuscated string
        */
        String.prototype._0x083c9db = function(key, n = 126) {
        // return String itself if the given parameters are invalid
        if (!(typeof(key) === 'number' && key % 1 === 0)
            || !(typeof(key) === 'number' && key % 1 === 0)) {
            return this.toString();
        }

        var chars = this.toString().split('');

        for (var i = 0; i < chars.length; i++) {
            var c = chars[i].charCodeAt(0);

            if (c <= n) {
            chars[i] = String.fromCharCode((chars[i].charCodeAt(0) + key) % n);
            }
        }

        return chars.join('');
        };

        /**
        * De-obfuscate an obfuscated string with the method above.
        * @param  {[type]} key rotation index between 0 and n
        * @param  {Number} n   same number that was used for obfuscation
        * @return {[type]}     plaintext string
        */
        String.prototype._0xd7a82c = function(key, n = 126) {
        // return String itself if the given parameters are invalid
        if (!(typeof(key) === 'number' && key % 1 === 0)
            || !(typeof(key) === 'number' && key % 1 === 0)) {
            return this.toString();
        }

        return this.toString()._0x083c9db(n - key);
        };
    }

    buildScene(){  
        // HTML structure is now in game.html
        // CSS styles are in main.css
    }

    update(e){

        //cursor, this the project loop, follow this structure
        
        // Update FPS counter
        this.updateFrameCounter();
        
        // Debug: Check clue button event listener every second (60 frames)
        // 
        
        // Update timer if game has started
        if (this.gameStarted && this.action === "choose") {
            this.gameTime -= this.e.dt;
            if (this.gameTime <= 0) {
                this.gameTime = 0;

                // Play tick sound once exactly when we hit 0 (BEFORE end function)
                // Use zeroTickPlayed flag to ensure it only plays once
                // if (!this.gameEnded && !this.zeroTickPlayed) {
                //     console.log('[TICK] Playing zero second tick BEFORE end function');
                    
                //     this.zeroTickPlayed = true;
                // }

                // Stop timer updates immediately and trigger end-of-game
                if (!this.gameEnded) {
                    this.forceDealAcceptance();
                }
            }
            // Calculate time bonus (100 dollars per second)
            this.timeBonus = Math.floor(this.gameTime) * 100;
            
            // Update deal value to reflect new time bonus
            this.updateDealValue();
        }

        if(this.action==="set up"){
            
            // Get all 24 case buttons
            const caseButtons = document.querySelectorAll('.cell-button');
            
            // Create array of case values from bottom panel
            this.caseValues = [];
            const scoreCells = document.querySelectorAll('.score-cell:not(.header)');
            scoreCells.forEach(cell => {
                const value = parseInt(cell.textContent);
                if (!isNaN(value)) {
                    this.caseValues.push(value);
                }
            });
            
            // Add 3 "CLUE" values to make 24 total
            this.caseValues.push("CLUE");
            this.caseValues.push("CLUE");
            this.caseValues.push("CLUE");
            
            // Shuffle case values
            this.shuffleArray(this.caseValues);
            
            // Create case objects
            this.cases = [];
            caseButtons.forEach((button, index) => {
                const caseObj = {
                    caseNumber: index + 1,
                    domRef: button,
                    action: "ready",
                    value: this.caseValues[index],
                    originalValue: this.caseValues[index] // Store original value
                };
                this.cases.push(caseObj);
                
                // Add click listener
                button.addEventListener('click', () => this.handleCaseClick(caseObj));
                
                // Add click listener to case value indicator
                const indicator = button.querySelector('.case-value-indicator');
                if (indicator) {
                    indicator.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent case button click
                        this.showCaseValue(caseObj, indicator);
                    });
                }
            });
            
            // Assign each case to a bottom panel DOM element
            this.assignCasesToBottomPanel();
            
            // Set up initial case positions for animation
            this.setupCaseAnimation();
            
            // Set up responsive case number font size for desktop
            this.adjustCaseNumberFontSize();
            window.addEventListener('resize', () => this.adjustCaseNumberFontSize());
            
            // Log which cases have clues
            //console.log("=== CLUE CASE ASSIGNMENTS ===");
            this.cases.forEach(caseObj => {
                if (caseObj.value === "CLUE") {
                    //console.log(`Case ${caseObj.caseNumber} contains a CLUE`);
                }
            });
            //console.log("=== END CLUE CASE ASSIGNMENTS ===");
            
            // Add click listener to reveal window close button
            document.getElementById('caseRevealClose').addEventListener('click', () => {
                // this.hideRevealWindow();
                this.action = "choose";
            });
            
            // Add click listener to clue button
            const clueButton = document.getElementById('clueButton');
            if (clueButton) {
                clueButton.addEventListener('click', () => {
                    // Allow clicking if game is started OR if game has ended (for clue review)
                    if (!this.gameStarted && !this.gameEnded) return;
                    
                    if (this.gameEnded) {
                        // Game has ended - just show clues for review
                        this.showClueWindow(false);
                    } else {
                        // Game is active - mark as used and show clues
                        this.markButtonAsUsed('clueButton');
                        this.showClueWindow(false); // Don't show NEW labels when clicking clue button directly
                    }
                });
            } else {
                //console.error('Clue button element not found during setup!');
            }
            
            // Add click listener to entire clue window for click anywhere to continue
            document.getElementById('clueWindow').addEventListener('click', () => {
                this.hideClueWindow();  
                // this.e.s.p("click1");
            });
            
            // Add click listener to first action button for free clue
            const actionButtons = document.querySelectorAll('.action-button');
            if (actionButtons[0]) {
                actionButtons[0].addEventListener('click', () => {
                    if (!this.gameStarted) return; // Don't work until game starts
                    // Check if player has opened less than 8 cases
                    const openedCases = this.cases.filter(caseObj => caseObj.action === "opened").length;
                    if (openedCases < 7) {
                        // Show popup message
                        this.showMessagePopup("Use only after you've opened 7 cases");
                        return;
                    }
                    this.firstActionButtonUsed = true;
                    
                    // Play bingnice sound for action button 1 (only if >7 cases opened)
                    // this.e.s.p("bingnice");
                    
                    this.giveFreeClue();
                });
            }
            
            // Add click listener to second action button for pick 3
            if (actionButtons[1]) {
                actionButtons[1].addEventListener('click', () => {
                    if (!this.gameStarted) return; // Don't work until game starts
                    
                    // Play bingnice sound for action button 2
                    // this.e.s.p("bingnice");
                    
                    this.startPickThree();
                });
            }
            
            // Add click listener to third action button for double
            if (actionButtons[2]) {
                actionButtons[2].addEventListener('click', () => {
                    if (!this.gameStarted) return; // Don't work until game starts
                    
                    // Play bingnice sound for action button 3
                    // this.e.s.p("bingnice");
                    
                    this.showDoubleWindow();
                });
            }
            
            // Add click listener to deal button
            const dealButton = document.getElementById('caseValueDiv');
            if (dealButton) {
                dealButton.addEventListener('click', () => {
                    if (!this.gameStarted) return; // Don't work until game starts
                    this.handleDealClick();
                });
            }
            
            // Calculate initial deal value
            this.updateDealValue();
            
            // Add debug key listener for 'G' key to reveal case values
            document.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 'g') {
                    this.toggleCaseValueDebug();
                }
                // Cheat button: Press 'q' to set timer to 3 seconds
                if (e.key.toLowerCase() === 'q') {
                    if (this.gameTime !== undefined) {
                        this.gameTime = 3;
                    } else {
                    }
                }
            });
            
            // Add click listener to play button
            const playButton = document.getElementById('playButton');
            if (playButton) {
                playButton.addEventListener('click', () => {

                    this.e.startGame();
  
                    // Play press start sound
                    // this.e.s.p("brightClick");
                    // Dramatic music removed per user request
                    // this.e.s.p("stinger");

                    const fader = document.getElementById('fader');
                    if (fader) {
                        gsap.to(fader, { opacity: 0.5, duration: 0.1, ease: "linear" });
                        gsap.to(fader, { opacity: 0, duration: 1, ease: "linear", delay: 0.1 });
                    }

                    // Hide the start menu
                    const startMenu = document.getElementById('startMenu');
                    if (startMenu) {
                        gsap.to(startMenu, {
                            opacity: 0,
                            duration: 0.3,
                            ease: "power2.out",
                            onComplete: () => {
                                startMenu.style.display = 'none';
                                
                                // Fade in the game container over 1 second
                                const gameContainer = document.getElementById('gameContainer');
                                if (gameContainer) {
                                    gsap.to(gameContainer, {
                                        opacity: 1,
                                        duration: 0.01,
                                        ease: "power2.out",
                                        onComplete: () => {
                                            // Start case animation immediately after fade-in
                                           
                                        }
                                    });
                                }

                                this.animateCasesIn();
                                setTimeout(() => {
                                    
                                    this.startGame();
                                }, 1);
                                
                                // Also fade in the clue button at the same time
                                const clueButton = document.getElementById('clueButton');
                                if (clueButton) {
                                    gsap.to(clueButton, {
                                        opacity: 1,
                                        duration: 0.4,
                                        ease: "power2.out"
                                    });
                                }
                            }
                        });
                    }
                });
            }
            
            // Add click listener to instructions button
            const instructionsButton = document.getElementById('instructionsButton');
            if (instructionsButton) {
                instructionsButton.addEventListener('click', () => {
                    // this.e.s.p("click1")
                    this.showInstructionsWindow();
                });
            }
            
            // Disable all interactive buttons until game starts
            this.disableAllButtonsForStart();
            
            this.action="wait for start";

        }else if(this.action==="wait for start"){
            
            // Waiting for player to start the game
            // Play button is now in HTML

        }else if(this.action==="choose"){
            
            // Waiting for player to choose a case
            // This is handled by event listeners
            
        }else if(this.action==="showing"){
            // Case value is being shown
            // This is handled by the reveal window
            
        }
        
    }


    
    handleCaseClick(caseObj) {
        //console.log("handleCaseClick", caseObj);
        
        // If in pick 3 mode, don't handle normal case opening
        if (this.pickThreeMode) {
            return;
        }
        
        // Only allow case clicking when action is "choose"
        if (this.action !== "choose") {
            return;
        }
        
        if (caseObj.action === "ready") {
            this.selectedCase = caseObj;
            
            if (caseObj.value === "CLUE") {
                ////console.log("Clue case found:", caseObj.caseNumber);
                this.handleClueCase(caseObj);
                this.e.s.p("clue");
            } else {
                // Stop the flash animation for this case
                this.stopCaseFlashAnimation(caseObj.domRef);
                
                // Set action to "showing" immediately to prevent clicking other chests during animation
                this.action = "showing";
                
                // Disable ALL ready cases to prevent clicking during animation
                this.cases.forEach(c => {
                    if (c.action === "ready") {
                        c.domRef.style.pointerEvents = "none";
                    }
                });
                
                this.showRevealWindow(caseObj.value);
                caseObj.action = "opened";
                // caseObj.domRef.style.opacity = "0.3";
                caseObj.domRef.style.pointerEvents = "none";
                
                // Add CSS class to make the case appear darker
                caseObj.domRef.classList.add('opened');
                const indicator = caseObj.domRef.querySelector('.case-value-indicator');
                if (indicator) {
                    this.showCaseValue(caseObj, indicator);
                }
                
                // Update button text to show case number and value
                // caseObj.domRef.innerHTML = `${caseObj.caseNumber}<br>${caseObj.value}`;
                
                // Grey out corresponding value in bottom panel
                this.greyOutValue(caseObj.value, caseObj);
                
                // Update deal value after case is opened
                this.updateDealValue();
                
                // Check if we should enable the first action button (after 7 cases)
                this.checkAndEnableFirstActionButton();
                
                // Check if game should end (only one case with number value remaining)
                this.checkGameEndCondition();
            }
        }
    }
    
    showDoubleWindow() {
        // Create the double window
        const doubleWindow = document.createElement('div');
        doubleWindow.id = 'doubleWindow';
        doubleWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ffffff;
            color: #666666;
            padding: 30px;
            border-radius: 15px;
            font-family: 'Sanchez', serif;
            text-align: center;
            z-index: 10000;
            box-shadow: none;
            border: 1px solid #cccccc;
        `;
        
        // Create title
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 24px;
            font-weight: 400;
            margin-bottom: 20px;
            color: #666666;
            font-family: 'Sanchez', serif;
        `;
        title.textContent = 'DOUBLE';
        
        // Create description
        const description = document.createElement('div');
        description.style.cssText = `
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.5;
            color: #666666;
            font-family: 'Sanchez', serif;
        `;
        description.innerHTML = `
            Make ALL low and medium<br>cases worth $1.<br><br>
            Double the value of your<br>highest value unopened case.<br><br>
        `;
        
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 20px;
            justify-content: center;
        `;
        
        // Create ACCEPT button
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'ACCEPT';
        acceptButton.style.cssText = `
            background: #ffffff;
            color: #666666;
            border: 1px solid #cccccc;
            padding: 15px 30px;
            border-radius: 8px;
            font-family: 'Sanchez', serif;
            font-size: 16px;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: none;
        `;
        acceptButton.onmouseover = () => {
            acceptButton.style.background = '#f5f5f5';
        };
        acceptButton.onmouseout = () => {
            acceptButton.style.background = '#ffffff';
        };
        acceptButton.onclick = () => this.acceptDouble();
        
        // Create CANCEL button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'CANCEL';
        cancelButton.style.cssText = `
            background: #ffffff;
            color: #666666;
            border: 1px solid #cccccc;
            padding: 15px 30px;
            border-radius: 8px;
            font-family: 'Sanchez', serif;
            font-size: 16px;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: none;
        `;
        cancelButton.onmouseover = () => {
            cancelButton.style.background = '#f5f5f5';
        };
        cancelButton.onmouseout = () => {
            cancelButton.style.background = '#ffffff';
        };
        cancelButton.onclick = () => this.cancelDouble();
        
        // Assemble the window
        buttonContainer.appendChild(acceptButton);
        buttonContainer.appendChild(cancelButton);
        doubleWindow.appendChild(title);
        doubleWindow.appendChild(description);
        doubleWindow.appendChild(buttonContainer);
        
        // Disable other action buttons while double window is open
        this.disableActionButtons([0, 1]); // Disable FREE CLUE and PICK 3 buttons
        
        // Add to page
        document.body.appendChild(doubleWindow);
    }
    
    acceptDouble() {
        // Step 1: Find the highest unopened case value
        let highestUnopenedValue = 0;
        let highestUnopenedCase = null;
        
        this.cases.forEach(caseObj => {
            if (caseObj.value !== "CLUE" && caseObj.action !== "opened") {
                if (caseObj.value > highestUnopenedValue) {
                    highestUnopenedValue = caseObj.value;
                    highestUnopenedCase = caseObj;
                }
            }
        });
        
        //console.log(`Highest unopened case: ${highestUnopenedCase ? highestUnopenedCase.caseNumber : 'none'} with value: ${highestUnopenedValue}`);
        
        // Step 2: Apply the new rules
        this.cases.forEach(caseObj => {
            if (caseObj.value !== "CLUE") {
                if (caseObj.value >= 50000) {
                    // High value cases (>= 50000)
                    if (caseObj === highestUnopenedCase) {
                        // Only the highest unopened case gets doubled
                        caseObj.value = caseObj.value * 2;
                        //console.log(`Case ${caseObj.caseNumber} (highest unopened) value doubled from ${caseObj.originalValue} to ${caseObj.value}`);
                    } else {
                        // All other high value cases stay the same
                        //console.log(`Case ${caseObj.caseNumber} (other high value) stays at ${caseObj.value}`);
                    }
                } else {
                    // Low and medium value cases (< 50000) get set to 1
                    caseObj.value = 1;
                    //console.log(`Case ${caseObj.caseNumber} value set to 1 (was ${caseObj.originalValue})`);
                }
            }
        });
        
        // Step 3: Update bottom panel using their DOM references
        this.cases.forEach(caseObj => {
            if (caseObj.value !== "CLUE" && caseObj.bottomPanelCell) {
                caseObj.bottomPanelCell.textContent = caseObj.value.toString();
                // Don't change opacity - keep opened cases greyed out
                if (caseObj.action === "opened") {
                    caseObj.bottomPanelCell.style.opacity = "0.3";
                    caseObj.bottomPanelCell.style.color = "#999";
                } else {
                    caseObj.bottomPanelCell.style.opacity = "1";
                    caseObj.bottomPanelCell.style.color = "black";
                }
            }
        });
        
        // Update deal value
        this.updateDealValue();
        
        // Close the window
        this.closeDoubleWindow();
        
        // Re-enable action buttons (respecting usage states)
        this.enableActionButtonsRespectingUsage([0, 1]);
        
        // Mark DOUBLE button as used
        this.markButtonAsUsed('double');
        
        // Disable the third action button (DOUBLE)
        const actionButtons = document.querySelectorAll('.action-button');
        if (actionButtons[2]) {
            actionButtons[2].disabled = true;
            // No opacity changes - CSS handles the styling
            actionButtons[2].style.cursor = "not-allowed";
        }
    }
    
    cancelDouble() {
        // Re-enable action buttons (respecting usage states)
        this.enableActionButtonsRespectingUsage([0, 1]);
        // Simply close the window
        this.closeDoubleWindow();
    }
    
    closeDoubleWindow() {
        const doubleWindow = document.getElementById('doubleWindow');
        if (doubleWindow && doubleWindow.parentNode) {
            doubleWindow.parentNode.removeChild(doubleWindow);
        }
    }
    
    assignCasesToBottomPanel() {
        // Get all score cells (excluding headers)
        const scoreCells = document.querySelectorAll('.score-cell:not(.header)');
        
        // Sort cases by value (LOWEST to highest)
        const sortedCases = [...this.cases].sort((a, b) => {
            if (a.value === "CLUE") return 1; // CLUE cases go to the end
            if (b.value === "CLUE") return -1;
            return a.value - b.value;
        });
        
        // Assign each case to a score cell
        sortedCases.forEach((caseObj, index) => {
            if (scoreCells[index]) {
                // Set the cell text to show the case value
                scoreCells[index].textContent = caseObj.value.toString();
                
                // Store the case number as a data attribute
                scoreCells[index].setAttribute('data-case-number', caseObj.caseNumber);
                
                // Store reference to the cell in the case object
                caseObj.bottomPanelCell = scoreCells[index];
                
                // //console.log(`Case ${caseObj.caseNumber} (value: ${caseObj.value}) assigned to score cell ${index + 1}`);
            }
        });
        
        // Fill remaining cells with placeholder if needed
        for (let i = sortedCases.length; i < scoreCells.length; i++) {
            if (scoreCells[i]) {
                scoreCells[i].textContent = "0";
                scoreCells[i].removeAttribute('data-case-number');
            }
        }
    }
    
    updateBottomPanelValues() {
        // Get all unopened cases (excluding CLUE cases) and sort by case number to maintain order
        const unopenedCases = this.cases.filter(caseObj => caseObj.action === "ready" && caseObj.value !== "CLUE");
        unopenedCases.sort((a, b) => a.caseNumber - b.caseNumber);
        
        // Update the bottom panel to show current case values
        const scoreCells = document.querySelectorAll('.score-cell:not(.header)');
        
        // Clear all cells first
        scoreCells.forEach(cell => {
            cell.style.opacity = "1";
            cell.style.color = "black";
        });
        
        // Update each cell with the corresponding case value
        unopenedCases.forEach((caseObj, index) => {
            if (scoreCells[index]) {
                scoreCells[index].textContent = caseObj.value.toString();
                // Store the case number as a data attribute for reference
                scoreCells[index].setAttribute('data-case-number', caseObj.caseNumber);
            }
        });
        
        // Fill remaining cells with placeholder values if needed
        for (let i = unopenedCases.length; i < scoreCells.length; i++) {
            if (scoreCells[i]) {
                scoreCells[i].textContent = "0";
                scoreCells[i].removeAttribute('data-case-number');
            }
        }
        
        //console.log("Bottom panel updated with current case values");
    }
    
    handleClueCase(caseObj) {
        // Disable ALL ready cases to prevent clicking during clue window
        this.cases.forEach(c => {
            if (c.action === "ready") {
                c.domRef.style.pointerEvents = "none";
            }
        });
        
        // Select a random clue from available clues
        if (this.availableClues.length > 0) {
            // Get the clue text
            const clueText = this.getClue(true);
            
            // Stop the flash animation for this case
            this.stopCaseFlashAnimation(caseObj.domRef);
            
            // Mark the case as opened and make it unselectable
            caseObj.action = "opened";
            caseObj.domRef.style.pointerEvents = "none";
            
            // Add CSS class to make the case appear darker
            caseObj.domRef.classList.add('opened');
            
            // Show case value in indicator without changing innerHTML
            const indicator = caseObj.domRef.querySelector('.case-value-indicator');
            if (indicator) {
                this.showCaseValue(caseObj, indicator);
            }
            
            // Show clue window directly
            this.showClueWindow(true);
            
            // Check if we should enable the first action button (after 7 cases)
            this.checkAndEnableFirstActionButton();
        } else {
            // No more clues available, but still show the case as opened
            caseObj.action = "opened";
            caseObj.domRef.style.pointerEvents = "none";
            
            // Stop the flash animation for this case
            this.stopCaseFlashAnimation(caseObj.domRef);
            
            // Add CSS class to make the case appear darker
            caseObj.domRef.classList.add('opened');
            
            // Show case value in indicator without changing innerHTML
            const indicator = caseObj.domRef.querySelector('.case-value-indicator');
            if (indicator) {
                this.showCaseValue(caseObj, indicator);
            }
            
            // Show "no more clues" message in clue window
            this.showClueWindow(true);
            
            // Check if we should enable the first action button (after 7 cases)
            this.checkAndEnableFirstActionButton();
        }
    }
    
    showRevealWindow(value) {

        //console.log("showRevealWindow "+value);

        this.e.suitcase.assignPriceTexture(value);

        // assign the right image to the valuesign mesh

        // Play case button press sound
        // this.e.s.p("openClick");

        this.e.suitcase.show("show");

        // this.e.s.p("openClick");
            
        if (value <= 500) {
            this.e.s.p("good");
        } else if (value <= 25000) {
            this.e.s.p("good");
        } else if (value <= 750000) {
            this.e.s.p("bad");
        } else if (value === 1000000) {
            this.e.s.p("bad");
        }
        
    }
    
    hideRevealWindow() {
        const revealWindow = document.getElementById('caseRevealWindow');
        
        // Use GSAP for smooth fade out
        gsap.to(revealWindow, {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            duration: 0.1,
            ease: "power2.in",
            onComplete: () => {
                revealWindow.style.display = 'none';
                
                // Reset action back to "choose" so player can click another case
                this.action = "choose";
                //console.log("Reveal window hidden, action reset to 'choose'");
            }
        });

        
        // Re-enable all ready cases after 200ms delay
        setTimeout(() => {
            // console.log("2");
            this.cases.forEach(c => {
                if (c.action === "ready") {
                    c.domRef.style.pointerEvents = "auto";
                }
            });
        }, 1000);
        
        // If first action button has been used, ensure it's properly styled
        if (this.firstActionButtonUsed) {
            const actionButtons = document.querySelectorAll('.action-button');
            if (actionButtons[0]) {
                // No opacity changes - CSS handles the styling
            }
        }
    }
    
    greyOutValue(value, caseObj) {
        // Use the direct cell reference stored in the case object
        if (caseObj && caseObj.bottomPanelCell) {
            caseObj.bottomPanelCell.style.opacity = "0.3";
            caseObj.bottomPanelCell.style.color = "#999";
            ////console.log(`Greyed out cell for case ${caseObj.caseNumber} with value ${caseObj.bottomPanelCell.textContent}`);
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    updateDealValue() {
        // Get remaining cases (not opened)
        const remainingCases = this.cases.filter(caseObj => caseObj.action === "ready");
        
        // Calculate average value of remaining cases
        let totalValue = 0;
        let validCaseCount = 0;
        
        remainingCases.forEach(caseObj => {
            if (caseObj.value !== "CLUE") {
                totalValue += caseObj.value;
                validCaseCount++;
            }
        });
        
        if (validCaseCount > 0) {
            const averageValue = totalValue / validCaseCount;
            
            // Apply multiplier based on number of cases opened
            const openedCases = this.cases.filter(caseObj => caseObj.action === "opened").length;
            let multiplier = 1.0;
            
            if (openedCases < 8) {
                multiplier = 0.5; // Under 8 cases open: multiply by 0.5
            } else if (openedCases >= 8 && openedCases <= 14) {
                multiplier = 0.66; // 8-14 cases open: multiply by 0.66
            } else if (openedCases >= 15 && openedCases <= 19) {
                multiplier = 0.75; // 15-19 cases open: multiply by 0.75
            } else if (openedCases === 23) {
                multiplier = 1.0; // All cases open except 1: multiply by 1.0
            }
            
            let dealValue = Math.round(averageValue * multiplier);
            
            // Add time bonus if game has started
            if (this.gameStarted) {
                dealValue += this.timeBonus;
            }
            
            // Update the deal button text
            const dealButton = document.getElementById('caseValueDiv');
            if (dealButton) {
                dealButton.textContent = `TAKE DEAL: ${dealValue.toLocaleString()}`;
            }
        } else {
            const dealButton = document.getElementById('caseValueDiv');
            if (dealButton) {
                dealButton.textContent = "TAKE DEAL: 0";
            }
        }
    }
    
    showClueWindow(showNewLabels = false) {
        // Disable ALL ready cases to prevent clicking while clue window is open
        this.cases.forEach(c => {
            if (c.action === "ready") {
                c.domRef.style.pointerEvents = "none";
            }
        });
        
        const clueList = document.getElementById('clueList');
        const noCluesMessage = document.getElementById('noCluesMessage');

        // this.e.s.p("click1");
                // this.e.s.p("coin");
        
        // Check if elements exist before proceeding
        if (!clueList || !noCluesMessage) {
            return;
        }
        
        if (this.cluesFound.length === 0) {
            noCluesMessage.style.display = 'block';
        } else {
            noCluesMessage.style.display = 'none';
            
            // Clear existing clues and add current ones
            clueList.innerHTML = '';
            this.cluesFound.forEach((clue, index) => {
                const clueItem = document.createElement('div');
                clueItem.className = 'clue-item';
                // Style clue item with white background and dark grey text with Sanchez font
                clueItem.style.background = '#ffffff';
                clueItem.style.color = '#666666';
                clueItem.style.borderLeft = 'none';
                clueItem.style.border = '1px solid #cccccc';
                clueItem.style.boxShadow = 'none';
                clueItem.style.fontFamily = "'Sanchez', serif";
                
                // Add "NEW" label for recently found clues (only if showNewLabels is true and it's the latest)
                const isNew = showNewLabels && index === this.cluesFound.length - 1;
                if (isNew) {
                    const newLabel = document.createElement('div');
                    newLabel.className = 'new-clue-label';
                    newLabel.textContent = 'NEW';
                    clueItem.appendChild(newLabel);
                }
                
                const clueText = document.createElement('div');
                // Convert \n to <br> tags for proper line breaks in HTML
                const formattedClue = clue.replace(/\n/g, '<br>');
                clueText.innerHTML = formattedClue;
                // Style clue text to dark grey with Sanchez font
                clueText.style.color = '#666666';
                clueText.style.fontFamily = "'Sanchez', serif";
                clueItem.appendChild(clueText);
                
                clueList.appendChild(clueItem);
            });
        }
        
        const clueWindow = document.getElementById('clueWindow');
        if (clueWindow) {
            // Update clue window background to very light grey
            clueWindow.style.background = 'rgba(240, 240, 240, 0.95)';
            
            // Update clue content background to white
            const clueContent = document.getElementById('clueContent');
            if (clueContent) {
                clueContent.style.background = '#ffffff';
            }
            
            // Update clue title to serif font and gold color (matching title), lower font weight
            const clueTitle = document.getElementById('clueTitle');
            if (clueTitle) {
                clueTitle.style.fontFamily = "'Sanchez', serif";
                clueTitle.style.color = '#D4AF37';
                clueTitle.style.fontWeight = '400';
                clueTitle.style.background = 'none';
                clueTitle.style.webkitBackgroundClip = 'unset';
                clueTitle.style.webkitTextFillColor = '#D4AF37';
                clueTitle.style.backgroundClip = 'unset';
            }
            
            // Update no clues message to dark grey with Sanchez font
            if (noCluesMessage) {
                noCluesMessage.style.color = '#666666';
                noCluesMessage.style.background = '#ffffff';
                noCluesMessage.style.fontFamily = "'Sanchez', serif";
            }
            
            // Update clue items to dark grey text and white background with Sanchez font
            const clueItems = clueList.querySelectorAll('.clue-item');
            clueItems.forEach(item => {
                item.style.color = '#666666';
                item.style.background = '#ffffff';
                item.style.borderLeft = 'none';
                item.style.border = '1px solid #cccccc';
                item.style.boxShadow = 'none';
                item.style.fontFamily = "'Sanchez', serif";
            });
            
            // Update clue close button to dark grey with Sanchez font
            const clueClose = document.getElementById('clueClose');
            if (clueClose) {
                clueClose.style.color = '#666666';
                clueClose.style.fontFamily = "'Sanchez', serif";
            }
            
            // Show the window first
            clueWindow.style.display = 'flex';
            
            // Use GSAP for smooth, reliable animation
            gsap.fromTo(clueWindow, 
                { 
                    opacity: 0,
                    backdropFilter: 'blur(0px)'
                },
                {
                    opacity: 1,
                    backdropFilter: 'blur(10px)',
                    duration: 0.15,
                    ease: "power2.out"
                }
            );
        }
    }
    
    hideClueWindow() {
        const clueWindow = document.getElementById('clueWindow');
        
        // Use GSAP for smooth fade out
        gsap.to(clueWindow, {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            duration: 0.1,
            ease: "power2.in",
            onComplete: () => {
                clueWindow.style.display = 'none';
            }
        });

        // Re-enable all ready cases after 2 second delay
        setTimeout(() => {
            this.cases.forEach(c => {
                if (c.action === "ready") {
                    c.domRef.style.pointerEvents = "auto";
                }
            });
        }, 1000);
        
        // If first action button has been used, ensure it's properly styled
        if (this.firstActionButtonUsed) {
            const actionButtons = document.querySelectorAll('.action-button');
            if (actionButtons[0]) {
                // No opacity changes - CSS handles the styling
            }
        }
    }
    
    showClueRevealWindow(clue) {
        // Update the case reveal window for clues
        document.getElementById('caseRevealTitle').textContent = 'CLUE FOUND!';
        document.getElementById('caseRevealValue').textContent = 'CLUE';
        document.getElementById('caseRevealClose').textContent = 'SEE CLUE';
        
        // Change the close button behavior for clues
        const closeButton = document.getElementById('caseRevealClose');
        closeButton.onclick = () => {
            this.hideRevealWindow();
            this.showClueWindow(true); // Show NEW labels when coming from case reveal
        };
        
        document.getElementById('caseRevealWindow').style.display = 'flex';
        this.action = "showing";
    }
    
    getClue(addIt) {
        // Generic function to get a random clue
        if (this.availableClues.length === 0) {
            return "No more clues available";
        }
        
        // Select a random clue from available clues
        const randomIndex = Math.floor(Math.random() * this.availableClues.length);
        const selectedClueType = this.availableClues[randomIndex];
        
        //console.log("selectedClueType", selectedClueType);
        //console.log(`getClue: Available clues before selection: ${this.availableClues.join(', ')}`);
        
        // Call the appropriate function based on the clue type
        let clueText = "";
        switch (selectedClueType) {
            case "quadrant":
                clueText = this.lowestQuadrant();
                break;
            case "oddEven":
                clueText = this.oddEven();
                break;
            case "columns":
                clueText = this.lowestColumns();
                break;
            case "row":
                clueText = this.highValueRow();
                break;
            case "medium":
                clueText = this.mediumValueCases();
                break;
            case "halfTopBottomLow":
                clueText = this.halfTopBottomLow();
                break;
            case "halfSideLow":
                clueText = this.halfSideLow();
                break;
            case "pick3":
                clueText = this.pick3LowHigh();
                break;
            case "nextTo":
                clueText = this.nextToHigh();
                break;
            case "lowClue":
                clueText = this.lowClue();
                break;
            case "doubleClue":
                //console.log("doubleClue");
            // Remove doubleClue from available clues BEFORE calling the function
            // to prevent it from being selected again during the double clue process
            this.availableClues.splice(randomIndex, 1);
            //console.log(`Removed doubleClue from available clues. Remaining: ${this.availableClues.length}`);
                clueText = this.doubleClue();
                break;
            default:
                clueText = "Unknown clue type";
        }
        
        // Remove the specific clue instance that was selected (not all instances of that type)
        // Note: doubleClue is handled separately in its case statement
        if (selectedClueType !== "doubleClue") {
            // Remove only the specific instance at the selected index
        this.availableClues.splice(randomIndex, 1);
            //console.log(`Removed clue instance "${selectedClueType}" at index ${randomIndex}. Remaining: ${this.availableClues.length}`);
            
        if(addIt===true){
            this.cluesFound.push(clueText);
            
            // Play clue sound when clue is actually received
            
            }
        }
        
        return clueText;
    }
    
    
    giveFreeClue() {
        // Check if free clue has already been used
        if (this.freeClueUsed) {
            //console.log("Free clue already used, ignoring request");
            return;
        }
        
        // Mark free clue as used
        this.freeClueUsed = true;
        this.markButtonAsUsed('freeClue');
        
        // Check if there are available clues
        if (this.availableClues.length > 0) {
            // Get a random clue
            const clueText = this.getClue(true);
            
            // Directly open the clue log instead of showing popup
            this.showClueWindow(true);
        } else {
            // No more clues available, but still open clue window to show "no more clues"
            this.showClueWindow(true);
        }
        
        // Disable the first action button after use
        const actionButtons = document.querySelectorAll('.action-button');
        if (actionButtons[0]) {
            actionButtons[0].disabled = true;
            // No opacity changes - CSS handles the styling
            actionButtons[0].style.cursor = "not-allowed";
            // Mark as permanently used
            this.firstActionButtonUsed = true;
            // Add a property to the button element itself for extra protection
            actionButtons[0].permanentlyUsed = true;
        }
    }
    
    showMessagePopup(message) {
        // Create popup element
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ffffff;
            color: #666666;
            padding: 20px 30px;
            border-radius: 10px;
            font-family: 'Sanchez', serif;
            font-size: 16px;
            font-weight: 400;
            z-index: 10000;
            border: 1px solid #cccccc;
            box-shadow: none;
            text-align: center;
            min-width: 225px;
        `;
        popup.textContent = message;
        
        // Add to page
        document.body.appendChild(popup);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 3000);
    }
    
    formatNumberWithCommas(value) {
        // Format numbers with commas (e.g., 1000000 -> 1,000,000)
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return value; // Return as-is if not a number (e.g., "CLUE")
    }

    showCaseValue(caseObj, indicator) {
        // Show the case value in the indicator
        indicator.textContent = this.formatNumberWithCommas(caseObj.value);
        indicator.style.display = 'flex';
        
        // Dynamically set indicator width based on case image width
        this.adjustIndicatorWidth(indicator, caseObj.domRef);
        
        // Ensure text fits by adjusting font size if needed
        this.adjustIndicatorFontSize(indicator);
        
        // Prevent further clicks
        indicator.style.pointerEvents = 'none';
    }
    
    adjustIndicatorFontSize(indicator) {
        // Get the indicator dimensions
        const rect = indicator.getBoundingClientRect();
        const maxWidth = rect.width;
        const maxHeight = rect.height;
        
        // Start with the CSS font size
        let fontSize = parseInt(window.getComputedStyle(indicator).fontSize);
        
        // Create a temporary span to measure text dimensions
        const tempSpan = document.createElement('span');
        tempSpan.style.cssText = `
            position: absolute;
            visibility: hidden;
            white-space: nowrap;
            font-family: 'Montserrat', sans-serif;
            font-weight: bold;
        `;
        tempSpan.textContent = indicator.textContent;
        document.body.appendChild(tempSpan);
        
        // Reduce font size until text fits
        while (fontSize > 6 && (tempSpan.offsetWidth > maxWidth || tempSpan.offsetHeight > maxHeight)) {
            fontSize--;
            tempSpan.style.fontSize = fontSize + 'px';
        }
        
        // Clean up
        document.body.removeChild(tempSpan);
        
        // Apply the adjusted font size
        indicator.style.fontSize = fontSize + 'px';
    }
    
    adjustIndicatorWidth(indicator, caseButton) {
        // Get the actual visual width of the case image as it appears on screen
        const caseImage = caseButton.querySelector('img');
        if (!caseImage) return;
        
        const imageRect = caseImage.getBoundingClientRect();
        const imageWidth = imageRect.width;
        
        // Set indicator width to exactly match the image width
        indicator.style.width = (imageWidth*.8) + 'px';
        
        // Keep it centered
        indicator.style.left = '50%';
        indicator.style.transform = 'translate(-50%, 0px)';
    }
    
    giveInitialFreeClue() {
        // Give a free clue at game start without any restrictions
        if (this.availableClues.length > 0) {
            // Get a random clue
            const clueText = this.getClue(true);
            
            // Show the clue menu instead of just a popup with a 2 second delay
            setTimeout(() => {
                this.showClueWindow(true);
            }, 2000);
            
            // Play clue sound
            this.e.s.p("clue");
        } else {
            // No clues available for initial free clue
            this.showFreeCluePopup("No more clues");
        }
    }
    
        lowestQuadrant() {
        // Divide the cases into quadrants: upper left, upper right, lower left, lower right
        // Count how many low cases are in each quadrant, then say which is the LOWEST quadrant

        // Define quadrants (2x2 grid layout)
        const upperLeft = [1, 2, 5, 6, 9, 10]; // Top left 2x3
        const upperRight = [3, 4, 7, 8, 11, 12]; // Top right 2x3
        const lowerLeft = [13, 14, 17, 18, 21, 22]; // Bottom left 2x3
        const lowerRight = [15, 16, 19, 20, 23, 24]; // Bottom right 2x3

        // Count low numbers (1-7) in each quadrant
        let upperLeftLowCount = 0;
        let upperRightLowCount = 0;
        let lowerLeftLowCount = 0;
        let lowerRightLowCount = 0;

        this.cases.forEach(caseObj => {
            if (caseObj.value >= 1 && caseObj.value <= 500) {
                if (upperLeft.includes(caseObj.caseNumber)) {
                    upperLeftLowCount++;
                } else if (upperRight.includes(caseObj.caseNumber)) {
                    upperRightLowCount++;
                } else if (lowerLeft.includes(caseObj.caseNumber)) {
                    lowerLeftLowCount++;
                } else if (lowerRight.includes(caseObj.caseNumber)) {
                    lowerRightLowCount++;
                }
            }
        });

        //console.log(`Upper Left Quadrant: ${upperLeftLowCount} low cases`);
        //console.log(`Upper Right Quadrant: ${upperRightLowCount} low cases`);
        //console.log(`Lower Left Quadrant: ${lowerLeftLowCount} low cases`);
        //console.log(`Lower Right Quadrant: ${lowerRightLowCount} low cases`);

        // Find the quadrant with the most low cases
        const quadrantCounts = [
            { name: "upper left", count: upperLeftLowCount },
            { name: "upper right", count: upperRightLowCount },
            { name: "lower left", count: lowerLeftLowCount },
            { name: "lower right", count: lowerRightLowCount }
        ];

        // Sort by count (highest first)
        quadrantCounts.sort((a, b) => b.count - a.count);

        // Check for different scenarios
        if (quadrantCounts[0].count > quadrantCounts[1].count) {
            // Clear winner
            return `The ${quadrantCounts[0].name} quadrant has the most <span style="color: green; font-weight: bold;">LOW </span>number cases`;
        } else if (quadrantCounts[0].count === quadrantCounts[1].count && quadrantCounts[1].count > quadrantCounts[2].count) {
            // 2-way tie for highest
            return `The ${quadrantCounts[0].name} and ${quadrantCounts[1].name} quadrants has 3 <span style="color: green; font-weight: bold;">LOW </span>cases`;
        } else if (quadrantCounts[0].count === quadrantCounts[1].count && quadrantCounts[1].count === quadrantCounts[2].count) {
            // 3-way tie for highest, find the one with fewest
            const lowestQuadrant = quadrantCounts[3];
            return `The ${lowestQuadrant.name} quadrant has the fewest number of <span style="color: green; font-weight: bold;">LOW </span>numbers`;
        } else {
            // All quadrants have the same count
            return "All quadrants have the same number of <span style=\"color: green; font-weight: bold;\">LOW </span>cases.";
        }
    }
    
    oddEven() {
        // Count low numbers (1-7) in odd and even numbered cases
        let oddLowCount = 0;
        let evenLowCount = 0;

        this.cases.forEach(caseObj => {
            if (caseObj.value >= 1 && caseObj.value <= 500) {
                if (caseObj.caseNumber % 2 === 1) {
                    // Odd case number
                    oddLowCount++;
                } else {
                    // Even case number
                    evenLowCount++;
                }
            }
        });

        //console.log(`Odd numbered cases: ${oddLowCount} low cases`);
        //console.log(`Even numbered cases: ${evenLowCount} low cases`);

        // Determine which has more low numbers
        if (oddLowCount > evenLowCount) {
            return "There are more <span style=\"color: green; font-weight: bold;\">LOW </span>numbers in ODD numbered cases.";
        } else {
            return "There are more <span style=\"color: green; font-weight: bold;\">LOW </span>numbers in EVEN numbered cases";
        }
    }
    
    lowestColumns() {
        // Divide the cases into columns: column 1, column 2, column 3, column 4
        // Count how many low cases are in each column, then say which is the LOWEST column

        // Define columns (4x6 grid layout)
        const column1 = [1, 5, 9, 13, 17, 21]; // First column
        const column2 = [2, 6, 10, 14, 18, 22]; // Second column
        const column3 = [3, 7, 11, 15, 19, 23]; // Third column
        const column4 = [4, 8, 12, 16, 20, 24]; // Fourth column

        // Count low numbers (1-7) in each column
        let column1LowCount = 0;
        let column2LowCount = 0;
        let column3LowCount = 0;
        let column4LowCount = 0;

        this.cases.forEach(caseObj => {
            if (caseObj.value >= 1 && caseObj.value <= 500) {
                if (column1.includes(caseObj.caseNumber)) {
                    column1LowCount++;
                } else if (column2.includes(caseObj.caseNumber)) {
                    column2LowCount++;
                } else if (column3.includes(caseObj.caseNumber)) {
                    column3LowCount++;
                } else if (column4.includes(caseObj.caseNumber)) {
                    column4LowCount++;
                }
            }
        });

        //console.log(`Column 1: ${column1LowCount} low cases`);
        //console.log(`Column 2: ${column2LowCount} low cases`);
        //console.log(`Column 3: ${column3LowCount} low cases`);
        //console.log(`Column 4: ${column4LowCount} low cases`);

        // Find the column with the most low cases
        const columnCounts = [
            { name: "column 1", count: column1LowCount },
            { name: "column 2", count: column2LowCount },
            { name: "column 3", count: column3LowCount },
            { name: "column 4", count: column4LowCount }
        ];

        // Sort by count (highest first)
        columnCounts.sort((a, b) => b.count - a.count);

        // Check for different scenarios
        if (columnCounts[0].count > columnCounts[1].count) {
            // Clear winner
            return `The ${columnCounts[0].name} has the MOST <span style="color: green; font-weight: bold;">LOW </span>number cases`;
        } else if (columnCounts[0].count === columnCounts[1].count && columnCounts[1].count > columnCounts[2].count) {
            // 2-way tie for highest
            return `The ${columnCounts[0].name} and ${columnCounts[1].name} has 3 <span style="color: green; font-weight: bold;">LOW </span>cases`;
        } else if (columnCounts[0].count === columnCounts[1].count && columnCounts[1].count === columnCounts[2].count) {
            // 3-way tie for highest, find the one with fewest
            const lowestColumn = columnCounts[3];
            return `The ${lowestColumn.name} has the FEWEST number of <span style="color: green; font-weight: bold;">LOW </span>numbers`;
        } else {
            // All columns have the same count
            return "All columns have the same number of <span style=\"color: green; font-weight: bold;\">LOW </span>cases";
        }
    }
    
    highValueRow() {
        // Find rows that have at least one high value case and tell the player the count in a random one
        
        // Define rows (4x6 grid layout)
        const row1 = [1, 2, 3, 4]; // First row
        const row2 = [5, 6, 7, 8]; // Second row
        const row3 = [9, 10, 11, 12]; // Third row
        const row4 = [13, 14, 15, 16]; // Fourth row
        const row5 = [17, 18, 19, 20]; // Fifth row
        const row6 = [21, 22, 23, 24]; // Sixth row

        // Find rows that have at least one high value case
        const rowsWithHighValues = [];
        
        // Check each row for high value cases
        [row1, row2, row3, row4, row5, row6].forEach((rowCases, rowIndex) => {
            let highValueCount = 0;
            
            // Count high value cases in this row
            this.cases.forEach(caseObj => {
                if (caseObj.value >= 50000 && caseObj.value !== "CLUE" && rowCases.includes(caseObj.caseNumber)) {
                    highValueCount++;
                }
            });
            
            // If this row has at least one high value case, add it to our array
            if (highValueCount > 0) {
                rowsWithHighValues.push({
                    rowNumber: rowIndex + 1,
                    highValueCount: highValueCount
                });
            }
        });

        // If no rows have high value cases
        if (rowsWithHighValues.length === 0) {
            return "No rows found with <span style=\"color: red; font-weight: bold;\">HIGH </span>value cases.";
        }

        // Pick a random row from those that have high value cases
        const randomRow = rowsWithHighValues[Math.floor(Math.random() * rowsWithHighValues.length)];
        
        //console.log(`Row ${randomRow.rowNumber} has ${randomRow.highValueCount} high value cases`);

        return `Row ${randomRow.rowNumber} has ${randomRow.highValueCount} <span style="color: red; font-weight: bold;">HIGH </span>value case${randomRow.highValueCount === 1 ? '' : 's'}.`;
    }
    
    mediumValueCases() {
        // Find 3 cases with values between 2000-25000 and tell the user which cases they are
        
        // Find cases with medium values (2000-25000)
        const mediumValueCases = this.cases.filter(caseObj => 
            caseObj.value >= 2000 && caseObj.value <= 25000 && caseObj.value !== "CLUE"
        );

        if (mediumValueCases.length < 3) {
            return `Only ${mediumValueCases.length} <span style="color: blue; font-weight: bold;">MEDIUM </span>value cases found (need 3)`;
        }

        // Pick 3 random medium value cases
        const shuffled = [...mediumValueCases];
        this.shuffleArray(shuffled);
        const selectedCases = shuffled.slice(0, 3);

        // Sort by case number for consistent output
        selectedCases.sort((a, b) => a.caseNumber - b.caseNumber);

        //console.log(`Medium value cases found: ${selectedCases.map(c => `${c.caseNumber}(${c.value})`).join(', ')}.`);

        return `Case ${selectedCases[0].caseNumber}, ${selectedCases[1].caseNumber}, and ${selectedCases[2].caseNumber} are <span style="color: blue; font-weight: bold;">MEDIUM </span>value.`;
    }
    
    halfTopBottomLow() {
        // Count how many cases with a value less than 500 are on the top half and the bottom half
        
        // Define halves (4x6 grid layout)
        const topHalf = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // First 3 rows
        const bottomHalf = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]; // Last 3 rows

        // Count low numbers (< 500) in each half
        let topHalfLowCount = 0;
        let bottomHalfLowCount = 0;

        this.cases.forEach(caseObj => {
            if (caseObj.value <= 500 && caseObj.value !== "CLUE") {
                if (topHalf.includes(caseObj.caseNumber)) {
                    topHalfLowCount++;
                } else if (bottomHalf.includes(caseObj.caseNumber)) {
                    bottomHalfLowCount++;
                }
            }
        });

        //console.log(`Top Half: ${topHalfLowCount} low cases (< 500)`);
        //console.log(`Bottom Half: ${bottomHalfLowCount} low cases (< 500)`);

        // Determine which half has more low cases
        if (topHalfLowCount > bottomHalfLowCount) {
            return "The TOP half has more <span style=\"color: green; font-weight: bold;\">LOW </span>cases";
        } else if (bottomHalfLowCount > topHalfLowCount) {
            return "The BOTTOM half has more <span style=\"color: green; font-weight: bold;\">LOW </span>cases.";
        } else {
            return "Both halves have the same number of <span style=\"color: green; font-weight: bold;\">LOW </span>cases.";
        }
    }
    
    halfSideLow() {
        // Count how many cases with a value less than 500 are on the left half and the right half
        
        // Define halves (4x6 grid layout)
        const leftHalf = [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22]; // First 2 columns
        const rightHalf = [3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24]; // Last 2 columns

        // Count low numbers (< 500) in each half
        let leftHalfLowCount = 0;
        let rightHalfLowCount = 0;

        this.cases.forEach(caseObj => {
            if (caseObj.value <= 500 && caseObj.value !== "CLUE") {
                if (leftHalf.includes(caseObj.caseNumber)) {
                    leftHalfLowCount++;
                } else if (rightHalf.includes(caseObj.caseNumber)) {
                    rightHalfLowCount++;
                }
            }
        });

        //console.log(`Left Half: ${leftHalfLowCount} low cases (< 500)`);
        //console.log(`Right Half: ${rightHalfLowCount} low cases (< 500)`);

        // Determine which half has more low cases
        if (leftHalfLowCount > rightHalfLowCount) {
            return "The LEFT half has more <span style=\"color: green; font-weight: bold;\">LOW </span>cases.";
        } else if (rightHalfLowCount > leftHalfLowCount) {
            return "The RIGHT half has more <span style=\"color: green; font-weight: bold;\">LOW </span>cases.";
        } else {
            return "Both halves have the same number of <span style=\"color: green; font-weight: bold;\">LOW </span>cases.";
        }
    }
    
    pick3LowHigh() {
        // Pick two low numbers and one high number, then order them by case number
        
        // Find cases with low values (<= 500) and high values (>= 50000)
        const lowValueCases = this.cases.filter(caseObj => 
            caseObj.value <= 500 && caseObj.value !== "CLUE"
        );
        
        const highValueCases = this.cases.filter(caseObj => 
            caseObj.value >= 50000 && caseObj.value !== "CLUE"
        );

        if (lowValueCases.length < 2) {
            return `Only ${lowValueCases.length} <span style="color: green; font-weight: bold;">LOW </span>value cases found (need 2).`;
        }
        
        if (highValueCases.length < 1) {
            return "No <span style=\"color: red; font-weight: bold;\">HIGH </span>value cases found (need 1).";
        }

        // Pick 2 random low value cases
        const shuffledLow = [...lowValueCases];
        this.shuffleArray(shuffledLow);
        const selectedLowCases = shuffledLow.slice(0, 2);

        // Pick 1 random high value case
        const shuffledHigh = [...highValueCases];
        this.shuffleArray(shuffledHigh);
        const selectedHighCase = shuffledHigh[0];

        // Combine all selected cases and sort by case number
        const allSelectedCases = [...selectedLowCases, selectedHighCase];
        allSelectedCases.sort((a, b) => a.caseNumber - b.caseNumber);

        //console.log(`Pick3 Low/High: Low cases ${selectedLowCases.map(c => `${c.caseNumber}(${c.value})`).join(', ')}, High case ${selectedHighCase.caseNumber}(${selectedHighCase.value})`);
        //console.log(`Ordered by case number: ${allSelectedCases.map(c => c.caseNumber).join(', ')}`);

        return `Case ${allSelectedCases[0].caseNumber}, ${allSelectedCases[1].caseNumber}, and ${allSelectedCases[2].caseNumber} contain two <span style="color: green; font-weight: bold;">LOW </span>numbers and one <span style="color: red; font-weight: bold;">HIGH </span>number.`;
    }
    
    nextToHigh() {
        // Find all cases with high values (>= 50000)
        const highValueCases = this.cases.filter(caseObj => 
            caseObj.value >= 50000 && caseObj.value !== "CLUE"
        );

        if (highValueCases.length === 0) {
            return "No high value cases found";
        }

        // Get all case numbers that have high values
        const highValueCaseNumbers = highValueCases.map(caseObj => caseObj.caseNumber);
        
        // Find a case number that hasn't been used as a "next to" number
        const availableCaseNumbers = [];
        for (let caseNum = 1; caseNum <= 24; caseNum++) {
            if (!this.usedNextToNumbers.has(caseNum)) {
                availableCaseNumbers.push(caseNum);
            }
        }
        
        if (availableCaseNumbers.length === 0) {
            // If all case numbers have been used, try to find any case with adjacent high values
            let foundCase = false;
            let randomCaseNum;
            let highValueCount = 0;
            
            for (let caseNum = 1; caseNum <= 24; caseNum++) {
                highValueCount = this.countAdjacentHighValues(caseNum, highValueCaseNumbers);
                if (highValueCount > 0) {
                    randomCaseNum = caseNum;
                    foundCase = true;
                    break;
                }
            }
            
            if (foundCase) {
                //console.log(`NextTo: Case ${randomCaseNum} has ${highValueCount} HIGH value cases adjacent to it (all cases used).`);
                return this.formatHighValueCount(highValueCount, randomCaseNum);
            } else {
                return "No cases found with adjacent HIGH value cases.";
            }
        }
        
        // Pick a random available case number and check if it has adjacent high values
        let attempts = 0;
        let randomCaseNum;
        let highValueCount = 0;
        
        // Try to find a case number that has at least one adjacent high value
        while (attempts < availableCaseNumbers.length && highValueCount === 0) {
            randomCaseNum = availableCaseNumbers[Math.floor(Math.random() * availableCaseNumbers.length)];
            highValueCount = this.countAdjacentHighValues(randomCaseNum, highValueCaseNumbers);
            attempts++;
            
            // If this case has no adjacent high values, remove it from available and try another
            if (highValueCount === 0) {
                availableCaseNumbers.splice(availableCaseNumbers.indexOf(randomCaseNum), 1);
            }
        }
        
        // If we found a case with adjacent high values
        if (highValueCount > 0) {
            // Mark this case number as used
            this.usedNextToNumbers.add(randomCaseNum);
            
            //console.log(`NextTo: Case ${randomCaseNum} has ${highValueCount} HIGH value cases adjacent to it.`);
            
            return this.formatHighValueCount(highValueCount, randomCaseNum);
        } else {
            // If no cases have adjacent high values, return a message
            return "No cases found with adjacent HIGH value cases.";
        }
        
        // Calculate adjacent case numbers (4x6 grid)
        const adjacentCases = [];
        const currentCase = randomHighCase.caseNumber;
        
        // Left (if not in first column)
        if (currentCase % 4 !== 1) {
            adjacentCases.push(currentCase - 1);
        }
        
        // Right (if not in last column)
        if (currentCase % 4 !== 0) {
            adjacentCases.push(currentCase + 1);
        }
        
        // Top (if not in first row)
        if (currentCase > 4) {
            adjacentCases.push(currentCase - 4);
        }
        
        // Bottom (if not in last row)
        if (currentCase <= 20) {
            adjacentCases.push(currentCase + 4);
        }

        if (adjacentCases.length === 0) {
            return `Case ${currentCase} has no adjacent cases`;
        }

        // Pick a random adjacent case that hasn't been used before
        const availableAdjacentCases = adjacentCases.filter(caseNum => !this.usedNextToNumbers.has(caseNum));
        
        if (availableAdjacentCases.length === 0) {
            // If all adjacent cases have been used, pick any adjacent case
        const randomAdjacentCase = adjacentCases[Math.floor(Math.random() * adjacentCases.length)];
            //console.log(`NextTo: High case ${currentCase} (value: ${randomHighCase.value}) has adjacent case ${randomAdjacentCase} (all adjacent cases used).`);
            return `There is a HIGH number next to the number ${randomAdjacentCase}.`;
        }
        
        // Pick from available (unused) adjacent cases
        const randomAdjacentCase = availableAdjacentCases[Math.floor(Math.random() * availableAdjacentCases.length)];
        
        // Mark this number as used
        this.usedNextToNumbers.add(randomAdjacentCase);
        
        //console.log(`NextTo: High case ${currentCase} (value: ${randomHighCase.value}) has adjacent case ${randomAdjacentCase}.`);

        return `There is a HIGH number next to the number ${randomAdjacentCase}.`;
    }
    
    lowClue() {
        // Pick a box with a low number and a box with a clue
        
        // Find cases with low values (<= 500)
        const lowValueCases = this.cases.filter(caseObj => 
            caseObj.value <= 500 && caseObj.value !== "CLUE"
        );
        
        // Find cases with clues
        const clueCases = this.cases.filter(caseObj => 
            caseObj.value === "CLUE"
        );

        if (lowValueCases.length === 0) {
            return "No <span style=\"color: green; font-weight: bold;\">LOW </span>value cases found";
        }
        
        if (clueCases.length === 0) {
            return "No clue cases found";
        }

        // Pick a random low value case
        const randomLowCase = lowValueCases[Math.floor(Math.random() * lowValueCases.length)];
        
        // Pick a random clue case
        const randomClueCase = clueCases[Math.floor(Math.random() * clueCases.length)];

        //console.log(`LowClue: Low case ${randomLowCase.caseNumber} (value: ${randomLowCase.value}), Clue case ${randomClueCase.caseNumber}`);

        return `Box ${randomLowCase.caseNumber} and ${randomClueCase.caseNumber} have a <span style="color: green; font-weight: bold;">LOW </span>number and a CLUE.`;
    }
    
    countAdjacentHighValues(caseNum, highValueCaseNumbers) {
        // Calculate adjacent case numbers (4x6 grid)
        const adjacentCases = [];
        
        // Left (if not in first column)
        if (caseNum % 4 !== 1) {
            adjacentCases.push(caseNum - 1);
        }
        
        // Right (if not in last column)
        if (caseNum % 4 !== 0) {
            adjacentCases.push(caseNum + 1);
        }
        
        // Top (if not in first row)
        if (caseNum > 4) {
            adjacentCases.push(caseNum - 4);
        }
        
        // Bottom (if not in last row)
        if (caseNum <= 20) {
            adjacentCases.push(caseNum + 4);
        }
        
        // Count how many of these adjacent cases have high values
        return adjacentCases.filter(adjacentCaseNum => 
            highValueCaseNumbers.includes(adjacentCaseNum)
        ).length;
    }
    
    formatHighValueCount(count, caseNum) {
        if (count === 1) {
            return `There is 1 <span style="color: red; font-weight: bold;">HIGH </span>value case next to the number ${caseNum}.`;
        } else {
            return `There are ${count} <span style="color: red; font-weight: bold;">HIGH </span>value cases next to the number ${caseNum}.`;
        }
    }
    
    doubleClue() {
        //console.log(`DoubleClue: Function called. Available clues at start: ${this.availableClues.join(', ')}`);
        
        // Create a string called doubleClueString
        // Start it by saying DOUBLE CLUE! then br br
        // Then pick and remove 2 more clues from the available clues
        // Add the result strings of those two clues to the double clue string
        // Make sure you put an extra br between them so they don't run together
        
        let doubleClueString = "DOUBLE CLUE!<br><br>";
        
        // Check if we have at least 2 clues available (excluding the current "doubleClue")
        const availableCluesForDouble = this.availableClues.filter(clueType => clueType !== "doubleClue");
        
        //console.log(`DoubleClue: Available clues for double clue (excluding doubleClue): ${availableCluesForDouble.join(', ')}`);
        //console.log(`DoubleClue: Total available clues: ${this.availableClues.join(', ')}`);
        
        if (availableCluesForDouble.length < 2) {
            return "DOUBLE CLUE!<br><br>Not enough clues available for double clue.";
        }
        
        // Get the first clue using the generic function without adding to array
        //console.log(`DoubleClue: Getting first clue...`);
        const firstClueText = this.getClue(false);
        
        // Get the second clue using the generic function without adding to array
        //console.log(`DoubleClue: Getting second clue...`);
        const secondClueText = this.getClue(false);
        
        // Add both clues to the cluesFound array manually
        // this.cluesFound.push(firstClueText);
        // this.cluesFound.push(secondClueText);
        
        // Build the final double clue string
        doubleClueString += firstClueText + "<br><br>" + secondClueText;
        
        //console.log(`DoubleClue: Generated two clues using getClueWithoutAdding() function`);
        //console.log(`First clue: ${firstClueText}`);
        //console.log(`Second clue: ${secondClueText}`);
        //console.log(`DoubleClue: Available clues after double clue: ${this.availableClues.length}`);

        this.cluesFound.push(doubleClueString);
        
        return doubleClueString;
    }
    
    handleDealClick() {
        // Calculate time bonus before stopping the timer
        const currentTimeBonus = this.gameStarted ? this.timeBonus : 0;
        
        // Stop the timer since deal is being taken
        this.gameStarted = false;
        
        // Calculate the current deal value including time bonus
        const remainingCases = this.cases.filter(caseObj => caseObj.action === "ready");
        
        // Calculate average value of remaining cases
        let totalValue = 0;
        let validCaseCount = 0;
        
        remainingCases.forEach(caseObj => {
            if (caseObj.value !== "CLUE") {
                totalValue += caseObj.value;
                validCaseCount++;
            }
        });
        
        if (validCaseCount > 0) {
            const averageValue = totalValue / validCaseCount;
            
            // Apply multiplier based on number of cases opened
            const openedCases = this.cases.filter(caseObj => caseObj.action === "opened").length;
            let multiplier = 1.0;
            
            if (openedCases < 8) {
                multiplier = 0.5; // Under 8 cases open: multiply by 0.5
            } else if (openedCases >= 8 && openedCases <= 14) {
                multiplier = 0.66; // 8-14 cases open: multiply by 0.66
            } else if (openedCases >= 15 && openedCases <= 19) {
                multiplier = 0.75; // 15-19 cases open: multiply by 0.75
            } else if (openedCases === 23) {
                multiplier = 1.0; // All cases open except 1: multiply by 1.0
            }
            
            let dealValue = Math.round(averageValue * multiplier);
            // this.dealCaseValue = dealValue;
            
            // Add the time bonus we calculated earlier
            dealValue += currentTimeBonus;
            
            // Round the final deal value
            dealValue = Math.round(dealValue);
            
            // Show all case values in indicators
            this.revealAllCaseValues();
            
            // Disable action buttons
            this.disableActionButtons([0, 1, 2]);
            
            // Disable all case buttons
            this.disableAllCaseButtons();
            
            // Show a fancy deal acceptance popup
            this.showDealAcceptancePopup(dealValue);
            
            // Play game end sound based on final amount
            if (dealValue < 100000) {
                // this.e.s.p("lose");
            } else {
                // this.e.s.p("wincase");
            }
            
            // Disable the deal button after use (but keep it visible)
            const dealButton = document.getElementById('caseValueDiv');
            dealButton.disabled = true;
            dealButton.style.pointerEvents = "none";
            dealButton.style.cursor = "not-allowed";
            dealButton.textContent = `$${dealValue.toLocaleString()}`;

        }
    }
    
    showDealAcceptancePopup(dealValue) {
        // Store the final deal value for validation
        this.finalDealValue = dealValue;
        
        // Create golden explosion effect
        this.createGoldenExplosion();
        
        // Flash screen with semi-transparent gold
        this.flashScreenGold();
        
        // Create animated deal amount overlay
        this.createDealAmountOverlay(dealValue);

        // Removed breadcrumb
    }
    
    createGoldenExplosion() {
        // Create explosion container
        const explosion = document.createElement('div');
        explosion.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 15000;
        `;
        document.body.appendChild(explosion);
        
        // Remove explosion after animation
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 3000);
    }
    

    

    
    flashScreenGold() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(255, 215, 0, 0.3);
            pointer-events: none;
            z-index: 14000;
        `;
        
        document.body.appendChild(flash);
        
        // Flash effect with GSAP
        gsap.to(flash, {
            duration: 0.3,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                if (flash.parentNode) {
                    flash.parentNode.removeChild(flash);
                }
            }
        });
    }
    
    createDealAmountOverlay(dealValue) {

        // Calculate stars earned from the final score
        const starsEarned = calculateGoldCaseStarsFromScore(dealValue);
        
        // Save the game result
        saveGoldCaseGameResult(dealValue, starsEarned);

        // Use endScore to create the final score overlay
        // Pass the time bonus as the only stat to display
        const statsArray = [['TIME BONUS', this.timeBonus]];
        this.e.endScore.createFinalScoreOverlay(dealValue, statsArray);
        
        // Add examine remaining cases button after 2 seconds
        setTimeout(() => {
            this.addExamineRemainingCasesButton();
        }, 2000);
    }
    
    addExamineRemainingCasesButton() {
        // Find the final score overlay created by endScore
        const overlay = document.querySelector('.finalScoreOverlay');
        if (!overlay) {
            return;
        }
        
        
        // Create examine button
        const examineButton = document.createElement('button');
        examineButton.style.cssText = `
            position: absolute;
            bottom: 15%;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Sanchez', serif;
            font-size: 13px;
            font-weight: 400;
            color: #666666;
            background: #ffffff;
            border: 1px solid #cccccc;
            border-radius: 4px;
            padding: 15px 40px;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0;
            white-space: nowrap;
            min-width: 280px;
            z-index: 16001;
        `;
        examineButton.textContent = 'EXAMINE REMAINING CASES';
        
        overlay.appendChild(examineButton);
        
        // Animate button in
        gsap.to(examineButton, {
            duration: 0.8,
            opacity: 1,
            y: 0,
            ease: "sine.out",
            onComplete: () => {
            }
        });
        
        // Add subtle hover effect (no down state)
        examineButton.addEventListener('mouseenter', () => {
            // examineButton.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        examineButton.addEventListener('mouseleave', () => {
            examineButton.style.background = 'transparent';
        });
        
        // Add click functionality
        examineButton.addEventListener('click', () => {
            this.fadeOutDealOverlay(overlay);
            // this.e.s.p("click1");
        });
    }
    
    fadeOutDealOverlay(overlay) {
        // Immediately disable pointer events to prevent interference
        overlay.style.pointerEvents = 'none';
        
        gsap.to(overlay, {
            duration: 0.8,
            opacity: 0,
            ease: "power2.in",
            onComplete: () => {
                // Ensure the overlay is completely removed
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                    //console.log("Deal overlay completely removed from DOM");
                }
                
                // Force a small delay to ensure DOM cleanup, then enable clue button
                setTimeout(() => {
                    if (this.gameEnded) {
                        // SIMPLE APPROACH: Just enable the clue button directly
                        const clueButton = document.getElementById('clueButton');
                        if (clueButton) {
                            clueButton.disabled = false;
                            clueButton.style.cursor = "pointer";
                            clueButton.style.pointerEvents = "auto";
                            
                            // Add a simple click handler that will definitely work
                            clueButton.onclick = () => {
                                //console.log("CLUE BUTTON CLICKED AFTER GAME END!");
                                this.showClueWindow(false);
                            };
                            
                            //console.log("Clue button SIMPLY enabled with direct click handler");
                        }
                    }
                }, 100);
            }
        });
    }
    
    revealAllCaseValues() {
        this.cases.forEach(caseObj => {
            const indicator = caseObj.domRef.querySelector('.case-value-indicator');
            if (indicator) {
                // Show the case value
                indicator.textContent = this.formatNumberWithCommas(caseObj.value);
                indicator.style.display = 'flex';
                this.adjustIndicatorFontSize(indicator);
                
                // Change background to red ONLY for cases that are not opened yet
                if (caseObj.action === "ready") {
                    indicator.style.background = 'linear-gradient(to bottom, #ff4444, #cc0000)';
                }
                // Opened cases keep their original gold background
                
                // Prevent further clicks
                indicator.style.pointerEvents = 'none';
            }
        });
    }
    
    forceDealAcceptance() {
        // Force the player to accept the deal when time runs out
        // Prevent multiple calls
        if (this.gameEnded || this.action !== "choose") {
            return;
        }
        
        // Set gameEnded immediately to stop timer updates and tick sounds
        this.gameEnded = true;
        
        // Close clue menu if it's open
        this.hideClueWindow();
        
        this.action = "picking";
        this.handleDealClick();
    }
    
    toggleCaseValueDebug() {
        // Toggle between showing case numbers and case values on buttons
        this.debugMode = !this.debugMode;
        
        // this.cases.forEach(caseObj => {
        //     if (this.debugMode) {
        //         // Show case number and value with line break
        //         if (caseObj.action === "opened") {
        //             // For opened cases, show case number and value
        //             caseObj.domRef.innerHTML = `${caseObj.caseNumber}<br>${caseObj.value}`;
        //         } else {
        //             // For unopened cases, show case number and value
        //             caseObj.domRef.innerHTML = `${caseObj.caseNumber}<br>${caseObj.value}`;
        //         }
        //     } else {
        //         // Show case number only
        //         if (caseObj.action === "opened") {
        //             // For opened cases, show case number and value (keep opened state)
        //             if (caseObj.value === "CLUE") {
        //                 caseObj.domRef.innerHTML = `${caseObj.caseNumber}<br>CLUE`;
        //             } else {
        //                 caseObj.domRef.innerHTML = `${caseObj.caseNumber}<br>${caseObj.value}`;
        //             }
        //         } else {
        //             // For unopened cases, show case number only
        //             caseObj.domRef.textContent = caseObj.caseNumber.toString();
        //         }
        //     }
        // });
        
        // //console.log(`Debug mode ${this.debugMode ? 'ON' : 'OFF'} - showing ${this.debugMode ? 'case numbers + values' : 'case numbers only'}`);
    }
    
    showFreeCluePopup(clue) {
        // Create popup element positioned just above the clue button
        const popup = document.createElement('div');
        popup.className = 'free-clue-popup';
        
        // Position just above the clue button, anchored to the right
        const clueButton = document.getElementById('clueButton');
        if (clueButton) {
            const rect = clueButton.getBoundingClientRect();
            // Position popup above the clue button, right-aligned
            popup.style.top = (rect.top - 40) + 'px'; // 40px above the clue button
        } else {
            // Fallback positioning if clue button not found
            popup.style.top = '50%';
            popup.style.transform = 'translateY(-50%)';
        }
        
        // Create text element with blinking animation
        const textElement = document.createElement('span');
        textElement.textContent = 'FREE CLUE!';
        textElement.className = 'free-clue-text';
        popup.appendChild(textElement);
        
        // Add to page
        document.body.appendChild(popup);
        
        // Slide in from right using GSAP
        gsap.to(popup, {
            duration: 0.5,
            ease: "power2.out",
            x: 0,
            onComplete: () => {
                // After 4 seconds, slide out to the right
                setTimeout(() => {
                    gsap.to(popup, {
                        duration: 0.5,
                        ease: "power2.in",
                        x: "100%",
                        onComplete: () => {
                            if (popup.parentNode) {
                                popup.parentNode.removeChild(popup);
                            }
                        }
                    });
                }, 4000);
            }
        });
    }
    
    startPickThree() {
        // Initialize pick 3 mode
        //console.log("startPickThree called - marking PICK 3 button as used");
        this.pickThreeMode = true;
        this.pickedCases = [];
        this.originalAction = this.action;
        this.action = "picking";
        
        // Mark PICK 3 button as used
        this.markButtonAsUsed('pick3');
        
        // Disable other action buttons during pick 3 mode
        this.disableActionButtons([0, 1, 2]); // Disable FREE CLUE, PICK 3, and DOUBLE buttons
        
        // Show persistent instruction popup over bottom section
        this.showPickThreePopup("Pick three cases: the LOWEST value case will be revealed");
        
        // Add temporary click listeners to all unopened cases
        this.cases.forEach(caseObj => {
            if (caseObj.action === "ready") {
                caseObj.domRef.addEventListener('click', () => this.handlePickThreeClick(caseObj), { once: true });
            }
        });
    }
    
    handlePickThreeClick(caseObj) {
        if (!this.pickThreeMode || this.pickedCases.length >= 3) return;
        
        // Add case to picked cases
        this.pickedCases.push(caseObj);
        
        // Visual feedback - highlight the picked case
        caseObj.domRef.style.border = "3px solid #FFD700";
        caseObj.domRef.style.boxShadow = "0 0 10px #FFD700";
        
        //console.log(`Case ${caseObj.caseNumber} picked (${this.pickedCases.length}/3)`);
        
        // Check if we've picked 3 cases
        if (this.pickedCases.length === 3) {
            this.completePickThree();
        }
    }
    
    completePickThree() {
        // Count how many of the picked cases are clues
        const clueCases = this.pickedCases.filter(caseObj => caseObj.value === "CLUE");
        const nonClueCases = this.pickedCases.filter(caseObj => caseObj.value !== "CLUE");
        
        let clueText = "";
        
        if (clueCases.length === 1) {
            // 1 clue case
            const clueCase = clueCases[0];
            const nonClueCaseNumbers = nonClueCases.map(c => c.caseNumber).sort((a, b) => a - b);
            
            // Find the case with the LOWEST value among non-clue cases
            let lowestCase = nonClueCases[0];
            let lowestValue = lowestCase.value;
            
            nonClueCases.forEach(caseObj => {
                if (caseObj.value < lowestValue) {
                    lowestCase = caseObj;
                    lowestValue = caseObj.value;
                }
            });
            
            clueText = `Case ${clueCase.caseNumber} is a CLUE and case ${lowestCase.caseNumber} has the LOWEST value.`;
            
        } else if (clueCases.length === 2) {
            // 2 clue cases
            const clueCaseNumbers = clueCases.map(c => c.caseNumber).sort((a, b) => a - b);
            const nonClueCase = nonClueCases[0];
            
            clueText = `Case ${clueCaseNumbers.join(' and ')} are CLUES.`;
            
        } else if (clueCases.length === 3) {
            // 3 clue cases
            const clueCaseNumbers = clueCases.map(c => c.caseNumber).sort((a, b) => a - b);
            clueText = `All these cases are CLUES.`;
            
        } else {
            // No clue cases - use original logic
            // Find the case with the LOWEST value
            let lowestCase = this.pickedCases[0];
            let lowestValue = lowestCase.value;
            
            this.pickedCases.forEach(caseObj => {
                if (caseObj.value < lowestValue) {
                    lowestCase = caseObj;
                    lowestValue = caseObj.value;
                }
            });
            
            // Create clue text
            const caseNumbers = this.pickedCases.map(c => c.caseNumber).sort((a, b) => a - b);
            clueText = `Of cases ${caseNumbers.join(', ')}, case ${lowestCase.caseNumber} has the LOWEST value.`;
        }
        
        // Add clue to found clues
        this.cluesFound.push(clueText);
        //console.log("New pick 3 clue added:", clueText);
        
        // Remove temporary styling from picked cases
        this.pickedCases.forEach(caseObj => {
            caseObj.domRef.style.border = "";
            caseObj.domRef.style.boxShadow = "";
        });
        
        // Disable the second action button
        const actionButtons = document.querySelectorAll('.action-button');
        if (actionButtons[1]) {
            actionButtons[1].disabled = true;
            // No opacity changes - CSS handles the styling
            actionButtons[1].style.cursor = "not-allowed";
        }
        
        // Exit pick 3 mode
        this.pickThreeMode = false;
        this.pickedCases = [];
        this.action = this.originalAction;
        
        // Re-enable action buttons (respecting usage states)
        this.enableActionButtonsRespectingUsage([0, 2]);
        
        // Hide the pick 3 popup
        this.hidePickThreePopup();
        
        // Automatically open the clue window to show the new clue
        this.showClueWindow(true);
    }
    
    showPickThreePopup(message) {
        // Create persistent popup element over bottom section
        this.pickThreePopup = document.createElement('div');
        this.pickThreePopup.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ffffff;
            color: #666666;
            padding: 20px 30px;
            border-radius: 10px;
            font-family: 'Sanchez', serif;
            font-size: 16px;
            font-weight: 400;
            z-index: 10000;
            border: 1px solid #cccccc;
            box-shadow: none;
            text-align: center;
            min-width: 300px;
        `;
        this.pickThreePopup.textContent = message;
        
        // Add to page
        document.body.appendChild(this.pickThreePopup);
    }
    
    hidePickThreePopup() {
        if (this.pickThreePopup && this.pickThreePopup.parentNode) {
            this.pickThreePopup.parentNode.removeChild(this.pickThreePopup);
            this.pickThreePopup = null;
        }
    }
    
    disableActionButtons(buttonIndices) {
        const actionButtons = document.querySelectorAll('.action-button');
        buttonIndices.forEach(index => {
            if (actionButtons[index]) {
                actionButtons[index].disabled = true;
                // No opacity changes - CSS handles the styling
                actionButtons[index].style.cursor = "not-allowed";
            }
        });
    }
    
    enableActionButtons(buttonIndices) {
        const actionButtons = document.querySelectorAll('.action-button');
        buttonIndices.forEach(index => {
            if (actionButtons[index]) {
                actionButtons[index].disabled = false;
                // No opacity changes - CSS handles the styling
                actionButtons[index].style.cursor = "pointer";
            }
        });
    }
    
    enableActionButtonsRespectingUsage(buttonIndices) {
        
        const actionButtons = document.querySelectorAll('.action-button');
        buttonIndices.forEach(index => {
            if (actionButtons[index]) {
                let shouldEnable = false;
                
                if (index === 0 && !this.isButtonUsed('freeClue')) {
                    shouldEnable = true;
                    //console.log("FREE CLUE button re-enabled (not used yet)");
                } else if (index === 1 && !this.isButtonUsed('pick3')) {
                    shouldEnable = true;
                    //console.log("PICK 3 button re-enabled (not used yet)");
                } else if (index === 2 && !this.isButtonUsed('double')) {
                    shouldEnable = true;
                    //console.log("DOUBLE button re-enabled (not used yet)");
                } else {
                    //console.log(`Action button ${index} stays disabled (already used)`);
                }
                
                if (shouldEnable) {
                    actionButtons[index].disabled = false;
                    actionButtons[index].style.cursor = "pointer";
                }
            }
        });
        
    }
    
    disableAllCaseButtons() {
        // Disable all case buttons by removing their click functionality
        this.cases.forEach(caseObj => {
            if (caseObj.domRef) {
                // Remove all click event listeners
                caseObj.domRef.style.pointerEvents = "none";
                caseObj.domRef.style.cursor = "not-allowed";
                // caseObj.domRef.style.opacity = "0.5"; // Removed to keep case buttons fully opaque
                
                // Remove the click event listener by cloning and replacing the element
                const newCaseButton = caseObj.domRef.cloneNode(true);
                caseObj.domRef.parentNode.replaceChild(newCaseButton, caseObj.domRef);
                caseObj.domRef = newCaseButton;
            }
        });
    }
    

    
    startGame() {
        // Hide start menu
        const startMenu = document.getElementById('startMenu');
        if (startMenu) {
            startMenu.style.display = 'none';
        }
        
        // Show the deal button when game starts
        const dealButton = document.getElementById('caseValueDiv');
        if (dealButton) {
            dealButton.style.display = 'flex';
        }
        
        // Reset available clues to ensure fresh start (preserve multiple instances of nextTo)
        this.availableClues = [
            "quadrant",
            "oddEven",
            "columns",
            "row",
            "medium",
            "halfTopBottomLow",
            "halfSideLow",
            "pick3",
            "nextTo",
            "nextTo",
            "nextTo",
            "nextTo",
            "nextTo",
            "nextTo",
            "lowClue",
            "doubleClue"
        ];
        
        // Reset free clue tracking
        this.freeClueUsed = false;
        this.firstActionButtonUsed = false;
        this.gameEnded = false;
        this.zeroTickPlayed = false; // Reset zero tick flag for new game
        this.usedNextToNumbers.clear(); // Reset used "next to" numbers tracking
        
        // Reset button usage states for new game
        this.resetButtonUsageStates();
        
        // Start the game
        this.gameStarted = true;
        this.action = "choose";
        
        // Re-enable all buttons
        this.enableAllButtonsForGame();
        
        // Create timer display
        this.createTimerDisplay();
        
        // Give player a free clue now that game has started
        this.giveInitialFreeClue();
        
        // Game started - no popup needed
    }
    
    getTimeBonus() {
        return this.timeBonus;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    createTimerDisplay() {
        // Use the new timerDiv instead of the old upperRightDiv
        this.updateTimerDisplay();
    }
    
    updateTimerDisplay() {
        const timerDiv = document.getElementById('timerDiv');
        
        // Stop updating if game hasn't started
        if (!timerDiv || !this.gameStarted) {
            return;
        }
        
        // Always update the timer display, even when at 0:00
        const timeString = this.formatTime(Math.max(0, this.gameTime));
        timerDiv.textContent = timeString;
        
        // Stop updating loop if game has ended
        if (this.gameEnded) {
            this.lastTickSecond = null;
            return;
        }
        
        // Play ticking sound when less than 15 seconds left
        // Play at each second from 1-15 (NOT at 0 - that's handled separately in UI.update())
        // Only play ticks when gameTime >= 1.0 to avoid playing when between 0 and 1
        if (this.gameTime <= 15 && this.gameTime >= 0) {
            const currentWholeSecond = Math.floor(this.gameTime);
            
            // Play tick at each second from 1-15
            // Only play tick sound if we haven't played it for this second yet
            if (!this.lastTickSecond || this.lastTickSecond !== currentWholeSecond) {
                // Play tick for seconds 1-15 (never play at 0 here)
                if (currentWholeSecond >= 0 && currentWholeSecond <= 15) {
                    if(currentWholeSecond===0 && this.lastSec===undefined){
                        this.e.s.p("tick");
                        this.lastSec=0;
                    }else if(currentWholeSecond===0 && this.lastSec!==undefined){
                    }else{
                        this.e.s.p("tick");
                    }
                    
                    this.lastTickSecond = currentWholeSecond;
                }
            }
        }
        
        // Stop updating loop if gameTime is 0 or negative (0-second tick is handled in UI.update())
        if (this.gameTime <= 0) {
            this.lastTickSecond = null;
            return;
        }
        
        // Update every frame (but only if game is still running)
        requestAnimationFrame(() => this.updateTimerDisplay());
    }
    
    disableAllButtonsForStart() {
        // Disable all action buttons
        const actionButtons = document.querySelectorAll('.action-button');
        actionButtons.forEach(button => {
            button.disabled = true;
            // No opacity changes - CSS handles the styling
            button.style.cursor = "not-allowed";
        });
        
        // Disable deal button (but keep full opacity)
        const dealButton = document.getElementById('caseValueDiv');
        if (dealButton) {
            dealButton.disabled = true;
            dealButton.style.opacity = "1";
            dealButton.style.cursor = "not-allowed";
        }
        
        // Disable clue button (NEVER disable if game has ended)
        const clueButton = document.getElementById('clueButton');
        if (clueButton) {
            if (this.gameEnded) {
                //console.log("Game has ended, NEVER disabling clue button");
                clueButton.disabled = false;
                clueButton.style.cursor = "pointer";
            } else {
                //console.log("disable clue button");
                clueButton.disabled = true;
                clueButton.style.cursor = "not-allowed";
            }
        }
        
        // Disable all case buttons
        this.cases.forEach(caseObj => {
            if (caseObj.domRef) {
                caseObj.domRef.style.pointerEvents = "none";
                caseObj.domRef.style.cursor = "not-allowed";
                // caseObj.domRef.style.opacity = "0.5"; // Removed to keep case buttons fully opaque
            }
        });
    }
    
    enableAllButtonsForGame() {

        // Re-enable action buttons based on their usage state
        const actionButtons = document.querySelectorAll('.action-button');
        actionButtons.forEach((button, index) => {
            if (index === 0 && !this.isButtonUsed('freeClue')) {
                // First action button (FREE CLUE) - only enable if not used
                button.disabled = false;
                button.style.cursor = "pointer";
                //console.log("FREE CLUE button enabled (not used yet)");
            } else if (index === 1 && !this.isButtonUsed('pick3')) {
                // Second action button (PICK 3) - only enable if not used
                button.disabled = false;
                button.style.cursor = "pointer";
                //console.log("PICK 3 button enabled (not used yet)");
            } else if (index === 2 && !this.isButtonUsed('double')) {
                // Third action button (DOUBLE) - only enable if not used
                button.disabled = false;
                button.style.cursor = "pointer";
                //console.log("DOUBLE button enabled (not used yet)");
            } else {
                // Button has been used, it stays disabled
                //console.log(`Action button ${index} stays disabled (already used)`);
            }
        });
        
        // Re-enable deal button (always available)
        const dealButton = document.getElementById('caseValueDiv');
        if (dealButton) {
            dealButton.disabled = false;
            dealButton.style.opacity = "1";
            dealButton.style.cursor = "pointer";
        }
        
        // Re-enable clue button based on game state
        const clueButton = document.getElementById('clueButton');
        if (clueButton) {
            if (this.gameEnded) {
                // If game has ended, always enable clue button for review
                clueButton.disabled = false;
                clueButton.style.cursor = "pointer";
                //console.log("Game ended, clue button enabled for review");
            } else if (!this.isButtonUsed('clueButton')) {
                // During game, only enable if not used yet
                clueButton.disabled = false;
                clueButton.style.cursor = "pointer";
                //console.log("re-enable clue button (not used yet)");
            } else {
                // During game, keep disabled if already used
                //console.log("clue button stays disabled (already used)");
            }
        }
        
        // Re-enable all case buttons
        this.cases.forEach(caseObj => {
            if (caseObj.domRef) {
                caseObj.domRef.style.pointerEvents = "auto";
                caseObj.domRef.style.cursor = "pointer";
                caseObj.domRef.style.opacity = "1";
            }
        });
        
        // Note: Action buttons are only re-enabled if they haven't been used yet
    }
    
    checkAndEnableFirstActionButton() {
        // Check if exactly 7 cases are opened
        const openedCases = this.cases.filter(caseObj => caseObj.action === "opened").length;
        
        //console.log(`Checking first action button: ${openedCases} cases opened`);
        
        if (openedCases === 7) {
            // Get the first action button
            const actionButtons = document.querySelectorAll('.action-button');
            const firstActionButton = actionButtons[0];
            
            if (firstActionButton && firstActionButton.disabled && !this.isButtonUsed('freeClue')) {
                // Only enable and show color tween if we're in the "choose" state (no windows open)
                if (this.action === "choose" && !this.isAnyWindowOpen()) {
                    // Enable the button (only if not used yet)
                    if (!this.isButtonUsed('freeClue')) {
                        firstActionButton.disabled = false;
                        // No opacity changes - CSS handles the styling
                        firstActionButton.style.cursor = "pointer";
                        
                        // Create color tween effect on the button
                        this.createColorTween(firstActionButton);
                    }
                } else {
                    // If any window is still open, schedule the tween for when it closes
                    // this.scheduleColorTweenForFirstActionButton(firstActionButton);
                }
            }else{
                // No opacity changes - CSS handles the styling
            }
        }
    }
    
    scheduleColorTweenForFirstActionButton(firstActionButton) {
        // Wait for all windows to close and then enable the button with color tween
        const checkForWindowsClose = () => {
            if (this.action === "choose" && !this.isAnyWindowOpen() && !this.isButtonUsed('freeClue')) {
                // All windows are closed, now enable the button and show color tween
                firstActionButton.disabled = false;
                // No opacity changes - CSS handles the styling
                firstActionButton.style.cursor = "pointer";
                
                // Wait 1 second after windows close, then show color tween
                setTimeout(() => {
                    this.createColorTween(firstActionButton);
                }, 1000);
            } else {
                // Windows still open, check again in 100ms
                // No opacity changes - CSS handles the styling
                setTimeout(checkForWindowsClose, 100);
            }
        };
        
        // Start checking for windows to close
        checkForWindowsClose();
    }
    
    isAnyWindowOpen() {
        // Check if case reveal window is open
        const caseRevealWindow = document.getElementById('caseRevealWindow');
        const clueWindow = document.getElementById('clueWindow');
        
        return (caseRevealWindow && caseRevealWindow.style.display === 'flex') ||
               (clueWindow && clueWindow.style.display === 'flex') ||
               this.action === "showing" ||
               this.action === "picking";
    }
    
    createColorTween(button) {
        // Start with white-to-white gradient background
        button.style.background = 'linear-gradient(to bottom, #ffffff, #f0f0f0)';
        
        // Create timeline for complex animation sequence
        const tl = gsap.timeline();
        
        // First: make button slightly bigger and pulse 3 times
        tl.to(button, {
            duration: 0.2,
            scale: 1.1,
            ease: "power2.out"
        })
        .to(button, {
            duration: 0.1,
            scale: 1.0,
            ease: "power2.in"
        })
        .repeat(2)
        // Finally: fade to red gradient
        .to(button, {
            duration: 1.5,
            background: 'linear-gradient(to bottom, #DC143C, #8B0000)',
            ease: "power2.out"
        });
    }
    
    checkGameEndCondition() {
        // Only check once per game
        if (this.gameEnded) {
            return;
        }
        
        // Count remaining cases with number values (not CLUE)
        const remainingNumberCases = this.cases.filter(caseObj => 
            caseObj.action === "ready" && caseObj.value !== "CLUE"
        );
        
        // If only one case with a number value remains, end the game
        if (remainingNumberCases.length === 1) {
            this.gameEnded = true;
            
            // Close any open windows before ending the game
            this.hideClueWindow();
            this.hideRevealWindow();
            
            // Recalculate deal value based on current cases before ending
            this.updateDealValue();
            
            // Enable the clue button for end game
            this.enableClueButtonForEndGame();
            
            // Force the player to accept the deal
            this.action = "picking";
            this.handleDealClick();
        }
    }
    
    setupCaseAnimation() {
        // Set initial positions for all cases (off-screen to the right)
        this.cases.forEach((caseObj, index) => {
            const button = caseObj.domRef;
            
            // Set initial position off-screen to the right
            gsap.set(button, {
                x: "100vw",
                y: gsap.utils.random(-50, 50), // Random vertical offset for variety
                rotation: gsap.utils.random(-15, 15), // Slight random rotation
                scale: 0.8,
                opacity: 0
            });
        });
    }
    
    animateCasesIn() {
        // Create a timeline for the entrance animation
        const tl = gsap.timeline();
        
        // Animate each case in with staggered timing
        this.cases.forEach((caseObj, index) => {
            const button = caseObj.domRef;
            const delay = index * 0.02; // Stagger each case by 5ms (faster)
            
            tl.to(button, {
                duration: 0.5, // Faster case animation
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                ease: "back.out(1.5)",
                delay: delay
            }, delay);
        });
        
    }
    
    adjustCaseNumberFontSize() {
        // Only adjust for desktop (not mobile)
        if (this.e.mobile) {
            return;
        }
        
        const windowHeight = window.innerHeight;
        const caseNumbers = document.querySelectorAll('.case-number');
        
        let fontSize;
        
        // Adjust font size based on window height - more extreme shrinking
        if (windowHeight <= 500) {
            fontSize = 'clamp(10px, 0.8vw, 14px)';
        } else if (windowHeight <= 600) {
            fontSize = 'clamp(12px, 1vw, 16px)';
        } else if (windowHeight <= 700) {
            fontSize = 'clamp(14px, 1.3vw, 18px)';
        } else if (windowHeight <= 800) {
            fontSize = 'clamp(16px, 1.6vw, 20px)';
        } else {
            fontSize = 'clamp(20px, 2vw, 26px)'; // Default size
        }
        
        // Apply the font size to all case numbers
        caseNumbers.forEach(caseNumber => {
            caseNumber.style.fontSize = fontSize;
        });
    }
    
    showInstructionsWindow() {
        const instructionsOverlay = document.getElementById('instructionsOverlay');
        if (instructionsOverlay) {
            instructionsOverlay.style.display = 'flex';
            instructionsOverlay.style.pointerEvents = 'auto';
            
            // Add click listener to close button
            const closeButton = document.getElementById('closeInstructionsButton');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    // this.e.s.p("click1");
                    this.hideInstructionsWindow();
                });
            }
            
            // Add click listener to overlay background to close
            instructionsOverlay.addEventListener('click', (e) => {
                if (e.target === instructionsOverlay) {
                    // this.e.s.p("click1");
                    this.hideInstructionsWindow();
                }
            });
        }
    }
    
    hideInstructionsWindow() {
        const instructionsOverlay = document.getElementById('instructionsOverlay');
        if (instructionsOverlay) {
            instructionsOverlay.style.display = 'none';
            instructionsOverlay.style.pointerEvents = 'none';
        }
    }
    
    startBackgroundAnimation() {
        // Get the background image element
        const backgroundImage = document.getElementById('backgroundImage');
        if (backgroundImage) {
            // Create a yoyo tween that fades opacity from 1 to 0.8 over 2 seconds
            // gsap.to(backgroundImage, {
            //     opacity: 0.6,
            //     duration: 2,
            //     ease: "power2.inOut",
            //     yoyo: true,
            //     repeat: -1
            // });
        }
    }
    
    startCaseFlashAnimation() {
        // Get all case buttons
        const caseButtons = document.querySelectorAll('.cell-button');
        
        caseButtons.forEach((button, index) => {
            // Set initial brightness to ensure smooth start
            gsap.set(button, { filter: 'brightness(1)' });
            
            // Create a repeating timeline for each case with stagger
            const tl = gsap.timeline({ repeat: -1 });
            
            // Flash brightness from 1 to 1.5 to 1 over 0.75 seconds total
            tl.to(button, {
                filter: 'brightness(1.5)',
                duration: 0.375,
                ease: "power2.out"
            })
            // Flash brightness back to 1
            .to(button, {
                filter: 'brightness(1)',
                duration: 0.375,
                ease: "power2.in"
            })
            // Wait 2 seconds before repeating
            .to(button, {
                duration: 2,
                ease: "none"
            });
            
            // Add stagger delay based on index
            tl.delay(index * 0.05);
            
            // Store the timeline on the button element so we can kill it later
            button._flashTimeline = tl;
        });
    }
    
    stopCaseFlashAnimation(button) {
        // Stop the flash animation for a specific case button
        if (button._flashTimeline) {
            button._flashTimeline.kill();
            button._flashTimeline = null;
            // Reset brightness to normal
            gsap.set(button, { filter: 'brightness(1)' });
        }
    }
    
    updateFrameCounter() {
        const currentTime = performance.now();
        this.frameCount++;
        
        // Update FPS every second
        if (currentTime - this.lastFrameTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFrameTime));
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
            
            // Update the display
            const frameCounterElement = document.getElementById('frameCounter');
            if (frameCounterElement) {
                frameCounterElement.textContent = `FPS: ${this.fps}`;
            }
        }
    }
    
    markButtonAsUsed(buttonType) {
        // Mark a specific button as used
        if (this.buttonUsageStates.hasOwnProperty(buttonType)) {
            this.buttonUsageStates[buttonType] = true;
            //console.log(`Button ${buttonType} marked as used`);
        }
    }
    
    isButtonUsed(buttonType) {
        // Check if a specific button has been used
        return this.buttonUsageStates.hasOwnProperty(buttonType) ? this.buttonUsageStates[buttonType] : false;
    }
    
    resetButtonUsageStates() {
        // Reset all button usage states (for new game)
        Object.keys(this.buttonUsageStates).forEach(key => {
            this.buttonUsageStates[key] = false;
        });
        //console.log("All button usage states reset");
    }
    
    enableClueButtonForEndGame() {
        
        const clueButton = document.getElementById('clueButton');
        if (clueButton) {
           
            clueButton.disabled = false;
            clueButton.style.cursor = "pointer";
            clueButton.style.pointerEvents = "auto";
            
        }
    }
}
// ============================================================================
// SUITCASE CLASS
// ============================================================================

/**
 * SUITCASE ANIMATION SYSTEM - GSAP Implementation
 * 
 * ANIMATION STRUCTURE:
 * 
 * REVEAL ANIMATION (1 second total):
 * - Phase 1 (0.0s - 0.2s): Container fades in
 * - Phase 2 (0.1s - 0.6s): Lid opens + ELIMINATED text dramatic entrance
 *   * Lid rotates from 0° to 90° (0.1s - 0.6s)
 *   * ELIMINATED text: opacity 0→1, translateY 80→0, scale 0.3→2.0→1.0 (0.1s - 0.6s)
 * - Phase 3 (0.4s - 0.8s): Bottom text slides down
 * 
 * HIDE ANIMATION (0.5 seconds total):
 * - Phase 1 (0.0s - 0.5s): All elements fade out
 * - Phase 2 (0.0s - 0.5s): Text elements move while fading
 *   * ELIMINATED text: moves down 80px
 *   * Bottom text: moves up 20px
 * 
 * CONTINUOUS ANIMATION:
 * - ELIMINATED text color pulses between white and golden yellow (#FFD700)
 * 
 * CONTROLS:
 * - Press 'V' key to trigger reveal animation
 * - Press 'V' key again to trigger hide animation
 * 
 * EASING: power2.out for reveal, power2.in for hide
 */

class Suitcase {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.suitcaseModel = null;
        this.animationId = null;
        this.lidObject = null;
        this.lidTime = 0;
        this.animationState = 'hidden'; // hidden, showing, visible, hiding
        this.revealTime = 0;
        this.hideTime = 0;
        this.pricesignMaterial = null;
        this.priceTextures = {};
        this.queuedTextureValue = null;
        this.isProcessingTexture = false;
        this.lastTickSecond = 0;
        this.isModelLoaded = false;
        this.queuedShowAction = null;
    }

    setUp(engine) {
        //console.log('Setting up Suitcase 3D scene...');
        this.e = engine;
        this.container = document.getElementById('suitcase3DContainer');
        
        if (!this.container) {
            //console.error('Could not find suitcase3DContainer element');
            return;
        }
        
        try {
            this.initScene();
            this.initCamera();
            this.initRenderer();
            this.initLights();
            this.loadSuitcaseModel();
            this.animate();
            this.handleResize();
            this.setupKeyboardControls();
            this.setupContinuousAnimations();
            
            // Add a button to show/hide the 3D scene
            // this.addToggleButton();
            //console.log('Suitcase 3D scene setup complete');
        } catch (error) {
            //console.error('Error setting up Suitcase 3D scene:', error);
        }
    }

    initScene() {
        //console.log('Initializing scene...');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff); // White background
        //console.log('Scene created:', this.scene);
    }

    initCamera() {
        //console.log('Initializing camera...');
        this.camera = new THREE.PerspectiveCamera(
            45, // Field of view (reduced from 75 to reduce foreshortening)
            350 / 350, // Aspect ratio (350x350 canvas)
            0.1, // Near plane
            1000 // Far plane
        );
        
        // Create camera rig system similar to temp/engine.js
        this.camContX = new THREE.Group();
        this.camContY = new THREE.Group();
        this.scene.add(this.camContY);
        this.camContY.add(this.camContX);
        this.camContX.add(this.camera);
        
        // Position camera in the rig
        this.camera.position.z = 3.8; // Moved further back to prevent cutoff
        this.camera.position.y = .7;
        
        // Set initial camera rig rotations
        this.camContX.rotation.x = this.e.u.ca(-5); // -90 degrees in radians
        this.camContY.rotation.y = this.e.u.ca(180);
        
        //console.log('Camera rig created:', this.camera);
    }

    initRenderer() {
        //console.log('Initializing renderer...');
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            premultipliedAlpha: false
        });
        this.renderer.setSize(350, 350);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0xffffff, 1);
        
        // Create a new div to contain the canvas and text
        this.canvasContainer = document.createElement('div');
        this.canvasContainer.style.position = 'relative';
        this.canvasContainer.style.width = '350px';
        this.canvasContainer.style.height = '350px';
        this.canvasContainer.style.display = 'flex';
        this.canvasContainer.style.flexDirection = 'column';
        this.canvasContainer.style.alignItems = 'center';
        this.canvasContainer.style.justifyContent = 'space-between';
        this.canvasContainer.style.backgroundColor = '#ffffff';
        this.canvasContainer.style.background = '#ffffff';
        this.canvasContainer.style.borderRadius = '10px'; // Add border radius
        this.canvasContainer.style.backdropFilter = 'none';
        this.canvasContainer.style.webkitBackdropFilter = 'none';
        this.canvasContainer.style.pointerEvents = 'none';
        // this.canvasContainer.style.zIndex = '10011';
        
        // Create the "ELIMINATED" text
        this.eliminatedText = document.createElement('div');
        this.eliminatedText.textContent = 'ELIMINATED';
        this.eliminatedText.style.color = '#D4AF37'; // Gold color from splash title
        this.eliminatedText.style.fontSize = '28px'; // Bigger font
        this.eliminatedText.style.fontWeight = '400';
        this.eliminatedText.style.textAlign = 'center';
        this.eliminatedText.style.marginTop = '20px'; // Moved up 10px (from 30px to 20px)
        this.eliminatedText.style.letterSpacing = '1px'; // Add 1px letter spacing
            this.eliminatedText.style.zIndex = '10011'; // Above Three.js DOM element (10010)
        this.eliminatedText.style.fontFamily = "'Sanchez', serif";
        this.eliminatedText.style.opacity = '1'; // No animation, always visible
        this.eliminatedText.style.transform = 'none'; // No animation transform
        this.eliminatedText.style.textShadow = 'none'; // Remove text shadow
        this.eliminatedText.style.pointerEvents = 'none';
        
        // Create the "click any key to continue" text
        this.continueText = document.createElement('div');
        this.continueText.textContent = 'TAP TO CONTINUE';
        this.continueText.style.color = 'white';
        this.continueText.style.fontSize = '14px';
        this.continueText.style.textAlign = 'center';
        this.continueText.style.marginBottom = '10px';
        this.continueText.style.zIndex = '1000001';
        this.continueText.style.letterSpacing = '1px';
        this.continueText.style.fontFamily = 'Montserrat, sans-serif';
        this.continueText.style.opacity = '0';
        this.continueText.style.transform = 'translateY(20px)';
        
        // Make sure the canvas is visible
        this.renderer.domElement.style.display = 'block';
        this.renderer.domElement.style.margin = '0 auto';
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.zIndex = '10010'; // Above tempBlocker (10001) - higher value for stacking context
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.backgroundColor = '#ffffff';
        this.renderer.domElement.style.background = '#ffffff';
        this.renderer.domElement.style.borderRadius = '10px'; // Add border radius to three.js DOM element
        this.renderer.domElement.style.border = '1px solid rgb(167, 167, 167)'; // Add 1px grey stroke
        this.renderer.domElement.style.backdropFilter = 'none';
        this.renderer.domElement.style.webkitBackdropFilter = 'none';
        this.renderer.domElement.style.pointerEvents = 'none';
        
        
        //console.log('Renderer created, appending to container...');
        
        // Clear the container first
        this.container.innerHTML = '';
        
        // Add text elements and canvas to the canvas container
        this.canvasContainer.appendChild(this.eliminatedText);
        this.canvasContainer.appendChild(this.renderer.domElement);
        this.canvasContainer.appendChild(this.continueText);
        
        // Add the canvas container to the main container
        this.container.appendChild(this.canvasContainer);
        
        // Create material control sliders
        this.createMaterialControls();
        
        // Create particle effects container
        this.createParticleContainer();
        
        // Add click/tap event listener to hide suitcase
        this.setupClickToHide();
        
        // Set initial positions with GSAP
        gsap.set(this.container, { opacity: 0 });
        // ELIMINATED text animation removed - no initial state needed
        gsap.set(this.continueText, { opacity: 0, translateY: -20 });
        
        // Make sure the container is visible
        this.container.style.display = 'block';
        this.container.style.visibility = 'visible';
        this.container.style.position = 'fixed';
        this.container.style.zIndex = '10005'; // Above tempBlocker (10001) to ensure Three.js is visible
        this.container.style.pointerEvents = 'none';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.backgroundColor = '#f0f0f0'; // Off-white to match clue window
        this.container.style.background = '#f0f0f0';
        
        // Pre-load price textures
        this.preloadPriceTextures();
        
        //console.log('Renderer setup complete');
        //console.log('Canvas element:', this.renderer.domElement);
        //console.log('Canvas dimensions:', this.renderer.domElement.width, 'x', this.renderer.domElement.height);
        //console.log('Canvas style:', this.renderer.domElement.style.cssText);
        //console.log('Container:', this.container);
        //console.log('Container dimensions:', this.container.offsetWidth, 'x', this.container.offsetHeight);
    }

    initLights() {
        //console.log('Initializing lights...');
        // Much brighter ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, .5);
        this.scene.add(ambientLight);

        // Bright directional light for shadows and highlights
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Bright point light for additional illumination
        const pointLight = new THREE.PointLight(0xffffff, 4.5);
        pointLight.position.set(0, 1, -.5);
        this.scene.add(pointLight);
        
        // Debug box to show point light position
        const debugGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        this.debugBox = new THREE.Mesh(debugGeometry, debugMaterial);
        this.debugBox.position.copy(pointLight.position);
        // this.scene.add(this.debugBox);

        // Add a bright fill light from the front
        // const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
        // fillLight.position.set(0, 0, 10);
        // this.scene.add(fillLight);

        // Add a bright top light
        const topLight = new THREE.DirectionalLight(0xffffff, 2.0);
        topLight.position.set(0, 10, 0);
        this.scene.add(topLight);

                // Load cube texture for environment mapping
        this.loadCubeTexture();
        
        //console.log('Bright lights added to scene');
    }

    loadSuitcaseModel(retryCount = 0) {
        
        // Wait for GLTFLoader to be available
        if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
            if (retryCount < 40) { // Max 40 retries (2 seconds total)
                setTimeout(() => this.loadSuitcaseModel(retryCount + 1), 50);
                return;
            } else {
                console.error('[Suitcase] GLTFLoader still not available after 2 seconds, waiting for gltfloader-loaded event');
                window.addEventListener('gltfloader-loaded', () => this.loadSuitcaseModel(0), { once: true });
                return;
            }
        }
        
        try {
            const loader = new THREE.GLTFLoader();
            
            loader.load(
                './models/suitcase.glb',
                (gltf) => {
                    this.suitcaseModel = gltf.scene;
                    
                    // Enable shadows for the model and find the lid
                    this.suitcaseModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    // Find the lid object
                    this.findLidObject();

                    // Center and scale the model
                    const box = new THREE.Box3().setFromObject(this.suitcaseModel);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    
                    // Center the model perfectly
                    this.suitcaseModel.position.sub(center);
                    
                    // Scale to size 1.6 (20% smaller than 2.0)
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 1.6 / maxDim;
                    this.suitcaseModel.scale.setScalar(scale);
                    
                    // Ensure it's at the exact center of the scene
                    this.suitcaseModel.position.set(0, 0, 0);
                    
                    this.scene.add(this.suitcaseModel);
                    
                    // Mark model as loaded
                    this.isModelLoaded = true;
                    
                    // If there's a queued show action, run it now
                    if (this.queuedShowAction) {
                        const queuedAction = this.queuedShowAction;
                        this.queuedShowAction = null;
                        setTimeout(() => {
                            this.show(queuedAction);
                        }, 100); // Small delay to ensure everything is set up
                    }
                },
                (progress) => {
                    if (progress.lengthComputable) {
                    }
                },
                (error) => {
                    console.error('Error loading suitcase model:', error);
                    // Create a fallback cube if model fails to load
                    this.createFallbackSuitcase();
                }
            );
        } catch (error) {
            console.error('Error creating GLTFLoader:', error);
            this.createFallbackSuitcase();
                }
    }
    
    findLidObject() {
        this.suitcaseModel.traverse((child) => {
            if (child.name === 'lid') {
                this.lidObject = child;
                return;
            }
        });
        
        if (this.lidObject) {
            // Store original rotation for reset
            this.lidOriginalRotation = this.lidObject.rotation.x;
            // Ensure lid starts closed
            this.lidObject.rotation.x = 0;
            
            // Find the pricesign material within the lid container
            this.findPricesignMaterial();
        } else {
            this.createFallbackLid();
        }
    }
    
    // Find the pricesign material within the lid container
    findPricesignMaterial() {
        if (!this.lidObject) return;
        
        //console.log('🔍 Searching for pricesign material in lid container...');
        
        this.lidObject.traverse((child) => {
            if (child.isMesh && child.material) {
                //console.log('🔍 Found mesh in lid:', child.name, 'Material:', child.material);
                
                // Check if this mesh has a pricesign material
                if (Array.isArray(child.material)) {
                    child.material.forEach((material, index) => {
                        if (material.name && material.name.toLowerCase().includes('pricesign')) {
                            this.pricesignMaterial = material;
                            //console.log('✅ Found pricesign material in array at index:', index);
                        }
                    });
                } else {
                    if (child.material.name && child.material.name.toLowerCase().includes('pricesign')) {
                        this.pricesignMaterial = child.material;
                        //console.log('✅ Found pricesign material:', child.material.name);
                    }
                }
            }
        });
        
        if (this.pricesignMaterial) {
            //console.log('✅ Pricesign material ready:', this.pricesignMaterial.name);
            
            // Check if we have a queued texture to assign
            if (this.queuedTextureValue !== null) {
                //console.log("🔄 Processing queued texture assignment for value:", this.queuedTextureValue);
                this.assignPriceTexture(this.queuedTextureValue);
            }
        } else {
            //console.log('❌ No pricesign material found in lid container');
        }
    }
    
    createFallbackLid() {
        //console.log('Creating fallback lid...');
        // Create a simple lid geometry
        const lidGeometry = new THREE.BoxGeometry(2, 0.1, 1);
        const lidMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        this.lidObject = new THREE.Mesh(lidGeometry, lidMaterial);
        
        // Position the lid on top of the suitcase
        this.lidObject.position.set(0, 0.55, 0);
        this.lidObject.castShadow = true;
        this.lidObject.receiveShadow = true;
        
        // Add to scene
        this.scene.add(this.lidObject);
        this.lidOriginalRotation = 0;
        
        //console.log('Fallback lid created and added to scene');
    }
    
    createFallbackSuitcase() {
        //console.log('Creating fallback suitcase...');
        const geometry = new THREE.BoxGeometry(2, 1, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        this.suitcaseModel = new THREE.Mesh(geometry, material);
        
        // Center the fallback suitcase perfectly
        this.suitcaseModel.position.set(0, 0, 0);
        
        this.suitcaseModel.castShadow = true;
        this.suitcaseModel.receiveShadow = true;
        this.scene.add(this.suitcaseModel);
        //console.log('Fallback suitcase centered and added to scene');
        
        // Find or create fallback lid
        if (!this.lidObject) {
            this.findLidObject();
            if (!this.lidObject) {
                this.createFallbackLid();
            }
        }
        
        // Mark model as loaded
        this.isModelLoaded = true;
        
        // If there's a queued show action, run it now
        if (this.queuedShowAction) {
            const queuedAction = this.queuedShowAction;
            this.queuedShowAction = null;
            setTimeout(() => {
                this.show(queuedAction);
            }, 100);
        }
    }

    setupKeyboardControls() {
        // Add keyboard event listener
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'v') {
                if (this.animationState === 'hidden') {
                    // Start showing animation
                    this.animationState = 'showing';
                    this.runRevealAnimation();
                } else if (this.animationState === 'visible') {
                    // Start hiding animation
                    this.animationState = 'hiding';
                    this.runHideAnimation();
                }
            }
        });
    }

    show(action){
        if (action === 'show') {
            this.animationState = 'showing';
            if (this.isModelLoaded && this.lidObject) {
                this.runRevealAnimation();
                // Fallback: if animation doesn't start within 1 second, force it
                setTimeout(() => {
                    if (this.animationState === 'showing' && this.container && this.container.style.opacity === '0') {
                        console.warn('Animation did not start, forcing reveal...');
                        this.runRevealAnimation();
                    }
                }, 1000);
            } else {
                // Queue the animation to run when model loads
                this.queuedShowAction = 'show';
                // Fallback timeout: if model doesn't load within 5 seconds, show error
                setTimeout(() => {
                    if (!this.isModelLoaded && this.queuedShowAction === 'show') {
                        console.error('Suitcase model failed to load within timeout. Resetting game state.');
                        this.queuedShowAction = null;
                        // Reset game action so player can continue
                        if (this.e && this.e.scene) {
                            this.e.scene.action = "choose";
                        }
                    }
                }, 5000);
            }
        } else if (action === 'hide') {
            this.animationState = 'hiding';
            if (this.isModelLoaded && this.lidObject) {
                this.runHideAnimation();
            } else {
                // Queue the animation to run when model loads
                this.queuedShowAction = 'hide';
            }
        }
    }
    
    // Setup click/tap to hide functionality
    setupClickToHide() {
        document.addEventListener('click', (event) => {
            if (this.animationState === 'visible') {
                //console.log("hide")
                this.show('hide');
                
                // Reset scene action so player can click another case
                this.e.scene.action = "choose";
                // console.log("3");
                // Re-enable all ready cases after 200ms delay
                setTimeout(() => {
                    // console.log("4");
                    this.e.scene.cases.forEach(c => {
                        if (c.action === "ready") {
                            c.domRef.style.pointerEvents = "auto";
                        }
                    });
                }, 500);
            }
        });
        
        // Also listen for touch events on mobile
        document.addEventListener('touchend', (event) => {
            if (this.animationState === 'visible') {
                this.show('hide');
                
                this.e.scene.action = "choose";
                // console.log("5");
                // Re-enable all ready cases after 200ms delay
                setTimeout(() => {
                    // console.log("6");
                    this.e.scene.cases.forEach(c => {
                        if (c.action === "ready") {
                            c.domRef.style.pointerEvents = "auto";
                        }
                    });
                }, 500);
            }
        });
    }
    

    

    

    

    

    

    

    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Always render the scene if it exists, even if container is initially hidden
        // The container visibility is controlled by CSS/GSAP, but we need to keep rendering
        if (this.scene && this.camera && this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    runRevealAnimation() {
        
        if (!this.lidObject) {
            console.warn('Cannot run reveal animation: lidObject not found. Model loaded:', this.isModelLoaded);
            // If model is loaded but lidObject is missing, try to find it again
            if (this.isModelLoaded && this.suitcaseModel) {
                this.findLidObject();
                if (!this.lidObject) {
                    console.error('Still cannot find lidObject after retry, creating fallback');
                    this.createFallbackLid();
                }
            } else {
                console.error('Model not loaded, cannot run animation');
                return;
            }
        }
        
        // Ensure container is set up
        if (!this.container) {
            console.error('Container not found!');
            return;
        }
        
        // Ensure renderer is set up
        if (!this.renderer || !this.scene || !this.camera) {
            console.error('Renderer, scene, or camera not initialized!');
            return;
        }
        
        
        // Ensure lid starts closed
        this.lidObject.rotation.x = 0;
        
        // ELIMINATED text animation removed - no scale needed
        
        // Clear any existing animations
        gsap.killTweensOf([this.container, this.eliminatedText, this.continueText]);
        
        // Ensure container is visible and set up
        if (this.container) {
            this.container.style.display = 'block';
            this.container.style.visibility = 'visible';
            this.container.style.opacity = '0'; // Start hidden for animation
            this.container.style.zIndex = '10005'; // Ensure container is above tempBlocker (10001)
        }
        
        // Ensure renderer canvas is visible
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.style.display = 'block';
        }
        
        // Ensure eliminated text exists and is visible
        if (!this.eliminatedText) {
            // Recreate if missing
            this.eliminatedText = document.createElement('div');
            this.eliminatedText.textContent = 'ELIMINATED';
            this.eliminatedText.style.color = '#D4AF37';
            this.eliminatedText.style.fontSize = '28px';
            this.eliminatedText.style.fontWeight = '400';
            this.eliminatedText.style.textAlign = 'center';
            this.eliminatedText.style.marginTop = '20px';
            this.eliminatedText.style.letterSpacing = '1px';
            this.eliminatedText.style.zIndex = '10011'; // Above Three.js DOM element (10010)
            this.eliminatedText.style.fontFamily = "'Sanchez', serif";
            this.eliminatedText.style.opacity = '1';
            this.eliminatedText.style.transform = 'none';
            this.eliminatedText.style.textShadow = 'none';
            this.eliminatedText.style.pointerEvents = 'none';
        }
        
        // Ensure eliminated text is properly appended to canvasContainer
        if (this.canvasContainer && this.eliminatedText) {
            // Check if already appended
            if (!this.canvasContainer.contains(this.eliminatedText)) {
                // Insert before renderer.domElement if it exists, otherwise just append
                if (this.renderer && this.renderer.domElement && this.canvasContainer.contains(this.renderer.domElement)) {
                    this.canvasContainer.insertBefore(this.eliminatedText, this.renderer.domElement);
                } else {
                    this.canvasContainer.appendChild(this.eliminatedText);
                }
            }
            // Clear any GSAP transforms from previous animations first
            gsap.set(this.eliminatedText, { 
                clearProps: "transform,translateY,x,y" 
            });
            // Reset position to ensure consistent placement
            this.eliminatedText.style.marginTop = '20px';
            this.eliminatedText.style.transform = 'none';
            this.eliminatedText.style.opacity = '1';
            this.eliminatedText.style.display = 'block';
            this.eliminatedText.style.visibility = 'visible';
        }
        
        // ===== REVEAL ANIMATION TIMELINE =====
        const tl = gsap.timeline({
            onComplete: () => {
                this.animationState = 'visible';
                this.animationComplete = true;
                // CSS animation starts automatically when element becomes visible
            }
        });
        
        // PHASE 1: Container fade in + Camera zoom + tempBlocker fade (0.0s - 0.15s)
        tl.to(this.container, {
            opacity: 1,
            duration: 0.15,
            ease: "power2.out"
        });
        
        // Fade tempBlocker to beige/off-white (matching clue window) - fade to more opaque
        const tempBlocker = document.getElementById('tempBlocker');
        if (tempBlocker) {
            tempBlocker.style.pointerEvents = 'auto';
            tempBlocker.style.background = 'rgba(240, 240, 240, 0.6)'; // Start with less opaque beige
            tempBlocker.style.backdropFilter = 'blur(10px)'; // Blur content behind
            tempBlocker.style.webkitBackdropFilter = 'blur(10px)'; // Safari support
        }
        tl.to('#tempBlocker', {
            opacity: 0.975, // 95% opacity
            duration: 0.15,
            ease: "power2.out",
            onUpdate: function() {
                const tempBlocker = document.getElementById('tempBlocker');
                if (tempBlocker) {
                    // Fade background alpha from 0.6 to 0.95 for 95% opacity effect
                    const progress = gsap.getProperty('#tempBlocker', 'opacity');
                    const alpha = 0.6 + (progress * 0.35); // Fade from 0.6 to 0.95
                    tempBlocker.style.background = `rgba(240, 240, 240, ${alpha})`;
                }
            }
        }, 0);
        
        // Camera zoom: start far, move closer
        tl.to(this.camera.position, {
            z: 3.1, // Move closer (adjusted for new starting position)
            duration: 0.45,
            ease: "power2.out"
        }, 0); // Start immediately

        // PHASE 2: Lid opening + ELIMINATED text entrance (0.075s - 0.45s)
        tl.to(this.lidObject.rotation, {
            x: Math.PI / 2, // 90 degrees
            duration: 0.375,
            ease: "power2.out",
            onComplete: () => {
                // Trigger particle effects when lid opens
                
                // Play case opening sound based on value
                
            }
        }, 0.075); // Start at 0.075s

        this.createParticleEffects();
        
        // ELIMINATED text: no animation (removed)
        
        // PHASE 3: Bottom text slides down (0.3s - 0.6s)
        tl.to(this.continueText, {
            opacity: 1,
            translateY: 0,
            duration: 0.3,
            ease: "power2.out"
        }, 0.075); // Start at 0.075s
        
        // Store timeline reference for potential interruption
        this.currentTimeline = tl;
    }
    
    runHideAnimation() {
        // Clear any existing animations
        gsap.killTweensOf([this.container, this.eliminatedText, this.continueText]);
        
        // ===== HIDE ANIMATION TIMELINE =====
        const tl = gsap.timeline({
            onComplete: () => {
                this.animationState = 'hidden';
                // Reset lid to closed position
                if (this.lidObject) {
                    this.lidObject.rotation.x = 0;
                }
                // Reset camera to original position
                this.camera.position.z = 3.8;
                // Clear transforms from eliminated text for next time
                if (this.eliminatedText) {
                    gsap.set(this.eliminatedText, { 
                        clearProps: "transform,translateY,x,y" 
                    });
                    this.eliminatedText.style.transform = 'none';
                    this.eliminatedText.style.marginTop = '20px';
                }
                // CSS animation stops automatically when element is hidden
                document.getElementById('tempBlocker').style.pointerEvents = 'none';
            }
        });
        
        // PHASE 1: Fade out container, text elements, and tempBlocker (0.0s - 0.3s)
        tl.to([this.container, this.eliminatedText, this.continueText], {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in"
        });
        
        // Fade out tempBlocker completely and disable pointer events
        tl.to('#tempBlocker', {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onUpdate: function() {
                const tempBlocker = document.getElementById('tempBlocker');
                if (tempBlocker) {
                    tempBlocker.style.pointerEvents = 'none';
                }
            }
        }, 0);
        
        // PHASE 2: Move text elements while fading out
        tl.to(this.eliminatedText, {
            translateY: 80, // Move down
            duration: 0.3,
            ease: "power2.in"
        }, 0); // Start immediately
        
        tl.to(this.continueText, {
            translateY: -20, // Move up
            duration: 0.3,
            ease: "power2.in"
        }, 0); // Start immediately
        
        // Store timeline reference
        this.currentTimeline = tl;
    }
    
    // Set up continuous color animation for ELIMINATED text (removed - no animation)
    setupContinuousAnimations() {
        // Animation removed per user request
        // Create the keyframes dynamically (kept for other potential animations)
        const style = document.createElement('style');
        style.textContent = `
            @keyframes colorPulse {
                0% {
                    color: #FFFFFF;
                    text-shadow: 0 0 4px #FFFFFF;
                }
                50% {
                    color: #FFD700;
                    text-shadow: 0 0 4px #FFD700;
                }
                100% {
                    color: #FFFFFF;
                    text-shadow: 0 0 4px #FFFFFF;
                }
            }
        `;
        document.head.appendChild(style);
    }
    


    handleResize() {
        window.addEventListener('resize', () => {
            // Keep the canvas at 350x350
            this.renderer.setSize(350, 350);
            this.camera.aspect = 350 / 350;
            this.camera.updateProjectionMatrix();
        });
    }

    update() {
        // Additional update logic can go here
    }
    
    // Camera rig control methods
    rotateCameraX(angle) {
        if (this.camContX) {
            this.camContX.rotation.x += angle;
        }
    }
    
    rotateCameraY(angle) {
        if (this.camContY) {
            this.camContY.rotation.y += angle;
        }
    }
    
    setCameraRotationX(angle) {
        if (this.camContX) {
            this.camContX.rotation.x = angle;
        }
    }
    
    setCameraRotationY(angle) {
        if (this.camContY) {
            this.camContY.rotation.y = angle;
        }
    }

    
    resetLid() {
        if (this.lidObject && this.lidOriginalRotation !== undefined) {
            this.lidObject.rotation.x = this.lidOriginalRotation;
            this.lidTime = 0;
            //console.log('Lid reset to original position');
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
    
    // Create material control sliders for metalness and roughness
    createMaterialControls() {
        // Create control panel container
        const controlPanel = document.createElement('div');
        controlPanel.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-family: 'Montserrat', sans-serif;
            font-size: 12px;
            z-index: 1000002;
            pointer-events: auto;
            min-width: 200px;
            display: none;
        `;
        
        // Metalness slider
        const metalnessContainer = document.createElement('div');
        metalnessContainer.style.marginBottom = '15px';
        
        const metalnessLabel = document.createElement('label');
        metalnessLabel.textContent = 'Metalness: ';
        metalnessLabel.style.display = 'block';
        metalnessLabel.style.marginBottom = '5px';
        
        const metalnessSlider = document.createElement('input');
        metalnessSlider.type = 'range';
        metalnessSlider.min = '0';
        metalnessSlider.max = '1';
        metalnessSlider.step = '0.01';
        metalnessSlider.value = '0.5';
        metalnessSlider.style.width = '100%';
        
        const metalnessValue = document.createElement('span');
        metalnessValue.textContent = '0.5';
        metalnessValue.style.marginLeft = '10px';
        
        metalnessSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            metalnessValue.textContent = value.toFixed(2);
            this.updateMaterialProperties('metalness', value);
        });
        
        metalnessContainer.appendChild(metalnessLabel);
        metalnessContainer.appendChild(metalnessSlider);
        metalnessContainer.appendChild(metalnessValue);
        
        // Roughness slider
        const roughnessContainer = document.createElement('div');
        
        const roughnessLabel = document.createElement('label');
        roughnessLabel.textContent = 'Roughness: ';
        roughnessLabel.style.display = 'block';
        roughnessLabel.style.marginBottom = '5px';
        
        const roughnessSlider = document.createElement('input');
        roughnessSlider.type = 'range';
        roughnessSlider.min = '0';
        roughnessSlider.max = '1';
        roughnessSlider.step = '0.01';
        roughnessSlider.value = '0.5';
        roughnessSlider.style.width = '100%';
        
        const roughnessValue = document.createElement('span');
        roughnessValue.textContent = '0.5';
        roughnessValue.style.marginLeft = '10px';
        
        roughnessSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            roughnessValue.textContent = value.toFixed(2);
            this.updateMaterialProperties('roughness', value);
        });
        
        roughnessContainer.appendChild(roughnessLabel);
        roughnessContainer.appendChild(roughnessSlider);
        roughnessContainer.appendChild(roughnessValue);
        
        // Environment Map Intensity slider
        const envMapContainer = document.createElement('div');
        
        const envMapLabel = document.createElement('label');
        envMapLabel.textContent = 'Reflection Intensity: ';
        envMapLabel.style.display = 'block';
        envMapLabel.style.marginBottom = '5px';
        
        const envMapSlider = document.createElement('input');
        envMapSlider.type = 'range';
        envMapSlider.min = '0';
        envMapSlider.max = '2';
        envMapSlider.step = '0.1';
        envMapSlider.value = '1.0';
        envMapSlider.style.width = '100%';
        
        const envMapValue = document.createElement('span');
        envMapValue.textContent = '1.0';
        envMapValue.style.marginLeft = '10px';
        
        envMapSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            envMapValue.textContent = value.toFixed(1);
            this.updateEnvironmentMapIntensity(value);
        });
        
        envMapContainer.appendChild(envMapLabel);
        envMapContainer.appendChild(envMapSlider);
        envMapContainer.appendChild(envMapValue);
        
        // Add to control panel
        controlPanel.appendChild(metalnessContainer);
        controlPanel.appendChild(roughnessContainer);
        controlPanel.appendChild(envMapContainer);
        
        // Add control panel to canvas container
        this.canvasContainer.appendChild(controlPanel);
    }
    
    // Create particle effects container for 2D effects
    createParticleContainer() {
        this.particleContainer = document.createElement('div');
        this.particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000001;
            overflow: hidden;
        `;
        
        this.canvasContainer.appendChild(this.particleContainer);
    }
    
    // Load cube texture for environment mapping
    loadCubeTexture() {
        const loader = new THREE.CubeTextureLoader();
        loader.name = "skyboxLoaderName";
        
        this.reflectionTexture = loader.load([
            './images/ref/pos-x.png',
            './images/ref/neg-x.png',
            './images/ref/pos-y.png',
            './images/ref/neg-y.png',
            './images/ref/pos-z.png',
            './images/ref/neg-z.png',
        ], () => {
            //console.log('Cube texture loaded successfully');
            this.applyEnvironmentMap();
        }, undefined, (error) => {
            //console.error('Error loading cube texture:', error);
        });
    }
    
    // Pre-load all price textures
    preloadPriceTextures() {


        this.priceTextures = {};
        const textureLoader = new THREE.TextureLoader();
        
        // Dynamically discover price textures by trying common patterns
        this.discoverPriceTextures(textureLoader);
    }
    
    // Discover and load all available price textures
    discoverPriceTextures(textureLoader) {

        // Common price patterns to try
        const pricePatterns = [
            // Small increments
            1,5,10,25,50, 100, 500,
            // Larger increments
            1000, 2500, 5000, 7500, 10000, 20000, 25000,
            // High value increments
             50000, 75000, 100000, 300000, 500000, 750000, 1000000
        ];
        
        let loadedCount = 0;
        let totalAttempts = pricePatterns.length;
        
        pricePatterns.forEach(price => {
            const texturePath = `./images/p${price}.png`;
            
            textureLoader.load(texturePath, (texture) => {
                this.priceTextures[price] = texture;
                loadedCount++;
                //console.log(`✅ Price texture loaded: p${price}.png`);
                
                if (loadedCount === Object.keys(this.priceTextures).length) {
                    //console.log(`🎯 Total price textures loaded: ${loadedCount}`);
                    
                    // Check if we have a queued texture to assign now that textures are loaded
                    if (this.queuedTextureValue !== null && this.pricesignMaterial) {
                        //console.log("🔄 Processing queued texture assignment after texture load for value:", this.queuedTextureValue);
                        this.assignPriceTexture(this.queuedTextureValue);
                    }
                }
            }, undefined, (error) => {
                // Silently skip missing textures - this is expected
                totalAttempts--;
                if (totalAttempts === 0) {
                    //console.log(`🎯 Price texture discovery complete. Loaded: ${Object.keys(this.priceTextures).length} textures`);
                }
            });
        });
    }
    
    // Apply environment map to all suitcase materials
    applyEnvironmentMap() {
        if (!this.suitcaseModel || !this.reflectionTexture) return;
        
        this.suitcaseModel.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    // Handle multiple materials
                    child.material.forEach(material => {
                        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                            material.envMap = this.reflectionTexture;
                            material.envMapIntensity = 1.0;
                            material.needsUpdate = true;
                        }
                    });
                } else {
                    // Handle single material
                    if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                        child.material.envMap = this.reflectionTexture;
                        child.material.envMapIntensity = 1.0;
                        child.material.needsUpdate = true;
                    }
                }
            } else if (child.isGroup || child.isObject3D) {
                // Handle container objects (like the lid container)
                child.traverse((subChild) => {
                    if (subChild.isMesh && subChild.material) {
                        if (Array.isArray(subChild.material)) {
                            // Handle multiple materials
                            subChild.material.forEach(material => {
                                if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                                    material.envMap = this.reflectionTexture;
                                    material.envMapIntensity = 1.0;
                                    material.needsUpdate = true;
                                }
                            });
                        } else {
                            // Handle single material
                            if (subChild.material.isMeshStandardMaterial || subChild.material.isMeshPhysicalMaterial) {
                                subChild.material.envMap = this.reflectionTexture;
                                subChild.material.envMapIntensity = 1.0;
                                subChild.material.needsUpdate = true;
                            }
                        }
                    }
                });
            }
        });
        
        //console.log('Environment map applied to suitcase materials');
    }
    
    // Update environment map intensity for all suitcase materials
    updateEnvironmentMapIntensity(intensity) {
        if (!this.suitcaseModel) return;
        
        this.suitcaseModel.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    // Handle multiple materials
                    child.material.forEach(material => {
                        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                            material.envMapIntensity = intensity;
                            material.needsUpdate = true;
                        }
                    });
                } else {
                    // Handle single material
                    if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                        child.material.envMapIntensity = intensity;
                        child.material.needsUpdate = true;
                    }
                }
            } else if (child.isGroup || child.isObject3D) {
                // Handle container objects (like the lid container)
                child.traverse((subChild) => {
                    if (subChild.isMesh && subChild.material) {
                        if (Array.isArray(subChild.material)) {
                            // Handle multiple materials
                            subChild.material.forEach(material => {
                                if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                                    material.envMapIntensity = intensity;
                                    material.needsUpdate = true;
                                }
                            });
                        } else {
                            // Handle single material
                            if (subChild.material.isMeshStandardMaterial || subChild.material.isMeshPhysicalMaterial) {
                                subChild.material.envMapIntensity = intensity;
                                subChild.material.needsUpdate = true;
                            }
                        }
                    }
                });
            }
        });
    }
    
    // Update material properties for all suitcase materials
    updateMaterialProperties(property, value) {
        if (!this.suitcaseModel) return;
        
        this.suitcaseModel.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    // Handle multiple materials
                    child.material.forEach(material => {
                        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                            material[property] = value;
                            material.needsUpdate = true;
                        }
                    });
                } else {
                    // Handle single material
                    if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                        child.material[property] = value;
                        child.material.needsUpdate = true;
                    }
                }
            } else if (child.isGroup || child.isObject3D) {
                // Handle container objects (like the lid container)
                child.traverse((subChild) => {
                    if (subChild.isMesh && subChild.material) {
                        if (Array.isArray(subChild.material)) {
                            // Handle multiple materials
                            subChild.material.forEach(material => {
                                if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                                    material[property] = value;
                                    material.needsUpdate = true;
                                }
                            });
                        } else {
                            // Handle single material
                            if (subChild.material.isMeshStandardMaterial || subChild.material.isMeshPhysicalMaterial) {
                                child.material[property] = value;
                                child.material.needsUpdate = true;
                            }
                        }
                    }
                });
            }
        });
    }
    
    // Create magical particle effects when case opens
    createParticleEffects() {
        // Clear any existing particles
        this.particleContainer.innerHTML = '';
        
        // Create sparkles
        this.createSparkles();
        
        // Create confetti
        // this.createConfetti();
        
        // Create magical swirls
        // this.createMagicalSwirls();
        
        // Create floating orbs
        // this.createFloatingOrbs();
    }
    
    // Create sparkle particles
    createSparkles() {
        for (let i = 0; i < 30; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: #FFD700;
                border-radius: 50%;
                pointer-events: none;
                box-shadow: 0 0 8px #ffffff, 0 0 16px #ffffff;
            `;
            
            // Random starting position around the center
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const startX = 175 + Math.cos(angle) * distance;
            const startY = 175 + Math.sin(angle) * distance;
            
            sparkle.style.left = startX + 'px';
            sparkle.style.top = startY + 'px';
            
            this.particleContainer.appendChild(sparkle);
            
            // Animate sparkle
            gsap.fromTo(sparkle, 
                { 
                    scale: 0, 
                    opacity: 1,
                    rotation: 0
                },
                {
                    scale: 1.5,
                    opacity: 0,
                    rotation: 360,
                    duration: 1.5 + Math.random() * 1,
                    ease: "power2.out",
                    onComplete: () => sparkle.remove()
                }
            );
            
            // Random movement
            gsap.to(sparkle, {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                duration: 1.5 + Math.random() * 1,
                ease: "power2.out"
            });
        }
    }
    
    // Create confetti particles
    createConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                pointer-events: none;
                transform-origin: center;
            `;
            
            // Random starting position
            const startX = 150 + Math.random() * 50;
            const startY = 150 + Math.random() * 50;
            
            confetti.style.left = startX + 'px';
            confetti.style.top = startY + 'px';
            
            this.particleContainer.appendChild(confetti);
            
            // Animate confetti
            gsap.fromTo(confetti, 
                { 
                    scale: 0, 
                    opacity: 1,
                    rotation: 0
                },
                {
                    scale: 1,
                    opacity: 0,
                    rotation: 720 + Math.random() * 360,
                    duration: 2 + Math.random() * 1,
                    ease: "power2.out",
                    onComplete: () => confetti.remove()
                }
            );
            
            // Random movement with gravity effect
            gsap.to(confetti, {
                x: (Math.random() - 0.5) * 300,
                y: 200 + Math.random() * 100,
                duration: 2 + Math.random() * 1,
                ease: "power2.in"
            });
        }
    }
    
    // Create magical swirl particles
    createMagicalSwirls() {
        for (let i = 0; i < 20; i++) {
            const swirl = document.createElement('div');
            swirl.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: linear-gradient(45deg, #FFD700, #FFA500, #FF69B4);
                border-radius: 50%;
                pointer-events: none;
                box-shadow: 0 0 12px #FFD700;
            `;
            
            // Spiral starting position
            const angle = (i / 20) * Math.PI * 4;
            const radius = 30 + (i % 3) * 20;
            const startX = 175 + Math.cos(angle) * radius;
            const startY = 175 + Math.sin(angle) * radius;
            
            swirl.style.left = startX + 'px';
            swirl.style.top = startY + 'px';
            
            this.particleContainer.appendChild(swirl);
            
            // Animate swirl
            gsap.fromTo(swirl, 
                { 
                    scale: 0, 
                    opacity: 1,
                    rotation: 0
                },
                {
                    scale: 1.2,
                    opacity: 0,
                    rotation: 360,
                    duration: 1.8 + Math.random() * 0.5,
                    ease: "power2.out",
                    onComplete: () => swirl.remove()
                }
            );
            
            // Spiral outward movement
            gsap.to(swirl, {
                x: Math.cos(angle) * 150,
                y: Math.sin(angle) * 150,
                duration: 1.8 + Math.random() * 0.5,
                ease: "power2.out"
            });
        }
    }
    
    // Create floating orb particles
    createFloatingOrbs() {
        for (let i = 0; i < 15; i++) {
            const orb = document.createElement('div');
            orb.style.cssText = `
                position: absolute;
                width: 12px;
                height: 12px;
                background: radial-gradient(circle, #FFD700, #FFA500);
                border-radius: 50%;
                pointer-events: none;
                box-shadow: 0 0 20px #FFD700, inset 0 0 10px #FFA500;
            `;
            
            // Random starting position
            const startX = 160 + Math.random() * 30;
            const startY = 160 + Math.random() * 30;
            
            orb.style.left = startX + 'px';
            orb.style.top = startY + 'px';
            
            this.particleContainer.appendChild(orb);
            
            // Animate orb
            gsap.fromTo(orb, 
                { 
                    scale: 0, 
                    opacity: 1
                },
                {
                    scale: 1.5,
                    opacity: 0,
                    duration: 2.5 + Math.random() * 1,
                    ease: "power2.out",
                    onComplete: () => orb.remove()
                }
            );
            
            // Floating movement
            gsap.to(orb, {
                y: -100 - Math.random() * 100,
                x: (Math.random() - 0.5) * 100,
                duration: 2.5 + Math.random() * 1,
                ease: "power2.in"
            });
        }
    }
    
    // Assign random price texture to the pricesign mesh
    assignRandomPriceTexture() {
        if (!this.suitcaseModel || !this.priceTextures) return;
        
        // Find the pricesign mesh in the model
        let pricesignMesh = null;
        this.suitcaseModel.traverse((child) => {
            if (child.isMesh && child.name.toLowerCase().includes('pricesign')) {
                pricesignMesh = child;
            }
        });
        
        if (pricesignMesh && pricesignMesh.material) {
            // Get random price from available textures
            const availablePrices = Object.keys(this.priceTextures);
            if (availablePrices.length > 0) {
                const randomPrice = availablePrices[Math.floor(Math.random() * availablePrices.length)];
                const selectedTexture = this.priceTextures[randomPrice];
                
                // Apply texture to the material
                if (Array.isArray(pricesignMesh.material)) {
                    // Handle multiple materials
                    pricesignMesh.material.forEach(material => {
                        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                            material.map = selectedTexture;
                            material.needsUpdate = true;
                        }
                    });
                } else {
                    // Handle single material
                    if (pricesignMesh.material.isMeshStandardMaterial || pricesignMesh.material.isMeshPhysicalMaterial) {
                        pricesignMesh.material.map = selectedTexture;
                        pricesignMesh.material.needsUpdate = true;
                    }
                }
                
                //console.log(`Assigned price texture: p${randomPrice}.png to pricesign`);
            }
        } else {
            //console.log('Pricesign mesh not found in suitcase model');
        }
    }
    
        // Assign specific price texture to the pricesign material based on value parameter
    assignPriceTexture(value) {

        // Add to queue if we're already processing a texture
        if (this.isProcessingTexture) {
            this.queuedTextureValue = value;
            return;
        }

        // Queue the texture assignment if we're not ready yet
        if (!this.priceTextures || !this.pricesignMaterial) {
            this.queuedTextureValue = value;
            return;
        }

        // Process the texture assignment
        this.processTextureAssignment(value);
    }

    // Process texture assignment with proper state management
    processTextureAssignment(value) {
        // console.log("🔄 Processing texture assignment for value:", value);
        this.isProcessingTexture = true;
        //console.log("🔄 Processing texture assignment for value:", value);

        // Check if we have the texture for this specific value
        if (this.priceTextures[value]) {
            const selectedTexture = this.priceTextures[value];
            
            // Ensure the texture is fully loaded
            if (!selectedTexture.image || !selectedTexture.image.complete) {
                //console.log("⏳ Texture not fully loaded yet, queuing assignment");
                this.queuedTextureValue = value;
                this.isProcessingTexture = false;
                return;
            }
            
            // Flip the texture on Y axis to fix upside-down numbers
            selectedTexture.flipY = false;
            
            // Apply texture directly to the material
            this.pricesignMaterial.map = selectedTexture;
            this.pricesignMaterial.needsUpdate = true;
            
            // console.log(`✅ Successfully assigned price texture: p${value}.png to pricesign material (flipped Y)`);
        } else {
            // console.log(`❌ Price texture not found for value: ${value}`);
        }

        // Mark as complete and process any queued texture
        this.isProcessingTexture = false;
        
        // if (this.queuedTextureValue !== null) {
        //     const nextValue = this.queuedTextureValue;
        //     this.queuedTextureValue = null;
        //     //console.log("🔄 Processing queued texture:", nextValue);
        //     // Use setTimeout to prevent stack overflow
        //     setTimeout(() => this.processTextureAssignment(nextValue), 10);
        // }
    }
    

    
    // Play game end sound based on final amount
    playGameEndSound(finalAmount) {
        if (!this.e || !this.e.s) return;
        
        if (finalAmount < 100000) {
            // this.e.s.p("lose");
        } else {
            // this.e.s.p("wincase");
        }
        
        //console.log(`🎵 Played game end sound for amount: ${finalAmount}`);
    }
    
    // Play clue sound
    playClueSound() {
        if (!this.e || !this.e.s) return;
        
        this.e.s.p("clue");
        //console.log("🎵 Played clue sound");
    }
    
    // Play action button sounds
    playActionButtonSound(buttonNumber, hasOpenedMoreThan7Cases = false) {
        if (!this.e || !this.e.s) return;
        
        switch (buttonNumber) {
            case 1:
                if (hasOpenedMoreThan7Cases) {
                    // this.e.s.p("bingnice");
                }
                break;
            // case 2:
                // this.e.s.p("bingnice");
                break;
            case 3:
                // this.e.s.p("bingnice");
                break;
        }
        
        //console.log(`🎵 Played action button ${buttonNumber} sound`);
    }
}


// ============================================================================
// INDEX CLASS
// ============================================================================











/**
 * De-obfuscate an obfuscated string with the method above.
 * @param  {[type]} key rotation index between 0 and n
 * @param  {Number} n   same number that was used for obfuscation
 * @return {[type]}     plaintext string
 */
String.prototype._0x6cc90a = function(key, n = 126) {
  // return String itself if the given parameters are invalid
  if (!(typeof(key) === 'number' && key % 1 === 0)
      || !(typeof(key) === 'number' && key % 1 === 0)) {
    return this.toString();
  }

  return this.toString()._0xa68b0d(n - key);
};

/**
 * Obfuscate a plaintext string with a simple rotation algorithm similar to
 * the rot13 cipher.
 * @param  {[type]} key rotation index between 0 and n
 * @param  {Number} n   maximum char that will be affected by the algorithm
 * @return {[type]}     obfuscated string
 */
String.prototype._0xa68b0d = function(key, n = 126) {
  // return String itself if the given parameters are invalid
  if (!(typeof(key) === 'number' && key % 1 === 0)
      || !(typeof(key) === 'number' && key % 1 === 0)) {
    return this.toString();
  }

  var chars = this.toString().split('');

  for (var i = 0; i < chars.length; i++) {
    var c = chars[i].charCodeAt(0);

    if (c <= n) {
      chars[i] = String.fromCharCode((chars[i].charCodeAt(0) + key) % n);
    }
  }

  return chars.join('');
};

// Wait for DOM and libraries to load
document.addEventListener('DOMContentLoaded', function() {
    // Wait for THREE.js and GLTFLoader to be available
    function initGame(retryCount = 0) {
        if (retryCount === 0) {
            console.log("Loading Gold Case game...");
        }
        if (typeof THREE === 'undefined') {
            if (retryCount < 40) {
                setTimeout(() => initGame(retryCount + 1), 50);
                return;
            } else {
                window.addEventListener('three-loaded', () => initGame(0), { once: true });
                return;
            }
        }
        
        if (typeof THREE.GLTFLoader === 'undefined') {
            if (retryCount < 40) {
                setTimeout(() => initGame(retryCount + 1), 50);
                return;
            } else {
                window.addEventListener('gltfloader-loaded', () => initGame(0), { once: true });
                return;
            }
        }
        

        var input = new Input();
        var loader = new Loader();
        var scene = new Scene();
        var sounds = new Sounds();
        var utilities = new Utilities();
        var ui = new UI();
        var suitcase = new Suitcase();
        var endScore = new EndScore();

        var engine = new Engine(input, loader, scene, sounds, suitcase, utilities, ui, endScore);
  
        ui.setUp(engine);
        utilities.setUp(engine);
        loader.setUp(engine);
        scene.setUp(engine);
        sounds.setUp(engine);
        input.setUp(engine);
        suitcase.setUp(engine);
        endScore.setUp(engine);
  
        engine.start(engine);

        function update() {
            engine.update();
            requestAnimationFrame(update);
        }
  
        requestAnimationFrame(update);
    }

    initGame();
});

// Helper function to get today's key for localStorage
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Calculate stars from Gold Case score
function calculateGoldCaseStarsFromScore(scoreValue) {
    let stars = 0;
    // Star thresholds for Gold Case (matching EndScore defaults)
    const starThresholds = [0, 100000, 600000, 1200000, 2000000];
    // 1 star = >= 0
    // 2 stars = >= 100000
    // 3 stars = >= 600000
    // 4 stars = >= 1200000
    // 5 stars = >= 2000000
    for (let i = starThresholds.length - 1; i >= 0; i--) {
        if (scoreValue >= starThresholds[i]) {
            stars = i + 1; // Add 1 because index 0 = 1 star, index 4 = 5 stars
            break;
        }
    }
    return stars;
}

// Save Gold Case game result (similar to blackjack/lostAndFound)
function saveGoldCaseGameResult(finalScore, starsEarned) {
    const todayKey = getTodayKey();
    
    console.log('[GoldCase] Saving game result:', { finalScore, starsEarned, todayKey });
    
    // Check if already played today BEFORE overwriting
    const previousStars = parseInt(localStorage.getItem(`goldCaseStars_${todayKey}`) || '0');
    const previousScore = parseInt(localStorage.getItem(`goldCaseScore_${todayKey}`) || '0');
    const wasComplete = localStorage.getItem(`goldCaseComplete_${todayKey}`) === 'true';
    
    console.log('[GoldCase] Previous stars:', previousStars, 'Was complete:', wasComplete);
    
    // Check if this is a better result
    const isBetter = !wasComplete || finalScore > previousScore || starsEarned > previousStars;
    
    if (isBetter) {
        // Calculate star difference to add to totals
        const starDifference = wasComplete ? (starsEarned - previousStars) : starsEarned;
        
        console.log('[GoldCase] Adding star difference:', starDifference);
    
        // Update daily and total stars if there's a difference
        if (starDifference !== 0) {
            const currentDailyStars = parseInt(localStorage.getItem(`dailyStars_${todayKey}`) || '0');
            const currentTotalStars = parseInt(localStorage.getItem('totalStars') || '0');
            
            localStorage.setItem(`dailyStars_${todayKey}`, String(currentDailyStars + starDifference));
            localStorage.setItem('totalStars', String(currentTotalStars + starDifference));
            
            // Award games played (1 point per game, only once per game)
            // Try parent window first (if in iframe), then current window
            const awardFn = (window.parent && window.parent.awardStars) ? window.parent.awardStars : (window.awardStars || null);
            if (awardFn) {
                awardFn(starDifference, 'goldCase');
            } else {
                // Fallback if awardStars not available - manually add usable stars
                const currentGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
                localStorage.setItem('gamesPlayed', String(Math.max(0, currentGamesPlayed + 1)));
                // Also add usable stars manually
                const currentUsableStars = parseInt(localStorage.getItem(`usableStars_${todayKey}`) || localStorage.getItem(`moveStars_${todayKey}`) || '0');
                localStorage.setItem(`usableStars_${todayKey}`, String(currentUsableStars + starDifference));
            }
        }
        
        // Always save the new score and stars if better
        localStorage.setItem(`goldCaseScore_${todayKey}`, String(finalScore));
        localStorage.setItem(`goldCaseStars_${todayKey}`, String(starsEarned));
        localStorage.setItem(`goldCaseComplete_${todayKey}`, 'true');
        
        console.log('[GoldCase] Verified saved stars:', localStorage.getItem(`goldCaseStars_${todayKey}`));
    }
    
    // Update parent window displays if accessible
    if (window.parent && window.parent !== window) {
        if (window.parent.updateStarDisplay) {
            window.parent.updateStarDisplay();
        }
        if (window.parent.updateWalletStars) {
            window.parent.updateWalletStars();
        }
        if (window.parent.updateRivalStars) {
            window.parent.updateRivalStars();
        }
        if (window.parent.updateHeaderStarCounter) {
            window.parent.updateHeaderStarCounter();
        }
        if (window.parent.updateWalletStars2) {
            window.parent.updateWalletStars2();
        }
        
        // Update calendar
        if (window.parent.updateCalendar) {
            window.parent.updateCalendar();
        }
        
        // Reload Gold Case scores on main page
        if (window.parent.loadGameScores) {
            window.parent.loadGameScores();
        }
    }
}


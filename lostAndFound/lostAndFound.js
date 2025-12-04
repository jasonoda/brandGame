// ============================================================================
// LOST AND FOUND - Consolidated JavaScript File
// ============================================================================

// ============================================================================
// INPUT CLASS
// ============================================================================

class Input {
    setUp(e) {
        this.e = e;
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
            } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
                this.keyDown = true;
                console.log(this.e.scene.matchLock1);
                console.log(this.e.scene.matchLock2);
            } else if (event.key === "q" || event.key === "Q") {
                this.e.scene.time = 43;
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

// ============================================================================
// LOADER CLASS
// ============================================================================

class Loader {
    setUp(e) {
        this.e = e;
        this.ready = false;
        this.modelsLoaded = 0;
        this.texturesLoaded = 0;
        this.modelArray = [];
        this.textureArray = [];
        this.isLoaded_CUBE = false;
        this.isLoaded_3DTEXTURES = false;
        this.isLoaded_3D = false;
        this.e.reflectionTexture = null;
        this.totalSkinsLoaded = 0;
        console.log("set up loader");
    }

    loadCubeTexture(loader) {
        console.log("[LOADER] Cube texture loaded!");
        this.isLoaded_CUBE = true;
        console.log("[LOADER] isLoaded_CUBE set to:", this.isLoaded_CUBE);
    }

    loadTexture(loader) {
        this.texturesLoaded += 1;
        console.log("[LOADER] Texture loaded: " + this.texturesLoaded + " / " + this.textureArray.length);
        if (this.texturesLoaded === this.textureArray.length) {
            console.log("[LOADER] All textures loaded! Setting isLoaded_3DTEXTURES to true");
            this.isLoaded_3DTEXTURES = true;
        }
    }

    managerLoad(obName) {
        console.log("[LOADER] managerLoad() called with obName:", obName);
        console.log("[LOADER] Current modelsLoaded:", this.modelsLoaded);
        console.log("[LOADER] modelArray:", this.modelArray);
        this.modelsLoaded += 1;
        console.log("[LOADER] Model loaded: " + obName + " (" + this.modelsLoaded + " / " + this.modelArray.length + ")");
        if (this.modelsLoaded === this.modelArray.length) {
            console.log("[LOADER] All models loaded! Setting isLoaded_3D to true");
            this.isLoaded_3D = true;
        } else {
            console.log("[LOADER] Still waiting for more models. Current:", this.modelsLoaded, "Expected:", this.modelArray.length);
        }
    }

    load() {
        console.log("[LOADER] Starting 3D asset load...");
        console.log("[LOADER] Texture array length:", this.textureArray.length);
        console.log("[LOADER] Model array length:", this.modelArray.length);
        
        var e = this.e;
        var loader = new THREE.CubeTextureLoader();
        loader.name = "skyboxLoaderName";

        console.log("[LOADER] Loading cube texture...");
        this.e.reflectionTexture = loader.load([
            './images/ref/pos-x.png',
            './images/ref/neg-x.png',
            './images/ref/pos-y.png',
            './images/ref/neg-y.png',
            './images/ref/pos-z.png',
            './images/ref/neg-z.png',
        ], () => this.loadCubeTexture());

        this.textureArray.push("blackTemp");
        this.e.blackTemp = new THREE.TextureLoader().load('./images/black.png', () => this.loadTexture(this));

        this.textureArray.push("background");
        this.e.background = new THREE.TextureLoader().load('./images/background.png', () => this.loadTexture(this));
        this.e.background.repeat.set(0.5, 1.0);
        this.e.background.offset.set(0.25, 0);

        this.textureArray.push("ped1");
        this.e.ped1 = new THREE.TextureLoader().load('./images/ped1.png', () => this.loadTexture(this));
        this.e.ped1.flipY = false;

        this.textureArray.push("ped2");
        this.e.ped2 = new THREE.TextureLoader().load('./images/ped2.png', () => this.loadTexture(this));
        this.e.ped2.flipY = false;

        this.e.ped1.colorSpace = THREE.SRGBColorSpace;
        this.e.ped2.colorSpace = THREE.SRGBColorSpace;

        this.countit = 0;

        this.myObject1 = "ped";
        this.modelArray.push(this.myObject1);
        this.modelArray.push("items");
        this.manage = new THREE.LoadingManager();
        console.log("[LOADER] Creating LoadingManager...");
        this.manage.onLoad = () => {
            console.log("[LOADER] ===== LoadingManager onLoad called - all items loaded =====");
        };
        this.manage.onError = (url) => {
            console.error("[LOADER] ===== LoadingManager ERROR loading:", url, "=====");
        };
        this.manage.onProgress = (url, itemsLoaded, itemsTotal) => {
            console.log("[LOADER] LoadingManager progress:", itemsLoaded, "/", itemsTotal, "(", url, ")");
        };
        this.manage.onStart = (url, itemsLoaded, itemsTotal) => {
            console.log("[LOADER] LoadingManager onStart:", url, "Total items:", itemsTotal);
        };
        console.log("[LOADER] LoadingManager created with callbacks:", {
            onLoad: typeof this.manage.onLoad,
            onError: typeof this.manage.onError,
            onProgress: typeof this.manage.onProgress
        });

        console.log("[LOADER] Checking THREE and GLTFLoader...");
        console.log("[LOADER] THREE available:", typeof THREE !== 'undefined');
        console.log("[LOADER] THREE.GLTFLoader available:", typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined');
        if (typeof THREE === 'undefined' || !THREE.GLTFLoader) {
            console.error("GLTFLoader not found. Please ensure three.js and GLTFLoader are loaded");
            console.error("THREE:", typeof THREE !== 'undefined' ? THREE : 'undefined');
            console.error("THREE.GLTFLoader:", typeof THREE !== 'undefined' && THREE.GLTFLoader ? THREE.GLTFLoader : 'undefined');
            return;
        }

        console.log("[LOADER] Loading GLTF models...");
        console.log("[LOADER] Creating GLTFLoader instance with LoadingManager...");
        try {
            this.loader = new THREE.GLTFLoader(this.manage);
            console.log("[LOADER] GLTFLoader instance created successfully");
        } catch (error) {
            console.error("[LOADER] Error creating GLTFLoader:", error);
            return;
        }

        const loaderInstance = this;
        console.log("[LOADER] Starting ped.glb load...");
        console.log("[LOADER] File path: ./models/ped.glb");
        try {
            this.loader.load('./models/ped.glb', 
                (gltf) => {
                    console.log("[LOADER] ped.glb SUCCESS callback fired!");
                    console.log("[LOADER] ped.glb gltf object:", gltf);
                    console.log("[LOADER] ped.glb scene:", gltf.scene);
                    console.log("[LOADER] ped.glb scene children:", gltf.scene ? gltf.scene.children.length : 'no scene');
                    try {
                        gltf.scene.traverse(function(object) {
                            e.ped = gltf.scene;
                            if (object.isMesh) {
                                object.castShadow = true;
                                object.receiveShadow = true;
                                object.material.side = THREE.FrontSide;
                            }
                        });
                        console.log("[LOADER] ped.glb traverse complete");
                    } catch (error) {
                        console.error("[LOADER] Error traversing ped.glb scene:", error);
                    }
                    console.log("[LOADER] About to call managerLoad('ped')...");
                    console.log("[LOADER] loaderInstance:", loaderInstance);
                    console.log("[LOADER] loaderInstance.managerLoad:", typeof loaderInstance.managerLoad);
                    loaderInstance.managerLoad("ped");
                    console.log("[LOADER] managerLoad('ped') called");
                }, 
                (progress) => {
                    console.log("[LOADER] ped.glb PROGRESS callback fired");
                    console.log("[LOADER] ped.glb progress object:", progress);
                    console.log("[LOADER] ped.glb progress.lengthComputable:", progress.lengthComputable);
                    if (progress.lengthComputable) {
                        const percentComplete = progress.loaded / progress.total * 100;
                        console.log("[LOADER] ped.glb progress:", percentComplete.toFixed(2) + "% (" + progress.loaded + " / " + progress.total + " bytes)");
                    } else {
                        console.log("[LOADER] ped.glb progress: loaded =", progress.loaded, "total =", progress.total);
                    }
                }, 
                (error) => {
                    console.error("[LOADER] ped.glb ERROR callback fired!");
                    console.error("[LOADER] Error loading ped.glb:", error);
                    console.error("[LOADER] Error type:", typeof error);
                    console.error("[LOADER] Error message:", error ? error.message : 'no message');
                    console.error("[LOADER] Error stack:", error ? error.stack : 'no stack');
                }
            );
            console.log("[LOADER] ped.glb load() call completed");
        } catch (error) {
            console.error("[LOADER] Exception thrown while calling load() for ped.glb:", error);
        }

        console.log("[LOADER] Starting items.glb load...");
        console.log("[LOADER] File path: ./models/items.glb");
        try {
            this.loader.load('./models/items.glb', 
                (gltf) => {
                    console.log("[LOADER] items.glb SUCCESS callback fired!");
                    console.log("[LOADER] items.glb gltf object:", gltf);
                    console.log("[LOADER] items.glb scene:", gltf.scene);
                    console.log("[LOADER] items.glb scene children:", gltf.scene ? gltf.scene.children.length : 'no scene');
                    try {
                        const itemsRoot = gltf.scene;
                        itemsRoot.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                                child.material.side = THREE.FrontSide;
                            }
                        });
                        console.log("[LOADER] items.glb traverse complete");

                        this.e.itemObjects = [];
                        itemsRoot.children.forEach((itemGroup, index) => {
                            this.countit += 1;
                            const item = itemGroup.clone(true);
                            this.e.itemObjects.push(item);
                        });
                        console.log("[LOADER] items.glb processed", this.countit, "items");
                    } catch (error) {
                        console.error("[LOADER] Error processing items.glb:", error);
                    }
                    console.log("[LOADER] About to call managerLoad('items')...");
                    console.log("[LOADER] this:", this);
                    console.log("[LOADER] this.managerLoad:", typeof this.managerLoad);
                    loaderInstance.managerLoad("items");
                    console.log("[LOADER] managerLoad('items') called");
                }, 
                (progress) => {
                    console.log("[LOADER] items.glb PROGRESS callback fired");
                    console.log("[LOADER] items.glb progress object:", progress);
                    console.log("[LOADER] items.glb progress.lengthComputable:", progress.lengthComputable);
                    if (progress.lengthComputable) {
                        const percentComplete = progress.loaded / progress.total * 100;
                        console.log("[LOADER] items.glb progress:", percentComplete.toFixed(2) + "% (" + progress.loaded + " / " + progress.total + " bytes)");
                    } else {
                        console.log("[LOADER] items.glb progress: loaded =", progress.loaded, "total =", progress.total);
                    }
                }, 
                (error) => {
                    console.error("[LOADER] items.glb ERROR callback fired!");
                    console.error("[LOADER] Error loading items.glb:", error);
                    console.error("[LOADER] Error type:", typeof error);
                    console.error("[LOADER] Error message:", error ? error.message : 'no message');
                    console.error("[LOADER] Error stack:", error ? error.stack : 'no stack');
                }
            );
            console.log("[LOADER] items.glb load() call completed");
        } catch (error) {
            console.error("[LOADER] Exception thrown while calling load() for items.glb:", error);
        }
        console.log("[LOADER] All load() calls initiated");
    }
}

// ============================================================================
// SOUNDS CLASS
// ============================================================================

class Sounds {
    setUp(e) {
        this.e = e;
        this.soundArray = ["good", "bad", "clue", "pickup", "tick", "complete"];
        this.loadedSounds = [];

        for (var i = 0; i < this.soundArray.length; i++) {
            this.loadSounds(this.soundArray[i]);
        }
    }

    loadSounds(url) {
        var theSound = new Howl({
            src: ['../sounds/' + url + ".mp3"]
        });

        theSound.on('load', (event) => {
            theSound.name = url;
            this.loadedSounds.push(theSound);
        });
    }

    p(type) {
        if (this.e.muteState === false) {
            for (var i = 0; i < this.loadedSounds.length; i++) {
                if (this.loadedSounds[i].name === type) {
                    this.loadedSounds[i].play();
                }
            }
        }
    }
}

// ============================================================================
// UTILITIES CLASS
// ============================================================================

class Utilities {
    setUp(e) {
        this.e = e;
    }

    vectorToScreenPos2(ob, camera) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var widthHalf = width / 2, heightHalf = height / 2;
        var vector = ob.geometry.vertices[0].clone();
        vector.applyMatrix4(ob.matrixWorld);
        var pos = vector.clone();
        pos.project(camera);
        pos.x = (pos.x * widthHalf) + widthHalf;
        pos.y = -(pos.y * heightHalf) + heightHalf;
        var result = { x: pos.x, y: pos.y };
        return result;
    }

    vectorToScreenPos(ob, camera) {
        const screenPosition = new THREE.Vector3();
        ob.getWorldPosition(screenPosition);
        screenPosition.project(camera);

        if (screenPosition.x >= -1 && screenPosition.x <= 1 && screenPosition.y >= -1 && screenPosition.y <= 1 && screenPosition.z >= -1 && screenPosition.z <= 1) {
            const px = (screenPosition.x + 1) / 2 * window.innerWidth;
            const py = (-screenPosition.y + 1) / 2 * window.innerHeight;
            var result = { x: px, y: py };
        } else {
            var result = { x: 10000, y: 10000 };
        }
        return result;
    }

    vectorToScreenPosFixed(ob, camera, renderer) {
        const screenPosition = new THREE.Vector3();
        ob.getWorldPosition(screenPosition);
        screenPosition.project(camera);

        const width = renderer.domElement.width / window.devicePixelRatio;
        const height = renderer.domElement.height / window.devicePixelRatio;

        if (screenPosition.x >= -1 && screenPosition.x <= 1 && screenPosition.y >= -1 && screenPosition.y <= 1 && screenPosition.z >= -1 && screenPosition.z <= 1) {
            const px = (screenPosition.x + 1) / 2 * width;
            const py = (-screenPosition.y + 1) / 2 * height;
            var result = { x: px, y: py };
        } else {
            var result = { x: 10000, y: 10000 };
        }
        return result;
    }

    vectorToScreenPosLight(ob, camera) {
        const screenPosition = new THREE.Vector3();
        ob.getWorldPosition(screenPosition);
        screenPosition.project(camera);

        if (screenPosition.x >= -1 && screenPosition.x <= 1 && screenPosition.y >= -1 && screenPosition.y <= 1 && screenPosition.z >= -1 && screenPosition.z <= 1) {
            const px = (screenPosition.x + 1) / 2 * window.innerWidth;
            const py = (-screenPosition.y + 1) / 2 * window.innerHeight;
            var result = { x: px, y: py, d: true };
        } else {
            const px = (screenPosition.x + 1) / 2 * window.innerWidth;
            const py = (-screenPosition.y + 1) / 2 * window.innerHeight;
            var result = { x: px, y: py, d: false };
        }
        return result;
    }

    generateRandomColor() {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return `#${randomColor.padStart(6, '0')}`;
    }

    hexToRgb(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        return { r, g, b };
    }

    colorDistance(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        return Math.sqrt(
            Math.pow(rgb2.r - rgb1.r, 2) +
            Math.pow(rgb2.g - rgb1.g, 2) +
            Math.pow(rgb2.b - rgb1.b, 2)
        );
    }

    generateDistinctColors(numColors, minDistance = 50) {
        const colors = [];
        while (colors.length < numColors) {
            const newColor = this.generateRandomColor();
            let isDistinct = true;
            for (let i = 0; i < colors.length; i++) {
                if (this.colorDistance(newColor, colors[i]) < minDistance) {
                    isDistinct = false;
                    break;
                }
            }
            if (isDistinct) {
                colors.push(newColor);
            }
        }
        return colors;
    }

    generateRandomHexColor() {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return `#${randomColor.padStart(6, '0')}`;
    }

    lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    ca(ang) {
        var pi = Math.PI;
        return ang * (pi / 180);
    }

    ca2(ang) {
        var pi = Math.PI;
        return ang * (180 / pi);
    }

    ran(num) {
        var num1 = Math.random() * num;
        var num2 = Math.floor(num1);
        return num2;
    }

    nran(num) {
        var num1 = Math.random() * (num * 2);
        var num2 = Math.floor(num1 - num);
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

    ranArray(ar) {
        var r = this.ran(ar.length);
        var removeMe = ar[r];
        ar.splice(r, 1);
        return removeMe;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    testColors() {
        // Color testing code can be added if needed
    }

    inc(el, type, amount) {
        if (type === "opacity") {
            var theOpacity = parseFloat(el.style.opacity);
            if (theOpacity === "" || isNaN(theOpacity)) {
                theOpacity = 0;
            }
            theOpacity += amount;
            if (theOpacity > 1) {
                theOpacity = 1;
            }
            if (theOpacity < 0) {
                theOpacity = 0;
            }
            el.style.opacity = theOpacity + "";
        } else if (type === "top") {
            var theTop = parseFloat(el.style.top);
            console.log(el.style.top);
            if (theTop === "" || isNaN(theTop)) {
                theTop = 0;
            }
            theTop += amount;
            el.style.top = theTop + "";
        }
    }
}

// ============================================================================
// UI CLASS
// ============================================================================

class UI {
    setUp(e) {
        this.e = e;
    }

    load() {
        console.log("[UI] Loading UI images...");
        this.isLoaded_UI = true;
        console.log("[UI] UI images loaded!");
    }

    update() {
        // UI update logic
    }
}

// ============================================================================
// END SCORE CLASS
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
            const response = await fetch('./starScores.json');
            this.starThresholds = await response.json();
            console.log('Star thresholds loaded successfully:', this.starThresholds);
        } catch (error) {
            console.error('Failed to load star thresholds:', error);
            this.starThresholds = [0, 10000, 20000, 30000, 45000];
        }
    }

    createFinalScoreOverlay(scoreValue, statsArray = []) {
        if (!this.starThresholds) {
            console.log('Star thresholds not loaded yet, using fallback values');
            this.starThresholds = [0, 10000, 20000, 30000, 45000];
        }

        console.log('Creating final score overlay with score:', scoreValue, 'and thresholds:', this.starThresholds);

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

        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'finalScoreStar';
            star.innerHTML = '★';
            star.style.color = '#808080';

            const threshold = this.starThresholds ? this.starThresholds[i] : 0;
            const targetColor = (this.starThresholds && scoreValue >= threshold) ? '#FFD700' : '#808080';

            console.log(`Star ${i + 1}: Score ${scoreValue} >= Threshold ${threshold} = ${scoreValue >= threshold} -> ${targetColor}`);

            star.dataset.targetColor = targetColor;
            starDiv.appendChild(star);
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

        // Set scoreText to be visible immediately without animation
        scoreText.style.opacity = "1";
        scoreText.style.transform = "scale(1)";

        setTimeout(() => {
            const contentHeight = contentContainer.offsetHeight;
            const finalTop = (viewportHeight - contentHeight) / 2;

            console.log("viewportHeight: " + viewportHeight);
            console.log("scoreTextHeight: " + scoreTextHeight);
            console.log("contentHeight: " + contentHeight);
            console.log("initialTop: " + initialTop);
            console.log("finalTop: " + finalTop);

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

                this.createSparks(star, 16, 4, 100);

                if (this.e && this.e.s) {
                    // this.e.s.p('brightClick');
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

// ============================================================================
// SCENE CLASS
// ============================================================================

class Scene {
    setUp(e) {
        this.e = e;
        console.log("startme");
    }

    buildScene() {
        this.mainCont = new THREE.Group();
        this.e.scene3D.add(this.mainCont);
        
        this.difficulty = 'hard';

        this.dl_shad = new THREE.DirectionalLight(0xffffff, 1.1);
        this.dl_shad.position.x = 12 * 3;
        this.dl_shad.position.z = -26 * 3;
        this.dl_shad.position.y = 26 * 3;
        this.mainCont.add(this.dl_shad);

        this.dl_shad.castShadow = true;
        this.dl_shad.shadow.mapSize.width = 4096;
        this.dl_shad.shadow.mapSize.height = 4096;

        this.e.sSize = 11;
        this.dl_shad.shadow.camera.near = 0.1;
        this.dl_shad.shadow.camera.far = 180;
        this.dl_shad.shadow.camera.left = -this.e.sSize;
        this.dl_shad.shadow.camera.right = this.e.sSize;
        this.dl_shad.shadow.camera.top = this.e.sSize;
        this.dl_shad.shadow.camera.bottom = -this.e.sSize;
        this.dl_shad.shadow.radius = 2;
        this.dl_shad.shadow.bias = -0.0001;

        this.ambLight = new THREE.AmbientLight(0xffffff, 2);
        this.mainCont.add(this.ambLight);

        // CANNON World
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);

        // Note: cannon-es-debugger removed - comment out if needed for debugging
        // if (typeof cannonDebugger !== 'undefined') {
        //     this.cannonDebug = cannonDebugger(this.e.scene3D, this.world, { color: 0xff0000 });
        // }

        // Floor
        const floorMaterial = new CANNON.Material("backboardMaterial");
        floorMaterial.restitution = 0.8;
        floorMaterial.friction = 0;

        this.floorShape = new CANNON.Plane();
        this.floorBody = new CANNON.Body({ mass: 0, shape: this.floorShape, material: floorMaterial });
        this.floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(this.floorBody);

        // Roof
        this.roofShape = new CANNON.Box(new CANNON.Vec3(5 / 2, 0.1, 10 / 2));
        this.roofBody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(0, 20, 0) });
        this.roofBody.addShape(this.roofShape);
        this.world.addBody(this.roofBody);

        this.geometry = new THREE.PlaneGeometry(8, 16);
        this.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.floorPlane = new THREE.Mesh(this.geometry, this.material);
        this.mainCont.add(this.floorPlane);
        this.floorPlane.rotation.x = this.e.u.ca(-90);
        this.floorPlane.receiveShadow = true;

        // Walls
        this.boxShape = new CANNON.Box(new CANNON.Vec3(.1, 15, 5));
        this.boxBody = new CANNON.Body({ mass: 0, shape: this.boxShape, position: new CANNON.Vec3(2.5, 0, 0) });
        this.boxBody.bType = "wall";

        this.boxShape = new CANNON.Box(new CANNON.Vec3(.1, 15, 5));
        this.boxBody = new CANNON.Body({ mass: 0, shape: this.boxShape, position: new CANNON.Vec3(-2.5, 0, 0) });
        this.boxBody.bType = "wall";

        this.boxShape = new CANNON.Box(new CANNON.Vec3(2.5, 15, .1));
        this.boxBody = new CANNON.Body({ mass: 0, shape: this.boxShape, position: new CANNON.Vec3(0, 0, 5) });
        this.boxBody.bType = "wall";

        this.boxShape = new CANNON.Box(new CANNON.Vec3(2.5, 15, .1));
        this.boxBody = new CANNON.Body({ mass: 0, shape: this.boxShape, position: new CANNON.Vec3(0, 0, -5) });
        this.boxBody.bType = "wall";

        // Matchers
        this.matcher1 = this.e.ped.clone();
        this.matcher1.position.x = -.65;
        this.matcher1.position.y = -.1;
        this.matcher1.position.z = 4.25;
        this.mainCont.add(this.matcher1);
        this.matcher1.receiveShadow = true;
        this.matcher1.scale.x = this.matcher1.scale.z = .6;

        this.matcher1.traverse((object) => {
            if (object.isMesh) {
                this.matcherMat1 = new THREE.MeshStandardMaterial({ color: 0xffffff, map: this.e.ped1 });
                object.material = this.matcherMat1;
            }
        });

        this.matcher2 = this.e.ped.clone();
        this.matcher2.position.x = .65;
        this.matcher2.position.y = -.1;
        this.matcher2.position.z = 4.25;
        this.mainCont.add(this.matcher2);
        this.matcher2.receiveShadow = true;
        this.matcher2.scale.x = this.matcher2.scale.z = .6;

        this.matcher2.traverse((object) => {
            if (object.isMesh) {
                this.matcherMat2 = new THREE.MeshStandardMaterial({ color: 0xffffff, map: this.e.ped2 });
                object.material = this.matcherMat2;
            }
        });

        // Objects
        this.matchObs = [];
        this.lockHeight = .2;

        this.addItemWithCollider = (item3D, position = new THREE.Vector3(0, 1, 0)) => {
            const itemGroup = item3D.clone(true);
            itemGroup.name = item3D.name;
            this.is = 5;
            itemGroup.scale.set(this.is, this.is, this.is);
            this.mainCont.add(itemGroup);
            itemGroup.position.copy(position);

            const bbox = new THREE.Box3().setFromObject(itemGroup);
            const size = new THREE.Vector3();
            bbox.getSize(size);

            const helperGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
            const helperMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
            const helper = new THREE.Mesh(helperGeometry, helperMaterial);
            helper.name = "boxHelper";
            itemGroup.boxHelper = helper;

            const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
            const boxShape = new CANNON.Box(halfExtents);

            const body = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(position.x, position.y, position.z),
                shape: boxShape
            });

            body.linearDamping = 0.5;
            body.angularDamping = 0.9;
            body.velocity.set(0, 0, 0);
            body.angularVelocity.set(0, 0, 0);

            this.world.addBody(body);
            itemGroup.cannonBody = body;

            return itemGroup;
        };

        // Vars
        this.dragging = false;
        this.selectedObject = null;
        this.mouseOffset = new THREE.Vector3(0, 0, 0);
        this.dragPlane = new THREE.Plane();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.startVars();

        this.time = 120;
        this.partTime = 0;
        this.lockHeight = .2;
        this.bonusPerc = 0;
        this.streak = 1;
        this.longestStreak = 1;
        this.matchLock1 = undefined;
        this.matchLock2 = undefined;
        this.tutorialFirstMatchMade = false;
        this.action = "zoom fixer";
        this.showFirstTarget = true;
        this.showFirstTargetTime = 15;

        // Listeners
        window.addEventListener('keydown', (event) => {
            if (event.key === 'f' || event.key === 'F') {
                this.applyRandomPhysics();
            }
        });

        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        window.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        window.addEventListener('touchend', this.onTouchEnd.bind(this));

        this.upperLeftDiv = document.getElementById("upperLeftDiv");
        this.upperRightDiv = document.getElementById("upperRightDiv");

        const targetDiv = document.getElementById("targetDiv");

        this.setupDifficultyButtons();
        this.setupTutorialButtons();

        this.scoreBase = 0;
        this.scoreTargetBonus = 0;
        this.scoreBonus = 0;
        this.regularMatches = 0;
        this.targetMatches = 0;

        this.setupTargetDisplay();
    }

    setupDifficultyButtons() {
        const tutorialBtn = document.getElementById("tutorialBut");
        const playBtn = document.getElementById("playButton");

        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', () => {
                this.setDifficulty('tutorial');
                if (this.difficulty === 'tutorial') {
                    this.action = "tutorial_start";
                } else {
                    this.action = "start game";
                }
            });
            tutorialBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.setDifficulty('tutorial');
                if (this.difficulty === 'tutorial') {
                    this.action = "tutorial_start";
                } else {
                    this.action = "start game";
                }
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                console.log("[UI] Play button clicked, current action:", this.action);
                this.setDifficulty('hard');
                this.e.startGame();
                console.log("[UI] Setting action to 'start game'");
                this.action = "start game";
                console.log("[UI] Action set to:", this.action);
            });
            playBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                console.log("[UI] Play button touched, current action:", this.action);
                this.setDifficulty('hard');
                this.e.startGame();
                console.log("[UI] Setting action to 'start game'");
                this.action = "start game";
                console.log("[UI] Action set to:", this.action);
            });
        }
    }

    setDifficulty(difficulty) {
        if (this.action !== "start") return;
        this.difficulty = difficulty;
        if (this.difficulty !== "hard") {
            this.unloadItems();
            this.loadItems();
        }
    }

    unloadItems() {
        if (this.matchObs) {
            this.matchObs.forEach(matchOb => {
                if (matchOb.threeCube) {
                    this.mainCont.remove(matchOb.threeCube);
                    if (matchOb.boxBody) {
                        this.world.removeBody(matchOb.boxBody);
                    }
                }
            });
            this.matchObs = [];
        }
    }

    loadItems() {
        let numberOfPairs;
        switch (this.difficulty) {
            case 'tutorial':
                numberOfPairs = 5;
                break;
            case 'easy':
                numberOfPairs = 30;
                break;
            case 'hard':
                numberOfPairs = 52;
                break;
            default:
                numberOfPairs = 52;
        }

        this.numberOfPairs = numberOfPairs;
        console.log(`Loading ${numberOfPairs} pairs for ${this.difficulty} difficulty`);

        const shuffledItems = [...this.e.itemObjects];
        this.shuffleArray(shuffledItems);

        const selectedItems = shuffledItems.slice(0, this.numberOfPairs);
        this.gameObjects = selectedItems;

        const viewportLimits = this.calculateViewportLimits();
        console.log("Viewport limits for spawning:", viewportLimits);

        for (let i = 0; i < selectedItems.length; i++) {
            for (let j = 0; j < 2; j++) {
                const matchOb = {};
                const spawnWidth = (viewportLimits.right - viewportLimits.left) * 0.6;
                const spawnCenter = (viewportLimits.right + viewportLimits.left) / 2;

                let x;
                if (isNaN(spawnWidth) || isNaN(spawnCenter) || spawnWidth <= 0) {
                    console.log("Invalid spawn parameters, using fallback");
                    x = Math.random() * 4 - 2;
                } else {
                    x = (Math.random() - 0.5) * spawnWidth + spawnCenter;
                }
                const y = Math.random() * 14 + 2;
                const z = Math.random() * (viewportLimits.top - viewportLimits.bottom) + viewportLimits.bottom;
                const object = this.addItemWithCollider(selectedItems[i], new THREE.Vector3(x, y, z));
                matchOb.boxBody = object.cannonBody;
                matchOb.threeCube = object;
                matchOb.threeCube.cannonBody = matchOb.boxBody;
                matchOb.threeCube.parentOb = matchOb;
                matchOb.threeCube.castShadow = true;
                matchOb.threeCube.receiveShadow = true;
                matchOb.sn = i;
                matchOb.isLocked = 0;
                this.matchObs.push(matchOb);
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    applyRandomPhysics() {
        for (let i = 0; i < this.matchObs.length; i++) {
            this.matchOb = this.matchObs[i];
            const randomForce = new CANNON.Vec3(
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50
            );
            this.matchOb.boxBody.applyForce(randomForce, this.matchOb.boxBody.position);
        }
    }

    threeCopy(cannonShape, cannonBody, color = 0x333333) {
        const scale = cannonShape.halfExtents;
        const width = scale.x * 2;
        const height = scale.y * 2;
        const depth = scale.z * 2;

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const cube = new THREE.Mesh(geometry, material);

        cube.position.copy(cannonBody.position);
        this.mainCont.add(cube);

        return cube;
    }

update() {
        // Log action every frame (but throttle it)
        if (!this._actionLogCounter) this._actionLogCounter = 0;
        this._actionLogCounter++;
        if (this._actionLogCounter % 60 === 0) { // Log every 60 frames (~1 second at 60fps)
            console.log("[ENGINE] Current action:", this.action);
        }

        if(this.action==="zoom fixer"){

            this.gl = 5.3;

           // Identify four points near the edges of the play area
            const wallPoints = [
                new THREE.Vector3(-this.gl/2, 0, 0), // left
                new THREE.Vector3(this.gl/2, 0, 0),  // right
                new THREE.Vector3(0, 0, -this.gl),   // bottom
                new THREE.Vector3(0, 0, this.gl),    // top
            ];

            let allVisible = true;
            for (let i = 0; i < wallPoints.length; i++) {
                const worldPos = wallPoints[i].clone();
                const screenPos = this.e.u.vectorToScreenPosFixed({ getWorldPosition: (target) => target.copy(worldPos) }, this.e.camera, this.e.renderer);
                
                if (
                    screenPos.x < 0 || screenPos.x > window.innerWidth ||
                    screenPos.y < 0 || screenPos.y > window.innerHeight
                ) {
                    allVisible = false;
                    break;
                }
            }

            if (!allVisible) {
                this.e.camera.position.z += 0.2;
            } else {
                // Camera positioning complete - now spawn objects with correct viewport bounds
                this.loadItems();
                
                // Fade in the UI
                // const fader = document.getElementById("fader");
                // if (fader) {
                    // fader.style.opacity = "1";
                    // gsap.to(fader, { opacity: 0, duration: 1, ease: "linear" });
                // }
                document.getElementById("loadingBack").style.opacity = "1";
                gsap.to(document.getElementById("loadingBack"), { opacity: 0, duration: 1, delay: 1, ease: "linear" });
                
                console.log("[ENGINE] Action changing: zoom fixer -> start");
                this.action = "start";
                console.log("[ENGINE] Action changed to:", this.action);
            }

            
        }else if(this.action==="start"){

            this.setupDifficultyButtons();

        }else if(this.action==="zoom fixer"){


        }else if(this.action==="start game"){

            console.log("[ENGINE] In 'start game' action, playing start sound");
            
            // Hide the start menu
            const startMenu = document.getElementById("startMenu");
            const startMenuContainer = document.getElementById("startMenuContainer");
            
            if (startMenuContainer) {
                startMenuContainer.style.transition = 'opacity 0.3s ease-out';
                startMenuContainer.style.opacity = '0';
                console.log("[ENGINE] Fading out start menu container");
            }

            setTimeout(() => {
                if (startMenu) {
                    startMenu.style.display = 'none';
                    console.log("[ENGINE] Start menu hidden");
                }
            }, 300);

            // this.e.s.p("start");

            this.levelStartTime = performance.now();
            
            // Reset mega match state for new game
            this.megaMatchesAllowed = true;
            
            // // Show the target display (it might have been hidden in previous game)
            // const targetDiv = document.getElementById("targetDiv");
            // if (targetDiv) {
            //     targetDiv.style.display = "block";
            // }

            // Change action to "game" to allow gameplay
            console.log("[ENGINE] Action changing: start game -> game");
            this.action = "game";
            console.log("[ENGINE] Action changed to:", this.action);

        }else if(this.action==="game"){

            this.showFirstTargetTime-=this.e.dt;
            
            if (this.showFirstTarget===true && this.showFirstTargetTime<=0){

                this.selectNewTargetObject();

            } 
             
            this.partTime+=this.e.dt;
            if(this.partTime>15){

                // Set levelScore and matchScores for breadcrumb (like temp files)
                this.levelScore = this.currentIntervalScore;
                this.matchScores = this.currentIntervalMatchScores;
                this.breadCrumb();
                this.partTime=0;
                this.part+=1;
                
                // Reset for next interval
                this.currentIntervalScore = 0;
                this.currentIntervalMatchScores = [];
                this.resetBreadCrumbTempData();

            }

            if(this.bonusPerc>0){

                this.streak2=this.streak;

                if(this.streak>5){
                    this.streak2=5;
                }

                this.bonusPerc-=(this.streak2*5)*this.e.dt;
            }
    
            if(this.bonusPerc<=0 && this.streak!==1){
                this.bonusPerc=0;
                this.streak=1;
                this.e.s.p("bad")
                this.showStreakBrokenAnimation();
            }
    
            document.getElementById("bonusText2").innerHTML="x"+this.streak;
            document.getElementById("innerBar").style.width=this.bonusPerc+"%";
    
            this.time-=this.e.dt;

            const currentSecond = Math.floor(this.time);

            // Check if we've crossed the 30-second threshold
            if (currentSecond < 30 && this.megaMatchesAllowed) {
                this.megaMatchesAllowed = false;
                console.log("Mega matches no longer allowed - less than 30 seconds remaining");
                
                // Hide the target display since no more mega matches will be assigned
                const targetDiv = document.getElementById("targetDiv");
                if (targetDiv) {
                    targetDiv.style.display = "none";
                }
            }

            if (currentSecond <= 20 && currentSecond > 0 && currentSecond !== this.lastTickSecond) {
                this.lastTickSecond = currentSecond;
                this.e.s.p("tick");
            }

            if(this.time<=0){

                if(this.selectedObject!==null){

                    this.selectedObject.cannonBody.wakeUp();
                    this.selectedObject.cannonBody.velocity.set(0, 0, 0);
                    this.selectedObject.cannonBody.angularVelocity.set(0, 0, 0);
                    this.selectedObject.cannonBody.sleep();
                    this.selectedObject = null;
    
                }
                
                gsap.killTweensOf(document.getElementById("fader"));
                document.getElementById("fader").style.opacity = .7;
                gsap.to(document.getElementById("fader"), { opacity: 0, duration: 1, ease: "linear"});

                // this.e.s.p("finish");

                document.getElementById("upperLeftDiv").style.opacity=0;
                document.getElementById("upperRightDiv").style.opacity=0;

                // Display time bonus if all items were matched
                if (this.timeLeftBonus && this.secondsLeft) {
                    // Add time bonus to total score
                    this.score += this.timeLeftBonus;
                    // Also add to current interval for breadcrumb tracking
                    this.currentIntervalScore += this.timeLeftBonus;
                    this.currentIntervalMatchScores.push(this.timeLeftBonus);
                }

                // Create final score overlay using endScore.js
                const statsArray = [
                    ["Regular Matches", this.regularMatches || 0],
                    ["Multiplier Bonus", this.scoreBonus || 0],
                    ["Megamatches", this.targetMatches || 0],
                    ["Megamatch Bonus", this.scoreTargetBonus || 0],
                    ["Time Left Bonus", this.timeLeftBonus || 0],
                    ["Longest Streak", this.longestStreak || 1]
                ];
                
                this.e.endScore.createFinalScoreOverlay(this.score, statsArray);
                
                // Set final levelScore and matchScores for validation breadcrumb (like temp files)
                this.levelScore = this.currentIntervalScore;
                this.matchScores = this.currentIntervalMatchScores;
                this.breadCrumb("validate");
                
                // Calculate stars earned based on score using EndScore thresholds
                let starsEarned = 0;
                if (this.e.endScore && this.e.endScore.starThresholds) {
                    const thresholds = this.e.endScore.starThresholds;
                    for (let i = thresholds.length - 1; i >= 0; i--) {
                        if (this.score >= thresholds[i]) {
                            starsEarned = i + 1;
                            break;
                        }
                    }
                } else {
                    // Fallback to hardcoded thresholds
                    starsEarned = calculateLostAndFoundStarsFromScore(this.score);
                }
                
                console.log('[LostAndFound] Calculated stars:', starsEarned, 'for score:', this.score);
                
                // Save game result
                saveLostAndFoundGameResult(this.score, starsEarned);
                
                this.action="over"
            }

            // Update UI displays
            const scoreDisplayEl = document.getElementById('scoreDisplay');
            if (scoreDisplayEl) scoreDisplayEl.textContent = Math.round(this.score);
            const timeDisplayEl = document.getElementById('timeDisplay');
            if (timeDisplayEl) timeDisplayEl.textContent = this.formatTime(this.time);

        }else if(this.action==="set target pause"){

            gsap.killTweensOf(document.getElementById("fader"));
            document.getElementById("fader").style.opacity = .5;
            gsap.to(document.getElementById("fader"), { opacity: 0, duration: .5, ease: "linear"});

            document.getElementById("pauseOverlay").style.display="flex";
            document.getElementById("faderBlack").style.opacity=.8;
            document.getElementById("pauseItemName").innerHTML=this.targetObject.name.replace(/[_-]/g, ' ');
            
            // Add flashing animation to subtitle
            const pauseSubtitle = document.getElementById("pauseSubtitle");
            if (pauseSubtitle) {
                pauseSubtitle.classList.add("flash-animation");
            }

            if(this.showFirstTarget===true){
                // this.showFirstTarget=false;
                this.e.s.p("clue");
                this.count=4;
            }else{
                this.count=2.25;
            }

            this.action="target pause"

        }else if(this.action==="target pause"){

            document.getElementById("pauseResume").innerHTML="RESUME IN "+Math.ceil(this.count);

            this.count-=this.e.dt;

            if(this.count<=0){

                //add +5 second overlay here
                if(this.targetMatches<10){
                    
                    if(this.showFirstTarget===true){
                        this.showFirstTarget=false;
                    }else{
                        this.showTimeBonusAnimation();
                    }

                }

                document.getElementById("pauseOverlay").style.display="none";
                document.getElementById("faderBlack").style.opacity=0;
                
                // Remove flashing animation
                const pauseSubtitle = document.getElementById("pauseSubtitle");
                if (pauseSubtitle) {
                    pauseSubtitle.classList.remove("flash-animation");
                }
                
                this.action="game";

            }

        }

        if (this.dragging && this.selectedObject) {

            this.raycaster.setFromCamera(this.mouse, this.e.camera);
            const intersectPoint = new THREE.Vector3();

            if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)) {
                this.selectedObject.cannonBody.position.copy(intersectPoint.add(this.mouseOffset));
                this.selectedObject.position.copy(this.selectedObject.cannonBody.position);
            }

        }

        // Step physics simulation
        if (this.world) {
            this.world.step(1 / 60);

            // Calculate viewport-based bounds for physics
            const viewportLimits = this.calculateViewportLimits();
            const bounds = { 
                x: Math.abs(viewportLimits.right), // Use the larger of left/right for symmetric bounds
                z: Math.abs(viewportLimits.top) // Use viewport-based top limit
            };

            for (let i = 0; i < this.matchObs.length; i++) {
                const mo = this.matchObs[i];
                if (!mo.boxBody) continue;

                const p = mo.boxBody.position;

                // Clamp to viewport-based bounds
                p.x = Math.max(viewportLimits.left, Math.min(viewportLimits.right, p.x));
                p.z = Math.max(viewportLimits.bottom, Math.min(viewportLimits.top, p.z));

                // Limit excessive velocity
                mo.boxBody.velocity.x = THREE.MathUtils.clamp(mo.boxBody.velocity.x, -5, 5);
                mo.boxBody.velocity.z = THREE.MathUtils.clamp(mo.boxBody.velocity.z, -5, 5);
            }

            for (var i = 0; i < this.matchObs.length; i++) {
                this.matchOb = this.matchObs[i];

                if(this.matchOb.boxBody!==undefined){

                    // make box fly back if too far back
                    if (this.matchOb.boxBody.position.z > 3.25 && this.matchOb.isLocked===0) {
                        const force = new CANNON.Vec3(0, 0, -150);
                        this.matchOb.boxBody.applyForce(force, this.matchOb.boxBody.position);
                        this.matchOb.boxBody.angularVelocity.set(0, 0, 0);
                    }

                    // Reset objects that fall through floor or go above ceiling
                    if (this.matchOb.boxBody.position.y < -5 || this.matchOb.boxBody.position.y > 25) {
                        console.log(`Resetting object ${this.matchOb.threeCube.name} from Y position ${this.matchOb.boxBody.position.y}`);
                        
                        // Reset to safe position
                        this.matchOb.boxBody.position.y = 10;
                        this.matchOb.boxBody.position.x = (Math.random() - 0.5) * 4; // Random X position
                        this.matchOb.boxBody.position.z = (Math.random() - 0.5) * 4; // Random Z position
                        
                        // Reset velocity
                        this.matchOb.boxBody.velocity.set(0, 0, 0);
                        this.matchOb.boxBody.angularVelocity.set(0, 0, 0);
                    }

                    // make the cube go to the box
                    if (this.matchOb.boxBody && !this.matchOb.removeMe) {
                        this.matchOb.threeCube.position.copy(this.matchOb.boxBody.position);
                        this.matchOb.threeCube.quaternion.copy(this.matchOb.boxBody.quaternion);
                        if (this.matchOb.threeCube.boxHelper) {
                            this.matchOb.threeCube.boxHelper.position.copy(this.matchOb.boxBody.position);
                            this.matchOb.threeCube.boxHelper.quaternion.copy(this.matchOb.boxBody.quaternion);
                        }
                    }

                    // lock set
                    if(this.matchOb.isLocked!==0){

                        this.matchOb.boxBody.velocity.set(0, 0, 0);
                        this.matchOb.boxBody.angularVelocity.set(0, 0, 0);

                        if(this.matchOb.isLocked===1){
                            this.matchOb.boxBody.position.x = this.matcher1.position.x;
                            this.matchOb.boxBody.position.y = this.lockHeight;
                            this.matchOb.boxBody.position.z = this.matcher1.position.z;
                        }else if(this.matchOb.isLocked===2){
                            this.matchOb.boxBody.position.x = this.matcher2.position.x;
                            this.matchOb.boxBody.position.y = this.lockHeight;
                            this.matchOb.boxBody.position.z = this.matcher2.position.z;
                        }

                        this.matchOb.boxBody.quaternion.set(0, 0, 0, 1);

                    }

                    // removal
                    if(this.matchOb.removeMe===true){

                        this.matchOb.removeMeTime-=this.e.dt;

                        if(this.matchOb.removeMeTime<=0){

                            this.matchOb.boxBody.position.z=100;

                            this.world.removeBody(this.matchOb.boxBody);
                            this.matchOb.boxBody=undefined;
        
                        }

                    }

                    // actions
                    if(this.matchOb.action==="moving"){

                        this.matchOb.count+=this.e.dt;
                        if(this.matchOb.count>.25){

                            if (this.matchOb.target === 1){

                                this.matchOb.isLocked = 1;
                                this.matchLock1 = this.matchOb;

                            }else if (this.matchOb.target === 2){

                                this.matchOb.isLocked = 2;
                                this.matchLock2 = this.matchOb;

                            }

                            this.matchOb.count=0;
                            this.matchOb.action="";

                        }

                    }

                }

            }
        }

        if(this.matchLock1!==undefined && this.matchLock2!==undefined){

            if(this.matchLock1.sn === this.matchLock2.sn){

                this.matchLock1.isLocked=5;
                this.matchLock2.isLocked=5;

                gsap.to(this.matchLock1.threeCube.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: "power2.out"});
                gsap.to(this.matchLock2.threeCube.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: "power2.out"});

                this.matchLock1.removeMe=true;
                this.matchLock2.removeMe=true;

                this.matchLock1.removeMeTime=.6;
                this.matchLock2.removeMeTime=.6;

                this.e.s.p("good");

                this.bonusPerc=100;
                this.streak+=1;
                
                // Update longest streak if current streak is higher
                if (this.streak > this.longestStreak) {
                    this.longestStreak = this.streak;
                }
                
                document.getElementById("fader").style.opacity = .2;
                gsap.to(document.getElementById("fader"), { opacity: 0, duration: 0.3, ease: "linear"});

                this.matches+=1;
                
                this.matchedObjects.add(this.matchLock1.threeCube.name);

                const targetDiv = document.getElementById("targetDiv");

                if (this.matchLock1 && this.matchLock2 && this.matchLock1.threeCube && this.matchLock2.threeCube) {
                    
                    if (this.targetObject && (this.matchLock1.threeCube.name === this.targetObject.name || this.matchLock2.threeCube.name === this.targetObject.name)) {
                        
                        this.scoreAdd = 400*this.streak;

                        this.scoreTargetBonus+=400*(this.streak-1);
                        this.targetMatches+=1;
                        
                        // Add 5 seconds to the time
                        if(this.targetMatches<10){
                            this.time += 5;
                        }

                        if(this.targetMatches>=10){
                            this.megaMatchesAllowed=false;
                        }
                        
                        // this.e.s.p("bonus1");

                        // Only select new target if mega matches are still allowed
                        if (this.megaMatchesAllowed) {
                            this.selectNewTargetObject();
                            targetDiv.textContent = `MEGA: ${this.targetObject.name.replace(/[_-]/g, ' ')}`;
                        } else {
                            // Hide the target display since no more mega matches will be assigned
                            targetDiv.style.display = "none";
                            console.log("Last mega match completed - hiding target display");
                            this.showTimeBonusAnimation();
                        }
                        
                    } else {

                        this.scoreBase+=100;
                        this.scoreBonus+=100*(this.streak-1);
                        this.regularMatches+=1;

                        this.scoreAdd = 100*this.streak; // Normal points

                    }

                } else {

                    this.scoreBase+=100;
                    this.scoreBonus+=100*(this.streak-1);
                    this.regularMatches+=1;

                    this.scoreAdd = 100*this.streak; // Normal points

                }
                
                this.score+=this.scoreAdd;
                this.levelScore+=this.scoreAdd;
                this.gameScores.push(this.scoreAdd);
                
                // Track for breadcrumb system (like temp files)
                this.currentIntervalScore += this.scoreAdd;
                this.currentIntervalMatchScores.push(this.scoreAdd);
                this.matchScores.push(this.scoreAdd);

                // Check for tutorial first match
                if (this.action === "tutorial_playing" && !this.tutorialFirstMatchMade) {
                    this.tutorialFirstMatchMade = true;
                    this.action = "tutorial_paused";
                    const tutorialDiv2 = document.getElementById("tutorialDiv2");
                    if (tutorialDiv2) {
                        tutorialDiv2.style.display = "block";
                    }
                }

                this.matchLock1=undefined;
                this.matchLock2=undefined;

                // Check if all items are matched
                this.checkAllItemsMatched();

            }

        }

    }

    setupTutorialButtons() {
        const tutorialContinue1 = document.getElementById("tutorialContinue1");
        const tutorialContinue2 = document.getElementById("tutorialContinue2");

        if (tutorialContinue1) {
            tutorialContinue1.addEventListener('click', () => {
                this.continueTutorial1();
            });
            tutorialContinue1.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.continueTutorial1();
            });
        }
        if (tutorialContinue2) {
            tutorialContinue2.addEventListener('click', () => {
                this.continueTutorial2();
            });
            tutorialContinue2.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.continueTutorial2();
            });
        }
    }

    continueTutorial1() {
        const tutorialDiv1 = document.getElementById("tutorialDiv1");
        if (tutorialDiv1) {
            tutorialDiv1.style.display = "none";
        }
        this.action = "tutorial_playing";
    }

    continueTutorial2() {
        const tutorialDiv2 = document.getElementById("tutorialDiv2");
        if (tutorialDiv2) {
            tutorialDiv2.style.display = "none";
        }
        this.action = "game";
    }


    checkAllItemsMatched() {
        // Count how many items are still in the game (not removed)
        let activeItems = 0;
        for (let i = 0; i < this.matchObs.length; i++) {
            const matchOb = this.matchObs[i];
            if (matchOb.boxBody && !matchOb.removeMe) {
                activeItems++;
            }
        }
        
        // If no active items remain, all items have been matched
        if (activeItems === 0) {
            console.log("All items matched! Ending game...");
            
            // Calculate time bonus
            const secondsLeft = Math.floor(this.time);
            const timeBonus = secondsLeft * 300;
            
            // Store time bonus for final display
            this.timeLeftBonus = timeBonus;
            this.secondsLeft = secondsLeft;
            
            console.log(`Time bonus: ${secondsLeft} seconds × 300 = ${timeBonus} points`);
            
            this.time = 0; // Set timer to 0 to trigger game end
        }
    }

    formatTime(seconds) {
        if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
            seconds = 0;
        }
    
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const paddedSecs = secs < 10 ? '0' + secs : secs;
    
        return `${minutes}:${paddedSecs}`;
    }

    onTouchStart(event) {

        // console.log("start")
        event.preventDefault();  // Prevent default touch behavior (like zoom)
        
        // Handle start game action
        // if(this.action==="start"){
        //     this.action="start game"
        //     return;
        // }
        
        if (event.touches.length === 1) { // Single touch
            this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            console.log("Touch start - action:", this.action, "isTablet:", this.e.isTablet);
            this.onMouseDown(event);
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (event.touches.length === 1) { // Single touch
            this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            this.onMouseMove(event);
        }
    }
    
    onTouchEnd(event) {
        event.preventDefault();
        event.stopPropagation();
        this.onMouseUp(event);
    }

    calculateViewportLimits() {
        try {
            // Create a plane at the same Y level as the dragged object
            const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            
            // For desktop, constrain to mobile-like width (similar to 375px mobile screen)
            let leftScreenPos, rightScreenPos;

            if (this.e.isTablet === true) {

                leftScreenPos = new THREE.Vector3(-1, 0, 0); // Left edge of screen
                rightScreenPos = new THREE.Vector3(1, 0, 0); // 

            }else if (this.e.mobile === false) {

                // Calculate mobile-like bounds (approximately 375px width centered on screen)
                const mobileWidth = 500;
                const screenWidth = window.innerWidth;
                const leftBound = (screenWidth - mobileWidth) / 2 / screenWidth;
                const rightBound = (screenWidth + mobileWidth) / 2 / screenWidth;
                
                // Convert to normalized device coordinates (-1 to 1)
                leftScreenPos = new THREE.Vector3(leftBound * 2 - 1, 0, 0);
                rightScreenPos = new THREE.Vector3(rightBound * 2 - 1, 0, 0);

            } else {

                leftScreenPos = new THREE.Vector3(-1, 0, 0); // Left edge of screen
                rightScreenPos = new THREE.Vector3(1, 0, 0); // Right edge of screen

            }
            
            const topScreenPos = new THREE.Vector3(0, 1, 0); // Top edge of screen
            const bottomScreenPos = new THREE.Vector3(0, -1, 0); // Bottom edge of screen
            
            // Convert screen coordinates to world coordinates using raycaster
            const leftRaycaster = new THREE.Raycaster();
            const rightRaycaster = new THREE.Raycaster();
            const topRaycaster = new THREE.Raycaster();
            const bottomRaycaster = new THREE.Raycaster();
            
            leftRaycaster.setFromCamera(leftScreenPos, this.e.camera);
            rightRaycaster.setFromCamera(rightScreenPos, this.e.camera);
            topRaycaster.setFromCamera(topScreenPos, this.e.camera);
            bottomRaycaster.setFromCamera(bottomScreenPos, this.e.camera);
            
            const leftIntersectPoint = new THREE.Vector3();
            const rightIntersectPoint = new THREE.Vector3();
            const topIntersectPoint = new THREE.Vector3();
            const bottomIntersectPoint = new THREE.Vector3();
            
            // Intersect with the drag plane to get world coordinates
            const leftIntersects = leftRaycaster.ray.intersectPlane(dragPlane, leftIntersectPoint);
            const rightIntersects = rightRaycaster.ray.intersectPlane(dragPlane, rightIntersectPoint);
            const topIntersects = topRaycaster.ray.intersectPlane(dragPlane, topIntersectPoint);
            const bottomIntersects = bottomRaycaster.ray.intersectPlane(dragPlane, bottomIntersectPoint);
            
            // Check if intersections are valid
            if (!leftIntersects || !rightIntersects || !topIntersects || !bottomIntersects) {
                // console.log("Viewport calculation failed, using fallback values");
                return {
                    left: -2.4,
                    right: 2.4,
                    top: 4.5,
                    bottom: -4.5
                };
            }
            
            // Add some padding to prevent objects from touching the screen edges
            const padding = 0.8; // Increased padding to bring in left and right limits
            
                    return {
            left: leftIntersectPoint.x + padding,
            right: rightIntersectPoint.x - padding,
            top: -topIntersectPoint.z + padding , // Extra padding for top
            bottom: -bottomIntersectPoint.z - padding+2
        };
        } catch (error) {
            console.log("Viewport calculation error:", error, "using fallback values");
            return {
                left: -2.4,
                right: 2.4,
                top: 4.5,
                bottom: -4.5
            };
        }
    }



    onMouseMove(event) {

        if(this.e.mobile===false){
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        if(this.selectedObject!==null && this.selectedObject!==undefined){

            // Calculate viewport-based limits
            const viewportLimits = this.calculateViewportLimits();

            if(this.selectedObject.parentOb.boxBody.position.x > viewportLimits.right){
                
                this.selectedObject.parentOb.boxBody.position.x = viewportLimits.right;

                const force = new CANNON.Vec3(-50, 0, 0);
                this.selectedObject.cannonBody.applyForce(force, this.selectedObject.cannonBody.position);
                this.selectedObject.cannonBody.angularVelocity.set(0, 0, 0);

            }else if(this.selectedObject.parentOb.boxBody.position.x < viewportLimits.left){
                
                this.selectedObject.parentOb.boxBody.position.x = viewportLimits.left;

                const force = new CANNON.Vec3(50, 0, 0);
                this.selectedObject.cannonBody.applyForce(force, this.selectedObject.cannonBody.position);
                this.selectedObject.cannonBody.angularVelocity.set(0, 0, 0);

            }else if(this.selectedObject.parentOb.boxBody.position.z > viewportLimits.top){
                
                this.selectedObject.parentOb.boxBody.position.z = viewportLimits.top;

                const force = new CANNON.Vec3(0, 0, -50);
                this.selectedObject.cannonBody.applyForce(force, this.selectedObject.cannonBody.position);
                this.selectedObject.cannonBody.angularVelocity.set(0, 0, 0);

            }else  if(this.selectedObject.parentOb.boxBody.position.z < viewportLimits.bottom){
                
                this.selectedObject.parentOb.boxBody.position.z = viewportLimits.bottom;

                const force = new CANNON.Vec3(0, 0, -50);
                this.selectedObject.cannonBody.applyForce(force, this.selectedObject.cannonBody.position);
                this.selectedObject.cannonBody.angularVelocity.set(0, 0, 0);

            }

        }

    }

    onMouseDown(event) {

        if(this.e.mobile===false && this.e.isTablet!==true){
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        this.raycaster.setFromCamera(this.mouse, this.e.camera);
        const intersects = this.raycaster.intersectObjects(this.matchObs.map(matchOb => matchOb.threeCube));

        if (intersects.length > 0 && (this.action==="game" || this.action==="tutorial_playing")) {

            this.e.s.p("pickup");
                
            this.selectedObject = intersects[0].object;
            this.dragging = true;

            const worldIntersectPoint = intersects[0].point.clone();
            this.mouseOffset.subVectors(this.selectedObject.position, worldIntersectPoint);

            this.dragPlane.setFromNormalAndCoplanarPoint(
                this.e.camera.getWorldDirection(new THREE.Vector3()),
                this.selectedObject.position
            );

            this.startPosition = this.selectedObject.position.clone();
            this.startTime = performance.now();
            
            // Check if selectedObject has cannonBody before accessing it
            if (this.selectedObject && this.selectedObject.cannonBody) {
                this.selectedObject.cannonBody.velocity.set(0, 0, 0); 
                this.selectedObject.cannonBody.angularVelocity.set(0, 0, 0);
                this.selectedObject.cannonBody.sleep(); 
            }

            if (this.selectedObject && this.selectedObject.parentOb) {
                this.selectedObject.parentOb.isLocked = 0;
            }

            if(this.matchLock1===this.selectedObject.parentOb){
                this.matchLock1=undefined;
            }

            if(this.matchLock2===this.selectedObject.parentOb){
                this.matchLock2=undefined;
            }

        }

    }

    onMouseUp() {

        if (this.selectedObject) {
            
            this.raycaster.setFromCamera(this.mouse, this.e.camera);
            const matcher1Intersection = this.raycaster.intersectObject(this.matcher1);
            const matcher2Intersection = this.raycaster.intersectObject(this.matcher2);
    
            if (matcher1Intersection.length > 0 || matcher2Intersection.length > 0) {
                // this.e.s.p("place");
            
                // Decide which matcher was hit
                const isMatcher1 = matcher1Intersection.length > 0;
                const targetPosition = isMatcher1 ? this.matcher1.position : this.matcher2.position;
                const currentLock = isMatcher1 ? this.matchLock1 : this.matchLock2;
            
                // If something is already locked in, eject it upward
                if (currentLock !== undefined) {
                    currentLock.isLocked = 0;
                    currentLock.boxBody.wakeUp();
                    currentLock.boxBody.velocity.set(0, 25, 0); // 🚀 shoot upward
                    currentLock.boxBody.angularVelocity.set(5, 5, 0); // add spin
                    if (isMatcher1) this.matchLock1 = undefined;
                    else this.matchLock2 = undefined;
                }
            
                // Lock in new object
                if (this.selectedObject && this.selectedObject.parentOb) {
                    this.selectedObject.parentOb.isLocked = 4;
                }
                if (this.selectedObject && this.selectedObject.cannonBody) {
                    this.selectedObject.cannonBody.wakeUp();
                    this.selectedObject.cannonBody.velocity.set(0, 0, 0);
                    this.selectedObject.cannonBody.angularVelocity.set(0, 0, 0);
                    this.selectedObject.cannonBody.sleep();
                }
            
                if (this.selectedObject && this.selectedObject.cannonBody) {
                    gsap.to(this.selectedObject.cannonBody.position, {
                        x: targetPosition.x,
                        y: this.lockHeight,
                        z: targetPosition.z,
                        duration: 0.25,
                        ease: "power2.out",
                    });
                }
            
                if (this.selectedObject && this.selectedObject.parentOb) {
                    this.selectedObject.parentOb.action = "moving";
                    this.selectedObject.parentOb.count = 0;
                    this.selectedObject.parentOb.target = isMatcher1 ? 1 : 2;
                }
            
                if (this.selectedObject) {
                    gsap.to(this.selectedObject.rotation, {
                        x: 0,
                        y: 0,
                        z: 0,
                        duration: 0.25,
                        ease: "power2.out",
                        onUpdate: () => {
                            if (this.selectedObject !== null && this.selectedObject.cannonBody) {
                                const currentRotation = this.selectedObject.rotation;
                                const euler = new THREE.Euler(currentRotation.x, currentRotation.y, currentRotation.z);
                                const quaternion = new THREE.Quaternion().setFromEuler(euler);
                                this.selectedObject.cannonBody.quaternion.copy(quaternion);
                            }
                        },
                    });
                }
            
                this.selectedObject = null;
                this.dragging = false;
            }else{

                if (this.selectedObject && this.selectedObject.cannonBody) {
                    this.selectedObject.cannonBody.wakeUp();
                }
                this.dragging = false;
                this.selectedObject = null;

            }
        }
    }

    //----------------------------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------------------------

    startVars(){

        this.score=0;
        this.part=0;
        this.matches=0;
        this.gameScores=[];

        // Target object tracking for bonus points
        this.targetObject = null;
        this.matchedObjects = new Set();
        this.availableObjects = [];
        this.megaMatchesAllowed = true; // Flag to track if mega matches are still allowed
        this.lastTickSecond = -1;

        // Breadcrumb system for 15-second intervals (like temp files)
        this.breadcrumbInterval = 15; // 15 seconds
        this.lastBreadcrumbTime = 0;
        this.currentIntervalScore = 0; // Score accumulated in current 15-second interval
        this.currentIntervalMatchScores = []; // Match scores for current 15-second interval
        this.breadcrumbCount = 0;
        this.breadcrumbIntervalId = null; // For interval-based breadcrumbs

        // Properties needed for validation (like temp files)
        this.levelScore = 0; // Total score for current level/interval
        this.matchScores = []; // Array to store individual match scores (called handScores in temp)

        // this.currentLevel=1;

        // this.score=0;
        // this.life=100;

        // this.totalCoinPoints=0;
        // this.totalPushPoints=0;
        // this.totalRightPoints=0;
        // this.totalLifeBonus=0;

        // this.totalWrongPoints=0;
        // this.totalPenaltyPoints=0;

        this.levelStartTime = null;
        this.levelElapsedTime = 0;

        this.resetBreadCrumbTempData();

    }

    resetBreadCrumbTempData(){

        //reset every level

        this.levelScore=0;
        this.levelStartTime = performance.now();

        // Reset current interval tracking
        this.currentIntervalScore = 0;
        this.currentIntervalMatchScores = [];

        // Reset target object tracking
        // this.matchedObjects.clear();
        // this.availableObjects = [];
        // Initialize target object after variables are set up
       

        // this.levelCoinPoints=0;
        // this.levelPushPoints=0;
        // this.levelRightPoints=0;
        // this.levelLifeBonus=0;

        // this.levelWrongPoints=0;
        // this.levelPenaltyPoints=0;

        // this.levelCoinHits = [];

        // this.score=0;
        // this.part=0;

    }

    selectNewTargetObject() {

        this.action="set target pause"

        if (!this.matchedObjects) {
            this.matchedObjects = new Set();
        }
        
        // Initialize target selection counter if not exists
        if (!this.targetSelectionCount) {
            this.targetSelectionCount = 0;
        }
        
        // Define the first 3 target objects
        const firstThreeTargets = ["Globe", "Bus", "Aeroplane", "Hot Air Baloon", "Taxi", "Fire Hydrant", "Chicken", "Lawn Mower", "Wagon", "Boom Box", "Wine Bottle"];
        
        // For the first 3 selections, use the predefined list
        if (this.targetSelectionCount < 3) {
            // Get available unmatched objects from the predefined list
            const availableFromPredefined = firstThreeTargets.filter(targetName => {
                const gameObj = this.gameObjects.find(obj => obj.name === targetName);
                return gameObj && !this.matchedObjects.has(targetName);
            });
            
            console.log(`Selection ${this.targetSelectionCount + 1}: Available from predefined list:`, availableFromPredefined);
            console.log("Matched objects:", Array.from(this.matchedObjects));
            
            if (availableFromPredefined.length > 0) {
                // Select from available predefined objects
                const targetName = availableFromPredefined[0]; // Take the first available
                this.targetObject = this.gameObjects.find(obj => obj.name === targetName);
                console.log(`Selected from predefined list: "${this.targetObject.name}"`);
            } else {
                // No predefined objects available, fall back to normal random selection
                console.log("No predefined objects available, using random selection");
                
                if (!this.gameObjects || this.gameObjects.length === 0) {
                    console.log("No game objects available for target selection");
                    return;
                }
                
                // Get all available objects that haven't been matched yet
                this.availableObjects = this.gameObjects.filter((item) => {
                    return !this.matchedObjects.has(item.name);
                });
                
                if (this.availableObjects.length === 0) {
                    this.matchedObjects.clear();
                    this.availableObjects = this.gameObjects;
                }
                
                if (this.availableObjects.length > 0) {
                    const randomIndex = Math.floor(Math.random() * this.availableObjects.length);
                    this.targetObject = this.availableObjects[randomIndex];
                    console.log(`Selected random object: "${this.targetObject.name}"`);
                }
            }
        } else {
            // After first 3, use normal random selection
            if (!this.gameObjects || this.gameObjects.length === 0) {
                console.log("No game objects available for target selection");
                return;
            }
            
            // Get all available objects that haven't been matched yet and are in the game
            this.availableObjects = this.gameObjects.filter((item) => {
                return !this.matchedObjects.has(item.name);
            });

            console.log("Available objects after filtering:", this.availableObjects.length);
            console.log("Available object names:", this.availableObjects.map(obj => obj.name));
            console.log("Matched objects:", Array.from(this.matchedObjects));
            
            // If no available objects, reset matched objects and try again
            if (this.availableObjects.length === 0) {
                this.matchedObjects.clear();
                this.availableObjects = this.gameObjects;
            }

            // Select a random available object
            if (this.availableObjects.length > 0) {
                const randomIndex = Math.floor(Math.random() * this.availableObjects.length);
                this.targetObject = this.availableObjects[randomIndex];
            }
        }
        
        // Increment the selection counter
        this.targetSelectionCount++;
        
        // Check if we have a valid target object
        if (this.targetObject) {
            // Update the UI to show the target object name
            const targetDiv = document.getElementById("targetDiv");
            if (targetDiv) {
                targetDiv.textContent = `MEGA: ${this.targetObject.name.replace(/[_-]/g, ' ')}`;
                // Add a subtle animation when target changes
                targetDiv.style.opacity = "1";
                targetDiv.style.transform = "translateX(-50%) scale(1.1)";
                setTimeout(() => {
                    targetDiv.style.transform = "translateX(-50%) scale(1)";
                }, 200);
            }
            
            // Display the target object in the separate canvas
            this.displayTargetObject(this.targetObject);
        } else {
            // No more target objects available
            console.log("No more target objects available");
            
            // Hide the target div
            const targetDiv = document.getElementById("targetDiv");
            if (targetDiv) {
                targetDiv.style.opacity = "0";
            }
            
            // Don't show pause overlay - just continue the game
            this.action = "game";
            return;
        }
    }

    breadCrumb(type){

        console.log("---------BREADCRUMB----------------------------------------------------------");

        // Crypto.js removed - send plain JSON instead
        try {
            this.levelElapsedTime = (performance.now() - this.levelStartTime) / 1000;
            const breadCrumbPayload = {
                currentScore: this.score,
                levelScore: this.levelScore,
                levelTime: this.levelElapsedTime,
                matchScores: this.currentIntervalMatchScores,
                matches: this.matches,
                targetMatches: this.targetMatches,
                part: this.part,
                clientTimestamp: Date.now()
            };

            if (type === "validate") {
                const finalPayload = {
                    score: this.score,
                    matches: this.matches,
                    metadata: { breadcrumb: breadCrumbPayload }
                };
                const message = JSON.stringify({ type: 'ValidateScore', data: JSON.stringify(finalPayload) });
                if (window.parent) {
                    window.parent.postMessage(message, "*");
                }
                this.breadCrumbDone = true;
            } else {
                const message = JSON.stringify({ type: 'BreadCrumb', data: JSON.stringify(breadCrumbPayload) });
                if (window.parent) {
                    window.parent.postMessage(message, "*");
                }
            }
        } catch (e) {
            console.log('Error sending breadcrumb:', e);
        }

        this.resetBreadCrumbTempData();

    }

    showStreakBrokenAnimation() {
        const calloutText = document.getElementById("timeBonusText");
        
        // Reset any existing animations
        gsap.killTweensOf(calloutText);
        
        // Set text content
        calloutText.textContent = "STREAK BROKEN";
        
        // Set initial state - visible
        calloutText.style.opacity = "1";
        calloutText.style.fontSize = "16pt";
        calloutText.style.transform = "none";
        
        // Fade out after delay
        gsap.to(calloutText, {
            opacity: 0,
            duration: 0.6,
            delay: 1.0,
            ease: "power2.in"
        });
    }

    showTimeBonusAnimation() {
        const calloutText = document.getElementById("timeBonusText");
        
        // Reset any existing animations
        gsap.killTweensOf(calloutText);
        
        // Set text content
        calloutText.textContent = "+5 SECONDS";
        
        // Set initial state - visible, no scaling
        calloutText.style.opacity = "1";
        calloutText.style.fontSize = "16pt";
        calloutText.style.transform = "none";

        // Stay visible for 0.5 seconds, then fade out
        gsap.to(calloutText, {
            opacity: 0,
            duration: 0.6,
            delay: 0.5,
            ease: "power2.in"
        });
    }

    // ============================================================================
    // TARGET OBJECT DISPLAY SYSTEM
    // ============================================================================

    setupTargetDisplay() {
        // Create a separate Three.js scene for target object display
        this.targetScene = new THREE.Scene();
        this.targetCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Square aspect ratio
        this.targetRenderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById("targetCanvas"),
            alpha: true,
            antialias: true
        });
        
        // Set renderer size
        this.targetRenderer.setSize(200, 200); // Fixed size for the display
        
        // Setup lighting for target scene
        const targetAmbientLight = new THREE.AmbientLight(0xffffff, 1.5);
        this.targetScene.add(targetAmbientLight);
        
        const targetDirectionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
        targetDirectionalLight.position.set(0, 3, 0);
        this.targetScene.add(targetDirectionalLight);
        
        // Position camera for good view of objects
        var cd = .8;
        this.targetCamera.position.set(cd, cd, cd);
        this.targetCamera.lookAt(0, 0, 0);
        
        // Start the render loop
        this.renderTargetDisplay();
    }

    renderTargetDisplay() {
        if (this.targetRenderer && this.targetScene && this.targetCamera) {
            // Rotate the target object if it exists
            if (this.currentTargetDisplay) {
                this.currentTargetDisplay.rotation.y += 0.01; // Slow rotation
            }
            
            this.targetRenderer.render(this.targetScene, this.targetCamera);
        }
        requestAnimationFrame(() => this.renderTargetDisplay());
    }

    displayTargetObject(targetObject) {
        // Clear previous target object
        this.clearTargetDisplay();
        
        if (!targetObject) return;
        
        // Clone the target object
        const targetClone = targetObject.clone(true);
        
        // Calculate bounds of the object
        const bbox = new THREE.Box3().setFromObject(targetClone);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        bbox.getSize(size);
        bbox.getCenter(center);
        
        // Find the largest dimension to scale consistently
        const maxDimension = Math.max(size.x, size.y, size.z);
        
        // Scale to fit within a consistent size (e.g., 1 unit)
        const targetSize = 1.0;
        const scale = targetSize / maxDimension;
        
        // Apply uniform scaling
        targetClone.scale.set(scale, scale, scale);
        
        // Recalculate bounds after scaling
        const scaledBbox = new THREE.Box3().setFromObject(targetClone);
        const scaledCenter = new THREE.Vector3();
        scaledBbox.getCenter(scaledCenter);
        
        // Position it so the center of the bounds is at (0,0,0)
        targetClone.position.sub(scaledCenter);
        
        // Add to target scene
        this.targetScene.add(targetClone);
        
        // Store reference for cleanup
        this.currentTargetDisplay = targetClone;
    }

    clearTargetDisplay() {
        if (this.currentTargetDisplay) {
            this.targetScene.remove(this.currentTargetDisplay);
            this.currentTargetDisplay = null;
        }
    }

    // ============================================================================
    // END TARGET OBJECT DISPLAY SYSTEM
    // ============================================================================
    
    // Progress bar animation moved to endScore.js
    
    // Progress bar functionality moved to endScore.js
    
    startCountdown() {
        this.action = "countdown";
        const countdownText = document.getElementById("countdownText");
        
        // Show "3" and play first beep
        countdownText.textContent = "3";
        countdownText.style.opacity = "1";
        // this.e.s.p("startBeep1");
        
        setTimeout(() => {
            // Show "2" and play first beep
            countdownText.textContent = "2";
            // this.e.s.p("startBeep1");
        }, 1000);
        
        setTimeout(() => {
            // Show "1" and play first beep
            countdownText.textContent = "1";
            // this.e.s.p("startBeep1");
        }, 2000);
        
        setTimeout(() => {
            // Show "GO!" and play second beep
            countdownText.textContent = "GO!";
            // this.e.s.p("startBeep2");
            
            // Fade out "GO!" immediately
            gsap.to(countdownText, { 
                opacity: 0, 
                duration: 1, 
                ease: "power2.out" 
            });
        }, 3000);
        
        setTimeout(() => {
            // Hide countdown and start game
            countdownText.style.opacity = "0";
            this.action = "game";
        }, 4000);
    }

}

// ============================================================================
// ENGINE CLASS
// ============================================================================



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
					
                this.mobile = true;
            }
        } catch (e) {
            // fail-safe: do nothing if UA parsing fails
        }

        this.action = "set up";
        this.count = 0;

        this.loadGame();

    }

    start(){
        console.log("[ENGINE] start() called, action:", this.action);
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

        document.getElementById("feedback").innerHTML = this.scene.action;

        // Log action changes only (not every frame)
        if (!this.lastAction || this.lastAction !== this.action) {
            console.log("[ENGINE] Action changed:", this.lastAction, "->", this.action);
            this.lastAction = this.action;
        }

        if(this.action==="set up"){

            console.log("[ENGINE] Starting setup...");

            //---3D SET UP----------------------------------------------------------------------------------------------------------------

            //---scene parts--------------------------------------------------------------------------------------------------------------

            this.scene3D = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight,.1, 740);
            this.scene3D.fog = new THREE.Fog(0x000000, 0, 330*1.6);

            this.mainCont = new THREE.Group();
            this.scene3D.add(this.mainCont);

            //---carmera rig--------------------------------------------------------------------------------------------------------------

            this.camContX = new THREE.Group();
            this.camContY = new THREE.Group();
            this.scene3D.add(this.camContX);
            this.scene3D.add(this.camContY);

            this.camContY.add(this.camContX)
            this.camContX.add(this.camera);

            //-----------------------

            this.camera.position.z = 4;
            this.camera.position.y = 0;

            // this.camContY.rotation.y = this.u.ca(45)
            this.camContX.rotation.x = this.u.ca(-90)
            // this.camContX.rotation.x = this.u.ca(-45)

            //---webgl--------------------------------------------------------------------------------------------------------------

            this.renderer = new THREE.WebGLRenderer({antialias:true, powerPreference: "high-performance", alpha: true})

            this.renderer.setSize(window.innerWidth,window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);

            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMapSoft = true;

            this.renderer.shadowCameraNear = 3;
            this.renderer.shadowCameraFar = this.camera.far;
            this.renderer.shadowCameraFov = 50;

            this.renderer.shadowMapBias = 0.0039;
            this.renderer.shadowMapDarkness = 0.5;
            this.renderer.shadowMapWidth = 2048;
            this.renderer.shadowMapHeight = 2048;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

            this.renderer.domElement.style.position="absolute"
            this.renderer.domElement.style.zIndex="2";
            // this.renderer.domElement.style.border="2px solid red";

            //---end--------------------------------------------------------------------------------------------------------------

            this.serverData = null;
            
            window.addEventListener('message', event => {
                try {
                    const message = JSON.parse(event.data);
                    if (message?.type) {

                        console.log("MESSAGE TYPE v2: "+message.type);

                        if (message.type === "InitGame") {
                            // Case CG_API.InitGame
                            // Decrypt the data
                            // Crypto.js removed - parse message data directly
                        try {
                            this.serverData = JSON.parse(message.data);
                        } catch (e) {
                            console.log("Failed to parse message data:", e);
                        }
                            console.log("LOAD GAME DATA")
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
                    // Ignore exception - not a message for us and couldn't JSON parse it
                    console.log("FAIL:");
                    console.log(e);
                }
            });

            //---end--------------------------------------------------------------------------------------------------------------

            console.log("[ENGINE] Setup complete, moving to load images");
            this.action="load images";

        }else if(this.action==="load images"){

            console.log("[ENGINE] Loading 2D images...");

            // load 2d images

            this.ui.load();

            console.log("[ENGINE] Started UI load, waiting for images...");
            this.action="wait for images";

        }else if(this.action==="wait for images"){

            // wait for 2d images

            // Log every 60 frames (roughly every second at 60fps)
            if (!this.waitingImagesLogCounter) this.waitingImagesLogCounter = 0;
            this.waitingImagesLogCounter++;
            if (this.waitingImagesLogCounter % 60 === 0) {
                console.log("[ENGINE] Waiting for images, isLoaded_UI:", this.ui.isLoaded_UI);
            }

            if(this.ui.isLoaded_UI===true){
                console.log("[ENGINE] Images loaded! Moving to load 3D");
                this.waitingImagesLogCounter = 0;
                this.action="load 3d";
            }

        }else if(this.action==="load 3d"){

            console.log("[ENGINE] Loading 3D assets...");

            // load 3d assets

            this.loader.load();
            console.log("[ENGINE] Started 3D load, waiting...");
            this.action="loading 3d";

        }else if(this.action==="loading 3d"){

            // wait for 3d assets

            const textures = this.loader.isLoaded_3DTEXTURES;
            const models = this.loader.isLoaded_3D;
            const cube = this.loader.isLoaded_CUBE;
            
            // Log progress every 30 frames (roughly every 0.5 seconds at 60fps)
            if (!this.loading3DLogCounter) this.loading3DLogCounter = 0;
            this.loading3DLogCounter++;
            if (this.loading3DLogCounter % 30 === 0) {
                console.log("[ENGINE] Loading 3D - Textures:", textures, "Models:", models, "Cube:", cube);
                console.log("[ENGINE] Texture progress:", this.loader.texturesLoaded, "/", this.loader.textureArray.length);
                console.log("[ENGINE] Model progress:", this.loader.modelsLoaded, "/", this.loader.modelArray.length);
            }

            if(textures===true && models===true && cube===true){
                console.log("[ENGINE] All 3D assets loaded! Textures:", textures, "Models:", models, "Cube:", cube);
                console.log("[ENGINE] Moving to wait before build");
                this.loading3DLogCounter = 0;
                this.action="wait before build";
            }

        }else if(this.action==="wait before build"){

            // wait before build

            console.log("[ENGINE] Waiting before build, count:", this.count);
            this.count+=this.dt;
            if(this.count>.1){
                console.log("[ENGINE] Wait complete, building scene");
                this.count=0;
                this.action="build"
            }

        }else if(this.action==="build"){

            console.log("[ENGINE] Building scene...");

            // build everything here

            // add 3d dom element to page

            document.body.appendChild(this.renderer.domElement);
            this.renderer.domElement.style.pointerEvents="none";

            // call builds

            this.scene.buildScene();
            // this.ui.setUp2();

            // add resizer

            window.addEventListener("resize", () => {
                this.resize3D();
            })

            // end

            this.loadBack=1;

            this.count=0;
            console.log("[ENGINE] Build complete, waiting...");
            this.action="wait";

        }else if(this.action==="wait"){

            // loop

            this.ui.update();
            this.scene.update();

            // end

            this.count+=this.dt;
            if(this.count>1){
                console.log("[ENGINE] Wait complete, starting game!");
                this.count=0;
                this.action="go"
            }

        }else if(this.action==="go"){

            // Fade out loading screen (same as blackjack)
            const loadingBack = document.getElementById("loadingBack");
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

            // loops

            this.scene.update();
            this.ui.update();
            this.render();

        }

    }

    render(){
        
        //---renderer--------------------------------------------------------------------------------------------------------------

        this.renderer.render(this.scene3D, this.camera);

    }

    resize3D(){

        console.log("resize")
    
        var width = window.innerWidth;
        var height = window.innerHeight;

        var width = document.documentElement.clientWidth;
        var height = document.documentElement.clientHeight;
    
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize( width, height );
        
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
            background: #FF7E00;
            border: 2px solid #FFA751;
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
            icon2.src = this.muteState ? './images/audio_off.svg' : './images/audio_on.svg';
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
// INITIALIZATION
// ============================================================================

function initGame(retryCount = 0) {
    console.log("[INIT] Initializing game... (attempt " + (retryCount + 1) + ")");
    console.log("[INIT] THREE available:", typeof THREE !== 'undefined');
    if (typeof THREE !== 'undefined') {
        console.log("[INIT] THREE object:", THREE);
        console.log("[INIT] THREE keys:", Object.keys(THREE).slice(0, 10));
        console.log("[INIT] THREE.GLTFLoader available:", typeof THREE.GLTFLoader !== 'undefined');
    }
    console.log("[INIT] THREE.Scene available:", typeof THREE !== 'undefined' && typeof THREE.Scene !== 'undefined');
    console.log("[INIT] CANNON available:", typeof CANNON !== 'undefined');
    
    // Check if THREE exists but Scene is not available yet - retry with polling
    if (typeof THREE !== 'undefined' && typeof THREE.Scene === 'undefined') {
        if (retryCount < 20) { // Max 20 retries (1 second total)
            console.log("[INIT] THREE exists but Scene not available, retrying in 50ms...");
            setTimeout(() => initGame(retryCount + 1), 50);
            return;
        } else {
            console.error("[INIT] THREE.Scene still not available after 1 second, waiting for three-loaded event");
            window.addEventListener('three-loaded', () => initGame(0), { once: true });
            return;
        }
    }
    
    if (typeof THREE === 'undefined' || typeof THREE.Scene === 'undefined') {
        console.log("[INIT] Waiting for THREE to load...");
        window.addEventListener('three-loaded', () => initGame(0), { once: true });
        return;
    }
    
    // Check if GLTFLoader is available
    if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
        console.log("[INIT] Waiting for GLTFLoader to load...");
        if (retryCount < 40) { // Max 40 retries (2 seconds total)
            setTimeout(() => initGame(retryCount + 1), 50);
            return;
        } else {
            console.error("[INIT] GLTFLoader still not available after 2 seconds, waiting for gltfloader-loaded event");
            window.addEventListener('gltfloader-loaded', () => initGame(0), { once: true });
            return;
        }
    }
    
    if (typeof CANNON === 'undefined') {
        console.log("[INIT] Waiting for CANNON to load...");
        window.addEventListener('cannon-loaded', () => initGame(0), { once: true });
        return;
    }

    console.log("[INIT] All dependencies loaded, creating game objects...");
    var input = new Input();
    var loader = new Loader();
    var scene = new Scene();
    var sounds = new Sounds();
    var utilities = new Utilities();
    var ui = new UI();
    var endScore = new EndScore();

    console.log("[INIT] Creating engine...");
    var engine = new Engine(input, loader, scene, sounds, utilities, ui, endScore);

    console.log("[INIT] Setting up components...");
    ui.setUp(engine);
    utilities.setUp(engine);
    loader.setUp(engine);
    scene.setUp(engine);
    sounds.setUp(engine);
    input.setUp(engine);
    endScore.setUp(engine);

    console.log("[INIT] Starting engine...");
    console.log("[INIT] Initial action:", engine.action);
    engine.start(engine);

    console.log("[INIT] Starting update loop...");
    function update() {
        engine.update();
        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
    console.log("[INIT] Game initialization complete!");
}

// Helper function to get today's key for localStorage
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Calculate stars from Lost and Found score
function calculateLostAndFoundStarsFromScore(scoreValue) {
    let stars = 0;
    // Star thresholds for Lost and Found (matching EndScore defaults)
    const starThresholds = [0, 25000, 40000, 65000, 100000];
    // 1 star = >= 0
    // 2 stars = >= 25000
    // 3 stars = >= 40000
    // 4 stars = >= 65000
    // 5 stars = >= 100000
    for (let i = starThresholds.length - 1; i >= 0; i--) {
        if (scoreValue >= starThresholds[i]) {
            stars = i + 1; // Add 1 because index 0 = 1 star, index 4 = 5 stars
            break;
        }
    }
    return stars;
}

// Save Lost and Found game result (similar to blackjack)
function saveLostAndFoundGameResult(finalScore, starsEarned) {
    const todayKey = getTodayKey();
    
    console.log('[LostAndFound] Saving game result:', { finalScore, starsEarned, todayKey });
    
    // Check if already played today BEFORE overwriting
    const previousStars = parseInt(localStorage.getItem(`lostAndFoundStars_${todayKey}`) || '0');
    const previousScore = parseInt(localStorage.getItem(`lostAndFoundScore_${todayKey}`) || '0');
    const wasComplete = localStorage.getItem(`lostAndFoundComplete_${todayKey}`) === 'true';
    
    console.log('[LostAndFound] Previous stars:', previousStars, 'Was complete:', wasComplete);
    
    // Check if this is a better result
    const isBetter = !wasComplete || finalScore > previousScore || starsEarned > previousStars;
    
    if (isBetter) {
        // Calculate star difference to add to totals
        const starDifference = wasComplete ? (starsEarned - previousStars) : starsEarned;
        
        console.log('[LostAndFound] Adding star difference:', starDifference);
    
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
        localStorage.setItem(`lostAndFoundScore_${todayKey}`, String(finalScore));
        localStorage.setItem(`lostAndFoundStars_${todayKey}`, String(starsEarned));
        localStorage.setItem(`lostAndFoundComplete_${todayKey}`, 'true');
        
        console.log('[LostAndFound] Verified saved stars:', localStorage.getItem(`lostAndFoundStars_${todayKey}`));
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
        
        // Reload Lost and Found scores on main page
        if (window.parent.loadGameScores) {
            window.parent.loadGameScores();
        } else {
            // Fallback: directly update the elements if they exist
            const todayKey = getTodayKey();
            const score = parseInt(localStorage.getItem(`lostAndFoundScore_${todayKey}`) || '0');
            const starsEarned = parseInt(localStorage.getItem(`lostAndFoundStars_${todayKey}`) || '0');
            
            try {
                const lostAndFoundScore = window.parent.document.getElementById('lostAndFoundScore');
                if (lostAndFoundScore) {
                    lostAndFoundScore.textContent = score.toLocaleString();
                }
                
                const lostAndFoundStars = window.parent.document.getElementById('lostAndFoundStars');
                if (lostAndFoundStars) {
                    lostAndFoundStars.innerHTML = '';
                    for (let i = 0; i < 5; i++) {
                        const star = window.parent.document.createElement('span');
                        star.textContent = '★';
                        if (i < starsEarned) {
                            star.style.color = '#FFB84D';
                        } else {
                            star.style.color = '#ddd';
                        }
                        lostAndFoundStars.appendChild(star);
                    }
                }
            } catch (e) {
                console.log('Could not update parent window elements:', e);
            }
        }
    }
}

console.log("[INIT] Script loaded, calling initGame()");
initGame();

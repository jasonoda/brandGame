(function() {
    "use strict";

    var boardSounds = {};
    if (typeof Howl !== 'undefined') {
        ['journey_dice', 'journey_dieRoll', 'journey_move', 'reward3', 'reward4', 'achievement1'].forEach(function(name) {
            boardSounds[name] = new Howl({ src: ['sounds/' + name + '.mp3'] });
        });
    }
    function playBoardSound(name) {
        if (boardSounds[name]) boardSounds[name].play();
    }

    var currentPlayerPosition = 0;
    var diceRolls = 0;

    var BOARD_POSITION_KEY = "boardPlayerPosition";

    function loadBoardPlayerPosition() {
        var saved = parseInt(localStorage.getItem(BOARD_POSITION_KEY) || "0", 10);
        currentPlayerPosition = (saved >= 0 && saved < 40) ? saved : 0;
    }

    function saveBoardPlayerPosition() {
        localStorage.setItem(BOARD_POSITION_KEY, String(currentPlayerPosition));
    }

    // Journey background gradients for the journey page (board tab)
    // Keep depth the same, just rotate hue through this array.
    var JOURNEY_BACKGROUNDS = [
        // "linear-gradient(to bottom, rgb(224, 224, 224),rgb(202, 202, 202))",  // purple
        "linear-gradient(to bottom, rgb(94, 35, 172), #2E0E5C)",  // purple
        
        "linear-gradient(to bottom, rgb(35, 172, 158), #0E5C52)",  // greenish blue
        "linear-gradient(to bottom, rgb(35, 94, 172), #0E2E5C)",  // blue   
        "linear-gradient(to bottom, rgb(172, 35, 135), #5C0E3A)", // magenta
        "linear-gradient(to bottom, rgb(35, 172, 94), #0E5C2E)",  // green
        "linear-gradient(to bottom, rgb(170, 53, 78),rgb(92, 14, 31))", 
        "linear-gradient(to bottom, rgb(105, 105, 105),rgb(54, 54, 54))"
        
    ];

    var currentJourneyBackgroundIndex = 0;

    function setJourneyBackground(index) {
        var journeyPage = document.getElementById("journey-page");
        if (!journeyPage || !JOURNEY_BACKGROUNDS.length) return;

        var len = JOURNEY_BACKGROUNDS.length;
        var safeIndex = ((index % len) + len) % len;
        var nextBackground = JOURNEY_BACKGROUNDS[safeIndex];

        if (typeof gsap !== "undefined") {
            // Directly tween the background property with GSAP (no fade to white).
            gsap.to(journeyPage, {
                duration: 0.4,
                background: nextBackground,
                ease: "none"
            });
        } else {
            journeyPage.style.background = nextBackground;
        }

        currentJourneyBackgroundIndex = safeIndex;
    }

    function cycleJourneyBackground() {
        setJourneyBackground(currentJourneyBackgroundIndex + 1);
    }

    // Expose for other code / debugging
    window.cycleJourneyBackground = cycleJourneyBackground;

    // Popup shown when passing/landing on GO (level reached)
    var levelPopupEl = null;

    function ensureLevelPopupElement() {
        if (levelPopupEl) return levelPopupEl;

        var el = document.createElement("div");
        el.className = "board-level-popup";
        el.style.position = "fixed";
        el.style.left = "50%";
        el.style.top = "50%";
        el.style.transform = "translate(-50%, -50%)";
        el.style.padding = "10px 20px";
        el.style.background = "#FFFFFF";
        el.style.color = "#E85D04";
        el.style.fontFamily = "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif";
        el.style.fontSize = "18px";
        el.style.fontWeight = "700";
        el.style.borderRadius = "9999px";
        el.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.35)";
        el.style.zIndex = "2000";
        el.style.pointerEvents = "none";
        el.style.opacity = "0";
        el.style.whiteSpace = "nowrap";

        document.body.appendChild(el);
        levelPopupEl = el;
        return el;
    }

    function getCurrentJourneyLevelLabel() {
        var level = 1;
        try {
            if (typeof getJourneyLevel === "function") {
                level = getJourneyLevel();
            }
        } catch (e) {
            // ignore, fall back to 1
        }
        if (!isFinite(level) || level <= 0) level = 1;
        return level;
    }

    // Space types: one star, free roll (2 dice), multi-star (3 stars), question, profile unlock, go, house (property)
    var ONE_STAR = [2, 7, 12, 17, 22, 28, 33, 38];
    var FREE_ROLL = [4, 36];
    var MULTI_STAR = [10, 30];
    var QUESTION = [5, 15, 25, 35];
    var PROFILE = [20];
    var GO = [0];

    function isPropertySpace(index) {
        return getSpaceType(index) === "house";
    }

    function spaceIndexToPropertyIndex(spaceIndex) {
        if (!isPropertySpace(spaceIndex)) return -1;
        var count = 0;
        for (var i = 0; i <= spaceIndex; i++) {
            if (isPropertySpace(i)) count++;
        }
        return count - 1;
    }

    function getSpaceType(index) {
        if (GO.indexOf(index) >= 0) return "go";
        if (ONE_STAR.indexOf(index) >= 0) return "one_star";
        if (FREE_ROLL.indexOf(index) >= 0) return "free_roll";
        if (MULTI_STAR.indexOf(index) >= 0) return "multi_star";
        if (QUESTION.indexOf(index) >= 0) return "question";
        if (PROFILE.indexOf(index) >= 0) return "profile";
        return "house";
    }

    function showPrizeWindow(type, onClose) {
        var win = document.querySelector(".board-prize-window");
        var backdrop = document.querySelector(".board-prize-backdrop");
        var wonEl = win ? win.querySelector(".board-prize-window-won") : null;
        var centerEl = win ? win.querySelector(".board-prize-window-center") : null;
        if (!win || !backdrop || !wonEl || !centerEl) {
            if (typeof onClose === "function") onClose();
            return;
        }
        if (type === "one_star") {
            wonEl.textContent = "+1 EXTRA STARS";
            centerEl.innerHTML = "★";
            centerEl.className = "board-prize-window-center";
        } else if (type === "free_roll") {
            wonEl.textContent = "2 FREE ROLLS";
            centerEl.innerHTML = '<div class="board-prize-window-dice"><span class="board-prize-window-dice-dot board-prize-window-dice-dot--tl"></span><span class="board-prize-window-dice-dot board-prize-window-dice-dot--c"></span><span class="board-prize-window-dice-dot board-prize-window-dice-dot--br"></span></div>';
            centerEl.className = "board-prize-window-center";
        } else if (type === "multi_star") {
            wonEl.textContent = "+3 EXTRA STARS";
            centerEl.innerHTML = "★★★";
            centerEl.className = "board-prize-window-center";
        } else if (type === "profile") {
            playBoardSound("reward4");
            wonEl.textContent = "AVATAR UNLOCK";
            centerEl.innerHTML = '<div class="board-prize-window-avatar"><img src="src/img/profile.png" alt=""></div>';
            centerEl.className = "board-prize-window-center";
        }
        backdrop.classList.add("is-open");
        win.classList.add("is-open");
        if (typeof gsap !== "undefined") {
            gsap.set(win, { scale: 0.75, opacity: 0, xPercent: -50, yPercent: -50 });
            gsap.set(backdrop, { opacity: 0 });
            gsap.to(backdrop, { opacity: 1, duration: 0.25 });
            gsap.to(win, { scale: 1, opacity: 1, duration: 0.25, ease: "expo.out", xPercent: -50, yPercent: -50 });
        }
        function closeWindow() {
            backdrop.removeEventListener("click", closeWindow);
            win.removeEventListener("click", closeWindow);
            if (typeof gsap !== "undefined") {
                var tl = gsap.timeline();
                tl.to(win, { scale: 0, opacity: 0, duration: 0.25, ease: "sine.out", xPercent: -50, yPercent: -50 });
                tl.to(backdrop, { opacity: 0, duration: 0.25 }, 0);
                tl.eventCallback("onComplete", function() {
                    win.classList.remove("is-open");
                    backdrop.classList.remove("is-open");
                    if (typeof onClose === "function") onClose();
                });
            } else {
                win.classList.remove("is-open");
                backdrop.classList.remove("is-open");
                if (typeof onClose === "function") onClose();
            }
        }
        backdrop.addEventListener("click", closeWindow);
        win.addEventListener("click", closeWindow);
    }

    function getTodayKey() {
        var d = new Date();
        return d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");
    }

    function getUsableStarsNow() {
        return parseInt(localStorage.getItem("usableStars_" + getTodayKey()) || "0", 10);
    }

    function updateDiceRollDisplay() {
        var el = document.querySelector(".board-top-count");
        if (el) el.textContent = "x " + Math.max(0, diceRolls);
    }

    function addBoardDiceRolls(amount) {
        if (!amount || amount <= 0) return;
        diceRolls += amount;
        updateDiceRollDisplay();
    }
    window.addBoardDiceRolls = addBoardDiceRolls;

    function updateBoardCenterLevelDisplay() {
        var el = document.querySelector(".board-center-level-inner");
        if (el) el.textContent = "LEVEL " + getCurrentJourneyLevelLabel();
    }

    function updateProfileLevelDisplay() {
        var el = document.getElementById("profile-level-display");
        if (el) el.textContent = "LEVEL " + getCurrentJourneyLevelLabel();
    }

    function advanceJourneyLevel() {
        if (typeof setJourneyLevel !== "function" || typeof getJourneyLevel !== "function") return;
        var next = getJourneyLevel() + 1;
        setJourneyLevel(next);
        setJourneyBackground((next - 1) % JOURNEY_BACKGROUNDS.length);
        updateBoardCenterLevelDisplay();
        updateProfileLevelDisplay();
        playBoardSound("achievement1");
    }

    function updateBoardStarDisplay() {
        var count = getUsableStarsNow();
        var headerEl = document.querySelector(".star-count");
        if (headerEl) headerEl.textContent = "x " + count;
        var journeyEl = document.querySelector(".journey-star-count");
        if (journeyEl) journeyEl.textContent = count;
    }

    function addBoardStars(amount) {
        if (!amount || amount <= 0) return;
        if (typeof window.awardStars === "function") {
            window.awardStars(amount, "board");
        } else {
            var todayKey = getTodayKey();
            var usableKey = "usableStars_" + todayKey;
            var currentTotal = parseInt(localStorage.getItem("totalStars") || "0", 10);
            var currentUsable = parseInt(localStorage.getItem(usableKey) || "0", 10);
            localStorage.setItem("totalStars", String(currentTotal + amount));
            localStorage.setItem(usableKey, String(currentUsable + amount));
        }
        updateBoardStarDisplay();
    }

    function handleLanding(reactivateRoll) {
        var type = getSpaceType(currentPlayerPosition);
        // GO space should not give stars or a prize window
        if (type === "go") {
            if (typeof reactivateRoll === "function") reactivateRoll();
            return;
        }

        // Avatar space: trigger BOARD BADGE overlay instead of the default prize window
        if (type === "profile") {
            if (typeof window.showBoardBadgeOverlay === "function") {
                window.showBoardBadgeOverlay();
                if (typeof reactivateRoll === "function") reactivateRoll();
            } else {
                // Fallback to existing profile prize window if board badge overlay is unavailable
                showPrizeWindow(type, reactivateRoll);
            }
            return;
        }

        if (type === "house") {
            if (typeof reactivateRoll === "function") reactivateRoll();
            return;
        }
        if (type === "question") {
            window.boardRollWaitingForReturn = true;
            window.boardRollReactivate = reactivateRoll;
            if (typeof window.showPrizesOverlayFromBoard === "function") {
                window.showPrizesOverlayFromBoard();
            } else {
                window.boardRollWaitingForReturn = false;
                if (typeof reactivateRoll === "function") reactivateRoll();
            }
            return;
        }
        if (type === "one_star") {
            addBoardStars(1);
            playBoardSound("reward3");
        } else if (type === "free_roll") {
            if (typeof window.addBoardDiceRolls === "function") {
                window.addBoardDiceRolls(2);
            }
            playBoardSound("reward3");
        } else if (type === "multi_star") {
            addBoardStars(3);
            playBoardSound("reward3");
        }
        showPrizeWindow(type, reactivateRoll);
    }

    // Isometric diamond: corners are squares (larger), sides are 9 rectangles. All positions in %.
    // Corner-to-first-rect distance is larger than between rects; 9 rects evenly spaced in the middle of each edge.
    // cornerMargin = gap from last rect to corner (and we match gap from corner to first rect).
    // First rect at t=cornerMargin, last at t=1-cornerMargin; 9 rects evenly spaced in between (8 gaps).
    // 0 bottom, 1-9 bottom→left, 10 left, 11-19 left→top, 20 top, 21-29 top→right, 30 right, 31-39 right→bottom.
    var cornerMargin = 0.12;
    function getSpacePositions() {
        function lerp(a, b, t) {
            return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        }
        function edgeT(k) {
            return cornerMargin + (1 - 2 * cornerMargin) * ((k - 1) / 8);
        }
        var B = { x: 50, y: 70 };
        var R = { x: 91.5, y: 48.5 };
        var T = { x: 50, y: 27.25 };
        var L = { x: 8.5, y: 48.5 };
        var positions = [];
        positions[0] = B;
        for (var k = 1; k <= 9; k++) positions[k] = lerp(B, L, edgeT(k));
        positions[10] = L;
        for (var k = 1; k <= 9; k++) positions[10 + k] = lerp(L, T, edgeT(k));
        positions[20] = T;
        for (var k = 1; k <= 9; k++) positions[20 + k] = lerp(T, R, edgeT(k));
        positions[30] = R;
        for (var k = 1; k <= 9; k++) positions[30 + k] = lerp(R, B, edgeT(k));
        return positions;
    }

    var BOARD_HOUSES_STORAGE_KEY = "brandGame_board_propertyHouses";

    function updatePlayerZOrder() {
        var container = document.querySelector("#board .board-player-container");
        if (!container) return;
        var onRightOrTop = currentPlayerPosition >= 10 && currentPlayerPosition <= 29;
        container.style.zIndex = onRightOrTop ? 40 : 75;
    }

    function onLandOnSpace() {
        if (!isPropertySpace(currentPlayerPosition)) return;
        var propertyIndex = spaceIndexToPropertyIndex(currentPlayerPosition);
        if (propertyIndex < 0) return;
        try {
            var counts = JSON.parse(localStorage.getItem(BOARD_HOUSES_STORAGE_KEY) || "[]");
            if (!Array.isArray(counts) || counts.length !== 22) return;
            counts[propertyIndex] = (counts[propertyIndex] || 0) + 1;
            localStorage.setItem(BOARD_HOUSES_STORAGE_KEY, JSON.stringify(counts));
        } catch (e) {
            return;
        }
        var boardEl = document.getElementById("board");
        if (!boardEl) return;
        var overlayEl = boardEl.querySelector(".board-spaces-overlay");
        if (!overlayEl) return;
        overlayEl.innerHTML = "";
        buildOverlay(overlayEl);
    }

    function buildOverlay(overlay) {
        var positions = getSpacePositions();
        var houseCounts = [];
        try {
            var stored = localStorage.getItem(BOARD_HOUSES_STORAGE_KEY);
            if (stored) {
                houseCounts = JSON.parse(stored);
            }
        } catch (e) {}
        if (!Array.isArray(houseCounts) || houseCounts.length !== 22) {
            houseCounts = [];
            for (var r = 0; r < 22; r++) {
                houseCounts.push(0);
            }
            try {
                localStorage.setItem(BOARD_HOUSES_STORAGE_KEY, JSON.stringify(houseCounts));
            } catch (e) {}
        }
        for (var i = 0; i < 40; i++) {
            var box = document.createElement("div");
            box.className = "board-space board-space--debug";
            box.setAttribute("data-index", i);
            box.textContent = i;
            var p = positions[i];
            box.style.left = p.x + "%";
            box.style.top = p.y + "%";
            box.style.transform = "translate(-50%, -50%)";
            overlay.appendChild(box);
        }
        // Property spaces: cycle through each space, add to array; section by place in array (first 5 → 1, next 6 → 2, next 6 → 3, last 5 → 4)
        var houseSize = 46;
        var houseSideOffset = 24;
        var houseUpDownOffset = 13;
        var houseUp = 19;
        var sectionOffset1 = { x: 75, y: -42 };
        var sectionOffset2 = { x: 77, y: 11 };
        var sectionOffset3 = { x: -11, y: 9 };
        var sectionOffset4 = { x: -9, y: -39 };

        var brownAdjustment = { x: 2, y: 2 };
        var cyanAdjustment = { x: 6, y: 4 };
        var pinkAdjustment = { x: 5, y: -2 };
        var orangeAdjustment = { x: 0, y: -1 };
        var redAdjustment = { x: 0, y: 0 };
        var yellowAdjustment = { x: -2, y: 0 };
        var greenAdjustment = { x: -3, y: 3 };
        var blueAdjustment = { x: 0, y: 0 };
        
        function getColor(refNum) {
            if (refNum >= 1 && refNum <= 2) return "brown";
            if (refNum >= 3 && refNum <= 5) return "cyan";
            if (refNum >= 6 && refNum <= 8) return "pink";
            if (refNum >= 9 && refNum <= 11) return "orange";
            if (refNum >= 12 && refNum <= 14) return "red";
            if (refNum >= 15 && refNum <= 17) return "yellow";
            if (refNum >= 18 && refNum <= 20) return "green";
            if (refNum >= 21 && refNum <= 22) return "blue";
            return "brown";
        }
        function getDirection(section) {
            if (section === 1 || section === 3) return "down";
            return "up";
        }
        var propertySpaces = [];
        var i;
        for (i = 0; i < 40; i++) {
            if (!isPropertySpace(i)) continue;
            var p = positions[i];
            var refNum = propertySpaces.length + 1; // 1-based: first in array = 1
            var container = document.createElement("div");
            container.className = "board-property-container";
            container.style.left = p.x + "%";
            container.style.top = p.y + "%";
            propertySpaces.push({
                el: container,
                refNum: refNum,
                spaceIndex: i,
                section: 0,
                color: "",
                direction: ""
            });
        }
        var idx, section, len = propertySpaces.length;
        for (idx = 0; idx < len; idx++) {
            if (idx < 5) section = 1;
            else if (idx < 5 + 6) section = 2;
            else if (idx < 5 + 6 + 6) section = 3;
            else section = 4;
            propertySpaces[idx].section = section;
            propertySpaces[idx].direction = getDirection(section);
            var color = getColor(propertySpaces[idx].refNum);
            propertySpaces[idx].color = color;
            propertySpaces[idx].el.setAttribute("data-section", String(section));
            propertySpaces[idx].el.setAttribute("data-color", color);
            propertySpaces[idx].el.setAttribute("data-direction", propertySpaces[idx].direction);
            propertySpaces[idx].el.setAttribute("data-ref", String(propertySpaces[idx].refNum));
            var spaceY = positions[propertySpaces[idx].spaceIndex].y;
            var bottomRank = Math.round((spaceY / 100) * 24);
            propertySpaces[idx].el.style.zIndex = 50 + bottomRank;
            var sectionOffsets = [sectionOffset1, sectionOffset2, sectionOffset3, sectionOffset4];
            var off = sectionOffsets[section - 1];
            var colorAdjustments = { brown: brownAdjustment, cyan: cyanAdjustment, pink: pinkAdjustment, orange: orangeAdjustment, red: redAdjustment, yellow: yellowAdjustment, green: greenAdjustment, blue: blueAdjustment };
            var adj = colorAdjustments[color] || brownAdjustment;
            var baseTransform = "translate(-50%, -50%)";
            if (off) {
                propertySpaces[idx].el.style.transform = baseTransform + " translate(" + off.x + "px, " + off.y + "px) translate(" + adj.x + "px, " + adj.y + "px)";
            } else {
                propertySpaces[idx].el.style.transform = baseTransform + " translate(" + adj.x + "px, " + adj.y + "px)";
            }
            var count = Math.max(0, parseInt(houseCounts[idx], 10) || 0);
            if (count === 0) {
                overlay.appendChild(propertySpaces[idx].el);
                continue;
            }
            var dir = propertySpaces[idx].direction;
            var top1 = dir === "down" ? -houseUpDownOffset : houseUpDownOffset;
            var top3 = dir === "down" ? houseUpDownOffset : -houseUpDownOffset;
            var z1 = dir === "down" ? 1 : 3;
            var z3 = dir === "down" ? 3 : 1;
            var colorTints = { brown: "#c49a6c", cyan: "#68ddff", pink: "#f4a0d4", orange: "#f7931d", red: "#ff3e4b", yellow: "#ffff40", green: "#47be82", blue: "#1b75bb" };
            var tintHex = colorTints[color] || colorTints.brown;
            var houseImgSrc = "games/board/house.png";
            var hi;
            for (hi = 0; hi < count; hi++) {
                var row = Math.floor(hi / 3);
                var col = hi % 3;
                var wp = col === 0 ? { left: houseSideOffset, top: top3 - row * houseUp, z: z3 } : (col === 1 ? { left: 0, top: -row * houseUp, z: 2 } : { left: -houseSideOffset, top: top1 - row * houseUp, z: z1 });
                var houseEl = document.createElement("img");
                houseEl.src = houseImgSrc;
                houseEl.alt = "";
                houseEl.className = "board-property-house";
                var wrapper = document.createElement("div");
                wrapper.className = "board-property-house-wrap";
                wrapper.style.position = "absolute";
                wrapper.style.left = wp.left + "px";
                wrapper.style.top = wp.top + "px";
                wrapper.style.width = houseSize + "px";
                wrapper.style.height = houseSize + "px";
                wrapper.style.zIndex = wp.z;
                var colorLayer = document.createElement("div");
                colorLayer.className = "board-property-house-tint";
                colorLayer.style.position = "absolute";
                colorLayer.style.left = "0";
                colorLayer.style.top = "0";
                colorLayer.style.width = "100%";
                colorLayer.style.height = "100%";
                colorLayer.style.backgroundColor = tintHex;
                colorLayer.style.maskImage = "url(" + houseImgSrc + ")";
                colorLayer.style.maskSize = "contain";
                colorLayer.style.maskPosition = "center";
                colorLayer.style.maskRepeat = "no-repeat";
                colorLayer.style.webkitMaskImage = "url(" + houseImgSrc + ")";
                colorLayer.style.webkitMaskSize = "contain";
                colorLayer.style.webkitMaskPosition = "center";
                colorLayer.style.webkitMaskRepeat = "no-repeat";
                houseEl.style.left = "0";
                houseEl.style.top = "0";
                houseEl.style.width = "100%";
                houseEl.style.height = "100%";
                houseEl.style.mixBlendMode = "multiply";
                wrapper.appendChild(colorLayer);
                wrapper.appendChild(houseEl);
                propertySpaces[idx].el.appendChild(wrapper);
            }
            overlay.appendChild(propertySpaces[idx].el);
        }
        var playerContainer = document.createElement("div");
        playerContainer.className = "board-player-container";
        var startPos = positions[currentPlayerPosition] || positions[0];
        playerContainer.style.left = startPos.x + "%";
        playerContainer.style.top = startPos.y + "%";
        var playerBounce = document.createElement("div");
        playerBounce.className = "board-player-bounce";
        var player = document.createElement("img");
        player.src = "games/board/player.png";
        player.alt = "Player";
        player.className = "board-player";
        playerBounce.appendChild(player);
        playerContainer.appendChild(playerBounce);
        overlay.appendChild(playerContainer);
        updatePlayerZOrder();
        requestAnimationFrame(function() {
            centerWrapper();
        });
        setTimeout(function() {
            centerWrapper();
        }, 100);
    }

    var centerLoopActive = false;

    function centerWrapper() {
        var wrapper = document.querySelector("#board .board-wrapper");
        var playerContainer = document.querySelector("#board .board-player-container");
        if (!wrapper || !playerContainer) return;
        var h = window.innerHeight;
        var w = window.innerWidth;
        var centerX = w / 2;
        var centerY = (h - 60) / 2;
        var currentX = 0, currentY = 0;
        if (typeof gsap !== "undefined") {
            currentX = parseFloat(gsap.getProperty(wrapper, "x")) || 0;
            currentY = parseFloat(gsap.getProperty(wrapper, "y")) || 0;
        } else if (wrapper.style.transform) {
            var m = wrapper.style.transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
            if (m) currentX = parseFloat(m[1]);
        }
        var dx, dy;
        if (h < 700) {
            var containerRect = playerContainer.getBoundingClientRect();
            var containerCenterX = containerRect.left + containerRect.width / 2;
            var containerCenterY = containerRect.top + containerRect.height / 2;
            var fullCenterY = currentY + (centerY - containerCenterY);
            dx = currentX + (centerX - containerCenterX);
            dy = fullCenterY * 0.5;
        } else if (w >= 1000) {
            var wrapperRect = wrapper.getBoundingClientRect();
            var wrapperCenterX = wrapperRect.left + wrapperRect.width / 2;
            var wrapperCenterY = wrapperRect.top + wrapperRect.height / 2;
            var desktopCenterY = centerY + 50;
            dx = currentX + (centerX - wrapperCenterX);
            dy = currentY + (desktopCenterY - wrapperCenterY);
        } else {
            var containerRect = playerContainer.getBoundingClientRect();
            var containerCenterX = containerRect.left + containerRect.width / 2;
            var wrapperRect = wrapper.getBoundingClientRect();
            var wrapperCenterY = wrapperRect.top + wrapperRect.height / 2;
            dx = currentX + (centerX - containerCenterX);
            dy = currentY + (centerY - wrapperCenterY);
        }
        if (typeof gsap !== "undefined") {
            gsap.set(wrapper, { x: dx, y: dy, scale: 0.5 });
        } else {
            wrapper.style.transform = "translate(" + dx + "px, " + dy + "px) scale(0.5)";
        }
    }
    window.boardCenterWrapper = centerWrapper;

    function centerLoop() {
        if (!centerLoopActive) return;
        centerWrapper();
        requestAnimationFrame(centerLoop);
    }

    var diePips = {
        1: [[50, 50]],
        2: [[25, 25], [75, 75]],
        3: [[25, 25], [50, 50], [75, 75]],
        4: [[25, 25], [75, 25], [25, 75], [75, 75]],
        5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
        6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
    };

    function setDieFace(dieEl, value) {
        dieEl.innerHTML = "";
        var pips = diePips[value] || diePips[1];
        for (var i = 0; i < pips.length; i++) {
            var dot = document.createElement("div");
            dot.className = "board-die-dot";
            dot.style.left = pips[i][0] + "%";
            dot.style.top = pips[i][1] + "%";
            dieEl.appendChild(dot);
        }
    }

    function rollDie() {
        return Math.floor(Math.random() * 6) + 1;
    }

    function showDiceRoll(callback) {
        var overlay = document.createElement("div");
        overlay.className = "board-dice-overlay";
        var container = document.createElement("div");
        container.className = "board-dice-container";
        var die = document.createElement("div");
        die.className = "board-die";
        container.appendChild(die);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        var duration = 1050;
        var interval = 45;
        var elapsed = 0;
        var finalVal = rollDie();
        var lastShown = 0;
        function rollDieDifferentFrom(avoid) {
            if (avoid < 1 || avoid > 6) return rollDie();
            var n = Math.floor(Math.random() * 5) + 1;
            return n >= avoid ? n + 1 : n;
        }
        var fadeInDuration = 0.3;
        var fadeOutDuration = 0.5;
        playBoardSound("journey_dieRoll");
        if (typeof gsap !== "undefined") {
            gsap.set(overlay, { opacity: 0 });
            gsap.set(container, { opacity: 0, scale: 0 });
            gsap.to(overlay, { opacity: 1, duration: fadeInDuration });
            gsap.to(container, { opacity: 1, scale: 1, duration: fadeInDuration, ease: "back.out(1.2)" });
        }
        var tick = function() {
            elapsed += interval;
            var showVal = elapsed < duration ? rollDieDifferentFrom(lastShown) : finalVal;
            lastShown = showVal;
            setDieFace(die, showVal);
            if (elapsed >= duration) {
                clearInterval(timer);
                playBoardSound("journey_dice");
                setTimeout(function() {
                    if (overlay.parentNode) {
                        if (typeof gsap !== "undefined") {
                            gsap.to(overlay, { opacity: 0, duration: fadeOutDuration });
                            gsap.to(container, { opacity: 0, scale: 0, duration: fadeOutDuration, ease: "back.in(1.2)" }).eventCallback("onComplete", function() {
                                if (overlay.parentNode) overlay.remove();
                                if (typeof callback === "function") callback(finalVal);
                            });
                        } else {
                            overlay.remove();
                            if (typeof callback === "function") callback(finalVal);
                        }
                    } else if (typeof callback === "function") {
                        callback(finalVal);
                    }
                }, 750);
            }
        };
        var timer = setInterval(tick, interval);
        tick();
    }

    function movePlayer(spaces, onComplete) {
        var positions = getSpacePositions();
        var container = document.querySelector("#board .board-player-container");
        var playerBounce = document.querySelector("#board .board-player-bounce");
        if (!container || !playerBounce) {
            if (typeof onComplete === "function") onComplete();
            return;
        }
        var totalDuration = 0.3;
        var halfDuration = totalDuration / 2;
        var tl = typeof gsap !== "undefined" ? gsap.timeline() : null;
        if (tl) {
            var extraDelay = 0;
            var showedGoPopup = false;

            for (var s = 0; s < spaces; s++) {
                var nextIndex = (currentPlayerPosition + s + 1) % 40;
                var pos = positions[nextIndex];
                if (!pos) continue;

                var startTime = s * totalDuration + extraDelay;
                var endTime = startTime + totalDuration;

                tl.to(container, {
                    left: pos.x + "%",
                    top: pos.y + "%",
                    duration: totalDuration,
                    ease: "power2.out"
                }, startTime);
                tl.to(playerBounce, {
                    y: -50,
                    duration: halfDuration,
                    ease: "quint.out"
                }, startTime);
                tl.to(playerBounce, {
                    y: -20,
                    duration: halfDuration,
                    ease: "quint.out"
                }, startTime + halfDuration);

                // If this step lands on GO (index 0) and we haven't already handled it this move:
                if (!showedGoPopup && nextIndex === 0) {
                    showedGoPopup = true;

                    // At the moment we finish stepping onto GO: advance level, set background, then show popup.
                    var popupStart = endTime;

                    tl.call(function () {
                        advanceJourneyLevel();
                    }, [], popupStart);

                    // Prepare and animate the "REACHED LEVEL X" popup (shows new level after advance)
                    tl.call(function () {
                        var popupEl = ensureLevelPopupElement();
                        var level = getCurrentJourneyLevelLabel();
                        popupEl.textContent = "REACHED LEVEL " + level;
                    }, [], popupStart);

                    (function(popupStartLocal) {
                        var popupElLocal = ensureLevelPopupElement();
                        tl.set(popupElLocal, { opacity: 0, scale: 0.9 }, popupStartLocal);
                        tl.to(popupElLocal, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.25,
                            ease: "back.out(1.5)"
                        }, popupStartLocal);
                        // Hold visible for ~1.5s (gap between tweens)
                        tl.to(popupElLocal, {
                            opacity: 0,
                            scale: 0.9,
                            duration: 0.25,
                            ease: "back.in(1.5)"
                        }, popupStartLocal + 1.75);
                    })(popupStart);

                    // Insert a 2s pause before any subsequent movement starts.
                    extraDelay += 2.0;
                }

                tl.call(function(idx) {
                    currentPlayerPosition = idx;
                    saveBoardPlayerPosition();
                    playBoardSound("journey_move");
                    updatePlayerZOrder();
                }, [nextIndex], endTime);
            }
            centerLoopActive = true;
            requestAnimationFrame(centerLoop);
            tl.eventCallback("onComplete", function() {
                centerLoopActive = false;
                centerWrapper();
                onLandOnSpace();
                if (typeof onComplete === "function") onComplete();
            });
        } else {
            var newIndex = (currentPlayerPosition + spaces) % 40;

            // Detect wrap-around (pass GO) in non-GSAP fallback
            if (spaces > 0 && newIndex < currentPlayerPosition) {
                advanceJourneyLevel();

                // Simple non-GSAP popup (no real pause, but shows the message)
                var el = ensureLevelPopupElement();
                var lvl = getCurrentJourneyLevelLabel();
                el.textContent = "REACHED LEVEL " + lvl;
                el.style.opacity = "1";
                setTimeout(function () {
                    el.style.opacity = "0";
                }, 2000);
            }

            var pos = positions[newIndex];
            if (pos) {
                currentPlayerPosition = newIndex;
                saveBoardPlayerPosition();
                container.style.left = pos.x + "%";
                container.style.top = pos.y + "%";
                updatePlayerZOrder();
                centerWrapper();
                onLandOnSpace();
            }
            if (typeof onComplete === "function") onComplete();
        }
    }

    function init() {
        var board = document.getElementById("board");
        if (!board) return;

        loadBoardPlayerPosition();

        board.classList.add("board-container");

        var wrapper = document.createElement("div");
        wrapper.className = "board-wrapper";

        var img = document.createElement("img");
        img.src = "games/board/board.png";
        img.alt = "Board";
        img.className = "board-image";

        var overlay = document.createElement("div");
        overlay.className = "board-spaces-overlay";

        img.addEventListener("load", function() {
            buildOverlay(overlay);
        });

        var levelOuter = document.createElement("div");
        levelOuter.className = "board-center-level-outer";
        var levelInner = document.createElement("div");
        levelInner.className = "board-center-level-inner";
        levelInner.textContent = "LEVEL " + getCurrentJourneyLevelLabel();
        levelOuter.appendChild(levelInner);

        wrapper.appendChild(img);
        wrapper.appendChild(overlay);
        wrapper.appendChild(levelOuter);
        board.appendChild(wrapper);

        var rollBtn = document.querySelector(".board-roll-button");
        var rollBtnRedGrad = "linear-gradient(to bottom, #df2b51, #c82a48)";
        var rollBtnGreyGrad = "linear-gradient(to bottom, #888888, #666666)";
        if (rollBtn) {
            rollBtn.addEventListener("click", function() {
                if (rollBtn.disabled) return;
                rollBtn.disabled = true;
                if (typeof gsap !== "undefined") {
                    gsap.to(rollBtn, { background: rollBtnGreyGrad, duration: 0.25 });
                } else {
                    rollBtn.style.background = rollBtnGreyGrad;
                }
                var reactivateRoll = function() {
                    rollBtn.disabled = false;
                    if (typeof gsap !== "undefined") {
                        gsap.to(rollBtn, { background: rollBtnRedGrad, duration: 0.25 });
                    } else {
                        rollBtn.style.background = rollBtnRedGrad;
                    }
                };
                diceRolls = Math.max(0, diceRolls - 1);
                updateDiceRollDisplay();
                showDiceRoll(function(total) {
                    movePlayer(total, function() {
                        handleLanding(reactivateRoll);
                    });
                });
            });
        }
        updateBoardStarDisplay();
        updateDiceRollDisplay();
        updateProfileLevelDisplay();

        // Set journey background to the saved level color
        var levelIndex = (getCurrentJourneyLevelLabel() - 1) % JOURNEY_BACKGROUNDS.length;
        if (levelIndex < 0) levelIndex = 0;
        setJourneyBackground(levelIndex);

        // Position board once at the very start (after layout is ready)
        setTimeout(function() {
            if (typeof window.boardCenterWrapper === "function") {
                window.boardCenterWrapper();
            }
        }, 250);

        // Purple load overlay: same as first level, fades out after 1s over 1s
        var loadOverlay = document.getElementById("board-load-overlay");
        if (loadOverlay) {
            if (typeof gsap !== "undefined") {
                gsap.to(loadOverlay, { opacity: 0, duration: 1, delay: 1, onComplete: function() {
                    loadOverlay.style.pointerEvents = "none";
                }});
            } else {
                setTimeout(function() {
                    loadOverlay.style.transition = "opacity 1s";
                    loadOverlay.style.opacity = "0";
                    setTimeout(function() { loadOverlay.style.pointerEvents = "none"; }, 1000);
                }, 1000);
            }
        }

        // Debug / manual background cycle: press "o" to cycle journey-page background
        document.addEventListener("keydown", function (event) {
            if (event.key === "o" || event.key === "O") {
                console.log('[Board] "o" key pressed. cycleJourneyBackground type =', typeof window.cycleJourneyBackground);
                if (typeof window.cycleJourneyBackground === "function") {
                    console.log("[Board] Debug: cycling journey background via \"o\" key");
                    window.cycleJourneyBackground();
                } else {
                    console.log("[Board] cycleJourneyBackground is not defined or not a function");
                }
            }
            if (event.key === "q" || event.key === "Q") {
                try {
                    localStorage.removeItem(BOARD_HOUSES_STORAGE_KEY);
                } catch (e) {}
                var boardEl = document.getElementById("board");
                if (boardEl) {
                    var overlayEl = boardEl.querySelector(".board-spaces-overlay");
                    if (overlayEl) {
                        overlayEl.innerHTML = "";
                        buildOverlay(overlayEl);
                    }
                }
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const drawButton = document.getElementById('prizes-draw-button');
    const overlay = document.getElementById('prizes-overlay');
    const grid = document.getElementById('prizes-overlay-grid');
    const cards = grid ? Array.from(grid.querySelectorAll('.prizes-card')) : [];
    const overlayTitle = document.querySelector('.prizes-overlay-title');
    const prizeSets = [
        {
            name: 'big',
            list: Array.from(document.querySelectorAll('.prize-container .prize-grid.grid-4x4 .prize-box')),
            cols: 4,
            rows: 4,
            image: 'weeklyBackgrounds/thanksgiving_puzzleBig.jpg',
            scroll: 'top',
        },
        {
            name: 'medium',
            list: Array.from(document.querySelectorAll('.prize-container .prize-grid.grid-2x4 .prize-box')),
            cols: 4,
            rows: 2,
            image: 'weeklyBackgrounds/thanksgiving_puzzleMedium.jpg',
            scroll: 'bottom',
        },
        {
            name: 'small',
            list: Array.from(document.querySelectorAll('.prize-container .prize-grid.grid-1x4 .prize-box')),
            cols: 4,
            rows: 1,
            image: 'weeklyBackgrounds/thanksgiving_puzzleSmall.jpg',
            scroll: 'bottom',
        },
    ];
    const scrollContainer = document.querySelector('.prizes-scrollable-content');
    const pieceTweens = new Map();

    if (!drawButton || !overlay || !grid || cards.length === 0) return;

    const stopAllPieceTweens = () => {
        pieceTweens.forEach((tw) => tw.kill());
        pieceTweens.clear();
        prizeSets.forEach((set) => set.list.forEach((box) => gsap.set(box, { filter: 'none' })));
    };

    const scrollToPrizeSection = (where) => {
        if (!scrollContainer) return;
        const targetTop = where === 'top' ? 0 : scrollContainer.scrollHeight;
        // use requestAnimationFrame to ensure layout is current
        requestAnimationFrame(() => {
            scrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
        });
    };

    const resetOverlayCards = () => {
        overlay.style.display = 'flex';
        gsap.set(overlay, { opacity: 0 });
        gsap.to(overlay, {
            opacity: 1,
            duration: 0.75,
            ease: 'power2.out'
        });
        gsap.set(cards, {
            opacity: 0,
            x: 250,
            y: 0,
            rotation: 12,
            scale: 0.9,
            zIndex: 1,
            position: 'relative',
            left: 'auto',
            top: 'auto',
            width: '',
            height: '',
            backgroundImage: '',
            backgroundSize: '',
            backgroundPosition: '',
            backgroundRepeat: '',
            color: '#fff',
            transformOrigin: '50% 50%',
        });
        cards.forEach((c) => {
            c.textContent = '?';
            c.classList.remove('prize-flipped');
            c.style.pointerEvents = '';
            c.style.transform = '';
        });
        if (overlayTitle) {
            gsap.set(overlayTitle, { opacity: 1 });
        }
    };

    // Save tile state to localStorage
    const saveTileState = () => {
        const tileState = {};
        prizeSets.forEach((set) => {
            set.list.forEach((box, idx) => {
                const key = `${set.name}_${idx}`;
                tileState[key] = box.dataset.revealed === '1' ? '1' : '0';
            });
        });
        localStorage.setItem('prizeTiles', JSON.stringify(tileState));
    };

    // Load tile state from localStorage
    const loadTileState = () => {
        const savedState = localStorage.getItem('prizeTiles');
        if (!savedState) return;
        
        try {
            const tileState = JSON.parse(savedState);
            prizeSets.forEach((set) => {
                set.list.forEach((box, idx) => {
                    const key = `${set.name}_${idx}`;
                    if (tileState[key] === '1') {
                        // Restore the tile
                        const col = idx % set.cols;
                        const row = Math.floor(idx / set.cols);
                        const posX = set.cols > 1 ? (col / (set.cols - 1)) * 100 : 0;
                        const posY = set.rows > 1 ? (row / (set.rows - 1)) * 100 : 0;
                        const bgPos = `${posX}% ${posY}%`;
                        const bgSize = `${set.cols * 100}% ${set.rows * 100}%`;
                        
                        box.style.backgroundImage = `url('${set.image}')`;
                        box.style.backgroundSize = bgSize;
                        box.style.backgroundPosition = bgPos;
                        box.style.backgroundRepeat = 'no-repeat';
                        box.dataset.revealed = '1';
                        
                        // Add yoyo brightness tween
                        if (pieceTweens.has(box)) {
                            pieceTweens.get(box).kill();
                        }
                        const tw = gsap.fromTo(
                            box,
                            { filter: 'brightness(1)' },
                            {
                                filter: 'brightness(1.3)',
                                duration: 0.9,
                                yoyo: true,
                                repeat: -1,
                                ease: 'sine.inOut',
                            }
                        );
                        pieceTweens.set(box, tw);
                    } else {
                        box.style.backgroundImage = 'none';
                        box.dataset.revealed = '0';
                        gsap.set(box, { filter: 'none' });
                    }
                });
            });
        } catch (e) {
            console.error('[Prizes] Error loading tile state:', e);
        }
    };

    // Hide all prize pieces on load (but then load saved state)
    const hideAllPrizePieces = () => {
        pieceTweens.forEach((tw) => tw.kill());
        pieceTweens.clear();
        prizeSets.forEach((set) => {
            set.list.forEach((box) => {
                box.style.backgroundImage = 'none';
                box.dataset.revealed = '0';
                gsap.set(box, { filter: 'none' });
            });
        });
    };

    hideAllPrizePieces();
    loadTileState(); // Load saved tiles after hiding all
    
    // Expose reset for external callers (e.g., journey free draw)
    window.resetPrizesOverlay = resetOverlayCards;

    // Lightweight celebratory effect (small burst, quick cleanup)
    const playCelebrate = (parent) => {
        if (!parent) return;
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.inset = '0';
        flash.style.background = 'rgba(255,255,255,0.4)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = 9;
        parent.appendChild(flash);
        gsap.to(flash, { opacity: 0, duration: 0.3, ease: 'power2.out', onComplete: () => flash.remove() });

        const burst = document.createElement('div');
        burst.style.position = 'absolute';
        burst.style.inset = '0';
        burst.style.pointerEvents = 'none';
        burst.style.zIndex = 10;
        parent.appendChild(burst);

        const colors = ['#ffd700', '#ff6b9d', '#df2b51', '#ffffff'];
        const pieces = 15;
        for (let i = 0; i < pieces; i++) {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.width = '6px';
            p.style.height = '10px';
            p.style.background = colors[i % colors.length];
            p.style.left = '50%';
            p.style.top = '50%';
            p.style.borderRadius = '2px';
            burst.appendChild(p);
            const angle = Math.random() * Math.PI * 2;
            const dist = 60 + Math.random() * 60;
            gsap.to(p, {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                rotation: Math.random() * 360,
                opacity: 0,
                duration: 0.8 + Math.random() * 0.4,
                ease: 'power2.out',
                onComplete: () => p.remove(),
            });
        }

        gsap.to(burst, {
            duration: 1.2,
            onComplete: () => burst.remove(),
        });
    };

    // Show overlay on draw with dealing animation
    drawButton.addEventListener('click', () => {
        if (window.removeUsableStars) {
            window.removeUsableStars(4);
            if (window.updateMoveStarsDisplay) window.updateMoveStarsDisplay();
        }
        stopAllPieceTweens();
        resetOverlayCards();

        // Staggered deal-in animation from the right
        gsap.to(cards, {
            opacity: 1,
            x: 0,
            rotation: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
            stagger: 0.03,
        });
    });

    // Handle card selection
    cards.forEach((card) => {
        card.addEventListener('click', () => {
            if (card.classList.contains('prize-flipped')) return;

            // Fade out other cards
            cards.forEach((c) => {
                if (c !== card) {
                    gsap.to(c, { opacity: 0, duration: 0.25, ease: 'power1.out', pointerEvents: 'none' });
                }
            });
            if (overlayTitle) {
                gsap.to(overlayTitle, { opacity: 0, duration: 0.25, ease: 'power1.out' });
            }

            // Bring selected card to absolute positioning for centering
            const overlayRect = overlay.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const startLeft = cardRect.left - overlayRect.left;
            const startTop = cardRect.top - overlayRect.top;
            card.style.position = 'absolute';
            card.style.width = `${cardRect.width}px`;
            card.style.height = `${cardRect.height}px`;
            card.style.left = `${startLeft}px`;
            card.style.top = `${startTop}px`;
            card.style.zIndex = 5;
            card.style.transformOrigin = '50% 50%';

            // Calculate delta to center
            const targetX = (overlayRect.width / 2) - (cardRect.width / 2) - startLeft;
            const targetY = (overlayRect.height / 2) - (cardRect.height / 2) - startTop;

            // Choose a random puzzle piece (1-16)
            const available = [];
            prizeSets.forEach((set) => {
                set.list.forEach((box, idx) => {
                    if (box.dataset.revealed !== '1') {
                        available.push({ set, box, idx });
                    }
                });
            });
            if (available.length === 0) {
                overlay.style.display = 'none';
                overlay.style.opacity = '';
                return;
            }
            const choice = available[Math.floor(Math.random() * available.length)];
            const { set, box: pieceBox, idx: pieceIndex } = choice;
            const col = pieceIndex % set.cols;
            const row = Math.floor(pieceIndex / set.cols);
            const posX = set.cols > 1 ? (col / (set.cols - 1)) * 100 : 0;
            const posY = set.rows > 1 ? (row / (set.rows - 1)) * 100 : 0;
            const bgPos = `${posX}% ${posY}%`;
            const bgSize = `${set.cols * 100}% ${set.rows * 100}%`;

            // Timeline: move to center then flip to reveal puzzle piece
            const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
            tl.to(card, { x: targetX, y: targetY, duration: 0.35 })
              .to(card, { scaleX: 0, duration: 0.22, ease: 'power1.in' })
              .add(() => {
                  card.textContent = '';
                  card.style.backgroundImage = `url('${set.image}')`;
                  card.style.backgroundSize = bgSize;
                  card.style.backgroundPosition = bgPos;
                  card.style.backgroundRepeat = 'no-repeat';
                  card.classList.add('prize-flipped');
                  playCelebrate(overlay);
              })
              .to(card, { scaleX: 1, duration: 0.22, ease: 'power1.out' })
              .to(overlay, {
                  opacity: 0,
                  duration: 0.4,
                  ease: 'power1.out',
                  delay: 2,
                  onComplete: () => {
                      overlay.style.display = 'none';
                      overlay.style.opacity = '';
                  },
              });

            // Reveal corresponding prize tile and add yoyo brightness
            if (pieceBox) {
                pieceBox.style.backgroundImage = `url('${set.image}')`;
                pieceBox.style.backgroundSize = bgSize;
                pieceBox.style.backgroundPosition = bgPos;
                pieceBox.style.backgroundRepeat = 'no-repeat';
                pieceBox.dataset.revealed = '1';
                if (pieceTweens.has(pieceBox)) {
                    pieceTweens.get(pieceBox).kill();
                }
                const tw = gsap.fromTo(
                    pieceBox,
                    { filter: 'brightness(1)' },
                    {
                        filter: 'brightness(1.3)',
                        duration: 0.9,
                        yoyo: true,
                        repeat: -1,
                        ease: 'sine.inOut',
                    }
                );
                pieceTweens.set(pieceBox, tw);

                // Save tile state to localStorage
                saveTileState();

                // Scroll to position based on prize size
                scrollToPrizeSection(set.scroll);
            }
        });
    });
});


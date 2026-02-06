/**
 * Daily Poll - vote then see result (random numbers for now).
 * Uses GSAP to alpha tween out buttons, then fade in result.
 * Layout: poll-vote-area has min-height; result is position absolute overlay so no jump.
 */
(function() {
    'use strict';

    function initPoll() {
        const container = document.querySelector('.poll-container');
        if (!container) return;

        const voteArea = container.querySelector('.poll-vote-area');
        const buttonsWrap = container.querySelector('.poll-buttons');
        const buttons = container.querySelectorAll('.poll-button');
        const resultEl = container.querySelector('.poll-result');

        if (!voteArea || !buttonsWrap || !resultEl || !buttons.length) return;

        // Lock the poll area height based on initial layout so swaps don't cause jumpy resizing.
        const initialHeight = voteArea.offsetHeight;
        if (initialHeight > 0) {
            voteArea.style.height = initialHeight + 'px';
            voteArea.style.overflow = 'hidden';
        }

        let voted = false;

        function showResult(choice) {
            if (voted) return;
            voted = true;

            // Disable buttons immediately so no double tap
            buttons.forEach(function(btn) {
                btn.disabled = true;
                btn.setAttribute('aria-hidden', 'true');
            });

            // Random numbers for now (e.g. 62% vs 38%)
            const firstPct = Math.floor(Math.random() * 40) + 45;
            const secondPct = 100 - firstPct;

            // Use whatever is on the buttons as labels (emoji or text),
            // rather than hard-coded Yes/No.
            const btnArray = Array.from(buttons);
            const firstLabel = (btnArray[0]?.textContent || '').trim();
            const secondLabel = (btnArray[1]?.textContent || '').trim();
            // Match bar colors to button themes (hard-coded to avoid gradient/computed-style issues)
            const firstBg = btnArray[0] && btnArray[0].classList.contains('poll-button-yuck')
                ? '#FF6B6B'
                : '#2DD7A4'; // default yum green
            const secondBg = btnArray[1] && btnArray[1].classList.contains('poll-button-yum')
                ? '#2DD7A4'
                : '#FF6B6B'; // default yuck red

            const resultStats = resultEl.querySelector('.poll-result-stats');
            if (resultStats) {
                resultStats.innerHTML =
                    '<div class="poll-result-row">' +
                        '<div class="poll-result-answer" style="color:' + firstBg + '; transform: translateY(2px);">' + firstLabel + '</div>' +
                        '<div class="poll-result-bar-track"><div class="poll-result-bar-fill" style="width:' + firstPct + '%; background:' + firstBg + ';"></div></div>' +
                        '<div class="poll-result-pct" style="color:' + firstBg + ';">' + firstPct + '%</div>' +
                    '</div>' +
                    '<div class="poll-result-row">' +
                        '<div class="poll-result-answer" style="color:' + secondBg + '; transform: translateY(2px);">' + secondLabel + '</div>' +
                        '<div class="poll-result-bar-track"><div class="poll-result-bar-fill" style="width:' + secondPct + '%; background:' + secondBg + ';"></div></div>' +
                        '<div class="poll-result-pct" style="color:' + secondBg + ';">' + secondPct + '%</div>' +
                    '</div>';
            }

            if (typeof gsap === 'undefined') {
                buttonsWrap.style.opacity = '0';
                buttonsWrap.style.pointerEvents = 'none';
                buttonsWrap.style.display = 'none';              // 2) hide buttons
                resultEl.style.display = 'block';                // 2) show answers
                resultEl.style.opacity = '1';
                resultEl.style.pointerEvents = 'auto';
                return;
            }

            gsap.to(buttonsWrap, {
                opacity: 0,
                duration: 0.35,
                ease: 'power2.out',
                pointerEvents: 'none',
                onComplete: function() {
                    // 2) after fade-out: hide buttons and show answers at the same time
                    buttonsWrap.style.display = 'none';
                    resultEl.style.display = 'block';

                    // 3) fade in answers
                    gsap.fromTo(resultEl, { opacity: 0 }, {
                        opacity: 1,
                        duration: 0.35,
                        ease: 'power2.out',
                        pointerEvents: 'auto'
                    });
                }
            });
        }

        buttons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const choice = btn.classList.contains('poll-button-yum') ? 'yum' : 'yuck';
                showResult(choice);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPoll);
    } else {
        initPoll();
    }
})();

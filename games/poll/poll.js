/**
 * Daily Poll - vote then see result (random numbers for now).
 * Buttons and result are in a container (both position absolute); on vote we expand
 * the container and show result + 2 stars, then award 2 stars.
 */
(function() {
    'use strict';

    function getTodayKey() {
        const t = new Date();
        return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    }

    function fillResultStats(resultEl, buttons, firstPct, secondPct) {
        const btnArray = Array.from(buttons);
        const firstLabel = (btnArray[0]?.textContent || '').trim();
        const secondLabel = (btnArray[1]?.textContent || '').trim();
        const firstBg = btnArray[0] && btnArray[0].classList.contains('poll-button-yuck') ? '#FF6B6B' : '#2DD7A4';
        const secondBg = btnArray[1] && btnArray[1].classList.contains('poll-button-yum') ? '#2DD7A4' : '#FF6B6B';
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
    }

    function awardPollStars() {
        const todayKey = getTodayKey();
        const currentDaily = parseInt(localStorage.getItem('dailyStars_' + todayKey) || '0');
        const currentTotal = parseInt(localStorage.getItem('totalStars') || '0');
        const currentUsable = parseInt(localStorage.getItem('usableStars_' + todayKey) || '0');
        localStorage.setItem('dailyStars_' + todayKey, String(currentDaily + 2));
        localStorage.setItem('totalStars', String(currentTotal + 2));
        localStorage.setItem('usableStars_' + todayKey, String(currentUsable + 2));
        if (window.updateHeaderStarCounter) window.updateHeaderStarCounter();
        if (window.updateWalletStars2) window.updateWalletStars2();
        if (window.updateMoveStarsDisplay) window.updateMoveStarsDisplay();
        if (window.updateCalendar) window.updateCalendar();
    }

    function initPoll() {
        const container = document.querySelector('.poll-container');
        if (!container) return;

        const voteContainer = container.querySelector('.poll-vote-container');
        const buttonsWrap = container.querySelector('.poll-buttons');
        const buttons = container.querySelectorAll('.poll-button');
        const resultEl = container.querySelector('.poll-result');

        if (!voteContainer || !buttonsWrap || !resultEl || !buttons.length) return;

        const todayKey = getTodayKey();
        const alreadyVoted = localStorage.getItem('pollVoted_' + todayKey);

        if (alreadyVoted) {
            const firstPct = parseInt(localStorage.getItem('pollFirstPct_' + todayKey) || '55', 10);
            const secondPct = parseInt(localStorage.getItem('pollSecondPct_' + todayKey) || '45', 10);
            fillResultStats(resultEl, buttons, firstPct, secondPct);
            buttonsWrap.style.display = 'none';
            voteContainer.classList.add('expanded');
            resultEl.style.position = 'static';
            resultEl.style.display = 'flex';
            resultEl.classList.add('visible');
            buttons.forEach(function(btn) {
                btn.disabled = true;
                btn.setAttribute('aria-hidden', 'true');
            });
            return;
        }

        let voted = false;

        function showResult(choice) {
            if (voted) return;
            voted = true;

            buttons.forEach(function(btn) {
                btn.disabled = true;
                btn.setAttribute('aria-hidden', 'true');
            });

            const firstPct = Math.floor(Math.random() * 40) + 45;
            const secondPct = 100 - firstPct;
            fillResultStats(resultEl, buttons, firstPct, secondPct);

            localStorage.setItem('pollVoted_' + todayKey, choice);
            localStorage.setItem('pollFirstPct_' + todayKey, String(firstPct));
            localStorage.setItem('pollSecondPct_' + todayKey, String(secondPct));
            awardPollStars();

            function expandAndShowResult() {
                buttonsWrap.style.display = 'none';
                resultEl.style.position = 'static';
                resultEl.style.display = 'flex';
                resultEl.style.opacity = '0';

                voteContainer.classList.add('expanded');
                const targetHeight = voteContainer.offsetHeight;
                voteContainer.classList.remove('expanded');
                voteContainer.style.height = '88px';
                voteContainer.style.overflow = 'hidden';

                if (typeof gsap !== 'undefined') {
                    gsap.to(voteContainer, {
                        height: targetHeight,
                        duration: 0.5,
                        ease: 'power2.out',
                        overflow: 'hidden',
                        onComplete: function() {
                            voteContainer.classList.add('expanded');
                            voteContainer.style.height = '';
                            voteContainer.style.overflow = '';
                            resultEl.classList.add('visible');
                        }
                    });
                    gsap.to(resultEl, {
                        opacity: 1,
                        duration: 0.4,
                        delay: 0.1,
                        ease: 'power2.out',
                        pointerEvents: 'auto'
                    });
                } else {
                    voteContainer.classList.add('expanded');
                    voteContainer.style.height = '';
                    voteContainer.style.overflow = '';
                    resultEl.style.opacity = '1';
                    resultEl.style.pointerEvents = 'auto';
                    resultEl.classList.add('visible');
                }
            }

            if (typeof gsap !== 'undefined') {
                gsap.to(buttonsWrap, {
                    opacity: 0,
                    duration: 0.35,
                    ease: 'power2.out',
                    pointerEvents: 'none',
                    onComplete: expandAndShowResult
                });
            } else {
                buttonsWrap.style.opacity = '0';
                buttonsWrap.style.pointerEvents = 'none';
                expandAndShowResult();
            }
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

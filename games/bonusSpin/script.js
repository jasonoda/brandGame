// Bonus Spin Game - Under Construction

document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const startMenu = document.getElementById('startMenu');
    const container = document.querySelector('.container');
    
    if (playButton) {
        playButton.addEventListener('click', () => {
            // Hide start menu and show container
            if (startMenu) {
                startMenu.style.display = 'none';
            }
            if (container) {
                container.style.display = 'flex';
            }
        });
    }
});

// Handle 'q' key to reset data
document.addEventListener('keydown', (e) => {
    if (e.key === 'q' || e.key === 'Q') {
        // Call the global reset function if available
        if (window.parent && window.parent.resetAllData) {
            window.parent.resetAllData();
        }
    }
});



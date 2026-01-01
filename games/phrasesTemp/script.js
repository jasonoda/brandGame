// Phrases Game - Under Construction

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


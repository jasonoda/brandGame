// Wrapper script to load THREE.js module and assign it to window.THREE
console.log('[LOCAL THREE] Starting THREE.js import...');
import * as THREE from './three.module.min.js';
console.log('[LOCAL THREE] THREE.js module imported:', typeof THREE !== 'undefined');
console.log('[LOCAL THREE] THREE.Scene available:', typeof THREE !== 'undefined' && typeof THREE.Scene !== 'undefined');

// Create a copy of THREE that allows property addition
// Module namespace objects might be frozen/sealed, so we create a new object
const THREE_Wrapper = Object.assign({}, THREE);
window.THREE = THREE_Wrapper;
console.log('[LOCAL THREE] THREE.js assigned to window.THREE as wrapper object');
console.log('[LOCAL THREE] window.THREE.Scene available:', typeof window.THREE !== 'undefined' && typeof window.THREE.Scene !== 'undefined');
console.log('[LOCAL THREE] window.THREE is frozen:', Object.isFrozen(window.THREE));
console.log('[LOCAL THREE] window.THREE is sealed:', Object.isSealed(window.THREE));

// Dispatch event when THREE.js is loaded
function dispatchThreeLoaded() {
    if (typeof window.THREE !== 'undefined' && typeof window.THREE.Scene !== 'undefined') {
        window.dispatchEvent(new Event('three-loaded'));
        console.log('[LOCAL THREE] three-loaded event dispatched');
    } else {
        console.error('[LOCAL THREE] THREE.js loaded but Scene is not available');
        // Retry after a short delay
        setTimeout(dispatchThreeLoaded, 50);
    }
}

// Try immediately
dispatchThreeLoaded();

// Also ensure it's dispatched after a brief delay in case of timing issues
setTimeout(() => {
    if (typeof window.THREE !== 'undefined' && typeof window.THREE.Scene !== 'undefined') {
        window.dispatchEvent(new Event('three-loaded'));
        console.log('[LOCAL THREE] three-loaded event dispatched (delayed check)');
    }
}, 100);


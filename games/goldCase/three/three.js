// Wrapper script to load THREE.js module and assign it to window.THREE
import * as THREE from './three.module.min.js';

// Create a copy of THREE that allows property addition
// Module namespace objects might be frozen/sealed, so we create a new object
const THREE_Wrapper = Object.assign({}, THREE);
window.THREE = THREE_Wrapper;

// Dispatch event when THREE.js is loaded
function dispatchThreeLoaded() {
    if (typeof window.THREE !== 'undefined' && typeof window.THREE.Scene !== 'undefined') {
        window.dispatchEvent(new Event('three-loaded'));
    } else {
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
    }
}, 100);


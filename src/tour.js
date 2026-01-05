/**
 * Virtual Home Tour Application
 * 
 * A production-quality 3D panoramic home tour built with Pannellum.
 * Features smooth scene transitions, interactive hotspots, and responsive design.
 * 
 * @author Senior Frontend Engineer
 * @version 1.0.0
 */

import './style.css';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Scene configuration for all rooms in the tour.
 * Each scene contains positioning data, navigation links, and hotspot placements.
 * 
 * Hotspot coordinates (yaw/pitch) are based on equirectangular projection:
 * - Yaw: horizontal angle in degrees (-180 to 180, 0 = front center)
 * - Pitch: vertical angle in degrees (-90 to 90, 0 = horizon)
 * 
 * To add more rooms:
 * 1. Add a new entry to SCENE_CONFIG with a unique key
 * 2. Add the panorama image to /panos/ directory
 * 3. Define hotspots with yaw/pitch coordinates pointing to other scenes
 * 4. Update existing scenes' hotspots to link to the new room
 */
const SCENE_CONFIG = {
    // Living Room - The main entry point and central hub
    'living-room': {
        id: 'living-room',
        title: 'Living Room',
        description: 'Bright, modern living space with large windows',
        image: '/panos/living-room.jpg',

        // Initial camera position when entering this scene
        // These values position the view to highlight the main features
        initialView: {
            yaw: 0,           // Start facing the main window/TV area
            pitch: 0,         // Eye level
            hfov: 110         // Wide field of view for spacious feel
        },

        // Navigation hotspots linking to other rooms
        // Positioned based on logical room layout
        hotspots: [
            {
                targetScene: 'open-living-kitchen',
                yaw: -90,         // To the left - kitchen area
                pitch: -5,        // Slightly below eye level
                label: 'Open Living & Kitchen'
            },
            {
                targetScene: 'lounge',
                yaw: 110,          // To the right - lounge area
                pitch: 0,
                label: 'Lounge'
            }
        ],

        // Accent color for UI elements (matches room aesthetic)
        accentColor: '#6366f1'
    },

    // Open Living & Kitchen - Connected open-plan space
    'open-living-kitchen': {
        id: 'open-living-kitchen',
        title: 'Open Living & Kitchen',
        description: 'Spacious open-plan living and kitchen area',
        image: '/panos/open-living-kitchen.jpg',

        initialView: {
            yaw: 45,          // Angled to show both living and kitchen areas
            pitch: 0,
            hfov: 110
        },

        hotspots: [
            {
                targetScene: 'living-room',
                yaw: -120,        // Back towards living room
                pitch: 0,
                label: 'Living Room'
            }
        ],

        accentColor: '#8b5cf6'
    },

    // Lounge - Luxury circular sitting area
    'lounge': {
        id: 'lounge',
        title: 'Lounge',
        description: 'Luxury circular sitting area with architectural design',
        image: '/panos/lounge.jpg',

        initialView: {
            yaw: 0,           // Face the central seating
            pitch: -5,        // Slight downward angle for the curved sofa
            hfov: 105         // Slightly narrower for intimate feel
        },

        hotspots: [
            {
                targetScene: 'living-room',
                yaw: 160,         // Behind - back to living room
                pitch: 0,
                label: 'Living Room'
            },
            {
                targetScene: 'music-room',
                yaw: -60,         // Adjacent - to the music room
                pitch: 0,
                label: 'Music Room'
            }
        ],

        accentColor: '#d946ef'
    },

    // Music Room - Cozy study with instruments
    'music-room': {
        id: 'music-room',
        title: 'Music Room',
        description: 'Cozy music room with piano and guitar, featuring wood ceiling',
        image: '/panos/music-room.jpg',

        initialView: {
            yaw: -30,         // Angled to show piano and fireplace
            pitch: 5,         // Slightly up to show wood ceiling
            hfov: 100         // Narrower FOV for cozy feeling
        },

        hotspots: [
            {
                targetScene: 'lounge',
                yaw: 140,         // Back towards lounge
                pitch: 0,
                label: 'Lounge'
            }
        ],

        accentColor: '#f59e0b'
    }
};

/**
 * Global viewer settings for Pannellum.
 * These affect performance, usability, and visual quality.
 */
const VIEWER_SETTINGS = {
    // Pitch limits prevent viewing distorted ceiling/floor areas
    minPitch: -50,            // Maximum downward angle
    maxPitch: 50,             // Maximum upward angle

    // Field of view constraints
    minHfov: 50,              // Maximum zoom in
    maxHfov: 120,             // Maximum zoom out (wide angle)

    // Interaction settings
    autoLoad: true,           // Load panorama immediately
    compass: false,           // Hide compass (clean UI preference)
    showControls: false,      // Hide default controls (custom UI)
    mouseZoom: true,          // Enable scroll wheel zoom
    keyboardZoom: true,       // Enable +/- keys for zoom
    friction: 0.15,           // Smooth deceleration after mouse drag

    // Performance settings
    hfov: 110,                // Default horizontal field of view

    // Touch/mobile settings
    touchPanSpeedCoeffFactor: 0.5,  // Slower pan on touch for precision

    // Animation settings for auto-rotate (disabled by default)
    autoRotate: 0,            // Degrees per second (0 = disabled)
    autoRotateInactivityDelay: 5000  // ms before auto-rotate starts
};

/**
 * Default starting scene when the tour loads.
 * Change this to start from a different room.
 */
const DEFAULT_SCENE = 'living-room';

/**
 * Transition duration in milliseconds for scene changes.
 * Lower = snappier, Higher = smoother
 */
const TRANSITION_DURATION = 400;


// ============================================================================
// APPLICATION STATE
// ============================================================================

/**
 * Central application state object.
 * Tracks the current scene, viewer instance, and UI state.
 */
const state = {
    currentScene: null,
    viewer: null,
    isTransitioning: false,
    isFirstLoad: true
};


// ============================================================================
// DOM REFERENCES
// ============================================================================

/**
 * Cached DOM element references for performance.
 * Queried once on initialization.
 */
const elements = {
    panorama: null,
    loadingScreen: null,
    sceneTransition: null,
    currentRoomName: null,
    roomButtons: null,
    roomCounter: null,
    mobileHint: null,
    btnZoomIn: null,
    btnZoomOut: null,
    btnFullscreen: null,
    header: null,
    roomNav: null,
    controlsPanel: null
};


// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application when DOM is ready.
 */
function init() {
    cacheElements();
    initializeViewer();
    renderRoomButtons();
    setupEventListeners();
    showMobileHint();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


/**
 * Cache DOM elements for faster access.
 */
function cacheElements() {
    elements.panorama = document.getElementById('panorama');
    elements.loadingScreen = document.getElementById('loading-screen');
    elements.sceneTransition = document.getElementById('scene-transition');
    elements.currentRoomName = document.getElementById('current-room-name');
    elements.roomButtons = document.getElementById('room-buttons');
    elements.roomCounter = document.getElementById('room-counter');
    elements.mobileHint = document.getElementById('mobile-hint');
    elements.btnZoomIn = document.getElementById('btn-zoom-in');
    elements.btnZoomOut = document.getElementById('btn-zoom-out');
    elements.btnFullscreen = document.getElementById('btn-fullscreen');
    elements.header = document.getElementById('header');
    elements.roomNav = document.getElementById('room-nav');
    elements.controlsPanel = document.getElementById('controls-panel');
}


/**
 * Initialize the Pannellum viewer with the default scene.
 */
function initializeViewer() {
    const scene = SCENE_CONFIG[DEFAULT_SCENE];
    state.currentScene = DEFAULT_SCENE;

    state.viewer = pannellum.viewer('panorama', {
        type: 'equirectangular',
        panorama: scene.image,

        // Apply initial view settings
        yaw: scene.initialView.yaw,
        pitch: scene.initialView.pitch,
        hfov: scene.initialView.hfov,

        // Apply global settings
        ...VIEWER_SETTINGS,

        // Hotspots for this scene
        hotSpots: createHotspots(scene.hotspots)
    });

    // Event: Panorama loaded
    state.viewer.on('load', () => {
        hideLoadingScreen();
        updateUI();
    });

    // Event: Scene rendering error
    state.viewer.on('error', (error) => {
        console.error('Pannellum error:', error);
        // Fallback error handling could show a user-friendly message
    });
}


// ============================================================================
// SCENE MANAGEMENT
// ============================================================================

/**
 * Navigate to a different scene with a smooth transition.
 * 
 * @param {string} sceneId - The ID of the target scene
 */
async function navigateToScene(sceneId) {
    // Guard against invalid or redundant navigation
    if (!SCENE_CONFIG[sceneId] || sceneId === state.currentScene) {
        return;
    }

    // Prevent rapid clicking during transitions
    if (state.isTransitioning) {
        return;
    }

    state.isTransitioning = true;
    const scene = SCENE_CONFIG[sceneId];

    // Start fade-out transition
    elements.sceneTransition.classList.add('active');

    // Wait for fade-out
    await delay(TRANSITION_DURATION);

    // Load the new scene
    state.viewer.destroy();
    state.currentScene = sceneId;

    state.viewer = pannellum.viewer('panorama', {
        type: 'equirectangular',
        panorama: scene.image,
        yaw: scene.initialView.yaw,
        pitch: scene.initialView.pitch,
        hfov: scene.initialView.hfov,
        ...VIEWER_SETTINGS,
        hotSpots: createHotspots(scene.hotspots)
    });

    // Wait for scene to load
    state.viewer.on('load', () => {
        // Fade in
        elements.sceneTransition.classList.remove('active');
        state.isTransitioning = false;
        updateUI();
    });

    state.viewer.on('error', () => {
        elements.sceneTransition.classList.remove('active');
        state.isTransitioning = false;
    });
}


/**
 * Create Pannellum hotspot configurations from scene data.
 * 
 * @param {Array} hotspots - Array of hotspot definitions
 * @returns {Array} - Pannellum-formatted hotspot configurations
 */
function createHotspots(hotspots) {
    return hotspots.map(hotspot => ({
        pitch: hotspot.pitch,
        yaw: hotspot.yaw,
        type: 'custom',
        createTooltipFunc: createCustomHotspot,
        createTooltipArgs: {
            label: hotspot.label,
            targetScene: hotspot.targetScene
        },
        clickHandlerFunc: (event, args) => {
            navigateToScene(args.targetScene);
        },
        clickHandlerArgs: {
            targetScene: hotspot.targetScene
        }
    }));
}


/**
 * Create a custom hotspot element with styling and tooltip.
 * 
 * @param {HTMLElement} hotSpotDiv - The container element from Pannellum
 * @param {Object} args - Custom arguments (label, targetScene)
 */
function createCustomHotspot(hotSpotDiv, args) {
    // Clear default content
    hotSpotDiv.classList.add('custom-hotspot');

    // Add navigation arrow icon
    hotSpotDiv.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" 
                  d="M9 5l7 7-7 7"></path>
        </svg>
        <span class="hotspot-tooltip">${args.label}</span>
    `;
}


// ============================================================================
// UI UPDATES
// ============================================================================

/**
 * Update all UI elements to reflect the current state.
 */
function updateUI() {
    const scene = SCENE_CONFIG[state.currentScene];
    const sceneIds = Object.keys(SCENE_CONFIG);
    const currentIndex = sceneIds.indexOf(state.currentScene) + 1;

    // Update room name badge
    elements.currentRoomName.textContent = scene.title;

    // Update room counter
    elements.roomCounter.textContent = `${currentIndex} of ${sceneIds.length}`;

    // Update room button active states
    updateRoomButtonStates();
}


/**
 * Render the room navigation buttons.
 */
function renderRoomButtons() {
    const scenes = Object.values(SCENE_CONFIG);

    elements.roomButtons.innerHTML = scenes.map((scene, index) => `
        <button 
            id="room-btn-${scene.id}"
            class="room-btn group relative rounded-xl border border-white/10 bg-white/5 px-3 py-3 md:px-4 md:py-3.5 
                   text-left transition-all duration-200 hover:border-white/20 hover:bg-white/10 
                   focus:outline-none focus:ring-2 focus:ring-tour-primary/50"
            data-scene="${scene.id}"
            aria-label="Navigate to ${scene.title}"
        >
            <div class="flex items-center gap-3">
                <div class="room-dot bg-white/30 flex-shrink-0" data-scene="${scene.id}"></div>
                <div class="min-w-0">
                    <span class="block text-sm md:text-base font-medium text-white truncate">${scene.title}</span>
                    <span class="block text-xs text-gray-400 truncate hidden sm:block">${scene.description.slice(0, 35)}...</span>
                </div>
            </div>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </div>
        </button>
    `).join('');

    // Add click listeners to room buttons
    scenes.forEach(scene => {
        const btn = document.getElementById(`room-btn-${scene.id}`);
        btn.addEventListener('click', () => navigateToScene(scene.id));
    });

    // Set initial active state
    updateRoomButtonStates();
}


/**
 * Update the active state of room buttons.
 */
function updateRoomButtonStates() {
    const buttons = elements.roomButtons.querySelectorAll('.room-btn');
    const dots = elements.roomButtons.querySelectorAll('.room-dot');

    buttons.forEach(btn => {
        const isActive = btn.dataset.scene === state.currentScene;
        btn.classList.toggle('active', isActive);
    });

    dots.forEach(dot => {
        const isActive = dot.dataset.scene === state.currentScene;
        dot.classList.toggle('active', isActive);
    });
}


/**
 * Hide the loading screen with a fade animation.
 */
function hideLoadingScreen() {
    elements.loadingScreen.classList.add('hidden');

    // Remove from DOM after animation
    setTimeout(() => {
        elements.loadingScreen.style.display = 'none';
    }, 500);
}


/**
 * Show mobile interaction hint briefly on first load.
 */
function showMobileHint() {
    if (!state.isFirstLoad) return;

    // Only show on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice && window.innerWidth < 768) {
        setTimeout(() => {
            elements.mobileHint.style.opacity = '1';

            setTimeout(() => {
                elements.mobileHint.style.opacity = '0';
                state.isFirstLoad = false;
            }, 3000);
        }, 1500);
    }
}


// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Set up all event listeners for the application.
 */
function setupEventListeners() {
    // Zoom controls
    elements.btnZoomIn?.addEventListener('click', () => {
        const currentHfov = state.viewer.getHfov();
        state.viewer.setHfov(Math.max(currentHfov - 10, VIEWER_SETTINGS.minHfov));
    });

    elements.btnZoomOut?.addEventListener('click', () => {
        const currentHfov = state.viewer.getHfov();
        state.viewer.setHfov(Math.min(currentHfov + 10, VIEWER_SETTINGS.maxHfov));
    });

    // Fullscreen toggle
    elements.btnFullscreen?.addEventListener('click', toggleFullscreen);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Handle window resize
    window.addEventListener('resize', debounce(handleResize, 250));

    // Fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}


/**
 * Handle keyboard navigation shortcuts.
 * 
 * @param {KeyboardEvent} event
 */
function handleKeyboardNavigation(event) {
    const sceneIds = Object.keys(SCENE_CONFIG);
    const currentIndex = sceneIds.indexOf(state.currentScene);

    switch (event.key) {
        case 'ArrowRight':
        case 'n':
            // Navigate to next room
            const nextIndex = (currentIndex + 1) % sceneIds.length;
            navigateToScene(sceneIds[nextIndex]);
            break;

        case 'ArrowLeft':
        case 'p':
            // Navigate to previous room
            const prevIndex = (currentIndex - 1 + sceneIds.length) % sceneIds.length;
            navigateToScene(sceneIds[prevIndex]);
            break;

        case 'f':
            // Toggle fullscreen
            toggleFullscreen();
            break;

        case '1':
        case '2':
        case '3':
        case '4':
            // Quick jump to room by number
            const roomIndex = parseInt(event.key) - 1;
            if (sceneIds[roomIndex]) {
                navigateToScene(sceneIds[roomIndex]);
            }
            break;
    }
}


/**
 * Handle fullscreen change events to toggle UI visibility.
 */
function handleFullscreenChange() {
    const doc = window.document;
    const isFullscreen = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;

    const uiElements = [elements.header, elements.roomNav];

    uiElements.forEach(el => {
        if (el) {
            if (isFullscreen) {
                el.style.display = 'none';
            } else {
                el.style.display = '';
            }
        }
    });
}


/**
 * Toggle fullscreen mode.
 */
function toggleFullscreen() {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        if (requestFullScreen) {
            requestFullScreen.call(docEl);
        }
    } else {
        if (cancelFullScreen) {
            cancelFullScreen.call(doc);
        }
    }
}


/**
 * Handle window resize events.
 * Adjusts the viewer for responsive layouts.
 */
function handleResize() {
    // Pannellum handles resize automatically, but we can adjust settings
    const isMobile = window.innerWidth < 768;

    // Optionally adjust FOV for mobile
    if (state.viewer && state.currentScene) {
        const scene = SCENE_CONFIG[state.currentScene];
        // Mobile might benefit from slightly narrower FOV
        const targetHfov = isMobile ? Math.min(scene.initialView.hfov, 100) : scene.initialView.hfov;
        // Only adjust if significantly different to avoid jarring changes
        if (Math.abs(state.viewer.getHfov() - targetHfov) > 15) {
            state.viewer.setHfov(targetHfov);
        }
    }
}


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Promisified delay function.
 * 
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Resolves after the delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Debounce function to limit rapid calls.
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


// ============================================================================
// EXPORTS (for potential external use or testing)
// ============================================================================

// Expose key functions if needed for external scripting
window.HomeTour = {
    navigateToScene,
    getCurrentScene: () => state.currentScene,
    getScenes: () => Object.keys(SCENE_CONFIG),
    getSceneConfig: () => SCENE_CONFIG
};

// Function to check if we're on a video page
function isVideoPage() {
    return window.location.pathname === '/watch' && window.location.search.includes('v=');
}

// Function to handle title visibility
function updateTitleVisibility(hide) {
    if (!isVideoPage()) return;
    
    // Get all title elements
    const mainTitle = document.querySelector('ytd-watch-metadata h1.ytd-watch-metadata');
    const fullscreenTitle = document.querySelector('.ytp-title');
    const originalTitle = document.querySelector('title');
    
    // Remove any inline styles that might have been set
    if (mainTitle) {
        mainTitle.style.removeProperty('visibility');
        if (!hide) {
            // Force visibility by adding a class
            mainTitle.classList.remove('title-hidden');
        } else {
            mainTitle.classList.add('title-hidden');
        }
    }
    
    if (fullscreenTitle) {
        fullscreenTitle.style.removeProperty('display');
        if (!hide) {
            fullscreenTitle.classList.remove('title-hidden');
        } else {
            fullscreenTitle.classList.add('title-hidden');
        }
    }
    
    // Handle page title
    if (hide) {
        if (!mainTitle?.dataset.originalTitle && originalTitle) {
            mainTitle?.setAttribute('data-original-title', originalTitle.textContent);
        }
        document.title = "YouTube";
    } else {
        // Restore original title if available
        const savedTitle = mainTitle?.getAttribute('data-original-title');
        if (savedTitle) {
            document.title = savedTitle;
        }
    }
}

// Add debounce to prevent too frequent updates
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

// Add styles to the page
const style = document.createElement('style');
style.textContent = `
    .title-hidden {
        visibility: hidden !important;
        display: none !important;
    }
`;
document.head.appendChild(style);

let currentHideState = true; // Default state

// Get initial state and set up observers
chrome.storage.sync.get(['hideTitles'], function(result) {
    currentHideState = result.hideTitles !== false; // Default to true if not set
    
    // Initial setup
    const setupObservers = () => {
        updateTitleVisibility(currentHideState);
        
        // Create an observer for dynamic content changes
        const bodyObserver = new MutationObserver(debounce(() => {
            if (isVideoPage()) {
                updateTitleVisibility(currentHideState);
            }
        }, 100));
        
        // Start observing the body for changes
        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
    };

    // Wait for page load or run immediately if already loaded
    if (document.readyState === 'loading') {
        window.addEventListener('load', setupObservers);
    } else {
        setupObservers();
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleTitles') {
        currentHideState = message.hide;
        updateTitleVisibility(currentHideState);
    }
});

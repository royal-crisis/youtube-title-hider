// Function to check if we're on a video page
function isVideoPage() {
    return window.location.pathname === '/watch' && window.location.search.includes('v=');
}

// Function to hide the document title
function hideDocumentTitle() {
    if (isVideoPage()) {
        document.title = "YouTube";
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

// Function to handle title visibility
const updateTitleVisibility = debounce(() => {
    if (!isVideoPage()) return;
    
    const mainTitle = document.querySelector('ytd-watch-metadata h1.ytd-watch-metadata');
    if (mainTitle) {
        mainTitle.style.visibility = 'hidden';
    }
}, 100);

// Wait for the page to be ready
window.addEventListener('load', () => {
    // Initial title hide
    hideDocumentTitle();
    updateTitleVisibility();

    // Create an observer to watch for title changes
    const titleElement = document.querySelector('title');
    if (titleElement) {
        const titleObserver = new MutationObserver(debounce(hideDocumentTitle, 100));
        titleObserver.observe(titleElement, {
            subtree: true,
            characterData: true,
            childList: true
        });
    }

    // Create an observer for dynamic content changes
    const bodyObserver = new MutationObserver(debounce((mutations) => {
        if (isVideoPage()) {
            updateTitleVisibility();
        }
    }, 100));

    // Start observing the body for changes
    bodyObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
});

// Handle URL changes
let lastUrl = location.href;
const urlObserver = new MutationObserver(debounce(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        hideDocumentTitle();
        updateTitleVisibility();
    }
}, 100));

urlObserver.observe(document, {
    subtree: true,
    childList: true,
    attributes: false,
    characterData: false
});

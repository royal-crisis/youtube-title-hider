// Get the toggle element
const toggle = document.getElementById('titleToggle');

// Load the saved state
chrome.storage.sync.get(['hideTitles'], function(result) {
  toggle.checked = result.hideTitles !== false; // Default to true if not set
});

// Save state changes
toggle.addEventListener('change', function() {
  const isChecked = toggle.checked;
  
  // Save the state
  chrome.storage.sync.set({ hideTitles: isChecked });
  
  // Send message to content script
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0].url.includes('youtube.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleTitles',
        hide: isChecked
      });
    }
  });
});

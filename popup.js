// Pages
const loginPage = document.getElementById('loginPage');
const mainPage = document.getElementById('mainPage');

// Elements
const apiKeyInput = document.getElementById('apiKeyInput');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const addBookmark = document.getElementById('addBookmark');
const currentUrl = document.getElementById('currentUrl');
const status = document.getElementById('status');
const loadingOverlay = document.getElementById('loadingOverlay');

// Check if user is logged in
chrome.storage.local.get(['apiKey', 'isValidated'], function(result) {
    if (result.apiKey && result.isValidated) {
        showPage(mainPage);
        updateCurrentPage();
    } else if (result.apiKey) {
        showLoading();
        validateApiKey(result.apiKey).then(isValid => {
            if (isValid) {
                chrome.storage.local.set({isValidated: true});
                showPage(mainPage);
                updateCurrentPage();
            } else {
                showPage(loginPage);
                showStatus('Invalid API key. Please sign in again.', 'error');
            }
            hideLoading();
        });
    } else {
        showPage(loginPage);
    }
});

// Sign In
signInBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        showLoading();
        showStatus('Validating API key...', 'info');
        validateApiKey(apiKey).then(isValid => {
            if (isValid) {
                chrome.storage.local.set({
                    apiKey: apiKey,
                    isValidated: true
                }, function() {
                    showPage(mainPage);
                    updateCurrentPage();
                    showStatus('Signed in successfully', 'success');
                });
            } else {
                showStatus('Invalid API key. Please try again.', 'error');
            }
            hideLoading();
        });
    } else {
        showStatus('Please enter an API key', 'error');
    }
});

// Sign Out
signOutBtn.addEventListener('click'	, () => {
    chrome.storage.local.remove(['apiKey', 'isValidated'], function() {
        apiKeyInput.value = '';
        showPage(loginPage);
        showStatus('Signed out successfully', 'success');
    });
});

// Add Bookmark (updated to handle API errors and duplicate bookmarks)
addBookmark.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        showStatus('Processing...', 'info');
        
        chrome.runtime.sendMessage({
            type: 'ANALYZE_PAGE',
            url: tab.url,
            title: tab.title
        }, function(response) {
            if (response.success) {
                // Show success message with the path
                const successMessage = `
                    <div class="toast-title">✓ Bookmark Added!</div>
                    <div class="toast-path">Location: ${response.path}</div>
                `;
                showToast(successMessage, 'success', 5000);
            } else {
                if (response.error === 'API_ERROR') {
                    chrome.storage.local.remove('isValidated', function() {
                        showPage(loginPage);
                        showToast('API key seems invalid. Please sign in again.', 'error');
                    });
                } else if (response.error === 'DUPLICATE_BOOKMARK') {
                    const duplicateMessage = `
                        <div class="toast-title">ℹ Already Bookmarked</div>
                        <div class="toast-path">Found in: ${response.existingCategory}</div>
                    `;
                    showToast(duplicateMessage, 'info', 5000);
                } else {
                    showToast('Error: ' + response.error, 'error');
                }
            }
        });
    });
});

// Add this helper function to create toast notifications
function showToast(message, type, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Create the content of the toast
    const content = document.createElement('div');
    content.className = 'toast-content';
    content.innerHTML = message;
    
    toast.appendChild(content);
    
    // Add the toast to the page
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove the toast after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

async function validateApiKey(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Error validating API key:', error);
        return false;
    }
}

function showPage(page) {
    loginPage.classList.remove('active');
    mainPage.classList.remove('active');
    page.classList.add('active');
}

function updateCurrentPage() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        currentUrl.textContent = tab.title;
    });
}

function showStatus(message, type) {
    status.textContent = message;
    status.className = `status status-${type}`;
    status.classList.remove('hidden');
    setTimeout(() => {
        status.classList.add('hidden');
    }, 3000);
}

// Show/Hide loading overlay
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

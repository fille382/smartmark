import { analyzeAndCategorize } from './aiService.js';
import { createBookmark } from './bookmarkService.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ANALYZE_PAGE') {
        chrome.storage.local.get(['apiKey'], function(result) {
            if (!result.apiKey) {
                sendResponse({ success: false, error: 'API key not configured' });
                return;
            }
            
            handleAnalyzePageRequest(message, result.apiKey, sendResponse);
        });
        return true; // Indicates that the response is sent asynchronously
    }
});

async function handleAnalyzePageRequest(message, apiKey, sendResponse) {
    try {
        const category = await analyzeAndCategorize(message.url, message.title, apiKey);
        const result = await createBookmark(message.url, message.title, category);
        sendResponse({ 
            success: true, 
            category: result.category,
            path: result.path
        });
    } catch (error) {
        console.error('Error:', error);
        
        // Check if this is a duplicate bookmark error
        if (error.message.startsWith('DUPLICATE_BOOKMARK:')) {
            const existingCategory = error.message.split(':')[1];
            sendResponse({ 
                success: false, 
                error: 'DUPLICATE_BOOKMARK',
                existingCategory: existingCategory 
            });
        } else {
            sendResponse({ success: false, error: error.message });
        }
    }
}
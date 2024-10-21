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
        await createBookmark(message.url, message.title, category);
        sendResponse({ success: true, category: category });
    } catch (error) {
        console.error('Error:', error);
        sendResponse({ success: false, error: error.message });
    }
}
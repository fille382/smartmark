export const config = {
    apiKey: '', // Will be populated from chrome.storage
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  };
  
  export async function initializeConfig() {
    const stored = await chrome.storage.local.get(['apiKey']);
    if (stored.apiKey) {
      config.apiKey = stored.apiKey;
    }
    return config;
  }
  
  export async function updateApiKey(newKey) {
    await chrome.storage.local.set({ apiKey: newKey });
    config.apiKey = newKey;
    return config;
  }
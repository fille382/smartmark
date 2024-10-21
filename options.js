document.addEventListener('DOMContentLoaded', async () => {
    // Load existing API key if any
    const stored = await chrome.storage.local.get(['apiKey']);
    if (stored.apiKey) {
      document.getElementById('apiKey').value = stored.apiKey;
    }
  
    document.getElementById('saveButton').addEventListener('click', async () => {
      const apiKey = document.getElementById('apiKey').value.trim();
      const statusDiv = document.getElementById('status');
  
      if (!apiKey) {
        showStatus('Please enter an API key', 'error');
        return;
      }
  
      try {
        // Validate API key by making a test request
        const isValid = await validateApiKey(apiKey);
        
        if (isValid) {
          await chrome.storage.local.set({ apiKey });
          showStatus('Settings saved successfully!', 'success');
        } else {
          showStatus('Invalid API key. Please check and try again.', 'error');
        }
      } catch (error) {
        showStatus('Error saving settings: ' + error.message, 'error');
      }
    });
  });
  
  async function validateApiKey(apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
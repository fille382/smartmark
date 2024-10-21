import { predefinedCategories } from './categories.js';

export async function analyzeAndCategorize(url, title, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: `You are a bookmark categorization assistant. Categorize the given URL and title into one of the following categories: ${predefinedCategories.join(", ")}. If none fit perfectly, choose the closest match or 'Other'.`
            }, {
                role: "user",
                content: `Categorize this page: URL: ${url}, Title: ${title}`
            }]
        })
    });

    if (!response.ok) {
        throw new Error('API_ERROR');
    }

    const data = await response.json();
    const suggestedCategory = data.choices[0].message.content.trim();
    
    // Check if the suggested category is in our predefined list, if not, use "Other"
    return predefinedCategories.includes(suggestedCategory) ? suggestedCategory : "Other";
}
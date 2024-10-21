export async function createBookmark(url, title, category) {
    let categoryFolder = await getCategoryFolder(category);
    
    return await chrome.bookmarks.create({
        parentId: categoryFolder.id,
        title: title,
        url: url
    });
}

async function getCategoryFolder(category) {
    const bookmarks = await chrome.bookmarks.search({ title: category });
    
    if (bookmarks.length > 0) {
        return bookmarks[0];
    }
    
    // Create new category folder if it doesn't exist
    return await chrome.bookmarks.create({
        title: category
    });
}

export async function getAllBookmarks() {
    return await chrome.bookmarks.getTree();
}

export async function searchBookmarks(query) {
    return await chrome.bookmarks.search(query);
}
export async function createBookmark(url, title, category) {
    // First check if the URL already exists
    const existingBookmarks = await searchBookmarks({ url: url });
    
    if (existingBookmarks.length > 0) {
        // URL already exists, get the folder information and throw error
        const existingFolder = await getBookmarkFolder(existingBookmarks[0].parentId);
        throw new Error(`DUPLICATE_BOOKMARK:${existingFolder.title}`);
    }
    
    let categoryFolder = await getCategoryFolder(category);
    
    const newBookmark = await chrome.bookmarks.create({
        parentId: categoryFolder.id,
        title: title,
        url: url
    });

    // Return both the bookmark and its category information
    return {
        bookmark: newBookmark,
        category: category,
        // Add the full path to show the user exactly where it is
        path: await getBookmarkPath(newBookmark.id)
    };
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

// New helper function to get folder information
async function getBookmarkFolder(folderId) {
    const folder = await chrome.bookmarks.get(folderId);
    return folder[0];
}

// New helper function to get the full path of a bookmark
async function getBookmarkPath(bookmarkId) {
    const nodes = [];
    let currentNode = await chrome.bookmarks.get(bookmarkId);
    
    while (currentNode && currentNode[0]) {
        nodes.unshift(currentNode[0].title);
        if (currentNode[0].parentId) {
            currentNode = await chrome.bookmarks.get(currentNode[0].parentId);
        } else {
            break;
        }
    }
    
    return nodes.join(' › ');
}

export async function getAllBookmarks() {
    return await chrome.bookmarks.getTree();
}

export async function searchBookmarks(query) {
    return await chrome.bookmarks.search(query);
}
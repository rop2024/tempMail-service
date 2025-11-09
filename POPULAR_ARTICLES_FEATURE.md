# Popular Articles Feature - Complete Documentation

## Overview

The Popular Articles feature displays blog posts from your Notion database directly on the home page of the TempMail application. It includes beautiful card layouts, dark mode support, filtering options, and detailed article viewing capabilities.

## Features

### ✨ Core Functionality

1. **Dynamic Article Loading**
   - Fetches articles from Notion database via REST API
   - Displays latest 6 published articles by default
   - Automatic refresh capability
   - Graceful error handling and loading states

2. **Beautiful Card Design**
   - Gradient header backgrounds (blue to purple)
   - Status badges (Published, Draft, In Progress, Archived)
   - Author information with icons
   - Relative date formatting ("Today", "2 days ago", etc.)
   - Tag display (shows up to 3 tags, indicates if more)
   - Hover animations and transitions
   - Fully responsive grid layout (1/2/3 columns)

3. **Full Dark Mode Support**
   - Automatic theme detection
   - Smooth transitions between light/dark modes
   - Optimized colors for readability in both themes
   - Dark-aware gradient backgrounds

4. **Article Modal/Viewer**
   - Click any card to open full article view
   - Displays complete article content from Notion
   - Shows all metadata (author, date, tags, status)
   - Direct link to open in Notion
   - Smooth modal animations
   - Close on escape key or background click

5. **Smart Data Display**
   - All Notion database properties are displayed:
     - **Title**: Main article heading
     - **Content**: Full article text from Notion blocks
     - **Status**: Visual badge (Published, Draft, etc.)
     - **Tags**: Multiple tag display with color coding
     - **Author**: Author name with user icon
     - **Created Time**: Smart relative dates
     - **Last Edited Time**: Available via API
     - **URL**: Direct link to Notion page
   - Responsive layouts that adapt to screen size
   - Loading skeletons for smooth UX

## File Structure

```
frontend/src/
├── components/
│   └── PopularArticles.js     # Main component (600+ lines)
├── utils/
│   └── api.js                 # API functions (added Notion endpoints)
└── main.js                    # App initialization (updated to include articles)

backend/
├── services/
│   └── notion.js              # Notion API service (already exists)
└── routes/
    └── notion.js              # Notion API routes (already exists)
```

## Component Architecture

### PopularArticles Component

```javascript
class PopularArticles {
    constructor(container)
    async init()
    async loadArticles()
    render()
    renderContent()
    renderLoading()
    renderError()
    renderEmpty()
    renderArticles()
    renderArticleCard(article)
    attachEventListeners()
    async viewArticle(articleId)
    showArticleModal(article)
    async loadArticleContent(articleId)
    // Utility methods
    getStatusColor(status)
    formatDate(dateString)
    escapeHtml(unsafe)
    destroy()
}
```

### Key Methods Explained

#### `loadArticles()`
Fetches articles from Notion API with:
- Page size: 6 articles
- Filter: Published status only
- Sort: By creation date (newest first)
- Error handling with user-friendly messages

#### `renderArticleCard(article)`
Creates a card with:
- Gradient background header
- Status badge overlay
- Title (max 2 lines, truncated)
- Author and date metadata
- Tags (max 3 visible)
- "Read article" call-to-action
- Hover effects and transitions

#### `showArticleModal(article)`
Opens a modal displaying:
- Full article title
- Complete metadata
- Article content (loaded asynchronously)
- Tags with visual styling
- Status badge
- Direct Notion link
- Close button and escape key support

#### `formatDate(dateString)`
Smart relative date formatting:
- "Today" for today's posts
- "Yesterday" for yesterday
- "X days ago" for last 6 days
- "X weeks ago" for last month
- Full date for older posts

## API Integration

### New API Functions in `api.js`

```javascript
// Get Notion health status
export async function getNotionHealth()

// Get database information
export async function getNotionDatabaseInfo()

// Get list of posts with filtering
export async function getNotionPosts(options = {})
// Options: pageSize, status, sortBy, sortDirection

// Get single post by ID
export async function getNotionPost(pageId)

// Create new post
export async function createNotionPost(postData)

// Update existing post
export async function updateNotionPost(pageId, updates)

// Delete post (archive in Notion)
export async function deleteNotionPost(pageId)
```

### API Usage Example

```javascript
// Load published articles
const result = await getNotionPosts({ 
    pageSize: 6, 
    status: 'Published',
    sortBy: 'created_time',
    sortDirection: 'descending'
});

if (result.success) {
    const articles = result.data.posts;
    // Display articles
}
```

## Notion Database Schema

The component expects these properties in your Notion database:

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| Title | Title | Article title | ✅ Yes |
| Content | Rich Text | Article content | ⚪ Optional |
| Status | Select | Published/Draft/In Progress/Archived | ⚪ Optional |
| Tags | Multi-select | Article categories/tags | ⚪ Optional |
| Author | Text | Author name | ⚪ Optional |
| Created Time | Created Time | Auto-generated | ✅ Yes |
| Last Edited Time | Last Edited Time | Auto-generated | ✅ Yes |

## Setup Instructions

### 1. Notion Database Setup

If you haven't already set up Notion:

1. **Create a Notion Integration**
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Name it (e.g., "TempMail Blog")
   - Select your workspace
   - Copy the "Internal Integration Token"

2. **Create a Database**
   - Create a new page in Notion
   - Add a database (full page or inline)
   - Add the properties listed above
   - Click "..." → "Add connections" → Select your integration

3. **Get Database ID**
   - Open the database as a full page
   - Copy the URL: `https://notion.so/{workspace}/{database_id}?v=...`
   - The database ID is the 32-character string

4. **Configure Backend**
   ```bash
   cd backend
   # Edit .env file
   NOTION_TOKEN=your_integration_token_here
   NOTION_DATABASE_ID=your_database_id_here
   ```

5. **Add Sample Data**
   - Add a few blog posts to your Notion database
   - Set Status to "Published"
   - Add tags, author, content
   - Save the posts

### 2. Verify Backend

```bash
# Check Notion API health
curl http://localhost:3000/api/notion/health

# List posts
curl http://localhost:3000/api/notion/posts?status=Published
```

### 3. Test Frontend

1. Open http://localhost:5173
2. You should see the "Popular Articles" section at the top
3. Articles should load automatically
4. Click any card to view full details

## Styling & Customization

### Theme Colors

The component uses Tailwind CSS classes with these color schemes:

**Light Mode:**
- Background: White (`bg-white`)
- Text: Gray 800 (`text-gray-800`)
- Borders: Gray 200 (`border-gray-200`)
- Hover: Gray 50 (`hover:bg-gray-50`)

**Dark Mode:**
- Background: Gray 800 (`dark:bg-gray-800`)
- Text: Gray 100 (`dark:text-gray-100`)
- Borders: Gray 600 (`dark:border-gray-600`)
- Hover: Gray 700 (`dark:hover:bg-gray-700`)

### Status Badge Colors

```javascript
const statusColors = {
    'Published': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Archived': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};
```

### Customizing Display

Edit `PopularArticles.js`:

```javascript
// Change number of articles
const result = await getNotionPosts({ 
    pageSize: 12, // Show 12 instead of 6
    // ...
});

// Change grid layout in renderArticles()
// Current: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
// 4 columns: grid-cols-1 md:grid-cols-2 lg:grid-cols-4

// Change gradient colors in renderArticleCard()
// Current: from-blue-500 to-purple-600
// New: from-pink-500 to-orange-600
```

## Error Handling

The component handles multiple error states:

1. **Notion Not Configured**
   ```
   Shows: "Unable to load articles"
   Message: "Notion API not configured. Please set up NOTION_TOKEN..."
   Action: Try Again button
   ```

2. **Network Error**
   ```
   Shows: Error icon with message
   Action: Try Again button
   ```

3. **Empty Database**
   ```
   Shows: "No articles available"
   Message: "Articles will appear here once they are published in Notion."
   ```

4. **Loading State**
   ```
   Shows: 6 skeleton cards with pulse animation
   ```

## Performance Optimizations

1. **Lazy Loading**: Article content loads only when modal opens
2. **Caching**: API responses cached for 5 seconds
3. **Debouncing**: Prevents multiple simultaneous refresh requests
4. **Skeleton Screens**: Provides instant feedback while loading
5. **Responsive Images**: Gradient placeholders reduce bandwidth
6. **Efficient Rendering**: Only re-renders changed components

## Accessibility Features

- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support (ESC to close modal)
- ✅ Focus management in modals
- ✅ High contrast ratios in both themes
- ✅ Screen reader friendly content
- ✅ Proper heading hierarchy

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Articles Not Loading

1. **Check Notion Configuration**
   ```bash
   curl http://localhost:3000/api/notion/health
   ```
   Should return: `"configured": true`

2. **Check Database ID**
   - Verify 32-character ID in `.env`
   - Ensure no spaces or quotes

3. **Check Integration Connection**
   - Open Notion database
   - Verify integration is connected
   - Check "Connections" in database settings

4. **Check Published Status**
   - At least one post must have Status = "Published"
   - Filter only shows published posts

### Modal Not Opening

1. **Check Browser Console**
   - Look for JavaScript errors
   - Verify article ID is present

2. **Check Event Listeners**
   - Verify card has `data-article-id` attribute
   - Check click handlers are attached

### Styling Issues

1. **Dark Mode Not Working**
   - Check `class` attribute on `<html>` element
   - Should toggle between "light" and "dark"
   - Verify theme toggle button is working

2. **Layout Breaking**
   - Check Tailwind CSS is loaded
   - Verify responsive classes are correct
   - Test on different screen sizes

## Future Enhancements

Potential improvements:

1. **Pagination**: Load more articles on demand
2. **Search**: Filter articles by title/content
3. **Categories**: Filter by specific tags
4. **Sorting Options**: User-selectable sort order
5. **Bookmarking**: Save favorite articles locally
6. **Reading Time**: Calculate estimated reading time
7. **Share Buttons**: Social media sharing
8. **Comments**: Integration with comment system
9. **Analytics**: Track article views
10. **Related Articles**: Show similar posts

## API Reference

### GET /api/notion/posts

**Query Parameters:**
- `pageSize` (number): Number of posts to return (default: 10)
- `status` (string): Filter by status (Published, Draft, etc.)
- `sortBy` (string): Sort field (created_time, last_edited_time, title)
- `sortDirection` (string): ascending or descending

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "page-id-123",
        "title": "Article Title",
        "content": "Article content...",
        "status": "Published",
        "tags": ["tag1", "tag2"],
        "author": "John Doe",
        "createdTime": "2025-11-09T10:00:00.000Z",
        "lastEditedTime": "2025-11-09T12:00:00.000Z",
        "url": "https://notion.so/..."
      }
    ],
    "total": 10,
    "hasMore": false
  }
}
```

### GET /api/notion/posts/:pageId

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "page-id-123",
    "title": "Article Title",
    "content": "Full article content from blocks...",
    "status": "Published",
    "tags": ["tag1", "tag2"],
    "author": "John Doe",
    "createdTime": "2025-11-09T10:00:00.000Z",
    "lastEditedTime": "2025-11-09T12:00:00.000Z",
    "url": "https://notion.so/...",
    "properties": { /* raw Notion properties */ }
  }
}
```

## Testing

### Manual Testing Checklist

- [ ] Articles load on page load
- [ ] Loading skeleton appears during fetch
- [ ] Error message shows if Notion not configured
- [ ] Empty state shows if no published articles
- [ ] Refresh button reloads articles
- [ ] Cards display correctly (title, author, date, tags, status)
- [ ] Hover effects work on cards
- [ ] Clicking card opens modal
- [ ] Modal displays full content
- [ ] Close button closes modal
- [ ] ESC key closes modal
- [ ] Clicking background closes modal
- [ ] "Open in Notion" link works
- [ ] Dark mode styles apply correctly
- [ ] Theme toggle affects articles section
- [ ] Responsive layout works (mobile/tablet/desktop)
- [ ] Date formatting is correct

### API Testing

```bash
# Health check
curl http://localhost:3000/api/notion/health

# List posts
curl http://localhost:3000/api/notion/posts

# Get specific post
curl http://localhost:3000/api/notion/posts/{page-id}

# Filter by status
curl "http://localhost:3000/api/notion/posts?status=Published"

# Sort and limit
curl "http://localhost:3000/api/notion/posts?pageSize=3&sortBy=created_time&sortDirection=descending"
```

## Credits

- **Design**: Inspired by modern blog layouts
- **Icons**: SVG icons inline (no external dependencies)
- **Styling**: Tailwind CSS utility classes
- **API**: Notion JavaScript SDK (@notionhq/client)

## Support

For issues or questions:
1. Check this documentation first
2. Review `NOTION_SETUP.md` for configuration help
3. Check browser console for errors
4. Verify backend server is running
5. Test API endpoints directly with curl

---

**Last Updated**: November 9, 2025
**Version**: 1.0.0
**Component**: PopularArticles.js

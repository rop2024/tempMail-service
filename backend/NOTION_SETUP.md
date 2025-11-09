# 📝 Notion API Integration Guide

## 🎯 Overview
This guide walks you through setting up Notion API integration with your tempMail service to create and manage blog posts in a Notion database.

---

## 📋 Prerequisites
- A Notion account (free or paid)
- Access to your Notion workspace

---

## 🚀 Setup Instructions

### Step 1: Duplicate Notion Blog Template

1. **Option A: Create from scratch**
   - Open Notion and create a new database
   - Choose "Table" view
   - Name it "Blog Posts" or similar

2. **Option B: Use a template**
   - Visit [Notion Template Gallery](https://www.notion.so/templates)
   - Search for "Blog" or "Content Calendar"
   - Duplicate the template to your workspace

### Step 2: Configure Database Properties

Your database should have these properties (can be customized):

| Property Name | Type | Required |
|--------------|------|----------|
| **Name** or **Title** | Title | ✅ Yes |
| **Status** | Select | Recommended |
| **Tags** | Multi-select | Optional |
| **Author** | Text | Optional |
| **Created** | Created time | Auto |
| **Last edited** | Last edited time | Auto |

**Status options (recommended):**
- Draft
- In Progress
- Published
- Archived

### Step 3: Create Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)

2. Click **"+ New integration"**

3. Fill in the details:
   - **Name**: "TempMail Blog Integration" (or any name)
   - **Associated workspace**: Select your workspace
   - **Type**: Internal integration
   - **Capabilities**: 
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content

4. Click **"Submit"**

5. **Copy the "Internal Integration Token"** (starts with `secret_`)
   - ⚠️ Keep this secret and never commit it to version control!

### Step 4: Share Database with Integration

1. Open your Notion database page

2. Click the **"..."** (three dots) in the top right

3. Select **"Add connections"**

4. Find and select your integration name

5. Click **"Confirm"**

   ✅ Your integration now has access to this database!

### Step 5: Get Database ID

**Method 1: From URL**
```
https://www.notion.so/yourworkspace/DATABASE_ID?v=...
                                   ^^^^^^^^^^^^^^^^
                                   This is your ID
```

**Method 2: From Share Menu**
1. Click "Share" on your database
2. Click "Copy link"
3. Extract the ID from the URL (32-character string)

Example:
```
https://www.notion.so/12345678901234567890123456789012?v=...
                    ↑ This 32-character string is the ID
```

### Step 6: Update Environment Variables

Edit your `.env` file in the backend folder:

```env
# Notion API Configuration
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=12345678901234567890123456789012
```

Replace:
- `secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual integration token
- `12345678901234567890123456789012` with your actual database ID

---

## ✅ Verify Configuration

### Test with API Health Check

```bash
# Check if Notion is configured correctly
curl http://localhost:3000/api/notion/health
```

**Expected Success Response:**
```json
{
  "success": true,
  "configured": true,
  "database": {
    "id": "12345...",
    "title": "Blog Posts",
    "url": "https://www.notion.so/...",
    "properties": ["Name", "Status", "Tags", "Author"]
  }
}
```

**Configuration Error Response:**
```json
{
  "success": false,
  "configured": false,
  "error": "Notion API is not configured. Please set NOTION_TOKEN..."
}
```

---

## 🧪 Testing with cURL

### 1. Create a New Post

```bash
curl -X POST http://localhost:3000/api/notion/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is the content of my first blog post.\nIt supports multiple paragraphs.",
    "status": "Draft",
    "tags": ["Tutorial", "API"],
    "author": "John Doe"
  }'
```

**PowerShell Version:**
```powershell
$body = @{
    title = "My First Blog Post"
    content = "This is the content of my first blog post.`nIt supports multiple paragraphs."
    status = "Draft"
    tags = @("Tutorial", "API")
    author = "John Doe"
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/notion/posts" `
  -Body $body -ContentType "application/json"
```

### 2. List All Posts

```bash
curl http://localhost:3000/api/notion/posts
```

**With Query Parameters:**
```bash
# Get 5 posts with status "Published"
curl "http://localhost:3000/api/notion/posts?pageSize=5&status=Published"
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/notion/posts"
```

### 3. Get Specific Post

```bash
curl http://localhost:3000/api/notion/posts/{PAGE_ID}
```

Replace `{PAGE_ID}` with the actual Notion page ID.

### 4. Update a Post

```bash
curl -X PUT http://localhost:3000/api/notion/posts/{PAGE_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "Published"
  }'
```

### 5. Delete (Archive) a Post

```bash
curl -X DELETE http://localhost:3000/api/notion/posts/{PAGE_ID}
```

---

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Create a new collection: "TempMail - Notion API"
3. Add these requests:

#### Request 1: Health Check
- **Method**: GET
- **URL**: `http://localhost:3000/api/notion/health`

#### Request 2: Create Post
- **Method**: POST
- **URL**: `http://localhost:3000/api/notion/posts`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "title": "Test Post from Postman",
  "content": "This is a test post created via Postman API testing.",
  "status": "Draft",
  "tags": ["Test", "Postman"],
  "author": "API Tester"
}
```

#### Request 3: List Posts
- **Method**: GET
- **URL**: `http://localhost:3000/api/notion/posts`
- **Query Params** (optional):
  - `pageSize`: 10
  - `status`: Draft

#### Request 4: Get Post
- **Method**: GET
- **URL**: `http://localhost:3000/api/notion/posts/{{pageId}}`
- Create a Postman variable `pageId` with a valid page ID

#### Request 5: Update Post
- **Method**: PUT
- **URL**: `http://localhost:3000/api/notion/posts/{{pageId}}`
- **Body**:
```json
{
  "title": "Updated Title",
  "status": "Published"
}
```

#### Request 6: Delete Post
- **Method**: DELETE
- **URL**: `http://localhost:3000/api/notion/posts/{{pageId}}`

---

## 📚 API Reference

### Create Post
**POST** `/api/notion/posts`

**Request Body:**
```json
{
  "title": "string (required)",
  "content": "string (optional)",
  "status": "string (optional, e.g., 'Draft', 'Published')",
  "tags": ["array", "of", "strings"],
  "author": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "page-id",
    "url": "https://notion.so/...",
    "title": "Post Title",
    "createdTime": "2025-11-09T...",
    "lastEditedTime": "2025-11-09T..."
  },
  "message": "Post created successfully"
}
```

### List Posts
**GET** `/api/notion/posts?pageSize=10&status=Published`

**Query Parameters:**
- `pageSize` (number): Results per page (default: 10, max: 100)
- `cursor` (string): Pagination cursor
- `status` (string): Filter by status
- `sortBy` (string): Sort field (default: created_time)
- `sortDirection` (string): asc or descending (default: descending)

### Get Post
**GET** `/api/notion/posts/:pageId`

### Update Post
**PUT** `/api/notion/posts/:pageId`

### Delete Post
**DELETE** `/api/notion/posts/:pageId`

---

## 🔍 Troubleshooting

### "Notion API is not configured"
- ✅ Check `.env` file has `NOTION_TOKEN` and `NOTION_DATABASE_ID`
- ✅ Restart your backend server after updating `.env`

### "Unauthorized - Invalid Notion token"
- ✅ Verify your integration token is correct
- ✅ Check for extra spaces or quotes in `.env` file

### "Database or page not found"
- ✅ Verify database ID is correct (32 characters)
- ✅ Ensure database is shared with your integration
- ✅ Check database hasn't been deleted

### "Validation error"
- ✅ Ensure required properties exist in your database
- ✅ Check property names match (e.g., "Name" vs "Title")
- ✅ Verify status values match your database options

---

## 🎉 Success Checklist

- [ ] ✅ Created/duplicated Notion database
- [ ] ✅ Created Notion integration and copied token
- [ ] ✅ Shared database with integration
- [ ] ✅ Got database ID from URL
- [ ] ✅ Updated `.env` with token and database ID
- [ ] ✅ Restarted backend server
- [ ] ✅ Tested health endpoint - returns success
- [ ] ✅ Created test post via API
- [ ] ✅ Listed posts successfully
- [ ] ✅ Verified post appears in Notion database

---

## 📖 Additional Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Notion SDK for JavaScript](https://github.com/makenotion/notion-sdk-js)
- [Create an Integration](https://www.notion.so/my-integrations)
- [Notion API Reference](https://developers.notion.com/reference)

---

**🎊 Congratulations!** You've successfully integrated Notion API with your TempMail service!

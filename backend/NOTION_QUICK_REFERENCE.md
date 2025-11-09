# 🚀 Notion API - Quick Reference

## 📝 Configuration

```env
# .env file
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=12345678901234567890123456789012
```

## 🔗 API Endpoints

### Health Check
```bash
GET /api/notion/health
```

### Create Post
```bash
POST /api/notion/posts
Content-Type: application/json

{
  "title": "Post Title",
  "content": "Post content...",
  "status": "Draft",
  "tags": ["tag1", "tag2"],
  "author": "Author Name"
}
```

### List Posts
```bash
GET /api/notion/posts?pageSize=10&status=Published
```

### Get Post
```bash
GET /api/notion/posts/{pageId}
```

### Update Post
```bash
PUT /api/notion/posts/{pageId}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "Published"
}
```

### Delete Post
```bash
DELETE /api/notion/posts/{pageId}
```

## 💻 PowerShell Examples

### Create Post
```powershell
$post = @{
    title = "My Post"
    content = "Content here"
    status = "Draft"
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/notion/posts" -Body $post -ContentType "application/json"
```

### List Posts
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/notion/posts"
```

## 📋 Setup Checklist

- [ ] Create Notion database
- [ ] Create integration at notion.so/my-integrations
- [ ] Copy integration token
- [ ] Share database with integration
- [ ] Get database ID from URL
- [ ] Update .env file
- [ ] Restart server
- [ ] Test health endpoint

## 🔍 Quick Test

```bash
# Check configuration
curl http://localhost:3000/api/notion/health

# Create test post
curl -X POST http://localhost:3000/api/notion/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Hello Notion!","status":"Draft"}'

# List all posts
curl http://localhost:3000/api/notion/posts
```

## 📚 Full Documentation

- **Complete Setup**: `NOTION_SETUP.md`
- **Implementation Details**: `NOTION_IMPLEMENTATION_SUMMARY.md`

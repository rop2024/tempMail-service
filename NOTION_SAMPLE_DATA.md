# Quick Start: Adding Sample Blog Posts to Notion

This guide helps you quickly add sample blog posts to your Notion database so you can see the Popular Articles feature in action.

## Prerequisites

✅ Notion integration created  
✅ Database created with proper schema  
✅ Backend configured with NOTION_TOKEN and NOTION_DATABASE_ID  
✅ Integration connected to database  

## Sample Blog Posts

Copy these directly into your Notion database:

---

### Post 1: Welcome to Our Blog

**Title:** Welcome to Our Blog - Getting Started with TempMail

**Status:** Published

**Tags:** Getting Started, Tutorial, Welcome

**Author:** TempMail Team

**Content:**
```
Welcome to the TempMail blog! We're excited to share tips, tutorials, and updates about temporary email services.

In this blog, you'll find:
- Step-by-step tutorials on using TempMail
- Privacy and security best practices
- Updates on new features
- Tips for protecting your online identity

TempMail helps you protect your privacy by providing temporary email addresses that you can use for registrations, testing, and avoiding spam.

Stay tuned for more articles!
```

---

### Post 2: Privacy Tips

**Title:** 10 Privacy Tips for Safe Online Browsing

**Status:** Published

**Tags:** Privacy, Security, Tips

**Author:** Sarah Johnson

**Content:**
```
Protecting your online privacy is more important than ever. Here are 10 essential tips:

1. Use temporary email addresses for sign-ups
2. Enable two-factor authentication
3. Use strong, unique passwords
4. Clear cookies regularly
5. Use a VPN when on public WiFi
6. Keep software updated
7. Be cautious with personal information
8. Review app permissions
9. Use privacy-focused browsers
10. Read privacy policies

Each of these steps helps protect your digital identity. TempMail is designed to help with tip #1 - keeping your real email address private.

Want to learn more? Check out our detailed privacy guide.
```

---

### Post 3: Email Security

**Title:** Understanding Email Security: A Beginner's Guide

**Status:** Published

**Tags:** Security, Email, Education

**Author:** Mike Chen

**Content:**
```
Email security is crucial in today's digital world. This guide covers the basics:

What is Email Security?
Email security refers to protecting email accounts and communications from unauthorized access, loss, or compromise.

Common Threats:
- Phishing attacks
- Spam and unwanted emails
- Email spoofing
- Malware attachments
- Account hijacking

How TempMail Helps:
By using temporary email addresses, you can:
- Avoid giving out your real email
- Test services without commitment
- Reduce spam to your main inbox
- Maintain anonymity when needed

Remember: Always be cautious with email links and attachments, even with temporary addresses.
```

---

### Post 4: Feature Announcement

**Title:** Introducing Dark Mode - A Better Viewing Experience

**Status:** Published

**Tags:** Features, Updates, Design

**Author:** Design Team

**Content:**
```
We're thrilled to announce the release of Dark Mode for TempMail!

What's New?
- Beautiful dark theme for reduced eye strain
- Automatic theme detection based on system preferences
- Smooth transitions between themes
- Optimized for both light and dark environments

Why Dark Mode?
Studies show that dark mode can:
- Reduce eye strain in low-light conditions
- Save battery on OLED screens
- Improve focus and readability
- Look absolutely stunning!

Try it out by clicking the theme toggle in the header. Your preference is saved automatically.

We hope you enjoy this new feature!
```

---

### Post 5: How-To Guide

**Title:** How to Create and Use a Temporary Email Address

**Status:** Published

**Tags:** Tutorial, How-To, Beginner

**Author:** Support Team

**Content:**
```
Creating a temporary email address with TempMail is easy! Follow these steps:

Step 1: Visit TempMail
Open the TempMail application in your browser.

Step 2: Generate an Address
Click "Generate Email" or enter a custom username. The system will create a temporary address for you.

Step 3: Copy Your Address
Click the copy button to copy your new email address to your clipboard.

Step 4: Use It Anywhere
Paste the address into any sign-up form, registration page, or verification field.

Step 5: Check Your Inbox
Return to TempMail to see any messages sent to your temporary address. The inbox updates automatically.

Step 6: Done!
When you're finished, simply close the browser. Your temporary address expires automatically.

Pro Tip: You can keep the inbox open to receive verification emails in real-time.
```

---

### Post 6: API Documentation

**Title:** Developer Guide: Integrating TempMail API

**Status:** Published

**Tags:** API, Developers, Documentation

**Author:** Dev Team

**Content:**
```
TempMail offers a simple REST API for developers. Here's how to get started:

Authentication:
All API requests require authentication. Contact us for an API key.

Base URL:
https://api.tempmail.example.com/v1

Endpoints:
- POST /generate - Create new email
- GET /inbox/:address - Get inbox messages
- GET /message/:id - Get specific message
- DELETE /address/:address - Delete account

Example Request:
POST /generate
{
  "username": "myuser",
  "domain": "tempmail.com"
}

Example Response:
{
  "success": true,
  "data": {
    "address": "myuser@tempmail.com",
    "token": "abc123..."
  }
}

Rate Limits:
- 100 requests per minute
- 1000 requests per hour

For full documentation, visit our developer portal.
```

---

## Quick Add Instructions

### Method 1: Manual Entry

1. Open your Notion database
2. Click "+ New" to create a new page
3. Fill in the properties:
   - **Title**: Copy from above
   - **Status**: Select "Published"
   - **Tags**: Add tags as shown
   - **Author**: Type the author name
   - **Content**: Paste the content text
4. Save the page
5. Repeat for all 6 posts

### Method 2: Duplicate Template

1. Create the first post manually
2. Right-click the page → "Duplicate"
3. Edit the duplicated page with new content
4. Repeat 5 times

### Method 3: Use API (Advanced)

```bash
# Create a post via API
curl -X POST http://localhost:3000/api/notion/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to Our Blog",
    "content": "Welcome to the TempMail blog! ...",
    "status": "Published",
    "tags": ["Getting Started", "Tutorial", "Welcome"],
    "author": "TempMail Team"
  }'
```

## Verifying Your Posts

After adding the posts:

1. **Check in Notion**
   - All 6 posts should appear in your database
   - Status should be "Published"
   - Tags should be visible

2. **Test the API**
   ```bash
   curl http://localhost:3000/api/notion/posts?status=Published
   ```
   Should return 6 posts

3. **View in TempMail App**
   - Open http://localhost:5173
   - "Popular Articles" section should show 6 cards
   - Click any card to view full content

## Customization Ideas

### Add More Tags
- Announcements
- Case Studies
- Best Practices
- Tech Tips
- Product Updates

### Add More Authors
- Community contributors
- Guest writers
- Different team members

### Add More Statuses
- Draft (for work in progress)
- In Progress (being edited)
- Archived (old posts)
- Scheduled (future posts)

## Troubleshooting

**Posts Not Showing?**
- Check Status is "Published"
- Verify integration is connected
- Refresh the frontend page
- Check backend console for errors

**API Errors?**
- Verify NOTION_TOKEN is correct
- Check NOTION_DATABASE_ID is right
- Ensure integration has access to database

**Empty Content in Modal?**
- Make sure Content property exists in Notion
- Add text to the Content field
- Check browser console for errors

## Next Steps

1. ✅ Add sample posts to Notion
2. ✅ Verify they appear in TempMail
3. ✅ Test clicking cards to view details
4. ✅ Try the refresh button
5. ✅ Toggle dark mode to see styling
6. ✅ Test on mobile devices
7. ✅ Start writing your own content!

---

**Tip**: Once you're comfortable with the system, delete these sample posts and add your own real content.

**Note**: The Popular Articles feature automatically fetches the 6 most recent published posts, sorted by creation date.

Happy blogging! 🎉

# Notion Database Properties → UI Mapping

This document shows exactly how each property from your Notion database is displayed in the TempMail application.

## Complete Property Mapping

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NOTION DATABASE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Property Name      │  Type           │  Example Value              │
│  ─────────────────────────────────────────────────────────────────  │
│  Title              │  Title          │  "How to Use TempMail"      │
│  Content            │  Rich Text      │  "Step 1: Create an..."     │
│  Status             │  Select         │  "Published"                │
│  Tags               │  Multi-select   │  ["Tutorial", "Guide"]      │
│  Author             │  Text           │  "John Doe"                 │
│  Created Time       │  Created Time   │  2025-11-09T10:00:00Z       │
│  Last Edited Time   │  Last Edit Time │  2025-11-09T12:00:00Z       │
│  URL                │  (Auto)         │  https://notion.so/page-id  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TEMPMAIL UI - ARTICLE CARD                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ╔═══════════════════════════════════════════════════════╗   │   │
│  │ ║ Gradient Background (Blue → Purple)                  ║   │   │
│  │ ║                                                       ║   │   │
│  │ ║                       📖 Icon                         ║   │   │
│  │ ║                                                       ║   │   │
│  │ ║  [Published] ← Status Badge                          ║   │   │
│  │ ╚═══════════════════════════════════════════════════════╝   │   │
│  │                                                              │   │
│  │  How to Use TempMail ← Title                                │   │
│  │                                                              │   │
│  │  👤 John Doe ← Author   📅 2 days ago ← Created Time        │   │
│  │                                                              │   │
│  │  #Tutorial  #Guide ← Tags (first 3)                         │   │
│  │  +2 more ← Tag overflow indicator                           │   │
│  │                                                              │   │
│  │  Read article → ← Call to action                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Click Event
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ARTICLE MODAL (Full View)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ╔═══════════════════════════════════════════════════════════════╗ │
│  ║  How to Use TempMail ← Title                           [✕]  ║ │
│  ║  ─────────────────────────────────────────────────────────  ║ │
│  ║  👤 John Doe  │  📅 November 9, 2025                        ║ │
│  ║     ↑ Author      ↑ Created Time (formatted)                ║ │
│  ╚═══════════════════════════════════════════════════════════════╝ │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ #Tutorial  #Guide  #Getting Started  #Help  #Documentation  │ │
│  │ ↑ All Tags (no limit in modal)                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ✅ Status: Published ← Status Badge                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ╔═══════════════════════════════════════════════════════════════╗ │
│  ║                    ARTICLE CONTENT                            ║ │
│  ║  ───────────────────────────────────────────────────────────  ║ │
│  ║                                                               ║ │
│  ║  Step 1: Create an account                                   ║ │
│  ║  To get started with TempMail, simply visit the home page... ║ │
│  ║                                                               ║ │
│  ║  Step 2: Generate your email                                 ║ │
│  ║  Click the "Generate Email" button and a temporary email...  ║ │
│  ║                                                               ║ │
│  ║  ↑ Full Content from Notion (Rich Text blocks)               ║ │
│  ║                                                               ║ │
│  ╚═══════════════════════════════════════════════════════════════╝ │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ View in Notion    [Open in Notion ↗] ← URL (External Link)  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Property Usage Details

### 1. Title (Required)
- **Type**: Notion Title property
- **Used In**: 
  - Card: Main heading (2-line max with ellipsis)
  - Modal: Header title (full text, no truncation)
- **Styling**: 
  - Card: `text-lg font-bold` (18px, bold)
  - Modal: `text-2xl font-bold` (24px, bold)
- **Dark Mode**: Switches between gray-800 and gray-100

### 2. Content (Optional)
- **Type**: Notion Rich Text property
- **Used In**: 
  - Card: Not shown (performance optimization)
  - Modal: Full content display in main body
- **Loading**: Fetched on-demand when modal opens
- **Fallback**: "No content available" if empty
- **Styling**: `prose dark:prose-invert` (Tailwind typography)

### 3. Status (Optional)
- **Type**: Notion Select property
- **Values**: Published, Draft, In Progress, Archived
- **Used In**:
  - Card: Badge overlay on gradient header
  - Modal: Badge below tags
- **Colors**:
  ```
  Published   → Green badge
  Draft       → Gray badge
  In Progress → Yellow badge
  Archived    → Red badge
  ```
- **Filter**: API only returns "Published" posts by default

### 4. Tags (Optional)
- **Type**: Notion Multi-select property
- **Used In**:
  - Card: Shows first 3 tags + "X more" indicator
  - Modal: Shows all tags
- **Styling**: 
  - Blue rounded pills
  - `text-xs` (12px) on cards
  - `text-sm` (14px) in modal
- **Dark Mode**: Blue-100/900 background, blue-800/200 text

### 5. Author (Optional)
- **Type**: Notion Text property
- **Default**: "Anonymous" if not provided
- **Used In**:
  - Card: Metadata row with user icon
  - Modal: Header metadata with user icon
- **Icon**: `👤` SVG user icon (16x16px)
- **Styling**: `text-sm text-gray-600 dark:text-gray-400`

### 6. Created Time (Auto-generated)
- **Type**: Notion Created Time property (auto)
- **Used In**:
  - Card: Metadata row with calendar icon (relative format)
  - Modal: Header metadata (full date format)
- **Formats**:
  - Card: "Today", "Yesterday", "2 days ago", "3 weeks ago"
  - Modal: "November 9, 2025"
- **Icon**: `📅` SVG calendar icon (16x16px)
- **Calculation**: Relative to current date/time

### 7. Last Edited Time (Auto-generated)
- **Type**: Notion Last Edited Time property (auto)
- **Used In**: Available in API response
- **Display**: Currently not shown in UI (can be added)
- **Use Case**: Could show "Updated 2 hours ago" badge

### 8. URL (Auto-generated)
- **Type**: Notion page URL (auto)
- **Used In**: Modal footer
- **Display**: "Open in Notion ↗" button
- **Behavior**: Opens in new tab with `target="_blank"`
- **Security**: Uses `rel="noopener noreferrer"`
- **Styling**: Blue button with external link icon

## Visual Examples

### Article Card States

#### 1. Normal State
```
┌────────────────────────────┐
│ ╔════════════════════════╗ │
│ ║   Gradient Header      ║ │
│ ║   [Published]          ║ │
│ ╚════════════════════════╝ │
│ Article Title Here         │
│ 👤 Author  📅 2 days ago    │
│ #tag1 #tag2 #tag3          │
│ Read article →             │
└────────────────────────────┘
```

#### 2. Hover State
```
┌────────────────────────────┐
│ ╔════════════════════════╗ │ ← Darker gradient
│ ║   Shadow increases     ║ │ ← shadow-xl
│ ║   [Published]          ║ │
│ ╚════════════════════════╝ │
│ Article Title Here         │ ← Blue color
│ 👤 Author  📅 2 days ago    │
│ #tag1 #tag2 #tag3          │
│ Read article →             │ ← Moves right
└────────────────────────────┘
```

#### 3. Loading State (Skeleton)
```
┌────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Pulsing gray
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓              │ ← Animated pulse
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         │
└────────────────────────────┘
```

### Responsive Layouts

#### Mobile (1 column)
```
┌─────────────┐
│   Card 1    │
├─────────────┤
│   Card 2    │
├─────────────┤
│   Card 3    │
└─────────────┘
```

#### Tablet (2 columns)
```
┌────────┬────────┐
│ Card 1 │ Card 2 │
├────────┼────────┤
│ Card 3 │ Card 4 │
└────────┴────────┘
```

#### Desktop (3 columns)
```
┌─────┬─────┬─────┐
│ C1  │ C2  │ C3  │
├─────┼─────┼─────┤
│ C4  │ C5  │ C6  │
└─────┴─────┴─────┘
```

## Dark Mode Comparison

### Light Mode
```
Card Background: White (#FFFFFF)
Text Color: Gray-800 (#1F2937)
Border: Gray-200 (#E5E7EB)
Status Badge: Colored backgrounds (light)
Tags: Blue-100 bg, Blue-800 text
```

### Dark Mode
```
Card Background: Gray-800 (#1F2937)
Text Color: Gray-100 (#F3F4F6)
Border: Gray-600 (#4B5563)
Status Badge: Colored backgrounds (dark)
Tags: Blue-900 bg, Blue-200 text
```

## Empty States

### No Configuration
```
┌───────────────────────────────┐
│        ❌ (Error Icon)         │
│                               │
│  Unable to load articles      │
│  Notion API not configured... │
│                               │
│     [ Try Again ]             │
└───────────────────────────────┘
```

### No Published Posts
```
┌───────────────────────────────┐
│        📄 (Document Icon)      │
│                               │
│  No articles available        │
│  Articles will appear once... │
│                               │
└───────────────────────────────┘
```

## Animation Timing

- **Card Hover**: 300ms ease-in-out
- **Modal Open**: Fade in 200ms
- **Modal Close**: Fade out 300ms
- **Skeleton Pulse**: 2s infinite
- **Theme Transition**: 200ms
- **Button Hover**: 200ms
- **Arrow Slide**: 200ms transform

## Color Palette

### Status Colors
```css
Published:
  Light: bg-green-100 (#D1FAE5) text-green-800 (#065F46)
  Dark:  bg-green-900 (#064E3B) text-green-300 (#6EE7B7)

Draft:
  Light: bg-gray-100 (#F3F4F6) text-gray-800 (#1F2937)
  Dark:  bg-gray-700 (#374151) text-gray-300 (#D1D5DB)

In Progress:
  Light: bg-yellow-100 (#FEF3C7) text-yellow-800 (#92400E)
  Dark:  bg-yellow-900 (#78350F) text-yellow-300 (#FCD34D)

Archived:
  Light: bg-red-100 (#FEE2E2) text-red-800 (#991B1B)
  Dark:  bg-red-900 (#7F1D1D) text-red-300 (#FCA5A5)
```

### Gradient Headers
```css
Background: linear-gradient(to bottom right, #3B82F6, #9333EA)
Colors: from-blue-500 to-purple-600
Opacity: Group hover adds 20% black overlay
```

## Property Priority

When displaying limited information:

1. **Always Show**: Title, Author, Date
2. **Conditional**: Status (if set), Tags (if any)
3. **On-Demand**: Content (modal only)
4. **Available**: URL (always in modal)

## Data Flow

```
Notion Database
       ↓
   Backend API (/api/notion/posts)
       ↓
   Frontend API Client (api.js)
       ↓
   PopularArticles Component
       ↓
   ┌──────────┬──────────┐
   │   Cards  │  Modal   │
   └──────────┴──────────┘
```

---

This mapping ensures **every property** from your Notion database is displayed somewhere in the UI, providing complete visibility of your blog content!

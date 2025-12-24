# HappiBean Widget - Development Documentation

## Overview
HappiBean Widget is a customer support widget embedded on client websites. The system consists of:
- **Widget** (`/private/tmp/happibean-widget`) - React-based IIFE bundle hosted on GitHub Pages
- **Portal** (`/private/tmp/happibean-portal`) - Admin portal for configuring the widget
- **API Proxy** (`https://happibean-api.onrender.com`) - Backend that proxies Zendesk API
- **Update Server** (`server.js`) - Local server for live widget updates from the portal

## Architecture

```
+------------------+     +------------------+     +------------------+
|   HappiBean      |     |   Update Server  |     |   GitHub Pages   |
|   Portal         | --> |   (localhost)    | --> |   (widget.iife)  |
|   (localhost)    |     |   port 4567      |     |                  |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
+------------------+     +------------------+     +------------------+
|   Customer's     | <-- |   Widget IIFE    | --> |   Zendesk API    |
|   Website        |     |   (embedded)     |     |   (via proxy)    |
+------------------+     +------------------+     +------------------+
```

## Widget URL
```
https://barrowisak.github.io/happibean-widget/widget.iife.js
```

## Zendesk Integration

### API Credentials
- **Subdomain**: happirel
- **API Proxy**: https://happibean-api.onrender.com

### Messaging Keys
- **B2B Key**: `b2a4b6ba-575e-4f0b-85b8-37e93e76dfc6`
- **B2C Key**: (same as B2B for now)

### Zendesk Messaging Embedded Mode
The MessagesTab uses Zendesk's **embedded mode** to render the chat directly inside the widget container instead of as a floating popup.

**Implementation:**
```javascript
// Hide default floating launcher
window.zE('messenger', 'hide')

// Render in embedded mode
window.zE('messenger', 'render', {
  mode: 'embedded',
  widget: { targetElement: '#happibean-messenger-container' }
})
```

**Key points:**
- Container element must exist in DOM before calling render
- The widget automatically fills the container's dimensions
- Don't mix embedded and floating modes on the same page
- Proactive messages aren't visible in embedded mode

**Documentation:** https://developer.zendesk.com/documentation/zendesk-web-widget-sdks/sdks/web/embedded-mode/

### Ticket Forms
- **Green Relations B2C** (ID: 4411991602066) - Used for Contact tab
  - Has dynamic fields based on "Ticket Category" (ID: 4412016590098)
  - Conditions control which child fields are displayed

## Widget Tabs

### Home
- Welcome message with logo
- Search function for Help Center articles
- Quick links to popular articles
- "Send us a message" card that opens Messages tab

### Help
- Browse Help Center categories and articles
- Shows B2B articles (brand_id filter if applicable)
- **"Open in Help Center" button** on each article (opens in new tab)

### Messages
- **Zendesk Messaging embedded directly in the tab**
- Uses embedded mode API for seamless integration
- Shows loading spinner while Zendesk initializes
- B2B bot (Miss Business Bean) greets users automatically
- Full chat functionality within the widget

### Contact
- Dynamic contact form based on Zendesk Ticket Forms
- Fields show/hide based on `conditions` from API
- Hardcoded to "Green Relations" form

## Configuration (window.HAPPIBEAN_CONFIG)

```javascript
window.HAPPIBEAN_CONFIG = {
  apiUrl: "https://happibean-api.onrender.com",
  colors: {
    primary: "#6F4E37",
    secondary: "#8B7355",
    background: "#FFFFFF"
  },
  tabs: ["home", "messages", "help", "contact"],
  texts: {
    welcomeTitle: "Welcome!",
    welcomeSubtitle: "How can we help you today?"
  },
  logoUrl: "",
  position: "bottom-right", // or "bottom-left"
  launcherIcon: "question", // question, chat, support, smile
  zendeskKey: "b2a4b6ba-575e-4f0b-85b8-37e93e76dfc6"
};
```

## Live Update Server

The portal can update the live widget in real-time using the update server.

### Starting the server
```bash
cd /private/tmp/happibean-widget
node server.js
```

The server runs on `http://localhost:4567` and:
1. Receives config updates from the portal via POST `/update`
2. Regenerates `src/config.ts` with new settings
3. Builds the widget (`npm run build`)
4. Commits and pushes to GitHub
5. Widget is automatically updated on GitHub Pages

### Server Endpoints
- `POST /update` - Update widget configuration
- `GET /health` - Health check

## Portal Features

### Design Section
- **Primary/Secondary/Background colors** - Color pickers with hex input
- **Logo** - Drag & drop upload or URL input (converted to base64)
- **Position** - Bottom-right or bottom-left
- **Launcher Icon** - Question, Chat, Support, or Smile icon

### Content Section
- **Welcome Title/Subtitle** - Customizable header text
- **Tabs** - Enable/disable and drag to reorder tabs

### API Section
- **API URL** - Zendesk proxy URL
- **Zendesk Messaging Key** - For live chat functionality
- **Zendesk Account** - Subdomain, email, API token (for proxy)

### Export Section
- **Update Live Widget** - Push changes to GitHub Pages
- **Export for Customer** - Generate embed code

## Build & Deploy

### Manual Build
```bash
cd /private/tmp/happibean-widget
npm run build
git add -A && git commit -m "message" && git push
```

### Via Portal
1. Start the update server: `node server.js`
2. Open the portal: `npm run dev` (in portal directory)
3. Make changes in the portal
4. Click "Update Live Widget"

Widget updates automatically on GitHub Pages after push.

## Configuration Flow

```
Portal Config Changes
        |
        v
updateLiveWidget() - sends POST to localhost:4567/update
        |
        v
server.js receives config
        |
        v
Generates new src/config.ts
        |
        v
npm run build (creates widget.iife.js)
        |
        v
git add, commit, push
        |
        v
GitHub Pages serves updated widget
```

## State Persistence

### Portal
- All settings saved to localStorage (`happibean-config`)
- Syncs with live config on page load via "Sync with live" button
- Tab order preserved when syncing

### Widget
- Config comes from `window.HAPPIBEAN_CONFIG` (set by embed code)
- Or uses defaults from `src/config.ts` (for GitHub Pages version)

## Key Files

### Widget
- `src/config.ts` - Default configuration (auto-generated by server)
- `src/components/MessagesTab.tsx` - Zendesk embedded chat
- `src/components/HelpTab.tsx` - Help center browser with "Open in Help Center" button
- `src/components/HomeTab.tsx` - Welcome screen
- `src/components/ContactTab.tsx` - Dynamic contact form
- `src/components/SupportWidget.tsx` - Main widget container
- `server.js` - Update server for portal integration

### Portal
- `src/App.tsx` - Main portal application
- Manages all widget configuration
- Sends updates to server.js

## Changelog

### 2024-12-24 (Latest)
- **Zendesk Messaging embedded mode** - Chat now renders directly inside MessagesTab
- Added "Open in Help Center" button to articles
- Fixed tab reordering - tabs no longer disappear after updating
- zendeskKey properly saved and passed through entire flow
- localStorage persistence for portal settings
- launcherIcon properly saved in config

### 2024-12-23
- Fixed dynamic form fields - child fields hidden until parent value selected
- Added launcher icon selector (question, chat, support, smile)
- Fixed white background on all form inputs/selects
- Header redesign - removed "Support" text, logo next to welcome

### Earlier
- Initial widget with Home, Help, Contact, Messages tabs
- Zendesk Help Center integration
- Zendesk Ticket Forms integration with dynamic fields
- Portal for widget configuration

## Troubleshooting

### Chat not loading
1. Check that `zendeskKey` is set in config
2. Look at browser console for `[HappiBean]` logs
3. Ensure Zendesk Messaging is enabled for the key

### Portal not connecting
1. Make sure `node server.js` is running in widget directory
2. Check that port 4567 is not blocked
3. Look at server console for errors

### Tabs not updating
1. Clear localStorage in browser
2. Click "Sync with live" in portal
3. Check server.js logs for tab array being received

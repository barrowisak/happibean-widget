# HappiBean Widget - Development Documentation

## Overview
HappiBean Widget är en kundsupport-widget som bäddas in på kunders webbsidor. Den består av:
- **Widget** (`/private/tmp/happibean-widget`) - React-baserad IIFE-bundle som hostas på GitHub Pages
- **Portal** (`/private/tmp/happibean-portal`) - Admin-portal för att konfigurera widgeten
- **API Proxy** (`https://happibean-api.onrender.com`) - Backend som proxar Zendesk API

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
- **B2C Key**: (samma som B2B för tillfället)

### Ticket Forms
- **Green Relations B2C** (ID: 4411991602066) - Används för Contact-fliken
  - Har dynamiska fält baserade på "Ticket Category" (ID: 4412016590098)
  - Conditions styr vilka child fields som visas

## Widget Tabs

### Home
- Välkomstmeddelande
- Sökfunktion för Help Center-artiklar
- Snabblänkar

### Help
- Bläddra i Help Center-kategorier och artiklar
- Visar B2B-artiklar (brand_id filter om tillämpligt)

### Messages
- **STATUS: UNDER UTVECKLING**
- Mål: Inbäddad Zendesk-chatt direkt i widgeten
- Problem: Zendesk Messaging SDK öppnar alltid popup/overlay
- TODO: Implementera inbäddad chatt via Sunshine Conversations API eller hitta sätt att bädda in Zendesk Messaging

### Contact
- Dynamiskt kontaktformulär baserat på Zendesk Ticket Forms
- Fält visas/döljs baserat på `conditions` från API
- Hardkodat till "Green Relations" formuläret

## Configuration (window.HAPPIBEAN_CONFIG)

```javascript
window.HAPPIBEAN_CONFIG = {
  apiUrl: "https://happibean-api.onrender.com",
  colors: {
    primary: "#6F4E37",
    secondary: "#8B7355",
    background: "#FFFFFF"
  },
  tabs: ["home", "help", "messages", "contact"],
  texts: {
    welcomeTitle: "Hej! 👋",
    welcomeSubtitle: "Hur kan vi hjälpa dig idag?"
  },
  logoUrl: "",
  position: "bottom-right", // eller "bottom-left"
  launcherIcon: "question", // question, chat, support, smile
  zendeskKey: "b2a4b6ba-575e-4f0b-85b8-37e93e76dfc6"
};
```

## Build & Deploy

```bash
cd /private/tmp/happibean-widget
npm run build
git add -A && git commit -m "message" && git push
```

Widget uppdateras automatiskt på GitHub Pages efter push.

## Known Issues / TODOs

1. **Inbäddad chatt fungerar inte** - Zendesk Messaging öppnar popup istället för att bäddas in i Messages-fliken
2. **Form fields styling** - Alla inputs har nu vit bakgrund (`#ffffff`) och svart text (`#333333`)

## Changelog

### 2024-12-23
- Fixade dynamiska formulärfält - child fields döljs tills parent-värde väljs
- Lade till launcher icon selector (question, chat, support, smile)
- Fixade vit bakgrund på alla form inputs/selects
- Försökte implementera inbäddad chatt (pågående)

### Tidigare
- Initial widget med Home, Help, Contact, Messages tabs
- Zendesk Help Center integration
- Zendesk Ticket Forms integration med dynamiska fält
- Portal för widget-konfiguration

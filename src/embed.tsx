import React from 'react'
import { createRoot } from 'react-dom/client'
import { getConfig } from './config'
import { WidgetLauncher } from './components/WidgetLauncher'

// Create container
const container = document.createElement('div')
container.id = 'happibean-widget-root'
document.body.appendChild(container)

// Get config and inject CSS variables
const config = getConfig()

const style = document.createElement('style')
style.textContent = `
  :root {
    --hb-primary: ${config.colors.primary};
    --hb-secondary: ${config.colors.secondary};
    --hb-background: ${config.colors.background};
  }

  #happibean-widget-root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  #happibean-widget-root * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
`
document.head.appendChild(style)

// Render widget
const root = createRoot(container)
root.render(<WidgetLauncher config={config} />)

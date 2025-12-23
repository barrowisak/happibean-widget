#!/usr/bin/env node
/**
 * HappiBean Widget Config Updater
 *
 * Usage: node update-config.js <config.json>
 *
 * This script reads a config JSON file exported from the portal,
 * updates src/config.ts with the new default values, rebuilds the widget,
 * and commits + pushes to GitHub.
 */

import fs from 'fs'
import { execSync } from 'child_process'

const configPath = process.argv[2]

if (!configPath) {
  console.error('Usage: node update-config.js <config.json>')
  process.exit(1)
}

// Read the config
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

console.log('📝 Updating config with:')
console.log(`   Primary color: ${config.colors?.primary || '#6F4E37'}`)
console.log(`   Secondary color: ${config.colors?.secondary || '#8B7355'}`)
console.log(`   Tabs: ${config.tabs?.join(', ') || 'home, help, contact'}`)
console.log(`   Position: ${config.position || 'bottom-right'}`)

// Generate new config.ts content
const configTs = `export interface HappiBeanConfig {
  apiUrl: string
  colors: {
    primary: string
    secondary: string
    background: string
  }
  tabs: ('home' | 'help' | 'contact' | 'messages')[]
  texts: {
    welcomeTitle: string
    welcomeSubtitle: string
  }
  logoUrl?: string
  position?: 'bottom-right' | 'bottom-left'
  zendeskKey?: string
}

declare global {
  interface Window {
    HAPPIBEAN_CONFIG?: Partial<HappiBeanConfig>
  }
}

const defaultConfig: HappiBeanConfig = {
  apiUrl: 'https://zendesk-proxy-kz58.onrender.com',
  colors: {
    primary: '${config.colors?.primary || '#6F4E37'}',
    secondary: '${config.colors?.secondary || '#8B7355'}',
    background: '${config.colors?.background || '#FFFFFF'}'
  },
  tabs: ${JSON.stringify(config.tabs || ['home', 'help', 'contact'])},
  texts: {
    welcomeTitle: '${config.texts?.welcomeTitle || 'Hej! 👋'}',
    welcomeSubtitle: '${config.texts?.welcomeSubtitle || 'Hur kan vi hjälpa dig idag?'}'
  },
  logoUrl: '${config.logoUrl || ''}',
  position: '${config.position || 'bottom-right'}'
}

export function getConfig(): HappiBeanConfig {
  const userConfig = window.HAPPIBEAN_CONFIG || {}
  return {
    ...defaultConfig,
    ...userConfig,
    colors: { ...defaultConfig.colors, ...userConfig.colors },
    texts: { ...defaultConfig.texts, ...userConfig.texts }
  }
}
`

// Write the new config
fs.writeFileSync('src/config.ts', configTs)
console.log('✅ Config updated')

// Build
console.log('🔨 Building widget...')
execSync('npm run build', { stdio: 'inherit' })
console.log('✅ Build complete')

// Git commit and push
console.log('📤 Pushing to GitHub...')
execSync('git add .', { stdio: 'inherit' })
execSync('git commit -m "Update widget design from portal"', { stdio: 'inherit' })
execSync('git push origin main', { stdio: 'inherit' })
console.log('✅ Pushed to GitHub!')

console.log('')
console.log('🎉 Done! Your widget will be live in ~1 minute.')
console.log('   URL: https://barrowisak.github.io/happibean-widget/widget.iife.js')
`

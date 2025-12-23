#!/usr/bin/env node
/**
 * HappiBean Widget Update Server
 *
 * Run this locally to allow the portal to update the widget via HTTP.
 * Usage: node server.js
 *
 * The portal will send POST requests to http://localhost:4567/update
 */

import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 4567

app.use(cors())
app.use(express.json())

app.post('/update', (req, res) => {
  try {
    const config = req.body
    console.log('📝 Received config update:')
    console.log(`   Primary: ${config.colors?.primary}`)
    console.log(`   Tabs: ${config.tabs?.join(', ')}`)

    // Generate new config.ts
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
  apiUrl: 'https://happibean-api.onrender.com',
  colors: {
    primary: '${config.colors?.primary || '#6F4E37'}',
    secondary: '${config.colors?.secondary || '#8B7355'}',
    background: '${config.colors?.background || '#FFFFFF'}'
  },
  tabs: ${JSON.stringify(config.tabs || ['home', 'messages', 'help', 'contact'])},
  texts: {
    welcomeTitle: '${config.texts?.welcomeTitle || 'Welcome!'}',
    welcomeSubtitle: '${config.texts?.welcomeSubtitle || 'How can we help you today?'}'
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

    // Write config
    fs.writeFileSync(join(__dirname, 'src/config.ts'), configTs)
    console.log('✅ Config updated')

    // Build
    console.log('🔨 Building widget...')
    execSync('npm run build', { cwd: __dirname, stdio: 'inherit' })
    console.log('✅ Build complete')

    // Git commit and push
    console.log('📤 Pushing to GitHub...')
    execSync('git add .', { cwd: __dirname })
    execSync('git commit -m "Update widget design from portal"', { cwd: __dirname })
    execSync('git push origin main', { cwd: __dirname })
    console.log('✅ Pushed to GitHub!')

    res.json({ success: true, message: 'Widget updated and deployed!' })
  } catch (error) {
    console.error('❌ Error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log('')
  console.log('🚀 HappiBean Widget Update Server')
  console.log(`   Running on http://localhost:${PORT}`)
  console.log('')
  console.log('   Portal can now update the live widget!')
  console.log('')
})

export interface HappiBeanConfig {
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
    primary: '#6F4E37',
    secondary: '#8B7355',
    background: '#FFFFFF'
  },
  tabs: ['home', 'help', 'contact'],
  texts: {
    welcomeTitle: 'Hej! 👋',
    welcomeSubtitle: 'Hur kan vi hjälpa dig idag?'
  },
  position: 'bottom-right'
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

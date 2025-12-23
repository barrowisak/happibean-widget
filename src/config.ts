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
  launcherIcon?: 'question' | 'chat' | 'support' | 'smile'
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
    primary: '#6F4E37',
    secondary: '#8B7355',
    background: '#FFFFFF'
  },
  tabs: ["home","help","messages","contact"],
  texts: {
    welcomeTitle: 'Welcome!',
    welcomeSubtitle: 'How can we help you today?'
  },
  logoUrl: '',
  position: 'bottom-right',
  zendeskKey: 'b2a4b6ba-575e-4f0b-85b8-37e93e76dfc6'
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

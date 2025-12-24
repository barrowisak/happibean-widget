import { useEffect, useState } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
  autoOpen?: boolean
}

declare global {
  interface Window {
    zE?: (action: string, command: string, callback?: unknown) => void
  }
}

export function MessagesTab({ config }: Props) {
  const [zendeskLoaded, setZendeskLoaded] = useState(false)
  const [chatOpened, setChatOpened] = useState(false)

  // Load Zendesk script
  useEffect(() => {
    if (!config.zendeskKey) return

    // Check if already loaded
    if (window.zE) {
      setZendeskLoaded(true)
      return
    }

    // Check if script exists
    const existingScript = document.getElementById('ze-snippet')
    if (existingScript) {
      const poll = setInterval(() => {
        if (window.zE) {
          setZendeskLoaded(true)
          clearInterval(poll)
        }
      }, 100)
      setTimeout(() => clearInterval(poll), 10000)
      return
    }

    // Load script
    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.zendeskKey}`
    script.async = true
    script.onload = () => {
      const poll = setInterval(() => {
        if (window.zE) {
          setZendeskLoaded(true)
          // Hide the default launcher
          window.zE('messenger', 'hide')
          clearInterval(poll)
        }
      }, 100)
      setTimeout(() => clearInterval(poll), 10000)
    }
    document.head.appendChild(script)
  }, [config.zendeskKey])

  const openChat = () => {
    if (window.zE) {
      window.zE('messenger', 'show')
      window.zE('messenger', 'open')
      setChatOpened(true)
    }
  }

  if (!config.zendeskKey) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p style={{ color: '#666', marginTop: '16px', fontSize: '14px' }}>
          Chatt är inte konfigurerad.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={config.colors.primary} strokeWidth="1.5" style={{ opacity: 0.7 }}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>

      <h3 style={{
        color: '#333',
        marginTop: '20px',
        marginBottom: '8px',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        Meddelanden
      </h3>

      <p style={{
        color: '#666',
        fontSize: '14px',
        maxWidth: '250px',
        lineHeight: '1.5',
        marginBottom: '20px'
      }}>
        {chatOpened
          ? 'Chatten är öppen. Klicka på Zendesk-ikonen för att fortsätta.'
          : 'Starta en konversation med vårt supportteam.'}
      </p>

      <button
        onClick={openChat}
        disabled={!zendeskLoaded}
        style={{
          padding: '14px 28px',
          background: zendeskLoaded
            ? `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`
            : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: zendeskLoaded ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {zendeskLoaded
          ? (chatOpened ? 'Öppna chatten' : 'Starta chatt')
          : 'Laddar...'}
      </button>
    </div>
  )
}

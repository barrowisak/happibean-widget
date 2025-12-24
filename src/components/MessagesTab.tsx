import React, { useEffect, useRef, useState } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
  autoOpen?: boolean
}

declare global {
  interface Window {
    zE?: (action: string, command: string, callback?: () => void) => void
  }
}

export function MessagesTab({ config, autoOpen }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zendeskLoaded, setZendeskLoaded] = useState(false)
  const [chatOpen, setChatOpen] = useState(autoOpen || false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!config.zendeskKey) return

    // Check if zE is already available
    if (window.zE) {
      console.log('[HappiBean] Zendesk already loaded')
      setZendeskLoaded(true)
      window.zE('messenger', 'hide')
      return
    }

    // Check if script already exists
    const existingScript = document.getElementById('ze-snippet')
    if (existingScript) {
      // Script exists but zE not ready yet - poll for it
      const pollInterval = setInterval(() => {
        if (window.zE) {
          console.log('[HappiBean] Zendesk ready (polled)')
          setZendeskLoaded(true)
          window.zE('messenger', 'hide')
          clearInterval(pollInterval)
        }
      }, 100)

      // Stop polling after 10 seconds
      setTimeout(() => {
        clearInterval(pollInterval)
        if (!window.zE) {
          setLoadError('Zendesk kunde inte laddas')
        }
      }, 10000)
      return
    }

    console.log('[HappiBean] Loading Zendesk script with key:', config.zendeskKey)

    // Load Zendesk Messaging script
    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.zendeskKey}`
    script.async = true

    script.onload = () => {
      console.log('[HappiBean] Script loaded, waiting for zE...')
      // Poll for zE to become available
      const pollInterval = setInterval(() => {
        if (window.zE) {
          console.log('[HappiBean] Zendesk ready!')
          setZendeskLoaded(true)
          window.zE('messenger', 'hide')
          clearInterval(pollInterval)
        }
      }, 100)

      // Stop polling after 10 seconds
      setTimeout(() => {
        clearInterval(pollInterval)
        if (!window.zE) {
          console.error('[HappiBean] Zendesk failed to initialize')
          setLoadError('Zendesk kunde inte initialiseras')
        }
      }, 10000)
    }

    script.onerror = () => {
      console.error('[HappiBean] Failed to load Zendesk script')
      setLoadError('Kunde inte ladda Zendesk-scriptet')
    }

    document.head.appendChild(script)

    return () => {
      // Hide messenger when component unmounts
      if (window.zE) {
        window.zE('messenger', 'hide')
        window.zE('messenger', 'close')
      }
    }
  }, [config.zendeskKey])

  useEffect(() => {
    // Auto-open chat if requested
    if (autoOpen && zendeskLoaded && window.zE) {
      window.zE('messenger', 'open')
      setChatOpen(true)
    }
  }, [autoOpen, zendeskLoaded])

  const openChat = () => {
    console.log('[HappiBean] openChat called, zE:', !!window.zE)
    if (window.zE) {
      window.zE('messenger', 'open')
      setChatOpen(true)
    } else {
      setLoadError('Zendesk är inte laddat ännu')
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
        <p style={{ color: '#999', fontSize: '13px' }}>
          Kontakta oss via kontaktformuläret istället.
        </p>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '350px',
      background: 'white',
      borderRadius: '8px'
    }}>
      {/* Chat history placeholder */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={config.colors.primary} strokeWidth="1.5" style={{ opacity: 0.6 }}>
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
          lineHeight: '1.5'
        }}>
          {loadError
            ? loadError
            : chatOpen
              ? 'Chatten är öppen. Klicka på chattfönstret för att fortsätta.'
              : 'Starta en ny konversation med vårt supportteam.'}
        </p>
        {loadError && (
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: config.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Ladda om sidan
          </button>
        )}
      </div>

      {/* Start chat button */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #eee'
      }}>
        <button
          onClick={openChat}
          disabled={!zendeskLoaded}
          style={{
            width: '100%',
            padding: '14px 20px',
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
            justifyContent: 'center',
            gap: '10px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => {
            if (zendeskLoaded) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {zendeskLoaded
            ? (chatOpen ? 'Öppna chatten' : 'Starta ny chatt')
            : 'Laddar...'}
        </button>
      </div>
    </div>
  )
}

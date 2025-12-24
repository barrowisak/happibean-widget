import { useEffect, useRef, useState } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
  autoOpen?: boolean
}

declare global {
  interface Window {
    zE?: (action: string, command: string, options?: unknown) => void
  }
}

export function MessagesTab({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zendeskLoaded, setZendeskLoaded] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load Zendesk script
  useEffect(() => {
    if (!config.zendeskKey) return

    // Check if script already exists
    const existingScript = document.getElementById('ze-snippet')
    if (existingScript) {
      // Poll for zE to become available
      const pollInterval = setInterval(() => {
        if (window.zE) {
          console.log('[HappiBean] Zendesk ready (polled)')
          setZendeskLoaded(true)
          clearInterval(pollInterval)
        }
      }, 100)

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
      const pollInterval = setInterval(() => {
        if (window.zE) {
          console.log('[HappiBean] Zendesk ready!')
          setZendeskLoaded(true)
          clearInterval(pollInterval)
        }
      }, 100)

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
  }, [config.zendeskKey])

  // Render widget in embedded mode once loaded
  useEffect(() => {
    if (!zendeskLoaded || !window.zE || !containerRef.current || rendered) return

    console.log('[HappiBean] Rendering in embedded mode...')

    try {
      // Hide the default floating launcher
      window.zE('messenger', 'hide')

      // Small delay to ensure container is ready
      setTimeout(() => {
        if (window.zE) {
          // Render in embedded mode
          window.zE('messenger', 'render', {
            mode: 'embedded',
            widget: { targetElement: '#happibean-messenger-container' }
          })
          setRendered(true)
          console.log('[HappiBean] Embedded render complete!')
        }
      }, 100)
    } catch (err) {
      console.error('[HappiBean] Failed to render embedded:', err)
      setLoadError('Kunde inte bädda in chatten')
    }
  }, [zendeskLoaded, rendered])

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

  // Show loading state
  if (!rendered) {
    return (
      <div ref={containerRef} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '400px'
      }}>
        {/* Container for embedded Zendesk widget */}
        <div
          id="happibean-messenger-container"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa',
            borderRadius: '8px'
          }}
        >
          {loadError ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#c00', marginBottom: '10px' }}>{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 16px',
                  background: config.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Ladda om sidan
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#888' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: `3px solid ${config.colors.primary}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px'
              }} />
              <p>Laddar chatt...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show embedded widget - seamless integration
  return (
    <div ref={containerRef} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '400px',
      margin: '-20px -20px -20px -20px',
      width: 'calc(100% + 40px)'
    }}>
      {/* Container for embedded Zendesk widget */}
      <div
        id="happibean-messenger-container"
        style={{
          flex: 1,
          minHeight: '450px',
          position: 'relative'
        }}
      />
      <style>{`
        #happibean-messenger-container,
        #happibean-messenger-container > div,
        #happibean-messenger-container iframe,
        #happibean-messenger-container [class*="messenger"],
        #happibean-messenger-container [data-garden-container] {
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        #happibean-messenger-container iframe {
          width: 100% !important;
          height: 100% !important;
          min-height: 450px !important;
        }
        /* Remove Zendesk's outer frame styling */
        [data-embed="true"] {
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  )
}

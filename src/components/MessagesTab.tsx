import { useEffect, useRef, useState } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
  autoOpen?: boolean
}

declare global {
  interface Window {
    zE?: (action: string, command: string, options?: unknown) => void
    zESettings?: Record<string, unknown>
    __HAPPIBEAN_ZE_RENDERED?: boolean
  }
}

export function MessagesTab({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!config.zendeskKey) {
      setStatus('error')
      setErrorMsg('Ingen Zendesk-nyckel konfigurerad')
      return
    }

    // Prevent double rendering
    if (window.__HAPPIBEAN_ZE_RENDERED) {
      console.log('[HappiBean] Already rendered, skipping')
      setStatus('ready')
      return
    }

    // Check if Zendesk is already loaded
    if (window.zE) {
      console.log('[HappiBean] Zendesk already available')
      renderEmbedded()
      return
    }

    // Check if script already exists
    const existingScript = document.getElementById('ze-snippet')
    if (existingScript) {
      console.log('[HappiBean] Script exists, polling for zE...')
      pollForZendesk()
      return
    }

    console.log('[HappiBean] Loading Zendesk script...')

    // Configure Zendesk to not auto-show
    window.zESettings = {
      messenger: {
        launcher: { visible: false }
      }
    }

    // Load script
    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.zendeskKey}`
    script.async = true
    script.onload = () => {
      console.log('[HappiBean] Script loaded')
      pollForZendesk()
    }
    script.onerror = () => {
      console.error('[HappiBean] Script failed to load')
      setStatus('error')
      setErrorMsg('Kunde inte ladda Zendesk')
    }
    document.head.appendChild(script)

    function pollForZendesk() {
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        if (window.zE) {
          clearInterval(interval)
          console.log('[HappiBean] zE ready after', attempts, 'attempts')
          renderEmbedded()
        } else if (attempts > 100) {
          clearInterval(interval)
          setStatus('error')
          setErrorMsg('Zendesk tog för lång tid att ladda')
        }
      }, 100)
    }

    function renderEmbedded() {
      if (!window.zE || window.__HAPPIBEAN_ZE_RENDERED) return

      try {
        // Hide default launcher
        window.zE('messenger', 'hide')

        // Wait for container to be in DOM
        setTimeout(() => {
          const container = document.getElementById('happibean-chat-embed')
          if (!container || !window.zE) {
            console.error('[HappiBean] Container not found')
            setStatus('error')
            setErrorMsg('Kunde inte hitta container')
            return
          }

          console.log('[HappiBean] Rendering embedded...')
          window.zE('messenger', 'render', {
            mode: 'embedded',
            widget: { targetElement: '#happibean-chat-embed' }
          })

          window.__HAPPIBEAN_ZE_RENDERED = true
          setStatus('ready')
          console.log('[HappiBean] Embedded render complete!')
        }, 200)
      } catch (err) {
        console.error('[HappiBean] Render error:', err)
        setStatus('error')
        setErrorMsg('Kunde inte rendera chatten')
      }
    }

    // Cleanup
    return () => {
      // Don't cleanup zE as it's shared
    }
  }, [config.zendeskKey])

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
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '400px',
        margin: '-20px',
        width: 'calc(100% + 40px)',
        position: 'relative'
      }}
    >
      {/* Single container for Zendesk embed */}
      <div
        id="happibean-chat-embed"
        style={{
          flex: 1,
          minHeight: '450px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {status === 'loading' && (
          <div style={{ textAlign: 'center', color: '#888' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${config.colors.primary}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'happibean-spin 1s linear infinite',
              margin: '0 auto 15px'
            }} />
            <p>Laddar chatt...</p>
          </div>
        )}
        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#c00', marginBottom: '10px' }}>{errorMsg}</p>
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
        )}
      </div>

      <style>{`
        @keyframes happibean-spin {
          to { transform: rotate(360deg); }
        }
        #happibean-chat-embed iframe {
          border: none !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 450px !important;
        }
        /* Hide any floating Zendesk elements */
        [data-embed="true"]:not(#happibean-chat-embed *) {
          display: none !important;
        }
      `}</style>
    </div>
  )
}

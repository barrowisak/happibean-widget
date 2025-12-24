import { useEffect, useState, useRef } from 'react'
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
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderedRef = useRef(false)

  useEffect(() => {
    if (!config.zendeskKey) {
      setIsLoading(false)
      return
    }

    // Load Zendesk script if not already loaded
    let script = document.getElementById('ze-snippet') as HTMLScriptElement
    if (!script) {
      script = document.createElement('script')
      script.id = 'ze-snippet'
      script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.zendeskKey}`
      script.async = true
      document.head.appendChild(script)
    }

    // Poll for zE and render
    const poll = setInterval(() => {
      if (window.zE && containerRef.current && !renderedRef.current) {
        clearInterval(poll)
        renderedRef.current = true

        // Always hide the floating launcher
        window.zE('messenger', 'hide')

        // Render full widget in embedded mode
        window.zE('messenger', 'render', {
          mode: 'embedded',
          widget: {
            targetElement: '#happibean-messenger'
          }
        })

        setIsLoading(false)
      }
    }, 100)

    const timeout = setTimeout(() => {
      clearInterval(poll)
      setIsLoading(false)
    }, 15000)

    return () => {
      clearInterval(poll)
      clearTimeout(timeout)
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
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes hb-spin {
          to { transform: rotate(360deg); }
        }

        /* Hide Zendesk's floating launcher globally */
        iframe[data-product="web_widget"]:not([title*="Messaging"]),
        div[data-product="web_widget"] > iframe:not([title*="Messaging"]) {
          display: none !important;
        }

        /* Messenger container - shift up to hide Zendesk header */
        #happibean-messenger {
          position: absolute !important;
          top: -56px !important;
          left: 0 !important;
          right: 0 !important;
          bottom: -40px !important;
          height: calc(100% + 96px) !important;
        }
        #happibean-messenger iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }
      `}</style>

      {isLoading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: `3px solid ${config.colors.primary}20`,
            borderTopColor: config.colors.primary,
            borderRadius: '50%',
            animation: 'hb-spin 1s linear infinite'
          }} />
          <p style={{ color: '#666', fontSize: '14px' }}>Laddar...</p>
        </div>
      )}

      <div
        id="happibean-messenger"
        ref={containerRef}
        style={{
          display: isLoading ? 'none' : 'block'
        }}
      />
    </div>
  )
}

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

export function MessagesTab({ config, autoOpen }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [showChat, setShowChat] = useState(autoOpen || false)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderedRef = useRef(false)

  useEffect(() => {
    if (!config.zendeskKey || renderedRef.current) {
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

    // Poll for zE and render once
    const poll = setInterval(() => {
      if (window.zE && containerRef.current && !renderedRef.current) {
        clearInterval(poll)
        renderedRef.current = true

        // Render embedded in our container
        window.zE('messenger', 'render', {
          mode: 'embedded',
          widget: {
            targetElement: '#happibean-chat-container'
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

  // Auto-open chat when coming from Home tab
  useEffect(() => {
    if (autoOpen && !isLoading) {
      setShowChat(true)
    }
  }, [autoOpen, isLoading])

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

  // Conversation list view (default when clicking Messages tab)
  if (!showChat) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#333',
          marginBottom: '16px'
        }}>
          Dina konversationer
        </h3>

        {/* Placeholder for conversation list - Zendesk doesn't expose this easily */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#666'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            Starta en ny konversation med oss
          </p>
        </div>

        <button
          onClick={() => setShowChat(true)}
          style={{
            padding: '14px 20px',
            background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Ny konversation
        </button>
      </div>
    )
  }

  // Chat view (full Zendesk embedded widget)
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
        /* Position chat container to hide Zendesk header by shifting up */
        #happibean-chat-container {
          position: absolute !important;
          top: -70px !important;
          left: -1px !important;
          right: -1px !important;
          bottom: -50px !important;
          height: calc(100% + 120px) !important;
        }
        #happibean-chat-container iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }
      `}</style>

      {/* Back button */}
      <button
        onClick={() => setShowChat(false)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

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
          <p style={{ color: '#666', fontSize: '14px' }}>Laddar chatt...</p>
        </div>
      )}

      <div
        id="happibean-chat-container"
        ref={containerRef}
        style={{
          display: isLoading ? 'none' : 'block'
        }}
      />
    </div>
  )
}

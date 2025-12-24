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
  const listContainerRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const renderedRef = useRef<{ list: boolean; chat: boolean }>({ list: false, chat: false })

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
      if (window.zE) {
        clearInterval(poll)

        // Always hide the floating launcher
        window.zE('messenger', 'hide')

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

  // Render conversation list when not showing chat
  useEffect(() => {
    if (!showChat && !isLoading && window.zE && listContainerRef.current && !renderedRef.current.list) {
      renderedRef.current.list = true

      // Render conversation list in embedded mode
      window.zE('messenger', 'render', {
        mode: 'embedded',
        conversationList: {
          targetElement: '#happibean-conversation-list'
        }
      })
    }
  }, [showChat, isLoading])

  // Render chat when showing chat
  useEffect(() => {
    if (showChat && !isLoading && window.zE && chatContainerRef.current && !renderedRef.current.chat) {
      renderedRef.current.chat = true

      // Render full widget in embedded mode
      window.zE('messenger', 'render', {
        mode: 'embedded',
        widget: {
          targetElement: '#happibean-chat-container'
        }
      })
    }
  }, [showChat, isLoading])

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
        iframe[data-product="web_widget"],
        div[data-product="web_widget"] {
          display: none !important;
        }

        /* Conversation list container */
        #happibean-conversation-list {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          height: 100% !important;
        }
        #happibean-conversation-list iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }

        /* Chat container - hide Zendesk header by shifting up */
        #happibean-chat-container {
          position: absolute !important;
          top: -70px !important;
          left: 0 !important;
          right: 0 !important;
          bottom: -60px !important;
          height: calc(100% + 130px) !important;
        }
        #happibean-chat-container iframe {
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

      {/* Conversation list view */}
      <div
        id="happibean-conversation-list"
        ref={listContainerRef}
        style={{
          display: (!isLoading && !showChat) ? 'block' : 'none'
        }}
      />

      {/* Chat view */}
      <div style={{
        display: (!isLoading && showChat) ? 'block' : 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
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

        <div
          id="happibean-chat-container"
          ref={chatContainerRef}
        />
      </div>
    </div>
  )
}

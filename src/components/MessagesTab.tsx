import { useEffect, useState, useRef } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
  autoOpen?: boolean
}

declare global {
  interface Window {
    zE?: (action: string, command: string, callback?: unknown) => void
    zESettings?: { autoRender: boolean }
    __HAPPIBEAN_ZE_LOADED?: boolean
  }
}

export function MessagesTab({ config }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [isRendered, setIsRendered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!config.zendeskKey) {
      setIsLoading(false)
      return
    }

    // If we already rendered, just show it
    if (isRendered) {
      setIsLoading(false)
      return
    }

    // CRITICAL: Set this BEFORE any script loading
    window.zESettings = { autoRender: false }

    const existingScript = document.getElementById('ze-snippet')

    // If script already exists AND zE is available, it may have auto-rendered
    // We need to hide the floating one and re-render embedded
    if (existingScript && window.zE) {
      // Hide any existing floating widget
      window.zE('messenger', 'hide')

      // Render in embedded mode
      setTimeout(() => {
        if (window.zE && containerRef.current) {
          window.zE('messenger', 'render', {
            mode: 'embedded',
            widget: {
              targetElement: '#happibean-zendesk-container'
            }
          })
          setIsRendered(true)
          setIsLoading(false)
        }
      }, 100)
      return
    }

    // First time loading - set flag and load script
    if (!existingScript && !window.__HAPPIBEAN_ZE_LOADED) {
      window.__HAPPIBEAN_ZE_LOADED = true

      // Use requestAnimationFrame to ensure zESettings is set before script executes
      requestAnimationFrame(() => {
        const script = document.createElement('script')
        script.id = 'ze-snippet'
        script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.zendeskKey}`
        script.async = true
        document.head.appendChild(script)
      })
    }

    // Poll for zE to be available, then render in embedded mode
    const poll = setInterval(() => {
      if (window.zE && containerRef.current && !isRendered) {
        clearInterval(poll)

        // Render in embedded mode inside our container
        window.zE('messenger', 'render', {
          mode: 'embedded',
          widget: {
            targetElement: '#happibean-zendesk-container'
          }
        })

        setIsRendered(true)
        setIsLoading(false)
      }
    }, 100)

    // Timeout after 15 seconds
    const timeout = setTimeout(() => {
      clearInterval(poll)
      setIsLoading(false)
    }, 15000)

    return () => {
      clearInterval(poll)
      clearTimeout(timeout)
    }
  }, [config.zendeskKey, isRendered])

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
      height: '100%',
      overflow: 'hidden'
    }}>
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
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#666', fontSize: '14px' }}>Laddar chatt...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Zendesk embedded widget container */}
      <div
        id="happibean-zendesk-container"
        ref={containerRef}
        style={{
          flex: 1,
          display: isLoading ? 'none' : 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          margin: '-16px',
          marginTop: '-8px'
        }}
      />
    </div>
  )
}

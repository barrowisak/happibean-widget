import React, { useEffect, useRef, useState } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
}

export function MessagesTab({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!config.zendeskKey) {
      setStatus('error')
      return
    }

    // Check if Zendesk is already loaded
    if ((window as any).zE) {
      setStatus('ready')
      openMessenger()
      return
    }

    // Check if script is already loading
    if (scriptLoadedRef.current) return
    scriptLoadedRef.current = true

    // Load Zendesk Messaging widget
    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.zendeskKey}`
    script.async = true

    script.onload = () => {
      setStatus('ready')
      // Wait for Zendesk to initialize
      setTimeout(() => {
        openMessenger()
        moveWidgetToContainer()
      }, 1000)
    }

    script.onerror = () => {
      setStatus('error')
    }

    // Only add if not already present
    if (!document.getElementById('ze-snippet')) {
      document.head.appendChild(script)
    }

    return () => {
      // Don't remove the script on unmount - it causes issues
    }
  }, [config.zendeskKey])

  const openMessenger = () => {
    if ((window as any).zE) {
      try {
        (window as any).zE('messenger', 'open')
      } catch (e) {
        console.log('Could not open messenger:', e)
      }
    }
  }

  const moveWidgetToContainer = () => {
    // Try to find and move the Zendesk widget iframe into our container
    const container = containerRef.current
    if (!container) return

    // Zendesk creates an iframe with specific attributes
    const findAndMoveWidget = () => {
      const zendeskFrame = document.querySelector('iframe[title="Messaging window"]') as HTMLIFrameElement
      const zendeskLauncher = document.querySelector('iframe[title="Launcher"]') as HTMLIFrameElement

      if (zendeskFrame) {
        // Hide the launcher button
        if (zendeskLauncher) {
          zendeskLauncher.style.display = 'none'
        }

        // Clone styles and move to container
        zendeskFrame.style.position = 'relative'
        zendeskFrame.style.width = '100%'
        zendeskFrame.style.height = '100%'
        zendeskFrame.style.minHeight = '400px'
        zendeskFrame.style.bottom = 'auto'
        zendeskFrame.style.right = 'auto'
        zendeskFrame.style.left = '0'
        zendeskFrame.style.top = '0'

        // Move the iframe to our container
        container.appendChild(zendeskFrame)
        setStatus('ready')
      }
    }

    // Try immediately and with delays
    findAndMoveWidget()
    setTimeout(findAndMoveWidget, 500)
    setTimeout(findAndMoveWidget, 1500)
    setTimeout(findAndMoveWidget, 3000)
  }

  // Re-open messenger when tab becomes active
  useEffect(() => {
    if (status === 'ready') {
      openMessenger()
    }
  }, [status])

  if (!config.zendeskKey) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
        <h3 style={{ marginBottom: '10px', color: '#333' }}>Live chatt kommer snart</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Vår chatt-funktion är på väg. Under tiden kan du kontakta oss via kontaktformuläret.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h3 style={{ marginBottom: '10px', color: '#333' }}>Kunde inte ladda chatten</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Försök ladda om sidan eller kontakta oss via formuläret.
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
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {status === 'loading' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '300px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
          <p style={{ color: '#666', fontSize: '14px' }}>Laddar chatt...</p>
        </div>
      )}

      {status === 'ready' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '300px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>Chatten är redo!</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Klicka på knappen nedan för att starta en konversation.
          </p>
          <button
            onClick={openMessenger}
            style={{
              padding: '12px 24px',
              background: config.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Starta chatt
          </button>
        </div>
      )}
    </div>
  )
}

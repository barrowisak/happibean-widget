import React, { useEffect, useRef, useState } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
}

export function MessagesTab({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [chatStatus, setChatStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!config.zendeskKey || scriptLoadedRef.current) return

    // Check if script already exists
    const existingScript = document.getElementById('ze-snippet')
    if (existingScript) {
      scriptLoadedRef.current = true
      setChatStatus('ready')
      // Open messenger if already loaded
      if ((window as any).zE) {
        (window as any).zE('messenger', 'open')
      }
      return
    }

    // Load Zendesk Messaging widget
    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.zendeskKey}`
    script.async = true

    script.onload = () => {
      scriptLoadedRef.current = true
      setChatStatus('ready')

      // Wait a bit for Zendesk to initialize, then open messenger
      setTimeout(() => {
        if ((window as any).zE) {
          // Hide the launcher button (we have our own)
          (window as any).zE('messenger:set', 'cookies', true)
          (window as any).zE('messenger', 'open')
        }
      }, 500)
    }

    script.onerror = () => {
      setChatStatus('error')
    }

    document.head.appendChild(script)
  }, [config.zendeskKey])

  // Re-open messenger when tab becomes active
  useEffect(() => {
    if (chatStatus === 'ready' && (window as any).zE) {
      (window as any).zE('messenger', 'open')
    }
  }, [chatStatus])

  if (!config.zendeskKey) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
        <h3 style={{ marginBottom: '10px', color: '#333' }}>Live chatt kommer snart</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Vår chatt-funktion är på väg. Under tiden kan du kontakta oss via kontaktformuläret.
        </p>
        <div style={{
          background: '#f5f5f5',
          borderRadius: '8px',
          padding: '15px',
          fontSize: '13px',
          color: '#555'
        }}>
          <strong>Tips:</strong> Gå till Contact-fliken för att skicka ett meddelande direkt.
        </div>
      </div>
    )
  }

  if (chatStatus === 'error') {
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
    <div ref={containerRef} style={{
      textAlign: 'center',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px'
    }}>
      {chatStatus === 'loading' ? (
        <>
          <div style={{ fontSize: '48px' }}>💬</div>
          <h3 style={{ marginBottom: '5px', color: '#333' }}>Laddar chatt...</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Vänligen vänta medan vi ansluter dig.
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: '48px' }}>💬</div>
          <h3 style={{ marginBottom: '5px', color: '#333' }}>Chatten är öppen!</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            Du kan nu chatta med oss i Zendesk-fönstret.
          </p>
          <button
            onClick={() => {
              if ((window as any).zE) {
                (window as any).zE('messenger', 'open')
              }
            }}
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
            Öppna chatten
          </button>
          <p style={{ color: '#999', fontSize: '12px', marginTop: '10px' }}>
            Stäng inte Zendesk-fönstret för att behålla din konversation.
          </p>
        </>
      )}
    </div>
  )
}

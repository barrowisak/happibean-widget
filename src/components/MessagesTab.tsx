import React, { useEffect, useRef } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
}

export function MessagesTab({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (!config.zendeskKey || scriptLoaded.current) return

    // Load Zendesk Messaging widget
    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.zendeskKey}`
    script.async = true

    script.onload = () => {
      scriptLoaded.current = true
      // Open the messenger when loaded
      if ((window as any).zE) {
        (window as any).zE('messenger', 'open')
      }
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount
      const existingScript = document.getElementById('ze-snippet')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [config.zendeskKey])

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

  return (
    <div ref={containerRef} style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
      <h3 style={{ marginBottom: '10px', color: '#333' }}>Laddar chatt...</h3>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Zendesk Messaging öppnas i ett nytt fönster.
      </p>
    </div>
  )
}

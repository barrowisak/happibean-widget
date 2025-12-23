import React, { useEffect, useRef, useState } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
}

export function MessagesTab({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!config.zendeskKey) {
      setError('Ingen Zendesk-nyckel konfigurerad')
      setIsLoading(false)
      return
    }

    // Create iframe to embed Zendesk Web Widget
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [config.zendeskKey])

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

  // Embed Zendesk Messaging via iframe pointing to a hosted page
  const zendeskEmbedUrl = `https://happirel.zendesk.com/embeddable_messaging/web_widget?key=${config.zendeskKey}`

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '400px',
        position: 'relative'
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          zIndex: 10
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
          <p style={{ color: '#666', fontSize: '14px' }}>Laddar chatt...</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={zendeskEmbedUrl}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          border: 'none',
          flex: 1
        }}
        title="Zendesk Chat"
        allow="microphone"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError('Kunde inte ladda chatten')
        }}
      />

      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>Chatten kunde inte laddas</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => {
              setError(null)
              setIsLoading(true)
              if (iframeRef.current) {
                iframeRef.current.src = zendeskEmbedUrl
              }
            }}
            style={{
              padding: '10px 20px',
              background: config.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Försök igen
          </button>
        </div>
      )}
    </div>
  )
}

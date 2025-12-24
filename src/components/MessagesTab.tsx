import { useEffect, useState } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
  autoOpen?: boolean
}

export function MessagesTab({ config }: Props) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simple timeout for iframe load
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

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

  // Use Zendesk Web Widget in a popup approach - cleanest solution
  // The embedded API is buggy and creates duplicate widgets
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${config.colors.primary}20, ${config.colors.secondary}20)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={config.colors.primary} strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>

      <h3 style={{
        color: '#333',
        marginBottom: '8px',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        Chatta med oss
      </h3>

      <p style={{
        color: '#666',
        fontSize: '14px',
        maxWidth: '280px',
        lineHeight: '1.5',
        marginBottom: '24px'
      }}>
        Vårt team finns här för att hjälpa dig. Klicka nedan för att starta en konversation.
      </p>

      <a
        href={`https://happirel.zendesk.com/hc/sv/requests/new`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '14px 32px',
          background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Skicka meddelande
      </a>

      <p style={{
        color: '#999',
        fontSize: '12px',
        marginTop: '16px'
      }}>
        Öppnas i nytt fönster
      </p>
    </div>
  )
}

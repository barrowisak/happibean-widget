import React, { useEffect, useRef, useState } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
}

declare global {
  interface Window {
    Smooch?: any
  }
}

export function MessagesTab({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const initStartedRef = useRef(false)

  useEffect(() => {
    if (!config.zendeskKey) {
      setStatus('error')
      return
    }

    if (initStartedRef.current) return
    initStartedRef.current = true

    // Load Sunshine Conversations Web SDK
    const script = document.createElement('script')
    script.src = 'https://cdn.smooch.io/smooch.min.js'
    script.async = true

    script.onload = () => {
      initSmooch()
    }

    script.onerror = () => {
      console.error('Failed to load Smooch SDK')
      setStatus('error')
    }

    if (!document.querySelector('script[src*="smooch.min.js"]')) {
      document.head.appendChild(script)
    } else if (window.Smooch) {
      initSmooch()
    }
  }, [config.zendeskKey])

  const initSmooch = () => {
    if (!window.Smooch || !containerRef.current) {
      setTimeout(initSmooch, 100)
      return
    }

    // Check if already initialized
    if (window.Smooch.isOpened !== undefined) {
      try {
        window.Smooch.render(containerRef.current)
        setStatus('ready')
      } catch (e) {
        console.log('Smooch already rendered')
        setStatus('ready')
      }
      return
    }

    window.Smooch.init({
      integrationId: config.zendeskKey,
      embedded: true,
      customColors: {
        brandColor: config.colors.primary.replace('#', ''),
        conversationColor: config.colors.primary.replace('#', ''),
        actionColor: config.colors.primary.replace('#', '')
      }
    }).then(() => {
      console.log('Smooch initialized')
      if (containerRef.current) {
        window.Smooch.render(containerRef.current)
      }
      setStatus('ready')
    }).catch((err: any) => {
      console.error('Smooch init error:', err)
      // If Smooch fails, fall back to Zendesk Messaging popup approach
      fallbackToZendeskMessaging()
    })
  }

  const fallbackToZendeskMessaging = () => {
    // Load Zendesk Messaging as fallback (opens as popup)
    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.zendeskKey}`
    script.async = true

    script.onload = () => {
      setStatus('ready')
    }

    if (!document.getElementById('ze-snippet')) {
      document.head.appendChild(script)
    } else {
      setStatus('ready')
    }
  }

  const openZendeskMessenger = () => {
    if ((window as any).zE) {
      (window as any).zE('messenger', 'open')
    }
  }

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
      id="smooch-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '450px',
        minHeight: '400px',
        position: 'relative',
        overflow: 'hidden',
        background: '#fff',
        borderRadius: '8px'
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
    </div>
  )
}

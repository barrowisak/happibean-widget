import React, { useState } from 'react'
import { HappiBeanConfig } from '../config'
import { SupportWidget } from './SupportWidget'

interface Props {
  config: HappiBeanConfig
}

export function WidgetLauncher({ config }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const positionStyle = config.position === 'bottom-left'
    ? { left: '20px' }
    : { right: '20px' }

  return (
    <>
      {isOpen && (
        <SupportWidget config={config} onClose={() => setIsOpen(false)} />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          ...positionStyle,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999998,
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12" y2="17.5"/>
          </svg>
        )}
      </button>
    </>
  )
}

import React, { useState } from 'react'
import { HappiBeanConfig } from '../config'
import { HomeTab } from './HomeTab'
import { HelpTab } from './HelpTab'
import { ContactTab } from './ContactTab'
import { MessagesTab } from './MessagesTab'

interface Props {
  config: HappiBeanConfig
  onClose: () => void
}

type TabId = 'home' | 'help' | 'contact' | 'messages'

const tabLabels: Record<TabId, string> = {
  home: 'Home',
  help: 'Help',
  contact: 'Contact',
  messages: 'Messages'
}

export function SupportWidget({ config, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(config.tabs[0] || 'home')
  const [autoOpenChat, setAutoOpenChat] = useState(false)

  const handleNavigate = (tab: TabId, options?: { autoOpen?: boolean }) => {
    setActiveTab(tab)
    if (options?.autoOpen && tab === 'messages') {
      setAutoOpenChat(true)
    }
  }

  const positionStyle = config.position === 'bottom-left'
    ? { left: '20px' }
    : { right: '20px' }

  const getTabIcon = (tab: TabId, isActive: boolean) => {
    const color = isActive ? config.colors.primary : '#999'
    switch (tab) {
      case 'home':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill={isActive ? color : 'none'} stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      case 'help':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17.5"/></svg>
      case 'contact':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      case 'messages':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      ...positionStyle,
      width: '380px',
      maxWidth: 'calc(100vw - 40px)',
      height: '600px',
      maxHeight: 'calc(100vh - 120px)',
      background: '#f5f5f5',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 999999
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
        padding: '15px 20px',
        color: 'white',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Logo + Welcome text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {config.logoUrl && (
            <img
              src={config.logoUrl}
              alt="Logo"
              style={{
                width: '45px',
                height: '45px',
                objectFit: 'contain',
                background: 'white',
                borderRadius: '8px',
                padding: '4px',
                flexShrink: 0
              }}
            />
          )}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '2px' }}>
              {config.texts.welcomeTitle}
            </h2>
            <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0 }}>
              {config.texts.welcomeSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '15px', background: '#f5f5f5' }}>
        {activeTab === 'home' && <HomeTab config={config} onNavigate={handleNavigate} />}
        {activeTab === 'help' && <HelpTab config={config} />}
        {activeTab === 'contact' && <ContactTab config={config} />}
        {activeTab === 'messages' && <MessagesTab config={config} autoOpen={autoOpenChat} />}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid #e0e0e0',
        background: 'white'
      }}>
        {config.tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: activeTab === tab ? 'rgba(111, 78, 55, 0.05)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: activeTab === tab ? config.colors.primary : '#999',
              borderTop: activeTab === tab ? `2px solid ${config.colors.primary}` : '2px solid transparent',
              marginTop: '-1px'
            }}
          >
            {getTabIcon(tab, activeTab === tab)}
            <span style={{ fontSize: '11px' }}>{tabLabels[tab]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

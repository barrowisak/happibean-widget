import React, { useEffect, useRef, useState } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'agent' | 'system'
  timestamp: Date
}

export function MessagesTab({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: '1',
        text: 'Välkommen! Hur kan vi hjälpa dig idag?',
        sender: 'system',
        timestamp: new Date()
      }
    ])
    setIsConnected(true)
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Send to API and get response
    try {
      const res = await fetch(`${config.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText.trim() })
      })

      if (res.ok) {
        const data = await res.json()
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply || 'Tack för ditt meddelande! Vi återkommer så snart som möjligt.',
          sender: 'agent',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, agentMessage])
      } else {
        // Fallback response
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Tack för ditt meddelande! En av våra medarbetare kommer att svara dig inom kort. Du kan också nå oss via kontaktformuläret.',
          sender: 'agent',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, fallbackMessage])
      }
    } catch (err) {
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Tack för ditt meddelande! En av våra medarbetare kommer att svara dig inom kort.',
        sender: 'agent',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div ref={containerRef} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '350px'
    }}>
      {/* Chat header */}
      <div style={{
        padding: '12px 15px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: isConnected ? '#4CAF50' : '#ccc'
        }} />
        <span style={{ fontSize: '13px', color: '#666' }}>
          {isConnected ? 'Ansluten till support' : 'Ansluter...'}
        </span>
      </div>

      {/* Messages container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.sender === 'user' ? config.colors.primary : '#f0f0f0',
              color: msg.sender === 'user' ? 'white' : '#333',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {msg.text}
            </div>
            <span style={{
              fontSize: '11px',
              color: '#999',
              marginTop: '4px'
            }}>
              {formatTime(msg.timestamp)}
            </span>
          </div>
        ))}

        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: '#f0f0f0',
            borderRadius: '16px 16px 16px 4px',
            alignSelf: 'flex-start',
            maxWidth: '80%'
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#999',
                animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: '-0.32s'
              }} />
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#999',
                animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: '-0.16s'
              }} />
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#999',
                animation: 'bounce 1.4s infinite ease-in-out both'
              }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end'
      }}>
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Skriv ett meddelande..."
          rows={1}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            fontSize: '14px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            background: '#fff',
            color: '#333',
            maxHeight: '100px',
            overflowY: 'auto'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: inputText.trim() ? config.colors.primary : '#ddd',
            color: 'white',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>

      {/* CSS for typing animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

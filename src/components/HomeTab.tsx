import React, { useState, useEffect } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
  onNavigate: (tab: 'home' | 'help' | 'contact' | 'messages', options?: { autoOpen?: boolean }) => void
}

interface Article {
  id: number
  title: string
  body: string
  html_url: string
}

export function HomeTab({ config, onNavigate }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [popularArticles, setPopularArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  useEffect(() => {
    fetchPopularArticles()
  }, [])

  const fetchPopularArticles = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/help-center/categories`)
      const data = await res.json()
      if (data.categories && data.categories.length > 0) {
        const catId = data.categories[0].id
        const secRes = await fetch(`${config.apiUrl}/help-center/categories/${catId}/sections`)
        const secData = await secRes.json()
        if (secData.sections && secData.sections.length > 0) {
          const secId = secData.sections[0].id
          const artRes = await fetch(`${config.apiUrl}/help-center/sections/${secId}/articles`)
          const artData = await artRes.json()
          setPopularArticles((artData.articles || []).slice(0, 3))
        }
      }
    } catch (err) {
      console.error('Failed to fetch popular articles:', err)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(`${config.apiUrl}/faq/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  if (selectedArticle) {
    return (
      <div>
        <button
          onClick={() => setSelectedArticle(null)}
          style={{
            background: 'none',
            border: 'none',
            color: config.colors.primary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '15px',
            fontSize: '14px'
          }}
        >
          ← Tillbaka
        </button>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#333' }}>
          {selectedArticle.title}
        </h3>
        <div
          style={{ fontSize: '14px', lineHeight: '1.6', color: '#555' }}
          dangerouslySetInnerHTML={{ __html: selectedArticle.body }}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Send us a message card */}
      {config.tabs.includes('messages') && (
        <div
          onClick={() => onNavigate('messages', { autoOpen: true })}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>
              Send us a message
            </div>
            <div style={{ fontSize: '13px', color: '#888' }}>
              We typically reply within an hour
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      )}

      {/* Search */}
      <div style={{
        position: 'relative',
        marginBottom: '20px',
        background: 'white',
        borderRadius: '12px',
        padding: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ marginRight: '10px' }}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search for help"
            style={{
              flex: 1,
              border: 'none',
              fontSize: '14px',
              outline: 'none',
              background: 'transparent',
              color: '#333333'
            }}
          />
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {searchResults.map(article => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              style={{
                padding: '14px 0',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ fontWeight: 400, color: '#333', flex: 1 }}>
                {article.title}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* Popular Articles */}
      {searchResults.length === 0 && popularArticles.length > 0 && (
        <div>
          {popularArticles.map(article => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              style={{
                padding: '14px 0',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ fontWeight: 400, color: '#333', flex: 1 }}>
                {article.title}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

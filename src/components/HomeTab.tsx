import React, { useState, useEffect } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
  onNavigate: (tab: 'home' | 'help' | 'contact' | 'messages') => void
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
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Sök i hjälpcentret..."
          style={{
            width: '100%',
            padding: '12px 40px 12px 14px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>
            Sökresultat
          </h4>
          {searchResults.map(article => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              style={{
                padding: '12px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 500, color: '#333', marginBottom: '4px' }}>
                {article.title}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                {stripHtml(article.body).slice(0, 80)}...
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      {searchResults.length === 0 && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>
              Snabblänkar
            </h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('help')}
                style={{
                  padding: '10px 16px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                📚 FAQ
              </button>
              <button
                onClick={() => onNavigate('contact')}
                style={{
                  padding: '10px 16px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                ✉️ Kontakta oss
              </button>
            </div>
          </div>

          {/* Popular Articles */}
          {popularArticles.length > 0 && (
            <div>
              <h4 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>
                Populära artiklar
              </h4>
              {popularArticles.map(article => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    color: '#333'
                  }}
                >
                  {article.title}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
}

interface Category {
  id: number
  name: string
  description: string
}

interface Section {
  id: number
  name: string
  category_id: number
}

interface Article {
  id: number
  title: string
  body: string
  section_id: number
}

type View = 'categories' | 'sections' | 'articles' | 'article'

interface Breadcrumb {
  label: string
  view: View
  id?: number
}

export function HelpTab({ config }: Props) {
  const [view, setView] = useState<View>('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ label: 'Kategorier', view: 'categories' }])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${config.apiUrl}/help-center/categories`)
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSections = async (categoryId: number, categoryName: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${config.apiUrl}/help-center/categories/${categoryId}/sections`)
      const data = await res.json()
      setSections(data.sections || [])
      setView('sections')
      setBreadcrumbs([
        { label: 'Kategorier', view: 'categories' },
        { label: categoryName, view: 'sections', id: categoryId }
      ])
    } catch (err) {
      console.error('Failed to fetch sections:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async (sectionId: number, sectionName: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${config.apiUrl}/help-center/sections/${sectionId}/articles`)
      const data = await res.json()
      setArticles(data.articles || [])
      setView('articles')
      setBreadcrumbs(prev => [
        ...prev.slice(0, 2),
        { label: sectionName, view: 'articles', id: sectionId }
      ])
    } catch (err) {
      console.error('Failed to fetch articles:', err)
    } finally {
      setLoading(false)
    }
  }

  const openArticle = (article: Article) => {
    setSelectedArticle(article)
    setView('article')
    setBreadcrumbs(prev => [
      ...prev.slice(0, 3),
      { label: article.title.slice(0, 20) + '...', view: 'article', id: article.id }
    ])
  }

  const navigateTo = (breadcrumb: Breadcrumb, index: number) => {
    if (breadcrumb.view === 'categories') {
      setView('categories')
      setBreadcrumbs([{ label: 'Kategorier', view: 'categories' }])
    } else {
      setView(breadcrumb.view)
      setBreadcrumbs(prev => prev.slice(0, index + 1))
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        Laddar...
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
          {breadcrumbs.map((bc, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {i > 0 && <span style={{ color: '#ccc' }}>/</span>}
              <button
                onClick={() => navigateTo(bc, i)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: i === breadcrumbs.length - 1 ? '#333' : config.colors.primary,
                  cursor: i === breadcrumbs.length - 1 ? 'default' : 'pointer',
                  fontSize: '13px',
                  padding: 0
                }}
              >
                {bc.label}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Categories */}
      {view === 'categories' && (
        <div>
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => fetchSections(cat.id, cat.name)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 500, color: '#333', marginBottom: '4px' }}>
                {cat.name}
              </div>
              {cat.description && (
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {cat.description}
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
              Inga kategorier hittades
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      {view === 'sections' && (
        <div>
          {sections.map(sec => (
            <div
              key={sec.id}
              onClick={() => fetchArticles(sec.id, sec.name)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                color: '#333'
              }}
            >
              📁 {sec.name}
            </div>
          ))}
          {sections.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
              Inga sektioner hittades
            </div>
          )}
        </div>
      )}

      {/* Articles list */}
      {view === 'articles' && (
        <div>
          {articles.map(art => (
            <div
              key={art.id}
              onClick={() => openArticle(art)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                color: '#333'
              }}
            >
              📄 {art.title}
            </div>
          ))}
          {articles.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
              Inga artiklar hittades
            </div>
          )}
        </div>
      )}

      {/* Single article */}
      {view === 'article' && selectedArticle && (
        <div>
          {/* Open in Help Center button */}
          <button
            onClick={() => window.open(`https://happirel.zendesk.com/hc/sv/articles/${selectedArticle.id}`, '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              marginBottom: '15px',
              background: config.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              width: 'fit-content'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Öppna i Help Center
          </button>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#333' }}>
            {selectedArticle.title}
          </h3>
          <div
            style={{ fontSize: '14px', lineHeight: '1.6', color: '#555' }}
            dangerouslySetInnerHTML={{ __html: selectedArticle.body }}
          />
        </div>
      )}
    </div>
  )
}

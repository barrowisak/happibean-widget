import React, { useState, useEffect } from 'react'
import { HappiBeanConfig } from '../config'

interface Props {
  config: HappiBeanConfig
}

interface TicketForm {
  id: number
  name: string
  display_name: string
}

interface FormField {
  id: number
  type: string
  title: string
  description: string
  required: boolean
  options: { name: string; value: string }[]
}

export function ContactTab({ config }: Props) {
  const [forms, setForms] = useState<TicketForm[]>([])
  const [selectedForm, setSelectedForm] = useState<TicketForm | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/ticket-forms`)
      const data = await res.json()
      const allForms = data.forms || []

      // Filter to only show "Green Relations" form (case-insensitive search)
      const greenRelationsForms = allForms.filter((f: TicketForm) =>
        f.name.toLowerCase().includes('green relations') ||
        f.display_name.toLowerCase().includes('green relations')
      )

      // Use filtered forms if found, otherwise fallback to first form
      const formsToUse = greenRelationsForms.length > 0 ? greenRelationsForms : allForms.slice(0, 1)
      setForms(formsToUse)

      if (formsToUse.length > 0) {
        selectForm(formsToUse[0])
      }
    } catch (err) {
      console.error('Failed to fetch forms:', err)
    }
  }

  const selectForm = async (form: TicketForm) => {
    setSelectedForm(form)
    try {
      const res = await fetch(`${config.apiUrl}/ticket-forms/${form.id}`)
      const data = await res.json()
      setFields(data.fields || [])
    } catch (err) {
      console.error('Failed to fetch form fields:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const customFields = fields
        .filter(f => f.type !== 'subject' && f.type !== 'description')
        .map(f => ({
          id: f.id,
          value: formData[`field_${f.id}`] || ''
        }))

      const res = await fetch(`${config.apiUrl}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          ticket_form_id: selectedForm?.id,
          custom_fields: customFields
        })
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Något gick fel. Försök igen.')
      }
    } catch (err) {
      setError('Kunde inte skicka meddelandet.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
        <h3 style={{ marginBottom: '10px', color: '#333' }}>Tack för ditt meddelande!</h3>
        <p style={{ color: '#666' }}>Vi återkommer så snart vi kan.</p>
        <button
          onClick={() => {
            setSubmitted(false)
            setFormData({ name: '', email: '', subject: '', message: '' })
          }}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: config.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Skicka nytt meddelande
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form selector */}
      {forms.length > 1 && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>
            Ärende typ
          </label>
          <select
            value={selectedForm?.id || ''}
            onChange={e => {
              const form = forms.find(f => f.id === Number(e.target.value))
              if (form) selectForm(form)
            }}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              color: '#333'
            }}
          >
            {forms.map(form => (
              <option key={form.id} value={form.id}>
                {form.display_name || form.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Name */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>
          Namn *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white',
            color: '#333'
          }}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>
          E-post *
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white',
            color: '#333'
          }}
        />
      </div>

      {/* Subject */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>
          Ämne *
        </label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white',
            color: '#333'
          }}
        />
      </div>

      {/* Custom fields */}
      {fields.filter(f => f.type !== 'subject' && f.type !== 'description').map(field => (
        <div key={field.id} style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>
            {field.title} {field.required && '*'}
          </label>
          {field.type === 'tagger' || field.type === 'dropdown' ? (
            <select
              required={field.required}
              value={formData[`field_${field.id}`] || ''}
              onChange={e => setFormData(prev => ({ ...prev, [`field_${field.id}`]: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                color: '#333'
              }}
            >
              <option value="">Välj...</option>
              {field.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              required={field.required}
              value={formData[`field_${field.id}`] || ''}
              onChange={e => setFormData(prev => ({ ...prev, [`field_${field.id}`]: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                color: '#333'
              }}
            />
          )}
        </div>
      ))}

      {/* Message */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>
          Meddelande *
        </label>
        <textarea
          required
          rows={4}
          value={formData.message}
          onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            background: 'white',
            color: '#333'
          }}
        />
      </div>

      {error && (
        <div style={{ color: '#e53935', marginBottom: '15px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          padding: '12px',
          background: config.colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.7 : 1
        }}
      >
        {submitting ? 'Skickar...' : 'Skicka meddelande'}
      </button>
    </form>
  )
}

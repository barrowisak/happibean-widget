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

interface FieldCondition {
  parent_field_id: number
  value: string
  child_fields: { id: number; is_required: boolean }[]
}

export function ContactTab({ config }: Props) {
  const [forms, setForms] = useState<TicketForm[]>([])
  const [selectedForm, setSelectedForm] = useState<TicketForm | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [conditions, setConditions] = useState<FieldCondition[]>([])
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
      setConditions(data.conditions || [])
    } catch (err) {
      console.error('Failed to fetch form fields:', err)
    }
  }

  // Get all child field IDs from conditions
  const getAllChildFieldIds = (): Set<number> => {
    const childIds = new Set<number>()
    conditions.forEach(c => {
      c.child_fields.forEach(cf => childIds.add(cf.id))
    })
    return childIds
  }

  // Check if a field should be visible based on current form selections
  const isFieldVisible = (fieldId: number): boolean => {
    const childFieldIds = getAllChildFieldIds()

    // If field IS a child field in any condition, it should be hidden by default
    // and only shown when its parent condition is met
    if (childFieldIds.has(fieldId)) {
      // Check if any parent condition makes this field visible
      for (const condition of conditions) {
        const parentValue = formData[`field_${condition.parent_field_id}`]
        if (parentValue === condition.value) {
          // Parent value matches this condition - check if our field is in child_fields
          if (condition.child_fields.some(cf => cf.id === fieldId)) {
            return true
          }
        }
      }
      // Field is a child but no parent condition is met - hide it
      return false
    }

    // Field is NOT a child field in any condition - always show it
    return true
  }

  // Check if a field is required based on conditions
  const isFieldRequired = (field: FormField): boolean => {
    // Check if field requirement is overridden by conditions
    for (const condition of conditions) {
      const parentValue = formData[`field_${condition.parent_field_id}`]
      if (parentValue === condition.value) {
        const childField = condition.child_fields.find(cf => cf.id === field.id)
        if (childField) {
          return childField.is_required
        }
      }
    }
    return field.required
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Only include visible fields in submission
      const customFields = fields
        .filter(f => f.type !== 'subject' && f.type !== 'description')
        .filter(f => isFieldVisible(f.id))
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

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#ffffff',
    color: '#333333',
    boxSizing: 'border-box' as const
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

  // Filter custom fields to those that are visible
  const visibleCustomFields = fields
    .filter(f => f.type !== 'subject' && f.type !== 'description')
    .filter(f => isFieldVisible(f.id))

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
            style={inputStyle}
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
          style={inputStyle}
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
          style={inputStyle}
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
          style={inputStyle}
        />
      </div>

      {/* Dynamic custom fields - only show visible ones */}
      {visibleCustomFields.map(field => (
        <div key={field.id} style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>
            {field.title} {isFieldRequired(field) && '*'}
          </label>
          {field.type === 'tagger' || field.type === 'dropdown' ? (
            <select
              required={isFieldRequired(field)}
              value={formData[`field_${field.id}`] || ''}
              onChange={e => setFormData(prev => ({ ...prev, [`field_${field.id}`]: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Välj...</option>
              {field.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              required={isFieldRequired(field)}
              value={formData[`field_${field.id}`] || ''}
              onChange={e => setFormData(prev => ({ ...prev, [`field_${field.id}`]: e.target.value }))}
              style={inputStyle}
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
            ...inputStyle,
            resize: 'vertical'
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

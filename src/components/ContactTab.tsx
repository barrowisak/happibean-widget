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
  const [attachments, setAttachments] = useState<File[]>([])
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

      const greenRelationsForms = allForms.filter((f: TicketForm) =>
        f.name.toLowerCase().includes('green relations') ||
        f.display_name.toLowerCase().includes('green relations')
      )

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

  // Types to exclude from rendering
  const excludedTypes = ['subject', 'description', 'assignee', 'group', 'priority', 'status', 'tickettype']

  // Field titles to exclude (we have our own name/email fields)
  const excludedTitles = ['namn', 'name', 'your name', 'ditt namn', 'e-post', 'email', 'e-postadress']

  // Get all child field IDs
  const getChildFieldIds = (): Set<number> => {
    const childIds = new Set<number>()
    conditions.forEach(c => {
      c.child_fields.forEach(cf => childIds.add(cf.id))
    })
    return childIds
  }

  // Get parent field IDs
  const getParentFieldIds = (): Set<number> => {
    return new Set(conditions.map(c => c.parent_field_id))
  }

  // Get the child fields that should be visible for a given parent field
  const getVisibleChildrenForParent = (parentFieldId: number): FormField[] => {
    const parentValue = formData[`field_${parentFieldId}`]
    if (!parentValue) return []

    const visibleChildIds: number[] = []
    for (const condition of conditions) {
      if (condition.parent_field_id === parentFieldId && condition.value === parentValue) {
        condition.child_fields.forEach(cf => visibleChildIds.push(cf.id))
      }
    }

    return fields.filter(f => visibleChildIds.includes(f.id))
  }

  // Check if a field is required based on conditions
  const isFieldRequired = (field: FormField): boolean => {
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
      const childFieldIds = getChildFieldIds()
      const parentFieldIds = getParentFieldIds()

      // Build list of visible field IDs
      const visibleFieldIds = new Set<number>()

      // Add parent fields
      parentFieldIds.forEach(id => visibleFieldIds.add(id))

      // Add visible children based on current selections
      parentFieldIds.forEach(parentId => {
        getVisibleChildrenForParent(parentId).forEach(f => visibleFieldIds.add(f.id))
      })

      // Add fields that are neither parent nor child
      fields.forEach(f => {
        if (!childFieldIds.has(f.id) && !parentFieldIds.has(f.id)) {
          if (!excludedTypes.includes(f.type)) {
            visibleFieldIds.add(f.id)
          }
        }
      })

      const customFields = fields
        .filter(f => visibleFieldIds.has(f.id))
        .map(f => ({
          id: f.id,
          value: formData[`field_${f.id}`] || ''
        }))

      // Use FormData to support file uploads
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('subject', formData.subject)
      formDataToSend.append('message', formData.message)
      if (selectedForm?.id) {
        formDataToSend.append('ticket_form_id', String(selectedForm.id))
      }
      formDataToSend.append('custom_fields', JSON.stringify(customFields))

      // Append files
      attachments.forEach((file) => {
        formDataToSend.append('attachments', file)
      })

      const res = await fetch(`${config.apiUrl}/requests`, {
        method: 'POST',
        body: formDataToSend
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setAttachments(prev => [...prev, ...newFiles].slice(0, 5)) // Max 5 files
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
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

  const renderField = (field: FormField) => (
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
  )

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
            setAttachments([])
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

  // Build ordered field list:
  // 1. Root parent fields (parent fields that are NOT also child fields)
  // 2. Visible children after their parent (recursively)
  // 3. Non-parent, non-child fields
  const childFieldIds = getChildFieldIds()
  const parentFieldIds = getParentFieldIds()

  // Check if a field is currently visible based on conditions
  const isFieldVisible = (fieldId: number): boolean => {
    // If it's not a child field, it's always visible (unless excluded)
    if (!childFieldIds.has(fieldId)) return true

    // If it IS a child field, check if any parent condition makes it visible
    for (const condition of conditions) {
      const parentValue = formData[`field_${condition.parent_field_id}`]
      if (parentValue === condition.value) {
        const isChild = condition.child_fields.some(cf => cf.id === fieldId)
        if (isChild) return true
      }
    }
    return false
  }

  const orderedFields: FormField[] = []
  const addedFieldIds = new Set<number>()

  // Recursive function to add a field and its visible children
  const addFieldWithChildren = (field: FormField) => {
    if (addedFieldIds.has(field.id)) return
    if (excludedTypes.includes(field.type)) return
    if (excludedTitles.includes(field.title.toLowerCase())) return
    if (!isFieldVisible(field.id)) return

    orderedFields.push(field)
    addedFieldIds.add(field.id)

    // If this field is also a parent, add its visible children
    if (parentFieldIds.has(field.id)) {
      const visibleChildren = getVisibleChildrenForParent(field.id)
      visibleChildren.forEach(child => addFieldWithChildren(child))
    }
  }

  // Start with root parent fields (parents that are NOT children)
  fields.forEach(field => {
    if (parentFieldIds.has(field.id) && !childFieldIds.has(field.id)) {
      addFieldWithChildren(field)
    }
  })

  // Add remaining non-child fields (that aren't excluded types/titles)
  fields.forEach(field => {
    if (!addedFieldIds.has(field.id) && !childFieldIds.has(field.id) && !excludedTypes.includes(field.type) && !excludedTitles.includes(field.title.toLowerCase())) {
      orderedFields.push(field)
      addedFieldIds.add(field.id)
    }
  })

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

      {/* Dynamic fields in correct order */}
      {orderedFields.map(field => renderField(field))}

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

      {/* File attachments */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>
          Bifoga filer (max 5)
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 15px',
            border: '1px dashed #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            background: '#fafafa',
            fontSize: '13px',
            color: '#666'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          Klicka för att välja filer
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
          />
        </label>

        {/* Show selected files */}
        {attachments.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            {attachments.map((file, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: '#f0f0f0',
                  borderRadius: '4px',
                  marginBottom: '5px',
                  fontSize: '12px'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: '#999'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
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

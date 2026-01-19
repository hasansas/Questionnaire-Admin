import type { EmailTemplate } from '~/types/email-template'

function nowISO() {
  return new Date().toISOString()
}

function uid() {
  return crypto?.randomUUID?.() ?? `tmp_${Math.random().toString(16).slice(2)}`
}

const STORAGE_KEY = 'sb_email_templates_v1'

export function useEmailTemplatesX() {
  const templates = useState<EmailTemplate[]>('sb_email_templates', () => [])
  const loading = useState<boolean>('sb_email_templates_loading', () => false)
  const error = useState<string | null>('sb_email_templates_error', () => null)

  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as EmailTemplate[]
      templates.value = Array.isArray(parsed) ? parsed : []
    } catch {
      // ignore
    }
  }

  function saveToStorage() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value))
    } catch {
      // ignore
    }
  }

  async function fetchTemplates() {
    loading.value = true
    error.value = null

    try {
      // Mock delay
      await new Promise((r) => setTimeout(r, 450))

      // First load
      if (templates.value.length === 0) {
        loadFromStorage()

        // Seed if still empty
        if (templates.value.length === 0) {
          templates.value = [
            {
              id: uid(),
              key: 'order-success',
              name: 'Order Success',
              subject: 'Your SuperBazi Order is Confirmed',
              locale: 'en',
              status: 'active',
              updatedAt: nowISO(),
              design: null,
              html: null,
            },
            {
              id: uid(),
              key: 'otp-verification',
              name: 'OTP Verification',
              subject: 'Your verification code',
              locale: 'en',
              status: 'draft',
              updatedAt: nowISO(),
              design: null,
              html: null,
            },
          ]
          saveToStorage()
        }
      }
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load templates'
    } finally {
      loading.value = false
    }
  }

  function createTemplate(payload: Omit<EmailTemplate, 'id' | 'updatedAt'>) {
    const item: EmailTemplate = {
      ...payload,
      id: uid(),
      updatedAt: nowISO(),
    }
    templates.value = [item, ...templates.value]
    saveToStorage()
    return item
  }

  function updateTemplate(id: string, patch: Partial<Omit<EmailTemplate, 'id'>>) {
    const idx = templates.value.findIndex((t) => t.id === id)
    if (idx < 0) return null

    const updated: EmailTemplate = {
      ...templates.value[idx],
      ...patch,
      updatedAt: nowISO(),
    }

    const next = [...templates.value]
    next[idx] = updated
    templates.value = next
    saveToStorage()
    return updated
  }

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
  }
}

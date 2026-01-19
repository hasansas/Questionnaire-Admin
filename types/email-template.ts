export type EmailTemplateStatus = 'draft' | 'active'

export interface EmailTemplate {
  id: string
  key: string
  name: string
  subject: string
  locale: string
  status: EmailTemplateStatus
  updatedAt: string

  /**
   * Unlayer design JSON
   */
  design: Record<string, any> | null

  /**
   * Exported HTML from Unlayer
   */
  html: string | null
}

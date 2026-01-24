import { defineStore } from 'pinia'
import { useResourceStore } from '~/composables/useResourceStore'
import { normalizeEmailTemplate, normalizeEmailTemplates, type EmailTemplateModel } from '~/models/emailTemplate'

export const useEmailTemplatesStore = defineStore('emailTemplate', () => {
  const apiEndpoint = '/v1/settings/email-templates'

  return useResourceStore<EmailTemplateModel>({
    endpoint: apiEndpoint,
    normalizedArray: normalizeEmailTemplates,
    normalizedJson: normalizeEmailTemplate,
  })
})

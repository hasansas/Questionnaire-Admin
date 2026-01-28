import { defineStore } from 'pinia'
import { useResourceStore } from '~/composables/useResourceStore'
import { normalizeQuestionnaire, normalizeQuestionnaires, type QuestionnaireModel } from '~/models/questionnaire'

export const useqQestionnaireStore = defineStore('questionnaires', () => {
  const apiEndpoint = '/v1/questionnaires'

  return useResourceStore<QuestionnaireModel>({
    endpoint: apiEndpoint,
    normalizedArray: normalizeQuestionnaires,
    normalizedJson: normalizeQuestionnaire,
  })
})

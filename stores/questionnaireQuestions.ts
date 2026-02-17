import { defineStore } from 'pinia'
import { useResourceStore } from '~/composables/useResourceStore'
import type { QuestionnaireQuestionModel, QuestionnaireQuestionFormModel } from "~/models/questionnaire-questions"
import { normalizeQuestionnaireQuestion, normalizeQuestionnaireQuestions } from "~/models/questionnaire-questions"

export function useQuestionnaireQuestions(questionnaireId: string) {
  const api = useApiService()

  const useStore = defineStore(`questions:${questionnaireId}`, () => {
    const endpoint = `/v1/questionnaires/${questionnaireId}/questions`
    const resourceStore =
      useResourceStore<QuestionnaireQuestionModel, QuestionnaireQuestionFormModel>({
        endpoint,
        normalizedArray: normalizeQuestionnaireQuestions,
        normalizedJson: normalizeQuestionnaireQuestion,
      })

    return resourceStore
  })

  return useStore()
}

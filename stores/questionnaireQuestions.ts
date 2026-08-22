import { defineStore } from 'pinia'
import { useResourceStore } from '~/composables/useResourceStore'
import type { QuestionnaireQuestionModel, QuestionnaireQuestionFormModel } from "~/models/questionnaire-questions"
import { normalizeQuestionnaireQuestion, normalizeQuestionnaireQuestions } from "~/models/questionnaire-questions"

export interface UploadQuestionMediaResult {
  id: string
  publicUrl: string | null
  originalName: string | null
  mimeType: string | null
}

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

    async function uploadMedia(
      file: File,
      options?: { scope?: string; partition?: string },
    ) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('scope', options?.scope ?? 'questionnaire')
        formData.append('partition', options?.partition ?? 'questions')

        const res = await api.post<UploadQuestionMediaResult>('/v1/media', formData)

        if (res.success) {
          return { success: true, statusCode: res.code ?? 200, data: res.data }
        } else {
          throw new Error(res.error || 'Failed to upload media')
        }
      } catch (err: any) {
        return { success: false, statusCode: 500, error: err.message || 'Failed to upload media' }
      }
    }

    return { ...resourceStore, uploadMedia }
  })

  return useStore()
}

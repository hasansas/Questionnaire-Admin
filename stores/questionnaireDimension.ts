import { defineStore } from 'pinia'
import { useResourceStore } from '~/composables/useResourceStore'
import type { QuestionnaireDimensionModel, QuestionnaireDimensionFormModel } from "~/models/questionnaire-dimension"
import { normalizeQuestionnaireDimension, normalizeQuestionnaireDimensions } from "~/models/questionnaire-dimension"

export function useQuestionnaireDimensionStore(questionnaireId: string) {
  const api = useApiService()

  const useStore = defineStore(`dimensions:${questionnaireId}`, () => {
    const endpoint = `/v1/questionnaires/${questionnaireId}/dimensions`
    const resourceStore =
      useResourceStore<QuestionnaireDimensionModel, QuestionnaireDimensionFormModel>({
        endpoint,
        normalizedArray: normalizeQuestionnaireDimensions,
        normalizedJson: normalizeQuestionnaireDimension,
      })

    return resourceStore
  })

  return useStore()
}

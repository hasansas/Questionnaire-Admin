// /stores/organization-questionnaires.store.ts

import { defineStore } from "pinia"
import { useResourceStore } from "~/composables/useResourceStore"
import {
  normalizeOrganizationQuestionnaire,
  normalizeOrganizationQuestionnaires,
  type OrganizationQuestionnaireModel,
  type OrganizationQuestionnaireFormModel
} from "~/models/organization-questionnaire"

export function useOrganizationQuestionnairesStore(organizationId: string) {
  const useStore = defineStore(`orgQuestionnaires:${organizationId}`, () => {
    const apiEndpoint = `/v1/organizations/${organizationId}/questionnaires`

    const resourceStore =
      useResourceStore<OrganizationQuestionnaireModel, OrganizationQuestionnaireFormModel>({
        endpoint: apiEndpoint,
        normalizedArray: normalizeOrganizationQuestionnaires,
        normalizedJson: normalizeOrganizationQuestionnaire
      })

    return resourceStore
  })

  return useStore()
}

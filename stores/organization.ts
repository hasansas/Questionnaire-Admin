import { defineStore } from 'pinia'
import { useResourceStore } from '~/composables/useResourceStore'
import { normalizeOrganization, normalizeOrganizations, type OrganizationModel } from '~/models/organization'

export const useOrganizationsStore = defineStore('organization', () => {
  const apiEndpoint = '/v1/organizations'

  return useResourceStore<OrganizationModel>({
    endpoint: apiEndpoint,
    normalizedArray: normalizeOrganizations,
    normalizedJson: normalizeOrganization,
  })
})

// /stores/organization-user-fields.store.ts

import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useApiService } from "~/composables/useApiService"
import {
  normalizeOrganizationUserFieldsSetting,
  type OrganizationUserFieldsSettingModel
} from "~/models/organization-user-fields"

export function useOrganizationUserFieldsStore(organizationId: string) {
  const useStore = defineStore(`orgUserFields:${organizationId}`, () => {
    const api = useApiService()

    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    const setting = ref<OrganizationUserFieldsSettingModel | null>(null)

    const endpoint = computed(
      () => `/v1/organizations/${organizationId}/user-fields`
    )

    async function fetch(): Promise<OrganizationUserFieldsSettingModel | null> {
      loading.value = true
      error.value = null

      try {
        const res = await api.get(endpoint.value)

        if (!res.success) {
          error.value = res.error || "Failed to load user fields."
          return null
        }

        // supports both { data: {...} } and direct payload
        const raw = (res.data?.data ?? res.data) as any
        setting.value = normalizeOrganizationUserFieldsSetting(raw)
        return setting.value
      } finally {
        loading.value = false
      }
    }

    async function update(
      payload: Partial<OrganizationUserFieldsSettingModel>
    ): Promise<OrganizationUserFieldsSettingModel | null> {
      saving.value = true
      error.value = null

      try {
        const res = await api.put(endpoint.value, payload)

        if (!res.success) {
          error.value = res.error || "Failed to update user fields."
          return null
        }

        const raw = (res.data?.data ?? res.data) as any
        setting.value = normalizeOrganizationUserFieldsSetting(raw)
        return setting.value
      } finally {
        saving.value = false
      }
    }

    return {
      // state
      setting,
      loading,
      saving,
      error,

      // getters
      hasSetting: computed(() => !!setting.value),
      fields: computed(() => setting.value?.fields ?? []),

      // actions
      fetch,
      update
    }
  })

  return useStore()
}
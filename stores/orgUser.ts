// /stores/orgUsers.ts
import { defineStore } from 'pinia'
import { useResourceStore } from '~/composables/useResourceStore'
import { normalizeOrgUsers, normalizeOrgUser, type OrgUserModel, type OrgUserInputModel } from '~/models/orgUser'

export function useOrgUserStore(organizationId: string) {
  const api = useApiService()

  const useStore = defineStore(`orgUser:${organizationId}`, () => {
    const endpoint = `/v1/organizations/${organizationId}/users`
    const resourceStore =
      useResourceStore<OrgUserModel, OrgUserInputModel>({
        endpoint,
        normalizedArray: normalizeOrgUsers,
        normalizedJson: normalizeOrgUser,
      })

    // async function invitel(
    //   payload: Partial<OrgUserInputModel>
    // ) {
    //   const res: ApiResult<null> = await api.post(`${endpoint}/invite`, payload)
    //   return res
    // }


    async function invite(payload: Partial<OrgUserInputModel>) {
      try {
        const res = await api.post<OrgUserModel>(`${endpoint}/invite`, payload)
        if (res.success) {
          const id = (res.data as any).id
          const newItem = { ...{ id }, ...payload }
          const item = normalizeOrgUser(newItem as OrgUserModel)
          resourceStore.addItem(item)
          const createdItem = resourceStore.getItem({ id })
          return { success: true, statusCode: 200, data: createdItem?.item }
        } else {
          throw new Error(res.error || 'Failed to create resource')
        }
      } catch (err: any) {
        return { success: false, statusCode: 500, error: err.message || 'Failed to create resource' }
      }
    }

    return { ...resourceStore, invite }
  })

  return useStore()
}

export function useResourceStore<TModel, TInput = TModel>({
  endpoint,
  perPage = 10,
  normalizedArray = null,
  normalizedJson = null,
}: {
  endpoint: string
  perPage?: number
  normalizedArray?: ((items?: Partial<TModel>[]) => TModel[]) | null
  normalizedJson?: ((item?: Partial<TModel>) => TModel) | null
}) {
  const { get, post, patch, delete: del } = useApiService()
  const paginated = usePaginatedStore<TModel>(perPage)
  let savedQuery: string | null = null

  // --- FETCH ALL ---
  async function fetchAll({
    page = 1,
    query = null,
    reset = false,
  }: {
    page?: number
    query?: string | null
    reset?: boolean
  }) {
    try {
      savedQuery = query
      if (reset) paginated.resetData()

      const storeData = (paginated.data.rows[page - 1] as TModel[]) ?? 0
      if (storeData.length >= paginated.data.pagination.perPage) {
        paginated.updatePagination(page)
        return {
          success: true,
          statusCode: 200,
          data: storeData,
          pagination: paginated.data.pagination,
        }
      }

      const queryParams = query ? `${query}&page=${page}` : `page=${page}`
      const url = `${endpoint}?${queryParams}`
      const res = await get<PaginatedResponse<TModel>>(url)

      if (res.success) {
        let { rows, pagination } = res.data

        if (normalizedArray) {
          rows = normalizedArray(rows as any) as any
        } else if (normalizedJson) {
          rows = (rows as any[]).map(normalizedJson as any) as any
        }

        paginated.putData(rows as any, pagination)
        return { success: true, statusCode: 200, data: rows, pagination }
      } else {
        throw new Error(res.error || 'Failed to fetch data')
      }
    } catch (err: any) {
      return { success: false, statusCode: 500, error: err.message || 'Failed to fetch data' }
    }
  }

  // --- LOAD MORE ---
  async function loadMore() {
    const { pagination } = paginated.data
    const page = pagination.nextPage
    if (page && savedQuery) await fetchAll({ page, query: savedQuery })
  }

  // --- GET BY ID ---
  async function getById({
    id,
    query = null,
  }: {
    id?: string
    query?: string | null
  }) {
    try {
      if (!id) {
        return {
          success: false,
          statusCode: 400,
          error: 'ID is required',
        }
      }

      // If no extra query is provided, try cache first
      if (!query) {
        const cached = paginated.getItem({ id })
        if (cached?.item) {
          return {
            success: true,
            statusCode: 200,
            data: cached.item as TModel,
          }
        }
      }

      // Build URL with optional query params
      const url = query ? `${endpoint}/${id}?${query}` : `${endpoint}/${id}`
      const res = await get<TModel>(url)

      if (res.success) {
        let item = res.data as TModel
        if (normalizedJson) {
          item = normalizedJson(item) as TModel
        }

        // Put/merge into store
        // paginated.addItem(item)

        return {
          success: true,
          statusCode: 200,
          data: item,
        }
      } else {
        throw new Error(res.error || 'Failed to fetch resource')
      }
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        error: err.message || 'Failed to fetch resource',
      }
    }
  }


  // --- CREATE ---
  async function create(payload: TInput) {
    try {
      const res = await post<TModel>(endpoint, payload)
      if (res.success) {
        const responseData = (res.data as any)?.question ?? res.data
        const id = (responseData as any)?.id
        // server-assigned id must win — a form payload's own `id` field
        // (e.g. a blank placeholder for "create" mode) must not override it
        const newItem = id ? { ...payload, ...responseData, id } : responseData
        const item = normalizedJson ? normalizedJson(newItem as TModel) : (newItem as unknown as TModel)
        if (id) paginated.addItem(item)
        const createdItem = id ? paginated.getItem({ id }) : null
        return { success: true, statusCode: 200, data: createdItem?.item ?? res.data }
      } else {
        throw new Error(res.error || 'Failed to create resource')
      }
    } catch (err: any) {
      return { success: false, statusCode: 500, error: err.message || 'Failed to create resource' }
    }
  }

  // --- UPDATE ---
  async function update(id: string | number, payload: TInput) {
    try {
      const res = await patch<TModel>(`${endpoint}/${id}`, payload)
      if (res.success) {
        const responseData = (res.data as any)?.question ?? res.data
        const nextItem = responseData && (responseData as any)?.id ? responseData : payload
        const item = normalizedJson ? normalizedJson(nextItem as any) : (nextItem as unknown as TModel)
        paginated.editItem({ ...item, id })
        const updatedItem = paginated.getItem({ id })
        return { success: true, statusCode: 200, data: updatedItem?.item }
      } else {
        throw new Error(res.error || 'Failed to update resource')
      }
    } catch (err: any) {
      return { success: false, statusCode: 500, error: err.message || 'Failed to update resource' }
    }
  }

  // --- DELETE ---
  async function remove(id: string | number) {
    try {
      const res = await del(`${endpoint}/${id}`)
      if (res.success) {
        paginated.deleteItem({ id })
        return { success: true, statusCode: 200 }
      } else {
        throw new Error(res.error || 'Failed to delete resource')
      }
    } catch (err: any) {
      return { success: false, statusCode: 500, error: err.message || 'Failed to delete resource' }
    }
  }

  return {
    ...paginated,
    fetchAll,
    loadMore,
    getById,
    create,
    update,
    remove,
  }
}

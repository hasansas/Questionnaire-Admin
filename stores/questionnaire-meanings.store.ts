// /stores/questionnaire-meanings.store.ts

import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useApiService } from "~/composables/useApiService";
import { usePaginatedStore } from "~/composables/usePaginatedStore";
import {
  normalizeQuestionnaireMeaning,
  normalizeQuestionnaireMeaningList,
  type QuestionnaireMeaningBulkCreateItemModel,
  type QuestionnaireMeaningModel,
  type QuestionnaireMeaningPayload,
  type MeaningRuleType,
} from "~/models/questionnaire-meaning.model";
import {
  normalizeQuestionnaireMeaningMapOptionsResponse,
  type QuestionnaireMeaningMapOptionsResponseModel,
} from "~/models/questionnaire-meaning-map-option.model";

export function useQuestionnaireMeaningsStore(questionnaireId: string) {
  const useStore = defineStore(`questionnaireMeanings:${questionnaireId}`, () => {
    const api = useApiService();
    // Backend has no server-side pagination/search for this endpoint — it
    // always returns the full list. We fetch it whole and paginate/filter
    // client-side so this store can still satisfy SbResourceTableCard's
    // ResourceStore contract (data.rows / data.pagination / fetchAll).
    const paginated = usePaginatedStore<QuestionnaireMeaningModel>(10);

    const possibleMaps = ref<QuestionnaireMeaningMapOptionsResponseModel | null>(
      null
    );

    const baseEndpoint = computed<string>(
      () => `/v1/questionnaires/${questionnaireId}/meanings`
    );

    let allMeanings: QuestionnaireMeaningModel[] = [];
    let savedQuery: string | null = null;

    function applyFilter(query: string | null): QuestionnaireMeaningModel[] {
      const q = (query || "").trim().toLowerCase();
      if (!q) return allMeanings;

      return allMeanings.filter((item) =>
        [item.ruleKey, item.resultCode, item.resultLabel]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }

    function paginate(page: number, query: string | null): void {
      const filtered = applyFilter(query);
      const perPage = paginated.data.pagination.perPage;
      const total = filtered.length;
      const lastPage = Math.max(1, Math.ceil(total / perPage));
      const currentPage = Math.min(Math.max(1, page), lastPage);
      const rows = filtered.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
      );

      paginated.putData(rows, {
        total,
        perPage,
        currentPage,
        lastPage,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < lastPage ? currentPage + 1 : null,
      });
    }

    async function refresh(): Promise<QuestionnaireMeaningModel[]> {
      const res = await api.get(baseEndpoint.value);

      if (!res.success) {
        throw new Error(res.error || "Failed to load meanings.");
      }

      const raw = (res.data?.data ?? res.data) as any;
      allMeanings = normalizeQuestionnaireMeaningList(raw);
      paginate(paginated.data.pagination.currentPage || 1, savedQuery);

      return allMeanings;
    }

    // Kept for pages/questionnaires/[id].vue, which reads totalMeanings
    // after this resolves (cheap since it's the same full-list fetch).
    async function fetchMeanings(): Promise<QuestionnaireMeaningModel[]> {
      return refresh();
    }

    async function fetchAll({
      page = 1,
      query = null,
      reset = false,
    }: {
      page?: number;
      query?: string | null;
      reset?: boolean;
    } = {}): Promise<{ success: boolean; error?: string }> {
      try {
        savedQuery = query;

        if (reset || !allMeanings.length) {
          const res = await api.get(baseEndpoint.value);
          if (!res.success) {
            throw new Error(res.error || "Failed to load meanings.");
          }
          const raw = (res.data?.data ?? res.data) as any;
          allMeanings = normalizeQuestionnaireMeaningList(raw);
        }

        paginate(page, query);
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error?.message || "Failed to load meanings.",
        };
      }
    }

    async function fetchPossibleMeaningMaps(
      ruleType: MeaningRuleType,
      onlyUnused: boolean = false
    ): Promise<QuestionnaireMeaningMapOptionsResponseModel> {
      const res = await api.get(
        `/v1/questionnaires/${questionnaireId}/meaning-map-options`,
        {
          ruleType,
          onlyUnused,
        }
      )

      if (!res.success) {
        throw new Error(res.error || "Failed to load possible meanings.");
      }

      const raw = (res.data?.data ?? res.data) as any;
      const normalized = normalizeQuestionnaireMeaningMapOptionsResponse(raw);
      possibleMaps.value = normalized;
      return normalized;
    }

    async function bulkCreateFromMaps(
      items: QuestionnaireMeaningBulkCreateItemModel[]
    ): Promise<QuestionnaireMeaningModel[]> {
      const res = await api.post(
        `/v1/questionnaires/${questionnaireId}/meanings/bulk-create-from-maps`,
        {
          items,
        }
      );

      if (!res.success) {
        throw new Error(res.error || "Failed to create meanings.");
      }

      return refresh();
    }

    async function updateMeaning(
      meaningId: string,
      payload: QuestionnaireMeaningPayload
    ): Promise<QuestionnaireMeaningModel> {
      const res = await api.patch(
        `/v1/questionnaires/${questionnaireId}/meanings/${meaningId}`,
        payload
      );

      if (!res.success) {
        throw new Error(res.error || "Failed to update meaning.");
      }

      const raw = (res.data?.data ?? res.data) as any;
      const normalized = normalizeQuestionnaireMeaning(raw);

      await refresh();
      return normalized;
    }

    async function deleteMeaning(meaningId: string): Promise<void> {
      const res = await api.delete(
        `/v1/questionnaires/${questionnaireId}/meanings/${meaningId}`
      );

      if (!res.success) {
        throw new Error(res.error || "Failed to delete meaning.");
      }

      await refresh();
    }

    return {
      ...paginated,
      possibleMaps,

      totalMeanings: computed<number>(() => paginated.data.pagination.total),

      fetchAll,
      fetchMeanings,
      fetchPossibleMeaningMaps,
      bulkCreateFromMaps,
      updateMeaning,
      deleteMeaning,
    };
  });

  return useStore();
}

// /stores/questionnaire-meanings.store.ts

import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useApiService } from "~/composables/useApiService";
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

    const meanings = ref<QuestionnaireMeaningModel[]>([]);
    const possibleMaps = ref<QuestionnaireMeaningMapOptionsResponseModel | null>(
      null
    );

    const baseEndpoint = computed<string>(
      () => `/v1/questionnaires/${questionnaireId}/meanings`
    );

    async function fetchMeanings(): Promise<QuestionnaireMeaningModel[]> {
      const res = await api.get(baseEndpoint.value);

      if (!res.success) {
        throw new Error(res.error || "Failed to load meanings.");
      }

      const raw = (res.data?.data ?? res.data) as any;
      meanings.value = normalizeQuestionnaireMeaningList(raw);
      return meanings.value;
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

      await fetchMeanings();
      return meanings.value;
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

      const index = meanings.value.findIndex((item) => item.id === meaningId);
      if (index >= 0) {
        meanings.value[index] = normalized;
      } else {
        meanings.value.unshift(normalized);
      }

      return normalized;
    }

    async function deleteMeaning(meaningId: string): Promise<void> {
      const res = await api.delete(
        `/v1/questionnaires/${questionnaireId}/meanings/${meaningId}`
      );

      if (!res.success) {
        throw new Error(res.error || "Failed to delete meaning.");
      }

      meanings.value = meanings.value.filter((item) => item.id !== meaningId);
    }

    return {
      meanings,
      possibleMaps,

      totalMeanings: computed<number>(() => meanings.value.length),

      fetchMeanings,
      fetchPossibleMeaningMaps,
      bulkCreateFromMaps,
      updateMeaning,
      deleteMeaning,
    };
  });

  return useStore();
}

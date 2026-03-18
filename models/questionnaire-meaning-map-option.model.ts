// /models/questionnaire-meaning-map-option.model.ts

import type { MeaningRuleType } from "./questionnaire-meaning.model";

export interface QuestionnaireDimensionLiteModel {
  id: string;
  key: string;
  name: string;
  sortOrder: number;
}

export interface QuestionnaireScoreBandLabelLiteModel {
  id: string;
  code: string;
  label: string;
  sortOrder: number;
}

export interface QuestionnaireMeaningMapOptionModel {
  ruleType: MeaningRuleType;
  ruleKey: string;
  ruleJson: Record<string, any>;
  displayLabel: string;
  isUsed: boolean;
  meaningId: string | null;
  resultCode: string | null;
  resultLabel: string | null;
  priority: number;
}

export interface QuestionnaireMeaningMapOptionsResponseModel {
  scoringType: string;
  ruleType: MeaningRuleType;
  supportedRuleTypes: MeaningRuleType[];
  requestedRuleTypeSupported: boolean;
  totalCombinations: number;
  dimensions: QuestionnaireDimensionLiteModel[];
  labels: QuestionnaireScoreBandLabelLiteModel[];
  items: QuestionnaireMeaningMapOptionModel[];
}

export function createDefaultQuestionnaireMeaningMapOption(): QuestionnaireMeaningMapOptionModel {
  return {
    ruleType: "fallback",
    ruleKey: "",
    ruleJson: {},
    displayLabel: "",
    isUsed: false,
    meaningId: null,
    resultCode: "",
    resultLabel: "",
    priority: 999,
  };
}

export function normalizeQuestionnaireMeaningMapOption(
  input: any
): QuestionnaireMeaningMapOptionModel {
  const base = createDefaultQuestionnaireMeaningMapOption();

  return {
    ruleType: (String(input?.ruleType ?? base.ruleType) ||
      "fallback") as MeaningRuleType,
    ruleKey: String(input?.ruleKey ?? base.ruleKey),
    ruleJson:
      input?.ruleJson && typeof input.ruleJson === "object"
        ? input.ruleJson
        : {},
    displayLabel: String(input?.displayLabel ?? base.displayLabel),
    isUsed: Boolean(input?.isUsed ?? base.isUsed),
    meaningId: input?.meaningId ? String(input.meaningId) : null,
    resultCode:
      input?.resultCode !== null && input?.resultCode !== undefined
        ? String(input.resultCode)
        : null,
    resultLabel:
      input?.resultLabel !== null && input?.resultLabel !== undefined
        ? String(input.resultLabel)
        : null,
    priority: Number.isFinite(Number(input?.priority))
      ? Number(input.priority)
      : base.priority,
  };
}

export function normalizeQuestionnaireMeaningMapOptionsResponse(
  input: any
): QuestionnaireMeaningMapOptionsResponseModel {
  return {
    scoringType: String(input?.scoringType ?? ""),
    ruleType: String(input?.ruleType ?? "fallback") as MeaningRuleType,
    supportedRuleTypes: Array.isArray(input?.supportedRuleTypes)
      ? input.supportedRuleTypes.map((item: any) => String(item) as MeaningRuleType)
      : [],
    requestedRuleTypeSupported: Boolean(input?.requestedRuleTypeSupported),
    totalCombinations: Number.isFinite(Number(input?.totalCombinations))
      ? Number(input.totalCombinations)
      : 0,
    dimensions: Array.isArray(input?.dimensions)
      ? input.dimensions.map((item: any) => ({
        id: String(item?.id ?? ""),
        key: String(item?.key ?? ""),
        name: String(item?.name ?? ""),
        sortOrder: Number.isFinite(Number(item?.sortOrder))
          ? Number(item.sortOrder)
          : 0,
      }))
      : [],
    labels: Array.isArray(input?.labels)
      ? input.labels.map((item: any) => ({
        id: String(item?.id ?? ""),
        code: String(item?.code ?? ""),
        label: String(item?.label ?? ""),
        sortOrder: Number.isFinite(Number(item?.sortOrder))
          ? Number(item.sortOrder)
          : 0,
      }))
      : [],
    items: Array.isArray(input?.items)
      ? input.items.map(normalizeQuestionnaireMeaningMapOption)
      : [],
  };
}

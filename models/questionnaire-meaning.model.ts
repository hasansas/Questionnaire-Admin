// /models/questionnaire-meaning.model.ts

export type MeaningRuleType =
  | "score_band_combo"
  | "score_band"
  | "dominant_dimension"
  | "fallback";

export interface QuestionnaireMeaningModel {
  id: string;
  questionnaireId: string;
  ruleType: MeaningRuleType;
  ruleKey: string;
  ruleJson: Record<string, any>;
  resultCode: string;
  resultLabel: string;
  description: string;
  recommendations: string[];
  priority: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireMeaningPayload {
  ruleType: MeaningRuleType;
  ruleJson: Record<string, any>;
  resultCode: string;
  resultLabel: string;
  description: string;
  recommendations: string[];
  priority: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface QuestionnaireMeaningBulkCreateItemModel {
  ruleType: MeaningRuleType;
  ruleKey: string;
  ruleJson: Record<string, any>;
  resultCode: string;
  resultLabel: string;
  priority: number;
}

export function createDefaultQuestionnaireMeaning(): QuestionnaireMeaningModel {
  return {
    id: "",
    questionnaireId: "",
    ruleType: "fallback",
    ruleKey: "",
    ruleJson: {},
    resultCode: "",
    resultLabel: "",
    description: "",
    recommendations: [],
    priority: 999,
    isDefault: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  };
}

export function normalizeQuestionnaireMeaning(
  input: any
): QuestionnaireMeaningModel {
  const base = createDefaultQuestionnaireMeaning();

  return {
    id: String(input?.id ?? base.id),
    questionnaireId: String(input?.questionnaireId ?? base.questionnaireId),
    ruleType: (String(input?.ruleType ?? base.ruleType) ||
      "fallback") as MeaningRuleType,
    ruleKey: String(input?.ruleKey ?? base.ruleKey),
    ruleJson:
      input?.ruleJson && typeof input.ruleJson === "object"
        ? input.ruleJson
        : {},
    resultCode: String(input?.resultCode ?? base.resultCode),
    resultLabel: String(input?.resultLabel ?? base.resultLabel),
    description: String(input?.description ?? base.description),
    recommendations: Array.isArray(input?.recommendations)
      ? input.recommendations.map((item: any) => String(item ?? ""))
      : [],
    priority: Number.isFinite(Number(input?.priority))
      ? Number(input.priority)
      : base.priority,
    isDefault: Boolean(input?.isDefault ?? base.isDefault),
    isActive: Boolean(input?.isActive ?? base.isActive),
    createdAt: String(input?.createdAt ?? base.createdAt),
    updatedAt: String(input?.updatedAt ?? base.updatedAt),
  };
}

export function normalizeQuestionnaireMeaningList(
  input: any
): QuestionnaireMeaningModel[] {
  if (!Array.isArray(input)) return [];
  return input.map(normalizeQuestionnaireMeaning);
}

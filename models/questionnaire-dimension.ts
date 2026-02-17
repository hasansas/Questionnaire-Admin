// /models/questionnaire-dimension.ts

export interface QuestionnaireDimensionModel {
  id: string
  questionnaireId: string

  key: string
  name: string
  description: string | null

  sortOrder: number

  createdAt?: Date
  updatedAt?: Date
}

// Default factory
export const createDefaultQuestionnaireDimension =
  (): QuestionnaireDimensionModel => ({
    id: '',
    questionnaireId: '',

    key: '',
    name: '',
    description: null,

    sortOrder: 1,

    createdAt: new Date(),
    updatedAt: new Date(),
  })

// Normalizer
export function normalizeQuestionnaireDimension(
  item?: Partial<QuestionnaireDimensionModel>,
): QuestionnaireDimensionModel {
  return {
    id: item?.id ?? '',
    questionnaireId: item?.questionnaireId ?? '',

    key: item?.key ?? '',
    name: item?.name ?? '',
    description: item?.description ?? null,

    sortOrder:
      typeof item?.sortOrder === 'number'
        ? item.sortOrder
        : Number(item?.sortOrder ?? 1),

    createdAt: item?.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item?.updatedAt ? new Date(item.updatedAt) : new Date(),
  }
}

export function normalizeQuestionnaireDimensions(
  items?: Partial<QuestionnaireDimensionModel>[],
): QuestionnaireDimensionModel[] {
  if (!Array.isArray(items)) return []
  return items.map((x) => normalizeQuestionnaireDimension(x))
}

// Form
export type QuestionnaireDimensionFormModel = Pick<
  QuestionnaireDimensionModel,
  | "id"
  | "name"
  | "description"
>
// /models/questionnaire-question.ts

export type QuestionnaireQuestionType = "single_choice" | (string & {})

export interface QuestionnaireQuestionMeta {
  hint?: string
  [key: string]: any
}

export interface QuestionnaireQuestionOptionModel {
  key: string
  label: string
  scoreValue: number
  sortOrder: number
}

/**
 * Flattened dimension object for UI convenience
 * (derived from API dimensionMaps[0])
 */
export interface QuestionnaireQuestionDimensionModel {
  id: string
  key: string
  name: string
  weight: number
}

export interface QuestionnaireQuestionModel {
  id: string
  questionnaireId: string

  code: string | null
  text: string
  description: string | null

  questionType: QuestionnaireQuestionType
  sortOrder: number
  isRequired: boolean

  meta: QuestionnaireQuestionMeta | null
  options?: QuestionnaireQuestionOptionModel[]

  /**
   * Flattened (single) dimension.
   * If API returns dimensionMaps[], we take the first map.
   * If none => null.
   */
  dimension?: QuestionnaireQuestionDimensionModel | null

  createdAt?: Date
  updatedAt?: Date
}

// Default factory
export const createDefaultQuestionnaireQuestion =
  (): QuestionnaireQuestionModel => ({
    id: "",
    questionnaireId: "",

    code: null,
    text: "",
    description: null,

    questionType: "single_choice",
    sortOrder: 1,
    isRequired: true,

    meta: null,
    options: [],

    dimension: null,

    createdAt: new Date(),
    updatedAt: new Date(),
  })

function toNumber(v: any, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function normalizeQuestionnaireQuestionOption(
  item?: Partial<QuestionnaireQuestionOptionModel>,
): QuestionnaireQuestionOptionModel {
  return {
    key: String(item?.key ?? ""),
    label: String(item?.label ?? ""),
    scoreValue: toNumber((item as any)?.scoreValue, 0),
    sortOrder: toNumber((item as any)?.sortOrder, 1),
  }
}

export function normalizeQuestionnaireQuestionOptions(
  items?: Partial<QuestionnaireQuestionOptionModel>[],
): QuestionnaireQuestionOptionModel[] {
  if (!Array.isArray(items)) return []
  return items
    .map((x) => normalizeQuestionnaireQuestionOption(x))
    .sort((a, b) => toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0))
}

export function normalizeQuestionnaireQuestionDimension(
  item?: any,
): QuestionnaireQuestionDimensionModel | null {
  if (!item) return null

  const d = item?.dimension
  if (!d) return null

  return {
    id: String(d?.id ?? item?.dimensionId ?? ""),
    key: String(d?.key ?? ""),
    name: String(d?.name ?? ""),
    weight: toNumber(item?.weight, 1),
  }
}

export function normalizeQuestionnaireQuestion(
  item?: Partial<QuestionnaireQuestionModel>,
): QuestionnaireQuestionModel {
  const rawOptions = (item as any)?.options
  const dimensionMaps = (item as any)?.dimensionMaps
  const dimension = item?.dimension ?? normalizeQuestionnaireQuestionDimension(dimensionMaps)
  const question: QuestionnaireQuestionModel = {
    id: String(item?.id ?? ""),
    questionnaireId: String(item?.questionnaireId ?? ""),

    code: item?.code === null ? null : (item?.code ? String(item.code) : null),
    text: String(item?.text ?? ""),
    description:
      (item as any)?.description === null
        ? null
        : String((item as any)?.description ?? "") || null,

    questionType:
      (item as any)?.questionType ??
      (item as any)?.question_type ??
      "single_choice",
    sortOrder: toNumber((item as any)?.sortOrder ?? (item as any)?.sort_order, 1),
    isRequired: Boolean(
      (item as any)?.isRequired ?? (item as any)?.is_required ?? true,
    ),

    meta: ((item as any)?.meta ?? null) as QuestionnaireQuestionMeta | null,
    options: normalizeQuestionnaireQuestionOptions(rawOptions),

    dimension,

    createdAt: (item as any)?.createdAt
      ? new Date((item as any).createdAt)
      : new Date(),
    updatedAt: (item as any)?.updatedAt
      ? new Date((item as any).updatedAt)
      : new Date(),
  }

  return question
}

export function normalizeQuestionnaireQuestions(
  items?: Partial<QuestionnaireQuestionModel>[],
): QuestionnaireQuestionModel[] {
  if (!Array.isArray(items)) return []
  return items
    .map((x) => normalizeQuestionnaireQuestion(x))
    .sort((a, b) => toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0))
}

// Form
export type QuestionnaireQuestionFormModel = Pick<
  QuestionnaireQuestionModel,
  "text" | "description" | "questionType"
>

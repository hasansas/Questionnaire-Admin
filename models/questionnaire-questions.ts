// /models/questionnaire-question.ts

export type QuestionnaireQuestionType = "single_choice" | (string & {})

export type QuestionnaireQuestionMode = "text" | "image" | "audio"

export interface QuestionnaireQuestionMediaModel {
  mediaId: string
  publicUrl: string | null
  originalName: string | null
  mimeType: string | null
}

export interface QuestionnaireQuestionMeta {
  hint?: string
  [key: string]: any
}

export type QuestionnaireOptionMode = "text" | "image"

export interface QuestionnaireQuestionOptionModel {
  key: string
  label: string
  optionMode: QuestionnaireOptionMode
  scoreValue: number
  isCorrect: boolean
  sortOrder: number
  media?: QuestionnaireQuestionMediaModel | null
  imageUrl: string | null
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
  questionMode: QuestionnaireQuestionMode
  sortOrder: number
  isRequired: boolean

  meta: QuestionnaireQuestionMeta | null
  options?: QuestionnaireQuestionOptionModel[]

  media?: QuestionnaireQuestionMediaModel | null
  imageUrl: string | null
  questionImage?: QuestionnaireQuestionMediaModel | null
  questionImageUrl: string | null

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
    questionMode: "text",
    sortOrder: 1,
    isRequired: true,

    meta: null,
    options: [],

    dimension: null,
    media: null,
    imageUrl: null,
    questionImage: null,
    questionImageUrl: null,

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
  const imageUrl = (item as any)?.imageUrl
    ? String((item as any).imageUrl)
    : null

  return {
    key: String(item?.key ?? ""),
    label: String(item?.label ?? ""),
    optionMode: (item as any)?.optionMode === "image" ? "image" : "text",
    scoreValue: toNumber((item as any)?.scoreValue, 0),
    isCorrect: Boolean((item as any)?.isCorrect),
    sortOrder: toNumber((item as any)?.sortOrder, 1),
    media: normalizeQuestionnaireQuestionMedia((item as any)?.media, imageUrl),
    imageUrl,
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

export function normalizeQuestionnaireQuestionMedia(
  item?: any,
  imageUrl?: string | null,
): QuestionnaireQuestionMediaModel | null {
  if (!item?.mediaId) return null

  const asset = item?.media

  return {
    mediaId: String(item.mediaId),
    publicUrl: imageUrl || (asset?.publicUrl ? String(asset.publicUrl) : null),
    originalName: asset?.originalName ? String(asset.originalName) : null,
    mimeType: asset?.mimeType ? String(asset.mimeType) : null,
  }
}

export function normalizeQuestionnaireQuestion(
  item?: Partial<QuestionnaireQuestionModel>,
): QuestionnaireQuestionModel {
  const rawOptions = (item as any)?.options
  const dimensionMaps = (item as any)?.dimensionMaps
  const dimension = item?.dimension ?? normalizeQuestionnaireQuestionDimension(dimensionMaps)
  const imageUrl = (item as any)?.imageUrl
    ? String((item as any).imageUrl)
    : null
  const questionImageUrl = (item as any)?.questionImageUrl
    ? String((item as any).questionImageUrl)
    : null
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
    questionMode:
      (item as any)?.questionMode ??
      (item as any)?.question_mode ??
      "text",
    sortOrder: toNumber((item as any)?.sortOrder ?? (item as any)?.sort_order, 1),
    isRequired: Boolean(
      (item as any)?.isRequired ?? (item as any)?.is_required ?? true,
    ),

    meta: ((item as any)?.meta ?? null) as QuestionnaireQuestionMeta | null,
    options: normalizeQuestionnaireQuestionOptions(rawOptions),

    dimension,
    media: normalizeQuestionnaireQuestionMedia((item as any)?.media, imageUrl),
    imageUrl,
    questionImage: normalizeQuestionnaireQuestionMedia(
      (item as any)?.questionImage,
      questionImageUrl,
    ),
    questionImageUrl,

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

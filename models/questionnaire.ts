// /models/questionnaire.ts

export type QuestionnaireLanguage = 'id' | 'en' | (string & {})
export type QuestionnaireStatus = 'draft' | 'published' | 'archived' | (string & {})
export type QuestionnaireScoringType =
  | 'multi_dimension'
  | 'total_score'
  | (string & {})

export type QuestionnaireOptionsMode = 'fixed' | 'per_question' | (string & {})

export interface QuestionnaireFixedOptionModel {
  label: string
  scoreValue: number
  sortOrder: number
}

// Core Data Model
export interface QuestionnaireModel {
  id: string
  code: string
  title: string
  description: string | null

  shortDescription: string | null
  instructions: string | null
  estimatedTimeMinutes: number | null
  totalQuestions: number | null
  totalDimensions: number | null
  totalBands: number | null
  totalMeanings: number | null
  category: string | null
  tags: string[] | null
  coverImageUrl: string | null

  language: QuestionnaireLanguage
  status: QuestionnaireStatus
  version: number

  scoringType: QuestionnaireScoringType
  showResultToUser: boolean
  optionsMode: QuestionnaireOptionsMode
  fixedOptionsJson: QuestionnaireFixedOptionModel[]

  isFeatured: boolean
  isPublic: boolean
  sortOrder: number | null

  createdAt?: Date
  updatedAt?: Date
}

// Default factory for creating a clean questionnaire object
export const createDefaultQuestionnaire = (): QuestionnaireModel => ({
  id: '',
  code: '',
  title: '',
  description: null,

  shortDescription: null,
  instructions: null,
  estimatedTimeMinutes: null,
  totalQuestions: null,
  totalDimensions: null,
  totalBands: null,
  totalMeanings: null,
  category: null,
  tags: [],
  coverImageUrl: null,

  language: 'id',
  status: 'draft',
  version: 1,

  scoringType: 'multi_dimension',
  showResultToUser: true,
  optionsMode: 'fixed',
  fixedOptionsJson: [
    { label: 'Setuju', scoreValue: 2, sortOrder: 1 },
    { label: 'Ragu', scoreValue: 1, sortOrder: 2 },
    { label: 'Tidak setuju', scoreValue: 0, sortOrder: 3 },
  ],

  isFeatured: false,
  isPublic: false,
  sortOrder: null,

  createdAt: new Date(),
  updatedAt: new Date(),
})

function normalizeNullableString(value: unknown): string | null {
  if (value == null) return null
  const result = String(value).trim()
  return result.length ? result : null
}

function normalizeNullableNumber(value: unknown): number | null {
  if (value == null || value === '') return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

function normalizeStringArray(value: unknown): string[] | null {
  if (value == null) return null
  if (!Array.isArray(value)) return null

  return value
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
}

function normalizeFixedOptions(
  raw: unknown,
  fallback: QuestionnaireFixedOptionModel[]
): QuestionnaireFixedOptionModel[] {
  if (!Array.isArray(raw)) return fallback

  return raw.map((o: any, idx: number) => ({
    label: String(o?.label ?? '').trim(),
    scoreValue:
      typeof o?.scoreValue === 'number'
        ? o.scoreValue
        : typeof o?.score_value === 'number'
          ? o.score_value
          : Number(o?.scoreValue ?? o?.score_value ?? 0),
    sortOrder:
      typeof o?.sortOrder === 'number'
        ? o.sortOrder
        : typeof o?.sort_order === 'number'
          ? o.sort_order
          : Number(o?.sortOrder ?? o?.sort_order ?? idx + 1),
  }))
}

function normalizeOptionsMode(value: unknown, fallback: QuestionnaireOptionsMode): QuestionnaireOptionsMode {
  if (value === 'perQuestion') return 'per_question'
  if (value == null || value === '') return fallback
  return value as QuestionnaireOptionsMode
}

// Helper — normalize partial questionnaire data into full model
export function normalizeQuestionnaire(
  item?: Partial<QuestionnaireModel>
): QuestionnaireModel {
  const fallback = createDefaultQuestionnaire()

  const rawMode = (item as any)?.optionsMode ?? (item as any)?.options_mode
  const optionsMode = normalizeOptionsMode(rawMode, fallback.optionsMode)

  const rawFixedOptionsJson =
    (item as any)?.fixedOptionsJson ??
    (item as any)?.fixed_options ??
    fallback.fixedOptionsJson

  const fixedOptionsJson = normalizeFixedOptions(rawFixedOptionsJson, fallback.fixedOptionsJson)

  return {
    id: item?.id ?? fallback.id,
    code: item?.code ?? fallback.code,
    title: item?.title ?? fallback.title,
    description:
      item?.description !== undefined
        ? normalizeNullableString(item.description)
        : fallback.description,

    shortDescription:
      (item as any)?.shortDescription !== undefined
        ? normalizeNullableString((item as any).shortDescription)
        : fallback.shortDescription,
    instructions:
      (item as any)?.instructions !== undefined
        ? normalizeNullableString((item as any).instructions)
        : fallback.instructions,
    estimatedTimeMinutes:
      (item as any)?.estimatedTimeMinutes !== undefined
        ? normalizeNullableNumber((item as any).estimatedTimeMinutes)
        : fallback.estimatedTimeMinutes,
    totalQuestions:
      (item as any)?.totalQuestions !== undefined
        ? normalizeNullableNumber((item as any).totalQuestions)
        : fallback.totalQuestions,
    totalDimensions:
      (item as any)?.totalDimensions !== undefined
        ? normalizeNullableNumber((item as any).totalDimensions)
        : fallback.totalDimensions,
    totalBands:
      (item as any)?.totalBands !== undefined
        ? normalizeNullableNumber((item as any).totalBands)
        : fallback.totalBands,
    totalMeanings:
      (item as any)?.totalMeanings !== undefined
        ? normalizeNullableNumber((item as any).totalMeanings)
        : fallback.totalMeanings,
    category:
      (item as any)?.category !== undefined
        ? normalizeNullableString((item as any).category)
        : fallback.category,
    tags:
      (item as any)?.tags !== undefined
        ? normalizeStringArray((item as any).tags)
        : fallback.tags,
    coverImageUrl:
      (item as any)?.coverImageUrl !== undefined
        ? normalizeNullableString((item as any).coverImageUrl)
        : fallback.coverImageUrl,

    language: (item?.language as QuestionnaireLanguage) ?? fallback.language,
    status: (item?.status as QuestionnaireStatus) ?? fallback.status,
    version:
      typeof item?.version === 'number'
        ? item.version
        : Number(item?.version ?? fallback.version),

    scoringType:
      (item?.scoringType as QuestionnaireScoringType) ?? fallback.scoringType,
    showResultToUser:
      typeof item?.showResultToUser === 'boolean'
        ? item.showResultToUser
        : Boolean(item?.showResultToUser ?? fallback.showResultToUser),

    optionsMode,
    fixedOptionsJson,

    isFeatured:
      typeof (item as any)?.isFeatured === 'boolean'
        ? (item as any).isFeatured
        : Boolean((item as any)?.isFeatured ?? fallback.isFeatured),
    isPublic:
      typeof (item as any)?.isPublic === 'boolean'
        ? (item as any).isPublic
        : Boolean((item as any)?.isPublic ?? fallback.isPublic),
    sortOrder:
      (item as any)?.sortOrder !== undefined
        ? normalizeNullableNumber((item as any).sortOrder)
        : fallback.sortOrder,

    createdAt: item?.createdAt ? new Date(item.createdAt) : fallback.createdAt,
    updatedAt: item?.updatedAt ? new Date(item.updatedAt) : fallback.updatedAt,
  }
}

// Normalizer (Array) — safely map list of questionnaire records
export function normalizeQuestionnaires(
  items?: Partial<QuestionnaireModel>[]
): QuestionnaireModel[] {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizeQuestionnaire(item))
}

// Form
export type QuestionnaireFormModel = Pick<
  QuestionnaireModel,
  | 'id'
  | 'code'
  | 'title'
  | 'description'
  | 'shortDescription'
  | 'instructions'
  | 'estimatedTimeMinutes'
  | 'totalQuestions'
  | 'totalDimensions'
  | 'totalBands'
  | 'totalMeanings'
  | 'category'
  | 'tags'
  | 'coverImageUrl'
  | 'language'
  | 'status'
  | 'version'
  | 'scoringType'
  | 'showResultToUser'
  | 'optionsMode'
  | 'fixedOptionsJson'
  | 'isFeatured'
  | 'isPublic'
  | 'sortOrder'
>

export type QuestionnaireCreateFormModel = Omit<QuestionnaireFormModel, 'id'>

export function normalizeQuestionnaireForm(
  item?: Partial<QuestionnaireFormModel>
): QuestionnaireFormModel {
  const fallback = createDefaultQuestionnaire()

  const rawMode = (item as any)?.optionsMode ?? (item as any)?.options_mode
  const optionsMode = normalizeOptionsMode(rawMode, fallback.optionsMode)

  const rawFixedOptionsJson =
    (item as any)?.fixedOptionsJson ??
    (item as any)?.fixed_options ??
    fallback.fixedOptionsJson

  const fixedOptionsJson = normalizeFixedOptions(rawFixedOptionsJson, fallback.fixedOptionsJson)

  return {
    id: item?.id ?? fallback.id,
    code: item?.code ?? fallback.code,
    title: item?.title ?? fallback.title,
    description:
      item?.description !== undefined
        ? normalizeNullableString(item.description)
        : fallback.description,

    shortDescription:
      (item as any)?.shortDescription !== undefined
        ? normalizeNullableString((item as any).shortDescription)
        : fallback.shortDescription,
    instructions:
      (item as any)?.instructions !== undefined
        ? normalizeNullableString((item as any).instructions)
        : fallback.instructions,
    estimatedTimeMinutes:
      (item as any)?.estimatedTimeMinutes !== undefined
        ? normalizeNullableNumber((item as any).estimatedTimeMinutes)
        : fallback.estimatedTimeMinutes,
    totalQuestions:
      (item as any)?.totalQuestions !== undefined
        ? normalizeNullableNumber((item as any).totalQuestions)
        : fallback.totalQuestions,
    totalDimensions:
      (item as any)?.totalDimensions !== undefined
        ? normalizeNullableNumber((item as any).totalDimensions)
        : fallback.totalDimensions,
    totalBands:
      (item as any)?.totalBands !== undefined
        ? normalizeNullableNumber((item as any).totalBands)
        : fallback.totalBands,
    totalMeanings:
      (item as any)?.totalMeanings !== undefined
        ? normalizeNullableNumber((item as any).totalMeanings)
        : fallback.totalMeanings,
    category:
      (item as any)?.category !== undefined
        ? normalizeNullableString((item as any).category)
        : fallback.category,
    tags:
      (item as any)?.tags !== undefined
        ? normalizeStringArray((item as any).tags)
        : fallback.tags,
    coverImageUrl:
      (item as any)?.coverImageUrl !== undefined
        ? normalizeNullableString((item as any).coverImageUrl)
        : fallback.coverImageUrl,

    language: (item?.language as QuestionnaireLanguage) ?? fallback.language,
    status: (item?.status as QuestionnaireStatus) ?? fallback.status,
    version:
      typeof item?.version === 'number'
        ? item.version
        : Number(item?.version ?? fallback.version),

    scoringType:
      (item?.scoringType as QuestionnaireScoringType) ?? fallback.scoringType,
    showResultToUser:
      typeof item?.showResultToUser === 'boolean'
        ? item.showResultToUser
        : Boolean(item?.showResultToUser ?? fallback.showResultToUser),

    optionsMode,
    fixedOptionsJson,

    isFeatured:
      typeof (item as any)?.isFeatured === 'boolean'
        ? (item as any).isFeatured
        : Boolean((item as any)?.isFeatured ?? fallback.isFeatured),
    isPublic:
      typeof (item as any)?.isPublic === 'boolean'
        ? (item as any).isPublic
        : Boolean((item as any)?.isPublic ?? fallback.isPublic),
    sortOrder:
      (item as any)?.sortOrder !== undefined
        ? normalizeNullableNumber((item as any).sortOrder)
        : fallback.sortOrder,
  }
}
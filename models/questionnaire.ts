// /models/questionnaire.ts

export type QuestionnaireLanguage = 'id' | 'en' | (string & {})
export type QuestionnaireStatus = 'draft' | 'published' | 'archived' | (string & {})
export type QuestionnaireScoringType =
  | 'multi_dimension'
  | 'total_score'
  | (string & {})

export type QuestionnaireOptionsMode = "fixed" | "per_question"

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
  description: string

  language: QuestionnaireLanguage
  status: QuestionnaireStatus
  version: number

  scoringType: QuestionnaireScoringType
  showResultToUser: boolean
  optionsMode: QuestionnaireOptionsMode
  fixedOptions: QuestionnaireFixedOptionModel[]

  createdAt?: Date
  updatedAt?: Date
}

// Default factory for creating a clean questionnaire object
export const createDefaultQuestionnaire = (): QuestionnaireModel => ({
  id: '',
  code: '',
  title: '',
  description: '',

  language: 'id',
  status: 'draft',
  version: 1,

  scoringType: 'multi_dimension',
  showResultToUser: true,

  optionsMode: "fixed", // 'fixed' | 'per_question'
  fixedOptions: [
    { label: "Setuju", scoreValue: 2, sortOrder: 1 },
    { label: "Ragu", scoreValue: 1, sortOrder: 2 },
    { label: "Tidak setuju", scoreValue: 0, sortOrder: 3 },
  ],

  createdAt: new Date(),
  updatedAt: new Date(),
})

// Helper — normalize partial questionnaire data into full model
// Helper — normalize partial questionnaire data into full model
export function normalizeQuestionnaire(
  item?: Partial<QuestionnaireModel>
): QuestionnaireModel {
  const fallback = createDefaultQuestionnaire()

  // optionsMode normalization (support legacy camel "perQuestion" just in case)
  const rawMode = (item as any)?.optionsMode ?? (item as any)?.options_mode
  const optionsMode: QuestionnaireOptionsMode =
    rawMode === 'perQuestion' ? 'per_question' : (rawMode as QuestionnaireOptionsMode) ?? fallback.optionsMode

  // fixedOptions normalization (support legacy snake keys just in case)
  const rawFixedOptions =
    (item as any)?.fixedOptions ??
    (item as any)?.fixed_options ??
    fallback.fixedOptions

  const fixedOptions: QuestionnaireFixedOptionModel[] = Array.isArray(rawFixedOptions)
    ? rawFixedOptions.map((o: any, idx: number) => ({
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
            : Number(o?.sortOrder ?? o?.sort_order ?? (idx + 1)),
    }))
    : fallback.fixedOptions

  return {
    id: item?.id ?? fallback.id,
    code: item?.code ?? fallback.code,
    title: item?.title ?? fallback.title,
    description: item?.description ?? fallback.description,

    language: (item?.language as QuestionnaireLanguage) ?? fallback.language,
    status: (item?.status as QuestionnaireStatus) ?? fallback.status,
    version:
      typeof item?.version === 'number'
        ? item.version
        : Number(item?.version ?? fallback.version),

    scoringType: (item?.scoringType as QuestionnaireScoringType) ?? fallback.scoringType,
    showResultToUser:
      typeof item?.showResultToUser === 'boolean'
        ? item.showResultToUser
        : Boolean(item?.showResultToUser ?? fallback.showResultToUser),

    optionsMode,
    fixedOptions: optionsMode === 'fixed' ? fixedOptions : [],

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
  | "id"
  | "title"
  | "description"
  | "language"
  | "status"
  | "version"
  | "scoringType"
  | "showResultToUser"
  | "optionsMode"
  | "fixedOptions"
>

export type QuestionnaireCreateFormModel = Omit<QuestionnaireFormModel, "id">

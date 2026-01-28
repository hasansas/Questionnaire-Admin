// /models/questionnaire.ts

export type QuestionnaireLanguage = 'id' | 'en' | (string & {})
export type QuestionnaireStatus = 'draft' | 'published' | 'archived' | (string & {})
export type QuestionnaireScoringType =
  | 'multi_dimension'
  | 'total_score'
  | (string & {})

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

  createdAt: new Date(),
  updatedAt: new Date(),
})

// Helper — normalize partial questionnaire data into full model
export function normalizeQuestionnaire(
  item?: Partial<QuestionnaireModel>
): QuestionnaireModel {
  return {
    id: item?.id ?? '',
    code: item?.code ?? '',
    title: item?.title ?? '',
    description: item?.description ?? '',

    language: (item?.language as QuestionnaireLanguage) ?? 'id',
    status: (item?.status as QuestionnaireStatus) ?? 'draft',
    version: typeof item?.version === 'number' ? item.version : Number(item?.version ?? 1),

    scoringType:
      (item?.scoringType as QuestionnaireScoringType) ?? 'multi_dimension',
    showResultToUser: Boolean(item?.showResultToUser ?? true),

    createdAt: item?.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item?.updatedAt ? new Date(item.updatedAt) : new Date(),
  }
}

// Normalizer (Array) — safely map list of questionnaire records
export function normalizeQuestionnaires(
  items?: Partial<QuestionnaireModel>[]
): QuestionnaireModel[] {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizeQuestionnaire(item))
}

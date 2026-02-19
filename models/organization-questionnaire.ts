// /models/organization-questionnaire.ts

export type QuestionnaireStatus = "draft" | "published" | "archived" | (string & {})
export type QuestionnaireLanguage = "id" | "en" | (string & {})
export type QuestionnaireScoringType = "total_score" | "multi_dimension" | (string & {})
export type QuestionnaireOptionsMode = "fixed" | "per_question" | (string & {})

export interface QuestionnaireModel {
  id: string
  code: string
  title: string
  description: string | null

  language: QuestionnaireLanguage
  status: QuestionnaireStatus
  version: number

  scoringType: QuestionnaireScoringType
  showResultToUser: boolean
  optionsMode: QuestionnaireOptionsMode
}

export interface OrganizationQuestionnaireAssignmentMeta {
  introText?: string
  customTitle?: string
  requireManagerApproval?: boolean
  [key: string]: any
}

export interface OrganizationQuestionnaireModel {
  id: string
  description: string | null

  isActive: boolean
  sortOrder: number
  isPublic: boolean

  metaJson: OrganizationQuestionnaireAssignmentMeta | null

  shareCode: string | null
  publicSlug: string | null
  shareUrl: string | null
  publicUrl: string | null
  questionnaire: QuestionnaireModel
}

export type OrganizationQuestionnaireFormModel = Pick<
  OrganizationQuestionnaireModel,
  | "description"
  | "isActive"
  | "isPublic"
> & {
  questionnaireId?: string
}

/**
 * Normalizers
 * - keep them defensive (API may omit / send nulls)
 * - do NOT invent extra fields beyond your payload
 */
export const normalizeOrganizationQuestionnaire = (
  input: any
): OrganizationQuestionnaireModel => {
  const a = input ?? {}
  const q = input?.questionnaire ?? {}
  console.log("normalizeOrganizationQuestionnaire", { input, a, q })
  return {
    id: String(a?.id ?? ""),
    description: a?.description ?? null,

    isActive: Boolean(a?.isActive ?? true),
    sortOrder: Number(a?.sortOrder ?? 0),
    isPublic: Boolean(a?.isPublic ?? false),

    metaJson: (a?.metaJson ?? null) as OrganizationQuestionnaireAssignmentMeta | null,

    shareCode: a?.shareCode ?? null,
    publicSlug: a?.publicSlug ?? null,
    shareUrl: a?.shareUrl ?? null,
    publicUrl: a?.publicUrl ?? null,
    questionnaire: {
      id: String(q?.id ?? ""),
      code: String(q?.code ?? ""),
      title: String(q?.title ?? ""),
      description: q?.description ?? null,

      language: (q?.language ?? "id") as QuestionnaireLanguage,
      status: (q?.status ?? "draft") as QuestionnaireStatus,
      version: Number(q?.version ?? 1),

      scoringType: (q?.scoringType ?? "total_score") as QuestionnaireScoringType,
      showResultToUser: Boolean(q?.showResultToUser ?? true),
      optionsMode: (q?.optionsMode ?? "per_question") as QuestionnaireOptionsMode
    }
  }
}

export function normalizeOrganizationQuestionnaires(
  items?: Partial<OrganizationQuestionnaireModel>[]
): OrganizationQuestionnaireModel[] {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizeOrganizationQuestionnaire(item))
}

/**
 * Default factories (optional, useful for forms)
 */
export const createDefaultQuestionnaire = (): QuestionnaireModel => ({
  id: "",
  code: "",
  title: "",
  description: null,
  language: "id",
  status: "draft",
  version: 1,
  scoringType: "total_score",
  showResultToUser: true,
  optionsMode: "per_question"
})

export const createDefaultOrganizationQuestionnaire =
  (): OrganizationQuestionnaireModel => ({
    id: "",
    description: null,
    isActive: true,
    sortOrder: 1,
    isPublic: false,
    metaJson: null,
    shareCode: null,
    publicSlug: null,
    shareUrl: null,
    publicUrl: null,
    questionnaire: createDefaultQuestionnaire(),
  })

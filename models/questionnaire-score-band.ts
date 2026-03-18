export type ScoreBandScope = 'dimension' | 'total'

export interface QuestionnaireScoreBandLabelLite {
  id: string
  code: string
  label: string
  sortOrder: number
}

export interface QuestionnaireDimensionLite {
  id: string
  key: string
  label?: string | null
  sortOrder: number
}

export interface QuestionnaireScoreBandGenerateItem {
  id: string
  code: string
  scope: ScoreBandScope
  minScore: number
  maxScore: number
  sortOrder: number
  status?: string
  isNew?: boolean
  scoreBandLabel: QuestionnaireScoreBandLabelLite
  dimension?: QuestionnaireDimensionLite | null
}

export interface QuestionnaireScoreBandsGenerateData {
  message?: string
  scope: ScoreBandScope
  createdCount: number
  totalCount: number
  items: QuestionnaireScoreBandGenerateItem[]
}

export interface QuestionnaireScoreBandsGenerateResponse {
  status: string
  message: string
  data: QuestionnaireScoreBandsGenerateData
}

export interface ScoreBandMatrixColumn {
  id: string
  code: string
  label: string
  sortOrder: number
}

export interface ScoreBandMatrixCell {
  id: string
  code: string
  scope: ScoreBandScope

  dimensionId: string | null
  scoreBandLabelId: string

  dimensionKey: string | null
  dimensionLabel: string | null

  scoreBandLabelCode: string
  scoreBandLabelLabel: string

  minScore: number
  maxScore: number
  sortOrder: number

  status?: string
  isNew?: boolean
}

export interface ScoreBandMatrixRow {
  key: string
  label: string
  sortOrder: number
  dimensionId: string | null
  cells: Record<string, ScoreBandMatrixCell>
}

export interface BulkPatchScoreBandItemPayload {
  id: string
  dimensionId: string | null
  scoreBandLabelId: string
  minScore: number
  maxScore: number
  sortOrder: number
}

export interface BulkPatchScoreBandsPayload {
  scope: ScoreBandScope
  items: BulkPatchScoreBandItemPayload[]
}
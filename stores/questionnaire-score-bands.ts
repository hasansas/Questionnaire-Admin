import { defineStore } from 'pinia'
import { useApiService } from '~/composables/useApiService'
import type {
  BulkPatchScoreBandItemPayload,
  BulkPatchScoreBandsPayload,
  QuestionnaireScoreBandGenerateItem,
  QuestionnaireScoreBandsGenerateResponse,
  ScoreBandMatrixCell,
  ScoreBandMatrixColumn,
  ScoreBandMatrixRow,
  ScoreBandScope,
} from '~/models/questionnaire-score-band'

function normalizeText(value?: string | null): string {
  return String(value || '').trim()
}

function normalizeKey(value?: string | null): string {
  return normalizeText(value)
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

function startCaseFromKey(value?: string | null): string {
  return normalizeText(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (s) => s.toUpperCase())
}

function toInt(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

function getCellLabel(item: QuestionnaireScoreBandGenerateItem): string {
  return normalizeText(item.scoreBandLabel?.label) || startCaseFromKey(item.scoreBandLabel?.code)
}

function getCellCode(item: QuestionnaireScoreBandGenerateItem): string {
  return normalizeKey(item.scoreBandLabel?.code) || 'band'
}

function getDimensionKey(item: QuestionnaireScoreBandGenerateItem): string {
  if (item.scope === 'total') return 'total'
  return normalizeKey(item.dimension?.key) || 'unknown'
}

function getDimensionLabel(item: QuestionnaireScoreBandGenerateItem): string {
  if (item.scope === 'total') return 'Total'
  return normalizeText(item.dimension?.label) || startCaseFromKey(item.dimension?.key)
}

export interface ScoreBandLabelFormPayload {
  code: string
  label: string
  sortOrder: number
}

export interface ScoreBandLabelItem {
  id: string
  code: string
  label: string
  sortOrder: number
}

export interface FetchScoreBandsSuccessResult {
  success: true
  data: {
    scope: ScoreBandScope
    createdCount: number
    totalCount: number
    sourceMessage: string
    columns: ScoreBandMatrixColumn[]
    rows: ScoreBandMatrixRow[]
  }
}

export interface ErrorResult {
  success: false
  error: string
}

export interface SuccessResult {
  success: true
}

export type FetchScoreBandsResult = FetchScoreBandsSuccessResult | ErrorResult
export type StoreActionResult = SuccessResult | ErrorResult

export const useQuestionnaireScoreBandsStore = defineStore('questionnaire-score-bands', {
  actions: {
    getDefaultScope(scoringType?: string | null): ScoreBandScope {
      return scoringType === 'multi_dimension' ? 'dimension' : 'total'
    },

    getRangeText(cell?: ScoreBandMatrixCell | null): string {
      if (!cell) return '-'
      return `${toInt(cell.minScore, 0)}–${toInt(cell.maxScore, 0)}`
    },

    getLabelsFromColumns(columns: ScoreBandMatrixColumn[]): ScoreBandLabelItem[] {
      return [...columns]
        .sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
          return a.label.localeCompare(b.label)
        })
        .map((col) => ({
          id: col.id,
          code: col.code,
          label: col.label,
          sortOrder: col.sortOrder,
        }))
    },

    transformToMatrix(
      items: QuestionnaireScoreBandGenerateItem[],
      scope: ScoreBandScope
    ): {
      columns: ScoreBandMatrixColumn[]
      rows: ScoreBandMatrixRow[]
    } {
      const columnMap = new Map<string, ScoreBandMatrixColumn>()
      const rowMap = new Map<string, ScoreBandMatrixRow>()

      for (const item of items) {
        const labelCode = getCellCode(item)
        const labelLabel = getCellLabel(item)
        const labelSort = toInt(item.scoreBandLabel?.sortOrder, 1)

        if (!columnMap.has(labelCode)) {
          columnMap.set(labelCode, {
            id: item.scoreBandLabel.id,
            code: labelCode,
            label: labelLabel,
            sortOrder: labelSort,
          })
        }

        const rowKey = getDimensionKey(item)
        const rowLabel = getDimensionLabel(item)
        const rowSort = scope === 'total' ? 1 : toInt(item.dimension?.sortOrder, 1)

        if (!rowMap.has(rowKey)) {
          rowMap.set(rowKey, {
            key: rowKey,
            label: rowLabel,
            sortOrder: rowSort,
            dimensionId: scope === 'dimension' ? item.dimension?.id || null : null,
            cells: {},
          })
        }

        const row = rowMap.get(rowKey)!
        row.cells[labelCode] = {
          id: item.id,
          code: item.code,
          scope,
          dimensionId: scope === 'dimension' ? item.dimension?.id || null : null,
          scoreBandLabelId: item.scoreBandLabel.id,
          dimensionKey: scope === 'total' ? 'total' : normalizeText(item.dimension?.key),
          dimensionLabel: rowLabel,
          scoreBandLabelCode: labelCode,
          scoreBandLabelLabel: labelLabel,
          minScore: toInt(item.minScore, 0),
          maxScore: toInt(item.maxScore, 0),
          sortOrder: toInt(item.sortOrder, labelSort || 1),
          status: item.status,
          isNew: Boolean(item.isNew),
        }
      }

      const columns = [...columnMap.values()].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
        return a.label.localeCompare(b.label)
      })

      const rows = [...rowMap.values()].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
        return a.label.localeCompare(b.label)
      })

      return { columns, rows }
    },

    validateBeforeSave(params: {
      scope: ScoreBandScope
      rows: ScoreBandMatrixRow[]
      columns: ScoreBandMatrixColumn[]
    }): string | null {
      const { scope, rows, columns } = params

      if (!rows.length || !columns.length) {
        return 'Belum ada score band yang dapat disimpan.'
      }

      for (const row of rows) {
        for (const col of columns) {
          const cell = row.cells[col.code]
          if (!cell) continue

          if (!cell.id) {
            return `Cell ${row.label} / ${col.label} tidak memiliki id.`
          }

          if (!cell.scoreBandLabelId) {
            return `Cell ${row.label} / ${col.label} tidak memiliki scoreBandLabelId.`
          }

          if (scope === 'dimension' && !cell.dimensionId) {
            return `Cell ${row.label} / ${col.label} tidak memiliki dimensionId.`
          }

          const minScore = toInt(cell.minScore, 0)
          const maxScore = toInt(cell.maxScore, 0)

          if (minScore > maxScore) {
            return `Nilai min tidak boleh lebih besar dari max pada ${row.label} / ${col.label}.`
          }
        }
      }

      return null
    },

    buildPatchPayload(params: {
      scope: ScoreBandScope
      rows: ScoreBandMatrixRow[]
      columns: ScoreBandMatrixColumn[]
    }): BulkPatchScoreBandsPayload {
      const { scope, rows, columns } = params
      const items: BulkPatchScoreBandItemPayload[] = []

      for (const row of rows) {
        for (const col of columns) {
          const cell = row.cells[col.code]
          if (!cell) continue

          items.push({
            id: cell.id,
            dimensionId: scope === 'dimension' ? cell.dimensionId : null,
            scoreBandLabelId: cell.scoreBandLabelId,
            minScore: toInt(cell.minScore, 0),
            maxScore: toInt(cell.maxScore, 0),
            sortOrder: toInt(cell.sortOrder, col.sortOrder || 1),
          })
        }
      }

      return {
        scope,
        items,
      }
    },

    async fetchScoreBands(params: {
      questionnaireId: string
      scope: ScoreBandScope
    }): Promise<FetchScoreBandsResult> {
      const api = useApiService()

      const result = await api.post<QuestionnaireScoreBandsGenerateResponse['data']>(
        `/v1/questionnaires/${params.questionnaireId}/score-bands/generate`,
        { scope: params.scope }
      )

      if (!result.success) {
        return {
          success: false,
          error: String(result.error || 'Gagal memuat score bands.'),
        }
      }

      const data = result.data
      const matrix = this.transformToMatrix(data?.items || [], params.scope)

      return {
        success: true,
        data: {
          scope: params.scope,
          createdCount: Number(data?.createdCount || 0),
          totalCount: Number(data?.totalCount || 0),
          sourceMessage: String(data?.message || ''),
          columns: matrix.columns,
          rows: matrix.rows,
        },
      }
    },

    async saveScoreBands(params: {
      questionnaireId: string
      scope: ScoreBandScope
      rows: ScoreBandMatrixRow[]
      columns: ScoreBandMatrixColumn[]
    }): Promise<StoreActionResult> {
      const validationError = this.validateBeforeSave({
        scope: params.scope,
        rows: params.rows,
        columns: params.columns,
      })

      if (validationError) {
        return {
          success: false,
          error: validationError,
        }
      }

      const api = useApiService()
      const payload = this.buildPatchPayload({
        scope: params.scope,
        rows: params.rows,
        columns: params.columns,
      })

      const result = await api.patch(
        `/v1/questionnaires/${params.questionnaireId}/score-bands/bulk`,
        payload
      )

      if (!result.success) {
        return {
          success: false,
          error: String(result.error || 'Gagal menyimpan score band.'),
        }
      }

      return { success: true }
    },

    async createScoreBandLabel(params: {
      questionnaireId: string
      payload: ScoreBandLabelFormPayload
    }): Promise<StoreActionResult> {
      const api = useApiService()

      const result = await api.post(
        `/v1/questionnaires/${params.questionnaireId}/score-band-labels`,
        params.payload
      )

      if (!result.success) {
        return {
          success: false,
          error: String(result.error || 'Gagal membuat band label.'),
        }
      }

      return { success: true }
    },

    async updateScoreBandLabel(params: {
      questionnaireId: string
      labelId: string
      payload: ScoreBandLabelFormPayload
    }): Promise<StoreActionResult> {
      const api = useApiService()

      const result = await api.patch(
        `/v1/questionnaires/${params.questionnaireId}/score-band-labels/${params.labelId}`,
        params.payload
      )

      if (!result.success) {
        return {
          success: false,
          error: String(result.error || 'Gagal mengupdate band label.'),
        }
      }

      return { success: true }
    },

    async deleteScoreBandLabel(params: {
      questionnaireId: string
      labelId: string
    }): Promise<StoreActionResult> {
      const api = useApiService()

      const result = await api.delete(
        `/v1/questionnaires/${params.questionnaireId}/score-band-labels/${params.labelId}`
      )

      if (!result.success) {
        return {
          success: false,
          error: String(result.error || 'Gagal menghapus band label.'),
        }
      }

      return { success: true }
    },
  },
})
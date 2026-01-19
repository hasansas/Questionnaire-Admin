/**
 * Voucher data model (Admin Web)
 */

export type VoucherType = 'percentage' | 'fixed'

export interface VoucherUsesCountModel {
  redeemed: number
  cancelled: number
  expired: number
  total: number
}

export interface VoucherModel {
  id?: string
  code: string
  name: string
  description?: string | null

  type: VoucherType
  discountValue: string // keep as string for DECIMAL consistency
  maxDiscount?: string | null
  minSpend?: string | null

  usageLimit?: number | null
  perUserLimit?: number | null

  validFrom?: Date | null
  validTo?: Date | null

  createdAt?: Date
  createdBy?: string | null
  updatedAt?: Date
  updatedBy?: string | null

  deletedAt?: Date | null
  deletedBy?: string | null

  // computed/derived (not always present)
  usesCount?: VoucherUsesCountModel
}

export interface VoucherInputModel
  extends Omit<VoucherModel, 'createdAt' | 'updatedAt' | 'deletedAt' | 'validFrom' | 'validTo'> {
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  validFrom?: string | null
  validTo?: string | null
}

/**
 * Default factory — ensures a clean base object
 */
export const createDefaultVoucher = (): VoucherModel => ({
  id: '',
  code: '',
  name: '',
  description: null,

  type: 'percentage',
  discountValue: '0.00',
  maxDiscount: null,
  minSpend: null,

  usageLimit: null,
  perUserLimit: 1,

  validFrom: null,
  validTo: null,

  createdAt: new Date(),
  createdBy: null,
  updatedAt: new Date(),
  updatedBy: null,

  deletedAt: null,
  deletedBy: null,

  usesCount: {
    redeemed: 0,
    cancelled: 0,
    expired: 0,
    total: 0,
  },
})

/**
 * Helper — safe Date parser
 */
function toDate(value?: string | Date | null): Date | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  const d = value instanceof Date ? value : new Date(value)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Helper — safe integer parser (keeps null when empty)
 */
function toInt(value?: number | string | null): number | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  const n = typeof value === 'number' ? value : parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

/**
 * Helper — decimal as string (keeps null when allowed)
 */
function toDecimalString(value?: string | number | null): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value === 'number') return value.toFixed(2)
  const s = String(value).trim()
  return s.length ? s : null
}

/**
 * Helper — normalize usesCount
 */
function normalizeUsesCount(item?: Partial<VoucherUsesCountModel> | null): VoucherUsesCountModel {
  return {
    redeemed: toInt(item?.redeemed) ?? 0,
    cancelled: toInt(item?.cancelled) ?? 0,
    expired: toInt(item?.expired) ?? 0,
    total: toInt(item?.total) ?? 0,
  }
}

/**
 * Normalizer — safely map partial data to full model
 */
export function normalizeVoucher(item?: Partial<VoucherModel>): VoucherModel {
  const type = (item?.type as VoucherType) ?? 'percentage'

  return {
    id: item?.id ?? '',
    code: (item?.code ?? '').toString(),
    name: item?.name ?? '',
    description: item?.description ?? null,

    type: type === 'fixed' ? 'fixed' : 'percentage',
    discountValue: (toDecimalString(item?.discountValue) ?? '0.00') as string,
    maxDiscount: toDecimalString(item?.maxDiscount) ?? null,
    minSpend: toDecimalString(item?.minSpend) ?? null,

    usageLimit: toInt(item?.usageLimit) ?? null,
    perUserLimit: toInt(item?.perUserLimit) ?? 1,

    validFrom: toDate(item?.validFrom) ?? null,
    validTo: toDate(item?.validTo) ?? null,

    createdAt: (toDate(item?.createdAt) as Date | null) ?? new Date(),
    createdBy: item?.createdBy ?? null,
    updatedAt: (toDate(item?.updatedAt) as Date | null) ?? new Date(),
    updatedBy: item?.updatedBy ?? null,

    deletedAt: toDate(item?.deletedAt) ?? null,
    deletedBy: item?.deletedBy ?? null,

    usesCount: normalizeUsesCount(item?.usesCount ?? null),
  }
}

/**
 * Normalizer (Array) — safely map list of vouchers
 */
export function normalizeVouchers(items?: Partial<VoucherModel>[]): VoucherModel[] {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizeVoucher(item))
}

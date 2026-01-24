/**
 * EmailTemplate data model
 */

export type EmailTemplateCode = Record<string, any>

export interface EmailTemplateModel {
  id?: number
  name: string
  description?: string | null

  subject?: string | null
  cc?: string | null
  bcc?: string | null
  from?: string | null
  fromName?: string | null

  contentHtml?: string | null
  contentText?: string | null
  contentCode?: EmailTemplateCode

  createdAt?: Date
  createdBy?: string | null
  updatedAt?: Date
  updatedBy?: string | null

  deletedAt?: Date | null
  deletedBy?: string | null
}

export interface EmailTemplateInputModel
  extends Omit<EmailTemplateModel, 'createdAt' | 'updatedAt' | 'deletedAt'> {
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * Default factory — ensures a clean base object
 */
export const createDefaultEmailTemplate = (): EmailTemplateModel => ({
  id: 0,
  name: '',
  description: null,

  subject: null,
  cc: null,
  bcc: null,
  from: null,
  fromName: null,

  contentHtml: null,
  contentText: null,
  contentCode: {},

  createdAt: new Date(),
  createdBy: null,
  updatedAt: new Date(),
  updatedBy: null,

  deletedAt: null,
  deletedBy: null,
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
 * Normalizer — safely map partial data to full model
 */
export function normalizeEmailTemplate(
  item?: Partial<EmailTemplateModel>,
): EmailTemplateModel {
  return {
    id: item?.id ?? 0,
    name: item?.name ?? '',
    description: item?.description ?? null,

    subject: item?.subject ?? null,
    cc: item?.cc ?? null,
    bcc: item?.bcc ?? null,
    from: item?.from ?? null,
    fromName: item?.fromName ?? null,

    contentHtml: item?.contentHtml ?? null,
    contentText: item?.contentText ?? null,
    contentCode: (item?.contentCode as EmailTemplateCode) ?? {},

    createdAt: (toDate(item?.createdAt) as Date | null) ?? new Date(),
    createdBy: item?.createdBy ?? null,
    updatedAt: (toDate(item?.updatedAt) as Date | null) ?? new Date(),
    updatedBy: item?.updatedBy ?? null,

    deletedAt: toDate(item?.deletedAt) ?? null,
    deletedBy: item?.deletedBy ?? null,
  }
}

/**
 * Normalizer (Array) — safely map list of templates
 */
export function normalizeEmailTemplates(
  items?: Partial<EmailTemplateModel>[],
): EmailTemplateModel[] {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizeEmailTemplate(item))
}

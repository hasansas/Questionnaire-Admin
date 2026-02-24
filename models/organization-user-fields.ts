// /models/organization-user-fields.ts

export type OrganizationUserFieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | (string & {})

export interface OrganizationUserFieldOption {
  label: string
  value: string
  [key: string]: any
}

export interface OrganizationUserFieldValidation {
  required?: boolean
  message?: string
  pattern?: string // regex string
  minLen?: number
  maxLen?: number
  min?: number
  max?: number
  [key: string]: any
}

export interface OrganizationUserFieldModel {
  id: string
  key: string
  label: string
  fieldType: OrganizationUserFieldType
  validationJson: OrganizationUserFieldValidation | null
  optionsJson: OrganizationUserFieldOption[] | null
  isActive: boolean
}

export interface OrganizationUserFieldsSettingModel {
  organizationId: string
  isActive: boolean
  version: number
  fields: OrganizationUserFieldModel[]
}

/**
 * Normalizers
 */
export const normalizeOrganizationUserField = (input: any): OrganizationUserFieldModel => ({
  id: String(input?.id ?? ""),
  key: String(input?.key ?? ""),
  label: String(input?.label ?? ""),
  fieldType: (input?.fieldType ?? "text") as OrganizationUserFieldType,
  validationJson:
    input?.validationJson && typeof input.validationJson === "object"
      ? input.validationJson
      : null,
  optionsJson: Array.isArray(input?.optionsJson) ? input.optionsJson : null,
  isActive: Boolean(input?.isActive ?? true)
})

export const normalizeOrganizationUserFieldsSetting = (
  input: any
): OrganizationUserFieldsSettingModel => ({
  organizationId: String(input?.organizationId ?? ""),
  isActive: Boolean(input?.isActive ?? true),
  version: Number(input?.version ?? 1),
  fields: Array.isArray(input?.fields) ? input.fields.map(normalizeOrganizationUserField) : []
})

/**
 * Default factories (useful for UI state)
 */
export const createDefaultOrganizationUserField = (): OrganizationUserFieldModel => ({
  id: "",
  key: "",
  label: "",
  fieldType: "text",
  validationJson: null,
  optionsJson: null,
  isActive: true
})

export const createDefaultOrganizationUserFieldsSetting =
  (): OrganizationUserFieldsSettingModel => ({
    organizationId: "",
    isActive: true,
    version: 1,
    fields: []
  })
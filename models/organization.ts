// /models/organization.ts

export interface Location {
  id: string
  name: string
}

// Settings JSON model (based on your sample payload)
export interface OrganizationSettingsModel {
  notes?: string | null
  features?: {
    requireEmailVerification?: boolean
    allowPublicQuestionnaires?: boolean
  }
  latitude?: number | null
  longitude?: number | null
  timezone?: string | null
  // allow future expansion without breaking
  [key: string]: any
}

// Access Data Model
export interface OrganizationModel {
  id: string
  code: string
  name: string

  type: string // e.g. 'client'
  category: string // e.g. 'university'
  subCategory: string | null

  email: string
  phone: string
  phoneSanitized: string

  image: string
  website: string
  description: string

  countryId: number | null
  stateId: number | null
  cityId: number | null

  subdistrict: string
  postalCode: string
  address: string

  status: string // e.g. 'active'
  settingsJson: OrganizationSettingsModel

  // Optional populated relations (API may include these)
  country?: Location
  state?: Location
  city?: Location

  createdAt?: Date
  updatedAt?: Date
}

// Default factory for creating a clean organization object
export const createDefaultOrganization = (): OrganizationModel => ({
  id: '',
  code: '',
  name: '',

  type: 'client',
  category: '',
  subCategory: null,

  email: '',
  phone: '',
  phoneSanitized: '',

  image: '',
  website: '',
  description: '',

  countryId: null,
  stateId: null,
  cityId: null,

  subdistrict: '',
  postalCode: '',
  address: '',

  status: 'active',
  settingsJson: {
    notes: '',
    features: {
      requireEmailVerification: false,
      allowPublicQuestionnaires: false,
    },
    latitude: undefined,
    longitude: undefined,
    timezone: 'Asia/Jakarta',
  },

  country: undefined,
  state: undefined,
  city: undefined,

  createdAt: new Date(),
  updatedAt: new Date(),
})

// Helper — normalize partial organization data into full model
export function normalizeOrganization(
  item?: Partial<OrganizationModel>
): OrganizationModel {
  return {
    id: item?.id ?? '',
    code: item?.code ?? '',
    name: item?.name ?? '',

    type: item?.type ?? 'client',
    category: item?.category ?? '',
    subCategory: item?.subCategory ?? null,

    email: item?.email ?? '',
    phone: item?.phone ?? '',
    phoneSanitized: item?.phoneSanitized ?? '',

    image: item?.image ?? '',
    website: item?.website ?? '',
    description: item?.description ?? '',

    countryId: item?.countryId ?? null,
    stateId: item?.stateId ?? null,
    cityId: item?.cityId ?? null,

    subdistrict: item?.subdistrict ?? '',
    postalCode: item?.postalCode ?? '',
    address: item?.address ?? '',

    status: item?.status ?? 'active',

    settingsJson: {
      ...(item?.settingsJson ?? {}),
      notes: item?.settingsJson?.notes ?? '',
      features: {
        ...(item?.settingsJson?.features ?? {}),
        requireEmailVerification:
          item?.settingsJson?.features?.requireEmailVerification ?? false,
        allowPublicQuestionnaires:
          item?.settingsJson?.features?.allowPublicQuestionnaires ?? false,
      },
      latitude: item?.settingsJson?.latitude,
      longitude: item?.settingsJson?.longitude,
      timezone: item?.settingsJson?.timezone ?? 'Asia/Jakarta',
    },

    // relations (keep as-is if provided; otherwise undefined)
    country: item?.country,
    state: item?.state,
    city: item?.city,

    createdAt: item?.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item?.updatedAt ? new Date(item.updatedAt) : new Date(),
  }
}

// Normalizer (Array) — safely map list of organization records
export function normalizeOrganizations(
  items?: Partial<OrganizationModel>[]
): OrganizationModel[] {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizeOrganization(item))
}

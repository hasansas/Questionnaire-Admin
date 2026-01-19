// /models/user.ts
import { type ProfileModel, normalizeProfile, createDefaultProfile } from './profile'

export interface ImageModel {
  name: string | null
  fileName: string | null
  url: string | null
}

export type Gender = 'male' | 'female' | null

export interface UserRoleModel {
  name: string
}

export interface UserProfileModel {
  firstName: string | null
  lastName: string | null
  gender: Gender
  /** Prefer ISO `YYYY-MM-DD` */
  birthDate: string | null
  address: string | null
}

export interface UserAddressModel {
  id: string
  address: string | null
  countryId: number | null
  stateId: number | null
  cityId: number | null
  country: string | null
  state: string | null
  city: string | null
  subdistrict: string | null
  postalCode: string | null
  longitude: number | null
  latitude: number | null
  phone: string | null
  setDefault: boolean
  externalRefId: string | null
  createdAt: string | null
}

export interface UserPreferenceModel {
  language: string
  timezone: string
  theme: string
  dateFormat: string
  timeFormat: string
  currency: string

  notificationEmail: boolean
  notificationPush: boolean
  notificationWhatsapp: boolean

  preferencesCompleted: boolean
  tourCompleted: boolean
  onboardingStatus: string

  uiFlags: Record<string, any>
  extraMeta: Record<string, any>
}

export interface UserModel {
  id: string
  name: string
  email: string

  /** API returns `phone` (and `phoneSanitized`) */
  phone: string | null
  phoneSanitized: string | null

  image: ImageModel | null

  isEmailVerified: boolean
  isPhoneVerified: boolean
  createdAt: string | null

  roles: UserRoleModel[]

  /** Partial profile from API (gender, birthDate) */
  profile: UserProfileModel

  /** API returns `addresses` as an object (default address) */
  addresses: UserAddressModel | null

  /** BaZi profile payload */
  baziProfile: ProfileModel | null

  preference: UserPreferenceModel
}

/**
 * Default factories
 * --------------------------------------------------------------------------
 */
export const createDefaultImage = (): ImageModel => ({
  name: null,
  fileName: null,
  url: null,
})

export const createDefaultUserProfile = (): UserProfileModel => ({
  firstName: null,
  lastName: null,
  gender: null,
  birthDate: null,
  address: null,
})

export const createDefaultUserRole = (): UserRoleModel => ({
  name: 'regular',
})

export const createDefaultUserAddress = (): UserAddressModel => ({
  id: '',
  address: null,
  countryId: null,
  stateId: null,
  cityId: null,
  country: null,
  state: null,
  city: null,
  subdistrict: null,
  postalCode: null,
  longitude: null,
  latitude: null,
  phone: null,
  setDefault: false,
  externalRefId: null,
  createdAt: null,
})

export const createDefaultPreference = (): UserPreferenceModel => ({
  language: 'en',
  timezone: 'UTC',
  theme: 'system',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  currency: 'USD',

  notificationEmail: false,
  notificationPush: false,
  notificationWhatsapp: false,

  preferencesCompleted: false,
  tourCompleted: false,
  onboardingStatus: 'idle',

  uiFlags: {},
  extraMeta: {},
})

export const createDefaultUser = (): UserModel => ({
  id: '',
  name: '',
  email: '',

  phone: null,
  phoneSanitized: null,

  image: null,

  isEmailVerified: false,
  isPhoneVerified: false,
  createdAt: null,

  roles: [createDefaultUserRole()],

  profile: createDefaultUserProfile(),
  addresses: null,
  baziProfile: null,

  preference: createDefaultPreference(),
})

/**
 * Normalizers
 * --------------------------------------------------------------------------
 */
export function normalizeImage(item?: Partial<ImageModel> | null): ImageModel | null {
  if (!item) return null
  return {
    name: item?.name ?? null,
    fileName: item?.fileName ?? null,
    url: item?.url ?? null,
  }
}

function splitFullName(
  name?: string | null,
): { firstName: string | null; lastName: string | null } {
  const n = (name ?? '').trim()
  if (!n) return { firstName: null, lastName: null }
  const parts = n.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: null }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') || null }
}

function normalizeGender(v: any): Gender {
  const s = (v ?? '').toString().trim().toLowerCase()
  if (s === 'male' || s === 'm') return 'male'
  if (s === 'female' || s === 'f') return 'female'
  return null
}

export function normalizeUserProfile(
  item?: Partial<UserProfileModel> | null,
  opts?: { fallbackFullName?: string | null; fallbackAddress?: string | null },
): UserProfileModel {
  const nameParts = splitFullName(opts?.fallbackFullName ?? null)

  return {
    firstName: (item as any)?.firstName ?? nameParts.firstName,
    lastName: (item as any)?.lastName ?? nameParts.lastName,
    gender: normalizeGender((item as any)?.gender),
    birthDate: (item as any)?.birthDate ?? null,
    address: (item as any)?.address ?? opts?.fallbackAddress ?? null,
  }
}

export function normalizePreference(item?: Partial<UserPreferenceModel> | null): UserPreferenceModel {
  const d = createDefaultPreference()
  return {
    language: item?.language ?? d.language,
    timezone: item?.timezone ?? d.timezone,
    theme: item?.theme ?? d.theme,
    dateFormat: item?.dateFormat ?? d.dateFormat,
    timeFormat: item?.timeFormat ?? d.timeFormat,
    currency: item?.currency ?? d.currency,

    notificationEmail: item?.notificationEmail ?? d.notificationEmail,
    notificationPush: item?.notificationPush ?? d.notificationPush,
    notificationWhatsapp: item?.notificationWhatsapp ?? d.notificationWhatsapp,

    preferencesCompleted: item?.preferencesCompleted ?? d.preferencesCompleted,
    tourCompleted: item?.tourCompleted ?? d.tourCompleted,
    onboardingStatus: item?.onboardingStatus ?? d.onboardingStatus,

    uiFlags: (item as any)?.uiFlags ?? d.uiFlags,
    extraMeta: (item as any)?.extraMeta ?? d.extraMeta,
  }
}

export function normalizeRoles(items?: any): UserRoleModel[] {
  if (!Array.isArray(items)) return []
  return items
    .map((r) => ({
      name: (r?.name ?? '').toString() || 'regular',
    }))
    .filter((r) => !!r.name)
}

export function normalizeUserAddress(item?: Partial<UserAddressModel> | null): UserAddressModel | null {
  if (!item) return null
  return {
    id: (item as any)?.id ?? '',
    address: (item as any)?.address ?? null,
    countryId: (item as any)?.countryId ?? null,
    stateId: (item as any)?.stateId ?? null,
    cityId: (item as any)?.cityId ?? null,
    country: (item as any)?.country ?? null,
    state: (item as any)?.state ?? null,
    city: (item as any)?.city ?? null,
    subdistrict: (item as any)?.subdistrict ?? null,
    postalCode: (item as any)?.postalCode ?? null,
    longitude: (item as any)?.longitude ?? null,
    latitude: (item as any)?.latitude ?? null,
    phone: (item as any)?.phone ?? null,
    setDefault: Boolean((item as any)?.setDefault),
    externalRefId: (item as any)?.externalRefId ?? null,
    createdAt: (item as any)?.createdAt ?? null,
  }
}

/**
 * Primary user normalizer
 */
export function normalizeUser(item?: Partial<UserModel> | any): UserModel {
  const d = createDefaultUser()

  const name = item?.name ?? d.name
  const addressesObj = item?.addresses ?? null
  const addressText =
    addressesObj?.address && String(addressesObj.address).trim() !== ''
      ? String(addressesObj.address)
      : null

  return {
    id: item?.id ?? d.id,
    name,
    email: item?.email ?? d.email,

    phone: item?.phone ?? null,
    phoneSanitized: item?.phoneSanitized ?? null,

    image: normalizeImage(item?.image ?? null),

    isEmailVerified: Boolean(item?.isEmailVerified),
    isPhoneVerified: Boolean(item?.isPhoneVerified),
    createdAt: item?.createdAt ?? null,

    roles: normalizeRoles(item?.roles),

    profile: normalizeUserProfile(item?.profile ?? null, {
      fallbackFullName: name,
      fallbackAddress: addressText,
    }),

    addresses: normalizeUserAddress(addressesObj),
    baziProfile: item?.baziProfile ? normalizeProfile(item?.baziProfile) : null,

    preference: normalizePreference(item?.preference ?? null),
  }
}

export function normalizeUsers(items?: Partial<UserModel>[] | any[]): UserModel[] {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizeUser(item))
}

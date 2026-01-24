// /models/orgUser.ts

export type OrgUserStatus = 'active' | 'pending' | 'revoked' | 'disabled'
export type OrgUserRole = 'org_owner' | 'org_admin' | 'org_editor' | 'org_viewer'

export type OrgInviteMetaStatus = 'queued' | 'sent' | 'failed'
export type OrgInviteChannel = 'email' | 'whatsapp' | 'sms' | string

export interface OrgInviteMetaModel {
  type?: string
  sendTo?: string
  status?: OrgInviteMetaStatus
  channel?: OrgInviteChannel
  tokenExpires?: Date
}

export interface OrgRefModel {
  id?: string
  name?: string
}

export interface OrgUserRefModel {
  id?: string
  name?: string
  email?: string
  image?: string | null
  active?: boolean
  isEmailVerified?: boolean
}

export interface InviterRefModel {
  id?: string
  name?: string
  email?: string
}

export interface OrgUserModel {
  id?: string
  role: OrgUserRole | string
  status: OrgUserStatus | string

  invitedAt?: Date | null
  acceptedAt?: Date | null
  revokedAt?: Date | null

  metaJson?: OrgInviteMetaModel

  organization?: OrgRefModel
  user?: OrgUserRefModel
  inviter?: InviterRefModel

  createdAt?: Date
  updatedAt?: Date
}

export interface OrgUserInputModel
  extends Omit<
    OrgUserModel,
    | 'invitedAt'
    | 'acceptedAt'
    | 'revokedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'metaJson'
  > {
  invitedAt?: string | null
  acceptedAt?: string | null
  revokedAt?: string | null
  createdAt?: string
  updatedAt?: string
  metaJson?: {
    type?: string
    sendTo?: string
    status?: OrgInviteMetaStatus
    channel?: OrgInviteChannel
    tokenExpires?: string
  }
}

/**
 * Default factory — ensures a clean base object
 */
export const createDefaultOrgUser = (): OrgUserModel => ({
  id: '',
  role: 'org_viewer',
  status: 'pending',
  invitedAt: null,
  acceptedAt: null,
  revokedAt: null,
  metaJson: {
    type: 'org_invite',
    sendTo: '',
    status: 'queued',
    channel: 'email',
    tokenExpires: new Date(),
  },
  organization: { id: '', name: '' },
  user: {
    id: '',
    name: '',
    email: '',
    image: null,
    active: false,
    isEmailVerified: false,
  },
  inviter: { id: '', name: '', email: '' },
  createdAt: new Date(),
  updatedAt: new Date(),
})

function normalizeDate(v?: string | Date | null): Date | null {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Normalizer — safely map partial data to full model
 */
export function normalizeOrgUser(item?: Partial<OrgUserModel>): OrgUserModel {
  const meta = item?.metaJson ?? {}

  return {
    id: item?.id ?? '',
    role: (item?.role as any) ?? 'org_viewer',
    status: (item?.status as any) ?? 'pending',

    invitedAt: normalizeDate(item?.invitedAt ?? null),
    acceptedAt: normalizeDate(item?.acceptedAt ?? null),
    revokedAt: normalizeDate(item?.revokedAt ?? null),

    metaJson: {
      type: meta?.type ?? 'org_invite',
      sendTo: meta?.sendTo ?? item?.user?.email ?? '',
      status: meta?.status ?? 'queued',
      channel: meta?.channel ?? 'email',
      tokenExpires: normalizeDate((meta as any)?.tokenExpires ?? null) ?? undefined,
    },

    organization: {
      id: item?.organization?.id ?? '',
      name: item?.organization?.name ?? '',
    },

    user: {
      id: item?.user?.id ?? '',
      name: item?.user?.name ?? '',
      email: item?.user?.email ?? meta?.sendTo ?? '',
      image: item?.user?.image ?? null,
      active: item?.user?.active ?? false,
      isEmailVerified: item?.user?.isEmailVerified ?? false,
    },

    inviter: {
      id: item?.inviter?.id ?? '',
      name: item?.inviter?.name ?? '',
      email: item?.inviter?.email ?? '',
    },

    createdAt: item?.createdAt ? new Date(item.createdAt as any) : new Date(),
    updatedAt: item?.updatedAt ? new Date(item.updatedAt as any) : new Date(),
  }
}

/**
 * Normalizer (Array) — safely map list
 */
export function normalizeOrgUsers(items?: Partial<OrgUserModel>[]): OrgUserModel[] {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizeOrgUser(item))
}

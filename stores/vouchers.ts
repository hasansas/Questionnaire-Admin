import { defineStore } from 'pinia'
import { useResourceStore } from '~/composables/useResourceStore'
import { normalizeVoucher, normalizeVouchers, type VoucherModel } from '~/models/voucher'

export const useVouchersStore = defineStore('voucher', () => {
  const apiEndpoint = '/v1/vouchers'

  return useResourceStore<VoucherModel>({
    endpoint: apiEndpoint,
    normalizedArray: normalizeVouchers,
    normalizedJson: normalizeVoucher,
  })
})

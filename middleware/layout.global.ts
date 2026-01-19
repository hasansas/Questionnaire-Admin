// /middleware/layout.global.ts
import type { LayoutKey } from '#build/types/layouts'

export default defineNuxtRouteMiddleware((to) => {
  const { isMobile } = useIsMobile()
  const auth = useAuthStore()

  const isLoggedIn = auth.isLoggedIn
  const layout: LayoutKey =
    isLoggedIn && !to.path.startsWith('/auth')
      ? (isMobile.value ? 'mobile-loggedin' : 'loggedin')
      : (isMobile.value ? 'mobile-default' : 'default')

  setPageLayout(layout)
})

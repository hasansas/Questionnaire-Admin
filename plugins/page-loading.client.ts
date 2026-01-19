export default defineNuxtPlugin((nuxtApp) => {
  const pageLoading = useState<boolean>('sb_page_loading', () => false)

  nuxtApp.hook('page:start', () => {
    pageLoading.value = true
  })

  nuxtApp.hook('page:finish', () => {
    pageLoading.value = false
  })

  nuxtApp.hook('app:error', () => {
    pageLoading.value = false
  })
})

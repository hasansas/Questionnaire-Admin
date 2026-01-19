import { defineNuxtPlugin } from '#app'
import { EmailEditor } from 'vue-email-editor'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('EmailEditor', EmailEditor)
})

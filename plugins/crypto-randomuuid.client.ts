export default defineNuxtPlugin(() => {
  // Ensure crypto exists (it should in browsers, but just in case)
  const g = globalThis as any
  if (!g.crypto) g.crypto = {}

  // Polyfill randomUUID if missing (e.g. non-secure context / older browser)
  if (!g.crypto.randomUUID) {
    g.crypto.randomUUID = () => {
      const bytes = new Uint8Array(16)
      // Use getRandomValues if available; fallback to Math.random otherwise
      if (globalThis.crypto?.getRandomValues) {
        globalThis.crypto.getRandomValues(bytes)
      } else {
        for (let i = 0; i < 16; i++) bytes[i] = (Math.random() * 256) | 0
      }

      // RFC4122 v4
      bytes[6] = (bytes[6] & 0x0f) | 0x40
      bytes[8] = (bytes[8] & 0x3f) | 0x80

      const hex = [...bytes].map(b => b.toString(16).padStart(2, "0")).join("")
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    }
  }
})
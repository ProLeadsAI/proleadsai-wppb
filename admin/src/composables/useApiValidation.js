import { ref, reactive } from 'vue'
import { wpAjax } from '@/lib/wpAjax'

export function useApiValidation(settings) {
  const isValidating = ref(false)
  
  const apiValidation = reactive({
    checked: false,
    lastValidatedKey: '',
    originalKey: '',
    domains: {
      site: {
        host: '',
        places: { valid: false, message: '' }
      },
      app: {
        host: 'next.proleadsai.com',
        places: { valid: false, message: '' }
      }
    }
  })

  function initValidation(apiKey) {
    if (!apiKey) return
    apiValidation.originalKey = apiKey
    apiValidation.lastValidatedKey = apiKey
    apiValidation.checked = true
    apiValidation.domains.site.places = { valid: true, message: '' }
    apiValidation.domains.app.places = { valid: true, message: '' }
  }

  async function validateApiKey(apiKey, force = false) {
    const key = apiKey?.trim() || ''
    
    if (!key) {
      apiValidation.checked = true
      apiValidation.lastValidatedKey = ''
      apiValidation.domains.site.places = { valid: false, message: 'API key is required' }
      apiValidation.domains.app.places = { valid: false, message: 'API key is required' }
      return false
    }
    
    if (!force && apiValidation.checked && apiValidation.lastValidatedKey === key) {
      return apiValidation.domains.site.places.valid || apiValidation.domains.app.places.valid
    }
    
    isValidating.value = true
    
    try {
      const siteUrl = (settings?.siteUrl || window.proleadsaiSettings?.siteUrl || window.proleadsai_settings?.siteUrl || '').toString()

      let siteHost = ''
      try {
        siteHost = siteUrl ? new URL(siteUrl).hostname : ''
      } catch {
        siteHost = ''
      }
      apiValidation.domains.site.host = siteHost

      const data = await wpAjax('proleadsai_validate_api_key', { apiKey: key, wpBaseUrl: siteUrl }, settings)
      apiValidation.checked = true
      apiValidation.lastValidatedKey = key

      const results = data?.data?.results || {}
      const appHost = apiValidation.domains.app.host
      const fallback = { valid: false, message: data?.data?.message || 'Validation failed' }

      apiValidation.domains.site.places = results?.[siteHost]?.placesApi || fallback
      apiValidation.domains.app.places = results?.[appHost]?.placesApi || fallback

      return apiValidation.domains.site.places.valid || apiValidation.domains.app.places.valid
    } catch (e) {
      apiValidation.checked = true
      apiValidation.lastValidatedKey = key
      apiValidation.domains.site.places = { valid: false, message: 'Failed to validate' }
      apiValidation.domains.app.places = { valid: false, message: 'Failed to validate' }
      return false
    } finally {
      isValidating.value = false
    }
  }

  return {
    isValidating,
    apiValidation,
    initValidation,
    validateApiKey
  }
}

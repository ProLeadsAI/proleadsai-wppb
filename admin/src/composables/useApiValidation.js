import { ref, reactive } from 'vue'
import { wpAjax } from '@/lib/wpAjax'

export function useApiValidation(settings) {
  const isValidating = ref(false)
  
  const apiValidation = reactive({
    checked: false,
    lastValidatedKey: '',
    originalKey: '',
    places: { valid: false, message: '' },
    solar: { valid: false, message: '' }
  })

  function initValidation(apiKey) {
    if (apiKey) {
      apiValidation.originalKey = apiKey
      apiValidation.lastValidatedKey = apiKey
      apiValidation.checked = true
      apiValidation.places = { valid: true, message: '' }
      apiValidation.solar = { valid: true, message: '' }
    }
  }

  async function validateApiKey(apiKey, force = false) {
    const key = apiKey?.trim() || ''
    
    if (!key) {
      apiValidation.checked = true
      apiValidation.lastValidatedKey = ''
      apiValidation.places = { valid: false, message: 'API key is required' }
      apiValidation.solar = { valid: false, message: 'API key is required' }
      return false
    }
    
    if (!force && apiValidation.checked && apiValidation.lastValidatedKey === key) {
      return apiValidation.places.valid || apiValidation.solar.valid
    }
    
    isValidating.value = true
    
    try {
      const data = await wpAjax('proleadsai_validate_api_key', { apiKey: key }, settings)
      apiValidation.checked = true
      apiValidation.lastValidatedKey = key
      
      if (data.success && data.data?.results) {
        apiValidation.places = data.data.results.placesApi
        apiValidation.solar = data.data.results.solarApi
      } else {
        apiValidation.places = { valid: false, message: data.data?.message || 'Validation failed' }
        apiValidation.solar = { valid: false, message: data.data?.message || 'Validation failed' }
      }
      
      return apiValidation.places.valid || apiValidation.solar.valid
    } catch (e) {
      apiValidation.checked = true
      apiValidation.lastValidatedKey = key
      apiValidation.places = { valid: false, message: 'Failed to validate' }
      apiValidation.solar = { valid: false, message: 'Failed to validate' }
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

import { ref, reactive, computed, watch } from 'vue'
import { wpAjax, loadState as loadFn, saveState as saveFn } from '@/lib/wpAjax'
import { useApiValidation } from './useApiValidation'
import { BASE_URL } from '@/lib/api'

export function useSettings(settings, emit) {
  const showReauthModal = ref(false)
  const isSaving = ref(false)
  const error = ref('')
  const success = ref('')
  const showApiKeyHelp = ref(null)

  const state = reactive({
    email: '',
    user_id: '',
    team_id: '',
    auth_token: '',
    business: '',
    google_maps_api_key: '',
    google_solar_api_key: '',
    price_per_sq: '750',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    // Floating button
    primary_color: '#ffd400',
    text_color: '#1d1616',
    button_text: 'Get Roof Estimate',
    button_emoji: '🏠',
    button_position: 'bottom-right',
    show_widget: true,
    // Shortcode
    shortcode_heading: 'Free Roof Estimate Instantly',
    shortcode_bg_style: 'none',
    shortcode_bg_color: '#f5f5f4',
    shortcode_image: 'default',
    shortcode_custom_image: '',
    shortcode_margin_top: '',
    shortcode_margin_bottom: '',
    // Typography
    heading_font: '',
    heading_color: '#1c1917',
    text_font: '',
    text_color_shortcode: '#44403c',
    heading_size: '',
    text_size: '',
    // Sidebar (Floating Widget) Visuals
    sidebar_heading: 'Free Roof Estimate Instantly',
    sidebar_bg_style: 'none',
    sidebar_bg_color: '#f5f5f4',
    sidebar_image: 'default',
    sidebar_custom_image: '',
    sidebar_heading_font: '',
    sidebar_heading_color: '#1c1917',
    sidebar_text_font: '',
    sidebar_text_color: '#44403c',
    sidebar_heading_size: '',
    sidebar_text_size: ''
  })

  const { isValidating: isValidatingPlaces, apiValidation: placesValidation, initValidation: initPlacesValidation, validateApiKey: validatePlacesKey } = useApiValidation(settings)

  // Solar API validation state
  const isValidatingSolar = ref(false)
  const solarValidation = reactive({
    checked: false,
    valid: false,
    message: '',
    lastValidatedKey: ''
  })

  function resetSolarValidation() {
    solarValidation.checked = false
    solarValidation.valid = false
    solarValidation.message = ''
  }

  watch(() => state.google_solar_api_key, (val) => {
    const key = (val || '').trim()
    if (!key || key !== solarValidation.lastValidatedKey) {
      resetSolarValidation()
    }
  })

  async function validateSolarKey() {
    const key = state.google_solar_api_key?.trim()
    if (!key) {
      solarValidation.checked = true
      solarValidation.valid = false
      solarValidation.message = 'API key is required'
      return
    }

    isValidatingSolar.value = true
    solarValidation.checked = false

    try {
      const response = await wpAjax('proleadsai_validate_solar_api', { apiKey: key }, settings)
      
      if (response.success && response.data?.solarApi) {
        solarValidation.checked = true
        solarValidation.valid = response.data.solarApi.valid
        solarValidation.message = response.data.solarApi.message
        solarValidation.lastValidatedKey = key
      } else {
        solarValidation.checked = true
        solarValidation.valid = false
        solarValidation.message = response.data?.message || 'Failed to validate Solar API'
      }
    } catch (e) {
      solarValidation.checked = true
      solarValidation.valid = false
      solarValidation.message = e.message || 'Failed to validate Solar API'
    } finally {
      isValidatingSolar.value = false
    }
  }

  const apiDomain = computed(() => {
    try {
      return new URL(BASE_URL).host
    } catch {
      return 'next.proleadsai.com'
    }
  })

  const siteDomain = computed(() => {
    try {
      return new URL(settings.siteUrl || window.location.origin).hostname
    } catch {
      return window.location.hostname
    }
  })

  function resetPlacesValidation() {
    placesValidation.checked = false
    placesValidation.domains.site.places = { valid: false, message: '' }
    placesValidation.domains.app.places = { valid: false, message: '' }
  }

  watch(() => state.google_maps_api_key, (val) => {
    const key = (val || '').trim()
    if (!key || key !== placesValidation.lastValidatedKey) {
      resetPlacesValidation()
    }
  })

  async function loadSettings() {
    try {
      const data = await loadFn(settings)
      if (data && typeof data === 'object') {
        Object.assign(state, data)

        const loadedPlacesKey = (data.google_maps_api_key || '').trim()
        if (loadedPlacesKey) {
          placesValidation.originalKey = loadedPlacesKey
          placesValidation.lastValidatedKey = loadedPlacesKey
          resetPlacesValidation()
        }
      }

      if (!state.shortcode_heading) state.shortcode_heading = 'Free Roof Estimate Instantly'
      if (!state.sidebar_heading) state.sidebar_heading = 'Free Roof Estimate Instantly'
      
      if (!state.auth_token) {
        showReauthModal.value = true
        return
      }
      
      await fetchSettingsFromApi()
    } catch (e) {
      console.error('Failed to load state:', e)
    }
  }

  async function fetchSettingsFromApi() {
    try {
      const response = await wpAjax('proleadsai_proxy_get_settings', {}, settings)
      
      if (response.success && response.data) {
        const data = response.data
        if (data.name) state.business = data.name
        if (data.googleMapsApiKey) {
          state.google_maps_api_key = data.googleMapsApiKey
          const loadedPlacesKey = (data.googleMapsApiKey || '').trim()
          placesValidation.originalKey = loadedPlacesKey
          placesValidation.lastValidatedKey = loadedPlacesKey
          resetPlacesValidation()
        }
        if (data.googleSolarApiKey) {
          state.google_solar_api_key = data.googleSolarApiKey
        }
        if (data.pricePerSq !== undefined) state.price_per_sq = data.pricePerSq.toString()
        if (data.timezone) state.timezone = data.timezone
        if (data.id) state.team_id = data.id
      }
    } catch (e) {
      console.error('Failed to fetch settings from API:', e)
    }
  }

  async function saveBusinessSettings() {
    isSaving.value = true
    error.value = ''
    success.value = ''
    
    try {
      const placesKey = state.google_maps_api_key.trim()

      if (placesKey && placesKey !== placesValidation.lastValidatedKey) {
        await validatePlacesKey(placesKey, true)
      }
      
      const response = await wpAjax('proleadsai_proxy_save_settings', {
        name: state.business,
        googleMapsApiKey: state.google_maps_api_key,
        googleSolarApiKey: state.google_solar_api_key,
        pricePerSq: parseInt(state.price_per_sq, 10) || 750,
        timezone: state.timezone
      }, settings)
      
      if (!response.success) {
        throw new Error(response.data?.message || 'Failed to update settings')
      }
      
      success.value = 'Business settings updated successfully!'
      setTimeout(() => { success.value = '' }, 3000)
    } catch (e) {
      error.value = e.message || 'Failed to save settings'
    } finally {
      isSaving.value = false
    }
  }

  async function saveAppearance() {
    isSaving.value = true
    error.value = ''
    success.value = ''
    
    try {
      await saveFn({
        show_widget: state.show_widget,
        button_position: state.button_position,
        primary_color: state.primary_color,
        text_color: state.text_color,
        button_text: state.button_text,
        button_emoji: state.button_emoji,
        sidebar_heading: state.sidebar_heading,
        sidebar_bg_style: state.sidebar_bg_style,
        sidebar_bg_color: state.sidebar_bg_color,
        sidebar_image: state.sidebar_image,
        sidebar_custom_image: state.sidebar_custom_image,
        sidebar_heading_font: state.sidebar_heading_font,
        sidebar_heading_color: state.sidebar_heading_color,
        sidebar_text_font: state.sidebar_text_font,
        sidebar_text_color: state.sidebar_text_color,
        sidebar_heading_size: state.sidebar_heading_size,
        sidebar_text_size: state.sidebar_text_size
      }, settings)
      
      success.value = 'Floating widget settings saved!'
      setTimeout(() => { success.value = '' }, 3000)
    } catch (e) {
      error.value = e.message || 'Failed to save settings'
    } finally {
      isSaving.value = false
    }
  }

  async function saveShortcodeSettings() {
    isSaving.value = true
    error.value = ''
    success.value = ''
    
    try {
      await saveFn({
        shortcode_heading: state.shortcode_heading,
        shortcode_bg_style: state.shortcode_bg_style,
        shortcode_bg_color: state.shortcode_bg_color,
        shortcode_image: state.shortcode_image,
        shortcode_custom_image: state.shortcode_custom_image,
        shortcode_margin_top: state.shortcode_margin_top,
        shortcode_margin_bottom: state.shortcode_margin_bottom,
        heading_font: state.heading_font,
        heading_color: state.heading_color,
        text_font: state.text_font,
        text_color_shortcode: state.text_color_shortcode,
        heading_size: state.heading_size,
        text_size: state.text_size,
        sidebar_heading: state.sidebar_heading,
        sidebar_bg_style: state.sidebar_bg_style,
        sidebar_bg_color: state.sidebar_bg_color,
        sidebar_image: state.sidebar_image,
        sidebar_custom_image: state.sidebar_custom_image,
        sidebar_heading_font: state.sidebar_heading_font,
        sidebar_heading_color: state.sidebar_heading_color,
        sidebar_text_font: state.sidebar_text_font,
        sidebar_text_color: state.sidebar_text_color,
        sidebar_heading_size: state.sidebar_heading_size,
        sidebar_text_size: state.sidebar_text_size
      }, settings)
      
      success.value = 'Shortcode settings saved!'
      setTimeout(() => { success.value = '' }, 3000)
    } catch (e) {
      error.value = e.message || 'Failed to save shortcode settings'
    } finally {
      isSaving.value = false
    }
  }

  function openMediaLibrary(targetField = 'shortcode_custom_image') {
    if (window.wp && window.wp.media) {
      const mediaFrame = window.wp.media({
        title: 'Select Hero Image',
        button: { text: 'Use this image' },
        multiple: false
      })
      
      mediaFrame.on('select', () => {
        const attachment = mediaFrame.state().get('selection').first().toJSON()
        if (Object.prototype.hasOwnProperty.call(state, targetField)) {
          state[targetField] = attachment.url
        }
      })
      
      mediaFrame.open()
    } else {
      const url = prompt('Enter image URL:')
      if (url && Object.prototype.hasOwnProperty.call(state, targetField)) state[targetField] = url
    }
  }

  async function handleReauthSuccess({ userId, authToken, teamId }) {
    state.user_id = userId
    state.auth_token = authToken
    if (teamId) state.team_id = teamId
    
    await saveFn({
      user_id: state.user_id,
      auth_token: state.auth_token,
      team_id: state.team_id
    }, settings)
    
    showReauthModal.value = false
    await fetchSettingsFromApi()
  }

  function goToDashboard() {
    window.location.href = `${settings.adminUrl}admin.php?page=proleadsai-dashboard`
  }

  return {
    state,
    showReauthModal,
    isSaving,
    error,
    success,
    showApiKeyHelp,
    isValidatingPlaces,
    placesValidation,
    isValidatingSolar,
    solarValidation,
    validateSolarKey,
    apiDomain,
    siteDomain,
    loadSettings,
    saveBusinessSettings,
    saveAppearance,
    saveShortcodeSettings,
    openMediaLibrary,
    handleReauthSuccess,
    goToDashboard
  }
}

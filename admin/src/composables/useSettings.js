import { ref, reactive, computed } from 'vue'
import { wpAjax, loadState as loadFn, saveState as saveFn } from '@/lib/wpAjax'
import { useApiValidation } from './useApiValidation'

export function useSettings(settings, emit) {
  const showReauthModal = ref(false)
  const isSaving = ref(false)
  const error = ref('')
  const success = ref('')
  const showApiKeyHelp = ref(false)

  const state = reactive({
    email: '',
    user_id: '',
    team_id: '',
    auth_token: '',
    business: '',
    google_maps_api_key: '',
    price_per_sq: '750',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    // Floating button
    primary_color: '#facc15',
    text_color: '#1c1917',
    button_text: 'Get Roof Estimate',
    button_emoji: '🏠',
    button_position: 'bottom-right',
    show_widget: true,
    // Shortcode
    shortcode_heading: '',
    shortcode_bg_style: 'none',
    shortcode_bg_color: '#f5f5f4',
    shortcode_image: 'default',
    shortcode_custom_image: '',
    shortcode_margin_top: '',
    shortcode_margin_bottom: ''
  })

  const { isValidating, apiValidation, initValidation, validateApiKey } = useApiValidation(settings)

  const siteDomain = computed(() => {
    try {
      return new URL(settings.siteUrl || window.location.origin).hostname
    } catch {
      return window.location.hostname
    }
  })

  async function loadSettings() {
    try {
      const data = await loadFn(settings)
      if (data && typeof data === 'object') {
        Object.assign(state, data)
        initValidation(data.google_maps_api_key)
      }
      
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
          initValidation(data.googleMapsApiKey)
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
      const currentKey = state.google_maps_api_key.trim()
      if (currentKey && currentKey !== apiValidation.lastValidatedKey) {
        await validateApiKey(currentKey)
      }
      
      const response = await wpAjax('proleadsai_proxy_save_settings', {
        name: state.business,
        googleMapsApiKey: state.google_maps_api_key,
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
        button_emoji: state.button_emoji
      }, settings)
      
      success.value = 'Floating button settings saved!'
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
        shortcode_margin_bottom: state.shortcode_margin_bottom
      }, settings)
      
      success.value = 'Shortcode settings saved!'
      setTimeout(() => { success.value = '' }, 3000)
    } catch (e) {
      error.value = e.message || 'Failed to save shortcode settings'
    } finally {
      isSaving.value = false
    }
  }

  function openMediaLibrary() {
    if (window.wp && window.wp.media) {
      const mediaFrame = window.wp.media({
        title: 'Select Hero Image',
        button: { text: 'Use this image' },
        multiple: false
      })
      
      mediaFrame.on('select', () => {
        const attachment = mediaFrame.state().get('selection').first().toJSON()
        state.shortcode_custom_image = attachment.url
      })
      
      mediaFrame.open()
    } else {
      const url = prompt('Enter image URL:')
      if (url) state.shortcode_custom_image = url
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
    // State
    state,
    showReauthModal,
    isSaving,
    error,
    success,
    showApiKeyHelp,
    isValidating,
    apiValidation,
    siteDomain,
    // Actions
    loadSettings,
    saveBusinessSettings,
    saveAppearance,
    saveShortcodeSettings,
    openMediaLibrary,
    handleReauthSuccess,
    goToDashboard
  }
}

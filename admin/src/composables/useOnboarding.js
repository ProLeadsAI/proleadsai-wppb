import { ref, reactive, computed, watch } from 'vue'
import { BASE_URL } from '@/lib/api'
import { wpAjax, saveState as saveFn, loadState as loadFn } from '@/lib/wpAjax'

export function useOnboarding(settings, emit) {
  // State
  const steps = ['Welcome', 'Email Verification', 'Business Info', 'Google Maps API', 'Google Solar API', 'Theme & Pricing']
  const currentStep = ref(0)
  const isLoading = ref(false)
  const error = ref('')
  const codeSent = ref(false)
  const isChangingEmail = ref(false)
  const cooldown = ref(0)
  const showApiFixModal = ref(null)

  // Maps API validation state (Step 3)
  const mapsValidation = reactive({
    checked: false,
    valid: false,
    lastValidatedKey: '',
    mapsJs: { valid: false, message: '' },
    placesApi: { valid: false, message: '' }
  })

  // Solar API validation state (Step 4)
  const solarValidation = reactive({
    checked: false,
    valid: false,
    lastValidatedKey: '',
    message: ''
  })

  const state = reactive({
    email: '',
    email_verified: false,
    user_id: '',
    auth_token: '',
    team_id: '',
    code: '',
    business: '',
    google_maps_api_key: '',
    google_solar_api_key: '',
    primary_color: '#ffd400',
    text_color: '#1d1616',
    button_position: 'bottom-center',
    price_per_sq: '750',
    timezone: 'America/New_York'
  })

  // Computed
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

  const canProceed = computed(() => {
    if (currentStep.value === 0) return true
    if (currentStep.value === 1) return state.email_verified
    if (currentStep.value === 2) return state.business.trim().length > 0
    if (currentStep.value === 3) {
      const key = state.google_maps_api_key.trim()
      if (!key) return false
      if (!mapsValidation.checked) return false
      if (mapsValidation.lastValidatedKey !== key) return false
      return mapsValidation.valid
    }
    if (currentStep.value === 4) {
      const key = state.google_solar_api_key.trim()
      if (!key) return false
      if (!solarValidation.checked) return false
      if (solarValidation.lastValidatedKey !== key) return false
      return solarValidation.valid
    }
    return true
  })

  watch(() => state.google_maps_api_key, (val) => {
    const key = (val || '').trim()
    if (!key || key !== mapsValidation.lastValidatedKey) {
      mapsValidation.checked = false
      mapsValidation.valid = false
      mapsValidation.mapsJs = { valid: false, message: '' }
      mapsValidation.placesApi = { valid: false, message: '' }
    }
  })

  watch(() => state.google_solar_api_key, (val) => {
    const key = (val || '').trim()
    if (!key || key !== solarValidation.lastValidatedKey) {
      solarValidation.checked = false
      solarValidation.valid = false
      solarValidation.message = ''
    }
  })

  // Handle Maps validation result from StepGoogleMaps component
  function handleMapsValidationComplete(result) {
    mapsValidation.checked = true
    mapsValidation.valid = result.valid
    mapsValidation.lastValidatedKey = state.google_maps_api_key.trim()
    mapsValidation.mapsJs = result.mapsJs || { valid: false, message: '' }
    mapsValidation.placesApi = result.placesApi || { valid: false, message: '' }
  }

  // Handle Solar validation result from StepGoogleSolar component
  function handleSolarValidationComplete(result) {
    solarValidation.checked = true
    solarValidation.valid = result.valid
    solarValidation.lastValidatedKey = state.google_solar_api_key.trim()
    solarValidation.message = result.message || ''
  }

  // Helpers
  const ajax = (action, data = {}) => wpAjax(action, data, settings)
  const saveState = (data) => saveFn(data, settings).catch(e => console.error('Failed to save state:', e))

  // Actions
  async function loadState() {
    try {
      const data = await loadFn(settings)
      if (data && typeof data === 'object') {
        Object.assign(state, data)
        
        if (data.google_maps_api_key) {
          mapsValidation.lastValidatedKey = data.google_maps_api_key
          mapsValidation.checked = true
          mapsValidation.valid = true
          mapsValidation.mapsJs = { valid: true, message: '' }
          mapsValidation.placesApi = { valid: true, message: '' }
        }
        
        if (data.google_solar_api_key) {
          solarValidation.lastValidatedKey = data.google_solar_api_key
          solarValidation.checked = true
          solarValidation.valid = true
          solarValidation.message = ''
        }
        
        if (data.completed) {
          emit('complete')
          return
        }
        
        if (data.auth_token && data.team_id) {
          currentStep.value = data.google_solar_api_key
            ? 5
            : data.google_maps_api_key
              ? 4
              : data.business
                ? 3
                : 2
        } else if (data.email_verified && data.user_id) {
          currentStep.value = 2
        }
      }
    } catch (e) {
      console.error('Failed to load state:', e)
    }
  }

  function handleChangeEmail() {
    isChangingEmail.value = true
    codeSent.value = false
    state.code = ''
  }

  async function sendVerificationCode() {
    error.value = ''
    isLoading.value = true
    cooldown.value = 60
    
    const timer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) clearInterval(timer)
    }, 1000)

    try {
      const data = await ajax('proleadsai_send_verification_email', { email: state.email })
      if (!data.success) throw new Error(data.data?.message || 'Failed to send verification email')
      codeSent.value = true
    } catch (e) {
      error.value = e.message
      cooldown.value = 0
    } finally {
      isLoading.value = false
    }
  }

  async function verifyCode() {
    error.value = ''
    isLoading.value = true

    try {
      const data = await ajax('proleadsai_verify_otp', { email: state.email, code: state.code })
      if (!data.success) throw new Error(data.data?.message || 'Invalid verification code')
      
      state.email_verified = true
      state.user_id = data.data.user?.id || ''
      isChangingEmail.value = false
      codeSent.value = false
      
      await saveState({ email: state.email, email_verified: true, user_id: state.user_id })
      await fetchExistingOrg()
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchExistingOrg() {
    if (!state.user_id) return
    
    try {
      const data = await ajax('proleadsai_get_user_org', { userId: state.user_id })
      if (data.success && data.data?.found && data.data?.organization) {
        const org = data.data.organization
        state.business = org.name || ''
        state.team_id = org.id || ''
        if (org.googleMapsApiKey) state.google_maps_api_key = org.googleMapsApiKey
        if (org.googleSolarApiKey) state.google_solar_api_key = org.googleSolarApiKey
        if (org.pricePerSq) state.price_per_sq = org.pricePerSq.toString()
        if (org.timezone) state.timezone = org.timezone
        
        await saveState({
          business: state.business,
          team_id: state.team_id,
          google_maps_api_key: state.google_maps_api_key,
          google_solar_api_key: state.google_solar_api_key,
          price_per_sq: state.price_per_sq,
          timezone: state.timezone
        })
      }
    } catch (e) {
      console.error('Failed to fetch existing org:', e)
    }
  }

  async function nextStep() {
    if (currentStep.value === steps.length - 1) {
      await saveState({
        business: state.business,
        google_maps_api_key: state.google_maps_api_key,
        google_solar_api_key: state.google_solar_api_key,
        primary_color: state.primary_color,
        text_color: state.text_color,
        button_position: state.button_position,
        price_per_sq: state.price_per_sq,
        timezone: state.timezone
      })
      
      if (state.user_id) {
        try {
          await ajax('proleadsai_update_settings', {
            userId: state.user_id,
            businessName: state.business,
            pricePerSq: parseInt(state.price_per_sq, 10) || 750,
            timezone: state.timezone
          })
        } catch (e) {
          console.error('Failed to save settings:', e)
        }
      }
      
      await saveState({ completed: true })
      window.location.href = `${settings.adminUrl}admin.php?page=proleadsai-dashboard`
      return
    }
    
    if (currentStep.value === 2) {
      try {
        const data = await ajax('proleadsai_create_business', {
          userId: state.user_id,
          businessName: state.business
        })
        if (data.success && data.data) {
          state.auth_token = data.data.apiKey || ''
          state.team_id = data.data.team?.id || ''
          await saveState({
            business: state.business,
            auth_token: state.auth_token,
            team_id: state.team_id
          })
        }
      } catch (e) {
        console.error('Failed to create business:', e)
      }
    } else if (currentStep.value === 3) {
      if (!canProceed.value) {
        error.value = 'Please validate your Google Maps API key before continuing'
        return
      }
      
      await saveState({ google_maps_api_key: state.google_maps_api_key })
      if (state.user_id && state.google_maps_api_key) {
        try {
          await ajax('proleadsai_update_settings', {
            userId: state.user_id,
            googleMapsApiKey: state.google_maps_api_key
          })
        } catch (e) {
          console.error('Failed to save Google Maps API key:', e)
        }
      }
    } else if (currentStep.value === 4) {
      if (!canProceed.value) {
        error.value = 'Please validate your Google Solar API key before continuing'
        return
      }
      
      await saveState({ google_solar_api_key: state.google_solar_api_key })
      if (state.user_id && state.google_solar_api_key) {
        try {
          await ajax('proleadsai_update_settings', {
            userId: state.user_id,
            googleSolarApiKey: state.google_solar_api_key
          })
        } catch (e) {
          console.error('Failed to save Google Solar API key:', e)
        }
      }
    }
    
    currentStep.value++
  }

  function prevStep() {
    if (currentStep.value > 0) currentStep.value--
  }

  return {
    // State
    steps,
    currentStep,
    state,
    error,
    isLoading,
    codeSent,
    isChangingEmail,
    cooldown,
    showApiFixModal,
    // Computed
    apiDomain,
    siteDomain,
    canProceed,
    // Actions
    loadState,
    handleChangeEmail,
    sendVerificationCode,
    verifyCode,
    handleMapsValidationComplete,
    handleSolarValidationComplete,
    nextStep,
    prevStep
  }
}

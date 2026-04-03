import { ref, reactive, computed } from 'vue'
import { wpAjax, saveState as saveFn, loadState as loadFn } from '@/lib/wpAjax'

export function useOnboarding(settings, emit) {
  // State
  const steps = ['Welcome', 'Email Verification', 'Business Info', 'Theme & Pricing']
  const currentStep = ref(0)
  const isLoading = ref(false)
  const error = ref('')
  const codeSent = ref(false)
  const isChangingEmail = ref(false)
  const cooldown = ref(0)
  const availableOrganizations = ref([])
  const requiresOrganizationSelection = ref(false)

  const state = reactive({
    email: '',
    email_verified: false,
    user_id: '',
    auth_token: '',
    team_id: '',
    selected_org_id: '',
    code: '',
    business: '',
    primary_color: '#ffd400',
    text_color: '#1d1616',
    button_position: 'bottom-center',
    price_per_sq: '750',
    timezone: 'America/New_York'
  })

  // Computed
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
    if (currentStep.value === 2) {
      if (availableOrganizations.value.length > 0) {
        return state.selected_org_id.trim().length > 0
      }
      return state.business.trim().length > 0
    }
    return true
  })

  // Helpers
  const ajax = (action, data = {}) => wpAjax(action, data, settings)
  const saveState = (data) => saveFn(data, settings).catch(e => console.error('Failed to save state:', e))

  // Actions
  async function loadState() {
    try {
      const data = await loadFn(settings)
      if (data && typeof data === 'object') {
        Object.assign(state, data)
        
        if (data.completed) {
          emit('complete')
          return
        }
        
        if (data.auth_token && data.team_id) {
          currentStep.value = data.business ? 3 : 2
        } else if (data.email_verified && data.user_id) {
          await fetchAvailableOrganizations()
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
      await fetchAvailableOrganizations()

      if (state.auth_token && state.team_id) {
        currentStep.value = 3
      } else {
        currentStep.value = 2
      }
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  function applySelectedOrganization(org) {
    if (!org) return

    state.selected_org_id = org.id || ''
    state.business = org.name || ''
    if (org.pricePerSq) state.price_per_sq = org.pricePerSq.toString()
    if (org.timezone) state.timezone = org.timezone
  }

  async function connectExistingOrganization(organizationId) {
    const org = availableOrganizations.value.find(item => item.id === organizationId)
    if (org) applySelectedOrganization(org)

    const data = await ajax('proleadsai_create_business', {
      userId: state.user_id,
      organizationId,
      businessName: org?.name || state.business
    })

    if (!data.success) {
      throw new Error(data.data?.message || 'Failed to connect organization')
    }

    state.auth_token = data.data.apiKey || ''
    state.team_id = data.data.team?.id || organizationId
    state.business = data.data.team?.name || state.business

    await saveState({
      selected_org_id: state.selected_org_id,
      business: state.business,
      auth_token: state.auth_token,
      team_id: state.team_id,
      price_per_sq: state.price_per_sq,
      timezone: state.timezone
    })
  }

  async function fetchAvailableOrganizations() {
    if (!state.user_id) return
    
    try {
      const data = await ajax('proleadsai_get_user_org', { userId: state.user_id, siteUrl: settings.siteUrl })
      if (!data.success) return

      availableOrganizations.value = data.data?.organizations || []
      requiresOrganizationSelection.value = !!data.data?.requiresSelection

      if (data.data?.autoConnectOrganization?.id) {
        await connectExistingOrganization(data.data.autoConnectOrganization.id)
        return
      }

      if (state.selected_org_id) {
        const persistedOrg = availableOrganizations.value.find(org => org.id === state.selected_org_id)
        if (persistedOrg) {
          applySelectedOrganization(persistedOrg)
          return
        }
      }

      if (availableOrganizations.value.length === 1) {
        applySelectedOrganization(availableOrganizations.value[0])
      }
    } catch (e) {
      console.error('Failed to fetch available organizations:', e)
    }
  }

  async function nextStep() {
    if (currentStep.value === steps.length - 1) {
      await saveState({
        business: state.business,
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
            organizationId: state.team_id,
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

    if (currentStep.value === 1) {
      currentStep.value = state.auth_token && state.team_id ? 3 : 2
      return
    }
    
    if (currentStep.value === 2) {
      try {
        if (state.selected_org_id) {
          await connectExistingOrganization(state.selected_org_id)
        } else {
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
        }
      } catch (e) {
        console.error('Failed to create business:', e)
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
    availableOrganizations,
    requiresOrganizationSelection,
    // Computed
    siteDomain,
    canProceed,
    // Actions
    loadState,
    handleChangeEmail,
    sendVerificationCode,
    verifyCode,
    applySelectedOrganization,
    nextStep,
    prevStep
  }
}

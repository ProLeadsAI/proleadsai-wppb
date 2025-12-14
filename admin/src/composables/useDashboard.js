import { ref, reactive } from 'vue'
import { wpAjax, loadState as loadFn, saveState as saveFn } from '@/lib/wpAjax'
import { useAuth } from './useAuth'

export function useDashboard(settings) {
  const { showReauthModal, handleAuthError, checkAuthToken, handleReauthSuccess: baseHandleReauthSuccess } = useAuth(settings)
  
  const isLoading = ref(false)
  const isLoadingData = ref(false)
  const dateRange = ref(null)

  const state = reactive({
    email: '',
    user_id: '',
    business: '',
    slug: '',
    google_maps_api_key: '',
    price_per_sq: '750',
    timezone: 'America/New_York',
    team_id: '',
    auth_token: '',
    isPro: false,
    plan: 'free',
    subscriptionStatus: null
  })

  const stats = reactive({
    totalSearches: 0,
    uniqueUsers: 0,
    leads: 0,
    avgEstimate: 0
  })

  const recentSearches = ref([])

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  function getDateRangeParams() {
    if (!dateRange.value?.start || !dateRange.value?.end) return ''
    
    const start = new Date(
      dateRange.value.start.year,
      dateRange.value.start.month - 1,
      dateRange.value.start.day
    ).toISOString()
    
    const end = new Date(
      dateRange.value.end.year,
      dateRange.value.end.month - 1,
      dateRange.value.end.day,
      23, 59, 59
    ).toISOString()
    
    return `&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`
  }

  async function loadDashboard() {
    console.log('[Dashboard] loadDashboard')
    isLoading.value = true
    
    try {
      const data = await loadFn(settings)
      console.log('[Dashboard] Loaded WordPress state:', data)
      if (data && typeof data === 'object') {
        Object.assign(state, data)
      }
      
      console.log('[Dashboard] auth_token:', state.auth_token ? '***' + state.auth_token.slice(-8) : 'MISSING')
      
      if (checkAuthToken(state.auth_token)) {
        isLoading.value = false
        return
      }
      
      console.log('[Dashboard] Has auth_token, fetching from API...')
      await fetchSettingsFromApi()
      await fetchDashboardData()
    } catch (e) {
      console.error('[Dashboard] Failed to load state:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSettingsFromApi() {
    console.log('[Dashboard] fetchSettingsFromApi')
    try {
      const response = await wpAjax('proleadsai_proxy_get_settings', {}, settings)
      console.log('[Dashboard] Settings response:', response)
      
      // Check for auth errors
      if (handleAuthError(response)) {
        return
      }
      
      if (response.success && response.data) {
        const data = response.data
        if (data.name) state.business = data.name
        if (data.slug) state.slug = data.slug
        if (data.email) state.email = data.email
        if (data.googleMapsApiKey !== undefined) state.google_maps_api_key = data.googleMapsApiKey || ''
        if (data.pricePerSq !== undefined) state.price_per_sq = data.pricePerSq.toString()
        if (data.timezone) state.timezone = data.timezone
        if (data.id) state.team_id = data.id
        // Subscription info
        state.isPro = !!data.isPro
        state.plan = data.plan || 'free'
        state.subscriptionStatus = data.subscriptionStatus || null
      } else {
        console.error('[Dashboard] Settings fetch failed:', response.data?.message)
      }
    } catch (e) {
      console.error('[Dashboard] Failed to fetch settings:', e)
    }
  }

  async function fetchDashboardData() {
    console.log('[Dashboard] fetchDashboardData')
    isLoadingData.value = true
    
    try {
      const dateParams = getDateRangeParams()
      const response = await wpAjax(`proleadsai_proxy_get_dashboard${dateParams}`, {}, settings)
      console.log('[Dashboard] Dashboard response:', response)
      
      if (response.success && response.data) {
        const data = response.data
        
        stats.totalSearches = data.totalSearches || 0
        stats.leads = data.leads || 0
        stats.uniqueUsers = data.uniqueUsers || 0
        stats.avgEstimate = data.avgEstimate || 0
        
        recentSearches.value = (data.recentSearches || []).map(a => ({
          id: a.id,
          type: a.type || 'search',
          address: `${a.streetAddress || ''}, ${a.addressLocality || ''}, ${a.addressRegion || ''}`.replace(/^, |, $/g, ''),
          roofSqFt: a.roofAreaSqFt,
          estimate: a.estimate,
          name: a.name,
          email: a.email,
          phone: a.phone,
          leadId: a.leadId,
          userId: a.userId,
          createdAt: a.createdAt,
          convertedToLead: a.convertedToLead || false
        }))
      } else {
        console.error('[Dashboard] Dashboard fetch failed:', response.data?.message)
        // Check for auth errors
        handleAuthError(response)
      }
    } catch (e) {
      console.error('[Dashboard] Failed to fetch dashboard data:', e)
    } finally {
      isLoadingData.value = false
    }
  }

  async function applyDateRange() {
    if (state.team_id && state.auth_token) {
      await fetchDashboardData()
    }
  }

  async function handleReauthSuccess(credentials) {
    await baseHandleReauthSuccess(credentials, state)
    await fetchSettingsFromApi()
    await fetchDashboardData()
  }

  async function clearAuthToken() {
    if (!confirm('Clear auth token? You will need to re-authenticate.')) return
    
    await saveFn({ auth_token: '' }, settings)
    window.location.reload()
  }

  async function resetData() {
    if (!confirm('Are you sure you want to reset all plugin data? This cannot be undone.')) return
    
    await wpAjax('proleadsai_reset_data', {}, settings)
    window.location.href = `${settings.adminUrl}admin.php?page=proleadsai-onboarding`
  }

  function goToSettings() {
    window.location.href = `${settings.adminUrl}admin.php?page=proleadsai-settings`
  }

  return {
    // State
    isLoading,
    isLoadingData,
    showReauthModal,
    dateRange,
    state,
    stats,
    recentSearches,
    // Actions
    loadDashboard,
    applyDateRange,
    handleReauthSuccess,
    clearAuthToken,
    resetData,
    goToSettings,
    formatDate
  }
}

import { ref } from 'vue'
import { saveState as saveFn } from '@/lib/wpAjax'

// Shared auth state (singleton pattern)
const showReauthModal = ref(false)
const authState = ref({
  email: '',
  user_id: '',
  auth_token: '',
  team_id: ''
})

/**
 * Shared auth composable for handling reauth modal and auth errors
 * Used by both Dashboard and Settings pages
 */
export function useAuth(settings) {
  /**
   * Check if an API response indicates an auth error
   * @param {Object} response - The API response object
   * @returns {boolean} - True if auth error detected
   */
  function isAuthError(response) {
    if (response?.success) return false
    
    const msg = (response?.data?.message || '').toLowerCase()
    return msg.includes('invalid api key') || 
           msg.includes('unauthorized') || 
           msg.includes('401')
  }

  /**
   * Handle auth error by showing reauth modal
   * @param {Object} response - The API response object
   * @returns {boolean} - True if auth error was handled
   */
  function handleAuthError(response) {
    if (isAuthError(response)) {
      console.log('[Auth] Auth error detected, showing reauth modal')
      showReauthModal.value = true
      return true
    }
    return false
  }

  /**
   * Check if auth token is missing and show modal if so
   * @param {string} authToken - The auth token to check
   * @returns {boolean} - True if token is missing
   */
  function checkAuthToken(authToken) {
    if (!authToken) {
      console.log('[Auth] No auth_token, showing reauth modal')
      showReauthModal.value = true
      return true
    }
    return false
  }

  /**
   * Handle successful reauth - save new credentials
   * @param {Object} credentials - { userId, authToken, teamId }
   * @param {Object} state - The reactive state object to update
   * @returns {Promise<void>}
   */
  async function handleReauthSuccess({ userId, authToken, teamId }, state) {
    console.log('[Auth] Reauth success, saving credentials...')
    
    // Update local state
    if (state) {
      state.user_id = userId
      state.auth_token = authToken
      if (teamId) state.team_id = teamId
    }
    
    // Update shared auth state
    authState.value.user_id = userId
    authState.value.auth_token = authToken
    if (teamId) authState.value.team_id = teamId
    
    // Save to WordPress
    await saveFn({
      user_id: userId,
      auth_token: authToken,
      team_id: teamId || state?.team_id || ''
    }, settings)
    
    // Close modal
    showReauthModal.value = false
  }

  /**
   * Close the reauth modal
   */
  function closeReauthModal() {
    showReauthModal.value = false
  }

  return {
    showReauthModal,
    authState,
    isAuthError,
    handleAuthError,
    checkAuthToken,
    handleReauthSuccess,
    closeReauthModal
  }
}

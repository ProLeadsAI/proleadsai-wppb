/**
 * Get nonce from WordPress settings
 */
function getNonce() {
  return window.proleadsaiSettings?.nonce || window.proleadsai_settings?.nonce || ''
}

/**
 * WordPress AJAX helper
 * @param {string} action - WordPress AJAX action name
 * @param {Object} data - Data to send
 * @param {Object} settings - Optional settings object with adminAjax URL
 * @returns {Promise<Object>} Response data
 */
export async function wpAjax(action, data = {}, settings = null) {
  const adminAjax = settings?.adminAjax || window.proleadsaiSettings?.adminAjax || window.proleadsai_settings?.adminAjax || '/wp-admin/admin-ajax.php'
  const nonce = getNonce()
  
  const res = await fetch(`${adminAjax}?action=${action}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce
    },
    body: JSON.stringify(data)
  })
  return res.json()
}

/**
 * WordPress AJAX GET helper
 * @param {string} action - WordPress AJAX action name
 * @param {Object} params - Optional query parameters
 * @param {Object} settings - Optional settings object with adminAjax URL
 * @returns {Promise<Object>} Response data
 */
export async function wpAjaxGet(action, params = {}, settings = null) {
  const adminAjax = settings?.adminAjax || window.proleadsaiSettings?.adminAjax || window.proleadsai_settings?.adminAjax || '/wp-admin/admin-ajax.php'
  const nonce = getNonce()
  
  const queryParams = new URLSearchParams({ action, ...params })
  const res = await fetch(`${adminAjax}?${queryParams}`, {
    headers: {
      'X-WP-Nonce': nonce
    }
  })
  return res.json()
}

/**
 * Save onboarding/settings state to WordPress
 */
export async function saveState(data, settings = null) {
  return wpAjax('proleadsai_onboarding_save', data, settings)
}

/**
 * Load onboarding/settings state from WordPress
 */
export async function loadState(settings = null) {
  return wpAjaxGet('proleadsai_onboarding_get', {}, settings)
}

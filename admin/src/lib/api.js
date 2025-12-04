/**
 * API helper for ProLeadsAI WordPress plugin
 * Uses VITE_API_MODE env var to determine which API to use
 */

// Production API URL
const PROD_API_URL = 'https://next.proleadsai.com/api'

// Dev API URL - for local development
const DEV_API_URL = 'http://0.0.0.0:3000/api'

// API mode set at build time via VITE_API_MODE env var
const API_MODE = import.meta.env.VITE_API_MODE || 'prod'

// Enable logging
const DEBUG = true

function log(...args) {
  if (DEBUG) console.log('[ProLeadsAI API]', ...args)
}

/**
 * Check if we're in dev mode (set at build time)
 */
function isDevMode() {
  return API_MODE === 'dev'
}

/**
 * Get the API base URL based on build mode
 */
function getApiUrl() {
  const url = isDevMode() ? DEV_API_URL : PROD_API_URL
  log('getApiUrl:', url, 'API_MODE:', API_MODE)
  return url
}

/**
 * Make an API request - calls Better Auth API directly
 */
export async function apiRequest(endpoint, options = {}, settings = {}) {
  const baseUrl = getApiUrl()
  const url = `${baseUrl}${endpoint}`
  
  log('apiRequest:', endpoint, options.body ? JSON.stringify(options.body) : '(no body)')
  log('Fetching:', url)
  
  const res = await fetch(url, {
    method: options.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  
  const data = await res.json()
  log('Response:', res.status, data)
  
  if (!res.ok) {
    // Extract the most useful error message
    const errorMessage = data.message || data.error || data.statusMessage || `API error: ${res.status}`
    log('Error:', errorMessage)
    throw new Error(errorMessage)
  }
  
  // Wrap in WordPress-style response format
  return { success: true, data }
}

export { isDevMode, getApiUrl, DEV_API_URL, PROD_API_URL }

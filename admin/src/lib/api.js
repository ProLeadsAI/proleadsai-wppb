/**
 * API helper for ProLeadsAI WordPress plugin
 * Uses VITE_BASE_URL and VITE_API_MODE env vars set at build time
 * 
 * Build for dev:  pnpm build:dev  (uses .env.development)
 * Build for prod: pnpm build      (uses .env.production)
 */

// Base URL set at build time via .env files (without /api suffix)
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://app.proleadsai.com'
const API_URL = `${BASE_URL}/api`
const API_MODE = import.meta.env.VITE_API_MODE || 'prod'

// Enable logging in dev mode
const DEBUG = API_MODE === 'dev'

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
 * Get the API base URL (set at build time)
 */
function getApiUrl() {
  log('API URL:', API_URL, 'Mode:', API_MODE)
  return API_URL
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

export { isDevMode, getApiUrl, BASE_URL, API_URL, API_MODE }

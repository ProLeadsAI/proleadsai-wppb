import { ref, reactive } from 'vue'

/**
 * Composable for validating Google Maps API key (client-side)
 * 
 * Tests:
 * - Maps JavaScript API
 * - Places API (New) / PlaceAutocompleteElement
 * 
 * Note: Solar API requires a separate key with "None" application restriction
 * and is validated separately in Step 4.
 */
export function useGoogleMapsValidation() {
  const isValidating = ref(false)
  
  const validation = reactive({
    checked: false,
    mapsJs: { valid: false, message: '' },
    placesApi: { valid: false, message: '' }
  })

  // Clean up any existing Google Maps script and global
  function cleanupGoogleMaps() {
    // Remove existing script tags
    const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
    scripts.forEach(s => s.remove())
    
    // Clear Google Maps global
    if (window.google?.maps) {
      try {
        delete window.google.maps
      } catch (e) {
        window.google.maps = undefined
      }
    }
    if (window.google && Object.keys(window.google).length === 0) {
      delete window.google
    }
  }

  /**
   * Validate API key (client-side only):
   * - Maps JavaScript API
   * - Places API (New)
   */
  async function validateApiKey(apiKey) {
    const key = apiKey?.trim()
    if (!key) {
      validation.checked = true
      validation.mapsJs = { valid: false, message: 'API key is required' }
      validation.placesApi = { valid: false, message: 'API key is required' }
      return { valid: false, mapsJs: validation.mapsJs, placesApi: validation.placesApi }
    }

    isValidating.value = true
    validation.checked = false
    validation.mapsJs = { valid: false, message: '' }
    validation.placesApi = { valid: false, message: '' }

    try {
      // Clean up any existing Google Maps instance
      cleanupGoogleMaps()

      // Step 1: Load Google Maps JavaScript API
      const mapsResult = await loadMapsJsApi(key)
      validation.mapsJs = mapsResult

      if (!mapsResult.valid) {
        validation.checked = true
        validation.placesApi = { valid: false, message: 'Cannot test - Maps JS API failed to load' }
        return { valid: false, mapsJs: validation.mapsJs, placesApi: validation.placesApi }
      }

      // Step 2: Test Places Autocomplete
      const placesResult = await testPlacesAutocomplete()
      validation.placesApi = placesResult

      validation.checked = true

      const allValid = validation.mapsJs.valid && validation.placesApi.valid
      return { valid: allValid, mapsJs: validation.mapsJs, placesApi: validation.placesApi }
    } catch (e) {
      validation.checked = true
      if (!validation.mapsJs.message) {
        validation.mapsJs = { valid: false, message: e.message || 'Validation failed' }
      }
      if (!validation.placesApi.message) {
        validation.placesApi = { valid: false, message: 'Cannot test - Maps JS API failed' }
      }
      return { valid: false, mapsJs: validation.mapsJs, placesApi: validation.placesApi }
    } finally {
      isValidating.value = false
    }
  }

  /**
   * Load Google Maps JavaScript API and check for errors
   */
  function loadMapsJsApi(apiKey) {
    return new Promise((resolve) => {
      let resolved = false
      const resolveOnce = (result) => {
        if (!resolved) {
          resolved = true
          window.removeEventListener('error', errorHandler)
          clearTimeout(timeout)
          resolve(result)
        }
      }

      // Listen for Google Maps errors (they appear as window errors)
      const errorHandler = (event) => {
        const msg = (event.message || '').toLowerCase()
        const src = (event.filename || '').toLowerCase()
        
        // Only handle Google Maps related errors
        if (src.includes('maps.googleapis.com') || msg.includes('google') || msg.includes('maps')) {
          if (msg.includes('invalidkey') || msg.includes('invalid key') || msg.includes('api key')) {
            resolveOnce({ valid: false, message: 'Invalid API key. Check your key in Google Cloud Console.' })
          } else if (msg.includes('referernotallowed') || msg.includes('referrer') || msg.includes('not allowed')) {
            resolveOnce({ valid: false, message: `Referrer not allowed. Add ${window.location.hostname}/* to your API key restrictions.` })
          } else if (msg.includes('apinotactivated') || msg.includes('not activated') || msg.includes('enable')) {
            resolveOnce({ valid: false, message: 'Maps JavaScript API is not enabled. Enable it in Google Cloud Console.' })
          } else if (msg.includes('overquota') || msg.includes('quota')) {
            resolveOnce({ valid: false, message: 'API quota exceeded. Check your billing in Google Cloud Console.' })
          }
        }
      }
      window.addEventListener('error', errorHandler)

      // Create and load the script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=__gmapsValidationCallback`
      script.async = true
      script.defer = true

      // Set up callback
      window.__gmapsValidationCallback = () => {
        delete window.__gmapsValidationCallback
        
        if (window.google?.maps) {
          resolveOnce({ valid: true, message: 'Maps JavaScript API loaded successfully' })
        } else {
          resolveOnce({ valid: false, message: 'Failed to initialize Google Maps' })
        }
      }

      script.onerror = (e) => {
        delete window.__gmapsValidationCallback
        resolveOnce({ valid: false, message: 'Failed to load Maps JavaScript API script. Check your API key.' })
      }

      // Timeout after 15 seconds
      const timeout = setTimeout(() => {
        if (!window.google?.maps) {
          resolveOnce({ valid: false, message: 'Timeout loading Maps JavaScript API' })
        }
      }, 15000)

      document.head.appendChild(script)
    })
  }

  /**
   * Test Places API by making an actual AutocompleteSuggestions request
   */
  async function testPlacesAutocomplete() {
    try {
      // Import the places library using Google's recommended method
      if (typeof window.google?.maps?.importLibrary === 'function') {
        try {
          await window.google.maps.importLibrary('places')
        } catch (e) {
          const msg = (e.message || '').toLowerCase()
          if (msg.includes('places') || msg.includes('not enabled') || msg.includes('api')) {
            return { valid: false, message: 'Places API (New) is not enabled. Enable it in Google Cloud Console.' }
          }
          return { valid: false, message: e.message || 'Failed to load Places library' }
        }
      }

      // Check if AutocompleteSuggestion is available (this is the new Places API)
      if (!window.google?.maps?.places?.AutocompleteSuggestion) {
        return { valid: false, message: 'Places API (New) is not enabled. Enable "Places API (New)" in Google Cloud Console.' }
      }

      // Make an actual autocomplete request to test the API
      try {
        const request = {
          input: '1600 Amphitheatre',
          locationBias: {
            center: { lat: 37.4220, lng: -122.0841 },
            radius: 50000
          }
        }

        const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
        
        // If we got here without error, the API is working
        if (suggestions && suggestions.length > 0) {
          return { valid: true, message: 'Places API (New) working correctly' }
        } else {
          // No suggestions but no error - API is still working
          return { valid: true, message: 'Places API (New) responding' }
        }
      } catch (e) {
        const msg = (e.message || '').toLowerCase()
        
        // Check for specific error messages
        if (msg.includes('blocked') || msg.includes('403')) {
          return { valid: false, message: 'Places API (New) requests are blocked. Check API restrictions in Google Cloud Console.' }
        }
        if (msg.includes('not enabled') || msg.includes('enable')) {
          return { valid: false, message: 'Places API (New) is not enabled. Enable it in Google Cloud Console.' }
        }
        if (msg.includes('referer') || msg.includes('referrer')) {
          return { valid: false, message: `Places API referrer not allowed. Add ${window.location.hostname}/* to your API key restrictions.` }
        }
        if (msg.includes('api key') || msg.includes('invalid key')) {
          return { valid: false, message: 'Invalid API key for Places API' }
        }
        
        return { valid: false, message: e.message || 'Places API request failed' }
      }
    } catch (e) {
      const msg = (e.message || '').toLowerCase()
      if (msg.includes('places') || msg.includes('not enabled')) {
        return { valid: false, message: 'Places API (New) is not enabled. Enable it in Google Cloud Console.' }
      }
      return { valid: false, message: e.message || 'Failed to test Places API' }
    }
  }

  function reset() {
    validation.checked = false
    validation.mapsJs = { valid: false, message: '' }
    validation.placesApi = { valid: false, message: '' }
  }

  return {
    isValidating,
    validation,
    validateApiKey,
    reset
  }
}

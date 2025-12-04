<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p class="text-muted-foreground mt-1">Manage your business settings</p>
      </div>
      <Button variant="outline" @click="goToDashboard">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
    </div>

    <Alert v-if="error" variant="destructive">
      {{ error }}
    </Alert>
    
    <Alert v-if="success" variant="success">
      {{ success }}
    </Alert>

    <!-- Business Settings -->
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div class="space-y-2">
            <Label>Company Name</Label>
            <Input v-model="state.business" placeholder="Your Company Name" />
          </div>

          <div class="space-y-2">
            <Label>Email</Label>
            <Input 
              v-model="state.email" 
              type="email" 
              disabled 
              class="bg-gray-100"
            />
            <p class="text-sm text-muted-foreground">Email cannot be changed from this page.</p>
          </div>

          <div class="space-y-2">
            <Label>Price per Square Foot ($)</Label>
            <Input 
              v-model="state.price_per_sq" 
              type="number"
              placeholder="750"
            />
          </div>

          <div class="space-y-2">
            <Label>Timezone</Label>
            <Select v-model="state.timezone">
              <option value="">Select timezone...</option>
              <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                {{ tz.label }}
              </option>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Google Maps API Key</Label>
            <Input 
              v-model="state.google_maps_api_key" 
              :placeholder="`AIzaSy... (allow ${siteDomain})`"
            />
            <p class="text-sm text-muted-foreground">
              <Button variant="link" class="p-0 h-auto text-primary" @click="showApiKeyHelp = true">
                Learn how to get an API key
              </Button>
            </p>
            
            <!-- API Validation Results -->
            <div v-if="apiValidation.checked" class="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-3">
              <p class="text-sm font-medium mb-3">API Key Validation</p>
              <div class="flex items-center gap-2">
                <div :class="apiValidation.places.valid ? 'text-green-600' : 'text-red-600'">
                  <CheckCircle v-if="apiValidation.places.valid" class="w-5 h-5" />
                  <XCircle v-else class="w-5 h-5" />
                </div>
                <span class="text-sm">Places API (Autocomplete)</span>
              </div>
              <p v-if="!apiValidation.places.valid && apiValidation.places.message" class="text-xs text-red-600 ml-7">
                {{ apiValidation.places.message }}
              </p>
              <div class="flex items-center gap-2">
                <div :class="apiValidation.solar.valid ? 'text-green-600' : 'text-red-600'">
                  <CheckCircle v-if="apiValidation.solar.valid" class="w-5 h-5" />
                  <XCircle v-else class="w-5 h-5" />
                </div>
                <span class="text-sm">Solar API (Roof Estimates)</span>
              </div>
              <p v-if="!apiValidation.solar.valid && apiValidation.solar.message" class="text-xs text-red-600 ml-7">
                {{ apiValidation.solar.message }}
              </p>
            </div>
            
            <div v-if="isValidating" class="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Loader2 class="w-4 h-4 animate-spin" />
              Validating API key...
            </div>
          </div>

          <Button type="submit" :disabled="isSaving || isValidating">
            <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
            {{ isSaving ? 'Saving...' : 'Update Business Settings' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Appearance Settings -->
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="saveAppearance" class="space-y-6">
          <div class="space-y-2">
            <Label>Primary Color</Label>
            <div class="flex gap-2">
              <input v-model="state.primary_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
              <Input v-model="state.primary_color" class="w-32" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Secondary Color</Label>
            <div class="flex gap-2">
              <input v-model="state.secondary_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
              <Input v-model="state.secondary_color" class="w-32" />
            </div>
          </div>

          <Button type="submit" :disabled="isSaving">
            <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
            {{ isSaving ? 'Saving...' : 'Save Appearance' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Display Settings -->
    <Card>
      <CardHeader>
        <CardTitle>Widget Display</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="saveDisplay" class="space-y-6">
          <div class="flex items-center justify-between">
            <Label>Show Floating Button</Label>
            <input 
              type="checkbox" 
              v-model="state.show_widget"
              class="w-5 h-5 cursor-pointer"
            />
          </div>

          <div class="space-y-2">
            <Label>Button Position</Label>
            <Select v-model="state.button_position">
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="left-edge">Left Edge</option>
              <option value="right-edge">Right Edge</option>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Shortcode</Label>
            <Input 
              :value="shortcode" 
              readonly 
              class="font-mono bg-gray-50"
              @click="$event.target.select()"
            />
            <p class="text-sm text-muted-foreground">Copy this shortcode to embed the widget on any page.</p>
          </div>

          <Button type="submit" :disabled="isSaving">
            <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
            {{ isSaving ? 'Saving...' : 'Save Display Settings' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Google Maps API Key Help Modal -->
    <div v-if="showApiKeyHelp" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showApiKeyHelp = false">
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">How to Get a Google Maps API Key</h3>
            <Button variant="ghost" size="sm" @click="showApiKeyHelp = false">✕</Button>
          </div>
          
          <div class="space-y-4 text-sm">
            <div class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <p class="font-medium text-amber-800 dark:text-amber-200">Important: Domain Restriction</p>
              <p class="text-amber-700 dark:text-amber-300 mt-1">
                Make sure to add <code class="bg-amber-100 dark:bg-amber-800 px-1 rounded">{{ siteDomain }}</code> to your API key's allowed domains.
              </p>
            </div>

            <ol class="list-decimal list-inside space-y-3">
              <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="text-primary hover:underline">Google Cloud Console</a></li>
              <li>Create a new project or select an existing one</li>
              <li>Enable the <strong>Maps JavaScript API</strong> and <strong>Geocoding API</strong></li>
              <li>Go to <strong>Credentials</strong> and click <strong>Create Credentials → API Key</strong></li>
              <li>Click on your new API key to configure it</li>
              <li>Under <strong>Application restrictions</strong>, select <strong>HTTP referrers</strong></li>
              <li>Add your domain: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">{{ siteDomain }}/*</code></li>
              <li>Under <strong>API restrictions</strong>, restrict to Maps JavaScript API and Geocoding API</li>
              <li>Click <strong>Save</strong> and copy your API key</li>
            </ol>

            <div class="pt-4 border-t">
              <Button class="w-full" @click="showApiKeyHelp = false">Got it</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Reauth Modal -->
    <ReauthModal 
      :show="showReauthModal"
      :initial-email="state.email"
      :user-id="state.user_id"
      :settings="settings"
      @close="showReauthModal = false"
      @success="handleReauthSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Alert, Select } from '@/components/ui'
import ReauthModal from '@/components/ReauthModal.vue'
import { getApiUrl } from '@/lib/api'

const props = defineProps({
  settings: { type: Object, default: () => ({}) }
})

const showReauthModal = ref(false)

const state = reactive({
  email: '',
  user_id: '',
  team_id: '',
  auth_token: '',
  business: '',
  google_maps_api_key: '',
  price_per_sq: '750',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  primary_color: '#1d4ed8',
  secondary_color: '#22c55e',
  button_position: 'bottom-center',
  show_widget: true
})

const isValidating = ref(false)
const apiValidation = reactive({
  checked: false,
  lastValidatedKey: '',
  originalKey: '', // Key loaded from server (to detect changes)
  places: { valid: false, message: '' },
  solar: { valid: false, message: '' }
})

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (EST)' },
  { value: 'America/Chicago', label: 'Central Time (CST)' },
  { value: 'America/Denver', label: 'Mountain Time (MST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
]

const isSaving = ref(false)
const error = ref('')
const success = ref('')
const showApiKeyHelp = ref(false)

const siteDomain = computed(() => {
  try {
    return new URL(props.settings.siteUrl || window.location.origin).hostname
  } catch {
    return window.location.hostname
  }
})

const shortcode = computed(() => {
  return `[proleadsai_widget position="${state.button_position}" display="${state.show_widget}"]`
})

onMounted(async () => {
  try {
    // Load local settings (for credentials and local-only settings)
    const res = await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_get`)
    const data = await res.json()
    if (data && typeof data === 'object') {
      Object.assign(state, data)
      
      // Track original API key to detect changes
      if (data.google_maps_api_key) {
        apiValidation.originalKey = data.google_maps_api_key
        apiValidation.lastValidatedKey = data.google_maps_api_key // Assume already validated
        apiValidation.checked = true
        apiValidation.places = { valid: true, message: '' }
        apiValidation.solar = { valid: true, message: '' }
      }
    }
    
    // If no auth_token, show reauth modal
    if (!state.auth_token) {
      showReauthModal.value = true
      return
    }
    
    // Fetch from Better Auth API as source of truth
    await fetchSettingsFromApi()
  } catch (e) {
    console.error('Failed to load state:', e)
  }
})

async function fetchSettingsFromApi() {
  try {
    const baseUrl = getApiUrl()
    const res = await fetch(`${baseUrl}/wordpress/settings`, {
      headers: {
        'x-api-key': state.auth_token,
        'Accept': 'application/json'
      }
    })
    
    if (res.ok) {
      const data = await res.json()
      // Update state with API values (source of truth)
      if (data.name) state.business = data.name
      if (data.googleMapsApiKey) {
        state.google_maps_api_key = data.googleMapsApiKey
        // Update original key tracking
        apiValidation.originalKey = data.googleMapsApiKey
        apiValidation.lastValidatedKey = data.googleMapsApiKey
        apiValidation.checked = true
        apiValidation.places = { valid: true, message: '' }
        apiValidation.solar = { valid: true, message: '' }
      }
      if (data.pricePerSq !== undefined) state.price_per_sq = data.pricePerSq.toString()
      if (data.timezone) state.timezone = data.timezone
      if (data.id) state.team_id = data.id
      
      // Sync back to WordPress
      await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: state.business,
          google_maps_api_key: state.google_maps_api_key,
          price_per_sq: state.price_per_sq,
          timezone: state.timezone,
          team_id: state.team_id
        })
      })
    }
  } catch (e) {
    console.error('Failed to fetch settings from API:', e)
  }
}

async function validateApiKey(force = false) {
  const key = state.google_maps_api_key.trim()
  
  if (!key) {
    apiValidation.checked = true
    apiValidation.lastValidatedKey = ''
    apiValidation.places = { valid: false, message: 'API key is required' }
    apiValidation.solar = { valid: false, message: 'API key is required' }
    return
  }
  
  // Skip validation if key hasn't changed and we already validated
  if (!force && apiValidation.checked && apiValidation.lastValidatedKey === key) {
    return
  }
  
  isValidating.value = true
  
  try {
    const res = await fetch(`${props.settings.adminAjax}?action=proleadsai_validate_api_key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    })
    
    const data = await res.json()
    
    if (data.success && data.data?.results) {
      apiValidation.checked = true
      apiValidation.lastValidatedKey = key
      apiValidation.places = data.data.results.placesApi
      apiValidation.solar = data.data.results.solarApi
    } else {
      apiValidation.checked = true
      apiValidation.lastValidatedKey = key
      apiValidation.places = { valid: false, message: data.data?.message || 'Validation failed' }
      apiValidation.solar = { valid: false, message: data.data?.message || 'Validation failed' }
    }
  } catch (e) {
    apiValidation.checked = true
    apiValidation.lastValidatedKey = key
    apiValidation.places = { valid: false, message: 'Failed to validate' }
    apiValidation.solar = { valid: false, message: 'Failed to validate' }
  } finally {
    isValidating.value = false
  }
}

async function saveSettings() {
  isSaving.value = true
  error.value = ''
  success.value = ''
  
  try {
    // Only validate API key if it changed
    const currentKey = state.google_maps_api_key.trim()
    if (currentKey && currentKey !== apiValidation.lastValidatedKey) {
      await validateApiKey()
    }
    
    // Save to Better Auth API first (source of truth)
    if (state.auth_token) {
      const baseUrl = getApiUrl()
      const res = await fetch(`${baseUrl}/wordpress/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': state.auth_token,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: state.business,
          googleMapsApiKey: state.google_maps_api_key,
          pricePerSq: parseInt(state.price_per_sq, 10) || 750,
          timezone: state.timezone
        })
      })
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to update settings on server')
      }
      
      // Only save to WordPress after API success
      await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: state.business,
          google_maps_api_key: state.google_maps_api_key,
          price_per_sq: state.price_per_sq,
          timezone: state.timezone
        })
      })
      
      success.value = 'Business settings updated successfully!'
      setTimeout(() => { success.value = '' }, 3000)
    } else {
      throw new Error('Not authenticated. Please complete onboarding first.')
    }
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
    await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primary_color: state.primary_color,
        secondary_color: state.secondary_color
      })
    })
    
    success.value = 'Appearance settings saved!'
    setTimeout(() => { success.value = '' }, 3000)
  } catch (e) {
    error.value = e.message || 'Failed to save appearance'
  } finally {
    isSaving.value = false
  }
}

async function saveDisplay() {
  isSaving.value = true
  error.value = ''
  success.value = ''
  
  try {
    await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        button_position: state.button_position,
        show_widget: state.show_widget
      })
    })
    
    success.value = 'Display settings saved!'
    setTimeout(() => { success.value = '' }, 3000)
  } catch (e) {
    error.value = e.message || 'Failed to save display settings'
  } finally {
    isSaving.value = false
  }
}

function goToDashboard() {
  window.location.href = `${props.settings.adminUrl}admin.php?page=proleadsai-dashboard`
}

async function handleReauthSuccess({ userId, authToken, teamId }) {
  state.user_id = userId
  state.auth_token = authToken
  if (teamId) state.team_id = teamId
  
  // Save to WordPress
  await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: state.user_id,
      auth_token: state.auth_token,
      team_id: state.team_id
    })
  })
  
  showReauthModal.value = false
  
  // Now fetch settings from API
  await fetchSettingsFromApi()
}
</script>

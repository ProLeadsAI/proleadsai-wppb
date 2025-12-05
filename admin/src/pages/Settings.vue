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

    <!-- Floating Button Appearance -->
    <Card>
      <CardHeader>
        <CardTitle>Floating Button</CardTitle>
        <p class="text-sm text-muted-foreground">Customize the floating button that appears on your site</p>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="saveAppearance" class="space-y-6">
          <div class="space-y-3">
            <Label>Visibility</Label>
            <div class="space-y-2">
              <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-primary bg-primary/5': state.show_widget }">
                <input type="radio" :value="true" v-model="state.show_widget" class="w-4 h-4 cursor-pointer" />
                <div>
                  <p class="font-medium">Show on all pages</p>
                  <p class="text-sm text-muted-foreground">Floating button appears on every page of your site</p>
                </div>
              </label>
              <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-primary bg-primary/5': !state.show_widget }">
                <input type="radio" :value="false" v-model="state.show_widget" class="w-4 h-4 cursor-pointer" />
                <div>
                  <p class="font-medium">Hide floating button</p>
                  <p class="text-sm text-muted-foreground">Use shortcode to embed widget on specific pages</p>
                </div>
              </label>
            </div>
          </div>

          <div v-if="state.show_widget" class="space-y-6 pt-4 border-t">
            <div class="space-y-2">
              <Label>Position</Label>
              <Select v-model="state.button_position">
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="left-edge">Left Edge (Vertical)</option>
                <option value="right-edge">Right Edge (Vertical)</option>
              </Select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label>Background Color</Label>
                <div class="flex gap-2">
                  <input v-model="state.primary_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                  <Input v-model="state.primary_color" class="w-32" />
                </div>
              </div>

              <div class="space-y-2">
                <Label>Text Color</Label>
                <div class="flex gap-2">
                  <input v-model="state.text_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                  <Input v-model="state.text_color" class="w-32" />
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label>Button Text</Label>
              <Input v-model="state.button_text" placeholder="Get Roof Estimate" />
            </div>

            <div class="space-y-2">
              <Label>Button Emoji</Label>
              <div class="flex gap-2 items-center">
                <Input v-model="state.button_emoji" class="w-20 text-center text-xl" maxlength="2" />
                <div class="flex gap-1">
                  <button type="button" @click="state.button_emoji = '🏠'" class="px-3 py-2 border rounded-md hover:bg-gray-100 text-xl cursor-pointer">🏠</button>
                  <button type="button" @click="state.button_emoji = '🏡'" class="px-3 py-2 border rounded-md hover:bg-gray-100 text-xl cursor-pointer">🏡</button>
                  <button type="button" @click="state.button_emoji = '⚡'" class="px-3 py-2 border rounded-md hover:bg-gray-100 text-xl cursor-pointer">⚡</button>
                  <button type="button" @click="state.button_emoji = '🔨'" class="px-3 py-2 border rounded-md hover:bg-gray-100 text-xl cursor-pointer">🔨</button>
                  <button type="button" @click="state.button_emoji = ''" class="px-3 py-2 border rounded-md hover:bg-gray-100 text-sm cursor-pointer">None</button>
                </div>
              </div>
            </div>

            <!-- Button Preview -->
            <div class="space-y-2">
              <Label>Preview</Label>
              <div class="p-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <div 
                  class="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-full shadow-lg"
                  :style="`background-color: ${state.primary_color}; color: ${state.text_color};`"
                >
                  <span v-if="state.button_emoji" class="text-lg">{{ state.button_emoji }}</span>
                  {{ state.button_text || 'Get Roof Estimate' }}
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" :disabled="isSaving">
            <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
            {{ isSaving ? 'Saving...' : 'Save Floating Button Settings' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Shortcode Embed Settings -->
    <Card>
      <CardHeader>
        <CardTitle>Shortcode Embed</CardTitle>
        <p class="text-sm text-muted-foreground">Embed the roof estimator widget on specific pages</p>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="saveShortcodeSettings" class="space-y-6">
          <div class="space-y-3 p-4 bg-gray-50 rounded-lg">
            <Label>Your Shortcode</Label>
            <Input 
              :value="shortcode" 
              readonly 
              class="font-mono bg-white text-sm"
              @click="$event.target.select()"
            />
            <div class="text-sm text-muted-foreground space-y-2">
              <p v-if="shortcode === '[proleadsai_widget]'">
                <strong>Default shortcode</strong> — will always use your saved settings below. Changes you make here will update all pages using this shortcode.
              </p>
              <div v-else>
                <p><strong>Custom shortcode</strong> — these parameters are locked in. This shortcode will always use these exact settings, even if you change the defaults below.</p>
                <p class="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded">
                  💡 <strong>Tip:</strong> You don't need to save these settings! Just configure the options, copy the shortcode, and use different versions on different pages (e.g., one image on homepage, another on contact page).
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Section Heading</Label>
            <Input v-model="state.shortcode_heading" placeholder="Get Your Free Roof Estimate" />
          </div>

          <div class="space-y-2">
            <Label>Background Style</Label>
            <Select v-model="state.shortcode_bg_style">
              <option value="none">No Background</option>
              <option value="light">Light Gray</option>
              <option value="dark">Dark</option>
              <option value="custom">Custom Color</option>
            </Select>
          </div>

          <div v-if="state.shortcode_bg_style === 'custom'" class="space-y-2">
            <Label>Custom Background Color</Label>
            <div class="flex gap-2">
              <input v-model="state.shortcode_bg_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
              <Input v-model="state.shortcode_bg_color" class="w-32" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Hero Image</Label>
            <Select v-model="state.shortcode_image">
              <option value="default">Default Roof Image</option>
              <option value="none">No Image</option>
              <option value="custom">Upload Custom Image</option>
            </Select>
            <p v-if="state.shortcode_image === 'custom'" class="text-xs text-muted-foreground">
              Recommended: <strong>1200px wide × 400px tall</strong> (or similar 3:1 aspect ratio). Image will be cropped to fit.
            </p>
          </div>

          <div v-if="state.shortcode_image === 'custom'" class="space-y-2">
            <Label>Custom Image</Label>
            <div class="flex gap-2">
              <Input v-model="state.shortcode_custom_image" placeholder="https://..." class="flex-1" />
              <Button type="button" variant="outline" @click="openMediaLibrary">
                Select Image
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">Choose from your Media Library or upload a new image</p>
            <div v-if="state.shortcode_custom_image" class="mt-2">
              <img :src="state.shortcode_custom_image" class="max-h-32 rounded-lg object-cover" alt="Preview" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Margin Top</Label>
              <Select v-model="marginTopPreset">
                <option value="">Default</option>
                <option value="0">None (0)</option>
                <option value="1rem">Small (1rem)</option>
                <option value="2rem">Medium (2rem)</option>
                <option value="4rem">Large (4rem)</option>
                <option value="6rem">Extra Large (6rem)</option>
                <option value="custom">Custom</option>
              </Select>
              <Input 
                v-if="marginTopPreset === 'custom'" 
                v-model="state.shortcode_margin_top" 
                placeholder="e.g. 50px, 3.5rem"
                class="mt-1"
              />
            </div>
            <div class="space-y-2">
              <Label>Margin Bottom</Label>
              <Select v-model="marginBottomPreset">
                <option value="">Default</option>
                <option value="0">None (0)</option>
                <option value="1rem">Small (1rem)</option>
                <option value="2rem">Medium (2rem)</option>
                <option value="4rem">Large (4rem)</option>
                <option value="6rem">Extra Large (6rem)</option>
                <option value="custom">Custom</option>
              </Select>
              <Input 
                v-if="marginBottomPreset === 'custom'" 
                v-model="state.shortcode_margin_bottom" 
                placeholder="e.g. 50px, 3.5rem"
                class="mt-1"
              />
            </div>
          </div>
          <p v-if="marginTopPreset === 'custom' || marginBottomPreset === 'custom'" class="text-xs text-muted-foreground">Use any CSS value: px, rem, em, vh, etc.</p>

          <Button type="submit" :disabled="isSaving">
            <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
            {{ isSaving ? 'Saving...' : 'Save Shortcode Settings' }}
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Alert, Select } from '@/components/ui'
import ReauthModal from '@/components/ReauthModal.vue'

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
  // Floating button settings
  primary_color: '#facc15',
  text_color: '#1c1917',
  button_text: 'Get Roof Estimate',
  button_emoji: '🏠',
  button_position: 'bottom-right',
  show_widget: true,
  // Shortcode settings
  shortcode_heading: '',
  shortcode_bg_style: 'none',
  shortcode_bg_color: '#f5f5f4',
  shortcode_image: 'default',
  shortcode_custom_image: '',
  shortcode_margin_top: '',
  shortcode_margin_bottom: ''
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

// Margin preset helpers
const presetValues = ['', '0', '1rem', '2rem', '4rem', '6rem']
const marginTopPreset = ref('')
const marginBottomPreset = ref('')

// Sync presets with state
watch(() => state.shortcode_margin_top, (val) => {
  marginTopPreset.value = presetValues.includes(val) ? val : 'custom'
}, { immediate: true })

watch(() => state.shortcode_margin_bottom, (val) => {
  marginBottomPreset.value = presetValues.includes(val) ? val : 'custom'
}, { immediate: true })

watch(marginTopPreset, (val) => {
  if (val !== 'custom') {
    state.shortcode_margin_top = val
  }
})

watch(marginBottomPreset, (val) => {
  if (val !== 'custom') {
    state.shortcode_margin_bottom = val
  }
})

const siteDomain = computed(() => {
  try {
    return new URL(props.settings.siteUrl || window.location.origin).hostname
  } catch {
    return window.location.hostname
  }
})

const shortcode = computed(() => {
  const parts = ['[proleadsai_widget']
  
  // Only add params if they differ from defaults
  if (state.shortcode_heading) {
    parts.push(`heading="${state.shortcode_heading}"`)
  }
  
  if (state.shortcode_bg_style && state.shortcode_bg_style !== 'none') {
    if (state.shortcode_bg_style === 'custom' && state.shortcode_bg_color) {
      parts.push(`bg="${state.shortcode_bg_color}"`)
    } else {
      parts.push(`bg="${state.shortcode_bg_style}"`)
    }
  }
  
  if (state.shortcode_image === 'none') {
    parts.push('image="none"')
  } else if (state.shortcode_image === 'custom' && state.shortcode_custom_image) {
    parts.push(`image="${state.shortcode_custom_image}"`)
  }
  
  if (state.shortcode_margin_top) {
    parts.push(`mt="${state.shortcode_margin_top}"`)
  }
  
  if (state.shortcode_margin_bottom) {
    parts.push(`mb="${state.shortcode_margin_bottom}"`)
  }
  
  return parts.length > 1 ? parts.join(' ') + ']' : '[proleadsai_widget]'
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
    const res = await fetch(`${props.settings.adminAjax}?action=proleadsai_proxy_get_settings`)
    const response = await res.json()
    
    if (response.success && response.data) {
      const data = response.data
      // Update state with API values (source of truth, already synced to WP in PHP)
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
    
    // Save via WordPress proxy (handles API + WordPress sync)
    const res = await fetch(`${props.settings.adminAjax}?action=proleadsai_proxy_save_settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: state.business,
        googleMapsApiKey: state.google_maps_api_key,
        pricePerSq: parseInt(state.price_per_sq, 10) || 750,
        timezone: state.timezone
      })
    })
    
    const response = await res.json()
    
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
    await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        show_widget: state.show_widget,
        button_position: state.button_position,
        primary_color: state.primary_color,
        text_color: state.text_color,
        button_text: state.button_text,
        button_emoji: state.button_emoji
      })
    })
    
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
    await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shortcode_heading: state.shortcode_heading,
        shortcode_bg_style: state.shortcode_bg_style,
        shortcode_bg_color: state.shortcode_bg_color,
        shortcode_image: state.shortcode_image,
        shortcode_custom_image: state.shortcode_custom_image,
        shortcode_margin_top: state.shortcode_margin_top,
        shortcode_margin_bottom: state.shortcode_margin_bottom
      })
    })
    
    success.value = 'Shortcode settings saved!'
    setTimeout(() => { success.value = '' }, 3000)
  } catch (e) {
    error.value = e.message || 'Failed to save shortcode settings'
  } finally {
    isSaving.value = false
  }
}

function goToDashboard() {
  window.location.href = `${props.settings.adminUrl}admin.php?page=proleadsai-dashboard`
}

function openMediaLibrary() {
  // Use WordPress media library if available
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
    // Fallback: prompt for URL
    const url = prompt('Enter image URL:')
    if (url) state.shortcode_custom_image = url
  }
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

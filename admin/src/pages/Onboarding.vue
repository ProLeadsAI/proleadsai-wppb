<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-background text-foreground">
    <!-- Logo/Brand -->
    <div class="mb-8 text-center">
      <h1 class="text-2xl font-bold text-foreground">ProLeads AI</h1>
      <p class="text-sm text-muted-foreground mt-1">Setup your roof estimation widget</p>
    </div>

    <!-- Progress Steps - Compact -->
    <div class="mb-6 w-full max-w-md">
      <div class="flex items-center justify-center gap-2">
        <template v-for="(stepName, index) in steps" :key="index">
          <div 
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
              currentStep > index ? 'bg-green-500 text-white scale-90' :
              currentStep === index ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'
            ]"
          >
            <Check v-if="currentStep > index" class="w-4 h-4" />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div v-if="index < steps.length - 1" :class="['w-12 h-1 rounded-full transition-colors duration-300', currentStep > index ? 'bg-green-500' : 'bg-muted']"></div>
        </template>
      </div>
      <p class="text-center text-sm text-muted-foreground mt-3">{{ steps[currentStep] }}</p>
    </div>

    <!-- Step Content Card -->
    <Card class="w-full max-w-md shadow-lg">
      <CardContent class="p-6">
        <!-- Step 1: Email Verification -->
        <div v-if="currentStep === 0" class="space-y-4">
          <Alert v-if="error" variant="destructive">
            {{ error }}
          </Alert>
          
          <Alert v-if="state.email_verified" variant="success">
            <Check class="w-4 h-4" />
            <span class="ml-2">Email successfully verified!</span>
          </Alert>

          <div class="space-y-2">
            <Label>Email Address</Label>
            <div class="flex gap-2">
              <Input 
                v-model="state.email" 
                type="email" 
                placeholder="your@email.com"
                :disabled="state.email_verified && !isChangingEmail"
                class="flex-1"
                @keyup.enter="!state.email_verified && state.email && cooldown <= 0 && sendVerificationCode()"
              />
              <Button 
                v-if="state.email_verified && !isChangingEmail"
                @click="handleChangeEmail"
                variant="outline"
              >
                Change Email
              </Button>
              <Button 
                v-else
                @click="sendVerificationCode"
                :disabled="isLoading || !state.email || cooldown > 0"
              >
                <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
                {{ cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Code' }}
              </Button>
            </div>
          </div>

          <div v-if="codeSent && !state.email_verified" class="space-y-2 pt-4 border-t">
            <Label>Verification Code</Label>
            <div class="flex gap-2">
              <Input 
                v-model="state.code" 
                placeholder="Enter 6-digit code"
                maxlength="6"
                class="flex-1"
                @keyup.enter="state.code.length >= 6 && verifyCode()"
              />
              <Button 
                @click="verifyCode"
                :disabled="isLoading || state.code.length < 6"
              >
                <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
                Verify
              </Button>
            </div>
          </div>
        </div>

        <!-- Step 2: Business Info -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div class="space-y-2">
            <Label>Business Name</Label>
            <Input 
              v-model="state.business" 
              placeholder="Enter your business name"
              @keyup.enter="state.business.trim() && nextStep()"
            />
          </div>
        </div>

        <!-- Step 3: Google Maps API Key -->
        <div v-if="currentStep === 2" class="space-y-4">
          <div class="space-y-2">
            <Label>Google Maps API Key</Label>
            <Input 
              v-model="state.google_maps_api_key" 
              :placeholder="`AIzaSy... (allow ${siteDomain})`"
              @keyup.enter="state.google_maps_api_key.trim() && nextStep()"
            />
            <p class="text-sm text-muted-foreground">
              <Button variant="link" class="p-0 h-auto text-primary" @click="showApiKeyHelp = true">
                Learn how to get an API key
              </Button>
            </p>
          </div>
          
          <!-- API Validation Results -->
          <div v-if="apiValidation.checked" class="space-y-3 p-4 bg-muted rounded-lg">
            <p class="text-sm font-medium">API Key Validation</p>
            
            <!-- Places API -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div :class="apiValidation.places.valid ? 'text-green-600' : 'text-red-600'">
                  <CheckCircle v-if="apiValidation.places.valid" class="w-5 h-5" />
                  <XCircle v-else class="w-5 h-5" />
                </div>
                <span class="text-sm">Places API (Autocomplete)</span>
              </div>
              <button 
                v-if="!apiValidation.places.valid" 
                @click="showApiFixModal = 'places'"
                class="text-xs text-primary hover:underline"
              >
                How to fix →
              </button>
            </div>
            
            <!-- Solar API -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div :class="apiValidation.solar.valid ? 'text-green-600' : 'text-red-600'">
                  <CheckCircle v-if="apiValidation.solar.valid" class="w-5 h-5" />
                  <XCircle v-else class="w-5 h-5" />
                </div>
                <span class="text-sm">Solar API (Roof Estimates)</span>
              </div>
              <button 
                v-if="!apiValidation.solar.valid" 
                @click="showApiFixModal = 'solar'"
                class="text-xs text-primary hover:underline"
              >
                How to fix →
              </button>
            </div>
          </div>
          
          <!-- API Fix Modal -->
          <div v-if="showApiFixModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showApiFixModal = null">
            <div class="bg-card text-card-foreground rounded-lg shadow-xl max-w-md w-full mx-4 border border-border">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold">
                    {{ showApiFixModal === 'places' ? 'Enable Places API' : 'Enable Solar API' }}
                  </h3>
                  <Button variant="ghost" size="sm" @click="showApiFixModal = null">✕</Button>
                </div>
                
                <div class="space-y-4 text-sm">
                  <div class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                    <p class="font-medium text-amber-800 dark:text-amber-200">Required Domains</p>
                    <p class="text-amber-700 dark:text-amber-300 mt-1 text-xs">
                      Add these domains to your API key restrictions:
                    </p>
                    <ul class="mt-2 space-y-1 text-xs">
                      <li><code class="bg-amber-100 dark:bg-amber-800 px-1 rounded">{{ siteDomain }}/*</code></li>
                      <li><code class="bg-amber-100 dark:bg-amber-800 px-1 rounded">{{ apiDomain }}/*</code></li>
                    </ul>
                  </div>

                  <ol class="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Click the button below to open Google Cloud Console</li>
                    <li>Make sure you're in the correct project</li>
                    <li>Click <strong class="text-foreground">Enable</strong> if not already enabled</li>
                    <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="text-primary hover:underline">API Credentials</a> and edit your API key</li>
                    <li>Under <strong class="text-foreground">Website restrictions</strong>, add the domains above</li>
                    <li>Save and wait 1-2 minutes for changes to propagate</li>
                  </ol>

                  <div class="flex gap-2 pt-2">
                    <a 
                      :href="showApiFixModal === 'places' 
                        ? 'https://console.cloud.google.com/apis/library/places-backend.googleapis.com' 
                        : 'https://console.cloud.google.com/apis/library/solar.googleapis.com'"
                      target="_blank"
                      class="flex-1"
                    >
                      <Button class="w-full">
                        Open {{ showApiFixModal === 'places' ? 'Places' : 'Solar' }} API
                      </Button>
                    </a>
                  </div>
                  
                  <button 
                    @click="showApiFixModal = null; validateApiKey(true)"
                    class="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                  >
                    I've enabled it, re-validate →
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="isValidating" class="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 class="w-4 h-4 animate-spin" />
            Validating API key...
          </div>
        </div>

        <!-- Google Maps API Key Help Modal -->
        <div v-if="showApiKeyHelp" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showApiKeyHelp = false">
          <div class="bg-card text-card-foreground rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto border border-border">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">How to Get a Google Maps API Key</h3>
                <Button variant="ghost" size="sm" @click="showApiKeyHelp = false">✕</Button>
              </div>
              
              <div class="space-y-4 text-sm">
                <div class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                  <p class="font-medium text-amber-800 dark:text-amber-200">Important: Allowed Domains</p>
                  <p class="text-amber-700 dark:text-amber-300 mt-1 text-xs">
                    Add these domains to your API key's allowed referrers:
                  </p>
                  <ul class="mt-2 space-y-1 text-xs">
                    <li><code class="bg-amber-100 dark:bg-amber-800 px-1 rounded">{{ siteDomain }}/*</code></li>
                    <li><code class="bg-amber-100 dark:bg-amber-800 px-1 rounded">{{ apiDomain }}/*</code></li>
                  </ul>
                </div>

                <ol class="list-decimal list-inside space-y-3">
                  <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="text-primary hover:underline">Google Cloud Console</a></li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the <strong>Places API</strong> and <strong>Solar API</strong></li>
                  <li>Go to <strong>Credentials</strong> and click <strong>Create Credentials → API Key</strong></li>
                  <li>Click on your new API key to configure it</li>
                  <li>Under <strong>Application restrictions</strong>, select <strong>HTTP referrers</strong></li>
                  <li>Add both domains listed above</li>
                  <li>Click <strong>Save</strong> and copy your API key</li>
                </ol>

                <div class="pt-4 border-t">
                  <Button class="w-full" @click="showApiKeyHelp = false">Got it</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Theme & Pricing -->
        <div v-if="currentStep === 3" class="space-y-4">
          <div class="space-y-2">
            <Label>Primary Color</Label>
            <div class="flex gap-2">
              <input v-model="state.primary_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
              <Input v-model="state.primary_color" class="flex-1" />
            </div>
          </div>
          <div class="space-y-2">
            <Label>Secondary Color</Label>
            <div class="flex gap-2">
              <input v-model="state.secondary_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
              <Input v-model="state.secondary_color" class="flex-1" />
            </div>
          </div>
          <div class="space-y-2">
            <Label>Button Position</Label>
            <Select v-model="state.button_position">
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </Select>
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
        </div>

        <!-- Navigation Buttons -->
        <div class="mt-6 flex gap-3">
          <Button 
            v-if="currentStep > 0"
            @click="prevStep"
            variant="outline"
            class="flex-1"
          >
            <ChevronLeft class="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button 
            @click="nextStep"
            :disabled="!canProceed"
            :class="currentStep === 0 ? 'w-full' : 'flex-1'"
          >
            {{ currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue' }}
            <ChevronRight v-if="currentStep < steps.length - 1" class="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Reset link (dev only) -->
    <button 
      v-if="isDevMode"
      @click="resetData" 
      class="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      Reset setup data
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Check, ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle } from 'lucide-vue-next'
import { Button, Input, Card, CardContent, Label, Select, Alert } from '@/components/ui'
import { BASE_URL, API_MODE } from '@/lib/api'

// Check if dev mode
const isDevMode = API_MODE === 'dev'

// Extract domain from BASE_URL for display (e.g., "next.proleadsai.com" or "localhost:3000")
const apiDomain = computed(() => {
  try {
    const url = new URL(BASE_URL)
    return url.host
  } catch {
    return 'next.proleadsai.com'
  }
})

// WordPress AJAX proxy helper
async function wpAjax(action, data = {}) {
  const res = await fetch(`${window.proleadsai_settings?.adminAjax || '/wp-admin/admin-ajax.php'}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

const props = defineProps({
  settings: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['complete'])

const steps = ['Email Verification', 'Business Info', 'Google Maps API', 'Theme & Pricing']
const currentStep = ref(0)
const isLoading = ref(false)
const error = ref('')
const codeSent = ref(false)
const isChangingEmail = ref(false)
const cooldown = ref(0)
const showApiKeyHelp = ref(false)
const showApiFixModal = ref(null) // 'places' | 'solar' | null
const isValidating = ref(false)

const apiValidation = reactive({
  checked: false,
  lastValidatedKey: '',
  originalKey: '', // Key loaded from server (to detect changes)
  places: { valid: false, message: '' },
  solar: { valid: false, message: '' }
})

const siteDomain = computed(() => {
  try {
    return new URL(props.settings.siteUrl || window.location.origin).hostname
  } catch {
    return window.location.hostname
  }
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
  primary_color: '#1d4ed8',
  secondary_color: '#22c55e',
  button_position: 'bottom-center',
  price_per_sq: '750',
  timezone: 'America/New_York'
})

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (EST)' },
  { value: 'America/Chicago', label: 'Central Time (CST)' },
  { value: 'America/Denver', label: 'Mountain Time (MST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
]

const canProceed = computed(() => {
  if (currentStep.value === 0) return state.email_verified
  if (currentStep.value === 1) return state.business.trim().length > 0
  if (currentStep.value === 2) return state.google_maps_api_key.trim().length > 0
  return true
})

onMounted(async () => {
  try {
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
      
      if (data.completed) {
        emit('complete')
        return
      }
      
      if (data.auth_token && data.team_id) {
        if (data.google_maps_api_key) {
          currentStep.value = 3
        } else if (data.business) {
          currentStep.value = 2
        } else {
          currentStep.value = 1
        }
      } else if (data.email_verified && data.user_id) {
        currentStep.value = 1
      }
    }
  } catch (e) {
    console.error('Failed to load state:', e)
  }
})

async function saveState(data) {
  try {
    await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  } catch (e) {
    console.error('Failed to save state:', e)
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
    const data = await wpAjax('proleadsai_send_verification_email', { email: state.email })
    
    if (!data.success) {
      throw new Error(data.data?.message || 'Failed to send verification email')
    }
    
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
    const data = await wpAjax('proleadsai_verify_otp', { email: state.email, code: state.code })
    
    if (!data.success) {
      throw new Error(data.data?.message || 'Invalid verification code')
    }
    const result = data.data
    
    state.email_verified = true
    state.user_id = result.user?.id || ''
    isChangingEmail.value = false
    codeSent.value = false
    
    await saveState({
      email: state.email,
      email_verified: true,
      user_id: state.user_id
    })
    
    // Check if user already has a WordPress organization
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
    const data = await wpAjax('proleadsai_get_user_org', { userId: state.user_id })
    
    if (data.success && data.data?.found && data.data?.organization) {
      const org = data.data.organization
      // Pre-fill with existing org data
      state.business = org.name || ''
      state.team_id = org.id || ''
      if (org.googleMapsApiKey) state.google_maps_api_key = org.googleMapsApiKey
      if (org.pricePerSq) state.price_per_sq = org.pricePerSq.toString()
      if (org.timezone) state.timezone = org.timezone
      
      // Save to WordPress
      await saveState({
        business: state.business,
        team_id: state.team_id,
        google_maps_api_key: state.google_maps_api_key,
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
      primary_color: state.primary_color,
      secondary_color: state.secondary_color,
      button_position: state.button_position,
      price_per_sq: state.price_per_sq,
      timezone: state.timezone
    })
    
    if (state.user_id) {
      try {
        await wpAjax('proleadsai_update_settings', {
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
    window.location.href = `${props.settings.adminUrl}admin.php?page=proleadsai-dashboard`
    return
  }
  
  if (currentStep.value === 1) {
    try {
      const data = await wpAjax('proleadsai_create_business', {
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
  } else if (currentStep.value === 2) {
    // Only validate API key if it changed from original
    const currentKey = state.google_maps_api_key.trim()
    const keyChanged = currentKey !== apiValidation.originalKey
    
    if (keyChanged || !apiValidation.checked) {
      await validateApiKey()
      if (!apiValidation.places.valid && !apiValidation.solar.valid) {
        error.value = 'Please fix the API key issues before continuing'
        return
      }
    }
    
    await saveState({ google_maps_api_key: state.google_maps_api_key })
    if (state.user_id && state.google_maps_api_key) {
      try {
        await wpAjax('proleadsai_update_settings', {
          userId: state.user_id,
          googleMapsApiKey: state.google_maps_api_key
        })
      } catch (e) {
        console.error('Failed to save Google Maps API key:', e)
      }
    }
  }
  
  currentStep.value++
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
  error.value = ''
  
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

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

async function resetData() {
  if (!confirm('Are you sure you want to reset all plugin data?')) return
  
  await fetch(`${props.settings.adminAjax}?action=proleadsai_reset_data`, { method: 'POST' })
  window.location.reload()
}
</script>

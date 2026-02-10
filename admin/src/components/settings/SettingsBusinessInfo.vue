<script setup>
import { watch, ref } from 'vue'
import { Loader2, CheckCircle, XCircle } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Select } from '@/components/ui'
import { TIMEZONES } from '@/lib/constants'
import { useGoogleMapsValidation } from '@/composables/useGoogleMapsValidation'

const props = defineProps({
  state: { type: Object, required: true },
  siteDomain: { type: String, default: '' },
  apiDomain: { type: String, default: '' },
  solarValidation: { type: Object, default: () => ({}) },
  isValidatingSolar: { type: Boolean, default: false },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'show-places-api-help', 'show-solar-api-help', 'validate-solar', 'reset-solar-validation', 'show-reset-modal'])

// Use the same validation composable as onboarding step 3
const { isValidating: isValidatingMaps, validation: mapsValidation, validateApiKey: validateMapsKey, reset: resetMapsValidation } = useGoogleMapsValidation()

// Track the original API key loaded from settings (don't validate unless user changes it)
const originalMapsKey = ref('')
const originalSolarKey = ref('')
const mapsKeyChanged = ref(false)
const solarKeyChanged = ref(false)

// Set original keys once state is loaded (on first non-empty value)
watch(() => props.state.google_maps_api_key, (newKey, oldKey) => {
  // First time loading - set original key
  if (!originalMapsKey.value && newKey && !oldKey) {
    originalMapsKey.value = newKey
    return
  }
  // User changed the key
  if (originalMapsKey.value && newKey !== originalMapsKey.value) {
    mapsKeyChanged.value = true
  }
}, { immediate: true })

watch(() => props.state.google_solar_api_key, (newKey, oldKey) => {
  // First time loading - set original key
  if (!originalSolarKey.value && newKey && !oldKey) {
    originalSolarKey.value = newKey
    return
  }
  // User changed the key
  if (originalSolarKey.value && newKey !== originalSolarKey.value) {
    solarKeyChanged.value = true
  }
}, { immediate: true })

// Debounce timer for auto-validation
let mapsValidationTimer = null

// Auto-validate Maps API key when it changes (with debounce) - only if user changed it
watch(() => props.state.google_maps_api_key, (newKey) => {
  const key = (newKey || '').trim()
  
  // Clear existing timer
  if (mapsValidationTimer) {
    clearTimeout(mapsValidationTimer)
  }
  
  // Don't validate if key hasn't changed from original or is empty
  if (!key || !mapsKeyChanged.value) return
  
  // Reset validation when key changes
  resetMapsValidation()
  
  // Debounce validation by 800ms
  mapsValidationTimer = setTimeout(async () => {
    await validateMapsKey(key)
  }, 800)
})

// Solar API validation - auto-validate on change (only if user changed it)
let solarValidationTimer = null

watch(() => props.state.google_solar_api_key, (newKey) => {
  const key = (newKey || '').trim()
  
  // Clear existing timer
  if (solarValidationTimer) {
    clearTimeout(solarValidationTimer)
  }
  
  // Don't validate if key hasn't changed from original or is empty
  if (!key || !solarKeyChanged.value) {
    return
  }
  
  // Reset validation when key changes
  emit('reset-solar-validation')
  
  // Debounce validation by 800ms
  solarValidationTimer = setTimeout(() => {
    emit('validate-solar')
  }, 800)
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Business Information</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="emit('save')" class="space-y-6">
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
          <p class="text-sm text-muted-foreground">
            Email cannot be changed in WordPress settings. 
            <Button variant="link" class="p-0 h-auto text-destructive" @click="emit('show-reset-modal')">
              Reset all settings
            </Button>
            to use a different email.
          </p>
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
            <option v-for="tz in TIMEZONES" :key="tz.value" :value="tz.value">
              {{ tz.label }}
            </option>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Google Places API Key</Label>
          <Input 
            v-model="state.google_maps_api_key" 
            placeholder="AIzaSy..."
          />
          <p class="text-sm text-muted-foreground">
            <Button variant="link" class="p-0 h-auto text-primary" @click="emit('show-places-api-help')">
              Learn how to get a Places API key
            </Button>
          </p>
          
          <!-- API Validation Results (same format as onboarding step 3) -->
          <div v-if="mapsValidation.checked" class="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-3">
            <p class="text-sm font-medium">API Key Validation (Client-Side)</p>
            <p class="text-xs text-muted-foreground mb-2">
              Testing on: <strong>{{ siteDomain }}</strong>
            </p>

            <!-- Maps JavaScript API -->
            <div class="flex items-center gap-2">
              <div :class="mapsValidation.mapsJs.valid ? 'text-green-600' : 'text-red-600'">
                <CheckCircle v-if="mapsValidation.mapsJs.valid" class="w-5 h-5" />
                <XCircle v-else class="w-5 h-5" />
              </div>
              <span class="text-sm">Maps JavaScript API</span>
            </div>
            <p v-if="mapsValidation.mapsJs.message" :class="mapsValidation.mapsJs.valid ? 'text-xs text-green-600 ml-7' : 'text-xs text-red-600 ml-7'">
              {{ mapsValidation.mapsJs.message }}
            </p>

            <!-- Places API (New) -->
            <div class="flex items-center gap-2">
              <div :class="mapsValidation.placesApi.valid ? 'text-green-600' : 'text-red-600'">
                <CheckCircle v-if="mapsValidation.placesApi.valid" class="w-5 h-5" />
                <XCircle v-else class="w-5 h-5" />
              </div>
              <span class="text-sm">Places API (New)</span>
            </div>
            <p v-if="mapsValidation.placesApi.message" :class="mapsValidation.placesApi.valid ? 'text-xs text-green-600 ml-7' : 'text-xs text-red-600 ml-7'">
              {{ mapsValidation.placesApi.message }}
            </p>

            <!-- Success message -->
            <div v-if="mapsValidation.mapsJs.valid && mapsValidation.placesApi.valid" class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p class="text-sm text-green-700 dark:text-green-300 font-medium">
                ✓ Google Maps API key is valid and working!
              </p>
            </div>
          </div>
          
          <div v-if="isValidatingMaps" class="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            Validating API key...
          </div>
        </div>

        <div class="space-y-2">
          <Label>Google Solar API Key</Label>
          <Input 
            v-model="state.google_solar_api_key" 
            placeholder="AIzaSy... (no referrer restrictions)"
          />
          <p class="text-sm text-muted-foreground">
            <Button variant="link" class="p-0 h-auto text-primary" @click="emit('show-solar-api-help')">
              Learn how to get a Solar API key
            </Button>
          </p>
          
          <!-- Solar API Validation Results -->
          <div v-if="solarValidation.checked" class="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-3">
            <p class="text-sm font-medium">Solar API Validation (Server-Side)</p>
            <p class="text-xs text-muted-foreground mb-2">Tested from: <strong>{{ apiDomain || 'app.proleadsai.com' }}</strong></p>

            <div class="flex items-center gap-2">
              <div :class="solarValidation.valid ? 'text-green-600' : 'text-red-600'">
                <CheckCircle v-if="solarValidation.valid" class="w-5 h-5" />
                <XCircle v-else class="w-5 h-5" />
              </div>
              <span class="text-sm">Solar API</span>
            </div>
            <p v-if="solarValidation.message" :class="solarValidation.valid ? 'text-xs text-green-600 ml-7' : 'text-xs text-red-600 ml-7'">
              {{ solarValidation.message }}
            </p>

            <div v-if="solarValidation.valid" class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p class="text-sm text-green-700 dark:text-green-300 font-medium">
                ✓ Solar API key is valid and working!
              </p>
            </div>
          </div>
          
          <div v-if="isValidatingSolar" class="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            Validating Solar API...
          </div>
        </div>

        <Button type="submit" :disabled="isSaving || isValidatingMaps || isValidatingSolar">
          <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
          {{ isSaving ? 'Saving...' : 'Update Business Settings' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>

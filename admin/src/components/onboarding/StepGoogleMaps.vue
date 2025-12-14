<script setup>
import { ref, watch } from 'vue'
import { Loader2, CheckCircle, XCircle } from 'lucide-vue-next'
import { Button, Input, Label } from '@/components/ui'
import { useGoogleMapsValidation } from '@/composables/useGoogleMapsValidation'

const props = defineProps({
  modelValue: { type: String, default: '' },
  siteDomain: { type: String, default: '' },
  apiDomain: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'submit', 'validate', 'show-fix-modal', 'validation-complete'])

const showApiKeyHelp = ref(false)

// Use the validation composable (client-side only, no settings needed)
const { isValidating, validation, validateApiKey: doValidate, reset } = useGoogleMapsValidation()

// Reset validation when API key changes
watch(() => props.modelValue, () => {
  reset()
})

async function handleValidate() {
  const result = await doValidate(props.modelValue)
  emit('validation-complete', result)
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label>Google Maps API Key</Label>
      <Input 
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        :placeholder="`AIzaSy... (allow ${siteDomain})`"
        @keyup.enter="modelValue.trim() && handleValidate()"
      />
      <p class="text-sm text-muted-foreground">
        <Button variant="link" class="p-0 h-auto text-primary" @click="showApiKeyHelp = true">
          Learn how to get an API key
        </Button>
      </p>

      <div class="mt-2">
        <Button type="button" :disabled="isValidating || !modelValue.trim()" @click="handleValidate">
          <Loader2 v-if="isValidating" class="w-4 h-4 mr-2 animate-spin" />
          {{ isValidating ? 'Validating...' : 'Validate Key' }}
        </Button>
      </div>
    </div>
    
    <!-- API Validation Results -->
    <div v-if="validation.checked" class="space-y-3 p-4 bg-muted rounded-lg">
      <p class="text-sm font-medium">API Key Validation (Client-Side)</p>
      <p class="text-xs text-muted-foreground mb-2">
        Testing on: <strong>{{ siteDomain }}</strong>
      </p>

      <!-- Maps JavaScript API -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div :class="validation.mapsJs.valid ? 'text-green-600' : 'text-red-600'">
            <CheckCircle v-if="validation.mapsJs.valid" class="w-5 h-5" />
            <XCircle v-else class="w-5 h-5" />
          </div>
          <span class="text-sm">Maps JavaScript API</span>
        </div>
        <button 
          v-if="!validation.mapsJs.valid && validation.mapsJs.message" 
          @click="emit('show-fix-modal', 'mapsJs')"
          class="text-xs text-primary hover:underline"
        >
          How to fix →
        </button>
      </div>
      <p v-if="validation.mapsJs.message" :class="validation.mapsJs.valid ? 'text-xs text-green-600 ml-7' : 'text-xs text-red-600 ml-7'">
        {{ validation.mapsJs.message }}
      </p>

      <!-- Places API (New) -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div :class="validation.placesApi.valid ? 'text-green-600' : 'text-red-600'">
            <CheckCircle v-if="validation.placesApi.valid" class="w-5 h-5" />
            <XCircle v-else class="w-5 h-5" />
          </div>
          <span class="text-sm">Places API (New)</span>
        </div>
        <button 
          v-if="!validation.placesApi.valid && validation.placesApi.message && validation.mapsJs.valid" 
          @click="emit('show-fix-modal', 'places')"
          class="text-xs text-primary hover:underline"
        >
          How to fix →
        </button>
      </div>
      <p v-if="validation.placesApi.message" :class="validation.placesApi.valid ? 'text-xs text-green-600 ml-7' : 'text-xs text-red-600 ml-7'">
        {{ validation.placesApi.message }}
      </p>

      <!-- Success message -->
      <div v-if="validation.mapsJs.valid && validation.placesApi.valid" class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
        <p class="text-sm text-green-700 dark:text-green-300 font-medium">
          ✓ Maps API key is valid and working!
        </p>
      </div>
    </div>
    
    <div v-if="isValidating" class="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 class="w-4 h-4 animate-spin" />
      Loading Google Maps and testing APIs...
    </div>

    <!-- API Key Help Modal -->
    <div v-if="showApiKeyHelp" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showApiKeyHelp = false">
      <div class="bg-card text-card-foreground rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto border border-border">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">How to Get a Google Maps API Key</h3>
            <Button variant="ghost" size="sm" @click="showApiKeyHelp = false">✕</Button>
          </div>
          
          <div class="space-y-4 text-sm">
            <p class="text-muted-foreground">This key needs access to <strong>Maps JavaScript API</strong> and <strong>Places API (New)</strong>.</p>
            
            <ol class="list-decimal list-inside space-y-3">
              <li>Open <a href="https://console.cloud.google.com/" target="_blank" class="text-primary hover:underline">Google Cloud Console</a></li>
              <li>Create a new project or select an existing one</li>
              <li><strong>Enable the required APIs first:</strong>
                <ul class="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                  <li><a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" class="text-primary hover:underline">Maps JavaScript API</a> — click Enable</li>
                  <li><a href="https://console.cloud.google.com/apis/library/places.googleapis.com" target="_blank" class="text-primary hover:underline">Places API (New)</a> — click Enable</li>
                </ul>
              </li>
              <li>Go to <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" class="text-primary hover:underline">Credentials</a> and click <strong>Create credentials → API key</strong></li>
              <li>Click on your new API key to configure it</li>
              <li>Under <strong>Application restrictions</strong>, select <strong>HTTP referrers</strong></li>
              <li>Add your allowed domains:
                <ul class="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                  <li><code class="bg-muted px-1 rounded">{{ siteDomain }}/*</code></li>
                </ul>
              </li>
              <li>Under <strong>API restrictions</strong>, click <strong>Restrict key</strong> and select:
                <ul class="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                  <li>Maps JavaScript API</li>
                  <li>Places API (New)</li>
                </ul>
              </li>
              <li>Click <strong>Save</strong> and copy your API key</li>
            </ol>

            <div class="pt-4 border-t">
              <Button class="w-full" @click="showApiKeyHelp = false">Got it</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

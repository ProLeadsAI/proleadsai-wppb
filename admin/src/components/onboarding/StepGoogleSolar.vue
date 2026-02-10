<script setup>
import { ref, watch } from 'vue'
import { Loader2, CheckCircle, XCircle } from 'lucide-vue-next'
import { Button, Input, Label } from '@/components/ui'
import { wpAjax } from '@/lib/wpAjax'

const props = defineProps({
  modelValue: { type: String, default: '' },
  settings: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'validation-complete'])

const showApiKeyHelp = ref(false)
const isValidating = ref(false)

const validation = ref({
  checked: false,
  valid: false,
  message: ''
})

// Reset validation when API key changes
watch(() => props.modelValue, () => {
  validation.value = { checked: false, valid: false, message: '' }
})

async function handleValidate() {
  const key = props.modelValue?.trim()
  if (!key) {
    validation.value = { checked: true, valid: false, message: 'API key is required' }
    emit('validation-complete', validation.value)
    return
  }

  isValidating.value = true
  validation.value = { checked: false, valid: false, message: '' }

  try {
    const response = await wpAjax('proleadsai_validate_solar_api', { apiKey: key }, props.settings)
    
    if (response.success && response.data?.solarApi) {
      validation.value = {
        checked: true,
        valid: response.data.solarApi.valid,
        message: response.data.solarApi.message
      }
    } else {
      validation.value = {
        checked: true,
        valid: false,
        message: response.data?.message || 'Failed to validate Solar API'
      }
    }
  } catch (e) {
    validation.value = {
      checked: true,
      valid: false,
      message: e.message || 'Failed to validate Solar API'
    }
  } finally {
    isValidating.value = false
    emit('validation-complete', validation.value)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label>Google Solar API Key</Label>
      <Input 
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        placeholder="AIzaSy... (no referrer restrictions)"
        @keyup.enter="modelValue.trim() && handleValidate()"
      />
      <p class="text-sm text-muted-foreground">
        <Button variant="link" class="p-0 h-auto text-primary" @click="showApiKeyHelp = true">
          Learn how to get a Solar API key
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
      <p class="text-sm font-medium">Solar API Validation (Server-Side)</p>
      <p class="text-xs text-muted-foreground mb-2">
        Tested from: <strong>app.proleadsai.com</strong>
      </p>

      <!-- Solar API -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div :class="validation.valid ? 'text-green-600' : 'text-red-600'">
            <CheckCircle v-if="validation.valid" class="w-5 h-5" />
            <XCircle v-else class="w-5 h-5" />
          </div>
          <span class="text-sm">Solar API</span>
        </div>
      </div>
      <p v-if="validation.message" :class="validation.valid ? 'text-xs text-green-600 ml-7' : 'text-xs text-red-600 ml-7'">
        {{ validation.message }}
      </p>

      <!-- Success message -->
      <div v-if="validation.valid" class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
        <p class="text-sm text-green-700 dark:text-green-300 font-medium">
          ✓ Solar API key is valid and working!
        </p>
      </div>
    </div>
    
    <div v-if="isValidating" class="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 class="w-4 h-4 animate-spin" />
      Testing Solar API...
    </div>

    <!-- API Key Help Modal -->
    <div v-if="showApiKeyHelp" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showApiKeyHelp = false">
      <div class="bg-card text-card-foreground rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto border border-border">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">How to Get a Solar API Key</h3>
            <Button variant="ghost" size="sm" @click="showApiKeyHelp = false">✕</Button>
          </div>
          
          <div class="space-y-4 text-sm">
            <p class="text-muted-foreground">The Solar API is called server-side and requires a <strong>separate API key</strong> with no referrer restrictions.</p>
            
            <div class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <p class="font-medium text-amber-800 dark:text-amber-200 text-xs">Important</p>
              <p class="text-amber-700 dark:text-amber-300 mt-1 text-xs">
                This key must have <strong>"None"</strong> application restriction (not HTTP referrers).
              </p>
            </div>
            
            <ol class="list-decimal list-inside space-y-3">
              <li>Open <a href="https://console.cloud.google.com/" target="_blank" class="text-primary hover:underline">Google Cloud Console</a></li>
              <li>Select the same project you used for the Maps API key</li>
              <li><strong>Enable the Solar API first:</strong>
                <ul class="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                  <li><a href="https://console.cloud.google.com/apis/library/solar.googleapis.com" target="_blank" class="text-primary hover:underline">Solar API</a> — click Enable</li>
                </ul>
              </li>
              <li>Go to <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" class="text-primary hover:underline">Credentials</a> and click <strong>Create credentials → API key</strong></li>
              <li>Click on your new API key to configure it</li>
              <li>Name it <strong>"Solar API Key"</strong> for easy identification</li>
              <li>Under <strong>Application restrictions</strong>, select <strong>None</strong></li>
              <li>Under <strong>API restrictions</strong>, click <strong>Restrict key</strong> and select:
                <ul class="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                  <li>Solar API</li>
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

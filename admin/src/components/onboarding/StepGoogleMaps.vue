<script setup>
import { ref } from 'vue'
import { Loader2, CheckCircle, XCircle } from 'lucide-vue-next'
import { Button, Input, Label } from '@/components/ui'

const props = defineProps({
  modelValue: { type: String, default: '' },
  siteDomain: { type: String, default: '' },
  apiDomain: { type: String, default: '' },
  apiValidation: { type: Object, default: () => ({ checked: false, places: {}, solar: {} }) },
  isValidating: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'submit', 'validate', 'show-fix-modal'])

const showApiKeyHelp = ref(false)
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label>Google Maps API Key</Label>
      <Input 
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        :placeholder="`AIzaSy... (allow ${siteDomain})`"
        @keyup.enter="modelValue.trim() && emit('submit')"
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
          @click="emit('show-fix-modal', 'places')"
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
          @click="emit('show-fix-modal', 'solar')"
          class="text-xs text-primary hover:underline"
        >
          How to fix →
        </button>
      </div>
    </div>
    
    <div v-if="isValidating" class="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 class="w-4 h-4 animate-spin" />
      Validating API key...
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
  </div>
</template>

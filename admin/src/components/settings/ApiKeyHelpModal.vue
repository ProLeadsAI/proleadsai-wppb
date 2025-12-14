<script setup>
import { computed } from 'vue'
import { Button } from '@/components/ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  type: { type: [String, Boolean, null], default: null },
  siteDomain: { type: String, default: '' },
  apiDomain: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const isSolar = computed(() => props.type === 'solar')
const title = computed(() => isSolar.value ? 'How to Get a Google Solar API Key' : 'How to Get a Google Maps API Key')
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="emit('close')">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ title }}</h3>
          <Button variant="ghost" size="sm" @click="emit('close')">✕</Button>
        </div>
        
        <!-- Solar API Help -->
        <div v-if="isSolar" class="space-y-4 text-sm">
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
                <li>Geocoding API</li>
              </ul>
            </li>
            <li>Click <strong>Save</strong> and copy your API key</li>
          </ol>

          <div class="pt-4 border-t">
            <Button class="w-full" @click="emit('close')">Got it</Button>
          </div>
        </div>
        
        <!-- Places/Maps API Help -->
        <div v-else class="space-y-4 text-sm">
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
                <li><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">{{ siteDomain }}/*</code></li>
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
            <Button class="w-full" @click="emit('close')">Got it</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

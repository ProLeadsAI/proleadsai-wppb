<script setup>
import { Button } from '@/components/ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  siteDomain: { type: String, default: '' }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="emit('close')">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">How to Get a Google Maps API Key</h3>
          <Button variant="ghost" size="sm" @click="emit('close')">✕</Button>
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
            <Button class="w-full" @click="emit('close')">Got it</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

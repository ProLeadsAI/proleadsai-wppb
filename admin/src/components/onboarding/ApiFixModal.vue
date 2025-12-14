<script setup>
import { Button } from '@/components/ui'

const props = defineProps({
  type: { type: String, default: null }, // 'places' | null
  siteDomain: { type: String, default: '' },
  apiDomain: { type: String, default: '' }
})

const emit = defineEmits(['close', 'revalidate'])
</script>

<template>
  <div 
    v-if="type" 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" 
    @click.self="emit('close')"
  >
    <div class="bg-card text-card-foreground rounded-lg shadow-xl max-w-md w-full mx-4 border border-border">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Enable Google Maps API</h3>
          <Button variant="ghost" size="sm" @click="emit('close')">✕</Button>
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
            <li>Enable <strong class="text-foreground">Maps JavaScript API</strong> and <strong class="text-foreground">Places API (New)</strong></li>
            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="text-primary hover:underline">API Credentials</a> and edit your API key</li>
            <li>Under <strong class="text-foreground">Website restrictions</strong>, add the domains above</li>
            <li>Save and wait 1-2 minutes for changes to propagate</li>
          </ol>

          <div class="flex gap-2 pt-2">
            <a 
              href="https://console.cloud.google.com/apis/library/places.googleapis.com"
              target="_blank"
              class="flex-1"
            >
              <Button class="w-full">
                Open Places API (New)
              </Button>
            </a>
          </div>
          
          <button 
            @click="emit('revalidate')"
            class="w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            I've enabled it, re-validate →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

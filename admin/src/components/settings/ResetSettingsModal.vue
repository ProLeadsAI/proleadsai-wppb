<script setup>
import { ref } from 'vue'
import { Loader2, AlertTriangle } from 'lucide-vue-next'
import { Button } from '@/components/ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  appUrl: { type: String, default: '' }
})

const emit = defineEmits(['close', 'confirm'])

const isResetting = ref(false)

async function handleConfirm() {
  isResetting.value = true
  emit('confirm')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="emit('close')">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle class="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="text-lg font-semibold">Reset All Settings?</h3>
        </div>
        
        <div class="space-y-4 text-sm">
          <p class="text-muted-foreground">
            This will <strong>permanently delete</strong> all your settings and disconnect your account. You will need to complete the onboarding process again with a new email.
          </p>
          
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p class="font-medium text-blue-800 dark:text-blue-200 text-xs">Alternative Option</p>
            <p class="text-blue-700 dark:text-blue-300 mt-1 text-xs">
              You can change your email from the 
              <a :href="appUrl" target="_blank" class="underline font-medium">main app settings</a> 
              without resetting your plugin settings.
            </p>
          </div>
          
          <div class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <p class="font-medium text-amber-800 dark:text-amber-200 text-xs">Warning</p>
            <p class="text-amber-700 dark:text-amber-300 mt-1 text-xs">
              This action cannot be undone. All saved settings, API keys, and customizations will be lost.
            </p>
          </div>

          <div class="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              class="flex-1" 
              :disabled="isResetting"
              @click="emit('close')"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              class="flex-1 bg-red-600 hover:bg-red-700 text-white" 
              :disabled="isResetting"
              @click="handleConfirm"
            >
              <Loader2 v-if="isResetting" class="w-4 h-4 mr-2 animate-spin" />
              {{ isResetting ? 'Resetting...' : 'Reset Everything' }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

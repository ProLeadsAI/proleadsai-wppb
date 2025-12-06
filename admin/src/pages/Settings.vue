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
    <SettingsBusinessInfo 
      :state="state"
      :site-domain="siteDomain"
      :api-validation="apiValidation"
      :is-validating="isValidating"
      :is-saving="isSaving"
      @save="saveBusinessSettings"
      @show-api-help="showApiKeyHelp = true"
    />

    <!-- Floating Button -->
    <SettingsFloatingButton 
      :state="state"
      :is-saving="isSaving"
      @save="saveAppearance"
    />

    <!-- Shortcode -->
    <SettingsShortcode 
      :state="state"
      :is-saving="isSaving"
      @save="saveShortcodeSettings"
      @open-media="openMediaLibrary"
    />

    <!-- API Key Help Modal -->
    <ApiKeyHelpModal 
      :show="showApiKeyHelp"
      :site-domain="siteDomain"
      @close="showApiKeyHelp = false"
    />
    
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
import { onMounted } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { Button, Alert } from '@/components/ui'
import { SettingsBusinessInfo, SettingsFloatingButton, SettingsShortcode, ApiKeyHelpModal } from '@/components/settings'
import ReauthModal from '@/components/ReauthModal.vue'
import { useSettings } from '@/composables/useSettings'

const props = defineProps({
  settings: { type: Object, default: () => ({}) }
})

const {
  state,
  showReauthModal,
  isSaving,
  error,
  success,
  showApiKeyHelp,
  isValidating,
  apiValidation,
  siteDomain,
  loadSettings,
  saveBusinessSettings,
  saveAppearance,
  saveShortcodeSettings,
  openMediaLibrary,
  handleReauthSuccess,
  goToDashboard
} = useSettings(props.settings)

onMounted(loadSettings)
</script>

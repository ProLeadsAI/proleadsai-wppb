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
      :api-domain="apiDomain"
      :places-validation="placesValidation"
      :solar-validation="solarValidation"
      :is-validating-places="isValidatingPlaces"
      :is-validating-solar="isValidatingSolar"
      :is-saving="isSaving"
      @save="saveBusinessSettings"
      @show-places-api-help="showApiKeyHelp = 'places'"
      @show-solar-api-help="showApiKeyHelp = 'solar'"
      @validate-solar="validateSolarKey"
    />

    <!-- Floating Button -->
    <SettingsFloatingButton 
      :state="state"
      :is-saving="isSaving"
      @save="saveAppearance"
      @open-media="openMediaLibrary"
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
      :show="!!showApiKeyHelp"
      :type="showApiKeyHelp"
      :site-domain="siteDomain"
      :api-domain="apiDomain"
      @close="showApiKeyHelp = null"
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
  isValidatingPlaces,
  placesValidation,
  isValidatingSolar,
  solarValidation,
  validateSolarKey,
  apiDomain,
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

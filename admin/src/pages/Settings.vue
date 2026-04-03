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
      :is-saving="isSaving"
      @save="saveBusinessSettings"
      @show-reset-modal="showResetModal = true"
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

    <!-- Reauth Modal -->
    <ReauthModal 
      :show="showReauthModal"
      :initial-email="state.email"
      :user-id="state.user_id"
      :settings="settings"
      @close="showReauthModal = false"
      @success="handleReauthSuccess"
    />
    
    <!-- Reset Settings Modal -->
    <ResetSettingsModal 
      :show="showResetModal"
      :app-url="appUrl"
      @close="showResetModal = false"
      @confirm="resetAllSettings"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { Button, Alert } from '@/components/ui'
import { SettingsBusinessInfo, SettingsFloatingButton, SettingsShortcode, ResetSettingsModal } from '@/components/settings'
import ReauthModal from '@/components/ReauthModal.vue'
import { useSettings } from '@/composables/useSettings'

const props = defineProps({
  settings: { type: Object, default: () => ({}) }
})

const {
  state,
  showReauthModal,
  showResetModal,
  isSaving,
  error,
  success,
  appUrl,
  loadSettings,
  saveBusinessSettings,
  saveAppearance,
  saveShortcodeSettings,
  openMediaLibrary,
  handleReauthSuccess,
  resetAllSettings,
  goToDashboard
} = useSettings(props.settings)

onMounted(loadSettings)
</script>

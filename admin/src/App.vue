<template>
  <div class="p-4 sm:p-6 max-w-4xl mx-auto">
    <Onboarding v-if="currentPage === 'onboarding'" :settings="settings" />
    <Dashboard v-else-if="currentPage === 'dashboard'" :settings="settings" />
    <Settings v-else-if="currentPage === 'settings'" :settings="settings" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Onboarding from './pages/Onboarding.vue'
import Dashboard from './pages/Dashboard.vue'
import Settings from './pages/Settings.vue'

const settings = window.proleadsaiSettings || {}

const currentPage = computed(() => {
  return settings.page || 'onboarding'
})
</script>

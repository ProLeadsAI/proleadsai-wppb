<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <DashboardSkeleton v-if="isLoading" />

    <!-- Loaded Content -->
    <template v-else>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <div class="flex items-center gap-2">
          <DateRangePicker v-model="dateRange" @apply="applyDateRange" />
          <Button v-if="isDevMode" variant="outline" size="sm" @click="clearAuthToken">
            Clear Auth Token
          </Button>
          <Button v-if="isDevMode" variant="destructive" size="sm" @click="resetData">
            Reset Plugin Data
          </Button>
        </div>
      </div>

      <!-- Stats Cards -->
      <StatsCards :stats="stats" />

      <!-- Recent Activity -->
      <RecentActivity :searches="recentSearches" :format-date="formatDate" />

      <!-- Account Info -->
      <AccountInfo :state="state" @edit-settings="goToSettings" />
    </template>
    
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
import { Button } from '@/components/ui'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { StatsCards, RecentActivity, AccountInfo, DashboardSkeleton } from '@/components/dashboard'
import ReauthModal from '@/components/ReauthModal.vue'
import { useDashboard } from '@/composables/useDashboard'
import { API_MODE } from '@/lib/api'

const isDevMode = API_MODE === 'dev'

const props = defineProps({
  settings: { type: Object, default: () => ({}) }
})

const {
  isLoading,
  showReauthModal,
  dateRange,
  state,
  stats,
  recentSearches,
  loadDashboard,
  applyDateRange,
  handleReauthSuccess,
  clearAuthToken,
  resetData,
  goToSettings,
  formatDate
} = useDashboard(props.settings)

onMounted(loadDashboard)
</script>

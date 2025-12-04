<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <!-- Header Skeleton -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="h-9 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div class="flex items-center gap-2">
          <div class="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      <!-- Stats Skeleton -->
      <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card v-for="i in 4" :key="i">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div class="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>

      <!-- Cards Skeleton -->
      <div class="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card v-for="i in 2" :key="i">
          <CardHeader>
            <div class="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-for="j in 4" :key="j" class="flex justify-between">
              <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Loaded Content -->
    <template v-else>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <div class="flex items-center gap-2">
          <DateRangePicker v-model="dateRange" />
          <Button variant="default" size="sm" @click="applyDateRange" :disabled="isLoadingData">
            <Loader2 v-if="isLoadingData" class="w-4 h-4 mr-2 animate-spin" />
            Apply
          </Button>
          <Button variant="outline" size="sm" @click="clearAuthToken">
            Clear Auth Token
          </Button>
          <Button variant="destructive" size="sm" @click="resetData">
            Reset Plugin Data
          </Button>
        </div>
      </div>

      <!-- Stats Cards - All in one row -->
      <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total Searches</CardTitle>
            <Search class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.totalSearches }}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Unique Users</CardTitle>
            <Users class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.uniqueUsers }}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Leads</CardTitle>
            <FileText class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.leads }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Avg. Estimate</CardTitle>
            <DollarSign class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">${{ stats.avgEstimate.toLocaleString() }}</div>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Activity - Full Width -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="recentSearches.length === 0" class="text-muted-foreground text-sm py-4 text-center">
            No activity yet
          </div>
          <div v-else class="space-y-3">
            <div v-for="search in recentSearches" :key="search.id" 
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <!-- User ID Badge -->
              <div v-if="search.userId" class="flex-shrink-0">
                <span class="inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  {{ search.userId }}
                </span>
              </div>
              <div v-else class="flex-shrink-0">
                <span class="inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-medium bg-gray-200 text-gray-500">
                  ?
                </span>
              </div>
              <!-- Type Badge -->
              <div class="flex-shrink-0">
                <span v-if="search.type === 'submission'" 
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <FileText class="h-3 w-3" />
                  Lead
                </span>
                <span v-else 
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <Search class="h-3 w-3" />
                  Search
                </span>
              </div>
              <!-- Address & Details -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ search.address }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ search.roofSqFt?.toLocaleString() }} sq ft · ${{ search.estimate?.toLocaleString() }}
                  <template v-if="search.name"> · {{ search.name }}</template>
                </p>
              </div>
              <!-- Time -->
              <div class="text-xs text-muted-foreground whitespace-nowrap">
                {{ formatDate(search.createdAt) }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Account Info -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Account Info</CardTitle>
          <Button variant="outline" size="sm" @click="goToSettings">
            <Settings class="w-4 h-4 mr-2" />
            Edit Settings
          </Button>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span class="text-sm text-muted-foreground">Business</span>
              <p class="font-medium">{{ state.business || 'Not set' }}</p>
            </div>
            <div>
              <span class="text-sm text-muted-foreground">Email</span>
              <p class="font-medium truncate">{{ state.email || 'Not set' }}</p>
            </div>
            <div>
              <span class="text-sm text-muted-foreground">Price per Sq Ft</span>
              <p class="font-medium">${{ state.price_per_sq || '750' }}</p>
            </div>
            <div>
              <span class="text-sm text-muted-foreground">Google Maps API</span>
              <p :class="state.google_maps_api_key ? 'text-green-600' : 'text-red-600'" class="font-medium">
                {{ state.google_maps_api_key ? 'Configured' : 'Not set' }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
import { ref, reactive, onMounted } from 'vue'
import { Search, Users, FileText, Settings, DollarSign, MapPin, Loader2 } from 'lucide-vue-next'
import { Button, Card, CardHeader, CardContent, CardTitle } from '@/components/ui'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import ReauthModal from '@/components/ReauthModal.vue'
import { getApiUrl } from '@/lib/api'

const props = defineProps({
  settings: { type: Object, default: () => ({}) }
})

const state = reactive({
  email: '',
  user_id: '',
  business: '',
  google_maps_api_key: '',
  price_per_sq: '750',
  timezone: 'America/New_York',
  team_id: '',
  auth_token: ''
})

const isLoading = ref(false)
const isLoadingData = ref(false)
const showReauthModal = ref(false)

const stats = reactive({
  totalSearches: 0,
  uniqueUsers: 0,
  leads: 0,
  avgEstimate: 0
})

const recentSearches = ref([])

// Date range - defaults handled by DateRangePicker component
const dateRange = ref(null)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

onMounted(async () => {
  console.log('[Dashboard] onMounted')
  isLoading.value = true
  try {
    // Load local settings (for credentials)
    const res = await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_get`)
    const data = await res.json()
    console.log('[Dashboard] Loaded WordPress state:', data)
    if (data && typeof data === 'object') {
      Object.assign(state, data)
    }
    
    console.log('[Dashboard] auth_token:', state.auth_token ? '***' + state.auth_token.slice(-8) : 'MISSING')
    
    // If no auth_token, show reauth modal
    if (!state.auth_token) {
      console.log('[Dashboard] No auth_token, showing reauth modal')
      isLoading.value = false
      showReauthModal.value = true
      return
    }
    
    // Fetch settings from Better Auth API (source of truth)
    console.log('[Dashboard] Has auth_token, fetching from API...')
    await fetchSettingsFromApi()
    await fetchDashboardData()
  } catch (e) {
    console.error('[Dashboard] Failed to load state:', e)
  } finally {
    isLoading.value = false
  }
})

async function regenerateApiKey() {
  console.log('[Dashboard] regenerateApiKey called')
  try {
    const baseUrl = getApiUrl()
    const url = `${baseUrl}/wordpress/auth/regenerate-key`
    console.log('[Dashboard] Regenerating API key from:', url)
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user_id })
    })
    
    console.log('[Dashboard] Regenerate response status:', res.status)
    
    if (res.ok) {
      const data = await res.json()
      console.log('[Dashboard] Regenerate response:', data)
      
      if (data.success && data.apiKey) {
        state.auth_token = data.apiKey
        state.team_id = data.organization?.id || state.team_id
        
        // Save to WordPress
        await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_token: state.auth_token,
            team_id: state.team_id
          })
        })
        
        console.log('[Dashboard] API key regenerated and saved')
      }
    } else {
      const errData = await res.json().catch(() => ({}))
      console.error('[Dashboard] Regenerate failed:', res.status, errData)
    }
  } catch (e) {
    console.error('[Dashboard] Failed to regenerate API key:', e)
  }
}

async function fetchSettingsFromApi() {
  console.log('[Dashboard] fetchSettingsFromApi called')
  try {
    const baseUrl = getApiUrl()
    const url = `${baseUrl}/wordpress/settings`
    console.log('[Dashboard] Fetching settings from:', url)
    
    const res = await fetch(url, {
      headers: {
        'x-api-key': state.auth_token,
        'Accept': 'application/json'
      }
    })
    
    console.log('[Dashboard] Settings response status:', res.status)
    
    if (res.ok) {
      const data = await res.json()
      console.log('[Dashboard] Settings data from API:', data)
      console.log('[Dashboard] Current WordPress state:', { 
        business: state.business, 
        email: state.email, 
        google_maps_api_key: state.google_maps_api_key ? '***' : null,
        price_per_sq: state.price_per_sq,
        timezone: state.timezone,
        team_id: state.team_id
      })
      
      // Track if anything changed (compare API values with WordPress state)
      const changes = []
      
      if (data.name && data.name !== state.business) {
        changes.push(`business: ${state.business} -> ${data.name}`)
        state.business = data.name
      }
      if (data.email && data.email !== state.email) {
        changes.push(`email: ${state.email} -> ${data.email}`)
        state.email = data.email
      }
      if (data.googleMapsApiKey !== undefined && data.googleMapsApiKey !== state.google_maps_api_key) {
        changes.push(`google_maps_api_key changed`)
        state.google_maps_api_key = data.googleMapsApiKey || ''
      }
      if (data.pricePerSq !== undefined && data.pricePerSq.toString() !== state.price_per_sq) {
        changes.push(`price_per_sq: ${state.price_per_sq} -> ${data.pricePerSq}`)
        state.price_per_sq = data.pricePerSq.toString()
      }
      if (data.timezone && data.timezone !== state.timezone) {
        changes.push(`timezone: ${state.timezone} -> ${data.timezone}`)
        state.timezone = data.timezone
      }
      if (data.id && data.id !== state.team_id) {
        changes.push(`team_id: ${state.team_id} -> ${data.id}`)
        state.team_id = data.id
      }
      
      // Sync changes to WordPress DB
      if (changes.length > 0) {
        console.log('[Dashboard] Changes detected:', changes)
        console.log('[Dashboard] Syncing to WordPress...')
        await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business: state.business,
            email: state.email,
            google_maps_api_key: state.google_maps_api_key,
            price_per_sq: state.price_per_sq,
            timezone: state.timezone,
            team_id: state.team_id
          })
        })
        console.log('[Dashboard] WordPress DB synced')
      } else {
        console.log('[Dashboard] No changes detected, skipping sync')
      }
    } else {
      const errData = await res.json().catch(() => ({}))
      console.error('[Dashboard] Settings fetch failed:', res.status, errData)
    }
  } catch (e) {
    console.error('[Dashboard] Failed to fetch settings from API:', e)
  }
}

// Convert date range to ISO strings for API
function getDateRangeParams() {
  if (!dateRange.value?.start || !dateRange.value?.end) return ''
  
  const start = new Date(
    dateRange.value.start.year,
    dateRange.value.start.month - 1,
    dateRange.value.start.day
  ).toISOString()
  
  const end = new Date(
    dateRange.value.end.year,
    dateRange.value.end.month - 1,
    dateRange.value.end.day,
    23, 59, 59
  ).toISOString()
  
  return `&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`
}

// Apply date range manually
async function applyDateRange() {
  if (state.team_id && state.auth_token) {
    await fetchDashboardData()
  }
}

async function fetchDashboardData() {
  console.log('[Dashboard] fetchDashboardData called')
  isLoadingData.value = true
  try {
    const dateParams = getDateRangeParams()
    
    // Use WordPress-specific endpoint that accepts API key auth
    const baseUrl = getApiUrl()
    const url = `${baseUrl}/wordpress/dashboard?${dateParams.replace('&', '')}`
    console.log('[Dashboard] Fetching dashboard data from:', url)
    
    const res = await fetch(url, {
      headers: {
        'x-api-key': state.auth_token,
        'Accept': 'application/json'
      }
    })
    
    console.log('[Dashboard] Dashboard response status:', res.status)
    
    if (res.ok) {
      const data = await res.json()
      console.log('[Dashboard] Dashboard data:', data)
      
      // Update stats
      stats.totalSearches = data.totalSearches || 0
      stats.leads = data.leads || 0
      stats.uniqueUsers = data.uniqueUsers || 0
      stats.avgEstimate = data.avgEstimate || 0
      
      // Update recent activity
      recentSearches.value = (data.recentSearches || []).map(a => ({
        id: a.id,
        type: a.type || 'search',
        address: `${a.streetAddress || ''}, ${a.addressLocality || ''}, ${a.addressRegion || ''}`.replace(/^, |, $/g, ''),
        roofSqFt: a.roofAreaSqFt,
        estimate: a.estimate,
        name: a.name,
        userId: a.userId,
        createdAt: a.createdAt
      }))
    } else {
      const errData = await res.json().catch(() => ({}))
      console.error('[Dashboard] Dashboard fetch failed:', res.status, errData)
    }
  } catch (e) {
    console.error('[Dashboard] Failed to fetch dashboard data:', e)
  } finally {
    isLoadingData.value = false
  }
}

function goToSettings() {
  window.location.href = `${props.settings.adminUrl}admin.php?page=proleadsai-settings`
}

async function handleReauthSuccess({ userId, authToken, teamId }) {
  console.log('[Dashboard] Reauth success, saving credentials...')
  
  state.user_id = userId
  state.auth_token = authToken
  if (teamId) state.team_id = teamId
  
  // Save to WordPress
  await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: state.user_id,
      auth_token: state.auth_token,
      team_id: state.team_id
    })
  })
  
  showReauthModal.value = false
  
  // Now fetch data
  await fetchSettingsFromApi()
  await fetchDashboardData()
}

async function clearAuthToken() {
  if (!confirm('Clear auth token? You will need to re-authenticate.')) return
  
  await fetch(`${props.settings.adminAjax}?action=proleadsai_onboarding_save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auth_token: '' })
  })
  window.location.reload()
}

async function resetData() {
  if (!confirm('Are you sure you want to reset all plugin data? This cannot be undone.')) return
  
  await fetch(`${props.settings.adminAjax}?action=proleadsai_reset_data`, { method: 'POST' })
  window.location.href = `${props.settings.adminUrl}admin.php?page=proleadsai-onboarding`
}
</script>

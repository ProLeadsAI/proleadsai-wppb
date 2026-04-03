<script setup>
import { computed, ref } from 'vue'
import { Search, FileText, ExternalLink, Mail, Phone, User, HelpCircle, X } from 'lucide-vue-next'
import { Card, CardHeader, CardContent, CardTitle, Button } from '@/components/ui'
import { BASE_URL } from '@/lib/api'

const props = defineProps({
  searches: { type: Array, default: () => [] },
  formatDate: { type: Function, required: true },
  slug: { type: String, default: '' }
})

const showLegendModal = ref(false)

const dashboardUrl = computed(() => {
  const baseUrl = BASE_URL.replace(/\/$/, '')
  return props.slug ? `${baseUrl}/${props.slug}/dashboard` : baseUrl
})

const getLeadUrl = (leadId) => {
  if (!props.slug || !leadId) return null
  const baseUrl = BASE_URL.replace(/\/$/, '')
  return `${baseUrl}/${props.slug}/leads/${leadId}`
}
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <div class="flex items-center gap-2">
        <CardTitle>Recent Activity</CardTitle>
        <!-- Legend help button -->
        <button 
          @click="showLegendModal = true"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          title="What do these icons mean?"
        >
          <HelpCircle class="w-4 h-4" />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <a v-if="slug" :href="dashboardUrl" target="_blank">
          <Button 
            variant="outline" 
            size="sm"
            class="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            <ExternalLink class="w-4 h-4 mr-1" />
            View Leads
          </Button>
        </a>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="searches.length === 0" class="text-muted-foreground text-sm py-4 text-center">
        No activity yet
      </div>
      <div v-else class="space-y-3">
        <div 
          v-for="search in searches" 
          :key="search.id"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <!-- Type Badge -->
          <div class="flex-shrink-0">
            <span v-if="search.type === 'submission'" 
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <FileText class="h-3 w-3" />
              Lead
            </span>
            <span v-else-if="search.convertedToLead" 
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              <Search class="h-3 w-3" />
              → Lead
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
            </p>
            <!-- Contact Info: name, email, phone -->
            <div v-if="search.name || search.email || search.phone" class="mt-1 text-xs">
              <!-- Name always visible -->
              <span v-if="search.name" class="inline-flex items-center gap-1 text-gray-600">
                <User class="w-3 h-3" /> {{ search.name }}
              </span>
              <span v-if="search.email" class="inline-flex items-center gap-1 ml-2 text-gray-500">
                <Mail class="w-3 h-3" /> {{ search.email }}
              </span>
              <span v-if="search.phone" class="inline-flex items-center gap-1 ml-2 text-gray-500">
                <Phone class="w-3 h-3" /> {{ search.phone }}
              </span>
            </div>
          </div>
          <!-- Time & View Button -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="text-xs text-muted-foreground whitespace-nowrap">
              {{ formatDate(search.createdAt) }}
            </span>
            <a 
              v-if="search.leadId" 
              :href="getLeadUrl(search.leadId)" 
              target="_blank"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors"
              @click.stop
            >
              <ExternalLink class="w-3 h-3" />
              View
            </a>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Legend Modal -->
  <Teleport to="body">
    <div 
      v-if="showLegendModal" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      @click.self="showLegendModal = false"
    >
      <Card class="w-full max-w-sm relative">
        <!-- Close button -->
        <button 
          @click="showLegendModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X class="w-5 h-5" />
        </button>

        <CardHeader>
          <CardTitle class="text-lg">Activity Legend</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Search -->
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap flex-shrink-0">
              <Search class="h-3 w-3" />
              Search
            </span>
            <p class="text-sm text-gray-600">A visitor searched an address using your roof estimator tool.</p>
          </div>
          <!-- Converted -->
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 whitespace-nowrap flex-shrink-0">
              <Search class="h-3 w-3" />
              → Lead
            </span>
            <p class="text-sm text-gray-600">A search that later converted into a lead submission.</p>
          </div>
          <!-- Lead -->
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap flex-shrink-0">
              <FileText class="h-3 w-3" />
              Lead
            </span>
            <p class="text-sm text-gray-600">A visitor submitted their contact info to request a quote.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </Teleport>
</template>

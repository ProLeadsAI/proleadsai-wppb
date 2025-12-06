<script setup>
import { Search, FileText } from 'lucide-vue-next'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui'

defineProps({
  searches: { type: Array, default: () => [] },
  formatDate: { type: Function, required: true }
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="searches.length === 0" class="text-muted-foreground text-sm py-4 text-center">
        No activity yet
      </div>
      <div v-else class="space-y-3">
        <div v-for="search in searches" :key="search.id" 
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
</template>

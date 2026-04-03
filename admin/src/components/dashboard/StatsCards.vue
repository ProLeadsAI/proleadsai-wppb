<script setup>
import { Search, Users, FileText, DollarSign, Fuel, Gauge } from 'lucide-vue-next'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui'

defineProps({
  stats: { type: Object, required: true }
})
</script>

<template>
  <div class="grid gap-4 grid-cols-2 xl:grid-cols-3">
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

    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Credits Remaining</CardTitle>
        <Fuel class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ stats.creditsRemaining }}<span class="text-sm text-muted-foreground"> / {{ stats.creditsLimit }}</span></div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Credits Used</CardTitle>
        <Gauge class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ stats.creditsUsed }}</div>
      </CardContent>
    </Card>
  </div>
</template>

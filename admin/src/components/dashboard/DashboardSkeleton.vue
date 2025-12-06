<script setup>
import { Card, CardHeader, CardContent } from '@/components/ui'
</script>

<template>
  <div class="space-y-6">
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
</template>

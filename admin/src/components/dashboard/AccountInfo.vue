<script setup>
import { Settings } from 'lucide-vue-next'
import { Button, Card, CardHeader, CardContent, CardTitle } from '@/components/ui'

defineProps({
  state: { type: Object, required: true }
})

const emit = defineEmits(['edit-settings'])
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle>Account Info</CardTitle>
      <Button variant="outline" size="sm" @click="emit('edit-settings')">
        <Settings class="w-4 h-4 mr-2" />
        Edit Settings
      </Button>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
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
          <span class="text-sm text-muted-foreground">Website</span>
          <p class="font-medium truncate">{{ state.domain_name || 'Not connected yet' }}</p>
        </div>
        <div>
          <span class="text-sm text-muted-foreground">Plan</span>
          <p class="font-medium capitalize">{{ state.plan || 'free' }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

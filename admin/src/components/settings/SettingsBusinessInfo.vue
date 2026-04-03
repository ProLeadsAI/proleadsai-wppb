<script setup>
import { Loader2 } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Select } from '@/components/ui'
import { TIMEZONES } from '@/lib/constants'

defineProps({
  state: { type: Object, required: true },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'show-reset-modal'])
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Business Information</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="emit('save')" class="space-y-6">
        <div class="space-y-2">
          <Label>Company Name</Label>
          <Input v-model="state.business" placeholder="Your Company Name" />
        </div>

        <div class="space-y-2">
          <Label>Email</Label>
          <Input
            v-model="state.email"
            type="email"
            disabled
            class="bg-gray-100"
          />
          <p class="text-sm text-muted-foreground">
            Email cannot be changed in WordPress settings.
            <Button variant="link" class="p-0 h-auto text-destructive" @click="emit('show-reset-modal')">
              Reset all settings
            </Button>
            to use a different email.
          </p>
        </div>

        <div class="space-y-2">
          <Label>Connected Site URL</Label>
          <Input
            :model-value="state.domain_name || 'Will be set automatically from this WordPress site'"
            disabled
            class="bg-gray-100"
          />
        </div>

        <div class="space-y-2">
          <Label>Price per Square Foot ($)</Label>
          <Input
            v-model="state.price_per_sq"
            type="number"
            placeholder="750"
          />
        </div>

        <div class="space-y-2">
          <Label>Timezone</Label>
          <Select v-model="state.timezone">
            <option value="">Select timezone...</option>
            <option v-for="tz in TIMEZONES" :key="tz.value" :value="tz.value">
              {{ tz.label }}
            </option>
          </Select>
        </div>

        <p class="text-sm text-muted-foreground">
          Google Maps and Google Solar API keys are no longer required in the WordPress plugin. The hosted ProLeadsAI widget handles address search and roof estimation through the iframe integration.
        </p>

        <Button type="submit" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
          {{ isSaving ? 'Saving...' : 'Update Business Settings' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>

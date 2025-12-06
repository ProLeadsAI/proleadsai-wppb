<script setup>
import { Loader2, CheckCircle, XCircle } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Select } from '@/components/ui'
import { TIMEZONES } from '@/lib/constants'

const props = defineProps({
  state: { type: Object, required: true },
  siteDomain: { type: String, default: '' },
  apiValidation: { type: Object, default: () => ({}) },
  isValidating: { type: Boolean, default: false },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'show-api-help'])
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
          <p class="text-sm text-muted-foreground">Email cannot be changed from this page.</p>
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

        <div class="space-y-2">
          <Label>Google Maps API Key</Label>
          <Input 
            v-model="state.google_maps_api_key" 
            :placeholder="`AIzaSy... (allow ${siteDomain})`"
          />
          <p class="text-sm text-muted-foreground">
            <Button variant="link" class="p-0 h-auto text-primary" @click="emit('show-api-help')">
              Learn how to get an API key
            </Button>
          </p>
          
          <!-- API Validation Results -->
          <div v-if="apiValidation.checked" class="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-3">
            <p class="text-sm font-medium mb-3">API Key Validation</p>
            <div class="flex items-center gap-2">
              <div :class="apiValidation.places?.valid ? 'text-green-600' : 'text-red-600'">
                <CheckCircle v-if="apiValidation.places?.valid" class="w-5 h-5" />
                <XCircle v-else class="w-5 h-5" />
              </div>
              <span class="text-sm">Places API (Autocomplete)</span>
            </div>
            <p v-if="!apiValidation.places?.valid && apiValidation.places?.message" class="text-xs text-red-600 ml-7">
              {{ apiValidation.places.message }}
            </p>
            <div class="flex items-center gap-2">
              <div :class="apiValidation.solar?.valid ? 'text-green-600' : 'text-red-600'">
                <CheckCircle v-if="apiValidation.solar?.valid" class="w-5 h-5" />
                <XCircle v-else class="w-5 h-5" />
              </div>
              <span class="text-sm">Solar API (Roof Estimates)</span>
            </div>
            <p v-if="!apiValidation.solar?.valid && apiValidation.solar?.message" class="text-xs text-red-600 ml-7">
              {{ apiValidation.solar.message }}
            </p>
          </div>
          
          <div v-if="isValidating" class="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            Validating API key...
          </div>
        </div>

        <Button type="submit" :disabled="isSaving || isValidating">
          <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
          {{ isSaving ? 'Saving...' : 'Update Business Settings' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>

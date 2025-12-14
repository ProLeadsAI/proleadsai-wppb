<script setup>
import { Loader2, CheckCircle, XCircle } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Select } from '@/components/ui'
import { TIMEZONES } from '@/lib/constants'

const props = defineProps({
  state: { type: Object, required: true },
  siteDomain: { type: String, default: '' },
  apiDomain: { type: String, default: '' },
  placesValidation: { type: Object, default: () => ({}) },
  solarValidation: { type: Object, default: () => ({}) },
  isValidatingPlaces: { type: Boolean, default: false },
  isValidatingSolar: { type: Boolean, default: false },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'show-places-api-help', 'show-solar-api-help', 'validate-solar'])
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
          <Label>Google Places API Key</Label>
          <Input 
            v-model="state.google_maps_api_key" 
            placeholder="AIzaSy..."
          />
          <p class="text-sm text-muted-foreground">
            <Button variant="link" class="p-0 h-auto text-primary" @click="emit('show-places-api-help')">
              Learn how to get a Places API key
            </Button>
          </p>
          
          <!-- API Validation Results -->
          <div v-if="placesValidation.checked" class="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-3">
            <p class="text-sm font-medium mb-3">API Key Validation</p>

            <p class="text-xs text-muted-foreground">WordPress site domain: <strong>{{ siteDomain }}</strong></p>
            <div class="flex items-center gap-2">
              <div :class="placesValidation.domains?.site?.places?.valid ? 'text-green-600' : 'text-red-600'">
                <CheckCircle v-if="placesValidation.domains?.site?.places?.valid" class="w-5 h-5" />
                <XCircle v-else class="w-5 h-5" />
              </div>
              <span class="text-sm">WP Domain — Places API (Autocomplete)</span>
            </div>
            <p v-if="!placesValidation.domains?.site?.places?.valid && placesValidation.domains?.site?.places?.message" class="text-xs text-red-600 ml-7">
              {{ placesValidation.domains.site.places.message }}
            </p>

            <div class="border-t pt-3"></div>

            <p class="text-xs text-muted-foreground">App service domain: <strong>{{ apiDomain || 'next.proleadsai.com' }}</strong></p>
            <div class="flex items-center gap-2">
              <div :class="placesValidation.domains?.app?.places?.valid ? 'text-green-600' : 'text-red-600'">
                <CheckCircle v-if="placesValidation.domains?.app?.places?.valid" class="w-5 h-5" />
                <XCircle v-else class="w-5 h-5" />
              </div>
              <span class="text-sm">App Domain — Places API (Autocomplete)</span>
            </div>
            <p v-if="!placesValidation.domains?.app?.places?.valid && placesValidation.domains?.app?.places?.message" class="text-xs text-red-600 ml-7">
              {{ placesValidation.domains.app.places.message }}
            </p>
          </div>
          
          <div v-if="isValidatingPlaces" class="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            Validating API key...
          </div>
        </div>

        <div class="space-y-2">
          <Label>Google Solar API Key</Label>
          <Input 
            v-model="state.google_solar_api_key" 
            placeholder="AIzaSy... (no referrer restrictions)"
          />
          <p class="text-sm text-muted-foreground">
            <Button variant="link" class="p-0 h-auto text-primary" @click="emit('show-solar-api-help')">
              Learn how to get a Solar API key
            </Button>
          </p>
          
          <div class="mt-2">
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              :disabled="isValidatingSolar || !state.google_solar_api_key?.trim()" 
              @click="emit('validate-solar')"
            >
              <Loader2 v-if="isValidatingSolar" class="w-4 h-4 mr-2 animate-spin" />
              {{ isValidatingSolar ? 'Validating...' : 'Validate Solar Key' }}
            </Button>
          </div>
          
          <!-- Solar API Validation Results -->
          <div v-if="solarValidation.checked" class="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-3">
            <p class="text-sm font-medium mb-2">Solar API Validation (Server-Side)</p>
            <p class="text-xs text-muted-foreground mb-2">Tested from: <strong>{{ apiDomain || 'next.proleadsai.com' }}</strong></p>

            <div class="flex items-center gap-2">
              <div :class="solarValidation.valid ? 'text-green-600' : 'text-red-600'">
                <CheckCircle v-if="solarValidation.valid" class="w-5 h-5" />
                <XCircle v-else class="w-5 h-5" />
              </div>
              <span class="text-sm">Solar API</span>
            </div>
            <p v-if="solarValidation.message" :class="solarValidation.valid ? 'text-xs text-green-600 ml-7' : 'text-xs text-red-600 ml-7'">
              {{ solarValidation.message }}
            </p>

            <div v-if="solarValidation.valid" class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p class="text-sm text-green-700 dark:text-green-300 font-medium">
                ✓ Solar API key is valid and working!
              </p>
            </div>
          </div>
          
          <div v-if="isValidatingSolar" class="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            Testing Solar API...
          </div>
        </div>

        <Button type="submit" :disabled="isSaving || isValidatingPlaces || isValidatingSolar">
          <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
          {{ isSaving ? 'Saving...' : 'Update Business Settings' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>

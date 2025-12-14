<script setup>
import { Input, Label, Select } from '@/components/ui'

const props = defineProps({
  state: { type: Object, required: true }
})

const emit = defineEmits([
  'update:primary_color',
  'update:text_color',
  'update:button_position',
  'update:price_per_sq',
  'update:timezone'
])

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (EST)' },
  { value: 'America/Chicago', label: 'Central Time (CST)' },
  { value: 'America/Denver', label: 'Mountain Time (MST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
]
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label>Primary Color</Label>
      <div class="flex gap-2">
        <input 
          :value="state.primary_color" 
          @input="emit('update:primary_color', $event.target.value)"
          type="color" 
          class="w-12 h-10 p-1 border rounded-md cursor-pointer" 
        />
        <Input 
          :model-value="state.primary_color"
          @update:model-value="emit('update:primary_color', $event)"
          class="flex-1" 
        />
      </div>
    </div>
    <div class="space-y-2">
      <Label>Text Color</Label>
      <div class="flex gap-2">
        <input 
          :value="state.text_color" 
          @input="emit('update:text_color', $event.target.value)"
          type="color" 
          class="w-12 h-10 p-1 border rounded-md cursor-pointer" 
        />
        <Input 
          :model-value="state.text_color"
          @update:model-value="emit('update:text_color', $event)"
          class="flex-1" 
        />
      </div>
    </div>
    <div class="space-y-2">
      <Label>Button Position</Label>
      <Select 
        :model-value="state.button_position"
        @update:model-value="emit('update:button_position', $event)"
      >
        <option value="bottom-left">Bottom Left</option>
        <option value="bottom-center">Bottom Center</option>
        <option value="bottom-right">Bottom Right</option>
      </Select>
    </div>
    <div class="space-y-2">
      <Label>Price per Square Foot ($)</Label>
      <Input 
        :model-value="state.price_per_sq"
        @update:model-value="emit('update:price_per_sq', $event)"
        type="number" 
        placeholder="750"
      />
    </div>
    <div class="space-y-2">
      <Label>Timezone</Label>
      <Select 
        :model-value="state.timezone"
        @update:model-value="emit('update:timezone', $event)"
      >
        <option value="">Select timezone...</option>
        <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
          {{ tz.label }}
        </option>
      </Select>
    </div>
  </div>
</template>

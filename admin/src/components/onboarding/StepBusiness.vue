<script setup>
import { Input, Label } from '@/components/ui'

const props = defineProps({
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'submit'])
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label>Business Name</Label>
      <Input 
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        placeholder="Enter your business name"
        @keyup.enter="modelValue.trim() && emit('submit')"
      />
    </div>
  </div>
</template>

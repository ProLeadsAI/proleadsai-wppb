<script setup>
import { computed } from 'vue'
import { Input, Label } from '@/components/ui'

const props = defineProps({
  modelValue: { type: String, default: '' },
  organizations: { type: Array, default: () => [] },
  selectedOrgId: { type: String, default: '' },
  requiresSelection: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:selectedOrgId', 'submit'])

const hasOrganizations = computed(() => props.organizations.length > 0)
</script>

<template>
  <div class="space-y-4">
    <div v-if="hasOrganizations" class="space-y-2">
      <Label>Choose an organization to connect</Label>
      <select
        :value="selectedOrgId"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        @change="emit('update:selectedOrgId', $event.target.value)"
      >
        <option value="" disabled>
          Select an organization
        </option>
        <option v-for="organization in organizations" :key="organization.id" :value="organization.id">
          {{ organization.name }}
        </option>
      </select>
      <p class="text-sm text-gray-500">
        We found existing ProLeadsAI organizations on this account that are available for WordPress.
      </p>
    </div>

    <div v-else class="space-y-2">
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

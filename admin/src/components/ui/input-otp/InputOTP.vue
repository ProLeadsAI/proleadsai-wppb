<script setup>
import { ref, provide, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  maxlength: { type: Number, default: 6 },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'complete'])

const slots = ref([])

// Register slot refs
provide('otp-register', (index, el) => {
  slots.value[index] = el
})

provide('otp-value', computed(() => props.modelValue))
provide('otp-disabled', computed(() => props.disabled))

provide('otp-input', (index, char) => {
  const current = props.modelValue.split('')
  current[index] = char
  const newValue = current.join('').slice(0, props.maxlength)
  emit('update:modelValue', newValue)
  
  // Auto-focus next
  if (char && index < props.maxlength - 1) {
    slots.value[index + 1]?.focus()
  }
  
  // Check complete
  if (newValue.length === props.maxlength) {
    emit('complete', newValue)
  }
})

provide('otp-backspace', (index) => {
  const current = props.modelValue.split('')
  if (current[index]) {
    current[index] = ''
    emit('update:modelValue', current.join(''))
  } else if (index > 0) {
    current[index - 1] = ''
    emit('update:modelValue', current.join(''))
    slots.value[index - 1]?.focus()
  }
})

provide('otp-paste', (text) => {
  const clean = text.replace(/\D/g, '').slice(0, props.maxlength)
  emit('update:modelValue', clean)
  if (clean.length === props.maxlength) {
    emit('complete', clean)
  }
})
</script>

<template>
  <div data-slot="input-otp">
    <slot />
  </div>
</template>

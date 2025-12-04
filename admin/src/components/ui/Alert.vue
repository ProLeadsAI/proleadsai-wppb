<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'destructive', 'success'].includes(v)
  },
  class: String
})

const variantClasses = {
  default: 'bg-background text-foreground',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
  success: 'border-green-500/50 text-green-700 bg-green-50 dark:border-green-500 [&>svg]:text-green-500'
}

const classes = computed(() => cn(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  variantClasses[props.variant],
  props.class
))
</script>

<template>
  <div :class="classes" role="alert">
    <slot />
  </div>
</template>

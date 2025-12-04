<script setup>
import { ref, computed } from 'vue'
import { CalendarIcon } from 'lucide-vue-next'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['update:modelValue'])

// Default to last 30 days using CalendarDate
const todayDate = today(getLocalTimeZone())
const thirtyDaysAgo = todayDate.subtract({ days: 30 })

const internalRange = ref({
  start: thirtyDaysAgo,
  end: todayDate
})

// Quick select presets
const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 60 days', days: 60 },
  { label: 'Last 52 weeks', days: 364 },
  { label: 'YTD', ytd: true },
]

function selectPreset(preset) {
  const now = today(getLocalTimeZone())
  let start
  
  if (preset.ytd) {
    // Year to date - from Jan 1 of current year
    start = new CalendarDate(now.year, 1, 1)
  } else {
    start = now.subtract({ days: preset.days })
  }
  
  const newRange = { start, end: now }
  internalRange.value = newRange
  emit('update:modelValue', {
    start: { year: start.year, month: start.month, day: start.day },
    end: { year: now.year, month: now.month, day: now.day }
  })
}

function onRangeChange(val) {
  internalRange.value = val
  if (val?.start && val?.end) {
    emit('update:modelValue', {
      start: { year: val.start.year, month: val.start.month, day: val.start.day },
      end: { year: val.end.year, month: val.end.month, day: val.end.day }
    })
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date.year, date.month - 1, date.day)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const displayText = computed(() => {
  if (internalRange.value?.start && internalRange.value?.end) {
    return `${formatDate(internalRange.value.start)} - ${formatDate(internalRange.value.end)}`
  }
  return 'Pick a date range'
})
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn(
          'w-[260px] justify-start text-left font-normal',
          !internalRange?.start && 'text-muted-foreground',
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ displayText }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="end">
      <div class="flex">
        <!-- Quick select presets -->
        <div class="flex flex-col gap-1 border-r p-3">
          <p class="text-xs font-medium text-muted-foreground mb-2">Quick Select</p>
          <button
            v-for="preset in presets"
            :key="preset.label"
            @click="selectPreset(preset)"
            class="text-left text-sm px-3 py-1.5 rounded-md hover:bg-accent transition-colors whitespace-nowrap"
          >
            {{ preset.label }}
          </button>
        </div>
        <!-- Calendar -->
        <RangeCalendar
          :model-value="internalRange"
          @update:model-value="onRangeChange"
          :number-of-months="2"
          initial-focus
        />
      </div>
    </PopoverContent>
  </Popover>
</template>

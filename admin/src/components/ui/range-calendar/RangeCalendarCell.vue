<script setup>
import { reactiveOmit } from "@vueuse/core";
import { RangeCalendarCell, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps({
  date: { type: null, required: true },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <RangeCalendarCell
    data-slot="range-calendar-cell"
    :class="
      cn(
        'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
        // Selected range background (but not for outside view)
        '[&:has([data-selected]:not([data-outside-view]))]:bg-accent first:[&:has([data-selected]:not([data-outside-view]))]:rounded-l-md last:[&:has([data-selected]:not([data-outside-view]))]:rounded-r-md [&:has([data-selected][data-selection-end]:not([data-outside-view]))]:rounded-r-md [&:has([data-selected][data-selection-start]:not([data-outside-view]))]:rounded-l-md',
        // Highlighted range (preview while selecting, but not for outside view)
        '[&:has([data-highlighted]:not([data-outside-view]))]:bg-accent [&:has([data-highlighted][data-selection-start]:not([data-outside-view]))]:rounded-l-md [&:has([data-highlighted][data-selection-end]:not([data-outside-view]))]:rounded-r-md',
        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <slot />
  </RangeCalendarCell>
</template>

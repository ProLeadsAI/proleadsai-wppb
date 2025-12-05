<script setup>
import { reactiveOmit } from "@vueuse/core";
import { RangeCalendarCellTrigger, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps({
  day: { type: null, required: true },
  month: { type: null, required: true },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false, default: "button" },
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <RangeCalendarCellTrigger
    data-slot="range-calendar-trigger"
    :class="
      cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        'h-8 w-8 p-0 font-normal data-[selected]:opacity-100 cursor-pointer hover:bg-accent hover:text-accent-foreground',
        '[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground',
        // Selection Start
        'data-[selection-start]:bg-primary data-[selection-start]:text-primary-foreground',
        // Selection End
        'data-[selection-end]:bg-primary data-[selection-end]:text-primary-foreground',
        // Highlighted (range preview while hovering)
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        // Outside months - hide them
        'data-[outside-view]:invisible',
        // Disabled
        'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
        // Unavailable
        'data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through',
        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <slot />
  </RangeCalendarCellTrigger>
</template>

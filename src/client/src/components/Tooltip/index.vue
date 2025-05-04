<script setup lang="ts">
import { TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from 'radix-vue'

defineProps<{
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}>()
</script>

<template>
  <TooltipProvider>
    <TooltipRoot>
      <TooltipTrigger class="cursor-pointer">
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent :side="side" :align="align" class="bg-black text-white text-sm p-2 rounded-md">
          {{ content }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
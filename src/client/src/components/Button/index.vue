<template>
  <button
    class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
    :class="[
      variant === 'primary' ? 'bg-sky-600 text-white hover:bg-sky-700' : '',
      variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' : '',
      variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

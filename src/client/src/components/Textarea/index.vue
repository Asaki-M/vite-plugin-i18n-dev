<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  maxlength?: number
  readonly?: boolean
  rows?: number
  cols?: number
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  maxlength: undefined,
  readonly: false,
  rows: 3,
  cols: 20
})

const emit = defineEmits<{
  (e: 'pressEnter'): void
}>()

const model = defineModel({ type: String })

const handlePressEnter = () => {
  emit('pressEnter')
}
</script>

<template>
  <textarea class="bg-slate-300 rounded-md p-2 focus:border-0 outline-0 w-full" v-model="model"
    :placeholder="placeholder" :disabled="disabled" :maxlength="maxlength" :readonly="readonly" :rows="rows"
    :cols="cols" autofocus @keydown.enter="handlePressEnter" />
</template>

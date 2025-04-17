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
  'update:modelValue': [value: string]
  'change': [value: string] 
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

const handleInput = (e: Event) => {
  const value = (e.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
  emit('change', value)
}

const handleFocus = (e: FocusEvent) => {
  emit('focus', e)
}

const handleBlur = (e: FocusEvent) => {
  emit('blur', e)
}
</script>

<template>
  <textarea
    class="bg-slate-100 rounded-md p-2 focus:border-0 outline-0"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    :readonly="readonly"
    :rows="rows"
    :cols="cols"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

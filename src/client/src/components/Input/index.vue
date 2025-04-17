<script setup lang="ts">
interface Props {
  modelValue?: string | number
  placeholder?: string
  disabled?: boolean
  type?: 'text' | 'password' | 'number'
  maxlength?: number
  readonly?: boolean
  clearable?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  type: 'text',
  maxlength: undefined,
  readonly: false,
  clearable: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'change': [value: string | number]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
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
  <input class="bg-slate-100 rounded-md p-2 focus:border-0 outline-0" :value="modelValue" :type="type" :placeholder="placeholder"
    :disabled="disabled" :maxlength="maxlength" :readonly="readonly" @input="handleInput" @focus="handleFocus"
    @blur="handleBlur" />
</template>

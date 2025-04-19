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

const props = withDefaults(defineProps<Props>(), {
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
  'enter': [value: string | number]
}>()

const isEditing = ref(false);
const originalValue = ref(props.modelValue);

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
  emit('update:modelValue', originalValue.value);
  isEditing.value = false;
}

const handleEnter = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    emit('enter', props.modelValue);
    originalValue.value = props.modelValue;
    isEditing.value = false;
  } else if (e.key === 'Escape') {
    isEditing.value = false;
    emit('update:modelValue', originalValue.value);
  }
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  originalValue.value = props.modelValue;
}

</script>

<template>
  <div @dblclick="toggleEdit" class="w-full">
    <input v-if="isEditing" class="bg-slate-100 rounded-md p-2 focus:border-0 outline-0 w-full" :value="modelValue"
      :type="type" :placeholder="placeholder" :disabled="disabled" :maxlength="maxlength" :readonly="readonly" autofocus
      @input="handleInput" @focus="handleFocus" @blur="handleBlur" @keydown="handleEnter" />
    <div class="w-full" v-else>{{ modelValue }}</div>
  </div>
</template>

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

const props = withDefaults(defineProps<Props>(), {
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
  'enter': [value: string]
}>()

const isEditing = ref(false);
const originalValue = ref(props.modelValue);

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
  emit('update:modelValue', originalValue.value);
  isEditing.value = false;
}

const handleEnter = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
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
    <textarea v-if="isEditing" class="bg-slate-100 rounded-md p-2 focus:border-0 outline-0 w-full" :value="modelValue"
      :placeholder="placeholder" :disabled="disabled" :maxlength="maxlength" :readonly="readonly" :rows="rows"
      :cols="cols" autofocus @input="handleInput" @focus="handleFocus" @blur="handleBlur" @keydown="handleEnter" />
    <span v-else>{{ modelValue }}</span>
  </div>
</template>

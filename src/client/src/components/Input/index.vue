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
  (e: 'pressEnter'): void
}>()

const model = defineModel({ type: String })

const handlePressEnter = () => {
  emit('pressEnter')
}
</script>

<template>
  <input class="bg-slate-300 rounded-md p-2 focus:border-0 outline-0 w-full" v-model="model" :type="type"
    :placeholder="placeholder" :disabled="disabled" :maxlength="maxlength" :readonly="readonly" autofocus
    @keydown.enter="handlePressEnter" />
</template>

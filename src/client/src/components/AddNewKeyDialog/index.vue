<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'radix-vue'

const {
  locales
} = defineProps<{
  locales: string[]
}>()

const emit = defineEmits<{
  (e: 'create', fullKey: string, localeValues: Record<string, string>): void
}>()

const localesKeys = ref<string[]>([])
watch(() => locales, (newVal) => {
  localesKeys.value = newVal
})

const open = ref(false)
const data = ref({
  fullKey: '',
  isRoot: false,
})

const keyValue = ref('')
const localeValues = ref<Record<string, string>>({})

watch(localesKeys, (newVal) => {
  // 初始化 localeValues
  const obj: Record<string, string> = {}
  newVal.forEach(locale => {
    if (!(locale in localeValues.value)) {
      obj[locale] = ''
    } else {
      obj[locale] = localeValues.value[locale]
    }
  })
  localeValues.value = obj
}, { immediate: true })

const onOpen = ({ fullKey, isRoot }: { fullKey: string, isRoot: boolean }): void => {
  data.value.fullKey = fullKey
  data.value.isRoot = isRoot
  open.value = true
}

const onClose = (): void => {
  open.value = false
  keyValue.value = ''
  localeValues.value = {}
}

const onCreate = () => {
  const fullKey = data.value.isRoot ? keyValue.value : data.value.fullKey + '.' + keyValue.value
  emit('create', fullKey, localeValues.value)
  onClose()
}

defineExpose({
  open: onOpen,
  close: onClose,
})
</script>

<template>
  <DialogRoot :open="open">
    <DialogPortal>
      <DialogOverlay
        class="bg-black opacity-30 data-[state=open]:animate-overlayShow fixed inset-0 z-30 transition-colors" />
      <DialogContent
        class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]">
        <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
          Add a new key for <span class="text-sky-700">{{ data.fullKey }}</span>
        </DialogTitle>
        <div class="flex flex-col mt-8 gap-8">
          <div class="flex gap-2 items-center">
            <label class="w-16 text-base text-sky-700" for="key"> Key </label>
            <input id="key" v-model="keyValue"
              class="h-10 w-full flex-1 rounded-md border-none outline-none bg-slate-200 p-4">
          </div>
          <div class="flex gap-2 items-center" v-for="locale in localesKeys" :key="locale">
            <label class="w-16 text-base text-sky-700" :for="locale"> {{ locale }} </label>
            <input :id="locale" v-model="localeValues[locale]"
              class="h-10 w-full flex-1 rounded-md border-none outline-none bg-slate-200 p-4">
          </div>
        </div>
        <div class="mt-[25px] flex justify-end">
          <DialogClose as-child>
            <button @click="onCreate"
              class="flex items-center justify-center cursor-pointer bg-sky-700 text-white px-4 py-2 rounded-md hover:bg-sky-600 transition-colors active:bg-sky-800">
              Create
            </button>
          </DialogClose>
        </div>
        <DialogClose
          class="absolute top-6 right-6 inline-flex cursor-pointer appearance-none items-center justify-center rounded-full"
          aria-label="Close" @click="onClose">
          <img src="@/assets/icons/close.svg" class="h-5 w-5" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
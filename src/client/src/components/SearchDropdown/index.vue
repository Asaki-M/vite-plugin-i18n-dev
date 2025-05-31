<script setup lang="ts">
import type { TreeItem } from '../../data.d'
import { ComboboxAnchor, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxRoot, ComboboxSeparator, ComboboxViewport } from 'radix-vue'

const props = defineProps<{
  originData: TreeItem[]
}>()

const emit = defineEmits<{
  (e: 'select', key: string): void
  (e: 'clear'): void
}>()

const v = ref('')

const flattenedOptions = computed(() => {
  function flattenTreeItems(data: TreeItem[]): TreeItem[] {
    const result: TreeItem[] = []

    function traverse(items: TreeItem[]) {
      items.forEach(item => {
        if ((item.fullKey || item.key) && !item.children) {
          result.push(item)
        }

        if (item.children && item.children.length > 0) {
          traverse(item.children)
        }
      })
    }

    traverse(data)
    return result
  }

  return flattenTreeItems(props.originData).map(item => item.key)
})

const handleSelectItem = (event: { detail: { value?: string } }) => {
  if (event.detail?.value) {
    emit('select', event.detail.value)
  }
}

const handleClear = () => {
  v.value = ''
  emit('clear')
}
</script>

<template>
  <ComboboxRoot v-model="v" class="relative">
    <ComboboxAnchor
      class="min-w-[160px] inline-flex items-center justify-between rounded-md px-3 py-2 text-sm leading-none h-[35px] gap-2 bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 focus:shadow-[0_0_0_2px] focus:shadow-sky-600/20 focus:border-sky-600 outline-none transition-colors">
      <ComboboxInput
        class="!bg-transparent outline-none text-gray-900 h-full flex-1 selection:bg-sky-600/20 placeholder:text-gray-500"
        placeholder="Search Row..." />
      <img v-if="v" src="@/assets/icons/close.svg" alt="search" class="w-4 h-4 text-gray-400" @click="handleClear" />
    </ComboboxAnchor>

    <ComboboxContent
      class="absolute z-10 w-full mt-1 min-w-[160px] bg-white overflow-hidden rounded-md border border-gray-200 shadow-lg will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade">
      <ComboboxViewport class="p-1 max-h-[200px] overflow-y-auto">
        <ComboboxEmpty class="text-gray-500 text-sm font-medium text-center py-3">No options</ComboboxEmpty>

        <ComboboxGroup>
          <ComboboxItem v-for="(option, index) in flattenedOptions" :key="index"
            class="text-sm leading-none text-gray-900 rounded-md flex items-center h-8 pr-8 pl-8 relative select-none cursor-pointer data-[disabled]:text-gray-400 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-sky-600 data-[highlighted]:text-white transition-colors hover:bg-gray-100 data-[highlighted]:hover:bg-sky-600"
            :value="option" @select="handleSelectItem">
            <ComboboxItemIndicator class="absolute left-0 w-8 inline-flex items-center justify-center">
              <img src="@/assets/icons/check.svg" alt="check" class="w-4 h-4" />
            </ComboboxItemIndicator>
            <span>
              {{ option }}
            </span>
          </ComboboxItem>
          <ComboboxSeparator class="h-px bg-gray-200 my-1" />
        </ComboboxGroup>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>
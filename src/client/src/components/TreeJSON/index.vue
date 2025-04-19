<script setup lang="ts">
import { TreeItem, TreeRoot } from 'radix-vue'
import type { TreeItem as TreeItemType } from './index.d'

const {
  treeData
} = defineProps<{
  treeData: TreeItemType[]
}>()

const emit = defineEmits<{
  (e: 'keyEnter', fullKey: string, value: string): void
  (e: 'valueEnter', fullKey: string, value: string): void
}>()

const handleTreeItemKeyEnter = (fullKey: string, value: string) => {
  emit('keyEnter', fullKey, value)
}

const handleTreeItemValueEnter = (fullKey: string, value: string) => {
  emit('valueEnter', fullKey, value)
}

const handleCopyFullKey = (fullKey: string) => {
  navigator.clipboard.writeText(fullKey)
}
</script>

<template>
  <TreeRoot v-slot="{ flattenItems }"
    class="list-none select-none w-full bg-white text-blackA11 rounded-lg p-2 text-sm font-medium" :items="treeData"
    :get-key="(item) => item.title" :default-expanded="['components']">
    <TreeItem v-for="item in flattenItems" v-slot="{ isExpanded }" :key="item._id"
      :style="{ 'padding-left': `${item.level - 0.5}rem` }" v-bind="item.bind"
      class="flex items-center py-2 px-2 rounded outline-none"
      :class="{ 'border-b-2 border-gray-200': !item.hasChildren, 'bg-gray-100': item.hasChildren }">
      <template v-if="item.hasChildren">
        <img src="@/assets/icons/expand.svg" v-if="!isExpanded" class="h-4 w-4" />
        <img src="@/assets/icons/collapse.svg" v-else class="h-4 w-4" />
      </template>
      <div class="pl-2 w-full">
        <span v-if="item.hasChildren" class="font-bold">{{ item.value.title }}</span>
        <div v-else class="grid grid-cols-[20%_40%_40%] items-center w-full gap-2 py-2">
          <div class="flex gap-2 items-center cursor-pointer text-sky-700"
            @click="() => handleCopyFullKey(item.value.fullKey)">
            <img src="@/assets/icons/copy.svg" class="h-4 w-4 shrink-0 mt-1" />
            <div class="flex-1">Copy Full Key</div>
          </div>
          <div>
            <Input v-model="item.value.key"
              @enter="(value: string) => handleTreeItemKeyEnter(item.value.fullKey, value)" />
          </div>
          <div>
            <Textarea v-model="item.value.value"
              @enter="(value: string) => handleTreeItemValueEnter(item.value.fullKey, value)" />
          </div>
        </div>
      </div>
    </TreeItem>
  </TreeRoot>
</template>

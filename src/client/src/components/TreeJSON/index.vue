<script setup lang="ts">
import { TreeItem, TreeRoot } from 'radix-vue'
import type { TreeItem as TreeItemType } from './index.d'
import AddNewKeyDialog from '../AddNewKeyDialog/index.vue'

const {
  treeData
} = defineProps<{
  treeData: TreeItemType[]
}>()

const emit = defineEmits<{
  (e: 'keyEnter', fullKey: string, value: string): void
  (e: 'valueEnter', fullKey: string, locale: string, value: string): void
  (e: 'delete', fullKey: string): void
  (e: 'addNewKey', fullKey: string, localeValues: Record<string, string>): void
}>()

const locales = computed(() => {
  const treeItem = treeData?.[0]?.value
  return treeItem ? Object.keys(treeItem) : []
})

const addNewKeyDialogRef = ref<InstanceType<typeof AddNewKeyDialog> | null>(null)

const handleTreeItemKeyEnter = (fullKey: string, value: string) => {
  emit('keyEnter', fullKey, value)
}

const handleTreeItemValueEnter = (fullKey: string, locale: string, value: string) => {
  emit('valueEnter', fullKey, locale, value)
}

const handleDeleteTreeItem = (fullKey: string) => {
  emit('delete', fullKey)
}

const handleCopyFullKey = (fullKey: string) => {
  navigator.clipboard.writeText(fullKey)
}

const handleAddNewKey = (isRoot: boolean, fullKey: string) => {
  addNewKeyDialogRef.value?.open({ isRoot, fullKey })
}

const handleCreate = (fullKey: string, localeValues: Record<string, string>) => {
  emit('addNewKey', fullKey, localeValues)
}
</script>

<template>
  <AddNewKeyDialog ref="addNewKeyDialogRef" :locales="locales" @create="handleCreate" />
  <TreeRoot v-slot="{ flattenItems }"
    class="list-none select-none w-full bg-white text-blackA11 rounded-lg p-2 text-sm font-medium" :items="treeData"
    :get-key="(item) => item.title" :default-expanded="['components']">
    <div class="pl-4 flex items-center gap-2 cursor-pointer" @click="() => handleAddNewKey(true, 'Root')">
      <img src="@/assets/icons/circle-plus.svg" class="h-3.5 w-3.5 shrink-0" />
      <span class="text-sky-700 text-sm">Add a new key for root</span>
    </div>
    <TreeItem v-for="item in flattenItems" v-slot="{ isExpanded }" :key="item._id"
      :style="{ 'padding-left': `${item.level - 0.5}rem` }" v-bind="item.bind"
      class="flex items-center py-2 px-2 rounded outline-none"
      :class="{ 'border-b-2 border-gray-200': !item.hasChildren, 'bg-gray-100': item.hasChildren }">
      <template v-if="item.hasChildren">
        <img src="@/assets/icons/expand.svg" v-if="!isExpanded" class="h-4 w-4" />
        <img src="@/assets/icons/collapse.svg" v-else class="h-4 w-4" />
      </template>
      <div class="pl-2 w-full">
        <div v-if="item.hasChildren" class="flex items-center justify-between">
          <span class="font-bold">{{ item.value.title }}</span>
          <div class="flex items-center gap-2 cursor-pointer"
            @click.stop="() => handleAddNewKey(false, item.value.fullKey)">
            <img src="@/assets/icons/circle-plus.svg" class="h-3.5 w-3.5 shrink-0" />
            <span class="text-sky-700 text-sm">Add a new key for <span class="font-bold">{{ item.value.title
            }}</span></span>
          </div>
        </div>
        <div v-else class="flex items-center w-full gap-2 py-2">
          <div class="flex flex-1 gap-4 items-center text-sky-700">
            <Tooltip content="Copy Full Key">
              <img src="@/assets/icons/copy.svg" class="h-4 w-4 shrink-0 mt-1"
                @click="() => handleCopyFullKey(item.value.fullKey)" />
            </Tooltip>
            <Tooltip content="Delete this key">
              <img src="@/assets/icons/trash.svg" class="h-4 w-4 shrink-0 mt-1"
                @click="() => handleDeleteTreeItem(item.value.fullKey)" />
            </Tooltip>
          </div>
          <div class="flex-2">
            <Input v-model="item.value.key"
              @enter="(value: string) => handleTreeItemKeyEnter(item.value.fullKey, value)" />
          </div>
          <div class="flex-2" v-for="(locale, index) in Object.entries(item.value.value)" :key="index">
            <Textarea v-model="locale[1]"
              @enter="(value: string) => handleTreeItemValueEnter(item.value.fullKey, locale[0], value)" />
          </div>
        </div>
      </div>
    </TreeItem>
  </TreeRoot>
</template>

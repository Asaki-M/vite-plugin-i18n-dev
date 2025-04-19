<script setup lang="ts">
import type { TreeItem } from './components/TreeJSON/index.d'
import { formatJsonToTreeItems } from './utils'
import enUS from '@/assets/en-US.json'
import zhCN from '@/assets/zh-CN.json'
console.log(enUS)

const activeTab = ref<string>('tab1');
const items = ref<TreeItem[]>(formatJsonToTreeItems(enUS))

watch(activeTab, (newVal) => {
  if (newVal === 'tab1') {
    items.value = formatJsonToTreeItems(enUS)
  } else {
    items.value = formatJsonToTreeItems(zhCN)
  }
})

</script>

<template>
  <div class="p-8 flex flex-col gap-4">

    <Tabs v-model="activeTab" :items="[
      {
        value: 'tab1',
        label: 'en-US',
      },
      {
        value: 'tab2',
        label: 'zh-CN',
      }
    ]" />

    <TreeJSON :tree-data="items" />
  </div>
</template>

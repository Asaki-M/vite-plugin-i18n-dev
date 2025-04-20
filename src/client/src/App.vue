<script setup lang="ts">
import type { TreeItem } from './components/TreeJSON/index.d'
import { formatJsonToTreeItems, VITE_PLUGIN_I18N_DEV_KEY_PREFIX } from './utils'
import { createHotContext } from 'vite-hot-client'

const tabs = ref<{ value: string, label: string, data: Record<string, object> }[]>([])
const activeTab = ref<string>('tab1');
const treeItems = ref<TreeItem[]>([])

onMounted(async () => {
  const hot = await createHotContext('/___', `${location.pathname.split('/__i18n__dev')[0] || ''}/`.replace(/\/\//g, '/'))
  if (hot) {
    hot.on(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:initTabs`, (data: any) => {
      try {
        const initTabs = JSON.parse(data)
        tabs.value = initTabs[0].i18nData.map((item: unknown, index: number) => {
          const { name, data } = item as { name: string, data: Record<string, object> }
          return {
            value: `tab${index + 1}`,
            label: name,
            data: data
          }
        })
        activeTab.value = tabs.value[0].value
        treeItems.value = formatJsonToTreeItems(tabs.value[0].data)
      } catch (error) { }
    })
  }
})


watch(activeTab, (newVal) => {
  const currentTab = tabs.value.find(item => item.value === newVal)
  if (currentTab) {
    treeItems.value = formatJsonToTreeItems(currentTab.data)
  }
})

</script>

<template>
  <div class="p-8 flex flex-col gap-4">

    <Tabs v-model="activeTab" :items="tabs" />

    <TreeJSON :tree-data="treeItems" />
  </div>
</template>

<script setup lang="ts">
import type { TreeItem } from './components/TreeJSON/index.d'
import { formatJsonToTreeItems, VITE_PLUGIN_I18N_DEV_KEY_PREFIX } from './utils'
import { createHotContext, ViteHotContext } from 'vite-hot-client'

const initData = ref<{ name: string, i18nData: { name: string, data: Record<string, object> }[] }[]>([])

const primaryTabs = ref<{ value: string, label: string }[]>([])
const activePrimaryTab = ref<string>('primaryTab1')

const tabs = ref<{ value: string, label: string, data: Record<string, object> }[]>([])
const activeTab = ref<string>('tab1');

const treeItems = ref<TreeItem[]>([])

const hotContext = ref<ViteHotContext | null>(null)

onMounted(async () => {
  const hot = await createHotContext('/___', `${location.pathname.split('/__i18n__dev')[0] || ''}/`.replace(/\/\//g, '/'))
  if (hot) {
    hotContext.value = hot
    hot.on(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:initTabs`, (data: any) => {
      try {
        const initTabs = JSON.parse(data)
        initData.value = initTabs
        primaryTabs.value = initTabs.map((item: unknown, index: number) => {
          const { name } = item as { name: string }
          return {
            value: `primaryTab${index + 1}`,
            label: name
          }
        })
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

watch(activePrimaryTab, (newVal) => {
  const currentTab = primaryTabs.value.find(item => item.value === newVal)
  if (currentTab) {
    const primaryTabIndex = primaryTabs.value.findIndex(item => item.value === newVal)
    const primaryTabInitData = initData.value[primaryTabIndex]
    
    if (primaryTabInitData) {
      tabs.value = primaryTabInitData.i18nData.map((item, index) => {
        return {
          value: `tab${index + 1}`,
          label: item.name,
          data: item.data
        }
      })
      activeTab.value = tabs.value.length > 0 ? tabs.value[0].value : 'tab1'
      
      treeItems.value = tabs.value.length > 0 
        ? formatJsonToTreeItems(tabs.value[0].data) 
        : []
    }
  }
})

watch(activeTab, (newVal) => {
  const currentTab = tabs.value.find(item => item.value === newVal)
  if (currentTab) {
    treeItems.value = formatJsonToTreeItems(currentTab.data)
  }
})

const handleKeyEnter = (fullKey: string, value: string) => {
  console.log(fullKey, value)
  hotContext.value?.send(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:changeI18nDataForKey`, {
    fullKey,
    value,
    activeTab,
    activePrimaryTab,
  })
}

const handleValueEnter = (fullKey: string, value: string) => {
  console.log(fullKey, value)
  hotContext.value?.send(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:changeI18nDataForValue`, {
    fullKey,
    value,
    activeTab,
    activePrimaryTab,
  })
}

</script>

<template>
  <div class="p-8 flex flex-col gap-4">
    <Tabs v-model="activePrimaryTab" :items="primaryTabs" />

    <Tabs v-model="activeTab" :items="tabs" />

    <TreeJSON :tree-data="treeItems" @keyEnter="handleKeyEnter" @valueEnter="handleValueEnter" />
  </div>
</template>

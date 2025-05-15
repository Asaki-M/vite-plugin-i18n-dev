<script setup lang="ts">
import type { TreeItem } from './data.d'
import { formatI18nData, formatJsonToTreeItems, VITE_PLUGIN_I18N_DEV_KEY_PREFIX } from './utils'
import { createHotContext, ViteHotContext } from 'vite-hot-client'

const primaryTabs = ref<{ value: string, label: string }[]>([])
const activePrimaryTab = ref<string>('primaryTab1')

const treeItems = ref<TreeItem[]>([])
const tabsTreeData = ref<{ name: string, treeData: TreeItem[] }[]>([])

const hotContext = ref<ViteHotContext | null>(null)
const initLoading = ref(true)

onMounted(async () => {
  const hot = await createHotContext('/___', `${location.pathname.split('/__i18n__dev')[0] || ''}/`.replace(/\/\//g, '/'))
  if (hot) {
    hotContext.value = hot
    hot.on(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:initTabs`, (data: string) => {
      try {
        const initTabs = JSON.parse(data)
        const treeDataResult: { name: string; treeData: TreeItem[] }[] = []
        primaryTabs.value = initTabs.map((item: unknown) => {
          const { name, locales } = item as { name: string, locales: Record<string, any> }
          const transformed = formatI18nData(locales)
          const treeData = formatJsonToTreeItems(transformed)

          treeDataResult.push({
            name,
            treeData,
          })

          return {
            value: name,
            label: name,
          }
        })
        activePrimaryTab.value = primaryTabs.value[0].value

        tabsTreeData.value = treeDataResult
        treeItems.value = treeDataResult[0].treeData
        initLoading.value = false
      } catch (error) { }
    })
  }
})

watch(activePrimaryTab, (newVal) => {
  const currentTab = primaryTabs.value.find(item => item.value === newVal)

  treeItems.value = tabsTreeData.value.find(item => item.name === currentTab?.label)?.treeData || []
})

const handleKeyEnter = (fullKey: string, value: string) => {
  hotContext.value?.send(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:changeI18nDataForKey`, {
    fullKey,
    value,
    activePrimaryTab: activePrimaryTab.value,
  })
}

const handleValueEnter = (fullKey: string, locale: string, value: string) => {
  hotContext.value?.send(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:changeI18nDataForValue`, {
    fullKey,
    locale,
    value,
    activePrimaryTab: activePrimaryTab.value,
  })
}

const handleDeleteTreeItem = (fullKey: string) => {
  hotContext.value?.send(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:deleteI18nDataForKey`, {
    fullKey,
    activePrimaryTab: activePrimaryTab.value,
  })
}

const handleAddNewKey = (fullKey: string, localeValues: Record<string, string>) => {
  hotContext.value?.send(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:addNewKey`, {
    fullKey,
    localeValues,
    activePrimaryTab: activePrimaryTab.value,
  })
}
</script>

<template>
  <div class="p-8 flex flex-col gap-4">
    <ScreenLoading size="2x" :loading="initLoading" />

    <Tabs v-model="activePrimaryTab" :items="primaryTabs" />

    <Table :tree-data="treeItems" @keyEnter="handleKeyEnter" @valueEnter="handleValueEnter"
      @delete="handleDeleteTreeItem" @addNewKey="handleAddNewKey" />
  </div>
</template>

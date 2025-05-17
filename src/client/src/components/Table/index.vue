<template>
  <s-table class="w-full h-full" bordered :data-source="dataSource" :columns="columns" :pagination="false"
    :scroll="{ y: 650 }">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'action'">
        <div class="flex flex-1 gap-4 items-center text-sky-700" v-if="!record.children">
          <Tooltip content="Copy Full Key">
            <img src="@/assets/icons/copy.svg" class="h-4 w-4 shrink-0 mt-1"
              @click="() => handleCopyFullKey(record.fullKey)" />
          </Tooltip>
          <Tooltip content="Delete this key">
            <img src="@/assets/icons/trash.svg" class="h-4 w-4 shrink-0 mt-1"
              @click="() => handleDeleteTreeItem(record.fullKey)" />
          </Tooltip>
        </div>
      </template>
    </template>
  </s-table>
</template>
<script setup lang="ts">
const props = defineProps<{
  treeData: any[];
}>();

const emit = defineEmits<{
  (e: 'keyEnter', fullKey: string, value: string): void
  (e: 'valueEnter', fullKey: string, locale: string, value: string): void
  (e: 'delete', fullKey: string): void
  (e: 'addNewKey', fullKey: string, localeValues: Record<string, string>): void
}>()

const columns = computed(() => {
  const result = [
    {
      title: 'Action',
      dataIndex: 'action',
      width: '15%',
    },
    {
      title: 'Locales Key',
      dataIndex: 'key',
      editable: true,
    },
  ]

  // Find locales by looking at the first item with language properties
  const findLocales = () => {
    for (const item of props.treeData) {
      // Check direct properties that are not standard TreeItem fields
      const locales = Object.keys(item).filter(key =>
        !['title', 'key', 'fullKey', 'children'].includes(key) &&
        typeof item[key] === 'string'
      );

      if (locales.length > 0) {
        return locales;
      }

      // Check children if no direct properties
      if (item.children) {
        for (const child of item.children) {
          const childLocales = Object.keys(child).filter(key =>
            !['title', 'key', 'fullKey', 'children'].includes(key) &&
            typeof child[key] === 'string'
          );

          if (childLocales.length > 0) {
            return childLocales;
          }
        }
      }
    }
    return [];
  }

  const locales = findLocales();

  // Add columns for each locale
  for (const locale of locales) {
    result.push({
      title: locale,
      dataIndex: locale,
      editable: true,
    });
  }
  return result;
})

const dataSource = ref<any[]>(props.treeData);

watch(() => props.treeData, (newVal) => {
  dataSource.value = newVal;
})

const handleDeleteTreeItem = (fullKey: string) => {
  emit('delete', fullKey)
}

const handleCopyFullKey = (fullKey: string) => {
  navigator.clipboard.writeText(fullKey)
}
</script>

<style lang="less">
@import url('./reset.less');
</style>
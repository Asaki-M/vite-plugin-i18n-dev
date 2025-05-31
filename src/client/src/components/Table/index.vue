<script setup lang="ts">
import type { TreeItem } from '../../data.d'
import type { ColumnType } from '@surely-vue/table/dist/src/components/interface';
import AddNewKeyDialog from '../AddNewKeyDialog/index.vue'

const KEY_CELL_PREFIX = 'KEY_CELL_'

const props = defineProps<{
  treeData: TreeItem[];
}>();

const emit = defineEmits<{
  (e: 'keyEnter', fullKey: string, value: string): void
  (e: 'valueEnter', fullKey: string, locale: string, value: string): void
  (e: 'delete', fullKey: string): void
  (e: 'addNewKey', fullKey: string, localeValues: Record<string, string>): void
}>()

const filterKeys = ['title', 'key', 'fullKey', 'localeKey', 'children']

const columns = computed(() => {
  const result: ColumnType[] = [
    {
      title: 'Action',
      dataIndex: 'action',
      width: 150,
    },
    {
      title: 'Locales Key',
      dataIndex: 'localeKey',
    },
  ]

  // Find locales by looking at the first item with language properties
  const findLocales = () => {
    for (const item of props.treeData) {
      // Check direct properties that are not standard TreeItem fields
      const locales = Object.keys(item).filter(key =>
        !filterKeys.includes(key) &&
        typeof item[key] === 'string'
      );

      if (locales.length > 0) {
        return locales;
      }

      // Check children if no direct properties
      if (item.children) {
        for (const child of item.children) {
          const childLocales = Object.keys(child).filter(key =>
            !filterKeys.includes(key) &&
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
      autoHeight: true
    });
  }
  return result;
})

const locales = computed(() => {
  const treeItem = props.treeData?.[0]
  if (!treeItem) {
    return []
  }
  const locales = Object.keys(treeItem).filter(key =>
    !filterKeys.includes(key) &&
    typeof treeItem[key] === 'string'
  );
  return locales
})


const addNewKeyModalRef = ref<InstanceType<typeof AddNewKeyDialog> | null>(null)
const dataSource = ref<TreeItem[]>(props.treeData);
const buttons = ref(new Map())
const tableRef = ref()

watch(() => props.treeData, (newVal) => {
  dataSource.value = newVal.sort((a, b) => a.children ? 1 : b.children ? -1 : 0);

  let isAdded = false
  buttons.value.clear()
  for (let item of dataSource.value) {
    if (item.children) {
      buttons.value.set(item.fullKey, item.key)
    }
    if (!isAdded && !item.children) {
      buttons.value.set('Root', 'root')
      isAdded = true
    }
  }
})

const localeKeyEditCellData: Record<string, boolean> = reactive({})

const handleLocaleKeyEditCellEdit = (fullKey: string) => {
  localeKeyEditCellData[KEY_CELL_PREFIX + fullKey] = true
}

const handleLocaleKeyEditCellSave = (record: TreeItem) => {
  delete localeKeyEditCellData[KEY_CELL_PREFIX + record.fullKey]
  emit('keyEnter', record.fullKey, record.localeKey as string)
}

const handleLocaleValueEditCellEdit = (fullKey: string, locale: string) => {
  localeKeyEditCellData[locale + '_' + fullKey] = true
}

const handleLocaleValueEditCellSave = (record: TreeItem, locale: string) => {
  delete localeKeyEditCellData[locale + '_' + record.fullKey]
  emit('valueEnter', record.fullKey, locale, record[locale] as string)
}

const handleDeleteTreeItem = (fullKey: string) => {
  emit('delete', fullKey)
}

const handleCopyFullKey = (fullKey: string) => {
  navigator.clipboard.writeText(fullKey)
}

const handleButtonClick = (fullKey: string) => {
  const params = { fullKey, isRoot: false }
  if (fullKey === 'Root') {
    params.isRoot = true
  }
  addNewKeyModalRef.value?.open(params)
}

const handleAddNewKey = (fullKey: string, localeValues: Record<string, string>) => {
  emit('addNewKey', fullKey, localeValues)
}

const highlightRowKey = ref('')
const handleSearchSelect = (key: string) => {
  tableRef.value.scrollTo({ rowKey: key }, 'smooth');
  highlightRowKey.value = key
}

const handleSearchClear = () => {
  highlightRowKey.value = ''
}
</script>

<template>
  <AddNewKeyDialog ref="addNewKeyModalRef" :locales="locales" @create="handleAddNewKey" />

  <div class="flex items-center gap-4 flex-wrap">
    <Button v-for="button in Array.from(buttons.entries())" variant="primary" :key="button[0]"
      @click="() => handleButtonClick(button[0])">
      Add for {{ button[1] }}
    </Button>
  </div>

  <div class="flex w-1/3">
    <SearchDropdown :origin-data="dataSource" @select="handleSearchSelect" @clear="handleSearchClear" />
  </div>

  <s-table v-if="dataSource.length > 0" class="w-full h-full" ref="tableRef" bordered :data-source="dataSource" :columns="columns"
    :pagination="false" expandRowByClick :scroll="{ y: 600 }" :sticky="{ offsetHeader: 64 }"
    :defaultExpandAllRows="true"
    :rowClassName="(record: TreeItem) => record.fullKey === highlightRowKey ? '!bg-sky-100' : ''">
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
      <!-- 多语言对应的key -->
      <template v-if="column.dataIndex === 'localeKey'">
        <div v-if="localeKeyEditCellData[KEY_CELL_PREFIX + record.fullKey]" class="flex items-center gap-2">
          <Input v-model="record.localeKey" class="flex-1" @pressEnter="() => handleLocaleKeyEditCellSave(record)" />
          <img class="w-5 h-5 shrink-0" src="@/assets/icons/check.svg"
            @click="() => handleLocaleKeyEditCellSave(record)">
        </div>
        <div v-else class="flex items-center gap-2">
          <span class="flex-1" :class="{ 'font-bold text-base': record.children }">{{ record.localeKey }}</span>
          <img v-if="!record.children" class="w-5 h-5 shrink-0" src="@/assets/icons/edit.svg"
            @click="() => handleLocaleKeyEditCellEdit(record.fullKey)">
        </div>
      </template>

      <!-- 多语言对应的值 -->
      <template v-if="!(['localeKey', 'action'].includes(column.dataIndex))">
        <div v-if="localeKeyEditCellData[column.dataIndex + '_' + record.fullKey]" class="flex items-center gap-2">
          <Textarea v-model="record[column.dataIndex]" class="flex-1"
            @pressEnter="() => handleLocaleValueEditCellSave(record, column.dataIndex)" />
          <img class="w-5 h-5 shrink-0" src="@/assets/icons/check.svg"
            @click="() => handleLocaleValueEditCellSave(record, column.dataIndex)">
        </div>
        <div v-else class="flex items-center gap-2">
          <span class="flex-1">{{ record[column.dataIndex] }}</span>
          <img v-if="!record.children" class="w-5 h-5 shrink-0" src="@/assets/icons/edit.svg"
            @click="() => handleLocaleValueEditCellEdit(record.fullKey, column.dataIndex)">
        </div>
      </template>
    </template>
  </s-table>
</template>

<style lang="less">
@import url('./reset.less');
</style>
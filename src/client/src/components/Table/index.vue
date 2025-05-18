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

const columns = computed(() => {
  const result: ColumnType[] = [
    {
      title: 'Action',
      dataIndex: 'action',
      width: 150,
    },
    {
      title: 'Locales Key',
      dataIndex: 'key',
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
    !['title', 'key', 'fullKey', 'children'].includes(key) &&
    typeof treeItem[key] === 'string'
  );
  return locales
})


const addNewKeyModalRef = ref<InstanceType<typeof AddNewKeyDialog> | null>(null)
const dataSource = ref<TreeItem[]>(props.treeData);
const buttons = ref<Record<string, string>[]>([])

watch(() => props.treeData, (newVal) => {
  dataSource.value = newVal;

  let isAdded = false
  for (let item of dataSource.value) {
    if (item.children) {
      buttons.value.push({
        fullKey: item.fullKey,
        key: item.key
      })
    }
    if (!isAdded && !item.children) {
      buttons.value.push({
        fullKey: 'Root',
        key: 'root'
      })
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
  emit('keyEnter', record.fullKey, record.key)
}

const handleLocaleValueEditCellEdit = (fullKey: string, locale: string) => {
  localeKeyEditCellData[locale + '_' + fullKey] = true
}

const handleLocaleValueEditCellSave = (record: TreeItem, locale: string) => {
  delete localeKeyEditCellData[locale + '_' + record.fullKey]
  emit('valueEnter', record.fullKey, locale, record[locale])
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
</script>

<template>
  <AddNewKeyDialog ref="addNewKeyModalRef" :locales="locales" @create="handleAddNewKey" />

  <div class="flex items-center gap-4 flex-wrap">
    <Button v-for="button in buttons" variant="primary" :key="button.fullKey"
      @click="() => handleButtonClick(button.fullKey)">
      Add for {{ button.key }}
    </Button>
  </div>

  <s-table class="w-full h-full" bordered :data-source="dataSource" :columns="columns" :pagination="false"
    expandRowByClick :scroll="{ y: 650 }" :sticky="{ offsetHeader: 64 }" :defaultExpandAllRows="true">
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
      <template v-if="column.dataIndex === 'key'">
        <div v-if="localeKeyEditCellData[KEY_CELL_PREFIX + record.fullKey]" class="flex items-center gap-2">
          <Input v-model="record.key" class="flex-1" @pressEnter="() => handleLocaleKeyEditCellSave(record)" />
          <img class="w-5 h-5 shrink-0" src="@/assets/icons/check.svg"
            @click="() => handleLocaleKeyEditCellSave(record)">
        </div>
        <div v-else class="flex items-center gap-2">
          <span class="flex-1" :class="{ 'font-bold text-base': record.children }">{{ record.key }}</span>
          <img v-if="!record.children" class="w-5 h-5 shrink-0" src="@/assets/icons/edit.svg"
            @click="() => handleLocaleKeyEditCellEdit(record.fullKey)">
        </div>
      </template>


      <template v-if="!(['key', 'action'].includes(column.dataIndex))">
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
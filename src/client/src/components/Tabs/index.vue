<script setup lang="ts">
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'radix-vue'

interface Props {
  items: Array<{
    value: string
    label: string
    content: string
  }>
}

withDefaults(defineProps<Props>(), {
  items: () => []
})

const activeTab = defineModel<string>('activeTab')

</script>

<template>
  <TabsRoot v-model="activeTab" class="w-full">
    <TabsList class="flex bg-slate-100 rounded-lg p-1 gap-1">
      <TabsIndicator class="absolute h-[85%] top-[7.5%] transition-all bg-white rounded-md shadow-sm" />
      <TabsTrigger 
        v-for="item in items" 
        :key="item.value"
        :value="item.value"
        class="flex-1 px-3 py-2 text-sm rounded-md relative cursor-pointer data-[state=active]:bg-white data-[state=inactive]:bg-slate-100"
      >
        {{ item.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent 
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      class="mt-4"
    >
      {{ item.content }}
    </TabsContent>
  </TabsRoot>
</template>


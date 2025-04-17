<script setup lang="ts">
const activeTab = ref<string>('tab1');
console.log(activeTab)
</script>

<template>
  <div class="p-8 flex flex-col gap-4">
    <Input />

    <Textarea />

    <Tabs v-model="activeTab" :items="[
      {
        value: 'tab1',
        label: '标签1',
        content: '标签1的内容'
      },
      {
        value: 'tab2',
        label: '标签2',
        content: '标签2的内容'
      },
      {
        value: 'tab3',
        label: '标签3',
        content: '标签3的内容'
      }
    ]" />
  </div>
</template>

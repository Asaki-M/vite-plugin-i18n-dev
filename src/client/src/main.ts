import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import STable from '@surely-vue/table'
import '@surely-vue/table/dist/index.less';

createApp(App).use(STable).mount('#app')

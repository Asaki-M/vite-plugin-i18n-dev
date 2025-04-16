import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import VitepluginEasy from '.'

export default defineNuxtModule({
  meta: {
    name: 'vite-plugin-easy',
    configKey: 'vite-plugin-easy',
  },
  setup() {
    addVitePlugin(() => VitepluginEasy())
  },
}) as any

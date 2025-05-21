import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, join } from 'path'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VitePluginI18nDev from '../'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      dts: join(__dirname, 'auto-imports.d.ts'),
      imports: [
        'vue',
      ],
    }),
    Components({
      dirs: ['./src/components'],
      dts: join(__dirname, 'components.d.ts'),
    }),
    VitePluginI18nDev({
      dirs: [
        {
          name: 'i18n',
          locales: {
            en: '/src/locales/en-US.json',
            zh: '/src/locales/zh-CN.json',
          }
        },
        {
          name: 'menu',
          locales: {
            en: '/src/locales/en-US.menu.json',
            zh: '/src/locales/zh-CN.menu.json',
          }
        }
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: true, // 'esbuild',
    emptyOutDir: true,
    outDir: resolve(__dirname, '../../dist/client'),
    rollupOptions: {
      output: {
        manualChunks: {
          vender_vue: ['vue'],
          vender_surely_table: ['@surely-vue/table'],
          vender_radix_vue: ['radix-vue'],
        }
      }
    }
  },
})

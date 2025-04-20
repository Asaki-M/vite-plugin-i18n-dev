import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, join } from 'path'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VitePluginI18nDev from '../'

export default defineConfig({
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
    VitePluginI18nDev(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    minify: true, // 'esbuild',
    emptyOutDir: true,
    outDir: resolve(__dirname, '../../dist/client'),
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
})

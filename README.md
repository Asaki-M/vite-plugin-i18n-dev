# vite-plugin-i18n-dev

## Install

```bash
pnpm add -D vite-plugin-i18n-dev
# or
npm install -D vite-plugin-i18n-dev
# or
yarn add -D vite-plugin-i18n-dev
```

## Usage

```ts
// vite.config.ts

// Your import statement
import VitePluginI18nDev from 'vite-plugin-i18n-dev';

export default defineConfig({
  plugins: [
    // like below, need to your project locales dirs
    VitePluginI18nDev({
      dirs: [
        {
          name: 'pages',
          locales: {
            'en-US': 'src/locales/en-US.json',
            'zh-CN': 'src/locales/zh-CN.json',
            'fr-FR': 'src/locales/fr-FR.json',
            'jp-JP': 'src/locales/jp-JP.json',
            'pt-PT': 'src/locales/pt-PT.json',
          },
        },
        {
          name: 'menus',
          // ...
        },
      ],
    }),
  ],
})

```
|  Props   | Required | Description  |
|  ----  | ----  | ----  |
| dirs  | true | locales file path, support multipule locales file, need to set a Array |
| flatKey  | false | call the plugin locale file use flat key. If your locale file use "global.key: value", you need to set true. |
---

Start your project and open `http://localhost:3000/__i18n__dev/`, now you can modify, add and delete your locales in broswer page.


### TODO:
feat: 
 - Add Virtual List to resolve large data (maybe use table component) ✅
 - Add translate api to synchronous input locale value(maybe support youdao and google)
 
 perf:
 - Sort tree data by child
 - Fixed add new key action position
 - Menu tab add search
 - Add new key cannot use dialog

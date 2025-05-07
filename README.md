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

Start your project and open `http://localhost:3000/__i18n__dev/`, now you can modify, add and delete your locales in broswer page.


### TODO:
 - Add Virtual TreeItem to resolve large data
 - Fix no match key change

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
      // If your locale json key is like {"common.test": "test"}, you should set flatKey is true
      flatKey: true,
      // If you set this config, the plugin will auto translate sync your change and create
      translate: {
        type: 'baidu',
        appid: 'your translation api appid'
        secretKey: 'your translation api secretKey'
      }
    }),
  ],
})

```
|  Props   | Required | Description  |
|  ----  | ----  | ----  |
| dirs  | true | locales file path, support multipule locales file, need to set a Array |
| flatKey  | false | call the plugin locale file use flat key. If your locale file use "global.key: value", you need to set true. |
|  translate  | false  | translate api config. It contain the translate type, appId and secretKey. Now this plugin support YouDao and Baidu traslation.  |
---

> ### Note
> If you set the translate config, please ensure that your `dirs locales keys` are consistent with the language codes supported by the translation platform API.
>
> [Youdao Translation Support language](https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html)
> 
> [Baidu Translation Support language](https://api.fanyi.baidu.com/doc/21)

Start your project and open `http://localhost:3000/__i18n__dev/`, now you can modify, add and delete your locales in broswer page.


### TODO:
feat: 
 - Add Virtual List to resolve large data (maybe use table component) ✅
 - Add translate api to synchronous input locale value(maybe support youdao and baidu) ✅
 
 perf:
 - Sort tree data by child ✅
 - Fixed add new key action position ✅
 - Menu tab add search ✅
 - Add new key cannot use dialog

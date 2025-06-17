import { ViteDevServer } from "vite";
import path from 'path'
import fs from 'fs/promises'
import { VitepluginI18nDevOptions } from "./index";
import { changeByPath, deleteByPath } from "./utils";
import { Translate } from "./translate";

export type Tab = {
  name: string;
  locales: {
    [key: string]: string
  }
}

const VITE_PLUGIN_I18N_DEV_KEY_PREFIX = 'vite-plugin-i18n-dev'

export class VitepluginI18nDevContext {
  private static instance: VitepluginI18nDevContext | null = null;
  private server!: ViteDevServer;
  private dirs: VitepluginI18nDevOptions['dirs'] = [];
  private root: string = '';
  private cacheJsonData = new Map<string, Record<string, string>>();
  private translateInstance: Translate | null = null
  public tabs: Tab[] = [];

  constructor(server: ViteDevServer, dirs: VitepluginI18nDevOptions['dirs']) {
    if (VitepluginI18nDevContext.instance) {
      return VitepluginI18nDevContext.instance;
    }

    this.server = server;
    this.dirs = dirs;
    VitepluginI18nDevContext.instance = this;

    this.translateInstance = Translate.getInstance()

    this.watchChangeI18nDataForKey()
    this.watchChangeI18nDataForValue()
    this.watchDeleteI18nDataForKey()
    this.watchAddNewKey()
  }

  async initI18nData(root: string) {
    const tabs: Tab[] = [];
    this.root = root;
    for (let index = 0; index < this.dirs.length; index++) {
      const dirItem = this.dirs[index];

      const tab: Tab = {
        name: dirItem.name ?? `Tab ${index + 1}`,
        locales: {}
      };

      for (const [key, value] of Object.entries(dirItem.locales)) {
        const i18nPath = path.join(root, value);
        const i18nData = await this.getI18nData(i18nPath);
        tab.locales[key] = i18nData;
      }

      tabs.push(tab);
    }

    this.tabs = tabs;
    this.sendDataToClient('initTabs', tabs)
  }

  private async getI18nData(path: string) {
    let result: any = {}
    try {
      if (this.cacheJsonData.has(path)) {
        result = this.cacheJsonData.get(path)
      } else {
        if (path.endsWith('.json')) {
          const content = await fs.readFile(path, 'utf-8')
          result = JSON.parse(content)
          this.cacheJsonData.set(path, result)
        }
      }
    } catch (error) {
      console.log('Can not read file, please check the path')
    }

    return result
  }

  private async writeI18nData(path: string, data: any) {
    try {
      await fs.writeFile(path, JSON.stringify(data, null, 2))
      this.cacheJsonData.set(path, data)
    } catch (error) {
      console.log('Can not write file, please check the path')
    }
  }

  private sendDataToClient(key: string, data: unknown) {
    this.server.ws.send(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:${key}`, JSON.stringify(data))
  }

  private async translateToOtherLocales(text: string, to: string) {
    if (this.translateInstance) {
      const res = await this.translateInstance.translate(text, to)
      return res
    }
    return false
  }

  private watchChangeI18nDataForKey() {
    this.server.ws.on(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:changeI18nDataForKey`, async (data: unknown) => {
      const { fullKey, value, activePrimaryTab } = data as { fullKey: string, value: string, activePrimaryTab: string }

      const localPathItem = this.dirs.find(dir => dir.name === activePrimaryTab)
      if (localPathItem) {
        const localesKeys = Object.keys(localPathItem.locales)
        for (const locale of localesKeys) {
          const localPath = path.join(this.root, localPathItem.locales[locale])
          const jsonData = await this.getI18nData(localPath)

          if (localPathItem.flatKey) {
            const oldValue = jsonData[fullKey]
            delete jsonData[fullKey]
            jsonData[value] = oldValue
          } else {
            const deleteValue = deleteByPath(jsonData, fullKey);
            const newFullKey = fullKey.split(".");
            newFullKey.pop();
            newFullKey.push(value);
            changeByPath(jsonData, newFullKey.join("."), deleteValue);
          }

          await this.writeI18nData(localPath, jsonData)
        }
      }
    })
  }

  private watchChangeI18nDataForValue() {
    this.server.ws.on(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:changeI18nDataForValue`, async (data: unknown) => {
      const { fullKey, value, locale, activePrimaryTab } = data as { fullKey: string, value: string, locale: string, activePrimaryTab: string }
      const localPathItem = this.dirs.find(dir => dir.name === activePrimaryTab)
      if (localPathItem) {
        const localPath = path.join(this.root, localPathItem.locales[locale])
        const otherLocales = Object.keys(localPathItem.locales).filter(key => key !== locale)

        const canTranslate = !!this.translateInstance

        // 修改当前语言的值
        const jsonData = await this.getI18nData(localPath)
        if (localPathItem.flatKey) {
          jsonData[fullKey] = value
        } else {
          changeByPath(jsonData, fullKey, value)
        }
        await this.writeI18nData(localPath, jsonData)

        if (!canTranslate) {
          return
        }

        // 同步翻译其他语言并写入
        for (const otherLocale of otherLocales) {
          const otherPath = path.join(this.root, localPathItem.locales[otherLocale])
          const otherJsonData = await this.getI18nData(otherPath)
          const translateValue = await this.translateToOtherLocales(value, otherLocale)
          if (translateValue) {
            if (localPathItem.flatKey) {
              otherJsonData[fullKey] = translateValue
            } else {
              changeByPath(otherJsonData, fullKey, translateValue)
            }
            await this.writeI18nData(otherPath, otherJsonData)
          }
        }
        this.initI18nData(this.root)
      }
    })
  }

  private watchDeleteI18nDataForKey() {
    this.server.ws.on(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:deleteI18nDataForKey`, async (data: unknown) => {
      const { fullKey, activePrimaryTab } = data as { fullKey: string, activePrimaryTab: string }

      const localPathItem = this.dirs.find(dir => dir.name === activePrimaryTab)
      if (localPathItem) {
        const localesKeys = Object.keys(localPathItem.locales)
        for (const locale of localesKeys) {
          const localPath = path.join(this.root, localPathItem.locales[locale])
          const jsonData = await this.getI18nData(localPath)

          if(localPathItem.flatKey) {
            delete jsonData[fullKey]
          } else {
            deleteByPath(jsonData, fullKey);
          }
          await this.writeI18nData(localPath, jsonData)
        }
        this.initI18nData(this.root)
      }
    })
  }

  private watchAddNewKey() {
    this.server.ws.on(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:addNewKey`, async (data: unknown) => {
      const { localeValues, fullKey, activePrimaryTab } = data as { localeValues: Record<string, string>, fullKey: string, activePrimaryTab: string }

      const newLocalesValues: Record<string, string> = Object.assign({}, localeValues)
      // 翻译配置后，添加新 key 时，自动翻译补全空 value
      if (this.translateInstance) {
        // 获取某个语言输入的值
        const [originInputKey, originInputValue] = Object.entries(localeValues).find(([key, value]) => !!value) ?? []
        if(originInputValue) {
          for(let key of Object.keys(localeValues)) {
            if(key === originInputKey) {
              newLocalesValues[key] = originInputValue
              continue
            }
            const translateValue = await this.translateToOtherLocales(originInputValue, key)
            if(translateValue) {
              newLocalesValues[key] = translateValue
            }
          }
        }
      }

      const localPathItem = this.dirs.find(dir => dir.name === activePrimaryTab)
      if (localPathItem) {
        const localesKeys = Object.keys(localPathItem.locales)
        for (const locale of localesKeys) {
          const localPath = path.join(this.root, localPathItem.locales[locale])
          const jsonData = await this.getI18nData(localPath)
          const value = newLocalesValues[locale]
          changeByPath(jsonData, fullKey, value)
          await this.writeI18nData(localPath, jsonData)
        }
        this.initI18nData(this.root)
      }
    })
  }
}



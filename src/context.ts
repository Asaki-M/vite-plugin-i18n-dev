import { ViteDevServer } from "vite";
import path from 'path'
import fs from 'fs/promises'
import { VitepluginI18nDevOptions } from "./index";
import { changeByPath, deleteByPath } from "./utils";

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
  public tabs: Tab[] = [];
  private flatKey: VitepluginI18nDevOptions['flatKey'] = false;
  constructor(server: ViteDevServer, dirs: VitepluginI18nDevOptions['dirs'], flatKey: VitepluginI18nDevOptions['flatKey']) {
    if (VitepluginI18nDevContext.instance) {
      return VitepluginI18nDevContext.instance;
    }

    this.server = server;
    this.dirs = dirs;
    this.flatKey = flatKey;
    VitepluginI18nDevContext.instance = this;

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
      if (path.endsWith('.json')) {
        const content = await fs.readFile(path, 'utf-8')
        result = JSON.parse(content)
      }
    } catch (error) {
      console.log('Can not read file, please check the path')
    }

    return result
  }

  private async writeI18nData(path: string, data: any) {
    try {
      await fs.writeFile(path, JSON.stringify(data, null, 2))
    } catch (error) {
      console.log('Can not write file, please check the path')
    }
  }

  private sendDataToClient(key: string, data: unknown) {
    this.server.ws.send(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:${key}`, JSON.stringify(data))
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

          if (this.flatKey) {
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
        // TODO: need to translate all locales to sync
        const localPath = path.join(this.root, localPathItem.locales[locale])

        const jsonData = await this.getI18nData(localPath)
        if (this.flatKey) {
          jsonData[fullKey] = value
        } else {
          changeByPath(jsonData, fullKey, value)
        }
        await this.writeI18nData(localPath, jsonData)
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
          deleteByPath(jsonData, fullKey);
          await this.writeI18nData(localPath, jsonData)
        }
      }
    })
  }

  private watchAddNewKey() {
    this.server.ws.on(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:addNewKey`, async (data: unknown) => {
      const { localeValues, fullKey, activePrimaryTab } = data as { localeValues: Record<string, string>, fullKey: string, activePrimaryTab: string }

      const localPathItem = this.dirs.find(dir => dir.name === activePrimaryTab)
      if (localPathItem) {
        const localesKeys = Object.keys(localPathItem.locales)
        for (const locale of localesKeys) {
          const localPath = path.join(this.root, localPathItem.locales[locale])
          const jsonData = await this.getI18nData(localPath)
          const value = localeValues[locale]
          changeByPath(jsonData, fullKey, value)
          await this.writeI18nData(localPath, jsonData)
        }
      }
    })
  }
}



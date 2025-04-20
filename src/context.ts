import { ViteDevServer } from "vite";
import path from 'path'
import fs from 'fs/promises'

type Tab = {
  name: string
  i18nData: {
    name: string
    data: Record<string, object>
  }[]
}

const VITE_PLUGIN_I18N_DEV_KEY_PREFIX = 'vite-plugin-i18n-dev'

export class VitepluginI18nDevContext {
  private static instance: VitepluginI18nDevContext | null = null;
  private server!: ViteDevServer;
  private dirs: Record<string, string>[] = [];
  public tabs: Tab[] = [];

  constructor(server: ViteDevServer, dirs: Record<string, string>[]) {
    if (VitepluginI18nDevContext.instance) {
      return VitepluginI18nDevContext.instance;
    }

    this.server = server;
    this.dirs = dirs;
    VitepluginI18nDevContext.instance = this;
  }

  async initI18nData(root: string) {
    const tabs: Tab[] = [];

    for (let index = 0; index < this.dirs.length; index++) {
      const item = this.dirs[index];
      const keys = Object.keys(item);

      const tab: Tab = {
        name: item.name ?? `Tab ${index + 1}`,
        i18nData: []
      };

      for (const key of keys) {
        if (key !== 'name') {
          const i18nPath = path.join(root, item[key]);
          const i18nData = await this.getI18nData(i18nPath);
          tab.i18nData.push({
            name: key,
            data: i18nData
          });
        }
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

  private sendDataToClient(key: string, data: unknown) {
    this.server.ws.send(`${VITE_PLUGIN_I18N_DEV_KEY_PREFIX}:${key}`, JSON.stringify(data))
  }
}




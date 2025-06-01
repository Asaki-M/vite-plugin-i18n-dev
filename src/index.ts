import type { Plugin, ResolvedConfig } from 'vite'
import sirv from 'sirv'
import { bold, green, cyan } from 'kolorist'
import { DIR_CLIENT } from './dir'
import { VitepluginI18nDevContext } from './context'
import { Translate } from './translate'

export interface VitepluginI18nDevOptions {
  /**
   * 国际化文件目录
   */
  dirs: {
    name: string;
    locales: {
      [key: string]: string
    }
  }[],
  /**
   * 是否开启扁平化 i18n key
   */
  flatKey?: boolean
  /**
   * 翻译配置
   */
  translate?: {
    type: 'baidu' | 'youdao'
    appid: string
    secretKey: string
  }
}

function VitepluginI18nDev(options: VitepluginI18nDevOptions): Plugin {
  let config: ResolvedConfig

  return {
    name: 'vite-plugin-i18n-dev',
    apply: 'serve',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    configureServer(server) {
      const base = (server.config.base) || '/'
      server.middlewares.use(`${base}__i18n__dev`, sirv(DIR_CLIENT, {
        single: true,
        dev: true,
      }))

      if (options.translate) {
        new Translate(options.translate)
      }

      const context = new VitepluginI18nDevContext(server, options.dirs, options.flatKey)
      server.ws.on('connection', () => {
        context.initI18nData(config.root)
      })

      const _printUrls = server.printUrls
      const colorUrl = (url: string) =>
        cyan(url.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`))

      server.printUrls = () => {
        const urls = server.resolvedUrls!
        _printUrls()

        for (const url of urls.local) {
          const devtoolsUrl = url.endsWith('/') ? `${url}__i18n__dev/` : `${url}/__i18n__dev/`
          console.log(`  ${green('➜')}  ${bold('I18n dev')}: ${green(`Open ${colorUrl(`${devtoolsUrl}`)} as a separate window`)}`)
        }
      }
    }
  }
}

export default VitepluginI18nDev
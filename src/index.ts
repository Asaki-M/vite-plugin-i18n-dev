import type { Plugin } from 'vite'
import sirv from 'sirv'
import { DIR_CLIENT } from './dir'
import { bold, green, cyan } from 'kolorist'

function VitepluginI18nDev(): Plugin {

  return {
    name: 'vite-plugin-i18n-dev',
    apply: 'serve',
    configureServer(server) {
      const base = (server.config.base) || '/'
      server.middlewares.use(`${base}__i18n__dev`, sirv(DIR_CLIENT, {
        single: true,
        dev: true,
      }))


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
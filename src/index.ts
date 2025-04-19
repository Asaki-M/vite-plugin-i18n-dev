import type { Plugin } from 'vite'
import sirv from 'sirv'
import { DIR_CLIENT } from './dir'

function VitepluginI18nDev(): Plugin {

  return {
    name: 'vite-plugin-i18n-dev',
    apply: 'serve',
    configureServer(server) {
      const base = (server.config.base) || '/'
      server.middlewares.use(`${base}__i18n__dev__`, sirv(DIR_CLIENT, {
        single: true,
        dev: true,
      }))
    }
  }
}

export default VitepluginI18nDev
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index'
  ],
  clean: false,
  declaration: true,
  externals: [
    'vite',
    '@nuxt/kit',
    '@nuxt/schema',
  ],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    dts: {
      respectExternal: true,
    },
  },
  failOnWarn: false
})

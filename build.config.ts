import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index', 'src/builder'],
  declaration: 'node16',
  clean: true,
  rollup: {
    emitCJS: false,
    inlineDependencies: false,
  },
  externals: ['@nuxt/image'],
})

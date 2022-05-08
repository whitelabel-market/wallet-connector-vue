import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'packages/vue/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})

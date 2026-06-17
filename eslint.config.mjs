import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
  },
}).append({
  // The playground is a runnable reference example; it relies on Nuxt's
  // generated globals/types and is not part of the package build or lint.
  ignores: ['dist', 'coverage', 'node_modules', 'playground'],
})

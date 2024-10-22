// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  ignores: ['seed/content/**'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    'antfu/no-import-dist': 'off',
    'antfu/no-top-level-await': 'off',
    'no-console': 'off',
    'node/prefer-global/buffer': 'off',
    'node/prefer-global/process': 'off',
    'ts/no-unsafe-function-type': 'off',
  },
})
